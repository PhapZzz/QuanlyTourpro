import React, { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'

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
  DatePicker,
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

const fmt = (v) =>
  new Intl.NumberFormat('vi-VN').format(Number(v || 0))

export default function TourServiceManagement() {
  const [data, setData] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [statistics, setStatistics] = useState([])

  const [loading, setLoading] = useState(false)
  const [reportLoading, setReportLoading] = useState(false)

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const [statMonth, setStatMonth] = useState(dayjs().month() + 1)
  const [statYear, setStatYear] = useState(dayjs().year())

  const [form] = Form.useForm()

  // ================= LOAD PRODUCTS =================

  const load = async () => {
    setLoading(true)

    try {
      const r = await productAPI.getAll({
        search,
        type: typeFilter,
        size: 50,
      })

      setData(r.data.data?.content ?? [])
    } catch (error) {
      message.error('Không tải được danh sách dịch vụ')
    } finally {
      setLoading(false)
    }
  }

  // ================= LOAD SUPPLIERS =================

  const loadSuppliers = async () => {
    try {
      const r = await supplierAPI.getAll({})

      const raw = r.data.data?.content || r.data.data || []

      setSuppliers(
        raw.map((s) => ({
          value: s.id,
          label: s.name,
        }))
      )
    } catch (error) {
      message.warning('Không tải được danh sách nhà cung cấp')
    }
  }

  // ================= LOAD REPORT =================

  const loadStatistics = async () => {
    setReportLoading(true)

    try {
      const r = await productAPI.statistics(
        statMonth,
        statYear
      )

      setStatistics(r.data.data || [])
    } catch (error) {
      message.error('Không tải được báo cáo thống kê')
    } finally {
      setReportLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [search, typeFilter])

  useEffect(() => {
    loadSuppliers()
  }, [])

  useEffect(() => {
    loadStatistics()
  }, [statMonth, statYear])

  // ================= CREATE =================

  const openCreate = () => {
    setEditing(null)

    form.resetFields()

    form.setFieldsValue({
      minStock: 10,
      stockQty: 0,
      status: 'ACTIVE',
      unit: 'Suất',
    })

    setOpen(true)
  }

  // ================= EDIT =================

  const openEdit = (row) => {
    setEditing(row)

    form.setFieldsValue({
      ...row,
      supplierId:
        row.supplierId ??
        row.supplier?.id ??
        undefined,
    })

    setOpen(true)
  }

  // ================= DELETE =================

  const handleDelete = async (id) => {
    try {
      await productAPI.delete(id)

      message.success(
        'Đã chuyển dịch vụ sang ngừng sử dụng'
      )

      load()
    } catch (error) {
      message.error(
        error.response?.data?.message ??
          'Thao tác thất bại'
      )
    }
  }

  // ================= SAVE =================

  const onFinish = async (values) => {
    try {
      const payload = {
        ...values,
      }

      if (!editing) {
        delete payload.status
      }

      if (editing) {
        await productAPI.update(
          editing.id,
          payload
        )

        message.success(
          'Cập nhật dịch vụ thành công'
        )
      } else {
        await productAPI.create(payload)

        message.success(
          'Thêm dịch vụ thành công'
        )
      }

      setOpen(false)

      load()
    } catch (error) {
      message.error(
        error.response?.data?.message ??
          'Lưu dữ liệu thất bại'
      )
    }
  }

  // ================= DASHBOARD STATS =================

  const lowAvailabilityCount = useMemo(
    () =>
      data.filter(
        (d) =>
          (d.stockQty ?? 0) <=
          (d.minStock ?? 10)
      ).length,
    [data]
  )

  const totalValue = useMemo(
    () =>
      data.reduce(
        (sum, d) =>
          sum +
          (d.buyPrice ?? 0) *
            (d.stockQty ?? 0),
        0
      ),
    [data]
  )

  const activeCount = useMemo(
    () =>
      data.filter(
        (d) => d.status === 'ACTIVE'
      ).length,
    [data]
  )

  // ================= PRODUCT TABLE =================

  const columns = [
    {
      title: 'Mã',
      dataIndex: 'code',
      width: 100,

      render: (v) => (
        <span
          style={{
            color: '#888',
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          {v || '--'}
        </span>
      ),
    },

    {
      title: 'Tên dịch vụ',
      dataIndex: 'name',

      render: (v, r) => (
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <strong
              style={{
                cursor: 'pointer',
                color: '#1677ff',
              }}
              onClick={() => openEdit(r)}
            >
              {v}
            </strong>

            {(r.stockQty ?? 0) <=
              (r.minStock ?? 10) && (
              <Tooltip title="Sắp hết khả dụng">
                <WarningOutlined
                  style={{
                    color: '#fa8c16',
                  }}
                />
              </Tooltip>
            )}
          </div>

          <div
            style={{
              color: '#999',
              fontSize: 12,
            }}
          >
            Đơn vị:{' '}
            {r.unit || 'Chưa cập nhật'}
          </div>
        </div>
      ),
    },

    {
      title: 'Loại',
      dataIndex: 'type',
      width: 150,

      render: (v) => (
        <Tag
          color={
            TYPE_COLOR[v] || 'default'
          }
        >
          {TYPE_LABEL[v] ||
            v ||
            'Khác'}
        </Tag>
      ),
    },

    {
      title: 'Nhà cung cấp',
      dataIndex: 'supplierName',

      render: (v) =>
        v || 'Chưa gán',
    },

    {
      title: 'Giá đầu vào',
      dataIndex: 'buyPrice',
      align: 'right',

      render: (v) => (
        <span>{fmt(v)} ₫</span>
      ),
    },

    {
      title: 'Giá phân bổ',
      dataIndex: 'sellPrice',
      align: 'right',

      render: (v) => (
        <strong>{fmt(v)} ₫</strong>
      ),
    },

    {
      title: 'Khả dụng',
      dataIndex: 'stockQty',
      align: 'center',
      width: 120,

      render: (v, r) => {
        const qty = Number(v ?? 0)

        const min = Number(
          r.minStock ?? 10
        )

        const color =
          qty <= 0
            ? 'red'
            : qty <= min
            ? 'orange'
            : 'green'

        return (
          <Tag color={color}>
            {qty}
          </Tag>
        )
      },
    },

    {
      title: 'Ngưỡng cảnh báo',
      dataIndex: 'minStock',
      align: 'center',
      width: 140,

      render: (v) => v ?? 10,
    },

    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 150,

      render: (v) => (
        <Tag
          color={
            STATUS_COLOR[v] ||
            'default'
          }
        >
          {STATUS_LABEL[v] ||
            v ||
            'Không xác định'}
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
              onClick={() =>
                openEdit(row)
              }
            />
          </Tooltip>

          <Popconfirm
            title="Chuyển dịch vụ sang ngừng sử dụng?"
            okText="Xác nhận"
            cancelText="Hủy"
            onConfirm={() =>
              handleDelete(row.id)
            }
          >
            <Tooltip title="Ngừng sử dụng">
              <Button
                size="small"
                danger
                icon={
                  <DeleteOutlined />
                }
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  // ================= REPORT TABLE =================

  const reportColumns = [
    {
      title: 'Mã',
      dataIndex: 'code',
    },

    {
      title: 'Tên dịch vụ',
      dataIndex: 'name',
    },

    {
      title: 'Loại',
      dataIndex: 'type',

      render: (v) => (
        <Tag
          color={
            TYPE_COLOR[v] || 'default'
          }
        >
          {TYPE_LABEL[v] || v}
        </Tag>
      ),
    },

    {
      title: 'Số lượng',
      dataIndex: 'stockQty',
      align: 'center',
    },

    {
      title: 'Giá đầu vào',
      dataIndex: 'buyPrice',
      align: 'right',

      render: (v) => `${fmt(v)} ₫`,
    },

    {
      title: 'Tổng giá trị',
      key: 'total',

      align: 'right',

      render: (_, r) =>
        `${fmt(
          (r.buyPrice ?? 0) *
            (r.stockQty ?? 0)
        )} ₫`,
    },
  ]

  return (
    <>
      <Typography.Title
        level={4}
        style={{ marginBottom: 18 }}
      >
        Quản lý tài nguyên &
        dịch vụ tour
      </Typography.Title>

      {/* DASHBOARD */}

      <Row
        gutter={[12, 12]}
        style={{ marginBottom: 16 }}
      >
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng dịch vụ"
              value={data.length}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Dịch vụ khả dụng"
              value={activeCount}
              valueStyle={{
                color: '#1D9E75',
              }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Sắp hết khả dụng"
              value={
                lowAvailabilityCount
              }
              valueStyle={{
                color:
                  lowAvailabilityCount >
                  0
                    ? '#fa8c16'
                    : '#1D9E75',
              }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng giá trị"
              value={`${fmt(
                totalValue
              )} ₫`}
              valueStyle={{
                fontSize: 16,
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* FILTER */}

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
            if (!e.target.value)
              setSearch('')
          }}
        />

        <Select
          placeholder="Lọc loại dịch vụ"
          allowClear
          style={{ width: 200 }}
          value={
            typeFilter || undefined
          }
          onChange={(value) =>
            setTypeFilter(value || '')
          }
          options={Object.entries(
            TYPE_LABEL
          ).map(([k, v]) => ({
            value: k,
            label: v,
          }))}
        />

        <Button
          icon={<ReloadOutlined />}
          onClick={load}
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
          Thêm dịch vụ
        </Button>
      </div>

      {/* PRODUCT TABLE */}

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
          showTotal: (t) =>
            `Tổng ${t} dịch vụ`,
        }}
      />

      {/* REPORT */}

      <Card
        title="Báo cáo thống kê sản phẩm"
        style={{ marginTop: 20 }}
      >
        <Space
          style={{ marginBottom: 16 }}
        >
          <DatePicker
            picker="month"
            value={dayjs(
              `${statYear}-${statMonth}`
            )}
            onChange={(v) => {
              if (!v) return

              setStatMonth(
                v.month() + 1
              )

              setStatYear(v.year())
            }}
          />

          <Button
            icon={<FileTextOutlined />}
            onClick={loadStatistics}
          >
            Xem báo cáo
          </Button>
        </Space>

        <Table
          columns={reportColumns}
          dataSource={statistics}
          rowKey="id"
          loading={reportLoading}
          bordered
          pagination={{
            pageSize: 5,
          }}
        />
      </Card>

      {/* MODAL */}

      <Modal
        title={
          editing
            ? 'Chỉnh sửa dịch vụ'
            : 'Thêm dịch vụ mới'
        }
        open={open}
        width={700}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Row gutter={12}>
            <Col span={24}>
              <Form.Item
                name="name"
                label="Tên dịch vụ"
                rules={[
                  {
                    required: true,
                    message:
                      'Vui lòng nhập tên dịch vụ',
                  },
                ]}
              >
                <Input placeholder="Nhập tên dịch vụ..." />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="type"
                label="Loại dịch vụ"
                rules={[
                  {
                    required: true,
                    message:
                      'Vui lòng chọn loại dịch vụ',
                  },
                ]}
              >
                <Select
                  placeholder="Chọn loại"
                  options={Object.entries(
                    TYPE_LABEL
                  ).map(([k, v]) => ({
                    value: k,
                    label: v,
                  }))}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="supplierId"
                label="Nhà cung cấp"
              >
                <Select
                  placeholder="Chọn nhà cung cấp"
                  options={suppliers}
                  allowClear
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="unit"
                label="Đơn vị tính"
              >
                <Input placeholder="Ví dụ: Vé, Suất..." />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="stockQty"
                label="Số lượng khả dụng"
              >
                <InputNumber
                  style={{
                    width: '100%',
                  }}
                  min={0}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="minStock"
                label="Ngưỡng cảnh báo"
              >
                <InputNumber
                  style={{
                    width: '100%',
                  }}
                  min={0}
                />
              </Form.Item>
            </Col>

            {editing && (
              <Col xs={24} md={12}>
                <Form.Item
                  name="status"
                  label="Trạng thái"
                >
                  <Select
                    options={[
                      {
                        value: 'ACTIVE',
                        label:
                          'Khả dụng',
                      },
                      {
                        value:
                          'OUT_OF_STOCK',
                        label:
                          'Hết khả dụng',
                      },
                      {
                        value:
                          'INACTIVE',
                        label:
                          'Ngừng sử dụng',
                      },
                    ]}
                  />
                </Form.Item>
              </Col>
            )}

            <Col xs={24} md={12}>
              <Form.Item
                name="buyPrice"
                label="Giá đầu vào"
                rules={[
                  {
                    required: true,
                    message:
                      'Vui lòng nhập giá đầu vào',
                  },
                ]}
              >
                <InputNumber
                  style={{
                    width: '100%',
                  }}
                  min={0}
                  step={10000}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="sellPrice"
                label="Giá phân bổ"
                rules={[
                  {
                    required: true,
                    message:
                      'Vui lòng nhập giá phân bổ',
                  },
                ]}
              >
                <InputNumber
                  style={{
                    width: '100%',
                  }}
                  min={0}
                  step={10000}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  )
}