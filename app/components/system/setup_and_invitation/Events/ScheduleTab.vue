<!-- components/ceremony/ScheduleTab.vue -->
<!-- Reusable schedule/agenda tab shown in step 2 of the wizard -->
<template>
  <div class="schedule-tab">

    <div class="schedule-tab-head">
      <p class="schedule-tab-hint">
        {{ tBy({
          en: 'Add individual ceremonies that make up this event. Drag to reorder.',
          km: 'បន្ថែមពិធីបុណ្យតូចៗដែលបង្កើតបានជាព្រឹត្តិការណ៍នេះ។'
        }) }}
      </p>
      <RBtn type="create" :label="tBy({ en: 'Add Ceremony', km: 'បន្ថែមពិធី' }) " size="sm" icon="ri-add-circle-line" @click="addRow" />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="schedule-empty">
      <i class="ri-loader-4-line ri-spin" />
      <span>{{ tBy({ en: 'Loading ceremonies…', km: 'កំពុងផ្ទុកពិធី…' }) }}</span>
    </div>

    <!-- Empty -->
    <div v-else-if="!rows.length" class="schedule-empty">
      <i class="ri-calendar-todo-line" />
      <span>{{ tBy({ en: 'No ceremonies added yet.', km: 'មិនទាន់មានពិធីណាមួយនៅឡើយ។' }) }}</span>
      <RBtn type="create" :label="tBy({ en: 'Add first ceremony', km: 'បន្ថែមពិធីដំបូង' })" size="sm" icon="ri-add-line" @click="addRow" />
    </div>

    <!-- Rows -->
    <TransitionGroup name="schedule-list" tag="div" class="schedule-rows">
      <div
        v-for="(row, idx) in rows"
        :key="row._id"
        class="schedule-row"
        :class="{ 'schedule-row--expanded': expanded === idx }"
      >
        <!-- Row header (always visible) -->
        <div class="schedule-row-header" @click="toggle(idx)">
          <div class="sched-num">{{ idx + 1 }}</div>
          <div class="sched-summary">
            <span class="sched-name">
              {{ row.name || tBy({ en: `Ceremony ${idx + 1}`, km: `ពិធីទី ${idx + 1}` }) }}
            </span>
            <span v-if="row.startTime" class="sched-time">
              {{ row.startTime }}{{ row.endTime ? ` — ${row.endTime}` : '' }}
            </span>
          </div>
          <div class="sched-row-actions">
            <!-- <RTooltip :text="tr('common.delete')">
              <button class="sched-icon-btn" type="button" @click.stop="removeRow(idx)">
                <i class="ri-delete-bin-line" />
              </button>
            </RTooltip> -->
                        <RTooltip :text="tr('common.delete')">
              <button class="sched-icon-btn" type="button" :disabled="deletingId === row._id" @click.stop="deleteRow(idx)">
                <i v-if="deletingId === row._id" class="ri-loader-4-line ri-spin" />
                <i v-else class="ri-delete-bin-line" />
              </button>
            </RTooltip>
            <i class="ri-arrow-down-s-line sched-chevron"
               :class="{ 'sched-chevron--open': expanded === idx }" />
          </div>
        </div>

        <!-- Expanded fields -->
        <Transition name="expand">
          <div v-if="expanded === idx" class="schedule-row-body">
            <RForm :schema="eventSchema" :state="row" class="sched-fields-grid">
              <RFormGroup
                :label="tBy({ en: 'Ceremony Name', km: 'ឈ្មោះពិធី' })"
                :name="`sched_name_${idx}`"
                required
                class="sched-name-field"
              >
                <RInput
                  v-model="row.name"
                  :placeholder="tBy({ en: 'e.g. Morning blessing', km: 'ឧ. ពិធីព្រឹក' })"
                  leadingIcon="ri-flag-line"
                />
              </RFormGroup>

              <RFormGroup :label="tBy({ en: 'Start Time', km: 'ម៉ោងចាប់ផ្ដើម' })" :name="`sched_start_${idx}`">
                <RTimeInputPicker v-model="row.startTime" />
              </RFormGroup>

              <RFormGroup :label="tBy({ en: 'End Time', km: 'ម៉ោងបញ្ចប់' })" :name="`sched_end_${idx}`">
                <RTimeInputPicker v-model="row.endTime" />
              </RFormGroup>

              <RFormGroup :label="tBy({ en: 'Location / Room', km: 'ទីកន្លែង / បន្ទប់' })" :name="`sched_loc_${idx}`">
                <RInput v-model="row.location" leadingIcon="ri-map-pin-2-line"
                  :placeholder="tBy({ en: 'Main hall, garden…', km: 'សាលធំ, សួន…' })" />
              </RFormGroup>

              <RFormGroup :label="tBy({ en: 'Dress Code', km: 'សម្លៀកបំពាក់' })" :name="`sched_dress_${idx}`">
                <RInput v-model="row.dressCode"
                  :placeholder="tBy({ en: 'Traditional, formal…', km: 'ប្រពៃណី, ផ្លូវការ…' })" />
              </RFormGroup>

              <RFormGroup :label="tBy({ en: 'Notes', km: 'កំណត់ចំណាំ' })" :name="`sched_notes_${idx}`" class="sched-notes-field">
                <RTextarea v-model="row.notes" :rows="2" />
              </RFormGroup>
            </RForm>
          </div>
        </Transition>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { z } from 'zod'
