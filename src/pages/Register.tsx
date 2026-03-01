import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { apiClient } from '../api/axios'
import type { ApiResponse, RegisterResponse } from '../types'
import { Mail, Lock, AlertCircle, Loader2, User } from 'lucide-react'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const { data } = await apiClient.post<ApiResponse<RegisterResponse>>('/auth/register', {
        name,
        email,
        password,
      })

      if (data.success) {
        // Redirect to login on successful registration
        toast.success('Registration successful! Please sign in.')
        navigate('/login')
      } else {
        setError(data.message || 'Registration failed')
        toast.error(data.message || 'Registration failed')
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'An error occurred during registration. Please try again.'
      )
      toast.error('Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>
        <p className="text-gray-500 text-sm">Join LinkForge to manage your shortened URLs.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center text-sm font-medium">
          <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 block">Full Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-shadow"
              placeholder="John Doe"
              required
              maxLength={100}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 block">Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-shadow"
              placeholder="you@example.com"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 block">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-shadow"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 block">Confirm Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-shadow"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !name || !email || !password || !confirmPassword}
          className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
              Creating account...
            </>
          ) : (
            'Sign up'
          )}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500 transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  )
}
