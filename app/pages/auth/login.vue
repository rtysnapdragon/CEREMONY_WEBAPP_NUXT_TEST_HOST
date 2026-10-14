<template>
  <div class="auth-card glass-card animate-scale-in">
    <!-- Header -->
    <div class="auth-card-header">
      <h1 class="auth-title">{{ tr('auth.welcome_back') }}</h1>
      <p class="auth-subtitle">{{ tr('app.tagline') }}</p>
    </div>

    <!-- Social auth -->
    <div class="social-auth">
      <button class="social-btn google-btn" :disabled="authStore.loading" title="Sign in with Google" @click="handleGoogle">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      </button>
      <button class="social-btn telegram-btn" :disabled="authStore.loading" title="Sign in with Telegram" @click="handleTelegram">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.24 14.238l-2.95-.924c-.641-.203-.654-.641.136-.953l11.52-4.44c.535-.194 1.003.13.616.327z" fill="#2CA5E0"/>
        </svg>
      </button>
      <!-- <button class="social-btn tiktok-btn" :disabled="authStore.loading" title="Sign in with TikTok" @click="handleTikTok">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.74 2.89 2.89 0 0 1 2.31-1.18V9.25a6.34 6.34 0 0 0-5.1 2.3 6.34 6.34 0 0 0 1.25 8.79 6.34 6.34 0 0 0 8.04-.61 6.3 6.3 0 0 0 1.83-4.52V8.7a8.28 8.28 0 0 0 4.09 1.45V6.69z" fill="#EE1D52"/>
        </svg>
      </button>
      <button class="social-btn facebook-btn" :disabled="authStore.loading" title="Sign in with Facebook" @click="handleFacebook">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C20.012 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
        </svg>
      </button> -->
    </div>

    <!-- Hidden Google button container (GSI renders real button here) -->
    <div ref="googleBtnRef" style="position:absolute;left:-9999px;top:-9999px;width:240px;height:44px;overflow:hidden;opacity:0" />

    <!-- Hidden Telegram widget (renders the real OAuth button) -->
    <div ref="telegramWidgetRef" style="display:none" />

    <!-- Divider -->
    <div class="auth-divider">
      <hr class="divider" />
      <span>{{ tr('auth.or_continue_with') }}</span>
      <hr class="divider" />
    </div>

    <!-- Form -->
    <RForm ref="formRef" class="auth-form" @onSubmit="handleLogin" :schema="loginSchema" :state="form" @onError="onValidationError">
      <RFormGroup name="username" :label="tr('common.username')" required>
        <RInput
          v-model="form.username"
          type="text"
          :placeholder="tr('common.username')"
          autocomplete="username"
          :error="errors.username"
          leading
          leadingIcon="ri-user-line"
          :isLeft="true"
          :isRight="true"
          size="sm"
          :highlight="form.username?.length > 0"
          :variant="form.username?.length > 0 ? 'solid' : 'outline'"
          :ui="{ base: 'input-base rounded-full' , size:'lg' }"
        />
      </RFormGroup>

      <RFormGroup name="password" :label="tr('common.password')" required>
        <RInput
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          :placeholder="tr('common.password')"
          autocomplete="current-password"
          :error="errors.password"
          leading
          leadingIcon="ri-lock-line"
          :isLeft="true"
          :isRight="true"
          size="sm"
          :ui="{ base: 'input-base rounded-full', size:'lg' }"
          >
          <template #trailing>
              <div
                type="button"
                class="trailing-icon flex items-center justify-center cursor-pointer"
                @click="showPassword = !showPassword"
              >
                <i :class="showPassword ? 'ri-eye-off-line' : 'ri-eye-line'" />
          </div>
          </template>
        </RInput>
      </RFormGroup>

      <div class="auth-row">
        <label class="checkbox-label">
          <input v-model="form.remember" type="checkbox" />
          <span>{{ tr('auth.remember_me') }}</span>
        </label>
        <NuxtLink :to="localePath('/auth/forgot-password')" class="forgot-link">{{ tr('auth.forgot_password') }}</NuxtLink>
      </div>

      <!-- Error -->
      <!-- <Transition name="fade-up">
        <div v-if="error" class="auth-error">
          <i class="ri-error-warning-line" />
          {{ error }}
        </div>
      </Transition> -->

      <button type="submit" class="btn-primary btn-full" :disabled="authStore.loading" @click="submitForm">
        <span v-if="authStore.loading">
          <i class="ri-loader-4-line animate-spin" />
          {{ tr('auth.signing_in') }}
        </span>
        <span v-else>
          {{ tr('auth.sign_in') }}
          <i class="ri-arrow-right-line" />
        </span>
      </button>
    </RForm>

    <!-- Footer -->
    <p class="auth-switch">
      {{ tr('auth.no_account') }}
      <NuxtLink :to="localePath('/auth/register')" class="auth-link">{{ tr('auth.sign_up') }}</NuxtLink>
    </p>
  </div>
</template>

<script setup>
import { z } from 'zod'
definePageMeta({ layout: 'auth',title:'login' })

const toast = useToast()
const { tr } = useTr()
const authStore = useAuthStore()

const form = reactive({ username: '', password: '', remember: false })
const showPassword = ref(false)
const error = ref('')
const formRef = ref()

useHead({title:tr('auth.login')})

// Pre-fill remembered username on mount
onMounted(() => {
  const remembered = useCookie('is_remembered').value
  if (remembered) {
    form.username = remembered
    form.remember = true
  }
})

const errors = reactive({
  username: '',
  password: ''
})

function onValidationError(event) {
  errors.username = ''
  errors.password = ''

  event.errors.forEach((err) => {
    errors[err.path] = err.message
  })
}

