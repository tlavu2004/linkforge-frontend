import { Outlet, Link, useNavigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../store/useAuthStore'
import { apiClient } from '../api/axios'
import LanguageSwitcher from '../components/LanguageSwitcher'

export default function RootLayout() {
  const { t } = useTranslation()
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
    <div className="h-screen flex flex-col bg-gray-50 text-gray-900 overflow-hidden">
      <header className="shrink-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600">
            LinkForge
          </Link>
          <nav className="flex space-x-4 items-center">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="px-5 py-2 rounded-full bg-primary-600 hover:bg-primary-700 text-white font-medium transition shadow-sm hover:shadow-md">
                  {t('nav.dashboard')}
                </Link>
                <button onClick={handleLogout} className="px-5 py-2 rounded-full border border-gray-200 hover:bg-red-50 hover:border-red-100 text-red-600 font-medium transition shadow-sm hover:shadow-md">
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-primary-600 font-medium transition">{t('nav.login')}</Link>
                <Link to="/register" className="px-5 py-2 rounded-full bg-gray-900 hover:bg-gray-800 text-white font-medium transition shadow-sm hover:shadow-md">
                  {t('nav.register')}
                </Link>
              </>
            )}
            <div className="border-l border-gray-200 h-6 mx-2" />
            <LanguageSwitcher />
          </nav>
        </div>
      </header>
      <main className="flex-grow overflow-y-auto">
        <Toaster position="bottom-right" />
        <Outlet />
      </main>
      <footer className="shrink-0 border-t border-gray-100 bg-white py-4 md:py-6">
        <div className="container mx-auto px-4 text-center text-gray-500 text-xs md:text-sm">
          &copy; {new Date().getFullYear()} LinkForge. {t('common.all_rights_reserved', { defaultValue: 'All rights reserved.' })}
        </div>
      </footer>
    </div>
  )
}
