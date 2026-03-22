import React, { useEffect, useState } from 'react'
import {
  Form, Input, Select, InputNumber, Button, Card,
  Steps, Typography, message, Divider, Alert, Row, Col, Tag
} from 'antd'
import { CheckCircleOutlined } from '@ant-design/icons'
import { bookingAPI, tourAPI } from '../../services/api'
import { useLocation, useNavigate } from 'react-router-dom'

const { Title, Text } = Typography
const fmt = v => v ? new Intl.NumberFormat('vi-VN').format(v) + ' ₫' : '—'

export default function CustomerBooking() {
  const [step, setStep]         = useState(0)
  const [form]                  = Form.useForm()
  const [orderData, setOrderData] = useState(null)
  const [loading, setLoading]   = useState(false)
  const [tours, setTours]       = useState([])
  const [schedules, setSchedules] = useState([])
  const [bookedCode, setBookedCode] = useState('')
  const location  = useLocation()
  const navigate  = useNavigate()

  useEffect(() => {
    tourAPI.getAll({ status: 'ACTIVE', size: 20 })
      .then(r => {
        const list = r.data.data?.content ?? []
        setTours(list.map(t => ({ value: t.id, label: t.name, data: t })))
        // Pre-select if navigated with tourId
        if (location.state?.tourId) {
          form.setFieldValue('tourId', location.state.tourId)
          const t = list.find(t => t.id === location.state.tourId)
          if (t?.schedules) setSchedules(t.schedules.map(s => ({
            value: s.id, label: `${s.departureDate} – Còn ${s.available} chỗ`, available: s.available
          })))
        }
      })
      .catch(() => {})
  }, [])

  const onTourChange = (tourId) => {
    const t = tours.find(t => t.value === tourId)
    if (t?.data?.schedules) {
      setSchedules(t.data.schedules.map(s => ({
        value: s.id,
        label: `${s.departureDate} – Còn ${s.available} chỗ`,
        available: s.available,
      })))
    }
    form.setFieldValue('tourScheduleId', undefined)
  }

  const calcTotal = (values) => {
    const tour = tours.find(t => t.value === values.tourId)?.data
    if (!tour) return 0
    const priceAdult = tour.priceAdult ?? 0
    const priceChild = tour.priceChild ?? priceAdult * 0.7
    const adults   = values.adults   ?? 2
    const children = values.children ?? 0
    return priceAdult * adults + priceChild * children
  }

  const onStep1Finish = (values) => {
    const tour = tours.find(t => t.value === values.tourId)?.data
    const sched = schedules.find(s => s.value === values.tourScheduleId)
    const total   = calcTotal(values)
    const discount = 0 // VIP discount applied server-side
    setOrderData({
      ...values,
      tourName:   tour?.name,
      schedLabel: sched?.label,
      total,
      deposit: Math.round(total * 0.30),
      discount,
    })
    setStep(1)
  }

  const onConfirm = async () => {
    setLoading(true)
    try {
      const res = await bookingAPI.create({
        customerId:     1, // in real app: from auth context
        tourScheduleId: orderData.tourScheduleId,
        adults:         orderData.adults,
        children:       orderData.children ?? 0,
        paymentMethod:  orderData.paymentMethod ?? 'BANK',
        note:           orderData.note,
      })
      setBookedCode(res.data.data?.code ?? 'DT-NEW')
      setStep(2)
    } catch (e) {
      message.error(e.response?.data?.message ?? 'Lỗi đặt tour, vui lòng thử lại')
    } finally {
      setLoading(false)
    }
  }

  const InfoRow = ({ label, value }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #f5f5f5', fontSize: 14 }}>
      <span style={{ color: '#888' }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  )

  return (
    <div style={{ padding: '24px 32px', maxWidth: 900, margin: '0 auto' }}>
      <Title level={4}>Đặt tour</Title>

      <Steps
        current={step}
        style={{ marginBottom: 28 }}
        items={[
          { title: 'Thông tin' },
          { title: 'Xác nhận' },
          { title: 'Hoàn tất' },
        ]}
      />

      {/* ── STEP 0: Form ── */}
      {step === 0 && (
        <Row gutter={[20, 0]}>
          <Col xs={24} lg={15}>
            <Card title="Thông tin đặt tour">
              <Alert
                message="Khách hàng VIP được giảm 5% trên tổng giá trị đơn hàng"
                type="success" showIcon style={{ marginBottom: 16, fontSize: 13 }}
              />
              <Form form={form} layout="vertical" onFinish={onStep1Finish} requiredMark={false}>
                <Form.Item name="tourId" label="Chọn tour" rules={[{ required: true, message: 'Vui lòng chọn tour' }]}>
                  <Select
                    showSearch placeholder="Tìm và chọn tour..."
                    options={tours}
                    onChange={onTourChange}
                    filterOption={(input, opt) => opt.label.toLowerCase().includes(input.toLowerCase())}
                    size="large"
                  />
                </Form.Item>
                <Form.Item name="tourScheduleId" label="Ngày khởi hành" rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}>
                  <Select placeholder="Chọn tour trước" options={schedules} size="large" />
                </Form.Item>
                <Row gutter={12}>
                  <Col span={12}>
                    <Form.Item name="adults" label="Số người lớn" initialValue={2} rules={[{ required: true }]}>
                      <InputNumber min={1} max={20} style={{ width: '100%' }} size="large" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="children" label="Số trẻ em" initialValue={0}>
                      <InputNumber min={0} max={10} style={{ width: '100%' }} size="large" />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item name="contactName" label="Họ tên người liên hệ" initialValue="Nguyễn Văn An" rules={[{ required: true }]}>
                  <Input size="large" />
                </Form.Item>
                <Row gutter={12}>
                  <Col span={12}>
                    <Form.Item name="phone" label="Số điện thoại" initialValue="0901 234 567" rules={[{ required: true }]}>
                      <Input size="large" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="email" label="Email" initialValue="an.nguyen@gmail.com">
                      <Input size="large" type="email" />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item name="paymentMethod" label="Hình thức thanh toán" initialValue="BANK">
                  <Select size="large" options={[
                    { value: 'BANK',        label: '🏦 Chuyển khoản ngân hàng' },
                    { value: 'VNPAY',       label: '💳 VNPay / QR Code' },
                    { value: 'MOMO',        label: '💜 Ví MoMo' },
                    { value: 'CASH',        label: '💵 Tiền mặt tại văn phòng' },
                    { value: 'INSTALLMENT', label: '📅 Trả góp 0%' },
                  ]} />
                </Form.Item>
                <Form.Item name="note" label="Yêu cầu đặc biệt">
                  <Input.TextArea rows={2} placeholder="Phòng không hút thuốc, hỗ trợ xe lăn, dị ứng thức ăn..." />
                </Form.Item>
                <Button type="primary" htmlType="submit" block size="large"
                  style={{ background: '#1D9E75', height: 46 }}>
                  Tiếp tục xác nhận →
                </Button>
              </Form>
            </Card>
          </Col>

          <Col xs={24} lg={9}>
            <Card style={{ background: '#E1F5EE', border: '1px solid #9FE1CB', marginBottom: 12 }}>
              <div style={{ fontWeight: 600, color: '#085041', marginBottom: 10 }}>Chính sách hủy tour</div>
              <div style={{ lineHeight: 2.2, fontSize: 13, color: '#085041' }}>
                ✅ Hủy trước 15 ngày: hoàn 90%<br />
                ✅ Hủy trước 7 ngày: hoàn 70%<br />
                ⚠️ Hủy trước 3 ngày: hoàn 50%<br />
                ❌ Hủy dưới 3 ngày: không hoàn
              </div>
            </Card>
            <Card>
              <div style={{ fontWeight: 600, marginBottom: 10 }}>Tại sao chọn TourPro?</div>
              <div style={{ lineHeight: 2.2, fontSize: 13, color: '#555' }}>
                🏆 10+ năm kinh nghiệm<br />
                ✅ Cam kết giá tốt nhất<br />
                🛡️ Bảo hiểm du lịch đầy đủ<br />
                📞 Hỗ trợ 24/7
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* ── STEP 1: Confirm ── */}
      {step === 1 && orderData && (
        <Row gutter={[20, 0]}>
          <Col xs={24} lg={15}>
            <Card title="Xác nhận thông tin đặt tour">
              <InfoRow label="Tour"           value={orderData.tourName} />
              <InfoRow label="Ngày khởi hành" value={orderData.schedLabel} />
              <InfoRow label="Số người lớn"   value={orderData.adults + ' người'} />
              <InfoRow label="Số trẻ em"      value={(orderData.children ?? 0) + ' trẻ'} />
              <InfoRow label="Người liên hệ"  value={orderData.contactName} />
              <InfoRow label="Số điện thoại"  value={orderData.phone} />
              <InfoRow label="Thanh toán"      value={orderData.paymentMethod} />
              {orderData.note && <InfoRow label="Yêu cầu đặc biệt" value={orderData.note} />}
              <Divider />
              <div style={{ display: 'flex', gap: 8 }}>
                <Button size="large" onClick={() => setStep(0)} style={{ flex: 1 }}>← Quay lại</Button>
                <Button type="primary" size="large" loading={loading} onClick={onConfirm}
                  style={{ flex: 2, background: '#1D9E75', height: 46 }}>
                  Xác nhận & Đặt cọc {fmt(orderData.deposit)}
                </Button>
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={9}>
            <div style={{ background: '#E1F5EE', border: '1px solid #9FE1CB', borderRadius: 12, padding: 16 }}>
              <div style={{ fontWeight: 600, color: '#085041', marginBottom: 12, fontSize: 15 }}>Tóm tắt đơn hàng</div>
              {[
                ['Giá tour', fmt(orderData.total)],
                ['Giảm giá VIP 5%', '- ' + fmt(Math.round(orderData.total * 0.05))],
              ].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '5px 0', borderBottom: '1px solid rgba(29,158,117,0.15)', color: '#085041' }}>
                  <span>{l}</span><span>{v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 17, marginTop: 12, color: '#04342C' }}>
                <span>Tổng cộng</span>
                <span>{fmt(Math.round(orderData.total * 0.95))}</span>
              </div>
              <div style={{ fontSize: 12, color: '#0F6E56', marginTop: 8 }}>
                Đặt cọc 30%: <strong>{fmt(Math.round(orderData.deposit * 0.95))}</strong>
              </div>
            </div>
          </Col>
        </Row>
      )}

      {/* ── STEP 2: Done ── */}
      {step === 2 && (
        <Card style={{ textAlign: 'center', padding: '48px 20px', maxWidth: 500, margin: '0 auto' }}>
          <CheckCircleOutlined style={{ fontSize: 64, color: '#1D9E75', marginBottom: 16 }} />
          <Title level={3} style={{ color: '#1D9E75' }}>Đặt tour thành công!</Title>
          <Tag color="blue" style={{ fontSize: 14, padding: '4px 16px', marginBottom: 16 }}>{bookedCode}</Tag>
          <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
            Nhân viên sẽ liên hệ với bạn trong vòng 30 phút để hỗ trợ thanh toán và gửi hướng dẫn chuẩn bị hành lý.
          </Text>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <Button type="primary" style={{ background: '#1D9E75' }} onClick={() => { setStep(0); form.resetFields() }}>Đặt tour khác</Button>
            <Button onClick={() => navigate('/portal/profile')}>Xem đơn của tôi</Button>
          </div>
        </Card>
      )}
    </div>
  )
}
