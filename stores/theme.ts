import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', () => {
  // State
  const dark = ref(false)

  // Initialize from localStorage (client-side only)
  if (import.meta.client) {
    dark.value = localStorage.getItem('THEME') === 'true'
  }

  // Getters
  const isDark = computed(() => dark.value)
  const themeName = computed(() => dark.value ? 'dark' : 'light')

  // Vuetify-specific getters (kept for compatibility)
  const primaryButtonVariant = computed(() => dark.value ? 'dark' : 'primary')
  const elementVariant = computed(() => dark.value ? 'dark' : 'light')

  // Actions
  function switchTheme() {
    dark.value = !dark.value

    // Save to localStorage
    if (import.meta.client) {
      localStorage.setItem('THEME', String(dark.value))
    }
  }

  function setTheme(isDark: boolean) {
    dark.value = isDark

    if (import.meta.client) {
      localStorage.setItem('THEME', String(dark.value))
    }
  }

  return {
    // State
    dark,
    // Getters
    isDark,
    themeName,
    primaryButtonVariant,
    elementVariant,
    // Actions
    switchTheme,
    setTheme
  }
})
