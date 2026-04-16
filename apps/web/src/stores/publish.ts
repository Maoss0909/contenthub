import { defineStore } from 'pinia'
import { ref } from 'vue'
import { publishService, type PublishTaskListParams, type CreatePublishData, type PreCheckData } from '@/services/publish.service'
import type { PreCheckResult } from '@/services/publish.service'
import type { PublishTask, PublishStatus } from '@/types/publish.types'
import type { PaginatedResponse } from '@/types/api.types'

export const usePublishStore = defineStore('publish', () => {
  const tasks = ref<PublishTask[]>([])
  const currentTask = ref<PublishTask | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const filters = ref<{
    platform: string
    status: string
    dateRange: {
      start: string
      end: string
    }
  }>({
    platform: '',
    status: '',
    dateRange: {
      start: '',
      end: '',
    },
  })

  const pagination = ref({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  })

  async function fetchTasks(params?: Partial<PublishTaskListParams>) {
    loading.value = true
    error.value = null
    try {
      const queryParams: PublishTaskListParams = {
        page: pagination.value.page,
        pageSize: pagination.value.pageSize,
        ...params,
      }
      if (filters.value.platform) {
        queryParams.platform = filters.value.platform as PublishStatus
      }
      if (filters.value.status) {
        queryParams.status = filters.value.status as PublishStatus
      }
      if (filters.value.dateRange.start) {
        queryParams.startDate = filters.value.dateRange.start
      }
      if (filters.value.dateRange.end) {
        queryParams.endDate = filters.value.dateRange.end
      }

      const result: PaginatedResponse<PublishTask> = await publishService.getTasks(queryParams)
      tasks.value = result.items
      pagination.value.total = result.total
      pagination.value.totalPages = result.totalPages
      pagination.value.page = result.page
    } catch (err: any) {
      error.value = err?.response?.data?.message || err?.message || '获取发布任务列表失败'
    } finally {
      loading.value = false
    }
  }

  async function fetchTaskById(id: string) {
    loading.value = true
    error.value = null
    try {
      currentTask.value = await publishService.getTaskById(id)
    } catch (err: any) {
      error.value = err?.response?.data?.message || err?.message || '获取发布任务详情失败'
    } finally {
      loading.value = false
    }
  }

  async function retryTask(id: string): Promise<PublishTask> {
    error.value = null
    try {
      const task = await publishService.retryTask(id)
      if (currentTask.value?.id === id) {
        currentTask.value = task
      }
      const index = tasks.value.findIndex((t) => t.id === id)
      if (index !== -1) {
        tasks.value[index] = task
      }
      return task
    } catch (err: any) {
      error.value = err?.response?.data?.message || err?.message || '重试发布任务失败'
      throw err
    }
  }

  async function cancelTask(id: string): Promise<PublishTask> {
    error.value = null
    try {
      const task = await publishService.cancelTask(id)
      if (currentTask.value?.id === id) {
        currentTask.value = task
      }
      const index = tasks.value.findIndex((t) => t.id === id)
      if (index !== -1) {
        tasks.value[index] = task
      }
      return task
    } catch (err: any) {
      error.value = err?.response?.data?.message || err?.message || '取消发布任务失败'
      throw err
    }
  }

  async function createPublish(data: CreatePublishData): Promise<PublishTask[]> {
    loading.value = true
    error.value = null
    try {
      const tasks = await publishService.createPublish(data)
      return tasks
    } catch (err: any) {
      error.value = err?.response?.data?.message || err?.message || '创建发布任务失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function preCheck(data: PreCheckData): Promise<PreCheckResult[]> {
    error.value = null
    try {
      return await publishService.preCheck(data)
    } catch (err: any) {
      error.value = err?.response?.data?.message || err?.message || '预检失败'
      throw err
    }
  }

  function setFilters(newFilters: Partial<typeof filters.value>) {
    filters.value = { ...filters.value, ...newFilters }
    pagination.value.page = 1
  }

  function setPage(page: number) {
    pagination.value.page = page
  }

  function setPageSize(pageSize: number) {
    pagination.value.pageSize = pageSize
    pagination.value.page = 1
  }

  return {
    tasks,
    currentTask,
    loading,
    error,
    filters,
    pagination,
    fetchTasks,
    fetchTaskById,
    retryTask,
    cancelTask,
    createPublish,
    preCheck,
    setFilters,
    setPage,
    setPageSize,
  }
})
