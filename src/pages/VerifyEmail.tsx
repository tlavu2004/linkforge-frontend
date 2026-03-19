import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { apiClient } from '../api/axios'
import type { ApiResponse } from '../types'
import { Mail, ShieldCheck, Loader2, AlertCircle, RefreshCw } from 'lucide-react'

export default function VerifyEmail() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') || ''
  const [otp, setOtp] = useState('')
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

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp || !email) return

    setIsLoading(true)
    setError('')

    try {
      const { data } = await apiClient.post<ApiResponse<null>>('/auth/verify-email', { email, otp })
      if (data.success) {
        setSuccess(true)
        toast.success(t('verify_email.success_title') + ' ' + t('verify_email.success_subtitle'))
        setTimeout(() => navigate('/login'), 2000)
      } else {
        setError(data.message || t('verify_email.error_default'))
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('verify_email.error_default'))
      toast.error(t('verify_email.error_default'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (cooldown > 0 || !email) return

    setIsResending(true)
    try {
      await apiClient.post<ApiResponse<null>>('/auth/resend-otp', { email })
      toast.success(t('verify_email.resend_success'))
      setCooldown(60)
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('common.error'))
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
        <h1 className="text-2xl font-bold text-gray-900">{t('verify_email.success_title')}</h1>
        <p className="text-gray-500">{t('verify_email.success_subtitle')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 mx-auto bg-primary-100 rounded-full flex items-center justify-center mb-4">
          <Mail className="w-7 h-7 text-primary-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{t('verify_email.title')}</h1>
        <p className="text-gray-500 text-sm">
          {t('verify_email.subtitle', { email })}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center text-sm font-medium">
          <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 block">{t('verify_email.code_label')}</label>
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

        <button
          type="submit"
          disabled={isLoading || otp.length !== 6}
          className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
              {t('verify_email.verifying')}
            </>
          ) : (
            t('verify_email.submit')
          )}
        </button>
      </form>

      <div className="text-center">
        <button
          onClick={handleResend}
          disabled={cooldown > 0 || isResending}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-500 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
          {cooldown > 0 ? t('verify_email.resend_cooldown', { count: cooldown }) : t('verify_email.resend_btn')}
        </button>
      </div>
    </div>
  )
}
