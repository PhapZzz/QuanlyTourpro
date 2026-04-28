import React, { useEffect, useState } from 'react'
import {
  Table, Button, Space, Tag, Modal, Form, Input, Select, InputNumber,
  DatePicker, message, Typography, Popconfirm, Tabs, Descriptions, Timeline, Spin
} from 'antd'
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SwapOutlined, EyeOutlined,
  HistoryOutlined, UserOutlined, CalendarOutlined, DollarOutlined
} from '@ant-design/icons'
import { employeeAPI } from '../../services/api'
import dayjs from 'dayjs'

const STATUS_COLOR = { ACTIVE: 'success', ON_LEAVE: 'warning', RESIGNED: 'default', TERMINATED: 'error' }
const STATUS_LABEL = { ACTIVE: 'Đang làm', ON_LEAVE: 'Nghỉ phép', RESIGNED: 'Đã nghỉ', TERMINATED: 'Sa thải' }
const DEPT_OPTIONS = [
  { value: 2, label: 'Kinh doanh' }, { value: 3, label: 'Hướng dẫn viên' },
  { value: 4, label: 'Kế toán' }, { value: 5, label: 'Kho vận' },
  { value: 6, label: 'Hành chính' }, { value: 1, label: 'Ban GĐ' }
]
const POS_OPTIONS = [
  { value: 1, label: 'Giám đốc' }, { value: 2, label: 'Trưởng phòng' },
  { value: 3, label: 'phó phòng' },
  { value: 4, label: 'Chuyên viên' }, { value: 5, label: 'Nhân viên' },
  { value: 6, label: 'HDV du lịch' }, { value: 7, label: 'Kế toán trưởng' },
  { value: 8, label: 'NV kế toán' }, { value: 9, label: 'Chuyên viên kế toán' }
]
const fmt = v => v ? new Intl.NumberFormat('vi-VN').format(v) + ' ₫' : '—'
const fmtDate = v => v ? dayjs(v).format('DD/MM/YYYY') : '—'
const fmtDateTime = v => v ? dayjs(v).format('DD/MM/YYYY HH:mm') : '—'

