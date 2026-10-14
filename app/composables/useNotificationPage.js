import { timeAgo } from '~/helpers/str'

export function useNotificationPage() {
  const notifStore = useNotificationStore()
  const { tr } = useTr()

  const activeTab = ref('all')

  const tabs = computed(() => [
    { value: 'all',    label: 'All' },
    { value: 'unread', label: 'Unread', count: notifStore.unreadCount || null },
  ])

  const filteredNotifications = computed(() =>
    activeTab.value === 'unread'
      ? notifStore.notifications.filter((n) => !n.read)
      : notifStore.notifications,
  )

  const typeIcon = (type) => ({
    success: 'ri-check-circle-line', warning: 'ri-alert-line',
    error: 'ri-error-warning-line',  info: 'ri-information-line',
    wish: 'ri-heart-line',           gift: 'ri-gift-line',
    email: 'ri-mail-send-line',      telegram: 'ri-telegram-line',
    sms: 'ri-message-3-line',
  }[type] ?? 'ri-notification-3-line')

  // Notifications are user-scoped, NOT event-scoped — do not use useEventPage
  const init = async () => {
    await Promise.all([
      notifStore.fetchNotifications(0),
      notifStore.fetchUnreadCount(),
    ])
  }

  // Poll for live updates every 30s
  usePolling(async () => {
    await notifStore.fetchNotifications(0)
    await notifStore.fetchUnreadCount()
  }, 30_000)

  const loadPage = (page) => notifStore.fetchNotifications(page)

  return {
    notifStore,
    activeTab, tabs, filteredNotifications,
    typeIcon, timeAgo, tr,
    init, loadPage,
  }
}
