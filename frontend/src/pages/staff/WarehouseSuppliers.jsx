// WarehouseSuppliers.jsx
import React, { useEffect, useState } from 'react'
import { Table, Button, Space, Tag, Modal, Form, Input, Select, message, Typography, Popconfirm } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { supplierAPI } from '../../services/api'
const TYPE_LABEL = { HOTEL:'Khách sạn', TRANSPORT:'Vận chuyển', FOOD:'Ăn uống', ENTERTAINMENT:'Vui chơi', OTHER:'Khác' }
const TYPE_COLOR = { HOTEL:'blue', TRANSPORT:'orange', FOOD:'green', ENTERTAINMENT:'purple', OTHER:'default' }
export default function WarehouseSuppliers() {
  const [data,setData]=useState([]); const [loading,setLoad]=useState(false); const [open,setOpen]=useState(false); const [editing,setEdit]=useState(null); const [form]=Form.useForm()
  const load=async()=>{setLoad(true);try{const r=await supplierAPI.getAll({});setData(r.data.data??[])}catch{message.error('Lỗi')}finally{setLoad(false)}}
  useEffect(()=>{load()},[])
  const openCreate=()=>{setEdit(null);form.resetFields();setOpen(true)}
  const openEdit=(row)=>{setEdit(row);form.setFieldsValue(row);setOpen(true)}
  const onFinish=async(values)=>{try{if(editing)await supplierAPI.update(editing.id,values);else await supplierAPI.create(values);message.success('Lưu thành công');setOpen(false);load()}catch(e){message.error(e.response?.data?.message??'Lỗi')}}
  const cols=[
    {title:'Mã',dataIndex:'code',width:80,render:v=><span style={{color:'#888',fontSize:11}}>{v}</span>},
    {title:'Tên NCC',dataIndex:'name',render:(v,r)=><strong style={{cursor:'pointer'}} onClick={()=>openEdit(r)}>{v}</strong>},
    {title:'Loại',dataIndex:'type',render:v=><Tag color={TYPE_COLOR[v]}>{TYPE_LABEL[v]}</Tag>},
    {title:'SĐT',dataIndex:'phone'},{title:'Email',dataIndex:'email'},{title:'Người LH',dataIndex:'contactPerson'},
    {title:'Trạng thái',dataIndex:'status',render:v=><Tag color={v==='ACTIVE'?'green':'default'}>{v==='ACTIVE'?'Hoạt động':'Ngừng'}</Tag>},
    {title:'',key:'act',width:90,render:(_,row)=><Space size={4}>
      <Button size="small" icon={<EditOutlined />} onClick={()=>openEdit(row)} />
      <Popconfirm title="Vô hiệu hóa?" onConfirm={()=>supplierAPI.update(row.id,{status:'INACTIVE'}).then(load)}><Button size="small" danger icon={<DeleteOutlined />} /></Popconfirm>
    </Space>},
  ]
  return(<>
    <div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}>
      <Typography.Title level={4} style={{margin:0}}>Nhà cung cấp</Typography.Title>
      <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{background:'#1D9E75'}}>Thêm NCC</Button>
    </div>
    <Table columns={cols} dataSource={data} rowKey="id" loading={loading} size="small" pagination={{pageSize:10}} />
    <Modal title={editing?'Chỉnh sửa NCC':'Thêm nhà cung cấp'} open={open} onCancel={()=>setOpen(false)} onOk={()=>form.submit()} okText="Lưu">
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="name" label="Tên nhà cung cấp" rules={[{required:true}]}><Input /></Form.Item>
        <Form.Item name="type" label="Loại dịch vụ" rules={[{required:true}]}><Select options={Object.entries(TYPE_LABEL).map(([k,v])=>({value:k,label:v}))} /></Form.Item>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <Form.Item name="phone" label="SĐT"><Input /></Form.Item>
          <Form.Item name="email" label="Email"><Input /></Form.Item>
          <Form.Item name="taxCode" label="MST"><Input /></Form.Item>
          <Form.Item name="contactPerson" label="Người LH"><Input /></Form.Item>
        </div>
        <Form.Item name="address" label="Địa chỉ"><Input /></Form.Item>
      </Form>
    </Modal>
  </>)
}
