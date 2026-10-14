interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  status: 'in_transit' | 'delivered' | 'pending' | 'cancelled';
  vehicle: string;
  packageId: string;
  location: string;
  progress: number;
  read: boolean;
  timestamp: Date;
}

export const useMockNotifications = () => {
  const notifications = ref<Notification[]>([]);

  const statuses = ['in_transit', 'delivered', 'pending', 'cancelled'] as const;
  const vehicles = ['Truck #V-001', 'Van #V-002', 'Bike #V-003', 'Drone #V-004'];
  const locations = [
    'Phnom Penh → Siem Reap',
    'Siem Reap → Battambang',
    'Battambang → Kampong Cham',
    'Kampot → Phnom Penh',
  ];

  for (let i = 1; i <= 200; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const vehicle = vehicles[Math.floor(Math.random() * vehicles.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];

    notifications.value.push({
      id: i,
      type: 'transport',
      title: `Notification #${i}`,
      message: `Package #TRK-${10000 + i} is currently ${status.replace('_', ' ')}`,
      status,
      vehicle,
      packageId: `PKG-${10000 + i}`,
      location,
      progress: Math.floor(Math.random() * 100),
      read: Math.random() < 0.5,
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 60 * 60 * 1000)),
    });
  }

  /* -------------------------
     ACTIONS
  ------------------------- */

  const addNotification = (notification: NotificationItem) => {
    notifications.value.unshift(notification)
  }

  const markAsRead = (id: string) => {
    const n = notifications.value.find(n => n.id === id)
    if (n) n.read = true
  }

  const markAllAsRead = () => {
    notifications.value.forEach(n => (n.read = true))
  }

  const removeNotification = (id: string) => {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }

  const clearAll = () => {
    notifications.value = []
  }

  const unreadCount = computed(() =>
    notifications.value.filter(n => !n.read).length
  )

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll
  };
};
