export const PublishStatus = {
  PENDING: 'pending',
  PUBLISHING: 'publishing',
  SUCCESS: 'success',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const

export type PublishStatus = (typeof PublishStatus)[keyof typeof PublishStatus]

export interface PublishTask {
  id: string
  contentId: string
  accountId: string
  platform: string
  status: PublishStatus
  scheduledAt?: string
  publishedAt?: string
  errorMessage?: string
  createdAt: string
  updatedAt: string
}

export interface CreatePublishRequest {
  contentId: string
  accountId: string
  scheduledAt?: string
}
