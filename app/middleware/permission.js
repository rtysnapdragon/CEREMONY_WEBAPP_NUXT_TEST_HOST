export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()
  const localePath = (p) => p

  const required = to.meta.permission

  // no permission required
  if (!required) return

  const hasPermission =
    Array.isArray(authStore.permissions) &&
    authStore.permissions.includes(required)

  // already has permission → allow
  if (hasPermission) return

  const target = localePath('/')

  // prevent redirect loop
  if (to.path !== target) {
    return navigateTo(target, { replace: true })
  }
})