export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  await authStore.init()

  // Re-check after init — fetchMe may have triggered a 401 → refresh failed → clearAuth + redirect.
  // If no longer authenticated, stop here so we don't fire API calls after the redirect.
  if (!authStore.isAuthenticated) return

  console.log("authStore.isAuthenticated ------------------> ", authStore.isAuthenticated)
  const eventStore = useEventStore()
  const eventTypeStore = useEventTypeStore()
  await Promise.all([
    eventStore.fetchEvents(),
    usePlanStore().fetchPlan(),
    useAIStore().fetchStatus(),
    eventTypeStore.fetchTypes(),
    eventTypeStore.fetchMyOrgEventTypes(),
  ])

  // If fetchEvents failed (network/auth error), events will be empty but initialized=true.
  // Retry once to avoid wrongly redirecting to /create-event.
  if (eventStore.initialized && eventStore.events.length === 0) {
    await eventStore.fetchEvents()
  }

  // After app loads, users without an event need the creation flow. Platform
  // administrators are allowed to have no organization-specific events.
  const isSuperAdmin = authStore.user?.roles?.includes('SUPER_ADMIN')
  const route = useRoute()
  if (!isSuperAdmin && eventStore.initialized && eventStore.events.length === 0 && !route.path.startsWith('/ceremony')) {
    await navigateTo('/ceremony', { replace: true })
  }
})
