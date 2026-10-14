<template>
  <div
    class="stat-card animate-fade-in-up"
    :style="{ animationDelay: `${delay}ms` }"
  >
    <!-- Icon -->
    <div class="stat-icon-wrap" :style="{ background: iconBg }">
      <UIcon :name="icon" class="stat-icon" :style="{ color: iconColor }" />
    </div>

    <!-- Content -->
    <div class="stat-content">
      <p class="stat-label">{{ label }}</p>
      <p class="stat-value">{{ value }}</p>
      <div v-if="change !== undefined" class="stat-trend" :class="changeClass">
        <UIcon :name="changeIcon" class="trend-icon" />
        <span class="trend-text">{{ Math.abs(change) }}% {{ trendLabel }}</span>
      </div>
    </div>

    <!-- Background glow -->
    <div class="stat-glow" :style="{ background: iconBg }" />
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    icon: string;
    label: string;
    value: string | number;
    change?: number;
    trendLabel?: string;
    iconColor?: string;
    iconBg?: string;
    delay?: number;
  }>(),
  {
    trendLabel: "vs last month",
    iconColor: "#f97316",
    iconBg: "rgba(249, 115, 22, 0.15)",
    delay: 0,
  },
);

const changeClass = computed(() => {
  if (props.change === undefined) return "";
  return props.change >= 0 ? "trend-up" : "trend-down";
});

const changeIcon = computed(() => {
  if (props.change === undefined) return "";
  return props.change >= 0
    ? "i-heroicons-arrow-trending-up"
    : "i-heroicons-arrow-trending-down";
});
</script>

<style lang="scss" scoped>
.stat-card {
  position: relative;
  background: var(--c-surface);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  // border: 1px solid var(--c-border);
  border-radius: var(--r-md);
  padding: var(--sp-4);
  display: flex;
  gap: var(--sp-2);
  align-items: flex-start;
  overflow: hidden;
  transition: all 1000ms ease;
  cursor: default;

  &:hover {
    background: var(--glass-bg-hover);
    // border-color: var(--border-hover);
    transform: translateY(-2px);
    box-shadow:
      var(--glass-shadow),
      0 8px 24px rgba(0, 0, 0, 0.15);
  }
}

.stat-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: var(--r-md);
  @include flex-center;
  flex-shrink: 0;
  @include mobile-only {
    width: 32px;
    height: 32px;
  }
}

.stat-icon {
  width: 24px;
  height: 24px;
  @include mobile-only {
    width: 16px;
    height: 16px;
  }
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-label {
  font-size: clamp(9px, 1.1vw, 12px);
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 5px;
  @include mobile-only {
    font-size: 8px;
  }
}

.stat-value {
  font-size: 16px;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.03em;
  line-height: 1.1;
  margin-bottom: 5px;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;

  &.trend-up {
    color: #22c55e;
  }

  &.trend-down {
    color: #ef4444;
  }
}

@include mobile-only {
  .stat-content {
    // align-items: flex-start;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
  }

  .stat-trend {
    width: 100%;

    display: flex;
    justify-content: flex-start;
    align-items: center;

    gap: 2px;

    text-align: left;
  }
}

.trend-icon {
  width: 14px;
  height: 14px;
}

.trend-text {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.stat-glow {
  position: absolute;
  bottom: -20px;
  right: -20px;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  opacity: 0.06;
  filter: blur(20px);
  pointer-events: none;
}
</style>
