<!-- components/ceremony/CeremonyCreateModal.vue -->
<!--
  Full 2-step wizard:
    Step 1 → RModal (type picker grid, 7 types)
    Step 2 → RModal (tabs: dynamic per-type form + shared schedule tab)

  Usage on a page:
    <CeremonyCreateModal v-model:open="showModal" @created="onCreated" />
-->
<template>

  <!-- ══════════════════════════════════════════════════════════
       STEP 1 — Event Type Picker
       title = isEdit.value
    ? tr('Edit Ceremony')
    : tr('Create Ceremony')

    isEdit
    ? updateCeremony()
    : createCeremony()
  ══════════════════════════════════════════════════════════ -->
  <RModal
    v-if="step === 1 && !isEdit"
    v-model="isOpen"
    :title="tBy({ en: 'Choose Event Type', km: 'ជ្រើសរើសប្រភេទព្រឹត្តិការណ៍' })"
    :description="tBy({ en: 'Each type has a unique form tailored to that ceremony.', km: 'ប្រភេទនីមួយៗមានទម្រង់ពិសេសសម្រាប់ពិធីនោះ។' })"
    icon="ri-add-large-fill"
    size="lg"
    :ui="{ content: 'type-picker-modal-content'}"
    class="w-[1500px]"
    :noClose="!selectedTypeId"
    @close="reset"
  >
    <div class="type-picker-wrap">
      <!-- 7-type grid -->
      <div class="type-grid">
        <div v-if="skeletonType" class="type-grid">
          <div
            v-for="i in 7"
            :key="i"
            class="type-card type-card--skeleton"
          >
            <RSkeleton class="type-skeleton-icon" />
            <RSkeleton class="type-skeleton-label" />
          </div>
        </div>
        <template v-else>
        <button
          v-for="t in eventTypeList"
          :key="t.id"
          type="button"
          class="type-card"
          :class="{ 'type-card--active': selectedTypeId === t.id }"
          @click="pickType(t.id)"
        >
          <div class="type-card-img-wrap">
            <img :src="t.icon" class="type-img" :alt="tBy(t.label)" />
          </div>
          <span class="type-label">{{ tBy(t.label) }}</span>
          <i v-if="selectedTypeId === t.id" class="ri-checkbox-circle-fill type-check" />
        </button>
        </template>
      </div>
    </div>

    <template #footer>
      <RBtn type="cancel" :label="tBy({ en: 'Cancel', km: 'បោះបង់' })" icon="ri-close-line" @click="cancel" />
      <RBtn type="next" :label="tBy({ en: 'Next', km: 'បន្តទៅមុខ' })" icon="ri-arrow-right-line" :disabled="!selectedTypeId" @click="goStep2" />
    </template>
  </RModal>

  <!-- ══════════════════════════════════════════════════════════
       STEP 2 — Event Form + Schedule (tabs)
  ══════════════════════════════════════════════════════════ -->
  <RModal
    v-else-if="step === 2 || isEdit"
    v-model="isOpen"
    size="xl"
    :title="tBy(selectedType?.modalTitle ?? { en: 'Program Details', km: 'ព័ត៌មានកម្មវិធី' })"
    :description="tBy(selectedType?.modalDesc ?? { en: 'Fill in the program information', km: 'បំពេញព័ត៌មានកម្មវិធី' })"
    modalWidth="900px"
    @close="reset"
  >
    <!-- ── Tabs ── -->
    <div class="modal-tabs">
      <button
        class="modal-tab"
        :class="{ 'modal-tab--active': activeTab === 'info' }"
        @click="activeTab = 'info'"
      >
        <i class="ri-file-text-line" />
        {{ tBy({ en: 'Program', km: 'កម្មវិធី' }) }}
      </button>
      <button
        class="modal-tab"
        :class="{ 'modal-tab--active': activeTab === 'schedule' }"
        @click="activeTab = 'schedule'"
      >
        <i class="ri-list-check-2" />
        {{ tBy({ en: 'Schedule', km: 'របៀបវារៈ' }) }}
        <span v-if="schedules.length" class="tab-count">{{ schedules.length }}</span>
      </button>
    </div>

    <!-- ── Tab: Info (dynamic per event type) ── -->
    <div v-show="activeTab === 'info'" class="tab-body">
      <!-- Renders the correct form component based on selectedTypeId -->
      <component
        :is="currentFormComponent"
        v-if="currentFormComponent"
        :key="selectedTypeId"
        ref="eventFormRef"
        @submit="onFormSubmit"
      />
    </div>
    <!-- ── Tab: Schedule ── -->
    <div v-show="activeTab === 'schedule'" class="tab-body">
      <ScheduleTab v-model="schedules" :event-id="props.eventId" />
    </div>

    <template #footer>
      <RBtn v-if="!isEdit" type="back" icon="ri-arrow-left-line" :label="tBy({ en: 'Back', km: 'ត្រលប់' })" @click="step = 1" />
      <RBtn noIcon type="save" :loading="saving" :label="saving
        ? (isEdit ? tBy({ en: 'Updating…', km: 'កំពុងកែប្រែ…' }) : tBy({ en: 'Creating…', km: 'កំពុងបង្កើត…' }))
        : (isEdit ? tBy({ en: 'Update Program', km: 'កែប្រែកម្មវិធី' }) : tBy({ en: 'Create Program', km: 'បង្កើតកម្មវិធី' }))" @click="submit" />
    </template>
  </RModal>
