<script setup lang="ts">
import { RefreshCw, Unlink } from 'lucide-vue-next'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import PlatformIcon from './PlatformIcon.vue'
import {
  getPlatformName,
  getAuthStatusText,
  getAuthStatusColor,
} from '@/composables/usePlatform'
import type { Account } from '@/types/account.types'
import { format } from 'date-fns'

const props = defineProps<{
  account: Account
}>()

const emit = defineEmits<{
  refresh: [id: string]
  unbind: [id: string]
}>()

function handleRefresh() {
  emit('refresh', props.account.id)
}

function handleUnbind() {
  emit('unbind', props.account.id)
}
</script>

<template>
  <Card class="transition-shadow hover:shadow-md">
    <CardContent class="p-4">
      <div class="flex items-start gap-3">
        <!-- 平台图标 -->
        <PlatformIcon :platform="account.platform" :size="40" />

        <!-- 账号信息 -->
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <span class="font-medium text-foreground">
              {{ getPlatformName(account.platform) }}
            </span>
            <div class="flex items-center gap-1.5">
              <span
                class="inline-block h-2 w-2 rounded-full"
                :class="getAuthStatusColor(account.authStatus)"
              />
              <Badge variant="secondary" class="text-xs">
                {{ getAuthStatusText(account.authStatus) }}
              </Badge>
            </div>
          </div>

          <div class="mt-1 flex items-center gap-2">
            <Avatar class="h-6 w-6">
              <AvatarImage
                v-if="account.avatar"
                :src="account.avatar"
                :alt="account.platformUsername"
              />
              <AvatarFallback class="text-xs">
                {{ (account.platformUsername || '?')[0].toUpperCase() }}
              </AvatarFallback>
            </Avatar>
            <span class="truncate text-sm text-muted-foreground">
              {{ account.platformUsername || '未设置昵称' }}
            </span>
          </div>

          <p v-if="account.createdAt" class="mt-2 text-xs text-muted-foreground">
            绑定时间: {{ format(new Date(account.createdAt), 'yyyy-MM-dd HH:mm') }}
          </p>
        </div>

        <!-- 操作按钮 -->
        <div class="flex flex-col gap-1">
          <Button
            variant="ghost"
            size="icon"
            class="h-8 w-8 cursor-pointer"
            title="刷新Token"
            @click="handleRefresh"
          >
            <RefreshCw class="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            class="h-8 w-8 cursor-pointer text-destructive hover:text-destructive"
            title="解绑账号"
            @click="handleUnbind"
          >
            <Unlink class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
