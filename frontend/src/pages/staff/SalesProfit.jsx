import React, { useState } from 'react'
import { Table, Button, Tag, Modal, Form, Select, DatePicker, InputNumber, message, Typography, Card, Row, Col, Statistic } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { adminAPI } from '../../services/api'
import dayjs from 'dayjs'

const fmt  = v => v ? new Intl.NumberFormat('vi-VN').format(v)+' ₫' : '—'
const fmtM = v => v ? Math.round((v??0)/1e6)+'M' : '—'

// ===================== SalesExport =====================
export function SalesExport() {
  const [vouchers, setVouchers] = useState([
    { id:1, code:'PX-2026-088', date:'2026-03-15', booking:'DT-2026-1023', service:'Phòng Deluxe × 70', total:126000000, createdBy:'Phạm Thị KD' },
    { id:2, code:'PX-2026-087', date:'2026-03-14', booking:'DT-2026-1024', service:'Vé bay HAN-DAD × 84', total:105000000, createdBy:'Phạm Thị KD' },
    { id:3, code:'PX-2026-086', date:'2026-03-10', booking:'DT-2026-0081', service:'Phòng Beach Villa × 10', total:45000000, createdBy:'Phạm Thị KD' },
  ])
  const [open, setOpen] = useState(false)
  const [form]          = Form.useForm()

  const onFinish = (values) => {
    const code = `PX-${new Date().getFullYear()}-${String(vouchers.length+1).padStart(3,'0')}`
    setVouchers([{ id:Date.now(), code, date:values.date?.format('YYYY-MM-DD'), booking:'Mới', service:'Chi tiết dịch vụ', total:0, createdBy:'Bạn' }, ...vouchers])
    message.success('Lập phiếu xuất thành công'); setOpen(false)
  }

  const cols = [
    { title:'Số phiếu', dataIndex:'code', render:v=><strong>{v}</strong> },
    { title:'Ngày xuất', dataIndex:'date' },
    { title:'Đơn đặt tour', dataIndex:'booking', render:v=><Tag color="blue">{v}</Tag> },
    { title:'Dịch vụ xuất', dataIndex:'service' },
    { title:'Tổng tiền', dataIndex:'total', render:v=><strong style={{color:'#1D9E75'}}>{fmt(v)}</strong> },
    { title:'Người lập', dataIndex:'createdBy' },
  ]

  return (
    <>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}>
        <Typography.Title level={4} style={{margin:0}}>Phiếu xuất tour</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={()=>{form.resetFields();setOpen(true)}} style={{background:'#1D9E75'}}>Lập phiếu xuất</Button>
      </div>
      <Table columns={cols} dataSource={vouchers} rowKey="id" size="small" pagination={{pageSize:10}} />
      <Modal title="Lập phiếu xuất tour" open={open} onCancel={()=>setOpen(false)} onOk={()=>form.submit()} okText="Lưu phiếu">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="bookingCode" label="Mã đơn đặt tour"><Select options={[{value:'DT-2026-1024',label:'DT-2026-1024 – Phú Quốc'},{value:'DT-2026-1023',label:'DT-2026-1023 – Đà Nẵng'}]} /></Form.Item>
          <Form.Item name="date" label="Ngày xuất" rules={[{required:true}]} initialValue={dayjs()}><DatePicker style={{width:'100%'}} format="DD/MM/YYYY" /></Form.Item>
          <Form.Item name="productId" label="Dịch vụ xuất"><Select options={[{value:1,label:'Phòng Deluxe Sea View'},{value:3,label:'Vé bay HAN-DAD'},{value:5,label:'Set ăn sáng'}]} /></Form.Item>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Form.Item name="qty" label="Số lượng"><InputNumber min={1} style={{width:'100%'}} /></Form.Item>
            <Form.Item name="unitPrice" label="Đơn giá (₫)"><InputNumber min={0} style={{width:'100%'}} formatter={v=>`${v}`.replace(/\B(?=(\d{3})+(?!\d))/g,',')} /></Form.Item>
          </div>
        </Form>
      </Modal>
    </>
  )
}

// ===================== SalesProfit =====================
const profitData = [
  { month:'T1/26', revenue:842, cost:534, profit:308 },
  { month:'T2/26', revenue:776, cost:490, profit:286 },
  { month:'T3/26', revenue:720, cost:460, profit:260 },
  { month:'T4/26', revenue:0,   cost:0,   profit:0 },
  { month:'T5/26', revenue:0,   cost:0,   profit:0 },
  { month:'T6/26', revenue:0,   cost:0,   profit:0 },
]

export function SalesProfit() {
  const [month, setMonth] = useState(3)
  const [year,  setYear]  = useState(2026)
  const [data,  setData]  = useState(null)
  const [loading, setLoad]= useState(false)

  const load = async () => {
    setLoad(true)
    try { const r = await adminAPI.getRevenueReport(month, year); setData(r.data.data) }
    catch { message.error('Không tải được') } finally { setLoad(false) }
  }

  return (
    <>
      <Typography.Title level={4}>Doanh thu & Lợi nhuận</Typography.Title>
      <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
        <Select value={month} onChange={setMonth} style={{width:130}} options={Array.from({length:12},(_,i)=>({value:i+1,label:`Tháng ${i+1}`}))} />
        <Select value={year}  onChange={setYear}  style={{width:110}} options={[2025,2026].map(y=>({value:y,label:`Năm ${y}`}))} />
        <Button type="primary" onClick={load} loading={loading} style={{background:'#1D9E75'}}>Xem báo cáo</Button>
        <Button onClick={()=>message.info('Xuất báo cáo đang phát triển')}>⬇ Xuất báo cáo</Button>
      </div>
      <Row gutter={[16,16]} style={{marginBottom:20}}>
        <Col xs={12} sm={6}><Card><Statistic title="Doanh thu" value={fmtM(data?.totalRevenue??842000000)+' ₫'} valueStyle={{color:'#1D9E75'}} suffix={<span style={{fontSize:12,color:'#1D9E75'}}> ↑ 8.5%</span>} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="Chi phí DV" value={fmtM(data?.totalCost??534000000)+' ₫'} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="Số đơn" value={data?.totalBookings??127} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="Lợi nhuận gộp" value={fmtM(data?.grossProfit??308000000)+' ₫'} valueStyle={{color:'#1D9E75'}} suffix={data?.profitMargin ? <span style={{fontSize:12}}> ({data.profitMargin.toFixed(1)}%)</span>:''} /></Card></Col>
      </Row>
      <Card title="Doanh thu – Chi phí – Lợi nhuận 2026 (triệu ₫)">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={profitData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" /><YAxis />
            <Tooltip formatter={v=>[v+'M ₫']} />
            <Legend />
            <Bar dataKey="revenue" name="Doanh thu" fill="#1D9E75" radius={[4,4,0,0]} />
            <Bar dataKey="cost"    name="Chi phí"   fill="#9FE1CB" radius={[4,4,0,0]} />
            <Bar dataKey="profit"  name="Lợi nhuận" fill="#EF9F27" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </>
  )
}

export default SalesProfit
