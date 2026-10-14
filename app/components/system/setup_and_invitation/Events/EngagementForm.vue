<!-- components/event-forms/EngagementForm.vue -->
<!-- Event Type: Diamond Ring / Engagement (ពិធីស្ករគ្រីស្ទ/ព្រាប់ចិត្ត) -->
<template>
  <div class="ef ef--engagement">

    <div class="ef-banner ef-banner--engagement">
      <div class="ef-banner-bg" />
      <div class="ef-banner-content">
        <img src="/images/events/engagement.svg" class="ef-banner-icon" alt="" />
        <div>
          <h3 class="ef-banner-title">{{ tBy({ en: 'Engagement Ceremony', km: 'ពិធីស្ករគ្រីស្ទ' }) }}</h3>
          <p class="ef-banner-sub">{{ tBy({ en: 'Ring exchange & pre-wedding details', km: 'ព័ត៌មានផ្ដល់ចិត្ត និងក្ដីស្រលាញ់' }) }}</p>
        </div>
      </div>
    </div>

    <RForm ref="formRef" class="ef-form"  :state="form" @onSubmit="$emit('submit', form)">

      <div class="ef-section-title"><i class="ri-information-line" />{{ tBy({ en: 'Event Info', km: 'ព័ត៌មានព្រឹត្តិការណ៍' }) }}</div>

      <div class="form-row-3">
        <RFormGroup :label="tBy({ en: 'Program Name', km: 'ឈ្មោះកម្មវិធី' })" name="title" required class="col-span-1">
          <RInput v-model="form.title"
            :placeholder="tBy({ en: 'Engagement Ceremony', km: 'ពិធីស្ករគ្រីស្ទ' })"
            leadingIcon="ri-service-line" />
        </RFormGroup>
        <RFormGroup :label="tBy({ en: 'Groom Code', km: 'កូដក្លោក' })" name="groomCode" required>
          <RInput v-model="form.groomCode" leadingIcon="ri-hashtag" placeholder="G-001" />
        </RFormGroup>
        <RFormGroup :label="tBy({ en: 'Bride Code', km: 'កូដក្រមុំ' })" name="brideCode" required>
          <RInput v-model="form.brideCode" leadingIcon="ri-hashtag" placeholder="B-001" />
        </RFormGroup>
      </div>

      <!-- Couple panels — slim version for engagement -->
      <div class="couple-panels">
        <div class="side-panel side-panel--groom">
          <div class="side-panel-head">
            <span class="side-avatar side-avatar--groom">🤵</span>
            <div>
              <div class="side-panel-label">{{ tBy({ en: 'Groom Side', km: 'នាមក្លោក' }) }}</div>
            </div>
          </div>
          <div class="side-panel-body">
            <div class="form-row-2">
              <RFormGroup :label="tBy({ en: 'First Name', km: 'ឈ្មោះ' })" name="groomFirstName" required>
                <RInput v-model="form.groomFirstName" />
              </RFormGroup>
              <RFormGroup :label="tBy({ en: 'Last Name', km: 'នាម' })" name="groomLastName" required>
                <RInput v-model="form.groomLastName" />
              </RFormGroup>
            </div>
            <RFormGroup :label="tBy({ en: 'Phone', km: 'ទូរស័ព្ទ' })" name="groomPhone">
              <RInput v-model="form.groomPhone" type="tel" leadingIcon="ri-phone-line" />
            </RFormGroup>
          </div>
        </div>

        <div class="couple-divider">
          <div class="couple-divider-line" />
          <span class="couple-divider-icon">💎</span>
          <div class="couple-divider-line" />
        </div>

        <div class="side-panel side-panel--bride">
          <div class="side-panel-head">
            <span class="side-avatar side-avatar--bride">👰</span>
            <div>
              <div class="side-panel-label">{{ tBy({ en: 'Bride Side', km: 'នាមក្រមុំ' }) }}</div>
            </div>
          </div>
          <div class="side-panel-body">
            <div class="form-row-2">
              <RFormGroup :label="tBy({ en: 'First Name', km: 'ឈ្មោះ' })" name="brideFirstName" required>
                <RInput v-model="form.brideFirstName" />
              </RFormGroup>
              <RFormGroup :label="tBy({ en: 'Last Name', km: 'នាម' })" name="brideLastName" required>
                <RInput v-model="form.brideLastName" />
              </RFormGroup>
            </div>
            <RFormGroup :label="tBy({ en: 'Phone', km: 'ទូរស័ព្ទ' })" name="bridePhone">
              <RInput v-model="form.bridePhone" type="tel" leadingIcon="ri-phone-line" />
            </RFormGroup>
          </div>
        </div>
      </div>

      <div class="ef-section-title"><i class="ri-calendar-event-line" />{{ tBy({ en: 'Ceremony Details', km: 'ព័ត៌មានពិធី' }) }}</div>

      <div class="form-row-2">
        <RFormGroup :label="tBy({ en: 'Engagement Date', km: 'ថ្ងៃពិធីស្ករគ្រីស្ទ' })" name="eventDate" required>
          <RDateInputPicker v-model="form.eventDate" />
        </RFormGroup>
        <RFormGroup :label="tBy({ en: 'Start Time', km: 'ម៉ោងចាប់ផ្ដើម' })" name="eventTime">
          <RTimeInputPicker v-model="form.eventTime" />
        </RFormGroup>
      </div>

      <div class="form-row-3">
        <RFormGroup :label="tBy({ en: 'Venue', km: 'ទីកន្លែង' })" name="venue">
          <RInput v-model="form.venue" leadingIcon="ri-building-4-line" />
        </RFormGroup>
        <RFormGroup :label="tBy({ en: 'Budget ($)', km: 'ថវិកា ($)' })" name="budget">
          <RInput v-model.number="form.budget" type="number" leadingIcon="ri-money-dollar-circle-line" placeholder="0" />
        </RFormGroup>
        <RFormGroup :label="tBy({ en: 'Ring Exchange?', km: 'ប្ដូរចិញ្ចៀន?' })" name="ringExchange">
          <RSwitch v-model="form.ringExchange" />
        </RFormGroup>
      </div>

      <div class="form-row-2">
        <RFormGroup :label="tBy({ en: 'Planned Wedding Date', km: 'ថ្ងៃពិធីមង្គលការដែលគ្រោង' })" name="plannedWeddingDate">
          <RDateInputPicker v-model="form.plannedWeddingDate" />
        </RFormGroup>
        <RFormGroup :label="tBy({ en: 'Expected Guests', km: 'ចំនួនភ្ញៀវប្រហែល' })" name="guestCount">
          <RInput v-model.number="form.guestCount" type="number" leadingIcon="ri-group-line" placeholder="0" />
        </RFormGroup>
      </div>

      <RFormGroup :label="tBy({ en: 'Notes', km: 'កំណត់ចំណាំ' })" name="notes">
        <RTextarea v-model="form.notes" type="textarea" :rows="2" />
      </RFormGroup>

    </RForm>
  </div>
</template>

<script setup>
defineEmits(['submit'])
const formRef = ref(null)
const { form } = useEventsPage()

const form1 = reactive({
  title: '', groomCode: '', brideCode: '',
  groomFirstName: '', groomLastName: '', groomPhone: '',
  brideFirstName: '', brideLastName: '', bridePhone: '',
  eventDate: null, eventTime: null, venue: '', budget: 0,
  ringExchange: true, plannedWeddingDate: null, guestCount: 0, notes: '',
})
const schema = {}
defineExpose({ form, formRef })
</script>

<style lang="scss" scoped>
.ef--engagement {
  .ef-banner--engagement { --banner-color: #6366f1; --banner-bg: linear-gradient(135deg, #f0f0ff 0%, #e8e8ff 100%); }
  .side-panel--groom { border-top: 3px solid var(--c-info); }
  .side-panel--bride { border-top: 3px solid #a855f7; }
}
</style>
