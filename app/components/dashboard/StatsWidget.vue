<template>
  <div class="stats-grid">
    <StatCard
      v-for="(stat, i) in statCards"
      :key="stat.key"
      :icon="stat.icon"
      :label="stat.label"
      :value="stat.value"
      :icon-color="stat.iconColor"
      :icon-bg="stat.iconBg"
      :delay="i * 100"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  stats: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  activeEvent: { type: Object, default: null },
})

const { tr } = useTr()

const fmt = (n) => n != null ? Number(n).toLocaleString() : '—'
const fmtMoney = (n) => n != null ? `$${Number(n).toLocaleString()}` : '—'

const statCards = computed(() => [
  {
    key: 'guests',
    icon: 'i-heroicons-users',
    label: tr('dashboard.total_guests'),
    value: props.loading ? '…' : fmt(props.stats?.totalGuests),
    iconColor: '#3b82f6',
    iconBg: 'rgba(59,130,246,0.15)',
  },
  {
    key: 'confirmed',
    icon: 'i-heroicons-check-circle',
    label: tr('status.confirmed'),
    value: props.loading ? '…' : fmt(props.stats?.confirmedGuests),
    iconColor: '#22c55e',
    iconBg: 'rgba(34,197,94,0.15)',
  },
  {
    key: 'checkin',
    icon: 'i-heroicons-clipboard-document-check',
    label: tr('dashboard.checked_in'),
    value: props.loading ? '…' : fmt(props.stats?.checkedInCount),
    iconColor: '#f97316',
    iconBg: 'rgba(249,115,22,0.15)',
  },
  {
    key: 'budget',
    icon: 'i-heroicons-banknotes',
    label: tr('budget.total'),
    value: props.loading ? '…' : fmtMoney(props.stats?.totalBudgetPlanned ?? props.activeEvent?.budget),
    iconColor: '#d4a843',
    iconBg: 'rgba(212,168,67,0.15)',
  },
])
</script>

<style lang="scss" scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--sp-1);
  @include lg { grid-template-columns: repeat(4, 1fr); gap: var(--sp-3); }
}
</style>
