<template>
  <RHead :title="tr('events.event_info')"/>
  <RWrapperPage class="event-info-page">
    <RContent class="space-y-2">
    <!-- ── Main event summary (bound to eventStore.activeEvent) ─────────────── -->
    <RCard
      v-if="activeEvent"
      icon="i-lucide-calendar-event"
      class="ei-summary-card"
    >
      <div class="ei-summary">
        <RImage
          v-if="activeEvent.coverImage"
          :src="activeEvent.coverImage"
          class="ei-summary__cover"
          alt=""
        />
        <div class="ei-summary__body">
          <div class="ei-summary__head">
            <span class="ei-summary__type">
              <i :class="param?.eventType?.icon || activeEvent.eventType?.icon || 'ri-calendar-line'" />
              {{ param?.eventType?.name || activeEvent.eventType?.name || activeEvent.eventTypeLabel || 'Event' }}
            </span>
            <span v-if="activeEvent.status || param?.status" class="ei-status-chip" :class="`status-${(param?.status || activeEvent.status || '').toLowerCase()}`">
              {{ param?.status || activeEvent.status }}
            </span>
          </div>
          <h3 class="ei-summary__title">{{ param?.title || activeEvent.title || activeEvent.eventName }}</h3>
          <p v-if="activeEvent.host1Name || activeEvent.host2Name" class="ei-summary__couple">
            <i class="ri-user-heart-line" />
            {{ activeEvent.host1Name }}<span v-if="activeEvent.host1Name && activeEvent.host2Name"> &amp; </span>{{ activeEvent.host2Name }}
          </p>
          <div class="ei-summary__meta">
            <span v-if="venueName || activeEvent.location || activeEvent.venue" class="ei-meta-chip">
              <i class="ri-map-pin-line" />{{ venueName || activeEvent.location || activeEvent.venue }}
            </span>
            <span v-if="activeEvent.totalBudget || activeEvent.budget" class="ei-meta-chip">
              <i class="ri-money-dollar-circle-line" />{{ Number(activeEvent.totalBudget || activeEvent.budget).toLocaleString() }}
            </span>
          </div>
        </div>
      </div>
    </RCard>

      <!-- Loading -->
      <div v-if="ceremony.loading" class="ei-empty-state">
        <i class="ri-loader-4-line ri-spin" style="font-size:2rem;color:var(--c-muted)" />
      </div>

      <!-- Empty -->
      <div v-else-if="ceremony.items.length === 0" class="ei-empty-state glass-card">
        <div class="ei-empty-icon"><i class="ri-calendar-event-line" /></div>
        <h3>{{ tr('no_event_selected') }}</h3>
        <p class="ei-empty-desc">{{ tr('add_ceremony_first') }}</p>
        <RBtn type="add" icon="ri-add-line" color="primary" @click="openAdd">
          {{ tr('add_ceremony') }}
        </RBtn>
      </div>

      <!-- Timeline -->
      <RCard
        v-else
        :title="tr('events.title')"
        icon="i-lucide-git-commit-vertical"
        class="ei-timeline-card"
      >
        <RTimeline
          :items="timelineItems"
          :default-value="timelineItems[0]?.value"
          size="sm"
          class="w-full"
        >
          <!-- Custom wrapper: full content area per item -->
          <template #wrapper="{ item }">
            <div class="ei-item">
              <!-- Row 1: title + action buttons -->
              <div class="ei-item__head">
                <div class="ei-item__title-wrap">
                  <h3 class="ei-item__name">{{ item?.title }}</h3>
                </div>
                <RBtns
                  :data="[
                    { type: 'edit',   icon: 'ri-edit-line',       size: 'xs', label: tr('edit')   },
                    { type: 'delete', icon: 'ri-delete-bin-line', size: 'xs', label: tr('delete') }
                  ]"
                  @click="(type) => handleAction(type, item._raw)"
                />
              </div>
              <!-- Row 2: meta chips -->
              <div class="ei-item__meta">
                <span v-if="item.date" class="ei-meta-chip">
                  <i class="ri-calendar-line" />{{ item.date }}
                </span>
                <div v-if="item.startTime" class="ei-meta-chip">
                  <span><i class="ri-time-line" />{{ item.startTime }} - {{ item.endTime }}</span>
                </div>
                <span v-if="item.durationMinutes" class="ei-meta-chip">
                  <i class="ri-hourglass-line" />{{ item.durationMinutes }} {{ tr('events.minutes') }}
                </span>
                <span v-if="item.address" class="ei-meta-chip">
                  <i class="ri-map-pin-line" />{{ item.address }}
                </span>
                <span v-if="item.status" class="ei-status-chip" :class="`status-${item.status.toLowerCase()}`">
                  {{ item.status }}
                </span>
              </div>

              <!-- Row 3: description -->
              <p v-if="item.description" class="ei-item__desc">{{ item.description }}</p>
            </div>
          </template>
        </RTimeline>
      </RCard>
    </RContent>

    <!-- Add / Edit Slider -->
    <RSlider
      v-model="isOpen"
      :title="editingId ? tr('events.edit_event') : tr('events.add_event')"
      icon="ri-calendar-event-fill"
      :description="editingId
        ? tr('events.update_details')
        : tr('events.fill_details')"
    >
      <RForm class="modal-form space-y-2" ref="formRef" :schema="eventSchema" :state="eventForm" @onError="onError" @onSubmit="saveEvent">
        <div class="form-wrapper">
          <!-- AI translate hint -->
          <div class="ai-translate-row">
            <span class="ai-translate-hint">
              <i class="ri-sparkling-line" />
              {{ tr('events.auto_fill_hint') }}
            </span>
            <AITranslateButton
              :fields="{ name: eventForm.name, description: eventForm.description, address: eventForm.address }"
              @result="onEventTranslated"
            />
          </div>

          <!-- Name -->
          <RFormGroup name="name" :label="tr('events.name')" required>
            <RInput v-model="eventForm.name" />
          </RFormGroup>

          <RFormGroup name="eventDate" :label="tr('events.event_date')" required>
            <RDateInputPicker v-model="eventForm.eventDate" />
          </RFormGroup>

          <div class="two-col">
            <RFormGroup name="startTime" :label="tr('events.start_time')">
              <RTimeInputPicker v-model="eventForm.startTime" />
            </RFormGroup>
            <RFormGroup name="endTime" :label="tr('events.end_time')">
              <RTimeInputPicker v-model="eventForm.endTime" />
            </RFormGroup>
          </div>

          <!-- Two-col: durationMinutes + orderIndex -->
          <div class="two-col">
            <RFormGroup name="durationMinutes" :label="tr('events.duration_minutes')">
              <RInput v-model.number="eventForm.durationMinutes" type="number" min="1" />
            </RFormGroup>
            <RFormGroup name="totalBudget" :label="tr('Total Budget')">
              <RInput v-model.number="eventForm.totalBudget" type="number" min="0" />
            </RFormGroup>
            <RFormGroup name="orderIndex" :label="tr('common.priority')">
              <RInput v-model.number="eventForm.orderIndex" type="number" min="0" />
            </RFormGroup>
          </div>

          <!-- Status -->
          <RFormGroup name="status" :label="tr('common.status')">
            <RSelect
              v-model="eventForm.status"
              :localData="{ data: statusOptions, keySearch: ['Name','NameEnglish'] }"
              pk="Id"
              :placeholder="tr('common.select_status')"
            />
          </RFormGroup>
          <RFormGroup name="type" :label="tr('events.type')">
            <RSelect
              v-model="eventForm.type"
              :localData="{ data: typeOptions, keySearch: ['Name','NameEnglish'] }"
              pk="Id"
              :placeholder="tr('common.select_type')"
            />
          </RFormGroup>

          <!-- Address -->
          <RFormGroup name="address" :label="tr('events.address')">
            <RInput v-model="eventForm.address" />
          </RFormGroup>

          <!-- Description -->
          <RFormGroup name="description" :label="tr('events.description')">
            <RTextarea ai v-model="eventForm.description" rows="3" style="resize:vertical" />
          </RFormGroup>
        </div>
      </RForm>

      <template #footer>
        <RBtn type="cancel" icon="cancel" :label="tr('cancel')" :disabled="saving" @click="isOpen = false" />
        <RBtn type="save" icon="submit" :label="tr('save')" :loading="saving" @click="submitForm" />
      </template>
    </RSlider>
  </RWrapperPage>
  <CreateWeddingForm v-model:open="openWedForm" />
