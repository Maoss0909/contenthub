<script setup lang="ts">
import { useRouter } from 'vue-router'

const props = withDefaults(
  defineProps<{
    icon?: object
    title: string
    description?: string
    actionText?: string
    actionUrl?: string
  }>(),
  {
    description: '',
    actionText: '',
    actionUrl: '',
  },
)

const emit = defineEmits<{
  'action-click': []
}>()

const router = useRouter()

function handleAction() {
  if (props.actionUrl) {
    router.push(props.actionUrl)
  }
  emit('action-click')
}
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 text-center">
    <div
      class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted"
    >
      <component :is="icon" class="h-8 w-8 text-muted-foreground" />
    </div>
    <h3 class="mb-1 text-lg font-semibold text-foreground">{{ title }}</h3>
    <p v-if="description" class="mb-6 max-w-sm text-sm text-muted-foreground">
      {{ description }}
    </p>
    <button
      v-if="actionText && (actionUrl || true)"
      class="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-all duration-200 hover:bg-primary/90 cursor-pointer"
      @click="handleAction"
    >
      {{ actionText }}
    </button>
  </div>
</template>
