<template>
  <div class="auth-card glass-card animate-scale-in">
    <div class="auth-card-header">
      <h1 class="auth-title">{{ tr('auth.reset_password') }}</h1>
      <p class="auth-subtitle">Choose a strong new password</p>
    </div>

    <!-- Missing / invalid token -->
    <div v-if="!token" class="state-block">
      <i class="ri-error-warning-line state-icon danger" />
      <p>Invalid or missing reset link.</p>
      <NuxtLink :to="localePath('/auth/forgot-password')" class="btn-primary btn-full" style="display:flex;justify-content:center;margin-top:var(--sp-4)">
        Request New Link
      </NuxtLink>
    </div>

    <!-- Success -->
    <div v-else-if="success" class="state-block">
      <i class="ri-checkbox-circle-line state-icon success" />
      <p>Your password has been reset successfully.</p>
      <NuxtLink :to="localePath('/auth/login')" class="btn-primary btn-full" style="display:flex;justify-content:center;margin-top:var(--sp-4)">
        {{ tr('auth.sign_in') }} <i class="ri-arrow-right-line" style="margin-left:6px" />
      </NuxtLink>
    </div>

    <!-- Form -->
    <form v-else class="auth-form" @submit.prevent="handleReset">
      <div class="form-group">
        <label class="input-label">New Password</label>
        <div class="input-wrap">
          <i class="ri-lock-line input-prefix-icon" />
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="At least 6 characters"
            class="input input-prefixed input-suffixed"
            autocomplete="new-password"
            :disabled="isLoading"
            required
          />
          <button type="button" class="input-suffix-btn" @click="showPassword = !showPassword">
            <i :class="showPassword ? 'ri-eye-off-line' : 'ri-eye-line'" />
          </button>
        </div>
        <div class="pw-strength">
          <div v-for="i in 4" :key="i" class="pw-bar" :class="{ active: passwordStrength >= i, [`s${passwordStrength}`]: true }" />
        </div>
        <p v-if="errors.password" class="field-error">{{ errors.password }}</p>
      </div>

      <div class="form-group">
        <label class="input-label">Confirm Password</label>
        <div class="input-wrap">
          <i class="ri-lock-2-line input-prefix-icon" />
          <input
            v-model="form.confirm"
            type="password"
            placeholder="Repeat your new password"
            class="input input-prefixed"
            autocomplete="new-password"
            :disabled="isLoading"
            required
          />
        </div>
        <Transition name="fade-up">
          <p v-if="form.confirm && form.password !== form.confirm" class="field-error">Passwords do not match</p>
        </Transition>
        <p v-if="errors.confirm" class="field-error">{{ errors.confirm }}</p>
      </div>

      <Transition name="fade-up">
        <div v-if="serverError" class="auth-error">
          <i class="ri-error-warning-line" />
          {{ serverError }}
        </div>
      </Transition>

      <button type="submit" class="btn-primary btn-full" :disabled="isLoading || (!!form.confirm && form.password !== form.confirm)">
        <span v-if="isLoading"><i class="ri-loader-4-line animate-spin" /> Resetting...</span>
        <span v-else><i class="ri-key-2-line" /> Reset Password</span>
      </button>
    </form>

    <p v-if="!success" class="auth-switch">
      {{ tr('auth.has_account') }}
      <NuxtLink :to="localePath('/auth/login')" class="auth-link">{{ tr('auth.sign_in') }}</NuxtLink>
    </p>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'auth' })
useHead({ title: 'Reset Password' })

const { tr } = useTr()
const route = useRoute()
const localePath = (p) => p
const toast = useToastStore()

const token = route.query.token
const isLoading = ref(false)
const success = ref(false)
const showPassword = ref(false)
const serverError = ref('')

const form = reactive({ password: '', confirm: '' })
const errors = reactive({ password: '', confirm: '' })

const passwordStrength = computed(() => {
  const p = form.password
  let score = 0
  if (p.length >= 6) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  return score
})

const handleReset = async () => {
  errors.password = ''
  errors.confirm = ''
  serverError.value = ''

  if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.'
    return
  }
  if (form.password !== form.confirm) {
    errors.confirm = 'Passwords do not match.'
    return
  }

  isLoading.value = true
  try {
    const { error } = await useHttp('/api/v1/auth/reset-password', {
      method: 'POST',
      body: { token, newPassword: form.password },
      isGlobal: true,
    })

    if (error?.value) {
      serverError.value = error.value?.message || 'Reset failed. The link may have expired.'
      return
    }

    success.value = true
    toast.add('Password reset successfully.', 'Done')
  } catch {
    serverError.value = 'Something went wrong. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
.state-block {
  text-align: center;
  padding: var(--sp-4) 0 var(--sp-2);
  color: var(--c-muted);

  .state-icon {
    font-size: 2.5rem;
    margin-bottom: var(--sp-3);
    display: block;

    &.danger  { color: var(--c-danger); }
    &.success { color: var(--c-success); }
  }

  p { font-size: 0.9rem; line-height: 1.6; }
}

.field-error {
  font-size: 0.75rem;
  color: var(--c-danger);
  margin-top: 4px;
}

.pw-strength {
  display: flex;
  gap: 4px;
  margin-top: 6px;

  .pw-bar {
    flex: 1;
    height: 3px;
    border-radius: var(--r-full);
    background: var(--c-border);
    transition: background var(--t-base);

    &.active {
      &.s1 { background: var(--c-danger); }
      &.s2 { background: var(--c-accent-2); }
      &.s3 { background: var(--c-info); }
      &.s4 { background: var(--c-success); }
    }
  }
}
</style>
