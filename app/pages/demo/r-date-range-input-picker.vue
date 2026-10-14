<script setup lang="ts">
// pages/demo/date-range-picker.vue
// Full usage showcase of RDateRangeInputPicker — all props, states, sizes, form integration
import { shallowRef, ref, computed } from 'vue'
import { CalendarDate, today, getLocalTimeZone } from '@internationalized/date'
import type { DateRangeValue, DatePreset } from '@/components/R/RDateRangeInputPicker.vue'
import { useUIStore } from '@/stores/ui'

const ui = useUIStore()
const now = () => today(getLocalTimeZone())

useHead({
  title:'Date Range Input Picker'
})
// ── Basic ──────────────────────────────────────────────────────────────────
const basic = shallowRef<DateRangeValue | null>({
  start: new CalendarDate(2025, 6, 1),
  end:   new CalendarDate(2025, 6, 30),
})

// ── Empty / no initial value ───────────────────────────────────────────────
const empty = shallowRef<DateRangeValue | null>(null)

// ── Single-month calendar ─────────────────────────────────────────────────
const single = shallowRef<DateRangeValue | null>(null)

// ── No presets sidebar ────────────────────────────────────────────────────
const noPresets = shallowRef<DateRangeValue | null>({
  start: now().subtract({ days: 6 }),
  end:   now(),
})

// ── Disabled ──────────────────────────────────────────────────────────────
const disabled = shallowRef<DateRangeValue | null>({
  start: new CalendarDate(2025, 1, 1),
  end:   new CalendarDate(2025, 1, 31),
})

// ── Error state ───────────────────────────────────────────────────────────
const withError = shallowRef<DateRangeValue | null>(null)

// ── Khmer bilingual ───────────────────────────────────────────────────────
const khmer = shallowRef<DateRangeValue | null>(null)

// ── Custom presets ────────────────────────────────────────────────────────
const customRange = shallowRef<DateRangeValue | null>(null)

const fiscalPresets: DatePreset[] = [
  {
    label: 'Q1 2025', labelKm: 'ត្រីមាសទី១',
    getValue: () => ({ start: new CalendarDate(2025, 1, 1), end: new CalendarDate(2025, 3, 31) }),
  },
  {
    label: 'Q2 2025', labelKm: 'ត្រីមាសទី២',
    getValue: () => ({ start: new CalendarDate(2025, 4, 1), end: new CalendarDate(2025, 6, 30) }),
  },
  {
    label: 'Q3 2025', labelKm: 'ត្រីមាសទី៣',
    getValue: () => ({ start: new CalendarDate(2025, 7, 1), end: new CalendarDate(2025, 9, 30) }),
  },
  {
    label: 'Q4 2025', labelKm: 'ត្រីមាសទី៤',
    getValue: () => ({ start: new CalendarDate(2025, 10, 1), end: new CalendarDate(2025, 12, 31) }),
  },
  {
    label: 'Full Year 2025', labelKm: 'ឆ្នាំ ២០២៥ ទាំងមូល',
    getValue: () => ({ start: new CalendarDate(2025, 1, 1), end: new CalendarDate(2025, 12, 31) }),
  },
  {
    label: 'Full Year 2024', labelKm: 'ឆ្នាំ ២០២៤ ទាំងមូល',
    getValue: () => ({ start: new CalendarDate(2024, 1, 1), end: new CalendarDate(2024, 12, 31) }),
  },
]

// ── Sizes ─────────────────────────────────────────────────────────────────
const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
const sizeValues = Object.fromEntries(
  sizes.map(s => [
    s,
    shallowRef<DateRangeValue | null>({
      start: now().subtract({ days: 7 }),
      end:   now(),
    }),
  ])
)

// ── Formatted display helper ───────────────────────────────────────────────
function formatRange(val: DateRangeValue | null, locale = 'en-US') {
  if (!val) return '—'
  const fmt = (d: CalendarDate) =>
    new Date(d.year, d.month - 1, d.day).toLocaleDateString(locale, {
      day: '2-digit', month: 'short', year: 'numeric',
    })
  return `${fmt(val.start)} → ${fmt(val.end)}`
}

