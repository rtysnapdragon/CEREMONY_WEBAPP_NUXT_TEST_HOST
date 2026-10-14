export const useNotification = () => {
    const notification = reactive({
      message: '',
      type: 'success', // default type
      show: false
    })
  
    const notify = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
      notification.message = message
      notification.type = type
      notification.show = true
      
      // Auto-hide after 3 seconds
      setTimeout(() => {
        notification.show = false
      }, 3000)
    }
  
    return {
      notification,
      notify
    }
  }