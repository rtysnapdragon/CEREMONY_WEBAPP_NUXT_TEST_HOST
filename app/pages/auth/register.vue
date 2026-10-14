<template>
  <div class="rp-page animate-scale-in">

    <!-- ══════════════════════════════
         DESKTOP  left brand panel
    ══════════════════════════════ -->
    <aside class="rp-panel" aria-hidden="true">
      <div class="rp-panel-inner">

        <!-- Brand -->
        <div class="rp-brand">
          <div class="rp-brand-mark">S</div>
          <span class="rp-brand-name">Sarika</span>
        </div>

        <!-- Hero copy -->
        <div class="rp-hero">
          <p class="rp-eyebrow">{{ tr('auth.app_tagline') }}</p>
          <h1 class="rp-headline" v-html="tr('auth.hero_headline')" />
          <p class="rp-hero-sub">{{ tr('auth.hero_sub') }}</p>

          <ul class="rp-features" role="list">
            <li v-for="feat in features" :key="feat.en" class="rp-feat">
              <span class="rp-feat-dot" aria-hidden="true" />
              <span>{{ tBy(feat) }}</span>
            </li>
          </ul>
        </div>

        <!-- Testimonial -->
        <blockquote class="rp-quote">
          <p class="rp-quote-text">{{ tr('auth.testimonial_text') }}</p>
          <footer class="rp-quote-author">{{ tr('auth.testimonial_author') }}</footer>
        </blockquote>
      </div>
    </aside>

    <!-- ══════════════════════════════
         FORM PANEL (all viewports)
    ══════════════════════════════ -->
    <main class="rp-form-panel">

      <!-- Mobile / tablet header (hidden on desktop) -->
      <div class="rp-mobile-header" aria-hidden="true">
        <div class="rp-mh-brand">
          <div class="rp-brand-mark rp-brand-mark--sm">S</div>
          <span class="rp-brand-name rp-brand-name--sm">Sarika</span>
        </div>
        <div class="rp-mh-right">
          <p class="rp-mh-title">{{ tr('auth.sign_up') }}</p>
          <p class="rp-mh-sub">{{ tr('auth.app_tagline') }}</p>
        </div>
      </div>

      <div class="rp-form-wrap">

        <!-- Desktop form header (hidden on mobile/tablet) -->
        <div class="rp-form-header">
          <h2 class="rp-form-title">{{ tr('auth.sign_up') }}</h2>
          <p class="rp-form-sub">{{ tr('app.tagline') }}</p>
        </div>

        <!-- Social auth -->
        <div class="social-auth">
          <button class="social-btn" :disabled="authStore.loading" @click="handleGoogle">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Google</span>
          </button>
          <button class="social-btn" :disabled="authStore.loading" @click="handleTelegram">
            <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.24 14.238l-2.95-.924c-.641-.203-.654-.641.136-.953l11.52-4.44c.535-.194 1.003.13.616.327z" fill="#2CA5E0"/>
            </svg>
            <span>Telegram</span>
          </button>
          <button class="social-btn" disabled :title="tr('common.coming_soon')">
            <i class="ri-facebook-fill" style="color:#1877f2;font-size:1rem" aria-hidden="true" />
            <span>Facebook</span>
          </button>
        </div>

        <div ref="googleBtnRef" style="display:none;position:absolute" />
        <div ref="telegramWidgetRef" style="display:none" />

        <!-- Divider -->
        <div class="auth-divider">
          <hr class="divider" />
          <span>{{ tr('auth.or_continue_with') }}</span>
          <hr class="divider" />
        </div>

        <!-- Register form -->
        <RForm
          ref="formRef"
          class="auth-form"
          :schema="registerSchema"
          :state="form"
          @onSubmit="handleRegister"
        >
          <div class="form-row-2">
            <RFormGroup name="firstName" :label="tr('common.first_name')" required>
              <RInput
                v-model="form.firstName"
                type="text"
                :placeholder="tr('common.first_name')"
                leadingIcon="ri-user-line"
                :isLeft="true" :isRight="true"
                :ui="{ base: 'input-base'}"
              />
            </RFormGroup>
            <RFormGroup name="lastName" :label="tr('common.last_name')" required>
              <RInput
                v-model="form.lastName"
                type="text"
                :placeholder="tr('common.last_name')"
                leadingIcon="ri-user-line"
                :isLeft="true" :isRight="true"
                :ui="{ base: 'input-base'}"
              />
            </RFormGroup>
          </div>


          <RFormGroup name="username" :label="tr('common.username')" required>
            <RInput
              v-model="form.username"
              type="text"
              :placeholder="tr('common.username')"
              autocomplete="username"
              leadingIcon="ri-at-line"
              :isLeft="true" :isRight="true"
              :ui="{ base: 'input-base'}"
            />
          </RFormGroup>

          <RFormGroup name="email" :label="tr('common.email')" required>
            <RInput
              v-model="form.email"
              type="email"
              :placeholder="tr('common.email')"
              autocomplete="email"
              leadingIcon="ri-mail-line"
              :isLeft="true" :isRight="true"
              :ui="{ base: 'input-base'}"
            />
          </RFormGroup>

          <RFormGroup name="password" :label="tr('common.password')" required>
            <RInput
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              :placeholder="tr('common.password')"
              autocomplete="new-password"
              leadingIcon="ri-lock-line"
              :isLeft="true" :isRight="true"
              :ui="{ base: 'input-base'}"
            />
            <template #help>
              <div class="help-wrapper" :style="{ marginTop: form.password?.length < 6 ? '6px' : '0px'}">
                <div v-if="form.password.length >= 6" class="text-green-500"> <i class="ri-checkbox-circle-fill" :class="form.password.length >= 6 ? 'text-success' : 'text-gray'" />{{ tr('auth.six_plus_chars') }}</div>
                <div class="pw-strength">
                  <div
                    v-for="i in 4"
                    :key="i"
                    class="pw-bar"
                    :class="{ active: passwordStrength >= i, [`s${passwordStrength}`]: true }"
                  />
                  <span
                    v-if="passwordStrength > 0"
                    class="pw-label"
                    :class="`s${passwordStrength}`"
                  >
                    {{ pwStrengthLabel }}
                  </span>
                </div>
              </div>
            </template>
          </RFormGroup>

          <RFormGroup name="confirmPassword" :label="tr('auth.confirm_password')" required>
            <RInput
              v-model="form.confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              :placeholder="tr('auth.confirm_password')"
              autocomplete="new-password"
              leadingIcon="ri-lock-2-line"
              :trailingIcon="pwMatchIcon"
              :isLeft="true" :isRight="true"
              :ui="{ base: 'input-base'}"
            />
            <template #help>
              <Transition name="fade-up">
                <span v-if="form.confirmPassword && !pwMatch" class="field-error">
                  <i class="ri-error-warning-line" aria-hidden="true" />
                  {{ tr('auth.passwords_no_match') }}
                </span>
                <span v-else-if="form.confirmPassword && pwMatch" class="field-ok">
                  <i class="ri-checkbox-circle-line" aria-hidden="true" />
                  {{ tr('auth.passwords_match') }}
                </span>
              </Transition>
            </template>
          </RFormGroup>

          <!-- Show / hide toggle -->
          <div
            class="show-pass-toggle cursor-pointer"
            @click="showPassword = !showPassword"
          >
            {{ showPassword
              ? tr('auth.hide_password')
              : tr('auth.show_password') }}
          </div>

          <!-- Submit -->
          <button
            type="submit"
            class="btn-primary btn-full"
            :disabled="authStore.loading || (!!form.confirmPassword && !pwMatch)"
            @click="formSubmit"
          >
            <template v-if="authStore.loading">
              <i class="ri-loader-4-line animate-spin" aria-hidden="true" />
              {{ tr('auth.creating_account') }}
            </template>
            <template v-else>
              {{ tr('auth.sign_up') }}
              <i class="ri-arrow-right-line" aria-hidden="true" />
            </template>
          </button>

          <p class="terms-text">{{ tr('auth.terms') }}</p>
        </RForm>

        <!-- Footer links -->
        <div class="auth-footer-links">
          <p class="auth-switch">
            {{ tr('auth.has_account') }}
            <NuxtLink :to="localePath('/auth/login')" dfass="auth-link">
              {{ tr('auth.sign_in') }}
            </NuxtLink>
          </p>
          <NuxtLink :to="localePath('/auth/forgot-password')" class="forgot-link">
            {{ tr('auth.forgot_password') }}
          </NuxtLink>
        </div>

      </div><!-- /rp-form-wrap -->
    </main>
  </div>
