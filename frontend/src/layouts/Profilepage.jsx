import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { message } from 'antd'
import { useAuthStore } from '../stores/authStore'
import {
  employeeAPI,
  salaryAPI,
  leaveAPI,
  authAPI,
} from '../services/api'

// ─── Helpers ────────────────────────────────────────────────────────────────
const fmt = (n) =>
  n ? n.toLocaleString('vi-VN') + ' ₫' : '—'

const fmtNeg = (n) =>
  n ? '(' + Math.abs(n).toLocaleString('vi-VN') + ' ₫)' : '—'

// gross = baseSalary + allowance + bonus (backend không có grossSalary)
const gross = (r) => (r?.baseSalary || 0) + (r?.allowance || 0) + (r?.bonus || 0)

const TABS = [
  { key: 'profile',        label: '👤 Hồ sơ' },
  { key: 'salary',         label: '💰 Bảng lương' },
  { key: 'salary-method',  label: '📐 Cách tính lương' },
  { key: 'leave-form',     label: '📝 Nộp đơn nghỉ' },
  { key: 'leave-history',  label: '📋 Lịch sử nghỉ phép' },
]

const LEAVE_TYPES = [
  { key: 'ANNUAL',      icon: '🌴', name: 'Nghỉ phép năm',  desc: 'Tối đa 12 ngày/năm' },
  { key: 'SICK',        icon: '🤒', name: 'Nghỉ ốm đau',    desc: 'Theo BHXH quy định' },
  { key: 'MATERNITY',   icon: '🤱', name: 'Thai sản',        desc: '6 tháng đối với nữ' },
  { key: 'RESIGNATION', icon: '📄', name: 'Thôi việc',       desc: 'Báo trước 30 ngày' },
]

const MONTHS = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `Tháng ${i + 1}` }))
const YEARS  = [2023, 2024, 2025, 2026]

