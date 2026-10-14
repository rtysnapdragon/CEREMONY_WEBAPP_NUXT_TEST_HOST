import { defineStore ,acceptHMRUpdate} from 'pinia'

export interface DashboardStats {
  overview: {
    total_users: number
    total_content: number
    total_views: number
    total_likes: number
    total_comments: number
    total_messages: number
    active_users: number
  }
  today: {
    new_users: number
    new_content: number
    new_views: number
    new_likes: number
    new_comments: number
  }
  series: {
    users: Array<{ date: string; count: number }>
    views: Array<{ date: string; count: number }>
    likes: Array<{ date: string; count: number }>
    comments: Array<{ date: string; count: number }>
  }
  distributions: {
    roles: Record<string, number>
    content_status: Record<string, number>
    log_actions: Record<string, number>
  }
  top_content: Array<{
    id: number; title: string; views: number; likes: number; comments: number
  }>
  recent_logs: Array<{
    id: number; action: string; user_id: number | null; target_type: string | null
    description: string | null; status: string; ip: string | null; created_at: string | null
  }>
}

export interface RealtimeStats {
  views_last_5min: number
  likes_last_hour: number
  comments_last_hour: number
  messages_last_hour: number
  new_users_last_hour: number
}

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    stats: null as DashboardStats | null,
    realtime: null as RealtimeStats | null,
    loading: false,
    error: null as string | null,
    lastUpdated: null as number | null,
    pollingInterval: null as ReturnType<typeof setInterval> | null,
    activeUsers: 0,
  }),

  getters: {
    overview: (s) => s.stats?.overview,
    today:    (s) => s.stats?.today,
    series:   (s) => s.stats?.series,
    topContent: (s) => s.stats?.top_content ?? [],
    recentLogs: (s) => s.stats?.recent_logs ?? [],
  },

  actions: {
    async fetchStats() {
      this.loading = true
      try {
        const config = useRuntimeConfig()
        const data = await $fetch<DashboardStats>(`${config.public.apiBase}/api/analytics/dashboard`)
        this.stats = data
        this.lastUpdated = Date.now()
        this.error = null
      } catch (e: any) {
        // Use mock data if API not available
        this.stats = getMockStats()
        this.lastUpdated = Date.now()
      } finally {
        this.loading = false
      }
    },

    async fetchRealtime() {
      try {
        const config = useRuntimeConfig()
        const data = await $fetch<RealtimeStats>(`${config.public.apiBase}/api/analytics/realtime`)
        this.realtime = data
        this.activeUsers = Math.floor(Math.random() * 200) + 50 // fallback
      } catch {
        this.realtime = getMockRealtime()
        this.activeUsers = Math.floor(Math.random() * 200) + 50
      }
    },

    async refresh() {
      await Promise.all([this.fetchStats(), this.fetchRealtime()])
    },

    startPolling(intervalMs = 30000) {
      this.refresh()
      this.pollingInterval = setInterval(() => this.refresh(), intervalMs)
    },

    stopPolling() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval)
        this.pollingInterval = null
      }
    }
  }
})

// ── Mock data for development ─────────────────────────────
function getMockStats(): DashboardStats {
  const series = (base: number) =>
    Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0],
      count: Math.max(0, base + Math.floor(Math.random() * base * 0.4 - base * 0.2))
    }))

  return {
    overview: {
      total_users: 12847, total_content: 4532, total_views: 2847391,
      total_likes: 89234, total_comments: 34821, total_messages: 127445, active_users: 342
    },
    today: {
      new_users: 47, new_content: 23, new_views: 8932, new_likes: 1247, new_comments: 389
    },
    series: {
      users: series(35), views: series(8000), likes: series(900), comments: series(300)
    },
    distributions: {
      roles: { ADMIN: 5, MOD: 23, CREATOR: 1847, VIEWER: 10972 },
      content_status: { PUBLISHED: 3201, DRAFT: 891, ARCHIVED: 340, FLAGGED: 100 },
      log_actions: {
        LOGIN: 4521, UPLOAD: 892, LIKE: 3241, COMMENT: 1842,
        REGISTER: 247, VIEW: 12847, SHARE: 634, FLAG: 89
      }
    },
    top_content: Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      title: ['Sunset Over Angkor Wat', 'Abstract Digital Dreams', 'Street Photography Series',
        'Khmer Architecture Study', 'Nature Macro Collection', 'Urban Nightscapes',
        'Portrait Series Vol.3', 'Ocean Depths', 'Mountain Trails', 'City Skyline'][i],
      views: Math.floor(Math.random() * 50000) + 5000,
      likes: Math.floor(Math.random() * 5000) + 500,
      comments: Math.floor(Math.random() * 1000) + 50
    })).sort((a, b) => b.views - a.views),
    recent_logs: Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      action: ['LOGIN','UPLOAD','LIKE','COMMENT','REGISTER','VIEW','SHARE','FLAG'][Math.floor(Math.random() * 8)],
      user_id: Math.floor(Math.random() * 1000) + 1,
      target_type: ['USER','CONTENT','COMMENT'][Math.floor(Math.random() * 3)],
      description: ['User logged in successfully', 'New content uploaded', 'Content liked',
        'Comment posted', 'New user registered', 'Content viewed', 'Content shared', 'Content flagged'][Math.floor(Math.random() * 8)],
      status: Math.random() > 0.05 ? 'SUCCESS' : 'FAIL',
      ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      created_at: new Date(Date.now() - Math.random() * 3600000).toISOString()
    }))
  }
}

function getMockRealtime(): RealtimeStats {
  return {
    views_last_5min: Math.floor(Math.random() * 200) + 50,
    likes_last_hour: Math.floor(Math.random() * 500) + 100,
    comments_last_hour: Math.floor(Math.random() * 200) + 30,
    messages_last_hour: Math.floor(Math.random() * 1000) + 200,
    new_users_last_hour: Math.floor(Math.random() * 20) + 2,
  }
}


// make sure to pass the right store definition, `useAuth` in this case.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDashboardStore, import.meta.hot))
}