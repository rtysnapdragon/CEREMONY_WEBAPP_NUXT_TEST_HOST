<template>
  <RWrapperPage class="verify-access">
    <!-- Exact Insomnia-style Animated Background -->
    <div class="background">
      <!-- Flowing curved lines -->
      <div class="flow-line line-1"></div>
      <div class="flow-line line-2"></div>
      <div class="flow-line line-3"></div>
      <div class="flow-line line-4"></div>
      <div class="flow-line line-5"></div>
      <div class="flow-line line-6"></div>

      <!-- Moving glowing dots -->
      <div class="glow-dot dot-1"></div>
      <div class="glow-dot dot-2"></div>
      <div class="glow-dot dot-3"></div>
    </div>

    <!-- Your requested body structure -->
    <div class="auth-wrapper">
      <div class="auth-container">
        <!-- Loading State -->
        <div v-if="loading" class="spinner"></div>
        <p v-if="loading" class="loading-text">Verifying access...</p>

        <!-- Main Text -->
        <div class="auth-text">
          <h1>Authenticating with Google...</h1>
          <p>Please wait while we log you in securely.</p>
        </div>

        <!-- Error -->
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div v-if="errorMessage">
          <nuxt-link to="/" class="home-link">Go to Home</nuxt-link>
        </div>

        <div class="footer">Powered by RTY_TECH</div>
      </div>
    </div>
  </RWrapperPage>
</template>

<script setup>
definePageMeta({ layout: false })
const router = useRouter()
const route = useRoute()
const toast = useToast()
import { useRoute, useRouter, useCookie } from '#imports'
const errorMessage = ref('')
const loading = ref(true)
const authToken = useCookie('google_drive_token')
const { code, error } = route.query
// // Get the OAuth code from URL
// const code = route.query.code
// Optional: get redirect_uri from URL if you appended it
const redirect_uri = route.query.redirect_uri || window.location.origin + '/verify_access'

console.log('Redirect URI:', redirect_uri)

import { onMounted } from 'vue'

onMounted(async () => {
  localStorage.setItem('redirect_after_login', '/oauth')

  console.log('Code:', code)

  if (error) {
    handleAuthError(error)
    return
  }

  if (!code) {
    handleMissingCode()
    return
  }

  try {
    await exchangeCodeForToken(code)
  } catch (err) {
    handleTokenExchangeError(err)
  }
})

function connectGoogleAccount() {
  window.location.href = googleOAuthUrl({
    prompt: 'consent', // IMPORTANT
    access_type: 'offline'
  })
}

const exchangeCodeForToken = async (code) => {
  const { data, error: apiError } = await useHttp('/api/google/verify_code', {
    method: 'POST',
    data: { code }
  })

  if (apiError?.value) {
    console.log("API ERROR:", apiError.value)
    throw apiError.value
  }

  const res = data.value   // ✅ VERY IMPORTANT

  console.log("✅ API RESPONSE:", res)

  if (!res || !res.Email) {
    throw new Error('No email returned from backend')
  }

  // ✅ Save cookies
  authToken.value = res.access_token

  const emailCookie = useCookie('user_email')
  emailCookie.value = res.Email

  const nameCookie = useCookie('name')
  nameCookie.value = res.Name

    const isConnected = useCookie('is_connected', { maxAge: 60*60*24*7 })
    isConnected.value = data.value?.Connected
    // ✅ THIS IS WHAT YOU MISSED
    handleSuccessfulAuth(res?.Email)

  // ✅ redirect
  const redirectTo = localStorage?.getItem('redirect_after_login') || '/oauth'

  toast.add({
    color: 'green',
    title: 'Login successful'
  })

  setTimeout(() => {
    router.push(redirectTo)
  }, 1000)
}


