<!-- components/event-forms/BirthdayForm.vue -->
<!-- Event Type: Birthday (ខួបកំណើត) -->
<template>
  <div class="ef ef--birthday">

    <div class="ef-banner ef-banner--birthday">
      <div class="ef-banner-bg" />
      <div class="ef-banner-content">
        <img src="/images/events/birthday.png" class="ef-banner-icon" alt="" />
        <div>
          <h3 class="ef-banner-title">{{ tBy({ en: 'Birthday Celebration', km: 'ខួបកំណើត' }) }}</h3>
          <p class="ef-banner-sub">{{ tBy({ en: 'Plan an unforgettable birthday party', km: 'រៀបចំពិធីខួបកំណើតដ៏ស្រស់ស្អាត' }) }}</p>
        </div>
      </div>
    </div>

    <RForm ref="formRef" class="ef-form" :state="form" @onSubmit="$emit('submit', form)">

      <div class="ef-section-title"><i class="ri-cake-3-line" />{{ tBy({ en: 'Birthday Person', km: 'អ្នកខួបកំណើត' }) }}</div>

      <!-- Birthday person -->
      <div class="birthday-person-card">
        <div class="birthday-person-avatar">🎂</div>
        <div class="birthday-person-fields">
          <div class="form-row-3">
            <RFormGroup :label="tBy({ en: 'Full Name', km: 'ឈ្មោះពេញ' })" name="honorName" required class="col-span-1">
              <RInput v-model="form.host1Name" leadingIcon="ri-user-smile-line"
                :placeholder="tBy({ en: 'Birthday person\'s name', km: 'ឈ្មោះអ្នកខួបកំណើត' })" />
            </RFormGroup>
            <RFormGroup :label="tBy({ en: 'Age (Turning)', km: 'អាយុ (ឆ្នាំ)' })" name="age">
              <RInput v-model.number="form.age" type="number" leadingIcon="ri-time-line" placeholder="1" min="1" />
            </RFormGroup>
            <RFormGroup :label="tBy({ en: 'Gender', km: 'ភេទ' })" name="gender">
              <RSelect v-model="form.gender" :localData="{ data: genderOptions }" />
            </RFormGroup>
          </div>
          <div class="form-row-2">
            <RFormGroup :label="tBy({ en: 'Phone / Contact', km: 'ទូរស័ព្ទ / ទំនាក់ទំនង' })" name="contactPhone">
              <RInput v-model="form.contactPhone" type="tel" leadingIcon="ri-phone-line" />
            </RFormGroup>
            <RFormGroup :label="tBy({ en: 'Organizer / Host', km: 'អ្នករៀបចំ' })" name="organizer">
              <RInput v-model="form.organizer" leadingIcon="ri-user-star-line"
                :placeholder="tBy({ en: 'Parent, spouse, friend…', km: 'ឪពុកម្ដាយ, ដៃគូ, មិត្ត…' })" />
            </RFormGroup>
          </div>
        </div>
      </div>

      <div class="ef-section-title"><i class="ri-calendar-event-line" />{{ tBy({ en: 'Party Details', km: 'ព័ត៌មានពិធី' }) }}</div>

      <div class="form-row-2">
        <RFormGroup :label="tBy({ en: 'Birthday Date', km: 'ថ្ងៃខួបកំណើត' })" name="eventDate" required>
          <RDateInputPicker v-model="form.eventDate" />
        </RFormGroup>
        <RFormGroup :label="tBy({ en: 'Party Time', km: 'ម៉ោងពិធី' })" name="eventTime">
          <RTimeInputPicker v-model="form.eventTime" />
        </RFormGroup>
      </div>

      <div class="form-row-2">
        <RFormGroup :label="tBy({ en: 'Venue', km: 'ទីកន្លែង' })" name="venue">
          <RInput v-model="form.venue" leadingIcon="ri-map-pin-line"
            :placeholder="tBy({ en: 'Restaurant, hall, home…', km: 'ភោជនីយដ្ឋាន, សាល, ផ្ទះ…' })" />
        </RFormGroup>
        <RFormGroup :label="tBy({ en: 'Budget ($)', km: 'ថវិកា ($)' })" name="budget">
          <RInput v-model.number="form.budget" type="number" leadingIcon="ri-money-dollar-circle-line" placeholder="0" />
        </RFormGroup>
      </div>

      <!-- Party config -->
      <div class="party-config-row">
        <RFormGroup :label="tBy({ en: 'Theme', km: 'ប្រធានបទ' })" name="theme">
          <RInput v-model="form.theme" leadingIcon="ri-magic-line"
            :placeholder="tBy({ en: 'Superhero, Princess, Unicorn…', km: 'ស្ដេចជ័យ, នាងរាជ, យូនីកូន…' })" />
        </RFormGroup>
        <RFormGroup :label="tBy({ en: 'Cake Flavour', km: 'ម្សៅនំ' })" name="cakeFlavour">
          <RInput v-model="form.cakeFlavour" leadingIcon="ri-cake-2-line"
            :placeholder="tBy({ en: 'Chocolate, Vanilla, Strawberry…', km: 'ស្ករគ្រាប់, វ៉ានីឡា, ស្ត្របៃ…' })" />
        </RFormGroup>
        <RFormGroup :label="tBy({ en: 'Expected Guests', km: 'ចំនួនភ្ញៀវ' })" name="guestCount">
          <RInput v-model.number="form.guestCount" type="number" leadingIcon="ri-group-line" placeholder="0" />
        </RFormGroup>
      </div>

      <!-- Fun toggles -->
      <div class="ef-toggles-row">
        <div class="ef-toggle-item">
          <RSwitch v-model="form.hasPhotography" />
          <span>{{ tBy({ en: 'Photography', km: 'ថតរូប' }) }}</span>
        </div>
        <div class="ef-toggle-item">
          <RSwitch v-model="form.hasVideography" />
          <span>{{ tBy({ en: 'Videography', km: 'ថតវីដេអូ' }) }}</span>
        </div>
        <div class="ef-toggle-item">
          <RSwitch v-model="form.hasEntertainment" />
          <span>{{ tBy({ en: 'Entertainment', km: 'ការកម្សាន្ត' }) }}</span>
        </div>
        <div class="ef-toggle-item">
          <RSwitch v-model="form.hasCatering" />
          <span>{{ tBy({ en: 'Catering', km: 'ម្ហូបអាហារ' }) }}</span>
        </div>
      </div>

      <RFormGroup :label="tBy({ en: 'Special Wishes / Notes', km: 'សំណូមពរពិសេស' })" name="notes">
        <RTextarea v-model="form.notes" :rows="2"
          :placeholder="tBy({ en: 'Surprise party? Special requirements?', km: 'ពិធីភ្ញាក់ផ្អើល? តម្រូវការពិសេស?' })" />
      </RFormGroup>
    </RForm>
  </div>
