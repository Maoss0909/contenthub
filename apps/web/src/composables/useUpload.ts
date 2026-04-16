import { ref } from 'vue'
import { uploadService, type UploadResult } from '@/services/upload.service'

export function useUpload() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function uploadImage(file: File): Promise<UploadResult | null> {
    loading.value = true
    error.value = null
    try {
      const result = await uploadService.uploadImage(file)
      return result
    } catch (err: any) {
      error.value = err?.response?.data?.message || err?.message || '上传失败'
      return null
    } finally {
      loading.value = false
    }
  }

  async function uploadImages(files: File[]): Promise<UploadResult[]> {
    loading.value = true
    error.value = null
    try {
      const results = await uploadService.uploadImages(files)
      return results
    } catch (err: any) {
      error.value = err?.response?.data?.message || err?.message || '上传失败'
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    uploadImage,
    uploadImages,
  }
}
