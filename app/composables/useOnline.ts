export const useOnline = () => {
  const online = ref(true)

  if (process.client) {
    online.value = navigator.onLine

    window.addEventListener('online', () => {
      online.value = true
    })

    window.addEventListener('offline', () => {
      online.value = false
    })
  }

  return online
}