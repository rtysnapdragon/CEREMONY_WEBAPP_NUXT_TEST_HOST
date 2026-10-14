import { defineStore ,acceptHMRUpdate} from 'pinia'
import { v4 as uuidv4 } from 'uuid'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: Date
  userId?: string
  shipmentId?: string
  actionUrl?: string
}

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    notifications: [] as Notification[],
    unreadCount: 0,
    realTimeEnabled: true
  }),

  getters: {
    unreadNotifications: (state) => state.notifications.filter(n => !n.read),
    recentNotifications: (state) => state.notifications.slice(0, 10)
  },

  actions: {
    addNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) {
      const newNotification: Notification = {
        id: uuidv4(),
        createdAt: new Date(),
        read: false,
        ...notification
      }
      
      this.notifications.unshift(newNotification)
      this.updateUnreadCount()
      
      // Show toast notification
      const toast = useToast()
      toast.add({
        title: notification.title,
        description: notification.message,
        color: notification.type === 'error' ? 'red' : notification.type === 'success' ? 'green' : 'blue',
        timeout: 5000
      })
    },

    markAsRead(notificationId: string) {
      const notification = this.notifications.find(n => n.id === notificationId)
      if (notification) {
        notification.read = true
        this.updateUnreadCount()
      }
    },

    markAllAsRead() {
      this.notifications.forEach(n => n.read = true)
      this.updateUnreadCount()
    },

    updateUnreadCount() {
      this.unreadCount = this.notifications.filter(n => !n.read).length
    },

    // Simulate real-time notifications
    startRealTimeUpdates() {
      if (!this.realTimeEnabled) return
      
      setInterval(() => {
        if (Math.random() > 0.7) { // 30% chance every 30 seconds
          const notifications = [
            {
              title: 'Shipment Update',
              message: 'Package TM123456 is now in transit',
              type: 'info' as const,
              shipmentId: 'some-id'
            },
            {
              title: 'Delivery Completed',
              message: 'Package TM789012 has been delivered successfully',
              type: 'success' as const,
              shipmentId: 'some-id'
            },
            {
              title: 'Vehicle Alert',
              message: 'Vehicle TRK-001 requires maintenance',
              type: 'warning' as const
            }
          ]
          
          const randomNotification = notifications[Math.floor(Math.random() * notifications.length)]
          this.addNotification(randomNotification)
        }
      }, 30000) // Every 30 seconds
    }
  }
})


// make sure to pass the right store definition, `useAuth` in this case.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useNotificationsStore, import.meta.hot))
}