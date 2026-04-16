import { computed } from 'vue'
import { useAppStore } from '@/stores/app'

export function useTheme() {
  const appStore = useAppStore()

  const isDark = computed(() => appStore.theme === 'dark')

  function toggleTheme() {
    appStore.toggleTheme()
  }

  return {
    isDark,
    toggleTheme,
  }
}
