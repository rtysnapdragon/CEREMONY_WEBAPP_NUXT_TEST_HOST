// stores/articleCategory.js — Article Categories connected to Spring API
// GET/POST/PUT/DELETE /api/v1/articles/categories

import { defineStore, acceptHMRUpdate } from 'pinia'

let searchDebounceTimer = null

const resolveUrl = (raw, apiBase) => {
  if (!raw) return ''
  if (raw.startsWith('http')) return raw
  return (apiBase || '') + raw
}

const fromApi = (c, apiBase) => ({
  id: c.id,
  name: c.name ?? '',
  slug: c.slug ?? '',
  description: c.description ?? '',
  parentCategoryId: c.parentCategory?.id ?? null,
  parentCategoryName: c.parentCategory?.name ?? null,
  coverMedia: c.coverMedia
    ? {
        id: c.coverMedia.id,
        fileUrl: resolveUrl(c.coverMedia.fileUrl, apiBase),
        thumbnailUrl: c.coverMedia.thumbnailUrl ? resolveUrl(c.coverMedia.thumbnailUrl, apiBase) : resolveUrl(c.coverMedia.fileUrl, apiBase),
        altText: c.coverMedia.altText ?? '',
      }
    : null,
  translations: c.translations ?? {},
  createdById: c.createdById ?? '',
  createdAt: c.createdAt ?? '',
  updatedAt: c.updatedAt ?? '',
})

export const useArticleCategoryStore = defineStore('articleCategory', {
  state: () => ({
    items: [],
    loading: false,
    searchQuery: '',
    pagination: { page: 0, size: 20, totalElements: 0, totalPages: 0 },
  }),

  getters: {
    roots: (state) => state.items.filter((c) => !c.parentCategoryId),
    byId: (state) => (id) => state.items.find((c) => c.id === id),
    asOptions: (state) => state.items.map((c) => ({ label: c.name, value: c.id })),
  },

  actions: {
    _apiBase() {
      const tmpServer = useCookie('tmp_server').value
      const { config } = helper()
      return (tmpServer || config.apiUrl || '').replace(/\/$/, '')
    },

    setSearch(query) {
      this.searchQuery = query
      clearTimeout(searchDebounceTimer)
      searchDebounceTimer = setTimeout(() => this.fetchCategories(0), 350)
    },

    async fetchCategories(page = 0) {
      this.loading = true
      try {
        const { data, error } = await useHttp('/api/v1/articles/categories/list', {
          method: 'POST',
          body: {
            page: page + 1,
            pageSize: this.pagination.size,
            search: this.searchQuery || '',
            sort: { field: 'createdAt', direction: 'DESC' },
          },
          isGlobal: true,
        })
        if (error?.value) return
        const result = data.value?.data ?? data.value
        const base = this._apiBase()
        this.items = (result?.content ?? []).map((c) => fromApi(c, base))
        this.pagination = {
          page: result?.page ?? 0,
          size: result?.size ?? 20,
          totalElements: result?.totalElements ?? 0,
          totalPages: result?.totalPages ?? 1,
        }
      } finally {
        this.loading = false
      }
    },

    async addCategory(form) {
      const { data, error, status } = await useHttp('/api/v1/articles/categories', {
        method: 'POST',
        body: {
          name: form.name,
          slug: form.slug || null,
          description: form.description ?? null,
          parentCategoryId: form.parentCategoryId || null,
          coverMediaId: form.coverMediaId || null,
          translations: form.translations ?? null,
        },
        isGlobal: true,
      })
      if (error?.value) return { error: error.value?.message || 'Failed to create category' }
      const created = fromApi(data.value?.data ?? data.value, this._apiBase())
      this.items.push(created)
      return { data: created }
    },

    async updateCategory(id, form) {
      const { data, error, status } = await useHttp(`/api/v1/articles/categories/${id}`, {
        method: 'PUT',
        body: {
          name: form.name,
          slug: form.slug || null,
          description: form.description ?? null,
          parentCategoryId: form.parentCategoryId || null,
          coverMediaId: form.coverMediaId || null,
          translations: form.translations ?? null,
        },
        isGlobal: true,
      })
      if (error?.value) return { error: error.value?.message || 'Failed to update category' }
      const updated = fromApi(data.value?.data ?? data.value, this._apiBase())
      const idx = this.items.findIndex((c) => c.id === id)
      if (idx !== -1) this.items[idx] = updated
      return { data: updated }
    },

    async deleteCategory(id) {
      const { error } = await useHttp(`/api/v1/articles/categories/${id}`, {
        method: 'DELETE',
        isGlobal: true,
      })
      if (error?.value) return { error: error.value?.message || 'Failed to delete category' }
      const idx = this.items.findIndex((c) => c.id === id)
      if (idx !== -1) this.items.splice(idx, 1)
      return { data: true }
    },
  },
})

// make sure to pass the right store definition, `useAuth` in this case.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useArticleCategoryStore, import.meta.hot))
}
