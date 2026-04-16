<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAccountStore } from '@/stores/account'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { getPlatformIcon, getPlatformColor, getPlatformName, getAuthStatusText } from '@/composables/usePlatform'
import type { AuthStatus } from '@/types/account.types'

const props = defineProps<{
  modelValue: string[]
  contentId: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const router = useRouter()
const accountStore = useAccountStore()

onMounted(() => {
  if (accountStore.accounts.length === 0) {
    accountStore.fetchAccounts()
  }
})

const authorizedAccounts = computed(() => {
  return accountStore.accounts.filter((a) => a.authStatus === 'connected')
})

const allAuthorizedIds = computed(() => {
  return authorizedAccounts.value.map((a) => a.id)
})

const isAllSelected = computed(() => {
  if (authorizedAccounts.value.length === 0) return false
  return allAuthorizedIds.value.every((id) => props.modelValue.includes(id))
})

const isIndeterminate = computed(() => {
  const selectedCount = props.modelValue.filter((id) =>
    allAuthorizedIds.value.includes(id),
  ).length
  return selectedCount > 0 && selectedCount < authorizedAccounts.value.length
})

function toggleAll() {
  if (isAllSelected.value) {
    emit('update:modelValue', [])
  } else {
    emit('update:modelValue', [...allAuthorizedIds.value])
  }
}

function toggleAccount(accountId: string) {
  const newValue = [...props.modelValue]
  const index = newValue.indexOf(accountId)
  if (index === -1) {
    newValue.push(accountId)
  } else {
    newValue.splice(index, 1)
  }
  emit('update:modelValue', newValue)
}

function goToBind() {
  router.push('/accounts')
}
</script>

<template>
  <div class="space-y-3">
    <!-- Select All -->
    <div
      v-if="authorizedAccounts.length > 0"
      class="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2"
    >
      <Checkbox
        :checked="isAllSelected || isIndeterminate"
        @update:checked="toggleAll"
      />
      <span class="text-sm font-medium text-foreground">
        全选 ({{ authorizedAccounts.length }} 个已授权账号)
      </span>
    </div>

    <!-- Account List -->
    <div class="space-y-2">
      <Card
        v-for="account in accountStore.accounts"
        :key="account.id"
        class="transition-colors"
        :class="{
          'opacity-50': account.authStatus !== 'connected',
        }"
      >
        <CardContent class="flex items-center gap-3 p-3">
          <!-- Platform Icon -->
          <div
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
            :style="{ backgroundColor: getPlatformColor(account.platform) }"
          >
            {{ getPlatformIcon(account.platform) }}
          </div>

          <!-- Account Info -->
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-foreground">
                {{ getPlatformName(account.platform) }}
              </span>
              <span
                class="inline-flex items-center rounded-full px-1.5 py-0.5 text-xs"
                :class="{
                  'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300': account.authStatus === 'connected',
                  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300': account.authStatus === 'expired',
                  'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300': account.authStatus !== 'connected' && account.authStatus !== 'expired',
                }"
              >
                {{ getAuthStatusText(account.authStatus as AuthStatus) }}
              </span>
            </div>
            <p class="truncate text-xs text-muted-foreground">
              {{ account.platformUsername || account.platformUserId }}
            </p>
          </div>

          <!-- Action -->
          <div v-if="account.authStatus === 'connected'" class="shrink-0">
            <Checkbox
              :checked="modelValue.includes(account.id)"
              @update:checked="toggleAccount(account.id)"
            />
          </div>
          <div v-else class="shrink-0">
            <button
              class="text-xs font-medium text-primary hover:text-primary/80 cursor-pointer"
              @click="goToBind"
            >
              去绑定
            </button>
          </div>
        </CardContent>
      </Card>

      <!-- Empty State -->
      <div
        v-if="accountStore.accounts.length === 0 && !accountStore.loading"
        class="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-8 text-center"
      >
        <p class="text-sm text-muted-foreground">暂无已绑定的平台账号</p>
        <button
          class="mt-2 text-sm font-medium text-primary hover:text-primary/80 cursor-pointer"
          @click="goToBind"
        >
          前往绑定账号
        </button>
      </div>

      <!-- Loading State -->
      <div
        v-if="accountStore.loading"
        class="flex items-center justify-center py-4"
      >
        <div class="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span class="ml-2 text-sm text-muted-foreground">加载账号中...</span>
      </div>
    </div>
  </div>
</template>
