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
  Descriptions,
  Card,
  Row,
  Col,
  Statistic,
  Tooltip,
  Divider,
  Popconfirm,
} from 'antd'

import {
  PlusOutlined,
  EyeOutlined,
  DeleteOutlined,
  ReloadOutlined,
  CheckOutlined,
  CloseOutlined,
} from '@ant-design/icons'

import {
  supplierAPI,
  productAPI,
  importVoucherAPI,
} from '../../services/api'

import dayjs from 'dayjs'

const fmt = (v) =>
  v != null
    ? new Intl.NumberFormat('vi-VN').format(v) + ' ₫'
    : '—'

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

  const [loading, setLoading] = useState(false)

  const [suppliers, setSuppliers] = useState([])
  const [products, setProducts] = useState([])

  const [vouchers, setVouchers] = useState([])

  const [open, setOpen] = useState(false)

  const [detail, setDetail] = useState(null)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const [items, setItems] = useState([
    {
      productId: null,
      qty: 1,
      unitPrice: 0,
    },
  ])

  const [form] = Form.useForm()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)

    try {

      const [
        supplierRes,
        productRes,
        voucherRes,
      ] = await Promise.all([
        supplierAPI.getAll({}),
        productAPI.getAll({ size: 100 }),
        importVoucherAPI.getAll(),
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

      setVouchers(voucherRes.data ?? [])

    } catch (err) {
      console.error(err)
      message.error('Không tải được dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {

    form.resetFields()

    form.setFieldsValue({
      date: dayjs(),
    })

    setItems([
      {
        productId: null,
        qty: 1,
        unitPrice: 0,
      },
    ])

    setOpen(true)
  }

  const addItem = () => {
    setItems([
      ...items,
      {
        productId: null,
        qty: 1,
        unitPrice: 0,
      },
    ])
  }

  const removeItem = (idx) => {

    if (items.length === 1) {
      message.warning('Phiếu nhập phải có ít nhất 1 dòng')
      return
    }

    setItems(items.filter((_, i) => i !== idx))
  }

  const updateItem = (idx, key, value) => {

    const next = [...items]

    next[idx] = {
      ...next[idx],
      [key]: value,
    }

    if (key === 'productId') {

      const p = products.find(x => x.value === value)

      if (p) {
        next[idx].unitPrice = p.price
      }
    }

    setItems(next)
  }

  const total = useMemo(() => {

    return items.reduce((sum, i) => {

      return sum + ((i.qty ?? 0) * (i.unitPrice ?? 0))

    }, 0)

  }, [items])

  const onFinish = async (values) => {

    try {

      const invalid = items.some(i =>
        !i.productId ||
        !i.qty ||
        !i.unitPrice
      )

      if (invalid) {
        message.warning('Vui lòng nhập đầy đủ chi tiết')
        return
      }

      const payload = {
        date: values.date.format('YYYY-MM-DD'),
        supplierId: values.supplierId,
        note: values.note,

        details: items.map(i => ({
          productId: i.productId,
          qty: i.qty,
          unitPrice: i.unitPrice,
        })),
      }

      await importVoucherAPI.create(payload)

      message.success('Lập phiếu nhập thành công')

      setOpen(false)

      form.resetFields()

      setItems([
        {
          productId: null,
          qty: 1,
          unitPrice: 0,
        },
      ])

      loadData()

    } catch (err) {
      console.error(err)
      message.error('Không thể tạo phiếu nhập')
    }
  }

  const approveVoucher = async (id) => {

    try {

      await importVoucherAPI.approve(id)

      message.success('Đã duyệt phiếu nhập')

      loadData()

    } catch (err) {
      console.error(err)
      message.error('Duyệt thất bại')
    }
  }

  const rejectVoucher = async (id) => {

    try {

      await importVoucherAPI.reject(id)

      message.success('Đã từ chối phiếu nhập')

      loadData()

    } catch (err) {
      console.error(err)
      message.error('Từ chối thất bại')
    }
  }

  const deleteVoucher = async (id) => {

    try {

      await importVoucherAPI.delete(id)

      message.success('Đã xóa phiếu nhập')

      loadData()

    } catch (err) {
      console.error(err)
      message.error('Xóa thất bại')
    }
  }

  const filteredVouchers = useMemo(() => {

    return vouchers.filter(v => {

      const matchSearch =
        !search ||
        v.code?.toLowerCase().includes(search.toLowerCase()) ||
        v.supplierName?.toLowerCase().includes(search.toLowerCase())

      const matchStatus =
        !statusFilter ||
        v.status === statusFilter

      return matchSearch && matchStatus
    })

  }, [vouchers, search, statusFilter])

  const totalVouchers = vouchers.length

  const pendingCount =
    vouchers.filter(v => v.status === 'PENDING').length

  const approvedCount =
    vouchers.filter(v => v.status === 'APPROVED').length

  const totalAmount =
    vouchers.reduce((s, v) => s + (v.total ?? 0), 0)

  const cols = [

    {
      title: 'Số phiếu',
      dataIndex: 'code',
      render: v => <strong>{v}</strong>,
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

      render: v => (
        <strong style={{ color: '#1D9E75' }}>
          {fmt(v)}
        </strong>
      ),
    },

    {
      title: 'Người lập',
      dataIndex: 'createdBy',
      width: 140,
    },

    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 130,

      render: v => (
        <Tag color={STATUS_COLOR[v]}>
          {STATUS_LABEL[v]}
        </Tag>
      ),
    },

    {
      title: 'Thao tác',
      width: 240,

      render: (_, row) => (

        <div style={{ display: 'flex', gap: 6 }}>

          <Tooltip title="Xem chi tiết">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setDetail(row)}
            />
          </Tooltip>

          {
            row.status === 'PENDING' && (
              <>
                <Tooltip title="Duyệt phiếu">
                  <Button
                    size="small"
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={() => approveVoucher(row.id)}
                  />
                </Tooltip>

                <Tooltip title="Từ chối">
                  <Button
                    danger
                    size="small"
                    icon={<CloseOutlined />}
                    onClick={() => rejectVoucher(row.id)}
                  />
                </Tooltip>
              </>
            )
          }

          <Popconfirm
            title="Xóa phiếu nhập?"
            onConfirm={() => deleteVoucher(row.id)}
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
            />
          </Popconfirm>

        </div>
      ),
    },
  ]

  return (
    <>
      <Typography.Title level={4}>
        Phiếu nhập dịch vụ tour
      </Typography.Title>

      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng phiếu nhập"
              value={totalVouchers}
            />
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
              title="Tổng giá trị"
              value={fmt(totalAmount)}
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
        }}
      >

        <Input.Search
          placeholder="Tìm số phiếu..."
          style={{ width: 250 }}
          allowClear
          onSearch={setSearch}
        />

        <Select
          placeholder="Lọc trạng thái"
          style={{ width: 180 }}
          allowClear
          value={statusFilter || undefined}
          onChange={(v) => setStatusFilter(v || '')}
          options={[
            {
              value: 'APPROVED',
              label: 'Đã duyệt',
            },
            {
              value: 'PENDING',
              label: 'Chờ duyệt',
            },
            {
              value: 'REJECTED',
              label: 'Từ chối',
            },
          ]}
        />

        <Button
          icon={<ReloadOutlined />}
          onClick={loadData}
        >
          Làm mới
        </Button>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreate}
          style={{
            background: '#1D9E75',
            borderColor: '#1D9E75',
          }}
        >
          Lập phiếu nhập
        </Button>

      </div>

      <Table
        bordered
        size="small"
        rowKey="id"
        loading={loading}
        columns={cols}
        dataSource={filteredVouchers}
      />

      <Modal
        title="Lập phiếu nhập"
        open={open}
        width={820}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        okText="Lưu phiếu"
      >

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >

          <Row gutter={12}>

            <Col span={12}>
              <Form.Item
                name="supplierId"
                label="Nhà cung cấp"
                rules={[
                  {
                    required: true,
                    message: 'Chọn nhà cung cấp',
                  },
                ]}
              >
                <Select
                  placeholder="Chọn nhà cung cấp"
                  options={suppliers}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="date"
                label="Ngày nhập"
                rules={[
                  {
                    required: true,
                    message: 'Chọn ngày nhập',
                  },
                ]}
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

            <div
              style={{
                fontWeight: 600,
                marginBottom: 10,
              }}
            >
              Chi tiết nhập
            </div>

            {
              items.map((item, idx) => (

                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      '2fr 1fr 1fr auto',
                    gap: 8,
                    marginBottom: 8,
                  }}
                >

                  <Select
                    placeholder="Chọn dịch vụ"
                    options={products}
                    value={item.productId}
                    onChange={(v) =>
                      updateItem(idx, 'productId', v)
                    }
                    showSearch
                    optionFilterProp="label"
                  />

                  <InputNumber
                    min={1}
                    value={item.qty}
                    style={{ width: '100%' }}
                    onChange={(v) =>
                      updateItem(idx, 'qty', v)
                    }
                  />

                  <InputNumber
                    min={0}
                    value={item.unitPrice}
                    style={{ width: '100%' }}
                    onChange={(v) =>
                      updateItem(idx, 'unitPrice', v)
                    }
                    formatter={(v) =>
                      `${v}`.replace(
                        /\B(?=(\d{3})+(?!\d))/g,
                        ','
                      )
                    }
                    parser={(v) =>
                      v?.replace(/,/g, '')
                    }
                  />

                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeItem(idx)}
                  />

                </div>
              ))
            }

            <Button
              size="small"
              onClick={addItem}
            >
              + Thêm dòng
            </Button>

          </div>

          <div
            style={{
              textAlign: 'right',
              fontWeight: 600,
              fontSize: 16,
              marginBottom: 10,
            }}
          >
            Tổng cộng:
            <span
              style={{
                color: '#1D9E75',
                marginLeft: 8,
              }}
            >
              {fmt(total)}
            </span>
          </div>

          <Form.Item
            name="note"
            label="Ghi chú"
          >
            <Input.TextArea rows={3} />
          </Form.Item>

        </Form>

      </Modal>

      <Modal
        footer={null}
        width={850}
        open={!!detail}
        onCancel={() => setDetail(null)}
        title={`Chi tiết phiếu nhập ${detail?.code || ''}`}
      >

        {
          detail && (
            <>
              <Descriptions
                bordered
                size="small"
                column={2}
              >

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
                  <Tag color={STATUS_COLOR[detail.status]}>
                    {STATUS_LABEL[detail.status]}
                  </Tag>
                </Descriptions.Item>

                <Descriptions.Item label="Ghi chú" span={2}>
                  {detail.note || 'Không có'}
                </Descriptions.Item>

                <Descriptions.Item label="Tổng giá trị" span={2}>
                  <strong style={{ color: '#1D9E75' }}>
                    {fmt(detail.total)}
                  </strong>
                </Descriptions.Item>

              </Descriptions>

              <Divider />

              <Typography.Title level={5}>
                Danh sách dịch vụ
              </Typography.Title>

              <Table
                bordered
                size="small"
                pagination={false}
                dataSource={detail.details || []}
                rowKey="id"
                columns={[
                  {
                    title: 'Tên dịch vụ',
                    dataIndex: 'productName',
                  },

                  {
                    title: 'Số lượng',
                    dataIndex: 'qty',
                    width: 100,
                    align: 'center',
                  },

                  {
                    title: 'Đơn giá',
                    dataIndex: 'unitPrice',
                    width: 150,
                    align: 'right',
                    render: (v) => fmt(v),
                  },

                  {
                    title: 'Thành tiền',
                    dataIndex: 'amount',
                    width: 160,
                    align: 'right',
                    render: (v) => fmt(v),
                  },
                ]}
              />
            </>
          )
        }

      </Modal>
    </>
  )
}