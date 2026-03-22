import React, { useEffect, useState } from 'react'
import { Table, Button, Space, Tag, Modal, Form, Select, InputNumber, Input, message, Typography, Descriptions } from 'antd'
import { PlusOutlined, EyeOutlined, CheckOutlined } from '@ant-design/icons'
import { bookingAPI, tourAPI, customerAPI } from '../../services/api'

const STATUS_COLOR = { PENDING:'orange', CONFIRMED:'blue', PAID:'green', COMPLETED:'cyan', CANCELLED:'red' }
const STATUS_LABEL = { PENDING:'Chờ xác nhận', CONFIRMED:'Đã xác nhận', PAID:'Đã thanh toán', COMPLETED:'Hoàn thành', CANCELLED:'Đã hủy' }
const fmt = v => v ? new Intl.NumberFormat('vi-VN').format(v)+' ₫' : '—'

export default function SalesBookings() {
  const [data, setData]       = useState([])
  const [loading, setLoad]    = useState(false)
  const [open, setOpen]       = useState(false)
  const [detail, setDet]      = useState(null)
  const [statusF, setStatusF] = useState('')
  const [customers, setCust]  = useState([])
  const [tours, setTours]     = useState([])
  const [schedules, setSched] = useState([])
  const [form]                = Form.useForm()

  const load = async () => {
    setLoad(true)
    try { const r = await bookingAPI.getAll({ status: statusF, size: 50 }); setData(r.data.data?.content ?? []) }
    catch { message.error('Không tải được') } finally { setLoad(false) }
  }
  useEffect(() => { load() }, [statusF])
  useEffect(() => {
    customerAPI.getAll({ size:100 }).then(r=>setCust((r.data.data?.content??[]).map(c=>({value:c.id,label:`${c.code} – ${c.fullName}`})))).catch(()=>{})
    tourAPI.getAll({ status:'ACTIVE', size:50 }).then(r=>{
      const ts = r.data.data?.content ?? []
      setTours(ts.map(t=>({value:t.id,label:t.name, schedules:t.schedules??[]})))
    }).catch(()=>{})
  }, [])

  const onTourChange = (tourId) => {
    const t = tours.find(t=>t.value===tourId)
    setSched((t?.schedules??[]).map(s=>({value:s.id,label:`${s.departureDate} (còn ${s.available} chỗ)`})))
    form.setFieldValue('tourScheduleId', undefined)
  }

  const onFinish = async (values) => {
    try {
      await bookingAPI.create(values)
      message.success('Đặt tour thành công'); setOpen(false); load()
    } catch (e) { message.error(e.response?.data?.message ?? 'Lỗi') }
  }

  const updateStatus = async (id, status) => {
    try { await bookingAPI.updateStatus(id, { status }); message.success('Cập nhật thành công'); load() }
    catch { message.error('Lỗi') }
  }

  const cols = [
    { title:'Mã đơn', dataIndex:'code', render:v=><strong style={{fontSize:12}}>{v}</strong> },
    { title:'Khách hàng', render:(_,r)=><div><strong>{r.customerName}</strong><br/><span style={{fontSize:11,color:'#888'}}>{r.customerPhone}</span></div> },
    { title:'Tour', render:(_,r)=><div><strong>{r.tourName}</strong><br/><span style={{fontSize:11,color:'#888'}}>{r.departureDate}</span></div> },
    { title:'Số người', render:(_,r)=>`${r.adults} NL${r.children?` + ${r.children} TE`:''}` },
    { title:'Tổng tiền', dataIndex:'totalPrice', render:v=><strong style={{color:'#1D9E75'}}>{fmt(v)}</strong> },
    { title:'Trạng thái', dataIndex:'status',
      render:v=><Tag color={STATUS_COLOR[v]}>{STATUS_LABEL[v]}</Tag>,
      filters:Object.entries(STATUS_LABEL).map(([k,v])=>({text:v,value:k})), onFilter:(val,r)=>r.status===val },
    { title:'', key:'act', width:130, render:(_,row)=>(
      <Space size={4}>
        <Button size="small" icon={<EyeOutlined />} onClick={()=>setDet(row)}>Xem</Button>
        {row.status==='PENDING'    && <Button size="small" type="primary" ghost onClick={()=>updateStatus(row.id,'CONFIRMED')}>Xác nhận</Button>}
        {row.status==='CONFIRMED'  && <Button size="small" style={{color:'#1D9E75',borderColor:'#1D9E75'}} onClick={()=>updateStatus(row.id,'PAID')}>Đã TT</Button>}
      </Space>
    )},
  ]

  return (
    <>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:16,gap:8,flexWrap:'wrap'}}>
        <Typography.Title level={4} style={{margin:0}}>Quản lý đặt tour</Typography.Title>
        <Space>
          <Select placeholder="Lọc trạng thái" allowClear style={{width:160}} onChange={v=>setStatusF(v??'')}
            options={Object.entries(STATUS_LABEL).map(([k,v])=>({value:k,label:v}))} />
          <Button type="primary" icon={<PlusOutlined />} onClick={()=>{form.resetFields();setOpen(true)}} style={{background:'#1D9E75'}}>Đặt tour mới</Button>
        </Space>
      </div>
      <Table columns={cols} dataSource={data} rowKey="id" loading={loading} size="small"
        pagination={{pageSize:10, showTotal:t=>`Tổng ${t} đơn`}} />

      {/* Create booking modal */}
      <Modal title="Lập phiếu đặt tour" open={open} width={600} onCancel={()=>setOpen(false)} onOk={()=>form.submit()} okText="Xác nhận đặt">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="customerId" label="Khách hàng" rules={[{required:true}]}>
            <Select showSearch options={customers} filterOption={(i,o)=>o.label.toLowerCase().includes(i.toLowerCase())} />
          </Form.Item>
          <Form.Item name="tourId" label="Tour">
            <Select options={tours} onChange={onTourChange} placeholder="Chọn tour trước" />
          </Form.Item>
          <Form.Item name="tourScheduleId" label="Ngày khởi hành" rules={[{required:true}]}>
            <Select options={schedules} disabled={!schedules.length} />
          </Form.Item>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Form.Item name="adults" label="Số người lớn" rules={[{required:true}]} initialValue={2}><InputNumber min={1} style={{width:'100%'}} /></Form.Item>
            <Form.Item name="children" label="Số trẻ em" initialValue={0}><InputNumber min={0} style={{width:'100%'}} /></Form.Item>
          </div>
          <Form.Item name="paymentMethod" label="Hình thức thanh toán" initialValue="BANK">
            <Select options={[{value:'BANK',label:'Chuyển khoản ngân hàng'},{value:'VNPAY',label:'VNPay / QR'},{value:'MOMO',label:'Ví MoMo'},{value:'CASH',label:'Tiền mặt'}]} />
          </Form.Item>
          <Form.Item name="note" label="Ghi chú"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>

      {/* Detail modal */}
      <Modal title={`Chi tiết đơn – ${detail?.code}`} open={!!detail} onCancel={()=>setDet(null)} width={580}
        footer={detail && detail.status!=='CANCELLED' && detail.status!=='COMPLETED' ? [
          <Button key="close" onClick={()=>setDet(null)}>Đóng</Button>,
          detail.status==='PENDING' && <Button key="confirm" type="primary" ghost onClick={()=>{updateStatus(detail.id,'CONFIRMED');setDet(null)}}>Xác nhận</Button>,
          detail.status==='CONFIRMED' && <Button key="paid" style={{color:'#1D9E75',borderColor:'#1D9E75'}} onClick={()=>{updateStatus(detail.id,'PAID');setDet(null)}}>Đánh dấu đã TT</Button>,
          <Button key="cancel" danger onClick={()=>{updateStatus(detail.id,'CANCELLED');setDet(null)}}>Hủy đơn</Button>,
        ] : [<Button key="close" onClick={()=>setDet(null)}>Đóng</Button>]}>
        {detail && <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="Khách hàng">{detail.customerName}</Descriptions.Item>
          <Descriptions.Item label="SĐT">{detail.customerPhone}</Descriptions.Item>
          <Descriptions.Item label="Tour" span={2}>{detail.tourName}</Descriptions.Item>
          <Descriptions.Item label="Ngày đi">{detail.departureDate}</Descriptions.Item>
          <Descriptions.Item label="Số người">{detail.adults} NL{detail.children?` + ${detail.children} TE`:''}</Descriptions.Item>
          <Descriptions.Item label="Tổng tiền"><strong style={{color:'#1D9E75'}}>{fmt(detail.totalPrice)}</strong></Descriptions.Item>
          <Descriptions.Item label="Đặt cọc">{fmt(detail.deposit)}</Descriptions.Item>
          <Descriptions.Item label="Giảm giá">{fmt(detail.discount)}</Descriptions.Item>
          <Descriptions.Item label="Trạng thái"><Tag color={STATUS_COLOR[detail.status]}>{STATUS_LABEL[detail.status]}</Tag></Descriptions.Item>
          <Descriptions.Item label="Ghi chú" span={2}>{detail.note}</Descriptions.Item>
        </Descriptions>}
      </Modal>
    </>
  )
}
