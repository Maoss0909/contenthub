import { defineStore } from 'pinia'
import { ref } from 'vue'
import accountService from '@/services/account.service'
import type { Account, Platform } from '@/types/account.types'
import type { SupportedPlatform } from '@/services/account.service'

export const useAccountStore = defineStore('account', () => {
  const accounts = ref<Account[]>([])
  const platforms = ref<SupportedPlatform[]>([])
  const loading = ref(false)

  async function fetchAccounts() {
    loading.value = true
    try {
      accounts.value = await accountService.getAccounts()
    } finally {
      loading.value = false
    }
  }

  async function fetchPlatforms() {
    try {
      platforms.value = await accountService.getSupportedPlatforms()
    } catch {
      // 使用默认平台列表
      platforms.value = [
        {
          platform: 'wechat' as Platform,
          name: '微信公众号',
          description: '绑定微信公众号，实现内容同步发布',
          icon: 'wechat',
          color: '#07C160',
        },
        {
          platform: 'toutiao' as Platform,
          name: '今日头条',
          description: '绑定今日头条账号，扩展内容分发渠道',
          icon: 'toutiao',
          color: '#F85959',
        },
      ]
    }
  }

  async function bindPlatform(platform: Platform) {
    const { authUrl } = await accountService.bindAccount(platform)
    window.location.href = authUrl
  }

  async function unbindAccount(id: string) {
    await accountService.unbindAccount(id)
    accounts.value = accounts.value.filter((a) => a.id !== id)
  }

  async function refreshAccountToken(id: string) {
    const updated = await accountService.refreshAccountToken(id)
    const index = accounts.value.findIndex((a) => a.id === id)
    if (index !== -1) {
      accounts.value[index] = updated
    }
  }

  return {
    accounts,
    platforms,
    loading,
    fetchAccounts,
    fetchPlatforms,
    bindPlatform,
    unbindAccount,
    refreshAccountToken,
  }
})