</template>

<script setup>
import { computed } from 'vue'
import { z } from 'zod'
import { CalendarDate ,parseTime} from '@internationalized/date'
definePageMeta({
  layout: 'navbar',
  middleware: ['auth', 'permission'],
  permission: 'SEND_INVITATION',
})
const { tr } = useTr()
const eventStore = useEventStore()
const ceremony = useCeremonyStore()
const confirm = useConfirmStore()
const toast = useToast()

const param = queryParams().event
console.log("PARAM =============> ", param)

const isOpen = ref(false)
const openWedForm = ref(false)
const editingId = ref(null)
const formRef = ref()
const saving = ref(false)
const isLoading = ref(false)

usePageBreadcrumb({
  title: param?.id ? 'Event Info' : 'Create Event',
  description: 'Manage ceremony events for this wedding',
  icon: 'i-lucide-calendar',

  // ── Back button ──────────────────────────────────────────────────────
  showBack: true,
  backTooltip: 'Back to dashboard',
  fnBack: () => navigateTo('/events'),        // optional — falls back to router.back()
  
  // ── Right side: action buttons ──────────────────────────────────────
  actions: [
    {
      label: 'Add Event',
      icon: 'ri-add-line',
      type: 'create',
      color: 'create',
      // variant: 'solid',
      size: 'xs',
      to: '/events/new',                      // navigates via NuxtLink logic
      onClick: () => openAdd()
    },
    // {
    //   label: 'Export',
    //   icon: 'ri-download-2-line',
    //   color: 'neutral',
    //   variant: 'outline',
    //   size: 'xs',
    //   onClick: () => exportEvents(),          // custom handler wins over `to`
    // },
    // {
    //   label: 'Save',
    //   icon: 'ri-save-line',
    //   color: 'success',
    //   size: 'xs',
    //   loading: saving.value,                  // reactive loading/disabled both supported
    //   // disabled: !isDirty.value,
    //   onClick: () => submitForm(),
    // },
  ],

  items: [
    {
      label: tr('events'),
      to: '/events',
      tooltipLabel:'Back to event list'
      // icon: 'ri-home-smile-2-line',
    },
    {
      label: 'Event Info',
    },
  ],
})
// ── Main event (bind for header/details context) ─────────────────────────────
const activeEvent = computed(() => eventStore.activeEvent || null)

