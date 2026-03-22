import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Statistic, Typography, Spin, Tag } from 'antd'
import { CompassOutlined, BookOutlined, DollarOutlined, TeamOutlined, WarningOutlined } from '@ant-design/icons'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { adminAPI } from '../../services/api'

const chartData = [
  { month:'T10/25', revenue:612, profit:232 },
  { month:'T11/25', revenue:698, profit:268 },
  { month:'T12/25', revenue:755, profit:285 },
  { month:'T1/26',  revenue:720, profit:270 },
  { month:'T2/26',  revenue:776, profit:286 },
  { month:'T3/26',  revenue:842, profit:308 },
]

export default function AdminDashboard() {
  const [stats, setStats]   = useState(null)
  const [loading, setLoad]  = useState(true)

  useEffect(() => {
    adminAPI.getDashboard()
      .then(r => setStats(r.data.data))
      .catch(() => setStats({
        totalTours: 48, totalBookingsThisMonth: 127,
        revenueThisMonth: 842000000, totalEmployees: 34,
        pendingLeaveRequests: 5, totalCustomers: 1284,
      }))
      .finally(() => setLoad(false))
  }, [])

  const fmtM = n => new Intl.NumberFormat('vi-VN').format(Math.round((n ?? 0) / 1e6)) + 'M ₫'

  const alerts = [
    { bg:'#FAEEDA', border:'#FAC775', color:'#854F0B', text:`⚠ ${stats?.pendingLeaveRequests ?? 5} đơn xin nghỉ chờ duyệt` },
    { bg:'#E6F1FB', border:'#B5D4F4', color:'#185FA5', text:'ℹ 3 hợp đồng nhân viên sắp hết hạn' },
    { bg:'#EAF3DE', border:'#C0DD97', color:'#3B6D11', text:'✓ Bảng lương tháng 2 đã được duyệt' },
    { bg:'#FCEBEB', border:'#F7C1C1', color:'#A32D2D', text:'✗ 2 mặt hàng tồn kho sắp hết hàng' },
  ]

  return (
    <Spin spinning={loading}>
      <Typography.Title level={4} style={{ marginBottom: 16 }}>Tổng quan hệ thống</Typography.Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title="Tổng tour" value={stats?.totalTours ?? 48} prefix={<CompassOutlined />} valueStyle={{ color:'#1D9E75' }} /></Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title="Đặt tour tháng này" value={stats?.totalBookingsThisMonth ?? 127} prefix={<BookOutlined />} valueStyle={{ color:'#185FA5' }} /></Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title="Doanh thu tháng này" value={fmtM(stats?.revenueThisMonth)} prefix={<DollarOutlined />} valueStyle={{ color:'#1D9E75' }} /></Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title="Nhân viên" value={stats?.totalEmployees ?? 34} prefix={<TeamOutlined />}
            suffix={<Tag color="orange" style={{ marginLeft: 4, fontSize: 11 }}>{stats?.pendingLeaveRequests ?? 5} đơn nghỉ</Tag>} /></Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="Doanh thu & Lợi nhuận 6 tháng gần nhất (triệu ₫)">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip formatter={v => [v + 'M ₫']} />
                <Legend />
                <Bar dataKey="revenue" name="Doanh thu" fill="#1D9E75" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit"  name="Lợi nhuận" fill="#EF9F27" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Cảnh báo & Thông báo" style={{ height: '100%' }}>
            {alerts.map((a, i) => (
              <div key={i} style={{
                background: a.bg, border: `1px solid ${a.border}`,
                borderRadius: 8, padding: '10px 14px', fontSize: 13,
                color: a.color, marginBottom: 10,
              }}>{a.text}</div>
            ))}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={6}>
          <Card style={{ background: '#f6ffed', border: '1px solid #b7eb8f' }}>
            <Statistic title="Khách hàng" value={stats?.totalCustomers ?? 1284} valueStyle={{ color: '#389e0d' }} />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card style={{ background: '#e6f7ff', border: '1px solid #91d5ff' }}>
            <Statistic title="Đơn chờ xác nhận" value={stats?.pendingBookings ?? 3} valueStyle={{ color: '#096dd9' }} />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card style={{ background: '#fff7e6', border: '1px solid #ffd591' }}>
            <Statistic title="Đơn nghỉ chờ duyệt" value={stats?.pendingLeaveRequests ?? 5} valueStyle={{ color: '#d46b08' }} />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card style={{ background: '#fff1f0', border: '1px solid #ffa39e' }}>
            <Statistic title="Tồn kho sắp hết" value={2} prefix={<WarningOutlined />} valueStyle={{ color: '#cf1322' }} />
          </Card>
        </Col>
      </Row>
    </Spin>
  )
}