</template>

<script setup>
import { z } from 'zod'
definePageMeta({ layout: 'auth' })

const toast     = useRToast()
const { tr } = useTr()
const authStore = useAuthStore()
// ── State ───────────────────────────────────────────────────
const form = reactive({
  firstName: '', lastName: '', username: '',
  email: '', password: '', confirmPassword: '',
})
const showPassword = ref(false)
const error        = ref('')
const formRef      = ref(null)

useHead({ title: tr('auth.register') })

// ── Computed ─────────────────────────────────────────────────
const passwordStrength = computed(() => {
  const p = form.password
  let s = 0
  if (p.length >= 6)          s++
  if (/[A-Z]/.test(p))        s++
  if (/[0-9]/.test(p))        s++
  if (/[^A-Za-z0-9]/.test(p)) s++
  return s
})

const pwStrengthLabel = computed(() => {
  const s = passwordStrength.value
  if (s <= 0) return tr('auth.password_not_secure')
  if (s <= 1) return tr('auth.password_weak')
  if (s <= 2) return tr('auth.password_medium')
  if (s <= 3) return tr('auth.password_strong')
  return tr('auth.password_very_strong')
})

const pwMatch = computed(() =>
  !!form.password && form.password === form.confirmPassword
)

const registerSchema = z.object({
  firstName: z.preprocess(
    (v) => v ?? '',
    z.string()
      .trim()
      .min(1, tr('validation.first_name_required'))
      .min(2, tr('validation.first_name_min'))
      .max(30, tr('validation.first_name_max'))
  ),

  lastName: z.preprocess(
    (v) => v ?? '',
    z.string()
      .trim()
      .min(1, tr('validation.last_name_required'))
      .min(2, tr('validation.last_name_min'))
      .max(30, tr('validation.last_name_max'))
  ),

  username: z.preprocess(
    (v) => v ?? '',
    z.string()
      .trim()
      .min(1, tr('validation.username_required'))
      .min(3, tr('validation.username_min'))
      .max(20, tr('validation.username_max'))
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
  ),

  email: z.preprocess(
    (v) => v ?? '',
    z.string()
      .trim()
      .min(1, tr('validation.email_required'))
      .email(tr('validation.email_invalid'))
      .max(100, tr('validation.max_100'))
  ),

  password: z.preprocess(
    (v) => v ?? '',
    z.string()
      .min(1, tr('validation.password_required'))
      .min(4, tr('validation.password_min'))
      .max(15, tr('validation.password_max'))
  ),

  confirmPassword: z.preprocess(
    (v) => v ?? '',
    z.string()
      .min(1, tr('validation.password_required'))
      .min(4, tr('validation.password_min'))
      .max(15, tr('validation.password_max'))
  ),

  remember: z.boolean().default(false)
})

