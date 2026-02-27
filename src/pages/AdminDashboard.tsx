import { useState } from 'react'
import { apiClient } from '../api/axios'
import type { ApiResponse } from '../types'
import { useAuthStore } from '../store/useAuthStore'
import { ShieldAlert, Search, ShieldCheck, ShieldBan, Loader2, AlertCircle } from 'lucide-react'
import { Navigate } from 'react-router-dom'

export default function AdminDashboard() {
  const { user } = useAuthStore()
  const [userId, setUserId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Protect route
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />
  }

  const handleToggleVip = async (e: React.FormEvent, makeVip: boolean) => {
    e.preventDefault()
    if (!userId) return

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      // POST /admin/users/{userId}/vip/toggle
      const { data } = await apiClient.post<ApiResponse<void>>(`/admin/users/${userId}/vip/toggle`, {
        vip: makeVip
      })

      if (data.success) {
        setSuccess(`Successfully ${makeVip ? 'granted' : 'revoked'} VIP status for User ID: ${userId}`)
        setUserId('')
      } else {
        setError(data.message || 'Failed to toggle VIP status.')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred while toggling VIP status.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">

      <div className="bg-red-50 border border-red-100 rounded-2xl p-6 md:p-8 flex items-start gap-4 shadow-sm">
        <ShieldAlert className="w-8 h-8 text-red-500 shrink-0 mt-1" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-700">You are viewing this page because you have the <span className="font-bold text-red-600">ADMIN</span> role. Actions taken here directly affect user accounts.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col items-center">

        <div className="w-full max-w-lg space-y-6">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-xl font-bold text-gray-900">Manage VIP Status</h2>
            <p className="text-sm text-gray-500">Enter a User ID to manually grant or revoke their VIP privileges.</p>
          </div>

          <form className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter User ID..."
                className="w-full bg-gray-50 outline-none text-gray-900 placeholder:text-gray-400 font-medium text-lg pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                required
                min="1"
                disabled={isLoading}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={(e) => handleToggleVip(e, true)}
                disabled={isLoading || !userId}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-bold py-4 px-6 rounded-xl shadow-md transition-all flex justify-center items-center gap-2"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                Grant VIP
              </button>
              <button
                type="button"
                onClick={(e) => handleToggleVip(e, false)}
                disabled={isLoading || !userId}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-bold py-4 px-6 rounded-xl shadow-md transition-all flex justify-center items-center gap-2"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldBan className="w-5 h-5" />}
                Revoke VIP
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center text-sm font-medium animate-in fade-in">
              <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="mt-4 bg-green-50 border border-green-100 text-green-700 p-4 rounded-xl flex items-center text-sm font-medium animate-in fade-in">
              <ShieldCheck className="w-5 h-5 mr-3 shrink-0" />
              <p>{success}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
