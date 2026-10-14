import { ref, onMounted, onUnmounted, unref } from "vue"

export function useScroll(target?: HTMLElement | Window | any) {
  const x = ref(0)
  const y = ref(0)
  const isScrollingUp = ref(false)
  const isBottom = ref(false)

  let lastY = 0

  const getElement = () => {
    const el = unref(target)
    return el || window
  }

  const updateScroll = () => {
    const el = getElement()

    if (el === window) {
      x.value = window.scrollX
      y.value = window.scrollY

      isBottom.value =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight
    } else if (el) {
      x.value = el.scrollLeft
      y.value = el.scrollTop

      isBottom.value =
        el.scrollTop + el.clientHeight >= el.scrollHeight
    }

    isScrollingUp.value = y.value < lastY
    lastY = y.value
  }

  onMounted(() => {
    const el = getElement()
    if (!el || !el.addEventListener) return

    el.addEventListener("scroll", updateScroll, { passive: true })
    updateScroll()
  })

  onUnmounted(() => {
    const el = getElement()
    if (!el || !el.removeEventListener) return

    el.removeEventListener("scroll", updateScroll)
  })

  return {
    x,
    y,
    isScrollingUp,
    isBottom,
  }
}