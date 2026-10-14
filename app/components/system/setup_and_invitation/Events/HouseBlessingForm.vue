<!-- components/event-forms/HouseBlessingForm.vue -->
<!-- Event Type: House Blessing (ពិធីឡើងផ្ទះ) -->
<template>
  <div class="ef ef--house">

    <div class="ef-banner ef-banner--house">
      <div class="ef-banner-bg" />
      <div class="ef-banner-content">
        <img src="/images/events/house.svg" class="ef-banner-icon" alt="" />
        <div>
          <h3 class="ef-banner-title">{{ tBy({ en: 'House Blessing Ceremony', km: 'ពិធីឡើងផ្ទះ' }) }}</h3>
          <p class="ef-banner-sub">{{ tBy({ en: 'New home, new beginnings', km: 'ផ្ទះថ្មី ជីវិតថ្មី' }) }}</p>
        </div>
      </div>
    </div>

    <RForm ref="formRef" class="ef-form" :state="form" @onSubmit="$emit('submit', form)">

      <div class="ef-section-title"><i class="ri-home-heart-line" />{{ tBy({ en: 'Homeowner Info', km: 'ព័ត៌មានម្ចាស់ផ្ទះ' }) }}</div>

      <div class="form-row-2">
        <RFormGroup :label="tBy({ en: 'Program Name', km: 'ឈ្មោះកម្មវិធី' })" name="title" required>
          <RInput v-model="form.title" leadingIcon="ri-home-4-line"
            :placeholder="tBy({ en: 'House Blessing – Family Name', km: 'ពិធីឡើងផ្ទះ – គ្រួសារ…' })" />
        </RFormGroup>
        <RFormGroup :label="tBy({ en: 'Host Code', km: 'កូដម្ចាស់ផ្ទះ' })" name="hostCode">
          <RInput v-model="form.hostCode" leadingIcon="ri-hashtag" placeholder="H-001" />
        </RFormGroup>
      </div>

      <!-- Owner family box -->
      <div class="house-owner-box">
        <div class="house-owner-header">
          <i class="ri-user-3-line" />
          {{ tBy({ en: 'Family / Owner', km: 'គ្រួសារ / ម្ចាស់ផ្ទះ' }) }}
        </div>
        <div class="form-row-3">
          <RFormGroup :label="tBy({ en: 'Owner Name', km: 'ឈ្មោះម្ចាស់ផ្ទះ' })" name="ownerName" required>
            <RInput v-model="form.ownerName" leadingIcon="ri-user-line" />
          </RFormGroup>
          <RFormGroup :label="tBy({ en: 'Spouse Name', km: 'ឈ្មោះប្ដី/ប្រពន្ធ' })" name="spouseName">
            <RInput v-model="form.spouseName" leadingIcon="ri-user-line" />
          </RFormGroup>
          <RFormGroup :label="tBy({ en: 'Phone', km: 'ទូរស័ព្ទ' })" name="ownerPhone">
            <RInput v-model="form.ownerPhone" type="tel" leadingIcon="ri-phone-line" />
          </RFormGroup>
        </div>
      </div>

      <div class="ef-section-title"><i class="ri-building-line" />{{ tBy({ en: 'Property Details', km: 'ព័ត៌មានអចលនទ្រព្យ' }) }}</div>

      <RFormGroup :label="tBy({ en: 'New House Address', km: 'អាសយដ្ឋានផ្ទះថ្មី' })" name="houseAddress" required>
        <RInput v-model="form.houseAddress" leadingIcon="ri-map-pin-2-line"
          :placeholder="tBy({ en: 'Street, Village, District, Province', km: 'ផ្លូវ, ភូមិ, ខណ្ឌ, ខេត្ត' })" />
      </RFormGroup>

      <div class="form-row-3">
        <RFormGroup :label="tBy({ en: 'Property Type', km: 'ប្រភេទអចលនទ្រព្យ' })" name="propertyType">
          <RSelect v-model="form.propertyType" :options="propertyTypeOptions" />
        </RFormGroup>
        <RFormGroup :label="tBy({ en: 'Number of Floors', km: 'ចំនួនជាន់' })" name="floors">
          <RInput v-model.number="form.floors" type="number" leadingIcon="ri-stack-line" placeholder="1" min="1" />
        </RFormGroup>
        <RFormGroup :label="tBy({ en: 'House Area (m²)', km: 'ផ្ទៃដី (ម²)' })" name="area">
          <RInput v-model.number="form.area" type="number" leadingIcon="ri-ruler-line" placeholder="0" />
        </RFormGroup>
      </div>

      <div class="ef-section-title"><i class="ri-calendar-event-line" />{{ tBy({ en: 'Ceremony Details', km: 'ព័ត៌មានពិធី' }) }}</div>

      <div class="form-row-2">
        <RFormGroup :label="tBy({ en: 'Ceremony Date', km: 'ថ្ងៃប្រារព្ធ' })" name="eventDate" required>
          <RDateInputPicker v-model="form.eventDate" />
        </RFormGroup>
        <RFormGroup :label="tBy({ en: 'Start Time', km: 'ម៉ោងចាប់ផ្ដើម' })" name="eventTime">
          <RTimeInputPicker v-model="form.eventTime" />
        </RFormGroup>
      </div>

      <div class="form-row-2">
        <RFormGroup :label="tBy({ en: 'Number of Monks', km: 'ចំនួនព្រះ' })" name="monkCount">
          <RInput v-model.number="form.monkCount" type="number" leadingIcon="ri-user-received-line" placeholder="9" />
        </RFormGroup>
        <RFormGroup :label="tBy({ en: 'Expected Guests', km: 'ចំនួនភ្ញៀវ' })" name="guestCount">
          <RInput v-model.number="form.guestCount" type="number" leadingIcon="ri-group-line" placeholder="0" />
        </RFormGroup>
      </div>

      <div class="form-row-2">
        <RFormGroup :label="tBy({ en: 'Budget ($)', km: 'ថវិកា ($)' })" name="budget">
          <RInput v-model.number="form.budget" type="number" leadingIcon="ri-money-dollar-circle-line" placeholder="0" />
        </RFormGroup>
        <RFormGroup :label="tBy({ en: 'Catering', km: 'ម្ហូបអាហារ' })" name="cateringNote">
          <RInput v-model="form.cateringNote"
            :placeholder="tBy({ en: 'In-house / restaurant / catered', km: 'ផ្ទះ / ភោជនីយដ្ឋាន / កាតេរីង' })" />
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

