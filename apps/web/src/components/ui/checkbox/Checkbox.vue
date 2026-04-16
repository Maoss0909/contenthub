<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
  checked?: boolean | string | number
  disabled?: boolean
}>()

const emit = defineEmits<{
  "update:checked": [value: boolean]
}>()

function handleChange(event: Event) {
  const target = event.target as HTMLInputElement
  emit("update:checked", target.checked)
}
</script>

<template>
  <button
    type="button"
    role="checkbox"
    :aria-checked="!!checked"
    :class="cn(
      'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      checked && 'bg-primary text-primary-foreground',
      props.class
    )"
    :disabled="disabled"
    @click="handleChange({ target: { checked: !checked } } as any)"
  >
    <span class="flex items-center justify-center text-current">
      <svg
        v-if="checked"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="h-3 w-3"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
  </button>
</template>
