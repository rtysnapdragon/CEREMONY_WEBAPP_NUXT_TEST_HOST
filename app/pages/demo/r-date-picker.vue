<script setup lang="ts">
/**
 * pages/demo/date-picker.vue
 * Full showcase for RDatePicker — all props, states, sizes, form
 */
import { shallowRef, ref, computed } from 'vue'
import { CalendarDate, today, getLocalTimeZone } from '@internationalized/date'

useHead({ title: 'RDatePicker — Demo' })
definePageMeta({ layout: 'navbar' })

const now = () => today(getLocalTimeZone())

// ── Values ────────────────────────────────────────────────────────────────
const basic       = shallowRef<CalendarDate | null>(new CalendarDate(2025, 6, 15))
const empty       = shallowRef<CalendarDate | null>(null)
const todayPick   = shallowRef<CalendarDate | null>(now())
const disabled    = shallowRef<CalendarDate | null>(new CalendarDate(2025, 1, 1))
const withError   = shallowRef<CalendarDate | null>(null)
const clearOff    = shallowRef<CalendarDate | null>(now())
const readonly    = shallowRef<CalendarDate | null>(new CalendarDate(2025, 3, 20))
const minmax      = shallowRef<CalendarDate | null>(null)
const khmer       = shallowRef<CalendarDate | null>(null)
const customUi    = shallowRef<CalendarDate | null>(null)

// ── Sizes ─────────────────────────────────────────────────────────────────
const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
const sizeVals = Object.fromEntries(
  sizes.map(s => [s, shallowRef<CalendarDate | null>(now())])
)

// ── Form ──────────────────────────────────────────────────────────────────
const form = ref({ name: '', dob: null as CalendarDate | null, startDate: null as CalendarDate | null })
const errors = ref<Record<string, string>>({})

