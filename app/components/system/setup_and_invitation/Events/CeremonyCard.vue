<template>
  <div class="events-page">
    <!-- Event cards grid -->
    <div class="events-grid animate-fade-up delay-1">
        <RCard
            v-for="event in eventStore.events"
            :key="event.id"
            class="event-card glass-card"
            :class="{ active: event.id === eventStore.activeEventId }"
            @click="handleView(event)"
        >
            <div class="ec-color-bar" :style="{ background: event.color }" />
            <div class="ec-body">
            <div class="ec-top">
                <span class="badge" :class="statusBadge(event.status)">{{ tr(`${event.status}`) }}</span>
                <span class="badge badge-muted">{{ tr(`${event.type}`) }}</span>
            </div>
            <h3 class="ec-title">{{ tBy({ en: event.title, km: event.titleKm }) }}</h3>
            <div class="ec-meta">
                <div class="ec-meta-item">
                <i class="ri-calendar-line" />
                <span>{{ formatDate(event.date, { month: 'long', day: 'numeric', year: 'numeric' }) }}</span>
                </div>
                <div class="ec-meta-item">
                <i class="ri-map-pin-line" />
                <span>{{ tBy({ en: event.venue, km: event.venueKm }) }}</span>
                </div>
            </div>

            <!-- Progress bars -->
            <div class="ec-stats">
                <div class="ecs-item">
                <div class="ecs-labels">
                    <span>Guests</span>
                    <span>{{ event.confirmedGuests }}/{{ event.guestCount }}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: pct(event.confirmedGuests, event.guestCount) + '%', background: event.color }" />
                </div>
                </div>
                <div class="ecs-item">
                <div class="ecs-labels">
                    <span>Tasks</span>
                    <span>{{ event.tasks.completed }}/{{ event.tasks.total }}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: pct(event.tasks.completed, event.tasks.total) + '%', background: event.color }" />
                </div>
                </div>
                <div class="ecs-item">
                <div class="ecs-labels">
                    <span>Budget</span>
                    <span>${{ (event.budgetSpent/1000).toFixed(1) }}K / ${{ (event.budget/1000).toFixed(1) }}K</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: pct(event.budgetSpent, event.budget) + '%', background: event.color }" />
                </div>
                </div>
            </div>

            <div class="ec-footer">
                <div class="ec-guests-count">
                <i class="ri-group-fill" style="color:var(--c-muted)" />
                <span>{{ event.guestCount }} guests</span>
                </div>
                <div class="ec-actions">
                <RBtn icon="ri-eye-line" size="xs" @click="handleView(event)" />
                <RBtn icon="ri-edit-line" size="xs" @click="editEvent(event)" />
                </div>
            </div>

            <!-- Active indicator -->
            <div v-if="event.id === eventStore.activeEventId" class="ec-active-badge">
                <i class="ri-focus-3-line" /> Active
            </div>
            </div>
        </RCard>

        <!-- Add event card -->
        <RCard class="event-card event-card-add glass-widget" :class="{ disabled: eventStore.atWeddingLimit }" @click="!eventStore.atWeddingLimit && openAddEvent()">
            <div class="eca-inner">
            <div class="eca-icon"><i class="ri-add-circle-line" /></div>
            <span>{{ tr('new_event') }}</span>
            </div>
        </RCard>
    </div>

    <!-- Add/Edit Event Modal -->
    <RSlider v-model="showModal" :title="editingEvent ? tr('edit_event') : tr('new_event')">
          <!-- Create: reuse shared form -->
          <CreateWeddingForm v-if="!editingEvent" inline @success="onCreated">
            <template #footer-actions="{ saving }">
              <button type="button" class="btn-ghost" @click="closeModal">{{ tr('cancel') }}</button>
              <button type="submit" class="btn-primary" :disabled="saving">
                <i :class="saving ? 'ri-loader-4-line animate-spin' : 'ri-heart-add-line'" /> {{ tr('create_wedding_btn') }}
              </button>
            </template>
          </CreateWeddingForm>

          <!-- Edit: existing detailed form -->
          <form v-else class="modal-form" @submit.prevent="saveEvent">
            <div class="ai-translate-row">
              <span class="ai-translate-hint"><i class="ri-sparkling-line" /> Fill EN fields then auto-fill KM</span>
              <AITranslateButton
                :fields="{ title: eventForm.title, venue: eventForm.venue }"
                @result="onTranslated"
              />
            </div>
            <div class="form-group">
              <label class="input-label">{{ tr('events.eventName') }} (EN)</label>
              <input v-model="eventForm.title" type="text" class="input" required />
            </div>
            <div class="form-group">
              <label class="input-label">{{ tr('events.eventName') }} (KM)</label>
              <input v-model="eventForm.titleKm" type="text" class="input" />
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label class="input-label">{{ tr('events.eventDate') }}</label>
                <input v-model="eventForm.date" type="date" class="input" required />
              </div>
              <div class="form-group">
                <label class="input-label">{{ tr('events.eventTime') }}</label>
                <input v-model="eventForm.time" type="time" class="input" />
              </div>
            </div>
            <div class="form-group">
              <label class="input-label">{{ tr('events.venue') }} (EN)</label>
              <input v-model="eventForm.venue" type="text" class="input" />
            </div>
            <div class="form-group">
              <label class="input-label">{{ tr('events.venue') }} (KM)</label>
              <input v-model="eventForm.venueKm" type="text" class="input" />
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label class="input-label">{{ tr('events.type') }}</label>
                <select v-model="eventForm.type" class="input">
                  <option value="wedding">{{ tr('events.wedding') }}</option>
                  <option value="engagement">{{ tr('events.engagement') }}</option>
                </select>
              </div>
              <div class="form-group">
                <label class="input-label">{{ tr('budget.totalBudget') }} (USD)</label>
                <input v-model.number="eventForm.budget" type="number" class="input" />
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-ghost" @click="closeModal">{{ tr('common.cancel') }}</button>
              <button type="submit" class="btn-primary" :disabled="saving">
                <i :class="saving ? 'ri-loader-4-line animate-spin' : 'ri-save-line'" /> {{ tr('common.save') }}
              </button>
            </div>
          </form>
    </RSlider>
  </div>
