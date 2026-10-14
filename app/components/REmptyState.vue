<template>
  <div class="r-empty" :class="`r-empty--${size}`">
    <div class="r-empty__art" aria-hidden="true">
      <span class="r-empty__ring" />
      <span class="r-empty__dot r-empty__dot--a" />
      <span class="r-empty__dot r-empty__dot--b" />
      <span class="r-empty__badge">
        <UIcon :name="icon" />
      </span>
    </div>

    <h3 class="r-empty__title">{{ title }}</h3>
    <p v-if="description" class="r-empty__desc">{{ description }}</p>

    <div v-if="$slots.actions || actions?.length" class="r-empty__actions">
      <slot name="actions">
        <RBtn
          v-for="(action, i) in actions"
          :key="i"
          v-bind="action"
          @click="action.onClick?.()"
        />
      </slot>
    </div>
  </div>
</template>

<script setup>
/**
 * REmptyState
 * Shared empty-state block for every "create <event>" page
 * (ceremony, wedding, birthday, ...). Keep the empty state
 * identical across the whole event-creation system by using
 * this instead of a one-off <div class="empty-state"> per page.
 *
 * Usage:
 *  <REmptyState
 *    icon="ri-calendar-event-line"
 *    :title="tr('ceremony.no_programs_title')"
 *    :description="tr('ceremony.no_programs')"
 *    :actions="[{ type: 'create', icon: 'ri-add-circle-line', label: tr('ceremony.add_program'), onClick: openCreate }]"
 *  />
 *
 *  <!-- or full control over the action area -->
 *  <REmptyState icon="ri-cake-2-line" :title="tr('birthday.no_events')">
 *    <template #actions>
 *      <RBtn type="create" :label="tr('birthday.add_event')" @click="openCreate" />
 *    </template>
 *  </REmptyState>
 */
defineProps({
  icon:        { type: String, default: 'ri-calendar-event-line' },
  title:       { type: String, required: true },
  description: { type: String, default: '' },
  actions:     { type: Array,  default: () => [] }, // [{ label, icon, type, variant, onClick }]
  size:        { type: String, default: 'md' },      // 'md' | 'sm'
})
</script>

<style lang="scss" scoped>
.r-empty {
  height: calc(100dvh - var(--navbar-height, 45px));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 24px;
  text-align: center;
  overflow: hidden;

  &--sm {
    height: auto;
    padding: 48px 24px;
  }
}

/* ── Illustration: layered badge, no external assets ─────────────────── */
.r-empty__art {
  position: relative;
  width: 108px;
  height: 108px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;
}

.r-empty__ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 1.5px dashed color-mix(in srgb, var(--c-accent) 45%, transparent);
  animation: r-empty-spin 16s linear infinite;
}

.r-empty__badge {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--c-accent), var(--c-accent-2));
  color: #fff;
  font-size: 1.75rem;
  box-shadow: 0 10px 24px -8px color-mix(in srgb, var(--c-accent) 55%, transparent);
  animation: r-empty-float 4s ease-in-out infinite;

  :deep(svg) { width: 1em; height: 1em; }
}

.r-empty__dot {
  position: absolute;
  border-radius: 50%;
  background: var(--c-accent-2);
  opacity: 0.55;

  &--a { width: 10px; height: 10px; top: 4px; right: 8px; animation: r-empty-float 3.2s ease-in-out infinite 0.2s; }
  &--b { width: 7px;  height: 7px;  bottom: 10px; left: 2px; background: var(--c-info); animation: r-empty-float 3.6s ease-in-out infinite 0.6s; }
}

@keyframes r-empty-spin  { to { transform: rotate(360deg); } }
@keyframes r-empty-float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
}

@media (prefers-reduced-motion: reduce) {
  .r-empty__ring,
  .r-empty__badge,
  .r-empty__dot { animation: none; }
}

/* ── Copy ──────────────────────────────────────────────────────────────── */
.r-empty__title {
  font-family: var(--font-400);
  font-size: 1.0625rem;
  font-weight: 700;
  color: var(--c-text);
  margin: 0;
}

.r-empty__desc {
  max-width: 360px;
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--c-muted);
  margin: 0;
}

.r-empty__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  flex-wrap: wrap;
  justify-content: center;
}
</style>
