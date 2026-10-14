// ~/utils/api.ts
import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.NUXT_PUBLIC_API_BASE,
  withCredentials: true
})

/* REQUEST INTERCEPTOR */
api.interceptors.request.use((config) => {
  const { useAuthStore } = require('~/stores/auth') // lazy import
  const auth = useAuthStore()

  if (auth.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`
  }

  return config
})

/* RESPONSE INTERCEPTOR */
let isRefreshing = false
let queue: Function[] = []

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { useAuthStore } = require('~/stores/auth')
    const auth = useAuthStore()

    const original = error.config

    if (error.response?.status !== 401) {
      return Promise.reject(error)
    }

    if (original._retry) {
      auth.logout()
      return Promise.reject(error)
    }

    original._retry = true

    if (!isRefreshing) {
      isRefreshing = true
      try {
        await auth.refreshToken()
        queue.forEach(cb => cb())
        queue = []
      } catch (e) {
        auth.logout()
        return Promise.reject(e)
      } finally {
        isRefreshing = false
      }
    }

    return new Promise((resolve) => {
      queue.push(() => resolve(api(original)))
    })
  }
)