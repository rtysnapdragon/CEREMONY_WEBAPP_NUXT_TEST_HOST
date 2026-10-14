// stores/budget.js — Budget connected to Spring API
// GET/POST/PUT/DELETE /api/v1/weddings/{id}/budgets
// GET /api/v1/weddings/{id}/finance/summary

import { defineStore, acceptHMRUpdate } from 'pinia'

const STATUS_MAP = { UNPAID: 'unpaid', PARTIAL: 'partial', PAID: 'paid' }
const STATUS_TO_API = { unpaid: 'UNPAID', partial: 'PARTIAL', paid: 'PAID' }

const fromApi = (b) => ({
  id: b.id,
  category: b.category ?? '',
  vendorName: b.vendorName ?? '',
  plannedAmount: Number(b.plannedAmount ?? 0),
  actualAmount: Number(b.actualAmount ?? 0),
  variance: Number(b.variance ?? 0),
  paymentStatus: STATUS_MAP[b.paymentStatus] ?? 'unpaid',
  notes: b.notes ?? '',
  createdAt: b.createdAt,
})

const toApi = (form) => ({
  category: form.category,
  plannedAmount: Number(form.plannedAmount ?? 0),
  actualAmount: Number(form.actualAmount ?? 0),
  vendorName: form.vendorName ?? '',
  paymentStatus: STATUS_TO_API[form.paymentStatus] ?? 'UNPAID',
  notes: form.notes ?? '',
})

export const useBudgetStore = defineStore('budget', {
  state: () => ({
    items: [],
    summary: null,
    loading: false,
    page: 0,
    totalPages: 0,
    totalElements: 0,
  }),

  getters: {
    totalBudget: (state) =>
      Number(state.summary?.totalPlanned ?? state.items.reduce((s, i) => s + i.plannedAmount, 0)),
    totalSpent: (state) =>
      Number(state.summary?.totalActualExpenses ?? state.items.reduce((s, i) => s + i.actualAmount, 0)),
    remaining(state) {
      return this.totalBudget - this.totalSpent
    },
    usagePercent(state) {
      return this.totalBudget
        ? Math.min(100, Math.round((this.totalSpent / this.totalBudget) * 100))
        : 0
    },
    categories: (state) => {
      const map = {}
      state.items.forEach((b) => {
        if (!map[b.category])
          map[b.category] = { id: b.category, name: b.category, budget: 0, spent: 0, items: [] }
        map[b.category].budget += b.plannedAmount
        map[b.category].spent += b.actualAmount
        map[b.category].items.push(b)
      })
      return Object.values(map)
    },
    transactions: (state) => state.items,
  },

  actions: {
    _weddingId() {
      return useEventStore().activeEvent?.id
    },

    async fetchBudgets(p = 0) {
      const id = this._weddingId()
      if (!id) return
      this.loading = true
      try {
        const { data } = await useHttp(`/api/v1/events/${id}/budgets/list`, {
          method: 'POST',
          body: {
            page: p + 1,
            pageSize: 50,
            search: '',
            sort: { field: 'createdAt', direction: 'DESC' },
          },
          isGlobal: true,
        })
        const result = data.value?.data ?? data.value
        const content = result?.content ?? result ?? []
        this.items = Array.isArray(content) ? content.map(fromApi) : []
        this.totalPages = result?.totalPages ?? 1
        this.totalElements = result?.totalElements ?? this.items.length
        this.page = p
      } finally {
        this.loading = false
      }
    },

    async fetchSummary() {
      const id = this._weddingId()
      if (!id) return
      try {
        const { data } = await useHttp(`/api/v1/events/${id}/finance/summary`, {
          method: 'GET',
          isGlobal: true,
        })
        this.summary = data.value?.data ?? data.value
      } catch {}
    },

    async addBudget(form) {
      const id = this._weddingId()
      if (!id) return { success: false }
      const { data, error, status } = await useHttp(`/api/v1/events/${id}/budgets`, {
        method: 'POST',
        body: toApi(form),
        isGlobal: true,
      })
      if (error.value) return { success: false, error: error.value }
      const created = fromApi(data.value?.data ?? data.value)
      await this.fetchBudgets(this.page)
      await this.fetchSummary()
      return { success: true, data: created }
    },

    async updateBudget(budgetId, form) {
      const id = this._weddingId()
      if (!id) return { success: false }
      const { error } = await useHttp(`/api/v1/events/${id}/budgets/${budgetId}`, {
        method: 'PUT',
        body: toApi(form),
        isGlobal: true,
      })
      if (error.value) return { success: false, error: error.value }
      await this.fetchBudgets(this.page)
      await this.fetchSummary()
      return { success: true }
    },

    async deleteBudget(budgetId) {
      const id = this._weddingId()
      if (!id) return { success: false }
      const { error } = await useHttp(`/api/v1/events/${id}/budgets/${budgetId}`, {
        method: 'DELETE',
        isGlobal: true,
      })
      if (error.value) return { success: false, error: error.value }
      const _bidx = this.items.findIndex((b) => b.id === budgetId); if (_bidx !== -1) this.items.splice(_bidx, 1)
      await this.fetchSummary()
      return { success: true }
    },

    setWeddingId(id) {
      if (id) this.fetchBudgets(0)
    },
  },
})

// make sure to pass the right store definition, `useAuth` in this case.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useBudgetStore, import.meta.hot))
}
