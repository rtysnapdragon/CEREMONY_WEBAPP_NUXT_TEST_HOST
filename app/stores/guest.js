// stores/guest.js — Guest store connected to Spring API
import  { useHttp }  from '~/composables/http.ts'
import { defineStore, acceptHMRUpdate } from 'pinia'

function sideFamilyToFrontend(sf) {
  if (!sf) return 'bride'
  return { BRIDE: 'bride', GROOM: 'groom', FRIEND: 'friend' }[sf] ?? 'bride'
}

function sideToSpring(side) {
  if (!side) return 'BRIDE'
  return (
    { bride: 'BRIDE', groom: 'GROOM', friend: 'FRIEND', family: 'BRIDE', colleague: 'BRIDE' }[
      side
    ] ?? side.toUpperCase()
  )
}

function statusToRsvp(status) {
  return (
    {
      CONFIRMED: 'confirmed',
      DECLINED: 'declined',
      ATTENDED: 'confirmed',
      INVITED: 'pending',
      NO_SHOW: 'declined',
    }[status] ?? 'pending'
  )
}

function rsvpToStatus(rsvp) {
  return { confirmed: 'CONFIRMED', declined: 'DECLINED', pending: 'INVITED' }[rsvp] ?? rsvp ?? 'INVITED'
}

const fromApi = (g) => ({
  id: g.id,
  name: g.name ?? '',
  email: g.email ?? '',
  phone: g.phone ?? '',
  gender: (g.gender ?? 'MALE').toLowerCase(),
  address: g.address ?? '',
  telegramChatId: g.telegramChatId ?? '',
  qrCode: g.qrCode ?? '',
  inviteToken: g.inviteToken ?? '',
  totalGuests: g.totalGuests ?? 1,
  seats: g.totalGuests ?? 1,
  side: sideFamilyToFrontend(g.sideFamily),
  sideFamily: g.sideFamily,
  rsvp: statusToRsvp(g.status),
  status: g.status ?? 'INVITED',
  dietary: g.mealPreference ?? '',
  mealPreference: g.mealPreference ?? '',
  notes: g.notes ?? '',
  code: g.code ?? '',
  checkedInAt: g.checkedInAt,
  telegramBotUrl: g.telegramBotUrl ?? '',
  createdAt: g.createdAt,
  updatedAt: g.updatedAt,
})

const toApi = (form) => ({
  name: form.name,
  phone: form.phone || null,
  email: form.email || null,
  gender: form.gender ? form.gender.toUpperCase() : null,
  address: form.address || null,
  telegramChatId: form.telegramChatId || null,
  totalGuests: form.seats ?? form.totalGuests ?? 1,
  sideFamily: sideToSpring(form.side ?? form.sideFamily),
  status: rsvpToStatus(form.rsvp ?? form.status),
  mealPreference: form.dietary ?? form.mealPreference ?? null,
  notes: form.notes || null,
  code: form.code || null,
})

