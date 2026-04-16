<script setup lang="ts">
import { ref, watch } from 'vue'
import { publishService, type PublishPreview } from '@/services/publish.service'
import { Skeleton } from '@/components/ui/skeleton'
import { getPlatformName } from '@/composables/usePlatform'
import { AlertCircle, CheckCircle2 } from 'lucide-vue-next'

const props = defineProps<{
  contentId: string
  platform: string
}>()

const preview = ref<PublishPreview | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

async function loadPreview() {
  if (!props.contentId || !props.platform) return
  loading.value = true
  error.value = null
  try {
    preview.value = await publishService.getPreview(props.contentId, props.platform)
  } catch (err: any) {
    error.value = err?.response?.data?.message || err?.message || '获取预览失败'
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.contentId, props.platform],
  () => {
    loadPreview()
  },
  { immediate: true },
)
</script>

<template>
  <div class="space-y-4">
    <!-- Platform Header -->
    <div class="flex items-center gap-2">
      <h4 class="text-sm font-medium text-foreground">
        {{ getPlatformName(platform) }} 预览
      </h4>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="space-y-3">
      <Skeleton class="h-5 w-3/4" />
      <Skeleton class="h-4 w-full" />
      <Skeleton class="h-4 w-full" />
      <Skeleton class="h-4 w-2/3" />
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
    >
      <AlertCircle class="h-4 w-4 shrink-0" />
      {{ error }}
    </div>

    <!-- Preview Content -->
    <div v-else-if="preview" class="space-y-3">
      <!-- Title -->
      <div>
        <p class="mb-1 text-xs font-medium text-muted-foreground">适配后标题</p>
        <p class="text-sm font-medium text-foreground">{{ preview.title }}</p>
      </div>

      <!-- Body -->
      <div>
        <p class="mb-1 text-xs font-medium text-muted-foreground">适配后内容</p>
        <div class="rounded-lg border border-border bg-muted/30 p-3">
          <p class="whitespace-pre-wrap text-sm text-foreground">{{ preview.body }}</p>
        </div>
      </div>

      <!-- Platform Rules -->
      <div v-if="preview.rules && preview.rules.length > 0" class="space-y-2">
        <p class="text-xs font-medium text-muted-foreground">平台格式规则</p>
        <div class="space-y-1.5">
          <div
            v-for="rule in preview.rules"
            :key="rule.label"
            class="flex items-center justify-between text-xs"
          >
            <span class="text-muted-foreground">{{ rule.label }}</span>
            <span
              class="flex items-center gap-1 font-medium"
              :class="{
                'text-green-600 dark:text-green-400': rule.limit && rule.current && rule.current <= rule.limit,
                'text-red-600 dark:text-red-400': rule.limit && rule.current && rule.current > rule.limit,
                'text-foreground': !rule.limit || !rule.current,
              }"
            >
              <CheckCircle2
                v-if="rule.limit && rule.current && rule.current <= rule.limit"
                class="h-3 w-3"
              />
              <AlertCircle
                v-if="rule.limit && rule.current && rule.current > rule.limit"
                class="h-3 w-3"
              />
              {{ rule.current ?? rule.value }}{{ rule.limit ? ` / ${rule.limit}` : '' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="flex items-center justify-center py-6 text-sm text-muted-foreground"
    >
      暂无预览数据
    </div>
  </div>
</template>
