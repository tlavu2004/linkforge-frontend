import { Outlet, Link, useNavigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from '../store/useAuthStore'
import { apiClient } from '../api/axios'

export default function RootLayout() {
  const { isAuthenticated, user, clearAuth } = useAuthStore()
  const navigate = useNavigate()

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
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600">
            LinkForge
          </Link>
          <nav className="flex space-x-6 items-center">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="px-5 py-2 rounded-full bg-primary-600 hover:bg-primary-700 text-white font-medium transition shadow-sm hover:shadow-md">
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="px-5 py-2 rounded-full border border-gray-200 hover:bg-red-50 hover:border-red-100 text-red-600 font-medium transition shadow-sm hover:shadow-md">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/delete" className="text-gray-600 hover:text-primary-600 font-medium transition">Delete Link</Link>
                <Link to="/login" className="text-gray-600 hover:text-primary-600 font-medium transition">Login</Link>
                <Link to="/register" className="px-5 py-2 rounded-full bg-gray-900 hover:bg-gray-800 text-white font-medium transition shadow-sm hover:shadow-md">
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-grow pt-16">
        <Toaster position="bottom-right" />
        <Outlet />
      </main>
      <footer className="border-t border-gray-100 bg-white py-8">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} LinkForge. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