// ─── Position History Timeline ────────────────────────────────────────────────
function PositionHistoryTab({ employeeId }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!employeeId) return
    setLoading(true)
  console.log('employeeId:', employeeId)
    employeeAPI.getPositionHistory(employeeId)
      .then(r => {
        // Sort descending by effectiveDate so newest is first
        console.log('response:', r.data)
        const sorted = (r.data.data ?? r.data ?? []).sort(
          (a, b) => new Date(b.effectiveDate) - new Date(a.effectiveDate)
        )
        setHistory(sorted)
      })
      .catch(() => message.error('Không tải được lịch sử chức vụ'))
      .finally(() => setLoading(false))
  }, [employeeId])

  if (loading) return <div style={{ textAlign: 'center', padding: 32 }}><Spin /></div>
  if (!history.length) return (
    <div style={{ textAlign: 'center', color: '#aaa', padding: 32 }}>
      Chưa có lịch sử thay đổi chức vụ
    </div>
  )

  return (
    <div style={{ padding: '8px 4px' }}>
      <Timeline
        mode="left"
        items={history.map((h, idx) => ({
          color: idx === 0 ? '#1D9E75' : '#d9d9d9',
          label: (
            <div style={{ textAlign: 'right', minWidth: 110 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: idx === 0 ? '#1D9E75' : '#555' }}>
                {fmtDate(h.effectiveDate)}
              </div>
              {h.createdAt && (
                <div style={{ fontSize: 11, color: '#aaa' }}>
                  Ghi nhận: {fmtDateTime(h.createdAt)}
                </div>
              )}
            </div>
          ),
          children: (
            <div style={{
              background: idx === 0 ? '#f0fdf8' : '#fafafa',
              border: `1px solid ${idx === 0 ? '#b7ebd8' : '#f0f0f0'}`,
              borderRadius: 8,
              padding: '10px 14px',
              marginBottom: 4
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Tag color={idx === 0 ? 'green' : 'default'} style={{ margin: 0 }}>
                  {h.positionTitle ?? `Chức vụ #${h.positionId}`}
                </Tag>
                {idx === 0 && <Tag color="cyan" style={{ margin: 0 }}>Hiện tại</Tag>}
              </div>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, color: '#1D9E75', fontWeight: 600 }}>
                  <DollarOutlined style={{ marginRight: 4 }} />
                  {fmt(h.salary)}
                </span>
                {h.note && (
                  <span style={{ fontSize: 13, color: '#666', fontStyle: 'italic' }}>
                    📝 {h.note}
                  </span>
                )}
              </div>
            </div>
          )
        }))}
      />
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HREmployees() {
  const [data, setData] = useState([])
  const [loading, setLoad] = useState(false)
  const [open, setOpen] = useState(false)
  const [posOpen, setPosOpen] = useState(false)
  const [detail, setDetail] = useState(null)
  const [editing, setEdit] = useState(null)
  const [search, setSrc] = useState('')
  const [form] = Form.useForm()
  const [posForm] = Form.useForm()

  const load = async () => {
    setLoad(true)
    try {
      const r = await employeeAPI.getAll({ search })
      setData(r.data.data?.content ?? [])
    } catch { message.error('Không tải được') }
    finally { setLoad(false) }
  }
  useEffect(() => { load() }, [search])

  const openCreate = () => { setEdit(null); form.resetFields(); setOpen(true) }
  const openEdit = (row) => {
    setEdit(row)
    form.setFieldsValue({
      ...row,
      dob: row.dob ? dayjs(row.dob) : null,
      hireDate: row.hireDate ? dayjs(row.hireDate) : null,
//       departmentId: DEPT_OPTIONS.find(d => d.label === row.departmentName)?.value,
//       positionId: POS_OPTIONS.find(p => p.label === row.positionTitle)?.value,
  departmentId: row.departmentId,
  positionId: row.positionId,
    })
    setOpen(true)
  }

  const onFinish = async (values) => {
      console.log(values)
    const payload = {
      ...values,
          dob: values.dob ? values.dob.format('YYYY-MM-DD') : null,
          hireDate: values.hireDate ? values.hireDate.format('YYYY-MM-DD') : null,

    }
console.log('PAYLOAD SEND API:', payload)
    try {
      if (editing) await employeeAPI.update(editing.id, payload)
      else await employeeAPI.create(payload)
      message.success('Lưu thành công')
      setOpen(false)
      load()
    } catch (e) { message.error(e.response?.data?.message ?? 'Lỗi') }
  }

  const onChangePos = async (values) => {
    try {
      await employeeAPI.changePosition(editing.id, {
        ...values,
        effectiveDate: values.effectiveDate?.format('YYYY-MM-DD'),
      })
      message.success('Đổi chức vụ thành công')
      setPosOpen(false)
      load()
    } catch { message.error('Lỗi') }
  }

  const cols = [
    { title: 'Mã NV', dataIndex: 'code', width: 80, render: v => <span style={{ color: '#888', fontSize: 12 }}>{v}</span> },
    {
      title: 'Họ tên', dataIndex: 'fullName',
      render: (v, r) => (
        <span style={{ fontWeight: 500, cursor: 'pointer', color: '#1D9E75' }} onClick={() => setDetail(r)}>
          {v}
        </span>
      )
    },
    { title: 'Phòng ban', dataIndex: 'departmentName' },
    { title: 'Chức vụ', dataIndex: 'positionTitle' },
    { title: 'SĐT', dataIndex: 'phone' },
    { title: 'Ngày vào', dataIndex: 'hireDate' },
    { title: 'Lương CB', dataIndex: 'baseSalary', render: v => <strong>{fmt(v)}</strong> },
    { title: 'Trạng thái', dataIndex: 'status', render: v => <Tag color={STATUS_COLOR[v]}>{STATUS_LABEL[v]}</Tag> },
    {
      title: '', key: 'act', width: 130,
      render: (_, row) => (
        <Space size={4}>
          <Button size="small" icon={<EyeOutlined />} onClick={() => setDetail(row)} />
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(row)} />
          <Button size="small" icon={<SwapOutlined />} title="Đổi chức vụ"
            onClick={() => { setEdit(row); posForm.resetFields(); setPosOpen(true) }} />
          <Popconfirm title="Sa thải nhân viên này?" onConfirm={() => employeeAPI.delete(row.id).then(load)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    },
  ]

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, gap: 8, flexWrap: 'wrap' }}>
        <Typography.Title level={4} style={{ margin: 0 }}>Danh sách nhân viên</Typography.Title>
        <Space>
          <Input.Search placeholder="Tìm nhân viên..." style={{ width: 220 }} onSearch={setSrc} allowClear />
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{ background: '#1D9E75' }}>
            Thêm nhân viên
          </Button>
        </Space>
      </div>

      <Table
        columns={cols} dataSource={data} rowKey="id" loading={loading} size="small"
        pagination={{ pageSize: 10, showTotal: t => `Tổng ${t} nhân viên` }}
      />

      {/* ── Add / Edit Modal ── */}
      <Modal
        title={editing ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
        open={open} width={680}
        onCancel={() => setOpen(false)} onOk={() => form.submit()} okText="Lưu"
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item name="code" label="Mã nhân viên" rules={[{ required: true, message: 'Vui lòng nhập mã nhân viên' }]}>
              <Input placeholder="VD: NV001, EMP2026..." />
            </Form.Item>
            <Form.Item name="fullName" label="Họ tên" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="gender" label="Giới tính">
              <Select options={[{ value: 'MALE', label: 'Nam' }, { value: 'FEMALE', label: 'Nữ' }, { value: 'OTHER', label: 'Khác' }]} />
            </Form.Item>
            <Form.Item name="phone" label="SĐT" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="email" label="Email"><Input /></Form.Item>
            <Form.Item name="cccd" label="CCCD"><Input /></Form.Item>
            <Form.Item name="dob" label="Ngày sinh"><DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" /></Form.Item>
            <Form.Item name="departmentId" label="Phòng ban" rules={[{ required: true }]}>
              <Select options={DEPT_OPTIONS} />
            </Form.Item>
            <Form.Item name="positionId" label="Chức vụ" rules={[{ required: true }]}>
              <Select options={POS_OPTIONS} />
            </Form.Item>
            <Form.Item name="hireDate" label="Ngày vào làm" rules={[{ required: true }]}>
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
            <Form.Item name="baseSalary" label="Lương cơ bản (₫)" rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} min={0} step={500000}
                formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
            </Form.Item>
            <Form.Item name="allowance" label="Phụ cấp (₫)">
              <InputNumber style={{ width: '100%' }} min={0} step={100000}
                formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
            </Form.Item>
            {editing && (
              <Form.Item name="status" label="Trạng thái">
                <Select options={Object.entries(STATUS_LABEL).map(([k, v]) => ({ value: k, label: v }))} />
              </Form.Item>
            )}
          </div>
        </Form>
      </Modal>

      {/* ── Change Position Modal ── */}
      <Modal
        title={`Đổi chức vụ – ${editing?.fullName}`}
        open={posOpen} onCancel={() => setPosOpen(false)} onOk={() => posForm.submit()} okText="Xác nhận"
      >
        <Form form={posForm} layout="vertical" onFinish={onChangePos}>
          <Form.Item name="positionId" label="Chức vụ mới" rules={[{ required: true }]}>
            <Select options={POS_OPTIONS} />
          </Form.Item>
          <Form.Item name="effectiveDate" label="Ngày có hiệu lực" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item name="newSalary" label="Mức lương mới (₫)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} step={500000}
              formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
          </Form.Item>
          <Form.Item name="note" label="Ghi chú"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>

      {/* ── Detail Modal with Tabs ── */}
      <Modal
        title={
          <Space>
            <UserOutlined style={{ color: '#1D9E75' }} />
            <span>Hồ sơ: {detail?.fullName}</span>
          </Space>
        }
        open={!!detail} onCancel={() => setDetail(null)} footer={null} width={660}
      >
        {detail && (
          <Tabs
            defaultActiveKey="info"
            items={[
              {
                key: 'info',
                label: <span><UserOutlined /> Thông tin</span>,
                children: (
                  <Descriptions column={2} bordered size="small" style={{ marginTop: 8 }}>
                    <Descriptions.Item label="Mã NV">{detail.code}</Descriptions.Item>
                    <Descriptions.Item label="Họ tên"><strong>{detail.fullName}</strong></Descriptions.Item>
                    <Descriptions.Item label="SĐT">{detail.phone}</Descriptions.Item>
                    <Descriptions.Item label="Email">{detail.email}</Descriptions.Item>
                    <Descriptions.Item label="Ngày sinh">{fmtDate(detail.dob)}</Descriptions.Item>
                    <Descriptions.Item label="CCCD">{detail.cccd}</Descriptions.Item>
                    <Descriptions.Item label="Phòng ban">{detail.departmentName}</Descriptions.Item>
                    <Descriptions.Item label="Chức vụ">{detail.positionTitle}</Descriptions.Item>
                    <Descriptions.Item label="Ngày vào làm">{fmtDate(detail.hireDate)}</Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                      <Tag color={STATUS_COLOR[detail.status]}>{STATUS_LABEL[detail.status]}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Lương cơ bản">
                      <strong style={{ color: '#1D9E75' }}>{fmt(detail.baseSalary)}</strong>
                    </Descriptions.Item>
                    <Descriptions.Item label="Phụ cấp">{fmt(detail.allowance)}</Descriptions.Item>
                  </Descriptions>
                )
              },
              {
                key: 'history',
                label: <span><HistoryOutlined /> Lịch sử chức vụ</span>,
                children: <PositionHistoryTab employeeId={detail.id} />
              }
            ]}
          />
        )}
      </Modal>
    </>
  )
}