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
  vipExpiresAt?: string
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

export interface UserLinkResponse {
  shortCode: string
  originalUrl: string
  createdAt: string
  expiresAt?: string
  clickCount: number
  expired: boolean
}

export interface PageResponse<T> {
  content: T[]
  totalPages: number
  totalElements: number
  number: number
  size: number
  first: boolean
  last: boolean
}

export interface AdminUserResponse {
  id: string
  username: string
  email: string
  role: 'USER' | 'ADMIN'
  vip: boolean
  vipExpiresAt?: string
}
