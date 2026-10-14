<template>
  <!-- Inline mode: plain form inside a modal, no shell/background -->
  <RSlider 
    v-if="inline"
    v-model="isOpen"
    :title="props.title"
    :description="props.description"
    >
    <RForm class="modal-form" :schema="formSchema" @onSubmit="submit" >
      <div class="form-row-2">
        <RInput v-model="form.brideName" :label="tr('bride_name')" :placeholder="tr('bride_name_placeholder')" required />
        <RInput v-model="form.groomName" :label="tr('groom_name')" :placeholder="tr('groom_name_placeholder')" required />
      </div>
      <div class="form-row-2">
        <div class="form-group">
          <RDateInputPicker
            v-model="pickedDate"
            :label="tr('wedding_date')"
            required
            @update:model-value="onDateChange"
          />
        </div>
        <div class="form-group">
          <RTimeInputPicker
            v-model="form.time"
            :label="tr('eventTime')"
            :minute-step="5"
          />
        </div>
      </div>
      <div class="form-group">
        <label class="input-label">{{ tr('venue') }}</label>
        <input v-model="form.venue" class="input" :placeholder="tr('venue_placeholder')" />
      </div>
      <div class="form-group">
        <label class="input-label">
          {{ tr('total_budget') }}
          <span class="cw-optional">({{ tr('optional') }})</span>
        </label>
        <input v-model.number="form.budget" type="number" min="0" class="input" :placeholder="tr('budget_placeholder')" />
      </div>
      <template #footer>
        <RBtn :loading="saving">
          <i :class="saving ? 'ri-loader-4-line animate-spin' : 'ri-heart-add-line'" />
          {{ saving ? tr('creating') : tr('create_wedding_btn') }}
        </RBtn>
      </template>
    </RForm>
  </RSlider>

  <!-- Standalone page mode: full-screen shell with branding -->
    <RSlider
      v-else
      v-model="isOpen"
      icon="ri-heart-add-line"
      :title="props.title"
      :description="props.description"
    >
    <RForm class="cw-form" @onSubmit="submit">
      <RFormGroup :label="tBy({ en: 'Title', km: 'ចំណងជើង' })" required>
        <RInput v-model="form.title" :placeholder="tBy({ en: 'Enter title', km: 'សូមបញ្ចូលចំណងជើង' })" required />
      </RFormGroup>

      <RFormGroup :label="tBy({ en: 'Event Type', km: 'ប្រភេទព្រឹត្តិការណ៍' })" required>
        <RSelect v-model="form.types" pk="id" :localData="ceremonyTypesData" @onSelect="onTypeSelect"/>
      </RFormGroup>
      <RFormGroup :label="tBy({ en: 'Status', km: 'ស្ថានភាព' })" required>
        <RSelect v-model="form.status" pk="id" :localData="{ data: [{ id: 'PLANNING', Name: 'Planning', NameEnglish: 'Planning' }, { id: 'CONFIRMED', Name: 'Confirmed', NameEnglish: 'Confirmed' }, { id: 'IN_PROGRESS', Name: 'In Progress', NameEnglish: 'In Progress' }, { id: 'COMPLETED', Name: 'Completed', NameEnglish: 'Completed' }, { id: 'CANCELLED', Name: 'Cancelled', NameEnglish: 'Cancelled' }] }" />
      </RFormGroup>

      <div class="w-full">
        <RFormGroup :label="tr('bride_name')" required>
          <RInput v-model="form.brideName" :placeholder="tr('bride_name_placeholder')" required />
        </RFormGroup>
        <RFormGroup :label="tr('groom_name')" required>
          <RInput v-model="form.groomName" :placeholder="tr('groom_name_placeholder')" required />
        </RFormGroup>
      </div>

      <div class="grid grid-cols-2 gap-4 w-full">
          <RFormGroup :label="tr('ceremony_date')" required>
            <RDateInputPicker
              :model-value="pickedDate"
              @update:model-value="onDateChange"
            />
          </RFormGroup>
          <RFormGroup :label="tr('eventTime')" required>
            <RTimeInputPicker
              v-model="form.time"
              :minute-step="5"
            />
          </RFormGroup>
      </div>
      <div class="w-full">
        <RFormGroup :label=" tBy({ en: 'Location / Venue', km: 'ទីកន្លែង' })" required>
          <RInput v-model="form.venue" :placeholder="tr('venue_placeholder')" required />
        </RFormGroup>
      </div>
      <div class="w-full">
        <RFormGroup :label="tr('total_udget')">
          <RInput v-model.number="form.budget" type="number" min="0" :placeholder="tr('budget_placeholder')" />
        </RFormGroup>
      </div>
    </RForm>
    <template #footer>
      <RBtn type="cancel" icon="cancel" :label="tr('cancel')" :loading="saving" @click="isOpen = false" :disabled="saving"/>
      <RBtn type="save" icon="save" :label="tr('save')" :loading="saving" @click="submit" :disabled="saving"/>
    </template>
  </RSlider>
