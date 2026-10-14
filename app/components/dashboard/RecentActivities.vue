<template>
  <GlassCard
    :title="tr('dashboard.recent_activities')"
    icon="i-heroicons-clock"
    class="animate-fade-in-up delay-100"
  >
    <!-- <template #actions>
      <NuxtLink to="/notifications" class="view-all-link">
        {{ tr('common.view_all') }}
        <UIcon name="i-heroicons-arrow-right" style="width:12px;height:12px" />
      </NuxtLink>
    </template> -->

    <div v-if="notifStore.loading" class="loading-state" style="padding:var(--sp-6) 0">
      <i class="ri-loader-4-line animate-spin" style="color:var(--c-muted)" />
    </div>

    <div v-else-if="activities.length === 0" class="empty-state" style="padding:var(--sp-6) 0">
      <i class="ri-notification-off-line" style="font-size:2rem;color:var(--c-muted)" />
      <p class="text-muted" style="font-size:0.8125rem">{{ tr('dashboard.no_recent_activity') }}</p>
    </div>

    <div v-else class="activities-list">
      <div v-for="(activity, i) in activities" :key="activity.id" class="activity-item">
        <div class="activity-timeline">
          <div class="activity-icon-wrap" :class="`type-${activity.type}`">
            <UIcon :name="typeIcon(activity.type)" class="activity-icon" />
          </div>
          <div v-if="i < activities.length - 1" class="activity-line" />
        </div>
        <div class="activity-content">
          <p class="activity-text">{{ activity.title }}</p>
          <p v-if="activity.message" class="activity-sub">{{ activity.message }}</p>
          <p class="activity-time">{{ timeAgo(activity.time) }}</p>
        </div>
        <div v-if="!activity.read" class="unread-dot" />
      </div>
    </div>
  </GlassCard>
</template>

<script setup>
const { tr } = useTr()
const notifStore = useNotificationStore()
const eventStore = useEventStore()

const activities = computed(() => notifStore.notifications.slice(0, 8))

const typeIcon = (type) => ({
  wish:     'i-heroicons-heart',
  gift:     'i-heroicons-gift',
  email:    'i-heroicons-envelope',
  telegram: 'i-heroicons-paper-airplane',
  sms:      'i-heroicons-chat-bubble-left',
  success:  'i-heroicons-check-circle',
  warning:  'i-heroicons-exclamation-triangle',
  error:    'i-heroicons-x-circle',
  info:     'i-heroicons-information-circle',
})[type] ?? 'i-heroicons-bell'

const timeAgo = (iso) => {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

onMounted(async () => {
  if (!eventStore.initialized) await eventStore.fetchEvents()
  notifStore.fetchNotifications()
})
</script>

<style lang="scss" scoped>
.view-all-link { display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; color: var(--c-muted); &:hover { color: var(--c-accent); } }
.loading-state, .empty-state { display: flex; flex-direction: column; align-items: center; gap: var(--sp-3); }

.activities-list { display: flex; flex-direction: column; }
.activity-item { display: flex; gap: var(--sp-3); min-height: 56px; position: relative; }
.unread-dot { position: absolute; top: 6px; right: 0; width: 7px; height: 7px; border-radius: 50%; background: var(--c-accent); }

.activity-timeline { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; width: 30px; }
.activity-icon-wrap {
  width: 30px; height: 30px; border-radius: var(--r-md);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  &.type-wish     { background: rgba(251,113,133,.15); .activity-icon { color: #fb7185; } }
  &.type-gift     { background: rgba(167,139,250,.15); .activity-icon { color: #a78bfa; } }
  &.type-email    { background: rgba(59,130,246,.15);  .activity-icon { color: #3b82f6; } }
  &.type-telegram { background: rgba(56,189,248,.15);  .activity-icon { color: #38bdf8; } }
  &.type-sms      { background: rgba(34,197,94,.15);   .activity-icon { color: #22c55e; } }
  &.type-success  { background: rgba(34,197,94,.15);   .activity-icon { color: #22c55e; } }
  &.type-warning  { background: rgba(245,158,11,.15);  .activity-icon { color: #f59e0b; } }
  &.type-error    { background: rgba(239,68,68,.15);   .activity-icon { color: #ef4444; } }
  &.type-info     { background: rgba(59,130,246,.15);  .activity-icon { color: #3b82f6; } }
}
.activity-icon { width: 14px; height: 14px; }
.activity-line { flex: 1; width: 1px; background: var(--c-border); margin: var(--sp-1) 0; }

.activity-content { flex: 1; padding-bottom: var(--sp-3); padding-top: var(--sp-1); }
.activity-text { font-size: 12px; font-weight: 600; color: var(--c-text); line-height: 1.4; }
.activity-sub  { font-size: 11px; color: var(--c-muted); line-height: 1.4; margin-top: 2px;
  display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
.activity-time { font-size: 10px; color: var(--c-muted); margin-top: 3px; }
</style>
