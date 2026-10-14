import { computed } from 'vue'

export function useTheme() {
  const themeStore = useThemeStore()

  const isDark = computed(() => themeStore.isDark)
  const activeTheme = computed(() => themeStore.activeTheme)

  /**
   * Get the current resolved value of a CSS var token for the current mode.
   * Checks previewTokens first, then activeTheme tokens, falls back to empty string.
   */
  const tokenValue = (varName: string): string => {
    const tokens = themeStore.previewTokens ?? themeStore.activeTheme?.tokens ?? {}
    const t = tokens[varName]
    if (!t) return ''
    return themeStore.isDark ? t.dark : t.light
  }

  /**
   * Apply a single token change for live preview (does not save).
   */
  const previewToken = (varName: string, light: string, dark: string) => {
    const current = { ...(themeStore.previewTokens ?? themeStore.activeTheme?.tokens ?? {}) }
    current[varName] = { light, dark }
    themeStore.applyPreview(current)
  }

  /**
   * Direct DOM CSS variable setter — for instant single-var preview.
   */
  const setCssVar = (name: string, value: string) => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty(name, value)
    }
  }

  /**
   * Clear a CSS variable override from the DOM (restores SCSS default).
   */
  const removeCssVar = (name: string) => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.removeProperty(name)
    }
  }
  const themeIcon = computed(() => {
    return isDark.value ? 'ri-moon-line' : 'ri-sun-line'
  })
  return {
    isDark,
    activeTheme,
    themeIcon,
    themes: computed(() => themeStore.themes),
    presets: computed(() => themeStore.presets),
    loading: computed(() => themeStore.loading),
    tokenValue,
    previewToken,
    setCssVar,
    removeCssVar,
    toggleTheme: () => themeStore.toggleTheme(),
    fetchCurrent: () => themeStore.fetchCurrent(),
    clearPreview: () => themeStore.clearPreview(),
    fetchThemes: () => themeStore.fetchThemes(),
    fetchPresets: () => themeStore.fetchPresets(),
    activateTheme: (id: string) => themeStore.activateTheme(id),
  }
}
