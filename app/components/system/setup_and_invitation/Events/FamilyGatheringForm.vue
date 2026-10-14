<!-- components/event-forms/FamilyGatheringForm.vue -->
<template>
  <div class="ef ef--family">
    <div class="ef-banner ef-banner--family">
      <div class="ef-banner-bg" />
      <div class="ef-banner-content">
        <img src="/images/events/family.svg" class="ef-banner-icon" alt="" />
        <div>
          <h3 class="ef-banner-title">{{ tBy({ en: 'Family Gathering', km: 'ជំនុំជម្រះគ្រួសារ' }) }}</h3>
          <p class="ef-banner-sub">{{ tBy({ en: 'Reunions, celebrations & family events', km: 'ការជួបជុំ, ខួបអនុស្សាវរីយ៍ & ព្រឹត្តិការណ៍គ្រួសារ' }) }}</p>
        </div>
      </div>
    </div>

    <RForm ref="formRef" class="ef-form" :state="form" @onSubmit="$emit('submit', form)">

      <div class="ef-section-title"><i class="ri-group-2-line" />
        {{ tBy({ en: 'Gathering Info', km: 'ព័ត៌មានការជួបជុំ' }) }}
      </div>

      <div class="form-row-2">
        <RFormGroup :label="tBy({ en: 'Program Name', km: 'ឈ្មោះកម្មវិធី' })" name="title" required class="col-span-1">
          <RInput v-model="form.title" leadingIcon="ri-community-line"
            :placeholder="tBy({ en: 'Annual Family Reunion 2025', km: 'ការជួបជុំប្រចាំឆ្នាំ ២០២៥' })" />
        </RFormGroup>
        <RFormGroup :label="tBy({ en: 'Family / Clan Name', km: 'ឈ្មោះគ្រួសារ / វង្ស' })" name="familyName">
          <RInput v-model="form.familyName" leadingIcon="ri-heart-3-line"
            :placeholder="tBy({ en: 'The Chan Family', km: 'គ្រួសារចាន់' })" />
        </RFormGroup>
      </div>

      <div class="form-row-3">
        <RFormGroup :label="tBy({ en: 'Organizer Name', km: 'ឈ្មោះអ្នករៀបចំ' })" name="organizerName" required>
          <RInput v-model="form.organizerName" leadingIcon="ri-user-star-line" />
        </RFormGroup>
        <RFormGroup :label="tBy({ en: 'Organizer Phone', km: 'ទូរស័ព្ទអ្នករៀបចំ' })" name="organizerPhone">
          <RInput v-model="form.organizerPhone" type="tel" leadingIcon="ri-phone-line" />
        </RFormGroup>
        <RFormGroup :label="tBy({ en: 'Gathering Type', km: 'ប្រភេទការជួបជុំ' })" name="gatheringType">
          <RSelect v-model="form.gatheringType" :localData="{data:gatheringTypeOptions}" />
        </RFormGroup>
      </div>

      <div class="ef-section-title"><i class="ri-calendar-event-line" />
        {{ tBy({ en: 'Event Details', km: 'ព័ត៌មានព្រឹត្តិការណ៍' }) }}
      </div>

      <div class="form-row-2">
        <RFormGroup :label="tBy({ en: 'Event Date', km: 'ថ្ងៃព្រឹត្តិការណ៍' })" name="eventDate" required>
          <RDateInputPicker v-model="form.eventDate" />
        </RFormGroup>
        <RFormGroup :label="tBy({ en: 'Event Time', km: 'ម៉ោងព្រឹត្តិការណ៍' })" name="eventTime">
          <RTimeInputPicker v-model="form.eventTime" />
        </RFormGroup>
      </div>

      <div class="form-row-2">
        <RFormGroup :label="tBy({ en: 'Venue', km: 'ទីកន្លែង' })" name="venue">
          <RInput v-model="form.venue" leadingIcon="ri-map-pin-line"
            :placeholder="tBy({ en: 'Pagoda, park, resort, home…', km: 'ព្រះវិហារ, សួន, រីស័រ, ផ្ទះ…' })" />
        </RFormGroup>
        <RFormGroup :label="tBy({ en: 'Expected Attendees', km: 'ចំនួនអ្នកចូលរួម' })" name="attendeeCount">
          <RInput v-model.number="form.attendeeCount" type="number" leadingIcon="ri-group-line" placeholder="0" />
        </RFormGroup>
      </div>

      <!-- Family branches table -->
      <div class="ef-section-title"><i class="ri-node-tree" />
        {{ tBy({ en: 'Family Branches / Sub-groups', km: 'សាខាគ្រួសារ / ក្រុម' }) }}
      </div>

      <div class="family-branches">
        <div v-for="(branch, idx) in form.branches" :key="idx" class="branch-row">
          <div class="branch-num">{{ idx + 1 }}</div>
          <RFormGroup :label="tBy({ en: 'Branch Name', km: 'ឈ្មោះសាខា' })" :name="`branch_name_${idx}`" class="branch-name">
            <RInput v-model="branch.name" :placeholder="tBy({ en: 'e.g. Uncle Sophea\'s family', km: 'ឧ. គ្រួសារឯកសុភា' })" />
          </RFormGroup>
          <RFormGroup :label="tBy({ en: 'Members', km: 'សមាជិក' })" :name="`branch_count_${idx}`" class="branch-count">
            <RInput v-model.number="branch.count" type="number" placeholder="0" />
          </RFormGroup>
          <button class="branch-remove" type="button" @click="removeBranch(idx)">
            <i class="ri-delete-bin-line" />
          </button>
        </div>

        <button class="add-branch-btn" type="button" @click="addBranch">
          <i class="ri-add-circle-line" />
          {{ tBy({ en: 'Add Branch', km: 'បន្ថែមសាខា' }) }}
        </button>
      </div>

      <div class="form-row-2">
        <RFormGroup :label="tBy({ en: 'Budget ($)', km: 'ថវិកា ($)' })" name="budget">
          <RInput v-model.number="form.budget" type="number" leadingIcon="ri-money-dollar-circle-line" placeholder="0" />
        </RFormGroup>
        <RFormGroup :label="tBy({ en: 'Theme / Dress Code', km: 'ប្រធានបទ / សម្លៀក' })" name="theme">
          <RInput v-model="form.theme" leadingIcon="ri-palette-line"
            :placeholder="tBy({ en: 'White & Blue…', km: 'ស និងខៀវ…' })" />
        </RFormGroup>
      </div>

      <div class="ef-toggles-row">
        <div class="ef-toggle-item">
          <RSwitch v-model="form.hasCatering" />
          <span>{{ tBy({ en: 'Catering', km: 'ម្ហូបអាហារ' }) }}</span>
        </div>
        <div class="ef-toggle-item">
          <RSwitch v-model="form.hasEntertainment" />
          <span>{{ tBy({ en: 'Entertainment', km: 'កម្សាន្ត' }) }}</span>
        </div>
        <div class="ef-toggle-item">
          <RSwitch v-model="form.hasPhotography" />
          <span>{{ tBy({ en: 'Photography', km: 'ថតរូប' }) }}</span>
        </div>
        <div class="ef-toggle-item">
          <RSwitch v-model="form.hasKidsArea" />
          <span>{{ tBy({ en: 'Kids Area', km: 'តំបន់កុមារ' }) }}</span>
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
  title: '', familyName: '', organizerName: '', organizerPhone: '',
  gatheringType: '', eventDate: null, eventTime: null,
  venue: '', attendeeCount: 0,
  branches: [{ name: '', count: 0 }],
  budget: 0, theme: '',
  hasCatering: true, hasEntertainment: false, hasPhotography: false, hasKidsArea: false,
  notes: '',
})

