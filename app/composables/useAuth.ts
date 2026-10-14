import type { Ref } from 'vue'

interface User {
  name: string
  email: string
  avatar?: string
}

export const useAuth11 = () => {
  const user = useState<User | null>('user', () => null)
  const loggedIn = computed(() => !!user.value)

  const setUser = (userData: User | null) => {
    user.value = userData
  }

  const login = async (email: string, password: string) => {
    // Implement login logic
    const { data } = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email, password }
    })

    if (data) {
      setUser(data.user)
    }
  }

  const logout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    navigateTo('/auth/login')
  }

    // Forgot password
  const forgotPassword = async (email: string) => {
    return await $api('/forgot-password', {
      method: 'POST',
      body: {
        Email: email
      }
    })
  }

  // Reset password
  const resetPassword = async (token: string, newPassword: string) => {
    return await $api('/reset-password', {
      method: 'POST',
      body: {
        Token: token,
        NewPassword: newPassword
      }
    })
  }

  return {
    user: readonly(user) as Ref<User | null>,
    loggedIn,
    setUser,
    login,
    logout,
    resetPassword,
    forgotPassword
  }
}
