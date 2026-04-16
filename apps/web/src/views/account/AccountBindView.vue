<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CheckCircle, XCircle, ArrowLeft, RefreshCw } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import accountService from '@/services/account.service'
import type { Platform } from '@/types/account.types'

const route = useRoute()
const router = useRouter()

const status = ref<'loading' | 'success' | 'error'>('loading')
const errorMessage = ref('')

onMounted(async () => {
  const platform = route.params.platform as Platform
  const code = route.query.code as string
  const state = route.query.state as string

  if (!code || !state) {
    status.value = 'error'
    errorMessage.value = '缺少必要的授权参数 (code 或 state)'
    return
  }

  try {
    await accountService.handleCallback(platform, code, state)
    status.value = 'success'
    setTimeout(() => {
      router.push({ name: 'account-list' })
    }, 2000)
  } catch (err: unknown) {
    status.value = 'error'
    errorMessage.value =
      err instanceof Error ? err.message : '授权回调处理失败，请重试'
  }
})

function handleRetry() {
  router.go(0)
}

function handleBack() {
  router.push({ name: 'account-list' })
}
</script>

<template>
  <div class="flex min-h-[60vh] items-center justify-center">
    <div class="text-center">
      <!-- 加载状态 -->
      <div v-if="status === 'loading'" class="space-y-4">
        <div class="mx-auto flex h-16 w-16 items-center justify-center">
          <RefreshCw class="h-8 w-8 animate-spin text-primary" />
        </div>
        <h2 class="text-xl font-semibold text-foreground">正在处理授权...</h2>
        <p class="text-sm text-muted-foreground">
          请稍候，正在完成平台账号绑定
        </p>
      </div>

      <!-- 成功状态 -->
      <div v-else-if="status === 'success'" class="space-y-4">
        <div
          class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30"
        >
          <CheckCircle class="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 class="text-xl font-semibold text-foreground">绑定成功</h2>
        <p class="text-sm text-muted-foreground">
          平台账号已成功绑定，即将跳转到账号管理页面...
        </p>
      </div>

      <!-- 错误状态 -->
      <div v-else class="space-y-4">
        <div
          class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30"
        >
          <XCircle class="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 class="text-xl font-semibold text-foreground">绑定失败</h2>
        <p class="max-w-sm text-sm text-muted-foreground">
          {{ errorMessage }}
        </p>
        <div class="flex items-center justify-center gap-3">
          <Button variant="outline" class="cursor-pointer" @click="handleBack">
            <ArrowLeft class="mr-2 h-4 w-4" />
            返回
          </Button>
          <Button class="cursor-pointer" @click="handleRetry">
            <RefreshCw class="mr-2 h-4 w-4" />
            重试
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
