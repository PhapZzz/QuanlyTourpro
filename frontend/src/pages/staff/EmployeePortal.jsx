// // ============================================================
// // PASTE VÀO: src/pages/employee/EmployeePortal.jsx
// // (tạo thư mục src/pages/employee/ nếu chưa có)
// //
// // Thêm route vào file router (App.jsx hoặc router.jsx):
// //   import EmployeePortal from './pages/employee/EmployeePortal'
// //   <Route path="/employee" element={<EmployeePortal />} />
// //
// // Sau khi login, redirect role EMPLOYEE về /employee
// // ============================================================
//
// import React, { useEffect, useState, useCallback } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { employeeAPI, leaveAPI, salaryAPI } from '../../services/api'
// import { useAuthStore } from '../../stores/authStore'
//
// // ─── Helpers ──────────────────────────────────────────────────────────────────
// const fmt    = v => v ? new Intl.NumberFormat('vi-VN').format(v) : '0'
// const fmtVND = v => fmt(v) + ' ₫'
//
// const TYPE_LABEL = {
//   ANNUAL: 'Nghỉ phép năm', SICK: 'Nghỉ ốm',
//   MATERNITY: 'Thai sản',   PATERNITY: 'Nghỉ con',
//   RESIGNATION: 'Nghỉ việc', OTHER: 'Khác',
// }
// const LEAVE_STATUS_COLOR = { PENDING: '#fa8c16', APPROVED: '#1D9E75', REJECTED: '#E24B4A' }
// const LEAVE_STATUS_LABEL = { PENDING: 'Chờ duyệt', APPROVED: 'Đã duyệt', REJECTED: 'Từ chối' }
//
// // ─── Print ────────────────────────────────────────────────────────────────────
// function printMonth(row, user) {
//   const w = window.open('', '_blank')
//   w.document.write(`<html><head><title>Phiếu lương ${row.month}/${row.year}</title>
//   <style>body{font-family:Arial,sans-serif;padding:32px;max-width:600px;margin:0 auto}
//   h2{text-align:center;color:#04342C}.meta{display:flex;justify-content:space-between;margin-bottom:20px;font-size:13px}
//   table{width:100%;border-collapse:collapse}td{padding:9px 12px;border-bottom:1px solid #eee}
//   .l{color:#666;width:55%}.v{font-weight:600;text-align:right}
//   .tot{background:#f0faf5}.tot td{padding:11px 12px}
//   .foot{text-align:center;margin-top:24px;color:#999;font-size:11px}
//   @media print{button{display:none}}</style></head><body>
//   <h2>✈ TourPro – PHIẾU LƯƠNG</h2>
//   <div class="meta">
//     <div><b>${user?.fullName??''}</b><br/>${user?.code??user?.employeeCode??''} · ${user?.positionTitle??''}<br/>${user?.departmentName??''}</div>
//     <div style="text-align:right"><b>Tháng ${row.month}/${row.year}</b></div>
//   </div>
//   <table>
//     <tr><td class="l">Lương cơ bản</td><td class="v">${fmt(row.baseSalary)} ₫</td></tr>
//     <tr><td class="l">Phụ cấp</td><td class="v">+ ${fmt(row.allowance)} ₫</td></tr>
//     <tr><td class="l">Thưởng KPI</td><td class="v">+ ${fmt(row.bonus)} ₫</td></tr>
//     <tr><td class="l">BHXH (8%)</td><td class="v" style="color:#E24B4A">− ${fmt(row.bhxh)} ₫</td></tr>
//     <tr><td class="l">BHYT (1.5%)</td><td class="v" style="color:#E24B4A">− ${fmt(row.bhyt)} ₫</td></tr>
//     <tr><td class="l">BHTN (1%)</td><td class="v" style="color:#E24B4A">− ${fmt(row.bhtn)} ₫</td></tr>
//     <tr><td class="l">Thuế TNCN</td><td class="v" style="color:#E24B4A">− ${fmt(row.tax)} ₫</td></tr>
//     <tr class="tot"><td class="l"><b>THỰC LĨNH</b></td><td class="v" style="color:#1D9E75;font-size:1.1em">${fmt(row.netPay)} ₫</td></tr>
//   </table>
//   <div class="foot">TourPro · ${new Date().toLocaleString('vi-VN')}</div>
//   <br/><button onclick="window.print()">🖨 In phiếu</button></body></html>`)
//   w.document.close(); setTimeout(() => w.print(), 300)
// }
//
// function printYear(rows, user, year) {
//   const totalNet = rows.reduce((s,r)=>s+(r.netPay??0),0)
//   const w = window.open('', '_blank')
//   w.document.write(`<html><head><title>Bảng lương năm ${year}</title>
//   <style>body{font-family:Arial,sans-serif;padding:32px}h2{text-align:center;color:#04342C}
//   table{width:100%;border-collapse:collapse;font-size:13px}
//   th{background:#04342C;color:#fff;padding:8px;text-align:right}th:first-child{text-align:left}
//   td{padding:7px 6px;border-bottom:1px solid #eee;text-align:right}td:first-child{text-align:left}
//   .tr{background:#f0faf5;font-weight:700}@media print{button{display:none}}</style></head><body>
//   <h2>✈ TourPro – BẢNG LƯƠNG NĂM ${year}</h2>
//   <p><b>${user?.fullName??''}</b> · ${user?.code??user?.employeeCode??''} · ${user?.departmentName??''}</p>
//   <table><thead><tr><th>Tháng</th><th>Lương CB</th><th>Phụ cấp</th><th>Thưởng</th><th>Khấu trừ</th><th>Thuế</th><th>Thực lĩnh</th></tr></thead>
//   <tbody>${rows.map(r=>`<tr>
//     <td>Tháng ${r.month}</td><td>${fmt(r.baseSalary)}</td><td>${fmt(r.allowance)}</td>
//     <td>${fmt(r.bonus)}</td><td>${fmt((r.bhxh??0)+(r.bhyt??0)+(r.bhtn??0))}</td>
//     <td>${fmt(r.tax)}</td><td><b style="color:#1D9E75">${fmt(r.netPay)}</b></td>
//   </tr>`).join('')}
//   <tr class="tr"><td>TỔNG</td><td></td><td></td><td></td><td></td><td></td><td style="color:#1D9E75">${fmt(totalNet)}</td></tr>
//   </tbody></table><br/><button onclick="window.print()">🖨 In</button></body></html>`)
//   w.document.close(); setTimeout(() => w.print(), 300)
// }
//
// // ─── Toast ────────────────────────────────────────────────────────────────────
// function useToast() {
//   const [t, set] = useState(null)
//   const show = useCallback((msg, color='#1D9E75') => {
//     set({ msg, color }); setTimeout(()=>set(null), 2800)
//   }, [])
//   return [t, show]
// }
// function Toast({ t }) {
//   if (!t) return null
//   return <div style={{position:'fixed',top:24,right:24,zIndex:9999,background:t.color,color:'#fff',padding:'11px 20px',borderRadius:10,fontSize:14,fontWeight:500,boxShadow:'0 4px 20px rgba(0,0,0,.2)',animation:'slideIn .2s ease'}}>{t.msg}</div>
// }
//
// // ─── Shared styles ────────────────────────────────────────────────────────────
// const S = {
//   btnGreen:   {background:'#1D9E75',color:'#fff',border:'none',borderRadius:8,padding:'7px 16px',cursor:'pointer',fontSize:13,fontWeight:600},
//   btnOutline: {border:'1.5px solid #1D9E75',color:'#1D9E75',background:'none',borderRadius:8,padding:'6px 14px',cursor:'pointer',fontSize:13,fontWeight:500},
//   btnGray:    {border:'1.5px solid #ddd',background:'none',borderRadius:7,padding:'7px 14px',cursor:'pointer',fontSize:13,color:'#666'},
//   input:      {border:'1.5px solid #1D9E75',borderRadius:7,padding:'6px 10px',fontSize:14,outline:'none',minWidth:220},
//   inputFull:  {width:'100%',border:'1.5px solid #d0ece4',borderRadius:7,padding:'7px 10px',fontSize:14,outline:'none',boxSizing:'border-box'},
//   select:     {width:'100%',border:'1.5px solid #d0ece4',borderRadius:7,padding:'7px 10px',fontSize:14,outline:'none',background:'#fff',boxSizing:'border-box'},
//   textarea:   {width:'100%',border:'1.5px solid #d0ece4',borderRadius:7,padding:'7px 10px',fontSize:14,outline:'none',resize:'vertical',boxSizing:'border-box'},
//   label:      {fontSize:12,color:'#666',display:'block',marginBottom:4},
//   card:       {background:'#fff',border:'1px solid #e8f5f0',borderRadius:12,overflow:'hidden'},
// }
//
// // ─── Tab: Hồ sơ ───────────────────────────────────────────────────────────────
// function ProfileTab({ empId }) {
//   const [profile, setProfile] = useState(null)
//   const [editing, setEditing] = useState(false)
//   const [form,    setForm]    = useState({ phone:'', email:'' })
//   const [loading, setLoading] = useState(true)
//   const [saving,  setSaving]  = useState(false)
//   const [toast, showToast]    = useToast()
//
//   useEffect(() => {
//     if (!empId) return
//     employeeAPI.getById(empId)
//       .then(r => {
//         const d = r.data?.data ?? r.data
//         setProfile(d)
//         setForm({ phone: d.phone ?? '', email: d.email ?? '' })
//       })
//       .catch(() => showToast('Không tải được hồ sơ', '#E24B4A'))
//       .finally(() => setLoading(false))
//   }, [empId])
//
//   const save = async () => {
//     setSaving(true)
//     try {
//       // Chỉ gửi trường nhân viên được phép tự chỉnh sửa
//       await employeeAPI.update(empId, { phone: form.phone, email: form.email })
//       setProfile(p => ({ ...p, ...form }))
//       setEditing(false)
//       showToast('Đã lưu thông tin')
//     } catch (e) {
//       showToast(e.response?.data?.message ?? 'Lưu thất bại', '#E24B4A')
//     } finally {
//       setSaving(false)
//     }
//   }
//
//   if (loading) return <Spinner />
//   if (!profile) return null
//
//   return (
//     <div style={{ maxWidth: 680 }}>
//       <Toast t={toast} />
//       {/* Avatar */}
//       <div style={{ display:'flex', gap:20, alignItems:'center', marginBottom:24 }}>
//         <div style={{ width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg,#1D9E75,#04342C)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, color:'#fff', fontWeight:700, flexShrink:0 }}>
//           {profile.fullName?.[0] ?? '?'}
//         </div>
//         <div>
//           <div style={{ fontSize:22, fontWeight:700, color:'#04342C' }}>{profile.fullName}</div>
//           <div style={{ color:'#888', fontSize:13, marginTop:2 }}>{profile.positionTitle} · {profile.departmentName}</div>
//           <span style={{ display:'inline-block', marginTop:6, padding:'2px 10px', borderRadius:20, background:'#e6f9f2', color:'#1D9E75', fontSize:12, fontWeight:600 }}>Đang làm việc</span>
//         </div>
//       </div>
//       {/* Card */}
//       <div style={S.card}>
//         <div style={{ padding:'13px 20px', background:'#f7fdfb', borderBottom:'1px solid #e8f5f0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
//           <span style={{ fontWeight:600, color:'#04342C' }}>Thông tin cá nhân</span>
//           {!editing
//             ? <button onClick={() => setEditing(true)} style={S.btnOutline}>✏ Chỉnh sửa</button>
//             : <div style={{ display:'flex', gap:8 }}>
//                 <button onClick={() => { setEditing(false); setForm({ phone:profile.phone??'', email:profile.email??'' }) }} style={S.btnGray}>Hủy</button>
//                 <button onClick={save} disabled={saving} style={S.btnGreen}>{saving ? 'Đang lưu...' : 'Lưu'}</button>
//               </div>
//           }
//         </div>
//         {[
//           ['Mã nhân viên',  profile.code,           false],
//           ['Họ và tên',     profile.fullName,        false],
//           ['Ngày sinh',     profile.dob,             false],
//           ['CCCD',          profile.cccd,            false],
//           ['Số điện thoại', form.phone,              editing],
//           ['Email',         form.email,              editing],
//           ['Phòng ban',     profile.departmentName,  false],
//           ['Chức vụ',       profile.positionTitle,   false],
//           ['Ngày vào làm',  profile.hireDate,        false],
//         ].map(([label, value, editable], i, arr) => (
//           <div key={i} style={{ display:'flex', alignItems:'center', padding:'11px 20px', borderBottom: i<arr.length-1 ? '1px solid #f0f8f5' : 'none' }}>
//             <div style={{ width:160, color:'#888', fontSize:13 }}>{label}</div>
//             {editable
//               ? <input value={value??''} onChange={e => setForm(f => label.includes('điện') ? {...f,phone:e.target.value} : {...f,email:e.target.value})} style={S.input} />
//               : <div style={{ fontWeight:500 }}>{value ?? '—'}</div>
//             }
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }
//
// // ─── Tab: Nghỉ phép ───────────────────────────────────────────────────────────
// function LeaveTab({ empId }) {
//   const [leaves,     setLeaves]     = useState([])
//   const [loading,    setLoading]    = useState(true)
//   const [submitting, setSubmitting] = useState(false)
//   const [showForm,   setShowForm]   = useState(false)
//   const [form,       setForm]       = useState({ type:'ANNUAL', fromDate:'', toDate:'', reason:'' })
//   const [toast, showToast]          = useToast()
//
//   const load = useCallback(() => {
//     setLoading(true)
//     leaveAPI.getAll(0, 100)
//       .then(r => {
//         const content = r.data?.data?.content ?? r.data?.data ?? []
//         // Lọc chỉ lấy đơn của nhân viên đang đăng nhập
//         setLeaves(content.filter(l => l.employeeId === empId || l.userId === empId))
//       })
//       .catch(() => showToast('Không tải được danh sách', '#E24B4A'))
//       .finally(() => setLoading(false))
//   }, [empId])
//
//   useEffect(() => { load() }, [load])
//
//   const submit = async () => {
//     if (!form.fromDate || !form.toDate || !form.type)
//       return showToast('Vui lòng điền đầy đủ', '#E24B4A')
//     setSubmitting(true)
//     try {
//       // POST /hr/leaves/employee/{empId}
//       await leaveAPI.submit(empId, {
//         type:     form.type,
//         fromDate: form.fromDate,
//         toDate:   form.toDate,
//         reason:   form.reason,
//       })
//       showToast('Đã nộp đơn xin nghỉ!')
//       setShowForm(false)
//       setForm({ type:'ANNUAL', fromDate:'', toDate:'', reason:'' })
//       load()
//     } catch (e) {
//       showToast(e.response?.data?.message ?? 'Nộp đơn thất bại', '#E24B4A')
//     } finally {
//       setSubmitting(false)
//     }
//   }
//
//   const annualUsed = leaves.filter(l=>l.type==='ANNUAL'&&l.status==='APPROVED').reduce((s,l)=>s+(l.days??0),0)
//
//   return (
//     <div style={{ maxWidth:720 }}>
//       <Toast t={toast} />
//       {/* Stats */}
//       <div style={{ display:'flex', gap:12, marginBottom:20 }}>
//         {[
//           { label:'Phép năm đã dùng', value:`${annualUsed}/12 ngày`, color:'#1D9E75' },
//           { label:'Còn lại',           value:`${12-annualUsed} ngày`, color:'#04342C' },
//           { label:'Đang chờ duyệt',   value:`${leaves.filter(l=>l.status==='PENDING').length} đơn`, color:'#fa8c16' },
//         ].map((s,i)=>(
//           <div key={i} style={{ flex:1, background:'#fff', border:'1px solid #e8f5f0', borderRadius:12, padding:'14px 16px' }}>
//             <div style={{ fontSize:11, color:'#888', marginBottom:4 }}>{s.label}</div>
//             <div style={{ fontSize:20, fontWeight:700, color:s.color }}>{s.value}</div>
//           </div>
//         ))}
//       </div>
//       {/* Header */}
//       <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
//         <span style={{ fontWeight:600, color:'#04342C', fontSize:16 }}>Lịch sử đơn nghỉ</span>
//         <button onClick={() => setShowForm(true)} style={S.btnGreen}>+ Nộp đơn mới</button>
//       </div>
//       {/* Form */}
//       {showForm && (
//         <div style={{ background:'#f7fdfb', border:'1.5px solid #b2e8d6', borderRadius:12, padding:20, marginBottom:16 }}>
//           <div style={{ fontWeight:600, color:'#04342C', marginBottom:14 }}>📋 Đơn xin nghỉ</div>
//           <div style={{ marginBottom:12 }}>
//             <label style={S.label}>Loại nghỉ *</label>
//             <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} style={S.select}>
//               {Object.entries(TYPE_LABEL).map(([k,v])=><option key={k} value={k}>{v}</option>)}
//             </select>
//           </div>
//           <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
//             <div>
//               <label style={S.label}>Từ ngày *</label>
//               <input type="date" value={form.fromDate} onChange={e=>setForm(f=>({...f,fromDate:e.target.value}))} style={S.inputFull} />
//             </div>
//             <div>
//               <label style={S.label}>Đến ngày *</label>
//               <input type="date" value={form.toDate} onChange={e=>setForm(f=>({...f,toDate:e.target.value}))} style={S.inputFull} />
//             </div>
//           </div>
//           <div style={{ marginBottom:14 }}>
//             <label style={S.label}>Lý do</label>
//             <textarea value={form.reason} rows={3} onChange={e=>setForm(f=>({...f,reason:e.target.value}))} style={S.textarea} />
//           </div>
//           <div style={{ display:'flex', gap:8 }}>
//             <button onClick={()=>setShowForm(false)} style={S.btnGray}>Hủy</button>
//             <button onClick={submit} disabled={submitting} style={S.btnGreen}>{submitting?'Đang nộp...':'Nộp đơn'}</button>
//           </div>
//         </div>
//       )}
//       {/* List */}
//       {loading ? <Spinner /> : leaves.length === 0
//         ? <Empty text="Chưa có đơn xin nghỉ nào" />
//         : leaves.map(l=>(
//           <div key={l.id} style={{ background:'#fff', border:'1px solid #e8f5f0', borderRadius:10, padding:'14px 16px', marginBottom:10 }}>
//             <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
//               <span style={{ fontWeight:600 }}>{TYPE_LABEL[l.type]??l.type}</span>
//               <span style={{ background:(LEAVE_STATUS_COLOR[l.status]??'#999')+'22', color:LEAVE_STATUS_COLOR[l.status]??'#999', padding:'2px 10px', borderRadius:20, fontSize:11, fontWeight:600 }}>
//                 {LEAVE_STATUS_LABEL[l.status]??l.status}
//               </span>
//             </div>
//             <div style={{ fontSize:12, color:'#888' }}>{l.fromDate} → {l.toDate} · <b>{l.days} ngày</b></div>
//             {l.reason  && <div style={{ fontSize:12, color:'#666', marginTop:2 }}>📌 {l.reason}</div>}
//             {l.comment && <div style={{ fontSize:12, color:'#E24B4A', marginTop:2 }}>💬 HR: {l.comment}</div>}
//           </div>
//         ))
//       }
//     </div>
//   )
// }
//
// // ─── Tab: Lương ───────────────────────────────────────────────────────────────
// function SalaryTab({ empId }) {
//   const [salaries,    setSalaries]    = useState([])
//   const [profile,     setProfile]     = useState(null)
//   const [loading,     setLoading]     = useState(true)
//   const [showFormula, setShowFormula] = useState(false)
//   const [selectedYear, setYear]       = useState(new Date().getFullYear())
//   const [toast, showToast]            = useToast()
//
//   // Lấy profile để hiển thị lương cơ bản và dùng khi in
//   useEffect(() => {
//     if (!empId) return
//     employeeAPI.getById(empId).then(r => setProfile(r.data?.data ?? r.data)).catch(()=>{})
//   }, [empId])
//
//   // Lấy lương theo từng tháng trong năm được chọn
//   const loadYear = useCallback(async (year) => {
//     setLoading(true)
//     try {
//       // Gọi song song 12 tháng → lọc bản ghi của empId
//       const settled = await Promise.allSettled(
//         Array.from({length:12},(_,i)=>i+1).map(m => salaryAPI.getByMonthYear(m, year))
//       )
//       const rows = []
//       settled.forEach((res, idx) => {
//         if (res.status !== 'fulfilled') return
//         const arr = Array.isArray(res.value.data?.data) ? res.value.data.data
//                   : Array.isArray(res.value.data?.data?.content) ? res.value.data.data.content
//                   : []
//         const mine = arr.find(r => r.employeeId === empId || r.userId === empId)
//         if (mine) rows.push({ ...mine, month: idx+1, year })
//       })
//       rows.sort((a,b) => b.month - a.month)
//       setSalaries(rows)
//     } catch {
//       showToast('Không tải được bảng lương', '#E24B4A')
//     } finally {
//       setLoading(false)
//     }
//   }, [empId])
//
//   useEffect(() => { loadYear(selectedYear) }, [selectedYear, loadYear])
//
//   const base = profile?.baseSalary ?? 0
//   const pc   = profile?.allowance  ?? 0
//   const bhxh = Math.round(base * 0.08)
//   const bhyt = Math.round(base * 0.015)
//   const bhtn = Math.round(base * 0.01)
//   const taxable = base + pc - bhxh - bhyt - bhtn - 11_000_000
//   const tax  = taxable > 0 ? Math.round(taxable * 0.1) : 0
//
//   return (
//     <div style={{ maxWidth:780 }}>
//       <Toast t={toast} />
//       {/* Hero */}
//       <div style={{ background:'linear-gradient(135deg,#04342C,#1D9E75)', borderRadius:14, padding:'18px 22px', marginBottom:20, color:'#fff' }}>
//         <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
//           <div>
//             <div style={{ fontSize:13, opacity:.8, marginBottom:4 }}>Lương cơ bản hiện tại</div>
//             <div style={{ fontSize:26, fontWeight:700 }}>{fmtVND(base)}</div>
//             <div style={{ fontSize:13, opacity:.75, marginTop:2 }}>Phụ cấp: +{fmtVND(pc)}/tháng</div>
//           </div>
//           <button onClick={()=>setShowFormula(f=>!f)} style={{ background:'rgba(255,255,255,.15)', border:'none', color:'#fff', padding:'8px 16px', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:500 }}>
//             {showFormula ? '▲ Ẩn' : '📐 Cách tính lương'}
//           </button>
//         </div>
//       </div>
//       {/* Công thức */}
//       {showFormula && (
//         <div style={{ background:'#f7fdfb', border:'1.5px solid #b2e8d6', borderRadius:12, padding:18, marginBottom:20 }}>
//           <div style={{ fontWeight:700, color:'#04342C', marginBottom:10 }}>📐 Công thức tính lương thực lĩnh</div>
//           <div style={{ fontFamily:'monospace', fontSize:13, background:'#fff', borderRadius:8, padding:14, border:'1px solid #d0ece4', lineHeight:2.1 }}>
//             <div style={{ color:'#1D9E75', fontWeight:600 }}>Thực lĩnh = Lương CB + Phụ cấp + Thưởng − Khấu trừ</div>
//             <div style={{ paddingLeft:12, color:'#555' }}>
//               <div>• BHXH: 8% × Lương CB = <span style={{color:'#E24B4A'}}>−{fmtVND(bhxh)}</span></div>
//               <div>• BHYT: 1.5% × Lương CB = <span style={{color:'#E24B4A'}}>−{fmtVND(bhyt)}</span></div>
//               <div>• BHTN: 1% × Lương CB = <span style={{color:'#E24B4A'}}>−{fmtVND(bhtn)}</span></div>
//               <div>• Thuế TNCN: 10% phần vượt GTGC <b>11.000.000 ₫/tháng</b></div>
//             </div>
//             <div style={{ borderTop:'1px dashed #b2e8d6', marginTop:10, paddingTop:10 }}>
//               Ví dụ không có thưởng: <b style={{color:'#1D9E75'}}>{fmtVND(base+pc-bhxh-bhyt-bhtn-tax)}</b>
//             </div>
//           </div>
//         </div>
//       )}
//       {/* Bộ lọc */}
//       <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
//         <div style={{ display:'flex', gap:8, alignItems:'center' }}>
//           <span style={{ fontWeight:600, color:'#04342C', fontSize:15 }}>Lịch sử lương</span>
//           <select value={selectedYear} onChange={e=>setYear(+e.target.value)} style={{ ...S.select, width:110 }}>
//             {[new Date().getFullYear(), new Date().getFullYear()-1].map(y=>(
//               <option key={y} value={y}>Năm {y}</option>
//             ))}
//           </select>
//         </div>
//         <button onClick={()=>printYear(salaries, profile, selectedYear)} disabled={salaries.length===0} style={S.btnOutline}>
//           🖨 In bảng lương năm
//         </button>
//       </div>
//       {/* List */}
//       {loading ? <Spinner /> : salaries.length === 0
//         ? <Empty text={`Chưa có dữ liệu lương năm ${selectedYear}`} />
//         : salaries.map((row,i)=>(
//           <div key={i} style={{ background:'#fff', border:'1px solid #e8f5f0', borderRadius:12, padding:'16px 18px', marginBottom:10 }}>
//             <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
//               <div>
//                 <div style={{ fontWeight:700, fontSize:15, color:'#04342C', marginBottom:6 }}>Tháng {row.month}/{row.year}</div>
//                 <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
//                   <span style={{ fontSize:12, color:'#666' }}>Lương CB: <b>{fmt(row.baseSalary)}</b></span>
//                   <span style={{ fontSize:12, color:'#666' }}>Phụ cấp: <b>+{fmt(row.allowance)}</b></span>
//                   <span style={{ fontSize:12, color:'#1D9E75' }}>Thưởng: <b>+{fmt(row.bonus)}</b></span>
//                   <span style={{ fontSize:12, color:'#E24B4A' }}>KT: <b>−{fmt((row.bhxh??0)+(row.bhyt??0)+(row.bhtn??0)+(row.tax??0))}</b></span>
//                 </div>
//               </div>
//               <div style={{ textAlign:'right' }}>
//                 <div style={{ fontSize:22, fontWeight:800, color:'#1D9E75' }}>{fmtVND(row.netPay)}</div>
//                 <div style={{ display:'flex', gap:6, marginTop:6, justifyContent:'flex-end' }}>
//                   <span style={{ background:row.status==='PAID'?'#e6f9f2':'#fff7e6', color:row.status==='PAID'?'#1D9E75':'#fa8c16', padding:'2px 10px', borderRadius:20, fontSize:11, fontWeight:600 }}>
//                     {row.status==='PAID'?'Đã thanh toán':row.status==='APPROVED'?'Đã duyệt':'Nháp'}
//                   </span>
//                   <button onClick={()=>printMonth(row, profile)} style={{ border:'1px solid #d0ece4', background:'none', borderRadius:6, padding:'2px 10px', cursor:'pointer', fontSize:11, color:'#666' }}>🖨 In</button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ))
//       }
//     </div>
//   )
// }
//
// // ─── Micro components ─────────────────────────────────────────────────────────
// function Spinner() {
//   return <div style={{ textAlign:'center', color:'#aaa', padding:40 }}>Đang tải...</div>
// }
// function Empty({ text }) {
//   return <div style={{ textAlign:'center', color:'#aaa', padding:40, background:'#fff', borderRadius:12, border:'1px dashed #d0ece4' }}>{text}</div>
// }
//
// // ─── Root ─────────────────────────────────────────────────────────────────────
// export default function EmployeePortal() {
//   const { user, logout } = useAuthStore()
//   const navigate = useNavigate()
//   const [tab, setTab] = useState('profile')
//
//   // user.id chính là employeeId (theo cấu trúc authStore của bạn)
//   const empId = user?.id
//
//   const TABS = [
//     { key:'profile', label:'👤 Hồ sơ' },
//     { key:'leave',   label:'📅 Nghỉ phép' },
//     { key:'salary',  label:'💰 Lương' },
//   ]
//
//   return (
//     <div style={{ fontFamily:"'Segoe UI',sans-serif", minHeight:'100vh', background:'#f5faf8' }}>
//       <style>{`
//         @keyframes slideIn{from{transform:translateX(16px);opacity:0}to{transform:translateX(0);opacity:1}}
//         button{transition:opacity .15s} button:hover{opacity:.83}
//         *{box-sizing:border-box}
//       `}</style>
//       {/* Header */}
//       <div style={{ background:'#04342C', padding:'0 28px', height:56, display:'flex', alignItems:'center', gap:12 }}>
//         <div style={{ width:32, height:32, background:'#1D9E75', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17 }}>✈</div>
//         <div>
//           <div style={{ color:'#fff', fontWeight:700, fontSize:14 }}>TourPro</div>
//           <div style={{ color:'#9FE1CB', fontSize:10 }}>Cổng nhân viên</div>
//         </div>
//         <div style={{ flex:1 }} />
//         <div style={{ display:'flex', alignItems:'center', gap:10 }}>
//           <div style={{ width:32, height:32, borderRadius:'50%', background:'#1D9E75', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700 }}>
//             {user?.fullName?.[0]??'?'}
//           </div>
//           <span style={{ color:'#fff', fontSize:13, fontWeight:600 }}>{user?.fullName}</span>
//           <button onClick={()=>{logout();navigate('/login')}} style={{ background:'rgba(255,255,255,.12)', border:'none', color:'#9FE1CB', borderRadius:6, padding:'5px 12px', cursor:'pointer', fontSize:12 }}>
//             Đăng xuất
//           </button>
//         </div>
//       </div>
//       {/* Tabs */}
//       <div style={{ background:'#fff', borderBottom:'1px solid #e8f5f0', padding:'0 28px', display:'flex' }}>
//         {TABS.map(t=>(
//           <button key={t.key} onClick={()=>setTab(t.key)} style={{ background:'none', border:'none', padding:'14px 22px', cursor:'pointer', fontSize:14, fontWeight:tab===t.key?700:400, color:tab===t.key?'#1D9E75':'#666', borderBottom:tab===t.key?'2.5px solid #1D9E75':'2.5px solid transparent' }}>
//             {t.label}
//           </button>
//         ))}
//       </div>
//       {/* Content */}
//       <div style={{ padding:'24px 28px' }}>
//         {tab==='profile' && <ProfileTab empId={empId} />}
//         {tab==='leave'   && <LeaveTab   empId={empId} />}
//         {tab==='salary'  && <SalaryTab  empId={empId} />}
//       </div>
//     </div>
//   )
// }