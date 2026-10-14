// stores/gallery.js — Gallery connected to Spring API
// GET/POST/DELETE /api/v1/weddings/{id}/gallery
import { defineStore, acceptHMRUpdate } from 'pinia'

const resolveUrl = (raw, apiBase) => {
  if (!raw) return ''
  if (raw.startsWith('http')) return raw
  return apiBase + raw
}

const VIDEO_EXTS = ['.mp4', '.mov', '.avi', '.webm', '.mkv']

const fromApi = (g, apiBase) => {
  const rawUrl = g.fileUrl ?? g.url ?? ''
  const url = resolveUrl(rawUrl, apiBase)
  const mime = g.fileType ?? g.type ?? ''
  const ext = rawUrl.split('?')[0].toLowerCase().slice(rawUrl.lastIndexOf('.'))
  const type = mime.startsWith('video/') || VIDEO_EXTS.includes(ext) ? 'video' : 'image'
  return {
    id: g.id,
    url,
    filename: g.filename ?? g.originalName ?? rawUrl.split('/').pop() ?? '',
    type,
    size: g.size ?? g.fileSize ?? 0,
    createdAt: g.createdAt ?? new Date().toISOString(),
    caption: g.caption ?? '',
  }
}

export const useGalleryStore = defineStore('gallery', {
  state: () => ({
    items: [],
    loading: false,
    uploading: false,
  }),

  getters: {
    images: (state) => state.items.filter((i) => i.type === 'image'),
    videos: (state) => state.items.filter((i) => i.type === 'video'),
    totalCount: (state) => state.items.length,
  },

  actions: {
    _weddingId() {
      return useEventStore().activeEvent?.id
    },

    _apiBase() {
      const tmpServer = useCookie('tmp_server').value
      const { config } = helper()
      return (tmpServer || config.apiUrl || '').replace(/\/$/, '')
    },

    async fetchGallery() {
      const id = this._weddingId()
      if (!id) return
      this.loading = true
      try {
        const { data } = await useHttp(`/api/v1/events/${id}/gallery`, {
          method: 'GET',
          isGlobal: true,
        })
        const result = data.value?.data ?? data.value
        const content = result?.content ?? result ?? []
        const base = this._apiBase()
        this.items = Array.isArray(content) ? content.map((g) => fromApi(g, base)) : []
      } finally {
        this.loading = false
      }
    },

    async uploadPhoto(file, caption = '') {
      const id = this._weddingId()
      if (!id) return { success: false }
      this.uploading = true
      try {
        const formData = new FormData()
        formData.append('file', file)
        if (caption) formData.append('caption', caption)
        const { data, error, status } = await useHttp(`/api/v1/events/${id}/gallery`, {
          method: 'POST',
          body: formData,
          isGlobal: true,
        })
        if (error.value) return { success: false, error: error.value }
        const item = data.value?.data ?? data.value
        if (item) this.items.push(fromApi(item, this._apiBase()))
        return { success: true }
      } finally {
        this.uploading = false
      }
    },

    async deletePhoto(photoId) {
      const id = this._weddingId()
      if (!id) return { success: false }
      const { error } = await useHttp(`/api/v1/events/${id}/gallery/${photoId}`, {
        method: 'DELETE',
        isGlobal: true,
      })
      if (error.value) return { success: false, error: error.value }
      const _gidx = this.items.findIndex((g) => g.id === photoId); if (_gidx !== -1) this.items.splice(_gidx, 1)
      return { success: true }
    },

    setWeddingId(id) {
      if (id) this.fetchGallery()
    },
  },
})


// make sure to pass the right store definition, `useAuth` in this case.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useGalleryStore, import.meta.hot))
}