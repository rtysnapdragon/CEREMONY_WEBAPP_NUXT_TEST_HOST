// composables/useHttp.js — Central HTTP composable with auth, error handling, interceptors

export const useHttp1 = async (endpoint, options = {}) => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()
  const toast = useToastStore()

  const baseURL = config.public.apiBase || '/api'

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {}),
    ...options.headers,
  }

  try {
    const response = await $fetch(endpoint, {
      baseURL,
      headers,
      ...options,
      onResponseError({ response }) {
        const status = response.status

        if (status === 401) {
          authStore.clearAuth()
          navigateTo('/auth/login')
          toast.add('Session expired. Please sign in again.')
        } else if (status === 403) {
          toast.add('You do not have permission to do this.')
        } else if (status === 404) {
          toast.add('Resource not found.')
        } else if (status === 422) {
          const errors = response._data?.errors
          if (errors) {
            const first = Object.values(errors)[0]
            toast.add(Array.isArray(first) ? first[0] : first)
          }
        } else if (status >= 500) {
          toast.add('Server error. Please try again later.')
        }
      },
    })

    return { data: response, error: null }
  } catch (err) {
    console.error('[useHttp] Error:', err)
    return { data: null, error: err }
  }
}

/**
 * Reactive data fetching wrapper
 */
export const useHttpFetch = (endpoint, options = {}) => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  return useFetch(endpoint, {
    baseURL: config.public.apiBase || '/api',
    headers: computed(() => ({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {}),
    })),
    ...options,
  })
}