</template>

<script setup>
defineEmits(['submit'])
const formRef = ref(null)
const { form } = useEventsPage()

const form1 = reactive({
  host1Name: '', age: null, gender: '', contactPhone: '', organizer: '',
  eventDate: null, eventTime: null, venue: '', budget: 0,
  theme: '', cakeFlavour: '', guestCount: 0,
  hasPhotography: false, hasVideography: false, hasEntertainment: false, hasCatering: true,
  notes: '',
})

const genderOptions = [
  { id: 1, Name:'ប្រុស', NameEnglish:'Male'},
  { id: 2, Name:'ស្រី', NameEnglish:'Female'},
  { id: 3, Name:'ផ្សេងទៀត', NameEnglish:'Other'},
]
const schema = {}
defineExpose({ form, formRef })
</script>

<style lang="scss" scoped>
.ef--birthday {
  .ef-banner--birthday { --banner-color: #f59e0b; --banner-bg: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); }

  .birthday-person-card {
    display: flex; gap: 16px; align-items: flex-start;
    background: linear-gradient(135deg, #fffbeb, #fef3c7);
    border: 1px solid rgba(245, 158, 11, 0.25);
    border-radius: var(--r-lg); padding: 16px;
    .birthday-person-avatar { font-size: 2.5rem; flex-shrink: 0; margin-top: 4px; }
    .birthday-person-fields { flex: 1; display: flex; flex-direction: column; gap: 12px; }
  }

  .party-config-row {
    display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 12px;
    @media (max-width: 600px) { grid-template-columns: 1fr 1fr; }
  }
}
</style>
