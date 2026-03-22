import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Button, Rate, Tag, Typography, Input, Select, Space, Badge } from 'antd'
import { CompassOutlined, ClockCircleOutlined, RightOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { tourAPI, bookingAPI } from '../../services/api'
import { useAuthStore } from '../../stores/authStore'

const { Title, Text } = Typography
const EMOJIS = { 'Phú Quốc':'🏖','Đà Nẵng':'🌅','Thái Lan':'🏯','Sapa':'🗻','Nha Trang':'🌺','Nhật Bản':'🗼','Hà Nội':'🏛','Singapore':'🦁','Đà Lạt':'🌸' }
const BG = { DOMESTIC:'#E1F5EE', INTERNATIONAL:'#EEEDFE', MICE:'#E6F1FB' }
const fmt = v => v ? new Intl.NumberFormat('vi-VN').format(v)+' ₫' : '—'
const STATUS_COLOR = { PENDING:'orange', CONFIRMED:'blue', PAID:'green', COMPLETED:'cyan', CANCELLED:'red' }
const STATUS_LABEL = { PENDING:'Chờ xác nhận', CONFIRMED:'Đã xác nhận', PAID:'Đã thanh toán', COMPLETED:'Hoàn thành', CANCELLED:'Đã hủy' }

const MOCK_TOURS = [
  { id:1, name:'Phú Quốc 4N3Đ – Hòn Đảo Ngọc', destination:'Phú Quốc', days:4, nights:3, priceAdult:5800000, avgRating:4.9, type:'DOMESTIC', schedules:[{available:8}] },
  { id:2, name:'Đà Nẵng – Hội An 3N2Đ', destination:'Đà Nẵng', days:3, nights:2, priceAdult:3200000, avgRating:4.8, type:'DOMESTIC', schedules:[{available:14}] },
  { id:3, name:'Bangkok – Pattaya 5N4Đ', destination:'Thái Lan', days:5, nights:4, priceAdult:12500000, avgRating:4.5, type:'INTERNATIONAL', schedules:[{available:3}] },
  { id:4, name:'Hà Nội – Sapa 3N2Đ', destination:'Sapa', days:3, nights:2, priceAdult:4100000, avgRating:4.7, type:'DOMESTIC', schedules:[{available:22}] },
  { id:5, name:'Nha Trang 5N4Đ Biển Xanh', destination:'Nha Trang', days:5, nights:4, priceAdult:6200000, avgRating:4.6, type:'DOMESTIC', schedules:[{available:11}] },
  { id:6, name:'Tokyo – Kyoto 7N6Đ', destination:'Nhật Bản', days:7, nights:6, priceAdult:28000000, avgRating:5.0, type:'INTERNATIONAL', schedules:[{available:5}] },
]

function TourCard({ tour, onBook, onClick }) {
  return (
    <Card hoverable bodyStyle={{padding:0}} style={{borderRadius:12,overflow:'hidden'}} onClick={onClick}>
      <div style={{height:130,background:BG[tour.type]??'#E1F5EE',display:'flex',alignItems:'center',justifyContent:'center',fontSize:48,position:'relative'}}>
        {EMOJIS[tour.destination]??'✈'}
        {tour.type==='INTERNATIONAL' && <Tag color="purple" style={{position:'absolute',top:8,left:8,fontSize:10}}>Quốc tế</Tag>}
        {(tour.schedules?.[0]?.available??99) < 5 && <Tag color="red" style={{position:'absolute',top:8,right:8,fontSize:10}}>Sắp đầy</Tag>}
      </div>
      <div style={{padding:'12px 14px'}}>
        <div style={{fontWeight:600,marginBottom:4,fontSize:13}}>{tour.name}</div>
        <div style={{fontSize:12,color:'#888',marginBottom:6,display:'flex',gap:12}}>
          <span><CompassOutlined /> {tour.destination}</span>
          <span><ClockCircleOutlined /> {tour.days}N{tour.nights}Đ</span>
          <span>Còn {tour.schedules?.[0]?.available??'?'} chỗ</span>
        </div>
        <Rate disabled value={Math.round(tour.avgRating??5)} style={{fontSize:12}} />
        <span style={{fontSize:11,color:'#888',marginLeft:6}}>{tour.avgRating}</span>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:10}}>
          <div><span style={{fontSize:16,fontWeight:700,color:'#1D9E75'}}>{fmt(tour.priceAdult)}</span><span style={{fontSize:11,color:'#888'}}>/người</span></div>
          <Button type="primary" size="small" style={{background:'#1D9E75'}} onClick={e=>{e.stopPropagation();onBook(tour)}}>Đặt ngay</Button>
        </div>
      </div>
    </Card>
  )
}

