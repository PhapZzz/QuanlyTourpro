import React from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, Badge, Typography } from 'antd'
import {
  UserOutlined, DollarOutlined, CalendarOutlined,
  InboxOutlined, ShopOutlined, ImportOutlined,
  BookOutlined, ExportOutlined, RiseOutlined,
  LogoutOutlined, BellOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '../stores/authStore'

const { Sider, Header, Content } = Layout

const menuItems = [
  {
    type: 'group', label: 'Nhân sự',
    children: [
      { key: '/staff/hr/employees', icon: <UserOutlined />,     label: 'Nhân viên' },
      { key: '/staff/hr/salary',    icon: <DollarOutlined />,   label: 'Bảng lương' },
      { key: '/staff/hr/leave',     icon: <CalendarOutlined />, label: 'Đơn nghỉ phép' },
    ],
  },
  {
    type: 'group', label: 'Kho hàng',
    children: [
      { key: '/staff/warehouse/products',  icon: <InboxOutlined />,   label: 'Sản phẩm / DV' },
      { key: '/staff/warehouse/suppliers', icon: <ShopOutlined />,    label: 'Nhà cung cấp' },
      { key: '/staff/warehouse/import',    icon: <ImportOutlined />,  label: 'Phiếu nhập' },
    ],
  },
  {
    type: 'group', label: 'Kinh doanh',
    children: [
      { key: '/staff/sales/bookings', icon: <BookOutlined />,   label: 'Đặt tour' },
      { key: '/staff/sales/export',   icon: <ExportOutlined />, label: 'Phiếu xuất' },
      { key: '/staff/sales/profit',   icon: <RiseOutlined />,   label: 'Doanh thu' },
    ],
  },
]

export default function StaffLayout() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { user, logout } = useAuthStore()

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={220} style={{ background: '#04342C' }}>
        <div style={{
          padding: '16px 12px', borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', gap: 10, alignItems: 'center',
        }}>
          <div style={{
            width: 34, height: 34, background: '#1D9E75', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>✈</div>
          <div>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>TourPro</div>
            <div style={{ color: '#9FE1CB', fontSize: 11 }}>Staff Portal</div>
          </div>
        </div>
        <Menu
          theme="dark" mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ background: '#04342C', border: 'none', marginTop: 8 }}
        />
      </Sider>

      <Layout>
        <Header style={{
          background: '#fff', padding: '0 20px',
          display: 'flex', alignItems: 'center', gap: 12,
          borderBottom: '1px solid #f0f0f0', height: 56,
        }}>
          <Typography.Text style={{ flex: 1, fontSize: 15, fontWeight: 500 }}>
            Staff Portal
          </Typography.Text>
          <Badge count={2}>
            <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
          </Badge>
          <Dropdown
            menu={{
              items: [{ key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true }],
              onClick: ({ key }) => { if (key === 'logout') { logout(); navigate('/login') } },
            }}
            placement="bottomRight"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <Avatar style={{ background: '#E1F5EE', color: '#085041' }}>
                {user?.fullName?.[0]}
              </Avatar>
              <Typography.Text>{user?.fullName}</Typography.Text>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: 20 }}><Outlet /></Content>
      </Layout>
    </Layout>
  )
}
