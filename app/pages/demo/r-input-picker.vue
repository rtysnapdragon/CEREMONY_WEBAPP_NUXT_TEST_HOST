<script setup>
// pages/demo/time-input.vue
import { ref } from 'vue'
import { Time } from '@internationalized/date'
const ui = useUIStore()

// ── 1. Basic single ───────────────────────────────────────────────────────
const single     = ref(new Time(12, 30, 0))
const singleEmpty = ref(null)

// ── 2. Range ──────────────────────────────────────────────────────────────
const range = ref({
  start: new Time(9, 0, 0),
  end:   new Time(17, 30, 0),
})
const rangeEmpty = ref(null)

// ── 3. Granularity ────────────────────────────────────────────────────────
const gHour   = ref(new Time(14, 0, 0))
const gMinute = ref(new Time(14, 30, 0))
const gSecond = ref(new Time(14, 30, 45))

// ── 4. Hour cycle ─────────────────────────────────────────────────────────
const h12 = ref(new Time(14, 30, 0))
const h24 = ref(new Time(14, 30, 0))

// ── 5. Sizes ──────────────────────────────────────────────────────────────
const sizes = ['xs', 'sm', 'md', 'lg', 'xl']
const sizeVals = Object.fromEntries(
  sizes.map(s => [s, ref(new Time(9, 0, 0))])
)

// ── 6. States ─────────────────────────────────────────────────────────────
const disabledT  = ref(new Time(10, 0, 0))
const readonlyT  = ref(new Time(15, 30, 0))
const withError  = ref(null)

// ── 7. Bilingual ──────────────────────────────────────────────────────────
const khmTime  = ref(null)
const khmRange = ref(null)

// ── 8. Shift scheduler form ───────────────────────────────────────────────
const form = ref({
  workerName: '',
  shiftDate:  '',
  breakStart: ref(null),
  shiftRange: ref(null),
  overtime:   ref(null),
})
const formErrors = ref({})

