<!-- components/event-forms/FuneralForm.vue -->
<template>
  <div class="ef ef--funeral">
    <div class="ef-banner ef-banner--funeral">
      <div class="ef-banner-bg" />
      <div class="ef-banner-content">
        <img src="/images/events/funeral.svg" class="ef-banner-icon" alt="" />
        <div>
          <h3 class="ef-banner-title">{{ tBy({ en: 'Funeral Ceremony', km: 'បុណ្យសព' }) }}</h3>
          <p class="ef-banner-sub">{{ tBy({ en: 'Memorial & farewell arrangements', km: 'ការរៀបចំសំណាកនិងការអន្ទាបអន្ទែង' }) }}</p>
        </div>
      </div>
    </div>

    <RForm ref="formRef" class="ef-form" :state="form" @onSubmit="$emit('submit', form)">
      <div class="ef-section-title"><i class="ri-user-heart-line" />
        {{ tBy({ en: 'Deceased Information', km: 'ព័ត៌មានអ្នកស្លាប់' }) }}
      </div>

      <div class="funeral-person-card">
        <div class="form-row-3">
          <RFormGroup :label="tBy({ en: 'Full Name', km: 'ឈ្មោះពេញ' })" name="deceasedName" required class="col-span-1">
            <RInput v-model="form.deceasedName" leadingIcon="ri-user-line"
              :placeholder="tBy({ en: 'Name of the deceased', km: 'ឈ្មោះអ្នកស្លាប់' })" />
          </RFormGroup>
          <RFormGroup :label="tBy({ en: 'Age', km: 'អាយុ' })" name="deceasedAge">
            <RInput v-model.number="form.deceasedAge" type="number" leadingIcon="ri-time-line" placeholder="0" />
          </RFormGroup>
          <RFormGroup :label="tBy({ en: 'Gender', km: 'ភេទ' })" name="deceasedGender">
            <RSelect v-model="form.deceasedGender" :options="{ data: genderOptions, text: 'name', value: 'key'}" />
          </RFormGroup>
        </div>
        <div class="form-row-2">
          <RFormGroup :label="tBy({ en: 'Date of Passing', km: 'ថ្ងៃទទួលមរណភាព' })" name="dateOfPassing">
            <RDateInputPicker v-model="form.dateOfPassing" />
          </RFormGroup>
          <RFormGroup :label="tBy({ en: 'Place of Passing', km: 'ទីកន្លែងទទួលមរណភាព' })" name="placeOfPassing">
            <RInput v-model="form.placeOfPassing" leadingIcon="ri-map-pin-line"
              :placeholder="tBy({ en: 'Hospital, home, etc.', km: 'មន្ទីរពេទ្យ, ផ្ទះ, ។ល។' })" />
          </RFormGroup>
        </div>
      </div>

      <div class="ef-section-title"><i class="ri-group-line" />
        {{ tBy({ en: 'Family Contact', km: 'ទំនាក់ទំនងគ្រួសារ' }) }}
      </div>

      <div class="form-row-3">
        <RFormGroup :label="tBy({ en: 'Contact Person', km: 'អ្នកទំនាក់ទំនង' })" name="contactName" required>
          <RInput v-model="form.contactName" leadingIcon="ri-user-star-line" />
        </RFormGroup>
        <RFormGroup :label="tBy({ en: 'Relationship', km: 'ទំនាក់ទំនង' })" name="relationship">
          <RSelect v-model="form.relationship" :localData="{ data: relationshipOptions, text: 'name', value: 'key'}" />
        </RFormGroup>
        <RFormGroup :label="tBy({ en: 'Phone', km: 'ទូរស័ព្ទ' })" name="contactPhone">
          <RInput v-model="form.contactPhone" type="tel" leadingIcon="ri-phone-line" />
        </RFormGroup>
      </div>

      <div class="ef-section-title"><i class="ri-calendar-event-line" />
        {{ tBy({ en: 'Ceremony Details', km: 'ព័ត៌មានពិធីបុណ្យ' }) }}
      </div>

      <div class="form-row-2">
        <RFormGroup :label="tBy({ en: 'Program Name', km: 'ឈ្មោះកម្មវិធី' })" name="title" required>
          <RInput v-model="form.title" leadingIcon="ri-flag-line"
            :placeholder="tBy({ en: 'Funeral – Family name', km: 'បុណ្យសព – គ្រួសារ…' })" />
        </RFormGroup>
        <RFormGroup :label="tBy({ en: 'Ceremony Type', km: 'ប្រភេទពិធី' })" name="ceremonyType">
          <RSelect v-model="form.ceremonyType" :localData="{ data:ceremonyTypeOptions, text:'name', value:'key'}" />
        </RFormGroup>
      </div>

      <div class="form-row-2">
        <RFormGroup :label="tBy({ en: 'Ceremony Start Date', km: 'ថ្ងៃចាប់ផ្ដើម' })" name="eventDate" required>
          <RDateInputPicker v-model="form.eventDate" />
        </RFormGroup>
        <RFormGroup :label="tBy({ en: 'Ceremony End Date', km: 'ថ្ងៃបញ្ចប់' })" name="eventEndDate">
          <RDateInputPicker v-model="form.eventEndDate" />
        </RFormGroup>
      </div>

      <div class="form-row-3">
        <RFormGroup :label="tBy({ en: 'Venue / Temple', km: 'ទីកន្លែង / វត្ត' })" name="venue" required>
          <RInput v-model="form.venue" leadingIcon="ri-building-line"
            :placeholder="tBy({ en: 'Temple, funeral parlour…', km: 'វត្ត, ផ្ទះបុណ្យ…' })" />
        </RFormGroup>
        <RFormGroup :label="tBy({ en: 'Number of Monks', km: 'ចំនួនព្រះ' })" name="monkCount">
          <RInput v-model.number="form.monkCount" type="number" leadingIcon="ri-user-received-line" placeholder="9" />
        </RFormGroup>
        <RFormGroup :label="tBy({ en: 'Budget ($)', km: 'ថវិកា ($)' })" name="budget">
          <RInput v-model.number="form.budget" type="number" leadingIcon="ri-money-dollar-circle-line" placeholder="0" />
        </RFormGroup>
      </div>

      <div class="ef-toggles-row">
        <div class="ef-toggle-item">
          <RSwitch v-model="form.hasCremation" />
          <span>{{ tBy({ en: 'Cremation', km: 'ការដុតខ្មោច' }) }}</span>
        </div>
        <div class="ef-toggle-item">
          <RSwitch v-model="form.hasMonkChanting" />
          <span>{{ tBy({ en: 'Monk Chanting', km: 'ការស្វាត' }) }}</span>
        </div>
        <div class="ef-toggle-item">
          <RSwitch v-model="form.hasCatering" />
          <span>{{ tBy({ en: 'Catering', km: 'ម្ហូបអាហារ' }) }}</span>
        </div>
      </div>

      <RFormGroup :label="tBy({ en: 'Notes', km: 'កំណត់ចំណាំ' })" name="notes">
        <RTextarea v-model="form.notes" :rows="3" />
      </RFormGroup>
    </RForm>
  </div>
