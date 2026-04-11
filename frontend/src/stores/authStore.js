import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      login: (token, user) => {
        localStorage.setItem('tourpro_token', token)
        set({ token, user, isAuthenticated: true })
      },

      logout: () => {
        localStorage.removeItem('tourpro_token')
        localStorage.removeItem('tourpro-auth')
        set({ token: null, user: null, isAuthenticated: false })
      },

      isAdmin:     () => get().user?.role === 'ADMIN',
      isHR:        () => ['ADMIN', 'HR_MANAGER'].includes(get().user?.role),
      isWarehouse: () => ['ADMIN', 'WAREHOUSE_MANAGER'].includes(get().user?.role),
      isSales:     () => ['ADMIN', 'SALES_MANAGER'].includes(get().user?.role),
      isCustomer:  () => get().user?.role === 'CUSTOMER',
    }),
    { name: 'tourpro-auth' }
  )
)