const exchangeCodeForTokenss = async (code) => {
  const { data, error: apiError } = await useHttp('/api/google/verify_code', {
    method: 'POST',
    data: { code }
  })

  if (apiError) throw apiError

  if (data.value?.Email) {
    // ✅ Save cookies
    authToken.value = data.value?.access_token

    const emailCookie = useCookie('user_email', { maxAge: 60*60*24*7 })
    emailCookie.value = data.value?.Email

    const nameCookie = useCookie('name', { maxAge: 60*60*24*7 })
    nameCookie.value = data.value?.Name

const isConnected = useCookie('is_connected', { maxAge: 60*60*24*7 })
    isConnected.value = data.value?.Connected
    // ✅ THIS IS WHAT YOU MISSED
    handleSuccessfulAuth(data.value?.Email)

  } else {
    throw new Error('Authentication failed: No email received')
  }
}

const exchangeCodeForToken222 = async (code) => {
  // Get the exact redirect_uri used in /auth_url
  const redirect_url = window.location.origin + window.location.pathname
  console.log("Redirect Url =-----------> ", redirect_url)

  // Get the code_verifier from localStorage
  const codeVerifier = localStorage?.getItem('code_verifier')
  if (!codeVerifier) throw new Error('Missing code_verifier for PKCE')

  const { data, error: apiError } = await useHttp('/api/google/verify_code', {
    method: 'POST',
    data: {
      code,
    }
  })

  if (apiError) throw apiError

  if (data.Connected) useCookie('is_connected', { maxAge: 60*60*24*7 })

  if (data?.Email) {
    authToken.value = data.access_token
    const emailCookie = useCookie('user_email', { maxAge: 60*60*24*7 })
    emailCookie.value = data.Email
    const nameCookie = useCookie('name', { maxAge: 60*60*24*7 })
    nameCookie.value = data.Name
  } else {
    throw new Error('Authentication failed: No email received')
  }

  // Optional: remove verifier after use
  localStorage.removeItem('code_verifier')
}

const exchangeCodeForToken11 = async (code) => {
  // Get current full URL from browser
  const redirect_uri = window.location.origin + window.location.pathname

  const { data, error: apiError } = await useHttp('/api/google/verify_code', {
    method: 'POST',
    data: { code, redirect_uri }
  })

  if (apiError) throw apiError
  if(data.Connected) useCookie('is_connected', { maxAge: 60*60*24*7})
  if (data?.Email) {
    authToken.value = data.access_token
    const emailCookie = useCookie('user_email', { maxAge: 60*60*24*7 })
    emailCookie.value = data.Email
    const nameCookie = useCookie('name', { maxAge: 60*60*24*7 })
    nameCookie.value = data.Name
  } else {
    throw new Error('Authentication failed: No email received')
  }
}
const handleSuccessfulAuth = (email) => {
  const emailCookie = useCookie('user_email', {
    maxAge: 60 * 60 * 24 * 7
  })
  emailCookie.value = email

  toast.add({ color: 'green', title: 'Login successful! Redirecting...' })
  const redirectPath = localStorage?.getItem('redirect_after_login') || '/'

    router.push(redirectPath)
  // ✅ redirect to /oauth instead of /
  setTimeout(() => router.push('/oauth'), 1000)
}
const handleSuccessfulAuth222 = (email) => {
  // localStorage.setItem('user_email', email)
const emailCookie = useCookie('user_email', {
    maxAge: 60 * 60 * 24 * 7 // optional: 7-day cookie
  })
  emailCookie.value = email

  toast.add({ color: 'green', title: 'Login successful! Redirecting...' })
  setTimeout(() => router.push('/'), 1500)
}

const handleAuthError = (error) => {
  loading.value = false
  errorMessage.value = `Google login failed: ${error}`
  setTimeout(() => router.push('/'), 3000)
}

const handleMissingCode = () => {
  loading.value = false
  toast.add({ color: 'red', title: 'No authorization code provided' })
  errorMessage.value = 'Authentication failed. Please try again.'
}

const handleTokenExchangeError = (error) => {
  loading.value = false

  console.log('❌ FULL ERROR:', error)

  errorMessage.value =
    error?.Error ||
    error?.message ||
    error?.data?.Error ||
    'Unexpected error during authentication.'

  toast.add({
    color: 'red',
    title: errorMessage.value
  })
}

