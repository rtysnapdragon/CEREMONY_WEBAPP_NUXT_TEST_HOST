// stores/notification.js — Notifications connected to Spring API
// GET /api/v1/notifications, GET /unread-count, PATCH /{id}/read, PATCH /read-all, DELETE /{id}
import { defineStore, acceptHMRUpdate } from 'pinia'

let searchDebounceTimer = null

// Map backend NotificationType enum → frontend display type
const TYPE_MAP = {
  WISH: 'wish', GIFT: 'gift', EMAIL: 'email', TELEGRAM: 'telegram', SMS: 'sms',
  SUCCESS: 'success', INFO: 'info', WARNING: 'warning', ERROR: 'error',
}

const fromApi = (n) => ({
  id: n.id,
  title: n.title ?? '',
  message: n.message ?? n.body ?? '',
  type: TYPE_MAP[n.type] ?? n.type ?? 'info',
  read: n.read ?? false,
  time: n.createdAt ?? n.time ?? new Date().toISOString(),
  link: n.link ?? null,
})

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
    loading: false,
    unreadCount: 0,
    searchQuery: '',
    filterType: 'ALL',   // 'ALL' | 'WISH' | 'GIFT' | 'EMAIL' | 'TELEGRAM' | 'SMS'
    filterRead: null,    // null = all, false = unread, true = read
    pagination: { page: 0, size: 20, totalElements: 0, totalPages: 0 },
  }),

  getters: {
    unreadNotifications: (state) => state.notifications.filter((n) => !n.read),
    hasUnread: (state) => state.unreadCount > 0,
  },

  actions: {
    setSearch(query) {
      this.searchQuery = query
      clearTimeout(searchDebounceTimer)
      searchDebounceTimer = setTimeout(() => this.fetchNotifications(0), 350)
    },

    setFilterType(type) {
      this.filterType = type
      this.fetchNotifications(0)
    },

    setFilterRead(read) {
      this.filterRead = read
      this.fetchNotifications(0)
    },

    async fetchNotifications(page = 0) {
      this.loading = true
      try {
        const filters = {}
        if (this.filterType !== 'ALL') filters.type = this.filterType
        if (this.filterRead !== null) filters.read = this.filterRead

        const { data, error } = await useHttp('/api/v1/notifications/list', {
          method: 'POST',
          body: {
            page: page + 1,
            pageSize: this.pagination.size,
            search: this.searchQuery || '',
            sort: { field: 'createdAt', direction: 'DESC' },
            filters,
          },
          isGlobal: true,
        })
        if (error?.value) return
        const result = data.value?.data ?? data.value
        const content = result?.content ?? result ?? []
        this.notifications = Array.isArray(content) ? content.map(fromApi) : []
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

    async fetchUnreadCount() {
      try {
        const { data, error, status } = await useHttp('/api/v1/notifications/unread-count', {
          method: 'GET',
          isGlobal: true,
        })
        const result = data.value?.data ?? data.value ?? {}
        this.unreadCount = result?.count ?? result ?? 0
      } catch {}
    },

    async markRead(id) {
      const { error, status } = await useHttp(`/api/v1/notifications/${id}/read`, {
        method: 'PATCH',
        isGlobal: true,
      })
      if (!error.value && status !== 401) {
        const n = this.notifications.find((n) => n.id === id)
        if (n) {
          n.read = true
          this.unreadCount = Math.max(0, this.unreadCount - 1)
        }
      }
    },

    async markAllRead() {
      const { error, status } = await useHttp('/api/v1/notifications/read-all', {
        method: 'PATCH',
        isGlobal: true,
      })
      if (!error.value && status !== 401) {
        this.notifications.forEach((n) => (n.read = true))
        this.unreadCount = 0
      }
    },

    async deleteNotification(id) {
      const { error, status } = await useHttp(`/api/v1/notifications/${id}`, {
        method: 'DELETE',
        isGlobal: true,
      })
      if (!error.value && status !== 401) {
        const _nidx = this.notifications.findIndex((n) => n.id === id); if (_nidx !== -1) this.notifications.splice(_nidx, 1)
      }
    },

    addNotification(data) {
      this.notifications.unshift({
        id: 'n-' + Date.now(),
        time: new Date().toISOString(),
        read: false,
        ...data,
      })
      this.unreadCount++
    },
  },
})


// make sure to pass the right store definition, `useAuth` in this case.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useNotificationStore, import.meta.hot))
}