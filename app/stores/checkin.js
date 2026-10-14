// stores/checkin.js — Check-in connected to Spring API
// POST /api/v1/weddings/{id}/checkin (CheckinRequest: guestId, checkinMethod, deviceInfo)
// POST /api/v1/weddings/{id}/checkin/qr/{qrCode}
// GET  /api/v1/weddings/{id}/checkin/logs
import { defineStore, acceptHMRUpdate } from 'pinia'

const fromLog = (l) => ({
  id: l.id,
  guestId: l.guestId,
  guestName: l.guestName ?? '',
  checkinMethod: l.checkinMethod ?? 'MANUAL',
  deviceInfo: l.deviceInfo ?? '',
  checkinTime: l.checkedInAt ?? l.checkinTime ?? l.createdAt ?? new Date().toISOString(),
})

export const useCheckinStore = defineStore('checkin', {
  state: () => ({
    logs: [],
    loading: false,
    scanning: false,
    lastResult: null,
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
  }),

  getters: {
    totalCheckins: (state) => state.logs.length,
    manualCheckins: (state) => state.logs.filter((l) => l.checkinMethod === 'MANUAL'),
    qrCheckins: (state) => state.logs.filter((l) => l.checkinMethod === 'QR'),
  },

  actions: {
    _weddingId() {
      return useEventStore().activeEvent?.id
    },

    async fetchLogs(page = 0) {
      const id = this._weddingId()
      if (!id) return
      this.loading = true
      try {
        const { data } = await useHttp(`/api/v1/events/${id}/checkin/logs?page=${page}&size=${this.size}&pagination=true`, {
          method: 'GET',
          isGlobal: true,
        })
        const result = data.value?.data ?? data.value
        const content = result?.content ?? result ?? []
        this.logs = Array.isArray(content) ? content.map(fromLog) : []
        this.page = result?.page ?? page
        this.totalElements = result?.totalElements ?? this.logs.length
        this.totalPages = result?.totalPages ?? 1
      } finally {
        this.loading = false
      }
    },

    async checkinGuest(guestId, method = 'MANUAL', deviceInfo = '') {
      const id = this._weddingId()
      if (!id) return { success: false }
      const { data, error, status } = await useHttp(`/api/v1/events/${id}/checkin`, {
        method: 'POST',
        body: { guestId, checkinMethod: method, deviceInfo },
        isGlobal: true,
      })
      if (error.value) return { success: false, error: error.value }
      this.lastResult = data.value?.data ?? data.value
      return { success: true, data: this.lastResult }
    },

    async checkinByQr(qrCode) {
      const id = this._weddingId()
      if (!id) return { success: false }
      this.scanning = true
      try {
        const { data, error, status } = await useHttp(
          `/api/v1/events/${id}/checkin/qr/${encodeURIComponent(qrCode)}`,
          { method: 'POST', isGlobal: true }
        )
        if (error.value) return { success: false, error: error.value }
        this.lastResult = data.value?.data ?? data.value
        return { success: true, data: this.lastResult }
      } finally {
        this.scanning = false
      }
    },

    setWeddingId(id) {
      if (id) this.fetchLogs()
    },
  },
})

// make sure to pass the right store definition, `useAuth` in this case.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCheckinStore, import.meta.hot))
}