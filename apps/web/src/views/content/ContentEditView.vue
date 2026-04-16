<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { Save, Send, ImageIcon, X, Loader2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import TiptapEditor from '@/components/editor/TiptapEditor.vue'
import ImageUpload from '@/components/editor/ImageUpload.vue'
import PublishDialog from '@/components/publish/PublishDialog.vue'
import { contentService } from '@/services/content.service'
import { ContentStatus } from '@/types/content.types'

const route = useRoute()

const contentId = route.params.id as string
const loading = ref(true)
const title = ref('')
const body = ref('')
const coverImage = ref('')
const tags = ref<string[]>([])
const tagInput = ref('')
const saving = ref(false)
const publishing = ref(false)
const saveSuccess = ref(false)
const publishDialogOpen = ref(false)
let autoSaveTimer: ReturnType<typeof setTimeout> | null = null

async function loadContent() {
  loading.value = true
  try {
    const content = await contentService.getContent(contentId)
    title.value = content.title || ''
    body.value = content.body || ''
    coverImage.value = content.coverImage || ''
    tags.value = content.tags || []
  } catch (error) {
    console.error('Failed to load content:', error)
  } finally {
    loading.value = false
  }
}

async function saveContent(status = ContentStatus.DRAFT) {
  if (!title.value.trim() && !body.value.trim()) return

  saving.value = true
  try {
    const data = {
      title: title.value.trim(),
      body: body.value,
      coverImage: coverImage.value || undefined,
      tags: tags.value.length > 0 ? tags.value : undefined,
      status,
    }

    await contentService.updateContent(contentId, data)

    saveSuccess.value = true
    setTimeout(() => {
      saveSuccess.value = false
    }, 2000)
  } catch (error) {
    console.error('Failed to save content:', error)
  } finally {
    saving.value = false
  }
}

function handlePublishClick() {
  // Save content first before opening publish dialog
  saveContent(ContentStatus.DRAFT).then(() => {
    publishDialogOpen.value = true
  })
}

function handleCoverUpload(url: string) {
  coverImage.value = url
}

function handleTagInput(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    event.preventDefault()
    const value = tagInput.value.trim()
    if (value && !tags.value.includes(value)) {
      tags.value.push(value)
      tagInput.value = ''
    }
  }
}

function removeTag(index: number) {
  tags.value.splice(index, 1)
}

// Auto-save with debounce (3 seconds)
watch(
  [title, body, coverImage, tags],
  () => {
    if (loading.value) return
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
    }
    autoSaveTimer = setTimeout(() => {
      if (title.value.trim() || body.value.trim()) {
        saveContent(ContentStatus.DRAFT)
      }
    }, 3000)
  },
  { deep: true },
)

onMounted(() => {
  loadContent()
})

onBeforeUnmount(() => {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer)
  }
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-foreground">编辑内容</h1>
      <p class="mt-1 text-sm text-muted-foreground">
        修改并更新您的内容
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <Loader2 class="size-8 animate-spin text-muted-foreground" />
      <span class="ml-2 text-muted-foreground">加载中...</span>
    </div>

    <div v-else class="flex gap-6">
      <!-- Editor Area -->
      <div class="min-w-0 flex-1">
        <TiptapEditor v-model="body" placeholder="开始编写内容..." />
      </div>

      <!-- Settings Panel -->
      <div class="w-80 shrink-0 space-y-4">
        <!-- Save Status -->
        <div
          v-if="saveSuccess"
          class="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
        >
          已自动保存
        </div>

        <!-- Title -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-foreground">标题</label>
          <input
            v-model="title"
            type="text"
            placeholder="输入内容标题"
            class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <!-- Cover Image -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-foreground">封面图</label>
          <div
            v-if="coverImage"
            class="relative aspect-video overflow-hidden rounded-lg border border-border"
          >
            <img
              :src="coverImage"
              alt="封面图"
              class="h-full w-full object-cover"
            />
            <button
              class="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white cursor-pointer hover:bg-black/70"
              @click="coverImage = ''"
            >
              <X class="size-3.5" />
            </button>
          </div>
          <ImageUpload v-else @uploaded="handleCoverUpload">
            <template #trigger="{ loading: uploading }">
              <div
                class="flex aspect-video cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border transition-colors hover:border-primary/50 hover:bg-muted/50"
              >
                <ImageIcon class="size-8 text-muted-foreground" />
                <span class="text-sm text-muted-foreground">
                  {{ uploading ? '上传中...' : '点击上传封面图' }}
                </span>
              </div>
            </template>
          </ImageUpload>
        </div>

        <!-- Tags -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-foreground">标签</label>
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="(tag, index) in tags"
              :key="tag"
              class="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
            >
              {{ tag }}
              <button class="cursor-pointer hover:text-destructive" @click="removeTag(index)">
                <X class="size-3" />
              </button>
            </span>
          </div>
          <input
            v-model="tagInput"
            type="text"
            placeholder="输入标签后按回车"
            class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            @keydown="handleTagInput"
          />
        </div>

        <!-- Actions -->
        <div class="space-y-2 pt-2">
          <Button
            class="w-full cursor-pointer"
            :disabled="saving"
            @click="saveContent(ContentStatus.DRAFT)"
          >
            <Save class="size-4" />
            {{ saving ? '保存中...' : '保存草稿' }}
          </Button>
          <Button
            variant="default"
            class="w-full cursor-pointer"
            :disabled="publishing || (!title.trim() && !body.trim())"
            @click="handlePublishClick"
          >
            <Send class="size-4" />
            发布
          </Button>
        </div>
      </div>
    </div>

    <!-- Publish Dialog -->
    <PublishDialog
      v-model:open="publishDialogOpen"
      :content-id="contentId"
    />
  </div>
</template>
