import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const globalLoading = ref(false)
  const onlineStatus = ref(navigator.onLine)
  const theme = ref('light')
  const language = ref('zh-CN')

  const setGlobalLoading = (loading) => {
    globalLoading.value = loading
  }

  const setOnlineStatus = (status) => {
    onlineStatus.value = status
  }

  const setTheme = (newTheme) => {
    theme.value = newTheme
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  const setLanguage = (newLanguage) => {
    language.value = newLanguage
  }

  return {
    globalLoading,
    onlineStatus,
    theme,
    language,
    setGlobalLoading,
    setOnlineStatus,
    setTheme,
    setLanguage
  }
})