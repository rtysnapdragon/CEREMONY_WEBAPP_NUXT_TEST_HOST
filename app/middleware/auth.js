// Paths that don't require a wedding to exist
const NO_WEDDING_ALLOWED = [
  '/create-event',
  '/ceremony',
  '/auth/',
  '/admin/',
  '/settings',
  '/help',
  '/profile',
  '/oauth',
  '/invite',
  '/legal',
  '/support',
]

// Auth pages under any locale prefix (e.g. /km/auth/login, /auth/login)
function isAuthPath(path) {
  const authSuffixes = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password']
  return authSuffixes.some((s) => path === s || path.endsWith(s) || path.startsWith(s + '/'))
}

function isJwtExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    // Match refreshToken.js: treat as expired 30s early
    return payload.exp * 1000 < Date.now() + 30_000
  } catch {
    return true
  }
}

export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie('access_token').value

  const isAuthPage = isAuthPath(to.path)
  const isOAuth = to.path.startsWith('/oauth') || to.path.startsWith('/auth/google')

  // allow OAuth always
  if (isOAuth) return

  // If on an auth page and user has a valid (non-expired) token → redirect to app
  // If the token exists but is expired, let the user stay on login/register
  // if (token && isAuthPage && !isJwtExpired(token)) {
  //   const eventStore = useEventStore()
  //   // Only redirect to create-event if we're certain events are loaded and empty
  //   const dest = (eventStore.initialized && eventStore.events.length === 0)
  //     ? '/ceremony'
  //     : '/'
  //   if (to.path !== dest) {
  //     return navigateTo(dest, { replace: true })
  //   }
  //   return
  // }

  
  // If not authenticated and not on an auth page → try refresh, then redirect to login
  const authStore = useAuthStore()
  const hasValidToken = token && !isJwtExpired(token) && authStore.isAuthenticated
  if (!hasValidToken && !isAuthPage) {
    const refreshToken = useCookie('refresh_token').value
    if (refreshToken) {
      // Refresh token still exists — let the app load; refreshToken.js will handle it
      return
    }
    if (to.path !== '/auth/login') {
      return navigateTo({
        path: '/auth/login',
        query: { next: to.fullPath }
      }, { replace: true })
    }
  }

  // const eventStore = useEventStore()
  // let dest = (eventStore.initialized && eventStore.events.length === 0)
  // if (!dest) {
  //   // Only redirect to create-event if we're certain events are loaded and empty
  //     dest ? '/ceremony'
  //     : '/'
  //   if (to.path !== dest) {
  //     return navigateTo(dest, { replace: true })
  //   }
  //   return
  // }

  // If authenticated, check that at least one wedding exists before allowing access
  // to any page that requires a wedding context. Skip for SUPER_ADMIN and excluded paths.
  if (hasValidToken && !isAuthPage) {
    const isExcluded = NO_WEDDING_ALLOWED.some(
      (p) => to.path === p || to.path.startsWith(p)
    )
    if (!isExcluded) {
      const eventStore = useEventStore()
      const authStore = useAuthStore()
      const isSuperAdmin = authStore.user?.roles?.includes('SUPER_ADMIN')

      if (!isSuperAdmin && eventStore.initialized && eventStore.events.length === 0) {
        if (to.path !== '/ceremony') {
          return navigateTo('/ceremony', { replace: true })
        }
      }
    }
  }
})