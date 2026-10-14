<!-- components/event-forms/WeddingForm.vue -->
<!-- Event Type: Wedding / Anniversary (ពិធីមង្គលការ / អាពាហ៍ពិពាហ៍) -->
<template>
  <div class="ef ef--wedding">

    <!-- ── Hero banner ── -->
    <div class="ef-banner ef-banner--wedding">
      <div class="ef-banner-bg" />
      <div class="ef-banner-content">
        <img src="/images/events/wedding.svg" class="ef-banner-icon" alt="" />
        <div>
          <h3 class="ef-banner-title">{{ tBy({ en: 'Wedding Ceremony', km: 'ពិធីមង្គលការ' }) }}</h3>
          <p class="ef-banner-sub">{{ tBy({ en: 'Complete the couple & ceremony details', km: 'បំពេញព័ត៌មានគូស្នេហ៍ និងពិធី' }) }}</p>
        </div>
      </div>
    </div>

    <RForm ref="formRef" class="ef-form" :state="form" @onSubmit="$emit('submit', form)">
      <!-- ── Event header row ── -->
      <div class="ef-section-title">
        <i class="ri-information-line" />
        {{ tBy({ en: 'Event Info', km: 'ព័ត៌មានព្រឹត្តិការណ៍' }) }}
      </div>

      <div class="form-row-3">
        <RFormGroup :label="tBy({ en: 'Program Name', km: 'ឈ្មោះកម្មវិធី' })" name="title" required class="col-span-1">
          <RInput v-model="form.title"
            :placeholder="tBy({ en: 'Wedding Ceremony / Anniversary', km: 'ពិធីមង្គលការ / អាពាហ៍ពិពាហ៍' })"
            leadingIcon="ri-heart-line" />
        </RFormGroup>
        <RFormGroup :label="tBy({ en: 'Groom Code', km: 'កូដក្លោក' })" name="groomCode" required>
          <RInput v-model="form.groomCode" leadingIcon="ri-hashtag" placeholder="G-001" />
        </RFormGroup>
        <RFormGroup :label="tBy({ en: 'Bride Code', km: 'កូដក្រមុំ' })" name="brideCode" required>
          <RInput v-model="form.brideCode" leadingIcon="ri-hashtag" placeholder="B-001" />
        </RFormGroup>
      </div>

      <!-- ── Couple side panels ── -->
      <div class="couple-panels">
        <!-- Groom side -->
        <div class="side-panel side-panel--groom">
          <div class="side-panel-head">
            <span class="side-avatar side-avatar--groom">🤵</span>
            <div>
              <div class="side-panel-label">{{ tBy({ en: 'Groom Side', km: 'នាមក្លោក' }) }}</div>
              <div class="side-panel-sub">{{ tBy({ en: 'Groom family information', km: 'ព័ត៌មានគ្រួសារក្លោក' }) }}</div>
            </div>
          </div>
          <div class="side-panel-body">
            <div class="form-row-2">
              <RFormGroup :label="tBy({ en: 'First Name', km: 'ឈ្មោះទីពីរ' })" name="groomFirstName" required>
                <RInput v-model="form.groomFirstName" :placeholder="tBy({ en: 'First name', km: 'ឈ្មោះ' })" />
              </RFormGroup>
              <RFormGroup :label="tBy({ en: 'Last Name', km: 'ឈ្មោះអ្នក' })" name="groomLastName" required>
                <RInput v-model="form.groomLastName" :placeholder="tBy({ en: 'Last name', km: 'នាម' })" />
              </RFormGroup>
            </div>
            <RFormGroup :label="tBy({ en: 'Father name', km: 'ឈ្មោះឪពុក' })" name="groomFatherName">
              <RInput v-model="form.groomFatherName" leadingIcon="ri-user-line" :isLeft="true"/>
            </RFormGroup>
            <RFormGroup :label="tBy({ en: 'Mother name', km: 'ឈ្មោះម្តាយ' })" name="groomMotherName">
              <RInput v-model="form.groomMotherName" leadingIcon="ri-user-line" :isLeft="true"/>
            </RFormGroup>
            <RFormGroup :label="tBy({ en: 'Phone', km: 'ទូរស័ព្ទ' })" name="groomPhone">
              <RInput v-model="form.groomPhone" type="tel" leadingIcon="ri-phone-line" />
            </RFormGroup>
          </div>
        </div>

        <!-- Wedding ring divider -->
        <div class="couple-divider">
          <div class="couple-divider-line" />
          <span class="couple-divider-icon">💍</span>
          <div class="couple-divider-line" />
        </div>

        <!-- Bride side -->
        <div class="side-panel side-panel--bride">
          <div class="side-panel-head">
            <span class="side-avatar side-avatar--bride">👰</span>
            <div>
              <div class="side-panel-label">{{ tBy({ en: 'Bride Side', km: 'នាមក្រមុំ' }) }}</div>
              <div class="side-panel-sub">{{ tBy({ en: 'Bride family information', km: 'ព័ត៌មានគ្រួសារក្រមុំ' }) }}</div>
            </div>
          </div>
          <div class="side-panel-body">
            <div class="form-row-2">
              <RFormGroup :label="tBy({ en: 'First Name', km: 'ឈ្មោះទីពីរ' })" name="brideFirstName" required>
                <RInput v-model="form.brideFirstName" :placeholder="tBy({ en: 'First name', km: 'ឈ្មោះ' })" />
              </RFormGroup>
              <RFormGroup :label="tBy({ en: 'Last Name', km: 'ឈ្មោះអ្នក' })" name="brideLastName" required>
                <RInput v-model="form.brideLastName" :placeholder="tBy({ en: 'Last name', km: 'នាម' })" />
              </RFormGroup>
            </div>
            <RFormGroup :label="tBy({ en: 'Father name', km: 'ឈ្មោះឪពុក' })" name="brideFatherName">
              <RInput v-model="form.brideFatherName" leadingIcon="ri-user-line" />
            </RFormGroup>
            <RFormGroup :label="tBy({ en: 'Mother name', km: 'ឈ្មោះម្តាយ' })" name="brideMotherName">
              <RInput v-model="form.brideMotherName" leadingIcon="ri-user-line" />
            </RFormGroup>
            <RFormGroup :label="tBy({ en: 'Phone', km: 'ទូរស័ព្ទ' })" name="bridePhone">
              <RInput v-model="form.bridePhone" type="tel" leadingIcon="ri-phone-line" />
            </RFormGroup>
          </div>
        </div>
      </div>

      <!-- ── Event details ── -->
      <div class="ef-section-title">
        <i class="ri-calendar-event-line" />
        {{ tBy({ en: 'Ceremony Details', km: 'ព័ត៌មានពិធី' }) }}
      </div>
      <div class="form-row-2">
        <RFormGroup :label="tBy({ en: 'Wedding Date', km: 'ថ្ងៃពិធីមង្គលការ' })" name="eventDate" required>
          <RDateInputPicker v-model="form.eventDate" />
        </RFormGroup>
        <RFormGroup :label="tBy({ en: 'Start Time', km: 'ម៉ោងចាប់ផ្ដើម' })" name="eventTime">
          <RTimeInputPicker v-model="form.eventTime" />
        </RFormGroup>
      </div>

      <div class="form-row-2">
        <RFormGroup :label="tBy({ en: 'Venue', km: 'ទីកន្លែងប្រារព្ធ' })" name="venue">
          <RInput v-model="form.venue" leadingIcon="ri-building-4-line"
            :placeholder="tBy({ en: 'Hotel, Convention Center…', km: 'សណ្ឋាគារ, មជ្ឈមណ្ឌល…' })" />
        </RFormGroup>
        <RFormGroup :label="tBy({ en: 'Total Budget ($)', km: 'ថវិកាសរុប ($)' })" name="budget">
          <RInput v-model.number="form.budget" type="number" leadingIcon="ri-money-dollar-circle-line" placeholder="0" />
        </RFormGroup>
      </div>

      <div class="form-row-2">
        <RFormGroup :label="tBy({ en: 'Expected Guests', km: 'ចំនួនភ្ញៀវប្រហែល' })" name="guestCount">
          <RInput v-model.number="form.guestCount" type="number" leadingIcon="ri-group-line" placeholder="0" />
        </RFormGroup>
        <RFormGroup :label="tBy({ en: 'Dress Code', km: 'សម្លៀកបំពាក់' })" name="dressCode">
          <RSelect v-model="form.dressCode" :localData="{ data: dressCodeOptions, text: 'name', value: 'key'}" />
        </RFormGroup>
      </div>

      <RFormGroup :label="tBy({ en: 'Notes', km: 'កំណត់ចំណាំ' })" name="notes">
        <RTextarea v-model="form.notes" type="textarea" :rows="2"
          :placeholder="tBy({ en: 'Any special notes…', km: 'កំណត់ចំណាំពិសេស…' })" />
      </RFormGroup>
    </RForm>
  </div>
</template>

<script setup>
defineEmits(['submit'])
const formRef = ref(null)
const { form ,ceremonyForm} = useEventsPage()

const dressCodeOptions = [
  { id: 1, Name:'ការិយាល័យផ្លូវការ', NameEnglish:'Formal' },
  { id: 2, Name:'ខ្មែរប្រពៃណី', NameEnglish:'Traditional' },
  { id: 3, Name:'ខ្មែរប្រពៃណី (មាស)', NameEnglish:'Traditional Gold' },
  { id: 4, Name:'កំប៉ុង', NameEnglish:'Smart Casual' },
]

defineExpose({ form, formRef })
</script>

<style lang="scss" scoped>
.ef--wedding {
  .ef-banner--wedding { --banner-color: #e91e8c; --banner-bg: linear-gradient(135deg, #fff0f6 0%, #fce4ec 100%); }
  .side-panel--groom { border-top: 3px solid var(--c-info); }
  .side-panel--bride { border-top: 3px solid #e91e8c; }
  .side-panel-label { color: var(--c-text); font-weight: 700; font-size: 0.85rem; }
  .side-panel-sub   { color: var(--c-muted); font-size: 0.72rem; margin-top: 2px; }
}
</style>