// ── Handlers ─────────────────────────────────────────────────
async function formSubmit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return
  handleRegister()
}

const redirectAfterLogin = async () => {
  const eventStore = useEventStore()
  if (!eventStore.initialized) {
    await eventStore.fetchEvents()
  }
  const dest = eventStore.events?.length > 0 ? '/' : '/ceremony'
  return navigateTo(localePath(dest))
}

const handleRegister = async () => {
  error.value = ''
  if (!pwMatch.value) return
  const result = await authStore.register(form)
  if (result.success) {
    toast.add({ type: 'success', color: 'success', title: 'Welcome!', description: 'Account created successfully' })
    await redirectAfterLogin()
  } else {
    error.value = result.error || 'Registration failed. Please try again.'
  }
}

// ── Social auth (shared composable) ────────────────────────────
const {
  googleBtnRef,
  telegramWidgetRef,
  handleGoogle: triggerGoogle,
  handleTelegram: triggerTelegram,
} = useSocialAuth()

const socialSuccess = async (provider) => {
  await redirectAfterLogin()
  toast.add({
    type: 'success',
    color: 'success',
    title: 'Welcome!',
    description: provider === 'Google' ? 'Account created successfully' : `Signed in via ${provider}`,
  })
}

const socialFail = (msg) => { error.value = msg }

const handleGoogle = () => triggerGoogle({ onSuccess: () => socialSuccess('Google'), onError: socialFail })
const handleTelegram = () => triggerTelegram({ onSuccess: () => socialSuccess('Telegram'), onError: socialFail })
</script>

<style lang="scss">
/* ══════════════════════════════════════════════════
   REGISTER PAGE — SARIKA
   Layout: desktop split (50/50) | tablet card | mobile stacked
══════════════════════════════════════════════════ */

// ── Page shell ───────────────────────────────────────────────
.rp-page {
  // min-height: 100vh;
  height: 100%;
  overflow: hidden;
  display: flex;

  // tablet + mobile: centered card
  @media (max-width: 1023px) {
    align-items: flex-start;
    justify-content: center;
    background: var(--c-bg);
    padding: var(--sp-6) var(--sp-4) var(--sp-10);

    &::before {
      content: '';
      position: fixed;
      inset: 0;
      background: radial-gradient(ellipse 70% 50% at 50% 20%, rgba(255,140,66,.07) 0%, transparent 65%);
      pointer-events: none;
      z-index: 0;
    }
  }
}

