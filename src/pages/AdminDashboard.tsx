import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '../api/axios'
import type { ApiResponse, PageResponse, AdminUserResponse } from '../types'
import { useAuthStore } from '../store/useAuthStore'
import { Search, ChevronLeft, ChevronRight, Loader2, AlertCircle, LayoutDashboard } from 'lucide-react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function AdminDashboard() {
  const { t, i18n } = useTranslation()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [users, setUsers] = useState<AdminUserResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [togglingVipFor, setTogglingVipFor] = useState<string | null>(null)

  const fetchUsers = useCallback(async (keyword = search, pageNumber = page) => {
    setIsLoading(true)
    setError('')
    try {
      const { data } = await apiClient.get<ApiResponse<PageResponse<AdminUserResponse>>>('/admin/users', {
        params: {
          keyword: keyword || undefined,
          page: pageNumber,
          size: 10,
          sortBy: 'id',
          direction: 'desc'
        }
      })
      if (data.success) {
        setUsers(data.data.content)
        setTotalPages(data.data.totalPages)
      } else {
        setError(data.message || t('admin.errors.fetch_failed'))
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('admin.errors.fetch_error'))
    } finally {
      setIsLoading(false)
    }
  }, [search, page, t])

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchUsers(search, page)
    }
  }, [page, user, fetchUsers]) // fetchUsers will be updated correctly due to useCallback

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      const handler = setTimeout(() => {
        setPage(0)
        fetchUsers(search, 0)
      }, 500)
      return () => clearTimeout(handler)
    }
  }, [search, user, fetchUsers])

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />
  }

  const handleToggleVip = async (e: React.MouseEvent, targetUser: AdminUserResponse) => {
    e.stopPropagation() // Prevent row click
    if (togglingVipFor === targetUser.id) return

    setTogglingVipFor(targetUser.id)
    const newVipStatus = !targetUser.vip

    try {
      const { data } = await apiClient.post<ApiResponse<void>>(`/admin/users/${targetUser.id}/vip/toggle`, {
        vip: newVipStatus
      })

      if (data.success) {
        setUsers(users.map(u => u.id === targetUser.id
          ? { ...u, vip: newVipStatus, vipExpiresAt: newVipStatus ? u.vipExpiresAt : undefined }
          : u
        ))
      } else {
        setError(data.message || t('admin.errors.toggle_vip_failed'))
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('admin.errors.toggle_vip_error'))
    } finally {
      setTogglingVipFor(null)
    }
  }

  const navigateToUserLinks = (userId: string) => {
    navigate(`/admin/users/${userId}/links`)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'vi-VN')
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Light Theme Container Matching Dashboard */}
      <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col min-h-[600px] relative overflow-hidden">

        {/* Subtle background flair similar to Dashboard */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 relative">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6 text-primary-500" />
              {t('admin.title')}
            </h1>
            <p className="text-sm text-gray-500 mt-1">{t('admin.subtitle')}</p>
          </div>

          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('admin.search_placeholder')}
              className="w-full bg-gray-50 text-gray-900 placeholder:text-gray-400 rounded-xl pl-10 pr-4 py-3 border border-gray-200 outline-none focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-medium text-sm"
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center justify-between text-sm font-medium animate-in fade-in relative">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
              <p>{error}</p>
            </div>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">&times;</button>
          </div>
        )}

        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex-1 relative z-10">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500 text-xs font-semibold tracking-wider uppercase border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">{t('admin.table.id')}</th>
                  <th className="px-6 py-4">{t('admin.table.username')}</th>
                  <th className="px-6 py-4">{t('admin.table.email')}</th>
                  <th className="px-6 py-4">{t('admin.table.role')}</th>
                  <th className="px-6 py-4">{t('admin.table.vip_access')}</th>
                  <th className="px-6 py-4">{t('admin.table.expiration')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {isLoading && users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary-500" />
                        <span className="font-medium">{t('admin.loading_users')}</span>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 font-medium tracking-wide">
                      {t('admin.no_users')}
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr
                      key={u.id}
                      onClick={() => navigateToUserLinks(u.id)}
                      className="hover:bg-primary-50/50 hover:cursor-pointer transition-colors duration-200 group"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">{u.id}</td>
                      <td className="px-6 py-4">{u.username}</td>
                      <td className="px-6 py-4 text-gray-500 group-hover:text-primary-600 transition-colors">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold leading-none ${u.role === 'ADMIN'
                          ? 'bg-red-50 text-red-600 border border-red-100'
                          : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                          }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {u.role === 'ADMIN' ? (
                          <span className="text-gray-400 text-xs font-medium px-2">—</span>
                        ) : (
                          <button
                            onClick={(e) => handleToggleVip(e, u)}
                            disabled={togglingVipFor === u.id}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${u.vip ? 'bg-primary-500' : 'bg-gray-200 hover:bg-gray-300'
                              } ${togglingVipFor === u.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${u.vip ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                            {togglingVipFor === u.id && (
                              <Loader2 className="absolute inset-0 m-auto h-3 w-3 text-white animate-spin opacity-50" />
                            )}
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {formatDate(u.vipExpiresAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 px-2">
            <span className="text-sm text-gray-500 font-medium">
              {t('admin.pagination.showing', { current: page + 1, total: totalPages })}
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-2 rounded-lg bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-gray-200"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="hidden sm:flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                  let pageNum = page;
                  if (page < 2) pageNum = idx;
                  else if (page > totalPages - 3) pageNum = totalPages - 5 + idx;
                  else pageNum = page - 2 + idx;

                  if (pageNum < 0 || pageNum >= totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all border ${page === pageNum
                        ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-2 rounded-lg bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-gray-200"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
