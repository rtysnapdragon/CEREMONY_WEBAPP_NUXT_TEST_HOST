import { defineStore, acceptHMRUpdate } from 'pinia'
import { useEventStore } from './event'

const fromApi = (e) => ({
  id: e.id,
  eventId: e.eventId ?? '',
  organizationId: e.organizationId ?? '',
  name: e.name ?? '',
  eventDate: e.eventDate ?? '',
  startTime: e.startTime ? e.startTime.substring(0, 5) : '',
  endTime: e.endTime ? e.endTime.substring(0, 5) : '',
  venueId: e.venueId ?? null,
  priority: e.priority ?? 0,
  type: e.type ?? '',
  totalBudget: e.totalBudget ?? 0,
  status: e.status ?? 'PLANNING',
  description: e.description ?? '',
  translations: e.translations ?? {},
  createdAt: e.createdAt ?? null,
  updatedAt: e.updatedAt ?? null,
})

const toApi = (form) => {
  const formatTime = (t) => {
    if (!t) return null
    if (t.hour != null) {
      return `${String(t.hour).padStart(2, '0')}:${String(t.minute).padStart(2, '0')}:00`
    }
    return t.length === 5 ? `${t}:00` : t
  }
  return {
    name: form.name,
    eventDate: form.eventDate ?? '',
    startTime: formatTime(form.startTime),
    endTime: formatTime(form.endTime),
    venueId: form.venueId || null,
    priority: form.priority ? Number(form.priority) : 0,
    type: form.type ?? '',
    totalBudget: form.totalBudget ? Number(form.totalBudget) : 0,
    status: form.status ?? 'PLANNING',
    description: form.description ?? '',
    translations: form.translations ?? null,
  }
}

export const useScheduleStore = defineStore('schedule', {
  state: () => ({
    items: [],
    loading: false,
  }),

  actions: {
    _eventId() {
      return useEventStore().activeEvent?.id
    },

    async fetchEvents(eventId) {
      const id = eventId || this._eventId()
      if (!id) return
      this.loading = true
      try {
        const { data } = await useHttp(`/api/v1/events/${id}/schedules`, {
          method: 'GET',
          isGlobal: true,
        })
        const result = data.value?.data ?? data.value ?? []
        this.items = Array.isArray(result) ? result.map(fromApi) : []
      } finally {
        this.loading = false
      }
    },

    async addEvent(form, eventId) {
      const id = eventId || this._eventId()
      if (!id) return { success: false }
      const { data, error } = await useHttp(`/api/v1/events/${id}/schedules/create`, {
        method: 'POST',
        body: toApi(form),
        isGlobal: true,
      })
      if (error?.value) return { success: false, error: error.value }
      const created = fromApi(data.value?.data ?? data.value ?? {})
      this.items.push(created)
      return { success: true, data: created }
    },

    async updateEvent(scheduleId, form, eventId) {
      const id = eventId || this._eventId()
      if (!id) return { success: false }
      const { data, error } = await useHttp(`/api/v1/events/${id}/schedules/${scheduleId}`, {
        method: 'PUT',
        body: toApi(form),
        isGlobal: true,
      })
      if (error?.value) return { success: false, error: error.value }
      const updated = fromApi(data.value?.data ?? data.value ?? {})
      const idx = this.items.findIndex((e) => e.id === scheduleId)
      if (idx !== -1) this.items.splice(idx, 1, updated)
      return { success: true, data: updated }
    },

    async deleteEvent(scheduleId, eventId) {
      const id = eventId || this._eventId()
      if (!id) return { success: false }
      const { error } = await useHttp(`/api/v1/events/${id}/schedules/${scheduleId}`, {
        method: 'DELETE',
        isGlobal: true,
      })
      if (error?.value) return { success: false, error: error.value }
      const idx = this.items.findIndex((e) => e.id === scheduleId)
      if (idx !== -1) this.items.splice(idx, 1)
      return { success: true }
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useScheduleStore, import.meta.hot))
}
