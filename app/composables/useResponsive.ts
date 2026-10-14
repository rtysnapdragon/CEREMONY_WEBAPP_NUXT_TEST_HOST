import { computed } from 'vue'
import { useMediaQuery } from '@vueuse/core'

export const useResponsive = () => {
  // Mobile
  const isXs = useMediaQuery('(max-width: 479px)')
  const isSm = useMediaQuery('(max-width: 639px)')

  // Tablet
  const isMd = useMediaQuery('(max-width: 767px)')
  const isLg = useMediaQuery('(max-width: 1023px)')

  // Desktop
  const isXl = useMediaQuery('(min-width: 1280px)')
  const is2Xl = useMediaQuery('(min-width: 1536px)')

  // Main device groups
  const isMobile = computed(() => isMd.value)

  const isTablet = computed(() => {
    return !isMd.value && isLg.value
  })

  const isDesktop = computed(() => {
    return !isLg.value
  })

  // Orientation
  const isPortrait = useMediaQuery('(orientation: portrait)')
  const isLandscape = useMediaQuery('(orientation: landscape)')

  // Touch devices
  const isTouch = useMediaQuery('(pointer: coarse)')

  return {
    // Breakpoints
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    is2Xl,

    // Device groups
    isMobile,
    isTablet,
    isDesktop,

    // Orientation
    isPortrait,
    isLandscape,

    // Input
    isTouch
  }
}