// ── Default form ──────────────────────────────────────────────────────────────
const defaultForm = () => ({
  name: '',
  nameEn: '',
  eventDate: undefined,
  scheduleTime: undefined,
  startTime: '',
  endTime: '',
  venueId: '',
  priority: '',
  type: '',
  totalBudget: 0,
  status: '',
  description: '',
  descriptionEn: '',
})

const eventForm = ref(defaultForm())

// ── Validation schema ─────────────────────────────────────────────────────────
const eventSchema = z.object({

  name: z.string()
    .min(2, 'Name is required'),

  // nameEn: z.string().optional(),

  eventDate: z.any()
    .refine(
      val => val !== null && val !== undefined,
      { message: 'Date is required' }
    )
    .refine(
      val => val instanceof CalendarDate,
      { message: 'Invalid date format' }
    ),
  // eventDate: z.any().optional(),

  scheduleTime: z.string().optional(),

  durationMinutes: z.number().optional(),

  startTime: z.any().optional(),

  endTime: z.any().optional(),

  venueId: z.string().optional(),

  priority: z.string().optional(),

  // type: z.string().optional(),
  type: z.object({
    Id: z.string(),
    Name: z.string(),
    NameEnglish: z.string()
  }).optional(),


  totalBudget: z.number() .min(0) .optional(),
  // status:z.string(),
  status: z.object({
    Id: z.string(),
    Name: z.string(),
    NameEnglish: z.string()
  }).optional(),

  description: z.string().optional(),

  descriptionEn: z.string().optional(),
})

