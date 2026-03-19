import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { apiClient } from '../api/axios'
import type { ApiResponse, AuthResponse } from '../types'
import { useAuthStore } from '../store/useAuthStore'
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react'

export default function Login() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', {
        email,
        password,
      })

      if (data.success && data.data) {
        setAuth(data.data)
        toast.success(t('login.success_msg', { name: data.data.email }))
        navigate('/dashboard')
      } else {
        setError(data.message || t('login.error_invalid'))
        toast.error(data.message || t('login.error_invalid'))
      }
    } catch (err: any) {
      const message = err.response?.data?.message || t('login.error_invalid')
      if (message.toLowerCase().includes('not verified') || message.toLowerCase().includes('xác thực')) {
        toast.error(t('login.error_verify'))
        navigate(`/verify-email?email=${encodeURIComponent(email)}`)
        return
      }
      setError(message)
      toast.error(t('login.error_invalid'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">{t('login.title')}</h1>
        <p className="text-gray-500 text-sm">{t('login.subtitle')}</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center text-sm font-medium">
          <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 block">{t('login.email')}</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-shadow"
              placeholder="you@example.com"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 block">{t('login.password')}</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-shadow"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors">
            {t('login.forgot_password')}
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading || !email || !password}
          className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
              {t('login.signing_in')}
            </>
          ) : (
            t('login.submit')
          )}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600">
        {t('login.no_account')}{' '}
        <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-500 transition-colors">
          {t('login.signup')}
        </Link>
      </p>
    </div>
  )
}
