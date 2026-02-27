import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

// Note: If Backend handles VNPay redirect and updates DB, 
// it might redirect to this frontend page 
// e.g. /vnpay-return?vnp_ResponseCode=00&...
export default function VnPayReturn() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading')

  const responseCode = searchParams.get('vnp_ResponseCode')

  useEffect(() => {
    // Basic frontend check. 
    // In a real scenario, backend might have already verified signature via its own return URL
    // and just redirected here with a simple status, or the frontend needs to call Backend to verify.
    // For this boilerplate, we'll just check ResponseCode = 00
    setTimeout(() => {
      if (responseCode === '00') {
        setStatus('success')
      } else {
        setStatus('failed')
      }
    }, 1500)
  }, [responseCode])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 max-w-md w-full text-center space-y-6 animate-in zoom-in-95">

        {status === 'loading' && (
          <div className="space-y-4">
            <Loader2 className="w-16 h-16 animate-spin text-primary-600 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-900">Verifying Payment...</h2>
            <p className="text-gray-500">Please wait while we confirm your transaction with VNPay.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Payment Successful!</h2>
            <p className="text-gray-500">
              Thank you for upgrading! Your VIP status is being activated. Please re-login if changes do not appear immediately.
            </p>
            <div className="pt-4">
              <Link to="/dashboard" className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-md">
                Go to Dashboard
              </Link>
            </div>
          </div>
        )}

        {status === 'failed' && (
          <div className="space-y-4 justify-center animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Payment Failed</h2>
            <p className="text-gray-500">
              Your transaction could not be completed. Code: {responseCode || 'Unknown'}. Please try again.
            </p>
            <div className="pt-4 flex flex-col gap-3">
              <button onClick={() => navigate(-1)} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-md">
                Try Again
              </button>
              <Link to="/dashboard" className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-8 rounded-xl transition-colors">
                Return to Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