export function CustomerHome() {
  const [tours, setTours]       = useState(MOCK_TOURS)
  const [bookings, setBookings] = useState([])
  const { user }                = useAuthStore()
  const navigate                = useNavigate()

  useEffect(() => {
    tourAPI.getAll({ size:3 }).then(r=>{ if(r.data.data?.content?.length) setTours(r.data.data.content) }).catch(()=>{})
    bookingAPI.getByCustomer(1,{size:3}).then(r=>setBookings(r.data.data?.content??[])).catch(()=>{})
  }, [])

  return (
    <div>
      <div style={{background:'linear-gradient(135deg,#04342C 0%,#1D9E75 100%)',padding:'40px 32px',textAlign:'center'}}>
        <Title level={2} style={{color:'#fff',marginBottom:8}}>Khám phá hành trình của bạn ✈</Title>
        <Text style={{color:'#9FE1CB',fontSize:15,display:'block',marginBottom:24}}>Hàng trăm tour hấp dẫn – đặt nhanh, giá tốt, trải nghiệm thật</Text>
        <div style={{background:'#fff',borderRadius:12,padding:'12px 16px',maxWidth:700,margin:'0 auto',display:'flex',gap:10,alignItems:'center'}}>
          <Input prefix="🔍" placeholder="Bạn muốn đi đâu? VD: Phú Quốc, Đà Nẵng..." style={{border:'none',flex:1,outline:'none'}} />
          <Button type="primary" style={{background:'#1D9E75'}} onClick={()=>navigate('/portal/tours')}>Tìm tour</Button>
        </div>
      </div>
      <div style={{padding:'24px 32px'}}>
        <Row gutter={16} style={{marginBottom:24}}>
          {[['⭐ VIP','Hạng thành viên','#FAEEDA','#633806'],['1,240 điểm','Điểm tích lũy','#E1F5EE','#085041'],['8 tour','Đã đặt','#E6F1FB','#185FA5'],['4.8 ★','Đánh giá TB','#EEEDFE','#3C3489']].map(([v,l,bg,c])=>(
            <Col span={6} key={l}><div style={{background:bg,borderRadius:10,padding:'14px 16px'}}>
              <div style={{fontSize:11,color:c,opacity:0.75,marginBottom:3}}>{l}</div>
              <div style={{fontSize:20,fontWeight:600,color:c}}>{v}</div>
            </div></Col>
          ))}
        </Row>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
          <Title level={4} style={{margin:0}}>Tour nổi bật tháng này</Title>
          <Button type="link" icon={<RightOutlined />} onClick={()=>navigate('/portal/tours')}>Xem tất cả</Button>
        </div>
        <Row gutter={[16,16]} style={{marginBottom:20}}>
          {tours.slice(0,3).map(t=>(
            <Col span={8} key={t.id}>
              <TourCard tour={t} onClick={()=>navigate('/portal/tours')} onBook={()=>navigate('/portal/booking',{state:{tourId:t.id}})} />
            </Col>
          ))}
        </Row>
        <Row gutter={16}>
          <Col span={14}>
            <Card title="Đơn đặt tour gần đây" extra={<Button type="link" onClick={()=>navigate('/portal/profile')}>Xem tất cả</Button>}>
              {bookings.length ? bookings.map(b=>(
                <div key={b.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid #f5f5f5'}}>
                  <div><div style={{fontWeight:500}}>{b.tourName}</div><div style={{fontSize:12,color:'#888'}}>{b.code} · {b.departureDate}</div></div>
                  <Tag color={STATUS_COLOR[b.status]}>{STATUS_LABEL[b.status]}</Tag>
                </div>
              )) : <div style={{color:'#aaa',textAlign:'center',padding:20}}>Chưa có đơn đặt tour nào</div>}
            </Card>
          </Col>
          <Col span={10}>
            <Card title="Thông báo">
              {[['🎫','Tour Phú Quốc xuất phát sau 6 ngày'],['💳','Đặt cọc đã được xác nhận'],['⭐','Bạn có 1,240 điểm VIP tích lũy'],['🎁','Ưu đãi sinh nhật – giảm 10%']].map(([icon,text])=>(
                <div key={text} style={{display:'flex',gap:10,alignItems:'center',padding:'8px 0',borderBottom:'1px solid #f5f5f5',fontSize:13}}>
                  <span>{icon}</span><span>{text}</span>
                </div>
              ))}
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export function CustomerTours() {
  const [tours, setTours]   = useState(MOCK_TOURS)
  const [filter, setFilter] = useState('all')
  const [detail, setDetail] = useState(null)
  const navigate            = useNavigate()

  useEffect(() => {
    tourAPI.getAll({ size:12 }).then(r=>{ if(r.data.data?.content?.length) setTours(r.data.data.content) }).catch(()=>{})
  }, [])

  const filtered = filter==='all' ? tours : tours.filter(t=>t.type===filter)

  return (
    <div style={{padding:'24px 32px'}}>
      <Title level={4}>Khám phá tất cả tour</Title>
      <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
        {[['all','Tất cả'],['DOMESTIC','Trong nước'],['INTERNATIONAL','Quốc tế']].map(([v,l])=>(
          <Button key={v} type={filter===v?'primary':'default'} size="small"
            style={filter===v?{background:'#1D9E75',borderColor:'#1D9E75'}:{}} onClick={()=>setFilter(v)}>{l}</Button>
        ))}
        <Select placeholder="Giá" allowClear style={{width:160}} options={[{value:'low',label:'Dưới 5 triệu'},{value:'mid',label:'5–15 triệu'},{value:'high',label:'Trên 15 triệu'}]} />
        <Select placeholder="Sắp xếp" defaultValue="popular" style={{width:160}} options={[{value:'popular',label:'Phổ biến nhất'},{value:'price_asc',label:'Giá thấp → cao'},{value:'rating',label:'Đánh giá cao'}]} />
      </div>
      <Row gutter={[16,16]}>
        {filtered.map(t=>(
          <Col xs={24} sm={12} lg={8} key={t.id}>
            <TourCard tour={t} onClick={()=>setDetail(t)} onBook={()=>navigate('/portal/booking',{state:{tourId:t.id}})} />
          </Col>
        ))}
      </Row>
      <Modal title={detail?.name} open={!!detail} onCancel={()=>setDetail(null)} width={560}
        footer={[<Button key="c" onClick={()=>setDetail(null)}>Đóng</Button>,<Button key="b" type="primary" style={{background:'#1D9E75'}} onClick={()=>{setDetail(null);navigate('/portal/booking')}}>Đặt tour này →</Button>]}>
        {detail && <>
          <div style={{display:'flex',gap:8,marginBottom:12}}>
            <Tag color={detail.type==='INTERNATIONAL'?'purple':'green'}>{detail.type==='INTERNATIONAL'?'Quốc tế':'Trong nước'}</Tag>
            {(detail.schedules?.[0]?.available??99)<10 && <Tag color="orange">Sắp đầy chỗ</Tag>}
          </div>
          <Row gutter={[8,8]}>
            {[['Điểm đến',detail.destination],['Thời gian',`${detail.days}N${detail.nights}Đ`],['Giá người lớn',<strong style={{color:'#1D9E75'}}>{fmt(detail.priceAdult)}</strong>],['Giá trẻ em',fmt(detail.priceChild)],['Chỗ còn lại',`${detail.schedules?.[0]?.available??'?'} chỗ`]].map(([l,v])=>(
              <Col span={12} key={l}><div style={{background:'#f9f9f9',borderRadius:6,padding:'8px 12px'}}><div style={{fontSize:11,color:'#888'}}>{l}</div><div style={{fontWeight:500}}>{v}</div></div></Col>
            ))}
          </Row>
          {detail.description && <div style={{marginTop:12,fontSize:13,color:'#555'}}>{detail.description}</div>}
        </>}
      </Modal>
    </div>
  )
}

export default CustomerHome
