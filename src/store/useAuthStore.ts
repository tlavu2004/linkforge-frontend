import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthResponse } from '../types'

interface AuthState {
  user: AuthResponse | null
  isAuthenticated: boolean
  setAuth: (data: AuthResponse) => void
  clearAuth: () => void
  setVip: (isVip: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setAuth: (data) => set({ user: data, isAuthenticated: true }),
      clearAuth: () => set({ user: null, isAuthenticated: false }),
      setVip: (vip) => set((state) => ({ user: state.user ? { ...state.user, vip } : null })),
    }),
    {
      name: 'auth-storage',
    }
  )
)
