export const useDashboard = () => {

  const store = useDashboardStore()

  onMounted(async () => {

    await Promise.all([
      store.fetchOverview(),
      store.fetchActivity()
    ])
  })

  return {
    store
  }
}