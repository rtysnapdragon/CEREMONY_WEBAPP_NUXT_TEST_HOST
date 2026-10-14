import { defineStore,acceptHMRUpdate } from 'pinia'

// ── Types ──────────────────────────────────────────────────────────────────

export interface ThemeTokenItem {
  id: string
  token: string
  lightValue: string
  darkValue: string
  category: string
  description: string
  sortOrder: number
}

export interface ThemeItem {
  id: string
  name: string
  code: string
  description: string
  type: 'APP' | 'INVITATION'
  isDefault: boolean
  isActive: boolean
  previewColors: string[]
  version: number
  tokens: ThemeTokenItem[]
  extras?: Record<string, string>
}

export interface ThemeConfig {
  themeId: string
  version: number
  tokens: Record<string, { light: string; dark: string }>
}

export interface ThemePreset {
  id: string
  name: string
  description: string
  previewColors?: string[]
  tokensJson: string
}

// ── Store ──────────────────────────────────────────────────────────────────

export const useThemeStore = defineStore('theme', {
  state: () => ({
    // Dark mode (existing)
    isDark: false,
    isInitialized: false,

    // Dynamic theme system
    themes: [] as ThemeItem[],
    activeTheme: null as ThemeConfig | null,
    presets: [] as ThemePreset[],
    loading: false,
    previewTokens: null as Record<string, { light: string; dark: string }> | null,
  }),

  getters: {
    theme: (state) => (state.isDark ? 'dark' : 'light'),
    defaultTheme: (state) => state.themes.find((t) => t.isDefault) ?? null,
  },

  actions: {
    // ── Dark mode (keep existing) ──────────────────────────────────────────

    initialize() {
      if (this.isInitialized) return
      if (typeof window !== 'undefined') {
        const savedTheme = localStorage?.getItem('theme')
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        this.isDark = savedTheme === 'dark' || (!savedTheme && prefersDark)
        this.applyTheme()
        this.syncColorMode()
        this.isInitialized = true
      }
    },

    toggleTheme() {
      this.isDark = !this.isDark
      this.applyTheme()
      this.saveTheme()
      this.syncColorMode()
      const tokens = this.previewTokens ?? this.activeTheme?.tokens ?? null
      if (tokens) this.applyThemeTokens(tokens)
    },

    setTheme(isDark: boolean) {
      this.isDark = isDark
      this.applyTheme()
      this.saveTheme()
      this.syncColorMode()
      const tokens = this.previewTokens ?? this.activeTheme?.tokens ?? null
      if (tokens) this.applyThemeTokens(tokens)
    },

    syncColorMode() {
      try {
        const colorMode = useColorMode()
        colorMode.preference = this.isDark ? 'dark' : 'light'
      }
      catch {
        // useColorMode not available outside Nuxt context — ignore
      }
    },

    applyTheme() {
      if (typeof document !== 'undefined') {
        if (this.isDark) {
          document.documentElement.classList.add('dark')
        }
        else {
          document.documentElement.classList.remove('dark')
        }
      }
    },

    saveTheme() {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('theme', this.isDark ? 'dark' : 'light')
      }
    },

    // ── Token application ──────────────────────────────────────────────────

    applyThemeTokens(tokens: Record<string, { light: string; dark: string }>) {
      if (typeof document === 'undefined') return
      const root = document.documentElement
      Object.entries(tokens).forEach(([varName, values]) => {
        root.style.setProperty(varName, this.isDark ? values.dark : values.light)
      })
    },

    applyPreview(tokens: Record<string, { light: string; dark: string }>) {
      this.previewTokens = tokens
      this.applyThemeTokens(tokens)
    },

    clearPreview() {
      this.previewTokens = null
      if (this.activeTheme?.tokens) {
        this.applyThemeTokens(this.activeTheme.tokens)
      }
    },

    // ── API actions ────────────────────────────────────────────────────────

    async fetchCurrent() {
      try {
        const { data } = await useHttp('/api/v1/themes/current', { method: 'GET', isGlobal: true })
        const result = data.value?.data ?? data.value
        if (result?.tokens) {
          this.activeTheme = result as ThemeConfig
          this.applyThemeTokens(result.tokens)
          // Apply non-color extras (typography, spacing, radius, shadow)
          if (result.extras && typeof document !== 'undefined') {
            const root = document.documentElement
            for (const [varName, value] of Object.entries(result.extras as Record<string, string>)) {
              if (value) root.style.setProperty(varName, value)
            }
          }
        }
      }
      catch {
        // Silently fail — fallback to CSS-defined tokens
      }
    },

    async fetchThemes() {
      this.loading = true
      try {
        const { data, error } = await useHttp('/api/v1/themes', { method: 'GET', isGlobal: true })
        if (error?.value) return { error: error.value?.message || 'Failed to load themes' }
        const list = data.value?.data ?? data.value ?? []
        this.themes = Array.isArray(list) ? list : (list.content ?? [])
        return { data: this.themes }
      }
      finally {
        this.loading = false
      }
    },

    async fetchPresets() {
      try {
        const { data } = await useHttp('/api/v1/theme-presets', { method: 'GET', isGlobal: true })
        this.presets = data.value?.data ?? data.value ?? []
        return { data: this.presets }
      }
      catch {
        return { error: 'Failed to load presets' }
      }
    },

    async createTheme(payload: object) {
      const { data, error } = await useHttp('/api/v1/themes', {
        method: 'POST',
        body: payload,
        isGlobal: true,
      })
      if (error?.value) return { error: error.value?.message || 'Failed to create theme' }
      const created = data.value?.data ?? data.value
      if (created) this.themes.unshift(created)
      return { data: created }
    },

    async updateTheme(id: string, payload: object) {
      const { data, error } = await useHttp(`/api/v1/themes/${id}`, {
        method: 'PUT',
        body: payload,
        isGlobal: true,
      })
      if (error?.value) return { error: error.value?.message || 'Failed to update theme' }
      const updated = data.value?.data ?? data.value
      if (updated) {
        const idx = this.themes.findIndex((t) => t.id === id)
        if (idx !== -1) this.themes.splice(idx, 1, updated)
      }
      return { data: updated }
    },

    async deleteTheme(id: string) {
      const { data, error } = await useHttp(`/api/v1/themes/${id}`, {
        method: 'DELETE',
        isGlobal: true,
      })
      if (error?.value) return { error: error.value?.message || 'Failed to delete theme' }
      const idx = this.themes.findIndex((t) => t.id === id)
      if (idx !== -1) this.themes.splice(idx, 1)
      return { data: true }
    },

    async activateTheme(id: string) {
      const { data, error } = await useHttp(`/api/v1/themes/${id}/activate`, {
        method: 'POST',
        isGlobal: true,
      })
      if (error?.value) return { error: error.value?.message || 'Failed to activate theme' }
      await Promise.all([this.fetchThemes(), this.fetchCurrent()])
      return { data: data.value?.data ?? data.value }
    },

    async toggleActive(id: string, isActive: boolean) {
      const { data, error } = await useHttp(`/api/v1/themes/${id}`, {
        method: 'PUT',
        body: { isActive },
        isGlobal: true,
      })
      if (error?.value) return { error: error.value?.message || 'Failed to update theme' }
      const updated = data.value?.data ?? data.value
      if (updated) {
        const idx = this.themes.findIndex((t) => t.id === id)
        if (idx !== -1) this.themes.splice(idx, 1, updated)
      }
      return { data: updated }
    },

    async duplicateTheme(id: string) {
      const { data, error } = await useHttp(`/api/v1/themes/${id}/duplicate`, {
        method: 'POST',
        isGlobal: true,
      })
      if (error?.value) return { error: error.value?.message || 'Failed to duplicate theme' }
      const created = data.value?.data ?? data.value
      if (created) this.themes.push(created)
      return { data: created }
    },

    async applyPreset(themeId: string, presetId: string) {
      const { data, error } = await useHttp(`/api/v1/themes/${themeId}/apply-preset`, {
        method: 'POST',
        body: { presetId },
        isGlobal: true,
      })
      if (error?.value) return { error: error.value?.message || 'Failed to apply preset' }
      return { data: data.value?.data ?? data.value }
    },

    async importTheme(json: object) {
      const { data, error } = await useHttp('/api/v1/themes/import', {
        method: 'POST',
        body: json,
        isGlobal: true,
      })
      if (error?.value) return { error: error.value?.message || 'Failed to import theme' }
      const created = data.value?.data ?? data.value
      if (created) this.themes.push(created)
      return { data: created }
    },

    async exportTheme(id: string): Promise<string> {
      const { data } = await useHttp(`/api/v1/themes/export/${id}`, {
        method: 'GET',
        isGlobal: true,
      })
      const result = data.value?.data ?? data.value
      return typeof result === 'string' ? result : JSON.stringify(result, null, 2)
    },
  },
})

// make sure to pass the right store definition, `useAuth` in this case.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useThemeStore, import.meta.hot))
}