<script setup lang="ts">
import { computed } from 'vue'
import { getPlatformColor, getPlatformIcon } from '@/composables/usePlatform'

const props = withDefaults(
  defineProps<{
    platform: string
    size?: number
  }>(),
  {
    size: 24,
  },
)

const color = computed(() => getPlatformColor(props.platform))
const icon = computed(() => getPlatformIcon(props.platform))

const fontSize = computed(() => {
  const ratio = 0.5
  return Math.round(props.size * ratio)
})
</script>

<template>
  <div
    class="inline-flex items-center justify-center rounded-full font-bold text-white select-none"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: color,
      fontSize: `${fontSize}px`,
    }"
    :title="platform"
  >
    {{ icon }}
  </div>
</template>
