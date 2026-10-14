<script setup>
import { toRef, toRaw,computed } from 'vue'
import { LETTER_TEMPLATES } from '~/composables/useLetterData'
const { tr } = useTr()
const { locale } = useI18n()
const props = defineProps(['data', 'templateProp', 'uploadUrl', 'ready'])
const templateProp = computed(() => props.templateProp)
const data = computed(() => props.data)
const uploadUrl = computed(() => props.uploadUrl)

const emits = defineEmits('save', 'go-to-preview', 'template-change')

const letter = toRef(props, 'data')

function buildPayload() {
  const rawLetter = toRaw(letter.value)
  return {
    ...rawLetter,
    gallery: rawLetter.gallery.map(img => ({
      ...img,
      file: img.file, // keep File object
    })),
  }
}

function saveLetter() {
  emits('save', buildPayload(), { auto: false })
}

// ── Auto-save (debounced) ──────────────────────────────────────────────────
const ready = computed(() => props.ready ?? true)
const AUTO_SAVE_DELAY = 1200
let autosaveTimer = null

function clearAutosave() {
  if (autosaveTimer) {
    clearTimeout(autosaveTimer)
    autosaveTimer = null
  }
}

watch(letter, () => {
  if (!ready.value) return
  clearAutosave()
  autosaveTimer = setTimeout(() => {
    autosaveTimer = null
    emits('save', buildPayload(), { auto: true })
  }, AUTO_SAVE_DELAY)
}, { deep: true })

watch(ready, (val) => {
  if (!val) clearAutosave()
})

onBeforeUnmount(clearAutosave)

function goToPreview() {
  // Flush any pending autosave so the preview reflects the latest edits.
  if (autosaveTimer) {
    clearTimeout(autosaveTimer)
    autosaveTimer = null
    emits('save', buildPayload(), { auto: true })
  }
  emits('go-to-preview')
}

// ── Accordion panels ──────────────────────────────────────────────────────
const panels = reactive({
  couple:   true,
  event:    true,
  hero:     false,
  ceremony: false,
  reception: false,
  loveStory: false,
  countdown: false,
  schedule: true,
  gift:     false,
  videos:   false,
  gallery:  false,
  social:   false,
  special:  false,
  custom:   false,
  rsvp:     false,
  style:    false,
  footer:   false,
})

const togglePanel = (key) => { panels[key] = !panels[key] }

// ─────────────────────────────────────────────────────────────
// Active template
// ─────────────────────────────────────────────────────────────
const activeTemplate = computed(() => {
  return (
    LETTER_TEMPLATES.find(t => t.key === props.templateProp)?.component ??
    LETTER_TEMPLATES[0].component
  )
})

function selectTemplate(key) {
  letter.value.template = key
  emits('template-change', key)
}
</script>

