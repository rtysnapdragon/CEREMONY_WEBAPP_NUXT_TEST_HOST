// Real-time polling against the actual WedBuilder Spring Boot API
// Dashboard stats: every 30s | Check-in count: every 5s | Gift total: every 10s

export const useLiveData = () => {
  const eventStore = useEventStore();
  const checkinStore = useCheckinStore();

  // Live stats fetched from /api/v1/weddings/{id}/dashboard
  const liveStats = ref<{
    totalGuests: number;
    confirmedGuests: number;
    attendedGuests: number;
    declinedGuests: number;
    checkedInCount: number;
    totalBudgetPlanned: number;
    totalBudgetActual: number;
    totalCashGifts: number;
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    totalTables: number;
    availableTables: number;
  } | null>(null);

  const lastUpdated = ref<Date | null>(null);
  const isPolling = ref(false);

  const weddingId = computed(() => eventStore.activeEvent?.id);

  async function fetchDashboard() {
    if (!weddingId.value) return;
    try {
      const { data } = await useHttp(
        `/api/v1/events/${weddingId.value}/dashboard`,
        {
          method: "GET",
          isGlobal: true,
        },
      );
      const res = data.value?.data ?? data.value;
      if (res) {
        liveStats.value = res;
        lastUpdated.value = new Date();
      }
    } catch {
      /* silent — stale data is fine */
    }
  }

  async function refreshCheckin() {
    if (!weddingId.value) return;
    try {
      await checkinStore.fetchLogs();
    } catch {
      /* silent */
    }
  }

  let dashboardTimer: ReturnType<typeof setInterval> | null = null;
  let checkinTimer: ReturnType<typeof setInterval> | null = null;

  const start = async () => {
    if (isPolling.value) return;
    isPolling.value = true;
    await fetchDashboard();
    // Full dashboard stats every 30s
    // dashboardTimer = setInterval(fetchDashboard, 30_000);
    // Check-in logs every 5s (fast refresh on event day)
    // checkinTimer = setInterval(refreshCheckin, 5_000)
  };

  const stop = () => {
    isPolling.value = false;
    if (dashboardTimer) {
      clearInterval(dashboardTimer);
      dashboardTimer = null;
    }
    if (checkinTimer) {
      clearInterval(checkinTimer);
      checkinTimer = null;
    }
  };

  // Restart when active wedding changes
  watch(weddingId, (id) => {
    if (id) {
      stop();
      start();
    }
  });

  onUnmounted(stop);

  return { liveStats, lastUpdated, isPolling, start, stop, fetchDashboard };
};
