<template>
  <GlassCard
    :title="tr('dashboard.budget_summary')"
    icon="i-heroicons-banknotes"
    class="animate-fade-in-up delay-100"
  >
    <!-- <template #actions>
      <NuxtLink to="/budget" class="view-all-link">
        {{ tr('common.view_all') }}
        <UIcon name="i-heroicons-arrow-right" class="view-all-icon" />
      </NuxtLink>
    </template> -->

    <div v-if="!stats" class="loading-state" style="padding: var(--sp-6) 0">
      <i class="ri-loader-4-line animate-spin" style="color:var(--c-muted)" />
    </div>

    <template v-else>
      <!-- Donut Summary -->
      <div class="budget-overview">
        <div class="donut-wrap">
          <svg class="donut" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="38" fill="none" stroke="var(--c-border)" stroke-width="10" />
            <circle
              cx="50" cy="50" r="38" fill="none"
              stroke="#f97316" stroke-width="10" stroke-linecap="round"
              :stroke-dasharray="`${spentArc} 238.8`"
              stroke-dashoffset="59.7"
              transform="rotate(-90 50 50)"
            />
            <circle
              cx="50" cy="50" r="38" fill="none"
              stroke="#d4a843" stroke-width="10" stroke-linecap="round"
              :stroke-dasharray="`${remainingArc} 238.8`"
              :stroke-dashoffset="59.7 - spentArc"
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div class="donut-center">
            <span class="donut-pct">{{ spentPercent }}%</span>
            <span class="donut-label">{{ tr('budget.used') }}</span>
          </div>
        </div>

        <div class="budget-stats">
          <div class="budget-stat">
            <div class="budget-stat-dot" style="background:#f97316" />
            <div>
              <p class="budget-stat-label">{{ tr('budget.spent') }}</p>
              <p class="budget-stat-value">{{ fmtMoney(totalActual) }}</p>
            </div>
          </div>
          <div class="budget-stat">
            <div class="budget-stat-dot" style="background:#d4a843" />
            <div>
              <p class="budget-stat-label">{{ tr('budget.remaining') }}</p>
              <p class="budget-stat-value">{{ fmtMoney(remaining) }}</p>
            </div>
          </div>
          <div class="budget-stat">
            <div class="budget-stat-dot" style="background:var(--c-border)" />
            <div>
              <p class="budget-stat-label">{{ tr('budget.total') }}</p>
              <p class="budget-stat-value">{{ fmtMoney(totalPlanned) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Category breakdown from budgetStore -->
      <div v-if="budgetStore.categories.length" class="category-list">
        <div v-for="cat in budgetStore.categories.slice(0, 5)" :key="cat.id" class="category-item">
          <div class="category-header">
            <div class="category-name-wrap">
              <div class="category-dot" :style="{ background: catColor(cat.name) }" />
              <span class="category-name">{{ cat.name }}</span>
            </div>
            <div class="category-amounts">
              <span class="category-spent">{{ fmtMoney(cat.spent) }}</span>
              <span class="category-total"> / {{ fmtMoney(cat.budget) }}</span>
            </div>
          </div>
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{
                width: Math.min(100, cat.budget > 0 ? (cat.spent / cat.budget) * 100 : 0) + '%',
                background: catColor(cat.name),
              }"
            />
          </div>
        </div>
      </div>
      <div v-else class="text-muted" style="font-size:0.8125rem;text-align:center;padding:var(--sp-4) 0">
        {{ tr('budget.no_items') }}
      </div>
    </template>
  </GlassCard>
</template>

<script setup>
const props = defineProps({
  stats: { type: Object, default: null },
  activeEvent: { type: Object, default: null },
})

const { tr } = useTr()
const budgetStore = useBudgetStore()
const eventStore = useEventStore()

const COLORS = ['#f97316','#3b82f6','#22c55e','#d4a843','#8b5cf6','#ef4444','#06b6d4','#ec4899']
const catColor = (name) => COLORS[Math.abs([...name].reduce((a, c) => a + c.charCodeAt(0), 0)) % COLORS.length]

const fmtMoney = (n) => {
  if (n == null) return '—'
  const num = Number(n)
  return num >= 1000 ? `$${(num / 1000).toFixed(1)}k` : `$${num.toLocaleString()}`
}

const totalPlanned = computed(() => Number(props.stats?.totalBudgetPlanned ?? props.activeEvent?.budget ?? 0))
const totalActual  = computed(() => Number(props.stats?.totalBudgetActual ?? 0))
const remaining    = computed(() => Math.max(0, totalPlanned.value - totalActual.value))
const spentPercent = computed(() => totalPlanned.value > 0 ? Math.round((totalActual.value / totalPlanned.value) * 100) : 0)
const spentArc     = computed(() => (spentPercent.value / 100) * 238.8)
const remainingArc = computed(() => ((100 - spentPercent.value) / 100) * 238.8)

onMounted(async () => {
  if (!eventStore.initialized) await eventStore.fetchEvents()
  if (eventStore.activeEvent?.id) {
    budgetStore.fetchBudgets(0)
    budgetStore.fetchSummary()
  }
})

watch(() => eventStore.activeEvent?.id, (id) => {
  if (id) { budgetStore.fetchBudgets(0); budgetStore.fetchSummary() }
})
</script>

<style lang="scss" scoped>
.view-all-link { display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; color: var(--c-muted); &:hover { color: var(--c-accent); } }
.view-all-icon { width: 12px; height: 12px; }
.loading-state { display: flex; justify-content: center; }

.budget-overview { display: flex; gap: var(--sp-4); align-items: center; margin-bottom: var(--sp-4); flex-wrap: wrap; }
.donut-wrap { position: relative; width: 100px; height: 100px; flex-shrink: 0; }
.donut { width: 100%; height: 100%; }
.donut-center { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; flex-direction: column; }
.donut-pct { font-size: 16px; font-weight: 800; color: var(--c-text); letter-spacing: -.03em; }
.donut-label { font-size: 11px; color: var(--c-muted); font-weight: 600; }

.budget-stats { display: flex; flex-direction: column; gap: var(--sp-2); flex: 1; }
.budget-stat { display: flex; align-items: center; gap: var(--sp-2); }
.budget-stat-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.budget-stat-label { font-size: 11px; color: var(--c-muted); font-weight: 500; }
.budget-stat-value { font-size: 12px; font-weight: 700; color: var(--c-text); }

.category-list { display: flex; flex-direction: column; gap: var(--sp-2); }
.category-item { display: flex; flex-direction: column; gap: var(--sp-1); }
.category-header { display: flex; justify-content: space-between; gap: var(--sp-2); }
.category-name-wrap { display: flex; align-items: center; gap: var(--sp-2); }
.category-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.category-name { font-size: 12px; font-weight: 600; color: var(--c-text); }
.category-amounts { display: flex; align-items: baseline; gap: 2px; }
.category-spent { font-size: 12px; font-weight: 700; color: var(--c-text); }
.category-total { font-size: 12px; color: var(--c-muted); }
.progress-bar { height: 5px; border-radius: var(--r-full); background: var(--c-border); overflow: hidden; }
.progress-fill { height: 100%; border-radius: var(--r-full); transition: width .8s ease-out; }
</style>
