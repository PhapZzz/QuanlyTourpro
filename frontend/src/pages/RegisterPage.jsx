import React, { useState } from 'react'
import { Form, Input, Button, Card, Typography, message } from 'antd'
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined
} from '@ant-design/icons'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../services/api'

const { Title, Text } = Typography

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const navigate = useNavigate()

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const payload = {
        fullName: values.fullName,
        username: values.username,
        email: values.email,
//         phone: values.phone,
        password: values.password,
      }

      await authAPI.register(payload)

      message.success('Đăng ký thành công! Vui lòng đăng nhập.')
      navigate('/login')
    } catch (err) {
      message.error(err.response?.data?.message ?? 'Đăng ký thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #04342C 0%, #1D9E75 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <Card
        style={{
          width: 430,
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 60,
              height: 60,
              background: '#1D9E75',
              borderRadius: 14,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 30,
              marginBottom: 14,
            }}
          >
            ✈
          </div>
          <Title level={3} style={{ margin: 0 }}>
            TourPro
          </Title>
          <Text type="secondary">Tạo tài khoản khách hàng</Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
        >
          <Form.Item
            name="fullName"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input
              prefix={<IdcardOutlined />}
              placeholder="Họ và tên"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="username"
            rules={[
              { required: true, message: 'Vui lòng nhập tên đăng nhập' },
              { min: 4, message: 'Tên đăng nhập phải có ít nhất 4 ký tự' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Tên đăng nhập"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Email"
              size="large"
            />
          </Form.Item>

{/*           <Form.Item */}
{/*             name="phone" */}
{/*             rules={[ */}
{/*               { required: true, message: 'Vui lòng nhập số điện thoại' }, */}
{/*               { */}
{/*                 pattern: /^[0-9]{9,11}$/, */}
{/*                 message: 'Số điện thoại không hợp lệ', */}
{/*               }, */}
{/*             ]} */}
{/*           > */}
{/*             <Input */}
{/*               prefix={<PhoneOutlined />} */}
{/*               placeholder="Số điện thoại" */}
{/*               size="large" */}
{/*             /> */}
{/*           </Form.Item> */}

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
            ]}
            hasFeedback
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Mật khẩu"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp'))
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Xác nhận mật khẩu"
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 8 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
              style={{
                background: '#1D9E75',
                borderColor: '#1D9E75',
                height: 44,
              }}
            >
              Đăng ký
            </Button>
          </Form.Item>
        </Form>

        <div
          style={{
            textAlign: 'center',
            marginTop: 14,
            fontSize: 14,
          }}
        >
          Đã có tài khoản?{' '}
          <Link to="/login" style={{ color: '#1D9E75', fontWeight: 600 }}>
            Đăng nhập ngay
          </Link>
        </div>
      </Card>
    </div>
  )
}