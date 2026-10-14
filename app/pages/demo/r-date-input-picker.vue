<script setup lang="ts">
// pages/demo/date-picker.vue
// Demonstrates all RDateInputPicker props, sizes, states, and form integration
import { shallowRef, ref } from 'vue'
import { CalendarDate, today, getLocalTimeZone } from '@internationalized/date'
import { useUIStore } from '@/stores/ui'


const ui = useUIStore()
useHead({
  title:'RDateInputPicker'
})
// ── Individual demos ───────────────────────────────────────────────────────
const basic        = shallowRef<CalendarDate | null>(new CalendarDate(2025, 6, 15))
const empty        = shallowRef<CalendarDate | null>(null)
const withError    = shallowRef<CalendarDate | null>(null)
const disabledDate = shallowRef<CalendarDate | null>(new CalendarDate(2025, 1, 10))
const readonlyDate = shallowRef<CalendarDate | null>(new CalendarDate(2025, 3, 20))
const khmDate      = shallowRef<CalendarDate | null>(null)

// Min/Max bounded
const minVal = new CalendarDate(2025, 1, 1)
const maxVal = new CalendarDate(2025, 12, 31)
const bounded = shallowRef<CalendarDate | null>(null)

// ── Form demo ─────────────────────────────────────────────────────────────
const form = ref({
  name:      '',
  birthDate: shallowRef<CalendarDate | null>(null) as unknown as CalendarDate | null,
  startDate: shallowRef<CalendarDate | null>(null) as unknown as CalendarDate | null,
})
const formErrors = ref<Record<string, string>>({})

function submitForm() {
  formErrors.value = {}
  if (!form.value.name)      formErrors.value.name = 'Name is required'
  if (!form.value.birthDate) formErrors.value.birthDate = 'Date of birth is required'
  if (!form.value.startDate) formErrors.value.startDate = 'Start date is required'

  if (Object.keys(formErrors.value).length === 0) {
    ui.success('Form submitted', `Birth: ${form.value.birthDate} | Start: ${form.value.startDate}`)
  }
}

// ── Size labels ───────────────────────────────────────────────────────────
const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
const sizeValues = Object.fromEntries(
  sizes.map(s => [s, shallowRef<CalendarDate | null>(today(getLocalTimeZone()))])
)

definePageMeta({
  layout:'navbar'
})

</script>

