export const useCountdown = (targetDate) => {
  const remaining = ref({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false })
  let timer = null

  const tick = () => {
    const target = new Date(unref(targetDate)).getTime()
    const now = Date.now()
    const diff = target - now

    if (Number.isNaN(target) || diff <= 0) {
      remaining.value = { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: diff <= 0 }
      return
    }

    remaining.value = {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
      isPast: false,
    }
  }

  onMounted(() => {
    tick()
    timer = setInterval(tick, 1000)
  })

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  return { remaining }
}
