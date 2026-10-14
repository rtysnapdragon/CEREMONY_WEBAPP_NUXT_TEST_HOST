// stores/eventType.js — Event types connected to Spring API
// GET /api/v1/event-types
import { defineStore, acceptHMRUpdate } from 'pinia'

export const useEventTypeStore = defineStore('eventType', {
  state: () => ({
    types: [],
    loading: false,
    initialized: false,
    // Org-scoped supported event types
    myOrgEventTypes: [],
    myOrgEventTypesLoaded: false,
  }),

  getters: {
    activeTypes: (state) => state.types.filter((t) => t.active),
    byCode: (state) => (code) => state.types.find((t) => t.code === code),
    byId: (state) => (id) => state.types.find((t) => t.id === id),
    // IDs of event types this org supports — empty means no restriction
    myOrgEventTypeIds: (state) => state.myOrgEventTypes.map((t) => t.eventTypeId),
    // Active types filtered to org's allowed types (if any assigned)
    allowedTypes: (state) => {
      if (!state.myOrgEventTypes.length) return state.types.filter((t) => t.active)
      const allowed = new Set(state.myOrgEventTypes.map((t) => t.eventTypeId))
      return state.types.filter((t) => t.active && allowed.has(t.id))
    },
  },

  actions: {
    async fetchTypes() {
      if (this.initialized) return
      this.loading = true
      try {
        const { data, error } = await useHttp('/api/v1/event-types', {
          method: 'GET',
          isGlobal: true,
        })
        if (error?.value) return
        this.types = data.value?.data ?? data.value ?? []
        this.initialized = true
      } finally {
        this.loading = false
      }
    },

    async fetchMyOrgEventTypes({ force = false } = {}) {
      if (!force && this.myOrgEventTypesLoaded) return
      try {
        const { data, error } = await useHttp('/api/v1/organizations/my-event-types', {
          method: 'GET',
          isGlobal: true,
        })
        if (error?.value) return
        const res = data?.value?.data ?? data?.value
        this.myOrgEventTypes = Array.isArray(res) ? res : []
        this.myOrgEventTypesLoaded = true
      } catch {}
    },

    // Admin: assign event type to an org
    async assignEventTypeToOrg(orgId, eventTypeId) {
      const { data, error } = await useHttp(`/api/v1/organizations/${orgId}/event-types/${eventTypeId}`, {
        method: 'POST',
        isGlobal: true,
      })
      if (error?.value) throw new Error(error.value?.message || 'Failed to assign event type')
      return data?.value?.data ?? data?.value
    },

    // Admin: revoke event type from an org
    async revokeEventTypeFromOrg(orgId, eventTypeId) {
      const { error } = await useHttp(`/api/v1/organizations/${orgId}/event-types/${eventTypeId}`, {
        method: 'DELETE',
        isGlobal: true,
      })
      if (error?.value) throw new Error(error.value?.message || 'Failed to revoke event type')
    },

    // Admin: get event types for any org
    async fetchOrgEventTypes(orgId) {
      const { data, error } = await useHttp(`/api/v1/organizations/${orgId}/event-types`, {
        method: 'GET',
        isGlobal: true,
      })
      if (error?.value) return []
      const res = data?.value?.data ?? data?.value
      return Array.isArray(res) ? res : []
    },
  },
})


// make sure to pass the right store definition, `useAuth` in this case.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useEventTypeStore, import.meta.hot))
}
