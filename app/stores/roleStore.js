// stores/roleStore.js — Roles connected to Spring API
// GET/POST/PUT/DELETE /api/v1/roles, GET /roles/permissions
import { defineStore, acceptHMRUpdate } from 'pinia'

const fromApi = (r) => ({
  id: r.id,
  name: r.name ?? '',
  description: r.description ?? '',
  permissions: r.permissions ?? [],
})

export const useRoleStore = defineStore('roleStore', {
  state: () => ({
    items: [],
    permissions: [],
    loading: false,
  }),

  getters: {
    totalRoles: (state) => state.items.length,
    totalPermissions: (state) => state.permissions.length,
    getRoleById: (state) => (id) => state.items.find((r) => r.id === id),
  },

  actions: {
    async fetchRoles() {
      this.loading = true
      try {
        const { data, error, status } = await useHttp('/api/v1/roles', { method: 'GET', isGlobal: true })
        const result = data.value?.data ?? data.value
        const content = result?.content ?? result ?? []
        this.items = Array.isArray(content) ? content.map(fromApi) : []
      } finally {
        this.loading = false
      }
    },

    async fetchPermissions() {
      try {
        const { data, error, status } = await useHttp('/api/v1/roles/permissions', { method: 'GET', isGlobal: true })
        const result = data.value?.data ?? data.value
        this.permissions = Array.isArray(result) ? result : []
      } catch {}
    },

    async addRole(form) {
      const { data, error } = await useHttp('/api/v1/roles', {
        method: 'POST',
        body: {
          name: form.name,
          description: form.description ?? '',
          permissionIds: form.permissionIds ?? [],
        },
        isGlobal: true,
      })
      if (error.value) return { success: false, error: error.value }
      const created = fromApi(data.value?.data ?? data.value ?? {})
      await this.fetchRoles()
      return { success: true, data: created }
    },

    async updateRole(roleId, form) {
      const { error } = await useHttp(`/api/v1/roles/${roleId}`, {
        method: 'PUT',
        body: {
          name: form.name,
          description: form.description ?? '',
          permissionIds: form.permissionIds ?? [],
        },
        isGlobal: true,
      })
      if (error.value) return { success: false, error: error.value }
      await this.fetchRoles()
      return { success: true }
    },

    async deleteRole(roleId) {
      const { error } = await useHttp(`/api/v1/roles/${roleId}`, {
        method: 'DELETE',
        isGlobal: true,
      })
      if (error.value) return { success: false, error: error.value }
      const idx = this.items.findIndex((r) => r.id === roleId)
      if (idx !== -1) this.items.splice(idx, 1)
      return { success: true }
    },
  },
})


// make sure to pass the right store definition, `useAuth` in this case.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useRoleStore, import.meta.hot))
}