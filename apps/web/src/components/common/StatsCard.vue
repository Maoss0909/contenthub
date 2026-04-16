<script setup lang="ts">
import { computed } from 'vue'
import { TrendingUp, TrendingDown, Minus } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<{
    title: string
    value: string | number
    icon?: object
    trend?: 'up' | 'down' | 'neutral'
    trendValue?: string
    color?: 'blue' | 'green' | 'purple' | 'orange'
  }>(),
  {
    trend: 'neutral',
    trendValue: '',
    color: 'blue',
  },
)

const colorClasses = computed(() => {
  const map: Record<string, { bg: string; icon: string; trend: string }> = {
    blue: {
      bg: 'bg-blue-500/10 dark:bg-blue-500/20',
      icon: 'text-blue-500',
      trend: 'text-blue-500',
    },
    green: {
      bg: 'bg-green-500/10 dark:bg-green-500/20',
      icon: 'text-green-500',
      trend: 'text-green-500',
    },
    purple: {
      bg: 'bg-purple-500/10 dark:bg-purple-500/20',
      icon: 'text-purple-500',
      trend: 'text-purple-500',
    },
    orange: {
      bg: 'bg-orange-500/10 dark:bg-orange-500/20',
      icon: 'text-orange-500',
      trend: 'text-orange-500',
    },
  }
  return map[props.color] || map.blue
})

const TrendIcon = computed(() => {
  if (props.trend === 'up') return TrendingUp
  if (props.trend === 'down') return TrendingDown
  return Minus
})
</script>

<template>
  <div
    class="rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:shadow-md"
  >
    <div class="flex items-center justify-between">
      <div class="space-y-1">
        <p class="text-sm text-muted-foreground">{{ title }}</p>
        <p class="text-2xl font-bold text-card-foreground">{{ value }}</p>
      </div>
      <div
        :class="cn('flex h-11 w-11 items-center justify-center rounded-lg', colorClasses.bg)"
      >
        <component
          :is="icon"
          :class="cn('h-5 w-5', colorClasses.icon)"
        />
      </div>
    </div>
    <div v-if="trendValue" class="mt-3 flex items-center gap-1 text-xs">
      <component
        :is="TrendIcon"
        :class="cn('h-3.5 w-3.5', trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground')"
      />
      <span
        :class="trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground'"
      >
        {{ trendValue }}
      </span>
      <span class="text-muted-foreground">较上月</span>
    </div>
  </div>
</template>
