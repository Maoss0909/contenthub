<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Send, Eye, RotateCcw, X, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from '@/components/ui/table'
import EmptyState from '@/components/common/EmptyState.vue'
import PublishStatusBadge from '@/components/publish/PublishStatusBadge.vue'
import { usePublishStore } from '@/stores/publish'
import { getPlatformIcon, getPlatformColor, getPlatformName } from '@/composables/usePlatform'

const router = useRouter()
const store = usePublishStore()

const platformFilter = ref('')
const statusFilter = ref('')
const startDate = ref('')
const endDate = ref('')

const platformOptions = [
  { value: '', label: '全部平台' },
  { value: 'wechat', label: '微信公众号' },
  { value: 'weibo', label: '微博' },
  { value: 'douyin', label: '抖音' },
  { value: 'xiaohongshu', label: '小红书' },
  { value: 'toutiao', label: '今日头条' },
  { value: 'zhihu', label: '知乎' },
  { value: 'bilibili', label: '哔哩哔哩' },
]

const statusOptions = [
  { value: '', label: '全部状态' },
  { value: 'pending', label: '待发布' },
  { value: 'processing', label: '发布中' },
  { value: 'success', label: '已成功' },
  { value: 'failed', label: '已失败' },
  { value: 'cancelled', label: '已取消' },
  { value: 'partial', label: '部分成功' },
]

function loadTasks() {
  store.setFilters({
    platform: platformFilter.value,
    status: statusFilter.value,
    dateRange: {
      start: startDate.value,
      end: endDate.value,
    },
  })
  store.fetchTasks()
}

function goToDetail(id: string) {
  router.push(`/publish/history/${id}`)
}

async function handleRetry(id: string) {
  try {
    await store.retryTask(id)
    loadTasks()
  } catch {
    // Error handled by store
  }
}

async function handleCancel(id: string) {
  try {
    await store.cancelTask(id)
    loadTasks()
  } catch {
    // Error handled by store
  }
}

function goToPage(page: number) {
  store.setPage(page)
  store.fetchTasks()
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => {
  loadTasks()
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-foreground">发布记录</h1>
      <p class="mt-1 text-sm text-muted-foreground">
        查看所有内容的发布历史和状态
      </p>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap items-center gap-3">
      <!-- Platform Filter -->
      <select
        v-model="platformFilter"
        class="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        @change="loadTasks"
      >
        <option
          v-for="opt in platformOptions"
          :key="opt.value"
          :value="opt.value"
        >
          {{ opt.label }}
        </option>
      </select>

      <!-- Status Filter -->
      <select
        v-model="statusFilter"
        class="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        @change="loadTasks"
      >
        <option
          v-for="opt in statusOptions"
          :key="opt.value"
          :value="opt.value"
        >
          {{ opt.label }}
        </option>
      </select>

      <!-- Date Range -->
      <input
        v-model="startDate"
        type="date"
        placeholder="开始日期"
        class="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        @change="loadTasks"
      />
      <span class="text-sm text-muted-foreground">至</span>
      <input
        v-model="endDate"
        type="date"
        placeholder="结束日期"
        class="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        @change="loadTasks"
      />
    </div>

    <!-- Loading State -->
    <div v-if="store.loading && store.tasks.length === 0" class="space-y-4">
      <Skeleton class="h-10 w-full" />
      <Skeleton class="h-10 w-full" />
      <Skeleton class="h-10 w-full" />
      <Skeleton class="h-10 w-full" />
      <Skeleton class="h-10 w-full" />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!store.loading && store.tasks.length === 0"
      class="rounded-xl border border-border bg-card"
    >
      <EmptyState
        :icon="Send"
        title="暂无发布记录"
        description="还没有发布过任何内容，去编辑内容并发布吧"
        action-text="创建内容"
        action-url="/contents/create"
      />
    </div>

    <!-- Table -->
    <div v-else class="rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHeaderCell class="w-[30%]">内容标题</TableHeaderCell>
            <TableHeaderCell>目标平台</TableHeaderCell>
            <TableHeaderCell>账号名</TableHeaderCell>
            <TableHeaderCell>状态</TableHeaderCell>
            <TableHeaderCell>发布时间</TableHeaderCell>
            <TableHeaderCell class="text-right">操作</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="task in store.tasks" :key="task.id">
            <TableCell>
              <span class="text-sm font-medium text-foreground">
                {{ task.contentId }}
              </span>
            </TableCell>
            <TableCell>
              <div class="flex items-center gap-2">
                <div
                  class="flex h-6 w-6 items-center justify-center rounded text-xs font-bold text-white"
                  :style="{ backgroundColor: getPlatformColor(task.platform) }"
                >
                  {{ getPlatformIcon(task.platform) }}
                </div>
                <span class="text-sm text-foreground">
                  {{ getPlatformName(task.platform) }}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <span class="text-sm text-muted-foreground">
                {{ task.accountId }}
              </span>
            </TableCell>
            <TableCell>
              <PublishStatusBadge :status="task.status" />
            </TableCell>
            <TableCell>
              <span class="text-sm text-muted-foreground">
                {{ formatDate(task.publishedAt || task.createdAt) }}
              </span>
            </TableCell>
            <TableCell class="text-right">
              <div class="flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  class="h-8 w-8 p-0 cursor-pointer"
                  title="查看详情"
                  @click="goToDetail(task.id)"
                >
                  <Eye class="h-4 w-4" />
                </Button>
                <Button
                  v-if="task.status === 'failed'"
                  variant="ghost"
                  size="sm"
                  class="h-8 w-8 p-0 text-orange-600 hover:text-orange-700 cursor-pointer"
                  title="重试"
                  @click="handleRetry(task.id)"
                >
                  <RotateCcw class="h-4 w-4" />
                </Button>
                <Button
                  v-if="task.status === 'pending'"
                  variant="ghost"
                  size="sm"
                  class="h-8 w-8 p-0 text-red-600 hover:text-red-700 cursor-pointer"
                  title="取消"
                  @click="handleCancel(task.id)"
                >
                  <X class="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <!-- Pagination -->
      <div
        v-if="store.pagination.totalPages > 1"
        class="flex items-center justify-between border-t border-border px-4 py-3"
      >
        <span class="text-sm text-muted-foreground">
          共 {{ store.pagination.total }} 条记录，第 {{ store.pagination.page }} / {{ store.pagination.totalPages }} 页
        </span>
        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            :disabled="store.pagination.page <= 1"
            @click="goToPage(store.pagination.page - 1)"
          >
            <ChevronLeft class="h-4 w-4" />
            上一页
          </Button>
          <Button
            variant="outline"
            size="sm"
            :disabled="store.pagination.page >= store.pagination.totalPages"
            @click="goToPage(store.pagination.page + 1)"
          >
            下一页
            <ChevronRight class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
