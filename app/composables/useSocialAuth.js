export function useSocialAuth() {
  const authStore = useAuthStore()
  const config = useRuntimeConfig()

  const socialError = ref('')
  const googleBtnRef = ref(null)
  const telegramWidgetRef = ref(null)

  let googleInitialized = false
  let facebookInitialized = false

  const googleLogin = async ({ credential }) => {
    return authStore.loginWithGoogle({ idToken: credential })
  }

  // ── Google Sign-In (GSI popup → ID token → POST /api/v1/auth/oauth/google) ──
  const handleGoogle = (options = {}) => {
    const onSuccess = options.onSuccess ?? (() => {})
    const onError = options.onError ?? (() => {})

    if (typeof window === 'undefined' || !window.google?.accounts?.id) {
      const msg = 'Google Sign-In not loaded. Please refresh page.'
      socialError.value = msg
      onError(msg)
      return
    }

    const clientId = config.public.googleClientId
    if (!clientId) {
      const msg = 'Google Sign-In is not configured.'
      socialError.value = msg
      onError(msg)
      return
    }

    const onGoogleCallback = async ({ credential }) => {
      const result = await googleLogin({ credential })
      if (result.success) {
        onSuccess()
      } else {
        const msg = result.error || 'Google login failed.'
        socialError.value = msg
        onError(msg)
      }
    }

    if (!googleInitialized) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: onGoogleCallback,
        ux_mode: 'popup',
      })

      window.google.accounts.id.renderButton(googleBtnRef.value, {
        type: 'standard',
        size: 'large',
      })
      googleInitialized = true
    }

    const googleButton = googleBtnRef.value?.querySelector('div[role=button]')
    if (googleButton) {
      googleButton.click()
      return
    }

    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        const msg = 'Google sign-in popup was blocked or skipped.'
        socialError.value = msg
        onError(msg)
      }
    })
  }

  // ── Telegram Login Widget → POST /api/v1/auth/oauth/telegram ──
  const handleTelegram = (options = {}) => {
    const onSuccess = options.onSuccess ?? (() => {})
    const onError = options.onError ?? (() => {})
    if (!telegramWidgetRef.value) return

    telegramWidgetRef.value.innerHTML = ''

    window.__onTelegramAuth = async (user) => {
      const result = await authStore.loginWithTelegram(user)
      if (result.success) {
        onSuccess()
      } else {
        const msg = result.error || 'Telegram login failed.'
        socialError.value = msg
        onError(msg)
      }
    }

    const botUsername = config.public.telegramBotUsername
    if (!botUsername) {
      const msg = 'Telegram Bot username is not configured.'
      socialError.value = msg
      onError(msg)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.async = true
    script.setAttribute('data-telegram-login', botUsername)
    script.setAttribute('data-size', 'medium')
    script.setAttribute('data-onauth', '__onTelegramAuth(user)')
    script.setAttribute('data-request-access', 'write')
    telegramWidgetRef.value.appendChild(script)

    telegramWidgetRef.value.style.display = 'block'
    setTimeout(() => {
      const btn = telegramWidgetRef.value?.querySelector('iframe')
      if (btn) {
        btn.click()
        telegramWidgetRef.value.style.display = 'none'
      }
    }, 800)
  }

  // ── Facebook SDK Login → Access Token → POST /api/v1/auth/oauth/facebook ──
  const loadFacebookSdk = () =>
    new Promise((resolve) => {
      if (window.FB) {
        resolve(true)
        return
      }
      const script = document.createElement('script')
      script.src = 'https://connect.facebook.net/en_US/sdk.js'
      script.async = true
      script.defer = true
      script.onload = () => {
        const appId = config.public.facebookAppId
        if (appId && window.FB) {
          window.FB.init({ appId, cookie: true, xfbml: true, version: 'v19.0' })
          facebookInitialized = true
        }
        resolve(true)
      }
      script.onerror = () => resolve(false)
      document.head.appendChild(script)
    })

  const handleFacebook = async (options = {}) => {
    const onSuccess = options.onSuccess ?? (() => {})
    const onError = options.onError ?? (() => {})

    const appId = config.public.facebookAppId
    if (!appId) {
      const msg = 'Facebook Login is not configured.'
      socialError.value = msg
      onError(msg)
      return
    }

    const ready = await loadFacebookSdk()
    if (!ready || !window.FB) {
      const msg = 'Facebook SDK failed to load.'
      socialError.value = msg
      onError(msg)
      return
    }

    window.FB.login(
      async (response) => {
        if (!response?.authResponse?.accessToken) {
          const msg = response?.status === 'not_authorized' ? 'Facebook login was cancelled.' : 'Facebook login failed.'
          socialError.value = msg
          onError(msg)
          return
        }
        const accessToken = response.authResponse.accessToken
        const result = await authStore.loginWithFacebook({ accessToken })
        if (result.success) {
          onSuccess()
        } else {
          const msg = result.error || 'Facebook login failed.'
          socialError.value = msg
          onError(msg)
        }
      },
      { scope: 'public_profile,email' }
    )
  }

  // ── TikTok OAuth Popup → Access Token → POST /api/v1/auth/oauth/tiktok ──
  const handleTikTok = async (options = {}) => {
    const onSuccess = options.onSuccess ?? (() => {})
    const onError = options.onError ?? (() => {})

    const clientKey = config.public.tiktokClientKey
    if (!clientKey) {
      const msg = 'TikTok Login is not configured.'
      socialError.value = msg
      onError(msg)
      return
    }

    // Launch TikTok OAuth2 Authorization Popup
    const redirectUri = window.location.origin + '/auth/login'
    const tiktokAuthUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${encodeURIComponent(clientKey)}&response_type=code&scope=user.info.basic,user.info.profile&redirect_uri=${encodeURIComponent(redirectUri)}&state=tiktok_oauth`
    
    const width = 600
    const height = 700
    const left = window.screen.width / 2 - width / 2
    const top = window.screen.height / 2 - height / 2

    const popup = window.open(
      tiktokAuthUrl,
      'TikTok Login',
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes`
    )

    if (!popup) {
      const msg = 'TikTok login popup was blocked. Please allow popups.'
      socialError.value = msg
      onError(msg)
      return
    }

    // Listen for postMessage or token pass from callback
    const handleMessage = async (event) => {
      if (event.data?.type === 'TIKTOK_OAUTH_TOKEN') {
        window.removeEventListener('message', handleMessage)
        const accessToken = event.data.accessToken
        const result = await authStore.loginWithTikTok({ accessToken })
        if (result.success) {
          onSuccess()
        } else {
          const msg = result.error || 'TikTok login failed.'
          socialError.value = msg
          onError(msg)
        }
      }
    }
    window.addEventListener('message', handleMessage)
  }

  return {
    socialError,
    googleBtnRef,
    telegramWidgetRef,
    handleGoogle,
    handleTelegram,
    handleFacebook,
    handleTikTok,
  }
}
