import React, { useEffect, useState } from 'react'
import { Table, Button, Tag, Modal, Form, Select, DatePicker, InputNumber, message, Typography, Space, Descriptions } from 'antd'
import { PlusOutlined, EyeOutlined } from '@ant-design/icons'
import { supplierAPI, productAPI } from '../../services/api'
import dayjs from 'dayjs'

const fmt = v => v ? new Intl.NumberFormat('vi-VN').format(v)+' ₫' : '—'

export default function ImportVouchers() {
  const [suppliers, setSuppliers] = useState([])
  const [products,  setProducts]  = useState([])
  const [vouchers,  setVouchers]  = useState([
    { id:1, code:'PN-2026-031', date:'2026-03-15', supplierName:'Vietnam Airlines', total:47500000, status:'APPROVED', createdBy:'Lê Văn Kho' },
    { id:2, code:'PN-2026-030', date:'2026-03-14', supplierName:'Khách sạn Mường Thanh', total:36000000, status:'APPROVED', createdBy:'Lê Văn Kho' },
    { id:3, code:'PN-2026-029', date:'2026-03-10', supplierName:'Nhà hàng Biển Xanh', total:16000000, status:'PENDING', createdBy:'Lê Văn Kho' },
  ])
  const [open, setOpen]   = useState(false)
  const [detail, setDet]  = useState(null)
  const [items, setItems] = useState([{ productId:null, qty:1, unitPrice:0 }])
  const [form]            = Form.useForm()

  useEffect(() => {
    supplierAPI.getAll({}).then(r=>setSuppliers((r.data.data??[]).map(s=>({value:s.id,label:s.name})))).catch(()=>{})
    productAPI.getAll({size:100}).then(r=>setProducts((r.data.data?.content??[]).map(p=>({value:p.id,label:p.name,price:p.buyPrice})))).catch(()=>{})
  }, [])

  const addItem  = () => setItems([...items, { productId:null, qty:1, unitPrice:0 }])
  const removeItem = (i) => setItems(items.filter((_,idx)=>idx!==i))
  const updateItem = (i, key, val) => {
    const next = [...items]; next[i] = { ...next[i], [key]: val }
    if (key==='productId') {
      const p = products.find(p=>p.value===val)
      if (p) next[i].unitPrice = p.price
    }
    setItems(next)
  }
  const total = items.reduce((s,i)=>s+(i.qty??0)*(i.unitPrice??0), 0)

  const onFinish = async (values) => {
    try {
      const code = `PN-${new Date().getFullYear()}-${String(vouchers.length+1).padStart(3,'0')}`
      setVouchers([{ id: Date.now(), code, date: values.date?.format('YYYY-MM-DD'), supplierName: suppliers.find(s=>s.value===values.supplierId)?.label, total, status:'PENDING', createdBy:'Bạn' }, ...vouchers])
      message.success('Lập phiếu nhập thành công'); setOpen(false); form.resetFields(); setItems([{productId:null,qty:1,unitPrice:0}])
    } catch { message.error('Lỗi') }
  }

  const cols = [
    { title:'Số phiếu', dataIndex:'code', render:v=><strong>{v}</strong> },
    { title:'Ngày nhập', dataIndex:'date' },
    { title:'Nhà cung cấp', dataIndex:'supplierName' },
    { title:'Tổng giá trị', dataIndex:'total', render:v=><strong style={{color:'#1D9E75'}}>{fmt(v)}</strong> },
    { title:'Người lập', dataIndex:'createdBy' },
    { title:'Trạng thái', dataIndex:'status', render:v=><Tag color={v==='APPROVED'?'green':v==='REJECTED'?'red':'orange'}>{v==='APPROVED'?'Đã duyệt':v==='REJECTED'?'Từ chối':'Chờ duyệt'}</Tag> },
    { title:'', key:'act', width:60, render:(_,row)=><Button size="small" icon={<EyeOutlined />} onClick={()=>setDet(row)}>Xem</Button> },
  ]

  return (
    <>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}>
        <Typography.Title level={4} style={{margin:0}}>Phiếu nhập hàng</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={()=>{form.resetFields();setItems([{productId:null,qty:1,unitPrice:0}]);setOpen(true)}} style={{background:'#1D9E75'}}>Lập phiếu nhập</Button>
      </div>
      <Table columns={cols} dataSource={vouchers} rowKey="id" size="small" pagination={{pageSize:10}} />

      <Modal title="Lập phiếu nhập hàng" open={open} width={680} onCancel={()=>setOpen(false)} onOk={()=>form.submit()} okText="Lưu phiếu">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Form.Item name="supplierId" label="Nhà cung cấp" rules={[{required:true}]}><Select options={suppliers} /></Form.Item>
            <Form.Item name="date" label="Ngày nhập" rules={[{required:true}]} initialValue={dayjs()}><DatePicker style={{width:'100%'}} format="DD/MM/YYYY" /></Form.Item>
          </div>
          <div style={{border:'1px solid #f0f0f0',borderRadius:8,padding:12,marginBottom:12}}>
            <div style={{fontWeight:500,marginBottom:8}}>Chi tiết hàng nhập</div>
            {items.map((item,i)=>(
              <div key={i} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr auto',gap:8,marginBottom:8,alignItems:'center'}}>
                <Select placeholder="Chọn sản phẩm" options={products} value={item.productId} onChange={v=>updateItem(i,'productId',v)} />
                <InputNumber placeholder="Số lượng" min={1} value={item.qty} onChange={v=>updateItem(i,'qty',v)} style={{width:'100%'}} />
                <InputNumber placeholder="Đơn giá" min={0} value={item.unitPrice} onChange={v=>updateItem(i,'unitPrice',v)} style={{width:'100%'}} formatter={v=>`${v}`.replace(/\B(?=(\d{3})+(?!\d))/g,',')} />
                <Button danger size="small" onClick={()=>removeItem(i)}>✕</Button>
              </div>
            ))}
            <Button size="small" onClick={addItem} style={{marginTop:4}}>+ Thêm dòng</Button>
          </div>
          <div style={{textAlign:'right',fontWeight:500,fontSize:15}}>Tổng cộng: <span style={{color:'#1D9E75'}}>{new Intl.NumberFormat('vi-VN').format(total)} ₫</span></div>
          <Form.Item name="note" label="Ghi chú" style={{marginTop:8}}><Form.Item name="note"><input style={{width:'100%',padding:'7px 11px',borderRadius:6,border:'1px solid #d9d9d9'}} placeholder="Ghi chú..." /></Form.Item></Form.Item>
        </Form>
      </Modal>

      <Modal title={`Phiếu nhập – ${detail?.code}`} open={!!detail} onCancel={()=>setDet(null)} footer={null}>
        {detail && <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="Số phiếu">{detail.code}</Descriptions.Item>
          <Descriptions.Item label="Ngày nhập">{detail.date}</Descriptions.Item>
          <Descriptions.Item label="Nhà cung cấp" span={2}>{detail.supplierName}</Descriptions.Item>
          <Descriptions.Item label="Tổng giá trị" span={2}><strong style={{color:'#1D9E75'}}>{fmt(detail.total)}</strong></Descriptions.Item>
          <Descriptions.Item label="Người lập">{detail.createdBy}</Descriptions.Item>
          <Descriptions.Item label="Trạng thái"><Tag color={detail.status==='APPROVED'?'green':'orange'}>{detail.status==='APPROVED'?'Đã duyệt':'Chờ duyệt'}</Tag></Descriptions.Item>
        </Descriptions>}
      </Modal>
    </>
  )
}
