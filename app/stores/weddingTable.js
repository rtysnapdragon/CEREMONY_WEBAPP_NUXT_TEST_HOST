// stores/weddingTable.js — Wedding tables connected to Spring API
// GET/POST/PUT/DELETE /api/v1/weddings/{id}/tables
// POST /api/v1/weddings/{id}/tables/assign, DELETE /tables/assign/{guestId}
// WeddingTableRequest: tableNumber, tableName, capacity, status(AVAILABLE/FULL/RESERVED)
import { defineStore, acceptHMRUpdate } from 'pinia'

const STATUS_MAP = { AVAILABLE: 'available', FULL: 'full', RESERVED: 'reserved' }
const STATUS_TO_API = { available: 'AVAILABLE', full: 'FULL', reserved: 'RESERVED' }

const fromApi = (t) => ({
  id: t.id,
  tableNumber: t.tableNumber ?? '',
  tableName: t.tableName ?? '',
  capacity: t.capacity ?? 0,
  occupancy: t.occupancy ?? 0,
  status: STATUS_MAP[t.status] ?? 'available',
  guests: t.guests ?? [],
})

const toApi = (form) => ({
  tableNumber: form.tableNumber,
  tableName: form.tableName ?? '',
  capacity: Number(form.capacity ?? 0),
  status: STATUS_TO_API[form.status] ?? 'AVAILABLE',
})

export const useWeddingTableStore = defineStore('weddingTable', {
  state: () => ({
    items: [],
    loading: false,
  }),

  getters: {
    availableTables: (state) => state.items.filter((t) => t.status === 'available'),
    fullTables: (state) => state.items.filter((t) => t.status === 'full'),
    totalCapacity: (state) => state.items.reduce((s, t) => s + t.capacity, 0),
    totalOccupancy: (state) => state.items.reduce((s, t) => s + t.occupancy, 0),
  },

  actions: {
    _weddingId() {
      return useEventStore().activeEvent?.id
    },

    async fetchTables() {
      const id = this._weddingId()
      if (!id) return
      this.loading = true
      try {
        const { data, error, status } = await useHttp(`/api/v1/events/${id}/tables`, {
          method: 'GET',
          isGlobal: true,
        })
        const result = data.value?.data ?? data.value
        const content = result?.content ?? result ?? []
        this.items = Array.isArray(content) ? content.map(fromApi) : []
      } finally {
        this.loading = false
      }
    },

    async addTable(form) {
      const id = this._weddingId()
      if (!id) return { success: false }
      const { data, error } = await useHttp(`/api/v1/events/${id}/tables`, {
        method: 'POST',
        body: toApi(form),
        isGlobal: true,
      })
      if (error.value) return { success: false, error: error.value }
      const created = fromApi(data.value?.data ?? data.value ?? {})
      await this.fetchTables()
      return { success: true, data: created }
    },

    async updateTable(tableId, form) {
      const id = this._weddingId()
      if (!id) return { success: false }
      const { data, error } = await useHttp(`/api/v1/events/${id}/tables/${tableId}`, {
        method: 'PUT',
        body: toApi(form),
        isGlobal: true,
      })
      if (error.value) return { success: false, error: error.value }
      await this.fetchTables()
      return { success: true }
    },

    async deleteTable(tableId) {
      const id = this._weddingId()
      if (!id) return { success: false }
      const { error } = await useHttp(`/api/v1/events/${id}/tables/${tableId}`, {
        method: 'DELETE',
        isGlobal: true,
      })
      if (error.value) return { success: false, error: error.value }
      const _tidx = this.items.findIndex((t) => t.id === tableId); if (_tidx !== -1) this.items.splice(_tidx, 1)
      return { success: true }
    },

    async assignGuest(tableId, guestId) {
      const id = this._weddingId()
      if (!id) return { success: false }
      const { error } = await useHttp(`/api/v1/events/${id}/tables/assign`, {
        method: 'POST',
        body: { tableId, guestId },
        isGlobal: true,
      })
      if (error.value) return { success: false, error: error.value }
      await this.fetchTables()
      return { success: true }
    },

    async unassignGuest(guestId) {
      const id = this._weddingId()
      if (!id) return { success: false }
      const { error } = await useHttp(`/api/v1/events/${id}/tables/assign/${guestId}`, {
        method: 'DELETE',
        isGlobal: true,
      })
      if (error.value) return { success: false, error: error.value }
      await this.fetchTables()
      return { success: true }
    },

    setWeddingId(id) {
      if (id) this.fetchTables()
    },
  },
})

// make sure to pass the right store definition, `useAuth` in this case.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useWeddingTableStore, import.meta.hot))
}