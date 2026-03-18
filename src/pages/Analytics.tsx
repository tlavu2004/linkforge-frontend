import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useSearchParams, useLocation } from 'react-router-dom'
import { apiClient } from '../api/axios'
import type { LinkStatsResponse, ApiResponse, UserLinkResponse, PageResponse } from '../types'
import { useAuthStore } from '../store/useAuthStore'
import { toast } from 'react-hot-toast'
import {
  BarChart3,
  ChevronLeft,
  MousePointerClick,
  Users,
  Globe,
  Smartphone,
  Loader2,
  AlertCircle,
  ExternalLink,
  Calendar,
  Monitor,
  Tablet,
  TrendingUp,
  Search,
  QrCode,
  X,
  Download
} from 'lucide-react'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts'

export default function Analytics() {
  const { shortCode } = useParams<{ shortCode: string }>()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const token = searchParams.get('token')
  const { user } = useAuthStore()
  
  const [stats, setStats] = useState<LinkStatsResponse | null>(null)
  const [linkInfo, setLinkInfo] = useState<UserLinkResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [dateRange, setDateRange] = useState<'30d' | 'all' | 'custom'>('30d')

  // QR States
  const [showQrModal, setShowQrModal] = useState(false)
  const [isGeneratingQr, setIsGeneratingQr] = useState(false)

  // Initialize with local time format YYYY-MM-DDTHH:mm
  const now = new Date()
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const formatForInput = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  }

  const [startDate, setStartDate] = useState(formatForInput(thirtyDaysAgo))
  const [endDate, setEndDate] = useState(formatForInput(now))

  const isPublicView = !location.pathname.startsWith('/dashboard')
  const hasPrivilege = user?.role === 'ADMIN' || user?.vip

  const fetchAnalytics = useCallback(async () => {
    if (!shortCode) return
    setIsLoading(true)
    setError('')
    try {
      const params: any = { token }

      if (dateRange === '30d') {
        const to = new Date().toISOString()
        const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        params.from = from
        params.to = to
      } else if (dateRange === 'all') {
        params.from = '2024-01-01T00:00:00Z'
        params.to = new Date().toISOString()
      } else {
        // Custom range validation
        if (new Date(startDate) > new Date(endDate)) {
          setError('Start date must be before end date.')
          setIsLoading(false)
          return
        }
        params.from = new Date(startDate).toISOString()
        params.to = new Date(endDate).toISOString()
      }

      const { data } = await apiClient.get<ApiResponse<LinkStatsResponse>>(`/analytics/${shortCode}`, {
        params
      })
      if (data.success) {
        setStats(data.data)
      } else {
        setError(data.message || 'Failed to load analytics data.')
      }

      // If logged in, also try to fetch link info for QR etc.
      if (user) {
        try {
          const { data: linkData } = await apiClient.get<ApiResponse<PageResponse<UserLinkResponse>>>('/me/links', {
            params: { keyword: shortCode, size: 1 }
          })
          if (linkData.success && linkData.data.content.length > 0) {
            setLinkInfo(linkData.data.content[0])
          }
        } catch (e) {
          // Silent fail for link info
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred while fetching analytics.')
    } finally {
      setIsLoading(false)
    }
  }, [shortCode, token, dateRange, startDate, endDate, user])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const handleGenerateQr = async () => {
    if (!shortCode) return
    setIsGeneratingQr(true)
    try {
      const { data } = await apiClient.post<ApiResponse<{ qrCode: string }>>(`/me/links/${shortCode}/qr-code`)
      if (data.success) {
        toast.success('QR Code created!')
        if (linkInfo) setLinkInfo({ ...linkInfo, qrCode: data.data.qrCode })
        else fetchAnalytics() // fallback reload
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to generate QR.')
    } finally {
      setIsGeneratingQr(false)
    }
  }

  const getTopItem = (data: Record<string, number>) => {
    if (!data || Object.keys(data).length === 0) return 'N/A'
    return Object.entries(data).reduce((a, b) => a[1] > b[1] ? a : b)[0]
  }

  const chartData = stats ? Object.entries(stats.dailyStats)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      fullDate: date,
      clicks: count
    })) : []

  const deviceData = stats ? Object.entries(stats.clicksByDeviceType).map(([name, value]) => ({
    name,
    value
  })) : []

  const referrerData = stats ? Object.entries(stats.clicksByReferrer)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({
      name,
      value
    })) : []

  const COLORS = ['#4f46e5', '#818cf8', '#c7d2fe', '#e0e7ff']

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'DESKTOP': return <Monitor className="w-5 h-5" />
      case 'MOBILE': return <Smartphone className="w-5 h-5" />
      case 'TABLET': return <Tablet className="w-5 h-5" />
      default: return <Smartphone className="w-5 h-5" />
    }
  }

  const topDevice = getTopItem(stats?.clicksByDeviceType || {} as any)
  const topCountry = getTopItem(stats?.clicksByCountry || {})

  return (
    <div className="space-y-8 pb-12 pt-6 container mx-auto px-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link
            to={isPublicView ? "/" : "/dashboard"}
            className="p-2.5 hover:bg-gray-100 rounded-2xl transition-all text-gray-400 hover:text-gray-900 border border-transparent hover:border-gray-200"
            title={isPublicView ? "Back to Home" : "Back to Dashboard"}
          >
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Analytics</h1>
              <span className="px-3 py-1 bg-primary-50 text-primary-700 text-xs font-black rounded-lg border border-primary-100 uppercase">
                {shortCode}
              </span>
            </div>
            <p className="text-gray-400 text-sm font-medium flex items-center gap-2">
              Performance metrics for
              <a
                href={`${window.location.origin}/r/${shortCode}`}
                target="_blank"
                rel="noreferrer"
                className="text-primary-600 hover:text-primary-700 flex items-center gap-1 font-bold underline decoration-primary-200 underline-offset-4"
              >
                {shortCode}
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>
        </div>

        {/* Controls Area */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {hasPrivilege && (
            <button
              onClick={() => setShowQrModal(true)}
              className={`inline-flex items-center justify-center gap-2 ${dateRange === 'custom' ? 'px-4' : 'px-6'} bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-2xl transition-all font-bold border border-orange-100 shadow-sm h-14 group`}
              title="QR Shortcut"
            >
              <QrCode className="w-4 h-4 group-hover:scale-110 transition-transform" />
              {dateRange !== 'custom' && <span>QR Shortcut</span>}
            </button>
          )}
          
          
          <Link
            to="/analytics"
            className={`inline-flex items-center justify-center gap-2 ${dateRange === 'custom' ? 'px-4' : 'px-6'} bg-white text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-2xl transition-all font-bold border border-gray-200 hover:border-primary-100 shadow-sm h-14 group`}
            title="Try Another"
          >
            <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
            {dateRange !== 'custom' && <span>Try Another</span>}
          </Link>

          {dateRange === 'custom' && (
            <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-right-2 h-14">
              {/* Start Date */}
              <div
                className="flex items-center px-4 cursor-pointer hover:bg-gray-50 rounded-xl transition-colors h-full group/input relative"
                onClick={() => {
                  const input = document.getElementById('analytics-start-date') as HTMLInputElement;
                  try { input.showPicker(); } catch (e) { input.focus(); }
                }}
              >
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 font-black uppercase leading-none mb-1">Start Point</span>
                  <span className={`text-xs font-bold whitespace-nowrap ${startDate ? 'text-gray-900' : 'text-gray-400'}`}>
                    {startDate ? new Date(startDate).toLocaleString('vi-VN', { 
                        day: '2-digit', month: '2-digit', year: 'numeric', 
                        hour: '2-digit', minute: '2-digit', second: '2-digit', 
                        hour12: false 
                    }) : 'dd/mm/yyyy hh:mm:ss'}
                  </span>
                </div>
                <Calendar className="w-3.5 h-3.5 ml-3 text-gray-400 group-hover/input:text-primary-500 transition-colors" />
                <input
                  id="analytics-start-date"
                  type="datetime-local"
                  step="1"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  style={{ colorScheme: 'light' }}
                />
              </div>

              <div className="w-px h-6 bg-gray-100" />

              {/* End Date */}
              <div
                className="flex items-center px-4 cursor-pointer hover:bg-gray-50 rounded-xl transition-colors h-full group/input relative"
                onClick={() => {
                  const input = document.getElementById('analytics-end-date') as HTMLInputElement;
                  try { input.showPicker(); } catch (e) { input.focus(); }
                }}
              >
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 font-black uppercase leading-none mb-1">End Point</span>
                  <span className={`text-xs font-bold whitespace-nowrap ${endDate ? 'text-gray-900' : 'text-gray-400'}`}>
                    {endDate ? new Date(endDate).toLocaleString('vi-VN', { 
                        day: '2-digit', month: '2-digit', year: 'numeric', 
                        hour: '2-digit', minute: '2-digit', second: '2-digit', 
                        hour12: false 
                    }) : 'dd/mm/yyyy hh:mm:ss'}
                  </span>
                </div>
                <Calendar className="w-3.5 h-3.5 ml-3 text-gray-400 group-hover/input:text-primary-500 transition-colors" />
                <input
                  id="analytics-end-date"
                  type="datetime-local"
                  step="1"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  style={{ colorScheme: 'light' }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-gray-100 shadow-sm h-14">
            <button
              onClick={() => setDateRange('30d')}
              className={`px-5 h-full rounded-xl text-xs font-black transition-all ${dateRange === '30d' ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              30D
            </button>
            <button
              onClick={() => setDateRange('all')}
              className={`px-5 h-full rounded-xl text-xs font-black transition-all ${dateRange === 'all' ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              TOTAL
            </button>
            <button
              onClick={() => setDateRange('custom')}
              className={`px-5 h-full rounded-xl text-xs font-black transition-all ${dateRange === 'custom' ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              CUSTOM
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-600 shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-red-900">Oops! We hit a snag</p>
            <p className="text-xs text-red-700 font-medium">{error}</p>
          </div>
          <button
            onClick={() => setError('')}
            className="p-2 hover:bg-red-100 rounded-xl text-red-400 hover:text-red-700 transition-all font-bold text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {isLoading && stats && (
        <div className="flex items-center gap-3 px-6 py-3 bg-indigo-50 border border-indigo-100 rounded-2xl animate-in fade-in slide-in-from-bottom-2 w-fit">
          <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
          <span className="text-sm font-bold text-primary-700">Updating statistics...</span>
        </div>
      )}

      {isLoading && !stats ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
          <div className="relative w-20 h-20 mb-6">
            <div className="absolute inset-0 border-4 border-primary-100 rounded-full" />
            <div className="absolute inset-0 border-4 border-primary-600 rounded-full border-t-transparent animate-spin" />
            <BarChart3 className="absolute inset-0 m-auto w-8 h-8 text-primary-600" />
          </div>
          <p className="text-xl font-black text-gray-900">Calculating analytics</p>
          <p className="text-gray-400 font-medium mt-1">Please wait a moment...</p>
        </div>
      ) : !stats ? (
        <div className="bg-amber-50 border border-amber-100 rounded-[3rem] p-20 text-center animate-in zoom-in-95 duration-500 shadow-sm border-dashed">
          <div className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center text-amber-600 mx-auto mb-6">
            <Search className="w-10 h-10 opacity-60" />
          </div>
          <h3 className="text-2xl font-black text-gray-900">No Clicks Detected</h3>
          <p className="text-gray-500 mt-2 max-w-sm mx-auto font-medium leading-relaxed">
            We couldn't find any data for this link within the selected date range. Try picking a broader period.
          </p>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform" />
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 relative z-10">
                <MousePointerClick className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-gray-400 mb-1 uppercase tracking-wider">Total Clicks</p>
              <h3 className="text-4xl font-black text-gray-900 tracking-tight">{stats.totalClicks.toLocaleString()}</h3>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform" />
              <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-6 relative z-10">
                <Users className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-gray-400 mb-1 uppercase tracking-wider">Unique Visitors</p>
              <h3 className="text-4xl font-black text-gray-900 tracking-tight">{stats.uniqueVisitors.toLocaleString()}</h3>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform" />
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 relative z-10">
                <Globe className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-gray-400 mb-1 uppercase tracking-wider">Top Region</p>
              <h3 className="text-4xl font-black text-gray-900 tracking-tight">{topCountry}</h3>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform" />
              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mb-6 relative z-10">
                {topDevice === 'N/A' ? <Smartphone className="w-7 h-7" /> : getDeviceIcon(topDevice)}
              </div>
              <p className="text-sm font-bold text-gray-400 mb-1 uppercase tracking-wider">Primary Device</p>
              <h3 className="text-4xl font-black text-gray-900 tracking-tight capitalize">{topDevice.toLowerCase()}</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-8 md:p-10 rounded-[3rem] border border-gray-100 shadow-sm min-h-[500px] flex flex-col">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="font-black text-2xl text-gray-900 flex items-center gap-3">
                    <Calendar className="w-7 h-7 text-primary-500" />
                    Click Performance
                  </h3>
                  <p className="text-sm text-gray-400 font-bold mt-1">Daily engagement timeline</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-2xl border border-green-100">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-black text-green-700 uppercase tracking-widest">Live Flow</span>
                </div>
              </div>

              <div className="flex-1 w-full min-h-[350px]">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: '#64748b', fontWeight: 700 }}
                        dy={15}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: '#64748b', fontWeight: 700 }}
                        dx={-5}
                        domain={[0, 'dataMax + 1']}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '24px',
                          border: 'none',
                          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                          padding: '16px',
                          fontWeight: 'bold'
                        }}
                        itemStyle={{ color: '#4f46e5', fontWeight: 900 }}
                        cursor={{ stroke: '#4f46e5', strokeWidth: 2, strokeDasharray: '6 6' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="clicks"
                        stroke="#4f46e5"
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorClicks)"
                        animationDuration={2000}
                        dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#4f46e5' }}
                        activeDot={{ r: 8, strokeWidth: 0, fill: '#4f46e5' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-4 opacity-40">
                    <BarChart3 className="w-16 h-16" />
                    <p className="text-sm font-black uppercase tracking-widest">No timeline data</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col">
                <h3 className="font-black text-gray-900 mb-8 flex items-center gap-3">
                  <Smartphone className="w-6 h-6 text-orange-500" />
                  Devices
                </h3>
                {/* Fixed height container for PieChart */}
                <div className="w-full h-[300px] flex items-center justify-center relative">
                  {deviceData.length > 0 ? (
                    <div className="w-full h-full relative flex flex-col">
                      <div className="flex-1 h-full min-h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={deviceData}
                              innerRadius={70}
                              outerRadius={95}
                              paddingAngle={8}
                              dataKey="value"
                              animationDuration={1500}
                              stroke="none"
                            >
                              {deviceData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="focus:outline-none" />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3 px-2">
                        {deviceData.map((entry, index) => (
                          <div key={entry.name} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 truncate">
                              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                              <span className="font-bold text-gray-500 capitalize truncate">{entry.name.toLowerCase()}</span>
                            </div>
                            <span className="font-black text-gray-900 ml-2">{entry.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 font-bold italic uppercase tracking-widest">No device stats</p>
                  )}
                </div>
              </div>

              <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm min-h-[320px] flex flex-col">
                <h3 className="font-black text-gray-900 mb-8 flex items-center gap-3">
                  <Globe className="w-6 h-6 text-blue-500" />
                  Top Referrers
                </h3>
                <div className="flex-1 flex flex-col gap-5">
                  {referrerData.length > 0 ? (
                    referrerData.map((ref, index) => {
                      const total = Object.values(stats.clicksByReferrer).reduce((a, b) => a + b, 0)
                      const percent = ((ref.value / total) * 100).toFixed(0)
                      return (
                        <div key={ref.name} className="space-y-2 group">
                          <div className="flex justify-between text-xs font-black uppercase tracking-tight">
                            <span className="text-gray-600 truncate max-w-[150px]">{ref.name}</span>
                            <span className="text-primary-600">{percent}%</span>
                          </div>
                          <div className="w-full h-2.5 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                            <div
                              className="h-full bg-primary-500 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.3)]"
                              style={{ width: `${percent}%`, transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)', transitionDelay: `${index * 150}ms` }}
                            />
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-xs text-gray-400 font-bold italic uppercase tracking-widest">No referrer sources</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-gray-900">QR Code Link</h3>
                <p className="text-sm text-gray-400 font-medium">Quick identity for {shortCode}</p>
              </div>
              <button
                onClick={() => setShowQrModal(false)}
                className="p-3 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-2xl transition-colors hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-10 flex flex-col items-center text-center">
              {linkInfo?.qrCode ? (
                <>
                  <div className="p-6 bg-gray-50 rounded-[2.5rem] mb-8 border border-gray-100 shadow-inner group relative">
                    <img
                      src={`data:image/png;base64,${linkInfo.qrCode}`}
                      alt="QR Code"
                      className="w-48 h-48 rounded-2xl mix-blend-multiply"
                    />

                    <div className="absolute inset-0 bg-primary-600/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem]" />
                  </div>
                  <div className="flex flex-col gap-3 w-full">
                    <a
                      href={`data:image/png;base64,${linkInfo.qrCode}`}

                      download={`qr-${shortCode}.png`}
                      className="flex items-center justify-center gap-2 w-full py-4 bg-primary-600 text-white rounded-2xl font-black shadow-lg shadow-primary-100 hover:bg-primary-700 transition-all hover:-translate-y-1"
                    >
                      <Download className="w-5 h-5" />
                      Download QR
                    </a>
                    <button
                      onClick={() => setShowQrModal(false)}
                      className="w-full py-4 bg-gray-50 text-gray-600 rounded-2xl font-bold hover:bg-gray-100 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-12 flex flex-col items-center">
                  <div className="w-24 h-24 bg-orange-50 rounded-[2rem] flex items-center justify-center text-orange-400 mb-6 border border-orange-100">
                    <QrCode className="w-12 h-12" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">No QR Code Yet</h4>
                  <p className="text-gray-500 mb-8 max-w-xs mx-auto text-sm font-medium">
                    You haven't generated a QR code for this link. Create one now to share offline!
                  </p>
                  <button
                    onClick={handleGenerateQr}
                    disabled={isGeneratingQr}
                    className="flex items-center justify-center gap-2 px-10 py-4 bg-orange-500 text-white rounded-2xl font-black shadow-lg shadow-orange-100 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isGeneratingQr ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <QrCode className="w-5 h-5" />
                        Generate Now
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