const gatheringTypeOptions = [
  { id: 1, Name:"", NameEnglish:""},
  { id: 2, Name:"ជួបជុំប្រចាំឆ្នាំ", NameEnglish:"Annual Reunion"},
  { id: 3, Name:"ចូលឆ្នាំ", NameEnglish:"New Year Celebration"},
  { id: 4, Name:"ខួបអ្នកស្លាប់", NameEnglish:"Ancestor Memorial"},
  { id: 5, Name:"ជួបជុំទូទៅ", NameEnglish:"General Gathering"},
]

const addBranch   = () => form.branches.push({ name: '', count: 0 })
const removeBranch = (i) => form.branches.splice(i, 1)
const schema = {}
defineExpose({ form, formRef })
</script>

<style lang="scss" scoped>
.ef--family {
  .ef-banner--family { --banner-color: #8b5cf6; --banner-bg: linear-gradient(135deg, #faf5ff 0%, #ede9fe 100%); }

  .family-branches {
    display: flex; flex-direction: column; gap: 8px;
    border: 1px solid var(--c-border); border-radius: var(--r-lg); padding: 14px;
    background: rgba(139,92,246,0.03);

    .branch-row {
      display: flex; align-items: flex-end; gap: 10px;
      .branch-num {
        width: 24px; height: 24px; border-radius: var(--r-full);
        background: var(--c-accent); color: #fff;
        font-size: 0.7rem; font-weight: 700;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0; margin-bottom: 6px;
      }
      .branch-name { flex: 2; }
      .branch-count { flex: 0 0 90px; }
      .branch-remove {
        background: none; border: none; cursor: pointer; color: var(--c-danger); height: 30px !important; width: 30px !important; display: flex; align-items: center; justify-content: center;
        font-size: 16px; padding: 4px; border-radius: var(--r-sm);
        opacity: 0.6; margin-bottom: 6px;
        &:hover { opacity: 1; background: rgba(248,113,113,0.1); }
      }
    }

    .add-branch-btn {
      display: flex; align-items: center; gap: 6px;
      background: none; border: 1.5px dashed var(--c-border);
      border-radius: var(--r-md); padding: 8px 14px;
      font-size: 0.8rem; color: var(--c-muted); cursor: pointer;
      width: 100%; justify-content: center; margin-top: 4px;
      transition: border-color var(--t-base), color var(--t-base);
      &:hover { border-color: var(--c-accent); color: var(--c-accent); }
    }
  }
}
</style>