<template>
  <div class="el-root animate-fade-up delay-2">
    <!-- Left: accordion form -->
    <div class="ile-form">
      <!-- ── Panel: Couple Info ───────────────────────────────────────── -->
      <div class="editor-panel glass-card">
        <div class="ep-header" @click="togglePanel('couple')">
          <div class="ep-title">
            <div class="ep-icon" style="background:rgba(255,140,66,0.12);color:var(--c-accent)">
              <i class="ri-heart-3-fill" />
            </div>
            <span>{{ tBy({ en: 'Couple Information', km: 'ព័ត៌មានគូស្នេហ៍' }) }}</span>
          </div>
          <i class="ri-arrow-down-s-line ep-arrow" :class="{ rotated: panels.couple }" />
        </div>

        <Transition name="panel-body">
          <div v-if="panels.couple" class="ep-body">
            <RFormGroup :label="tBy({ en: 'Letter Title', km: 'ចំណងជើង' })">
              <RInput v-model="letter.title" :placeholder="tBy({ en: 'Wedding ceremony title…', km: 'សិរីស្ងួមដូលណោហ៍ពិពាហ៍' })" />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'Opening Message', km: 'សារបើក' })">
              <RTextarea v-model="letter.opening" rows="3" style="resize:vertical" />
            </RFormGroup>

            <!-- Groom -->
            <div class="ep-section-label">
              <i class="ri-user-fill" style="color:var(--c-info)" />
              {{ tBy({ en: 'Groom', km: 'កូនប្រុស' }) }}
            </div>

            <div class="form-row-2">
              <RFormGroup :label="tBy({ en: 'Groom Name', km: 'ឈ្មោះកូនប្រុស' })">
                <RInput v-model="letter.host1Name" />
              </RFormGroup>
            </div>

            <div class="form-row-2">
              <RFormGroup :label="tBy({ en: 'Groom Father', km: 'ឈ្មោះឪពុក' })">
                <RInput v-model="letter.host1Name1" />
              </RFormGroup>
              <RFormGroup :label="tBy({ en: 'Groom Mother', km: 'ឈ្មោះម្ដាយ' })">
                <RInput v-model="letter.host1Name2" />
              </RFormGroup>
            </div>

            <RFormGroup :label="tBy({ en: 'Groom Address', km: 'អាសយដ្ឋានក្រូម' })">
              <RInput v-model="letter.host1Address" />
            </RFormGroup>

            <!-- Bride -->
            <div class="ep-section-label" style="margin-top:var(--sp-4)">
              <i class="ri-user-heart-fill" style="color:var(--c-accent)" />
              {{ tBy({ en: 'Bride', km: 'កូនក្រមុំ' }) }}
            </div>

            <div class="form-row-2">
              <RFormGroup :label="tBy({ en: 'Bride Name', km: 'ឈ្មោះកូនក្រមុំ' })">
                <RInput v-model="letter.host2Name" />
              </RFormGroup>
            </div>

            <div class="form-row-2">
              <RFormGroup :label="tBy({ en: 'Bride Father', km: 'ឈ្មោះឪពុក' })">
                <RInput v-model="letter.host2Name1" />
              </RFormGroup>
              <RFormGroup :label="tBy({ en: 'Bride Mother', km: 'ឈ្មោះម្ដាយ' })">
                <RInput v-model="letter.host2Name2" />
              </RFormGroup>
            </div>

            <RFormGroup :label="tBy({ en: 'Bride Address', km: 'អាសយដ្ឋាន' })">
              <RInput v-model="letter.host2Address" />
            </RFormGroup>
          </div>
        </Transition>
      </div>

      <!-- ── Panel: Hero / Header ─────────────────────────────────────────── -->
      <div class="editor-panel glass-card">
        <div class="ep-header" @click="togglePanel('hero')">
          <div class="ep-title">
            <div class="ep-icon" style="background:rgba(255,140,66,0.12);color:var(--c-accent)">
              <i class="ri-article-line" />
            </div>
            <span>{{ tBy({ en: 'Hero / Header', km: 'ចំណងជើង / ក្បាល' }) }}</span>
          </div>
          <i class="ri-arrow-down-s-line ep-arrow" :class="{ rotated: panels.hero }" />
        </div>

        <Transition name="panel-body">
          <div v-if="panels.hero" class="ep-body">
            <RFormGroup :label="tBy({ en: 'Hero Title', km: 'ចំណងជើង Hero' })">
              <RInput v-model="letter.heroTitle" :placeholder="tBy({ en: 'Main hero title…', km: 'ចំណងជើងមាន Hero…' })" />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'Hero Subtitle', km: 'ចំណងជើងរង Hero' })">
              <RInput v-model="letter.heroSubtitle" :placeholder="tBy({ en: 'Hero subtitle…', km: 'ចំណងជើងរង Hero…' })" />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'Hero Description', km: 'កំណត់ចំណងជើង Hero' })">
              <RTextarea v-model="letter.heroDescription" rows="3" style="resize:vertical" />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'Hero Image', km: 'រូបភាព Hero' })">
              <RInput v-model="letter.heroImage" type="url" placeholder="https://example.com/image.jpg" />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'Hero Video URL', km: 'តំណវីដេអូ Hero' })">
              <RInput v-model="letter.heroVideo" type="url" placeholder="https://youtube.com/embed/..." />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'Logo URL', km: 'តំណ Logo' })">
              <RInput v-model="letter.logo" type="url" placeholder="https://example.com/logo.png" />
            </RFormGroup>
          </div>
        </Transition>
      </div>

      <!-- ── Panel: Event Details ─────────────────────────────────────── -->
      <div class="editor-panel glass-card">
        <div class="ep-header" @click="togglePanel('event')">
          <div class="ep-title">
            <div class="ep-icon" style="background:rgba(96,165,250,0.12);color:var(--c-info)">
              <i class="ri-calendar-event-fill" />
            </div>
            <span>{{ tBy({ en: 'Event Details', km: 'ព័ត៌មានព្រឹត្តិការណ៍' }) }}</span>
          </div>
          <i class="ri-arrow-down-s-line ep-arrow" :class="{ rotated: panels.event }" />
        </div>

        <Transition name="panel-body">
          <div v-if="panels.event" class="ep-body">
            <div class="form-row-2">
              <RFormGroup :label="tBy({ en: 'Wedding Date', km: 'ថ្ងៃខែពិធី' })">
                <RDateInputPicker v-model="letter.eventDate" :placeholder="tBy({ en: 'Day Month Year…', km: 'ថ្ងៃ ខែ ឆ្នាំ…' })" />
              </RFormGroup>
            </div>

            <RFormGroup :label="tBy({ en: 'Event Name', km: 'ឈ្មោះព្រឹត្តិការណ៍' })">
              <RInput v-model="letter.eventName" />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'Event Type Label', km: 'គំរូព្រឹត្តិការណ៍' })">
              <RInput v-model="letter.eventTypeLabel" />
            </RFormGroup>

            <div class="form-row-2">
              <RFormGroup :label="tBy({ en: 'Start Time', km: 'ម៉ោងចាប់ផ្តើម' })">
                <RTimeInputPicker v-model="letter.startTime" />
              </RFormGroup>
              <RFormGroup :label="tBy({ en: 'End Time', km: 'ម៉ោងបញ្ចប់' })">
                <RTimeInputPicker v-model="letter.endTime" />
              </RFormGroup>
            </div>

            <RFormGroup :label="tBy({ en: 'Timezone', km: 'តំណាងម៉ោង' })">
              <RInput v-model="letter.timezone" placeholder="Asia/Phnom_Penh" />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'Venue Name', km: 'ឈ្មោះទីកន្លែង' })">
              <RInput v-model="letter.venue" />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'Venue Name (Detail)', km: 'ឈ្មោះទីកន្លែងលម្អិត' })">
              <RInput v-model="letter.venueName" />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'Venue Address', km: 'អាសយដ្ឋានទីកន្លែង' })">
              <RTextarea v-model="letter.venueAddress" rows="2" style="resize:vertical" />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'Venue Description', km: 'កំណត់ទីកន្លែង' })">
              <RTextarea v-model="letter.venueDescription" rows="2" style="resize:vertical" />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'Venue Phone', km: 'ទូរស័ព្ទទីកន្លែង' })">
              <RInput v-model="letter.venuePhone" placeholder="+855 xx xxx xxx" />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'Google Maps Link', km: 'តំណ Google Maps' })">
              <RInput v-model="letter.mapUrl" type="url" placeholder="https://maps.app.goo.gl/..." />
            </RFormGroup>

            <div class="form-row-2">
              <RFormGroup :label="tBy({ en: 'Latitude', km: 'ទិសដៅ' })">
                <RInput v-model="letter.latitude" type="number" step="any" placeholder="11.5564" />
              </RFormGroup>
              <RFormGroup :label="tBy({ en: 'Longitude', km: 'ទិសដៅខាងក្រោយ' })">
                <RInput v-model="letter.longitude" type="number" step="any" placeholder="104.9282" />
              </RFormGroup>
            </div>

            <RFormGroup :label="tBy({ en: 'Contact Numbers', km: 'លេខទំនាក់ទំនង' })">
              <RInput v-model="letter.contacts" placeholder="0xx xxx xxxx / 0xx xxx xxxx" />
            </RFormGroup>
          </div>
        </Transition>
      </div>

      <!-- ── Panel: Ceremony ────────────────────────────────────────────── -->
      <div class="editor-panel glass-card">
        <div class="ep-header" @click="togglePanel('ceremony')">
          <div class="ep-title">
            <div class="ep-icon" style="background:rgba(255,140,66,0.12);color:var(--c-accent)">
              <i class="ri-government-line" />
            </div>
            <span>{{ tBy({ en: 'Ceremony', km: 'ពិធីកាល' }) }}</span>
          </div>
          <i class="ri-arrow-down-s-line ep-arrow" :class="{ rotated: panels.ceremony }" />
        </div>

        <Transition name="panel-body">
          <div v-if="panels.ceremony" class="ep-body">
            <RFormGroup :label="tBy({ en: 'Ceremony Title', km: 'ចំណងជើងពិធី' })">
              <RInput v-model="letter.ceremonyTitle" :placeholder="tBy({ en: 'e.g. Khmer Traditional Ceremony', km: 'ឧ. ពិធីខ្មែរបុរាណ' })" />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'Ceremony Date', km: 'ថ្ងៃពិធី' })">
              <RDateInputPicker v-model="letter.ceremonyDate" :placeholder="tBy({ en: 'Day Month Year…', km: 'ថ្ងៃ ខែ ឆ្នាំ…' })" />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'Ceremony Time', km: 'ម៉ោងពិធី' })">
              <RTimeInputPicker v-model="letter.ceremonyTime" />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'Ceremony Venue', km: 'ទីកន្លែងពិធី' })">
              <RInput v-model="letter.ceremonyVenue" />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'Ceremony Address', km: 'អាសយដ្ឋានពិធី' })">
              <RTextarea v-model="letter.ceremonyAddress" rows="2" style="resize:vertical" />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'Ceremony Maps Link', km: 'តំណផែនទីពិធី' })">
              <RInput v-model="letter.ceremonyMapUrl" type="url" placeholder="https://maps.app.goo.gl/..." />
            </RFormGroup>
          </div>
        </Transition>
      </div>

      <!-- ── Panel: Reception ───────────────────────────────────────────── -->
      <div class="editor-panel glass-card">
        <div class="ep-header" @click="togglePanel('reception')">
          <div class="ep-title">
            <div class="ep-icon" style="background:rgba(167,139,250,0.12);color:#a78bfa">
              <i class="ri-cake-3-line" />
            </div>
            <span>{{ tBy({ en: 'Reception', km: 'ពិធីលេងលាក់' }) }}</span>
          </div>
          <i class="ri-arrow-down-s-line ep-arrow" :class="{ rotated: panels.reception }" />
        </div>

        <Transition name="panel-body">
          <div v-if="panels.reception" class="ep-body">
            <RFormGroup :label="tBy({ en: 'Reception Title', km: 'ចំណងជើងពិធីលេងលាក់' })">
              <RInput v-model="letter.receptionTitle" :placeholder="tBy({ en: 'e.g. Wedding Reception', km: 'ឧ. ពិធីលេងលាក់មង្គល' })" />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'Reception Date', km: 'ថ្ងៃពិធីលេងលាក់' })">
              <RDateInputPicker v-model="letter.receptionDate" :placeholder="tBy({ en: 'Day Month Year…', km: 'ថ្ងៃ ខែ ឆ្នាំ…' })" />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'Reception Time', km: 'ម៉ោងពិធីលេងលាក់' })">
              <RTimeInputPicker v-model="letter.receptionTime"  />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'Reception Venue', km: 'ទីកន្លែងលេងលាក់' })">
              <RInput v-model="letter.receptionVenue" />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'Reception Address', km: 'អាសយដ្ឋានលេងលាក់' })">
              <RTextarea v-model="letter.receptionAddress" rows="2" style="resize:vertical" />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'Reception Maps Link', km: 'តំណផែនទីលេងលាក់' })">
              <RInput v-model="letter.receptionMapUrl" type="url" placeholder="https://maps.app.goo.gl/..." />
            </RFormGroup>
          </div>
        </Transition>
      </div>

      <!-- ── Panel: Love Story ──────────────────────────────────────────── -->
      <div class="editor-panel glass-card">
        <div class="ep-header" @click="togglePanel('loveStory')">
          <div class="ep-title">
            <div class="ep-icon" style="background:rgba(244,114,182,0.12);color:#f472b6">
              <i class="ri-heart-3-line" />
            </div>
            <span>{{ tBy({ en: 'Love Story', km: 'រឿងរ៉ាវរបស់យើង' }) }}</span>
          </div>
          <i class="ri-arrow-down-s-line ep-arrow" :class="{ rotated: panels.loveStory }" />
        </div>

        <Transition name="panel-body">
          <div v-if="panels.loveStory" class="ep-body">
            <RFormGroup :label="tBy({ en: 'Story Title', km: 'ចំណងជើងរឿង' })">
              <RInput v-model="letter.storyTitle" :placeholder="tBy({ en: 'Our Love Story', km: 'រឿងរ៉ាវរបស់យើង' })" />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'Story Description', km: 'កំណត់រឿង' })">
              <RTextarea v-model="letter.storyDescription" rows="3" style="resize:vertical" />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'Love Story Content', km: 'មាតិការឿងរ៉ាវ' })">
              <RTextarea v-model="letter.loveStory" rows="6" style="resize:vertical" />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'Story Timeline', km: 'វគ្គសម័យរឿង' })">
              <RTextarea v-model="letter.storyTimeline" rows="4" style="resize:vertical" :placeholder="tBy({ en: 'JSON array of timeline events', km: 'JSON array នៃពេលវេលារឿង' })" />
            </RFormGroup>
          </div>
        </Transition>
      </div>

      <!-- ── Panel: Countdown ───────────────────────────────────────────── -->
      <div class="editor-panel glass-card">
        <div class="ep-header" @click="togglePanel('countdown')">
          <div class="ep-title">
            <div class="ep-icon" style="background:rgba(74,222,128,0.12);color:var(--c-success)">
              <i class="ri-time-line" />
            </div>
            <span>{{ tBy({ en: 'Countdown', km: 'ការរាំងពេល' }) }}</span>
          </div>
          <i class="ri-arrow-down-s-line ep-arrow" :class="{ rotated: panels.countdown }" />
        </div>

        <Transition name="panel-body">
          <div v-if="panels.countdown" class="ep-body">
            <div class="form-row-2">
              <RFormGroup :label="tBy({ en: 'Show Countdown', km: 'បង្ហាញការរាំងពេល' })">
                <RSelect v-model="letter.showCountdown" pk="Id" default-select :localData="{data: [{Id: 1, NameEnglish: 'Yes', Name: 'បាទ/ចា៎'}, {Id: 0, NameEnglish: 'No', Name: 'ទេ'}]}" :displayKey="{en: 'NameEnglish', km: 'Name'}" />
              </RFormGroup>
            </div>

            <RFormGroup :label="tBy({ en: 'Countdown Title', km: 'ចំណងជើងការរាំងពេល' })">
              <RInput v-model="letter.countdownTitle" :placeholder="tBy({ en: 'Countdown to Our Wedding', km: 'ការរាំងពេលទៅពិធីមង្គល' })" />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'Countdown Date', km: 'ថ្ងៃការរាំងពេល' })">
              <RDateInputPicker v-model="letter.countdownDate" :placeholder="tBy({ en: 'Day Month Year…', km: 'ថ្ងៃ ខែ ឆ្នាំ…' })" />
            </RFormGroup>
          </div>
        </Transition>
      </div>

      <!-- ── Panel: Ceremony Schedule ────────────────────────────────── -->
      <div class="editor-panel glass-card">
        <div class="ep-header" @click="togglePanel('schedule')">
          <div class="ep-title">
            <div class="ep-icon" style="background:rgba(74,222,128,0.12);color:var(--c-success)">
              <i class="ri-time-line" />
            </div>
            <span>{{ tBy({ en: 'Ceremony Schedule', km: 'កម្មវិធីពិធីការ' }) }}</span>
          </div>
          <i class="ri-arrow-down-s-line ep-arrow" :class="{ rotated: panels.schedule }" />
        </div>

        <Transition name="panel-body">
          <div v-if="panels.schedule" class="ep-body">
            <p class="gallery-hint">
              <i class="ri-information-line" />
              {{ tBy({
                en: 'Schedule is loaded from the ceremony list. Manage it in the Ceremony section.',
                km: 'កម្មវិធីយកពីបញ្ជីពិធីការ។ គ្រប់គ្រងនៅក្នុងផ្នែកពិធីការ។',
              }) }}
            </p>

            <div
              v-for="(item, i) in (letter?.schedule ?? [])"
              :key="item.id ?? i"
              class="schedule-editor-item"
            >
              <div class="sei-num">{{ i + 1 }}</div>
              <div class="sei-fields">
                <div class="sei-name">{{ item.name }}</div>
                <div class="sei-time" v-if="item.startTime || item.endTime">
                  <i class="ri-time-line" />
                  {{ item.startTime ? String(item.startTime).slice(0, 5) : '' }}
                  {{ item.startTime && item.endTime ? '–' : '' }}
                  {{ item.endTime ? String(item.endTime).slice(0, 5) : '' }}
                </div>
                <p class="sei-desc" v-if="item.description" style="white-space:pre-line">{{ item.description }}</p>
              </div>
            </div>

            <p v-if="!letter?.schedule?.length" class="sei-empty">
              {{ tBy({ en: 'No ceremonies yet. Add them in the Ceremony section.', km: 'មិនទាន់មានពិធីការទេ។ បន្ថែមនៅក្នុងផ្នែកពិធីការ។' }) }}
            </p>
          </div>
        </Transition>
      </div>

      <!-- ── Panel: Gift / Registry ─────────────────────────────────────── -->
      <div class="editor-panel glass-card">
        <div class="ep-header" @click="togglePanel('gift')">
          <div class="ep-title">
            <div class="ep-icon" style="background:rgba(251,146,60,0.12);color:#fb923c">
              <i class="ri-gift-line" />
            </div>
            <span>{{ tBy({ en: 'Gift / Registry', km: 'អំណោយ / ការចុះឈ្មោះ' }) }}</span>
          </div>
          <i class="ri-arrow-down-s-line ep-arrow" :class="{ rotated: panels.gift }" />
        </div>

        <Transition name="panel-body">
          <div v-if="panels.gift" class="ep-body">
            <div class="form-row-2">
              <RFormGroup :label="tBy({ en: 'Show Gift Info', km: 'បង្ហាញព័ត៌មានអំណោយ' })">
                <RSelect v-model="letter.showGiftInfo" pk="Id" default-select :localData="{data: [{Id: 1, NameEnglish: 'Yes', Name: 'បាទ/ចា៎'}, {Id: 0, NameEnglish: 'No', Name: 'ទេ'}]}" :displayKey="{en: 'NameEnglish', km: 'Name'}" />
              </RFormGroup>
            </div>

            <RFormGroup :label="tBy({ en: 'Gift Title', km: 'ចំណងជើងអំណោយ' })">
              <RInput v-model="letter.giftTitle" :placeholder="tBy({ en: 'Gift Registry', km: 'ការចុះឈ្មោះអំណោយ' })" />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'Gift Message', km: 'សារអំណោយ' })">
              <RTextarea v-model="letter.giftMessage" rows="3" style="resize:vertical" />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'Gift Note', km: 'ចំណាំអំណោយ' })">
              <RTextarea v-model="letter.giftNote" rows="3" style="resize:vertical" />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'Registry URL', km: 'តំណរឺហស្ទ្រី' })">
              <RInput v-model="letter.registryUrl" type="url" placeholder="https://registry.example.com" />
            </RFormGroup>

            <div class="form-row-2">
              <RFormGroup :label="tBy({ en: 'Bank Name', km: 'ឈ្មោះធនាគារ' })">
                <RInput v-model="letter.bankNameGift" />
              </RFormGroup>
              <RFormGroup :label="tBy({ en: 'Bank Account', km: 'លេខខ្សែធនាគារ' })">
                <RInput v-model="letter.bankAccountGift" />
              </RFormGroup>
            </div>

            <RFormGroup :label="tBy({ en: 'Account Name', km: 'ឈ្មោះខ្សែ' })">
              <RInput v-model="letter.accountName" />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'Gift Options (JSON)', km: 'ជម្រើសអំណោយ (JSON)' })">
              <RTextarea v-model="letter.giftOptions" rows="4" style="resize:vertical" :placeholder="tBy({ en: 'JSON array of gift options', km: 'JSON array នៃជម្រើសអំណោយ' })" />
            </RFormGroup>
          </div>
        </Transition>
      </div>

      <!-- ── Panel: Videos ───────────────────────────────────────────────── -->
      <div class="editor-panel glass-card">
        <div class="ep-header" @click="togglePanel('videos')">
          <div class="ep-title">
            <div class="ep-icon" style="background:rgba(139,92,246,0.12);color:#8b5cf6">
              <i class="ri-video-line" />
            </div>
            <span>{{ tBy({ en: 'Videos', km: 'វីដេអូ' }) }}</span>
          </div>
          <i class="ri-arrow-down-s-line ep-arrow" :class="{ rotated: panels.videos }" />
        </div>

        <Transition name="panel-body">
          <div v-if="panels.videos" class="ep-body">
            <RFormGroup :label="tBy({ en: 'YouTube Embed ID', km: 'អីដយូតូបច្ចុប្បន្ន' })">
              <RInput v-model="letter.youtubeEmbedId.value" placeholder="dQw4w9WgXcQ" />
            </RFormGroup>

            <div class="form-row-2">
              <RFormGroup :label="tBy({ en: 'Music Autoplay', km: 'ចាក់វីដេអូដោយដៃរួច' })">
                <RSelect v-model="letter.musicPlaying.value" pk="Id" default-select :localData="{data: [{Id: 1, NameEnglish: 'Yes', Name: 'បាទ/ចា៎'}, {Id: 0, NameEnglish: 'No', Name: 'ទេ'}]}" />
              </RFormGroup>
            </div>

            <RFormGroup :label="tBy({ en: 'Music Title', km: 'ចំណងជើងចម្រៀង' })">
              <RInput v-model="letter.musicTitle" />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'Music Artist', km: 'ឈ្មោះបទចម្រៀង' })">
              <RInput v-model="letter.musicArtist" />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'Music URL', km: 'តំណចម្រៀង' })">
              <RInput v-model="letter.musicUrl" type="url" placeholder="https://youtube.com/watch?v=..." />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'Additional Videos (JSON)', km: 'វីដេអូបន្ថែម (JSON)' })">
              <RTextarea v-model="letter.videos" rows="4" style="resize:vertical" :placeholder="tBy({ en: 'JSON array of videos', km: 'JSON array នៃវីដេអូ' })" />
            </RFormGroup>
          </div>
        </Transition>
      </div>

      <!-- ── Panel: Social / Sharing ─────────────────────────────────────── -->
      <div class="editor-panel glass-card">
        <div class="ep-header" @click="togglePanel('social')">
          <div class="ep-title">
            <div class="ep-icon" style="background:rgba(59,130,246,0.12);color:#3b82f6">
              <i class="ri-share-line" />
            </div>
            <span>{{ tBy({ en: 'Social / Sharing', km: 'សង្គម / ការចែករំលែក' }) }}</span>
          </div>
          <i class="ri-arrow-down-s-line ep-arrow" :class="{ rotated: panels.social }" />
        </div>

        <Transition name="panel-body">
          <div v-if="panels.social" class="ep-body">
            <RFormGroup :label="tBy({ en: 'Hashtag', km: 'ហាចតាក់' })">
              <RInput v-model="letter.hashtag" placeholder="#OurWedding" />
            </RFormGroup>

            <div class="form-row-2">
              <RFormGroup :label="tBy({ en: 'Instagram URL', km: 'តំណអីនស្តាក់រាម' })">
                <RInput v-model="letter.instagramUrl" type="url" placeholder="https://instagram.com/..." />
              </RFormGroup>
              <RFormGroup :label="tBy({ en: 'Facebook URL', km: 'តំណហ្វេសបុក' })">
                <RInput v-model="letter.facebookUrl" type="url" placeholder="https://facebook.com/..." />
              </RFormGroup>
            </div>

            <div class="form-row-2">
              <RFormGroup :label="tBy({ en: 'Telegram URL', km: 'តំណទេឡេក្រាម' })">
                <RInput v-model="letter.telegramUrl" type="url" placeholder="https://t.me/..." />
              </RFormGroup>
              <RFormGroup :label="tBy({ en: 'Share WhatsApp', km: 'ចែករំលែក WhatsApp' })">
                <RSelect v-model="letter.social.shareWhatsapp" pk="Id" default-select :localData="{data: [{Id: 1, NameEnglish: 'Yes', Name: 'បាទ/ចា៎'}, {Id: 0, NameEnglish: 'No', Name: 'ទេ'}]}" />
              </RFormGroup>
            </div>

            <RFormGroup :label="tBy({ en: 'Share Facebook', km: 'ចែករំលែក Facebook' })">
              <RSelect v-model="letter.social.shareFacebook" pk="Id" default-select :localData="{data: [{Id: 1, NameEnglish: 'Yes', Name: 'បាទ/ចា៎'}, {Id: 0, NameEnglish: 'No', Name: 'ទេ'}]}" />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'Share Telegram', km: 'ចែករំលែក Telegram' })">
              <RSelect v-model="letter.social.shareTelegram" pk="Id" default-select :localData="{data: [{Id: 1, NameEnglish: 'Yes', Name: 'បាទ/ចា៎'}, {Id: 0, NameEnglish: 'No', Name: 'ទេ'}]}" />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'Share Title', km: 'ចំណងជើងចែករំលែក' })">
              <RInput v-model="letter.shareTitle" />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'Share Description', km: 'កំណត់ចែករំលែក' })">
              <RTextarea v-model="letter.shareDescription" rows="3" style="resize:vertical" />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'Share Image', km: 'រូបភាពចែករំលែក' })">
              <RInput v-model="letter.shareImage" type="url" placeholder="https://example.com/share-image.jpg" />
            </RFormGroup>
          </div>
        </Transition>
      </div>

      <!-- ── Panel: Special Messages ─────────────────────────────────────── -->
      <div class="editor-panel glass-card">
        <div class="ep-header" @click="togglePanel('special')">
          <div class="ep-title">
            <div class="ep-icon" style="background:rgba(236,72,153,0.12);color:#ec4899">
              <i class="ri-message-3-line" />
            </div>
            <span>{{ tBy({ en: 'Special Messages', km: 'សារពិសេស' }) }}</span>
          </div>
          <i class="ri-arrow-down-s-line ep-arrow" :class="{ rotated: panels.special }" />
        </div>

        <Transition name="panel-body">
          <div v-if="panels.special" class="ep-body">
            <RFormGroup :label="tBy({ en: 'Announcement', km: 'អត្ថបទផ្ញើការ' })">
              <RTextarea v-model="letter.announcement" rows="3" style="resize:vertical" />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'Important Note', km: 'ចំណាំសំខាន់' })">
              <RTextarea v-model="letter.importantNote" rows="3" style="resize:vertical" />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'Special Note', km: 'ចំណាំពិសេស' })">
              <RTextarea v-model="letter.specialNote" rows="3" style="resize:vertical" />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'Closing', km: 'សារបញ្ចប់' })">
              <RTextarea v-model="letter.closing" rows="3" style="resize:vertical" />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'Thank You Message', km: 'សារអរគុណ' })">
              <RTextarea v-model="letter.thankYouMessage" rows="3" style="resize:vertical" />
            </RFormGroup>
          </div>
        </Transition>
      </div>

      <!-- ── Panel: Custom Sections ──────────────────────────────────────── -->
      <div class="editor-panel glass-card">
        <div class="ep-header" @click="togglePanel('custom')">
          <div class="ep-title">
            <div class="ep-icon" style="background:rgba(20,184,166,0.12);color:#14b8a6">
              <i class="ri-layout-grid-line" />
            </div>
            <span>{{ tBy({ en: 'Custom Sections', km: 'ផ្នែកផ្គត់ផ្គង់' }) }}</span>
          </div>
          <i class="ri-arrow-down-s-line ep-arrow" :class="{ rotated: panels.custom }" />
        </div>

        <Transition name="panel-body">
          <div v-if="panels.custom" class="ep-body">
            <RFormGroup :label="tBy({ en: 'Custom Sections (JSON)', km: 'ផ្នែកផ្គត់ផ្គង់ (JSON)' })">
              <RTextarea v-model="letter.sections" rows="6" style="resize:vertical" :placeholder="tBy({ en: 'JSON array of custom sections', km: 'JSON array នៃផ្នែកផ្គត់ផ្គង់' })" />
            </RFormGroup>
          </div>
        </Transition>
      </div>

      <!-- ── Panel: Footer ───────────────────────────────────────────────── -->
      <div class="editor-panel glass-card">
        <div class="ep-header" @click="togglePanel('footer')">
          <div class="ep-title">
            <div class="ep-icon" style="background:rgba(100,116,139,0.12);color:#64748b">
              <i class="ri-file-footer-line" />
            </div>
            <span>{{ tBy({ en: 'Footer', km: 'គ្រប់តែង' }) }}</span>
          </div>
          <i class="ri-arrow-down-s-line ep-arrow" :class="{ rotated: panels.footer }" />
        </div>

        <Transition name="panel-body">
          <div v-if="panels.footer" class="ep-body">
            <RFormGroup :label="tBy({ en: 'Footer Title', km: 'ចំណងជើងគ្រប់តែង' })">
              <RInput v-model="letter.footerTitle" :placeholder="tBy({ en: 'With Love', km: 'ជាមួយស្នេហ៍' })" />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'Footer Message', km: 'សារគ្រប់តែង' })">
              <RTextarea v-model="letter.footerMessage" rows="3" style="resize:vertical" />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'Footer Logo URL', km: 'តំណ Logo គ្រប់តែង' })">
              <RInput v-model="letter.footerLogo" type="url" placeholder="https://example.com/footer-logo.png" />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'Footer Note', km: 'ចំណាំគ្រប់តែង' })">
              <RTextarea v-model="letter.footerNote" rows="2" style="resize:vertical" />
            </RFormGroup>
          </div>
        </Transition>
      </div>

      <!-- ── Panel: RSVP & Notes ──────────────────────────────────────── -->
      <div class="editor-panel glass-card">
        <div class="ep-header" @click="togglePanel('rsvp')">
          <div class="ep-title">
            <div class="ep-icon" style="background:rgba(167,139,250,0.12);color:#a78bfa">
              <i class="ri-message-3-fill" />
            </div>
            <span>{{ tBy({ en: 'RSVP & Notes', km: 'ការបញ្ជាក់ & ចំណាំ' }) }}</span>
          </div>
          <i class="ri-arrow-down-s-line ep-arrow" :class="{ rotated: panels.rsvp }" />
        </div>

        <Transition name="panel-body">
          <div v-if="panels.rsvp" class="ep-body">
            <RFormGroup :label="tBy({ en: 'Show RSVP', km: 'បង្ហាញ RSVP' })">
              <RSelect v-model="letter.showRsvp" pk="Id" default-select :localData="{data: [{Id: 1, NameEnglish: 'Yes', Name: 'បាទ/ចា៎'}, {Id: 0, NameEnglish: 'No', Name: 'ទេ'}]}" :displayKey="{en: 'NameEnglish', km: 'Name'}" />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'RSVP Title', km: 'ចំណងជើង RSVP' })">
              <RInput v-model="letter.rsvpTitle" :placeholder="tBy({ en: 'RSVP', km: 'ការបញ្ជាក់' })" />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'RSVP Note', km: 'ចំណាំ RSVP' })">
              <RTextarea v-model="letter.rsvpNote" rows="4" style="resize:vertical" />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'RSVP Deadline', km: 'កាលបរិច្ឆេទចុងក្រោយ RSVP' })">
              <RDateInputPicker v-model="letter.rsvpDeadline" :placeholder="tBy({ en: 'Day Month Year…', km: 'ថ្ងៃ ខែ ឆ្នាំ…' })" />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'RSVP URL', km: 'តំណ RSVP' })">
              <RInput v-model="letter.rsvpUrl" type="url" placeholder="https://example.com/rsvp" />
            </RFormGroup>

            <div class="form-row-2">
              <RFormGroup :label="tBy({ en: 'RSVP Required', km: 'ត្រូវការ RSVP' })">
                <RSelect v-model="letter.rsvpRequired" pk="Id" default-select :localData="{data: [{Id: 1, NameEnglish: 'Yes', Name: 'បាទ/ចា៎'}, {Id: 0, NameEnglish: 'No', Name: 'ទេ'}]}" :displayKey="{en: 'NameEnglish', km: 'Name'}" />
              </RFormGroup>
              <RFormGroup :label="tBy({ en: 'Guest Greeting', km: 'សូមគោរពជួបជាមួយ' })">
                <RInput v-model="letter.guestGreeting" />
              </RFormGroup>
            </div>

            <RFormGroup :label="tBy({ en: 'Guest Name Field', km: 'វាលឈ្មោះជួប' })">
              <RInput v-model="letter.guestNameField" />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'Guest Message', km: 'សារជួប' })">
              <RTextarea v-model="letter.guestMessage" rows="3" style="resize:vertical" />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'Closing Message', km: 'សារបញ្ចប់' })">
              <RTextarea v-model="letter.closing" rows="2" style="resize:vertical" />
            </RFormGroup>

            <div class="form-row-2">
              <RFormGroup :label="tBy({ en: 'Contact Name', km: 'ឈ្មោះទាក់ទង' })">
                <RInput v-model="letter.contactName" />
              </RFormGroup>
              <RFormGroup :label="tBy({ en: 'Contact Phone', km: 'ទូរស័ព្ទទាក់ទង' })">
                <RInput v-model="letter.contactPhone" placeholder="+855 xx xxx xxx" />
              </RFormGroup>
            </div>

            <div class="form-row-2">
              <RFormGroup :label="tBy({ en: 'Contact Email', km: 'អ៊ីមែលទាក់ទង' })">
                <RInput v-model="letter.contactEmail" type="email" placeholder="contact@example.com" />
              </RFormGroup>
            </div>
          </div>
        </Transition>
      </div>

