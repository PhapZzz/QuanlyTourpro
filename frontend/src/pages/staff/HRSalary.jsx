import React, { useEffect, useState } from 'react'
import {
  Table, Button, Space, Tag, Modal, Form,
  InputNumber, Select, message, Typography,
  Card, Row, Col, Statistic, Progress, Alert,
  Tabs, Divider, Tooltip, Input,
} from 'antd'
import {
  CalculatorOutlined, CheckOutlined, PrinterOutlined,
  GiftOutlined, TeamOutlined, EditOutlined, SaveOutlined, CloseOutlined,
} from '@ant-design/icons'
import { salaryAPI } from '../../services/api'

const STATUS_COLOR = { DRAFT: 'default', APPROVED: 'blue', PAID: 'green' }
const STATUS_LABEL = { DRAFT: 'Nháp', APPROVED: 'Đã duyệt', PAID: 'Đã trả' }
const fmt  = v => v ? new Intl.NumberFormat('vi-VN').format(v) : '0'
const fmtM = v => v ? new Intl.NumberFormat('vi-VN').format(Math.round((v ?? 0) / 1e6)) + 'M' : '—'

const MONTHS = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `Tháng ${i + 1}` }))
const YEARS  = [2024, 2025, 2026].map(y => ({ value: y, label: `Năm ${y}` }))

// KPI levels
const KPI_LEVELS = [
  { label: 'Xuất sắc (A)', value: 'A', percent: 20 },
  { label: 'Tốt (B)',       value: 'B', percent: 10 },
  { label: 'Đạt (C)',       value: 'C', percent: 5  },
  { label: 'Không đạt (D)', value: 'D', percent: 0  },
]

