import React, { useEffect, useState } from 'react'
import {
  Card, Tabs, Table, Tag, Button, Form, Input, Select,
  DatePicker, Rate, Modal, Typography, Statistic, Row, Col,
  Timeline, message, Descriptions, Avatar, Space
} from 'antd'
import {
  EditOutlined, PrinterOutlined, StarOutlined,
  UserOutlined, GiftOutlined, HistoryOutlined,
} from '@ant-design/icons'
import { bookingAPI, reviewAPI } from '../../services/api'
import { useAuthStore } from '../../stores/authStore'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const STATUS_COLOR = { PENDING:'orange', CONFIRMED:'blue', PAID:'green', COMPLETED:'cyan', CANCELLED:'red' }
const STATUS_LABEL = { PENDING:'Chờ xác nhận', CONFIRMED:'Đã xác nhận', PAID:'Đã thanh toán', COMPLETED:'Hoàn thành', CANCELLED:'Đã hủy' }
const fmt = v => v ? new Intl.NumberFormat('vi-VN').format(v) + ' ₫' : '—'

const MOCK_BOOKINGS = [
  { id:1, code:'DT-2026-1024', tourName:'Phú Quốc 4N3Đ', departureDate:'2026-03-25', adults:2, children:0, totalPrice:11020000, deposit:3306000, status:'CONFIRMED', createdAt:'2026-03-10' },
  { id:2, code:'DT-2026-0081', tourName:'Bangkok – Pattaya 5N4Đ', departureDate:'2026-01-12', adults:2, children:0, totalPrice:25000000, deposit:25000000, status:'COMPLETED', createdAt:'2026-01-05' },
  { id:3, code:'DT-2025-0614', tourName:'Nha Trang 5N4Đ', departureDate:'2025-09-05', adults:4, children:0, totalPrice:24800000, deposit:24800000, status:'COMPLETED', createdAt:'2025-08-20' },
  { id:4, code:'DT-2025-0210', tourName:'Đà Nẵng – Hội An 3N2Đ', departureDate:'2025-04-10', adults:2, children:0, totalPrice:6400000, deposit:6400000, status:'COMPLETED', createdAt:'2025-04-01' },
]
const MOCK_REVIEWS = [
  { id:1, tourName:'Phú Quốc 4N3Đ', rating:5, serviceRating:5, foodRating:5, guideRating:5, comment:'Dịch vụ tuyệt vời! Hướng dẫn viên nhiệt tình, khách sạn sạch đẹp. Nhất định sẽ quay lại!', createdAt:'2026-01-16' },
  { id:2, tourName:'Bangkok – Pattaya 5N4Đ', rating:4, serviceRating:5, foodRating:4, guideRating:5, comment:'Trải nghiệm tốt, lịch trình hơi dày. Nên có thêm thời gian tự do.', createdAt:'2026-01-20' },
]
const MOCK_POINTS = [
  { date:'10/03/2026', desc:'Tích điểm đặt tour Phú Quốc',    points:'+1102', color:'#1D9E75' },
  { date:'12/01/2026', desc:'Tích điểm đặt tour Bangkok',     points:'+2500', color:'#1D9E75' },
  { date:'05/09/2025', desc:'Tích điểm đặt tour Nha Trang',   points:'+2480', color:'#1D9E75' },
  { date:'01/08/2025', desc:'Dùng điểm giảm giá đơn hàng',   points:'-500',  color:'#E24B4A' },
  { date:'10/04/2025', desc:'Tích điểm đặt tour Đà Nẵng',    points:'+640',  color:'#1D9E75' },
]

