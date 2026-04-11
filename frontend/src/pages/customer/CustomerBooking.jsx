import React, { useEffect, useState } from 'react'
import {
  Form, Input, Select, InputNumber, Button, Card,
  Steps, Typography, message, Divider, Alert, Row, Col, Tag
} from 'antd'
import { CheckCircleOutlined } from '@ant-design/icons'
import { bookingAPI, tourAPI } from '../../services/api'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

const { Title, Text } = Typography
const fmt = v => v ? new Intl.NumberFormat('vi-VN').format(v) + ' ₫' : '—'

export default function CustomerBooking() {
  const [step, setStep] = useState(0)
  const [form] = Form.useForm()
  const [orderData, setOrderData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [tours, setTours] = useState([])
  const [schedules, setSchedules] = useState([])
  const [bookedCode, setBookedCode] = useState('')

  const location = useLocation()
  const navigate = useNavigate()

  // 🔥 Lấy user từ auth
  const { user } = useAuthStore()

  const isVIP = user?.customerType === 'VIP'

  useEffect(() => {
    tourAPI.getAll({ status: 'ACTIVE', size: 20 })
      .then(r => {
        const list = r.data.data?.content ?? []
        setTours(list.map(t => ({ value: t.id, label: t.name, data: t })))

        if (location.state?.tourId) {
          form.setFieldValue('tourId', location.state.tourId)
          const t = list.find(t => t.id === location.state.tourId)
          if (t?.schedules) {
            setSchedules(t.schedules.map(s => ({
              value: s.id,
              label: `${s.departureDate} – Còn ${s.available} chỗ`,
              available: s.available
            })))
          }
        }
      })
      .catch(() => message.error('Không tải được danh sách tour'))
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

    return priceAdult * (values.adults ?? 1)
         + priceChild * (values.children ?? 0)
  }

  const onStep1Finish = (values) => {
    const tour = tours.find(t => t.value === values.tourId)?.data
    const sched = schedules.find(s => s.value === values.tourScheduleId)

    const total = calcTotal(values)
    const discount = isVIP ? Math.round(total * 0.05) : 0

    setOrderData({
      ...values,
      tourName: tour?.name,
      schedLabel: sched?.label,
      total,
      discount,
      finalTotal: total - discount,
      deposit: Math.round((total - discount) * 0.3),
    })

    setStep(1)
  }

  const onConfirm = async () => {
    setLoading(true)
    try {
      const res = await bookingAPI.create({
        tourScheduleId: orderData.tourScheduleId,
        adults: orderData.adults,
        children: orderData.children ?? 0,
        paymentMethod: orderData.paymentMethod ?? 'BANK',
        note: orderData.note,
      })

      setBookedCode(res.data.data?.code ?? 'DT-NEW')
      setStep(2)
    } catch (e) {
      message.error(e.response?.data?.message ?? 'Lỗi đặt tour')
    } finally {
      setLoading(false)
    }
  }

  const InfoRow = ({ label, value }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #f5f5f5' }}>
      <span style={{ color: '#888' }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  )

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <Title level={4}>Đặt tour</Title>

      <Steps current={step} style={{ marginBottom: 24 }}
        items={[{ title: 'Thông tin' }, { title: 'Xác nhận' }, { title: 'Hoàn tất' }]}
      />

      {/* STEP 0 */}
      {step === 0 && (
        <Card title="Thông tin đặt tour">
          <Alert
            message="VIP được giảm 5%"
            type="success"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form form={form} layout="vertical" onFinish={onStep1Finish}>
            <Form.Item name="tourId" label="Tour" rules={[{ required: true }]}>
              <Select options={tours} onChange={onTourChange} />
            </Form.Item>

            <Form.Item name="tourScheduleId" label="Ngày" rules={[{ required: true }]}>
              <Select options={schedules} />
            </Form.Item>

            <Form.Item name="adults" label="Người lớn" initialValue={1}>
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item name="children" label="Trẻ em" initialValue={0}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item name="contactName" label="Tên" rules={[{ required: true }]}>
              <Input />
            </Form.Item>

            <Form.Item name="phone" label="SĐT" rules={[{ required: true }]}>
              <Input />
            </Form.Item>

            <Form.Item name="email" label="Email">
              <Input />
            </Form.Item>

            <Form.Item name="paymentMethod" initialValue="BANK">
              <Select options={[
                { value: 'BANK', label: 'Chuyển khoản' },
                { value: 'MOMO', label: 'MoMo' }
              ]} />
            </Form.Item>

            <Button htmlType="submit" type="primary" block>
              Tiếp tục
            </Button>
          </Form>
        </Card>
      )}

      {/* STEP 1 */}
      {step === 1 && orderData && (
        <Card title="Xác nhận">
          <InfoRow label="Tour" value={orderData.tourName} />
          <InfoRow label="Ngày" value={orderData.schedLabel} />
          <InfoRow label="Tổng" value={fmt(orderData.total)} />

          {isVIP && (
            <InfoRow label="Giảm VIP" value={`- ${fmt(orderData.discount)}`} />
          )}

          <InfoRow label="Thanh toán" value={fmt(orderData.finalTotal)} />

          <Divider />

          <Button onClick={() => setStep(0)}>Quay lại</Button>
          <Button type="primary" loading={loading} onClick={onConfirm}>
            Xác nhận
          </Button>
        </Card>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <Card style={{ textAlign: 'center' }}>
          <CheckCircleOutlined style={{ fontSize: 60, color: 'green' }} />
          <Title level={3}>Thành công</Title>
          <Tag>{bookedCode}</Tag>

          <Button onClick={() => navigate('/portal/profile')}>
            Xem đơn
          </Button>
        </Card>
      )}
    </div>
  )
}