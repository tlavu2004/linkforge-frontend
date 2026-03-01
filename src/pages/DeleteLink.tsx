import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { apiClient } from '../api/axios'
import { Trash2, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react'

export default function DeleteLink() {
  const [shortCode, setShortCode] = useState('')
  const [deleteToken, setDeleteToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleted, setIsDeleted] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!shortCode || !deleteToken) return
    setShowConfirm(true)
  }

  const handleDelete = async () => {
    setShowConfirm(false)
    setIsLoading(true)

    try {
      await apiClient.delete(`/links/${shortCode}`, {
        params: { deleteToken }
      })
      setIsDeleted(true)
      toast.success('Link deleted successfully!')
    } catch (err: any) {
      const status = err.response?.status
      if (status === 403) {
        toast.error('Invalid delete token. Please check and try again.')
      } else if (status === 404) {
        toast.error('Short link not found. It may have already been deleted.')
      } else {
        toast.error(err.response?.data?.message || 'An error occurred. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setShortCode('')
    setDeleteToken('')
    setIsDeleted(false)
    setShowConfirm(false)
  }

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col justify-center min-h-[calc(100vh-4rem)]">
      <div className="max-w-lg mx-auto w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 text-red-500 mb-2">
            <Trash2 className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            Delete a Link
          </h1>
          <p className="text-gray-500 text-lg">
            Enter your short code and delete token to remove a link permanently.
          </p>
        </div>

        {isDeleted ? (
          /* Success State */
          <div className="bg-white border border-gray-100 shadow-xl rounded-2xl p-8 text-center space-y-5 animate-in zoom-in-95 duration-300">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 text-green-500">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Link Deleted</h2>
            <p className="text-gray-500">
              The short link has been successfully removed and will no longer redirect.
            </p>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-semibold transition-all shadow-sm"
            >
              Delete Another Link
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="bg-white border border-gray-100 shadow-xl rounded-2xl p-6 md:p-8 space-y-6 animate-in fade-in duration-300">
            <div className="space-y-2">
              <label htmlFor="shortCode" className="block text-sm font-semibold text-gray-700">
                Short Code
              </label>
              <input
                id="shortCode"
                type="text"
                value={shortCode}
                onChange={(e) => setShortCode(e.target.value.trim())}
                placeholder="e.g. yGa8wY5gLe"
                className="w-full bg-gray-50 outline-none text-gray-900 placeholder:text-gray-400 font-medium text-lg px-4 py-3.5 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-red-200 focus:border-red-300 transition-all"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-gray-400">
                The code from your short link URL (the part after /r/)
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="deleteToken" className="block text-sm font-semibold text-gray-700">
                Delete Token
              </label>
              <input
                id="deleteToken"
                type="text"
                value={deleteToken}
                onChange={(e) => setDeleteToken(e.target.value.trim())}
                placeholder="Paste your delete token here"
                className="w-full bg-gray-50 outline-none text-gray-900 placeholder:text-gray-400 font-mono text-sm px-4 py-3.5 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-red-200 focus:border-red-300 transition-all"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-gray-400">
                The secret token you received when the link was created
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !shortCode || !deleteToken}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed text-white px-6 py-4 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </span>
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  Delete Link
                </>
              )}
            </button>
          </form>
        )}

        {/* Warning notice */}
        <div className="bg-amber-50/80 border border-amber-100 rounded-xl p-4 flex items-start gap-3 text-sm text-amber-800">
          <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p>
            This action is <strong>permanent</strong>. Once deleted, the short link will stop working
            and cannot be recovered.
          </p>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200 px-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-300">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-50 text-red-500">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Confirm Deletion</h3>
              <p className="text-gray-500 text-sm">
                Are you sure you want to delete the link <strong className="text-gray-900 font-mono">{shortCode}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all shadow-sm"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