<!-- ── Panel: Gallery ──────────────────────────────────────────── -->
      <div class="editor-panel glass-card">
        <div class="ep-header" @click="togglePanel('gallery')">
          <div class="ep-title">
            <div class="ep-icon" style="background:rgba(96,165,250,0.12);color:var(--c-info)">
              <i class="ri-image-2-fill" />
            </div>
            <span>
              {{ tBy({ en: 'Photo Gallery', km: 'វិចិត្រសាលរូបថត' }) }}
              <span v-if="letter.gallery.length" class="ep-badge">
                {{ letter.gallery.filter(g => g.status === 'done').length }}/{{ letter.gallery.length }}
              </span>
            </span>
          </div>
          <i class="ri-arrow-down-s-line ep-arrow" :class="{ rotated: panels.gallery }" />
        </div>
 
        <Transition name="panel-body">
          <div v-if="panels.gallery" class="ep-body ep-body--gallery">
            <!-- Upload hint -->
            <p class="gallery-hint">
              <i class="ri-information-line" />
              {{ tBy({
                en: 'Photos appear in a gallery section at the bottom of every template.',
                km: 'រូបភាពនឹងបង្ហាញនៅផ្នែកខាងក្រោមនៃគំរូទាំងអស់។',
              }) }}
            </p>
 
            <!-- The uploader component -->
            <ImageUploadGallery
              v-model="letter.gallery"
              :max="16"
              :upload-url="uploadUrl"
              :t-by="tBy"
            />
          </div>
        </Transition>
      </div>

      <!-- ── Panel: Style & Theme ─────────────────────────────────────── -->
      <div class="editor-panel glass-card">
        <div class="ep-header" @click="togglePanel('style')">
          <div class="ep-title">
            <div class="ep-icon" style="background:rgba(255,140,66,0.12);color:var(--c-accent)">
              <i class="ri-palette-fill" />
            </div>
            <span>{{ tBy({ en: 'Style & Theme', km: 'រចនាប័ទ្ម' }) }}</span>
          </div>
          <i class="ri-arrow-down-s-line ep-arrow" :class="{ rotated: panels.style }" />
        </div>

        <Transition name="panel-body">
          <div v-if="panels.style" class="ep-body">
            <RFormGroup :label="tBy({ en: 'Primary Color', km: 'ពណ៌សំខាន់' })">
                <RColorPicker v-model="letter.themeConfig.primaryColor" :init="{ color: letter.themeConfig.primaryColor }" @onChange="color => console.log('Color -----------> ',color)" />
            </RFormGroup>

            <div class="form-row-2">
              <RFormGroup :label="tBy({ en: 'Secondary Color', km: 'ពណ៌ក្រោយ' })">
                  <RColorPicker v-model="letter.themeConfig.secondaryColor" :init="{ color: letter.themeConfig.secondaryColor }" />
              </RFormGroup>
              <RFormGroup :label="tBy({ en: 'Background Color', km: 'ពណ៌ផ្ទៃខាងក្រោម' })">
                  <RColorPicker v-model="letter.themeConfig.backgroundColor" :init="{ color: letter.themeConfig.backgroundColor }" />
              </RFormGroup>
            </div>

            <div class="form-row-2">
              <RFormGroup :label="tBy({ en: 'Text Color', km: 'ពណ៌អក្សរ' })">
                  <RColorPicker v-model="letter.themeConfig.textColor" :init="{ color: letter.themeConfig.textColor }" />
              </RFormGroup>
              <RFormGroup :label="tBy({ en: 'Accent Color', km: 'ពណ៌អក្សរចំណុច' })">
                  <RColorPicker v-model="letter.themeConfig.accentColor" :init="{ color: letter.themeConfig.accentColor }" />
              </RFormGroup>
            </div>

            <RFormGroup :label="tBy({ en: 'Font Family', km: 'ក្រុមអក្សរ' })">
              <RInput v-model="letter.themeConfig.fontFamily" placeholder="'Battambang', 'NotoSansKhmer', serif" />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'Heading Font', km: 'ក្រុមអក្សរចំណងជើង' })">
              <RInput v-model="letter.themeConfig.headingFont" placeholder="'Battambang', serif" />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'Background Image', km: 'រូបភាពផ្ទៃខាងក្រោម' })">
              <RInput v-model="letter.themeConfig.backgroundImage" type="url" placeholder="https://example.com/bg.jpg" />
            </RFormGroup>

            <RFormGroup :label="tBy({ en: 'Background Pattern', km: 'រូបភាពពាក្យផ្ទៃខាងក្រោម' })">
              <RInput v-model="letter.themeConfig.backgroundPattern" type="url" placeholder="https://example.com/pattern.svg" />
            </RFormGroup>

            <div class="form-row-2">
              <RFormGroup :label="tBy({ en: 'Overlay Opacity', km: 'កម្រាស់អូបរលេយ' })">
                <RInput v-model.number="letter.themeConfig.overlayOpacity" type="number" step="0.1" min="0" max="1" />
              </RFormGroup>
            </div>