// ── Left brand panel (desktop only) ─────────────────────────
.rp-panel {
  display: none;

  @media (min-width: 1024px) {
    display: flex;
    flex: 0 0 46%;
    background: linear-gradient(160deg, #1a1510 0%, #2d1f0d 55%, #3d2810 100%);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse 80% 60% at 30% 20%, rgba(255,140,66,.18) 0%, transparent 60%),
        radial-gradient(ellipse 60% 80% at 85% 85%, rgba(255,179,71,.10) 0%, transparent 55%);
      pointer-events: none;
    }

    // decorative ring
    &::after {
      content: '';
      position: absolute;
      bottom: -80px;
      right: -80px;
      width: 320px;
      height: 320px;
      border-radius: 50%;
      border: 1.5px solid rgba(255,140,66,.1);
      pointer-events: none;
    }
  }
}

.rp-panel-inner {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--sp-8);
  padding: 48px 48px 44px;
  position: relative;
  z-index: 1;
  width: 100%;
}

// ── Brand mark ───────────────────────────────────────────────
.rp-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rp-brand-mark {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--c-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.5px;
  box-shadow: 0 4px 16px rgba(255,140,66,.38);
  flex-shrink: 0;

  &--sm {
    width: 30px;
    height: 30px;
    border-radius: 9px;
    font-size: 13px;
  }
}

.rp-brand-name {
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.05em;
  text-transform: uppercase;

  &--sm { font-size: 12px; }
}

// ── Hero copy ────────────────────────────────────────────────
.rp-hero {
  display: flex;
  flex-direction: column;
  gap: var(--sp-5);
  flex: 1;
  justify-content: center;
}

.rp-eyebrow {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--c-accent);
}

.rp-headline {
  font-size: clamp(1.7rem, 2.4vw, 2.1rem);
  font-weight: 800;
  color: #fff;
  line-height: 1.18;
  letter-spacing: -0.025em;

  em {
    color: var(--c-accent);
    font-style: normal;
  }
}

.rp-hero-sub {
  font-size: 0.84rem;
  color: rgba(255,255,255,.48);
  line-height: 1.65;
  max-width: 300px;
}

.rp-features {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rp-feat {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.78rem;
  color: rgba(255,255,255,.52);
  line-height: 1.4;
}

.rp-feat-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--c-accent);
  flex-shrink: 0;
}

// ── Quote ────────────────────────────────────────────────────
.rp-quote {
  padding: 16px 20px;
  border-radius: var(--r-lg);
  background: rgba(255,255,255,.04);
  border: 0.5px solid rgba(255,255,255,.08);
}

.rp-quote-text {
  font-size: 0.78rem;
  color: rgba(255,255,255,.5);
  line-height: 1.6;
  font-style: italic;
  margin-bottom: 8px;
}

.rp-quote-author {
  font-size: 0.7rem;
  color: var(--c-accent);
  font-weight: 600;
  font-style: normal;
}

// ── Form panel ───────────────────────────────────────────────
.rp-form-panel {
  flex: 1;
  display: flex;
  flex-direction: column;

  @media (min-width: 1024px) {
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    overflow-y: auto;
    align-items: center;
    justify-content: center;
  }

  @media (max-width: 1023px) {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 520px;
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur-sm);
    border: 0.5px solid var(--glass-border);
    border-radius: var(--r-xl);
    box-shadow: var(--glass-shadow);
    overflow: hidden;
  }
}

// ── Mobile / tablet top bar ───────────────────────────────────
.rp-mobile-header {
  display: none;

  @media (max-width: 1023px) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--sp-4);
    padding: 20px 24px 18px;
    background: linear-gradient(135deg, #1a1510 0%, #2d1f0d 100%);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      right: -24px;
      top: -24px;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      border: 1px solid rgba(255,140,66,.14);
      pointer-events: none;
    }
  }
}

.rp-mh-brand {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rp-mh-right { text-align: right; }

.rp-mh-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #fff;
}

.rp-mh-sub {
  font-size: 0.7rem;
  color: rgba(255,255,255,.42);
  margin-top: 2px;
}

// ── Form wrap ────────────────────────────────────────────────
.rp-form-wrap {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
  padding: var(--sp-8) var(--sp-8) var(--sp-6);
  width: 100%;
  max-width: 480px;

  @media (max-width: 1023px) {
    padding: var(--sp-6) var(--sp-6) var(--sp-5);
    max-width: 100%;
  }

  @media (max-width: 480px) {
    padding: var(--sp-5) var(--sp-4) var(--sp-4);
  }
}