</template>

<script setup>
import { watch } from 'vue'
import { CalendarDate,Time,parseDate,parseTime } from '@internationalized/date'
// ── Per-type form components ────────────────────────────────────
import WeddingForm       from '~/components/system/setup_and_invitation/Events/WeddingForm.vue'
import EngagementForm    from '~/components/system/setup_and_invitation/Events/EngagementForm.vue'
import BirthdayForm      from '~/components/system/setup_and_invitation/Events/BirthdayForm.vue'
import HouseBlessingForm from '~/components/system/setup_and_invitation/Events/HouseBlessingForm.vue'
import FuneralForm       from '~/components/system/setup_and_invitation/Events/FuneralForm.vue'
import MonkCeremonyForm  from '~/components/system/setup_and_invitation/Events/MonkCeremonyForm.vue'
import FamilyGatheringForm from '~/components/system/setup_and_invitation/Events/FamilyGatheringForm.vue'
// import ScheduleTab       from '~/components/system/setup_and_invitation/Events/ScheduleTab.vue'

const props = defineProps(['open', 'ceremony', 'type', 'eventId'])
const ceremony = computed(() => props.ceremony ?? null)
const isEdit = computed(() => !!ceremony.value && !!props.eventId)
const emit  = defineEmits(['update:open', 'created', 'updated', 'saved'])
const eventTypeStore = useEventTypeStore()
const eventStore = useEventStore()
const useCeremony = useCeremonyStore()
const toast = useToastStore()
const typeList = ref([])
const skeletonType = ref(false)

// ── v-model bridge ──────────────────────────────────────────────
const isOpen = computed({
  get: () => props.open,
  set: (v) => emit('update:open', v),
})

// Load event types once, then sync wizard state with the edit context
watch(isOpen, async (v) => {
  if (!v) { reset(); return }
  if (!eventTypeStore.initialized) await eventTypeStore.fetchTypes()
  typeList.value = eventTypeStore.types ?? []
  skeletonType.value = false
  await applyEditContext()
})

// ── Edit mode ────────────────────────────────────────────────────
const applyEditContext = async () => {
  if (!isEdit.value || !ceremony.value) return
  selectedTypeId.value = props.type || ceremony.value.type || ''
  step.value = 2
  activeTab.value = 'info'
  await prefillForm(ceremony.value)
}

const splitName = (full) => {
  const parts = String(full || '').trim().split(/\s+/)
  return { first: parts[0] || '', last: parts.slice(1).join(' ') }
}