</template>

<script setup>
const { tr } = useTr()
import { pct, formatDate } from '~/helpers/str'
definePageMeta({ layout: 'navbar', middleware: 'permission', permission: 'VIEW_WEDDING' })
const { tBy } = useSarikaLocale()
const localePath = (p) => p || '/'
const eventStore = useEventStore()
const toast = useRToast()
// const queryParams = useQueryParams()
const showModal = ref(false)
const editingEvent = ref(null)
const { ceremonyForm } = useEventsPage()
// const defaultForm = () => ({ title: '', titleKm: '', date: '', time: '08:00', venue: '', venueKm: '', type: 'wedding', budget: 0, status: 'planning', color: '#ff8c42' })
const eventForm = reactive(ceremonyForm)

const statusBadge = (s) => ({
  planning: 'badge-accent',
  confirmed: 'badge-info',
  in_progress: 'badge-success',
  completed: 'badge-muted',
  cancelled: 'badge-danger',
}[s] || 'badge-muted')

const openAddEvent = () => { editingEvent.value = null; Object.assign(eventForm, defaultForm()); showModal.value = true }
const editEvent = (ev) => { editingEvent.value = ev; Object.assign(eventForm, { ...ev }); showModal.value = true }
const closeModal = () => { showModal.value = false; editingEvent.value = null }

const handleView = (event) => {
  // Navigate to the setup page
  const queryParam = queryParams('event', {data: JSON.stringify({id: event.id, weddingId: event.weddingId})})
  navigateTo(localePath(`/setup_and_invitation/setup/info${queryParam}`))
}

const onCreated = (created) => {
  if (created?.id) eventStore.setActiveEvent(created.id)
  closeModal()
}

const onTranslated = (result) => {
  if (result.title?.km) eventForm.titleKm = result.title.km
  if (result.venue?.km) eventForm.venueKm = result.venue.km
}

const saving = ref(false)

const saveEvent = async () => {
  saving.value = true
  try {
    eventStore.updateEvent(editingEvent.value.id, { ...eventForm })
    toast.add('Event updated', 'Success')
    closeModal()
  } catch (err) {
    const msg = err?.response?._data?.message ?? err?.message ?? 'Failed to save event'
    toast.add(msg, 'Error')
  } finally {
    saving.value = false
  }
}
</script>

<style lang="scss">
.events-page { display: flex; flex-direction: column; gap: var(--sp-5); }

.events-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--sp-5);
  @media (max-width: 1200px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 640px) { grid-template-columns: 1fr; }
}

.event-card {
  border-radius: var(--r-xl);
  overflow: hidden;
  cursor: pointer;
  position: relative;
  transition: all var(--t-base) var(--ease-out);

  &:hover { transform: translateY(-3px); box-shadow: var(--glow-accent); }
  &.active { border-color: rgba(255,140,66,0.3); }
}

.ec-color-bar { height: 4px; }

.ec-body { padding: var(--sp-5); }

.ec-top { display: flex; gap: var(--sp-2); margin-bottom: var(--sp-3); }

.ec-title {
  font-family: var(--font-700);
  font-size: 1.0625rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: var(--sp-3);
  line-height: 1.3;
}

.ec-meta {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: var(--sp-4);
}

.ec-meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8125rem;
  color: var(--c-muted);
  i { font-size: 0.875rem; flex-shrink: 0; }
  span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
}

.ec-stats { display: flex; flex-direction: column; gap: var(--sp-3); margin-bottom: var(--sp-4); }

.ecs-item {
  .ecs-labels { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 0.75rem; color: var(--c-muted); }
}

.ec-footer { display: flex; align-items: center; justify-content: space-between; }
.ec-guests-count { display: flex; align-items: center; gap: 6px; font-size: 0.8125rem; color: var(--c-muted); }
.ec-actions { display: flex; gap: var(--sp-2); }

.ec-active-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  background: rgba(255,140,66,0.15);
  border: 1px solid rgba(255,140,66,0.3);
  border-radius: var(--r-full);
  font-size: 0.6875rem;
  font-weight: 700;
  color: var(--c-accent);
  i { font-size: 0.75rem; }
}

/* Add card */
.event-card-add {
  border-radius: var(--r-xl);
  border: 2px dashed var(--c-border);
  background: rgba(255,255,255,0.02);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 280px;
  cursor: pointer;
  transition: all var(--t-base);

  &:hover {
    border-color: rgba(255,140,66,0.3);
    background: rgba(255,140,66,0.04);
    .eca-icon { color: var(--c-accent); }
  }
}

.eca-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-3);
  color: var(--c-muted);
  font-size: 0.9375rem;
  font-weight: 600;
}

.eca-icon { font-size: 2.5rem; transition: color var(--t-fast); }

.create-wedding-wrap {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  flex-wrap: wrap;
}

.limit-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.8125rem;
  color: var(--c-muted);
  i { color: var(--c-warning, #f59e0b); }
  a { color: var(--c-accent); text-decoration: underline; }
}

.event-card-add.disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}
</style>
