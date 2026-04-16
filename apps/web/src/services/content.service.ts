import api from './api'
import type { ApiResponse, PaginatedResponse, PaginationQuery } from '@/types/api.types'
import type { Content, CreateContentRequest } from '@/types/content.types'

export interface ContentListParams extends PaginationQuery {
  status?: string
  keyword?: string
}

export const contentService = {
  async createContent(data: CreateContentRequest): Promise<Content> {
    const response = await api.post<ApiResponse<Content>>('/contents', data)
    return response.data.data
  },

  async updateContent(id: string, data: Partial<CreateContentRequest>): Promise<Content> {
    const response = await api.put<ApiResponse<Content>>(`/contents/${id}`, data)
    return response.data.data
  },

  async getContent(id: string): Promise<Content> {
    const response = await api.get<ApiResponse<Content>>(`/contents/${id}`)
    return response.data.data
  },

  async getContentList(params?: ContentListParams): Promise<PaginatedResponse<Content>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Content>>>('/contents', { params })
    return response.data.data
  },

  async deleteContent(id: string): Promise<void> {
    await api.delete(`/contents/${id}`)
  },
}
