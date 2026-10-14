<script setup lang="ts">
// pages/demo/time-input-picker.vue
import { ref } from 'vue'
import { useUIStore } from '@/stores/ui'

const ui = useUIStore()
useHead({
  title:'Time Input Picker'
})
// ── Basic ──────────────────────────────────────────────────────────────────
const basic      = ref<string | null>('09:30')
const empty      = ref<string | null>(null)

// ── Modes ─────────────────────────────────────────────────────────────────
const mode24     = ref<string | null>('14:45')
const mode12     = ref<string | null>('14:45')       // displayed as 2:45 PM
const withSecs   = ref<string | null>('08:15:30')

// ── Steps ─────────────────────────────────────────────────────────────────
const step5      = ref<string | null>('08:00')
const step15     = ref<string | null>('09:00')
const step30     = ref<string | null>('10:30')

// ── States ────────────────────────────────────────────────────────────────
const withError  = ref<string | null>(null)
const disabledT  = ref<string | null>('11:00')
const readonlyT  = ref<string | null>('16:30')

// ── Sizes ──────────────────────────────────────────────────────────────────
const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
const sizeVals = Object.fromEntries(sizes.map(s => [s, ref<string | null>('08:00')]))

// ── Bilingual ─────────────────────────────────────────────────────────────
const khmTime    = ref<string | null>(null)

// ── Event scheduler form ──────────────────────────────────────────────────
const schedForm = ref({
  eventName: '',
  date:      '',
  startTime: ref<string | null>(null) as unknown as string | null,
  endTime:   ref<string | null>(null) as unknown as string | null,
  reminder:  ref<string | null>('08:00') as unknown as string | null,
})

const schedErrors = ref<Record<string, string>>({})

function submitSchedule() {
  schedErrors.value = {}
  if (!schedForm.value.eventName) schedErrors.value.eventName = 'Event name is required'
  if (!schedForm.value.date)      schedErrors.value.date = 'Date is required'
  if (!schedForm.value.startTime) schedErrors.value.startTime = 'Start time is required'
  if (!schedForm.value.endTime)   schedErrors.value.endTime = 'End time is required'

  if (schedForm.value.startTime && schedForm.value.endTime) {
    if (schedForm.value.startTime >= schedForm.value.endTime)
      schedErrors.value.endTime = 'End time must be after start time'
  }

  if (Object.keys(schedErrors.value).length === 0) {
    ui.success(
      'Event scheduled!',
      `${schedForm.value.eventName} · ${schedForm.value.startTime} → ${schedForm.value.endTime}`
    )
  }
}

function resetSchedule() {
  schedForm.value.eventName = ''
  schedForm.value.date      = ''
  schedForm.value.startTime = null
  schedForm.value.endTime   = null
  schedForm.value.reminder  = '08:00'
  schedErrors.value         = {}
}

// ── Duration helper ───────────────────────────────────────────────────────
function duration(from: string | null, to: string | null): string {
  if (!from || !to) return '—'
  const [fh, fm] = from.split(':').map(Number)
  const [th, tm] = to.split(':').map(Number)
  const mins = (th * 60 + tm) - (fh * 60 + fm)
  if (mins <= 0) return 'invalid'
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `${h}h ${m > 0 ? m + 'm' : ''}`.trim() : `${m}m`
}

definePageMeta({
  layout: 'navbar'
})
</script>

