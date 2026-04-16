<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Search, FileText, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/common/EmptyState.vue'
import ContentCard from '@/components/content/ContentCard.vue'
import { contentService } from '@/services/content.service'
import type { Content } from '@/types/content.types'

const router = useRouter()

const loading = ref(false)
const contents = ref<Content[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(12)
const keyword = ref('')
const activeStatus = ref('all')
const searchInput = ref('')

const statusTabs = [
  { key: 'all', label: '全部' },
  { key: 'draft', label: '草稿' },
  { key: 'published', label: '已发布' },
  { key: 'archived', label: '已归档' },
]

const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

async function fetchContents() {
  loading.value = true
  try {
    const params: Record<string, any> = {
      page: page.value,
      pageSize: pageSize.value,
    }
    if (activeStatus.value !== 'all') {
      params.status = activeStatus.value
    }
    if (keyword.value.trim()) {
      params.keyword = keyword.value.trim()
    }
    const result = await contentService.getContentList(params)
    contents.value = result.items
    total.value = result.total
  } catch (error) {
    console.error('Failed to fetch contents:', error)
    contents.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  keyword.value = searchInput.value
  page.value = 1
  fetchContents()
}

function handleStatusChange(status: string) {
  activeStatus.value = status
  page.value = 1
  fetchContents()
}

function handlePageChange(newPage: number) {
  if (newPage < 1 || newPage > totalPages.value) return
  page.value = newPage
  fetchContents()
}

async function handleDelete(id: string) {
  if (!confirm('确定要删除这条内容吗？')) return
  try {
    await contentService.deleteContent(id)
    await fetchContents()
  } catch (error) {
    console.error('Failed to delete content:', error)
  }
}

async function handlePublish(id: string) {
  try {
    await contentService.updateContent(id, { status: 'published' })
    await fetchContents()
  } catch (error) {
    console.error('Failed to publish content:', error)
  }
}

function handleCreate() {
  router.push('/contents/create')
}

onMounted(() => {
  fetchContents()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-foreground">内容管理</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          管理您的所有内容，支持创建、编辑和发布
        </p>
      </div>
      <Button class="cursor-pointer" @click="handleCreate">
        <Plus class="size-4" />
        新建内容
      </Button>
    </div>

    <!-- Search & Filter -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <!-- Search -->
      <div class="relative max-w-sm flex-1">
        <Search class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          v-model="searchInput"
          type="text"
          placeholder="搜索内容..."
          class="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          @keydown.enter="handleSearch"
        />
      </div>

      <!-- Status Tabs -->
      <div class="flex items-center gap-1 rounded-lg bg-muted p-1">
        <button
          v-for="tab in statusTabs"
          :key="tab.key"
          class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer"
          :class="
            activeStatus === tab.key
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          "
          @click="handleStatusChange(tab.key)"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div v-for="i in 6" :key="i" class="overflow-hidden rounded-lg border border-border bg-card">
        <Skeleton class="aspect-video w-full" />
        <div class="space-y-2 p-4">
          <Skeleton class="h-5 w-3/4" />
          <Skeleton class="h-4 w-full" />
          <Skeleton class="h-4 w-1/2" />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="contents.length === 0"
      class="rounded-xl border border-border bg-card"
    >
      <EmptyState
        :icon="FileText"
        title="暂无内容"
        description="点击下方按钮创建您的第一篇内容"
        action-text="创建内容"
        action-url="/contents/create"
      />
    </div>

    <!-- Content Grid -->
    <div
      v-else
      class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
    >
      <ContentCard
        v-for="content in contents"
        :key="content.id"
        :content="content"
        @delete="handleDelete"
        @publish="handlePublish"
      />
    </div>

    <!-- Pagination -->
    <div
      v-if="!loading && contents.length > 0 && totalPages > 1"
      class="flex items-center justify-between"
    >
      <span class="text-sm text-muted-foreground">
        共 {{ total }} 条，第 {{ page }} / {{ totalPages }} 页
      </span>
      <div class="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          class="cursor-pointer"
          :disabled="page <= 1"
          @click="handlePageChange(page - 1)"
        >
          <ChevronLeft class="size-4" />
          上一页
        </Button>
        <Button
          variant="outline"
          size="sm"
          class="cursor-pointer"
          :disabled="page >= totalPages"
          @click="handlePageChange(page + 1)"
        >
          下一页
          <ChevronRight class="size-4" />
        </Button>
      </div>
    </div>
  </div>
</template>
