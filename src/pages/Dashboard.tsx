import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'react-hot-toast'
import { apiClient } from '../api/axios'
import type { ShortLinkResponse, ApiResponse, UserLinkResponse, PageResponse } from '../types'
import { LinkIcon, Copy, Check, ExternalLink, Loader2, AlertCircle, LayoutDashboard, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, MousePointerClick, Clock, Search, Calendar, X, QrCode, Star } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { Link } from 'react-router-dom'

type SortField = 'createdAt' | 'expiresAt' | 'originalUrl' | 'clickCount'
type SortDirection = 'asc' | 'desc'

export default function Dashboard() {
  const [url, setUrl] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [recentLink, setRecentLink] = useState<ShortLinkResponse | null>(null)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [copiedLinkUrl, setCopiedLinkUrl] = useState<string | null>(null)
  const { user } = useAuthStore()
  const dateInputRef = useRef<HTMLInputElement>(null)

  // Link list state
  const [links, setLinks] = useState<UserLinkResponse[]>([])
  const [isLoadingLinks, setIsLoadingLinks] = useState(true)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [sortBy, setSortBy] = useState<SortField>('createdAt')
  const [direction, setDirection] = useState<SortDirection>('desc')
  const [deletingCode, setDeletingCode] = useState<string | null>(null)
  const [keyword, setKeyword] = useState('')
  const [debouncedKeyword, setDebouncedKeyword] = useState('')
  const [jumpPage, setJumpPage] = useState('')
  const [selectedLinkForQr, setSelectedLinkForQr] = useState<UserLinkResponse | null>(null)
  const [isGeneratingQr, setIsGeneratingQr] = useState(false)
  const [isDeletingQr, setIsDeletingQr] = useState(false)

  // Debounce search keyword
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword)
      setPage(0) // Reset to first page on new search
    }, 500)
    return () => clearTimeout(timer)
  }, [keyword])

  const fetchLinks = useCallback(async (isBackgroundUpdate = false) => {
    if (!isBackgroundUpdate) {
      setIsLoadingLinks(true)
    }
    try {
      const { data } = await apiClient.get<ApiResponse<PageResponse<UserLinkResponse>>>('/me/links', {
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
        setTotalElements(data.data.totalElements)
      }
    } catch {
      // silently fail — will show empty state
    } finally {
      if (!isBackgroundUpdate) {
        setIsLoadingLinks(false)
      }
    }
  }, [page, size, sortBy, direction, debouncedKeyword])

  // Polling mechanism for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLinks(true)
    }, 10000) // 10 seconds
    return () => clearInterval(interval)
  }, [fetchLinks])

  useEffect(() => {
    fetchLinks()
  }, [fetchLinks])

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return

    setIsLoading(true)
    setError('')
    setRecentLink(null)
    setCopiedUrl(false)

    try {
      const payload: any = { originalUrl: url }
      if (expiresAt) {
        payload.expiresAt = new Date(expiresAt).toISOString()
      }

      const { data } = await apiClient.post<ApiResponse<ShortLinkResponse>>('/links', payload)
      if (data.success) {
        setRecentLink(data.data)
        setUrl('')
        toast.success('Link shortened successfully!')
        // Refresh link list
        fetchLinks()
      } else {
        setError(data.message || 'Failed to create short link.')
        toast.error(data.message || 'Failed to create short link.')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred. Please try again later.')
      toast.error(err.response?.data?.message || 'An error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteLink = async (shortCode: string) => {
    setDeletingCode(shortCode)
    try {
      await apiClient.delete(`/me/links/${shortCode}`)
      toast.success('Link deleted!')
      fetchLinks()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete link.')
    } finally {
      setDeletingCode(null)
    }
  }

  const handleGenerateQr = async (shortCode: string) => {
    setIsGeneratingQr(true)
    try {
      const { data } = await apiClient.post<ApiResponse<ShortLinkResponse>>(`/me/links/${shortCode}/qr-code`)
      if (data.success) {
        toast.success('QR Code generated!')
        // Update local state for the modal
        if (selectedLinkForQr && selectedLinkForQr.shortCode === shortCode) {
          setSelectedLinkForQr({ ...selectedLinkForQr, qrCode: data.data.qrCode })
        }
        // Update the link in the lists
        setLinks(prev => prev.map(l => l.shortCode === shortCode ? { ...l, qrCode: data.data.qrCode } : l))
        if (recentLink?.shortCode === shortCode) {
          setRecentLink({ ...recentLink, qrCode: data.data.qrCode } as any)
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to generate QR code.')
    } finally {
      setIsGeneratingQr(false)
    }
  }

  const handleDeleteQr = async (shortCode: string) => {
    if (!confirm('Are you sure you want to delete this QR code?')) return
    setIsDeletingQr(true)
    try {
      const { data } = await apiClient.delete<ApiResponse<ShortLinkResponse>>(`/me/links/${shortCode}/qr-code`)
      if (data.success) {
        toast.success('QR Code deleted!')
        if (selectedLinkForQr && selectedLinkForQr.shortCode === shortCode) {
          setSelectedLinkForQr({ ...selectedLinkForQr, qrCode: undefined })
        }
        // Update the link in the lists
        setLinks(prev => prev.map(l => l.shortCode === shortCode ? { ...l, qrCode: undefined } : l))
        if (recentLink?.shortCode === shortCode) {
          setRecentLink({ ...recentLink, qrCode: undefined } as any)
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete QR code.')
    } finally {
      setIsDeletingQr(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedUrl(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopiedUrl(false), 2000)
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
    <div className="space-y-8">
      {/* Create new link widget */}
      <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-50 pointer-events-none" />

        <div className="relative">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Create New Short Link</h2>

          <form onSubmit={handleShorten} className="bg-white border border-gray-200 rounded-2xl md:rounded-[2rem] shadow-sm flex flex-col md:flex-row items-stretch p-2 focus-within:ring-2 focus-within:ring-primary-500 transition-all">
            <div className="flex-1 w-full relative flex items-center">
              <div className="absolute left-4 md:left-6 text-gray-400 pointer-events-none hidden md:block">
                <LinkIcon className="w-6 h-6" />
              </div>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste your long URL here..."
                className="w-full bg-transparent outline-none text-gray-900 placeholder:text-gray-400 font-medium text-base md:text-lg pl-4 md:pl-14 pr-4 py-3 md:py-4"
                required
                disabled={isLoading}
              />
            </div>

            {(user?.vip || user?.role === 'ADMIN') && (
              <div
                className="w-full md:w-auto flex items-center border-t md:border-t-0 border-gray-100 md:border-l md:border-l-gray-200 group transition-colors hover:bg-gray-50/50 cursor-pointer select-none relative"
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.closest('button')) return;
                  try {
                    dateInputRef.current?.showPicker();
                  } catch (err) {
                    dateInputRef.current?.focus();
                  }
                }}
              >
                <div className="flex items-center pl-4 md:pl-5 pr-3 md:pr-4 py-3 md:py-4 w-full justify-between gap-3 min-w-[210px] md:min-w-[250px]">
                  <span className={`text-sm font-medium whitespace-nowrap ${expiresAt ? 'text-gray-900' : 'text-gray-400'}`}>
                    {expiresAt
                      ? new Date(expiresAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
                      : 'dd/mm/yyyy hh:mm:ss'}
                  </span>

                  <div className="flex items-center gap-1 shrink-0">
                    <div className="p-2 rounded-md hover:bg-gray-100 transition-colors text-gray-400">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <button
                      type="button"
                      disabled={!expiresAt}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpiresAt(''); }}
                      className={`p-2 rounded-md transition-colors ${expiresAt ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' : 'text-gray-200 cursor-not-allowed opacity-50'}`}
                      title={expiresAt ? "Clear expiration date" : ""}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <input
                  ref={dateInputRef}
                  type="datetime-local"
                  step="1"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="absolute bottom-0 right-8 w-px h-px opacity-0 pointer-events-none"
                  style={{ colorScheme: 'light' }}
                  tabIndex={-1}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !url}
              className="w-full md:w-auto bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 disabled:cursor-not-allowed text-white px-8 py-3 md:py-4 rounded-xl md:rounded-full font-semibold transition-all shadow-md hover:shadow-lg flex justify-center items-center h-full"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Shorten'}
            </button>
          </form>

          {error && (
            <div className="mt-4 bg-red-50 text-red-600 p-4 rounded-xl flex items-center text-sm font-medium animate-in fade-in">
              <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {!user?.vip && user?.role !== 'ADMIN' && (
            <div className="mt-6 flex items-center rounded-xl bg-amber-50/80 border border-amber-100 p-4 text-sm text-amber-800">
              <Star className="w-5 h-5 mr-3 text-amber-500 shrink-0" />
              <p>Want to completely bypass advertisement pages for your visitors? <Link to="/vip-upgrade" className="font-semibold underline hover:text-amber-900 text-amber-700">Upgrade to VIP today!</Link></p>
            </div>
          )}
        </div>
      </section>

      {/* Recent Link Result */}
      {recentLink && (
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 animate-in slide-in-from-bottom-4 duration-500">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" /> Just Created
          </h3>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200/60">
            <div className="w-full md:w-auto overflow-hidden flex-1">
              <div className="font-semibold text-lg text-gray-900 flex items-center gap-2 mb-1">
                {window.location.origin}/r/{recentLink.shortCode}
              </div>
              <a href={recentLink.originalUrl} target="_blank" rel="noreferrer" className="text-sm text-gray-500 truncate block hover:text-primary-600 transition max-w-[300px] md:max-w-md">
                {recentLink.originalUrl}
              </a>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-200">
              <button
                onClick={() => copyToClipboard(window.location.origin + '/r/' + recentLink.shortCode)}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:border-primary-300 hover:bg-primary-50 text-gray-700 hover:text-primary-700 rounded-lg transition-colors text-sm font-medium"
              >
                {copiedUrl ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                Copy
              </button>
              <a
                href={`/r/${recentLink.shortCode}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors text-sm font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                Visit
              </a>
              <button
                onClick={() => setSelectedLinkForQr(recentLink as any)}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:border-primary-300 hover:bg-primary-50 text-gray-700 hover:text-primary-700 rounded-lg transition-colors text-sm font-medium"
              >
                <QrCode className="w-4 h-4" />
                QR Code
              </button>
            </div>
          </div>
        </section>
      )}

      {/* My Links Section */}
      <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-primary-500" />
              My Links
            </h3>
            <p className="text-sm text-gray-500 mt-1">{totalElements} link{totalElements !== 1 ? 's' : ''} total</p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto flex-1 justify-end">
            {/* Search Bar */}
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

            {/* Sort Controls */}
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
            <h4 className="text-lg font-medium text-gray-500 mb-1">No links yet</h4>
            <p className="text-sm text-gray-400">Create your first short link above!</p>
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
                    <div className="flex items-center gap-1 border-l border-gray-200 pl-4 ml-2">
                      <button
                        onClick={() => setSelectedLinkForQr(link)}
                        className={`p-2 rounded-lg transition-colors ${link.qrCode ? 'text-primary-600 bg-primary-50 hover:bg-primary-100' : 'text-gray-400 hover:text-primary-600 hover:bg-primary-50'}`}
                        title={link.qrCode ? "View QR Code" : "Generate QR Code"}
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
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
                </div>
              ))}
            </div>

            {/* Pagination */}
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

      {/* QR Code Modal */}
      {selectedLinkForQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">QR Code</h3>
              <button
                onClick={() => setSelectedLinkForQr(null)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 flex flex-col items-center">
              {selectedLinkForQr.qrCode ? (
                <div className="bg-white p-4 rounded-2xl shadow-inner border border-gray-100 mb-6">
                  <img
                    src={`data:image/png;base64,${selectedLinkForQr.qrCode}`}
                    alt="QR Code"
                    className="w-48 h-48"
                  />
                </div>
              ) : (
                <div className="w-48 h-48 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center p-6 mb-6">
                  <QrCode className="w-12 h-12 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-400 font-medium">No QR code generated yet</p>
                </div>
              )}

              <div className="w-full space-y-3">
                {!selectedLinkForQr.qrCode ? (
                  <button
                    onClick={() => handleGenerateQr(selectedLinkForQr.shortCode)}
                    disabled={isGeneratingQr || (!user?.vip && user?.role !== 'ADMIN')}
                    className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    {isGeneratingQr ? <Loader2 className="w-5 h-5 animate-spin" /> : <QrCode className="w-5 h-5" />}
                    Generate QR Code
                  </button>
                ) : (
                  <button
                    onClick={() => handleDeleteQr(selectedLinkForQr.shortCode)}
                    disabled={isDeletingQr}
                    className="w-full py-3 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    {isDeletingQr ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                    Delete QR Code
                  </button>
                )}

                {!user?.vip && user?.role !== 'ADMIN' && !selectedLinkForQr.qrCode && (
                  <p className="text-[10px] text-center text-amber-600 font-medium">
                    QR codes are exclusive to VIP members.
                  </p>
                )}

                <p className="text-[10px] text-center text-gray-400 font-medium">
                  Scan to share {window.location.host}/r/{selectedLinkForQr.shortCode}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
