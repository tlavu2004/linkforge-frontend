import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { apiClient } from '../api/axios'
import type { ShortLinkResponse, ApiResponse } from '../types'
import { Copy, Check, Link as LinkIcon, AlertCircle, LayoutDashboard } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'

export default function Home() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const [url, setUrl] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<ShortLinkResponse | null>(null)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [copiedToken, setCopiedToken] = useState(false)

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return

    setIsLoading(true)
    setError('')
    setResult(null)
    setCopiedUrl(false)
    setCopiedToken(false)

    try {
      const payload: any = { originalUrl: url }
      if (expiresAt) {
        payload.expiresAt = new Date(expiresAt).toISOString()
      }

      const { data } = await apiClient.post<ApiResponse<ShortLinkResponse>>('/links', payload)
      if (data.success) {
        setResult(data.data)
        setUrl('')
        toast.success('Link shortened successfully!')
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

  const copyToClipboard = (text: string, type: 'url' | 'token') => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
    if (type === 'url') {
      setCopiedUrl(true)
      setTimeout(() => setCopiedUrl(false), 2000)
    } else {
      setCopiedToken(true)
      setTimeout(() => setCopiedToken(false), 2000)
    }
  }

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col justify-center min-h-[calc(100vh-4rem)]">
      <div className="max-w-3xl mx-auto w-full text-center space-y-10">
        <div className="space-y-6">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 text-balance leading-tight">
            Shorten Your Links <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">
              Expand Your Reach
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 text-balance max-w-2xl mx-auto">
            LinkForge is a powerful, secure, and fast URL shortener designed to enhance your online presence.
            Create, track, and manage your links effortlessly.
          </p>
        </div>

        {isAuthenticated ? (
          <div className="flex flex-col items-center justify-center pt-8 fade-in">
            <Link
              to="/dashboard"
              className="bg-primary-600 hover:bg-primary-700 text-white px-10 py-5 rounded-full font-bold text-xl transition-all shadow-xl hover:shadow-indigo-500/20 flex items-center justify-center gap-3 w-full md:w-auto"
            >
              <LayoutDashboard className="w-6 h-6" />
              Go to Dashboard
            </Link>
            <p className="mt-6 text-gray-500 text-sm">You are already logged in to LinkForge.</p>
          </div>
        ) : (
          <>
            <form onSubmit={handleShorten} className="bg-white p-2 md:p-3 rounded-2xl md:rounded-full shadow-xl flex flex-col md:flex-row items-center max-w-2xl mx-auto border border-gray-100 focus-within:ring-4 focus-within:ring-primary-100 transition-all">
              <div className="flex-1 w-full flex items-center px-4 md:px-6 py-3 md:py-4">
                <LinkIcon className="text-gray-400 w-5 h-5 mr-3 shrink-0" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste your long URL here... e.g., https://example.com"
                  className="w-full bg-transparent outline-none text-gray-900 placeholder:text-gray-400 font-medium text-lg"
                  required
                  disabled={isLoading}
                />
              </div>

              {isAuthenticated && (useAuthStore.getState().user?.vip || useAuthStore.getState().user?.role === 'ADMIN') && (
                <div className="w-full md:w-auto px-2 md:px-0 py-2 md:py-0 border-t md:border-t-0 border-gray-100 flex items-center justify-center md:border-l md:border-l-gray-200 relative">
                  <span className={`absolute left-5 md:left-3 top-1/2 -translate-y-1/2 text-sm font-medium pointer-events-none whitespace-nowrap ${expiresAt ? 'text-gray-900' : 'text-gray-400'}`}>
                    {expiresAt
                      ? new Date(expiresAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
                      : 'dd/mm/yyyy hh:mm:ss'}
                  </span>
                  <input
                    type="datetime-local"
                    step="1"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full bg-transparent outline-none cursor-pointer pl-4 pr-8 py-3 text-sm border-none focus:ring-0"
                    style={{ color: 'transparent', caretColor: 'transparent', minWidth: '210px' }}
                  />
                  {expiresAt && (
                    <button
                      type="button"
                      onClick={() => setExpiresAt('')}
                      className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 text-lg leading-none"
                    >
                      ×
                    </button>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !url}
                className="w-full md:w-auto bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 disabled:cursor-not-allowed text-white px-8 py-4 md:py-4 rounded-xl md:rounded-full font-semibold transition-all shadow-md hover:shadow-lg flex justify-center items-center h-full"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : 'Shorten Now'}
              </button>
            </form>

            {error && (
              <div className="max-w-2xl mx-auto bg-red-50 text-red-600 p-4 rounded-xl flex items-center text-left text-sm font-medium animate-in fade-in">
                <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {result && (
              <div className="max-w-2xl mx-auto bg-white border border-gray-100 shadow-xl rounded-2xl p-6 md:p-8 space-y-6 animate-in zoom-in-95 duration-300">
                <div className="space-y-4">
                  <div className="text-left">
                    <p className="text-sm text-gray-500 font-medium mb-1">Your shortened link</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl px-4 py-3 font-medium truncate text-lg">
                        {window.location.origin}/r/{result.shortCode}
                      </div>
                      <button
                        onClick={() => copyToClipboard(`${window.location.origin}/r/${result.shortCode}`, 'url')}
                        className="shrink-0 p-3 bg-primary-50 text-primary-600 hover:bg-primary-100 rounded-xl transition flex items-center justify-center w-12 h-12"
                        title="Copy short link"
                      >
                        {copiedUrl ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {result.deleteToken && (
                    <div className="text-left pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm text-amber-600 font-medium">Delete Token (Save this!)</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-amber-50 text-amber-900 border border-amber-200/50 rounded-xl px-4 py-3 font-mono text-sm truncate">
                          {result.deleteToken}
                        </div>
                        <button
                          onClick={() => copyToClipboard(result.deleteToken!, 'token')}
                          className="shrink-0 p-3 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-xl transition flex items-center justify-center w-12 h-12"
                          title="Copy delete token"
                        >
                          {copiedToken ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Since you created this link as a guest, you must save this token if you ever wish to{' '}
                        <a href="/delete" className="text-primary-600 underline hover:text-primary-700 font-medium">delete the link</a>.
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50/50 rounded-xl p-4 text-left border border-blue-100">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold flex items-center"><LinkIcon className="inline w-4 h-4 mr-1" />Original:</span>
                    <a href={result.originalUrl} target="_blank" rel="noreferrer" className="underline truncate block max-w-full mt-1 hover:text-primary-600 transition">
                      {result.originalUrl}
                    </a>
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div >
  )
}
