<script setup lang="ts">
import { computed } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import PlatformIcon from './PlatformIcon.vue'
import { getPlatformColor } from '@/composables/usePlatform'
import { useAccountStore } from '@/stores/account'
import type { SupportedPlatform } from '@/services/account.service'

const props = defineProps<{
  open: boolean
  onOpenChange: (open: boolean) => void
}>()

const accountStore = useAccountStore()

const supportedPlatforms = computed<SupportedPlatform[]>(() => {
  if (accountStore.platforms.length > 0) {
    return accountStore.platforms
  }
  return [
    {
      platform: 'wechat' as const,
      name: '微信公众号',
      description: '绑定微信公众号，实现内容同步发布',
      icon: 'wechat',
      color: '#07C160',
    },
    {
      platform: 'toutiao' as const,
      name: '今日头条',
      description: '绑定今日头条账号，扩展内容分发渠道',
      icon: 'toutiao',
      color: '#F85959',
    },
  ]
})

const boundPlatforms = computed(() => new Set(accountStore.accounts.map((a) => a.platform)))

async function handleBind(platform: string) {
  try {
    await accountStore.bindPlatform(platform as any)
  } catch {
    // 错误由拦截器处理
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="onOpenChange">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>绑定平台账号</DialogTitle>
        <DialogDescription>
          选择要绑定的内容平台，授权后即可同步发布内容
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-3 py-2">
        <div
          v-for="p in supportedPlatforms"
          :key="p.platform"
          class="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
        >
          <div class="flex items-center gap-3">
            <PlatformIcon :platform="p.platform" :size="36" />
            <div>
              <p class="font-medium text-foreground">{{ p.name }}</p>
              <p class="text-xs text-muted-foreground">{{ p.description }}</p>
            </div>
          </div>
          <Button
            v-if="boundPlatforms.has(p.platform)"
            variant="secondary"
            size="sm"
            disabled
            class="cursor-not-allowed"
          >
            已绑定
          </Button>
          <Button
            v-else
            size="sm"
            class="cursor-pointer"
            :style="{
              backgroundColor: getPlatformColor(p.platform),
              borderColor: getPlatformColor(p.platform),
            }"
            @click="handleBind(p.platform)"
          >
            绑定
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
