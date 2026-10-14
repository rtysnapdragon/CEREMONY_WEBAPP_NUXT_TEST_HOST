<template>
  <RModal v-model="isOpen" icon="ri-calendar-event-line cef-icon" :title="tBy({en:'Create New Event', km:'បង្កើតព្រឹត្តិការណ៍ថ្មី'})" :description="tBy({en:'Fill in the details to get started', km:'បំពេញព័ត៌មានដើម្បីចាប់ផ្តើម'})"  >
    <RForm ref="formRef" class="cef-form" novalidate :schema="formSchema" @onSubmit="submit">
      <!-- Event Type Selector -->
      <div class="form-group">
        <label class="form-label">
          {{ tBy({en:'Event Type', km:'ប្រភេទព្រឹត្តិការណ៍'}) }}
          <span class="required-star">*</span>
        </label>
        <div v-if="eventTypeStore.loading" class="type-loading">
          <i class="ri-loader-4-line animate-spin" /> Loading types...
        </div>
        <div v-else class="event-type-grid">
          <button
            v-for="type in eventTypeStore.allowedTypes"
            :key="type.id"
            type="button"
            class="type-chip"
            :class="{ 'type-chip--active': form.eventTypeId === type.id }"
            @click="selectType(type)"
          >
            <i :class="type.icon" />
            <span>{{ type.name }}</span>
          </button>
        </div>
        <span v-if="errors.eventTypeId" class="field-error">{{ errors.eventTypeId }}</span>
      </div>
      <template v-if="selectedType">
        <!-- Couple event: host1 + host2 side by side -->
        <div v-if="fieldConfig?.coupleEvent" class="form-row-2">
          <div class="form-group">
            <label class="form-label">
              {{ fieldConfig.host1Label || 'Host 1' }}
              <span class="required-star">*</span>
            </label>
            <input
              v-model="form.host1Name"
              class="input"
              :class="{ 'input-error': errors.host1Name }"
              :placeholder="fieldConfig.host1Label || 'Host 1'"
              @input="clearError('host1Name')"
            />
            <span v-if="errors.host1Name" class="field-error">{{ errors.host1Name }}</span>
          </div>
          <div class="form-group">
            <label class="form-label">
              {{ fieldConfig.host2Label || 'Host 2' }}
              <span class="required-star">*</span>
            </label>
            <input
              v-model="form.host2Name"
              class="input"
              :class="{ 'input-error': errors.host2Name }"
              :placeholder="fieldConfig.host2Label || 'Host 2'"
              @input="clearError('host2Name')"
            />
            <span v-if="errors.host2Name" class="field-error">{{ errors.host2Name }}</span>
          </div>
        </div>
        <!-- Single-host event: title + host1 -->
        <div v-else class="form-row-2">
          <div class="form-group">
            <label class="form-label">
              {{ tBy({en:'Event Name', km:'ឈ្មោះព្រឹត្តិការណ៍'}) }}
              <span class="required-star">*</span>
            </label>
            <input
              v-model="form.title"
              class="input"
              :class="{ 'input-error': errors.title }"
              :placeholder="tBy({en:'e.g. Annual Conference 2025', km:'ឧ. សន្និសីទប្រចាំឆ្នាំ 2025'})"
              @input="clearError('title')"
            />
            <span v-if="errors.title" class="field-error">{{ errors.title }}</span>
          </div>
          <div class="form-group">
            <label class="form-label">{{ fieldConfig?.host1Label || 'Organizer' }}</label>
            <input
              v-model="form.host1Name"
              class="input"
              :placeholder="fieldConfig?.host1Label || 'Organizer'"
            />
          </div>
        </div>
        <!-- Event Date -->
        <div class="form-group">
          <label class="form-label">
            {{ fieldConfig?.dateLabel || 'Event Date' }}
            <span class="required-star">*</span>
          </label>
          <input
            v-model="form.eventDate"
            type="datetime-local"
            class="input"
            :class="{ 'input-error': errors.eventDate }"
            @change="clearError('eventDate')"
          />
          <span v-if="errors.eventDate" class="field-error">{{ errors.eventDate }}</span>
        </div>
        <!-- Venue + Budget -->
        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label">{{ tBy({en:'Venue', km:'ទីកន្លែង'}) }}</label>
            <input
              v-model="form.venue"
              class="input"
              :placeholder="tBy({en:'e.g. Diamond Island Convention Center', km:'ឧ. អាគារអន្លង់ពេជ្រ'})"
            />
          </div>
          <div class="form-group">
            <label class="form-label">{{ tBy({en:'Total Budget', km:'ថវិកាសរុប'}) }}</label>
            <input v-model.number="form.budget" type="number" class="input" placeholder="0" min="0" />
          </div>
        </div>
      </template>
    </RForm>
    <!-- Actions -->
    <template #footer>
      <div class="cef-actions">
        <button type="button" class="btn-ghost" @click="close">
          {{ tBy({en:'Cancel', km:'បោះបង់'}) }}
        </button>
        <button type="button" class="btn-primary" :disabled="saving" @click="submit">
          <i :class="saving ? 'ri-loader-4-line animate-spin' : 'ri-check-line'" />
          {{ saving ? tBy({en:'Creating...', km:'កំពុងបង្កើត...'}) : tBy({en:'Create Event', km:'បង្កើតព្រឹត្តិការណ៍'}) }}
        </button>
      </div>
    </template>
  </RModal>