export default function HRSalary() {
  const [data, setData]       = useState([])
  const [loading, setLoad]    = useState(false)
  const [month, setMonth]     = useState(new Date().getMonth() + 1)
  const [year, setYear]       = useState(new Date().getFullYear())

  // Bulk calculate modal
  const [calcOpen, setCalc]         = useState(false)
  const [calcLoading, setCalcLoad]  = useState(false)
  const [calcResult, setCalcResult] = useState(null)
  const [form] = Form.useForm()

  // ── Bonus Modal state ─────────────────────────────────
  const [bonusOpen, setBonusOpen]   = useState(false)
  const [bonusTab, setBonusTab]     = useState('manual')   // 'manual' | 'kpi' | 'dept'
  const [bonusSaving, setBonusSave] = useState(false)
  const [bonusForm] = Form.useForm()

  // Inline edit bonus (manual)
  const [editingId, setEditingId]   = useState(null)
  const [editValue, setEditValue]   = useState(0)

  // KPI tab state
  const [kpiMap, setKpiMap]         = useState({})   // { [employeeId]: 'A'|'B'|'C'|'D' }

  // Dept tab state
  const [deptBonuses, setDeptBonuses] = useState({}) // { [deptName]: number }

  const load = async () => {
    setLoad(true)
    try {
      const r = await salaryAPI.getByMonthYear(month, year)
      setData(r.data.data ?? [])
    } catch {
      message.error('Không tải được bảng lương')
    } finally {
      setLoad(false)
    }
  }

  useEffect(() => { load() }, [month, year])

  const approve = async (id) => {
    try { await salaryAPI.approve(id); message.success('Đã duyệt'); load() }
    catch { message.error('Lỗi duyệt lương') }
  }

  // ── Bulk calculate ────────────────────────────────────
  const openCalc = () => {
    setCalcResult(null)
    form.resetFields()
    setCalc(true)
  }

  const calcAll = async () => {
    setCalcLoad(true)
    setCalcResult(null)
    try {
      const r = await salaryAPI.calculateAll({ month, year, bonus: 0, extraDeduction: 0 })
      const results = r.data.data ?? []
      const skipped = results.filter(s => s.status !== 'DRAFT').length
      const calculated = results.length - skipped
      setCalcResult({ total: results.length, calculated, skipped })
      message.success(`Đã tính lương cho ${calculated} nhân viên`)
      load()
    } catch (e) {
      message.error(e.response?.data?.message ?? 'Tính lương thất bại')
    } finally {
      setCalcLoad(false)
    }
  }

  // ── Manual bonus (inline edit) ────────────────────────
  const startEdit = (row) => {
    setEditingId(row.id)
    setEditValue(row.bonus ?? 0)
  }

  const cancelEdit = () => { setEditingId(null); setEditValue(0) }

  const saveEdit = async (row) => {
    try {
      await salaryAPI.updateBonus(row.id, { bonus: editValue })
      message.success(`Đã cập nhật thưởng: ${fmt(editValue)} ₫`)
      setEditingId(null)
      load()
    } catch {
      message.error('Lưu thưởng thất bại')
    }
  }

  // ── Open Bonus Modal ──────────────────────────────────
  const openBonus = () => {
    // Pre-populate dept bonuses from distinct depts
    const depts = [...new Set(data.map(d => d.departmentName).filter(Boolean))]
    const init = {}
    depts.forEach(d => { init[d] = 0 })
    setDeptBonuses(init)
    setKpiMap({})
    setBonusTab('manual')
    setBonusOpen(true)
  }

  // ── Apply KPI bonus ───────────────────────────────────
  const applyKpiBonus = async () => {
    setBonusSave(true)
    try {
      const updates = data
        .filter(row => kpiMap[row.id])
        .map(row => {
          const level = KPI_LEVELS.find(l => l.value === kpiMap[row.id])
          const bonus = Math.round((row.baseSalary ?? 0) * (level?.percent ?? 0) / 100)
          return { id: row.id, bonus }
        })
      if (updates.length === 0) { message.warning('Chưa chọn KPI cho nhân viên nào'); setBonusSave(false); return }
      await Promise.all(updates.map(u => salaryAPI.updateBonus(u.id, { bonus: u.bonus })))
      message.success(`Đã áp dụng thưởng KPI cho ${updates.length} nhân viên`)
      setBonusOpen(false)
      load()
    } catch {
      message.error('Áp dụng KPI thất bại')
    } finally {
      setBonusSave(false)
    }
  }

  // ── Apply Dept bonus ──────────────────────────────────
  const applyDeptBonus = async () => {
    setBonusSave(true)
    try {
      const updates = data
        .filter(row => row.departmentName && deptBonuses[row.departmentName] > 0)
        .map(row => ({ id: row.id, bonus: deptBonuses[row.departmentName] }))
      if (updates.length === 0) { message.warning('Chưa nhập thưởng cho phòng ban nào'); setBonusSave(false); return }
      await Promise.all(updates.map(u => salaryAPI.updateBonus(u.id, { bonus: u.bonus })))
      message.success(`Đã áp dụng thưởng cho ${updates.length} nhân viên`)
      setBonusOpen(false)
      load()
    } catch {
      message.error('Áp dụng thưởng phòng ban thất bại')
    } finally {
      setBonusSave(false)
    }
  }

  // ── Derived stats ─────────────────────────────────────
  const totalNet   = data.reduce((s, r) => s + (r.netPay ?? 0), 0)
  const totalBonus = data.reduce((s, r) => s + (r.bonus  ?? 0), 0)
  const approved   = data.filter(d => d.status === 'APPROVED' || d.status === 'PAID').length

  // Distinct depts for dept tab
  const depts = [...new Set(data.map(d => d.departmentName).filter(Boolean))]

  // ── Print phiếu lương ─────────────────────────────────
  const printSlip = (row) => {
    const w = window.open('', '_blank')
    w.document.write(`
      <html><head><title>Phiếu lương – ${row.employeeName}</title>
      <style>
        body{font-family:Arial,sans-serif;padding:32px;max-width:560px;margin:auto}
        h3{color:#04342C;margin-bottom:4px} .sub{color:#888;font-size:12px;margin-bottom:20px}
        table{width:100%;border-collapse:collapse}
        td{padding:8px 10px;border-bottom:1px solid #eee;font-size:13px}
        .r{text-align:right} .neg{color:#d92d20} .pos{color:#085041}
        .total td{font-weight:700;font-size:14px;background:#f5f5f5}
        .sep td{background:#f9f9f9;color:#aaa;font-size:11px}
        @media print{body{padding:16px}}
      </style></head><body>
      <h3>TourPro – Phiếu lương tháng ${row.month}/${row.year}</h3>
      <div class="sub">${row.employeeName} · ${row.employeeCode} · ${row.departmentName ?? ''}</div>
      <table>
        <tr><td>Lương cơ bản</td>     <td class="r pos">${fmt(row.baseSalary)} ₫</td></tr>
        <tr><td>Phụ cấp</td>          <td class="r pos">${fmt(row.allowance)} ₫</td></tr>
        <tr><td>Thưởng / KPI</td>     <td class="r pos">${fmt(row.bonus)} ₫</td></tr>
        <tr class="sep"><td colspan="2">── Khấu trừ ──</td></tr>
        <tr><td>BHXH (8%)</td>        <td class="r neg">(${fmt(row.socialInsurance)}) ₫</td></tr>
        <tr><td>BHYT (1.5%)</td>      <td class="r neg">(${fmt(row.healthInsurance)}) ₫</td></tr>
        <tr><td>BHTN (1%)</td>        <td class="r neg">(${fmt(row.unemploymentInsurance)}) ₫</td></tr>
        <tr><td>Thuế TNCN</td>        <td class="r neg">(${fmt(row.incomeTax)}) ₫</td></tr>
        <tr class="sep"><td colspan="2">──────────────</td></tr>
        <tr class="total"><td>THỰC LĨNH</td><td class="r" style="color:#04342C">${fmt(row.netPay)} ₫</td></tr>
      </table>
      <p style="margin-top:20px;font-size:11px;color:#aaa">
        Trạng thái: ${STATUS_LABEL[row.status] ?? row.status} · In ngày ${new Date().toLocaleDateString('vi-VN')}
      </p>
      <script>window.print()<\/script></body></html>`)
    w.document.close()
  }

  // ── Columns ───────────────────────────────────────────
  const cols = [
    {
      title: 'Mã NV', dataIndex: 'employeeCode', width: 80,
      render: v => <span style={{ color: '#888', fontSize: 12 }}>{v}</span>,
    },
    { title: 'Họ tên', dataIndex: 'employeeName', render: v => <strong>{v}</strong> },
    { title: 'Phòng ban', dataIndex: 'departmentName' },
    { title: 'Lương CB', dataIndex: 'baseSalary', render: v => fmt(v) },
    { title: 'Phụ cấp',  dataIndex: 'allowance',  render: v => fmt(v) },
    {
      title: 'Thưởng KPI',
      dataIndex: 'bonus',
      render: (v, row) => {
        if (editingId === row.id) {
          return (
            <Space size={4}>
              <InputNumber
                size="small"
                value={editValue}
                onChange={setEditValue}
                formatter={val => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={val => val.replace(/,/g, '')}
                style={{ width: 120 }}
                min={0}
              />
              <Tooltip title="Lưu">
                <Button size="small" type="primary" icon={<SaveOutlined />}
                  style={{ background: '#1D9E75' }}
                  onClick={() => saveEdit(row)} />
              </Tooltip>
              <Tooltip title="Hủy">
                <Button size="small" icon={<CloseOutlined />} onClick={cancelEdit} />
              </Tooltip>
            </Space>
          )
        }
        return (
          <Space size={4}>
            <span style={{ color: '#1D9E75' }}>{fmt(v)}</span>
            {row.status === 'DRAFT' && (
              <Tooltip title="Sửa thưởng">
                <Button type="text" size="small" icon={<EditOutlined />}
                  style={{ color: '#aaa' }} onClick={() => startEdit(row)} />
              </Tooltip>
            )}
          </Space>
        )
      },
    },
    {
      title: 'Khấu trừ', dataIndex: 'deduction',
      render: v => <span style={{ color: '#E24B4A' }}>-{fmt(v)}</span>,
    },
    {
      title: 'Thực lĩnh', dataIndex: 'netPay',
      render: v => <strong style={{ fontSize: 14 }}>{fmt(v)} ₫</strong>,
    },
    {
      title: 'Trạng thái', dataIndex: 'status',
      render: v => <Tag color={STATUS_COLOR[v]}>{STATUS_LABEL[v]}</Tag>,
      filters: Object.entries(STATUS_LABEL).map(([k, v]) => ({ text: v, value: k })),
      onFilter: (val, r) => r.status === val,
    },
    {
      title: '', key: 'act', width: 130,
      render: (_, row) => (
        <Space size={4}>
          {row.status === 'DRAFT' && (
            <Button size="small" type="primary" ghost icon={<CheckOutlined />}
              onClick={() => approve(row.id)}>Duyệt</Button>
          )}
          <Button size="small" icon={<PrinterOutlined />}
            onClick={() => printSlip(row)}>In</Button>
        </Space>
      ),
    },
  ]

  // ── KPI tab content ───────────────────────────────────
  const kpiContent = (
    <>
      <Alert
        type="info" showIcon style={{ marginBottom: 12, fontSize: 13 }}
        message="Thưởng KPI được tính theo % lương cơ bản: Xuất sắc 20% · Tốt 10% · Đạt 5% · Không đạt 0%"
      />
      <Table
        size="small"
        pagination={false}
        scroll={{ y: 320 }}
        dataSource={data}
        rowKey="id"
        columns={[
          { title: 'Họ tên', dataIndex: 'employeeName', render: v => <strong>{v}</strong> },
          { title: 'Phòng ban', dataIndex: 'departmentName' },
          {
            title: 'Lương CB', dataIndex: 'baseSalary',
            render: v => <span style={{ color: '#888' }}>{fmt(v)} ₫</span>,
          },
          {
            title: 'Xếp loại KPI',
            key: 'kpi',
            render: (_, row) => (
              <Select
                size="small"
                placeholder="Chọn mức"
                style={{ width: 150 }}
                value={kpiMap[row.id]}
                onChange={val => setKpiMap(prev => ({ ...prev, [row.id]: val }))}
                options={KPI_LEVELS.map(l => ({ value: l.value, label: l.label }))}
              />
            ),
          },
          {
            title: 'Thưởng dự kiến',
            key: 'expected',
            render: (_, row) => {
              const level = KPI_LEVELS.find(l => l.value === kpiMap[row.id])
              if (!level || !kpiMap[row.id]) return <span style={{ color: '#ccc' }}>—</span>
              const bonus = Math.round((row.baseSalary ?? 0) * level.percent / 100)
              return <span style={{ color: '#1D9E75', fontWeight: 600 }}>{fmt(bonus)} ₫</span>
            },
          },
        ]}
      />
    </>
  )

  // ── Dept tab content ──────────────────────────────────
  const deptContent = (
    <>
      <Alert
        type="info" showIcon style={{ marginBottom: 12, fontSize: 13 }}
        message="Nhập số tiền thưởng áp dụng đồng đều cho tất cả nhân viên trong phòng ban."
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {depts.length === 0 && <p style={{ color: '#aaa' }}>Không có dữ liệu phòng ban.</p>}
        {depts.map(dept => {
          const count = data.filter(d => d.departmentName === dept).length
          return (
            <Card key={dept} size="small" style={{ borderRadius: 8 }}>
              <Row align="middle" gutter={12}>
                <Col flex="1">
                  <div style={{ fontWeight: 600 }}>{dept}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>{count} nhân viên</div>
                </Col>
                <Col>
                  <InputNumber
                    style={{ width: 180 }}
                    placeholder="Số tiền thưởng (₫)"
                    value={deptBonuses[dept] || undefined}
                    onChange={val => setDeptBonuses(prev => ({ ...prev, [dept]: val ?? 0 }))}
                    formatter={val => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={val => val.replace(/,/g, '')}
                    min={0}
                    addonAfter="₫"
                  />
                </Col>
                <Col style={{ minWidth: 120, textAlign: 'right' }}>
                  {deptBonuses[dept] > 0 && (
                    <span style={{ color: '#1D9E75', fontSize: 13 }}>
                      Tổng: {fmt(deptBonuses[dept] * count)} ₫
                    </span>
                  )}
                </Col>
              </Row>
            </Card>
          )
        })}
      </div>
      {depts.length > 0 && (
        <div style={{
          marginTop: 16, padding: '10px 14px', background: '#f6fffa',
          borderRadius: 8, border: '1px solid #b7ebd6',
        }}>
          <strong style={{ color: '#1D9E75' }}>
            Tổng thưởng tất cả phòng ban:{' '}
            {fmt(depts.reduce((s, d) => s + (deptBonuses[d] ?? 0) * data.filter(r => r.departmentName === d).length, 0))} ₫
          </strong>
        </div>
      )}
    </>
  )

  // ── Manual tab content ────────────────────────────────
  const manualContent = (
    <>
      <Alert
        type="info" showIcon style={{ marginBottom: 12, fontSize: 13 }}
        message='Nhấn biểu tượng ✏️ tại cột "Thưởng KPI" trên bảng lương để sửa thưởng từng người.'
      />
      <div style={{ color: '#555', fontSize: 13, lineHeight: 1.9 }}>
        <p>Bạn có thể chỉnh thưởng từng nhân viên trực tiếp trên bảng lương bên dưới:</p>
        <ul style={{ paddingLeft: 20 }}>
          <li>Chỉ áp dụng với bản ghi có trạng thái <Tag>Nháp</Tag></li>
          <li>Nhấn ✏️ để mở ô nhập, nhập số tiền, nhấn 💾 để lưu</li>
          <li>Thay đổi có hiệu lực ngay lập tức</li>
        </ul>
      </div>
      <Button
        style={{ marginTop: 8 }}
        onClick={() => setBonusOpen(false)}>
        Đóng & chỉnh trực tiếp trên bảng
      </Button>
    </>
  )

  return (
    <>
      <Typography.Title level={4}>Bảng lương</Typography.Title>

      {/* Stats */}
      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="Tổng thực lĩnh" value={fmtM(totalNet) + ' ₫'}
              valueStyle={{ color: '#1D9E75', fontSize: 18 }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="Tổng thưởng KPI" value={fmtM(totalBonus) + ' ₫'}
              valueStyle={{ fontSize: 18 }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card><Statistic title="Số nhân viên" value={data.length} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="Đã duyệt" value={`${approved}/${data.length}`}
              valueStyle={{ color: approved === data.length && data.length > 0 ? '#1D9E75' : '#fa8c16' }} />
          </Card>
        </Col>
      </Row>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <Select value={month} onChange={setMonth} style={{ width: 130 }} options={MONTHS} />
        <Select value={year}  onChange={setYear}  style={{ width: 110 }} options={YEARS} />
        <Button type="primary" style={{ background: '#1D9E75' }} onClick={load}>
          Tải bảng lương
        </Button>
        <Button icon={<CalculatorOutlined />} onClick={openCalc}>
          Tính lương tự động
        </Button>
        <Button icon={<GiftOutlined />} onClick={openBonus}
          style={{ borderColor: '#1D9E75', color: '#1D9E75' }}>
          Tính thưởng
        </Button>
        <Button onClick={() => message.info('Xuất Excel đang phát triển')}>
          ⬇ Xuất Excel
        </Button>
      </div>

      {/* Table */}
      <Table columns={cols} dataSource={data} rowKey="id" loading={loading} size="small"
        pagination={{ pageSize: 10, showTotal: t => `Tổng ${t} bản ghi` }}
        summary={pageData => {
          const total = pageData.reduce((s, r) => s + (r.netPay ?? 0), 0)
          return (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={7}><strong>Tổng trang này</strong></Table.Summary.Cell>
              <Table.Summary.Cell index={7}>
                <strong style={{ color: '#1D9E75' }}>{fmt(total)} ₫</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={8} colSpan={2} />
            </Table.Summary.Row>
          )
        }}
      />

      {/* Bulk Calculate Modal */}
      <Modal
        title="Tính lương tự động"
        open={calcOpen}
        onCancel={() => { if (!calcLoading) setCalc(false) }}
        footer={[
          <Button key="cancel" onClick={() => setCalc(false)} disabled={calcLoading}>
            {calcResult ? 'Đóng' : 'Hủy'}
          </Button>,
          !calcResult && (
            <Button key="ok" type="primary" loading={calcLoading}
              icon={<CalculatorOutlined />} onClick={calcAll}
              style={{ background: '#1D9E75' }}>
              Tính lương ngay
            </Button>
          ),
        ]}
      >
        {!calcResult ? (
          <>
            <p style={{ marginBottom: 12 }}>
              Tự động tính lương cho <strong>toàn bộ nhân viên ACTIVE</strong> trong tháng{' '}
              <strong>{month}/{year}</strong>.
            </p>
            <div style={{
              background: '#f7f8fa', borderRadius: 8, padding: '12px 16px',
              fontSize: 13, color: '#444', marginBottom: 12, lineHeight: 1.9,
            }}>
              <strong>Công thức:</strong><br />
              Thực lĩnh = Lương CB + Phụ cấp + Thưởng<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              – BHXH (8%) – BHYT (1.5%) – BHTN (1%) – Thuế TNCN
            </div>
            <Alert
              type="warning" showIcon
              message="Bản ghi đã APPROVED hoặc PAID sẽ không bị ghi đè."
              style={{ fontSize: 13 }}
            />
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <Progress
              type="circle"
              percent={100}
              format={() => `${calcResult.calculated}`}
              strokeColor="#1D9E75"
            />
            <p style={{ marginTop: 16, fontSize: 14 }}>
              Đã tính lương cho <strong style={{ color: '#1D9E75' }}>{calcResult.calculated}</strong> nhân viên
            </p>
            {calcResult.skipped > 0 && (
              <p style={{ color: '#fa8c16', fontSize: 13 }}>
                ⚠ Bỏ qua {calcResult.skipped} bản ghi đã APPROVED/PAID
              </p>
            )}
          </div>
        )}
      </Modal>

      {/* ── Bonus Modal ─────────────────────────────────── */}
      <Modal
        title={
          <Space>
            <GiftOutlined style={{ color: '#1D9E75' }} />
            <span>Tính thưởng nhân viên – Tháng {month}/{year}</span>
          </Space>
        }
        open={bonusOpen}
        onCancel={() => { if (!bonusSaving) setBonusOpen(false) }}
        width={720}
        footer={
          bonusTab === 'kpi' ? [
            <Button key="cancel" onClick={() => setBonusOpen(false)} disabled={bonusSaving}>Hủy</Button>,
            <Button key="ok" type="primary" loading={bonusSaving}
              icon={<GiftOutlined />} onClick={applyKpiBonus}
              style={{ background: '#1D9E75' }}>
              Áp dụng thưởng KPI
            </Button>,
          ] : bonusTab === 'dept' ? [
            <Button key="cancel" onClick={() => setBonusOpen(false)} disabled={bonusSaving}>Hủy</Button>,
            <Button key="ok" type="primary" loading={bonusSaving}
              icon={<TeamOutlined />} onClick={applyDeptBonus}
              style={{ background: '#1D9E75' }}>
              Áp dụng thưởng phòng ban
            </Button>,
          ] : null
        }
      >
        <Tabs
          activeKey={bonusTab}
          onChange={setBonusTab}
          items={[
            {
              key: 'manual',
              label: <span><EditOutlined /> Thủ công từng người</span>,
              children: manualContent,
            },
            {
              key: 'kpi',
              label: <span><CalculatorOutlined /> Theo KPI / % lương</span>,
              children: kpiContent,
            },
            {
              key: 'dept',
              label: <span><TeamOutlined /> Theo phòng ban</span>,
              children: deptContent,
            },
          ]}
        />
      </Modal>
    </>
  )
}