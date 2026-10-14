import { defineStore, acceptHMRUpdate } from 'pinia'


export const usePlanStore = defineStore('plan', {
  state: () => ({
    plan: null,
    loading: false,
  }),

  getters: {
    // Limits (-1 = unlimited)
    maxWeddings: (state) => state.plan?.maxWeddings ?? 1,
    maxGuests: (state) => state.plan?.maxGuestsPerWedding ?? 100,
    maxUsers: (state) => state.plan?.maxUsers ?? 3,

    // Feature flags
    canTelegram: (state) => state.plan?.telegramInvite ?? false,
    canEmail: (state) => state.plan?.emailInvite ?? false,
    canGallery: (state) => state.plan?.gallery ?? false,
    canWishes: (state) => state.plan?.wishes ?? false,
    canReports: (state) => state.plan?.reports ?? false,
    canExport: (state) => state.plan?.exportGuest ?? false,
    canBudget: (state) => state.plan?.budgetManagement ?? true,
    canTasks: (state) => state.plan?.taskManagement ?? true,

    planName: (state) => state.plan?.name ?? 'FREE',
    displayName: (state) => state.plan?.displayName ?? 'Free',
    isEnterprise: (state) => state.plan?.name === 'ENTERPRISE',
    isProfessional: (state) => state.plan?.name === 'PROFESSIONAL',
    isFree: (state) => !state.plan || state.plan.name === 'FREE',
  },

  actions: {
    async fetchPlan() {
      if (this.plan) return
      this.loading = true
      try {
        const { data, error, status } = await useHttp('/api/v1/organizations/my-plan', {
          method: 'GET',
          isGlobal: true,
        })
        if (!error?.value && status !== 401) {
          this.plan = data.value?.data ?? data.value
        }
      } finally {
        this.loading = false
      }
    },

    // Check if a numeric limit is reached given a current count
    isAtLimit(feature, current) {
      const limit = this[feature === 'weddings' ? 'maxWeddings'
        : feature === 'guests' ? 'maxGuests'
        : feature === 'users' ? 'maxUsers' : 'maxWeddings']
      return limit !== -1 && current >= limit
    },

    limitLabel(feature, current) {
      const limit = this[feature === 'weddings' ? 'maxWeddings'
        : feature === 'guests' ? 'maxGuests'
        : feature === 'users' ? 'maxUsers' : 'maxWeddings']
      if (limit === -1) return 'Unlimited'
      return `${current}/${limit}`
    },
  },
})


// make sure to pass the right store definition, `useAuth` in this case.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePlanStore, import.meta.hot))
}