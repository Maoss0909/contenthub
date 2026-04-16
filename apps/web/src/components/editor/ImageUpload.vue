<script setup lang="ts">
import { ref } from 'vue'
import { useUpload } from '@/composables/useUpload'

const props = defineProps<{
  onUpload?: (url: string) => void
}>()

const emit = defineEmits<{
  uploaded: [url: string]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const { loading, uploadImage } = useUpload()

function triggerFileSelect() {
  fileInput.value?.click()
}

async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    return
  }

  const result = await uploadImage(file)
  if (result) {
    if (props.onUpload) {
      props.onUpload(result.url)
    }
    emit('uploaded', result.url)
  }

  // Reset input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

defineExpose({
  triggerFileSelect,
})
</script>

<template>
  <input
    ref="fileInput"
    type="file"
    accept="image/*"
    class="hidden"
    @change="handleFileChange"
  />
  <slot :trigger="triggerFileSelect" :loading="loading">
    <button
      type="button"
      class="cursor-pointer"
      :disabled="loading"
      @click="triggerFileSelect"
    >
      <slot name="trigger" :loading="loading">
        <span v-if="loading">上传中...</span>
        <span v-else>上传图片</span>
      </slot>
    </button>
  </slot>
</template>