function dayCount(val: DateRangeValue | null) {
  if (!val) return 0
  const ms = new Date(val.end.year, val.end.month - 1, val.end.day).getTime()
           - new Date(val.start.year, val.start.month - 1, val.start.day).getTime()
  return Math.round(ms / 86_400_000) + 1
}

// ── Report filter form ────────────────────────────────────────────────────
const reportForm = ref({
  title:     '',
  type:      'revenue',
  dateRange: shallowRef<DateRangeValue | null>(null) as unknown as DateRangeValue | null,
})
const reportErrors = ref<Record<string, string>>({})

function submitReport() {
  reportErrors.value = {}
  if (!reportForm.value.title)     reportErrors.value.title = 'Report title is required'
  if (!reportForm.value.dateRange) reportErrors.value.dateRange = 'Please select a date range'

  if (Object.keys(reportErrors.value).length === 0) {
    ui.success(
      'Report queued',
      `"${reportForm.value.title}" · ${formatRange(reportForm.value.dateRange)} · ${dayCount(reportForm.value.dateRange)} days`
    )
  }
}

function resetReport() {
  reportForm.value.title     = ''
  reportForm.value.type      = 'revenue'
  reportForm.value.dateRange = null
  reportErrors.value         = {}
}

definePageMeta({
  layout:'navbar'
})
</script>

