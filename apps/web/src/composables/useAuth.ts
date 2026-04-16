import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { User } from '@/types/auth.types'

export function useAuth() {
  const router = useRouter()
  const authStore = useAuthStore()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isLoggedIn = computed(() => authStore.isLoggedIn)
  const user = computed(() => authStore.user)

  async function login(email: string, password: string) {
    loading.value = true
    error.value = null
    try {
      await authStore.login(email, password)
      router.push({ name: 'dashboard' })
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : '登录失败，请检查邮箱和密码'
      error.value = message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function register(email: string, password: string, username: string) {
    loading.value = true
    error.value = null
    try {
      await authStore.register(email, password, username)
      router.push({ name: 'login' })
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : '注册失败，请稍后重试'
      error.value = message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    authStore.logout()
    router.push({ name: 'login' })
  }

  async function getProfile(): Promise<User | null> {
    if (!authStore.isLoggedIn) return null
    try {
      await authStore.fetchProfile()
      return authStore.user
    } catch {
      return null
    }
  }

  return {
    isLoggedIn,
    user,
    loading,
    error,
    login,
    register,
    logout,
    getProfile,
  }
}
