<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Pencil, Send, Trash2, ImageIcon } from 'lucide-vue-next'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Content } from '@/types/content.types'

const props = defineProps<{
  content: Content
}>()

const emit = defineEmits<{
  delete: [id: string]
  publish: [id: string]
}>()

const router = useRouter()

const summary = computed(() => {
  if (props.content.summary) return props.content.summary
  const text = props.content.body?.replace(/<[^>]*>/g, '') || ''
  return text.length > 100 ? text.slice(0, 100) + '...' : text
})

const timeAgo = computed(() => {
  try {
    return formatDistanceToNow(new Date(props.content.createdAt), {
      addSuffix: true,
      locale: zhCN,
    })
  } catch {
    return props.content.createdAt
  }
})

const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: '草稿', variant: 'secondary' },
  published: { label: '已发布', variant: 'default' },
  scheduled: { label: '定时发布', variant: 'outline' },
  archived: { label: '已归档', variant: 'outline' },
}

const statusInfo = computed(() => {
  return statusMap[props.content.status] || { label: props.content.status, variant: 'secondary' as const }
})

function handleEdit() {
  router.push(`/contents/${props.content.id}/edit`)
}

function handlePublish() {
  emit('publish', props.content.id)
}

function handleDelete() {
  emit('delete', props.content.id)
}
</script>

<template>
  <Card
    class="group cursor-pointer overflow-hidden transition-all duration-200 hover:shadow-md"
    @click="handleEdit"
  >
    <!-- Cover Image -->
    <div class="relative aspect-video overflow-hidden bg-muted">
      <img
        v-if="content.coverImage"
        :src="content.coverImage"
        :alt="content.title"
        class="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
      />
      <div
        v-else
        class="flex h-full w-full items-center justify-center"
      >
        <ImageIcon class="size-12 text-muted-foreground/30" />
      </div>
      <!-- Status Badge -->
      <div class="absolute right-2 top-2">
        <Badge :variant="statusInfo.variant">
          {{ statusInfo.label }}
        </Badge>
      </div>
    </div>

    <CardContent class="p-4">
      <!-- Title -->
      <h3 class="mb-2 line-clamp-2 text-base font-semibold text-foreground">
        {{ content.title || '无标题' }}
      </h3>

      <!-- Summary -->
      <p class="mb-3 line-clamp-2 text-sm text-muted-foreground">
        {{ summary }}
      </p>

      <!-- Tags -->
      <div v-if="content.tags && content.tags.length > 0" class="mb-3 flex flex-wrap gap-1">
        <Badge
          v-for="tag in content.tags.slice(0, 3)"
          :key="tag"
          variant="secondary"
          class="text-xs"
        >
          {{ tag }}
        </Badge>
        <Badge
          v-if="content.tags.length > 3"
          variant="secondary"
          class="text-xs"
        >
          +{{ content.tags.length - 3 }}
        </Badge>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between">
        <span class="text-xs text-muted-foreground">{{ timeAgo }}</span>
        <div class="flex items-center gap-1" @click.stop>
          <Button
            variant="ghost"
            size="icon-sm"
            class="cursor-pointer"
            title="编辑"
            @click="handleEdit"
          >
            <Pencil class="size-3.5" />
          </Button>
          <Button
            v-if="content.status === 'draft'"
            variant="ghost"
            size="icon-sm"
            class="cursor-pointer"
            title="发布"
            @click="handlePublish"
          >
            <Send class="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            class="cursor-pointer text-destructive hover:text-destructive"
            title="删除"
            @click="handleDelete"
          >
            <Trash2 class="size-3.5" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
