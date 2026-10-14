<template>
  <RWrapperPage>
    <section class="section">
      <StatsWidget
        :stats="liveStats"
        :loading="!liveStats"
        :active-event="activeEvent"
      />
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
  </RWrapperPage>
</template>

<script setup>
const { tr } = useTr();
useHead({ title: tr("common.app_name") });
definePageMeta({
  layout: "navbar",
  middleware: ["auth", "permission"],
  title: "Dashboard",
  description: "",
  icon: "ri-dashboard-line",
  iconBg: "bg-[var(--c-surface)]",
});
const eventStore = useEventStore();
const { liveStats, start } = useLiveData();
const activeEvent = computed(() => eventStore.activeEvent);
const { init: eventInit } = useEventPage(() => {});
onMounted(async () => {
  await nextTick();
  await eventInit();
  start();
});
</script>

<style lang="scss" scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
  @include lg {
    gap: var(--sp-3);
  }
}

.two-col-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--sp-1);
  @include lg {
    grid-template-columns: 1fr 1fr;
    gap: var(--sp-3);
  }
}

.action-group {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  flex-wrap: wrap;
}

.countdown-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: var(--r-full);
  background: rgba(249, 115, 22, 0.12);
  border: 1px solid rgba(249, 115, 22, 0.25);
  color: #f97316;
  font-size: 0.8125rem;
  font-weight: 600;
  &.urgent {
    background: rgba(239, 68, 68, 0.12);
    border-color: rgba(239, 68, 68, 0.25);
    color: var(--c-danger);
  }
}

.live-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--c-success);
}
.live-dot-sm {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--c-success);
  animation: pulse-live 1.5s infinite;
}
@keyframes pulse-live {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(0.8);
  }
}
</style>
