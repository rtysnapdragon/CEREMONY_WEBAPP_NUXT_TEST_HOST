// stores/toast.js — Toast notifications store
import { defineStore, acceptHMRUpdate } from 'pinia'

export const useToastStore = defineStore('toast', {
  state: () => ({
    toasts: [],
  }),

  getters: {
    hasToasts: (state) => state.toasts.length > 0,
    toastCount: (state) => state.toasts.length,
  },

  actions: {
    add(toast) {
      const id = 'toast-' + Date.now()
      this.toasts.push({ id, duration: 4000, ...toast })
      setTimeout(() => this.remove(id), toast.duration || 4000)
      return id
    },

    remove(id) {
      const idx = this.toasts.findIndex((t) => t.id === id)
      if (idx !== -1) this.toasts.splice(idx, 1)
    },

    success(message, title = '') {
      return this.add({ type: 'success', title, message, icon: 'ri-checkbox-circle-line' })
    },

    error(message, title = '') {
      return this.add({ type: 'danger', title, message, icon: 'ri-error-warning-line' })
    },

    info(message, title = '') {
      return this.add({ type: 'info', title, message, icon: 'ri-information-line' })
    },

    warning(message, title = '') {
      return this.add({ type: 'warning', title, message, icon: 'ri-alert-line' })
    },
  },
})


// make sure to pass the right store definition, `useAuth` in this case.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useToastStore, import.meta.hot))
}