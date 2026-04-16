<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  RotateCcw,
  XCircle,
  Loader2,
  AlertCircle,
  Calendar,
  Clock,
  User,
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import PublishStatusBadge from '@/components/publish/PublishStatusBadge.vue'
import PublishPreview from '@/components/publish/PublishPreview.vue'
import { usePublishStore } from '@/stores/publish'
import { getPlatformIcon, getPlatformColor, getPlatformName } from '@/composables/usePlatform'

const route = useRoute()
const router = useRouter()
const store = usePublishStore()

const taskId = route.params.id as string

const canRetry = computed(() => {
  return store.currentTask?.status === 'failed'
})

const canCancel = computed(() => {
  return store.currentTask?.status === 'pending'
})

function goBack() {
  router.push('/publish/history')
}

async function handleRetry() {
  try {
    await store.retryTask(taskId)
  } catch {
    // Error handled by store
  }
}

async function handleCancel() {
  try {
    await store.cancelTask(taskId)
  } catch {
    // Error handled by store
  }
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
    second: '2-digit',
  })
}

onMounted(() => {
  store.fetchTaskById(taskId)
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-4">
      <Button
        variant="ghost"
        size="sm"
        class="cursor-pointer"
        @click="goBack"
      >
        <ArrowLeft class="mr-1 h-4 w-4" />
        返回
      </Button>
      <div>
        <h1 class="text-2xl font-bold text-foreground">发布详情</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          查看发布任务的详细信息和日志
        </p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="store.loading" class="space-y-6">
      <Skeleton class="h-48 w-full" />
      <Skeleton class="h-64 w-full" />
    </div>

    <!-- Error State -->
    <div
      v-else-if="store.error && !store.currentTask"
      class="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16"
    >
      <AlertCircle class="h-12 w-12 text-muted-foreground" />
      <p class="mt-4 text-lg font-semibold text-foreground">加载失败</p>
      <p class="mt-1 text-sm text-muted-foreground">{{ store.error }}</p>
      <Button variant="outline" class="mt-4 cursor-pointer" @click="store.fetchTaskById(taskId)">
        重试
      </Button>
    </div>

    <!-- Content -->
    <template v-else-if="store.currentTask">
      <div class="grid gap-6 lg:grid-cols-3">
        <!-- Main Info Card -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Task Info -->
          <Card>
            <CardHeader>
              <CardTitle class="text-base">任务信息</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <!-- Content ID -->
              <div class="flex items-start gap-3">
                <span class="text-sm text-muted-foreground w-20 shrink-0">内容ID</span>
                <span class="text-sm font-medium text-foreground">{{ store.currentTask.contentId }}</span>
              </div>

              <!-- Platform -->
              <div class="flex items-center gap-3">
                <span class="text-sm text-muted-foreground w-20 shrink-0">目标平台</span>
                <div class="flex items-center gap-2">
                  <div
                    class="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white"
                    :style="{ backgroundColor: getPlatformColor(store.currentTask.platform) }"
                  >
                    {{ getPlatformIcon(store.currentTask.platform) }}
                  </div>
                  <span class="text-sm font-medium text-foreground">
                    {{ getPlatformName(store.currentTask.platform) }}
                  </span>
                </div>
              </div>

              <!-- Account -->
              <div class="flex items-center gap-3">
                <span class="text-sm text-muted-foreground w-20 shrink-0">账号</span>
                <div class="flex items-center gap-1.5">
                  <User class="h-4 w-4 text-muted-foreground" />
                  <span class="text-sm text-foreground">{{ store.currentTask.accountId }}</span>
                </div>
              </div>

              <!-- Status -->
              <div class="flex items-center gap-3">
                <span class="text-sm text-muted-foreground w-20 shrink-0">状态</span>
                <PublishStatusBadge :status="store.currentTask.status" />
              </div>

              <!-- Created At -->
              <div class="flex items-center gap-3">
                <span class="text-sm text-muted-foreground w-20 shrink-0">创建时间</span>
                <div class="flex items-center gap-1.5">
                  <Clock class="h-4 w-4 text-muted-foreground" />
                  <span class="text-sm text-foreground">{{ formatDate(store.currentTask.createdAt) }}</span>
                </div>
              </div>

              <!-- Published At -->
              <div v-if="store.currentTask.publishedAt" class="flex items-center gap-3">
                <span class="text-sm text-muted-foreground w-20 shrink-0">发布时间</span>
                <div class="flex items-center gap-1.5">
                  <Calendar class="h-4 w-4 text-muted-foreground" />
                  <span class="text-sm text-foreground">{{ formatDate(store.currentTask.publishedAt) }}</span>
                </div>
              </div>

              <!-- Scheduled At -->
              <div v-if="store.currentTask.scheduledAt" class="flex items-center gap-3">
                <span class="text-sm text-muted-foreground w-20 shrink-0">定时发布</span>
                <div class="flex items-center gap-1.5">
                  <Calendar class="h-4 w-4 text-muted-foreground" />
                  <span class="text-sm text-foreground">{{ formatDate(store.currentTask.scheduledAt) }}</span>
                </div>
              </div>

              <!-- Error Message -->
              <div
                v-if="store.currentTask.errorMessage"
                class="flex items-start gap-3"
              >
                <span class="text-sm text-muted-foreground w-20 shrink-0">失败原因</span>
                <div class="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950">
                  <AlertCircle class="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                  <span class="text-sm text-red-700 dark:text-red-300">
                    {{ store.currentTask.errorMessage }}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Preview -->
          <Card>
            <CardHeader>
              <CardTitle class="text-base">内容预览</CardTitle>
            </CardHeader>
            <CardContent>
              <PublishPreview
                :content-id="store.currentTask.contentId"
                :platform="store.currentTask.platform"
              />
            </CardContent>
          </Card>
        </div>

        <!-- Sidebar Actions -->
        <div class="space-y-4">
          <!-- Status Card -->
          <Card>
            <CardContent class="flex flex-col items-center gap-3 p-6">
              <div class="text-center">
                <p class="text-sm text-muted-foreground mb-2">当前状态</p>
                <div class="flex justify-center">
                  <PublishStatusBadge :status="store.currentTask.status" />
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="w-full space-y-2 pt-2">
                <Button
                  v-if="canRetry"
                  variant="outline"
                  class="w-full cursor-pointer"
                  :disabled="store.loading"
                  @click="handleRetry"
                >
                  <Loader2 v-if="store.loading" class="mr-2 h-4 w-4 animate-spin" />
                  <RotateCcw v-else class="mr-2 h-4 w-4" />
                  重试发布
                </Button>
                <Button
                  v-if="canCancel"
                  variant="destructive"
                  class="w-full cursor-pointer"
                  :disabled="store.loading"
                  @click="handleCancel"
                >
                  <Loader2 v-if="store.loading" class="mr-2 h-4 w-4 animate-spin" />
                  <XCircle v-else class="mr-2 h-4 w-4" />
                  取消发布
                </Button>
              </div>
            </CardContent>
          </Card>

          <!-- Task ID -->
          <Card>
            <CardContent class="p-4">
              <p class="text-xs text-muted-foreground">任务 ID</p>
              <p class="mt-1 break-all text-sm font-mono text-foreground">
                {{ store.currentTask.id }}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </template>
  </div>
</template>