export const useGuestStore = defineStore('guest', {
  state: () => ({
    guests: [],
    loading: false,
    searchQuery: '',
    filterRsvp: 'all',
    filterSide: 'all',
    pagination: { page: 0, size: 20, totalElements: 0, totalPages: 0 },
    currentWeddingId: useCookie('current_wedding_id').value || '',
  }),

  getters: {
    filteredGuests: (state) => state.guests,
    stats: (state) => ({
      total: state.pagination.totalElements || state.guests.length,
      confirmed: state.guests.filter((g) => g.rsvp === 'confirmed').length,
      pending: state.guests.filter((g) => g.rsvp === 'pending').length,
      declined: state.guests.filter((g) => g.rsvp === 'declined').length,
      totalSeats: state.guests.reduce((a, g) => a + (g.seats || 1), 0),
    }),
  },

  actions: {
    async fetchGuests(page = 0) {
      if (!this.currentWeddingId) return
      this.loading = true
      try {
        const filters = {}
        if (this.filterRsvp && this.filterRsvp !== 'all') filters.status = rsvpToStatus(this.filterRsvp)
        if (this.filterSide && this.filterSide !== 'all') filters.sideFamily = sideToSpring(this.filterSide)
        const { data, error, status } = await useHttp(
          `/api/v1/events/${this.currentWeddingId}/guests/list`,
          {
            method: 'POST',
            body: {
              page: page + 1,
              pageSize: this.pagination.size,
              search: this.searchQuery || '',
              sort: { field: 'createdAt', direction: 'DESC' },
              filters,
            },
            isGlobal: true,
          }
        )
        if (error?.value) {
          if (handleAuthError(status)) return
          return
        }
        const result = data.value?.data ?? data.value
        this.guests = (result?.content ?? []).map(fromApi)
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

    async fetchGuest(id) {
      if (!this.currentWeddingId || !id) return null
      this.loading = true
      try {
        const { data, error, status } = await useHttp(
          `/api/v1/events/${this.currentWeddingId}/guests/${id}`,
          { method: 'GET', isGlobal: true }
        )
        if (error?.value) {
          if (handleAuthError(status)) return null
          return null
        }
        return fromApi(data.value?.data ?? data.value)
      } finally {
        this.loading = false
      }
    },

    async addGuest(form) {
      if (!this.currentWeddingId) return null
      this.loading = true
      try {
        const { data, error, status } = await useHttp(
          `/api/v1/events/${this.currentWeddingId}/guests`,
          { method: 'POST', body: toApi(form), isGlobal: true }
        )
        if (error?.value) {
          if (handleAuthError(status)) return
          return
        }
        const created = fromApi(data.value?.data ?? data.value)
        this.guests.unshift(created)
        this.pagination.totalElements++
        return created
      } finally {
        this.loading = false
      }
    },

    async updateGuest(id, form) {
      if (!this.currentWeddingId) return null
      this.loading = true
      try {
        const { data, error, status } = await useHttp(
          `/api/v1/events/${this.currentWeddingId}/guests/${id}`,
          { method: 'PUT', body: toApi(form), isGlobal: true }
        )
        if (error?.value) {
          if (handleAuthError(status)) return
          return
        }
        const updated = fromApi(data.value?.data ?? data.value)
        const idx = this.guests.findIndex((g) => g.id === id)
        if (idx !== -1) this.guests[idx] = updated
        return updated
      } finally {
        this.loading = false
      }
    },

    async deleteGuest(id) {
      if (!this.currentWeddingId) return false
      this.loading = true
      try {
        const { error } = await useHttp(
          `/api/v1/events/${this.currentWeddingId}/guests/${id}`,
          { method: 'DELETE', isGlobal: true }
        )
        if (error?.value) {
          if (handleAuthError(status)) return
          return
        } false
        const _ggidx = this.guests.findIndex((g) => g.id === id); if (_ggidx !== -1) this.guests.splice(_ggidx, 1)
        this.pagination.totalElements--
        return true
      } finally {
        this.loading = false
      }
    },

    async importExcel(file, onProgress) {
      if (!this.currentWeddingId) return null
      const formData = new FormData()
      formData.append('file', file)
      this.loading = true
      try {
        // Use useCookie — same approach as useOptions.ts which works for all other requests
        const token = useCookie('access_token').value
        if (!token) {
          throw new Error('Not authenticated. Please log in again.')
        }
        const { config } = helper()
        const baseUrl = (useCookie('tmp_server').value || config.apiUrl || '').replace(/\/$/, '')

        const response = await fetch(
          `${baseUrl}/api/v1/events/${this.currentWeddingId}/guests/import`,
          { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData }
        )
        if (!response.ok) {
          const err = await response.json().catch(() => ({}))
          throw new Error(err?.message ?? `Import failed (${response.status})`)
        }

        // Read SSE stream line by line
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let result = null

        const parseLine = (line) => {
          if (line.startsWith('event:')) return { type: 'event', value: line.slice(6).trim() }
          if (line.startsWith('data:'))  return { type: 'data',  value: line.slice(5).trim() }
          return null
        }

        let currentEvent = null
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() // keep incomplete last line

          for (const raw of lines) {
            const line = raw.trimEnd()
            if (!line) { currentEvent = null; continue }
            const parsed = parseLine(line)
            if (!parsed) continue
            if (parsed.type === 'event') { currentEvent = parsed.value; continue }
            if (parsed.type === 'data') {
              try {
                const payload = JSON.parse(parsed.value)
                if (currentEvent === 'start' && onProgress) {
                  onProgress(0, payload.total)
                } else if (currentEvent === 'progress' && onProgress) {
                  const pct = payload.total > 0
                    ? Math.round((payload.saved / payload.total) * 100)
                    : 0
                  onProgress(pct, payload.total, payload.saved)
                } else if (currentEvent === 'done') {
                  result = payload
                  if (onProgress) onProgress(100, payload.imported, payload.imported)
                }
              } catch { /* malformed json — skip */ }
              currentEvent = null
            }
          }
        }

        await this.fetchGuests(0)
        return result
      } finally {
        this.loading = false
      }
    },

    setWeddingId(id) {
      this.currentWeddingId = id
      useCookie('current_wedding_id').value = id
      this.fetchGuests(0)
    },
  },
})


// make sure to pass the right store definition, `useAuth` in this case.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useGuestStore, import.meta.hot))
}
