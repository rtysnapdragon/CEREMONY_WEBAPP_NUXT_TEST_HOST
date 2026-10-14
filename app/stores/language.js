// stores/language.js — Language CRUD
// GET/POST/PUT/DELETE /api/v1/languages
import { defineStore, acceptHMRUpdate } from 'pinia'

const fromApi = (l) => ({
  id: l.id,
  code: l.code ?? '',
  name: l.name ?? '',
  nativeName: l.nativeName ?? '',
  flag: l.flag ?? '',
  direction: l.direction ?? 'LTR',
  isDefault: l.isDefault ?? l['default'] ?? false,
  isActive: l.isActive ?? l.active ?? true,
  // legacy alias kept for backward compat
  active: l.isActive ?? l.active ?? true,
  sortOrder: l.sortOrder ?? 0,
  createdAt: l.createdAt ?? null,
  updatedAt: l.updatedAt ?? null,
})

export const useLanguageStore = defineStore('language', {
  state: () => ({
    items: [],
    loading: false,
  }),

  getters: {
    activeItems: (state) => state.items.filter((l) => l.isActive).sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)),
  },

  actions: {
    async fetchLanguages() {
      this.loading = true
      try {
        const { data, error, status } = await useHttp('/api/v1/languages', { method: 'GET', isGlobal: true })
        if (error?.value) {
          if (handleAuthError(status)) return
          return
        }
        const result = data.value?.data ?? data.value ?? []
        this.items = Array.isArray(result) ? result.map(fromApi) : []
      } finally {
        this.loading = false
      }
    },

    async createLanguage(form) {
      const { data, error, status } = await useHttp('/api/v1/languages', {
        method: 'POST',
        body: { code: form.code, name: form.name, nativeName: form.nativeName, flag: form.flag, direction: form.direction ?? 'LTR', isActive: form.isActive ?? form.active ?? true, isDefault: form.isDefault ?? false, sortOrder: form.sortOrder ?? 0 },
        isGlobal: true,
      })
      if (error?.value) {
        if (handleAuthError(status)) return
        return { success: false, error: error.value?.data?.message ?? 'Failed to create' }
      }
      const created = fromApi(data.value?.data ?? data.value)
      this.items.push(created)
      this.items.sort((a, b) => a.name.localeCompare(b.name))
      return { success: true, data: created }
    },

    async updateLanguage(id, form) {
      const { data, error, status } = await useHttp(`/api/v1/languages/${id}`, {
        method: 'PUT',
        body: { code: form.code, name: form.name, nativeName: form.nativeName, flag: form.flag, direction: form.direction ?? 'LTR', isActive: form.isActive ?? form.active ?? true, isDefault: form.isDefault ?? false, sortOrder: form.sortOrder ?? 0 },
        isGlobal: true,
      })
      if (error?.value) {
        if (handleAuthError(status)) return
        return { success: false, error: error.value?.data?.message ?? 'Failed to update' }
      }
      const updated = fromApi(data.value?.data ?? data.value)
      const idx = this.items.findIndex((l) => l.id === id)
      if (idx !== -1) this.items[idx] = updated
      return { success: true, data: updated }
    },

    async deleteLanguage(id) {
      const { error, status } = await useHttp(`/api/v1/languages/${id}`, { method: 'DELETE', isGlobal: true })
      if (error?.value) {
        if (handleAuthError(status)) return
        return { success: false, error: error.value?.data?.message ?? 'Failed to delete' }
      }
      const _lidx = this.items.findIndex((l) => l.id === id); if (_lidx !== -1) this.items.splice(_lidx, 1)
      return { success: true }
    },
  },
})


// make sure to pass the right store definition, `useAuth` in this case.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useLanguageStore, import.meta.hot))
}