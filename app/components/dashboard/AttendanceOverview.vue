<template>
  <GlassCard
    :title="tr('dashboard.attendance_overview')"
    icon="i-heroicons-users"
    class="animate-fade-in-up delay-300"
  >
    <div v-if="!stats" class="loading-state" style="padding: var(--sp-6) 0">
      <i class="ri-loader-4-line animate-spin" style="color: var(--c-muted)" />
    </div>

    <template v-else>
      <!-- Ring chart -->
      <div class="attendance-chart">
        <div class="ring-wrap">
          <svg class="ring-svg" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="48"
              fill="none"
              stroke="var(--c-border)"
              stroke-width="12"
            />
            <circle
              cx="60"
              cy="60"
              r="48"
              fill="none"
              stroke="#22c55e"
              stroke-width="12"
              stroke-linecap="round"
              :stroke-dasharray="`${confirmedArc} 301.6`"
              stroke-dashoffset="75.4"
              transform="rotate(-90 60 60)"
            />
            <circle
              cx="60"
              cy="60"
              r="48"
              fill="none"
              stroke="#f59e0b"
              stroke-width="12"
              stroke-linecap="round"
              :stroke-dasharray="`${pendingArc} 301.6`"
              :stroke-dashoffset="75.4 - confirmedArc"
              transform="rotate(-90 60 60)"
            />
            <circle
              cx="60"
              cy="60"
              r="48"
              fill="none"
              stroke="#ef4444"
              stroke-width="12"
              stroke-linecap="round"
              :stroke-dasharray="`${declinedArc} 301.6`"
              :stroke-dashoffset="75.4 - confirmedArc - pendingArc"
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div class="ring-center">
            <span class="ring-total">{{ totalGuests }}</span>
            <span class="ring-label">{{ tr("common.guests") }}</span>
          </div>
        </div>

        <div class="attendance-stats">
          <div
            v-for="s in attendanceStats"
            :key="s.key"
            class="attendance-stat"
          >
            <div class="stat-indicator" :style="{ background: s.color }" />
            <div class="stat-details">
              <div class="stat-row">
                <span class="stat-count" :style="{ color: s.color }">{{
                  s.count
                }}</span>
                <span class="stat-pct">{{ s.pct }}%</span>
              </div>
              <p class="stat-name">
                {{ tBy({ en: s.labelEn, km: s.labelKm }) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- By Family Side -->
      <div class="table-breakdown">
        <p class="breakdown-title">{{ tr("dashboard.by_family_side") }}</p>
        <div class="breakdown-grid">
          <div class="breakdown-item">
            <p class="breakdown-label">{{ tr("dashboard.bride_side") }}</p>
            <p class="breakdown-count">{{ brideSide }}</p>
            <div class="breakdown-bar">
              <div
                class="breakdown-fill"
                :style="{ width: bridePct + '%', background: '#f97316' }"
              />
            </div>
          </div>
          <div class="breakdown-item">
            <p class="breakdown-label">{{ tr("dashboard.groom_side") }}</p>
            <p class="breakdown-count">{{ groomSide }}</p>
            <div class="breakdown-bar">
              <div
                class="breakdown-fill"
                :style="{ width: groomPct + '%', background: '#3b82f6' }"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Tasks summary -->
      <div class="tasks-summary">
        <p class="breakdown-title">{{ tr("dashboard.task_progress") }}</p>
        <div class="task-bar-row">
          <div class="task-bar">
            <div class="task-fill" :style="{ width: taskPct + '%' }" />
          </div>
          <span class="task-label"
            >{{ stats.completedTasks }} / {{ stats.totalTasks }}</span
          >
        </div>
        <p class="text-muted" style="font-size: 0.75rem">
          {{ stats.pendingTasks }} {{ tr("tasks.no_tasks") }}
        </p>
      </div>
    </template>
  </GlassCard>
</template>

<script setup>
const props = defineProps({
  stats: { type: Object, default: null },
  activeEvent: { type: Object, default: null },
});

const { tBy } = useSarikaLocale();
const { tr } = useTr();

const totalGuests = computed(() => Number(props.stats?.totalGuests ?? 0));
const confirmed = computed(
  () =>
    Number(props.stats?.confirmedGuests ?? 0) +
    Number(props.stats?.attendedGuests ?? 0),
);
const pending = computed(() => Number(props.stats?.invitedGuests ?? 0));
const declined = computed(() => Number(props.stats?.declinedGuests ?? 0));
const brideSide = computed(() => Number(props.stats?.brideSideCount ?? 0));
const groomSide = computed(() => Number(props.stats?.groomSideCount ?? 0));

const pct = (n) =>
  totalGuests.value > 0 ? Math.round((n / totalGuests.value) * 100) : 0;
const confirmedArc = computed(() => (pct(confirmed.value) * 301.6) / 100);
const pendingArc = computed(() => (pct(pending.value) * 301.6) / 100);
const declinedArc = computed(() => (pct(declined.value) * 301.6) / 100);

const sideTot = computed(() => brideSide.value + groomSide.value || 1);
const bridePct = computed(() =>
  Math.round((brideSide.value / sideTot.value) * 100),
);
const groomPct = computed(() => 100 - bridePct.value);

const taskTotal = computed(() => Number(props.stats?.totalTasks ?? 0));
const taskPct = computed(() =>
  taskTotal.value > 0
    ? Math.round(
        (Number(props.stats?.completedTasks ?? 0) / taskTotal.value) * 100,
      )
    : 0,
);

const attendanceStats = computed(() => [
  {
    key: "confirmed",
    labelEn: "Confirmed",
    labelKm: "បានបញ្ជាក់",
    count: confirmed.value,
    pct: pct(confirmed.value),
    color: "#22c55e",
  },
  {
    key: "pending",
    labelEn: "Pending",
    labelKm: "កំពុងរង់ចាំ",
    count: pending.value,
    pct: pct(pending.value),
    color: "#f59e0b",
  },
  {
    key: "declined",
    labelEn: "Declined",
    labelKm: "បានបដិសេធ",
    count: declined.value,
    pct: pct(declined.value),
    color: "#ef4444",
  },
]);
</script>

<style lang="scss" scoped>
.loading-state {
  display: flex;
  justify-content: center;
}

.attendance-chart {
  display: flex;
  gap: var(--sp-3);
  align-items: center;
  margin-bottom: var(--sp-3);
  flex-wrap: wrap;
}
.ring-wrap {
  position: relative;
  width: 120px;
  height: 120px;
  flex-shrink: 0;
}
.ring-svg {
  width: 100%;
  height: 100%;
}
.ring-center {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
.ring-total {
  font-size: 16px;
  font-weight: 800;
  color: var(--c-text);
  letter-spacing: -0.04em;
}
.ring-label {
  font-size: 10px;
  color: var(--c-muted);
  font-weight: 600;
}

.attendance-stats {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  flex: 1;
}
.attendance-stat {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
}
.stat-indicator {
  width: 3px;
  height: 36px;
  border-radius: 50%;
  flex-shrink: 0;
}
.stat-details {
  flex: 1;
}
.stat-row {
  display: flex;
  align-items: baseline;
  gap: var(--sp-2);
}
.stat-count {
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.03em;
}
.stat-pct {
  font-size: 10px;
  color: var(--c-muted);
  font-weight: 600;
}
.stat-name {
  font-size: 10px;
  color: var(--c-muted);
  font-weight: 500;
}

.table-breakdown,
.tasks-summary {
  padding-top: var(--sp-3);
  margin-top: var(--sp-1);
}
.breakdown-title {
  font-size: 10px;
  font-weight: 700;
  color: var(--c-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: var(--sp-3);
}
.breakdown-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-2);
}
.breakdown-item {
  padding: var(--sp-3);
  border-radius: var(--r-md);
  // border: 1px solid var(--c-border);
  background: rgba(255, 140, 66, 0.06);
}
.breakdown-label {
  font-size: 10px;
  color: var(--c-muted);
  margin-bottom: var(--sp-1);
}
.breakdown-count {
  font-size: 16px;
  font-weight: 800;
  color: var(--c-text);
  margin-bottom: var(--sp-2);
}
.breakdown-bar {
  height: 4px;
  border-radius: var(--r-full);
  background: var(--c-border);
  overflow: hidden;
}
.breakdown-fill {
  height: 100%;
  border-radius: var(--r-full);
  transition: width 0.5s;
}

.tasks-summary {
  margin-top: var(--sp-3);
}
.task-bar-row {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  margin-bottom: var(--sp-1);
}
.task-bar {
  flex: 1;
  height: 6px;
  border-radius: var(--r-full);
  background: var(--c-border);
  overflow: hidden;
}
.task-fill {
  height: 100%;
  border-radius: var(--r-full);
  background: linear-gradient(90deg, #f97316, #d4a843);
  transition: width 0.5s;
}
.task-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--c-text);
  white-space: nowrap;
}
</style>
