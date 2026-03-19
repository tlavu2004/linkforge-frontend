import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { apiClient } from '../api/axios'
import type { ApiResponse } from '../types'
import { Mail, Lock, KeyRound, Loader2, AlertCircle, ShieldCheck, RefreshCw } from 'lucide-react'

type Step = 'email' | 'reset'

export default function ForgotPassword() {
  const { t } = useTranslation()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(c => c - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    setError('')

    try {
      const { data } = await apiClient.post<ApiResponse<null>>('/auth/forgot-password', { email })
      if (data.success) {
        setStep('reset')
        setCooldown(60)
        toast.success(t('forgot_password.success_send'))
      } else {
        setError(data.message || t('forgot_password.error_send'))
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('forgot_password.error_send'))
      toast.error(t('forgot_password.error_send'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setError(t('register.error_password_match'))
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const { data } = await apiClient.post<ApiResponse<null>>('/auth/reset-password', {
        email,
        otp,
        newPassword
      })
      if (data.success) {
        setSuccess(true)
        toast.success(t('forgot_password.success_reset'))
        setTimeout(() => navigate('/login'), 2000)
      } else {
        setError(data.message || t('forgot_password.error_reset'))
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('forgot_password.error_invalid_otp'))
      toast.error(t('forgot_password.error_reset'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (cooldown > 0) return
    setIsResending(true)
    try {
      await apiClient.post<ApiResponse<null>>('/auth/forgot-password', { email })
      toast.success(t('forgot_password.success_send'))
      setCooldown(60)
    } catch {
      toast.error(t('common.error'))
    } finally {
      setIsResending(false)
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
          <ShieldCheck className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{t('forgot_password.success_title')}</h1>
        <p className="text-gray-500">{t('forgot_password.success_subtitle')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-4">
          <KeyRound className="w-7 h-7 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          {step === 'email' ? t('forgot_password.title') : t('forgot_password.reset_title')}
        </h1>
        <p className="text-gray-500 text-sm">
          {step === 'email'
            ? t('forgot_password.subtitle')
            : t('forgot_password.reset_subtitle', { email })
          }
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center text-sm font-medium">
          <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {step === 'email' ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 block">{t('forgot_password.email_label')}</label>
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
                autoFocus
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                {t('forgot_password.sending')}
              </>
            ) : (
              t('forgot_password.submit_send')
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleReset} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 block">{t('forgot_password.code_label')}</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="block w-full text-center text-2xl font-bold tracking-[0.5em] py-4 border border-gray-200 rounded-xl bg-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow"
              placeholder="000000"
              maxLength={6}
              required
              autoFocus
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 block">{t('forgot_password.new_password_label')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-shadow"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 block">{t('forgot_password.confirm_password_label')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-shadow"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.length !== 6 || !newPassword || !confirmPassword}
            className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                {t('forgot_password.resetting')}
              </>
            ) : (
              t('forgot_password.submit_reset')
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || isResending}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-500 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
              {cooldown > 0 ? t('verify_email.resend_cooldown', { count: cooldown }) : t('verify_email.resend_btn')}
            </button>
          </div>
        </form>
      )}

      <p className="text-center text-sm text-gray-600">
        {t('forgot_password.remember_password')}{' '}
        <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500 transition-colors">
          {t('forgot_password.login')}
        </Link>
      </p>
    </div>
  )
}