<template>
  <RToast />

  <div class="ddrp">
    <RPageHeader
      title="RDateRangeInputPicker"
      subtitle="Select a start and end date — NuxtUI v4 · SARIKA tokens"
      icon="i-lucide-calendar-range"
    />

    <!-- ── 1. Basic ──────────────────────────────────────── -->
    <RCard title="Basic" icon="i-lucide-info" class="ddrp__card">
      <div class="ddrp__row">
        <div class="ddrp__col">
          <RDateRangeInputPicker
            v-model="basic"
            label="Reporting period"
            hint="Pre-filled with June 2025"
          />
          <p class="ddrp__meta">
            <UIcon name="i-lucide-calendar-check" />
            {{ formatRange(basic) }} &nbsp;·&nbsp;
            <strong>{{ dayCount(basic) }}</strong> days
          </p>
        </div>

        <div class="ddrp__col">
          <RDateRangeInputPicker
            v-model="empty"
            label="Campaign window"
            placeholder="Select campaign dates…"
            required
          />
          <p class="ddrp__meta">
            <UIcon name="i-lucide-info" />
            {{ formatRange(empty) }}
          </p>
        </div>
      </div>
    </RCard>

    <!-- ── 2. Sizes ───────────────────────────────────────── -->
    <RCard title="Sizes" icon="i-lucide-scaling" class="ddrp__card">
      <div class="ddrp__stack">
        <RDateRangeInputPicker
          v-for="s in sizes"
          :key="s"
          v-model="sizeValues[s].value"
          :size="s"
          :label="`size: &quot;${s}&quot;`"
          :show-presets="false"
          :number-of-months="1"
        />
      </div>
    </RCard>

    <!-- ── 3. States ──────────────────────────────────────── -->
    <RCard title="States" icon="i-lucide-toggle-left" class="ddrp__card">
      <div class="ddrp__row">

        <!-- Error -->
        <RDateRangeInputPicker
          v-model="withError"
          label="Required range"
          error="Date range is required"
          placeholder="Pick start → end…"
        />

        <!-- Disabled -->
        <RDateRangeInputPicker
          v-model="disabled"
          label="Locked period (disabled)"
          disabled
        />

        <!-- Not clearable -->
        <RDateRangeInputPicker
          v-model="noPresets"
          label="No clear button"
          :clearable="false"
          hint="clearable: false"
        />

      </div>
    </RCard>

    <!-- ── 4. Calendar layout ─────────────────────────────── -->
    <RCard title="Calendar layout" icon="i-lucide-layout" class="ddrp__card">
      <div class="ddrp__row">

        <!-- Single month -->
        <RDateRangeInputPicker
          v-model="single"
          label="Single month calendar"
          :number-of-months="1"
          hint="numberOfMonths: 1"
        />

        <!-- Two months (default) -->
        <RDateRangeInputPicker
          v-model="basic"
          label="Two month calendar (default)"
          :number-of-months="2"
          hint="numberOfMonths: 2"
        />

        <!-- No presets -->
        <RDateRangeInputPicker
          v-model="noPresets"
          label="Without presets sidebar"
          :show-presets="false"
          hint="showPresets: false"
        />

      </div>
    </RCard>

    <!-- ── 5. Custom presets ───────────────────────────────── -->
    <RCard title="Custom presets" icon="i-lucide-list-filter" class="ddrp__card">
      <div class="ddrp__row">
        <div class="ddrp__col">
          <RDateRangeInputPicker
            v-model="customRange"
            label="Fiscal quarter"
            :presets="fiscalPresets"
            :number-of-months="2"
            hint="Custom :presets with fiscal quarters + full years"
          />
          <p class="ddrp__meta">
            <UIcon name="i-lucide-calendar-check" />
            {{ formatRange(customRange) }}
          </p>
        </div>
      </div>
    </RCard>

    <!-- ── 6. Bilingual (km/en) ───────────────────────────── -->
    <RCard title="Bilingual" icon="i-lucide-languages" class="ddrp__card">
      <div class="ddrp__row">
        <RDateRangeInputPicker
          v-model="khmer"
          label="ជ្រើសរើសថ្ងៃខែ"
          placeholder="ថ្ងៃចាប់ផ្ដើម → ថ្ងៃបញ្ចប់"
          placeholder-km="ថ្ងៃចាប់ផ្ដើម → ថ្ងៃបញ្ចប់"
          hint="Khmer label · presets auto-switch by locale"
        />
      </div>
    </RCard>

    <!-- ── 7. ui passthrough ───────────────────────────────── -->
    <RCard title="ui passthrough" icon="i-lucide-sliders-horizontal" class="ddrp__card">
      <div class="ddrp__row">
        <RDateRangeInputPicker
          v-model="basic"
          label="Custom ui override"
          hint="Border-color overridden via :ui prop"
          :ui="{
            inputDate: {
              base:    'rdp__input rdp__input--info',
              wrapper: 'rdp__input-wrapper',
            }
          }"
        />
      </div>
    </RCard>

    <!-- ── 8. Report filter form ──────────────────────────── -->
    <RCard title="In a report form" icon="i-lucide-file-bar-chart-2" class="ddrp__card">
      <form class="ddrp__form" @submit.prevent="submitReport">

        <!-- Title + Type row -->
        <div class="ddrp__form-row">
          <div class="ddrp__field">
            <label class="ddrp__field-label">
              Report title
              <span class="ddrp__req">*</span>
            </label>
            <input
              v-model="reportForm.title"
              type="text"
              class="ddrp__input"
              :class="{ 'ddrp__input--error': reportErrors.title }"
              placeholder="Monthly Revenue Report…"
            />
            <p v-if="reportErrors.title" class="ddrp__err">
              <UIcon name="i-lucide-alert-circle" />
              {{ reportErrors.title }}
            </p>
          </div>

          <div class="ddrp__field">
            <label class="ddrp__field-label">Report type</label>
            <select v-model="reportForm.type" class="ddrp__select">
              <option value="revenue">Revenue</option>
              <option value="users">Users</option>
              <option value="engagement">Engagement</option>
              <option value="performance">Performance</option>
            </select>
          </div>
        </div>

        <!-- Date range -->
        <RDateRangeInputPicker
          v-model="reportForm.dateRange"
          label="Report period"
          required
          :error="reportErrors.dateRange"
          placeholder="Select reporting window…"
          :number-of-months="2"
        />

        <!-- Summary chip -->
        <Transition name="ddrp-slide">
          <div v-if="reportForm.dateRange" class="ddrp__summary">
            <UIcon name="i-lucide-calendar-check-2" class="ddrp__summary-icon" />
            <div>
              <p class="ddrp__summary-range">{{ formatRange(reportForm.dateRange) }}</p>
              <p class="ddrp__summary-days">{{ dayCount(reportForm.dateRange) }} days selected</p>
            </div>
          </div>
        </Transition>

        <!-- Actions -->
        <div class="ddrp__form-footer">
          <RButton type="submit" icon="i-lucide-file-bar-chart-2">
            Generate report
          </RButton>
          <RButton variant="ghost" @click="resetReport">Reset</RButton>
        </div>

      </form>
    </RCard>

  </div>
