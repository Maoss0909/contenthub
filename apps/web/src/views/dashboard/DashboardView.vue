<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FileText, Send, Link2, Calendar, ArrowRight } from 'lucide-vue-next'
import StatsCard from '@/components/common/StatsCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const loading = ref(true)

const stats = ref([
  {
    title: '总内容数',
    value: 128,
    icon: FileText,
    trend: 'up' as const,
    trendValue: '+12.5%',
    color: 'blue' as const,
  },
  {
    title: '已发布数',
    value: 96,
    icon: Send,
    trend: 'up' as const,
    trendValue: '+8.3%',
    color: 'green' as const,
  },
  {
    title: '已绑定账号',
    value: 5,
    icon: Link2,
    trend: 'neutral' as const,
    trendValue: '0%',
    color: 'purple' as const,
  },
  {
    title: '本月发布',
    value: 23,
    icon: Calendar,
    trend: 'up' as const,
    trendValue: '+15.2%',
    color: 'orange' as const,
  },
])

const recentPublishes = ref([
  { id: '1', title: '2024年度技术趋势分析', platform: '微信公众号', status: 'success', time: '2小时前' },
  { id: '2', title: 'Vue 3.5 新特性详解', platform: '知乎', status: 'success', time: '5小时前' },
  { id: '3', title: '前端工程化实践指南', platform: '掘金', status: 'pending', time: '昨天' },
  { id: '4', title: 'TypeScript 高级类型技巧', platform: '小红书', status: 'failed', time: '昨天' },
  { id: '5', title: '微前端架构最佳实践', platform: '微博', status: 'success', time: '2天前' },
])

const platformAccounts = ref([
  { platform: '微信公众号', status: 'connected', color: 'bg-green-500' },
  { platform: '知乎', status: 'connected', color: 'bg-green-500' },
  { platform: '小红书', status: 'expired', color: 'bg-yellow-500' },
  { platform: '微博', status: 'connected', color: 'bg-green-500' },
  { platform: '抖音', status: 'disconnected', color: 'bg-gray-400' },
  { platform: '哔哩哔哩', status: 'disconnected', color: 'bg-gray-400' },
])

const statusMap: Record<string, { label: string; class: string }> = {
  success: { label: '成功', class: 'text-green-500 bg-green-500/10' },
  pending: { label: '等待中', class: 'text-yellow-500 bg-yellow-500/10' },
  failed: { label: '失败', class: 'text-destructive bg-destructive/10' },
}

const accountStatusMap: Record<string, string> = {
  connected: '已连接',
  expired: '已过期',
  disconnected: '未连接',
}

onMounted(() => {
  // Simulate loading
  setTimeout(() => {
    loading.value = false
  }, 800)
})
</script>

<template>
  <div class="space-y-6">
    <!-- Page title -->
    <div>
      <h1 class="text-2xl font-bold text-foreground">仪表盘</h1>
      <p class="mt-1 text-sm text-muted-foreground">
        欢迎回来，这里是您的数据概览
      </p>
    </div>

    <!-- Stats cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div v-if="loading" v-for="i in 4" :key="i" class="rounded-xl border border-border bg-card p-5">
        <div class="animate-pulse space-y-3">
          <div class="h-4 w-20 rounded bg-muted" />
          <div class="h-8 w-16 rounded bg-muted" />
          <div class="h-3 w-24 rounded bg-muted" />
        </div>
      </div>
      <StatsCard
        v-for="stat in stats"
        v-else
        :key="stat.title"
        :title="stat.title"
        :value="stat.value"
        :icon="stat.icon"
        :trend="stat.trend"
        :trend-value="stat.trendValue"
        :color="stat.color"
      />
    </div>

    <!-- Bottom section -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <!-- Recent publishes -->
      <div class="rounded-xl border border-border bg-card">
        <div class="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 class="text-base font-semibold text-card-foreground">最近发布</h2>
          <router-link
            to="/publish/history"
            class="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors duration-200 cursor-pointer"
          >
            查看全部
            <ArrowRight class="h-4 w-4" />
          </router-link>
        </div>
        <div v-if="loading" class="divide-y divide-border">
          <div v-for="i in 5" :key="i" class="flex items-center gap-4 px-5 py-3">
            <div class="animate-pulse flex-1 space-y-2">
              <div class="h-4 w-3/4 rounded bg-muted" />
              <div class="h-3 w-1/2 rounded bg-muted" />
            </div>
          </div>
        </div>
        <div v-else-if="recentPublishes.length === 0">
          <EmptyState
            :icon="Send"
            title="暂无发布记录"
            description="开始创建内容并发布到各大平台"
            action-text="创建内容"
            action-url="/contents/create"
          />
        </div>
        <div v-else class="divide-y divide-border">
          <div
            v-for="item in recentPublishes"
            :key="item.id"
            class="flex items-center justify-between px-5 py-3 transition-colors duration-200 hover:bg-muted/50"
          >
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-card-foreground">
                {{ item.title }}
              </p>
              <p class="mt-0.5 text-xs text-muted-foreground">
                {{ item.platform }} · {{ item.time }}
              </p>
            </div>
            <span
              class="ml-4 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
              :class="statusMap[item.status]?.class"
            >
              {{ statusMap[item.status]?.label }}
            </span>
          </div>
        </div>
      </div>

      <!-- Platform accounts -->
      <div class="rounded-xl border border-border bg-card">
        <div class="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 class="text-base font-semibold text-card-foreground">账号授权状态</h2>
          <router-link
            to="/accounts"
            class="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors duration-200 cursor-pointer"
          >
            管理账号
            <ArrowRight class="h-4 w-4" />
          </router-link>
        </div>
        <div v-if="loading" class="divide-y divide-border">
          <div v-for="i in 6" :key="i" class="flex items-center gap-4 px-5 py-3">
            <div class="animate-pulse flex-1 space-y-2">
              <div class="h-4 w-24 rounded bg-muted" />
            </div>
          </div>
        </div>
        <div v-else class="divide-y divide-border">
          <div
            v-for="account in platformAccounts"
            :key="account.platform"
            class="flex items-center justify-between px-5 py-3 transition-colors duration-200 hover:bg-muted/50"
          >
            <div class="flex items-center gap-3">
              <span
                class="h-2.5 w-2.5 rounded-full"
                :class="account.color"
              />
              <span class="text-sm text-card-foreground">{{ account.platform }}</span>
            </div>
            <span class="text-xs text-muted-foreground">
              {{ accountStatusMap[account.status] }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