const { tr } = useTr()
const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  eventId:    { type: [String, Number], default: '' },
})
const emit   = defineEmits(['update:modelValue'])
const rows = computed({
  get: () => props.modelValue ?? [],
  set: v => emit('update:modelValue', v)
})
const expanded = ref(null)
const loading = ref(false)
const deletingId = ref(null)
const confirm = useConfirmStore()
const toast = useToastStore()

let _id = 0
const newRow = () => ({
  _id: ++_id,
  id: null,
  name: '',
  startTime: '',
  endTime: '',
  location: '',
  dressCode: '',
  notes: '',
  priority: 0,
  venueId: null,
  type: 'CEREMONY',
  totalBudget: 0,
})

// ── Load existing ceremonies from GET /api/v1/events/{eventId}/ceremonies ──
const fromApiRow = (c) => {
  const timeFromSchedule = (c.scheduleTime || '').slice(11, 16)
  const numPriority = Number(c.priority)
  return {
    _id: `api_${c.id}`,
    id: c.id,
    name: c.name ?? '',
    startTime: c.startTime || timeFromSchedule,
    endTime: c.endTime || '',
    location: c.address ?? '',
    dressCode: '',
    notes: c.description ?? '',
    priority: Number.isFinite(numPriority) ? numPriority : (c.orderIndex ?? 0),
    venueId: c.venueId ?? null,
    type: c.type ?? 'CEREMONY',
    totalBudget: Number(c.totalBudget ?? 0),
  }
}

const fetchRows = async () => {
  if (!props.eventId) return
  loading.value = true
  try {
    const { data } = await useHttp(`/api/v1/events/${props.eventId}/ceremonies`, {
      method: 'GET',
      isGlobal: true,
    })
    const result = data.value?.data ?? data.value
    const content = result?.content ?? result ?? []
    rows.value = Array.isArray(content)
      ? content.map(fromApiRow).sort((a, b) => a.priority - b.priority)
      : []
  } finally {
    loading.value = false
  }
}

watch(() => props.eventId, (id) => { if (id) fetchRows() })
onMounted(fetchRows)

// ── Validation schema (mirrors ScheduleRequest string fields) ─────────────────
// startTime/endTime are `Time` objects from RTimeInputPicker, serialized on save.
const eventSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  startTime: z.any().optional(),
  endTime: z.any().optional(),
  location: z.string().optional(),
  dressCode: z.string().optional(),
  notes: z.string().optional(),
})

const addRow = () => {
  rows.value = [...rows.value, newRow()]
  expanded.value = rows.value.length - 1
}

const removeRow = (idx) => {
  const next = [...rows.value]
  next.splice(idx, 1)
  rows.value = next
  if (expanded.value === idx) expanded.value = null
}

