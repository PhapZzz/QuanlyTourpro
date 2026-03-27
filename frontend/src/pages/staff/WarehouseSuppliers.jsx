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
  ReloadOutlined,
  PhoneOutlined,
  MailOutlined,
  UserOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons'
import { supplierAPI } from '../../services/api'

const TYPE_LABEL = {
  HOTEL: 'Khách sạn',
  TRANSPORT: 'Vận chuyển',
  FOOD: 'Ăn uống',
  ENTERTAINMENT: 'Vui chơi',
  FLIGHT: 'Hàng không',
  GUIDE: 'Hướng dẫn viên',
  INSURANCE: 'Bảo hiểm',
  OTHER: 'Khác',
}

const TYPE_COLOR = {
  HOTEL: 'blue',
  TRANSPORT: 'orange',
  FOOD: 'green',
  ENTERTAINMENT: 'purple',
  FLIGHT: 'geekblue',
  GUIDE: 'cyan',
  INSURANCE: 'magenta',
  OTHER: 'default',
}

const STATUS_LABEL = {
  ACTIVE: 'Đang hợp tác',
  INACTIVE: 'Ngừng hợp tác',
}

const STATUS_COLOR = {
  ACTIVE: 'green',
  INACTIVE: 'default',
}

export default function TourSuppliersManagement() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const [form] = Form.useForm()

  const load = async () => {
    setLoading(true)
    try {
      const r = await supplierAPI.getAll({
        search,
        type: typeFilter,
        status: statusFilter,
      })
      setData(r.data.data ?? [])
    } catch (error) {
      message.error('Không tải được danh sách đối tác')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [search, typeFilter, statusFilter])

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    form.setFieldsValue({
      status: 'ACTIVE',
      type: 'OTHER',
    })
    setOpen(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    form.setFieldsValue(row)
    setOpen(true)
  }

  const onFinish = async (values) => {
    try {
      if (editing) {
        await supplierAPI.update(editing.id, values)
        message.success('Cập nhật đối tác thành công')
      } else {
        await supplierAPI.create(values)
        message.success('Thêm đối tác thành công')
      }
      setOpen(false)
      load()
    } catch (e) {
      message.error(e.response?.data?.message ?? 'Lưu dữ liệu thất bại')
    }
  }

  const handleDeactivate = async (row) => {
    try {
      await supplierAPI.update(row.id, { ...row, status: 'INACTIVE' })
      message.success('Đã chuyển trạng thái ngừng hợp tác')
      load()
    } catch (error) {
      message.error(error.response?.data?.message ?? 'Thao tác thất bại')
    }
  }

  const totalSuppliers = useMemo(() => data.length, [data])
  const activeSuppliers = useMemo(
    () => data.filter((s) => s.status === 'ACTIVE').length,
    [data]
  )
  const inactiveSuppliers = useMemo(
    () => data.filter((s) => s.status === 'INACTIVE').length,
    [data]
  )

  const columns = [
    {
      title: 'Mã',
      dataIndex: 'code',
      width: 90,
      render: (v) => (
        <span style={{ color: '#888', fontSize: 12, fontWeight: 500 }}>
          {v || '--'}
        </span>
      ),
    },
    {
      title: 'Tên đối tác',
      dataIndex: 'name',
      render: (v, r) => (
        <div>
          <strong
            style={{ cursor: 'pointer', color: '#1677ff' }}
            onClick={() => openEdit(r)}
          >
            {v}
          </strong>
          <div style={{ color: '#999', fontSize: 12 }}>
            {r.address || 'Chưa cập nhật địa chỉ'}
          </div>
        </div>
      ),
    },
    {
      title: 'Loại dịch vụ',
      dataIndex: 'type',
      width: 150,
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
      title: 'Liên hệ',
      key: 'contact',
      render: (_, r) => (
        <div style={{ fontSize: 13 }}>
          <div>
            <PhoneOutlined style={{ marginRight: 6, color: '#888' }} />
            {r.phone || '---'}
          </div>
          <div>
            <MailOutlined style={{ marginRight: 6, color: '#888' }} />
            {r.email || '---'}
          </div>
        </div>
      ),
    },
    {
      title: 'Người liên hệ',
      dataIndex: 'contactPerson',
      render: (v) => (
        <span>
          <UserOutlined style={{ marginRight: 6, color: '#888' }} />
          {v || 'Chưa cập nhật'}
        </span>
      ),
    },
    {
      title: 'Mã số thuế',
      dataIndex: 'taxCode',
      render: (v) => v || '---',
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
      filters: [
        { text: 'Đang hợp tác', value: 'ACTIVE' },
        { text: 'Ngừng hợp tác', value: 'INACTIVE' },
      ],
      onFilter: (val, r) => r.status === val,
    },
    {
      title: '',
      key: 'act',
      width: 120,
      render: (_, row) => (
        <Space size={6}>
          <Tooltip title="Chỉnh sửa">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEdit(row)}
            />
          </Tooltip>

          {row.status !== 'INACTIVE' && (
            <Popconfirm
              title="Chuyển đối tác này sang ngừng hợp tác?"
              okText="Xác nhận"
              cancelText="Hủy"
              onConfirm={() => handleDeactivate(row)}
            >
              <Tooltip title="Ngừng hợp tác">
                <Button size="small" danger icon={<DeleteOutlined />} />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  return (
    <>
      <Typography.Title level={4} style={{ marginBottom: 18 }}>
        Quản lý nhà cung cấp dịch vụ tour
      </Typography.Title>

      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic title="Tổng đối tác" value={totalSuppliers} />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Đang hợp tác"
              value={activeSuppliers}
              valueStyle={{ color: '#1D9E75' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Ngừng hợp tác"
              value={inactiveSuppliers}
              valueStyle={{ color: inactiveSuppliers > 0 ? '#fa8c16' : '#999' }}
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
          placeholder="Tìm nhà cung cấp / đối tác..."
          style={{ width: 260 }}
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
          placeholder="Lọc trạng thái"
          allowClear
          style={{ width: 160 }}
          value={statusFilter || undefined}
          onChange={(value) => setStatusFilter(value || '')}
          options={[
            { value: 'ACTIVE', label: 'Đang hợp tác' },
            { value: 'INACTIVE', label: 'Ngừng hợp tác' },
          ]}
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
          Thêm đối tác
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        size="small"
        bordered
        scroll={{ x: 1200 }}
        pagination={{
          pageSize: 10,
          showTotal: (t) => `Tổng ${t} đối tác`,
        }}
      />

      <Modal
        title={editing ? 'Chỉnh sửa đối tác dịch vụ' : 'Thêm nhà cung cấp dịch vụ'}
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
                label="Tên nhà cung cấp / đối tác"
                rules={[{ required: true, message: 'Vui lòng nhập tên đối tác' }]}
              >
                <Input placeholder="Ví dụ: Khách sạn Mường Thanh / Nhà xe Thành Bưởi..." />
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
              <Form.Item name="status" label="Trạng thái" initialValue="ACTIVE">
                <Select
                  options={[
                    { value: 'ACTIVE', label: 'Đang hợp tác' },
                    { value: 'INACTIVE', label: 'Ngừng hợp tác' },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="phone" label="Số điện thoại">
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="email" label="Email">
                <Input placeholder="Nhập email liên hệ" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="taxCode" label="Mã số thuế">
                <Input placeholder="Nhập mã số thuế" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="contactPerson" label="Người liên hệ">
                <Input placeholder="Nhập tên người liên hệ" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item name="address" label="Địa chỉ">
                <Input
                  prefix={<EnvironmentOutlined style={{ color: '#999' }} />}
                  placeholder="Nhập địa chỉ nhà cung cấp"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  )
}