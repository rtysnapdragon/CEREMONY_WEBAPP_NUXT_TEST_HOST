// stores/article.js — Articles connected to Spring API
// GET/POST/PUT/DELETE /api/v1/articles

import { defineStore, acceptHMRUpdate } from 'pinia'
const fromApi = (a, apiBase) => ({
  id: a.id,
  title: a.title ?? '',
  slug: a.slug ?? '',
  content: a.content ?? '',
  excerpt: a.excerpt ?? '',
  status: (a.status ?? 'DRAFT').toUpperCase(),
  coverMedia: a.coverMedia
    ? {
        id: a.coverMedia.id,
        fileUrl: resolveUrl(a.coverMedia.fileUrl, apiBase),
        thumbnailUrl: a.coverMedia.thumbnailUrl
          ? resolveUrl(a.coverMedia.thumbnailUrl, apiBase)
          : resolveUrl(a.coverMedia.fileUrl, apiBase),
        altText: a.coverMedia.altText ?? '',
        mediaType: a.coverMedia.mediaType ?? 'IMAGE',
      }
    : null,
  images: Array.isArray(a.images)
    ? a.images.map((m) => ({
        id: m.id,
        fileUrl: resolveUrl(m.fileUrl, apiBase),
        thumbnailUrl: m.thumbnailUrl ? resolveUrl(m.thumbnailUrl, apiBase) : resolveUrl(m.fileUrl, apiBase),
        altText: m.altText ?? '',
        mediaType: m.mediaType ?? 'IMAGE',
      }))
    : [],
  category: a.category
    ? { id: a.category.id, name: a.category.name, slug: a.category.slug }
    : null,
  categoryId: a.category?.id ?? null,
  authorId: a.authorId ?? '',
  authorName: a.authorName ?? '',
  publishedAt: a.publishedAt ?? null,
  tags: a.tags ?? '',
  createdAt: a.createdAt ?? '',
  translations: a.translations ?? {},
  updatedAt: a.updatedAt ?? '',
})

const resolveUrl = (raw, apiBase) => {
  if (!raw) return ''
  if (raw.startsWith('http')) return raw
  return (apiBase || '') + raw
}

export const useArticleStore = defineStore('article', {
  state: () => ({
    items: [],
    loading: false,
    pagination: { page: 0, size: 20, totalElements: 0, totalPages: 0 },
    filterStatus: 'ALL',
    filterCategory: '',
    searchQuery: '',
  }),

  getters: {
    filtered: (state) => state.items,
    publishedCount: (state) => state.items.filter((a) => a.status === 'PUBLISHED').length,
    draftCount: (state) => state.items.filter((a) => a.status === 'DRAFT').length,
  },

  actions: {
    _apiBase() {
      const tmpServer = useCookie('tmp_server').value
      const { config } = helper()
      return (tmpServer || config.apiUrl || '').replace(/\/$/, '')
    },

    setStatusFilter(status) {
      this.filterStatus = status
      this.fetchArticles(0)
    },

    setCategoryFilter(categoryId) {
      this.filterCategory = categoryId
      this.fetchArticles(0)
    },

    async fetchArticles(page = 0) {
      this.loading = true
      try {
        const filters = {}
        if (this.filterStatus !== 'ALL') filters.status = this.filterStatus
        if (this.filterCategory) filters.categoryId = this.filterCategory
        const { data, error } = await useHttp('/api/v1/articles/list', {
          method: 'POST',
          body: {
            page: page + 1,
            pageSize: this.pagination.size,
            search: this.searchQuery || '',
            sort: { field: 'createdAt', direction: 'DESC' },
            filters,
          },
          isGlobal: true,
        })
        if (error?.value) return
        const result = data.value?.data ?? data.value
        const base = this._apiBase()
        this.items = (result?.content ?? []).map((a) => fromApi(a, base))
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

    async addArticle(form) {
      const { data, error, status } = await useHttp('/api/v1/articles', {
        method: 'POST',
        body: toApi(form),
        isGlobal: true,
      })
      if (error?.value) return { error: error.value?.message || 'Failed to create article' }
      const created = fromApi(data.value?.data ?? data.value, this._apiBase())
      this.items.unshift(created)
      this.pagination.totalElements++
      return { data: created }
    },

    async updateArticle(id, form) {
      const { data, error, status } = await useHttp(`/api/v1/articles/${id}`, {
        method: 'PUT',
        body: toApi(form),
        isGlobal: true,
      })
      if (error?.value) return { error: error.value?.message || 'Failed to update article' }
      const updated = fromApi(data.value?.data ?? data.value, this._apiBase())
      const idx = this.items.findIndex((a) => a.id === id)
      if (idx !== -1) this.items[idx] = updated
      return { data: updated }
    },

    async publishArticle(id) {
      const { data, error } = await useHttp(`/api/v1/articles/${id}/publish`, {
        method: 'POST',
        isGlobal: true,
      })
      if (error?.value) return { error: error.value?.message || 'Failed to publish article' }
      const updated = fromApi(data.value?.data ?? data.value, this._apiBase())
      const idx = this.items.findIndex((a) => a.id === id)
      if (idx !== -1) this.items[idx] = updated
      return { data: updated }
    },

    async archiveArticle(id) {
      const { data, error } = await useHttp(`/api/v1/articles/${id}/archive`, {
        method: 'POST',
        isGlobal: true,
      })
      if (error?.value) return { error: error.value?.message || 'Failed to archive article' }
      const updated = fromApi(data.value?.data ?? data.value, this._apiBase())
      const idx = this.items.findIndex((a) => a.id === id)
      if (idx !== -1) this.items[idx] = updated
      return { data: updated }
    },

    async deleteArticle(id) {
      const { error } = await useHttp(`/api/v1/articles/${id}`, {
        method: 'DELETE',
        isGlobal: true,
      })
      if (error?.value) return { error: error.value?.message || 'Failed to delete article' }
      const idx = this.items.findIndex((a) => a.id === id)
      if (idx !== -1) this.items.splice(idx, 1)
      this.pagination.totalElements = Math.max(0, this.pagination.totalElements - 1)
      return { data: true }
    },
  },
})

function toApi(form) {
  return {
    title: form.title,
    slug: form.slug || null,
    content: form.content ?? null,
    excerpt: form.excerpt ?? null,
    status: form.status || 'DRAFT',
    coverMediaId: form.coverMediaId || null,
    categoryId: form.categoryId || null,
    tags: form.tags ?? null,
    imageIds: Array.isArray(form.imageIds) ? form.imageIds : [],
    translations: form.translations ?? null,
  }
}

// make sure to pass the right store definition, `useAuth` in this case.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useArticleStore, import.meta.hot))
}
