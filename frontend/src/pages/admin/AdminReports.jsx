import React, { useState } from 'react'
import { Card, Row, Col, Statistic, Select, Button, Table, Tag, Typography, Tabs, message } from 'antd'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { adminAPI } from '../../services/api'

const fmt = v => v ? new Intl.NumberFormat('vi-VN').format(Math.round(v/1e6)) + 'M ₫' : '—'

const MOCK_REVENUE = [
  { month:'T10/25', revenue:612, cost:380, profit:232 },
  { month:'T11/25', revenue:698, cost:430, profit:268 },
  { month:'T12/25', revenue:755, cost:470, profit:285 },
  { month:'T1/26',  revenue:720, cost:450, profit:270 },
  { month:'T2/26',  revenue:776, cost:490, profit:286 },
  { month:'T3/26',  revenue:842, cost:534, profit:308 },
]

export default function AdminReports() {
  const [month, setMonth]     = useState(3)
  const [year, setYear]       = useState(2026)
  const [revData, setRevData] = useState(null)
  const [hrData, setHrData]   = useState(null)
  const [whData, setWhData]   = useState(null)
  const [loading, setLoading] = useState(false)

  const loadRevenue = async () => {
    setLoading(true)
    try { const r = await adminAPI.getRevenueReport(month, year); setRevData(r.data.data) }
    catch { message.error('Không tải được báo cáo') } finally { setLoading(false) }
  }
  const loadHR = async () => {
    setLoading(true)
    try { const r = await adminAPI.getHRReport(month, year); setHrData(r.data.data) }
    catch { message.error('Lỗi') } finally { setLoading(false) }
  }
  const loadWarehouse = async () => {
    setLoading(true)
    try { const r = await adminAPI.getWarehouseReport(month, year); setWhData(r.data.data) }
    catch { message.error('Lỗi') } finally { setLoading(false) }
  }

  const tourCols = [
    { title:'Tour', dataIndex:'tourName' },
    { title:'Số đơn', dataIndex:'bookings' },
    { title:'Doanh thu', dataIndex:'revenue', render:v=>fmt(v) },
    { title:'Lợi nhuận', dataIndex:'profit', render:v=><strong style={{color:'#1D9E75'}}>{fmt(v)}</strong> },
  ]
  const lowStockCols = [
    { title:'Mã', dataIndex:'productCode' },
    { title:'Tên dịch vụ', dataIndex:'productName' },
    { title:'Tồn kho', dataIndex:'stockQty', render:v=><Tag color="red">{v}</Tag> },
  ]

  const FilterBar = () => (
    <Card style={{marginBottom:16}}>
      <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
        <Select value={month} onChange={setMonth} style={{width:130}}
          options={Array.from({length:12},(_,i)=>({value:i+1,label:`Tháng ${i+1}`}))} />
        <Select value={year} onChange={setYear} style={{width:110}}
          options={[2025,2026].map(y=>({value:y,label:`Năm ${y}`}))} />
        <Button type="primary" onClick={()=>{loadRevenue();loadHR();loadWarehouse()}} loading={loading} style={{background:'#1D9E75'}}>
          Tạo báo cáo
        </Button>
        <Button onClick={()=>message.info('Tính năng xuất PDF đang phát triển')}>⬇ Xuất PDF</Button>
        <Button onClick={()=>message.info('Tính năng xuất Excel đang phát triển')}>⬇ Xuất Excel</Button>
      </div>
    </Card>
  )

  return (
    <>
      <Typography.Title level={4}>Báo cáo & Thống kê</Typography.Title>
      <FilterBar />
      <Tabs items={[
        {
          key:'revenue', label:'Doanh thu – Lợi nhuận',
          children: <>
            <Row gutter={[16,16]} style={{marginBottom:16}}>
              <Col xs={24} sm={8}><Card><Statistic title="Tổng doanh thu" value={fmt(revData?.totalRevenue)} valueStyle={{color:'#1D9E75'}} /></Card></Col>
              <Col xs={24} sm={8}><Card><Statistic title="Tổng chi phí"   value={fmt(revData?.totalCost)} /></Card></Col>
              <Col xs={24} sm={8}><Card><Statistic title="Lợi nhuận gộp"  value={fmt(revData?.grossProfit)} valueStyle={{color:'#1D9E75'}}
                suffix={revData?.profitMargin ? <span style={{fontSize:14}}> ({revData.profitMargin.toFixed(1)}%)</span> : ''} /></Card></Col>
            </Row>
            <Card title="Doanh thu – Chi phí – Lợi nhuận (triệu ₫)" style={{marginBottom:16}}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={MOCK_REVENUE}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" /><YAxis />
                  <Tooltip formatter={v=>[v+'M ₫']} />
                  <Legend />
                  <Bar dataKey="revenue" name="Doanh thu" fill="#1D9E75" radius={[4,4,0,0]} />
                  <Bar dataKey="cost"    name="Chi phí"   fill="#9FE1CB" radius={[4,4,0,0]} />
                  <Bar dataKey="profit"  name="Lợi nhuận" fill="#EF9F27" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            {revData?.byTour?.length > 0 && (
              <Card title="Doanh thu theo tour">
                <Table columns={tourCols} dataSource={revData.byTour} rowKey="tourName" size="small" pagination={false} />
              </Card>
            )}
          </>
        },
        {
          key:'hr', label:'Nhân sự',
          children: <>
            <Row gutter={[16,16]} style={{marginBottom:16}}>
              <Col xs={12} sm={6}><Card><Statistic title="Tổng NV" value={hrData?.totalEmployees ?? '—'} /></Card></Col>
              <Col xs={12} sm={6}><Card><Statistic title="NV đang làm" value={hrData?.activeEmployees ?? '—'} valueStyle={{color:'#1D9E75'}} /></Card></Col>
              <Col xs={12} sm={6}><Card><Statistic title="Tổng quỹ lương" value={fmt(hrData?.totalSalary)} /></Card></Col>
              <Col xs={12} sm={6}><Card><Statistic title="Đơn nghỉ chờ duyệt" value={hrData?.pendingLeaves ?? '—'} valueStyle={{color:'#fa8c16'}} /></Card></Col>
            </Row>
            {!hrData && <div style={{textAlign:'center',color:'#aaa',padding:40}}>Nhấn "Tạo báo cáo" để tải dữ liệu</div>}
          </>
        },
        {
          key:'warehouse', label:'Kho hàng',
          children: <>
            <Row gutter={[16,16]} style={{marginBottom:16}}>
              <Col xs={12} sm={6}><Card><Statistic title="Tổng sản phẩm" value={whData?.totalProducts ?? '—'} /></Card></Col>
              <Col xs={12} sm={6}><Card><Statistic title="Giá trị kho" value={fmt(whData?.inventoryValue)} /></Card></Col>
              <Col xs={12} sm={6}><Card><Statistic title="Nhập hàng tháng" value={fmt(whData?.totalImportValue)} /></Card></Col>
              <Col xs={12} sm={6}><Card><Statistic title="Phiếu nhập" value={whData?.importVouchers ?? '—'} /></Card></Col>
            </Row>
            {whData?.lowStockItems?.length > 0 && (
              <Card title="⚠ Sản phẩm sắp hết hàng">
                <Table columns={lowStockCols} dataSource={whData.lowStockItems} rowKey="productCode" size="small" pagination={false} />
              </Card>
            )}
            {!whData && <div style={{textAlign:'center',color:'#aaa',padding:40}}>Nhấn "Tạo báo cáo" để tải dữ liệu</div>}
          </>
        },
      ]} />
    </>
  )
}
