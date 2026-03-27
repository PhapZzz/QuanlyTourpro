// doi db phieunhap+phieunhapchitiet

import React, { useEffect, useMemo, useState } from 'react'
import {
  Table,
  Button,
  Tag,
  Modal,
  Form,
  Select,
  DatePicker,
  InputNumber,
  Input,
  message,
  Typography,
  Space,
  Descriptions,
  Card,
  Row,
  Col,
  Statistic,
  Tooltip,
  Divider,
} from 'antd'
import {
  PlusOutlined,
  EyeOutlined,
  DeleteOutlined,
  ReloadOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import { supplierAPI, productAPI } from '../../services/api'
import dayjs from 'dayjs'

const fmt = (v) =>
  v != null ? new Intl.NumberFormat('vi-VN').format(v) + ' ₫' : '—'

const STATUS_LABEL = {
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
  PENDING: 'Chờ duyệt',
}

const STATUS_COLOR = {
  APPROVED: 'green',
  REJECTED: 'red',
  PENDING: 'orange',
}

export default function ServiceImportVouchers() {
  const [suppliers, setSuppliers] = useState([])
  const [products, setProducts] = useState([])

  const [loading, setLoading] = useState(false)

  const [vouchers, setVouchers] = useState([
    {
      id: 1,
      code: 'PN-2026-031',
      date: '2026-03-15',
      supplierId: 1,
      supplierName: 'Vietnam Airlines',
      total: 47500000,
      status: 'APPROVED',
      createdBy: 'Lê Văn Kho',
      note: 'Nhập vé máy bay cho tour Đà Nẵng',
      items: [
        { productName: 'Vé máy bay khứ hồi TP.HCM - Đà Nẵng', qty: 25, unitPrice: 1900000 },
      ],
    },
    {
      id: 2,
      code: 'PN-2026-030',
      date: '2026-03-14',
      supplierId: 2,
      supplierName: 'Khách sạn Mường Thanh',
      total: 36000000,
      status: 'APPROVED',
      createdBy: 'Lê Văn Kho',
      note: 'Đặt phòng khách sạn cho tour team building',
      items: [
        { productName: 'Phòng khách sạn 3 sao Đà Lạt', qty: 12, unitPrice: 3000000 },
      ],
    },
    {
      id: 3,
      code: 'PN-2026-029',
      date: '2026-03-10',
      supplierId: 3,
      supplierName: 'Nhà hàng Biển Xanh',
      total: 16000000,
      status: 'PENDING',
      createdBy: 'Lê Văn Kho',
      note: 'Nhập suất ăn trưa cho đoàn khách',
      items: [
        { productName: 'Suất ăn trưa hải sản', qty: 40, unitPrice: 400000 },
      ],
    },
  ])

  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState(null)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const [items, setItems] = useState([{ productId: null, qty: 1, unitPrice: 0 }])
  const [form] = Form.useForm()

  useEffect(() => {
    loadMasterData()
  }, [])

  const loadMasterData = async () => {
    setLoading(true)
    try {
      const [supplierRes, productRes] = await Promise.all([
        supplierAPI.getAll({}),
        productAPI.getAll({ size: 100 }),
      ])

      setSuppliers(
        (supplierRes.data.data ?? []).map((s) => ({
          value: s.id,
          label: s.name,
        }))
      )

      setProducts(
        (productRes.data.data?.content ?? []).map((p) => ({
          value: p.id,
          label: p.name,
          price: p.buyPrice ?? 0,
        }))
      )
    } catch (error) {
      message.error('Không tải được dữ liệu dịch vụ / nhà cung cấp')
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    form.resetFields()
    form.setFieldsValue({
      date: dayjs(),
    })
    setItems([{ productId: null, qty: 1, unitPrice: 0 }])
    setOpen(true)
  }

  const addItem = () => {
    setItems([...items, { productId: null, qty: 1, unitPrice: 0 }])
  }

  const removeItem = (i) => {
    if (items.length === 1) {
      message.warning('Phiếu nhập phải có ít nhất 1 dòng dịch vụ')
      return
    }
    setItems(items.filter((_, idx) => idx !== i))
  }

  const updateItem = (i, key, val) => {
    const next = [...items]
    next[i] = { ...next[i], [key]: val }

    if (key === 'productId') {
      const p = products.find((p) => p.value === val)
      if (p) next[i].unitPrice = p.price
    }

    setItems(next)
  }

  const total = useMemo(
    () => items.reduce((s, i) => s + (i.qty ?? 0) * (i.unitPrice ?? 0), 0),
    [items]
  )

  const onFinish = async (values) => {
    try {
      const invalid = items.some((i) => !i.productId || !i.qty || !i.unitPrice)
      if (invalid) {
        message.warning('Vui lòng nhập đầy đủ chi tiết dịch vụ')
        return
      }

      const supplierName =
        suppliers.find((s) => s.value === values.supplierId)?.label || 'Không xác định'

      const voucherItems = items.map((i) => {
        const product = products.find((p) => p.value === i.productId)
        return {
          productId: i.productId,
          productName: product?.label || 'Dịch vụ',
          qty: i.qty,
          unitPrice: i.unitPrice,
          lineTotal: (i.qty ?? 0) * (i.unitPrice ?? 0),
        }
      })

      const code = `PN-${new Date().getFullYear()}-${String(vouchers.length + 1).padStart(3, '0')}`

      const newVoucher = {
        id: Date.now(),
        code,
        date: values.date?.format('YYYY-MM-DD'),
        supplierId: values.supplierId,
        supplierName,
        total,
        status: 'PENDING',
        createdBy: 'Bạn',
        note: values.note || '',
        items: voucherItems,
      }

      setVouchers([newVoucher, ...vouchers])
      message.success('Lập phiếu nhập dịch vụ thành công')

      setOpen(false)
      form.resetFields()
      setItems([{ productId: null, qty: 1, unitPrice: 0 }])
    } catch (error) {
      message.error('Có lỗi xảy ra khi lập phiếu nhập')
    }
  }

  const filteredVouchers = useMemo(() => {
    return vouchers.filter((v) => {
      const matchSearch =
        !search ||
        v.code?.toLowerCase().includes(search.toLowerCase()) ||
        v.supplierName?.toLowerCase().includes(search.toLowerCase())

      const matchStatus = !statusFilter || v.status === statusFilter

      return matchSearch && matchStatus
    })
  }, [vouchers, search, statusFilter])

  const totalVouchers = vouchers.length
  const pendingCount = vouchers.filter((v) => v.status === 'PENDING').length
  const approvedCount = vouchers.filter((v) => v.status === 'APPROVED').length
  const totalAmount = vouchers.reduce((s, v) => s + (v.total ?? 0), 0)

  const cols = [
    {
      title: 'Số phiếu',
      dataIndex: 'code',
      render: (v) => <strong>{v}</strong>,
    },
    {
      title: 'Ngày nhập',
      dataIndex: 'date',
      width: 120,
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: 'supplierName',
    },
    {
      title: 'Tổng giá trị',
      dataIndex: 'total',
      align: 'right',
      render: (v) => <strong style={{ color: '#1D9E75' }}>{fmt(v)}</strong>,
      sorter: (a, b) => (a.total ?? 0) - (b.total ?? 0),
    },
    {
      title: 'Người lập',
      dataIndex: 'createdBy',
      width: 130,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 130,
      render: (v) => (
        <Tag color={STATUS_COLOR[v] || 'default'}>
          {STATUS_LABEL[v] || v}
        </Tag>
      ),
      filters: [
        { text: 'Đã duyệt', value: 'APPROVED' },
        { text: 'Chờ duyệt', value: 'PENDING' },
        { text: 'Từ chối', value: 'REJECTED' },
      ],
      onFilter: (val, r) => r.status === val,
    },
    {
      title: '',
      key: 'act',
      width: 80,
      render: (_, row) => (
        <Tooltip title="Xem chi tiết phiếu nhập">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => setDetail(row)}
          >
            Xem
          </Button>
        </Tooltip>
      ),
    },
  ]

  return (
    <>
      <Typography.Title level={4} style={{ marginBottom: 18 }}>
        Phiếu nhập dịch vụ tour
      </Typography.Title>

      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Tổng phiếu nhập" value={totalVouchers} />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đã duyệt"
              value={approvedCount}
              valueStyle={{ color: '#1D9E75' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Chờ duyệt"
              value={pendingCount}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng giá trị nhập"
              value={fmt(totalAmount)}
              valueStyle={{ fontSize: 16 }}
            />
          </Card>
        </Col>
      </Row>

      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 12,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <Input.Search
          placeholder="Tìm số phiếu / nhà cung cấp..."
          style={{ width: 260 }}
          allowClear
          onSearch={setSearch}
          onChange={(e) => {
            if (!e.target.value) setSearch('')
          }}
        />

        <Select
          placeholder="Lọc trạng thái"
          allowClear
          style={{ width: 160 }}
          value={statusFilter || undefined}
          onChange={(value) => setStatusFilter(value || '')}
          options={[
            { value: 'APPROVED', label: 'Đã duyệt' },
            { value: 'PENDING', label: 'Chờ duyệt' },
            { value: 'REJECTED', label: 'Từ chối' },
          ]}
        />

        <Button icon={<ReloadOutlined />} onClick={loadMasterData}>
          Làm mới
        </Button>

        <Button icon={<FileTextOutlined />} onClick={() => message.info('Chức năng xuất báo cáo đang phát triển')}>
          Báo cáo
        </Button>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreate}
          style={{ background: '#1D9E75', borderColor: '#1D9E75' }}
        >
          Lập phiếu nhập
        </Button>
      </div>

      <Table
        columns={cols}
        dataSource={filteredVouchers}
        rowKey="id"
        loading={loading}
        size="small"
        bordered
        pagination={{
          pageSize: 10,
          showTotal: (t) => `Tổng ${t} phiếu nhập`,
        }}
      />

      <Modal
        title="Lập phiếu nhập dịch vụ"
        open={open}
        width={820}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        okText="Lưu phiếu"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={12}>
            <Col xs={24} md={12}>
              <Form.Item
                name="supplierId"
                label="Nhà cung cấp dịch vụ"
                rules={[{ required: true, message: 'Vui lòng chọn nhà cung cấp' }]}
              >
                <Select
                  placeholder="Chọn nhà cung cấp"
                  options={suppliers}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="date"
                label="Ngày nhập"
                rules={[{ required: true, message: 'Vui lòng chọn ngày nhập' }]}
                initialValue={dayjs()}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
          </Row>

          <div
            style={{
              border: '1px solid #f0f0f0',
              borderRadius: 10,
              padding: 14,
              marginBottom: 12,
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 10 }}>
              Chi tiết dịch vụ nhập
            </div>

            {items.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2.2fr 0.9fr 1fr auto',
                  gap: 8,
                  marginBottom: 8,
                  alignItems: 'center',
                }}
              >
                <Select
                  placeholder="Chọn dịch vụ"
                  options={products}
                  value={item.productId}
                  onChange={(v) => updateItem(i, 'productId', v)}
                  showSearch
                  optionFilterProp="label"
                />

                <InputNumber
                  placeholder="SL"
                  min={1}
                  value={item.qty}
                  onChange={(v) => updateItem(i, 'qty', v)}
                  style={{ width: '100%' }}
                />

                <InputNumber
                  placeholder="Đơn giá"
                  min={0}
                  value={item.unitPrice}
                  onChange={(v) => updateItem(i, 'unitPrice', v)}
                  style={{ width: '100%' }}
                  formatter={(v) =>
                    `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }
                  parser={(v) => v?.replace(/,/g, '')}
                />

                <Button
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => removeItem(i)}
                />
              </div>
            ))}

            <Button size="small" onClick={addItem} style={{ marginTop: 4 }}>
              + Thêm dòng dịch vụ
            </Button>
          </div>

          <div
            style={{
              textAlign: 'right',
              fontWeight: 600,
              fontSize: 16,
              marginBottom: 8,
            }}
          >
            Tổng cộng:{' '}
            <span style={{ color: '#1D9E75' }}>{fmt(total)}</span>
          </div>

          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea
              rows={3}
              placeholder="Ví dụ: nhập dịch vụ cho tour Đà Nẵng tháng 4..."
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Chi tiết phiếu nhập – ${detail?.code || ''}`}
        open={!!detail}
        onCancel={() => setDetail(null)}
        footer={null}
        width={820}
      >
        {detail && (
          <>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Số phiếu">
                {detail.code}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày nhập">
                {detail.date}
              </Descriptions.Item>
              <Descriptions.Item label="Nhà cung cấp" span={2}>
                {detail.supplierName}
              </Descriptions.Item>
              <Descriptions.Item label="Người lập">
                {detail.createdBy}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={STATUS_COLOR[detail.status] || 'default'}>
                  {STATUS_LABEL[detail.status] || detail.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú" span={2}>
                {detail.note || 'Không có'}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng giá trị" span={2}>
                <strong style={{ color: '#1D9E75' }}>{fmt(detail.total)}</strong>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Typography.Title level={5} style={{ marginTop: 0 }}>
              Danh sách dịch vụ nhập
            </Typography.Title>

            <Table
              size="small"
              rowKey={(r, idx) => idx}
              pagination={false}
              dataSource={detail.items || []}
              columns={[
                {
                  title: 'Tên dịch vụ',
                  dataIndex: 'productName',
                },
                {
                  title: 'Số lượng',
                  dataIndex: 'qty',
                  align: 'center',
                  width: 100,
                },
                {
                  title: 'Đơn giá',
                  dataIndex: 'unitPrice',
                  align: 'right',
                  width: 150,
                  render: (v) => fmt(v),
                },
                {
                  title: 'Thành tiền',
                  dataIndex: 'lineTotal',
                  align: 'right',
                  width: 160,
                  render: (_, r) => fmt((r.qty ?? 0) * (r.unitPrice ?? 0)),
                },
              ]}
            />
          </>
        )}
      </Modal>
    </>
  )
}