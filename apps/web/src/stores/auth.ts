import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/auth.service'
import type { User } from '@/types/auth.types'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('accessToken'))
  const refreshTokenValue = ref<string | null>(localStorage.getItem('refreshToken'))
  const user = ref<User | null>(null)

  const isLoggedIn = computed(() => !!token.value)

  function setTokens(accessToken: string, refreshToken: string) {
    token.value = accessToken
    refreshTokenValue.value = refreshToken
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
  }

  function clearTokens() {
    token.value = null
    refreshTokenValue.value = null
    user.value = null
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  async function login(email: string, password: string) {
    const response = await authService.login({ email, password })
    setTokens(response.accessToken, response.refreshToken)
    user.value = response.user
    return response
  }

  async function register(email: string, password: string, username: string) {
    const response = await authService.register({
      email,
      password,
      name: username,
    })
    setTokens(response.accessToken, response.refreshToken)
    user.value = response.user
    return response
  }

  async function fetchProfile() {
    try {
      const profile = await authService.getMe()
      user.value = profile
    } catch {
      clearTokens()
    }
  }

  function logout() {
    clearTokens()
  }

  return {
    token,
    refreshToken: refreshTokenValue,
    user,
    isLoggedIn,
    login,
    register,
    logout,
    fetchProfile,
    setTokens,
  }
})
