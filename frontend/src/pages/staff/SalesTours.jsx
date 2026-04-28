import React, { useEffect, useState } from 'react'
import {
  Table, Button, Space, Tag, Modal,
  message, Typography, Rate,
  Tabs, Descriptions, Card,
  Statistic, Row, Col, Tooltip
} from 'antd'
import {
  AppstoreOutlined
} from '@ant-design/icons'
import { tourAPI } from '../../services/api'

const TYPE_LABEL  = {
  DOMESTIC:'Trong nước',
  INTERNATIONAL:'Quốc tế',
  MICE:'MICE'
}

const TYPE_COLOR  = {
  DOMESTIC:'green',
  INTERNATIONAL:'purple',
  MICE:'blue'
}

const STATUS_COLOR = {
  ACTIVE:'success',
  INACTIVE:'default',
  FULL:'warning'
}

const STATUS_LABEL = {
  ACTIVE:'Đang bán',
  INACTIVE:'Tạm dừng',
  FULL:'Đầy chỗ'
}

const PRODUCT_TYPE_LABEL = {
  HOTEL:'Khách sạn',
  FLIGHT:'Vé máy bay',
  FOOD:'Ăn uống',
  VEHICLE:'Xe du lịch',
  ACTIVITY:'Vui chơi',
  OTHER:'Khác'
}

const PRODUCT_TYPE_COLOR = {
  HOTEL:'blue',
  FLIGHT:'purple',
  FOOD:'green',
  VEHICLE:'orange',
  ACTIVITY:'cyan',
  OTHER:'default'
}

const fmt = v =>
  v
    ? new Intl.NumberFormat('vi-VN').format(v) + ' ₫'
    : '—'

