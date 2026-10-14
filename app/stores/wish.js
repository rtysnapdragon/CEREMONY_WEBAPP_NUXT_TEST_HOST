// stores/wish.js — Wishes connected to Spring API
// GET /api/v1/weddings/{id}/wishes, DELETE /{id}
import { defineStore, acceptHMRUpdate } from 'pinia'

const fromApi = (w) => ({
  id: w.id,
  guestName: w.guestName ?? w.senderName ?? 'Anonymous',
  message: w.message ?? w.wish ?? '',
  createdAt: w.createdAt ?? w.submittedAt ?? new Date().toISOString(),
  isPublic: w.isPublic ?? true,
})

export const useWishStore = defineStore('wish', {
  state: () => ({
    items: [],
    loading: false,
    page: 0,
    totalPages: 0,
    totalElements: 0,
  }),

  getters: {
    publicWishes: (state) => state.items.filter((w) => w.isPublic),
    totalWishes: (state) => state.items.length,
    hasMore: (state) => state.page < state.totalPages - 1,
  },

  actions: {
    _weddingId() {
      return useEventStore().activeEvent?.id
    },

    async fetchWishes(p = 0) {
      const id = this._weddingId()
      if (!id) return
      this.loading = true
      try {
        const { data, error, status } = await useHttp(`/api/v1/events/${id}/wishes?page=${p}&size=20`, {
          method: 'GET',
          isGlobal: true,
        })
        const result = data.value?.data ?? data.value
        const content = result?.content ?? result ?? []
        this.items = Array.isArray(content) ? content.map(fromApi) : []
        this.totalPages = result?.totalPages ?? 1
        this.totalElements = result?.totalElements ?? this.items.length
        this.page = p
      } finally {
        this.loading = false
      }
    },

    async deleteWish(wishId) {
      const id = this._weddingId()
      if (!id) return { success: false }
      const { error } = await useHttp(`/api/v1/events/${id}/wishes/${wishId}`, {
        method: 'DELETE',
        isGlobal: true,
      })
      if (error.value) return { success: false, error: error.value }
      const idx = this.items.findIndex((w) => w.id === wishId)
      if (idx !== -1) this.items.splice(idx, 1)
      return { success: true }
    },

    setWeddingId(id) {
      if (id) this.fetchWishes(0)
    },
  },
})


// make sure to pass the right store definition, `useAuth` in this case.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useWishStore, import.meta.hot))
}