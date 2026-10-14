// Centralised handler for 401/403 responses from any store.
// Call this whenever an API request returns an error status.
export function handleAuthError(status) {
  if (status === 401) {
    // useHttp already handled this — it called useRefreshToken, and on failure
    // called clearAuth + navigateTo('/auth/login'). Just signal caller to stop.
    return true
  }
  if (status === 403) {
    if (process.client) {
      try {
        useToastStore().error('You do not have permission to perform this action.', 'Access Denied')
      } catch {}
    }
    return true
  }
  return false
}
