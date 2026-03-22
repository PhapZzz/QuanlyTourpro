import React, { useEffect, useState } from 'react'
import { Table, Button, Space, Tag, Modal, Form, Input, Select, InputNumber, message, Typography, Popconfirm, Rate } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, CalendarOutlined } from '@ant-design/icons'
import { tourAPI } from '../../services/api'
import dayjs from 'dayjs'

const TYPE_LABEL = { DOMESTIC:'Trong nước', INTERNATIONAL:'Quốc tế', MICE:'MICE' }
const TYPE_COLOR = { DOMESTIC:'green', INTERNATIONAL:'purple', MICE:'blue' }
const STATUS_COLOR = { ACTIVE:'success', INACTIVE:'default', FULL:'warning' }
const STATUS_LABEL = { ACTIVE:'Đang bán', INACTIVE:'Tạm dừng', FULL:'Đầy chỗ' }

const fmt = v => v ? new Intl.NumberFormat('vi-VN').format(v) + ' ₫' : '—'

export default function AdminTours() {
  const [data, setData]         = useState([])
  const [loading, setLoading]   = useState(false)
  const [open, setOpen]         = useState(false)
  const [scheduleOpen, setScOpen] = useState(false)
  const [editing, setEditing]   = useState(null)
  const [form]                  = Form.useForm()
  const [scForm]                = Form.useForm()
  const [search, setSearch]     = useState('')
  const [typeFilter, setType]   = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const r = await tourAPI.getAll({ search, type: typeFilter, size: 50 })
      setData(r.data.data?.content ?? [])
    } catch { message.error('Không tải được danh sách tour') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [search, typeFilter])

  const openCreate = () => { setEditing(null); form.resetFields(); setOpen(true) }
  const openEdit = (row) => {
    setEditing(row)
    form.setFieldsValue({ ...row, type: row.type, status: row.status })
    setOpen(true)
  }

  const onFinish = async (values) => {
    try {
      if (editing) await tourAPI.update(editing.id, values)
      else await tourAPI.create(values)
      message.success(editing ? 'Cập nhật thành công' : 'Thêm tour thành công')
      setOpen(false); load()
    } catch (e) { message.error(e.response?.data?.message ?? 'Lỗi') }
  }

  const addSchedule = async (values) => {
    try {
      await tourAPI.addSchedule(editing.id, { ...values, departureDate: values.departureDate.format('YYYY-MM-DD') })
      message.success('Đã thêm lịch khởi hành'); setScOpen(false); load()
    } catch { message.error('Lỗi') }
  }

  const cols = [
    { title:'Mã', dataIndex:'code', width:70, render:v=><span style={{color:'#888',fontSize:12}}>{v}</span> },
    { title:'Tên tour', dataIndex:'name', render:(v,r)=><span style={{fontWeight:500,cursor:'pointer'}} onClick={()=>openEdit(r)}>{v}</span> },
    { title:'Điểm đến', dataIndex:'destination' },
    { title:'Loại', dataIndex:'type', render:v=><Tag color={TYPE_COLOR[v]}>{TYPE_LABEL[v]}</Tag> },
    { title:'Thời gian', render:(_,r)=>`${r.days}N${r.nights}Đ` },
    { title:'Giá người lớn', dataIndex:'priceAdult', render:v=><strong style={{color:'#1D9E75'}}>{fmt(v)}</strong> },
    { title:'Đánh giá', dataIndex:'avgRating', render:v=>v ? <><Rate disabled value={Math.round(v)} style={{fontSize:12}}/> <span style={{fontSize:12}}>{Number(v).toFixed(1)}</span></> : '—' },
    { title:'Trạng thái', dataIndex:'status', render:v=><Tag color={STATUS_COLOR[v]}>{STATUS_LABEL[v]}</Tag> },
    { title:'', key:'act', width:130, render:(_,row)=>(
      <Space size={4}>
        <Button size="small" icon={<EditOutlined />} onClick={()=>openEdit(row)} />
        <Button size="small" icon={<CalendarOutlined />} title="Thêm lịch khởi hành"
          onClick={()=>{ setEditing(row); scForm.resetFields(); setScOpen(true) }} />
        <Popconfirm title="Xác nhận xóa?" onConfirm={()=>tourAPI.update(row.id,{status:'INACTIVE'}).then(load)}>
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>
    )},
  ]

  return (
    <>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:16,gap:8,flexWrap:'wrap'}}>
        <Typography.Title level={4} style={{margin:0}}>Quản lý Tour</Typography.Title>
        <Space>
          <Input.Search placeholder="Tìm tour..." style={{width:220}} onSearch={setSearch} allowClear />
          <Select placeholder="Lọc loại" allowClear style={{width:140}} onChange={setType}
            options={Object.entries(TYPE_LABEL).map(([k,v])=>({value:k,label:v}))} />
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{background:'#1D9E75'}}>Thêm tour</Button>
        </Space>
      </div>

      <Table columns={cols} dataSource={data} rowKey="id" loading={loading} size="small"
        pagination={{pageSize:10, showTotal:t=>`Tổng ${t} tour`}} />

      {/* Add/Edit Tour Modal */}
      <Modal title={editing?'Chỉnh sửa tour':'Thêm tour mới'} open={open} width={700}
        onCancel={()=>setOpen(false)} onOk={()=>form.submit()} okText="Lưu">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Form.Item name="name" label="Tên tour" rules={[{required:true}]} style={{gridColumn:'1/-1'}}>
              <Input />
            </Form.Item>
            <Form.Item name="type" label="Loại tour" rules={[{required:true}]}>
              <Select options={Object.entries(TYPE_LABEL).map(([k,v])=>({value:k,label:v}))} />
            </Form.Item>
            <Form.Item name="status" label="Trạng thái">
              <Select options={Object.entries(STATUS_LABEL).map(([k,v])=>({value:k,label:v}))} />
            </Form.Item>
            <Form.Item name="origin" label="Điểm khởi hành"><Input placeholder="TP.HCM" /></Form.Item>
            <Form.Item name="destination" label="Điểm đến" rules={[{required:true}]}><Input /></Form.Item>
            <Form.Item name="days" label="Số ngày" rules={[{required:true}]}><InputNumber min={1} style={{width:'100%'}} /></Form.Item>
            <Form.Item name="nights" label="Số đêm"><InputNumber min={0} style={{width:'100%'}} /></Form.Item>
            <Form.Item name="capacity" label="Sức chứa" rules={[{required:true}]}><InputNumber min={1} style={{width:'100%'}} /></Form.Item>
            <Form.Item name="priceAdult" label="Giá người lớn (₫)" rules={[{required:true}]}><InputNumber min={0} style={{width:'100%'}} step={100000} formatter={v=>`${v}`.replace(/\B(?=(\d{3})+(?!\d))/g,',')} /></Form.Item>
            <Form.Item name="priceChild" label="Giá trẻ em (₫)"><InputNumber min={0} style={{width:'100%'}} step={100000} formatter={v=>`${v}`.replace(/\B(?=(\d{3})+(?!\d))/g,',')} /></Form.Item>
            <Form.Item name="included" label="Dịch vụ bao gồm" style={{gridColumn:'1/-1'}}><Input.TextArea rows={2} /></Form.Item>
            <Form.Item name="description" label="Mô tả" style={{gridColumn:'1/-1'}}><Input.TextArea rows={3} /></Form.Item>
            <Form.Item name="itinerary" label="Lịch trình" style={{gridColumn:'1/-1'}}><Input.TextArea rows={4} /></Form.Item>
          </div>
        </Form>
      </Modal>

      {/* Add Schedule Modal */}
      <Modal title={`Thêm lịch khởi hành – ${editing?.name}`} open={scheduleOpen}
        onCancel={()=>setScOpen(false)} onOk={()=>scForm.submit()} okText="Thêm">
        <Form form={scForm} layout="vertical" onFinish={addSchedule}>
          <Form.Item name="departureDate" label="Ngày khởi hành" rules={[{required:true}]}>
            <input type="date" style={{width:'100%',padding:'7px 11px',borderRadius:6,border:'1px solid #d9d9d9',fontSize:14}} onChange={e=>scForm.setFieldValue('departureDate',dayjs(e.target.value))} />
          </Form.Item>
          <Form.Item name="capacity" label="Số chỗ" rules={[{required:true}]}>
            <InputNumber min={1} style={{width:'100%'}} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
