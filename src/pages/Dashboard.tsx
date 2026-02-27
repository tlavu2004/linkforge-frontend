import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { apiClient } from '../api/axios'
import type { ShortLinkResponse, ApiResponse } from '../types'
import { LinkIcon, Copy, Check, ExternalLink, Loader2, AlertCircle, LayoutDashboard } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [recentLink, setRecentLink] = useState<ShortLinkResponse | null>(null)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const { user } = useAuthStore()

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return

    setIsLoading(true)
    setError('')
    setRecentLink(null)
    setCopiedUrl(false)

    try {
      const { data } = await apiClient.post<ApiResponse<ShortLinkResponse>>('/links', {
        originalUrl: url
      })
      if (data.success) {
        setRecentLink(data.data)
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



  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedUrl(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopiedUrl(false), 2000)
  }

  return (
    <div className="space-y-8">
      {/* Create new link widget */}
      <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-50 pointer-events-none" />

        <div className="relative">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Create New Short Link</h2>

          <form onSubmit={handleShorten} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <LinkIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste your long URL here..."
                className="w-full bg-gray-50 outline-none text-gray-900 placeholder:text-gray-400 font-medium text-lg pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                required
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !url}
              className="md:w-32 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 disabled:cursor-not-allowed text-white px-6 py-4 rounded-xl font-semibold transition-all shadow-sm flex justify-center items-center"
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

          {!user?.vip && (
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
            </div>
          </div>
        </section>
      )}

      {/* Note: In a real app we would call GET /links (which needs to be added to Backend) to list user's links here */}
      <section className="opacity-60 pointer-events-none p-8 text-center border-2 border-dashed border-gray-200 rounded-3xl">
        <LayoutDashboard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-1">Your Link History</h3>
        <p className="text-sm text-gray-400">This feature requires a backend endpoint to list user's links. Currently not present in OpenAPI spec.</p>
      </section>
    </div>
  )
}

function Star(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}
