import { Link } from 'react-router-dom'
import { Clock, ArrowLeft, Home } from 'lucide-react'

export default function ExpiredLink() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-60 pointer-events-none" />

      <div className="max-w-md w-full text-center relative z-10 space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="relative inline-block">
          <div className="w-24 h-24 bg-amber-100 rounded-3xl flex items-center justify-center mx-auto rotate-12 group-hover:rotate-0 transition-transform shadow-inner">
            <Clock className="w-12 h-12 text-amber-600 -rotate-12 group-hover:rotate-0 transition-transform" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
            <div className="w-6 h-6 bg-red-500 rounded-full animate-pulse flex items-center justify-center text-[10px] text-white font-bold">!</div>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Link Expired</h1>
          <p className="text-gray-500 text-lg leading-relaxed">
            The short link you are trying to access has reached its expiration date and is no longer available.
          </p>
        </div>

        <div className="pt-4 flex flex-col gap-3">
          <Link
            to="/"
            className="w-full bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-xl hover:shadow-indigo-500/20 flex items-center justify-center gap-3"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-8 py-4 rounded-2xl font-semibold text-lg transition-all flex items-center justify-center gap-3"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>

        <div className="pt-8 text-sm text-gray-400">
          <p>Links on LinkForge disappear automatically according to their set expiration time.</p>
        </div>
      </div>
    </div>
  )
}
