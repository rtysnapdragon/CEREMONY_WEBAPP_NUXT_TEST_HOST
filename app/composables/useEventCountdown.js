// composables/useEventCountdown.js
// Reactive days/hours/minutes/seconds countdown to a target ISO date.

export const useEventCountdown = (targetDate) => {
  const remaining = ref({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false, isValid: false })
  let timer = null

  const tick = () => {
    const value = unref(targetDate)
    const target = value ? new Date(value).getTime() : NaN
    if (Number.isNaN(target)) {
      remaining.value = { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false, isValid: false }
      return
    }
    const diff = target - Date.now()
    if (diff <= 0) {
      remaining.value = { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true, isValid: true }
      return
    }
    remaining.value = {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
      isPast: false,
      isValid: true,
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
