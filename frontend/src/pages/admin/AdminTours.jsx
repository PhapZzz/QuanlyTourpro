import React, { useEffect, useState } from 'react'
import {
  Table, Button, Space, Tag, Modal, Form, Input, Select,
  InputNumber, message, Typography, Popconfirm, Rate,
  Tabs, Descriptions, Divider, Card, Statistic, Row, Col, Tooltip
} from 'antd'
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  CalendarOutlined, AppstoreOutlined, DollarOutlined
} from '@ant-design/icons'
import { tourAPI, productAPI } from '../../services/api'
import dayjs from 'dayjs'

const TYPE_LABEL  = { DOMESTIC:'Trong nước', INTERNATIONAL:'Quốc tế', MICE:'MICE' }
const TYPE_COLOR  = { DOMESTIC:'green', INTERNATIONAL:'purple', MICE:'blue' }
const STATUS_COLOR = { ACTIVE:'success', INACTIVE:'default', FULL:'warning' }
const STATUS_LABEL = { ACTIVE:'Đang bán', INACTIVE:'Tạm dừng', FULL:'Đầy chỗ' }
const PRODUCT_TYPE_LABEL = {
  HOTEL:'Khách sạn', FLIGHT:'Vé máy bay', FOOD:'Ăn uống',
  VEHICLE:'Xe du lịch', ACTIVITY:'Vui chơi', OTHER:'Khác'
}
const PRODUCT_TYPE_COLOR = {
  HOTEL:'blue', FLIGHT:'purple', FOOD:'green',
  VEHICLE:'orange', ACTIVITY:'cyan', OTHER:'default'
}
const fmt = v => v ? new Intl.NumberFormat('vi-VN').format(v) + ' ₫' : '—'