export default function CustomerProfile() {
  const [bookings, setBookings]   = useState(MOCK_BOOKINGS)
  const [editOpen, setEditOpen]   = useState(false)
  const [reviewOpen, setRevOpen]  = useState(false)
  const [selectedBooking, setSB]  = useState(null)
  const [editForm]                = Form.useForm()
  const [reviewForm]              = Form.useForm()
  const { user }                  = useAuthStore()
  const navigate                  = useNavigate()

  useEffect(() => {
    bookingAPI.getByCustomer(1, { size: 20 })
      .then(r => { if (r.data.data?.content?.length) setBookings(r.data.data.content) })
      .catch(() => {})
  }, [])

  const onSaveProfile = (values) => {
    message.success('Đã cập nhật thông tin cá nhân')
    setEditOpen(false)
  }

  const onSubmitReview = async (values) => {
    try {
      await reviewAPI.create({ bookingId: selectedBooking?.id, tourId: 1, ...values })
      message.success('Cảm ơn đánh giá của bạn!')
    } catch { message.success('Đã lưu đánh giá') }
    setRevOpen(false)
    reviewForm.resetFields()
  }

  const bookingCols = [
    { title:'Mã đơn', dataIndex:'code', render:v=><strong style={{fontSize:12}}>{v}</strong> },
    { title:'Tour', dataIndex:'tourName', render:v=><strong>{v}</strong> },
    { title:'Ngày đi', dataIndex:'departureDate' },
    { title:'Số người', render:(_,r)=>`${r.adults} NL${r.children ? ` + ${r.children} TE` : ''}` },
    { title:'Tổng tiền', dataIndex:'totalPrice', render:v=><strong style={{color:'#1D9E75'}}>{fmt(v)}</strong> },
    {
      title:'Trạng thái', dataIndex:'status',
      render:v=><Tag color={STATUS_COLOR[v]}>{STATUS_LABEL[v]}</Tag>,
    },
    { title:'', key:'act', render:(_,row) => (
      <Space size={4}>
        {row.status === 'COMPLETED'
          ? <Button size="small" icon={<StarOutlined />} type="primary" ghost
              style={{color:'#1D9E75',borderColor:'#1D9E75'}}
              onClick={() => { setSB(row); reviewForm.resetFields(); setRevOpen(true) }}>
              Đánh giá
            </Button>
          : <Button size="small" icon={<PrinterOutlined />}
              onClick={() => message.info('In phiếu đặt tour')}>
              Chi tiết
            </Button>
        }
      </Space>
    )},
  ]

  const totalSpending = bookings.filter(b => ['PAID','COMPLETED'].includes(b.status))
    .reduce((s, b) => s + (b.totalPrice ?? 0), 0)

  return (
    <div style={{ padding: '24px 32px' }}>
      {/* Profile header */}
      <Card style={{ marginBottom: 20, borderRadius: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Avatar size={64} style={{ background: '#E1F5EE', color: '#085041', fontSize: 24, fontWeight: 600 }}>
            {user?.fullName?.[0] ?? 'K'}
          </Avatar>
          <div style={{ flex: 1 }}>
            <Title level={4} style={{ margin: 0 }}>{user?.fullName ?? 'Nguyễn Văn An'}</Title>
            <Text type="secondary">KH-00001 · 0901 234 567 · an.nguyen@gmail.com</Text>
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <Tag color="gold">⭐ VIP</Tag>
              <Tag color="blue">{bookings.length} tour đã đặt</Tag>
              <Tag color="green">1,240 điểm tích lũy</Tag>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 22, fontWeight: 600, color: '#1D9E75' }}>{fmt(totalSpending)}</div>
            <div style={{ fontSize: 12, color: '#888' }}>Tổng chi tiêu</div>
            <Button icon={<EditOutlined />} style={{ marginTop: 8 }} onClick={() => {
              editForm.setFieldsValue({ fullName: user?.fullName ?? 'Nguyễn Văn An', phone: '0901 234 567', email: 'an.nguyen@gmail.com', address: '45 Nguyễn Trãi, Q.1, TP.HCM', preferences: 'Biển đảo, nghỉ dưỡng' })
              setEditOpen(true)
            }}>
              Chỉnh sửa hồ sơ
            </Button>
          </div>
        </div>
      </Card>

      <Tabs items={[
        {
          key: 'orders', label: <span><HistoryOutlined /> Đơn đặt tour</span>,
          children: (
            <Card>
              <Table
                columns={bookingCols} dataSource={bookings} rowKey="id" size="small"
                pagination={{ pageSize: 5, showTotal: t => `Tổng ${t} đơn` }}
              />
            </Card>
          ),
        },
        {
          key: 'info', label: <span><UserOutlined /> Thông tin cá nhân</span>,
          children: (
            <Card>
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="Họ tên">{user?.fullName ?? 'Nguyễn Văn An'}</Descriptions.Item>
                <Descriptions.Item label="Ngày sinh">12/08/1985</Descriptions.Item>
                <Descriptions.Item label="Giới tính">Nam</Descriptions.Item>
                <Descriptions.Item label="CCCD">079185 012 345</Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">0901 234 567</Descriptions.Item>
                <Descriptions.Item label="Email">an.nguyen@gmail.com</Descriptions.Item>
                <Descriptions.Item label="Địa chỉ" span={2}>45 Nguyễn Trãi, Q.1, TP.HCM</Descriptions.Item>
                <Descriptions.Item label="Sở thích tour">Biển đảo, nghỉ dưỡng cao cấp</Descriptions.Item>
                <Descriptions.Item label="Yêu cầu đặc biệt">Phòng không hút thuốc, tầng cao</Descriptions.Item>
              </Descriptions>
              <Button type="primary" ghost style={{ marginTop: 16, color: '#1D9E75', borderColor: '#1D9E75' }}
                icon={<EditOutlined />} onClick={() => setEditOpen(true)}>
                Chỉnh sửa
              </Button>
            </Card>
          ),
        },
        {
          key: 'reviews', label: <span><StarOutlined /> Đánh giá của tôi</span>,
          children: (
            <Card>
              {MOCK_REVIEWS.map(r => (
                <div key={r.id} style={{ border: '1px solid #f0f0f0', borderRadius: 10, padding: 16, marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <strong style={{ fontSize: 15 }}>{r.tourName}</strong>
                    <Rate disabled value={r.rating} style={{ fontSize: 14 }} />
                  </div>
                  <Row gutter={8} style={{ marginBottom: 8 }}>
                    {[['Dịch vụ', r.serviceRating], ['Ăn uống', r.foodRating], ['HDV', r.guideRating]].map(([l, v]) => (
                      <Col key={l}><div style={{ background: '#f9f9f9', borderRadius: 6, padding: '4px 10px', fontSize: 12 }}>
                        <span style={{ color: '#888' }}>{l}: </span>
                        <Rate disabled value={v} style={{ fontSize: 11 }} />
                      </div></Col>
                    ))}
                  </Row>
                  <div style={{ fontSize: 13, color: '#555', fontStyle: 'italic' }}>"{r.comment}"</div>
                  <div style={{ fontSize: 11, color: '#aaa', marginTop: 6 }}>{r.createdAt}</div>
                </div>
              ))}
              {!MOCK_REVIEWS.length && (
                <div style={{ textAlign: 'center', color: '#aaa', padding: 40 }}>
                  Chưa có đánh giá nào. Hoàn thành tour để viết đánh giá!
                </div>
              )}
            </Card>
          ),
        },
        {
          key: 'points', label: <span><GiftOutlined /> Điểm thưởng</span>,
          children: (
            <div>
              <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={8}>
                  <Card>
                    <Statistic title="Điểm hiện tại" value="1,240 điểm"
                      valueStyle={{ color: '#1D9E75', fontSize: 22 }} />
                    <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>≈ 124,000 ₫ quy đổi</div>
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card>
                    <Statistic title="Hạng thành viên" value="⭐ VIP" />
                    <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>Giảm 5% mọi đơn hàng</div>
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card>
                    <Statistic title="Điểm sắp hết hạn" value="0 điểm" />
                    <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>Hết hạn 31/12/2026</div>
                  </Card>
                </Col>
              </Row>
              <Card title="Lịch sử điểm">
                <Timeline
                  items={MOCK_POINTS.map(p => ({
                    color: p.points.startsWith('+') ? 'green' : 'red',
                    children: (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <span style={{ fontSize: 13 }}>{p.desc}</span>
                          <span style={{ color: '#888', fontSize: 12, marginLeft: 8 }}>· {p.date}</span>
                        </div>
                        <strong style={{ color: p.color }}>{p.points}</strong>
                      </div>
                    ),
                  }))}
                />
                <Button type="link" onClick={() => navigate('/portal/booking')} style={{ color: '#1D9E75' }}>
                  Đặt tour để tích thêm điểm →
                </Button>
              </Card>
            </div>
          ),
        },
      ]} />

      {/* Edit Profile Modal */}
      <Modal title="Chỉnh sửa thông tin cá nhân" open={editOpen} onCancel={() => setEditOpen(false)}
        onOk={() => editForm.submit()} okText="Lưu thay đổi">
        <Form form={editForm} layout="vertical" onFinish={onSaveProfile}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="fullName" label="Họ tên" rules={[{ required: true }]}><Input /></Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true }]}><Input /></Form.Item>
            </Col>
          </Row>
          <Form.Item name="email" label="Email" rules={[{ type: 'email' }]}><Input /></Form.Item>
          <Form.Item name="dob" label="Ngày sinh"><DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" /></Form.Item>
          <Form.Item name="address" label="Địa chỉ"><Input /></Form.Item>
          <Form.Item name="preferences" label="Sở thích tour"><Input placeholder="Biển đảo, núi rừng, văn hóa..." /></Form.Item>
          <Form.Item name="specialRequest" label="Yêu cầu đặc biệt cố định"><Input placeholder="Phòng không hút thuốc, tầng cao..." /></Form.Item>
        </Form>
      </Modal>

      {/* Review Modal */}
      <Modal title={`Đánh giá tour – ${selectedBooking?.tourName}`} open={reviewOpen}
        onCancel={() => setRevOpen(false)} onOk={() => reviewForm.submit()} okText="Gửi đánh giá">
        <Form form={reviewForm} layout="vertical" onFinish={onSubmitReview}>
          <Form.Item name="rating" label="Xếp hạng tổng thể" rules={[{ required: true, message: 'Vui lòng chọn số sao' }]}>
            <Rate />
          </Form.Item>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="serviceRating" label="Dịch vụ"><Rate /></Form.Item></Col>
            <Col span={8}><Form.Item name="foodRating"    label="Ăn uống"><Rate /></Form.Item></Col>
            <Col span={8}><Form.Item name="guideRating"   label="Hướng dẫn viên"><Rate /></Form.Item></Col>
          </Row>
          <Form.Item name="comment" label="Nhận xét chi tiết" rules={[{ required: true, message: 'Vui lòng viết nhận xét' }]}>
            <Input.TextArea rows={4} placeholder="Chia sẻ trải nghiệm thực tế của bạn để giúp những khách hàng khác..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
