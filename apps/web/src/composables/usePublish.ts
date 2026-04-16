import { computed } from 'vue'
import { usePublishStore } from '@/stores/publish'
import type { CreatePublishData, PreCheckData } from '@/services/publish.service'
import type { PreCheckResult } from '@/services/publish.service'
import type { PublishTask } from '@/types/publish.types'

export function usePublish() {
  const store = usePublishStore()
  const loading = computed(() => store.loading)
  const error = computed(() => store.error)

  async function createPublish(data: CreatePublishData): Promise<PublishTask[]> {
    return store.createPublish(data)
  }

  async function retryTask(id: string): Promise<PublishTask> {
    return store.retryTask(id)
  }

  async function cancelTask(id: string): Promise<PublishTask> {
    return store.cancelTask(id)
  }

  async function preCheck(data: PreCheckData): Promise<PreCheckResult[]> {
    return store.preCheck(data)
  }

  return {
    loading,
    error,
    createPublish,
    retryTask,
    cancelTask,
    preCheck,
  }
}