const form = reactive({
  title: '', hostCode: '', ownerName: '', spouseName: '', ownerPhone: '',
  houseAddress: '', propertyType: '', floors: 1, area: 0,
  eventDate: null, eventTime: null, monkCount: 9,
  guestCount: 0, budget: 0, cateringNote: '', notes: '',
})

const propertyTypeOptions = [
  { label: tBy({ en: 'House', km: 'ផ្ទះ' }), value: 'house' },
  { label: tBy({ en: 'Villa', km: 'វីឡា' }), value: 'villa' },
  { label: tBy({ en: 'Apartment', km: 'អាផាតម៉ិន' }), value: 'apartment' },
  { label: tBy({ en: 'Condominium', km: 'ខុនដូ' }), value: 'condo' },
  { label: tBy({ en: 'Office', km: 'ការិយាល័យ' }), value: 'office' },
]
const schema = {}
defineExpose({ form, formRef })
</script>

<style lang="scss" scoped>
.ef--house {
  .ef-banner--house { --banner-color: #22c55e; --banner-bg: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); }

  .house-owner-box {
    background: rgba(34, 197, 94, 0.05); border: 1px solid rgba(34, 197, 94, 0.2);
    border-radius: var(--r-lg); padding: 16px;
    .house-owner-header {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.78rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.06em; color: var(--c-text); margin-bottom: 12px;
      i { color: #22c55e; }
    }
  }
}
</style>