// helper
const pad = (n) => String(n).padStart(2, '0')
function fmtTime(t) {
  if (!t) return '—'
  return `${pad(t.hour)}:${pad(t.minute)}`
}
function fmtRange(r) {
  if (!r) return '—'
  return `${fmtTime(r.start)} → ${fmtTime(r.end)}`
}
function shiftDuration(r) {
  if (!r?.start || !r?.end) return null
  const mins = (r.end.hour * 60 + r.end.minute) - (r.start.hour * 60 + r.start.minute)
  if (mins <= 0) return null
  const h = Math.floor(mins / 60), m = mins % 60
  return h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ''}` : `${m}m`
}

function submitShift() {
  formErrors.value = {}
  if (!form.value.workerName) formErrors.value.workerName = 'Worker name is required'
  if (!form.value.shiftDate)  formErrors.value.shiftDate  = 'Date is required'
  if (!form.value.shiftRange) formErrors.value.shiftRange = 'Shift hours are required'

  if (Object.keys(formErrors.value).length === 0) {
    ui.success(
      'Shift scheduled',
      `${form.value.workerName} · ${fmtRange(form.value.shiftRange)}`
    )
  }
}

function resetForm() {
  form.value = {
    workerName: '',
    shiftDate:  '',
    breakStart: null,
    shiftRange: null,
    overtime:   null,
  }
  formErrors.value = {}
}

definePageMeta({
  layout:'navbar'
})
</script>

<template>
  <RToast />

  <div class="dti">

    <RPageHeader
      title="RTimeInputPicker"
      subtitle="NuxtUI UInputTime + click-only clock picker · single & range"
      icon="i-lucide-clock-4"
    />

    <!-- ── 1. Basic single ──────────────────────────────── -->
    <RCard title="Single mode" icon="i-lucide-clock" class="dti__card">
      <div class="dti__row">

        <div class="dti__col">
          <RTimeInputPicker
            v-model="single"
            label="Event time"
            hint="Click the clock to pick with the grid"
          />
          <p class="dti__meta"><code>{{ fmtTime(single) }}</code></p>
        </div>

        <div class="dti__col">
          <RTimeInputPicker
            v-model="singleEmpty"
            label="Start time"
            required
            placeholder="Pick a time"
          />
          <p class="dti__meta"><code>{{ fmtTime(singleEmpty) }}</code></p>
        </div>

      </div>
    </RCard>

    <!-- ── 2. Range mode ────────────────────────────────── -->
    <RCard title="Range mode" icon="i-lucide-clock-arrow-up" class="dti__card">
      <div class="dti__row">

        <div class="dti__col">
          <RTimeInputPicker
            v-model="range"
            range
            label="Working hours"
            hint="Click clock → pick Start then End"
          />
          <p class="dti__meta">
            <code>{{ fmtRange(range) }}</code>
            <span v-if="shiftDuration(range)" class="dti__dur">· {{ shiftDuration(range) }}</span>
          </p>
        </div>

        <div class="dti__col">
          <RTimeInputPicker
            v-model="rangeEmpty"
            range
            label="Meeting window"
            required
          />
          <p class="dti__meta"><code>{{ fmtRange(rangeEmpty) }}</code></p>
        </div>

      </div>
    </RCard>

    <!-- ── 3. Granularity ───────────────────────────────── -->
    <RCard title="Granularity" icon="i-lucide-settings-2" class="dti__card">
      <div class="dti__row">

        <div class="dti__col">
          <RTimeInputPicker
            v-model="gHour"
            granularity="hour"
            label="Hour only"
            hint='granularity="hour"'
          />
          <p class="dti__meta"><code>{{ gHour ? pad(gHour.hour) + ':00' : '—' }}</code></p>
        </div>

        <div class="dti__col">
          <RTimeInputPicker
            v-model="gMinute"
            granularity="minute"
            label="Hour + Minute (default)"
            hint='granularity="minute"'
          />
          <p class="dti__meta"><code>{{ fmtTime(gMinute) }}</code></p>
        </div>

        <div class="dti__col">
          <RTimeInputPicker
            v-model="gSecond"
            granularity="second"
            label="Hour + Minute + Second"
            hint='granularity="second"'
          />
          <p class="dti__meta">
            <code>{{ gSecond ? `${pad(gSecond.hour)}:${pad(gSecond.minute)}:${pad(gSecond.second)}` : '—' }}</code>
          </p>
        </div>

      </div>
    </RCard>

    <!-- ── 4. Hour cycle ────────────────────────────────── -->
    <RCard title="Hour cycle" icon="i-lucide-clock-2" class="dti__card">
      <div class="dti__row">

        <div class="dti__col">
          <RTimeInputPicker
            v-model="h12"
            :hour-cycle="12"
            label="12-hour (AM/PM)"
            hint=":hourCycle=12"
          />
          <p class="dti__meta"><code>{{ fmtTime(h12) }}</code></p>
        </div>

        <div class="dti__col">
          <RTimeInputPicker
            v-model="h24"
            :hour-cycle="24"
            label="24-hour (default)"
            hint=":hourCycle=24"
          />
          <p class="dti__meta"><code>{{ fmtTime(h24) }}</code></p>
        </div>

      </div>
    </RCard>

    <!-- ── 5. Sizes ─────────────────────────────────────── -->
    <RCard title="Sizes" icon="i-lucide-scaling" class="dti__card">
      <div class="dti__stack">
        <RTimeInputPicker
          v-for="s in sizes"
          :key="s"
          v-model="sizeVals[s].value"
          :size="s"
          :label="`size: &quot;${s}&quot;`"
        />
      </div>
    </RCard>

    <!-- ── 6. States ─────────────────────────────────────── -->
    <RCard title="States" icon="i-lucide-toggle-left" class="dti__card">
      <div class="dti__row">

        <RTimeInputPicker
          v-model="withError"
          label="Required time"
          error="Please select a valid time"
          required
        />

        <RTimeInputPicker
          v-model="disabledT"
          label="Disabled"
          hint="disabled: true"
          disabled
        />

        <RTimeInputPicker
          v-model="readonlyT"
          label="Read-only"
          hint="readonly: true"
          readonly
          :clearable="false"
        />

      </div>
    </RCard>

    <!-- ── 7. Bilingual ─────────────────────────────────── -->
    <RCard title="Bilingual km / en" icon="i-lucide-languages" class="dti__card">
      <div class="dti__row">

        <div class="dti__col">
          <RTimeInputPicker
            v-model="khmTime"
            label="ម៉ោងប្រជុំ"
            label-km="ម៉ោងប្រជុំ"
            hint="Single · Khmer label"
          />
          <p class="dti__meta"><code>{{ fmtTime(khmTime) }}</code></p>
        </div>

        <div class="dti__col">
          <RTimeInputPicker
            v-model="khmRange"
            range
            label="ម៉ោងធ្វើការ"
            label-km="ម៉ោងធ្វើការ"
            hint="Range · Khmer label"
          />
          <p class="dti__meta"><code>{{ fmtRange(khmRange) }}</code></p>
        </div>

      </div>
    </RCard>

    <!-- ── 8. Shift scheduler form ──────────────────────── -->
    <RCard
      title="Shift scheduler"
      subtitle="Full form — range required, break & overtime optional"
      icon="i-lucide-briefcase-business"
      class="dti__card"
    >
      <form class="dti__form" @submit.prevent="submitShift">

        <!-- Worker name + date -->
        <div class="dti__form-row dti__form-row--2">
          <div class="dti__field">
            <label class="dti__field-label">Worker name <span class="dti__req">*</span></label>
            <input
              v-model="form.workerName"
              type="text"
              class="dti__input"
              :class="{ 'dti__input--error': formErrors.workerName }"
              placeholder="Rithy Sok"
            />
            <p v-if="formErrors.workerName" class="dti__err">
              <UIcon name="i-lucide-alert-circle" />{{ formErrors.workerName }}
            </p>
          </div>

          <div class="dti__field">
            <label class="dti__field-label">Shift date <span class="dti__req">*</span></label>
            <input
              v-model="form.shiftDate"
              type="date"
              class="dti__input"
              :class="{ 'dti__input--error': formErrors.shiftDate }"
            />
            <p v-if="formErrors.shiftDate" class="dti__err">
              <UIcon name="i-lucide-alert-circle" />{{ formErrors.shiftDate }}
            </p>
          </div>
        </div>

        <!-- Shift hours (range) -->
        <RTimeInputPicker
          v-model="form.shiftRange"
          range
          label="Shift hours"
          label-km="ម៉ោងធ្វើការ"
          required
          :error="formErrors.shiftRange"
          hint="Click clock → pick start then end time"
        />

        <!-- Break + Overtime -->
        <div class="dti__form-row dti__form-row--2">
          <RTimeInputPicker
            v-model="form.breakStart"
            label="Break start"
            label-km="ម៉ោងសម្រាក"
            hint="Optional"
          />

          <RTimeInputPicker
            v-model="form.overtime"
            label="Overtime from"
            label-km="ម៉ោងថែមម៉ោង"
            hint="Optional"
          />
        </div>

        <!-- Summary card -->
        <Transition name="dti-slide">
          <div v-if="form.shiftRange" class="dti__summary-card">
            <div class="dti__summary-row">
              <UIcon name="i-lucide-clock" class="dti__summary-icon" />
              <div>
                <p class="dti__summary-title">Shift summary</p>
                <p class="dti__summary-sub">
                  {{ fmtRange(form.shiftRange) }}
                  <strong v-if="shiftDuration(form.shiftRange)">
                    · {{ shiftDuration(form.shiftRange) }}
                  </strong>
                </p>
              </div>
            </div>
            <div v-if="form.breakStart || form.overtime" class="dti__summary-extras">
              <span v-if="form.breakStart">
                <UIcon name="i-lucide-coffee" />
                Break: {{ fmtTime(form.breakStart) }}
              </span>
              <span v-if="form.overtime">
                <UIcon name="i-lucide-trending-up" />
                OT from: {{ fmtTime(form.overtime) }}
              </span>
            </div>
          </div>
        </Transition>

        <!-- Actions -->
        <div class="dti__form-footer">
          <RBtn icon="ri-calendar-check-line" label="Save shift" :ui="{base: 'rounded-md'}" />
          <RBtn variant="ghost" label="Reset" icon="ri-refresh-line" :ui="{base: 'rounded-md'}" @click="resetForm" />
        </div>

      </form>
    </RCard>

  </div>
</template>

<style lang="scss" scoped>

.dti {
  padding:        var(--space-8);
  max-width:      900px;
  margin:         0 auto;
  display:        flex;
  flex-direction: column;
  gap:            var(--space-5);

  @include mobile-only { padding: var(--space-4); }

  &__card { width: 100%; }

  &__row {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap:     var(--space-5);
    padding: var(--space-1) 0;
  }

  &__stack {
    display:        flex;
    flex-direction: column;
    gap:            var(--space-4);
    padding:        var(--space-1) 0;
  }

  &__col {
    display:        flex;
    flex-direction: column;
    gap:            var(--space-3);
  }

  &__meta {
    display:     flex;
    align-items: center;
    gap:         var(--space-2);
    font-size:   0.78rem;
    color:       var(--c-muted);
    margin:      0;

    code {
      font-size:     0.73rem;
      padding:       2px 8px;
      background:    rgba(255,140,66,0.08);
      border:        1px solid rgba(255,140,66,0.15);
      border-radius: var(--radius-sm);
      color:         var(--c-accent);
      font-family:   'Fira Code', 'Consolas', monospace;
    }
  }

  &__dur {
    font-size: 0.73rem;
    color:     var(--c-muted);
  }

  // Form
  &__form {
    display:        flex;
    flex-direction: column;
    gap:            var(--space-4);
  }

  &__form-row {
    display: grid;
    gap:     var(--space-4);
    &--2    { grid-template-columns: repeat(2, 1fr); }
    &--3    { grid-template-columns: repeat(3, 1fr); }

    @include mobile-only { grid-template-columns: 1fr !important; }
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

  &__input {
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
    &:focus { border-color: var(--c-accent); box-shadow: 0 0 0 3px rgba(255,140,66,0.12); }
    &--error { border-color: var(--c-danger) !important; }
  }

  &__err {
    font-size:   0.75rem;
    color:       var(--c-danger);
    margin:      0;
    display:     flex;
    align-items: center;
    gap:         4px;
  }

  // Summary card
  &__summary-card {
    border:        1px solid rgba(255,140,66,0.2);
    border-radius: var(--radius-lg);
    background:    rgba(255,140,66,0.05);
    overflow:      hidden;
  }

  &__summary-row {
    display:     flex;
    align-items: center;
    gap:         var(--space-3);
    padding:     var(--space-3) var(--space-4);
  }

  &__summary-icon {
    font-size:  1.3rem;
    color:      var(--c-accent);
    flex-shrink: 0;
  }

  &__summary-title {
    font-size:   0.78rem;
    font-weight: 600;
    color:       var(--c-muted);
    margin:      0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  &__summary-sub {
    font-size:   0.88rem;
    font-weight: 500;
    color:       var(--c-text);
    margin:      0;
    font-variant-numeric: tabular-nums;
    strong { color: var(--c-accent); }
  }

  &__summary-extras {
    display:     flex;
    align-items: center;
    gap:         var(--space-4);
    padding:     var(--space-2) var(--space-4);
    background:  rgba(255,140,66,0.04);
    border-top:  1px solid rgba(255,140,66,0.1);
    font-size:   0.75rem;
    color:       var(--c-muted);

    span {
      display:     flex;
      align-items: center;
      gap:         var(--space-1);
      svg { color: var(--c-accent); font-size: 0.85rem; }
    }
  }

  &__form-footer {
    display:     flex;
    align-items: center;
    gap:         var(--space-3);
  }
}

// Slide transition
.dti-slide-enter-active, .dti-slide-leave-active {
  transition: all 0.22s ease;
  overflow:   hidden;
}
.dti-slide-enter-from, .dti-slide-leave-to  { opacity: 0; max-height: 0; transform: translateY(-4px); }
.dti-slide-enter-to,   .dti-slide-leave-from { opacity: 1; max-height: 120px; }
</style>