// Venue name pulled from the main event's translations (bilingual)
const venueName = computed(() => {
  const t = activeEvent.value?.translations?.venue
  if (!t) return ''
  return tBy({ en: t.en, km: t.km })
})

const ceremonyList = ref([])

onMounted(async () => {
  if (!param?.id) return

  isLoading.value = true

  try {
    const data = await ceremony.getCeremonyById(param.id)

    ceremonyList.value = Array.isArray(data)
      ? data.map(ev => ({
          ...ev,
          orderIndex: Math.max(0, ev?.orderIndex ?? 999),
        }))
      : []
  } finally {
    isLoading.value = false
  }
})

const sortedCeremonyList = computed(() => {
  return [...(ceremonyList.value || [])]
    .sort((a, b) => {
      const ia = Math.max(0, a?.orderIndex ?? 999)
      const ib = Math.max(0, b?.orderIndex ?? 999)
      return ia - ib
    })
})

// ── Map store items → RTimeline items (sorted by orderIndex asc) ─────────────
const timelineItems = computed(() =>
  sortedCeremonyList.value.map((ev) => {
    const dt = ev.scheduleTime || ''
    const date = dt ? dt.slice(0, 10) : ''
    const time = dt && dt.length >= 16 ? dt.slice(11, 16) : undefined

    return {
      value: ev.id,
      title: tBy({
        km: ev.name,
        en: ev.translations?.name?.en || ev.name
      }),
      date,
      scheduleTime: time,
      startTime: ev.startTime || time,
      endTime: ev.endTime || '',
      time: { start: time },
      status: ev.status,
      durationMinutes: ev.durationMinutes,
      address: tBy({
        km: ev.address,
        en: ev.translations?.address?.en || ev.address
      }),
      description: tBy({
        km: ev.description,
        en: ev.translations?.description?.en || ev.description
      }),
      _raw: ev,
    }
  })
)

// const timelineItems = computed(() =>
//   ceremonyList.value
//     .map((ev) => {
//       const dt = ev.scheduleTime || ''
//       const date = dt ? dt.slice(0, 10) : ''
//       const time = dt && dt.length >= 16 ? dt.slice(11, 16) : undefined
//       return {
//         value: ev.id,
//         title: tBy({ km: ev.name, en: ev.translations?.name?.en || ev.name }),
//         date,
//         scheduleTime: time,
//         startTime: ev.startTime || time,
//         endTime: ev.endTime || '',
//         time: { start: time },
//         status: ev.status,
//         durationMinutes: ev.durationMinutes,
//         address: tBy({ km: ev.address, en: ev.translations?.address?.en || ev.address }),
//         description: tBy({ km: ev.description, en: ev.translations?.description?.en || ev.description }),
//         _raw: ev,
//       }
//     })
// )

// ── Select options ────────────────────────────────────────────────────────────
const statusOptions = [
  { Id: 'PENDING',     Name: 'កំពុងរង់ចាំ',   NameEnglish: 'Pending'     },
  { Id: 'IN_PROGRESS', Name: 'កំពុងដំណើរការ', NameEnglish: 'In Progress' },
  { Id: 'DONE',        Name: 'បានបញ្ចប់ហើយ',  NameEnglish: 'Done'        },
]

// ── Actions ───────────────────────────────────────────────────────────────────
function submitForm() { formRef.value.submit() }
function onError(e)   { console.warn('form error', e.errors) }

const openAdd = () => {
  editingId.value = null
  Object.assign(eventForm.value, defaultForm())
  isOpen.value = true
}

