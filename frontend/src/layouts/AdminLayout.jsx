import React, { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, Badge, Typography, theme } from 'antd'
import {
  DashboardOutlined, UserOutlined, CompassOutlined,
  ShopOutlined, TeamOutlined, BarChartOutlined,
  LogoutOutlined, BellOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '../stores/authStore'

const { Sider, Header, Content } = Layout

const menuItems = [
  { key: '/admin',           icon: <DashboardOutlined />, label: 'Tổng quan' },
  { key: '/admin/tours',     icon: <CompassOutlined />,   label: 'Tour / Sản phẩm' },
  { key: '/admin/suppliers', icon: <ShopOutlined />,      label: 'Nhà cung cấp' },
  { key: '/admin/customers', icon: <TeamOutlined />,      label: 'Khách hàng' },
  { key: '/admin/users',     icon: <UserOutlined />,      label: 'Quản lý User' },
  { key: '/admin/reports',   icon: <BarChartOutlined />,  label: 'Báo cáo' },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)

  const userMenuItems = [
    { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true },
  ]

  const selectedKey = menuItems.find(m => location.pathname === m.key)?.key
    || menuItems.slice().reverse().find(m => location.pathname.startsWith(m.key))?.key
    || '/admin'

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible collapsed={collapsed} onCollapse={setCollapsed}
        style={{ background: '#04342C' }} width={220}
      >
        <div style={{
          padding: '16px 12px', display: 'flex', alignItems: 'center', gap: 10,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div style={{
            width: 34, height: 34, background: '#1D9E75', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, flexShrink: 0,
          }}>✈</div>
          {!collapsed && (
            <div>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: 14, lineHeight: 1.2 }}>TourPro</div>
              <div style={{ color: '#9FE1CB', fontSize: 11 }}>Admin Portal</div>
            </div>
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ background: '#04342C', borderRight: 'none', marginTop: 8 }}
        />
      </Sider>

      <Layout>
        <Header style={{
          background: '#fff', padding: '0 20px',
          display: 'flex', alignItems: 'center', gap: 12,
          borderBottom: '1px solid #f0f0f0', height: 56,
        }}>
          <div
            onClick={() => setCollapsed(!collapsed)}
            style={{ cursor: 'pointer', fontSize: 18, color: '#666' }}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>
          <Typography.Text style={{ flex: 1, fontSize: 15, fontWeight: 500 }}>
            Admin Dashboard
          </Typography.Text>
          <Badge count={3}>
            <BellOutlined style={{ fontSize: 18, cursor: 'pointer', color: '#666' }} />
          </Badge>
          <Dropdown
            menu={{
              items: userMenuItems,
              onClick: ({ key }) => { if (key === 'logout') { logout(); navigate('/login') } },
            }}
            placement="bottomRight"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <Avatar style={{ background: '#E1F5EE', color: '#085041' }}>
                {user?.fullName?.[0] ?? 'A'}
              </Avatar>
              <Typography.Text>{user?.fullName ?? 'Admin'}</Typography.Text>
            </div>
          </Dropdown>
        </Header>

        <Content style={{ margin: 20, minHeight: 'calc(100vh - 96px)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
