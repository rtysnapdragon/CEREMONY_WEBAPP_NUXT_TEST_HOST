import { defineStore,acceptHMRUpdate } from 'pinia'

export const useInvitationsStore = defineStore('invitations', {
  state: () => ({
    items: [],
    loading: false,
    weddingId: null,
    templates: [],
    activeTemplate: null,
    templatesFetchedAt: 0,
    // pagination state
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
    // filters (kept in store so page can reset them)
    search: '',
    filterStatus: '',
    filterOpen: '',
  }),

  getters: {
    sentCount:      (s) => s.items.filter((i) => i.invitationStatus === 'SENT').length,
    openedCount:    (s) => s.items.filter((i) => i.opened).length,
    confirmedCount: (s) => s.items.filter((i) => i.guestStatus === 'CONFIRMED').length,
    failedCount:    (s) => s.items.filter((i) => i.invitationStatus === 'FAILED').length,
  },

  actions: {
    async fetch(weddingId, { page = 0, size = 20, search = '', filterStatus = '', filterOpen = '' } = {}) {
      this.loading = true
      this.weddingId = weddingId
      this.page = page
      this.search = search
      this.filterStatus = filterStatus
      this.filterOpen = filterOpen
      try {
        const params = new URLSearchParams({
          page: String(page),
          size: String(size),
          search,
          status: filterStatus,
          filterOpen,
          sortBy: 'name',
          sortDir: 'asc',
        })
        const { data, error } = await useHttp(`/api/v1/events/${weddingId}/invitations?${params}`, {
          method: 'GET', isGlobal: true,
        })
        if (error?.value) throw new Error(error.value?.message || 'Failed to fetch invitations')
        const res = data?.value?.data ?? data?.value
        // flat array: [{...fields, totalRecords: N}, ...]
        this.items = Array.isArray(res) ? res : []
        this.totalElements = this.items[0]?.totalRecords ?? this.items.length
        this.totalPages = Math.ceil(this.totalElements / size) || 1
      } finally {
        this.loading = false
      }
    },

    async fetchPage(page) {
      return this.fetch(this.weddingId, {
        page,
        size: this.size,
        search: this.search,
        filterStatus: this.filterStatus,
        filterOpen: this.filterOpen,
      })
    },

    async fetchTemplates({ force = false } = {}) {
      if (!force && this.templates.length > 0) return
      const { data, error } = await useHttp('/api/v1/invitation-templates', {
        method: 'GET', isGlobal: true,
      })
      if (error?.value) throw new Error(error.value?.message || 'Failed to fetch templates')
      const res = data?.value?.data ?? data?.value
      this.templates = Array.isArray(res) ? res : (res?.content || [])
      this.activeTemplate = this.templates.find((t) => t.isActive) ?? null
      this.templatesFetchedAt = Date.now()
    },

    async setActiveTemplate(templateId) {
      const { data, error } = await useHttp(`/api/v1/invitation-templates/active/${templateId}`, {
        method: 'PUT', isGlobal: true,
      })
      if (error?.value) throw new Error(error.value?.message || 'Failed to set active template')
      this.templates = this.templates.map((t) => ({ ...t, isActive: t.templateId === templateId }))
      this.activeTemplate = this.templates.find((t) => t.isActive) ?? null
    },

    // ── Event-type template actions ─────────────────────────────────────────

    async fetchTemplatesByEventType(eventTypeId) {
      const { data, error } = await useHttp(`/api/v1/invitation-templates/by-event-type/${eventTypeId}`, {
        method: 'GET', isGlobal: true,
      })
      if (error?.value) throw new Error(error.value?.message || 'Failed to fetch templates by event type')
      const res = data?.value?.data ?? data?.value
      return Array.isArray(res) ? res : []
    },

    async fetchAdminEventTypeTemplates(eventTypeId) {
      const { data, error } = await useHttp(`/api/v1/admin/invitation-templates/event-type/${eventTypeId}`, {
        method: 'GET', isGlobal: true,
      })
      if (error?.value) throw new Error(error.value?.message || 'Failed to fetch event type templates')
      const res = data?.value?.data ?? data?.value
      return Array.isArray(res) ? res : []
    },

    async fetchAdminTemplateEventTypes(templateId) {
      const { data, error } = await useHttp(`/api/v1/admin/invitation-templates/${templateId}/event-types`, {
        method: 'GET', isGlobal: true,
      })
      if (error?.value) throw new Error(error.value?.message || 'Failed to fetch template event types')
      const res = data?.value?.data ?? data?.value
      return Array.isArray(res) ? res : []
    },

    async assignTemplateToEventType(templateId, eventTypeId) {
      const { data, error } = await useHttp(
        `/api/v1/admin/invitation-templates/${templateId}/event-types/${eventTypeId}`,
        { method: 'POST', isGlobal: true },
      )
      if (error?.value) throw new Error(error.value?.message || 'Failed to assign template to event type')
      return data?.value?.data ?? data?.value
    },

    async revokeTemplateFromEventType(templateId, eventTypeId) {
      const { error } = await useHttp(
        `/api/v1/admin/invitation-templates/${templateId}/event-types/${eventTypeId}`,
        { method: 'DELETE', isGlobal: true },
      )
      if (error?.value) throw new Error(error.value?.message || 'Failed to revoke template from event type')
    },

    async sendTelegram(weddingId, guestId) {
      const { error } = await useHttp(
        `/api/v1/events/${weddingId}/guests/${guestId}/telegram/send`,
        { method: 'POST', isGlobal: true },
      )
      if (error?.value) throw new Error(error.value?.message || 'Failed to send Telegram')
      await this.fetchPage(this.page)
    },

    async sendEmail(weddingId, guestId) {
      const { error } = await useHttp(
        `/api/v1/events/${weddingId}/guests/${guestId}/email/send`,
        { method: 'POST', isGlobal: true },
      )
      if (error?.value) throw new Error(error.value?.data?.message || error.value?.message || 'Failed to send email')
      await this.fetchPage(this.page)
    },

    async sendAllTelegram(weddingId, status = '') {
      const url = `/api/v1/events/${weddingId}/telegram/send-all${status ? `?status=${status}` : ''}`
      const { data, error, status: httpStatus } = await useHttp(url, { method: 'POST', isGlobal: true })
      if (handleAuthError(httpStatus)) return
      if (error?.value) throw new Error(error.value?.message || 'Bulk Telegram send failed')
      return data?.value?.data ?? data?.value
    },

    async sendAllEmail(weddingId, status = '') {
      const url = `/api/v1/events/${weddingId}/email/send-all${status ? `?status=${status}` : ''}`
      const { data, error, status: httpStatus } = await useHttp(url, { method: 'POST', isGlobal: true })
      if (handleAuthError(httpStatus)) return
      if (error?.value) throw new Error(error.value?.message || 'Bulk email send failed')
      return data?.value?.data ?? data?.value
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useInvitationsStore, import.meta.hot))
}
