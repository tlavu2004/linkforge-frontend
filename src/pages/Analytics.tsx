import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { apiClient } from '../api/axios'
import type { LinkStatsResponse, ApiResponse } from '../types'
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
  TrendingUp
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
  const [stats, setStats] = useState<LinkStatsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchAnalytics = useCallback(async () => {
    if (!shortCode) return
    setIsLoading(true)
    setError('')
    try {
      const { data } = await apiClient.get<ApiResponse<LinkStatsResponse>>(`/analytics/${shortCode}`)
      if (data.success) {
        setStats(data.data)
      } else {
        setError(data.message || 'Failed to load analytics data.')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred while fetching analytics.')
    } finally {
      setIsLoading(false)
    }
  }, [shortCode])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500 mb-4" />
        <p className="text-gray-500 font-medium">Crunching your data...</p>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-100 rounded-3xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-red-600 mb-6">{error || 'Could not load analytics for this link.'}</p>
          <Link 
            to="/dashboard" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-red-200 text-red-700 rounded-xl font-semibold hover:bg-red-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const topDevice = getTopItem(stats.clicksByDeviceType as any)
  const topCountry = getTopItem(stats.clicksByCountry)

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            to="/dashboard" 
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
            title="Back to Dashboard"
          >
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
              <span className="px-3 py-1 bg-primary-50 text-primary-700 text-sm font-bold rounded-lg border border-primary-100">
                {shortCode}
              </span>
            </div>
            <p className="text-gray-500 text-sm flex items-center gap-2">
              Detailed tracking for your shortened link
              <a 
                href={`${window.location.origin}/r/${shortCode}`} 
                target="_blank" 
                rel="noreferrer"
                className="text-primary-600 hover:text-primary-700 flex items-center gap-1 font-medium"
              >
                <ExternalLink className="w-3 h-3" />
                Visit Link
              </a>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
           <button className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-semibold shadow-sm">
             Last 30 Days
           </button>
           <button className="px-4 py-2 text-gray-500 hover:bg-gray-50 rounded-xl text-sm font-semibold transition-colors">
             All Time
           </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
            <MousePointerClick className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Total Clicks</p>
          <h3 className="text-3xl font-bold text-gray-900">{stats.totalClicks.toLocaleString()}</h3>
          <p className="text-[10px] text-green-600 font-bold mt-2 bg-green-50 inline-block px-2 py-0.5 rounded-full">
            +0.0% vs prev period
          </p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
          <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Unique Visitors</p>
          <h3 className="text-3xl font-bold text-gray-900">{stats.uniqueVisitors.toLocaleString()}</h3>
          <p className="text-[10px] text-gray-400 font-medium mt-2">
            Based on unique IP addresses
          </p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
            <Globe className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Top Country</p>
          <h3 className="text-3xl font-bold text-gray-900">{topCountry}</h3>
          <p className="text-[10px] text-gray-400 font-medium mt-2">
            Highest traffic source
          </p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
          <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mb-4 group-hover:scale-110 transition-transform">
            {topDevice === 'N/A' ? <Smartphone className="w-6 h-6" /> : getDeviceIcon(topDevice)}
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Top Device</p>
          <h3 className="text-3xl font-bold text-gray-900 capitalize">{topDevice.toLowerCase()}</h3>
          <p className="text-[10px] text-gray-400 font-medium mt-2">
            Most used platform
          </p>
        </div>
      </div>

      {/* Main Content placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Time-series Chart */}
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm min-h-[450px] flex flex-col">
           <div className="flex items-center justify-between mb-8">
             <div>
               <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                 <Calendar className="w-5 h-5 text-primary-500" />
                 Click Performance
               </h3>
               <p className="text-xs text-gray-400 font-medium mt-1">Daily interaction trends</p>
             </div>
             <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-xl">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-xs font-bold text-green-700">Live</span>
             </div>
           </div>
           
           <div className="flex-1 w-full min-h-[300px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 500 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 500 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '16px', 
                        border: 'none', 
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        padding: '12px'
                      }}
                      itemStyle={{ color: '#4f46e5', fontWeight: 700 }}
                      cursor={{ stroke: '#4f46e5', strokeWidth: 2, strokeDasharray: '4 4' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="clicks" 
                      stroke="#4f46e5" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorClicks)"
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                  <BarChart3 className="w-8 h-8 opacity-20" />
                  <p className="text-sm font-medium">No tracking data for this period</p>
                </div>
              )}
           </div>
        </div>

        {/* Side panels */}
        <div className="space-y-6">
           {/* Device Breakdown */}
           <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm min-h-[300px] flex flex-col">
             <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
               <Smartphone className="w-4 h-4 text-orange-500" />
               Devices
             </h3>
             <div className="flex-1 flex items-center justify-center">
                {deviceData.length > 0 ? (
                  <div className="w-full h-[200px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={deviceData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          animationDuration={1000}
                        >
                          {deviceData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                           contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Legend */}
                    <div className="mt-4 space-y-2">
                       {deviceData.map((entry, index) => (
                         <div key={entry.name} className="flex items-center justify-between text-[10px]">
                            <div className="flex items-center gap-2">
                               <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                               <span className="font-medium text-gray-600 capitalize">{entry.name.toLowerCase()}</span>
                            </div>
                            <span className="font-bold text-gray-900">{entry.value}</span>
                         </div>
                       ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No device data</p>
                )}
             </div>
           </div>

           {/* Referrer Breakdown */}
           <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm min-h-[300px] flex flex-col">
             <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
               <Globe className="w-4 h-4 text-blue-500" />
               Top Referrers
             </h3>
             <div className="flex-1 flex flex-col gap-4">
                {referrerData.length > 0 ? (
                  referrerData.map((ref, index) => {
                    const total = Object.values(stats.clicksByReferrer).reduce((a, b) => a + b, 0)
                    const percent = ((ref.value / total) * 100).toFixed(0)
                    return (
                      <div key={ref.name} className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-gray-700 truncate max-w-[150px]">{ref.name}</span>
                          <span className="text-primary-600">{percent}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary-500 rounded-full" 
                            style={{ width: `${percent}%`, transition: 'width 1s ease-out', transitionDelay: `${index * 100}ms` }} 
                          />
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-xs text-gray-400 italic">No referrer data</p>
                  </div>
                )}
             </div>
           </div>
        </div>
      </div>
    </div>
  )
}
