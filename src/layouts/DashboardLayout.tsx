import { Outlet, Navigate, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { apiClient } from '../api/axios'
import { Toaster } from 'react-hot-toast'
import { LayoutDashboard, LogOut, ShieldCheck, Star } from 'lucide-react'

export default function DashboardLayout() {
  const { isAuthenticated, user, clearAuth } = useAuthStore()
  const navigate = useNavigate()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const handleLogout = async () => {
    try {
      if (user?.refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken: user.refreshToken })
      }
    } catch (error) {
      console.error('Logout failed', error)
    } finally {
      clearAuth()
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row pb-16 md:pb-0">
      {/* Sidebar - desktop / Bottom bar - mobile */}
      <aside className="fixed bottom-0 left-0 right-0 md:sticky md:top-0 md:h-screen md:w-64 bg-white border-t md:border-r border-gray-200 z-40 flex md:flex-col justify-around md:justify-start pt-2 px-2 md:p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:shadow-none">
        <div className="hidden md:flex items-center mb-8 px-2 pl-4">
          <Link to="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600">
            LinkForge
          </Link>
        </div>

        <nav className="flex md:flex-col gap-1 md:gap-2 flex-1 w-full justify-around md:justify-start pb-safe">
          <Link
            to="/dashboard"
            className="flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:px-4 md:py-3 rounded-xl hover:bg-gray-100 text-gray-700 font-medium transition-colors"
          >
            <LayoutDashboard className="w-6 h-6 md:w-5 md:h-5 text-gray-500" />
            <span className="text-[10px] md:text-sm">Dashboard</span>
          </Link>

          <Link
            to="/vip-upgrade"
            className="flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:px-4 md:py-3 rounded-xl hover:bg-amber-50 text-amber-700 font-medium transition-colors"
          >
            <Star className="w-6 h-6 md:w-5 md:h-5 text-amber-500" />
            <span className="text-[10px] md:text-sm">Upgrade VIP</span>
          </Link>

          {user?.role === 'ADMIN' && (
            <Link
              to="/admin"
              className="flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:px-4 md:py-3 rounded-xl hover:bg-purple-50 text-purple-700 font-medium transition-colors"
            >
              <ShieldCheck className="w-6 h-6 md:w-5 md:h-5 text-purple-500" />
              <span className="text-[10px] md:text-sm">Admin Panel</span>
            </Link>
          )}

          <div className="hidden md:block flex-1" />

          <button
            onClick={handleLogout}
            className="hidden md:flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-600 font-medium transition-colors w-full text-left mt-auto"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 md:ml-0 md:pb-8">
        <Toaster position="bottom-right" />
        <div className="max-w-6xl mx-auto space-y-6">
          <header className="flex items-center justify-between pb-4 border-b border-gray-100 rounded-b-2xl md:rounded-b-none bg-white md:bg-transparent -mx-4 px-4 md:mx-0 md:px-0 pt-4 md:pt-0 sticky top-0 z-30 md:static">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome back, {user?.name}</p>
            </div>

            <div className="flex items-center gap-3">
              {user?.vip && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-sm shadow-amber-200">
                  <Star className="w-3.5 h-3.5 fill-current" /> VIP Active
                </span>
              )}

              <button
                onClick={handleLogout}
                className="md:hidden p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </header>

          <div className="pt-2">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