const prefillForm = async (ev) => {
  if (!ev) return

  const bride = splitName(ev.host1Name || ev.brideName)
  const groom = splitName(ev.host2Name || ev.groomName)

  const src = {
    title: ev.title ?? '',

    eventDate:
      ev.date instanceof CalendarDate
        ? ev.date
        : typeof ev.date === 'string'
          ? parseDate(ev.date.slice(0, 10))
          : undefined,

    eventTime:
      ev.time instanceof Time
        ? ev.time
        : typeof ev.time === 'string'
          ? parseTime(ev.time.slice(0, 5))
          : undefined,

    venue: ev.venue ?? '',
    budget: Number(ev.budget ?? ev.totalBudget ?? 0),

    brideFirstName: bride.first,
    brideLastName: bride.last,
    groomFirstName: groom.first,
    groomLastName: groom.last,
  }

  for (let i = 0; i < 8; i++) {
    await nextTick()

    const f = eventFormRef.value?.form

    if (f) {
      Object.assign(f, src)
      return
    }

    await new Promise(resolve => setTimeout(resolve, 50))
  }
}

// ── Static event type registry ──────────────────────────────────
const EVENT_TYPES = [
  {
    id: 'wedding',
    label:      { en: 'Wedding / Anniversary',    km: 'ពិធីមង្គលការ / អាពាហ៍ពិពាហ៍' },
    modalTitle: { en: 'Wedding Program',           km: 'កម្មវិធីមង្គលការ' },
    modalDesc:  { en: 'Couple & ceremony details', km: 'ព័ត៌មានគូស្នេហ៍ និងពិធី' },
    icon:       '/images/events/wedding.svg',
    component:  WeddingForm,
  },
  {
    id: 'engagement',
    label:      { en: 'Diamond Ring / Engagement', km: 'ពិធីស្ករគ្រីស្ទ/ព្រាប់ចិត្ត' },
    modalTitle: { en: 'Engagement Program',        km: 'កម្មវិធីស្ករគ្រីស្ទ' },
    modalDesc:  { en: 'Ring exchange details',     km: 'ព័ត៌មានផ្ដល់ចិត្ត' },
    icon:       '/images/events/engagement.svg',
    component:  EngagementForm,
  },
  {
    id: 'birthday',
    label:      { en: 'Birthday',                  km: 'ខួបកំណើត' },
    modalTitle: { en: 'Birthday Program',          km: 'កម្មវិធីខួបកំណើត' },
    modalDesc:  { en: 'Party & celebration setup', km: 'ការរៀបចំពិធីខួបកំណើត' },
    icon:       '/images/events/birthday.svg',
    component:  BirthdayForm,
  },
  {
    id: 'house',
    label:      { en: 'House Blessing',            km: 'ពិធីឡើងផ្ទះ' },
    modalTitle: { en: 'House Blessing Program',    km: 'កម្មវិធីឡើងផ្ទះ' },
    modalDesc:  { en: 'New home blessing details', km: 'ព័ត៌មានពិធីឡើងផ្ទះ' },
    icon:       '/images/events/house.svg',
    component:  HouseBlessingForm,
  },
  {
    id: 'funeral',
    label:      { en: 'Funeral',                   km: 'បុណ្យសព' },
    modalTitle: { en: 'Funeral Program',           km: 'កម្មវិធីបុណ្យសព' },
    modalDesc:  { en: 'Memorial arrangements',     km: 'ការរៀបចំសំណាក' },
    icon:       '/images/events/funeral.svg',
    component:  FuneralForm,
  },
  {
    id: 'monk',
    label:      { en: 'Monk Ceremony',             km: 'កិច្ចបួស' },
    modalTitle: { en: 'Monk Ordination Program',   km: 'កម្មវិធីបួស' },
    modalDesc:  { en: 'Ordination ceremony setup', km: 'ការរៀបចំពិធីបួស' },
    icon:       '/images/events/monk.svg',
    component:  MonkCeremonyForm,
  },
  {
    id: 'family',
    label:      { en: 'Family Gathering',          km: 'ជំនុំជម្រះគ្រួសារ' },
    modalTitle: { en: 'Family Gathering Program',  km: 'កម្មវិធីជួបជុំគ្រួសារ' },
    modalDesc:  { en: 'Reunion & gathering setup', km: 'ការរៀបចំការជួបជុំ' },
    icon:       '/images/events/family.svg',
    component:  FamilyGatheringForm,
  },
]