const handleAction = (type, ev) => {
  if (type === 'edit') {
    editingId.value = ev.id
    const dt = ev.scheduleTime || ''
    const [y, m, d] = (dt ? dt.split('T')[0] : '').split('-').map(Number)
    Object.assign(eventForm.value, {
      name: ev.name,
      eventDate: y && m && d ? new CalendarDate(y, m, d) : null,
      startTime: ev.startTime || (dt && dt.length >= 16 ? dt.slice(11, 16) : ''),
      endTime: ev.endTime || '',
      scheduleTime: dt && dt.length >= 16 ? dt.slice(11, 16) : undefined,
      venueId: ev.venueId || '',
      priority: ev.priority || 'NORMAL',
      type: typeOptions.find((x) => x.Id === ev.type),
      totalBudget: ev.totalBudget || 0,
      status: statusOptions.find((x) =>
        String(x.Id || '').toLowerCase().replace('-', '_') === String(ev.status || '').toLowerCase().replace('-', '_')),
      description: ev.description || '',
      descriptionEn: ev.translations?.description?.en || '',
    })
    isOpen.value = true
  } else if (type === 'delete') {
    confirm.show({
      type: 'delete',
      message: tr('events.delete_event', 'Delete this event?'),
      onConfirm: async () => {
        const res = await ceremony.deleteCeremony(ev.id, param?.id)
        if (res.success) {
          toast.add({title:tr('events.deleted')})
          isLoading.value = true
          // if (param?.id) ceremonyList.value = await ceremony.getCeremonyById(param.id)
          isLoading.value = false
        } else toast.add({title:tr('events.delete_failed')})
      }
    })
  }
}

const saveEvent = async (event) => {
  saving.value = true
  try {
    const d = eventForm.value

    // const formData = {
    //   name:            d.name,
    //   description:     d.description,
    //   eventDate:
    //     d.eventDate
    //     ? `${d.eventDate.year}-${String(d.eventDate.month).padStart(2,'0')}-${String(d.eventDate.day).padStart(2,'0')}`
    //     : null,
    //   startTime:d.startTime,
    //   endTime:d.endTime,
    //   venueId:         d.venueId,

    //   priority:         d.priority,
    //   type:         d.type,
    //   totalBudget:         d.totalBudget,
    //   status:          d.status?.Id,
    //   translations: {
    //     name:        { km: d.name,        en: d.nameEn },
    //     description: { km: d.description, en: d.descriptionEn },
    //     address:     { km: d.address,      en: d.addressEn },
    //   },
    // }

    const formData = {
      name: d.name,
      eventDate:
        d.eventDate
        ? `${d.eventDate.year}-${String(d.eventDate.month).padStart(2, '0')}-${String(d.eventDate.day).padStart(2, '0')}`
        : null,
      startTime: d.startTime,
      endTime: d.endTime,
      scheduleTime: d.scheduleTime ? `${d.eventDate.year}-${String(d.eventDate.month).padStart(2, '0')}-${String(d.eventDate.day).padStart(2, '0')}T${d.scheduleTime}` : undefined,
      venueId: d.venueId,
      priority: d.priority,
      type: d.type?.Id ?? 'CEREMONY',
      totalBudget: Number(d.totalBudget),
      durationMinutes: Number(d.durationMinutes) || 60,
      status: String(d.status?.Id || 'PENDING').toLowerCase().replace('_', '-'),
      address: d.address,
      description: d.description,
      translations: {
        name: {
          km: d.name,
          en: d.nameEn
        },
        description: {
          km: d.description,
          en: d.descriptionEn
        },
        address: {
          km: d.address,
          en: d.addressEn
        }
      }
    }

    console.log("editingId.value===================> ", editingId.value)

    const res = editingId.value
      ? await ceremony.updateCeremony(editingId.value, formData, param?.id)
      : await ceremony.addCeremony(formData, param?.id)

    console.log("Res =========================> ", res)

    if (!res.success) throw new Error(res.error?.message || tr('events.save_failed', 'Failed to save'))
    if (res.success) {
      isOpen.value = false
      saving.value = false
    }
    toast.add({title: editingId.value ? tr('events.updated') : tr('events.created')})
    if (param?.id) ceremonyList.value = await ceremony.getCeremonyById(param.id)
    editingId.value = null
  } catch (err) {
    toast.add({title: err?.message || tr('events.save_failed', 'Failed to save event')})
  } finally {
    saving.value = false
  }
}

const onEventTranslated = (result) => {
  if (result.name?.en)        eventForm.value.nameEn = result.name.en
  if (result.description?.en) eventForm.value.descriptionEn = result.description.en
  if (result.address?.en)     eventForm.value.addressEn = result.address.en
}

