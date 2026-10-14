<template>
  <div class="plan-gate-wrap" :class="{ locked: !allowed }">
    <slot />
    <div v-if="!allowed" class="plan-gate-overlay">
      <div class="plan-gate-card">
        <i class="ri-lock-2-line" />
        <p class="plan-gate-label">{{ label || 'Upgrade to access this feature' }}</p>
        <span class="plan-gate-badge">{{ planStore.displayName }} plan</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  feature: { type: String, required: true },
  label: { type: String, default: '' },
})

const planStore = usePlanStore()

const FEATURE_MAP = {
  telegram: 'canTelegram',
  email: 'canEmail',
  gallery: 'canGallery',
  wishes: 'canWishes',
  reports: 'canReports',
  export: 'canExport',
  budget: 'canBudget',
  tasks: 'canTasks',
}

const allowed = computed(() => {
  const key = FEATURE_MAP[props.feature]
  return key ? planStore[key] : true
})
</script>

<style lang="scss">
.plan-gate-wrap {
  position: relative;

  &.locked {
    pointer-events: none;
    user-select: none;
  }
}

.plan-gate-overlay {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  border-radius: inherit;
}

.plan-gate-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-5) var(--sp-6);
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-xl);
  text-align: center;

  i {
    font-size: 2rem;
    color: var(--c-accent);
  }
}

.plan-gate-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--c-text);
  margin: 0;
}

.plan-gate-badge {
  font-size: 0.75rem;
  color: var(--c-muted);
  background: rgba(255, 140, 66, 0.12);
  border: 1px solid rgba(255, 140, 66, 0.25);
  border-radius: var(--r-full);
  padding: 2px 10px;
}
</style>
