// stores/giftRecord.js — Gift records connected to Spring API
import { defineStore, acceptHMRUpdate } from 'pinia'

const fromApi = (g) => ({
  id: g.id,
  weddingId: g.weddingId,
  guestId: g.guestId ?? '',
  guestName: g.guestName ?? '—',
  amount: g.amount ? Number(g.amount) : 0,
  giftType: g.giftType ?? 'GIFT',
  type: g.giftType === 'CASH' ? 'cash' : 'item',
  description: g.description ?? '',
  receivedAt: g.receivedAt ? new Date(g.receivedAt).toISOString() : null,
  createdAt: g.createdAt,
  updatedAt: g.updatedAt,
})

const toApi = (form) => ({
  guestId: form.guestId || null,
  amount: form.type === 'cash' ? (parseFloat(form.amount) || 0) : null,
  giftType: form.type === 'cash' ? 'CASH' : 'GIFT',
  description: form.description || null,
  receivedAt: form.receivedAt
    ? new Date(form.receivedAt).toISOString().slice(0, 19)
    : new Date().toISOString().slice(0, 19),
})

export const useGiftStore = defineStore('giftRecord', {
  state: () => ({
    gifts: [],
    loading: false,
    pagination: { page: 0, size: 20, totalElements: 0, totalPages: 0 },
  }),

  getters: {
    stats: (state) => {
      const cashGifts = state.gifts.filter((g) => g.type === 'cash')
      const itemGifts = state.gifts.filter((g) => g.type === 'item')
      const totalCash = cashGifts.reduce((s, g) => s + g.amount, 0)
      return {
        total: state.pagination.totalElements || state.gifts.length,
        totalCash,
        itemCount: itemGifts.length,
        avgCash: cashGifts.length > 0 ? totalCash / cashGifts.length : 0,
      }
    },
    cashGifts: (state) => state.gifts.filter((g) => g.type === 'cash'),
    itemGifts: (state) => state.gifts.filter((g) => g.type === 'item'),
  },

  actions: {
    _weddingId() {
      return useEventStore().activeEvent?.id ?? ''
    },

    async fetchGifts(page = 0) {
      const id = this._weddingId()
      if (!id) return
      this.loading = true
      try {
        const { data, error, status } = await useHttp(
          `/api/v1/events/${id}/gifts?page=${page}&size=${this.pagination.size}&pagination=true`,
          { method: 'GET', isGlobal: true }
        )
        if (error?.value) {
          if (handleAuthError(status)) return
          return
        }
        const result = data.value?.data ?? data.value
        this.gifts = (result?.content ?? []).map(fromApi)
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

    async addGift(form) {
      const id = this._weddingId()
      if (!id) return null
      this.loading = true
      try {
        const { data, error, status } = await useHttp(`/api/v1/events/${id}/gifts`, {
          method: 'POST',
          body: toApi(form),
          isGlobal: true,
        })
        if (error?.value) {
          if (handleAuthError(status)) return
          return
        }
        const created = fromApi(data.value?.data ?? data.value)
        this.gifts.unshift(created)
        this.pagination.totalElements++
        return created
      } finally {
        this.loading = false
      }
    },

    async updateGift(giftId, form) {
      const id = this._weddingId()
      if (!id) return null
      this.loading = true
      try {
        const { data, error, status } = await useHttp(`/api/v1/events/${id}/gifts/${giftId}`, {
          method: 'PUT',
          body: toApi(form),
          isGlobal: true,
        })
        if (error?.value) {
          if (handleAuthError(status)) return
          return
        }
        const updated = fromApi(data.value?.data ?? data.value)
        const idx = this.gifts.findIndex((g) => g.id === giftId)
        if (idx !== -1) this.gifts[idx] = updated
        return updated
      } finally {
        this.loading = false
      }
    },

    async deleteGift(giftId) {
      const id = this._weddingId()
      if (!id) return false
      this.loading = true
      try {
        const { error } = await useHttp(`/api/v1/events/${id}/gifts/${giftId}`, {
          method: 'DELETE',
          isGlobal: true,
        })
        if (error?.value) {
          if (handleAuthError(status)) return
          return
        } false
        const _grdidx = this.gifts.findIndex((g) => g.id === giftId); if (_grdidx !== -1) this.gifts.splice(_grdidx, 1)
        this.pagination.totalElements--
        return true
      } finally {
        this.loading = false
      }
    },

    setWeddingId(id) {
      if (id) this.fetchGifts(0)
    },
  },
})


// make sure to pass the right store definition, `useAuth` in this case.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useGiftStore, import.meta.hot))
}