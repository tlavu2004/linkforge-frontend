export interface ShortLinkResponse {
  shortCode: string
  originalUrl: string
  createdAt: string
  expiresAt?: string
  deleteToken?: string
  skipAds?: boolean
  '@class': string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  userId: number
  name: string
  email: string
  role: 'USER' | 'ADMIN'
  vip: boolean
}

export interface RegisterResponse {
  userId: number
  name: string
  email: string
  role: 'USER' | 'ADMIN'
  vip: boolean
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
  timestamp: string
}
