// composables/useDashboard.js — Wedding dashboard stats
// GET /api/v1/weddings/{id}/dashboard
// Returns: totalGuests, confirmedGuests, attendedGuests, checkedInCount,
//          totalBudgetPlanned, totalBudgetActual, totalCashGifts,
//          totalTasks, completedTasks, totalTables

export const useWeddingDashboard = () => {
  const eventStore = useEventStore()
  const stats = ref(null)
  const loading = ref(false)

  const fetchDashboard = async () => {
    const id = eventStore.activeEvent?.id
    if (!id) return
    loading.value = true
    try {
      const { data } = await useHttp(`/api/v1/events/${id}/dashboard`, { method: 'GET', isGlobal: true })
      stats.value = data.value?.data ?? data.value
    } finally {
      loading.value = false
    }
  }

  watch(() => eventStore.activeEvent?.id, (id) => { if (id) fetchDashboard() }, { immediate: true })

  return { stats, loading, fetchDashboard }
}
