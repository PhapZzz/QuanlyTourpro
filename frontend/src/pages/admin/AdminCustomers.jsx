import React, { useEffect, useState } from 'react'
import { Table, Button, Space, Tag, Modal, Form, Input, Select, message, Typography, Tabs, Descriptions } from 'antd'
import { PlusOutlined, EyeOutlined } from '@ant-design/icons'
import { customerAPI, bookingAPI } from '../../services/api'
import dayjs from 'dayjs'

const SEG_COLOR = { VIP:'gold', LOYAL:'purple', REGULAR:'blue', NEW:'green' }
const SEG_LABEL = { VIP:'⭐ VIP', LOYAL:'Thân thiết', REGULAR:'Thường', NEW:'Mới' }
const SRC_LABEL = { WEBSITE:'Website', ZALO:'Zalo', FACEBOOK:'Facebook', REFERRAL:'Giới thiệu', DIRECT:'Trực tiếp', OTHER:'Khác' }
const fmt = v => v ? new Intl.NumberFormat('vi-VN').format(v) + ' ₫' : '—'

export default function AdminCustomers() {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch]   = useState('')
  const [segment, setSegment] = useState('')
  const [detail, setDetail]   = useState(null)
  const [bookings, setBookings] = useState([])
  const [addOpen, setAddOpen] = useState(false)
  const [form]                = Form.useForm()

  const load = async () => {
    setLoading(true)
    try { const r = await customerAPI.getAll({ search, segment, size: 50 }); setData(r.data.data?.content ?? []) }
    catch { message.error('Không tải được') } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [search, segment])

  const openDetail = async (row) => {
    setDetail(row)
    try { const r = await bookingAPI.getByCustomer(row.id, { size: 20 }); setBookings(r.data.data?.content ?? []) }
    catch { setBookings([]) }
  }

  const onAdd = async (values) => {
    try { await customerAPI.create(values); message.success('Thêm khách hàng thành công'); setAddOpen(false); load() }
    catch (e) { message.error(e.response?.data?.message ?? 'Lỗi') }
  }

  const STATUS_COLOR = { PENDING:'orange', CONFIRMED:'blue', PAID:'green', COMPLETED:'cyan', CANCELLED:'red' }
  const STATUS_LABEL = { PENDING:'Chờ xác nhận', CONFIRMED:'Đã xác nhận', PAID:'Đã thanh toán', COMPLETED:'Hoàn thành', CANCELLED:'Đã hủy' }

  const cols = [
    { title:'Mã KH', dataIndex:'code', width:90, render:v=><span style={{color:'#888',fontSize:12}}>{v}</span> },
    { title:'Họ tên', dataIndex:'fullName', render:(v,r)=><span style={{fontWeight:500,cursor:'pointer',color:'#1D9E75'}} onClick={()=>openDetail(r)}>{v}</span> },
    { title:'SĐT', dataIndex:'phone' },
    { title:'Email', dataIndex:'email' },
    { title:'Nguồn', dataIndex:'source', render:v=>SRC_LABEL[v]??v },
    { title:'Nhóm', dataIndex:'segment', render:v=><Tag color={SEG_COLOR[v]}>{SEG_LABEL[v]}</Tag> },
    { title:'Điểm', dataIndex:'loyaltyPoints', align:'center' },
    { title:'', key:'act', width:60, render:(_,row)=>
      <Button size="small" icon={<EyeOutlined />} onClick={()=>openDetail(row)} />
    },
  ]

  const bookingCols = [
    { title:'Mã đơn', dataIndex:'code', render:v=><strong style={{fontSize:12}}>{v}</strong> },
    { title:'Tour', dataIndex:'tourName' },
    { title:'Ngày đi', dataIndex:'departureDate' },
    { title:'Tổng tiền', dataIndex:'totalPrice', render:v=><strong style={{color:'#1D9E75'}}>{fmt(v)}</strong> },
    { title:'Trạng thái', dataIndex:'status', render:v=><Tag color={STATUS_COLOR[v]}>{STATUS_LABEL[v]}</Tag> },
  ]

  return (
    <>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:16,gap:8,flexWrap:'wrap'}}>
        <Typography.Title level={4} style={{margin:0}}>Khách hàng</Typography.Title>
        <Space>
          <Input.Search placeholder="Tìm tên, SĐT..." style={{width:220}} onSearch={setSearch} allowClear />
          <Select placeholder="Nhóm KH" allowClear style={{width:130}} onChange={setSegment}
            options={Object.entries(SEG_LABEL).map(([k,v])=>({value:k,label:v}))} />
          <Button type="primary" icon={<PlusOutlined />} onClick={()=>{form.resetFields();setAddOpen(true)}} style={{background:'#1D9E75'}}>Thêm KH</Button>
        </Space>
      </div>

      <Table columns={cols} dataSource={data} rowKey="id" loading={loading} size="small"
        pagination={{pageSize:12, showTotal:t=>`Tổng ${t} khách hàng`}} />

      {/* Detail modal */}
      <Modal title={`Hồ sơ: ${detail?.fullName}`} open={!!detail} onCancel={()=>setDetail(null)} footer={null} width={720}>
        {detail && <Tabs items={[
          { key:'info', label:'Thông tin', children:(
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Mã KH">{detail.code}</Descriptions.Item>
              <Descriptions.Item label="Họ tên">{detail.fullName}</Descriptions.Item>
              <Descriptions.Item label="SĐT">{detail.phone}</Descriptions.Item>
              <Descriptions.Item label="Email">{detail.email}</Descriptions.Item>
              <Descriptions.Item label="Ngày sinh">{detail.dob}</Descriptions.Item>
              <Descriptions.Item label="CCCD">{detail.cccdPassport}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ" span={2}>{detail.address}</Descriptions.Item>
              <Descriptions.Item label="Nguồn KH">{SRC_LABEL[detail.source]}</Descriptions.Item>
              <Descriptions.Item label="Nhóm KH"><Tag color={SEG_COLOR[detail.segment]}>{SEG_LABEL[detail.segment]}</Tag></Descriptions.Item>
              <Descriptions.Item label="Điểm tích lũy">{detail.loyaltyPoints}</Descriptions.Item>
              <Descriptions.Item label="Sở thích">{detail.preferences}</Descriptions.Item>
              <Descriptions.Item label="Yêu cầu đặc biệt" span={2}>{detail.specialRequest}</Descriptions.Item>
            </Descriptions>
          )},
          { key:'bookings', label:`Lịch sử đặt tour (${bookings.length})`, children:(
            <Table columns={bookingCols} dataSource={bookings} rowKey="id" size="small" pagination={false} />
          )},
        ]} />}
      </Modal>

      {/* Add customer modal */}
      <Modal title="Thêm khách hàng mới" open={addOpen} onCancel={()=>setAddOpen(false)} onOk={()=>form.submit()} okText="Lưu">
        <Form form={form} layout="vertical" onFinish={onAdd}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Form.Item name="fullName" label="Họ tên" rules={[{required:true}]}><Input /></Form.Item>
            <Form.Item name="phone" label="SĐT" rules={[{required:true}]}><Input /></Form.Item>
            <Form.Item name="email" label="Email"><Input /></Form.Item>
            <Form.Item name="gender" label="Giới tính">
              <Select options={[{value:'MALE',label:'Nam'},{value:'FEMALE',label:'Nữ'},{value:'OTHER',label:'Khác'}]} />
            </Form.Item>
            <Form.Item name="source" label="Nguồn KH">
              <Select options={Object.entries(SRC_LABEL).map(([k,v])=>({value:k,label:v}))} />
            </Form.Item>
            <Form.Item name="segment" label="Nhóm KH" initialValue="NEW">
              <Select options={Object.entries(SEG_LABEL).map(([k,v])=>({value:k,label:v}))} />
            </Form.Item>
          </div>
          <Form.Item name="address" label="Địa chỉ"><Input /></Form.Item>
          <Form.Item name="preferences" label="Sở thích tour"><Input /></Form.Item>
          <Form.Item name="specialRequest" label="Yêu cầu đặc biệt"><Input /></Form.Item>
        </Form>
      </Modal>
    </>
  )
}
