<template>
  <GlassCard
    :title="t('quick_actions')"
    icon="i-heroicons-bolt"
    class="animate-fade-in-up delay-200"
  >
    <div class="quick-grid">
      <NuxtLink
        v-for="action in quickActions"
        :key="action.to"
        :to="action.to"
        class="quick-action"
        :class="action.colorClass"
      >
        <div class="action-icon-wrap">
          <UIcon :name="action.icon" class="action-icon" />
        </div>
        <span class="action-label">{{ tBy({ en: action.labelEn, km: action.labelKm }) }}</span>
      </NuxtLink>
    </div>
  </GlassCard>
</template>

<script setup lang="ts">
const { t } = useI18n()
const { tBy } = useSarikaLocale()

const quickActions = [
  {
    labelEn: 'Add Guest',
    labelKm: 'បន្ថែមភ្ញៀវ',
    icon: 'i-heroicons-user-plus',
    to: '/guest_management',
    colorClass: 'action-blue',
  },
  {
    labelEn: 'Send Invitation',
    labelKm: 'ផ្ញើការអញ្ជើញ',
    icon: 'i-heroicons-paper-airplane',
    to: '/setup_and_invitation',
    colorClass: 'action-orange',
  },
  {
    labelEn: 'Add Task',
    labelKm: 'បន្ថែមភារកិច្ច',
    icon: 'i-heroicons-plus-circle',
    to: '/tasks',
    colorClass: 'action-purple',
  },
  {
    labelEn: 'Record Gift',
    labelKm: 'កត់ត្រាអំណោយ',
    icon: 'i-heroicons-gift',
    to: '/gift_record',
    colorClass: 'action-gold',
  },
  {
    labelEn: 'Add Expense',
    labelKm: 'បន្ថែមចំណាយ',
    icon: 'i-heroicons-banknotes',
    to: '/budget',
    colorClass: 'action-green',
  },
  {
    labelEn: 'View Schedule',
    labelKm: 'មើលកាលវិភាគ',
    icon: 'i-heroicons-calendar-days',
    to: '/events',
    colorClass: 'action-red',
  },
]
</script>

<style lang="scss" scoped>
.quick-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--sp-4);

  @include sm {
    grid-template-columns: repeat(3, 1fr);
  }
}

.quick-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-1);
  padding: var(--sp-4) var(--sp-2);
  border-radius: var(--r-lg);
  border: 1px solid transparent;
  text-decoration: none;
  transition: all 0.25s ease;
  cursor: pointer;
  text-align: center;

  &:hover {
    transform: translateY(-2px);
    border-color: var(--c-border);
    background: var(--c-surface);
  }

  &.action-orange {
    .action-icon-wrap { background: var(--color-orange-soft); }
    .action-icon { color: var(--color-orange); }
    &:hover { border-color: var(--color-orange-soft); }
  }

  &.action-blue {
    .action-icon-wrap { background: var(--color-blue-soft); }
    .action-icon { color: var(--color-blue); }
    &:hover { border-color: var(--color-blue-soft); }
  }

  &.action-purple {
    .action-icon-wrap { background: rgba(139, 92, 246, 0.12); }
    .action-icon { color: #8b5cf6; }
    &:hover { border-color: rgba(139, 92, 246, 0.25); }
  }

  &.action-gold {
    .action-icon-wrap { background: var(--color-gold-soft); }
    .action-icon { color: var(--color-gold); }
    &:hover { border-color: var(--color-gold-soft); }
  }

  &.action-green {
    .action-icon-wrap { background: var(--color-green-soft); }
    .action-icon { color: var(--color-green); }
    &:hover { border-color: var(--color-green-soft); }
  }

  &.action-red {
    .action-icon-wrap { background: var(--color-red-soft); }
    .action-icon { color: var(--color-red); }
    &:hover { border-color: var(--color-red-soft); }
  }
}

.action-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: var(--r-lg);
  @include flex-center;
  transition: all 0.25s ease;
}

.action-icon {
  width: 22px;
  height: 22px;
}

.action-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-secondary);
  line-height: 1.3;
}
</style>