export default function AdminTours() {
  const [tours, setTours]       = useState([])
  const [loading, setLoading]   = useState(false)
  const [products, setProducts] = useState([])   // danh sách dịch vụ để thêm vào tour

  // modals
  const [tourModal, setTourModal]     = useState(false)
  const [detailModal, setDetailModal] = useState(false)
  const [svcModal, setSvcModal]       = useState(false)
  const [schedModal, setSchedModal]   = useState(false)

  const [editing, setEditing] = useState(null)   // tour đang sửa
  const [selected, setSel]    = useState(null)   // tour đang xem chi tiết

  const [search, setSrc]  = useState('')
  const [typeF, setTypeF] = useState('')

  const [tourForm]  = Form.useForm()
  const [svcForm]   = Form.useForm()
  const [scForm]    = Form.useForm()

  // Load tours
  const loadTours = async () => {
    setLoading(true)
    try {
      const r = await tourAPI.getAll({ search, type: typeF, size: 50 })
      setTours(r.data.data?.content ?? [])
    } catch { message.error('Không tải được danh sách tour') }
    finally { setLoading(false) }
  }
  useEffect(() => { loadTours() }, [search, typeF])

  // Load products khi mở modal thêm dịch vụ
  const loadProducts = async () => {
    try {
      const r = await productAPI.getAll({ size: 100 })
      setProducts(r.data.data?.content ?? [])
    } catch {}
  }
  useEffect(() => { loadProducts() }, [])

  // Mở detail và refresh tour data
  const openDetail = async (tour) => {
    try {
      const r = await tourAPI.getById(tour.id)
      setSel(r.data.data)
    } catch { setSel(tour) }
    setDetailModal(true)
  }

  // Tạo / Sửa tour
  const onTourFinish = async (values) => {
    try {
      if (editing) await tourAPI.update(editing.id, values)
      else await tourAPI.create(values)
      message.success(editing ? 'Cập nhật thành công' : 'Thêm tour thành công')
      setTourModal(false); loadTours()
    } catch (e) { message.error(e.response?.data?.message ?? 'Lỗi') }
  }

  // Thêm dịch vụ vào tour
  const onAddService = async (values) => {
    try {
      const r = await tourAPI.addService(selected.id, values)
      message.success('Đã thêm dịch vụ vào tour')
      setSel(r.data.data); setSvcModal(false)
    } catch (e) { message.error(e.response?.data?.message ?? 'Lỗi') }
  }

  // Xóa dịch vụ khỏi tour
  const onRemoveService = async (productId) => {
    try {
      const r = await tourAPI.removeService(selected.id, productId)
      message.success('Đã xóa dịch vụ'); setSel(r.data.data)
    } catch (e) { message.error(e.response?.data?.message ?? 'Lỗi') }
  }

  // Tính lại giá tour
  const onRecalcPrice = async () => {
    try {
      const r = await tourAPI.recalculatePrice(selected.id, 30)
      message.success(`Đã tính lại giá: ${fmt(r.data.data?.priceAdult)} (margin 30%)`)
      setSel(r.data.data); loadTours()
    } catch { message.error('Lỗi') }
  }

  // Thêm lịch khởi hành
  const onAddSchedule = async (values) => {
    try {
      const r = await tourAPI.addSchedule(selected.id, {
        ...values, departureDate: values.departureDate?.format('YYYY-MM-DD')
      })
      message.success('Đã thêm lịch khởi hành')
      setSel(r.data.data); setSchedModal(false)
    } catch { message.error('Lỗi') }
  }

  // ── Columns ──────────────────────────────────────────────
  const cols = [
    { title:'Mã', dataIndex:'code', width:70,
      render: v => <span style={{color:'#888',fontSize:11}}>{v}</span> },
    { title:'Tên tour', dataIndex:'name',
      render: (v, r) => (
        <span style={{fontWeight:500,cursor:'pointer',color:'#1D9E75'}}
          onClick={() => openDetail(r)}>{v}</span>
      )},
    { title:'Điểm đến', dataIndex:'destination' },
    { title:'Loại', dataIndex:'type',
      render: v => <Tag color={TYPE_COLOR[v]}>{TYPE_LABEL[v]}</Tag> },
    { title:'Thời gian', render:(_,r) => `${r.days}N${r.nights}Đ` },
    { title:'Dịch vụ', dataIndex:'services',
      render: v => <Tag color="blue">{(v ?? []).length} dịch vụ</Tag>,
      align: 'center' },
    { title:'Chi phí ước tính', dataIndex:'estimatedCost',
      render: v => <span style={{color:'#854F0B'}}>{fmt(v)}</span> },
    { title:'Giá bán/người', dataIndex:'priceAdult',
      render: v => <strong style={{color:'#1D9E75'}}>{fmt(v)}</strong> },
    { title:'Đánh giá', dataIndex:'avgRating',
      render: v => v ? <><Rate disabled value={Math.round(v)} style={{fontSize:11}}/>
        <span style={{fontSize:11,marginLeft:4}}>{Number(v).toFixed(1)}</span></> : '—' },
    { title:'Trạng thái', dataIndex:'status',
      render: v => <Tag color={STATUS_COLOR[v]}>{STATUS_LABEL[v]}</Tag> },
    { title:'', key:'act', width:100,
      render: (_, row) => (
        <Space size={4}>
          <Tooltip title="Xem & quản lý dịch vụ">
            <Button size="small" icon={<AppstoreOutlined />} onClick={() => openDetail(row)} />
          </Tooltip>
          <Tooltip title="Sửa thông tin tour">
            <Button size="small" icon={<EditOutlined />} onClick={() => {
              setEditing(row)
              tourForm.setFieldsValue({ ...row, type: row.type, status: row.status })
              setTourModal(true)
            }} />
          </Tooltip>
          <Tooltip title="Thêm lịch khởi hành">
            <Button size="small" icon={<CalendarOutlined />} onClick={() => {
              openDetail(row).then(() => setSchedModal(true))
            }} />
          </Tooltip>
        </Space>
      )},
  ]

  // ── Service columns (inside detail modal) ────────────────
  const svcCols = [
    { title:'Thứ tự', dataIndex:'sortOrder', width:60, align:'center' },
    { title:'Dịch vụ', render:(_,r) => (
      <div>
        <strong>{r.productName}</strong>
        <br /><span style={{fontSize:11,color:'#888'}}>{r.productCode}</span>
      </div>
    )},
    { title:'Loại', dataIndex:'productType',
      render: v => <Tag color={PRODUCT_TYPE_COLOR[v]}>{PRODUCT_TYPE_LABEL[v]}</Tag> },
    { title:'Nhà CC', dataIndex:'supplierName' },
    { title:'Số lượng', dataIndex:'quantity', align:'center' },
    { title:'Giá nhập', dataIndex:'buyPrice', render: v => fmt(v) },
    { title:'Tổng chi phí', dataIndex:'subtotalCost',
      render: v => <strong style={{color:'#854F0B'}}>{fmt(v)}</strong> },
    { title:'Ghi chú', dataIndex:'note', ellipsis:true },
    { title:'', key:'act', width:60,
      render: (_, row) => (
        <Popconfirm title="Xóa dịch vụ này khỏi tour?"
          onConfirm={() => onRemoveService(row.productId)}>
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      )},
  ]

  const scheduleCols = [
    { title:'Ngày khởi hành', dataIndex:'departureDate' },
    { title:'Sức chứa', dataIndex:'capacity', align:'center' },
    { title:'Đã đặt', dataIndex:'booked', align:'center' },
    { title:'Còn lại', dataIndex:'available',
      render: v => <Tag color={v===0?'red':v<5?'orange':'green'}>{v}</Tag>,
      align:'center' },
    { title:'Trạng thái', dataIndex:'status',
      render: v => <Tag color={v==='OPEN'?'green':v==='FULL'?'red':'default'}>{v}</Tag> },
  ]

  // ── Render ────────────────────────────────────────────────
  return (
    <>
      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',
                   marginBottom:16,gap:8,flexWrap:'wrap'}}>
        <Typography.Title level={4} style={{margin:0}}>Quản lý Tour</Typography.Title>
        <Space>
          <Input.Search placeholder="Tìm tour..." style={{width:220}}
            onSearch={setSrc} allowClear />
          <Select placeholder="Lọc loại" allowClear style={{width:140}}
            onChange={v => setTypeF(v ?? '')}
            options={Object.entries(TYPE_LABEL).map(([k,v])=>({value:k,label:v}))} />
          <Button type="primary" icon={<PlusOutlined />}
            style={{background:'#1D9E75'}}
            onClick={() => { setEditing(null); tourForm.resetFields(); setTourModal(true) }}>
            Thêm tour
          </Button>
        </Space>
      </div>

      <Table columns={cols} dataSource={tours} rowKey="id"
        loading={loading} size="small"
        pagination={{pageSize:10, showTotal:t=>`Tổng ${t} tour`}} />

      {/* ── Modal Tạo/Sửa tour ── */}
      <Modal title={editing ? 'Chỉnh sửa tour' : 'Thêm tour mới'}
        open={tourModal} width={720}
        onCancel={() => setTourModal(false)}
        onOk={() => tourForm.submit()} okText="Lưu">
        <Form form={tourForm} layout="vertical" onFinish={onTourFinish}>
          <Form.Item name="name" label="Tên tour" rules={[{required:true}]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="type" label="Loại tour" rules={[{required:true}]}>
                <Select options={Object.entries(TYPE_LABEL).map(([k,v])=>({value:k,label:v}))} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="origin" label="Điểm khởi hành">
                <Input placeholder="TP.HCM" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="destination" label="Điểm đến" rules={[{required:true}]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={6}>
              <Form.Item name="days" label="Số ngày" rules={[{required:true}]}>
                <InputNumber min={1} style={{width:'100%'}} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="nights" label="Số đêm">
                <InputNumber min={0} style={{width:'100%'}} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="capacity" label="Sức chứa" rules={[{required:true}]}>
                <InputNumber min={1} style={{width:'100%'}} />
              </Form.Item>
            </Col>
            <Col span={6}>
              {editing && <Form.Item name="status" label="Trạng thái">
                <Select options={Object.entries(STATUS_LABEL).map(([k,v])=>({value:k,label:v}))} />
              </Form.Item>}
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="priceAdult" label="Giá người lớn (₫)" rules={[{required:true}]}>
                <InputNumber style={{width:'100%'}} min={0} step={100000}
                  formatter={v=>`${v}`.replace(/\B(?=(\d{3})+(?!\d))/g,',')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="priceChild" label="Giá trẻ em (₫)">
                <InputNumber style={{width:'100%'}} min={0} step={100000}
                  formatter={v=>`${v}`.replace(/\B(?=(\d{3})+(?!\d))/g,',')} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="included" label="Dịch vụ bao gồm">
            <Input.TextArea rows={2} placeholder="Vé máy bay, KS 4 sao, 3 bữa/ngày..." />
          </Form.Item>
          <Form.Item name="description" label="Mô tả tour">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="itinerary" label="Lịch trình chi tiết">
            <Input.TextArea rows={4} placeholder="Ngày 1: ...&#10;Ngày 2: ..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Modal chi tiết tour + quản lý dịch vụ ── */}
      <Modal title={`Tour: ${selected?.name}`}
        open={detailModal} width={900}
        onCancel={() => setDetailModal(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModal(false)}>Đóng</Button>,
          <Button key="svc" type="primary" ghost
            style={{color:'#1D9E75',borderColor:'#1D9E75'}}
            icon={<PlusOutlined />}
            onClick={() => { svcForm.resetFields(); setSvcModal(true) }}>
            Thêm dịch vụ
          </Button>,
          <Button key="sched" icon={<CalendarOutlined />}
            onClick={() => { scForm.resetFields(); setSchedModal(true) }}>
            Thêm lịch khởi hành
          </Button>,
        ]}>
        {selected && (
          <Tabs items={[
            {
              key:'services', label:`Dịch vụ cấu thành (${(selected.services??[]).length})`,
              children: (
                <>
                  <Row gutter={12} style={{marginBottom:12}}>
                    <Col span={6}>
                      <Card size="small" style={{background:'#fff7e6'}}>
                        <Statistic title="Chi phí ước tính"
                          value={fmt(selected.estimatedCost)}
                          valueStyle={{fontSize:15,color:'#854F0B'}} />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card size="small" style={{background:'#f6ffed'}}>
                        <Statistic title="Giá bán/người"
                          value={fmt(selected.priceAdult)}
                          valueStyle={{fontSize:15,color:'#3B6D11'}} />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card size="small">
                        <Statistic title="Số dịch vụ"
                          value={(selected.services??[]).length} />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Button onClick={onRecalcPrice} icon={<DollarOutlined />}
                        style={{marginTop:8,width:'100%'}}>
                        Tính lại giá (margin 30%)
                      </Button>
                    </Col>
                  </Row>
                  <Table columns={svcCols}
                    dataSource={selected.services ?? []}
                    rowKey="tourServiceId" size="small" pagination={false}
                    summary={rows => {
                      const total = rows.reduce((s,r)=>s+(r.subtotalCost??0),0)
                      return (
                        <Table.Summary.Row>
                          <Table.Summary.Cell index={0} colSpan={6}>
                            <strong>Tổng chi phí dịch vụ</strong>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={6}>
                            <strong style={{color:'#854F0B'}}>{fmt(total)}</strong>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={7} colSpan={2} />
                        </Table.Summary.Row>
                      )
                    }} />
                </>
              ),
            },
            {
              key:'schedules',
              label:`Lịch khởi hành (${(selected.schedules??[]).length})`,
              children: (
                <Table columns={scheduleCols}
                  dataSource={selected.schedules ?? []}
                  rowKey="id" size="small" pagination={false} />
              ),
            },
            {
              key:'info', label:'Thông tin tour',
              children: (
                <Descriptions column={2} bordered size="small">
                  <Descriptions.Item label="Mã tour">{selected.code}</Descriptions.Item>
                  <Descriptions.Item label="Loại">
                    <Tag color={TYPE_COLOR[selected.type]}>{TYPE_LABEL[selected.type]}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Điểm khởi hành">{selected.origin}</Descriptions.Item>
                  <Descriptions.Item label="Điểm đến">{selected.destination}</Descriptions.Item>
                  <Descriptions.Item label="Thời gian">{selected.days}N{selected.nights}Đ</Descriptions.Item>
                  <Descriptions.Item label="Sức chứa">{selected.capacity} người</Descriptions.Item>
                  <Descriptions.Item label="Giá người lớn">
                    <strong style={{color:'#1D9E75'}}>{fmt(selected.priceAdult)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Giá trẻ em">{fmt(selected.priceChild)}</Descriptions.Item>
                  <Descriptions.Item label="Dịch vụ bao gồm" span={2}>{selected.included}</Descriptions.Item>
                  <Descriptions.Item label="Mô tả" span={2}>{selected.description}</Descriptions.Item>
                  <Descriptions.Item label="Lịch trình" span={2}>
                    <pre style={{whiteSpace:'pre-wrap',fontSize:12,margin:0}}>{selected.itinerary}</pre>
                  </Descriptions.Item>
                </Descriptions>
              ),
            },
          ]} />
        )}
      </Modal>

      {/* ── Modal thêm dịch vụ vào tour ── */}
      <Modal title={`Thêm dịch vụ vào tour: ${selected?.name}`}
        open={svcModal}
        onCancel={() => setSvcModal(false)}
        onOk={() => svcForm.submit()} okText="Thêm dịch vụ">
        <Form form={svcForm} layout="vertical" onFinish={onAddService}>
          <Form.Item name="productId" label="Chọn dịch vụ" rules={[{required:true}]}>
            <Select showSearch placeholder="Tìm dịch vụ..."
              filterOption={(i,o) => o.label.toLowerCase().includes(i.toLowerCase())}
              options={products
                .filter(p => !(selected?.services??[]).some(s => s.productId === p.id))
                .map(p => ({
                  value: p.id,
                  label: `[${PRODUCT_TYPE_LABEL[p.type]??p.type}] ${p.name} – ${fmt(p.buyPrice)}`
                }))} />
          </Form.Item>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="quantity" label="Số lượng" rules={[{required:true}]} initialValue={1}>
                <InputNumber min={1} style={{width:'100%'}} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="sortOrder" label="Thứ tự hiển thị"
                initialValue={(selected?.services??[]).length + 1}>
                <InputNumber min={1} style={{width:'100%'}} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="note" label="Ghi chú (tuỳ chọn)">
            <Input placeholder="vd: phòng đôi, bữa sáng, 2 đêm..." />
          </Form.Item>
          <div style={{background:'#f9f9f9',borderRadius:8,padding:12,fontSize:13,color:'#888'}}>
            <strong>Tip:</strong> Sau khi thêm đủ dịch vụ, dùng nút
            "Tính lại giá (margin 30%)" để hệ thống tự tính giá bán
            dựa trên tổng chi phí dịch vụ.
          </div>
        </Form>
      </Modal>

      {/* ── Modal thêm lịch khởi hành ── */}
      <Modal title={`Thêm lịch khởi hành – ${selected?.name}`}
        open={schedModal}
        onCancel={() => setSchedModal(false)}
        onOk={() => scForm.submit()} okText="Thêm lịch">
        <Form form={scForm} layout="vertical" onFinish={onAddSchedule}>
          <Form.Item name="departureDate" label="Ngày khởi hành" rules={[{required:true}]}>
            <input type="date" style={{width:'100%',padding:'7px 11px',
              borderRadius:6,border:'1px solid #d9d9d9',fontSize:14}}
              onChange={e => scForm.setFieldValue('departureDate', dayjs(e.target.value))} />
          </Form.Item>
          <Form.Item name="capacity" label="Số chỗ" rules={[{required:true}]}
            initialValue={selected?.capacity ?? 40}>
            <InputNumber min={1} max={selected?.capacity} style={{width:'100%'}} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
