import { Outlet, Navigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { Toaster } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../components/LanguageSwitcher'

export default function AuthLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const { t } = useTranslation()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600 inline-block">
            LinkForge
          </Link>
          <p className="text-gray-500 mt-2">{t('login.manage_links')}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <Outlet />
        </div>
        <div className="mt-8 flex justify-center">
          <LanguageSwitcher />
        </div>
      </div>
      <Toaster position="bottom-right" />
    </div>
  )
}
