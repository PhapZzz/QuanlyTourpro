import React from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, Badge, Typography, Space } from 'antd'
import {
  HomeOutlined, CompassOutlined, BookOutlined,
  UserOutlined, BellOutlined, LogoutOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '../stores/authStore'

const { Header, Content, Footer } = Layout

export default function CustomerLayout() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { user, logout } = useAuthStore()

  const navItems = [
    { key: '/portal',         icon: <HomeOutlined />,    label: 'Trang chủ' },
    { key: '/portal/tours',   icon: <CompassOutlined />, label: 'Khám phá tour' },
    { key: '/portal/booking', icon: <BookOutlined />,    label: 'Đặt tour' },
    { key: '/portal/profile', icon: <UserOutlined />,    label: 'Tài khoản' },
  ]

  const selectedKey = location.pathname === '/portal' ? '/portal'
    : navItems.slice().reverse().find(i => location.pathname.startsWith(i.key))?.key

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      <Header style={{
        background: '#fff', padding: '0 32px',
        display: 'flex', alignItems: 'center', gap: 0,
        boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
        position: 'sticky', top: 0, zIndex: 50, height: 56,
      }}>
        <div
          onClick={() => navigate('/portal')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 32, cursor: 'pointer' }}
        >
          <div style={{
            width: 30, height: 30, background: '#1D9E75', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
          }}>✈</div>
          <Typography.Text style={{ fontSize: 15, fontWeight: 700 }}>
            <span style={{ color: '#1D9E75' }}>Tour</span>Pro
          </Typography.Text>
        </div>

        <Menu
          mode="horizontal"
          selectedKeys={[selectedKey]}
          items={navItems}
          onClick={({ key }) => navigate(key)}
          style={{ flex: 1, border: 'none', background: 'transparent' }}
        />

        <Space size={16}>
          <Badge count={2}>
            <BellOutlined style={{ fontSize: 18, cursor: 'pointer', color: '#666' }} />
          </Badge>
          <Dropdown
            menu={{
              items: [
                { key: 'profile', icon: <UserOutlined />, label: 'Tài khoản của tôi' },
                { key: 'logout',  icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true },
              ],
              onClick: ({ key }) => {
                if (key === 'logout')  { logout(); navigate('/login') }
                if (key === 'profile') navigate('/portal/profile')
              },
            }}
            placement="bottomRight"
          >
            <Space style={{ cursor: 'pointer' }}>
              <Avatar style={{ background: '#E1F5EE', color: '#085041' }}>
                {user?.fullName?.[0]}
              </Avatar>
              <Typography.Text>{user?.fullName}</Typography.Text>
            </Space>
          </Dropdown>
        </Space>
      </Header>

      <Content style={{ minHeight: 'calc(100vh - 112px)' }}>
        <Outlet />
      </Content>

      <Footer style={{ textAlign: 'center', background: '#04342C', color: '#9FE1CB', padding: '16px 32px' }}>
        TourPro © 2026 – Hệ thống quản lý tour du lịch
      </Footer>
    </Layout>
  )
}