// ── Desktop form header (hidden on tablet/mobile) ─────────────
.rp-form-header {
  text-align: center;
  margin-bottom: var(--sp-1);

  @media (max-width: 1023px) { display: none; }
}

.rp-form-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--c-text);
  line-height: 1.2;
  margin-bottom: 4px;
}

.rp-form-sub {
  font-size: 0.82rem;
  color: var(--c-muted);
}

// ── Social buttons ────────────────────────────────────────────
.social-auth {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--sp-2);
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 40px;
  border: 0.5px solid var(--c-border);
  border-radius: var(--r-full);
  background: var(--c-surface);
  color: var(--c-text);
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  transition: border-color var(--t-base), box-shadow var(--t-base), transform 0.12s;

  &:hover:not(:disabled) {
    border-color: rgba(255,140,66,.45);
    box-shadow: 0 0 0 3px rgba(255,140,66,.08);
    transform: translateY(-1px);
  }

  &:active:not(:disabled) { transform: translateY(0); }
  &:disabled { opacity: 0.42; cursor: not-allowed; }

  span { font-size: 0.75rem; }
}

// ── Divider ───────────────────────────────────────────────────
.auth-divider {
  display: flex;
  align-items: center;
  gap: var(--sp-3);

  .divider { flex: 1; border: none; height: 0.5px; background: var(--c-border); }
  span { font-size: 0.72rem; color: var(--c-muted); white-space: nowrap; }
}

// ── 2-col row ─────────────────────────────────────────────────
.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-3);

  @media (max-width: 380px) { grid-template-columns: 1fr; }
}

// ── Auth form ─────────────────────────────────────────────────
.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

// ── Password strength ─────────────────────────────────────────
.help-wrapper {
  display: flex;
  flex-direction: column;
  // gap: 0;
}
.help-wrapper > * + * {
  margin-top: -5px;
}
.pw-strength {
  display: flex;
  align-items: center;
  gap: 4px;
  // margin-top: v-bind('form.password?.length < 6 ? "6px" : "0px"');

  .pw-bar {
    flex: 1;
    height: 3px;
    border-radius: var(--r-full);
    background: var(--c-border);
    transition: background var(--t-base);

    &.active {
      &.s0 { background: var(--c-error) !important; }
      &.s1 { background: var(--c-danger) !important; }
      &.s2 { background: var(--c-accent-2) !important; }
      &.s3 { background: var(--c-info) !important; }
      &.s4 { background: var(--c-success) !important; }
    }
  }

  .pw-label {
    font-size: 0.68rem;
    font-weight: 600;
    white-space: nowrap;
    min-width: 58px;
    text-align: right;

    &.s1 { color: var(--c-danger); }
    &.s2 { color: var(--c-accent-2); }
    &.s3 { color: var(--c-info); }
    &.s4 { color: var(--c-success); }
  }
}

.input-base {
  border-radius: var(--r-full) !important;
  // height: 40px !important;
  padding: 8px 35px !important;
}



// ── Field feedback ─────────────────────────────────────────────
.field-error,
.field-ok {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.73rem;
  margin-top: 3px;

  i { font-size: 0.85rem; }
}

.field-error { color: var(--c-danger); }
.field-ok    { color: var(--c-success); }

// ── Show password toggle ──────────────────────────────────────
.show-pass-toggle {
  width: fit-content;
  background: none;
  border: none;
  padding: 0;
  font-size: 0.78rem;
  color: var(--c-muted);
  cursor: pointer;
  font-family: inherit;
  transition: color var(--t-base);
  text-decoration: underline;
  text-underline-offset: 2px;

  &:hover { color: var(--c-accent); }
}

// ── Terms ─────────────────────────────────────────────────────
.terms-text {
  font-size: 0.67rem;
  color: var(--c-muted);
  text-align: center;
  line-height: 1.55;
}

// ── Footer links ──────────────────────────────────────────────
.auth-footer-links {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-2);
  padding-top: var(--sp-2);
}

.auth-switch {
  font-size: 0.78rem;
  color: var(--c-muted);
  text-align: center;
}

.auth-link {
  color: var(--c-accent);
  font-weight: 600;
  text-decoration: none;
  &:hover { text-decoration: underline; }
}

.forgot-link {
  font-size: 0.73rem;
  color: var(--c-muted);
  opacity: 0.7;
  text-decoration: none;
  &:hover { color: var(--c-accent); opacity: 1; }
}

// ── Transitions ───────────────────────────────────────────────
.fade-up-enter-active,
.fade-up-leave-active { transition: opacity 0.18s, transform 0.18s; }
.fade-up-enter-from,
.fade-up-leave-to     { opacity: 0; transform: translateY(-3px); }
</style>