</template>

<style lang="scss" scoped>
.ddrp {
  padding:        var(--space-8);
  max-width:      900px;
  margin:         0 auto;
  display:        flex;
  flex-direction: column;
  gap:            var(--space-5);

  @include mobile-only { padding: var(--space-4); }

  &__card { width: 100%; }

  // Two-column grid — collapses to 1 on mobile
  &__row {
    display:  grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap:      var(--space-5);
    padding:  var(--space-1) 0;
  }

  // Single column with gap
  &__stack {
    display:        flex;
    flex-direction: column;
    gap:            var(--space-4);
    padding:        var(--space-1) 0;
  }

  // Flex column for picker + meta
  &__col {
    display:        flex;
    flex-direction: column;
    gap:            var(--space-3);
  }

  // Metadata row beneath picker
  &__meta {
    display:     flex;
    align-items: center;
    gap:         var(--space-2);
    font-size:   0.78rem;
    color:       var(--c-muted);
    margin:      0;

    svg { color: var(--c-accent); font-size: 0.9rem; }
    strong { color: var(--c-accent); }
  }

  // ── Form styles ──────────────────────────────
  &__form {
    display:        flex;
    flex-direction: column;
    gap:            var(--space-4);
  }

  &__form-row {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap:     var(--space-4);

    @include mobile-only { grid-template-columns: 1fr; }
  }

  &__field {
    display:        flex;
    flex-direction: column;
    gap:            var(--space-2);
  }

  &__field-label {
    font-size:   0.82rem;
    font-weight: 500;
    color:       var(--c-text);
    display:     flex;
    gap:         4px;
  }

  &__req { color: var(--c-danger); }

  &__input, &__select {
    height:        38px;
    padding:       0 var(--space-3);
    font-family:   var(--font-fallback);
    font-size:     0.875rem;
    color:         var(--c-text);
    background:    var(--c-surface);
    border:        1px solid var(--c-border);
    border-radius: var(--radius-md);
    outline:       none;
    width:         100%;
    @include transition(fast);

    &::placeholder { color: var(--c-muted); }

    &:focus {
      border-color: var(--c-accent);
      box-shadow:   0 0 0 3px rgba(255,140,66,0.12);
    }

    &--error { border-color: var(--c-danger) !important; }
  }

  &__select { cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%238a7f72' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; padding-right: 30px; }

  &__err {
    font-size:   0.75rem;
    color:       var(--c-danger);
    margin:      0;
    display:     flex;
    align-items: center;
    gap:         4px;
  }

  // Summary chip
  &__summary {
    display:       flex;
    align-items:   center;
    gap:           var(--space-3);
    padding:       var(--space-3) var(--space-4);
    background:    rgba(255,140,66,0.07);
    border:        1px solid rgba(255,140,66,0.2);
    border-radius: var(--radius-md);
  }

  &__summary-icon {
    font-size:  1.2rem;
    color:      var(--c-accent);
    flex-shrink: 0;
  }

  &__summary-range {
    font-size:   0.85rem;
    font-weight: 600;
    color:       var(--c-text);
    margin:      0;
  }

  &__summary-days {
    font-size: 0.75rem;
    color:     var(--c-muted);
    margin:    0;
  }

  &__form-footer {
    display:     flex;
    align-items: center;
    gap:         var(--space-3);
  }
}

// Summary slide transition
.ddrp-slide-enter-active,
.ddrp-slide-leave-active {
  transition: all 0.22s ease;
  overflow: hidden;
}
.ddrp-slide-enter-from,
.ddrp-slide-leave-to {
  opacity:   0;
  max-height: 0;
  transform: translateY(-4px);
}
.ddrp-slide-enter-to,
.ddrp-slide-leave-from {
  opacity:   1;
  max-height: 80px;
}
</style>
