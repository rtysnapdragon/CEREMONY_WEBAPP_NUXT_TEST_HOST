// stores/media.js — Media library connected to Spring API
// GET/POST/PUT/DELETE /api/v1/media
import { defineStore, acceptHMRUpdate } from 'pinia'

let searchDebounceTimer = null

const fromApi = (m, apiBase) => ({
  id: m.id,
  fileName: m.fileName ?? '',
  originalName: m.originalName ?? m.fileName ?? '',
  fileUrl: resolveUrl(m.fileUrl, apiBase),
  thumbnailUrl: m.thumbnailUrl ? resolveUrl(m.thumbnailUrl, apiBase) : resolveUrl(m.fileUrl, apiBase),
  rawUrl: m.fileUrl ?? '',
  mimeType: m.mimeType ?? '',
  fileSize: m.fileSize ?? 0,
  mediaType: (m.mediaType ?? 'IMAGE').toUpperCase(),
  altText: m.altText ?? '',
  uploadedById: m.uploadedById ?? '',
  uploadedByName: m.uploadedByName ?? '',
  createdAt: m.createdAt ?? '',
  updatedAt: m.updatedAt ?? '',
})

const resolveUrl = (raw, apiBase) => {
  if (!raw) return ''
  if (raw.startsWith('http')) return raw
  return (apiBase || '') + raw
}

const MEDIA_TYPES = ['IMAGE', 'VIDEO', 'DOCUMENT', 'AUDIO']

export const useMediaStore = defineStore('media', {
  state: () => ({
    items: [],
    loading: false,
    uploading: false,
    pagination: { page: 0, size: 30, totalElements: 0, totalPages: 0 },
    filterType: 'ALL',
    searchQuery: '',
  }),

  getters: {
    // Filtering is server-side — items already reflect filterType + searchQuery
    filtered: (state) => state.items,
    images: (state) => state.items.filter((m) => m.mediaType === 'IMAGE'),
    videos: (state) => state.items.filter((m) => m.mediaType === 'VIDEO'),
    totalCount: (state) => state.pagination.totalElements,
  },

  actions: {
    _apiBase() {
      const tmpServer = useCookie('tmp_server').value
      const { config } = helper()
      return (tmpServer || config.apiUrl || '').replace(/\/$/, '')
    },

    setFilter(type) {
      this.filterType = type
      this.fetchMedia(0)
    },

    setSearch(query) {
      this.searchQuery = query
      clearTimeout(searchDebounceTimer)
      searchDebounceTimer = setTimeout(() => this.fetchMedia(0), 350)
    },

    async fetchAllIds() {
      const total = this.pagination.totalElements
      if (total === 0) return []
      if (total <= this.items.length) return this.items.map((m) => m.id)
      const filters = {}
      if (this.filterType !== 'ALL') filters.mediaType = this.filterType
      const { data, error } = await useHttp('/api/v1/media/list', {
        method: 'POST',
        body: {
          page: 1,
          pageSize: total,
          search: this.searchQuery || '',
          sort: { field: 'createdAt', direction: 'DESC' },
          filters,
        },
        isGlobal: true,
      })
      if (error?.value) return []
      const result = data.value?.data ?? data.value
      return (result?.content ?? []).map((m) => m.id)
    },

    async fetchMedia(page = 0) {
      this.loading = true
      try {
        const filters = {}
        if (this.filterType !== 'ALL') filters.mediaType = this.filterType
        const { data, error } = await useHttp('/api/v1/media/list', {
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
        this.items = (result?.content ?? []).map((m) => fromApi(m, base))
        this.pagination = {
          page: result?.page ?? 0,
          size: result?.size ?? 30,
          totalElements: result?.totalElements ?? 0,
          totalPages: result?.totalPages ?? 1,
        }
      } finally {
        this.loading = false
      }
    },

    async upload(file, altText = '', mediaType = null) {
      return this.uploadWithProgress(file, altText, mediaType, null)
    },

    uploadWithProgress(file, altText = '', mediaType = null, onProgress = null) {
      return new Promise((resolve) => {
        const base = this._apiBase()
        const token = useCookie('access_token').value
        const formData = new FormData()
        formData.append('file', file)
        if (altText) formData.append('altText', altText)
        if (mediaType) formData.append('mediaType', mediaType)

        const xhr = new XMLHttpRequest()
        xhr.open('POST', `${base}/api/v1/media/upload`)
        if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100))
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const json = JSON.parse(xhr.responseText)
              const item = fromApi(json.data ?? json, base)
              this.items.unshift(item)
              this.pagination.totalElements++
              resolve(item)
            } catch { resolve(null) }
          } else { resolve(null) }
        }

        xhr.onerror = () => resolve(null)
        xhr.send(formData)
      })
    },

    async update(id, { altText, mediaType }) {
      const { data, error, status } = await useHttp(`/api/v1/media/${id}`, {
        method: 'PUT',
        body: { altText, mediaType },
        isGlobal: true,
      })
      if (error?.value) {
          if (handleAuthError(status)) return
          return
        } { error: error.value?.message || 'Failed to update media' }
      const updated = fromApi(data.value?.data ?? data.value, this._apiBase())
      const idx = this.items.findIndex((m) => m.id === id)
      if (idx !== -1) this.items[idx] = updated
      return { data: updated }
    },

    async deleteMedia(id) {
      const { error } = await useHttp(`/api/v1/media/${id}`, {
        method: 'DELETE',
        isGlobal: true,
      })
      if (error?.value) {
          if (handleAuthError(status)) return
          return
        } { error: error.value?.message || 'Failed to delete media' }
      const idx = this.items.findIndex((m) => m.id === id)
      if (idx !== -1) this.items.splice(idx, 1)
      this.pagination.totalElements = Math.max(0, this.pagination.totalElements - 1)
      return { data: true }
    },

    async deleteAllMedia(ids) {
      const { data, error, status } = await useHttp('/api/v1/media/bulk', {
        method: 'DELETE',
        body: ids,
        isGlobal: true,
      })
      if (error?.value) {
        if (handleAuthError(status)) return
        return { deleted: 0, skipped: ids.length, error: error.value?.message }
      }
      const deletedIds = data.value?.data ?? []
      for (const id of deletedIds) {
        const idx = this.items.findIndex((m) => m.id === id)
        if (idx !== -1) this.items.splice(idx, 1)
      }
      this.pagination.totalElements = Math.max(0, this.pagination.totalElements - deletedIds.length)
      return { deleted: deletedIds.length, skipped: ids.length - deletedIds.length }
    },
  },
})


// make sure to pass the right store definition, `useAuth` in this case.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMediaStore, import.meta.hot))
}