const STATUS_BADGE = {
  PENDING:  { label: '⏳ Chờ duyệt',  style: { background: '#fffbeb', color: '#b45309' } },
  APPROVED: { label: '✓ Đã duyệt',   style: { background: '#e1f5ee', color: '#085041' } },
  REJECTED: { label: '✗ Từ chối',    style: { background: '#fff0ef', color: '#d92d20' } },
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const S = {
  page: {
    fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
    background: '#f7f8fa',
    minHeight: '100vh',
    color: '#1d2939',
  },
  hero: {
    background: 'linear-gradient(120deg,#04342C 0%,#085041 55%,#0d7a5c 100%)',
    borderRadius: 14,
    padding: '28px 32px',
    display: 'flex',
    alignItems: 'center',
    gap: 24,
    marginBottom: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  heroCircle1: {
    position: 'absolute', right: -60, top: -60,
    width: 240, height: 240, borderRadius: '50%',
    background: 'rgba(29,158,117,0.18)', pointerEvents: 'none',
  },
  heroCircle2: {
    position: 'absolute', right: 80, bottom: -80,
    width: 170, height: 170, borderRadius: '50%',
    background: 'rgba(29,158,117,0.10)', pointerEvents: 'none',
  },
  avatar: {
    width: 72, height: 72, borderRadius: '50%',
    background: '#1D9E75', border: '3px solid rgba(255,255,255,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 28, fontWeight: 700, color: '#fff', flexShrink: 0, zIndex: 1,
  },
  heroInfo: { flex: 1, zIndex: 1 },
  heroName: {
    fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 4,
    fontFamily: "'Playfair Display', serif",
  },
  heroRole: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: 'rgba(255,255,255,0.15)', borderRadius: 20,
    padding: '3px 12px', fontSize: 12, color: '#9FE1CB', marginBottom: 10,
  },
  heroMeta: { display: 'flex', gap: 18, flexWrap: 'wrap' },
  heroMetaItem: { fontSize: 12, color: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', gap: 4 },
  heroActions: { display: 'flex', flexDirection: 'column', gap: 8, zIndex: 1 },
  btnWhite: {
    background: 'rgba(255,255,255,0.95)', color: '#04342C',
    border: 'none', borderRadius: 8, padding: '8px 16px',
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
    fontFamily: 'inherit', whiteSpace: 'nowrap',
  },
  btnOutlineWhite: {
    background: 'transparent', color: '#fff',
    border: '1px solid rgba(255,255,255,0.4)', borderRadius: 8, padding: '8px 16px',
    fontSize: 13, fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit', whiteSpace: 'nowrap',
  },
  tabs: {
    display: 'flex', gap: 4, background: '#fff',
    borderRadius: 14, padding: 6,
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: 20,
    overflowX: 'auto',
  },
  tab: (active) => ({
    flex: 1, minWidth: 110, padding: '9px 10px', border: 'none',
    borderRadius: 10, fontFamily: 'inherit', fontSize: 13,
    fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
    background: active ? '#04342C' : 'transparent',
    color: active ? '#fff' : '#667085',
    transition: 'all .18s',
  }),
  card: {
    background: '#fff', borderRadius: 14,
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    padding: 24, marginBottom: 16,
  },
  cardTitle: {
    fontSize: 14, fontWeight: 700, color: '#1d2939',
    marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8,
  },
  dot: { width: 8, height: 8, background: '#1D9E75', borderRadius: '50%', flexShrink: 0 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  label: { display: 'block', fontSize: 11, fontWeight: 700, color: '#667085', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.4px' },
  input: {
    width: '100%', border: '1.5px solid #eef0f3', borderRadius: 8,
    padding: '9px 13px', fontSize: 13.5, fontFamily: 'inherit',
    color: '#1d2939', background: '#f7f8fa', outline: 'none',
    boxSizing: 'border-box',
  },
  inputReadonly: {
    width: '100%', border: '1.5px solid #eef0f3', borderRadius: 8,
    padding: '9px 13px', fontSize: 13.5, fontFamily: 'inherit',
    color: '#667085', background: '#f7f8fa', outline: 'none',
    boxSizing: 'border-box', cursor: 'default',
  },
  textarea: {
    width: '100%', border: '1.5px solid #eef0f3', borderRadius: 8,
    padding: '9px 13px', fontSize: 13.5, fontFamily: 'inherit',
    color: '#1d2939', background: '#f7f8fa', outline: 'none',
    resize: 'vertical', minHeight: 80, boxSizing: 'border-box',
  },
  select: {
    border: '1.5px solid #eef0f3', borderRadius: 8,
    padding: '7px 12px', fontSize: 13, fontFamily: 'inherit',
    background: '#f7f8fa', color: '#1d2939', outline: 'none', cursor: 'pointer',
  },
  btnPrimary: {
    background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 8,
    padding: '10px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
    fontFamily: 'inherit',
  },
  btnGhost: {
    background: '#f7f8fa', color: '#667085',
    border: '1.5px solid #eef0f3', borderRadius: 8, padding: '10px 18px',
    fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
  },
  btnPrint: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: '#fff', border: '1.5px solid #eef0f3', borderRadius: 8,
    padding: '7px 14px', fontSize: 12.5, fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit', color: '#1d2939',
  },
  salSummary: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 20 },
  sumCard: (variant) => {
    const map = {
      green: { background: '#e1f5ee', border: '1.5px solid #9FE1CB' },
      gold:  { background: '#fffbf0', border: '1.5px solid #f9d98f' },
      red:   { background: '#fff3f2', border: '1.5px solid #fea3a3' },
    }
    return { borderRadius: 12, padding: '14px 16px', ...map[variant] }
  },
  sumLabel: { fontSize: 11, fontWeight: 700, color: '#667085', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 6 },
  sumValue: (variant) => ({
    fontSize: 19, fontWeight: 700,
    color: variant === 'green' ? '#085041' : variant === 'gold' ? '#b07d10' : '#d92d20',
  }),
  divider: { border: 'none', borderTop: '1.5px solid #eef0f3', margin: '16px 0' },
  leaveTypeGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 },
  leaveTypeBtn: (selected) => ({
    border: `1.5px solid ${selected ? '#1D9E75' : '#eef0f3'}`,
    borderRadius: 10, padding: '12px 8px', textAlign: 'center', cursor: 'pointer',
    background: selected ? '#e1f5ee' : '#fff', transition: 'all .18s',
  }),
  badge: (status) => ({
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
    ...((STATUS_BADGE[status] || STATUS_BADGE.PENDING).style),
  }),
  leaveRow: {
    display: 'flex', alignItems: 'center', padding: '12px 0',
    borderBottom: '1px solid #eef0f3', gap: 12,
  },
  methodRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
    padding: '9px 0', borderBottom: '1px solid #eef0f3',
  },
  formula: {
    fontSize: 11, color: '#667085', background: '#f7f8fa',
    borderRadius: 6, padding: '6px 10px', marginTop: 10,
    fontFamily: 'monospace', lineHeight: 1.7,
  },
  panelRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function CardTitle({ children }) {
  return (
    <div style={S.cardTitle}>
      <span style={S.dot} />
      {children}
    </div>
  )
}

function FormField({ label, children, fullWidth }) {
  return (
    <div style={fullWidth ? { gridColumn: '1/-1' } : {}}>
      <label style={S.label}>{label}</label>
      {children}
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function ProfilePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [tab, setTab] = useState('profile')
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(false)

  const [profileForm, setProfileForm] = useState({
    fullName: '', phone: '', personalEmail: '', address: '', cccd: '',
  })
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' })

  // Salary
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear]   = useState(new Date().getFullYear())
  const [salaryDetail, setSalaryDetail] = useState(null)
  const [yearSalaries, setYearSalaries] = useState([])
  const [showYear, setShowYear] = useState(false)

  // Leave
  const [leaveType, setLeaveType]       = useState('ANNUAL')
  const [leaveFrom, setLeaveFrom]       = useState('')
  const [leaveTo, setLeaveTo]           = useState('')
  const [leaveReason, setLeaveReason]   = useState('')
  const [leaveHistory, setLeaveHistory] = useState([])
  const [leaveSubmitting, setLeaveSubmitting] = useState(false)

  // ── Fetch employee ──
  useEffect(() => {
    if (!user?.id) return
    ;(async () => {
      try {
        const res = await employeeAPI.getByUserId(user.id)
        const emp = res.data.data
        setEmployee(emp)
        setProfileForm({
          fullName:      emp.fullName      || '',
          phone:         emp.phone         || '',
          personalEmail: emp.personalEmail || '',
          address:       emp.address       || '',
          cccd:          emp.cccd          || '',
          id:            emp.id            || '',
          gender:        emp.gender        || 'MALE',
        })
      } catch {
        setProfileForm({ fullName: user.fullName || '', phone: '', personalEmail: '', address: '', cccd: '' })
      }
    })()
  }, [user])

  const IdEmp = employee?.id

  // ── Fetch salary ──
  useEffect(() => {
    if (tab !== 'salary' || !employee?.id) return
    ;(async () => {
      setLoading(true)
      try {
        const res = await salaryAPI.getByEmployee(IdEmp)
        const all = Array.isArray(res.data?.data) ? res.data.data : []
        const found = all.find(s => s.month === month && s.year === year)
        setSalaryDetail(found || null)
        setYearSalaries(all.filter(s => s.year === year))
      } catch {
        setSalaryDetail(null)
      } finally {
        setLoading(false)
      }
    })()
  }, [tab, month, year, employee])

  // ── Fetch leave history ──
  useEffect(() => {
    if (tab !== 'leave-history' || !user?.id) return
    ;(async () => {
      try {
        const res = await leaveAPI.getAll()
        console.log(res.data.data.content);
        const raw = res.data.data?.content || res.data.data.content || []
        const all = Array.isArray(raw) ? raw : []
        console.log(all)
        setLeaveHistory(all.filter(l => l.employeeCode === employee.code))
//         console.log(LeaveHistory)
      } catch {

      }
    })()
  }, [tab, user])

//tính ngày nghỉ trong năm
const totalAnnual = employee?.annualLeaveTotal ?? 12

const totalUsed = (leaveHistory || []).reduce((sum, l) => {
  if (l.status !== 'APPROVED') return sum
  return sum + (l.days || 0)   // hoặc calcDays(l) nếu bạn có hàm chuẩn
}, 0)

const leaveLeft = totalAnnual - totalUsed
  // ── Handlers ──
  const handleSaveProfile = async () => {
    if (!user?.id) return
    try {
      await employeeAPI.update(user.id, profileForm)
      message.success('✅ Đã lưu thay đổi thành công!')
    } catch {
      message.error('Lưu thất bại, vui lòng thử lại.')
    }
  }

  const handleChangePassword = async () => {
    if (!pwForm.current || !pwForm.newPw) { message.warning('Vui lòng điền đầy đủ.'); return }
    if (pwForm.newPw !== pwForm.confirm)  { message.error('Mật khẩu xác nhận không khớp.'); return }
    try {
      await authAPI.changePassword({ currentPassword: pwForm.current, newPassword: pwForm.newPw })
      message.success('✅ Đã đổi mật khẩu!')
      setPwForm({ current: '', newPw: '', confirm: '' })
    } catch {
      message.error('Sai mật khẩu hiện tại hoặc lỗi server.')
    }
  }

  const handleSubmitLeave = async () => {
    if (!leaveFrom || !leaveTo)       { message.warning('Vui lòng chọn ngày nghỉ.'); return }
    if (!leaveReason.trim())          { message.warning('Vui lòng điền lý do.'); return }
    setLeaveSubmitting(true)
    try {
          // 🔥 THÊM Ở ĐÂY
          console.log({
            empId: employee.id,
            type: leaveType,
            fromDate: leaveFrom,
            toDate: leaveTo,
            reason: leaveReason,
          })
      await leaveAPI.submit(employee.id, {
        type: leaveType, fromDate: leaveFrom,  toDate: leaveTo, reason: leaveReason,
      })
      message.success('📝 Đơn đã được gửi, chờ HR duyệt!')
      setLeaveFrom(''); setLeaveTo(''); setLeaveReason('')
    }
      catch (err) {
        console.error("FULL ERROR:", err)
        console.error("RESPONSE:", err.response)
        console.error("DATA:", err.response?.data)
        message.error('Gửi đơn thất bại.')
      }
     finally {
      setLeaveSubmitting(false)
    }
  }

  // ── Print tháng ──
  const printMonth = () => {
    if (!salaryDetail) { message.info('Không có dữ liệu lương tháng này.'); return }
    const d = salaryDetail
    const w = window.open('', '_blank')
    w.document.write(`
      <html><head><title>Bảng lương Tháng ${month}/${year}</title>
      <style>
        body{font-family:Arial,sans-serif;padding:32px;max-width:600px;margin:auto}
        h2{color:#04342C} table{width:100%;border-collapse:collapse}
        th{background:#04342C;color:#fff;padding:10px 12px;text-align:left}
        td{padding:9px 12px;border-bottom:1px solid #eee}
        .neg{color:#d92d20} .pos{color:#085041} .total{font-weight:700;color:#04342C;font-size:15px}
        .head{display:flex;justify-content:space-between;border-bottom:2px solid #04342C;padding-bottom:12px;margin-bottom:20px}
      </style></head><body>
      <div class="head">
        <div><h2>TourPro Staff Portal</h2><p>Bảng lương tháng ${month}/${year}</p></div>
        <div><strong>${employee?.fullName || user?.fullName || ''}</strong><br>
          ${employee?.code || ''} · ${employee?.positionTitle || ''}</div>
      </div>
      <table>
        <thead><tr><th>Khoản mục</th><th style="text-align:right">Số tiền</th></tr></thead>
        <tbody>
          <tr><td>Lương cơ bản</td><td class="pos" style="text-align:right">${fmt(d.baseSalary)}</td></tr>
          <tr><td>Phụ cấp</td><td class="pos" style="text-align:right">${fmt(d.allowance)}</td></tr>
          <tr><td>Thưởng / KPI</td><td class="pos" style="text-align:right">${fmt(d.bonus)}</td></tr>
          <tr><td style="background:#f5f5f5;font-size:11px;color:#888" colspan="2">── Khấu trừ ──</td></tr>
          <tr><td>BHXH (8%)</td><td class="neg" style="text-align:right">${fmtNeg(d.socialInsurance)}</td></tr>
          <tr><td>BHYT (1.5%)</td><td class="neg" style="text-align:right">${fmtNeg(d.healthInsurance)}</td></tr>
          <tr><td>BHTN (1%)</td><td class="neg" style="text-align:right">${fmtNeg(d.unemploymentInsurance)}</td></tr>
          <tr><td>Thuế TNCN</td><td class="neg" style="text-align:right">${fmtNeg(d.incomeTax)}</td></tr>
          <tr><td style="background:#f5f5f5;font-size:11px;color:#888" colspan="2">── Tổng ──</td></tr>
          <tr><td class="total">THỰC LĨNH</td><td class="total" style="text-align:right">${fmt(d.netPay)}</td></tr>
        </tbody>
      </table>
      <p style="margin-top:20px;font-size:11px;color:#888">In ngày ${new Date().toLocaleDateString('vi-VN')}</p>
      <script>window.print()<\/script></body></html>`)
    w.document.close()
  }

  // ── Print năm ──
  const printYear = () => {
    if (!yearSalaries.length) { message.info('Không có dữ liệu lương năm này.'); return }
    const total = yearSalaries.reduce((a, r) => ({
      gross:  a.gross  + gross(r),
      bonus:  a.bonus  + (r.bonus     || 0),
      deduct: a.deduct + (r.deduction || 0),
      net:    a.net    + (r.netPay    || 0),
    }), { gross: 0, bonus: 0, deduct: 0, net: 0 })

    const w    = window.open('', '_blank')
    const rows = Array.from({ length: 12 }, (_, i) => {
      const r = yearSalaries.find(s => s.month === i + 1)
      if (!r) return `<tr style="color:#ccc"><td>Tháng ${i + 1}</td><td>—</td><td>—</td><td>—</td><td>—</td></tr>`
      return `<tr>
        <td>Tháng ${i + 1}</td>
        <td>${fmt(gross(r))}</td>
        <td style="color:#085041">${r.bonus ? fmt(r.bonus) : '—'}</td>
        <td style="color:#d92d20">${fmtNeg(r.deduction)}</td>
        <td><strong>${fmt(r.netPay)}</strong></td>
      </tr>`
    }).join('')

    w.document.write(`
      <html><head><title>Bảng lương năm ${year}</title>
      <style>
        body{font-family:Arial,sans-serif;padding:32px;max-width:900px;margin:auto}
        h2{color:#04342C} table{width:100%;border-collapse:collapse}
        th{background:#04342C;color:#fff;padding:10px 14px;text-align:left}
        td{padding:9px 14px;border-bottom:1px solid #eee}
        tfoot td{font-weight:700;background:#f5f5f5}
      </style></head><body>
      <h2>TourPro — Bảng lương năm ${year}</h2>
      <p>${employee?.fullName || user?.fullName || ''} · ${employee?.code || ''} · ${employee?.positionTitle || ''}</p><br>
      <table>
        <thead><tr><th>Tháng</th><th>Tổng thu nhập</th><th>Thưởng</th><th>Khấu trừ</th><th>Thực lĩnh</th></tr></thead>
        <tbody>${rows}</tbody>
        <tfoot><tr>
          <td>Cộng cả năm</td>
          <td>${fmt(total.gross)}</td>
          <td style="color:#085041">${fmt(total.bonus)}</td>
          <td style="color:#d92d20">${fmtNeg(total.deduct)}</td>
          <td style="color:#04342C">${fmt(total.net)}</td>
        </tr></tfoot>
      </table>
      <p style="margin-top:20px;font-size:11px;color:#888">In ngày ${new Date().toLocaleDateString('vi-VN')}</p>
      <script>window.print()<\/script></body></html>`)
    w.document.close()
  }

  // ── Build salary rows (dùng đúng field từ backend) ──
  const buildSalaryRows = () => {
    if (!salaryDetail) return []
    const d = salaryDetail
    return [
      { label: 'Lương cơ bản',    value: d.baseSalary,              type: 'pos' },
      { label: 'Phụ cấp',         value: d.allowance,                type: 'pos' },
      { label: 'Thưởng / KPI',    value: d.bonus,                    type: 'pos' },
      { label: '── Khấu trừ ──',  value: null,                       type: 'sep' },
      { label: 'BHXH (8%)',        value: -(d.socialInsurance       || 0), type: 'neg' },
      { label: 'BHYT (1.5%)',      value: -(d.healthInsurance       || 0), type: 'neg' },
      { label: 'BHTN (1%)',        value: -(d.unemploymentInsurance  || 0), type: 'neg' },
      { label: 'Thuế TNCN',        value: -(d.incomeTax             || 0), type: 'neg' },
      { label: '── Thực lĩnh ──', value: null,                       type: 'sep' },
      { label: 'THỰC LĨNH',       value: d.netPay,                   type: 'total' }, // ← netPay
    ]
  }

  const initials = (profileForm.fullName || user?.fullName || 'U')[0]?.toUpperCase()

  // ── Render ──----------------------------------------------------------------------
  return (
    <div style={S.page}>
      {/* HERO */}
      <div style={S.hero}>
        <div style={S.heroCircle1} />
        <div style={S.heroCircle2} />
        <div style={S.avatar}>{initials}</div>
        <div style={S.heroInfo}>
          <div style={S.heroName}>{profileForm.fullName || user?.fullName}</div>
          <div style={S.heroRole}>👔 {employee?.positionTitle}</div>
          <div style={S.heroMeta}>
            {employee?.code      && <span style={S.heroMetaItem}>📋 {employee.code}</span>}
            {profileForm.phone   && <span style={S.heroMetaItem}>📞 {profileForm.phone}</span>}
            {user?.email         && <span style={S.heroMetaItem}>📧 {user.email}</span>}
            {employee?.hireDate  && <span style={S.heroMetaItem}>📅 Vào làm: {employee.hireDate}</span>}
          </div>
        </div>
        <div style={S.heroActions}>
          <button style={S.btnWhite} onClick={() => setTab('profile')}>✏️ Sửa thông tin</button>
          <button style={S.btnOutlineWhite} onClick={() => setTab('leave-form')}>📝 Nộp đơn nghỉ</button>
        </div>
      </div>

      {/* TABS */}
      <div style={S.tabs}>
        {TABS.map(t => (
          <button key={t.key} style={S.tab(tab === t.key)} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: HỒ SƠ ── */}
      {tab === 'profile' && (
        <>
          <div style={S.card}>
            <CardTitle>Thông tin cá nhân</CardTitle>
            <div style={S.formGrid}>
              <FormField label="Họ và tên">
                <input style={S.input} value={profileForm.fullName}
                  onChange={e => setProfileForm(p => ({ ...p, fullName: e.target.value }))} />
              </FormField>
              <FormField label="Mã nhân viên">
                <input style={S.inputReadonly} value={employee?.code || ''} readOnly />
              </FormField>
              <FormField label="Ngày sinh">
                <input style={S.input} type="date" defaultValue={employee?.dob || ''} />
              </FormField>
              <FormField label="Giới tính">
                <select style={{ ...S.select, width: '100%' }}>
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                </select>
              </FormField>
              <FormField label="Số điện thoại">
                <input style={S.input} value={profileForm.phone}
                  onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} />
              </FormField>
              <FormField label="Email cá nhân">
                <input style={S.input} type="email" value={profileForm.personalEmail || ''}
                  onChange={e => setProfileForm(p => ({ ...p, personalEmail: e.target.value }))} />
              </FormField>
              <FormField label="Email công ty">
                <input style={S.inputReadonly} value={employee?.email || ''} readOnly />
              </FormField>
              <FormField label="CCCD / CMT">
                <input style={S.input} value={profileForm.cccd || ''}
                  onChange={e => setProfileForm(p => ({ ...p, cccd: e.target.value }))} />
              </FormField>
              <FormField label="Địa chỉ thường trú" fullWidth>
                <input style={S.input} value={profileForm.address || ''}
                  onChange={e => setProfileForm(p => ({ ...p, address: e.target.value }))} />
              </FormField>
            </div>
          </div>

          <div style={S.card}>
            <CardTitle>Thông tin công việc</CardTitle>
            <div style={S.formGrid}>
              <FormField label="Phòng ban">
                <input style={S.inputReadonly} value={employee?.departmentName || ''} readOnly />
              </FormField>
              <FormField label="Chức vụ">
                <input style={S.inputReadonly} value={employee?.positionTitle || ''} readOnly />
              </FormField>
              <FormField label="Ngày vào làm">
                <input style={S.inputReadonly} value={employee?.hireDate || ''} readOnly />
              </FormField>
            </div>
          </div>

          <div style={S.card}>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={S.btnPrimary} onClick={handleSaveProfile}>Lưu thay đổi</button>
              <button style={S.btnGhost}>Hủy</button>
            </div>
          </div>

          <div style={S.card}>
            <CardTitle>Đổi mật khẩu</CardTitle>
            <div style={S.formGrid}>
              <FormField label="Mật khẩu hiện tại">
                <input style={S.input} type="password" placeholder="••••••••"
                  value={pwForm.current} onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))} />
              </FormField>
              <div />
              <FormField label="Mật khẩu mới">
                <input style={S.input} type="password" placeholder="••••••••"
                  value={pwForm.newPw} onChange={e => setPwForm(p => ({ ...p, newPw: e.target.value }))} />
              </FormField>
              <FormField label="Xác nhận mật khẩu mới">
                <input style={S.input} type="password" placeholder="••••••••"
                  value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} />
              </FormField>
            </div>
            <div style={{ marginTop: 18, display: 'flex', gap: 10 }}>
              <button style={S.btnPrimary} onClick={handleChangePassword}>Đổi mật khẩu</button>
              <button style={S.btnGhost} onClick={() => setPwForm({ current: '', newPw: '', confirm: '' })}>Hủy</button>
            </div>
          </div>
        </>
      )}

      {/* ── TAB: BẢNG LƯƠNG ── */}
      {tab === 'salary' && (
        <>
          {!showYear ? (
            <div style={S.card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <CardTitle>Bảng lương</CardTitle>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <select style={S.select} value={month} onChange={e => setMonth(+e.target.value)}>
                      {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                    <select style={S.select} value={year} onChange={e => setYear(+e.target.value)}>
                      {YEARS.map(y => <option key={y}>{y}</option>)}
                    </select>
                  </div>
                  <button style={S.btnPrint} onClick={printMonth}>🖨️ In tháng</button>
                  <button style={S.btnPrint} onClick={() => setShowYear(true)}>📊 Xem theo năm</button>
                </div>
              </div>

              {loading && <div style={{ textAlign: 'center', padding: 40, color: '#667085' }}>Đang tải...</div>}

              {!loading && !salaryDetail && (
                <div style={{ textAlign: 'center', padding: 40, color: '#667085' }}>
                  Chưa có dữ liệu lương tháng {month}/{year}
                </div>
              )}

              {!loading && salaryDetail && (
                <>
                  {/* Summary cards — dùng netPay / gross() / deduction */}
                  <div style={S.salSummary}>
                    <div style={S.sumCard('green')}>
                      <div style={S.sumLabel}>Thực lĩnh</div>
                      <div style={S.sumValue('green')}>{fmt(salaryDetail.netPay)}</div>
                    </div>
                    <div style={S.sumCard('gold')}>
                      <div style={S.sumLabel}>Tổng thu nhập</div>
                      <div style={S.sumValue('gold')}>{fmt(gross(salaryDetail))}</div>
                    </div>
                    <div style={S.sumCard('red')}>
                      <div style={S.sumLabel}>Khấu trừ</div>
                      <div style={S.sumValue('red')}>{fmt(salaryDetail.deduction)}</div>
                    </div>
                  </div>

                  {/* Detail table */}
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ background: '#f7f8fa', padding: '10px 14px', textAlign: 'left', fontSize: 11.5, fontWeight: 700, color: '#667085', textTransform: 'uppercase', letterSpacing: '.4px', borderBottom: '1.5px solid #eef0f3' }}>Khoản mục</th>
                        <th style={{ background: '#f7f8fa', padding: '10px 14px', textAlign: 'right', fontSize: 11.5, fontWeight: 700, color: '#667085', textTransform: 'uppercase', letterSpacing: '.4px', borderBottom: '1.5px solid #eef0f3' }}>Số tiền (VNĐ)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {buildSalaryRows().map((r, i) => {
                        if (r.type === 'sep') {
                          return (
                            <tr key={i}>
                              <td colSpan={2} style={{ background: '#f7f8fa', fontSize: 11, color: '#667085', padding: '6px 14px' }}>{r.label}</td>
                            </tr>
                          )
                        }
                        const color = r.type === 'total' ? '#04342C' : r.type === 'neg' ? '#d92d20' : '#085041'
                        const fw    = r.type === 'total' ? 700 : 600
                        const val   = r.type === 'neg' ? fmtNeg(r.value) : fmt(r.value)
                        return (
                          <tr key={i}>
                            <td style={{ padding: '11px 14px', fontSize: 13, borderBottom: '1px solid #eef0f3', color: r.type === 'total' ? '#1d2939' : '#667085', fontWeight: r.type === 'total' ? 700 : 400 }}>{r.label}</td>
                            <td style={{ padding: '11px 14px', fontSize: r.type === 'total' ? 15 : 13, borderBottom: '1px solid #eef0f3', textAlign: 'right', color, fontWeight: fw }}>{val}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          ) : (
            /* ── Year view ── */
            <div style={S.card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <CardTitle>Bảng lương năm {year}</CardTitle>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={S.btnGhost} onClick={() => setShowYear(false)}>← Quay lại</button>
                  <button style={S.btnPrint} onClick={printYear}>🖨️ In bảng năm</button>
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Tháng', 'Tổng thu nhập', 'Thưởng', 'Khấu trừ', 'Thực lĩnh'].map(h => (
                        <th key={h} style={{ background: '#04342C', color: '#fff', padding: '10px 14px', fontSize: 12, fontWeight: 600, textAlign: h === 'Tháng' ? 'left' : 'right' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 12 }, (_, i) => {
                      const r    = yearSalaries.find(s => s.month === i + 1)
                      const done = !!r
                      return (
                        <tr key={i}>
                          <td style={{ padding: '10px 14px', fontSize: 13, borderBottom: '1px solid #eef0f3', fontWeight: 600 }}>Tháng {i + 1}</td>
                          <td style={{ padding: '10px 14px', fontSize: 13, borderBottom: '1px solid #eef0f3', textAlign: 'right', color: done ? '#1d2939' : '#d0d5dd' }}>{done ? fmt(gross(r)) : '—'}</td>
                          <td style={{ padding: '10px 14px', fontSize: 13, borderBottom: '1px solid #eef0f3', textAlign: 'right', color: done && r.bonus ? '#085041' : '#d0d5dd' }}>{done && r.bonus ? fmt(r.bonus) : '—'}</td>
                          <td style={{ padding: '10px 14px', fontSize: 13, borderBottom: '1px solid #eef0f3', textAlign: 'right', color: done ? '#d92d20' : '#d0d5dd' }}>{done ? fmtNeg(r.deduction) : '—'}</td>
                          <td style={{ padding: '10px 14px', fontSize: 13, borderBottom: '1px solid #eef0f3', textAlign: 'right', fontWeight: done ? 700 : 400, color: done ? '#04342C' : '#d0d5dd' }}>{done ? fmt(r.netPay) : '—'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    {(() => {
                      const t = yearSalaries.reduce((a, r) => ({
                        gross:  a.gross  + gross(r),
                        bonus:  a.bonus  + (r.bonus     || 0),
                        deduct: a.deduct + (r.deduction || 0),
                        net:    a.net    + (r.netPay    || 0),
                      }), { gross: 0, bonus: 0, deduct: 0, net: 0 })
                      return (
                        <tr>
                          <td style={{ padding: '10px 14px', fontWeight: 700, background: '#f7f8fa', borderTop: '2px solid #eef0f3' }}>Cộng cả năm</td>
                          <td style={{ padding: '10px 14px', fontWeight: 700, background: '#f7f8fa', borderTop: '2px solid #eef0f3', textAlign: 'right' }}>{fmt(t.gross)}</td>
                          <td style={{ padding: '10px 14px', fontWeight: 700, background: '#f7f8fa', borderTop: '2px solid #eef0f3', textAlign: 'right', color: '#085041' }}>{fmt(t.bonus)}</td>
                          <td style={{ padding: '10px 14px', fontWeight: 700, background: '#f7f8fa', borderTop: '2px solid #eef0f3', textAlign: 'right', color: '#d92d20' }}>{fmtNeg(t.deduct)}</td>
                          <td style={{ padding: '10px 14px', fontWeight: 700, background: '#f7f8fa', borderTop: '2px solid #eef0f3', textAlign: 'right', color: '#04342C' }}>{fmt(t.net)}</td>
                        </tr>
                      )
                    })()}
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── TAB: CÁCH TÍNH LƯƠNG ── */}
      {tab === 'salary-method' && (
        <div style={S.panelRow}>
          <div>
            <div style={S.card}>
              <CardTitle>Cơ cấu lương</CardTitle>
              {[
                ['Lương cơ bản',        fmt(employee?.basicSalary           || 0)],
                ['Phụ cấp chức vụ',     fmt(employee?.positionTitleAllowance || 0)],
                ['Phụ cấp điện thoại',  fmt(employee?.phoneAllowance         || 0)],
                ['Phụ cấp xăng xe',     fmt(employee?.transportAllowance     || 0)],
                ['Phụ cấp ăn trưa',     fmt(employee?.mealAllowance          || 0)],
              ].map(([label, value]) => (
                <div key={label} style={S.methodRow}>
                  <span style={{ fontSize: 13, color: '#667085' }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1d2939' }}>{value}</span>
                </div>
              ))}
            </div>

            <div style={S.card}>
              <CardTitle>Khấu trừ bắt buộc</CardTitle>
              {['BHXH (8%)', 'BHYT (1.5%)', 'BHTN (1%)', 'Thuế TNCN (lũy tiến)'].map(label => (
                <div key={label} style={S.methodRow}>
                  <span style={{ fontSize: 13, color: '#667085' }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#d92d20' }}>Theo quy định</span>
                </div>
              ))}
              <div style={S.formula}>
                Thuế TNCN = (Thu nhập chịu thuế – Giảm trừ BT 11tr – Giảm trừ NPT) × Thuế suất lũy tiến
              </div>
            </div>
          </div>

          <div>
            <div style={S.card}>
              <CardTitle>Thưởng & Hoa hồng</CardTitle>
              {[
                ['Thưởng KPI hàng tháng', '0 – 5.000.000 ₫',  '#085041'],
                ['Hoa hồng doanh số',     '0.5% doanh thu',    '#085041'],
                ['Thưởng quý',            'Theo hiệu suất',    '#085041'],
                ['Thưởng Tết / Lễ',       'Theo chính sách',   '#085041'],
              ].map(([label, value, color]) => (
                <div key={label} style={S.methodRow}>
                  <span style={{ fontSize: 13, color: '#667085' }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color }}>+ {value}</span>
                </div>
              ))}
              <div style={S.formula}>
                {'KPI (%) = (Doanh thu thực tế / Mục tiêu) × 100\nThưởng KPI = Lương cơ bản × Hệ số KPI'}
              </div>
            </div>

            <div style={S.card}>
              <CardTitle>Ngày công & Nghỉ phép</CardTitle>
              {[
                ['Ngày làm việc/tháng', '26 ngày'],
                ['Lương theo ngày công', 'Lương CB ÷ 26'],
                ['Trừ lương ngày vắng',  '× Số ngày vắng'],
                ['Phép năm còn lại',     `${employee?.annualLeaveLeft ?? '—'} ngày`],
              ].map(([label, value]) => (
                <div key={label} style={S.methodRow}>
                  <span style={{ fontSize: 13, color: '#667085' }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1d2939' }}>{value}</span>
                </div>
              ))}
              <div style={S.formula}>
                {'Lương thực = Lương CB × (Ngày công thực / 26)\n+ Phụ cấp + Thưởng – Khấu trừ'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: NỘP ĐƠN NGHỈ ── */}
      {tab === 'leave-form' && (
        <div style={S.card}>
          <CardTitle>Loại đơn</CardTitle>
          <div style={S.leaveTypeGrid}>
            {LEAVE_TYPES.map(lt => (
                  <div key={lt.key} style={S.leaveTypeBtn(leaveType === lt.key)} onClick={() => setLeaveType(lt.key)}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{lt.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1d2939' }}>{lt.name}</div>
                <div style={{ fontSize: 10, color: '#667085', marginTop: 2 }}>{lt.desc}</div>
              </div>
            ))}
          </div>
          <hr style={S.divider} />
          <CardTitle>Chi tiết đơn</CardTitle>
          <div style={S.formGrid}>
            <FormField label="Từ ngày">
              <input style={S.input} type="date" value={leaveFrom} onChange={e => setLeaveFrom(e.target.value)} />
            </FormField>
            <FormField label="Đến ngày">
              <input style={S.input} type="date" value={leaveTo} onChange={e => setLeaveTo(e.target.value)} />
            </FormField>
            <FormField label="Lý do" fullWidth>
              <textarea style={S.textarea} placeholder="Mô tả lý do xin nghỉ..."
                value={leaveReason} onChange={e => setLeaveReason(e.target.value)} />
            </FormField>
            <FormField label="Giấy tờ đính kèm (nếu có)" fullWidth>
              <input style={{ ...S.input, padding: '6px 13px' }} type="file" accept=".pdf,.jpg,.png" />
            </FormField>
          </div>
          <div style={{ marginTop: 18, display: 'flex', gap: 10 }}>
            <button style={S.btnPrimary} onClick={handleSubmitLeave} disabled={leaveSubmitting}>
              {leaveSubmitting ? 'Đang gửi...' : 'Nộp đơn'}
            </button>
            <button style={S.btnGhost} onClick={() => { setLeaveFrom(''); setLeaveTo(''); setLeaveReason('') }}>Xóa form</button>
          </div>
        </div>
      )}

      {/* ── TAB: LỊCH SỬ NGHỈ PHÉP ── */}
      {tab === 'leave-history' && (
        <>
          <div style={S.card}>
            <CardTitle>Lịch sử nghỉ phép</CardTitle>
            {leaveHistory.length === 0 && (
              <div style={{ textAlign: 'center', padding: 32, color: '#667085' }}>Chưa có đơn nghỉ phép nào.</div>
            )}

            {leaveHistory.map((l, i) => {
              const lt = LEAVE_TYPES.find(t => t.key === l.type) || LEAVE_TYPES[0]
              return (
                <div key={i} style={{ ...S.leaveRow, borderBottom: i === leaveHistory.length - 1 ? 'none' : '1px solid #eef0f3' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: '#e1f5ee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{lt.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{lt.name}</div>
                    <div style={{ fontSize: 12, color: '#667085', marginTop: 2 }}>
                      {l.fromDate} {l.toDate && l.toDate !== l.fromDate ? `– ${l.toDate}` : ''} · {l.approverBy ? `Người duyệt: ${l.approverBy}` : 'Chờ duyệt'}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginRight: 8 }}>{l.days ? `${l.days} ngày` : ''}</div>
                  <span style={S.badge(l.status)}>{(STATUS_BADGE[l.status] || STATUS_BADGE.PENDING).label}</span>
                </div>
              )
            })}
          </div>

          <div style={S.card}>
            <CardTitle>Tổng hợp phép năm {year}</CardTitle>
            <div style={S.salSummary}>
              <div style={S.sumCard('green')}>
                <div style={S.sumLabel}>Phép còn lại</div>
                <div style={S.sumValue('green')}>{ leaveLeft} ngày</div>
              </div>
              <div style={S.sumCard('gold')}>
                <div style={S.sumLabel}>Đã dùng</div>
                <div style={S.sumValue('gold')}>{ totalUsed} ngày</div>
              </div>
              <div style={S.sumCard('green')}>
                <div style={S.sumLabel}>Tổng phép năm</div>
                <div style={{ fontSize: 19, fontWeight: 700, color: '#085041' }}>{'12'} ngày</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}