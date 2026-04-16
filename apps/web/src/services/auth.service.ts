import api from './api'
import type { ApiResponse } from '@/types/api.types'
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
} from '@/types/auth.types'

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data)
    return response.data.data
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data)
    return response.data.data
  },

  async refreshToken(token: string): Promise<{ accessToken: string }> {
    const response = await api.post<ApiResponse<{ accessToken: string }>>('/auth/refresh', {
      refreshToken: token,
    })
    return response.data.data
  },

  async getMe(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/auth/me')
    return response.data.data
  },

  async updateProfile(data: Partial<Pick<User, 'name' | 'avatar'>>): Promise<User> {
    const response = await api.patch<ApiResponse<User>>('/auth/profile', data)
    return response.data.data
  },

  async changePassword(data: {
    currentPassword: string
    newPassword: string
  }): Promise<void> {
    await api.post('/auth/change-password', data)
  },
}
