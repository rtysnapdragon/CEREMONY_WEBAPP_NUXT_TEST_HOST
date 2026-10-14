<script setup lang="ts">
import { Time } from '@internationalized/date'
useHead({
  title:'R Time Input'
})
// Single time
const appointmentTime = shallowRef(new Time(12, 30, 0))

// Range time
const workHours = shallowRef({
  start: new Time(9, 0, 0),
  end: new Time(17, 30, 0),
})

// With validation
const meetingTime = shallowRef(new Time(10, 0, 0))
const meetingError = ref('')

function validateMeeting() {
  const h = meetingTime.value.hour
  meetingError.value = h < 8 || h >= 20 ? 'Please select a time between 08:00 and 20:00' : ''
}

definePageMeta({
  layout:'navbar'
})
</script>

<template>
  <div class="p-8 space-y-10">

    <!-- 1. Basic single time -->
    <section>
      <h3 class="text-sm font-semibold text-[--c-muted] uppercase tracking-wider mb-4">Single</h3>
      <RTimeInput
        v-model="appointmentTime"
        label="Appointment Time"
        hint="Pick a time for your appointment"
      />
    </section>

    <!-- 2. Range mode -->
    <section>
      <h3 class="text-sm font-semibold text-[--c-muted] uppercase tracking-wider mb-4">Range</h3>
      <RTimeInput
        v-model="workHours"
        range
        label="Working Hours"
        start-label="Opens"
        end-label="Closes"
      />
    </section>

    <!-- 3. Sizes -->
    <section>
      <h3 class="text-sm font-semibold text-[--c-muted] uppercase tracking-wider mb-4">Sizes</h3>
      <div class="space-y-3">
        <RTimeInput v-model="appointmentTime" size="xs" label="Extra Small" />
        <RTimeInput v-model="appointmentTime" size="sm" label="Small" />
        <RTimeInput v-model="appointmentTime" size="md" label="Medium (default)" />
        <RTimeInput v-model="appointmentTime" size="lg" label="Large" />
        <RTimeInput v-model="appointmentTime" size="xl" label="Extra Large" />
      </div>
    </section>

    <!-- 4. With error -->
    <section>
      <h3 class="text-sm font-semibold text-[--c-muted] uppercase tracking-wider mb-4">Validation</h3>
      <RTimeInput
        v-model="meetingTime"
        label="Meeting Time"
        required
        :error="meetingError"
        hint="Business hours only (08:00–20:00)"
        @blur="validateMeeting"
      />
    </section>

    <!-- 5. Disabled -->
    <section>
      <h3 class="text-sm font-semibold text-[--c-muted] uppercase tracking-wider mb-4">Disabled</h3>
      <RTimeInput
        v-model="appointmentTime"
        label="Read-only Slot"
        disabled
        hint="This time has been locked"
      />
    </section>

    <!-- 6. Custom ui prop passthrough -->
    <section>
      <h3 class="text-sm font-semibold text-[--c-muted] uppercase tracking-wider mb-4">Custom UI override</h3>
      <RTimeInput
        v-model="appointmentTime"
        label="Custom styled"
        :ui="{ base: 'r-time-input__field rounded-full' }"
      />
    </section>

  </div>
</template>