const eventTypeList = computed(() => {
  const list = typeList.value;

  if (!list.length) {
    return EVENT_TYPES;
  }

  // Map DB event types (code WEDDING, ENGAGEMENT, …) to picker cards
  return list
    .filter((item) => item.active !== false)
    .map((item) => {
      const code = String(item.code || item.name || item.id || '').toLowerCase()
      return {
        id: code,
        label: {
          en: item.name || item.display_name_en || item.code,
          km: item.nameKm || item.display_name_kh || item.name || item.code,
        },
        modalTitle: {
          en: item.name || 'Event Program',
          km: item.nameKm || 'កម្មវិធី',
        },
        modalDesc: {
          en: item.description || `Event type: ${item.name}`,
          km: item.description || `ប្រភេទកម្មវិធី: ${item.name}`,
        },
        icon: (item.icon && (item.icon.startsWith('/') || item.icon.startsWith('http')))
          ? item.icon
          : `/images/events/${code}.svg`,
        component: getComponentByName(code),
      }
    });
});

function getComponentByName(name) {
  const key = String(name || '').toLowerCase()
  console.log('getComponentByName Key =========>', key)
  const components = {
    'wedding': WeddingForm,
    'anniversary': WeddingForm,
    'engagement': EngagementForm,
    'birthday': BirthdayForm,
    'house': HouseBlessingForm,
    'housewarming': HouseBlessingForm,
    'funeral': FuneralForm,
    'monk': MonkCeremonyForm,
    'monk_ceremony': MonkCeremonyForm,
    'religious': MonkCeremonyForm,
    'family': FamilyGatheringForm,
    'family_gathering': FamilyGatheringForm,
  };
  return components[key] || WeddingForm;
}

// ── Wizard state ────────────────────────────────────────────────
const step           = ref(1)
const activeTab      = ref('info')
const saving         = ref(false)
const selectedTypeId = ref(null)
const eventFormRef   = ref(null)
const schedules      = ref([])

// ── Derived ─────────────────────────────────────────────────────
const selectedType = computed(() =>
  eventTypeList.value.find((t) => t.id === selectedTypeId.value) ?? null
)

// ── Step 1 actions ───────────────────────────────────────────────
const pickType = (id) => { selectedTypeId.value = id }

const goStep2 = () => {
  if (!selectedTypeId.value) return
  step.value    = 2
  activeTab.value = 'info'
}