const deleteRow = (idx) => {
  const row = rows.value[idx]
  if (!row) return

  // Local row (not from API) -> remove immediately
  if (!row.id) {
    removeRow(idx)
    return
  }

  // Existing API row -> ask for confirmation before deleting
  confirm.show({
    type: 'delete',
    message: tr('common.confirm_delete', 'Delete this ceremony?'),
    onConfirm: async () => {
      deletingId.value = row._id
      try {
        if (props.eventId && row.id) {
          const { error } = await useHttp(`/api/v1/events/${props.eventId}/ceremonies/${row.id}`, {
            method: 'DELETE',
            isGlobal: true,
          })
          if (error?.value) {
            toast.add(error.value?.Message || tr('common.delete_failed', 'Delete failed'), 'Error')
            return
          }
        }
        removeRow(idx)
        toast.add(tr('common.deleted', 'Deleted'), 'Success')
      } finally {
        deletingId.value = null
      }
    },
  })
}

const toggle = (idx) => {
  expanded.value = expanded.value === idx ? null : idx
}
</script>

<style lang="scss" scoped>
.schedule-tab { display: flex; flex-direction: column; gap: 12px; }

.schedule-tab-head {
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;
  .schedule-tab-hint { font-size: 0.78rem; color: var(--c-muted); }
}

.schedule-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 10px; padding: 36px;
  border: 1.5px dashed var(--c-border); border-radius: var(--r-lg);
  color: var(--c-muted);
  i { font-size: 28px; }
  span { font-size: 0.85rem; }
}

.schedule-rows { display: flex; flex-direction: column; gap: 8px; }

.schedule-row {
  border: 1px solid var(--c-border);
  border-radius: var(--r-lg);
  overflow: hidden;
  background: var(--c-surface);
  transition: box-shadow var(--t-base);

  &--expanded { box-shadow: var(--glow-accent-sm); border-color: rgba(255,140,66,0.3); }
}

.schedule-row-header {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 14px; cursor: pointer;
  transition: background var(--t-fast);

  &:hover { background: rgba(255,140,66,0.04); }
}

.sched-num {
  width: 24px; height: 24px; border-radius: var(--r-full);
  background: var(--c-accent); color: #fff;
  font-size: 0.7rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.sched-summary {
  flex: 1; min-width: 0;
  display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap;

  .sched-name {
    font-size: 0.875rem; font-weight: 600; color: var(--c-text);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .sched-time {
    font-size: 0.75rem; color: var(--c-muted); white-space: nowrap;
  }
}

.sched-row-actions {
  display: flex; align-items: center; gap: 6px; flex-shrink: 0;
}

.sched-icon-btn {
  background: none; border: none; cursor: pointer;
  color: var(--c-danger); font-size: 15px; padding: 2px;
  border-radius: var(--r-sm); opacity: 0.5;
  transition: opacity var(--t-fast), background var(--t-fast);
  width:24px;
  height:24px;

  &:hover { opacity: 1; background: rgba(248,113,113,0.1); }
}

.sched-chevron {
  font-size: 18px; color: var(--c-muted);
  transition: transform var(--t-base);
  &--open { transform: rotate(180deg); }
}

.schedule-row-body {
  border-top: 1px solid var(--c-border);
  padding: 14px;
  background: rgba(255,140,66,0.02);
}

.sched-fields-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 12px;

  .sched-name-field { grid-column: 1 / -1; }
  .sched-notes-field { grid-column: 1 / -1; }

  @media (max-width: 560px) { grid-template-columns: 1fr 1fr; }
  @media (max-width: 380px) { grid-template-columns: 1fr; }
}

// Transitions
.schedule-list-enter-active,
.schedule-list-leave-active { transition: all var(--t-base); }
.schedule-list-enter-from,
.schedule-list-leave-to { opacity: 0; transform: translateY(-8px); }

.expand-enter-active,
.expand-leave-active { transition: max-height var(--t-base) var(--ease-out), opacity var(--t-base); max-height: 600px; }
.expand-enter-from,
.expand-leave-to { max-height: 0; opacity: 0; }
</style>