// const handleTokenExchangeError = (error) => {
//   loading.value = false
//   console.log('Token exchange error:', error)
//   toast.add({ color: 'red', title: 'Authentication failed' })
//   errorMessage.value = 'Unexpected error during authentication.'
// }
</script>

<style lang="scss" scoped>
.verify-access {
  min-height: 100vh;
  background: #0a0a0a;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* ==================== EXACT INSOMNIA BACKGROUND (Like your image) ==================== */
.background {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

.flow-line {
  position: absolute;
  left: 50%;
  height: 1.8px;
  background: linear-gradient(90deg,
    transparent,
    #a855f7 30%,
    #c084fc 50%,
    #67e8f9 70%,
    transparent);
  filter: blur(1px);
  opacity: 0.85;
  transform-origin: center;
  animation: curve-flow 38s linear infinite;
}

.line-1 { top: 22%; width: 155%; animation-duration: 44s; transform: rotate(-26deg); }
.line-2 { top: 34%; width: 135%; animation-duration: 31s; animation-delay: -8s; transform: rotate(14deg); }
.line-3 { top: 48%; width: 170%; animation-duration: 39s; animation-delay: -17s; transform: rotate(-9deg); }
.line-4 { top: 63%; width: 148%; animation-duration: 33s; animation-delay: -5s; transform: rotate(21deg); }
.line-5 { top: 76%; width: 162%; animation-duration: 46s; animation-delay: -23s; transform: rotate(-18deg); }
.line-6 { top: 89%; width: 128%; animation-duration: 27s; animation-delay: -12s; transform: rotate(11deg); }

@keyframes curve-flow {
  0% {
    transform: translateX(-85%) rotate(var(--r, 0deg));
  }
  100% {
    transform: translateX(85%) rotate(var(--r, 0deg));
  }
}

/* Moving Glowing Dots (just like the image) */
.glow-dot {
  position: absolute;
  width: 7px;
  height: 7px;
  background: #c4d0ff;
  border-radius: 50%;
  box-shadow:
    0 0 10px #a855f7,
    0 0 22px #67e8f9,
    0 0 38px #c084fc;
  animation: dot-move 38s linear infinite;
  z-index: 2;
}

.dot-1 { top: 19%; left: 8%; animation-duration: 41s; }
.dot-2 { top: 71%; left: 85%; animation-duration: 29s; animation-delay: -14s; }
.dot-3 { top: 52%; left: 6%;  animation-duration: 47s; animation-delay: -26s; }

@keyframes dot-move {
  0%   { transform: translateX(-520px); }
  100% { transform: translateX(720px); }
}

/* ==================== Your Auth Container ==================== */
.auth-wrapper {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 420px;
  padding: 0 24px;
}

.auth-container {
  background: rgba(15, 15, 20, 0.96);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(168, 85, 247, 0.32);
  border-radius: 18px;
  padding: 52px 42px;
  text-align: center;
  box-shadow: 0 30px 70px -15px rgba(0, 0, 0, 0.75);
}

.spinner {
  width: 52px;
  height: 52px;
  border: 5px solid rgba(168, 85, 247, 0.18);
  border-top-color: #a855f7;
  border-radius: 50%;
  margin: 0 auto 26px;
  animation: spin 0.95s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: #a3a3a3;
  font-size: 15.5px;
  margin-bottom: 32px;
}

.auth-text h1 {
  color: #f1f1f1;
  font-size: 27px;
  font-weight: 600;
  margin-bottom: 14px;
}

.auth-text p {
  color: #9ca3af;
  font-size: 15px;
  line-height: 1.6;
}

.error-message {
  background: rgba(185, 28, 28, 0.2);
  border: 1px solid #f87171;
  color: #fda4af;
  padding: 16px 20px;
  border-radius: 12px;
  margin: 28px 0;
  font-size: 14.5px;
}

.home-link {
  color: #c084fc;
  text-decoration: none;
  font-weight: 500;
  &:hover {
    color: #e0bbff;
    text-decoration: underline;
  }
}

.footer {
  margin-top: 48px;
  color: #52525b;
  font-size: 13px;
}
</style>