<template>
  <RToast />

  <div class="dtip">

    <RPageHeader
      title="RInputTimePicker"
      subtitle="Scroll drum time picker — 12/24h · steps · seconds · keyboard nav"
      icon="i-lucide-clock"
    />

    <!-- ── 1. Basic ──────────────────────────────────────── -->
    <RCard title="Basic" icon="i-lucide-info" class="dtip__card">
      <div class="dtip__row">

        <div class="dtip__col">
          <RInputTimePicker
            v-model="basic"
            label="Event time"
            hint="Pre-filled with 09:30"
          />
          <p class="dtip__meta">
            <UIcon name="i-lucide-clock-check" />
            Value: <code>{{ basic ?? 'null' }}</code>
          </p>
        </div>

        <div class="dtip__col">
          <RInputTimePicker
            v-model="empty"
            label="Meeting time"
            placeholder="Select a time…"
            required
          />
          <p class="dtip__meta">
            <UIcon name="i-lucide-info" />
            Value: <code>{{ empty ?? 'null' }}</code>
          </p>
        </div>

      </div>
    </RCard>

    <!-- ── 2. 12h / 24h / Seconds ────────────────────────── -->
    <RCard title="Clock format" icon="i-lucide-clock-4" class="dtip__card">
      <div class="dtip__row">

        <div class="dtip__col">
          <RInputTimePicker
            v-model="mode24"
            label="24-hour format (default)"
            hint="use12h: false"
          />
          <p class="dtip__meta"><code>{{ mode24 }}</code></p>
        </div>

        <div class="dtip__col">
          <RInputTimePicker
            v-model="mode12"
            label="12-hour format"
            hint="use12h: true"
            :use12h="true"
          />
          <p class="dtip__meta"><code>{{ mode12 }}</code></p>
        </div>

        <div class="dtip__col">
          <RInputTimePicker
            v-model="withSecs"
            label="With seconds"
            hint="showSeconds: true"
            :show-seconds="true"
          />
          <p class="dtip__meta"><code>{{ withSecs }}</code></p>
        </div>

      </div>
    </RCard>

    <!-- ── 3. Minute steps ───────────────────────────────── -->
    <RCard title="Minute steps" icon="i-lucide-settings-2" class="dtip__card">
      <div class="dtip__row">

        <div class="dtip__col">
          <RInputTimePicker
            v-model="step5"
            label="5-minute steps"
            hint="minuteStep: 5"
            :minute-step="5"
          />
          <p class="dtip__meta"><code>{{ step5 }}</code></p>
        </div>

        <div class="dtip__col">
          <RInputTimePicker
            v-model="step15"
            label="15-minute steps"
            hint="minuteStep: 15"
            :minute-step="15"
          />
          <p class="dtip__meta"><code>{{ step15 }}</code></p>
        </div>

        <div class="dtip__col">
          <RInputTimePicker
            v-model="step30"
            label="30-minute steps"
            hint="minuteStep: 30"
            :minute-step="30"
          />
          <p class="dtip__meta"><code>{{ step30 }}</code></p>
        </div>

      </div>
    </RCard>

    <!-- ── 4. States ─────────────────────────────────────── -->
    <RCard title="States" icon="i-lucide-toggle-left" class="dtip__card">
      <div class="dtip__row">

        <RInputTimePicker
          v-model="withError"
          label="Required time"
          error="Please select a valid time"
          placeholder="Pick a time…"
        />

        <RInputTimePicker
          v-model="disabledT"
          label="Disabled"
          hint="disabled: true"
          disabled
        />

        <RInputTimePicker
          v-model="readonlyT"
          label="Read-only"
          hint="readonly: true · clearable: false"
          readonly
          :clearable="false"
        />

      </div>
    </RCard>

    <!-- ── 5. Sizes ───────────────────────────────────────── -->
    <RCard title="Sizes" icon="i-lucide-scaling" class="dtip__card">
      <div class="dtip__stack">
        <RInputTimePicker
          v-for="s in sizes"
          :key="s"
          v-model="sizeVals[s].value"
          :size="s"
          :label="`size: &quot;${s}&quot;`"
        />
      </div>
    </RCard>

    <!-- ── 6. Bilingual ───────────────────────────────────── -->
    <RCard title="Bilingual km/en" icon="i-lucide-languages" class="dtip__card">
      <div class="dtip__row">
        <div class="dtip__col">
          <RInputTimePicker
            v-model="khmTime"
            label="ម៉ោងប្រជុំ"
            label-km="ម៉ោងប្រជុំ"
            placeholder="ជ្រើសរើសម៉ោង…"
            hint="Khmer label · Now button & error in km"
          />
          <p class="dtip__meta"><code>{{ khmTime ?? 'null' }}</code></p>
        </div>
      </div>
    </RCard>

    <!-- ── 7. Event scheduler form ───────────────────────── -->
    <RCard
      title="Event scheduler"
      subtitle="Full form integration with start/end validation"
      icon="i-lucide-calendar-clock"
      class="dtip__card"
    >
      <form class="dtip__form" @submit.prevent="submitSchedule">

        <!-- Name + Date row -->
        <div class="dtip__form-row dtip__form-row--2">
          <div class="dtip__field">
            <label class="dtip__field-label">
              Event name <span class="dtip__req">*</span>
            </label>
            <input
              v-model="schedForm.eventName"
              type="text"
              class="dtip__input"
              :class="{ 'dtip__input--error': schedErrors.eventName }"
              placeholder="Design review, standup…"
            />
            <p v-if="schedErrors.eventName" class="dtip__err">
              <UIcon name="i-lucide-alert-circle" />
              {{ schedErrors.eventName }}
            </p>
          </div>

          <div class="dtip__field">
            <label class="dtip__field-label">
              Date <span class="dtip__req">*</span>
            </label>
            <input
              v-model="schedForm.date"
              type="date"
              class="dtip__input"
              :class="{ 'dtip__input--error': schedErrors.date }"
            />
            <p v-if="schedErrors.date" class="dtip__err">
              <UIcon name="i-lucide-alert-circle" />
              {{ schedErrors.date }}
            </p>
          </div>
        </div>

        <!-- Start / End / Reminder row -->
        <div class="dtip__form-row dtip__form-row--3">
          <RInputTimePicker
            v-model="schedForm.startTime"
            label="Start time"
            label-km="ម៉ោងចាប់ផ្ដើម"
            required
            :error="schedErrors.startTime"
            :minute-step="15"
          />

          <RInputTimePicker
            v-model="schedForm.endTime"
            label="End time"
            label-km="ម៉ោងបញ្ចប់"
            required
            :error="schedErrors.endTime"
            :minute-step="15"
          />

          <RInputTimePicker
            v-model="schedForm.reminder"
            label="Reminder"
            label-km="រំលឹក"
            hint="Optional"
            :minute-step="5"
          />
        </div>

        <!-- Duration chip -->
        <Transition name="dtip-slide">
          <div
            v-if="schedForm.startTime && schedForm.endTime"
            class="dtip__duration"
          >
            <UIcon name="i-lucide-timer" class="dtip__duration-icon" />
            <div>
              <p class="dtip__duration-time">
                {{ schedForm.startTime }} → {{ schedForm.endTime }}
              </p>
              <p class="dtip__duration-label">
                Duration:
                <strong>{{ duration(schedForm.startTime, schedForm.endTime) }}</strong>
              </p>
            </div>
          </div>
        </Transition>

        <!-- Actions -->
        <div class="dtip__form-footer">
          <RButton type="submit" icon="i-lucide-calendar-plus">Schedule event</RButton>
          <RButton variant="ghost" @click="resetSchedule">Reset</RButton>
        </div>

      </form>
    </RCard>

  </div>
