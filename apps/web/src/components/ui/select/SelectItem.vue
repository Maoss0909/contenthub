<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
  value?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  select: [value: string]
}>()
</script>

<template>
  <div
    :class="cn(
      'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      props.class
    )"
    :data-disabled="disabled"
    @click="emit('select', value ?? '')"
  >
    <slot />
  </div>
</template>