<template>
  <div class="demo-dp">
    <RPageHeader
      title="RDateInputPicker"
      subtitle="Single date selection — NuxtUI v4 · SARIKA tokens"
      icon="i-lucide-calendar"
    />

    <!-- ── Basic usage ───────────────────────────────────── -->
    <RCard title="Basic" icon="i-lucide-info" class="demo-dp__card">
      <div class="demo-dp__row">
        <!-- Pre-filled -->
        <RDateInputPicker
          v-model="basic"
          label="Date of event"
          hint="Click the calendar icon to change"
        />

        <!-- Empty / no initial value -->
        <RDateInputPicker
          v-model="empty"
          label="Start date"
          placeholder="Pick a date…"
          required
        />
      </div>
    </RCard>

    <!-- ── Sizes ─────────────────────────────────────────── -->
    <RCard title="Sizes" icon="i-lucide-scaling" class="demo-dp__card">
      <div class="demo-dp__col">
        <RDateInputPicker
          v-for="s in sizes"
          :key="s"
          v-model="sizeValues[s].value"
          :size="s"
          :label="`Size: ${s}`"
        />
      </div>
    </RCard>

    <!-- ── States ────────────────────────────────────────── -->
    <RCard title="States" icon="i-lucide-toggle-left" class="demo-dp__card">
      <div class="demo-dp__row">

        <!-- Error -->
        <RDateInputPicker
          v-model="withError"
          label="Deadline"
          error="Please select a valid date"
          placeholder="Required field"
        />

        <!-- Disabled -->
        <RDateInputPicker
          v-model="disabledDate"
          label="Locked date (disabled)"
          disabled
        />

        <!-- Readonly -->
        <RDateInputPicker
          v-model="readonlyDate"
          label="Reference date (read-only)"
          readonly
          :clearable="false"
        />

        <!-- Min / Max bounded -->
        <RDateInputPicker
          v-model="bounded"
          label="Bounded (2025 only)"
          hint="Jan 1 – Dec 31, 2025"
          :min-value="minVal"
          :max-value="maxVal"
          placeholder="Within 2025…"
        />
      </div>
    </RCard>

    <!-- ── Khmer / bilingual ──────────────────────────────── -->
    <RCard title="Bilingual (km / en)" icon="i-lucide-languages" class="demo-dp__card">
      <div class="demo-dp__row">
        <RDateInputPicker
          v-model="khmDate"
          label="ថ្ងៃប្រើប្រាស់"
          label-km="ថ្ងៃប្រើប្រាស់"
          placeholder="ជ្រើសរើសថ្ងៃខែ…"
          placeholder-km="ជ្រើសរើសថ្ងៃខែ…"
          hint="Khmer label with Khmer placeholder"
        />
      </div>
    </RCard>

    <!-- ── Custom ui prop passthrough ────────────────────── -->
    <RCard title="Custom ui passthrough" icon="i-lucide-sliders-horizontal" class="demo-dp__card">
      <div class="demo-dp__row">
        <RDateInputPicker
          v-model="basic"
          label="With custom ui override"
          hint="Extra class injected via :ui prop"
          :ui="{
            root: 'rdp-s__root rdp-s--custom-outline',
          }"
        />
      </div>
    </RCard>

    <!-- ── In a form ──────────────────────────────────────── -->
    <RCard title="Inside a form" icon="i-lucide-file-pen-line" class="demo-dp__card">
      <form class="demo-dp__form" @submit.prevent="submitForm">

        <div class="demo-dp__field">
          <label class="demo-dp__field-label">Full name <span class="demo-dp__req">*</span></label>
          <input
            v-model="form.name"
            type="text"
            class="demo-dp__input"
            :class="{ 'demo-dp__input--error': formErrors.name }"
            placeholder="John Doe"
          />
          <p v-if="formErrors.name" class="demo-dp__err">{{ formErrors.name }}</p>
        </div>

        <div class="demo-dp__row demo-dp__row--tight">
          <RDateInputPicker
            v-model="form.birthDate"
            label="Date of birth"
            label-km="ថ្ងៃខែឆ្នាំកំណើត"
            required
            :error="formErrors.birthDate"
            placeholder="DD / MM / YYYY"
          />
          <RDateInputPicker
            v-model="form.startDate"
            label="Employment start"
            required
            :error="formErrors.startDate"
            placeholder="Pick start date…"
          />
        </div>

        <div class="demo-dp__form-footer">
          <RButton type="submit" icon="i-lucide-check">Submit form</RButton>
          <RButton
            variant="ghost"
            @click="form.name = ''; form.birthDate = null; form.startDate = null; formErrors = {}"
          >
            Reset
          </RButton>
        </div>

      </form>
    </RCard>

  </div>
</template>

<style lang="scss">

.demo-dp {
  padding:        var(--space-8);
  max-width:      860px;
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

    &--tight { gap: var(--space-4); }
  }

  &__col {
    display:        flex;
    flex-direction: column;
    gap:            var(--space-4);
    padding:        var(--space-1) 0;
  }

  // Form fields
  &__form {
    display:        flex;
    flex-direction: column;
    gap:            var(--space-4);
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
    @include transition(fast);

    &::placeholder { color: var(--c-muted); }
    &:focus        { border-color: var(--c-accent); box-shadow: 0 0 0 3px rgba(255,140,66,0.12); }

    &--error { border-color: var(--c-danger); }
  }

  &__err {
    font-size:   0.75rem;
    color:       var(--c-danger);
    margin:      0;
    display:     flex;
    align-items: center;
    gap:         4px;
  }

  &__form-footer {
    display:     flex;
    align-items: center;
    gap:         var(--space-3);
    margin-top:  var(--space-2);
  }
}

// Custom outline override demo
:global(.rdp-s--custom-outline) {
  input {
    border-width: 2px !important;
    border-color: var(--c-info) !important;
  }
}
</style>