</template>

<style lang="scss" scoped>

.dtip {
  padding:        var(--space-8);
  max-width:      900px;
  margin:         0 auto;
  display:        flex;
  flex-direction: column;
  gap:            var(--space-5);

  @include mobile-only { padding: var(--space-4); }

  &__card { width: 100%; }

  &__row {
    display:  grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap:      var(--space-5);
    padding:  var(--space-1) 0;
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
      padding:       2px 6px;
      background:    rgba(255,140,66,0.08);
      border:        1px solid rgba(255,140,66,0.15);
      border-radius: var(--radius-sm);
      color:         var(--c-accent);
      font-family:   'Fira Code', 'Consolas', monospace;
    }

    svg { color: var(--c-accent); font-size: 0.9rem; }
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

    &--2 { grid-template-columns: 2fr 1fr; }
    &--3 { grid-template-columns: repeat(3, 1fr); }

    @include mobile-only {
      grid-template-columns: 1fr !important;
    }
    @include tablet-only {
      &--3 { grid-template-columns: repeat(2, 1fr); }
    }
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

  // Duration chip
  &__duration {
    display:       flex;
    align-items:   center;
    gap:           var(--space-3);
    padding:       var(--space-3) var(--space-4);
    background:    rgba(255,140,66,0.07);
    border:        1px solid rgba(255,140,66,0.2);
    border-radius: var(--radius-md);
  }

  &__duration-icon {
    font-size:  1.2rem;
    color:      var(--c-accent);
    flex-shrink: 0;
  }

  &__duration-time {
    font-size:   0.85rem;
    font-weight: 600;
    color:       var(--c-text);
    margin:      0;
    font-variant-numeric: tabular-nums;
  }

  &__duration-label {
    font-size: 0.75rem;
    color:     var(--c-muted);
    margin:    0;

    strong { color: var(--c-accent); }
  }

  &__form-footer {
    display:     flex;
    align-items: center;
    gap:         var(--space-3);
  }
}

// Slide transition
.dtip-slide-enter-active, .dtip-slide-leave-active {
  transition: all 0.22s ease;
  overflow:   hidden;
}
.dtip-slide-enter-from, .dtip-slide-leave-to {
  opacity:    0;
  max-height: 0;
  transform:  translateY(-4px);
}
.dtip-slide-enter-to, .dtip-slide-leave-from {
  opacity:    1;
  max-height: 80px;
}
</style>
