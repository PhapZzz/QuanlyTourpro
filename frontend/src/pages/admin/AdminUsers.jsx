import React, { useEffect, useState } from 'react'
import { Table, Button, Space, Tag, Modal, Form, Input, Select, message, Typography, Popconfirm, Badge } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons'
import { userAPI } from '../../services/api'

const ROLE_LABELS = { ADMIN:'Admin', HR_MANAGER:'Quản lý nhân sự', WAREHOUSE_MANAGER:'Quản lý kho', SALES_MANAGER:'Kinh doanh', EMPLOYEE:'Nhân viên', CUSTOMER:'Khách hàng' }
const ROLE_COLORS = { ADMIN:'purple', HR_MANAGER:'green', WAREHOUSE_MANAGER:'gold', SALES_MANAGER:'blue', EMPLOYEE:'default', CUSTOMER:'cyan' }

export default function AdminUsers() {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen]       = useState(false)
  const [editing, setEditing] = useState(null)
  const [form]                = Form.useForm()

  const load = async () => {
    setLoading(true)
    try { const r = await userAPI.getAll(); setData(r.data.data?.content ?? []) }
    catch { message.error('Không tải được danh sách user') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); form.resetFields(); setOpen(true) }
  const openEdit = (row) => {
    setEditing(row)
    form.setFieldsValue({ fullName: row.fullName, email: row.email, role: row.role, status: row.status })
    setOpen(true)
  }

  const onFinish = async (values) => {
    try {
      if (editing) await userAPI.update(editing.id, values)
      else await userAPI.create(values)
      message.success(editing ? 'Cập nhật thành công' : 'Tạo tài khoản thành công')
      setOpen(false); load()
    } catch (e) { message.error(e.response?.data?.message ?? 'Lỗi') }
  }

  const toggleLock = async (row) => {
    try {
      await userAPI.update(row.id, { status: row.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE' })
      message.success(row.status === 'ACTIVE' ? 'Đã khóa' : 'Đã mở khóa'); load()
    } catch { message.error('Lỗi') }
  }

  const cols = [
    { title:'Tên đăng nhập', dataIndex:'username', render: v => <strong>{v}</strong> },
    { title:'Họ tên',        dataIndex:'fullName' },
    { title:'Email',         dataIndex:'email' },
    { title:'Phân quyền', dataIndex:'role', render: v => <Tag color={ROLE_COLORS[v]}>{ROLE_LABELS[v]}</Tag>,
      filters: Object.entries(ROLE_LABELS).map(([k,v])=>({text:v,value:k})), onFilter:(val,r)=>r.role===val },
    { title:'Trạng thái', dataIndex:'status',
      render: v => <Badge status={v==='ACTIVE'?'success':'error'} text={v==='ACTIVE'?'Hoạt động':'Bị khóa'} /> },
    { title:'Đăng nhập cuối', dataIndex:'lastLoginAt', render: v => v ? new Date(v).toLocaleString('vi-VN') : '—' },
    { title:'', key:'act', width:130, render:(_,row) => (
      <Space size={4}>
        <Button size="small" icon={<EditOutlined />} onClick={()=>openEdit(row)} />
        <Button size="small" icon={row.status==='ACTIVE'?<LockOutlined />:<UnlockOutlined />} onClick={()=>toggleLock(row)} />
        <Popconfirm title="Xác nhận xóa?" onConfirm={()=>userAPI.delete(row.id).then(load)}>
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>
    )},
  ]

  return (
    <>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}>
        <Typography.Title level={4} style={{margin:0}}>Quản lý tài khoản & phân quyền</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{background:'#1D9E75'}}>Thêm user</Button>
      </div>
      <Table columns={cols} dataSource={data} rowKey="id" loading={loading} size="small"
        pagination={{pageSize:10, showTotal:t=>`Tổng ${t} tài khoản`}} />
      <Modal title={editing?'Chỉnh sửa tài khoản':'Tạo tài khoản mới'} open={open} onCancel={()=>setOpen(false)} onOk={()=>form.submit()} okText="Lưu">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          {!editing && <>
            <Form.Item name="username" label="Tên đăng nhập" rules={[{required:true}]}><Input /></Form.Item>
            <Form.Item name="password" label="Mật khẩu" rules={[{required:true,min:6}]}><Input.Password /></Form.Item>
          </>}
          <Form.Item name="fullName" label="Họ tên" rules={[{required:true}]}><Input /></Form.Item>
          <Form.Item name="email" label="Email" rules={[{type:'email'}]}><Input /></Form.Item>
          <Form.Item name="role" label="Phân quyền" rules={[{required:true}]}>
            <Select options={Object.entries(ROLE_LABELS).map(([k,v])=>({value:k,label:v}))} />
          </Form.Item>
          {editing && <Form.Item name="status" label="Trạng thái">
            <Select options={[{value:'ACTIVE',label:'Hoạt động'},{value:'LOCKED',label:'Bị khóa'}]} />
          </Form.Item>}
        </Form>
      </Modal>
    </>
  )
}