<!-- 
            <RFormGroup :label="tBy({ en: 'Template', km: 'គំរូ' })">
              <div class="template-options">
                <div
                  v-for="tpl in LETTER_TEMPLATES"
                  :key="tpl.key"
                  class="tpl-opt"
                  :class="{ active: letter.template === tpl.key }"
                  @click="selectTemplate(tpl.key)"
                >
                  <div class="tpl-preview" :style="{ background: tpl.bg, borderColor: tpl.border }">
                    <div class="tpl-lines">
                      <div /><div /><div />
                    </div>
                  </div>
                  <span>{{ `${tr('mode')} ${tr(tpl.label)}` }}</span>
                </div>
              </div>
            </RFormGroup> -->
          </div>
        </Transition>
      </div>

      <!-- Save -->
      <button class="btn-primary save-btn" @click="saveLetter">
        <i class="ri-save-3-line" />
        {{ tBy({ en: 'Save Changes', km: 'រក្សាទុកការផ្លាស់ប្ដូរ' }) }}
      </button>
    </div>

    <!-- Right: sticky mini preview -->
    <div class="ile-live-preview hide-mobile">
      <div class="ilp-header">
        <span class="ilp-label">{{ tBy({ en: 'Live Preview', km: 'មើលផ្ទាល់' }) }}</span>
        <RBtn color="view" :label="tr('common.full_preview')" icon="ri-fullscreen-line" @click="goToPreview" />
      </div>
      <div class="ilp-frame">
        <div class="ilp-scroll">
          <component
            :is="activeTemplate"
            :data="letter"
            :mini="true"
          />
          <!-- <LetterDocument :letter="letter" :mini="true" /> -->
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// ── Editor 2-col layout ───────────────────────────────────────────────────
.el-root {
  display: grid;
  grid-template-columns: 1fr 650px;
  gap: var(--sp-5);
  align-items: start;

  @media (max-width: 1280px) { grid-template-columns: 1fr 320px; }
  @media (max-width: 1024px) { grid-template-columns: 1fr; }
}

