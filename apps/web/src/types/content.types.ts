export const ContentStatus = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  SCHEDULED: 'scheduled',
  ARCHIVED: 'archived',
} as const

export type ContentStatus = (typeof ContentStatus)[keyof typeof ContentStatus]

export interface Content {
  id: string
  title: string
  body: string
  status: ContentStatus
  summary?: string
  coverImage?: string
  tags: string[]
  authorId: string
  createdAt: string
  updatedAt: string
  publishedAt?: string
}

export interface CreateContentRequest {
  title: string
  body: string
  summary?: string
  coverImage?: string
  tags?: string[]
  status?: ContentStatus
}
