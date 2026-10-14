<template>
  <RPageHeader
    :title="tBy({ en: greeting, km: greetingKm })"
    :subtitle="activeEvent ? activeEvent.title : tr('events.no_event_selected')"
    icon="i-lucide-layout-dashboard"
  >
    <template #actions>
      <div class="action-group">
        <span v-if="daysLeft !== null" class="countdown-badge" :class="daysLeft <= 7 ? 'urgent' : ''">
          <i class="ri-calendar-event-line" />
          {{ daysLeft > 0
            ? tBy({ en: `${daysLeft} days to wedding`, km: `${daysLeft} ថ្ងៃទៀតដល់ពិធី` })
            : daysLeft === 0
            ? tBy({ en: 'Wedding day! 🎉', km: 'ថ្ងៃពិធីមហាមង្គល! 🎉' })
            : tBy({ en: `${Math.abs(daysLeft)} days ago`, km: `កន្លងទៅ ${Math.abs(daysLeft)} ថ្ងៃ` })
          }}
        </span>
        <span v-if="liveStats" class="live-chip">
          <span class="live-dot-sm" />
          Live · {{ lastUpdatedLabel }}
        </span>
      </div>
    </template>
  </RPageHeader>

  <div class="dashboard-page">
    <section class="section">
      <StatsWidget :stats="liveStats" :loading="!liveStats" :active-event="activeEvent" />
    </section>

    <section class="section">
      <div class="two-col-grid">
        <CeremonyProgress :active-event="activeEvent" />
        <BudgetSummary :stats="liveStats" :active-event="activeEvent" />
      </div>
    </section>

    <section class="section">
      <div class="two-col-grid">
        <InvitationStats :stats="liveStats" />
        <AttendanceOverview :stats="liveStats" :active-event="activeEvent" />
      </div>
    </section>

    <section class="section">
      <div class="two-col-grid">
        <RecentActivities />
        <QuickActions />
      </div>
    </section>
  </div>
</template>

<script setup>
const { tr } = useTr()
const { tBy } = useSarikaLocale()
useHead({ title: tr('common.app_name') })

definePageMeta({ layout: false,middleware: false })

const eventStore = useEventStore()
const { liveStats, lastUpdated, start } = useLiveData()

const activeEvent = computed(() => eventStore.activeEvent)

const daysLeft = computed(() => {
  if (!activeEvent.value?.date) return null
  const diff = new Date(activeEvent.value.date) - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
})

const now = new Date()
const hour = now.getHours()
const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening'
const greetingKm = hour < 12 ? 'អរុណសួស្តី' : hour < 18 ? 'ទិវាសួស្តី' : 'សាយណ្ហសួស្តី'

const lastUpdatedLabel = computed(() => {
  if (!lastUpdated.value) return ''
  return lastUpdated.value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
})

const { init: eventInit } = useEventPage(() => {})
onMounted(async () => {
  await nextTick()
  await eventInit()
  start()
})
</script>

<style lang="scss" scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
  @include lg { gap: var(--sp-3); }
}

.two-col-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--sp-1);
  @include lg { grid-template-columns: 1fr 1fr; gap: var(--sp-3); }
}

.action-group {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  flex-wrap: wrap;
}

.countdown-badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 12px; border-radius: var(--r-full);
  background: rgba(249,115,22,0.12); border: 1px solid rgba(249,115,22,0.25);
  color: #f97316; font-size: 0.8125rem; font-weight: 600;
  &.urgent { background: rgba(239,68,68,0.12); border-color: rgba(239,68,68,0.25); color: var(--c-danger); }
}

.live-chip { display: inline-flex; align-items: center; gap: 4px; font-size: 0.7rem; font-weight: 600; color: var(--c-success); }
.live-dot-sm { width: 6px; height: 6px; border-radius: 50%; background: var(--c-success); animation: pulse-live 1.5s infinite; }
@keyframes pulse-live { 0%,100%{opacity:1;transform:scale(1);}50%{opacity:.4;transform:scale(.8);} }
</style>