.ile-form {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
}

// ── Accordion panel ───────────────────────────────────────────────────────
.editor-panel {
  background: var(--c-surface);
  border-radius: var(--r-xl);
  overflow: hidden;
  padding: 0;
}

.ep-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--sp-4) var(--sp-5);
  cursor: pointer;
  transition: background var(--t-fast);
  user-select: none;

  &:hover { background: rgba(255,255,255,0.03); }
}

.ep-title {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--c-text);
}

.ep-icon {
  width: 34px; height: 34px;
  border-radius: var(--r-md);
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.ep-arrow {
  color: var(--c-muted);
  font-size: 1.125rem;
  transition: transform var(--t-base) var(--ease-out);
  &.rotated { transform: rotate(180deg); }
}

.ep-body {
  padding: var(--sp-2) var(--sp-5) var(--sp-5);
  border-top: 1px solid var(--c-border);
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
}

.ep-section-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--c-muted);
  display: flex;
  align-items: center;
  gap: 6px;
  padding-top: var(--sp-2);
}

// ── Schedule editor ───────────────────────────────────────────────────────
.schedule-editor-item {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-3);
  padding: var(--sp-4);
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--c-border);
  border-radius: var(--r-lg);
}

.sei-num {
  width: 24px; height: 24px;
  border-radius: var(--r-full);
  background: rgba(255,140,66,0.15);
  color: var(--c-accent);
  font-size: 0.75rem;
  font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.sei-fields {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.sei-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--c-text);
  white-space: pre-line;
}