function submitForm() {
  errors.value = {}
  if (!form.value.name)      errors.value.name      = 'Name is required'
  if (!form.value.dob)       errors.value.dob       = 'Date of birth is required'
  if (!form.value.startDate) errors.value.startDate = 'Start date is required'
  if (Object.keys(errors.value).length === 0) {
    alert(`Submitted: ${form.value.name} · DOB: ${fmt(form.value.dob)} · Start: ${fmt(form.value.startDate)}`)
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────
function fmt(d: CalendarDate | null): string {
  if (!d) return '—'
  return new Date(d.year, d.month - 1, d.day)
    .toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div class="demo">

    <RPageHeader
      title="RDatePicker"
      subtitle="Single date picker · NuxtUI 4.4.0 · SARIKA tokens"
      icon="i-lucide-calendar"
    />

    <!-- ── 1. Basic ──────────────────────────────────────────────────── -->
    <RCard title="Basic" icon="i-lucide-info">
      <div class="demo-grid">

        <div class="demo-col">
          <RDatePicker v-model="basic" label="Pre-filled date" hint="June 15 2025" />
          <p class="demo-meta"><UIcon name="i-lucide-calendar-check" /> {{ fmt(basic) }}</p>
        </div>

        <div class="demo-col">
          <RDatePicker v-model="empty" label="Empty (no initial value)" placeholder="Pick a date…" />
          <p class="demo-meta"><UIcon name="i-lucide-info" /> {{ fmt(empty) }}</p>
        </div>

        <div class="demo-col">
          <RDatePicker v-model="todayPick" label="Defaulted to today" />
          <p class="demo-meta"><UIcon name="i-lucide-calendar" /> {{ fmt(todayPick) }}</p>
        </div>

      </div>
    </RCard>

    <!-- ── 2. Sizes ───────────────────────────────────────────────────── -->
    <RCard title="Sizes" icon="i-lucide-scaling">
      <div class="demo-stack">
        <RDatePicker
          v-for="s in sizes"
          :key="s"
          v-model="sizeVals[s].value"
          :size="s"
          :label="`size = &quot;${s}&quot;`"
        />
      </div>
    </RCard>

    <!-- ── 3. States ──────────────────────────────────────────────────── -->
    <RCard title="States" icon="i-lucide-toggle-left">
      <div class="demo-grid">

        <div class="demo-col">
          <RDatePicker
            v-model="withError"
            label="With error"
            required
            error="This field is required"
            placeholder="Select a date"
          />
        </div>

        <div class="demo-col">
          <RDatePicker v-model="disabled" label="Disabled" disabled />
        </div>

        <div class="demo-col">
          <RDatePicker v-model="readonly" label="Read-only" readonly hint="readonly: true" />
        </div>

        <div class="demo-col">
          <RDatePicker v-model="clearOff" label="No clear button" :clearable="false" hint="clearable: false" />
        </div>

      </div>
    </RCard>

    <!-- ── 4. Min / Max constraint ────────────────────────────────────── -->
    <RCard title="Min / Max" icon="i-lucide-calendar-range">
      <div class="demo-grid">
        <div class="demo-col">
          <RDatePicker
            v-model="minmax"
            label="Only this month"
            :min-value="new CalendarDate(now().year, now().month, 1)"
            :max-value="new CalendarDate(now().year, now().month, now().day + 14)"
            hint="Restricted to ±14 days"
          />
          <p class="demo-meta"><UIcon name="i-lucide-calendar-check" /> {{ fmt(minmax) }}</p>
        </div>
      </div>
    </RCard>

    <!-- ── 5. Bilingual ───────────────────────────────────────────────── -->
    <RCard title="Bilingual (KM / EN)" icon="i-lucide-languages">
      <div class="demo-grid">
        <div class="demo-col">
          <RDatePicker
            v-model="khmer"
            label="ថ្ងៃខែ"
            label-km="ថ្ងៃខែ"
            placeholder="ជ្រើសរើសថ្ងៃ…"
            placeholder-km="ជ្រើសរើសថ្ងៃ…"
            hint="Label + placeholder switch by locale"
          />
          <p class="demo-meta"><UIcon name="i-lucide-calendar-check" /> {{ fmt(khmer) }}</p>
        </div>
      </div>
    </RCard>

    <!-- ── 6. Custom ui passthrough ───────────────────────────────────── -->
    <RCard title=":ui passthrough" icon="i-lucide-sliders-horizontal">
      <div class="demo-grid">
        <div class="demo-col">
          <RDatePicker
            v-model="customUi"
            label="Pill shape via :ui"
            hint="base class overridden to rounded-full"
            :ui="{ base: 'rounded-full px-4' }"
          />
        </div>
      </div>
    </RCard>

    <!-- ── 7. Form integration ────────────────────────────────────────── -->
    <RCard title="Form integration" icon="i-lucide-file-pen-line">
      <form class="demo-form" @submit.prevent="submitForm">

        <div class="demo-field">
          <label class="demo-field__label">Full name <span class="demo-req">*</span></label>
          <input
            v-model="form.name"
            class="demo-input"
            :class="{ 'demo-input--err': errors.name }"
            placeholder="Your name…"
          />
          <p v-if="errors.name" class="demo-err">
            <UIcon name="i-lucide-alert-circle" /> {{ errors.name }}
          </p>
        </div>

        <div class="demo-grid">
          <RDatePicker
            v-model="form.dob"
            label="Date of birth"
            required
            :error="errors.dob"
            placeholder="DD / MM / YYYY"
          />
          <RDatePicker
            v-model="form.startDate"
            label="Employment start"
            required
            :error="errors.startDate"
            :min-value="now()"
            hint="Must be today or later"
          />
        </div>

        <!-- Summary row -->
        <Transition name="demo-slide">
          <div v-if="form.dob || form.startDate" class="demo-summary">
            <div v-if="form.dob">
              <span class="demo-summary__key">DOB</span>
              <span class="demo-summary__val">{{ fmt(form.dob) }}</span>
            </div>
            <div v-if="form.startDate">
              <span class="demo-summary__key">Start</span>
              <span class="demo-summary__val">{{ fmt(form.startDate) }}</span>
            </div>
          </div>
        </Transition>

        <div class="demo-form__footer">
          <RButton type="submit" icon="i-lucide-send">Submit</RButton>
          <RButton variant="ghost" type="button" @click="() => { form.name=''; form.dob=null; form.startDate=null; errors={} }">
            Reset
          </RButton>
        </div>

      </form>
    </RCard>

  </div>
</template>

<style lang="scss" scoped>
.demo {
  padding:        var(--space-8);
  max-width:      860px;
  margin:         0 auto;
  display:        flex;
  flex-direction: column;
  gap:            var(--space-5);

  @include mobile-only { padding: var(--space-4); }
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap:     var(--space-5);
  padding: var(--space-1) 0;
}

.demo-stack {
  display:        flex;
  flex-direction: column;
  gap:            var(--space-3);
  padding:        var(--space-1) 0;
}

.demo-col {
  display:        flex;
  flex-direction: column;
  gap:            var(--space-3);
}

.demo-meta {
  display:     flex;
  align-items: center;
  gap:         var(--space-2);
  font-size:   0.75rem;
  color:       var(--c-muted);
  margin:      0;

  svg { color: var(--c-accent); }
}

// ── Form ──────────────────────────────────────────────────────────────────
.demo-form {
  display:        flex;
  flex-direction: column;
  gap:            var(--space-4);
}

.demo-field {
  display:        flex;
  flex-direction: column;
  gap:            5px;
}

.demo-field__label {
  font-size:   0.82rem;
  font-weight: 500;
  color:       var(--c-text);
}

.demo-req { color: var(--c-danger); }

.demo-input {
  height:        38px;
  padding:       0 12px;
  font-family:   var(--font-fallback);
  font-size:     0.875rem;
  color:         var(--c-text);
  background:    var(--c-surface);
  border:        1px solid var(--c-border);
  border-radius: 10px;
  outline:       none;
  transition:    border-color 0.18s, box-shadow 0.18s;
  width:         100%;

  &::placeholder { color: var(--c-muted); }

  &:focus {
    border-color: var(--c-accent);
    box-shadow:   0 0 0 3px rgba(255,140,66,0.12);
  }

  &--err { border-color: var(--c-danger) !important; }
}

.demo-err {
  font-size:   0.75rem;
  color:       var(--c-danger);
  display:     flex;
  align-items: center;
  gap:         4px;
  margin:      0;
}

.demo-summary {
  display:       flex;
  gap:           var(--space-4);
  padding:       var(--space-3) var(--space-4);
  background:    rgba(255,140,66,0.06);
  border:        1px solid rgba(255,140,66,0.18);
  border-radius: 10px;
}

.demo-summary__key {
  font-size:    0.7rem;
  font-weight:  600;
  color:        var(--c-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  display:      block;
}

.demo-summary__val {
  font-size:   0.85rem;
  font-weight: 500;
  color:       var(--c-text);
}

.demo-form__footer {
  display:     flex;
  gap:         var(--space-3);
  align-items: center;
}

// ── Slide transition ───────────────────────────────────────────────────────
.demo-slide-enter-active, .demo-slide-leave-active {
  transition: all 0.2s ease;
  overflow:   hidden;
}
.demo-slide-enter-from, .demo-slide-leave-to {
  opacity:    0;
  max-height: 0;
}
.demo-slide-enter-to, .demo-slide-leave-from {
  opacity:    1;
  max-height: 100px;
}
</style>