<template>
  <div class="animate-scale-in">

    <!-- Header -->
    <div class="auth-card-header">
      <h1 class="auth-title">{{ tr('auth.forgot_password') }}</h1>
      <p class="auth-subtitle">
        {{ tr('auth.forgot_subtitle') }}
      </p>
    </div>

    <!-- ── Sent state ───────────────────────────────────────── -->
    <Transition name="fade-up" mode="out-in">
      <div v-if="sent" class="sent-block">
        <div class="sent-icon-wrap">
          <i class="ri-mail-send-line" />
        </div>
        <h2 class="sent-title">
          {{ tr('auth.check_inbox') }}
        </h2>
        <p class="sent-body">
          {{ tr('auth.reset_link_sent') }}
          <strong>{{ form.email }}</strong>.
          {{ tr('auth.follow_instructions') }}
        </p>

        <button class="btn-primary btn-full" style="margin-top:var(--sp-4)" @click="resend">
          <i class="ri-refresh-line" />
          {{ tr('auth.resend_email') }}
        </button>

        <NuxtLink :to="localePath('/auth/login')" class="btn-outline btn-full" style="margin-top:var(--sp-2)">
          {{ tr('auth.sign_in') }} <i class="ri-arrow-right-line" />
        </NuxtLink>
      </div>

      <!-- ── Form ─────────────────────────────────────────────── -->
      <RForm v-else ref="formRef" class="auth-form" :schema="formSchema" :state="form" @onSubmit="handleSubmit">
        <RFormGroup name="email" :label="tr('common.email')" required>
          <RInput
            v-model="form.email"
            type="email"
            :placeholder="tr('common.email')"
            autocomplete="email"
            leadingIcon="ri-mail-line"
            :disabled="isLoading"
            :isRight="true"
            :isLeft="true"
          />
        </RFormGroup>

        <!-- Server error -->
        <Transition name="fade-up">
          <div v-if="serverError" class="auth-error">
            <i class="ri-error-warning-line" />
            {{ serverError }}
          </div>
        </Transition>

        <button type="submit" class="btn-primary btn-full" :disabled="isLoading">
          <span v-if="isLoading">
            <i class="ri-loader-4-line animate-spin" />
            {{ tr('auth.sending') }}
          </span>
          <span v-else>
            <i class="ri-mail-check-line" />
            {{ tr('auth.send_reset_link') }}
          </span>
        </button>

      </RForm>
    </Transition>

    <!-- Footer links -->
    <div class="auth-footer-links">
      <p class="auth-switch">
        {{ tr('auth.has_account') }}
        <NuxtLink :to="localePath('/auth/login')" class="auth-link">{{ tr('auth.sign_in') }}</NuxtLink>
      </p>
      <p class="auth-switch">
        {{ tr('auth.no_account') }}
        <NuxtLink :to="localePath('/auth/register')" class="auth-link">{{ tr('auth.sign_up') }}</NuxtLink>
      </p>
    </div>

  </div>
</template>

<script setup>
import { z } from 'zod'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Forgot Password' })

const { tBy } = useSarikaLocale()
const { tr } = useTr()

// ── State ─────────────────────────────────────────────────────
const form = reactive({ email: '' })
const formRef     = ref(null)
const isLoading   = ref(false)
const sent        = ref(false)
const serverError = ref('')

// ── Schema ────────────────────────────────────────────────────
const formSchema = z.object({
  email: z.preprocess(v => v ?? '', z.string().trim()
    .min(1,   tr('validation.email_required'))
    .email(   tr('validation.email_invalid'))
    .max(100, tr('validation.max_100'))
  )
})

// ── Submit ────────────────────────────────────────────────────
const handleSubmit = async () => {
  serverError.value = ''
  isLoading.value = true
  try {
    const { error } = await useHttp('/api/v1/auth/forgot-password', {
      method: 'POST',
      body: { email: form.email },
      isGlobal: true,
    })
    
    if (error?.value) {
      serverError.value = error.value?.message || 'Something went wrong.'
      return
    }
    sent.value = true
  } catch {
    serverError.value = 'Something went wrong. Please try again.'
  } finally {
    isLoading.value = false
  }
}

// ── Resend ────────────────────────────────────────────────────
const resend = () => {
  sent.value = false
  serverError.value = ''
}
</script>

<style lang="scss" scoped>

// ── Sent state ────────────────────────────────────────────────
.sent-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--sp-2) 0 var(--sp-4);
}

.sent-icon-wrap {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--c-accent-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--sp-4);

  i {
    font-size: 1.75rem;
    color: var(--c-accent);
  }
}

.sent-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--c-text);
  margin-bottom: var(--sp-2);
}

.sent-body {
  font-size: 0.875rem;
  color: var(--c-muted);
  line-height: 1.6;
  max-width: 300px;

  strong { color: var(--c-text); }
}

// ── Outline button (if not global) ────────────────────────────
.btn-outline {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 42px;
  border: 1px solid var(--c-border);
  border-radius: var(--r-md);
  background: transparent;
  color: var(--c-text);
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: border-color var(--t-base), background var(--t-base);

  &:hover {
    border-color: var(--c-accent);
    background: var(--c-accent-soft);
  }
}

// ── Footer links ──────────────────────────────────────────────
.auth-footer-links {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-2);
  margin-top: var(--sp-4);
}

// ── Transitions ───────────────────────────────────────────────
.fade-up-enter-active,
.fade-up-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}
.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

</style>