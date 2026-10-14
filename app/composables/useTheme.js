// composables/useTheme.js — Theme management (dark/light/system)

export const useTheme = () => {
  const colorMode = useColorMode()

  const isDark = computed(() => colorMode.value === 'dark')
  const isLight = computed(() => colorMode.value === 'light')
  const isSystem = computed(() => colorMode.preference === 'system')

  const currentTheme = computed(() => colorMode.value)

  const setTheme = (theme) => {
    colorMode.preference = theme
    if (process.client) {
      document.documentElement.setAttribute('data-theme', theme === 'system'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : theme
      )
    }
  }

  const toggleTheme = () => {
    setTheme(isDark.value ? 'light' : 'dark')
  }

  const themeIcon = computed(() => {
    if (isSystem.value) return 'ri-computer-line'
    return isDark.value ? 'ri-moon-line' : 'ri-sun-line'
  })

  const themes = [
    { value: 'dark', label: 'Dark', icon: 'ri-moon-line' },
    { value: 'light', label: 'Light', icon: 'ri-sun-line' },
    { value: 'system', label: 'System', icon: 'ri-computer-line' },
  ]

  onMounted(() => {
    // Sync system preference
    if (isSystem.value && process.client) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      document.documentElement.setAttribute('data-theme', mq.matches ? 'dark' : 'light')
      mq.addEventListener('change', (e) => {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light')
      })
    }
  })

  return { isDark, isLight, isSystem, currentTheme, setTheme, toggleTheme, themeIcon, themes }
}
