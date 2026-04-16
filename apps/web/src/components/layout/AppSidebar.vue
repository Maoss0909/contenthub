<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import {
  LayoutDashboard,
  FileText,
  Send,
  Link2,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
} from 'lucide-vue-next'

const appStore = useAppStore()
const authStore = useAuthStore()
const router = useRouter()

const collapsed = computed(() => appStore.sidebarCollapsed)

const navItems = [
  { name: '仪表盘', icon: LayoutDashboard, route: '/dashboard' },
  { name: '内容管理', icon: FileText, route: '/contents' },
  { name: '发布记录', icon: Send, route: '/publish/history' },
  { name: '账号管理', icon: Link2, route: '/accounts' },
]

function toggleSidebar() {
  appStore.toggleSidebar()
}

function handleLogout() {
  authStore.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <aside
    class="flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200"
    :class="collapsed ? 'w-16' : 'w-60'"
  >
    <!-- Logo area -->
    <div
      class="flex h-14 items-center border-b border-sidebar-border px-4 transition-all duration-200"
    >
      <div class="flex items-center gap-2 overflow-hidden">
        <div
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm"
        >
          C
        </div>
        <span
          v-show="!collapsed"
          class="text-lg font-semibold text-sidebar-foreground whitespace-nowrap transition-opacity duration-200"
        >
          ContentHub
        </span>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto py-4 px-2">
      <ul class="space-y-1">
        <li v-for="item in navItems" :key="item.route">
          <router-link
            :to="item.route"
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer"
            :class="[
              collapsed ? 'justify-center' : '',
              $route.path.startsWith(item.route)
                ? 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground'
                : 'text-sidebar-foreground',
            ]"
            :title="collapsed ? item.name : undefined"
          >
            <component :is="item.icon" class="h-5 w-5 shrink-0" />
            <span
              v-show="!collapsed"
              class="whitespace-nowrap transition-opacity duration-200"
            >
              {{ item.name }}
            </span>
          </router-link>
        </li>
      </ul>
    </nav>

    <!-- Bottom area -->
    <div class="border-t border-sidebar-border p-2">
      <!-- Collapse toggle -->
      <button
        class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer"
        :class="collapsed ? 'justify-center' : ''"
        @click="toggleSidebar"
      >
        <PanelLeftClose v-if="!collapsed" class="h-5 w-5 shrink-0" />
        <PanelLeftOpen v-else class="h-5 w-5 shrink-0" />
        <span
          v-show="!collapsed"
          class="whitespace-nowrap transition-opacity duration-200"
        >
          收起菜单
        </span>
      </button>

      <!-- User info -->
      <div
        v-if="!collapsed && authStore.user"
        class="mt-1 flex items-center gap-3 rounded-lg px-3 py-2"
      >
        <div
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium"
        >
          {{ authStore.user.name?.charAt(0)?.toUpperCase() || 'U' }}
        </div>
        <div class="min-w-0 flex-1">
          <div class="truncate text-sm font-medium text-sidebar-foreground">
            {{ authStore.user.name }}
          </div>
          <div class="truncate text-xs text-muted-foreground">
            {{ authStore.user.email }}
          </div>
        </div>
      </div>

      <!-- Logout -->
      <button
        class="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive cursor-pointer"
        :class="collapsed ? 'justify-center' : ''"
        @click="handleLogout"
      >
        <LogOut class="h-5 w-5 shrink-0" />
        <span
          v-show="!collapsed"
          class="whitespace-nowrap transition-opacity duration-200"
        >
          退出登录
        </span>
      </button>
    </div>
  </aside>
</template>
