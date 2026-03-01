import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { apiClient } from '../api/axios'
import type { ApiResponse } from '../types'
import { AlertCircle, Clock, ExternalLink } from 'lucide-react'

export default function AdInterstitial() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const shortCode = searchParams.get('code') || searchParams.get('shortCode')
  const navigate = useNavigate()

  const [timeLeft, setTimeLeft] = useState(5)
  const [canSkip, setCanSkip] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token || !shortCode) {
      setError('Invalid ad token parameters.')
      return
    }

    if (timeLeft > 0) {
      const timerId = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
      return () => clearTimeout(timerId)
    } else {
      setCanSkip(true)
    }
  }, [timeLeft, token, shortCode])

  const handleSkipAd = async () => {
    if (!canSkip || !token || !shortCode) return

    setIsVerifying(true)
    setError('')

    try {
      const { data } = await apiClient.post<ApiResponse<string>>('/ads/verify', {
        token,
        shortCode
      })

      if (data.success && data.data) {
        // Redirection to the destination URL
        window.location.href = data.data
      } else {
        setError(data.message || 'Failed to verify ad token.')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed. Token may be expired.')
    } finally {
      setIsVerifying(false)
    }
  }

  // Fallback missing params
  if (!token || !shortCode) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Request</h1>
          <p className="text-gray-500 mb-6">Missing required verification parameters.</p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-xl transition"
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      {/* Top Header for Ad Page */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 flex justify-between items-center shadow-sm sticky top-0 z-10">
        <div className="font-bold text-xl tracking-tight text-gray-900">
          <span className="text-primary-600">Link</span>Forge
        </div>

        <div className="flex items-center">
          {!canSkip ? (
            <div className="flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-2 rounded-full font-medium text-sm border border-gray-200">
              <Clock className="w-4 h-4" />
              <span>Please wait {timeLeft}s to skip...</span>
            </div>
          ) : (
            <button
              onClick={handleSkipAd}
              disabled={isVerifying}
              className="group flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white px-6 py-2 rounded-full font-bold text-sm shadow-md transition-all active:scale-95"
            >
              {isVerifying ? (
                'Verifying...'
              ) : (
                <>
                  Skip Ad <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area - Fake Ad Display */}
      <main className="flex-1 overflow-hidden p-4 md:p-8 flex items-center justify-center relative">
        {/* Mock background pattern */}
        <div className="absolute inset-0 bg-[#f8fafc]" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

        <div className="relative w-full max-w-4xl bg-white aspect-video rounded-3xl border border-gray-200 shadow-xl overflow-hidden flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-indigo-50 to-primary-50">
          <div className="absolute top-4 left-4 bg-gray-900/10 text-gray-500 text-xs px-2 py-1 rounded uppercase tracking-wider font-bold">Advertisement</div>

          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 drop-shadow-sm text-balance">Space Available For Rent!</h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-8">Reach millions of users who are waiting to go to their destination URLs. Your ad could be here.</p>

          <div className="inline-flex gap-4">
            <button className="bg-gray-900 text-white px-8 py-4 flex items-center gap-2 rounded-xl font-bold shadow-lg hover:bg-gray-800 transition">
              Contact Sales
            </button>
          </div>
        </div>
      </main>

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-full flex items-center shadow-2xl animate-in slide-in-from-bottom-5">
          <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
          <p className="font-medium text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}
