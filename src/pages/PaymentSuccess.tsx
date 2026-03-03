import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, Crown, ArrowRight, Sparkles, Clock } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { apiClient } from '../api/axios'
import type { ApiResponse } from '../types'

export default function PaymentSuccess() {
  const { user, setAuth } = useAuthStore()
  const wasAlreadyVip = useRef(user?.vip ?? false)
  const [refreshed, setRefreshed] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await apiClient.get<ApiResponse<{ vip: boolean; vipExpiresAt: string | null }>>('/auth/me')
        if (data.success && data.data && user) {
          setAuth({
            ...user,
            vip: data.data.vip,
            vipExpiresAt: data.data.vipExpiresAt ?? undefined,
          })
        }
      } catch {
        // Silently fail
      } finally {
        setRefreshed(true)
      }
    }
    fetchProfile()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const isExtension = wasAlreadyVip.current

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-primary-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Success Icon */}
        <div className="relative inline-flex">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-14 h-14 text-green-500" />
          </div>
          <div className="absolute -top-1 -right-1 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
            <Crown className="w-5 h-5 text-amber-500" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
            {isExtension ? 'VIP Extended!' : 'Payment Successful!'}
          </h1>
          <p className="text-lg text-gray-500 max-w-md mx-auto">
            {isExtension ? (
              <>Your <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-primary-600">LinkForge VIP</span> has been extended successfully!</>
            ) : (
              <>Welcome to <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-primary-600">LinkForge VIP</span>! Your account has been upgraded successfully.</>
            )}
          </p>
        </div>

        {/* Expiration info */}
        {refreshed && user?.vipExpiresAt && (
          <div className="inline-flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-5 py-3 text-sm text-gray-600 shadow-sm">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>VIP active until: <strong className="text-gray-900">{formatDateTime(user.vipExpiresAt)}</strong></span>
          </div>
        )}

        {/* VIP Benefits */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-left space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-700 uppercase tracking-wide">
            <Sparkles className="w-4 h-4" /> {isExtension ? 'Your benefits continue' : 'Now unlocked'}
          </div>
          <ul className="space-y-2 text-gray-700">
            {[
              'Ad-free short links for all visitors',
              'Unlimited link creation',
              'Priority email support 24/7',
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/vip-upgrade"
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-8 rounded-xl border border-gray-200 transition-all"
          >
            View VIP Status
          </Link>
        </div>
      </div>
    </div>
  )
}