.sei-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: var(--c-muted);
  font-weight: 500;

  i { color: var(--c-info); }
}

.sei-desc {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--c-muted);
  line-height: 1.6;
}

.sei-empty {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--c-muted);
  text-align: center;
  padding: var(--sp-4);
  border: 1px dashed var(--c-border);
  border-radius: var(--r-md);
}

.sei-del { flex-shrink: 0;}

.btn-add-item {
  width: 100%;
  padding: 10px;
  border-style: dashed;
  border-radius: var(--r-md);
  justify-content: center;
  gap: 6px;
  font-family: var(--font-400) !important;
  font-size: 0.875rem;

  &:hover { border-color: rgba(255,140,66,0.3); color: var(--c-accent); }
}

// ── Color picker ──────────────────────────────────────────────────────────
.color-picker-row {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
}

.color-input {
  width: 44px; height: 40px;
  border-radius: var(--r-md);
  border: 1px solid var(--c-border);
  padding: 3px;
  background: none;
  cursor: pointer;
  flex-shrink: 0;
}

// ── Template options ──────────────────────────────────────────────────────
.template-options {
  display: flex;
  gap: var(--sp-3);
}

.tpl-opt {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all var(--t-fast);

  .tpl-preview {
    width: 100%; height: 60px;
    border-radius: var(--r-md);
    border: 2px solid transparent;
    display: flex; align-items: center; justify-content: center;
    transition: all var(--t-fast);

    .tpl-lines {
      display: flex; flex-direction: column; gap: 4px; width: 60%;
      div {
        height: 4px; border-radius: var(--r-full);
        background: rgba(0,0,0,0.15);
        &:nth-child(2) { width: 70%; }
        &:nth-child(3) { width: 50%; }
      }
    }
  }

  span { font-size: 0.75rem; color: var(--c-muted); font-weight: 500; }

  &.active .tpl-preview {
    border-color: var(--c-accent);
    box-shadow: 0 0 12px rgba(255,140,66,0.2);
  }
}