async function submitForm() {
  await formRef.value?.submit()
}

const loginSchema = z.object({
  username: z.preprocess(
    (v) => v ?? '',
    z.string()
      .refine( (v) => v.trim().length > 0,  tr('validation.username_required') )
      .trim()
      .min(3, tr('validation.username_min'))
      .max(20, tr('validation.username_max'))
      .regex( /^\S+$/, tr('validation.username_no_spaces') )
  ),

  password: z.preprocess(
    (v) => v ?? '',
    z.string()
      .refine( (v) => v.trim().length > 0,  tr('validation.password_required') )
      .min(4, tr('validation.password_min'))
      .max(15, tr('validation.password_max'))
      .regex( /^\S+$/, tr('validation.password_no_spaces') )
  ),

  remember: z.boolean().default(false)
})

const redirectAfterLogin = async () => {
  // Platform administrators manage the application itself and are not required
  // to have an event. Sending them to the event setup flow hides their admin UI.
  if (authStore.user?.roles?.includes('SUPER_ADMIN')) {
    return navigateTo(localePath('/'))
  }

  const eventStore = useEventStore()
  // Always re-fetch after login to get a fresh list — the store's login() may have
  // fetched before the session cookie was fully set, returning an empty list.
  await eventStore.fetchEvents()
  const dest = eventStore.events?.length > 0 ? '/' : '/ceremony'
  return navigateTo(localePath(dest))
}

const handleLogin = async () => {
  error.value = ''
  const result = await authStore.login({ username: form.username, password: form.password }, form.remember)
  if (result.success) {
    await redirectAfterLogin()
    toast.add({ title: 'Welcome back!', description: `Logged in as ${form.username}`, color: 'success', icon: 'i-ri-checkbox-circle-line', duration: 3000 })
  } else {
    error.value = result.error || 'Invalid credentials. Please try again.'
  }
}

const {
  googleBtnRef,
  telegramWidgetRef,
  handleGoogle: triggerGoogle,
  handleTelegram: triggerTelegram,
  handleFacebook: triggerFacebook,
  handleTikTok: triggerTikTok,
} = useSocialAuth()

const socialSuccess = async (provider) => {
  await redirectAfterLogin()
  toast.add({ title: 'Welcome back!', description: `Signed in with ${provider}`, color: 'success', icon: 'i-ri-checkbox-circle-line', duration: 3000 })
}

const socialFail = (msg) => { error.value = msg }

const handleGoogle = () => triggerGoogle({ onSuccess: () => socialSuccess('Google'), onError: socialFail })
const handleTelegram = () => triggerTelegram({ onSuccess: () => socialSuccess('Telegram'), onError: socialFail })
const handleFacebook = () => triggerFacebook({ onSuccess: () => socialSuccess('Facebook'), onError: socialFail })
const handleTikTok = () => triggerTikTok({ onSuccess: () => socialSuccess('TikTok'), onError: socialFail })
</script>

<style lang="scss">
.auth-card {
  width: min(440px, 100%);
  padding: var(--sp-8) var(--sp-8);
  border-radius: var(--r-2xl);

  @media (max-width: 480px) { padding: var(--sp-6); border-radius: var(--r-xl); }
}

.auth-card-header {
  text-align: center;
  margin-bottom: var(--sp-6);

  .auth-title {
    font-family: var(--font-800);
    font-size: 1.75rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    margin-bottom: var(--sp-1);
  }

  .auth-subtitle {
    font-size: 0.875rem;
    color: var(--c-muted);
  }
}

.social-auth {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--sp-2);
  margin-bottom: var(--sp-5);

  @media (max-width: 480px) { grid-template-columns: repeat(2, 1fr); }
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-2);
  padding: 10px 16px;
  border-radius: var(--r-full);
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--c-border);
  color: var(--c-text);
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--t-fast);
  font-family: inherit;

  &:hover {
    background: rgba(255,255,255,0.08);
    border-color: rgba(255,255,255,0.15);
  }

  &:disabled { opacity: 0.5; cursor: not-allowed; }
}

.auth-divider {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  margin-bottom: var(--sp-5);

  .divider { flex: 1; margin: 0; }
  span { font-size: 0.75rem; color: var(--c-muted); white-space: nowrap; }
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
}

.auth-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-2);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  cursor: pointer;
  font-size: 0.8125rem;
  color: var(--c-muted);

  input[type="checkbox"] {
    width: 15px;
    height: 15px;
    accent-color: var(--c-accent);
    cursor: pointer;
  }
}

.forgot-link {
  font-size: 0.8125rem;
  color: var(--c-accent);
  text-decoration: none;
  &:hover { text-decoration: underline; }
}

.auth-error {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: 10px 14px;
  border-radius: var(--r-md);
  background: rgba(248,113,113,0.1);
  border: 1px solid rgba(248,113,113,0.25);
  color: var(--c-danger);
  font-size: 0.8125rem;
}

.btn-full { width: 100%; justify-content: center; padding: 8px; font-size: 0.9375rem; border-radius: var(--r-full); }

.auth-switch {
  text-align: center;
  margin-top: var(--sp-5);
  font-size: 0.8125rem;
  color: var(--c-muted);
}

.auth-link {
  color: var(--c-accent);
  font-weight: 600;
  text-decoration: none;
  margin-left: 4px;
  &:hover { text-decoration: underline; }
}

.trailing-icon i{
  border-radius: 50px !important;
}

.input-base {
  border-radius: var(--r-full) !important;
  // height: 40px !important;
  padding: 10px 35px !important;
}

</style>
