import axios from 'axios'
import { useAuthStore } from '../store/useAuthStore'
import i18n from '../i18n'

const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : '/api/v1';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  (config) => {
    const { user } = useAuthStore.getState()
    if (user?.accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${user.accessToken}`
    }
    
    if (config.headers) {
      config.headers['Accept-Language'] = i18n.language || 'en'
    }
    
    return config
  },
  (error) => Promise.reject(error)
)

let isRefreshing = false
let failedQueue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = 'Bearer ' + token
            return apiClient.request(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const { user } = useAuthStore.getState()
        if (!user?.refreshToken) {
          throw new Error('No refresh token available')
        }

        const { data } = await axios.post('/api/v1/auth/refresh', {
          refreshToken: user.refreshToken,
        })

        if (data.success && data.data) {
          useAuthStore.setState({ user: data.data, isAuthenticated: true })
          apiClient.defaults.headers.common.Authorization = `Bearer ${data.data.accessToken}`
          originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`
          processQueue(null, data.data.accessToken)
          return apiClient.request(originalRequest)
        } else {
          throw new Error('Refresh failed')
        }
      } catch (err) {
        processQueue(err, null)
        useAuthStore.getState().clearAuth()
        window.location.href = '/login'
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)
