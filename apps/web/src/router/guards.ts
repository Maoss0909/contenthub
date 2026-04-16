import type { Router } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export function setupRouterGuards(router: Router) {
  router.beforeEach((to, _from, next) => {
    const authStore = useAuthStore()

    const isPublic = to.meta.public === true

    if (!isPublic && !authStore.isLoggedIn) {
      return next({ name: 'login', query: { redirect: to.fullPath } })
    }

    if (authStore.isLoggedIn && (to.name === 'login' || to.name === 'register')) {
      return next({ name: 'dashboard' })
    }

    next()
  })
}