export default function SalesTours() {

  const [tours, setTours]     = useState([])
  const [loading, setLoading] = useState(false)

  const [detailModal, setDetailModal] = useState(false)
  const [selected, setSelected]       = useState(null)

  const [search, setSearch] = useState('')
  const [typeF, setTypeF]   = useState('')

  // ─────────────────────────────────────────────
  // Load tours
  // ─────────────────────────────────────────────

  const loadTours = async () => {
    setLoading(true)

    try {
      const r = await tourAPI.getAll({
        search,
        type: typeF,
        size: 50
      })

      setTours(r.data.data?.content ?? [])
    }
    catch {
      message.error('Không tải được danh sách tour')
    }
    finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTours()
  }, [search, typeF])

  // ─────────────────────────────────────────────
  // Open detail
  // ─────────────────────────────────────────────

  const openDetail = async (tour) => {
    try {
      const r = await tourAPI.getById(tour.id)
      setSelected(r.data.data)
    }
    catch {
      setSelected(tour)
    }

    setDetailModal(true)
  }

  // ─────────────────────────────────────────────
  // Columns
  // ─────────────────────────────────────────────

  const cols = [
    {
      title:'Mã',
      dataIndex:'code',
      width:70,
      render: v => (
        <span style={{color:'#888',fontSize:11}}>
          {v}
        </span>
      )
    },

    {
      title:'Tên tour',
      dataIndex:'name',
      render: (v, r) => (
        <span
          style={{
            fontWeight:500,
            cursor:'pointer',
            color:'#1D9E75'
          }}
          onClick={() => openDetail(r)}
        >
          {v}
        </span>
      )
    },

    {
      title:'Điểm đến',
      dataIndex:'destination'
    },

    {
      title:'Loại',
      dataIndex:'type',
      render: v => (
        <Tag color={TYPE_COLOR[v]}>
          {TYPE_LABEL[v]}
        </Tag>
      )
    },

    {
      title:'Thời gian',
      render:(_,r) => `${r.days}N${r.nights}Đ`
    },

    {
      title:'Dịch vụ',
      dataIndex:'services',
      render: v => (
        <Tag color="blue">
          {(v ?? []).length} dịch vụ
        </Tag>
      ),
      align: 'center'
    },

    {
      title:'Chi phí ước tính',
      dataIndex:'estimatedCost',
      render: v => (
        <span style={{color:'#854F0B'}}>
          {fmt(v)}
        </span>
      )
    },

    {
      title:'Giá bán/người',
      dataIndex:'priceAdult',
      render: v => (
        <strong style={{color:'#1D9E75'}}>
          {fmt(v)}
        </strong>
      )
    },

    {
      title:'Đánh giá',
      dataIndex:'avgRating',
      render: v =>
        v
          ? <>
              <Rate
                disabled
                value={Math.round(v)}
                style={{fontSize:11}}
              />

              <span style={{
                fontSize:11,
                marginLeft:4
              }}>
                {Number(v).toFixed(1)}
              </span>
            </>
          : '—'
    },

    {
      title:'Trạng thái',
      dataIndex:'status',
      render: v => (
        <Tag color={STATUS_COLOR[v]}>
          {STATUS_LABEL[v]}
        </Tag>
      )
    },

    {
      title:'',
      key:'act',
      width:70,
      render: (_, row) => (
        <Tooltip title="Xem chi tiết">
          <Button
            size="small"
            icon={<AppstoreOutlined />}
            onClick={() => openDetail(row)}
          />
        </Tooltip>
      )
    },
  ]

  // ─────────────────────────────────────────────
  // Service columns
  // ─────────────────────────────────────────────

  const svcCols = [
    {
      title:'Thứ tự',
      dataIndex:'sortOrder',
      width:60,
      align:'center'
    },

    {
      title:'Dịch vụ',
      render:(_,r) => (
        <div>
          <strong>{r.productName}</strong>

          <br />

          <span style={{
            fontSize:11,
            color:'#888'
          }}>
            {r.productCode}
          </span>
        </div>
      )
    },

    {
      title:'Loại',
      dataIndex:'productType',
      render: v => (
        <Tag color={PRODUCT_TYPE_COLOR[v]}>
          {PRODUCT_TYPE_LABEL[v]}
        </Tag>
      )
    },

    {
      title:'Nhà CC',
      dataIndex:'supplierName'
    },

    {
      title:'Số lượng',
      dataIndex:'quantity',
      align:'center'
    },

    {
      title:'Giá nhập',
      dataIndex:'buyPrice',
      render: v => fmt(v)
    },

    {
      title:'Tổng chi phí',
      dataIndex:'subtotalCost',
      render: v => (
        <strong style={{color:'#854F0B'}}>
          {fmt(v)}
        </strong>
      )
    },

    {
      title:'Ghi chú',
      dataIndex:'note',
      ellipsis:true
    },
  ]

  // ─────────────────────────────────────────────
  // Schedule columns
  // ─────────────────────────────────────────────

  const scheduleCols = [
    {
      title:'Ngày khởi hành',
      dataIndex:'departureDate'
    },

    {
      title:'Sức chứa',
      dataIndex:'capacity',
      align:'center'
    },

    {
      title:'Đã đặt',
      dataIndex:'booked',
      align:'center'
    },

    {
      title:'Còn lại',
      dataIndex:'available',
      render: v => (
        <Tag color={
          v === 0
            ? 'red'
            : v < 5
              ? 'orange'
              : 'green'
        }>
          {v}
        </Tag>
      ),
      align:'center'
    },

    {
      title:'Trạng thái',
      dataIndex:'status',
render: v => {
  const color =
    v === 'OPEN'
      ? 'green'
      : v === 'FULL'
      ? 'red'
      : v === 'COMPLETED'
      ? 'blue'
      : v === 'CANCELLED'
      ? 'default'
      : 'default'

  const label =
    v === 'OPEN'
      ? 'Đang mở'
      : v === 'FULL'
      ? 'Đã đầy'
      : v === 'COMPLETED'
      ? 'Đã khởi hành'
      : v === 'CANCELLED'
      ? 'Đã huỷ'
      : v

  return <Tag color={color}>{label}</Tag>
}
    },
  ]

  return (
    <>
      {/* Header */}

      <div style={{
        display:'flex',
        justifyContent:'space-between',
        marginBottom:16,
        gap:8,
        flexWrap:'wrap'
      }}>
        <Typography.Title level={4} style={{margin:0}}>
          Danh sách Tour
        </Typography.Title>

        <Space>
          <input
            placeholder="Tìm tour..."
            onChange={e => setSearch(e.target.value)}
            style={{
              width:220,
              padding:'7px 11px',
              border:'1px solid #d9d9d9',
              borderRadius:6
            }}
          />

          <select
            onChange={e => setTypeF(e.target.value)}
            style={{
              width:140,
              padding:'7px 11px',
              border:'1px solid #d9d9d9',
              borderRadius:6
            }}
          >
            <option value="">Tất cả loại</option>
            <option value="DOMESTIC">Trong nước</option>
            <option value="INTERNATIONAL">Quốc tế</option>
            <option value="MICE">MICE</option>
          </select>
        </Space>
      </div>

      {/* Table */}

      <Table
        columns={cols}
        dataSource={tours}
        rowKey="id"
        loading={loading}
        size="small"
        pagination={{
          pageSize:10,
          showTotal:t => `Tổng ${t} tour`
        }}
      />

      {/* Detail modal */}

      <Modal
        title={`Tour: ${selected?.name}`}
        open={detailModal}
        width={900}
        onCancel={() => setDetailModal(false)}
        footer={[
          <Button
            key="close"
            onClick={() => setDetailModal(false)}
          >
            Đóng
          </Button>
        ]}
      >
        {selected && (
          <Tabs items={[
            {
              key:'services',
              label:`Dịch vụ cấu thành (${(selected.services ?? []).length})`,

              children: (
                <>
                  <Row gutter={12} style={{marginBottom:12}}>

                    <Col span={8}>
                      <Card
                        size="small"
                        style={{background:'#fff7e6'}}
                      >
                        <Statistic
                          title="Chi phí ước tính"
                          value={fmt(selected.estimatedCost)}
                          valueStyle={{
                            fontSize:15,
                            color:'#854F0B'
                          }}
                        />
                      </Card>
                    </Col>

                    <Col span={8}>
                      <Card
                        size="small"
                        style={{background:'#f6ffed'}}
                      >
                        <Statistic
                          title="Giá bán/người"
                          value={fmt(selected.priceAdult)}
                          valueStyle={{
                            fontSize:15,
                            color:'#3B6D11'
                          }}
                        />
                      </Card>
                    </Col>

                    <Col span={8}>
                      <Card size="small">
                        <Statistic
                          title="Số dịch vụ"
                          value={(selected.services ?? []).length}
                        />
                      </Card>
                    </Col>

                  </Row>

                  <Table
                    columns={svcCols}
                    dataSource={selected.services ?? []}
                    rowKey="tourServiceId"
                    size="small"
                    pagination={false}
                  />
                </>
              ),
            },

            {
              key:'schedules',

              label:`Lịch khởi hành (${(selected.schedules ?? []).length})`,

              children: (
                <Table
                  columns={scheduleCols}
                  dataSource={selected.schedules ?? []}
                  rowKey="id"
                  size="small"
                  pagination={false}
                />
              ),
            },

            {
              key:'info',

              label:'Thông tin tour',

              children: (
                <Descriptions
                  column={2}
                  bordered
                  size="small"
                >
                  <Descriptions.Item label="Mã tour">
                    {selected.code}
                  </Descriptions.Item>

                  <Descriptions.Item label="Loại">
                    <Tag color={TYPE_COLOR[selected.type]}>
                      {TYPE_LABEL[selected.type]}
                    </Tag>
                  </Descriptions.Item>

                  <Descriptions.Item label="Điểm khởi hành">
                    {selected.origin}
                  </Descriptions.Item>

                  <Descriptions.Item label="Điểm đến">
                    {selected.destination}
                  </Descriptions.Item>

                  <Descriptions.Item label="Thời gian">
                    {selected.days}N{selected.nights}Đ
                  </Descriptions.Item>

                  <Descriptions.Item label="Sức chứa">
                    {selected.capacity} người
                  </Descriptions.Item>

                  <Descriptions.Item label="Giá người lớn">
                    <strong style={{color:'#1D9E75'}}>
                      {fmt(selected.priceAdult)}
                    </strong>
                  </Descriptions.Item>

                  <Descriptions.Item label="Giá trẻ em">
                    {fmt(selected.priceChild)}
                  </Descriptions.Item>

                  <Descriptions.Item
                    label="Dịch vụ bao gồm"
                    span={2}
                  >
                    {selected.included}
                  </Descriptions.Item>

                  <Descriptions.Item
                    label="Mô tả"
                    span={2}
                  >
                    {selected.description}
                  </Descriptions.Item>

                  <Descriptions.Item
                    label="Lịch trình"
                    span={2}
                  >
                    <pre style={{
                      whiteSpace:'pre-wrap',
                      fontSize:12,
                      margin:0
                    }}>
                      {selected.itinerary}
                    </pre>
                  </Descriptions.Item>

                </Descriptions>
              ),
            },

          ]} />
        )}
      </Modal>
    </>
  )
}