.input-sm { padding: 8px 12px !important; font-size: 0.8125rem !important; }

// ── Gallery panel ─────────────────────────────────────────────────────────
.ep-body--gallery { gap: var(--sp-3); }
 
.ep-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1px 7px;
  border-radius: var(--r-full);
  background: rgba(96, 165, 250, 0.12);
  color: var(--c-info);
  font-size: 0.6875rem;
  font-weight: 700;
  margin-left: var(--sp-2);
  vertical-align: middle;
}
 
.gallery-hint {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-2);
  font-size: 0.75rem;
  color: var(--c-muted);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--c-border);
  border-radius: var(--r-md);
  padding: var(--sp-3);
  line-height: 1.5;
 
  i { flex-shrink: 0; margin-top: 1px; color: var(--c-info); }
}

// ── Save button ───────────────────────────────────────────────────────────
.save-btn { width: 100%; justify-content: center; padding: 14px; font-size: 0.9375rem; }

// ── Mini live preview (right sticky column) ───────────────────────────────
.ile-live-preview {
  position: sticky;
  top: calc(var(--header-height) + var(--sp-4));
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

.ilp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .ilp-label {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--c-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
}

.ilp-frame {
  padding: 24px 2px;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-xl);
  overflow: hidden;
  min-height: calc(100vh - 100px);
  max-height: 700px;
  // min-height: 400px;
}

// frame handle size height
.ilp-scroll {
  height: 100%;
  overflow-y: auto;
  // Scale the full-size letter to fit the narrow sidebar column
  transform: scale(0.55);
  transform-origin: top center;
  width: 181.8%;
  margin-left: -40.9%;
  min-height: calc(100vh + 500px);
  height: 100%;
  max-height: 700px;
  // min-height: 100vh;
}

// ── Accordion transition ──────────────────────────────────────────────────
.panel-body-enter-active,
.panel-body-leave-active {
  transition: all var(--t-base) var(--ease-out);
  overflow: hidden;
  max-height: 2000px;
}

.panel-body-enter-from,
.panel-body-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>
