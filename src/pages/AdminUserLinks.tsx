import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { apiClient } from '../api/axios'
import type { ApiResponse, UserLinkResponse, PageResponse } from '../types'
import { LinkIcon, Copy, Check, Loader2, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, MousePointerClick, Clock, Search, ArrowLeft } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'

type SortField = 'createdAt' | 'expiresAt' | 'originalUrl' | 'clickCount'
type SortDirection = 'asc' | 'desc'

export default function AdminUserLinks() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()

  const [links, setLinks] = useState<UserLinkResponse[]>([])
  const [isLoadingLinks, setIsLoadingLinks] = useState(true)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [sortBy, setSortBy] = useState<SortField>('createdAt')
  const [direction, setDirection] = useState<SortDirection>('desc')
  const [deletingCode, setDeletingCode] = useState<string | null>(null)
  const [keyword, setKeyword] = useState('')
  const [debouncedKeyword, setDebouncedKeyword] = useState('')
  const [jumpPage, setJumpPage] = useState('')
  const [copiedLinkUrl, setCopiedLinkUrl] = useState<string | null>(null)

  // Debounce search keyword
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword)
      setPage(0) // Reset to first page on new search
    }, 500)
    return () => clearTimeout(timer)
  }, [keyword])

  const fetchLinks = useCallback(async (isBackgroundUpdate = false) => {
    if (!userId) return

    if (!isBackgroundUpdate) {
      setIsLoadingLinks(true)
    }
    try {
      const { data } = await apiClient.get<ApiResponse<PageResponse<UserLinkResponse>>>(`/admin/users/${userId}/links`, {
        params: {
          page,
          size,
          sortBy,
          direction,
          ...(debouncedKeyword ? { keyword: debouncedKeyword } : {})
        }
      })
      if (data.success) {
        setLinks(data.data.content)
        setTotalPages(data.data.totalPages)
      }
    } catch {
      // silently fail — will show empty state
    } finally {
      if (!isBackgroundUpdate) {
        setIsLoadingLinks(false)
      }
    }
  }, [userId, page, size, sortBy, direction, debouncedKeyword])

  useEffect(() => {
    fetchLinks()
  }, [fetchLinks])

  const handleDeleteLink = async (shortCode: string) => {
    if (!window.confirm(`Are you sure you want to delete the link "${shortCode}"?`)) return

    setDeletingCode(shortCode)
    try {
      await apiClient.delete(`/admin/users/${userId}/links/${shortCode}`)
      toast.success('Link deleted successfully!')
      fetchLinks()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete link.')
    } finally {
      setDeletingCode(null)
    }
  }

  const copyLinkToClipboard = (shortCode: string) => {
    navigator.clipboard.writeText(window.location.origin + '/r/' + shortCode)
    setCopiedLinkUrl(shortCode)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopiedLinkUrl(null), 2000)
  }

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setDirection(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setDirection('desc')
    }
    setPage(0)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    })
  }

  const SortButton = ({ field, label }: { field: SortField, label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all ${sortBy === field
        ? 'bg-primary-100 text-primary-700 shadow-sm'
        : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
        }`}
    >
      {label}
      {sortBy === field && (
        <span className="text-[10px]">{direction === 'asc' ? '↑' : '↓'}</span>
      )}
    </button>
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <button
        onClick={() => navigate('/admin')}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Admin Dashboard
      </button>

      <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-primary-500" />
              Manage User Links
            </h3>
            <p className="text-sm text-gray-500 mt-1">Viewing links for User ID: {userId}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto flex-1 justify-end">
            <div className="relative w-full sm:max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search links..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <ArrowUpDown className="w-4 h-4 text-gray-400" />
              <SortButton field="createdAt" label="Created" />
              <SortButton field="expiresAt" label="Expires" />
              <SortButton field="originalUrl" label="URL" />
              <SortButton field="clickCount" label="Clicks" />
            </div>
          </div>
        </div>

        {isLoadingLinks ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
          </div>
        ) : links.length === 0 ? (
          <div className="py-16 text-center">
            <LinkIcon className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-500 mb-1">No links found</h4>
            <p className="text-sm text-gray-400">This user hasn't created any links matching your criteria.</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {links.map((link) => (
                <div
                  key={link.shortCode}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 text-sm bg-gray-100 px-2 py-1 rounded-md">
                        {link.shortCode}
                      </span>
                      <button
                        onClick={() => copyLinkToClipboard(link.shortCode)}
                        className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                        title="Copy short link"
                      >
                        {copiedLinkUrl === link.shortCode ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      {link.expired && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-600">Expired</span>
                      )}
                    </div>
                    <a
                      href={link.originalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-gray-500 truncate block hover:text-primary-600 transition max-w-xs sm:max-w-md lg:max-w-lg"
                    >
                      {link.originalUrl}
                    </a>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-400 shrink-0">
                    <div className="flex items-center gap-1" title="Clicks">
                      <MousePointerClick className="w-3.5 h-3.5" />
                      <span className="font-medium text-gray-600">{link.clickCount}</span>
                    </div>
                    <div className="flex items-center gap-1" title="Created">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatDate(link.createdAt)}</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-1 border-l border-gray-200 pl-4 ml-2" title="Expires">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>{link.expiresAt ? formatDate(link.expiresAt) : 'Never'}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteLink(link.shortCode)}
                      disabled={deletingCode === link.shortCode}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                      title="Delete link"
                    >
                      {deletingCode === link.shortCode
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Trash2 className="w-4 h-4" />
                      }
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap justify-center">
                  <span>Page {page + 1} of {totalPages}</span>
                  <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
                    <span>Show:</span>
                    <select
                      value={size}
                      onChange={(e) => {
                        setSize(Number(e.target.value))
                        setPage(0)
                      }}
                      className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg focus:ring-primary-500 focus:border-primary-500 block py-1.5 px-2 outline-none cursor-pointer"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center">
                  <div className="flex items-center mx-1 sm:mx-2 text-sm text-gray-500">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const p = parseInt(jumpPage, 10);
                        if (!isNaN(p)) {
                          setPage(Math.max(0, Math.min(totalPages - 1, p - 1)));
                        }
                        setJumpPage("");
                      }}
                      className="flex items-center"
                    >
                      <input
                        type="number"
                        min="1"
                        max={totalPages}
                        value={jumpPage}
                        onChange={(e) => setJumpPage(e.target.value)}
                        placeholder="..."
                        className="w-12 px-1 py-1 text-center text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 hide-arrows"
                      />
                    </form>
                    <span className="ml-1.5">/ {totalPages}</span>
                  </div>
                  <button
                    onClick={() => setPage(0)}
                    disabled={page === 0}
                    className="p-1.5 sm:p-2 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-gray-600"
                    title="First Page"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="p-1.5 sm:p-2 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-gray-600"
                    title="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="p-1.5 sm:p-2 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-gray-600"
                    title="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage(totalPages - 1)}
                    disabled={page >= totalPages - 1}
                    className="p-1.5 sm:p-2 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-gray-600"
                    title="Last Page"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}
