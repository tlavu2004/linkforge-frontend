import { useState } from 'react'
import { apiClient } from '../api/axios'
import type { ApiResponse } from '../types'
import { useAuthStore } from '../store/useAuthStore'
import { Crown, CheckCircle2, Shield, Zap, Info, Loader2, AlertCircle } from 'lucide-react'
import { Navigate } from 'react-router-dom'

export default function VipUpgrade() {
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const handleUpgrade = async () => {
    setIsLoading(true)
    setError('')

    try {
      const { data } = await apiClient.post<ApiResponse<string>>('/payments/vip-upgrade', {
        packageCode: 'VIP_MONTHLY' // default package for now
      })

      if (data.success && data.data) {
        // data.data should contain the VNPay payment URL
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

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight">Upgrade Your Experience</h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">Get exclusive features, bypass ads on all your short links, and supercharge your LinkForge account.</p>
      </div>

      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-primary-100 flex flex-col md:flex-row gap-8 md:gap-16 items-center relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-60 pointer-events-none" />

        <div className="flex-1 relative space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-bold uppercase tracking-wide mb-4">
              <Crown className="w-4 h-4" /> Pro Plan
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-2">LinkForge <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-primary-600">VIP</span></h2>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-gray-900">50,000</span>
              <span className="text-lg text-gray-500 font-medium">VND / month</span>
            </div>
          </div>

          <ul className="space-y-4">
            {[
              "Bypass all ad interstitials automatically",
              "Unlimited short links creation",
              "Priority email support 24/7",
              "Advanced link analytics (Coming soon)",
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-lg text-gray-700">
                <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="w-full md:w-80 bg-gray-50 rounded-2xl p-6 border border-gray-100 relative shadow-sm text-center">
          {user.vip ? (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">You are a VIP!</h3>
              <p className="text-gray-500 text-sm">Thank you for supporting LinkForge. You have access to all premium features.</p>
              <button disabled className="w-full bg-gray-200 text-gray-500 font-bold py-4 rounded-xl cursor-not-allowed">Active Plan</button>
            </div>
          ) : (
            <div className="space-y-6">
              <Zap className="w-12 h-12 text-primary-500 mx-auto" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to upgrade?</h3>
                <p className="text-gray-500 text-sm">Secure payment powered by VNPay.</p>
              </div>

              <button
                onClick={handleUpgrade}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 disabled:from-primary-400 disabled:to-indigo-400 text-white font-bold py-4 rounded-xl shadow-md transition-all flex justify-center items-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  'Upgrade with VNPay'
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
