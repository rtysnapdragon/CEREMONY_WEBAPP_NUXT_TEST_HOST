// stores/ai.js — Gemini AI via Spring backend
// POST /api/v1/ai/translate
// GET  /api/v1/admin/config/ai/status  → { enabled: boolean }

import { defineStore, acceptHMRUpdate } from 'pinia'

const DEFAULT_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'km', name: 'Khmer' },
]

export const useAIStore = defineStore('ai', {
  state: () => ({
    loading: false,
    error: null,
    enabled: true,      // controlled by ai.enabled in AppConfig
    statusLoaded: false,
  }),

  actions: {
    // Fetch enabled flag from backend — called once after login
    async fetchStatus() {
      if (this.statusLoaded) return
      try {
        const { data, error, status } = await useHttp('/api/v1/admin/config/ai/status', {
          method: 'GET',
          isGlobal: true,
        })
        if (!error?.value && status !== 401) {
          const d = data.value?.data ?? data.value
          this.enabled = d?.enabled !== false
          this.statusLoaded = true
        }
      } catch {
        // Silently keep default (enabled = true)
      }
    },

    async translate(input, languages = DEFAULT_LANGUAGES) {
      this.loading = true
      this.error = null
      try {
        const { data, error, status } = await useHttp('/api/v1/ai/translate', {
          method: 'POST',
          body: { input, languages },
          isGlobal: true,
        })
        if (error?.value) {
          if (handleAuthError(status)) return
          const msg = error.value?.data?.message ?? error.value?.message ?? 'AI translation failed'
          this.error = msg
          return null
        }
        return data.value?.data ?? data.value ?? null
      } catch (e) {
        this.error = e?.message ?? 'AI translation failed'
        return null
      } finally {
        this.loading = false
      }
    },

    async translateText(text, fieldKey = 'text', languages = DEFAULT_LANGUAGES) {
      const result = await this.translate({ [fieldKey]: text }, languages)
      return result?.[fieldKey] ?? null
    },
  },
})

// make sure to pass the right store definition, `useAuth` in this case.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAIStore, import.meta.hot))
}