const typeOptions=[
 {
  Id:'PREPARATION',
  Name:'រៀបចំ',
  NameEnglish:'Preparation'
 },
 {
  Id:'CEREMONY',
  Name:'ពិធីការ',
  NameEnglish:'Ceremony'
 },
 {
  Id:'PARTY',
  Name:'ជប់លៀង',
  NameEnglish:'Party'
}
]

</script>

<style lang="scss">
// ── Page layout ───────────────────────────────────────────────────────────────
.event-info-page {
  display: flex;
  flex-direction: column;
  gap: var(--sp-5);
  @include mobile-only { gap: var(--sp-2); }
}

.ei-timeline-card {
  max-width: 720px;
}

// ── Main event summary card (bound to main page data) ───────────────────────
.ei-summary-card { max-width: 720px; }

.ei-summary {
  display: flex;
  gap: var(--sp-4);
  align-items: flex-start;
  @include mobile-only { flex-direction: column; }
}

.ei-summary__cover {
  width: 96px;
  height: 96px;
  border-radius: var(--r-lg);
  object-fit: cover;
  flex-shrink: 0;
}

.ei-summary__body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.ei-summary__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-2);
}

.ei-summary__type {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--c-accent);
  i { font-size: 0.85rem; }
}

.ei-summary__title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--c-text);
  margin: 0;
}

.ei-summary__couple {
  font-size: 0.85rem;
  color: var(--c-muted);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 5px;
  i { color: var(--c-accent); }
}

.ei-summary__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 5px 10px;
  margin-top: 4px;
}

// ── Form layout ───────────────────────────────────────────────────────────────
.form-wrapper { display: flex; flex-direction: column; gap: var(--sp-2); }

.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-3);
  @media (max-width: 540px) { grid-template-columns: 1fr; }
}

// ── Empty state ───────────────────────────────────────────────────────────────
.ei-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--sp-3);
  padding: var(--sp-8);
  text-align: center;
  border-radius: var(--r-lg);
  min-height: 220px;

  h3 { font-size: 1.1rem; font-weight: 700; color: var(--c-text); margin: 0; }
}

.ei-empty-icon {
  width: 56px; height: 56px;
  border-radius: 50%;
  background: rgba(var(--c-accent-rgb, 139, 92, 246), 0.1);
  display: flex; align-items: center; justify-content: center;
  i { font-size: 1.6rem; color: var(--c-accent); }
}

.ei-empty-desc { font-size: 0.875rem; color: var(--c-muted); margin: 0; }

// ── Timeline item wrapper ─────────────────────────────────────────────────────
.ei-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-bottom: var(--sp-4);
}

.ei-item__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--sp-2);
}

.ei-item__title-wrap {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  min-width: 0;
}

.ei-item__name {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--c-text);
  margin: 0;
  line-height: 1.3;
}

// ── Meta row ─────────────────────────────────────────────────────────────────
.ei-item__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 5px 10px;
  align-items: center;
}

.ei-meta-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.78rem;
  color: var(--c-muted);
  i { font-size: 0.8rem; color: var(--c-accent); }
}

.ei-status-chip {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 99px;
  font-size: 0.67rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: rgba(150, 150, 150, 0.1);
  color: var(--c-muted);

  &.status-pending      { background: rgba(59,130,246,0.12);  color: #3b82f6; }
  &.status-in_progress  { background: rgba(245,158,11,0.12);  color: #f59e0b; }
  &.status-completed    { background: rgba(16,185,129,0.12);  color: #10b981; }
  &.status-cancelled    { background: rgba(239,68,68,0.12);   color: #ef4444; }
  &.status-planning     { background: rgba(59,130,246,0.12);  color: #3b82f6; }
  &.status-confirmed    { background: rgba(16,185,129,0.12);  color: #10b981; }
}

// ── Description ───────────────────────────────────────────────────────────────
.ei-item__desc {
  font-size: 0.8125rem;
  color: var(--c-muted);
  line-height: 1.55;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

// ── AI translate row ──────────────────────────────────────────────────────────
.ai-translate-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-2);
  flex-wrap: wrap;
}

.ai-translate-hint {
  font-size: 0.78rem;
  color: var(--c-muted);
  display: flex;
  align-items: center;
  gap: 5px;
  i { color: var(--c-accent); }
}
</style>