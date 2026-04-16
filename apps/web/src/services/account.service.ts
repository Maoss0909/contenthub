import api from './api'
import type { ApiResponse } from '@/types/api.types'
import type { Account, Platform, AuthStatus } from '@/types/account.types'

export interface SupportedPlatform {
  platform: Platform
  name: string
  description: string
  icon: string
  color: string
}

export interface AccountStatus {
  platform: Platform
  status: AuthStatus
  expiresAt?: string
}

const accountService = {
  async getAccounts(): Promise<Account[]> {
    const response = await api.get<ApiResponse<Account[]>>('/accounts')
    return response.data.data
  },

  async getAccountById(id: string): Promise<Account> {
    const response = await api.get<ApiResponse<Account>>(`/accounts/${id}`)
    return response.data.data
  },

  async getSupportedPlatforms(): Promise<SupportedPlatform[]> {
    const response = await api.get<ApiResponse<SupportedPlatform[]>>(
      '/accounts/platforms',
    )
    return response.data.data
  },

  async bindAccount(platform: Platform): Promise<{ authUrl: string }> {
    const response = await api.post<ApiResponse<{ authUrl: string }>>(
      `/accounts/bind/${platform}`,
    )
    return response.data.data
  },

  async handleCallback(
    platform: Platform,
    code: string,
    state: string,
  ): Promise<Account> {
    const response = await api.post<ApiResponse<Account>>(
      `/accounts/callback/${platform}`,
      { code, state },
    )
    return response.data.data
  },

  async unbindAccount(id: string): Promise<void> {
    await api.delete(`/accounts/${id}`)
  },

  async refreshAccountToken(id: string): Promise<Account> {
    const response = await api.post<ApiResponse<Account>>(
      `/accounts/${id}/refresh`,
    )
    return response.data.data
  },

  async getAccountsStatus(): Promise<AccountStatus[]> {
    const response = await api.get<ApiResponse<AccountStatus[]>>(
      '/accounts/status',
    )
    return response.data.data
  },
}

export default accountService
