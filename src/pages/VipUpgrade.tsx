import { useState, useEffect } from 'react'
import { apiClient } from '../api/axios'
import type { ApiResponse } from '../types'
import { useAuthStore } from '../store/useAuthStore'
import { Crown, CheckCircle2, Shield, Zap, Info, Loader2, AlertCircle, Star, Sparkles, Clock } from 'lucide-react'
import { Navigate } from 'react-router-dom'

const PACKAGES = [
  {
    code: 'VIP_1_MONTH',
    name: '1 Month',
    price: 50000,
    perMonth: 50000,
    duration: '30 days',
    badge: null,
    popular: false,
  },
  {
    code: 'VIP_3_MONTHS',
    name: '3 Months',
    price: 135000,
    perMonth: 45000,
    duration: '90 days',
    badge: 'Save 10%',
    popular: true,
  },
  {
    code: 'VIP_1_YEAR',
    name: '1 Year',
    price: 450000,
    perMonth: 37500,
    duration: '365 days',
    badge: 'Save 25%',
    popular: false,
  },
] as const

const FEATURES = [
  'Bypass all ad interstitials automatically',
  'Unlimited short links creation',
  'Priority email support 24/7',
  'Advanced link analytics (Coming soon)',
]

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

function getRemainingDays(expiresAt: string): number {
  const diffMs = new Date(expiresAt).getTime() - Date.now()
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
}

export default function VipUpgrade() {
  const { user, setAuth } = useAuthStore()
  const [selectedPackage, setSelectedPackage] = useState('VIP_3_MONTHS')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Refresh user data from backend on mount to get latest vipExpiresAt
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
      }
    }
    fetchProfile()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Admin has permanent VIP — redirect to dashboard
  if (user.role === 'ADMIN') {
    return <Navigate to="/dashboard" replace />
  }

  const handleUpgrade = async () => {
    setIsLoading(true)
    setError('')

    try {
      const { data } = await apiClient.post<ApiResponse<string>>('/payments/vip-upgrade', {
        packageCode: selectedPackage
      })

      if (data.success && data.data) {
        window.location.href = data.data
      } else {
        setError(data.message || 'Failed to initialize payment.')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred while creating payment link.')
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN')
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight">Upgrade Your Experience</h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">Get exclusive features, bypass ads on all your short links, and supercharge your LinkForge account.</p>
      </div>

      {/* VIP Status Banner */}
      {user.vip && (
        <div className="bg-gradient-to-r from-amber-50 to-primary-50 rounded-2xl p-5 border border-amber-200 flex flex-col sm:flex-row items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
            <Crown className="w-6 h-6" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-bold text-gray-900">VIP Active</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1 justify-center sm:justify-start">
              <Clock className="w-4 h-4 text-amber-500" />
              {user.vipExpiresAt ? (
                <span>
                  Expires: <strong>{formatDateTime(user.vipExpiresAt)}</strong>
                  <span className="ml-2 text-primary-600 font-semibold">({getRemainingDays(user.vipExpiresAt)} days remaining)</span>
                </span>
              ) : (
                <span className="text-green-600 font-semibold">Permanent — No expiration</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Package Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PACKAGES.map((pkg) => {
          const isSelected = selectedPackage === pkg.code
          return (
            <button
              key={pkg.code}
              onClick={() => setSelectedPackage(pkg.code)}
              className={`relative text-left rounded-2xl p-6 border-2 transition-all duration-300 cursor-pointer
                ${isSelected
                  ? 'border-primary-500 bg-primary-50/60 shadow-lg shadow-primary-100 scale-[1.03]'
                  : 'border-gray-200 bg-white hover:border-primary-200 hover:shadow-md'
                }
              `}
            >
              {/* Badge */}
              {pkg.badge && (
                <span className="absolute -top-3 right-4 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold uppercase tracking-wide shadow-sm">
                  <Sparkles className="w-3 h-3" />
                  {pkg.badge}
                </span>
              )}
              {pkg.popular && (
                <span className="absolute -top-3 left-4 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-primary-500 to-indigo-600 text-white text-xs font-bold uppercase tracking-wide shadow-sm">
                  <Star className="w-3 h-3" />
                  Popular
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{pkg.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{pkg.duration}</p>
                </div>

                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-gray-900">{formatPrice(pkg.price)}</span>
                    <span className="text-sm text-gray-400 font-medium">VND</span>
                  </div>
                  {pkg.code !== 'VIP_1_MONTH' && (
                    <p className="text-xs text-primary-600 font-semibold mt-1">
                      ~{formatPrice(pkg.perMonth)} VND / month
                    </p>
                  )}
                </div>

                {/* Radio indicator */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                    ${isSelected ? 'border-primary-500 bg-primary-500' : 'border-gray-300'}
                  `}>
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span className={`text-sm font-medium ${isSelected ? 'text-primary-700' : 'text-gray-400'}`}>
                    {isSelected ? 'Selected' : 'Select this plan'}
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Features & Checkout */}
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-primary-100 flex flex-col md:flex-row gap-8 md:gap-16 items-center relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-60 pointer-events-none" />

        <div className="flex-1 relative space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-bold uppercase tracking-wide mb-4">
              <Crown className="w-4 h-4" /> VIP Benefits
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-2">LinkForge <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-primary-600">VIP</span></h2>
          </div>

          <ul className="space-y-4">
            {FEATURES.map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-lg text-gray-700">
                <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="w-full md:w-80 bg-gray-50 rounded-2xl p-6 border border-gray-100 relative shadow-sm text-center">
          {user.vip && !user.vipExpiresAt ? (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Permanent VIP!</h3>
              <p className="text-gray-500 text-sm">You have lifetime access to all premium features. No renewal needed.</p>
              <button disabled className="w-full bg-gray-200 text-gray-500 font-bold py-4 rounded-xl cursor-not-allowed">Active Plan</button>
            </div>
          ) : (
            <div className="space-y-6">
              <Zap className="w-12 h-12 text-primary-500 mx-auto" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {user.vip ? 'Extend your VIP' : 'Ready to upgrade?'}
                </h3>
                <p className="text-gray-500 text-sm mb-3">Secure payment powered by VNPay.</p>
                <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">You pay</p>
                  <p className="text-2xl font-black text-gray-900">
                    {formatPrice(PACKAGES.find(p => p.code === selectedPackage)!.price)} <span className="text-sm font-medium text-gray-400">VND</span>
                  </p>
                  <p className="text-xs text-primary-600 font-semibold">
                    {PACKAGES.find(p => p.code === selectedPackage)!.name}
                  </p>
                </div>
              </div>

              <button
                onClick={handleUpgrade}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 disabled:from-primary-400 disabled:to-indigo-400 text-white font-bold py-4 rounded-xl shadow-md transition-all flex justify-center items-center cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  user.vip ? 'Extend with VNPay' : 'Upgrade with VNPay'
                )}
              </button>

              {error && (
                <div className="text-red-500 text-sm font-medium flex items-center gap-1 justify-center mt-4">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-start justify-center gap-2 text-sm text-gray-500 bg-white p-4 rounded-xl border border-gray-100 max-w-2xl mx-auto shadow-sm">
        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <p>Your subscription helps keep LinkForge running and allows us to develop new features. Payments are securely processed through the VNPay gateway. Subscriptions can be canceled at any time.</p>
      </div>
    </div>
  )
}
