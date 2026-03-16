import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, BarChart3, ArrowRight } from 'lucide-react'

export default function AnalyticsLookup() {
  const [shortCode, setShortCode] = useState('')
  const [token, setToken] = useState('')
  const navigate = useNavigate()

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault()
    if (!shortCode) return

    const url = `/analytics/${shortCode}${token ? `?token=${token}` : ''}`
    navigate(url)
  }

  return (
    <div className="container mx-auto px-4 h-full flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 md:p-10 text-center space-y-8">
        <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 mx-auto">
          <BarChart3 className="w-10 h-10" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-gray-900">Link Analytics</h1>
          <p className="text-gray-500">Enter your short code and delete token to see detailed statistics.</p>
        </div>

        <form onSubmit={handleLookup} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Short Code (e.g., abc123)"
              value={shortCode}
              onChange={(e) => setShortCode(e.target.value.trim())}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
              required
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <span className="text-sm font-bold">#</span>
            </div>
            <input
              type="text"
              placeholder="Delete Token (Optional)"
              value={token}
              onChange={(e) => setToken(e.target.value.trim())}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-4 rounded-2xl font-bold transition-all shadow-lg hover:shadow-primary-500/20 flex items-center justify-center gap-2 group"
          >
            Check Statistics
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  )
}
