import React, { useEffect, useState } from 'react'
import { Table, Button, Space, Tag, Modal, Form, Input, Select, InputNumber, message, Typography, Popconfirm, Card, Row, Col, Statistic } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, WarningOutlined } from '@ant-design/icons'
import { productAPI, supplierAPI } from '../../services/api'

const TYPE_COLOR = { HOTEL:'blue', FLIGHT:'purple', FOOD:'green', VEHICLE:'orange', ACTIVITY:'cyan', OTHER:'default' }
const TYPE_LABEL = { HOTEL:'Khách sạn', FLIGHT:'Vé máy bay', FOOD:'Ăn uống', VEHICLE:'Xe du lịch', ACTIVITY:'Vui chơi', OTHER:'Khác' }
const fmt = v => v ? new Intl.NumberFormat('vi-VN').format(v) : '0'

export default function WarehouseProducts() {
  const [data, setData]         = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoad]      = useState(false)
  const [open, setOpen]         = useState(false)
  const [editing, setEdit]      = useState(null)
  const [search, setSrc]        = useState('')
  const [typeF, setType]        = useState('')
  const [form]                  = Form.useForm()

  const load = async () => {
    setLoad(true)
    try {
      const r = await productAPI.getAll({ search, type: typeF, size: 50 })
      setData(r.data.data?.content ?? [])
    } catch { message.error('Không tải được') } finally { setLoad(false) }
  }
  useEffect(() => { load() }, [search, typeF])
  useEffect(() => {
    supplierAPI.getAll({}).then(r => setSuppliers((r.data.data??[]).map(s=>({value:s.id,label:s.name})))).catch(()=>{})
  }, [])

  const openCreate = () => { setEdit(null); form.resetFields(); setOpen(true) }
  const openEdit = (row) => { setEdit(row); form.setFieldsValue(row); setOpen(true) }

  const onFinish = async (values) => {
    try {
      if (editing) await productAPI.update(editing.id, values)
      else await productAPI.create(values)
      message.success('Lưu thành công'); setOpen(false); load()
    } catch (e) { message.error(e.response?.data?.message ?? 'Lỗi') }
  }

  const lowStock = data.filter(d => d.stockQty != null && d.stockQty <= (d.minStock ?? 10)).length
  const totalValue = data.reduce((s,d) => s + (d.buyPrice??0)*(d.stockQty??0), 0)

  const cols = [
    { title:'Mã', dataIndex:'code', width:80, render:v=><span style={{color:'#888',fontSize:11}}>{v}</span> },
    { title:'Tên dịch vụ', dataIndex:'name', render:(v,r)=><>
      <strong style={{cursor:'pointer'}} onClick={()=>openEdit(r)}>{v}</strong>
      {r.stockQty <= (r.minStock??10) && <WarningOutlined style={{color:'#fa8c16',marginLeft:6}} title="Sắp hết hàng" />}
    </> },
    { title:'Loại', dataIndex:'type', render:v=><Tag color={TYPE_COLOR[v]}>{TYPE_LABEL[v]}</Tag>,
      filters:Object.entries(TYPE_LABEL).map(([k,v])=>({text:v,value:k})), onFilter:(val,r)=>r.type===val },
    { title:'NCC', dataIndex:'supplierName' },
    { title:'Giá nhập', dataIndex:'buyPrice', render:v=><span>{fmt(v)} ₫</span> },
    { title:'Giá bán', dataIndex:'sellPrice', render:v=><strong>{fmt(v)} ₫</strong> },
    { title:'Tồn kho', dataIndex:'stockQty', align:'center',
      render:(v,r)=><Tag color={v<=0?'red':v<=(r.minStock??10)?'orange':'green'}>{v}</Tag>,
      sorter:(a,b)=>a.stockQty-b.stockQty },
    { title:'Trạng thái', dataIndex:'status', render:v=><Tag color={v==='ACTIVE'?'green':v==='OUT_OF_STOCK'?'red':'default'}>{v==='ACTIVE'?'Còn hàng':v==='OUT_OF_STOCK'?'Hết hàng':'Ngừng'}</Tag> },
    { title:'', key:'act', width:90, render:(_,row)=>(
      <Space size={4}>
        <Button size="small" icon={<EditOutlined />} onClick={()=>openEdit(row)} />
        <Popconfirm title="Xác nhận xóa?" onConfirm={()=>productAPI.delete(row.id).then(load)}>
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>
    )},
  ]

  return (
    <>
      <Typography.Title level={4}>Quản lý kho dịch vụ</Typography.Title>
      <Row gutter={[12,12]} style={{marginBottom:16}}>
        <Col xs={12} sm={6}><Card><Statistic title="Tổng sản phẩm" value={data.length} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="Giá trị kho" value={new Intl.NumberFormat('vi-VN').format(totalValue)+' ₫'} valueStyle={{fontSize:16}} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="Sắp hết hàng" value={lowStock} valueStyle={{color:lowStock>0?'#fa8c16':'#1D9E75'}} /></Card></Col>
      </Row>
      <div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap'}}>
        <Input.Search placeholder="Tìm sản phẩm..." style={{width:240}} onSearch={setSrc} allowClear />
        <Select placeholder="Lọc loại" allowClear style={{width:150}} onChange={setType}
          options={Object.entries(TYPE_LABEL).map(([k,v])=>({value:k,label:v}))} />
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{background:'#1D9E75'}}>Thêm dịch vụ</Button>
        <Button onClick={()=>message.info('Báo cáo tháng đang phát triển')}>⬇ Báo cáo tháng</Button>
      </div>
      <Table columns={cols} dataSource={data} rowKey="id" loading={loading} size="small"
        pagination={{pageSize:10, showTotal:t=>`Tổng ${t} sản phẩm`}} />

      <Modal title={editing?'Chỉnh sửa dịch vụ':'Thêm dịch vụ mới'} open={open} width={580}
        onCancel={()=>setOpen(false)} onOk={()=>form.submit()} okText="Lưu">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="name" label="Tên dịch vụ" rules={[{required:true}]}><Input /></Form.Item>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Form.Item name="type" label="Loại" rules={[{required:true}]}>
              <Select options={Object.entries(TYPE_LABEL).map(([k,v])=>({value:k,label:v}))} />
            </Form.Item>
            <Form.Item name="supplierId" label="Nhà cung cấp">
              <Select options={suppliers} allowClear />
            </Form.Item>
            <Form.Item name="unit" label="Đơn vị tính"><Input placeholder="Vé, Đêm, Suất..." /></Form.Item>
            <Form.Item name="stockQty" label="Số lượng nhập"><InputNumber style={{width:'100%'}} min={0} /></Form.Item>
            <Form.Item name="minStock" label="Ngưỡng cảnh báo tồn kho" initialValue={10}><InputNumber style={{width:'100%'}} min={0} /></Form.Item>
            <Form.Item name="buyPrice" label="Giá nhập (₫)" rules={[{required:true}]}>
              <InputNumber style={{width:'100%'}} min={0} step={10000} formatter={v=>`${v}`.replace(/\B(?=(\d{3})+(?!\d))/g,',')} />
            </Form.Item>
            <Form.Item name="sellPrice" label="Giá bán (₫)" rules={[{required:true}]}>
              <InputNumber style={{width:'100%'}} min={0} step={10000} formatter={v=>`${v}`.replace(/\B(?=(\d{3})+(?!\d))/g,',')} />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </>
  )
}
