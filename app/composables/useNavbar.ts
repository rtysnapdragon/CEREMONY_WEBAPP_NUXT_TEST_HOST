// composables/useNavbar.ts

export const useNavbar = () => {
  const visible = useState('navbar-visible', () => true)

  let lastScroll = 0

  const onScroll = () => {
    const current = window.scrollY

    if (current <= 10) {
      visible.value = true
    } else {
      visible.value = current < lastScroll
    }

    lastScroll = current
  }

  onMounted(() => {
    window.addEventListener('scroll', onScroll, {
      passive: true
    })
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', onScroll)
  })

  return {
    visible
  }
}