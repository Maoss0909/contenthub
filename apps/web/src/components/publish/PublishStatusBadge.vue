<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '@/components/ui/badge'

const props = defineProps<{
  status: string
}>()

const statusConfig = computed(() => {
  const configs: Record<string, { label: string; class: string }> = {
    pending: {
      label: '待发布',
      class: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
    },
    processing: {
      label: '发布中',
      class: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800',
    },
    publishing: {
      label: '发布中',
      class: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800',
    },
    success: {
      label: '已成功',
      class: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800',
    },
    failed: {
      label: '已失败',
      class: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-800',
    },
    cancelled: {
      label: '已取消',
      class: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
    },
    partial: {
      label: '部分成功',
      class: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-800',
    },
  }
  return configs[props.status] || {
    label: props.status,
    class: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
  }
})
</script>

<template>
  <Badge variant="outline" :class="statusConfig.class">
    {{ statusConfig.label }}
  </Badge>
</template>