</template>

<script setup>
defineEmits(['submit'])
const formRef = ref(null)
const { form } = useEventsPage()

const form1 = reactive({
  deceasedName: '', deceasedAge: null, deceasedGender: '',
  dateOfPassing: null, placeOfPassing: '',
  contactName: '', relationship: '', contactPhone: '',
  title: '', ceremonyType: '', eventDate: null, eventEndDate: null,
  venue: '', monkCount: 9, budget: 0,
  hasCremation: true, hasMonkChanting: true, hasCatering: true, notes: '',
})
const genderOptions = [
  { id: 1, Name: 'ប្រុស', NameEnglish: 'Male' },
  { id: 2, Name: 'ស្រី', NameEnglish: 'Female' },
]
const relationshipOptions = [
  { id: 1, Name: 'ប្តី', NameEnglish: 'Husband' },
  { id: 2, Name: 'ប្រពន្ធ', NameEnglish: 'Wife' },
  { id: 3, Name: 'កូនប្រុស', NameEnglish: 'Son' },
  { id: 4, Name: 'កូនស្រី', NameEnglish: 'Daughter' },
  { id: 5, Name: 'បងប្អូន', NameEnglish: 'Sibling' },
  { id: 6, Name: 'ផ្សេង', NameEnglish: 'Other' },
]

const ceremonyTypeOptions = [
  { id: 1, Name: 'បុណ្យសព', NameEnglish: 'Funeral' },
  { id: 2, Name: 'បុណ្យខួប', NameEnglish: 'Memorial' },
  { id: 3, Name: 'បុណ្យ៧ថ្ងៃ', NameEnglish: '7-day ceremony' },
  { id: 4, Name: 'បុណ្យខួប១០០ថ្ងៃ', NameEnglish: '100-day ceremony' },
]
const schema = {}
defineExpose({ form, formRef })
</script>

<style lang="scss" scoped>
.ef--funeral {
  .ef-banner--funeral { --banner-color: #64748b; --banner-bg: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); }
  .funeral-person-card {
    background: rgba(100,116,139,0.06); border: 1px solid rgba(100,116,139,0.15);
    border-radius: var(--r-lg); padding: 16px;
    display: flex; flex-direction: column; gap: 12px;
  }
}
</style>
