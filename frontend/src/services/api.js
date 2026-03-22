import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('tourpro_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('tourpro_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  login:          (data) => api.post('/auth/login', data),
  register:       (data) => api.post('/auth/register', data),
  changePassword: (data) => api.post('/auth/change-password', data),
}

export const adminAPI = {
  getDashboard:     ()           => api.get('/admin/dashboard'),
  getRevenueReport: (m, y)       => api.get(`/admin/reports/revenue?month=${m}&year=${y}`),
  getHRReport:      (m, y)       => api.get(`/admin/reports/hr?month=${m}&year=${y}`),
  getWarehouseReport:(m, y)      => api.get(`/admin/reports/warehouse?month=${m}&year=${y}`),
}

export const userAPI = {
  getAll:  (page = 0, size = 20) => api.get(`/admin/users?page=${page}&size=${size}`),
  create:  (data)                => api.post('/admin/users', data),
  update:  (id, data)            => api.put(`/admin/users/${id}`, data),
  delete:  (id)                  => api.delete(`/admin/users/${id}`),
}

export const customerAPI = {
  getAll:  (params) => api.get('/customers', { params }),
  getById: (id)     => api.get(`/customers/${id}`),
  create:  (data)   => api.post('/customers', data),
  update:  (id, data) => api.put(`/customers/${id}`, data),
  delete:  (id)     => api.delete(`/customers/${id}`),
}

export const employeeAPI = {
  getAll:         (params)      => api.get('/hr/employees', { params }),
  getById:        (id)          => api.get(`/hr/employees/${id}`),
  create:         (data)        => api.post('/hr/employees', data),
  update:         (id, data)    => api.put(`/hr/employees/${id}`, data),
  delete:         (id)          => api.delete(`/hr/employees/${id}`),
  changePosition: (id, data)    => api.post(`/hr/employees/${id}/change-position`, data),
}

export const salaryAPI = {
  getByMonthYear: (month, year) => api.get(`/hr/salary?month=${month}&year=${year}`),
  getByEmployee:  (empId)       => api.get(`/hr/salary/employee/${empId}`),
  calculate:      (empId, data) => api.post(`/hr/salary/${empId}/calculate`, data),
  approve:        (id)          => api.post(`/hr/salary/${id}/approve`),
}

export const leaveAPI = {
  getAll:    (page = 0, size = 20) => api.get(`/hr/leaves?page=${page}&size=${size}`),
  getPending: (page = 0, size = 20) => api.get(`/hr/leaves/pending?page=${page}&size=${size}`),
  submit:    (empId, data)         => api.post(`/hr/leaves/employee/${empId}`, data),
  approve:   (id, data)            => api.post(`/hr/leaves/${id}/approve`, data),
}

export const supplierAPI = {
  getAll:  (params)       => api.get('/warehouse/suppliers', { params }),
  create:  (data)         => api.post('/warehouse/suppliers', data),
  update:  (id, data)     => api.put(`/warehouse/suppliers/${id}`, data),
  delete:  (id)           => api.delete(`/warehouse/suppliers/${id}`),
}

export const productAPI = {
  getAll:  (params)       => api.get('/warehouse/products', { params }),
  create:  (data)         => api.post('/warehouse/products', data),
  update:  (id, data)     => api.put(`/warehouse/products/${id}`, data),
  delete:  (id)           => api.delete(`/warehouse/products/${id}`),
  lowStock: ()            => api.get('/warehouse/products/low-stock'),
}

export const tourAPI = {
  getAll:      (params)    => api.get('/tours', { params }),
  getById:     (id)        => api.get(`/tours/${id}`),
  create:      (data)      => api.post('/tours', data),
  update:      (id, data)  => api.put(`/tours/${id}`, data),
  addSchedule: (id, data)  => api.post(`/tours/${id}/schedules`, data),
}

export const bookingAPI = {
  getAll:       (params)         => api.get('/bookings', { params }),
  getById:      (id)             => api.get(`/bookings/${id}`),
  create:       (data)           => api.post('/bookings', data),
  updateStatus: (id, data)       => api.patch(`/bookings/${id}/status`, data),
  getByCustomer:(customerId, params) => api.get(`/bookings/customer/${customerId}`, { params }),
}

export const reviewAPI = {
  getByTour:     (tourId)    => api.get(`/reviews/tour/${tourId}`),
  getByCustomer: (customerId)=> api.get(`/reviews/customer/${customerId}`),
  create:        (data)      => api.post('/reviews', data),
  reply:         (id, data)  => api.put(`/reviews/${id}/reply`, data),
}

export default api
