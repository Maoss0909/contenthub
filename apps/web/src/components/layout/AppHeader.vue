<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Search, Sun, Moon, Bell, User, Settings, LogOut, ChevronRight } from 'lucide-vue-next'
import { useTheme } from '@/composables/useTheme'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const { isDark, toggleTheme } = useTheme()
const authStore = useAuthStore()

const searchQuery = ref('')
const showUserMenu = ref(false)

const breadcrumbs = computed(() => {
  const crumbs: { name: string; path?: string }[] = [{ name: '首页' }]
  const current = route
  if (current.meta.title) {
    crumbs.push({ name: current.meta.title as string })
  }
  return crumbs
})

function handleLogout() {
  showUserMenu.value = false
  authStore.logout()
  router.push({ name: 'login' })
}

function closeUserMenu() {
  showUserMenu.value = false
}
</script>

<template>
  <header
    class="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-md transition-all duration-200"
  >
    <!-- Left: Breadcrumbs -->
    <div class="flex items-center gap-2">
      <nav class="flex items-center gap-1 text-sm">
        <template v-for="(crumb, index) in breadcrumbs" :key="index">
          <ChevronRight
            v-if="index > 0"
            class="h-4 w-4 text-muted-foreground"
          />
          <span
            v-if="index === breadcrumbs.length - 1"
            class="font-medium text-foreground"
          >
            {{ crumb.name }}
          </span>
          <span v-else class="text-muted-foreground">{{ crumb.name }}</span>
        </template>
      </nav>
    </div>

    <!-- Right: Actions -->
    <div class="flex items-center gap-2">
      <!-- Search -->
      <div class="relative hidden md:block">
        <Search
          class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索..."
          class="flex h-9 w-56 rounded-lg border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200"
        />
      </div>

      <!-- Theme toggle -->
      <button
        class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-accent-foreground cursor-pointer"
        title="切换主题"
        @click="toggleTheme"
      >
        <Sun v-if="isDark" class="h-5 w-5" />
        <Moon v-else class="h-5 w-5" />
      </button>

      <!-- Notifications -->
      <button
        class="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-accent-foreground cursor-pointer"
        title="通知"
      >
        <Bell class="h-5 w-5" />
        <span class="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
      </button>

      <!-- User dropdown -->
      <div class="relative">
        <button
          class="flex h-9 items-center gap-2 rounded-lg px-2 transition-all duration-200 hover:bg-accent cursor-pointer"
          @click="showUserMenu = !showUserMenu"
        >
          <div
            class="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium"
          >
            {{ authStore.user?.name?.charAt(0)?.toUpperCase() || 'U' }}
          </div>
          <span class="hidden text-sm font-medium text-foreground md:inline-block">
            {{ authStore.user?.name || '用户' }}
          </span>
        </button>

        <!-- Dropdown menu -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="showUserMenu"
            class="absolute right-0 top-full mt-1 w-48 rounded-lg border border-border bg-popover p-1 shadow-lg"
          >
            <button
              class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-popover-foreground transition-all duration-200 hover:bg-accent cursor-pointer"
              @click="closeUserMenu"
            >
              <User class="h-4 w-4" />
              个人资料
            </button>
            <button
              class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-popover-foreground transition-all duration-200 hover:bg-accent cursor-pointer"
              @click="closeUserMenu"
            >
              <Settings class="h-4 w-4" />
              设置
            </button>
            <div class="my-1 h-px bg-border" />
            <button
              class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive transition-all duration-200 hover:bg-destructive/10 cursor-pointer"
              @click="handleLogout"
            >
              <LogOut class="h-4 w-4" />
              退出登录
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </header>

  <!-- Click outside to close user menu -->
  <Teleport to="body">
    <div
      v-if="showUserMenu"
      class="fixed inset-0 z-40"
      @click="showUserMenu = false"
    />
  </Teleport>
</template>
