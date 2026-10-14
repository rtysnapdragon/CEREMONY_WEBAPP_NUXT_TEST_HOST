<!-- components/event-forms/MonkCeremonyForm.vue -->
<template>
  <div class="ef ef--monk">
    <div class="ef-banner ef-banner--monk">
      <div class="ef-banner-bg" />
      <div class="ef-banner-content">
        <img src="/images/events/monk.svg" class="ef-banner-icon" alt="" />
        <div>
          <h3 class="ef-banner-title">{{ tBy({ en: 'Monk Ordination Ceremony', km: 'កិច្ចបួស' }) }}</h3>
          <p class="ef-banner-sub">{{ tBy({ en: 'Entering the monkhood – a sacred milestone', km: 'ការចូលព្រះ – ព្រឹត្តិការណ៍ដ៏ឧត្តម' }) }}</p>
        </div>
      </div>
    </div>

    <RForm ref="formRef" class="ef-form"  :state="form" @onSubmit="$emit('submit', form)">

      <div class="ef-section-title"><i class="ri-user-star-line" />
        {{ tBy({ en: 'Ordinand Information', km: 'ព័ត៌មានអ្នកបួស' }) }}
      </div>

      <div class="monk-person-card">
        <div class="monk-robe-icon">🧡</div>
        <div class="monk-fields">
          <div class="form-row-3">
            <RFormGroup :label="tBy({ en: 'Full Name', km: 'ឈ្មោះពេញ' })" name="ordinandName" required class="col-span-1">
              <RInput v-model="form.ordinandName" leadingIcon="ri-user-line"
                :placeholder="tBy({ en: 'Name of ordinand', km: 'ឈ្មោះអ្នកបួស' })" />
            </RFormGroup>
            <RFormGroup :label="tBy({ en: 'Age', km: 'អាយុ' })" name="ordinandAge">
              <RInput v-model.number="form.ordinandAge" type="number" leadingIcon="ri-time-line" placeholder="20" />
            </RFormGroup>
            <RFormGroup :label="tBy({ en: 'Monk Name (if known)', km: 'ឈ្មោះព្រះ (ប្រសិនបើដឹង)' })" name="monkName">
              <RInput v-model="form.monkName" leadingIcon="ri-service-line"
                :placeholder="tBy({ en: 'Dhamma name', km: 'ឈ្មោះធម្ម' })" />
            </RFormGroup>
          </div>
          <div class="form-row-2">
            <RFormGroup :label="tBy({ en: 'Father Name', km: 'ឈ្មោះឪពុក' })" name="fatherName">
              <RInput v-model="form.fatherName" leadingIcon="ri-user-line" />
            </RFormGroup>
            <RFormGroup :label="tBy({ en: 'Mother Name', km: 'ឈ្មោះម្ដាយ' })" name="motherName">
              <RInput v-model="form.motherName" leadingIcon="ri-user-line" />
            </RFormGroup>
          </div>
          <RFormGroup :label="tBy({ en: 'Contact Phone', km: 'ទូរស័ព្ទ' })" name="contactPhone">
            <RInput v-model="form.contactPhone" type="tel" leadingIcon="ri-phone-line" />
          </RFormGroup>
        </div>
      </div>

      <div class="ef-section-title"><i class="ri-building-line" />
        {{ tBy({ en: 'Temple & Ceremony', km: 'វត្ត និងពិធី' }) }}
      </div>

      <div class="form-row-2">
        <RFormGroup :label="tBy({ en: 'Program Name', km: 'ឈ្មោះកម្មវិធី' })" name="title" required>
          <RInput v-model="form.title" leadingIcon="ri-flag-line"
            :placeholder="tBy({ en: 'Monk Ordination – Name', km: 'ពិធីបួស – ឈ្មោះ' })" />
        </RFormGroup>
        <RFormGroup :label="tBy({ en: 'Temple Name', km: 'ឈ្មោះវត្ត' })" name="temple" required>
          <RInput v-model="form.temple" leadingIcon="ri-building-line"
            :placeholder="tBy({ en: 'Wat Phnom, Wat Langka…', km: 'វត្តភ្នំ, វត្តឡង្គា…' })" />
        </RFormGroup>
      </div>

      <div class="form-row-2">
        <RFormGroup :label="tBy({ en: 'Pre-ceremony Date (Preparations)', km: 'ថ្ងៃត្រៀម' })" name="prepDate">
          <RDateInputPicker v-model="form.prepDate" />
        </RFormGroup>
        <RFormGroup :label="tBy({ en: 'Ordination Date', km: 'ថ្ងៃបួស' })" name="eventDate" required>
          <RDateInputPicker v-model="form.eventDate" />
        </RFormGroup>
      </div>

      <div class="form-row-3">
        <RFormGroup :label="tBy({ en: 'Ceremony Start Time', km: 'ម៉ោងចាប់ផ្ដើម' })" name="eventTime">
          <RTimeInputPicker v-model="form.eventTime" />
        </RFormGroup>
        <RFormGroup :label="tBy({ en: 'Ordination Duration (days)', km: 'រយៈពេលបួស (ថ្ងៃ)' })" name="duration">
          <RInput v-model.number="form.duration" type="number" leadingIcon="ri-calendar-line" placeholder="7" />
        </RFormGroup>
        <RFormGroup :label="tBy({ en: 'Expected Guests', km: 'ចំនួនភ្ញៀវ' })" name="guestCount">
          <RInput v-model.number="form.guestCount" type="number" leadingIcon="ri-group-line" placeholder="0" />
        </RFormGroup>
      </div>

      <div class="form-row-2">
        <RFormGroup :label="tBy({ en: 'Head Monk / Preceptor', km: 'ព្រះតេរ / គ្រូបែងខ្លួន' })" name="headMonk">
          <RInput v-model="form.headMonk" leadingIcon="ri-user-star-line" />
        </RFormGroup>
        <RFormGroup :label="tBy({ en: 'Budget ($)', km: 'ថវិកា ($)' })" name="budget">
          <RInput v-model.number="form.budget" type="number" leadingIcon="ri-money-dollar-circle-line" placeholder="0" />
        </RFormGroup>
      </div>

      <div class="ef-toggles-row">
        <div class="ef-toggle-item">
          <RSwitch v-model="form.hasRobeOffering" />
          <span>{{ tBy({ en: 'Robe Offering', km: 'ការថ្វាយសំពត់ចីវរ' }) }}</span>
        </div>
        <div class="ef-toggle-item">
          <RSwitch v-model="form.hasCatering" />
          <span>{{ tBy({ en: 'Catering', km: 'ម្ហូបអាហារ' }) }}</span>
        </div>
        <div class="ef-toggle-item">
          <RSwitch v-model="form.hasPhotography" />
          <span>{{ tBy({ en: 'Photography', km: 'ថតរូប' }) }}</span>
        </div>
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
  ordinandName: '', ordinandAge: null, monkName: '',
  fatherName: '', motherName: '', contactPhone: '',
  title: '', temple: '', prepDate: null, eventDate: null,
  eventTime: null, duration: 7, guestCount: 0, headMonk: '', budget: 0,
  hasRobeOffering: true, hasCatering: true, hasPhotography: false, notes: '',
})
const schema = {}
defineExpose({ form, formRef })
</script>

<style lang="scss" scoped>
.ef--monk {
  .ef-banner--monk { --banner-color: #f97316; --banner-bg: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%); }
  .monk-person-card {
    display: flex; gap: 16px; align-items: flex-start;
    background: linear-gradient(135deg, #fff7ed, #ffedd5);
    border: 1px solid rgba(249,115,22,0.2); border-radius: var(--r-lg); padding: 16px;
    .monk-robe-icon { font-size: 2.8rem; flex-shrink: 0; margin-top: 4px; }
    .monk-fields { flex: 1; display: flex; flex-direction: column; gap: 12px; }
  }
}
</style>
