<template>
  <div>
    <!-- Full-screen lock — blocks interaction while offline -->
    <Transition name="lock-fade">
      <div
        v-if="!isOnline"
        class="network-lock"
        role="alertdialog"
        aria-modal="true"
        :aria-label="t('offline')"
      >
        <div class="network-lock__panel">
          <div class="network-lock__icon">
            <i class="ri-wifi-off-fill" />
          </div>

          <h2 class="network-lock__title">{{ t('offline') }}</h2>
          <p class="network-lock__desc">{{ t('waiting_internet_connection') }}</p>

          <div class="network-lock__status">
            <span class="network-lock__dot" />
            {{ t('reconnecting') }}
          </div>

          <button
            type="button"
            class="network-lock__retry"
            :disabled="checking"
            @click="retryCheck"
          >
            <i :class="checking ? 'ri-loader-4-line ri-spin' : 'ri-refresh-line'" />
            {{ t('retry') }}
          </button>
        </div>
      </div>
    </Transition>

    <!-- Bottom-right toast stack (used for the "back online" confirmation) -->
    <div class="toast-container">
      <div class="toast-stack">
        <TransitionGroup name="toast" tag="div">
          <div
            v-for="toast in toasts"
            :key="toast.id"
            class="toast"
            :class="`toast--${toast.type}`"
          >
            <div class="toast__content">
              <div class="toast__icon" :class="`toast__icon--${toast.type}`">
                <i :class="toast.type === 'success' ? 'ri-wifi-fill' : 'ri-wifi-off-fill'" />
              </div>

              <div class="toast__message">
                <div class="toast__title">
                  {{ toast.title || (toast.type === 'success' ? t('online') : t('offline')) }}
                </div>
                <div v-if="toast.message" class="toast__description">
                  {{ toast.message }}
                </div>
              </div>
            </div>

            <div
              v-if="toast.timeout"
              class="toast__progress"
              :style="{ '--duration': `${toast.timeout}ms` }"
            />
          </div>
        </TransitionGroup>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// ── Online status ──────────────────────────────────────────────────────────
const isOnline = ref(true)
const checking = ref(false)

// ── Toasts (used only for the transient "back online" confirmation) ────────
interface Toast {
  id: number
  type: 'success' | 'error'
  message: string
  title?: string
  timeout?: number
}

const toasts = ref<Toast[]>([])
let toastId = 0

const removeToastById = (id: number) => {
  toasts.value = toasts.value.filter(toast => toast.id !== id)
}

const addToast = (type: Toast['type'], message: string, timeout = 6000) => {
  const id = toastId++
  toasts.value.push({ id, type, message, timeout })
  setTimeout(() => removeToastById(id), timeout)
  return id
}

// ── Handlers (named so they can be removed on unmount) ─────────────────────
const handleOnline = () => {
  isOnline.value = true
  addToast('success', t('restore_internet_connection'))
}

const handleOffline = () => {
  isOnline.value = false
}

const retryCheck = () => {
  if (!import.meta.client || checking.value) return
  checking.value = true
  setTimeout(() => {
    isOnline.value = navigator.onLine
    checking.value = false
  }, 500)
}

onMounted(() => {
  if (!import.meta.client) return

  isOnline.value = navigator.onLine
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
})

onUnmounted(() => {
  if (!import.meta.client) return
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
})
</script>

<style lang="scss" scoped>
// ── Shared motion ────────────────────────────────────────────────────────────
$transition-duration: 300ms;
$transition-easing: cubic-bezier(0.25, 0.1, 0.25, 1);

// ── Full-screen offline lock ─────────────────────────────────────────────────
.network-lock {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;

  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
}

.network-lock__panel {
  width: 100%;
  max-width: 340px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.6rem;
  padding: 2rem 1.75rem;
  border-radius: 20px;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  box-shadow: var(--glass-shadow);
}

.network-lock__icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-bottom: 0.25rem;
  background: color-mix(in srgb, var(--c-danger) 14%, transparent);
  color: var(--c-danger);

  i { font-size: 1.75rem; }
}

.network-lock__title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--c-text);
}

.network-lock__desc {
  margin: 0;
  font-size: 0.875rem;
  color: var(--c-muted);
  line-height: 1.5;
}

.network-lock__status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--c-danger);
}

.network-lock__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--c-danger);
  animation: pulse-dot 1.4s ease-in-out infinite;
}

.network-lock__retry {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.9rem;
  padding: 0.5rem 1.1rem;
  border: 1px solid var(--c-border);
  border-radius: 999px;
  background: var(--c-bg);
  color: var(--c-accent);
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, opacity 0.2s ease;

  &:hover:not(:disabled) {
    background: color-mix(in srgb, var(--c-accent) 10%, transparent);
  }

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }

  i { font-size: 1rem; }
}

.lock-fade-enter-active,
.lock-fade-leave-active {
  transition: opacity $transition-duration $transition-easing;
}
.lock-fade-enter-from,
.lock-fade-leave-to {
  opacity: 0;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.8); }
}

// ── Toast stack ───────────────────────────────────────────────────────────────
.toast-container {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
}

.toast-stack {
  position: absolute;
  bottom: 1.5rem;
  right: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.toast {
  pointer-events: auto;
  position: relative;
  width: 320px;
  max-width: calc(100vw - 2rem);
  border-radius: 14px;
  overflow: hidden;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  box-shadow: var(--glass-shadow);
  border: 1px solid var(--glass-border);
  transition: all $transition-duration $transition-easing;

  &--success { border-left: 4px solid var(--c-success); }
  &--error { border-left: 4px solid var(--c-danger); }
}

.toast__content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.1rem;
}

.toast__icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;

  &--success {
    background: color-mix(in srgb, var(--c-success) 16%, transparent);
    color: var(--c-success);
  }

  &--error {
    background: color-mix(in srgb, var(--c-danger) 16%, transparent);
    color: var(--c-danger);
  }
}

.toast__message {
  flex-grow: 1;
  min-width: 0;
}

.toast__title {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--c-text);
}

.toast__description {
  margin-top: 0.15rem;
  font-size: 0.8125rem;
  color: var(--c-muted);
  line-height: 1.3;
}

.toast__progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 100%;
  transform-origin: left;
  animation: progress var(--duration) linear forwards;
}

.toast--success .toast__progress {
  background: linear-gradient(to right, var(--c-success), var(--c-accent-2));
}
.toast--error .toast__progress {
  background: linear-gradient(to right, var(--c-danger), var(--c-accent-2));
}

@keyframes progress {
  from { transform: scaleX(1); }
  to { transform: scaleX(0); }
}

// Toast enter/leave/move
.toast-move,
.toast-enter-active,
.toast-leave-active {
  transition: all $transition-duration $transition-easing;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
.toast-leave-active {
  position: absolute;
}
</style>