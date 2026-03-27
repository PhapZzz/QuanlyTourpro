import React, { useState } from 'react'
import { Form, Input, Button, Card, Typography, message, Select } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate,Link } from 'react-router-dom'
import { authAPI } from '../services/api'
import { useAuthStore } from '../stores/authStore'

const { Title, Text } = Typography

const ROLE_REDIRECTS = {
  ADMIN:               '/admin',
  HR_MANAGER:          '/staff/hr/employees',
  WAREHOUSE_MANAGER:   '/staff/warehouse/products',
  SALES_MANAGER:       '/staff/sales/bookings',
  EMPLOYEE:            '/staff/hr/employees',
  CUSTOMER:            '/portal',
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const res = await authAPI.login(values)
      const { token, fullName, username, role } = res.data.data
      login(token, { fullName, username, role })
      message.success(`Chào mừng ${fullName}!`)
      navigate(ROLE_REDIRECTS[role] ?? '/login')
    } catch (err) {
      message.error(err.response?.data?.message ?? 'Tên đăng nhập hoặc mật khẩu không đúng')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #04342C 0%, #1D9E75 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <Card style={{ width: 400, borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 60, height: 60, background: '#1D9E75', borderRadius: 14,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 30, marginBottom: 14,
          }}>✈</div>
          <Title level={3} style={{ margin: 0 }}>TourPro</Title>
          <Text type="secondary">Hệ thống quản lý tour du lịch</Text>
        </div>

        <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item name="username" rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}>
            <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" size="large" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" size="large" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 8 }}>
            <Button
              type="primary" htmlType="submit" block size="large" loading={loading}
              style={{ background: '#1D9E75', borderColor: '#1D9E75', height: 44 }}
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>

        <div style={{
          textAlign: 'center', fontSize: 12, color: '#aaa',
          borderTop: '1px solid #f0f0f0', paddingTop: 14, marginTop: 8,
        }}>

    //dangky
    <div
      style={{
        textAlign: 'center',
        marginTop: 14,
        fontSize: 14,
      }}
    >
      Chưa có tài khoản?{' '}
      <Link to="/register" style={{ color: '#1D9E75', fontWeight: 600 }}>
        Đăng ký ngay
      </Link>
    </div>

          <div style={{ marginBottom: 4, fontWeight: 500, color: '#888' }}>Tài khoản demo:</div>
          <div>admin / Admin@123 &nbsp;|&nbsp; hr_manager / Admin@123</div>
          <div>warehouse1 / Admin@123 &nbsp;|&nbsp; cust_an / Admin@123</div>
        </div>
      </Card>
    </div>
  )
}
