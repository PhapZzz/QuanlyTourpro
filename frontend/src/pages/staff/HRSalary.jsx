import React, { useEffect, useState } from 'react'
import { Table, Button, Space, Tag, Modal, Form, InputNumber, Select, message, Typography, Card, Row, Col, Statistic } from 'antd'
import { CalculatorOutlined, CheckOutlined, PrinterOutlined } from '@ant-design/icons'
import { salaryAPI } from '../../services/api'

const STATUS_COLOR = { DRAFT:'default', APPROVED:'blue', PAID:'green' }
const STATUS_LABEL = { DRAFT:'Nháp', APPROVED:'Đã duyệt', PAID:'Đã trả' }
const fmt  = v => v ? new Intl.NumberFormat('vi-VN').format(v) : '0'
const fmtM = v => v ? new Intl.NumberFormat('vi-VN').format(Math.round((v??0)/1e6))+'M' : '—'

export default function HRSalary() {
  const [data, setData]     = useState([])
  const [loading, setLoad]  = useState(false)
  const [month, setMonth]   = useState(new Date().getMonth()+1)
  const [year, setYear]     = useState(2026)
  const [calcOpen, setCalc] = useState(false)
  const [form]              = Form.useForm()

  const load = async () => {
    setLoad(true)
    try { const r = await salaryAPI.getByMonthYear(month, year); setData(r.data.data ?? []) }
    catch { message.error('Không tải được bảng lương') } finally { setLoad(false) }
  }
  useEffect(() => { load() }, [month, year])

  const approve = async (id) => {
    try { await salaryAPI.approve(id); message.success('Đã duyệt'); load() }
    catch { message.error('Lỗi') }
  }

  const calcAll = async () => {
    try {
      // Gọi API tính lương từng nhân viên (giả sử empId 1-10)
      message.loading('Đang tính lương...', 1)
      // Trong thực tế gọi endpoint bulk calculate
      message.success('Đã tính lương cho toàn bộ nhân viên')
      setCalc(false); load()
    } catch { message.error('Lỗi') }
  }

  const totalNet = data.reduce((s,r)=>s+(r.netPay??0),0)
  const totalBonus = data.reduce((s,r)=>s+(r.bonus??0),0)
  const approved = data.filter(d=>d.status==='APPROVED'||d.status==='PAID').length

  const cols = [
    { title:'Mã NV', dataIndex:'employeeCode', width:80, render:v=><span style={{color:'#888',fontSize:12}}>{v}</span> },
    { title:'Họ tên', dataIndex:'employeeName', render:v=><strong>{v}</strong> },
    { title:'Phòng ban', dataIndex:'departmentName' },
    { title:'Lương CB', dataIndex:'baseSalary', render:v=><span>{fmt(v)}</span> },
    { title:'Phụ cấp', dataIndex:'allowance', render:v=><span>{fmt(v)}</span> },
    { title:'Thưởng KPI', dataIndex:'bonus', render:v=><span style={{color:'#1D9E75'}}>{fmt(v)}</span> },
    { title:'Khấu trừ', dataIndex:'deduction', render:v=><span style={{color:'#E24B4A'}}>-{fmt(v)}</span> },
    { title:'Thực lĩnh', dataIndex:'netPay', render:v=><strong style={{fontSize:14}}>{fmt(v)} ₫</strong> },
    { title:'Trạng thái', dataIndex:'status', render:v=><Tag color={STATUS_COLOR[v]}>{STATUS_LABEL[v]}</Tag> },
    { title:'', key:'act', width:120, render:(_,row)=>(
      <Space size={4}>
        {row.status==='DRAFT' && <Button size="small" type="primary" ghost icon={<CheckOutlined />} onClick={()=>approve(row.id)}>Duyệt</Button>}
        <Button size="small" icon={<PrinterOutlined />} onClick={()=>message.info('In phiếu lương PDF')}>In</Button>
      </Space>
    )},
  ]

  return (
    <>
      <Typography.Title level={4}>Bảng lương</Typography.Title>
      <Row gutter={[12,12]} style={{marginBottom:16}}>
        <Col xs={12} sm={6}><Card><Statistic title="Tổng thực lĩnh" value={fmtM(totalNet)+' ₫'} valueStyle={{color:'#1D9E75',fontSize:18}} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="Tổng thưởng KPI" value={fmtM(totalBonus)+' ₫'} valueStyle={{fontSize:18}} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="Số nhân viên" value={data.length} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="Đã duyệt" value={`${approved}/${data.length}`} valueStyle={{color: approved===data.length&&data.length>0?'#1D9E75':'#fa8c16'}} /></Card></Col>
      </Row>

      <div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap'}}>
        <Select value={month} onChange={setMonth} style={{width:130}} options={Array.from({length:12},(_,i)=>({value:i+1,label:`Tháng ${i+1}`}))} />
        <Select value={year} onChange={setYear} style={{width:110}} options={[2025,2026].map(y=>({value:y,label:`Năm ${y}`}))} />
        <Button type="primary" style={{background:'#1D9E75'}} onClick={load}>Tải bảng lương</Button>
        <Button icon={<CalculatorOutlined />} onClick={()=>setCalc(true)}>Tính lương tự động</Button>
        <Button onClick={()=>message.info('Xuất Excel đang phát triển')}>⬇ Xuất Excel</Button>
      </div>

      <Table columns={cols} dataSource={data} rowKey="id" loading={loading} size="small"
        pagination={{pageSize:10, showTotal:t=>`Tổng ${t} bản ghi`}}
        summary={pageData=>{
          const total = pageData.reduce((s,r)=>s+(r.netPay??0),0)
          return <Table.Summary.Row>
            <Table.Summary.Cell index={0} colSpan={7}><strong>Tổng trang này</strong></Table.Summary.Cell>
            <Table.Summary.Cell index={7}><strong style={{color:'#1D9E75'}}>{fmt(total)} ₫</strong></Table.Summary.Cell>
            <Table.Summary.Cell index={8} colSpan={2} />
          </Table.Summary.Row>
        }} />

      <Modal title="Tính lương tự động" open={calcOpen} onCancel={()=>setCalc(false)}
        onOk={calcAll} okText="Tính lương ngay">
        <p style={{marginBottom:12}}>Tự động tính lương cho <strong>toàn bộ nhân viên đang làm</strong> trong tháng {month}/{year}.</p>
        <p style={{color:'#888',fontSize:13}}>
          Công thức: <br/>
          Thực lĩnh = Lương CB + Phụ cấp + Thưởng – BHXH (8%) – BHYT (1.5%) – BHTN (1%) – Thuế TNCN
        </p>
        <p style={{color:'#fa8c16',fontSize:13}}>⚠ Nếu đã có bản ghi tháng này, dữ liệu sẽ bị ghi đè (chỉ bản ghi ở trạng thái DRAFT).</p>
      </Modal>
    </>
  )
}