const currentFormComponent = computed(() => {
  const id = (isEdit.value && props.type) || selectedTypeId.value
  console.log('currentFormComponent Id ', id)
  if (!id) return null
  const typeItem = eventTypeList.value.find((t) => t.id === id)
  console.log('typeItem', typeItem)
  console.log("typeItem?.component ?? getComponentByName(id)", typeItem?.component ?? getComponentByName(id))
  return typeItem?.component ?? getComponentByName(id)
})
// ── Submit ───────────────────────────────────────────────────────
// Reads the child form's reactive `form` via defineExpose, then
// creates or updates the event through the event store.
const submit = async () => {
  const childForm = eventFormRef.value?.form
  if (!childForm) return
    const typeCode = (isEdit.value && props.type) || selectedTypeId.value
    const dbType = eventTypeStore.types.find(
      (t) => String(t.code || '').toLowerCase() === String(typeCode || '').toLowerCase()
    )
  saving.value = true
  const payload = {
    ...toEventPayload(childForm),
    eventTypeId: dbType?.id ?? null,
  }
  console.log("Payload -=-=-=-=-=-=-=====> ", payload)
  try {
    // Create or update event
    let eventId

    if (isEdit.value) {
      const res = await eventStore.saveEvent(props.eventId, payload)

      if (!res.success) {
        throw new Error(res.error?.message || 'Failed to update event')
      }

      eventId = props.eventId
    } else {
      const created = await eventStore.addEvent(payload)

      if (!created?.id) {
        throw new Error('Failed to create event')
      }

      eventId = created.id
    }

    // Wait for ALL schedules to finish
    await persistSchedules(eventId, payload.eventDate)

    // Optional: refresh ceremonies/events
    await Promise.all([
      eventStore.fetchEvents(),
      useCeremony.fetchCeremonies(),
    ])

    toast.add({
      title: isEdit.value ? 'Event updated successfully' : 'Event created successfully',
      description: isEdit.value ? 'Event updated successfully' : 'Event created successfully',
      type: 'success'
  })

    emit('saved')
    isOpen.value = false

  } catch (err) {
    console.error(err)
    toast.add({
      title: err?.message || 'Operation failed',
      description: err?.message || 'Operation failed',
      type: 'error'
  })

    // Keep modal open
    return
  } finally {
    saving.value = false
  }
}
// Maps the various per-type child forms to the backend event payload.
// Core fields are normalized here; every remaining form key is passed
// through untouched so the event store's dynamic-payload builder can
// map known generic fields and bucket type-specific extras into
// extraData (the backend catch-all JSON column).
const toEventPayload = (f) => {
  const host1 = (f.brideFirstName || f.host1Name || f.organizerName || f.familyName || f.ownerName || '')
    + (f.brideLastName ? ` ${f.brideLastName}` : '')
  const host2 = (f.groomFirstName || f.host2Name || f.spouseName || '')
    + (f.groomLastName ? ` ${f.groomLastName}` : '')

  const dateStr = toDateStr(f.eventDate)
  const timeStr = toTimeStr(f.eventTime)
  let eventDate = ''
  if (dateStr) {
    eventDate = timeStr ? `${dateStr}T${timeStr}` : `${dateStr}T00:00`
    if (eventDate.length === 16) eventDate = `${eventDate}:00`
  }

  // Normalize picker date/time instances so they serialize cleanly
  const normalized = { ...f }
  ;['eventEndDate', 'prepDate', 'dateOfPassing', 'plannedWeddingDate'].forEach((k) => {
    if (normalized[k]) normalized[k] = toDateStr(normalized[k])
  })
  if (normalized.eventTime) normalized.eventTime = toTimeStr(normalized.eventTime)

  return {
    ...normalized,
    title: f.title || [host1, host2].filter(Boolean).join(' & ') || 'My Event',
    host1Name: host1.trim(),
    host2Name: host2.trim(),
    groomPhone: f.groomPhone || f.host1Phone || f.ownerPhone || '',
    bridePhone: f.bridePhone || f.spousePhone || f.contactPhone || '',
    eventDate,
    location: f.venue || f.location || f.houseAddress || '',
    totalBudget: Number(f.budget || f.totalBudget || 0),
    status: 'PLANNING',
  }
}

// CalendarDate (from RDateInputPicker) → "yyyy-MM-dd", otherwise passthrough.
const toDateStr = (v) => {
  if (!v) return ''
  if (v instanceof CalendarDate) {
    return `${v.year}-${String(v.month).padStart(2, '0')}-${String(v.day).padStart(2, '0')}`
  }
  return String(v).slice(0, 10)
}

// Time (from RTimeInputPicker) → "HH:mm", otherwise passthrough.
const toTimeStr = (v) => {
  if (!v) return ''
  if (v instanceof Time) {
    return `${String(v.hour).padStart(2, '0')}:${String(v.minute).padStart(2, '0')}`
  }
  return String(v).slice(0, 5)
}

