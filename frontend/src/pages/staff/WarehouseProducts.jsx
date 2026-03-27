import React, { useEffect, useMemo, useState } from 'react'
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  message,
  Typography,
  Popconfirm,
  Card,
  Row,
  Col,
  Statistic,
  Tooltip,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  WarningOutlined,
  ReloadOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import { productAPI, supplierAPI } from '../../services/api'

const TYPE_COLOR = {
  HOTEL: 'blue',
  FLIGHT: 'purple',
  FOOD: 'green',
  VEHICLE: 'orange',
  ACTIVITY: 'cyan',
  TICKET: 'gold',
  GUIDE: 'geekblue',
  INSURANCE: 'magenta',
  OTHER: 'default',
}

const TYPE_LABEL = {
  HOTEL: 'Khách sạn',
  FLIGHT: 'Vé máy bay',
  FOOD: 'Ăn uống',
  VEHICLE: 'Phương tiện',
  ACTIVITY: 'Hoạt động',
  TICKET: 'Vé tham quan',
  GUIDE: 'Hướng dẫn viên',
  INSURANCE: 'Bảo hiểm',
  OTHER: 'Khác',
}

const STATUS_LABEL = {
  ACTIVE: 'Khả dụng',
  OUT_OF_STOCK: 'Hết khả dụng',
  INACTIVE: 'Ngừng sử dụng',
}

const STATUS_COLOR = {
  ACTIVE: 'green',
  OUT_OF_STOCK: 'red',
  INACTIVE: 'default',
}

const fmt = (v) => new Intl.NumberFormat('vi-VN').format(Number(v || 0))

