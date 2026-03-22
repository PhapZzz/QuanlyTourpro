import React, { useEffect, useState } from 'react'
import { Table, Button, Space, Tag, Modal, Form, Select, DatePicker, Input, message, Typography, Badge } from 'antd'
import { PlusOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { leaveAPI } from '../../services/api'

const TYPE_LABEL = { ANNUAL:'Nghỉ phép năm', SICK:'Nghỉ ốm', MATERNITY:'Thai sản', PATERNITY:'Nghỉ con', RESIGNATION:'Nghỉ việc', OTHER:'Khác' }
const TYPE_COLOR = { ANNUAL:'blue', SICK:'red', MATERNITY:'pink', PATERNITY:'cyan', RESIGNATION:'orange', OTHER:'default' }
const STATUS_COLOR = { PENDING:'warning', APPROVED:'success', REJECTED:'error' }
const STATUS_LABEL = { PENDING:'Chờ duyệt', APPROVED:'Đã duyệt', REJECTED:'Từ chối' }

export default function HRLeave() {
  const [data, setData]     = useState([])
  const [loading, setLoad]  = useState(false)
  const [open, setOpen]     = useState(false)
  const [rejectOpen, setRej]= useState(false)
  const [selected, setSel]  = useState(null)
  const [form]              = Form.useForm()
  const [rejForm]           = Form.useForm()

  const load = async () => {
    setLoad(true)
    try { const r = await leaveAPI.getAll(); setData(r.data.data?.content ?? []) }
    catch { message.error('Không tải được') } finally { setLoad(false) }
  }
  useEffect(() => { load() }, [])

  const approve = async (id) => {
    try { await leaveAPI.approve(id, { status:'APPROVED' }); message.success('Đã duyệt'); load() }
    catch { message.error('Lỗi') }
  }
  const openReject = (row) => { setSel(row); rejForm.resetFields(); setRej(true) }
  const doReject = async (values) => {
    try { await leaveAPI.approve(selected.id, { status:'REJECTED', comment: values.reason }); message.success('Đã từ chối'); setRej(false); load() }
    catch { message.error('Lỗi') }
  }

  const onSubmit = async (values) => {
    try {
      await leaveAPI.submit(1, { ...values, fromDate: values.fromDate.format('YYYY-MM-DD'), toDate: values.toDate.format('YYYY-MM-DD') })
      message.success('Nộp đơn thành công'); setOpen(false); load()
    } catch { message.error('Lỗi') }
  }

  const pending = data.filter(d=>d.status==='PENDING').length

  const cols = [
    { title:'Nhân viên', render:(_,r)=><div><strong>{r.employeeName}</strong><br/><span style={{color:'#888',fontSize:11}}>{r.employeeCode}</span></div> },
    { title:'Loại nghỉ', dataIndex:'type', render:v=><Tag color={TYPE_COLOR[v]}>{TYPE_LABEL[v]}</Tag>,
      filters:Object.entries(TYPE_LABEL).map(([k,v])=>({text:v,value:k})), onFilter:(val,r)=>r.type===val },
    { title:'Từ ngày', dataIndex:'fromDate' },
    { title:'Đến ngày', dataIndex:'toDate' },
    { title:'Số ngày', dataIndex:'days', align:'center' },
    { title:'Lý do', dataIndex:'reason', ellipsis:true },
    { title:'Trạng thái', dataIndex:'status',
      render:v=><Badge status={STATUS_COLOR[v]} text={STATUS_LABEL[v]} />,
      filters:Object.entries(STATUS_LABEL).map(([k,v])=>({text:v,value:k})), onFilter:(val,r)=>r.status===val },
    { title:'', key:'act', width:120, render:(_,row)=> row.status==='PENDING' && (
      <Space size={4}>
        <Button size="small" type="primary" ghost icon={<CheckOutlined />} style={{color:'#1D9E75',borderColor:'#1D9E75'}} onClick={()=>approve(row.id)}>Duyệt</Button>
        <Button size="small" danger icon={<CloseOutlined />} onClick={()=>openReject(row)}>Từ chối</Button>
      </Space>
    )},
  ]

  return (
    <>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}>
        <Typography.Title level={4} style={{margin:0}}>
          Đơn xin nghỉ &nbsp;<Badge count={pending} style={{background:'#fa8c16'}} />
        </Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={()=>{form.resetFields();setOpen(true)}} style={{background:'#1D9E75'}}>Nộp đơn nghỉ</Button>
      </div>

      <Table columns={cols} dataSource={data} rowKey="id" loading={loading} size="small"
        pagination={{pageSize:10, showTotal:t=>`Tổng ${t} đơn`}} />

      <Modal title="Nộp đơn xin nghỉ" open={open} onCancel={()=>setOpen(false)} onOk={()=>form.submit()} okText="Nộp đơn">
        <Form form={form} layout="vertical" onFinish={onSubmit}>
          <Form.Item name="type" label="Loại nghỉ" rules={[{required:true}]}>
            <Select options={Object.entries(TYPE_LABEL).map(([k,v])=>({value:k,label:v}))} />
          </Form.Item>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Form.Item name="fromDate" label="Từ ngày" rules={[{required:true}]}><DatePicker style={{width:'100%'}} format="DD/MM/YYYY" /></Form.Item>
            <Form.Item name="toDate"   label="Đến ngày" rules={[{required:true}]}><DatePicker style={{width:'100%'}} format="DD/MM/YYYY" /></Form.Item>
          </div>
          <Form.Item name="reason" label="Lý do"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>

      <Modal title="Lý do từ chối" open={rejectOpen} onCancel={()=>setRej(false)} onOk={()=>rejForm.submit()} okText="Từ chối" okButtonProps={{danger:true}}>
        <Form form={rejForm} layout="vertical" onFinish={doReject}>
          <Form.Item name="reason" label="Lý do từ chối" rules={[{required:true}]}><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>
    </>
  )
}
