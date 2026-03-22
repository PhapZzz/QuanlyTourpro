import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider, App as AntApp } from 'antd'
import viVN from 'antd/locale/vi_VN'
import { useAuthStore } from './stores/authStore'

import LoginPage from './pages/LoginPage'

import AdminLayout    from './layouts/AdminLayout'
import StaffLayout    from './layouts/StaffLayout'
import CustomerLayout from './layouts/CustomerLayout'

// Admin
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers     from './pages/admin/AdminUsers'
import AdminTours     from './pages/admin/AdminTours'
import AdminSuppliers from './pages/admin/AdminSuppliers'
import AdminCustomers from './pages/admin/AdminCustomers'
import AdminReports   from './pages/admin/AdminReports'

// Staff – HR
import HREmployees from './pages/staff/HREmployees'
import HRSalary    from './pages/staff/HRSalary'
import HRLeave     from './pages/staff/HRLeave'

// Staff – Warehouse
import WarehouseProducts from './pages/staff/WarehouseProducts'
import WarehouseSuppliers from './pages/staff/WarehouseSuppliers'
import ImportVouchers    from './pages/staff/ImportVouchers'

// Staff – Sales
import SalesBookings from './pages/staff/SalesBookings'
import SalesExport   from './pages/staff/SalesExport'
import SalesProfit   from './pages/staff/SalesProfit'

// Customer portal
import CustomerHome    from './pages/customer/CustomerHome'
import CustomerTours   from './pages/customer/CustomerTours'
import CustomerBooking from './pages/customer/CustomerBooking'
import CustomerProfile from './pages/customer/CustomerProfile'

const antdTheme = {
  token: {
    colorPrimary: '#1D9E75',
    borderRadius: 8,
  },
}

function PrivateRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user?.role)) return <Navigate to="/unauthorized" replace />
  return children
}

export default function App() {
  return (
    <ConfigProvider locale={viVN} theme={antdTheme}>
      <AntApp>
        <Routes>
          <Route path="/"      element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Admin portal */}
          <Route path="/admin" element={
            <PrivateRoute roles={['ADMIN']}><AdminLayout /></PrivateRoute>
          }>
            <Route index         element={<AdminDashboard />} />
            <Route path="users"     element={<AdminUsers />} />
            <Route path="tours"     element={<AdminTours />} />
            <Route path="suppliers" element={<AdminSuppliers />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="reports"   element={<AdminReports />} />
          </Route>

          {/* Staff portal */}
          <Route path="/staff" element={
            <PrivateRoute roles={['ADMIN','HR_MANAGER','WAREHOUSE_MANAGER','SALES_MANAGER','EMPLOYEE']}>
              <StaffLayout />
            </PrivateRoute>
          }>
            <Route path="hr/employees"        element={<HREmployees />} />
            <Route path="hr/salary"           element={<HRSalary />} />
            <Route path="hr/leave"            element={<HRLeave />} />
            <Route path="warehouse/products"  element={<WarehouseProducts />} />
            <Route path="warehouse/suppliers" element={<WarehouseSuppliers />} />
            <Route path="warehouse/import"    element={<ImportVouchers />} />
            <Route path="sales/bookings"      element={<SalesBookings />} />
            <Route path="sales/export"        element={<SalesExport />} />
            <Route path="sales/profit"        element={<SalesProfit />} />
          </Route>

          {/* Customer portal */}
          <Route path="/portal" element={
            <PrivateRoute roles={['CUSTOMER','ADMIN']}><CustomerLayout /></PrivateRoute>
          }>
            <Route index            element={<CustomerHome />} />
            <Route path="tours"     element={<CustomerTours />} />
            <Route path="booking"   element={<CustomerBooking />} />
            <Route path="profile"   element={<CustomerProfile />} />
          </Route>

          <Route path="/unauthorized" element={
            <div style={{ padding: 60, textAlign: 'center', fontSize: 18 }}>
              403 – Bạn không có quyền truy cập trang này.
            </div>
          } />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AntApp>
    </ConfigProvider>
  )
}
