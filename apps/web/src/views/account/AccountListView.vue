<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, Link2 } from 'lucide-vue-next'
import { useAccountStore } from '@/stores/account'
import AccountCard from '@/components/account/AccountCard.vue'
import BindAccountDialog from '@/components/account/BindAccountDialog.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'vue-sonner'

const accountStore = useAccountStore()
const dialogOpen = ref(false)

onMounted(async () => {
  await Promise.all([
    accountStore.fetchAccounts(),
    accountStore.fetchPlatforms(),
  ])
})

async function handleRefresh(id: string) {
  try {
    await accountStore.refreshAccountToken(id)
    toast.success('Token 刷新成功')
  } catch {
    toast.error('Token 刷新失败')
  }
}

async function handleUnbind(id: string) {
  try {
    await accountStore.unbindAccount(id)
    toast.success('账号已解绑')
  } catch {
    toast.error('解绑失败')
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- 顶部标题栏 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-foreground">账号管理</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          管理您绑定的各平台账号
        </p>
      </div>
      <Button class="cursor-pointer" @click="dialogOpen = true">
        <Plus class="mr-2 h-4 w-4" />
        绑定账号
      </Button>
    </div>

    <!-- 加载状态 -->
    <div
      v-if="accountStore.loading"
      class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
    >
      <div v-for="i in 3" :key="i" class="rounded-xl border p-4">
        <div class="flex items-start gap-3">
          <Skeleton class="h-10 w-10 rounded-full" />
          <div class="flex-1 space-y-2">
            <Skeleton class="h-4 w-24" />
            <Skeleton class="h-3 w-32" />
            <Skeleton class="h-3 w-20" />
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div
      v-else-if="accountStore.accounts.length === 0"
      class="rounded-xl border border-border bg-card"
    >
      <EmptyState
        :icon="Link2"
        title="暂无绑定账号"
        description="绑定您的第一个平台账号，开始多平台内容发布"
        action-text="绑定账号"
        action-url=""
        @action-click="dialogOpen = true"
      />
    </div>

    <!-- 账号卡片网格 -->
    <div
      v-else
      class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
    >
      <AccountCard
        v-for="account in accountStore.accounts"
        :key="account.id"
        :account="account"
        @refresh="handleRefresh"
        @unbind="handleUnbind"
      />
    </div>

    <!-- 绑定账号弹窗 -->
    <BindAccountDialog :open="dialogOpen" :on-open-change="(v: boolean) => (dialogOpen = v)" />
  </div>
</template>
