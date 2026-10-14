/**
 * Shared event-scoped page lifecycle composable.
 *
 * Handles the three things EVERY event-scoped page does identically:
 *   1. Ensure eventStore is initialized before fetching
 *   2. Re-fetch when the active event changes
 *   3. Poll for live updates on a configurable interval
 *
 * Usage:
 *   const { eventStore } = useEventPage(
 *     () => myStore.fetchData(0),   // fetchFn — called on mount + event change
 *     30_000,                       // pollInterval in ms (omit to disable polling)
 *   )
 *
 * The composable calls fetchFn automatically — the page only needs onMounted(init)
 * where init is responsible for any additional page-level setup (loading languages,
 * secondary stores, etc.). Pass fetchFn separately so the page composable controls
 * what "fetch" means without duplicating the watch/polling boilerplate.
 */
export function useEventPage(fetchFn, pollInterval) {
  const eventStore = useEventStore()

  const fetch = async () => {
    if (!eventStore.activeEvent?.id) return
    await fetchFn()
  }

  const init = async () => {
    if (!eventStore.initialized) await eventStore.fetchEvents()
    await fetch()
  }

  // Re-fetch whenever the active wedding/event changes
  watch(() => eventStore.activeEvent?.id, (id) => { if (id) fetch() })

  // Live polling — only if an interval is provided
  if (pollInterval) {
    usePolling(fetch, pollInterval)
  }

  return { eventStore, init, fetch }
}