</template>

<script setup>
const isOpen = defineModel('open')
const emit = defineEmits(['update:open'])

const { tBy } = useSarikaLocale()
const eventStore = useEventStore()
const eventTypeStore = useEventTypeStore()
const toast = useToastStore()

const formRef = ref(null)
const saving = ref(false)
const errors = reactive({})

const form = reactive({
  eventTypeId: null,
  title: '',
  host1Name: '',
  host2Name: '',
  eventDate: '',
  venue: '',
  budget: 0,
  subtitle: '',
  heroTitle: '',
  heroSubtitle: '',
  description: '',
  contactPhone: '',
  contactEmail: '',
})

const selectedType = computed(() => eventTypeStore.byId(form.eventTypeId))
const fieldConfig = computed(() => {
  const fc = selectedType.value?.fieldConfig
  if (!fc) return null
  try {
    return typeof fc === 'string' ? JSON.parse(fc) : fc
  } catch { return null }
})

const selectType = (type) => {
  form.eventTypeId = type.id
  clearError('eventTypeId')
  form.host1Name = ''
  form.host2Name = ''
  form.title = ''
}

const clearError = (field) => { delete errors[field] }

const validate = () => {
  Object.keys(errors).forEach(k => delete errors[k])
  if (!form.eventTypeId) {
    errors.eventTypeId = 'Please select an event type.'
  }
  if (!form.eventDate) {
    errors.eventDate = 'Please select a date.'
  }
  if (fieldConfig.value?.coupleEvent) {
    if (!form.host1Name?.trim()) errors.host1Name = `${fieldConfig.value.host1Label || 'Host 1'} name is required.`
    if (!form.host2Name?.trim()) errors.host2Name = `${fieldConfig.value.host2Label || 'Host 2'} name is required.`
  } else if (selectedType.value && !form.title?.trim()) {
    errors.title = 'Event name is required.'
  }
  return Object.keys(errors).length === 0
}

const submit = async () => {
  if (!validate()) return
  saving.value = true
  try {
    const result = await eventStore.addEvent({
      ...form,
      eventTypeId: form.eventTypeId,
      title: form.title || (form.host1Name && form.host2Name ? `${form.host1Name} & ${form.host2Name}` : form.host1Name || 'My Event'),
      host1Name: form.host1Name || null,
      host2Name: form.host2Name || null,
      eventDate: form.eventDate,
      venue: form.venue || null,
      budget: form.budget || 0,
    })
    if (result?.success !== false) {
      toast.add(
        tBy({ en: 'Event created successfully!', km: 'ព្រឹត្តិការណ៍ត្រូវបានបង្កើតដោយជោគជ័យ!' }),
        tBy({ en: 'Success', km: 'ជោគជ័យ' })
      )
      close()
      await navigateTo('/', { replace: true })
    }
  } finally {
    saving.value = false
  }
}

const close = () => {
  emit('update:open', false)
  Object.keys(errors).forEach(k => delete errors[k])
}

onMounted(async () => {
  if (!eventTypeStore.initialized) await eventTypeStore.fetchTypes()
  // Auto-select WEDDING as default
  const wedding = eventTypeStore.allowedTypes.find(t => t.code === 'WEDDING')
  if (wedding && !form.eventTypeId) selectType(wedding)
})
</script>

<style scoped lang="scss">
.cef-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, .6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.cef-panel {
  width: 100%;
  max-width: 640px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: var(--r-xl);
  padding: var(--sp-6);
  background: var(--c-surface);
  border: 1px solid var(--c-border);
}

.cef-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: var(--sp-6);
}

.cef-header-left {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
}

.cef-icon {
  font-size: 1.8rem;
  color: var(--c-accent);
}

.cef-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--c-text);
  margin: 0;
}

.cef-sub {
  font-size: .8rem;
  color: var(--c-muted);
  margin: 0;
}

.cef-form {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
}

.type-loading {
  color: var(--c-muted);
  font-size: .85rem;
  padding: var(--sp-2) 0;
}

.event-type-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
  margin-top: var(--sp-2);
}

.type-chip {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: .45rem .9rem;
  border-radius: 999px;
  border: 1px solid var(--c-border);
  background: transparent;
  color: var(--c-muted);
  cursor: pointer;
  font-size: .8rem;
  font-weight: 500;
  transition: .2s ease;

  i { font-size: .95rem; }

  &:hover {
    border-color: var(--c-accent);
    color: var(--c-accent);
  }

  &--active {
    border-color: var(--c-accent);
    background: rgba(255, 140, 66, .1);
    color: var(--c-accent);
    font-weight: 600;
  }
}

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-4);

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

.cef-actions {
  display: flex;
  gap: var(--sp-3);
  justify-content: flex-end;
  margin-top: var(--sp-2);
}

.required-star { color: var(--c-danger); margin-left: 2px; }
.input-error { border-color: var(--c-danger) !important; }
.field-error {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: .75rem;
  color: var(--c-danger);
  margin-top: 4px;

  &::before { content: '⚠'; font-size: .7rem; }
}
</style>
