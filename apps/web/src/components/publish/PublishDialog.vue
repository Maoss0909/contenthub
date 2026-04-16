<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import PlatformSelector from './PlatformSelector.vue'
import { usePublish } from '@/composables/usePublish'
import { useAccountStore } from '@/stores/account'
import { getPlatformName, getPlatformColor, getPlatformIcon } from '@/composables/usePlatform'
import type { PreCheckResult } from '@/services/publish.service'
import { CheckCircle2, AlertCircle, Loader2, Send } from 'lucide-vue-next'

const props = defineProps<{
  open: boolean
  contentId: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const { createPublish, preCheck, loading, error } = usePublish()
const accountStore = useAccountStore()

const currentStep = ref(0)
const selectedAccountIds = ref<string[]>([])
const preCheckResults = ref<PreCheckResult[]>([])
const preCheckLoading = ref(false)
const publishSuccess = ref(false)

const steps = [
  { title: '选择平台', description: '选择要发布的平台账号' },
  { title: '预检结果', description: '检查内容是否符合平台要求' },
  { title: '确认发布', description: '确认发布信息并执行' },
]

const canGoNext = computed(() => {
  if (currentStep.value === 0) {
    return selectedAccountIds.value.length > 0
  }
  return true
})

const allPassed = computed(() => {
  if (preCheckResults.value.length === 0) return false
  return preCheckResults.value.every((r) => r.passed)
})

const selectedAccounts = computed(() => {
  return accountStore.accounts.filter((a) => selectedAccountIds.value.includes(a.id))
})

watch(
  () => props.open,
  (newOpen) => {
    if (newOpen) {
      currentStep.value = 0
      selectedAccountIds.value = []
      preCheckResults.value = []
      publishSuccess.value = false
    }
  },
)

async function goNext() {
  if (currentStep.value === 0) {
    // Run pre-check
    currentStep.value = 1
    preCheckLoading.value = true
    try {
      preCheckResults.value = await preCheck({
        contentId: props.contentId,
        accountIds: selectedAccountIds.value,
      })
    } catch {
      preCheckResults.value = []
    } finally {
      preCheckLoading.value = false
    }
  } else if (currentStep.value === 1) {
    currentStep.value = 2
  }
}

function goPrev() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

async function handlePublish() {
  try {
    await createPublish({
      contentId: props.contentId,
      platforms: selectedAccountIds.value.map((accountId) => ({
        accountId,
      })),
    })
    publishSuccess.value = true
  } catch {
    // Error is handled by the composable
  }
}

function handleClose() {
  emit('update:open', false)
}

function getAccountForResult(result: PreCheckResult) {
  return accountStore.accounts.find((a) => a.id === result.accountId)
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-w-lg">
      <DialogHeader>
        <DialogTitle>发布内容</DialogTitle>
        <DialogDescription>
          {{ steps[currentStep]?.description }}
        </DialogDescription>
      </DialogHeader>

      <!-- Step Indicator -->
      <div class="flex items-center gap-2 border-b border-border pb-4">
        <div
          v-for="(step, index) in steps"
          :key="index"
          class="flex items-center gap-2"
        >
          <div
            class="flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors"
            :class="{
              'bg-primary text-primary-foreground': index <= currentStep,
              'bg-muted text-muted-foreground': index > currentStep,
            }"
          >
            {{ index < currentStep ? '\u2713' : index + 1 }}
          </div>
          <span
            class="text-sm"
            :class="{
              'font-medium text-foreground': index === currentStep,
              'text-muted-foreground': index !== currentStep,
            }"
          >
            {{ step.title }}
          </span>
          <div
            v-if="index < steps.length - 1"
            class="h-px w-8 bg-border"
          />
        </div>
      </div>

      <!-- Step Content -->
      <div class="min-h-[300px]">
        <!-- Step 0: Platform Selector -->
        <div v-if="currentStep === 0">
          <PlatformSelector
            v-model="selectedAccountIds"
            :content-id="contentId"
          />
        </div>

        <!-- Step 1: Pre-check Results -->
        <div v-else-if="currentStep === 1" class="space-y-3">
          <!-- Loading -->
          <div
            v-if="preCheckLoading"
            class="flex flex-col items-center justify-center py-12"
          >
            <Loader2 class="h-8 w-8 animate-spin text-primary" />
            <span class="mt-2 text-sm text-muted-foreground">正在检查内容格式...</span>
          </div>

          <!-- Results -->
          <div v-else class="space-y-2">
            <div
              v-for="result in preCheckResults"
              :key="result.accountId"
              class="flex items-start gap-3 rounded-lg border p-3"
              :class="{
                'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950': result.passed,
                'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950': !result.passed,
              }"
            >
              <component
                :is="result.passed ? CheckCircle2 : AlertCircle"
                class="mt-0.5 h-5 w-5 shrink-0"
                :class="{
                  'text-green-600 dark:text-green-400': result.passed,
                  'text-red-600 dark:text-red-400': !result.passed,
                }"
              />
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <div
                    class="flex h-5 w-5 items-center justify-center rounded text-xs font-bold text-white"
                    :style="{ backgroundColor: getPlatformColor(result.platform) }"
                  >
                    {{ getPlatformIcon(result.platform) }}
                  </div>
                  <span class="text-sm font-medium text-foreground">
                    {{ getPlatformName(result.platform) }}
                  </span>
                  <Badge
                    :class="{
                      'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300': result.passed,
                      'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300': !result.passed,
                    }"
                  >
                    {{ result.passed ? '通过' : '不通过' }}
                  </Badge>
                </div>
                <p v-if="result.accountId" class="mt-1 text-xs text-muted-foreground">
                  {{ getAccountForResult(result)?.platformUsername || '' }}
                </p>
                <div v-if="result.errors && result.errors.length > 0" class="mt-2 space-y-1">
                  <p
                    v-for="(err, i) in result.errors"
                    :key="i"
                    class="text-xs text-red-600 dark:text-red-400"
                  >
                    {{ err }}
                  </p>
                </div>
                <div v-if="result.warnings && result.warnings.length > 0" class="mt-2 space-y-1">
                  <p
                    v-for="(warn, i) in result.warnings"
                    :key="i"
                    class="text-xs text-yellow-600 dark:text-yellow-400"
                  >
                    {{ warn }}
                  </p>
                </div>
              </div>
            </div>

            <!-- All passed summary -->
            <div
              v-if="preCheckResults.length > 0 && allPassed"
              class="rounded-lg border border-green-200 bg-green-50 p-3 text-center text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
            >
              所有平台检查通过，可以继续发布
            </div>
          </div>
        </div>

        <!-- Step 2: Confirm -->
        <div v-else-if="currentStep === 2" class="space-y-4">
          <!-- Success State -->
          <div
            v-if="publishSuccess"
            class="flex flex-col items-center justify-center py-8 text-center"
          >
            <div class="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle2 class="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 class="mt-4 text-lg font-semibold text-foreground">发布成功</h3>
            <p class="mt-1 text-sm text-muted-foreground">
              内容已成功提交到 {{ selectedAccounts.length }} 个平台
            </p>
          </div>

          <!-- Confirm Content -->
          <div v-else>
            <p class="mb-3 text-sm text-muted-foreground">
              即将发布内容到以下 {{ selectedAccounts.length }} 个平台：
            </p>
            <div class="space-y-2">
              <div
                v-for="account in selectedAccounts"
                :key="account.id"
                class="flex items-center gap-3 rounded-lg border border-border p-3"
              >
                <div
                  class="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white"
                  :style="{ backgroundColor: getPlatformColor(account.platform) }"
                >
                  {{ getPlatformIcon(account.platform) }}
                </div>
                <div>
                  <p class="text-sm font-medium text-foreground">
                    {{ getPlatformName(account.platform) }}
                  </p>
                  <p class="text-xs text-muted-foreground">
                    {{ account.platformUsername || account.platformUserId }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Error -->
            <div
              v-if="error"
              class="mt-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
            >
              <AlertCircle class="h-4 w-4 shrink-0" />
              {{ error }}
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <DialogFooter>
        <template v-if="!publishSuccess">
          <Button variant="outline" :disabled="currentStep === 0 || loading" @click="goPrev">
            上一步
          </Button>
          <Button
            v-if="currentStep < 2"
            :disabled="!canGoNext || preCheckLoading"
            @click="goNext"
          >
            下一步
          </Button>
          <Button
            v-else
            :disabled="loading"
            @click="handlePublish"
          >
            <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
            <Send v-else class="mr-2 h-4 w-4" />
            确认发布
          </Button>
        </template>
        <Button v-else @click="handleClose">
          完成
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
