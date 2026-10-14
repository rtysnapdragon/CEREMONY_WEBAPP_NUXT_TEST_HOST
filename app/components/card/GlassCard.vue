<template>
  <div
    class="glass-card-component"
    :class="[
      padding,
      {
        'glow-orange': glow === 'orange',
        'glow-gold': glow === 'gold',
        'card-hoverable': hoverable,
      }
    ]"
  >
    <!-- Card header -->
    <div v-if="title || $slots.header" class="card-header">
      <slot name="header">
        <div class="card-title-wrap">
          <div v-if="icon" class="card-icon-wrap">
            <UIcon :name="icon" class="card-icon" />
          </div>
          <div>
            <h3 class="card-title">{{ title }}</h3>
            <p v-if="subtitle" class="card-subtitle">{{ subtitle }}</p>
          </div>
        </div>
        <div v-if="$slots.actions" class="card-actions">
          <slot name="actions" />
        </div>
      </slot>
    </div>

    <!-- Card body -->
    <slot />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  subtitle?: string
  icon?: string
  padding?: string
  glow?: 'orange' | 'gold' | false
  hoverable?: boolean
}>(), {
  padding: 'p-6',
  glow: false,
  hoverable: false,
})
</script>

<style lang="scss" scoped>
$accent-orange: #f97316;
$accent-gold: #d4a843;
.glass-card-component {
  background: var(--c-surface);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  // border: 1px solid var(--c-border);
  box-shadow: var(--c-shadow);
  border-radius: var(--r-lg);
  transition: all 0.02ms ease;

  &.card-hoverable {
    cursor: pointer;

    &:hover {
      background: var(--glass-bg-hover);
      border-color: var(--border-hover);
      transform: translateY(-2px);
      box-shadow: var(--glass-shadow), 0 8px 24px rgba(0, 0, 0, 0.2);
    }
  }

  &.glow-orange {
    border-color: rgba($accent-orange, 0.25);
    box-shadow: var(--glass-shadow), 0 0 24px rgba($accent-orange, 0.15);
  }

  &.glow-gold {
    border-color: rgba($accent-gold, 0.25);
    box-shadow: var(--glass-shadow), 0 0 24px rgba($accent-gold, 0.15);
  }
}

.p-4 { padding: var(--sp-2); }
.p-5 { padding: var(--sp-4); }
.p-6 { padding: var(--sp-5); }
.p-8 { padding: var(--sp-6); }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--sp-4);
  flex-wrap: wrap;
  gap: var(--sp-2);
}

.card-title-wrap {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
}

.card-icon-wrap {
  width: 38px;
  height: 38px;
  border-radius: var(--r-md);
  background: $accent-orange;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.card-icon {
  width: 20px;
  height: 20px;
  color: $accent-orange;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary)  ;
}

.card-subtitle {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
}
</style>