export default function TourServiceManagement() {
  const [data, setData] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(false)

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [supplierFilter, setSupplierFilter] = useState('')

  const [form] = Form.useForm()

  const load = async () => {
    setLoading(true)
    try {
      const r = await productAPI.getAll({
        search,
        type: typeFilter,
        supplierId: supplierFilter,
        size: 50,
      })
      setData(r.data.data?.content ?? [])
    } catch (error) {
      message.error('Không tải được danh sách dịch vụ')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [search, typeFilter, supplierFilter])

  useEffect(() => {
    supplierAPI
      .getAll({})
      .then((r) => {
        const raw = r.data.data ?? []
        const options = raw.map((s) => ({
          value: s.id,
          label: s.name,
        }))
        setSuppliers(options)
      })
      .catch(() => {
        message.warning('Không tải được danh sách nhà cung cấp')
      })
  }, [])

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    form.setFieldsValue({
      minStock: 10,
      status: 'ACTIVE',
      unit: 'Suất',
      stockQty: 0,
    })
    setOpen(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    form.setFieldsValue({
      ...row,
      supplierId: row.supplierId ?? row.supplier?.id ?? undefined,
    })
    setOpen(true)
  }

  const handleDelete = async (id) => {
    try {
      await productAPI.delete(id)
      message.success('Xóa dịch vụ thành công')
      load()
    } catch (error) {
      message.error(error.response?.data?.message ?? 'Xóa thất bại')
    }
  }

  const onFinish = async (values) => {
    try {
      if (editing) {
        await productAPI.update(editing.id, values)
        message.success('Cập nhật dịch vụ thành công')
      } else {
        await productAPI.create(values)
        message.success('Thêm dịch vụ thành công')
      }
      setOpen(false)
      load()
    } catch (error) {
      message.error(error.response?.data?.message ?? 'Lưu dữ liệu thất bại')
    }
  }

  const lowAvailabilityCount = useMemo(
    () =>
      data.filter(
        (d) => (d.stockQty ?? 0) <= (d.minStock ?? 10)
      ).length,
    [data]
  )

  const totalValue = useMemo(
    () => data.reduce((sum, d) => sum + (d.buyPrice ?? 0) * (d.stockQty ?? 0), 0),
    [data]
  )

  const activeCount = useMemo(
    () => data.filter((d) => d.status === 'ACTIVE').length,
    [data]
  )

  const columns = [
    {
      title: 'Mã',
      dataIndex: 'code',
      width: 100,
      render: (v) => (
        <span style={{ color: '#888', fontSize: 12, fontWeight: 500 }}>
          {v || '--'}
        </span>
      ),
    },
    {
      title: 'Tên dịch vụ',
      dataIndex: 'name',
      render: (v, r) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <strong
              style={{ cursor: 'pointer', color: '#1677ff' }}
              onClick={() => openEdit(r)}
            >
              {v}
            </strong>
            {(r.stockQty ?? 0) <= (r.minStock ?? 10) && (
              <Tooltip title="Sắp hết khả dụng">
                <WarningOutlined style={{ color: '#fa8c16' }} />
              </Tooltip>
            )}
          </div>
          <div style={{ color: '#999', fontSize: 12 }}>
            Đơn vị: {r.unit || 'Chưa cập nhật'}
          </div>
        </div>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      width: 130,
      render: (v) => (
        <Tag color={TYPE_COLOR[v] || 'default'}>
          {TYPE_LABEL[v] || v || 'Khác'}
        </Tag>
      ),
      filters: Object.entries(TYPE_LABEL).map(([k, v]) => ({
        text: v,
        value: k,
      })),
      onFilter: (val, r) => r.type === val,
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: 'supplierName',
      render: (v) => v || 'Chưa gán',
    },
    {
      title: 'Giá đầu vào',
      dataIndex: 'buyPrice',
      align: 'right',
      render: (v) => <span>{fmt(v)} ₫</span>,
      sorter: (a, b) => (a.buyPrice ?? 0) - (b.buyPrice ?? 0),
    },
    {
      title: 'Giá phân bổ',
      dataIndex: 'sellPrice',
      align: 'right',
      render: (v) => <strong>{fmt(v)} ₫</strong>,
      sorter: (a, b) => (a.sellPrice ?? 0) - (b.sellPrice ?? 0),
    },
    {
      title: 'Khả dụng',
      dataIndex: 'stockQty',
      align: 'center',
      width: 110,
      render: (v, r) => {
        const qty = Number(v ?? 0)
        const min = Number(r.minStock ?? 10)
        const color = qty <= 0 ? 'red' : qty <= min ? 'orange' : 'green'
        return <Tag color={color}>{qty}</Tag>
      },
      sorter: (a, b) => (a.stockQty ?? 0) - (b.stockQty ?? 0),
    },
    {
      title: 'Ngưỡng cảnh báo',
      dataIndex: 'minStock',
      align: 'center',
      width: 130,
      render: (v) => v ?? 10,
      sorter: (a, b) => (a.minStock ?? 10) - (b.minStock ?? 10),
    },
    {
      title: 'Tổng chi phí',
      key: 'inventoryValue',
      align: 'right',
      render: (_, r) => (
        <span>{fmt((r.buyPrice ?? 0) * (r.stockQty ?? 0))} ₫</span>
      ),
      sorter: (a, b) =>
        (a.buyPrice ?? 0) * (a.stockQty ?? 0) -
        (b.buyPrice ?? 0) * (b.stockQty ?? 0),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 140,
      render: (v) => (
        <Tag color={STATUS_COLOR[v] || 'default'}>
          {STATUS_LABEL[v] || v || 'Không xác định'}
        </Tag>
      ),
    },
    {
      title: '',
      key: 'act',
      width: 110,
      render: (_, row) => (
        <Space size={6}>
          <Tooltip title="Chỉnh sửa">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEdit(row)}
            />
          </Tooltip>

          <Popconfirm
            title="Xác nhận xóa dịch vụ này?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => handleDelete(row.id)}
          >
            <Tooltip title="Xóa">
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <>
      <Typography.Title level={4} style={{ marginBottom: 18 }}>
        Quản lý tài nguyên & dịch vụ tour
      </Typography.Title>

      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Tổng dịch vụ" value={data.length} />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Dịch vụ khả dụng"
              value={activeCount}
              valueStyle={{ color: '#1D9E75' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Sắp hết khả dụng"
              value={lowAvailabilityCount}
              valueStyle={{ color: lowAvailabilityCount > 0 ? '#fa8c16' : '#1D9E75' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng giá trị dịch vụ"
              value={`${fmt(totalValue)} ₫`}
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
          placeholder="Tìm dịch vụ..."
          style={{ width: 240 }}
          allowClear
          onSearch={setSearch}
          onChange={(e) => {
            if (!e.target.value) setSearch('')
          }}
        />

        <Select
          placeholder="Lọc loại dịch vụ"
          allowClear
          style={{ width: 180 }}
          value={typeFilter || undefined}
          onChange={(value) => setTypeFilter(value || '')}
          options={Object.entries(TYPE_LABEL).map(([k, v]) => ({
            value: k,
            label: v,
          }))}
        />

        <Select
          placeholder="Lọc nhà cung cấp"
          allowClear
          style={{ width: 220 }}
          value={supplierFilter || undefined}
          onChange={(value) => setSupplierFilter(value || '')}
          options={suppliers}
        />

        <Button icon={<ReloadOutlined />} onClick={load}>
          Làm mới
        </Button>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreate}
          style={{ background: '#1D9E75', borderColor: '#1D9E75' }}
        >
          Thêm dịch vụ
        </Button>

        <Button
          icon={<FileTextOutlined />}
          onClick={() =>
            message.info('Chức năng xuất báo cáo tài nguyên đang phát triển')
          }
        >
          Báo cáo dịch vụ
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        size="small"
        bordered
        scroll={{ x: 1300 }}
        pagination={{
          pageSize: 10,
          showTotal: (t) => `Tổng ${t} dịch vụ`,
        }}
      />

      <Modal
        title={editing ? 'Chỉnh sửa dịch vụ tour' : 'Thêm dịch vụ tour mới'}
        open={open}
        width={700}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={12}>
            <Col span={24}>
              <Form.Item
                name="name"
                label="Tên dịch vụ"
                rules={[{ required: true, message: 'Vui lòng nhập tên dịch vụ' }]}
              >
                <Input placeholder="Ví dụ: Khách sạn 3 sao Đà Lạt / Vé cáp treo / Xe 29 chỗ..." />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="type"
                label="Loại dịch vụ"
                rules={[{ required: true, message: 'Vui lòng chọn loại dịch vụ' }]}
              >
                <Select
                  placeholder="Chọn loại dịch vụ"
                  options={Object.entries(TYPE_LABEL).map(([k, v]) => ({
                    value: k,
                    label: v,
                  }))}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="supplierId" label="Nhà cung cấp">
                <Select
                  placeholder="Chọn nhà cung cấp"
                  options={suppliers}
                  allowClear
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="unit" label="Đơn vị tính">
                <Input placeholder="Ví dụ: Vé, Đêm, Suất, Xe, Người..." />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="stockQty"
                label="Số lượng khả dụng"
                tooltip="Số lượng dịch vụ hiện còn có thể sử dụng / phân bổ"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="Nhập số lượng khả dụng"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="minStock"
                label="Ngưỡng cảnh báo"
                tooltip="Khi số lượng khả dụng thấp hơn hoặc bằng mức này, hệ thống sẽ cảnh báo"
                initialValue={10}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="Ví dụ: 10"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                initialValue="ACTIVE"
              >
                <Select
                  options={[
                    { value: 'ACTIVE', label: 'Khả dụng' },
                    { value: 'OUT_OF_STOCK', label: 'Hết khả dụng' },
                    { value: 'INACTIVE', label: 'Ngừng sử dụng' },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="buyPrice"
                label="Giá đầu vào (₫)"
                rules={[{ required: true, message: 'Vui lòng nhập giá đầu vào' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  step={10000}
                  formatter={(v) =>
                    `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }
                  parser={(v) => v?.replace(/,/g, '')}
                  placeholder="Nhập giá đầu vào"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="sellPrice"
                label="Giá phân bổ / dự kiến (₫)"
                rules={[{ required: true, message: 'Vui lòng nhập giá phân bổ' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  step={10000}
                  formatter={(v) =>
                    `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }
                  parser={(v) => v?.replace(/,/g, '')}
                  placeholder="Nhập giá phân bổ"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  )
}