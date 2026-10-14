import { defineStore ,acceptHMRUpdate} from 'pinia'
import { DEFAULT_STORE_TTL, isStoreFresh } from '~/utils/storeCache'

const DEMO_WEDDINGS = [
  {
    id: 'w1',
    title: 'Sokha & Dara',
    status: 'PLANNING',
    weddingDate: '2025-11-15',
    location: 'PP Palace Hotel',
    guestCount: 180,
    budget: 25000,
    organizationId: 'o1',
  },
  {
    id: 'w2',
    title: 'Lina & Vuth',
    status: 'CONFIRMED',
    weddingDate: '2026-02-08',
    location: 'Siem Reap Garden',
    guestCount: 120,
    budget: 18000,
    organizationId: 'o1',
  },
  {
    id: 'w3',
    title: 'Bopha & Rith',
    status: 'DONE',
    weddingDate: '2025-05-20',
    location: 'Kampot Villa',
    guestCount: 200,
    budget: 32000,
    organizationId: 'o1',
  },
  {
    id: 'w4',
    title: 'Maly & Sovann',
    status: 'PLANNING',
    weddingDate: '2026-03-12',
    location: 'BKK Skybar',
    guestCount: 90,
    budget: 15000,
    organizationId: 'o1',
  },
]

export const useWeddingStore = defineStore('wedding', {
  state: () => ({
    list: [],
    selectedId: (typeof window !== 'undefined' ? localStorage.getItem('sel_wedding') : null) || '',
    loading: false,
    lastFetchedAt: 0,
  }),

  getters: {
    selected:    (s) => s.list.find(w => w.id === s.selectedId) ?? null,
    hasWeddings: (s) => s.list.length > 0,
  },

  actions: {
    select(id) {
      this.selectedId = id
      if (typeof window !== 'undefined') localStorage.setItem('sel_wedding', id)
    },

    async load({ force = false, staleMs = DEFAULT_STORE_TTL } = {}) {
      if (!force && this.list.length > 0 && isStoreFresh(this.lastFetchedAt, staleMs)) return
      this.loading = true
      try {
        const auth = useAuthStore()
        if (auth.user?.isDemo) {
          this.list = DEMO_WEDDINGS
          this.lastFetchedAt = Date.now()
          if (!this.selectedId || !this.list.some((w) => w.id === this.selectedId)) {
            this.select(this.list[0].id)
          }
          return
        }

        if (typeof window !== 'undefined' && !navigator.onLine) {
          const cached = localStorage.getItem('cached_weddings')
          if (cached) this.list = JSON.parse(cached)
          // restore selectedId if valid
          if (!this.selectedId || !this.list.some(w => w.id === this.selectedId)) {
            if (this.list.length) this.select(this.list[0].id)
          }
          return
        }

        const { data: res, error, status } = await useHttp('/api/v1/events?page=0&size=50', { method: 'GET', isGlobal: true })
        const data = res?.value?.data ?? res?.value
        this.list = data?.content || []
        this.lastFetchedAt = Date.now()
        if (typeof window !== 'undefined') localStorage.setItem('cached_weddings', JSON.stringify(this.list))
        if (!this.selectedId || !this.list.some(w => w.id === this.selectedId)) {
          if (this.list.length) this.select(this.list[0].id)
          else this.select('')
        }
      } catch {
        // network error — fall back to cache
        if (typeof window !== 'undefined') {
          const cached = localStorage.getItem('cached_weddings')
          if (cached) this.list = JSON.parse(cached)
        }
        if (!this.selectedId || !this.list.some(w => w.id === this.selectedId)) {
          if (this.list.length) this.select(this.list[0].id)
          else this.select('')
        }
      }
      finally { this.loading = false }
    },
  },
})


// make sure to pass the right store definition, `useAuth` in this case.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useWeddingStore, import.meta.hot))
}