// Persists Schedule-tab rows to POST /api/v1/events/{eventId}/schedules.
// Rows already saved (have an `id`) are updated; new rows are created.
const persistSchedules = async (eventId, eventDate) => {
  const rows = (schedules.value || []).filter((r) => r?.name?.trim())
  if (!rows.length || !eventId) return
  const dateStr = toDateStr(eventDate)
  for (const row of rows) {
    const form = {
      name: row.name.trim(),
      eventDate: dateStr,
      startTime: row.startTime || '00:00',
      endTime: row.endTime || '',
      venueId: row.venueId || null,
      priority: Number(row.priority ?? 0),
      type: 'CEREMONY',
      eventId: eventId,
      totalBudget: Number(row.totalBudget ?? 0),
      status: 'PLANNING',
      description: row.notes || row.description || '',
    }
    if (row.id) {
      const res = await useCeremony.updateCeremony(row.id, form, eventId)
      if (!res.success) {
        throw new Error(res.error?.message || `Failed to update ceremony "${row.name}"`)
      }
    } else {
      const res = await useCeremony.addCeremony(form, eventId)
      if (!res.success) {
        throw new Error(res.error?.message || `Failed to create ceremony "${row.name}"`)
      }
    }
  }
}

// Called when a child form fires @submit (optional, submit btn above is primary)
const onFormSubmit = (_formData) => {
  console.log('onFormSubmit', _formData)
  // child form's @onSubmit fires here — same as clicking the modal footer button
  submit()
}

// ── Reset ────────────────────────────────────────────────────────
const cancel = () => { isOpen.value = false; reset() }

const reset = () => {
  step.value           = 1
  activeTab.value      = 'info'
  selectedTypeId.value = null
  schedules.value      = []
  saving.value         = false
}

watch(isOpen, (v) => { if (!v) reset() })
</script>

<style lang="scss" scoped>
// ── Type picker modal overrides ──────────────────────────────────
.type-picker-wrap { padding: 4px 0 8px; }

.type-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;

  @media (max-width: 520px) { grid-template-columns: repeat(2, 1fr); }
}

.type-card {
  position: relative;
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  padding: 20px 12px 16px;
  border: 1px solid var(--c-border);
  border-radius: var(--r-lg);
  background: var(--bg-c-card);
  cursor: pointer;
  transition:
    border-color var(--t-base),
    background var(--t-base),
    transform var(--t-fast),
    box-shadow var(--t-base);

  &:hover {
    border-color: var(--c-border);
    background: var(--c-hover);
    transform: translateY(-2px);
    box-shadow: var(--glow-accent-sm);
  }

  &--active {
    border-color: var(--c-active);
    box-shadow: var(--glow-primary-sm);
  }

  .type-card-img-wrap {
    width: 60px; height: 60px;
    display: flex; align-items: center; justify-content: center;
  }

  .type-img {
    width: 54px; height: 54px; object-fit: contain;
    transition: transform var(--t-base);
  }

  &:hover .type-img { transform: scale(1.08); }

  .type-label {
    font-size: 0.78rem; font-weight: 600;
    color: var(--c-text); text-align: center; line-height: 1.3;
  }

  .type-check {
    position: absolute; top: 8px; right: 8px;
    font-size: 18px; color: var(--c-accent);
  }
}

// ── Step 2 modal ─────────────────────────────────────────────────
.modal-tabs {
  display: flex; align-items: center; gap: 2px;
  border-bottom: 1px solid var(--c-border);
  margin-bottom: 18px;
}

.modal-tab {
  display: flex; align-items: center; gap: 6px;
  padding: 10px 16px;
  font-size: 0.8375rem; font-weight: 500;
  color: var(--c-muted);
  background: none; border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  margin-bottom: -1px;
  transition: color var(--t-fast), border-color var(--t-fast);

  i { font-size: 15px; }

  &--active { color: var(--c-accent); border-bottom-color: var(--c-accent); }
  &:hover:not(&--active) { color: var(--c-text); }

  .tab-count {
    display: inline-flex; align-items: center; justify-content: center;
    min-width: 18px; height: 18px; padding: 0 5px;
    background: var(--c-accent); color: #fff;
    border-radius: var(--r-full); font-size: 0.65rem; font-weight: 700;
  }
}

.tab-body { min-height: 200px; margin-bottom: 20px; }

.type-card--skeleton {
  pointer-events: none;
  cursor: default;
}

.type-skeleton-icon {
  width: 54px;
  height: 54px;
  border-radius: 999px;
}

.type-skeleton-label {
  width: 80%;
  height: 12px;
  border-radius: 6px;
}
</style>
