import type { AuthStatus } from '@/types/account.types'

const platformConfig: Record<
  string,
  { name: string; color: string; icon: string }
> = {
  wechat: {
    name: '微信公众号',
    color: '#07C160',
    icon: 'W',
  },
  weibo: {
    name: '微博',
    color: '#E6162D',
    icon: 'W',
  },
  douyin: {
    name: '抖音',
    color: '#161823',
    icon: 'D',
  },
  xiaohongshu: {
    name: '小红书',
    color: '#FE2C55',
    icon: 'X',
  },
  toutiao: {
    name: '今日头条',
    color: '#F85959',
    icon: 'T',
  },
  zhihu: {
    name: '知乎',
    color: '#0066FF',
    icon: 'Z',
  },
  bilibili: {
    name: '哔哩哔哩',
    color: '#00A1D6',
    icon: 'B',
  },
}

export function getPlatformIcon(platform: string): string {
  return platformConfig[platform]?.icon ?? '?'
}

export function getPlatformColor(platform: string): string {
  return platformConfig[platform]?.color ?? '#6B7280'
}

export function getPlatformName(platform: string): string {
  return platformConfig[platform]?.name ?? platform
}

export function getAuthStatusText(status: AuthStatus): string {
  const map: Record<string, string> = {
    connected: '已授权',
    disconnected: '已断开',
    expired: '已过期',
  }
  return map[status] ?? '未知'
}

export function getAuthStatusColor(status: AuthStatus): string {
  const map: Record<string, string> = {
    connected: 'bg-green-500',
    disconnected: 'bg-gray-400',
    expired: 'bg-red-500',
  }
  return map[status] ?? 'bg-gray-400'
}
