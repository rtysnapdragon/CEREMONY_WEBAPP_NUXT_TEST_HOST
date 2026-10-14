// stores/ceremony.js — Ceremony schedule connected to Spring API
// GET/POST/PUT/DELETE /api/v1/events/{eventId}/ceremonies
// CeremonyRequest: name, description, address, startTime, endTime, scheduleTime,
//                  durationMinutes, orderIndex, venueId, priority, type,
//                  totalBudget, status(PENDING/IN_PROGRESS/DONE), translations

import { defineStore, acceptHMRUpdate } from 'pinia'

const STATUS_MAP = { PENDING: 'pending', IN_PROGRESS: 'in-progress', DONE: 'done' }
const STATUS_TO_API = { pending: 'PENDING', 'in-progress': 'IN_PROGRESS', done: 'DONE' }

const fromApi = (c) => ({
  id: c.id,
  name: c.name ?? '',
  description: c.description ?? '',
  address: c.address ?? '',
  startTime: c.startTime ?? '',
  endTime: c.endTime ?? '',
  durationMinutes: c.durationMinutes ?? 60,
  scheduleTime: c.scheduleTime ?? '',
  orderIndex: c.orderIndex ?? 0,
  venueId: c.venueId ?? '',
  priority: c.priority ?? 'NORMAL',
  type: c.type ?? 'CEREMONY',
  totalBudget: Number(c.totalBudget ?? 0),
  status: STATUS_MAP[c.status] ?? 'pending',
  translations: c.translations ?? {},
})

function toScheduleTime(eventDate, startTime) {
  if (!eventDate || !startTime) return null

  const date = typeof eventDate === 'string'
    ? eventDate
    : eventDate.toString()

  let hh, mm, ss

  if (typeof startTime === 'string') {
    const parts = startTime.split(':')
    hh = parts[0] || ''
    mm = parts[1] || '00'
    ss = parts[2] || '00'
  } else {
    hh = String(startTime.hour ?? '').padStart(2, '0')
    mm = String(startTime.minute ?? '00').padStart(2, '0')
    ss = String(startTime.second ?? 0).padStart(2, '0')
  }

  if (!hh) return null

  // Local wall-clock time, no timezone/millis — matches backend
  // @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
  return `${date}T${hh}:${mm}:${ss}`
}

// Time (RTimeInputPicker) or "HH:mm" string → "HH:mm"
const toTimeStr = (v) => {
  if (!v) return ''
  if (typeof v === 'string') return v.slice(0, 5)
  if (v.hour != null) {
    return `${String(v.hour).padStart(2, '0')}:${String(v.minute ?? 0).padStart(2, '0')}`
  }
  return String(v).slice(0, 5)
}

const toApi = (form) => ({
  name: form.name,
  description: form.description ?? '',
  address: form.address ?? '',
  startTime: toTimeStr(form.startTime),
  endTime: toTimeStr(form.endTime),
  durationMinutes: Number(form.durationMinutes ?? 60),

  // Prefer eventDate + startTime; then scheduleTime (full datetime); then eventDate@00:00
  scheduleTime: toScheduleTime(form.eventDate, form.startTime)
    || padDateTime(form.scheduleTime)
    || toScheduleTime(form.eventDate, '00:00'),

  orderIndex: Number(form.orderIndex ?? 0),
  venueId: form.venueId || null,
  priority: form.priority || 'NORMAL',
  type: form.type?.Id ?? form.type ?? 'CEREMONY',
  totalBudget: Number(form.totalBudget ?? 0),
  status: STATUS_TO_API[form.status] ?? 'PENDING',
  translations: form.translations ?? undefined,
})

const padDateTime = (dt) => {
  if (!dt) return null
  if (dt.length === 16) return `${dt}:00`   // "yyyy-MM-ddTHH:mm" → add seconds
  return dt.substring(0, 19)                // strip millis/tz if present
}

export const useCeremonyStore = defineStore('ceremony', {
  state: () => ({
    items: [],
    loading: false,
    page: 0,
    totalPages: 0,
    totalElements: 0,
  }),

  getters: {
    pendingItems: (state) => state.items.filter((c) => c.status === 'pending'),
    inProgressItems: (state) => state.items.filter((c) => c.status === 'in-progress'),
    completedItems: (state) => state.items.filter((c) => c.status === 'done'),
  },

  actions: {
    _weddingId() {
      return useEventStore().activeEvent?.id
    },

    async fetchCeremonies() {
      const id = this._weddingId()
      if (!id) return
      this.loading = true
      try {
        const { data } = await useHttp(`/api/v1/events/${id}/ceremonies`, {
          method: 'GET',
          isGlobal: true,
        })
        const result = data.value?.data ?? data.value
        const content = result?.content ?? result ?? []
        this.items = Array.isArray(content)
          ? content.map(fromApi).sort((a, b) => a.orderIndex - b.orderIndex)
          : []
      } finally {
        this.loading = false
      }
    },

    async getCeremonyById(eventId) {
      if (!eventId) return []
      this.loading = true
      try {
        const { data } = await useHttp(`/api/v1/events/${eventId}/ceremonies`, {
          method: 'GET',
          isGlobal: true,
        })
        const result = data.value?.data ?? data.value
        const content = result?.content ?? result ?? []
        const list = Array.isArray(content)
          ? content.map(fromApi).sort((a, b) => a.orderIndex - b.orderIndex)
          : []
        this.items = list
        return list
      } finally {
        this.loading = false
      }
    },

    async addCeremony(form, eventId) {
      const payload = toApi(form)
      console.log(" Payload created =-> ", payload)
      const id = eventId || this._weddingId()
      if (!id) return { success: false }
      const { data, error } = await useHttp(`/api/v1/events/${id}/ceremonies/create`, {
        method: 'POST',
        data: payload,
        isGlobal: true,
      })
      if (error.value) return { success: false, error: error.value }
      const created = fromApi(data.value?.data ?? data.value ?? {})
      await this.fetchCeremonies()
      return { success: true, data: created }
    },

    async updateCeremony(ceremonyId, form, eventId) {
      const payload = toApi(form)
      console.log(" Payload updated=-> ", payload)
      const id = eventId || this._weddingId()
      if (!id) return { success: false }
      const { data, error } = await useHttp(`/api/v1/events/${id}/ceremonies/${ceremonyId}`, {
        method: 'PUT',
        data: payload,
        isGlobal: true,
      })
      if (error.value) return { success: false, error: error.value }
      const updated = fromApi(data.value?.data ?? data.value ?? {})
      await this.fetchCeremonies()
      return { success: true, data: updated }
    },

    async deleteCeremony(ceremonyId, eventId) {
      const id = eventId || this._weddingId()
      if (!id) return { success: false }
      const { error } = await useHttp(`/api/v1/events/${id}/ceremonies/${ceremonyId}`, {
        method: 'DELETE',
        isGlobal: true,
      })
      if (error.value) return { success: false, error: error.value }
      const _cidx = this.items.findIndex((c) => c.id === ceremonyId); if (_cidx !== -1) this.items.splice(_cidx, 1)
      return { success: true }
    },

    setWeddingId(id) {
      if (id) this.fetchCeremonies()
    },
  },
})

// make sure to pass the right store definition, `useAuth` in this case.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCeremonyStore, import.meta.hot))
}
