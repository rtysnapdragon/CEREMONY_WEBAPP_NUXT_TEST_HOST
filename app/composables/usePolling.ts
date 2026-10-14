// Generic polling composable — starts on mount, stops on unmount
export function usePolling(fn: () => void | Promise<void>, intervalMs: number) {
  let timer: ReturnType<typeof setInterval> | null = null

  const start = () => {
    if (timer) return
    timer = setInterval(fn, intervalMs)
  }

  const stop = () => {
    if (timer) { clearInterval(timer); timer = null }
  }

  onMounted(start)
  onUnmounted(stop)

  return { start, stop }
}