</template>

<script setup>
import { shallowRef, toRaw } from 'vue'
import { CalendarDate } from '@internationalized/date'

const props = defineProps({
  inline: { type: Boolean, default: false },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
})

const isOpen = defineModel('open', { type: Boolean, default: false })
const emit = defineEmits(['success'])

const { tr } = useTr()
const eventStore = useEventStore()
const toast = useToastStore()
const eventTypeStore = useEventTypeStore()

const saving = ref(false)
const pickedDate = shallowRef(null)

const form = reactive({
  title: '',
  eventTypeId: null,
  status: 'PLANNING',
  brideName: '',
  groomName: '',
  time: '08:00',
  venue: '',
  budget: null,
})


mounted(async () => {
  if (!eventStore.initialized) await eventStore.fetchEvents()
  if (!eventTypeStore.initialized) await eventTypeStore.fetchTypes()
})

const onTypeSelect = (item) => {
  console.log("Select type ==========> ", item)
  form.types = item.id
}
const ceremonyTypesData = computed(() => {
  if (!eventTypeStore.types) {
    eventTypeStore.loadTypes()
  }
  return {
    data: eventTypeStore.types.map((type) => {
      return {
        id: type.id,
        Name: type.name,
        NameEnglish: type.nameEn,
      }
    })
  }
})

const onDateChange = (val) => {
  pickedDate.value = val ? toRaw(val) : null
}

// Convert CalendarDate + "HH:MM" time → "yyyy-MM-ddTHH:mm:ss" expected by backend
const toIsoDateTime = (cd, time) => {
  if (!cd) return null
  const raw = toRaw(cd)
  const y = String(raw.year).padStart(4, '0')
  const m = String(raw.month).padStart(2, '0')
  const d = String(raw.day).padStart(2, '0')
  const t = time ? `${time}:00` : '08:00:00'
  return `${y}-${m}-${d}T${t}`
}

const submit = async () => {
  if (saving.value) return
  console.log('submit=======================>')
  if (!pickedDate.value) {
    toast.add({type:'error',message:tr('wedding_date') + ' ' + tr('required', 'is required'),title:tr('error')})
    console.log('wedding_date=======================>', pickedDate.value)
    return
  }
  saving.value = true
  try {
    const created = await eventStore.addEvent({
      brideName: form.brideName,
      groomName: form.groomName,
      date: toIsoDateTime(pickedDate.value, form.time),
      venue: form.venue,
      budget: form.budget || 0,
    })
    toast.add({type:'success',message:tr('wedding_created_success'),title:tr('success')})
    if (props.inline) {
      emit('success', created)
    } else {
      await navigateTo('/', { replace: true })
    }
  } catch (err) {
    const msg = err?.response?._data?.message ?? err?.message ?? tr('wedding_create_failed')
    toast.add({type:'error',message:msg,title:tr('error')})
  } finally {
    saving.value = false
  }
}
</script>

<style lang="scss">
.cw-shell {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--sp-4);
  background: var(--c-bg);

  &::before {
    content: '';
    position: fixed;
    inset: 0;
    background: radial-gradient(ellipse 70% 60% at 50% 40%, rgba(var(--c-accent-rgb, 139, 92, 246), 0.08) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }
}

.cw-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 540px;
  padding: var(--sp-8) var(--sp-6);
  display: flex;
  flex-direction: column;
  gap: var(--sp-6);

  @media (max-width: 480px) {
    padding: var(--sp-6) var(--sp-4);
  }
}

.cw-brand {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-2);
}

.cw-heart {
  font-size: 2.5rem;
  color: var(--c-accent);
  animation: heartbeat 2s ease-in-out infinite;
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  14% { transform: scale(1.15); }
  28% { transform: scale(1); }
  42% { transform: scale(1.1); }
  56% { transform: scale(1); }
}

.cw-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: var(--c-text);
}

.cw-sub {
  font-size: 0.875rem;
  color: var(--c-muted);
  margin: 0;
}

.cw-optional {
  font-size: 0.75rem;
  color: var(--c-muted);
  font-weight: 400;
}

.req {
  color: var(--c-danger);
}

.cw-form {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
}

.btn-lg {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border-radius: var(--r-md);
  gap: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-full {
  width: 100%;
}
</style>
