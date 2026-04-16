import api from './api'
import type { ApiResponse, PaginatedResponse, PaginationQuery } from '@/types/api.types'
import type { PublishTask, PublishStatus } from '@/types/publish.types'

export interface CreatePublishData {
  contentId: string
  platforms: {
    accountId: string
    scheduledAt?: string
  }[]
}

export interface PublishTaskListParams extends PaginationQuery {
  platform?: string
  status?: PublishStatus
  startDate?: string
  endDate?: string
}

export interface PublishHistoryParams extends PaginationQuery {
  platform?: string
  status?: PublishStatus
  startDate?: string
  endDate?: string
}

export interface PreCheckData {
  contentId: string
  accountIds: string[]
}

export interface PreCheckResult {
  accountId: string
  platform: string
  passed: boolean
  errors?: string[]
  warnings?: string[]
}

export interface PublishPreview {
  platform: string
  title: string
  body: string
  rules: {
    label: string
    value: string
    limit?: number
    current?: number
  }[]
}

export const publishService = {
  async createPublish(data: CreatePublishData): Promise<PublishTask[]> {
    const response = await api.post<ApiResponse<PublishTask[]>>('/publish', data)
    return response.data.data
  },

  async getTasks(params?: PublishTaskListParams): Promise<PaginatedResponse<PublishTask>> {
    const response = await api.get<ApiResponse<PaginatedResponse<PublishTask>>>('/publish/tasks', { params })
    return response.data.data
  },

  async getTaskById(id: string): Promise<PublishTask> {
    const response = await api.get<ApiResponse<PublishTask>>(`/publish/tasks/${id}`)
    return response.data.data
  },

  async retryTask(id: string): Promise<PublishTask> {
    const response = await api.post<ApiResponse<PublishTask>>(`/publish/tasks/${id}/retry`)
    return response.data.data
  },

  async cancelTask(id: string): Promise<PublishTask> {
    const response = await api.post<ApiResponse<PublishTask>>(`/publish/tasks/${id}/cancel`)
    return response.data.data
  },

  async getPreview(contentId: string, platform: string): Promise<PublishPreview> {
    const response = await api.get<ApiResponse<PublishPreview>>(`/publish/preview/${platform}`, {
      params: { contentId },
    })
    return response.data.data
  },

  async preCheck(data: PreCheckData): Promise<PreCheckResult[]> {
    const response = await api.post<ApiResponse<PreCheckResult[]>>('/publish/pre-check', data)
    return response.data.data
  },

  async getHistory(params?: PublishHistoryParams): Promise<PaginatedResponse<PublishTask>> {
    const response = await api.get<ApiResponse<PaginatedResponse<PublishTask>>>('/publish/history', { params })
    return response.data.data
  },
}
