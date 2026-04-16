export const Platform = {
  WECHAT: 'wechat',
  WEIBO: 'weibo',
  DOUYIN: 'douyin',
  XIAOHONGSHU: 'xiaohongshu',
  TOUTIAO: 'toutiao',
  ZHIHU: 'zhihu',
  BILIBILI: 'bilibili',
} as const

export type Platform = (typeof Platform)[keyof typeof Platform]

export const AuthStatus = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  EXPIRED: 'expired',
} as const

export type AuthStatus = (typeof AuthStatus)[keyof typeof AuthStatus]

export interface Account {
  id: string
  platform: Platform
  platformName: string
  platformUserId: string
  platformUsername: string
  avatar?: string
  authStatus: AuthStatus
  userId: string
  createdAt: string
  updatedAt: string
}
