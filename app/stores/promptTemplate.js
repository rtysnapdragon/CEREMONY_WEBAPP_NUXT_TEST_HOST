// stores/promptTemplate.js
// GET    /api/v1/admin/prompts
// GET    /api/v1/admin/prompts/{id}
// POST   /api/v1/admin/prompts
// PUT    /api/v1/admin/prompts/{id}
// DELETE /api/v1/admin/prompts/{id}
// POST   /api/v1/admin/prompts/feature/{feature}/reset
import { defineStore, acceptHMRUpdate } from 'pinia'

const fromApi = (p) => ({
  id: p.id,
  feature: p.feature ?? '',
  name: p.name ?? '',
  description: p.description ?? '',
  template: p.template ?? '',
  variables: (() => {
    try { return typeof p.variables === 'string' ? JSON.parse(p.variables) : (p.variables ?? []) }
    catch { return [] }
  })(),
  active: p.active ?? true,
  autoSave: p.autoSave ?? true,
  entityName: p.entityName ?? null,
  translatableFields: (() => {
    try { return typeof p.translatableFields === 'string' ? JSON.parse(p.translatableFields) : (p.translatableFields ?? []) }
    catch { return [] }
  })(),
  createdAt: p.createdAt ?? null,
  updatedAt: p.updatedAt ?? null,
})

export const usePromptTemplateStore = defineStore('promptTemplate', {
  state: () => ({
    items: [],
    loading: false,
  }),

  getters: {
    byFeature: (state) => (feature) => state.items.find((p) => p.feature === feature) ?? null,
  },

  actions: {
    async fetchAll() {
      this.loading = true
      try {
        const { data, error } = await useHttp('/api/v1/admin/prompts', { method: 'GET', isGlobal: true })
        if (!error?.value) this.items = (data.value?.data ?? data.value ?? []).map(fromApi)
      } finally {
        this.loading = false
      }
    },

    async addPrompt(payload) {
      const { data, error } = await useHttp('/api/v1/admin/prompts', {
        method: 'POST', body: payload, isGlobal: true,
      })
      if (error?.value) return { error: error.value?.data?.message || 'Failed to create' }
      const created = fromApi(data.value?.data ?? data.value)
      this.items.push(created)
      return { data: created }
    },

    async updatePrompt(id, payload) {
      const { data, error } = await useHttp(`/api/v1/admin/prompts/${id}`, {
        method: 'PUT', body: payload, isGlobal: true,
      })
      if (error?.value) return { error: error.value?.data?.message || 'Failed to update' }
      const updated = fromApi(data.value?.data ?? data.value)
      const idx = this.items.findIndex((p) => p.id === id)
      if (idx !== -1) this.items.splice(idx, 1, updated)
      return { data: updated }
    },

    async deletePrompt(id) {
      const { error } = await useHttp(`/api/v1/admin/prompts/${id}`, { method: 'DELETE', isGlobal: true })
      if (!error?.value) {
        const idx = this.items.findIndex((p) => p.id === id)
        if (idx !== -1) this.items.splice(idx, 1)
      }
      return !error?.value
    },

    async resetToDefault(feature) {
      const { error } = await useHttp(`/api/v1/admin/prompts/feature/${encodeURIComponent(feature)}/reset`, {
        method: 'POST', isGlobal: true,
      })
      if (!error?.value) {
        const idx = this.items.findIndex((p) => p.feature === feature)
        if (idx !== -1) this.items.splice(idx, 1)
      }
      return !error?.value
    },
  },
})


// make sure to pass the right store definition, `useAuth` in this case.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePromptTemplateStore, import.meta.hot))
}