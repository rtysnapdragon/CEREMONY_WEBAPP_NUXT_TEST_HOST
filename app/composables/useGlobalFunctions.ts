import {
  format,
  formatDistance as formatDateDistance,
  formatRelative
} from 'date-fns'

/* -------------------------------------------------------
 * Helpers
 * ----------------------------------------------------- */

const isClient = () => typeof window !== 'undefined'

const toValidDate = (date?: Date | string): Date => {
  if (!date) return new Date()

  const d = typeof date === 'string' ? new Date(date) : date
  return isNaN(d.getTime()) ? new Date() : d
}

const safeNumber = (value: number, fallback = 0): number =>
  Number.isFinite(value) ? value : fallback

/* -------------------------------------------------------
 * Composable
 * ----------------------------------------------------- */

export const useGlobalFunctions = () => {
  /* -------------------- Date utilities -------------------- */

  const formatDate = (
    date?: Date | string,
    formatString = 'MMM dd, yyyy'
  ): string => {
    return format(toValidDate(date), formatString)
  }

  const formatDateTime = (date?: Date | string): string => {
    return format(toValidDate(date), 'MMM dd, yyyy HH:mm')
  }

  const timeAgo = (date?: Date | string): string => {
    return formatDateDistance(toValidDate(date), new Date(), {
      addSuffix: true
    })
  }

  const relativeTime = (date?: Date | string): string => {
    return formatRelative(toValidDate(date), new Date())
  }

  /* -------------------- Status utilities -------------------- */

  const getStatusColor = (status: string): string => {
    const statusColors: Record<string, string> = {
      active: 'green',
      pending: 'yellow',
      delivered: 'green',
      in_transit: 'blue',
      delayed: 'red',
      cancelled: 'gray',
      available: 'green',
      in_use: 'blue',
      maintenance: 'yellow',
      out_of_service: 'red',
      urgent: 'red',
      high: 'orange',
      medium: 'yellow',
      low: 'gray',
      in_stock: 'green',
      damaged: 'red'
    }
    return statusColors[status] ?? 'gray'
  }

  const getStatusIcon = (status: string): string => {
    const statusIcons: Record<string, string> = {
      pending: 'clock',
      in_transit: 'truck',
      delivered: 'check-circle',
      delayed: 'alert-triangle',
      cancelled: 'x-circle',
      available: 'check',
      in_use: 'play',
      maintenance: 'lucide:wrench',
      out_of_service: 'lucide:x',
      in_stock: 'lucide:package',
      damaged: 'lucide:alert-triangle'
    }
    return statusIcons[status] ?? 'lucide:circle'
  }

  /* -------------------- Formatting utilities -------------------- */

  const formatCurrency = (amount: number, currency = 'USD'): string => {
    const safeAmount = safeNumber(amount)
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(safeAmount)
  }

  const formatWeight = (weight: number, unit = 'lbs'): string => {
    return `${safeNumber(weight).toLocaleString()} ${unit}`
  }

  const formatDistanceValue = (distance: number, unit = 'miles'): string => {
    return `${safeNumber(distance).toLocaleString()} ${unit}`
  }

  /* -------------------- Validation utilities -------------------- */

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const isValidTrackingNumber = (trackingNumber: string): boolean => {
    const trackingRegex = /^TM\d{6}[A-Z0-9]{4}$/
    return trackingRegex.test(trackingNumber)
  }

  /* -------------------- Notification utilities -------------------- */

  const withToast = (cb: (toast: ReturnType<typeof useToast>) => void) => {
    if (!isClient()) return
    const toast = useToast()
    cb(toast)
  }

  const showSuccess = (message: string) =>
    withToast(toast =>
      toast.add({
        title: 'Success',
        description: message,
        color: 'green',
        timeout: 3000
      })
    )

  const showError = (message: string) =>
    withToast(toast =>
      toast.add({
        title: 'Error',
        description: message,
        color: 'red',
        timeout: 5000
      })
    )

  const showWarning = (message: string) =>
    withToast(toast =>
      toast.add({
        title: 'Warning',
        description: message,
        color: 'yellow',
        timeout: 4000
      })
    )

  const showInfo = (message: string) =>
    withToast(toast =>
      toast.add({
        title: 'Info',
        description: message,
        color: 'blue',
        timeout: 3000
      })
    )

  /* -------------------- Theme utilities -------------------- */

  const toggleDarkMode = () => {
    if (!isClient()) return
    const colorMode = useColorMode()
    colorMode.preference =
      colorMode.preference === 'dark' ? 'light' : 'dark'
  }

  const isDarkMode = computed(() => {
    if (!isClient()) return false
    return useColorMode().value === 'dark'
  })

  /* -------------------- Storage utilities -------------------- */

  const saveToStorage = <T>(key: string, value: T) => {
    if (!isClient()) return
    localStorage.setItem(key, JSON.stringify(value))
  }

  const getFromStorage = <T>(key: string, defaultValue: T): T => {
    if (!isClient()) return defaultValue
    const stored = localStorage?.getItem(key)
    return stored ? (JSON.parse(stored) as T) : defaultValue
  }

  const removeFromStorage = (key: string) => {
    if (!isClient()) return
    localStorage.removeItem(key)
  }

  /* -------------------- Download / Share utilities -------------------- */

  const shareReport = async (reportId: string) => {
    if (!isClient()) return

    try {
      const shareUrl = `${window.location.origin}/reports/${reportId}`
      await navigator.clipboard.writeText(shareUrl)
      showSuccess('Report link copied to clipboard')
    } catch {
      showError('Failed to copy report link')
    }
  }

  /* -------------------- Exports -------------------- */

  return {
    // Date
    formatDate,
    formatDateTime,
    timeAgo,
    relativeTime,

    // Status
    getStatusColor,
    getStatusIcon,

    // Formatting
    formatCurrency,
    formatWeight,
    formatDistance: formatDistanceValue,

    // Validation
    isValidEmail,
    isValidTrackingNumber,

    // Notifications
    showSuccess,
    showError,
    showWarning,
    showInfo,

    // Theme
    toggleDarkMode,
    isDarkMode,

    // Storage
    saveToStorage,
    getFromStorage,
    removeFromStorage,

    // Share
    shareReport
  }
}

export default useGlobalFunctions
