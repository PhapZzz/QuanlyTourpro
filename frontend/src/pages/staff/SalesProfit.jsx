import React, { useState, useEffect } from 'react'
import {
  Table, Button, Modal, Form, Select, DatePicker,
  InputNumber, message, Card, Row, Col, Typography, Tabs,
  Statistic, Tag, Space, Input
} from 'antd'
import { PlusOutlined, ReloadOutlined, DollarOutlined, RiseOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import numeral from 'numeral'

import { exportVoucherAPI, tourAPI, bookingAPI } from '../../services/api'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

const COLOR = {
  teal: '#1D9E75',
  green: '#52c41a',
  red: '#f5222d',
  blue: '#1890ff',
  orange: '#fa8c16'
}

// Tab 1: Export Voucher List
function ExportVoucherTab() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [vouchers, setVouchers] = useState([])
  const [bookings, setBookings] = useState([])
  const [form] = Form.useForm()
  const [items, setItems] = useState([])

  useEffect(() => {
    loadVouchers()
    loadBookings()
  }, [])

  const loadVouchers = async () => {
    setLoading(true)
    try {
      const res = await exportVoucherAPI.getAll()
      setVouchers(res.data || [])
    } catch (err) {
      message.error('Failed to load vouchers')
    } finally {
      setLoading(false)
    }
  }

  const loadBookings = async () => {
    try {
      const res = await bookingAPI.getAll({ status: 'CONFIRMED' })

      const data =
        res?.data?.data?.content ??
        res?.data?.content ??
        res?.data ??
        []

      setBookings(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load bookings', err)
      setBookings([])
    }
  }

  const onSelectBooking = async (bookingId) => {
    try {
      const res = await bookingAPI.getById(bookingId)
      const booking = res.data
      
      if (booking?.tourSchedule?.tour) {
        const tourRes = await tourAPI.getById(booking.tourSchedule.tour.id)
        const tour = tourRes.data
        
        if (tour?.services) {
          setItems(tour.services.map(s => ({
            productId: s.id,
            productName: s.name,
            qty: 1,
            unitPrice: s.price || 0
          })))
        }
      }
    } catch (err) {
      console.error('Failed to load booking details', err)
    }
  }

  const onSubmit = async (values) => {
    try {
      const payload = {
        bookingId: values.bookingId,
        note: values.note,
        details: items.map(i => ({
          productId: i.productId,
          qty: i.qty,
          unitPrice: i.unitPrice
        }))
      }

      await exportVoucherAPI.create(payload)
      message.success('Tạo phiếu xuất thành công')
      setOpen(false)
      form.resetFields()
      setItems([])
      loadVouchers()
    } catch (err) {
      message.error('Failed to create voucher')
    }
  }

  const totalAmount = items.reduce((sum, i) => sum + (i.qty * i.unitPrice), 0)

  const columns = [
    {
      title: 'Mã phiếu',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (date) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Booking',
      dataIndex: 'bookingCode',
      key: 'bookingCode',
      width: 120
    },
    {
      title: 'Tour',
      dataIndex: 'tourName',
      key: 'tourName'
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 150
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
      width: 150,
      align: 'right',
      render: (val) => <Text strong>{numeral(val).format('0,0')} ₫</Text>
    },
    {
      title: 'Người tạo',
      dataIndex: 'createdByName',
      key: 'createdByName',
      width: 120
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      ellipsis: true
    }
  ]

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setOpen(true)}
        >
          Tạo phiếu xuất TOUR
        </Button>
        <Button
          icon={<ReloadOutlined />}
          onClick={loadVouchers}
        >
          Làm mới
        </Button>
      </Space>

      <Table
        dataSource={vouchers}
        rowKey="id"
        columns={columns}
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1000 }}
      />

      <Modal
        open={open}
        onCancel={() => {
          setOpen(false)
          form.resetFields()
          setItems([])
        }}
        title="Tạo phiếu xuất TOUR"
        width={800}
        footer={null}
      >
        <Form form={form} onFinish={onSubmit} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="bookingId"
                label="Chọn Booking"
                rules={[{ required: true, message: 'Vui lòng chọn booking' }]}
              >
                <Select
                  placeholder="Chọn booking"
                  onChange={onSelectBooking}
                  showSearch
                  optionFilterProp="children"
                >
                  {bookings.map(b => (
                    <Select.Option key={b.id} value={b.id}>
                      {b.code} - {b.tourSchedule?.tour?.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="note" label="Ghi chú">
                <Input.TextArea rows={2} placeholder="Nhập ghi chú (nếu có)" />
              </Form.Item>
            </Col>
          </Row>

          {items.length > 0 && (
            <Card title="Danh sách dịch vụ" size="small">
              <Table
                dataSource={items}
                rowKey="productId"
                pagination={false}
                size="small"
                columns={[
                  {
                    title: 'Dịch vụ',
                    dataIndex: 'productName',
                    key: 'productName'
                  },
                  {
                    title: 'Số lượng',
                    dataIndex: 'qty',
                    key: 'qty',
                    width: 100,
                    render: (val, record, idx) => (
                      <InputNumber
                        min={1}
                        value={val}
                        onChange={v => {
                          const newItems = [...items]
                          newItems[idx].qty = v || 1
                          setItems(newItems)
                        }}
                        style={{ width: '100%' }}
                      />
                    )
                  },
                  {
                    title: 'Đơn giá',
                    dataIndex: 'unitPrice',
                    key: 'unitPrice',
                    width: 150,
                    align: 'right',
                    render: (val) => numeral(val).format('0,0') + ' ₫'
                  },
                  {
                    title: 'Thành tiền',
                    key: 'amount',
                    width: 150,
                    align: 'right',
                    render: (_, record) => (
                      <Text strong>{numeral(record.qty * record.unitPrice).format('0,0')} ₫</Text>
                    )
                  }
                ]}
              />
              <div style={{ marginTop: 16, textAlign: 'right' }}>
                <Title level={4}>Tổng cộng: {numeral(totalAmount).format('0,0')} ₫</Title>
              </div>
            </Card>
          )}

          <Form.Item style={{ marginTop: 16, marginBottom: 0 }}>
            <Space>
              <Button type="primary" htmlType="submit">
                Tạo phiếu xuất
              </Button>
              <Button onClick={() => {
                setOpen(false)
                form.resetFields()
                setItems([])
              }}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

// Tab 2: Monthly Profit Report
function MonthlyProfitTab() {
  const [loading, setLoading] = useState(false)
  const [year, setYear] = useState(dayjs().year())
  const [month, setMonth] = useState(dayjs().month() + 1)
  const [profitData, setProfitData] = useState(null)
  const [vouchers, setVouchers] = useState([])

  useEffect(() => {
    loadProfitData()
  }, [year, month])

  const loadProfitData = async () => {
    setLoading(true)
    try {
      const summaryRes = await exportVoucherAPI.getMonthlyProfitSummary(year, month)
      setProfitData(summaryRes.data)
      
      const fromDate = dayjs().year(year).month(month - 1).startOf('month').format('YYYY-MM-DD')
      const toDate = dayjs().year(year).month(month - 1).endOf('month').format('YYYY-MM-DD')
      const vouchersRes = await exportVoucherAPI.getByDateRange(fromDate, toDate)
      setVouchers(vouchersRes.data || [])
    } catch (err) {
      console.error('Failed to load profit data', err)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { title: 'Mã phiếu', dataIndex: 'code', key: 'code' },
    { title: 'Ngày', dataIndex: 'date', key: 'date', render: d => dayjs(d).format('DD/MM/YYYY') },
    { title: 'Tour', dataIndex: 'tourName', key: 'tourName' },
    { title: 'Tổng tiền', dataIndex: 'total', key: 'total', align: 'right', render: v => numeral(v).format('0,0') + ' ₫' },
  ]

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={4}>
          <Select
            value={year}
            onChange={setYear}
            style={{ width: '100%' }}
            options={[
              { value: 2024, label: '2024' },
              { value: 2025, label: '2025' },
              { value: 2026, label: '2026' },
            ]}
          />
        </Col>
        <Col span={4}>
          <Select
            value={month}
            onChange={setMonth}
            style={{ width: '100%' }}
            options={Array.from({ length: 12 }, (_, i) => ({
              value: i + 1,
              label: `Tháng ${i + 1}`
            }))}
          />
        </Col>
        <Col span={4}>
          <Button icon={<ReloadOutlined />} onClick={loadProfitData}>
            Làm mới
          </Button>
        </Col>
      </Row>

      {profitData && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng doanh thu"
                value={profitData.revenue}
                precision={0}
                suffix="₫"
                formatter={v => numeral(v).format('0,0')}
                prefix={<DollarOutlined />}
                valueStyle={{ color: COLOR.blue }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng chi phí (70%)"
                value={profitData.cost}
                precision={0}
                suffix="₫"
                formatter={v => numeral(v).format('0,0')}
                prefix={<DollarOutlined />}
                valueStyle={{ color: COLOR.orange }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Lợi nhuận"
                value={profitData.profit}
                precision={0}
                suffix="₫"
                formatter={v => numeral(v).format('0,0')}
                prefix={<RiseOutlined />}
                valueStyle={{ color: COLOR.green }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Số phiếu xuất"
                value={profitData.exportCount}
                suffix=" phiếu"
              />
            </Card>
          </Col>
        </Row>
      )}

      <Table
        dataSource={vouchers}
        rowKey="id"
        columns={columns}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  )
}

// Tab 3: Yearly Profit Report
function YearlyProfitTab() {
  const [loading, setLoading] = useState(false)
  const [year, setYear] = useState(dayjs().year())
  const [profitData, setProfitData] = useState([])

  useEffect(() => {
    loadYearlyProfit()
  }, [year])

  const loadYearlyProfit = async () => {
    setLoading(true)
    try {
      const res = await exportVoucherAPI.getYearlyProfitReport(year)
      setProfitData(res.data || [])
    } catch (err) {
      console.error('Failed to load yearly profit', err)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: 'Tháng',
      dataIndex: 'date',
      key: 'month',
      render: (d) => `Tháng ${dayjs(d).month() + 1}`
    },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      key: 'revenue',
      align: 'right',
      render: (v) => <Text strong>{numeral(v).format('0,0')} ₫</Text>
    },
    {
      title: 'Chi phí',
      dataIndex: 'cost',
      key: 'cost',
      align: 'right',
      render: (v) => numeral(v).format('0,0') + ' ₫'
    },
    {
      title: 'Lợi nhuận',
      dataIndex: 'profit',
      key: 'profit',
      align: 'right',
      render: (v) => (
        <Text style={{ color: v >= 0 ? COLOR.green : COLOR.red }}>
          {v >= 0 ? '+' : ''}{numeral(v).format('0,0')} ₫
        </Text>
      )
    },
    {
      title: 'Số phiếu',
      dataIndex: 'exportCount',
      key: 'exportCount',
      align: 'center'
    }
  ]

  const totalRevenue = profitData.reduce((sum, p) => sum + (p.revenue || 0), 0)
  const totalCost = profitData.reduce((sum, p) => sum + (p.cost || 0), 0)
  const totalProfit = profitData.reduce((sum, p) => sum + (p.profit || 0), 0)
  const totalExports = profitData.reduce((sum, p) => sum + (p.exportCount || 0), 0)

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={4}>
          <Select
            value={year}
            onChange={setYear}
            style={{ width: '100%' }}
            options={[
              { value: 2024, label: '2024' },
              { value: 2025, label: '2025' },
              { value: 2026, label: '2026' },
            ]}
          />
        </Col>
        <Col span={4}>
          <Button icon={<ReloadOutlined />} onClick={loadYearlyProfit}>
            Làm mới
          </Button>
        </Col>
      </Row>

      <Table
        dataSource={profitData}
        rowKey="date"
        columns={columns}
        loading={loading}
        pagination={false}
        summary={() => (
          <Table.Summary fixed>
            <Table.Summary.Row>
              <Table.Summary.Cell index={0}><Text strong>TỔNG CỘNG</Text></Table.Summary.Cell>
              <Table.Summary.Cell index={1} align="right">
                <Text strong>{numeral(totalRevenue).format('0,0')} ₫</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2} align="right">
                <Text>{numeral(totalCost).format('0,0')} ₫</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={3} align="right">
                <Text strong style={{ color: totalProfit >= 0 ? COLOR.green : COLOR.red }}>
                  {totalProfit >= 0 ? '+' : ''}{numeral(totalProfit).format('0,0')} ₫
                </Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={4} align="center">
                <Text strong>{totalExports}</Text>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          </Table.Summary>
        )}
      />
    </div>
  )
}

// Main Component
// import SalesProfit from './SalesProfit' {
    export default function SalesProfit() {
  const items = [
    {
      key: '1',
      label: 'Danh sách phiếu xuất',
      children: <ExportVoucherTab />
    },
    {
      key: '2',
      label: 'Báo cáo tháng',
      children: <MonthlyProfitTab />
    },
    {
      key: '3',
      label: 'Báo cáo năm',
      children: <YearlyProfitTab />
    }
  ]

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>
        <DollarOutlined style={{ marginRight: 8, color: COLOR.teal }} />
        Quản lý lợi nhuận bán hàng
      </Title>
      <Tabs items={items} />
    </div>
  )
}