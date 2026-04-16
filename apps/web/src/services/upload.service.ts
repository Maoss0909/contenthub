import api from './api'
import type { ApiResponse, PaginatedResponse, PaginationQuery } from '@/types/api.types'

export interface UploadResult {
  id: string
  url: string
  filename: string
  mimetype: string
  size: number
}

export interface MediaListParams extends PaginationQuery {
  type?: string
}

export const uploadService = {
  async uploadImage(file: File): Promise<UploadResult> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post<ApiResponse<UploadResult>>('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data
  },

  async uploadImages(files: File[]): Promise<UploadResult[]> {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file)
    })
    const response = await api.post<ApiResponse<UploadResult[]>>('/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data
  },

  async deleteMedia(id: string): Promise<void> {
    await api.delete(`/upload/${id}`)
  },

  async getMediaList(params?: MediaListParams): Promise<PaginatedResponse<UploadResult>> {
    const response = await api.get<ApiResponse<PaginatedResponse<UploadResult>>>('/upload/list', {
      params,
    })
    return response.data.data
  },
}
