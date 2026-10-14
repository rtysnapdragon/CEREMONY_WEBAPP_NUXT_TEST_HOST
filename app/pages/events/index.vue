<template>
  <RHead :title="tr('setup.title')" />
  <RWrapperPage>
    <!-- ══ EVENTS GRID ════════════════════════════════════════════════════ -->
    <div class="sp-grid animate-fade-up delay-2">
      <RCard
        v-for="event in eventStore.events"
        :key="event.id"
        class="ec"
        :class="{ 'ec__active': event.id === eventStore.activeEventId}"
        role="button"
        tabindex="0"
        @click="handleView(event)"
        @keydown.enter="handleView(event)"
      >
        <!-- ── SVG background illustration per event type ── -->
        <div class="ec__bg" aria-hidden="true">
          <component :is="svgForType(event.eventType?.code)" />
        </div>
        <!-- ── Cover image overlay (when present) ── -->
        <div
          class="ec__cover"
          :style="{ backgroundImage: `url('${event.coverImage || 'https://i.ibb.co/G4S83JpY/pngegg-11.png'}')` }"
        />
<!-- <a href="https://ibb.co/nqrxDySQ"><img src="https://i.ibb.co/spj8F4rs/pngegg-21.png" alt="pngegg-21" border="0"></a> -->
        <!-- ── 3-dot menu ── -->
        <div class="ec__dot-wrap" @click.stop>
          <RBtns :threeDotOnly="true" iconThreeDot='ri-equalizer-line' :data="[{ type: 'view', icon: 'ri-eye-line', label: tr('view') }, { type: 'edit', icon: 'ri-edit-line', label: tr('common.edit') }, 
          { type: 'delete', icon: 'ri-delete-bin-line', label: tr('common.delete') }, ...(event.id !== eventStore.activeEventId ? [{ type: 'import', icon: 'ri-check-line', label: tr('events.set_active') }] : [])]" @click="(type) => {
            if (type === 'view') handleView(event)
            else if (type === 'edit') openEdit(event)
            else if (type === 'delete') confirmDelete(event)
            else if (type === 'import') setActive(event.id)
          }" />
        </div>

        <!-- ── Card body ── -->
        <div class="ec__body">
          <!-- type + status badges -->
          <div class="ec__badges">
            <span class="badge badge--type">
              <i v-if="event.eventType?.icon" :class="event.eventType.icon" />
              {{ event.eventType?.name || tr(`${event.type}`) }}
            </span>
            <span class="badge" :class="statusBadge(event.status)">
              {{ tr(`${event.status}`) }}
            </span>
            <span class="badge" :class="statusBadge(event.status)">
              {{ tr('event.countdown', 'Countdown') + ' ' + (getCountdown(event)?.value || '') }}
            </span>
          </div>

        <!-- ── 3. COUNTDOWN ──────────────────────────────────────────── -->
          <div v-if="getCountdown(event)" class="ec__countdown">
            <div
              v-for="unit in getCountdown(event)"
              :key="unit.label"
              class="ec__count-item"
            >
              <span class="ec__count-value">{{ unit.value }}</span>
              <span class="ec__count-label">{{ unit.label }}</span>
            </div>
          </div>
          
          <!-- title -->
          <h3 class="ec__title">
            {{ event.translations?.title
                ? tBy(event.translations.title)
                : event.title }}
          </h3>

          <!-- hosts -->
          <div v-if="event.host1Name || event.host2Name" class="ec__hosts">
            <i class="ri-hearts-line" />
            <span>{{ event.host1Name }}<template v-if="event.host2Name"> &amp; {{ event.host2Name }}</template></span>
          </div>

          <!-- meta rows -->
          <div class="ec__meta">
            <div class="ec__meta-row">
              <i class="ri-calendar-line" />
              <span>{{ formatDate(event.date, { month: 'long', day: 'numeric', year: 'numeric' }) || '...' }}</span>
            </div>
            <div class="ec__meta-row">
              <i class="ri-map-pin-line" />
              <span>{{ event.translations?.venue
                ? tBy(event.translations.venue)
                : (tBy({ en: event.venue, km: event.venueKm }) || '...') }}</span>
            </div>
          </div>

          <!-- ── Mini progress pills (replaces RStepper) ── -->
          <div class="ec__pills">
            <div class="ec__pill" :class="event.confirmedGuests === event.guestCount && event.guestCount > 0 ? 'ec__pill--done' : ''">
              <i class="ri-group-line" />
              <span>{{ event.confirmedGuests ?? 0 }}/{{ event.guestCount ?? 0 }}</span>
            </div>
            <div class="ec__pill" :class="event.tasks?.completed === event.tasks?.total && event.tasks?.total > 0 ? 'ec__pill--done' : ''">
              <i class="ri-checkbox-circle-line" />
              <span>{{ event.tasks?.completed ?? 0 }}/{{ event.tasks?.total ?? 0 }}</span>
            </div>
            <div class="ec__pill" :class="event.budgetSpent >= event.totalBudget && event.totalBudget > 0 ? 'ec__pill--warn' : ''">
              <i class="ri-money-dollar-circle-line" />
              <span>${{ Number(event.totalBudget ?? 0).toLocaleString() }}</span>
            </div>
            <div v-if="event.allowRsvp" class="ec__pill ec__pill--info" @click.stop="openAddRSVP(event)" role="button" tabindex="0" @keydown.enter.stop="openAddRSVP(event)">
              <i class="ri-mail-check-line" />
              <span>RSVP {{ event.rsvpAcceptedCount ?? 0 }} / {{ event.rsvpCount ?? 0 }}</span>
            </div>
          </div>

          <!-- footer: date created -->
          <div class="ec__footer">
            <div class="ec__created">
              <i class="ri-time-line" />
              <span>{{ formatDate(event.createdAt, { month: 'short', day: 'numeric', year: 'numeric' }) }}</span>
            </div>
          </div>
        </div>
      </RCard>

      <!-- ── Add event card ── -->
      <RCard class="ec ec--add" @click="openAdd()">
        <div class="ec--add__bg" aria-hidden="true">
          <SvgDefault class="ec--add__svg" />
        </div>
        <div class="ec--add__inner">
          <div class="ec--add__ring">
            <i class="ri-add-line" />
          </div>
          <span class="ec--add__label">{{ tr('new_ceremony') }}</span>
          <span class="ec--add__sub">{{ tr('setup.empty_state') }}</span>
        </div>
      </RCard>
    </div>

  <!-- ══ MODALS ══════════════════════════════════════════════════════════ -->
  <!-- <CeremonyCreateModal
    v-model:open="showModal"
    :title="editingId ? tr('common.edit_event') : tr('common.new_event')"
    :description="tr('setup.empty_state')"
  /> -->
  <CeremonyCreateModal
    v-model:open="showModal"
    :event-id="editingId"
    :ceremony="editingEventData"
    :type="editingEventData?.type ?? null"
    @saved="loadCeremonies"
  />
  <TranslationReviewDrawer
    v-model:open="showTransReview"
    :feature="transReviewProps.feature"
    :entity-id="transReviewProps.entityId"
    :fields="transReviewProps.fields"
    :fields-meta="transReviewProps.fieldsMeta"
    :auto-save="transReviewProps.autoSave"
    @update:auto-save="updateCeremonyAutoSave"
  />

  <!-- Add RSVP Modal -->
  <RModal v-model="showAddRsvpModal" :title="tr('add_rsvp')">
    <div>
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">{{ tr('email') }}</label>
        <input v-model="newRsvp.email" type="email" class="input w-full" :placeholder="tr('email')" />
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">{{ tr('name') }}</label>
        <input v-model="newRsvp.name" type="text" class="input w-full" :placeholder="tr('name')" />
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">{{ tr('phone') }}</label>
        <input v-model="newRsvp.phone" type="text" class="input w-full" :placeholder="tr('phone')" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">{{ tr('attendance') }}</label>
        <select v-model="newRsvp.attendance" class="input w-full">
          <option :value="true">{{ tr('yes') }}</option>
          <option :value="false">{{ tr('no') }}</option>
        </select>
      </div>
    </div>
    <template #footer>
      <RBtn type="cancel" color="cancel"  :label="tr('cancel')" @click="showAddRsvpModal = false" />
      <RBtn type="save" icon="save" color="save"  :label="tr('save')" @click="submitAddRSVP" />
    </template>
  </RModal>
  </RWrapperPage>
</template>

<script setup>
import { pct, formatDate } from '~/helpers/str'

/* ── 3-dot menu state ───────────────────────────────────────────────────── */
const openMenuId = ref(null)
function toggleMenu(id) { openMenuId.value = openMenuId.value === id ? null : id }
function closeMenu()    { openMenuId.value = null }

/* ── Page setup ─────────────────────────────────────────────────────────── */
definePageMeta({
  layout: 'navbar',
  middleware: ['auth', 'permission'],
  permission: 'SEND_INVITATION',
})

const { tr } = useTr()
const {
  // eventStore, 
  planStore,
  tBy, activeEvent,
  showTransReview, transReviewProps,
  // showModal, 
  // editingId,
  init,
  statusBadge,
  openAddEvent, editEvent, handleView,
  updateCeremonyAutoSave,
} = useSetupPage()

const {
  eventStore,
  // eventTypeStore,
  showModal,
  // saving,
  editingId,
  // errors,
  form,
  // statusClass,
  // init,
  editingEventData,
  openAdd,
  openEdit,
  closeModal,
  setActive,
  save,
  confirmDelete,
} = useEventsPage();

const showAddRsvpModal = ref(false)
const newRsvp = ref({
  email: '',
  name: '',
  phone: '',
  attendance: true,
})

const loadCeremonies = () => {
  useToastStore().success('Event saved successfully', 'Success')
}

const openAddRSVP = (event) => {
  showAddRsvpModal.value = true
  newRsvp.value.eventId = event.id
}
const submitAddRSVP = async () => {
  const toast = useToastStore()
  const guestStore = useGuestStore()
  const created = await guestStore.addGuest({
    name: newRsvp.value.name,
    email: newRsvp.value.email,
    phone: newRsvp.value.phone,
    rsvp: newRsvp.value.attendance ? 'confirmed' : 'declined',
  })
  if (created) {
    toast.add(tr('rsvp_added', 'RSVP added successfully'), 'Success')
    showAddRsvpModal.value = false
    newRsvp.value = {
      email: '',
      name: '',
      phone: '',
      attendance: true,
    }
  } else {
    toast.add(tr('rsvp_failed', 'Failed to add RSVP'), 'Error')
  }
}

function getCountdown(event) {
  if (!event?.date) return null

  const target = new Date(event.date).getTime()
  const diff = Math.max(0, target - now.value)

  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)

  return [
    { label: tr('days', 'Days') || 'Days', value: days },
    { label: tr('hours', 'Hours') || 'Hours', value: hours.toString().padStart(2, '0') },
    { label: tr('minutes', 'Minutes') || 'Minutes', value: minutes.toString().padStart(2, '0') },
    { label: tr('seconds', 'Seconds') || 'Seconds', value: seconds.toString().padStart(2, '0') },
  ]
}
const now = ref(Date.now())

onMounted(() => {
  const timer = setInterval(() => {
    now.value = Date.now()
  }, 1000)

  onUnmounted(() => clearInterval(timer))
})
/* ── SVG background components per event type ───────────────────────────── */
// Each is a tiny inline SVG — no network request, renders in both modes.
// Add more by creating SvgBirthday.vue, SvgCorporate.vue, etc.
const SvgWedding = defineComponent({
  render: () => h('svg', {
    viewBox: '0 0 400 260', xmlns: 'http://www.w3.org/2000/svg',
    class: 'ec__bg-svg', preserveAspectRatio: 'xMidYMid slice',
  }, [
    // Soft blob left
    h('ellipse', { cx: '60', cy: '220', rx: '110', ry: '90', fill: 'currentColor', opacity: '.07' }),
    // Ring accent right
    h('circle', { cx: '360', cy: '50', r: '80', fill: 'none', stroke: 'currentColor', 'stroke-width': '28', opacity: '.06' }),
    // Small heart
    h('path', { d: 'M200 80 C200 60 175 45 160 60 C145 75 145 95 200 120 C255 95 255 75 240 60 C225 45 200 60 200 80Z', fill: 'currentColor', opacity: '.09' }),
    // Corner petal
    h('circle', { cx: '390', cy: '240', r: '60', fill: 'currentColor', opacity: '.05' }),
  ])
})

const SvgDefault = defineComponent({
  render: () => h('svg', {
    viewBox: '0 0 400 260', xmlns: 'http://www.w3.org/2000/svg',
    class: 'ec__bg-svg', preserveAspectRatio: 'xMidYMid slice',
  }, [
    h('circle', { cx: '50',  cy: '230', r: '100', fill: 'currentColor', opacity: '.06' }),
    h('circle', { cx: '370', cy: '40',  r: '70',  fill: 'none', stroke: 'currentColor', 'stroke-width': '24', opacity: '.05' }),
    h('rect',   { x: '160', y: '170', width: '80', height: '80', rx: '20', fill: 'currentColor', opacity: '.05', transform: 'rotate(20 200 210)' }),
  ])
})

const TYPE_SVG_MAP = {
  WEDDING:   SvgWedding,
  // BIRTHDAY:  SvgBirthday,   // add more as needed
  // CORPORATE: SvgCorporate,
}

function svgForType(code) {
  return TYPE_SVG_MAP[code] ?? SvgDefault
}
// ក្នុងទំព័រ
// const RightPanel = () => h('div', { class: 'flex gap-2 items-center' }, [
//   h('span', 'Filtered: 12',{class:"limit-badge-upgrade"}),
//   h(resolveComponent('RBtn'), { color: 'primary', size: 'xs' }, () => 'Export'),
// ])
usePageBreadcrumb({
  title:tr('setup.title'),
  description:tr('setup.subtitle'),
  // description: tr(`${eventStore.events.length} ${tr('events.events_total')}`),
  icon:"ri-heart-line",

  // ── Back button ──────────────────────────────────────────────────────
  fnBack: () => navigateTo('/events'),        // optional — falls back to router.back()
  
  // ── Right side: action buttons ──────────────────────────────────────
  actions: [
    {
      label: tr('common.upgrade_plan'),
      color: 'neutral',
      variant: 'outline',
      class: 'limit-badge-upgrade',
      size: 'xs',
      // to: localePath('/admin/plans'),
      onClick: () => navigateTo(localePath('/admin/plans'))       // custom handler wins over `to`
    },
    {
      label: tr('new_ceremony'),
      icon: 'ri-add-line',
      type: 'create',
      color: 'create',
      // variant: 'solid',
      // size: 'xs',
      to: '/events/new',                      // navigates via NuxtLink logic
      onClick: () => openAdd()
    },
  ],
// rightTemplate: RightPanel,   // ជំនួស actions ទាំងអស់
//   leftButton: {
//     icon: 'ri-filter-3-line',
//     label: 'Filter',
//     tooltip: 'Quick filters',
//     render: () => h('div', { class: 'flex flex-col gap-2' }, [
//       h('p', 'Filter by status'),
//       h(resolveComponent('RBtn'), { size: 'xs' }, () => 'Pending'),
//     ]),
//     onClick: () => console.log('left button clicked'),
//   },

  // items: [
  //   {
  //     label: tr('events'),
  //     to: '/events',
  //   },
  // ],
})
</script>

<style lang="scss">
// ══ OVERVIEW CARD ══════════════════════════════════════════════════════════
.sp-overview {
  position:        relative;
  overflow:        hidden;
  border-radius:   var(--r-xl);
  border:          1px solid var(--c-border);
  background:      var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  box-shadow:      var(--glass-shadow);
  padding:         var(--sp-6);
  display:         flex;
  gap:             var(--sp-8);
  align-items:     flex-start;
  @media (max-width: 900px) { flex-direction: column; gap: var(--sp-5); padding: var(--sp-4); }

  &__glow {
    position:      absolute;
    top:    -80px;
    right:  -80px;
    width:  280px;
    height: 280px;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      color-mix(in srgb, var(--c-accent) 18%, transparent) 0%,
      transparent 70%
    );
    pointer-events: none;
  }

  &__left {
    display:        flex;
    flex-direction: column;
    gap:            var(--sp-2);
    min-width:      200px;
    flex-shrink:    0;
  }

  &__pill {
    display:     inline-flex;
    align-items: center;
    gap:         var(--sp-1);
    padding:     3px 10px;
    border-radius: var(--r-full);
    border:      1px solid color-mix(in srgb, var(--c-accent) 30%, transparent);
    background:  color-mix(in srgb, var(--c-accent) 10%, transparent);
    color:       var(--c-accent);
    font-size:   0.68rem;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    width:       fit-content;
    i { font-size: 0.75rem; }
  }

  &__name {
    margin:      0;
    font-size:   1.35rem;
    font-weight: 800;
    color:       var(--c-text);
    letter-spacing: -0.025em;
    line-height: 1.2;
  }

  &__hosts {
    display:     flex;
    align-items: center;
    gap:         6px;
    font-size:   0.8125rem;
    color:       var(--c-muted);
    i { color: var(--c-accent); font-size: 0.9rem; }
  }

  &__stats {
    display:               grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap:                   var(--sp-3);
    flex:                  1;
    @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); width: 100%; }
    @media (max-width: 480px) { grid-template-columns: 1fr 1fr; }
  }
}

// ── Stat tile ──────────────────────────────────────────────────────────────
.sp-stat {
  display:     flex;
  align-items: flex-start;
  gap:         var(--sp-3);
  padding:     var(--sp-3) var(--sp-4);
  border-radius: var(--r-lg);
  border:      1px solid var(--c-border);
  background:  color-mix(in srgb, var(--c-surface) 55%, transparent);
  transition:  border-color var(--t-fast) var(--ease-out),
               box-shadow   var(--t-fast) var(--ease-out);

  &:hover {
    border-color: color-mix(in srgb, var(--c-accent) 30%, transparent);
    box-shadow:   var(--glow-accent-sm);
  }

  &__icon {
    display:         flex;
    align-items:     center;
    justify-content: center;
    width:  36px;
    height: 36px;
    border-radius: var(--r-md);
    flex-shrink: 0;
    font-size: 1.05rem;

    &--accent  { background: color-mix(in srgb, var(--c-accent)   15%, transparent); color: var(--c-accent);   }
    &--info    { background: color-mix(in srgb, var(--c-info)     15%, transparent); color: var(--c-info);     }
    &--success { background: color-mix(in srgb, var(--c-success)  15%, transparent); color: var(--c-success);  }
    &--warning { background: color-mix(in srgb, var(--c-accent-2) 15%, transparent); color: var(--c-accent-2); }
  }

  &__body {
    display: flex; flex-direction: column; gap: 2px; min-width: 0;
  }

  &__label {
    font-size: 0.68rem; font-weight: 600; color: var(--c-muted);
    text-transform: uppercase; letter-spacing: 0.06em; white-space: nowrap;
  }

  &__value {
    font-size: 0.9375rem; font-weight: 700; color: var(--c-text); line-height: 1.3;
    &--truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  }
}

// ══ EVENTS GRID ════════════════════════════════════════════════════════════
.sp-grid {
  display:               grid;
  grid-template-columns: repeat(3, 1fr);
  gap:                   var(--sp-2);
  @media (max-width: 1200px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width:  640px) { grid-template-columns: 1fr;gap:var(--sp-1) }
}

// ══ EVENT CARD ══════════════════════════════════════════════════════════════
.ec {
  position:        relative;
  display:         flex;
  flex-direction:  column;
  border-radius:   var(--r-xl);
  // border:          1px solid var(--c-border);
  border: 2px solid transparent;
  background:      var(--glass-bg);
  backdrop-filter: var(--glass-blur-sm);
  -webkit-backdrop-filter: var(--glass-blur-sm);
  overflow:        hidden;
  cursor:          pointer;
  text-align:      left;
  color:           inherit;
  font-family:     var(--font-400);
  // Reference card style: clean white-ish surface, dramatic large type, tilted floating
  box-shadow: 0 2px 12px color-mix(in srgb, var(--c-text) 6%, transparent),
              0 1px 3px  color-mix(in srgb, var(--c-text) 4%, transparent);
  transition:
    transform    var(--t-base) var(--ease-out),
    border-color var(--t-base) var(--ease-out),
    box-shadow   var(--t-base) var(--ease-out);

  &:hover {
    // transform:    translateY(-2px) rotate(0.1deg);
    border-color: color-mix(in srgb, var(--c-accent) 35%, transparent);
    // box-shadow:
    //   0 10px 5px color-mix(in srgb, var(--c-text) 12%, transparent),
    //   var(--glow-accent-sm);
  }

  &:focus-visible {
    outline: 2px solid var(--c-accent);
    outline-offset: 3px;
  }

  // Active (selected) ring
  &__active {
    // border-color: color-mix(in srgb, var(--c-accent) 50%, transparent);
    // border: 2px solid linear-gradient(90deg, var(--c-accent), var(--c-accent-2));
    border: 1px solid orange !important;
    // background: linear-gradient(90deg, var(--c-accent), var(--c-accent-2));
    // box-shadow: var(--glow-accent-sm);
    box-shadow: none;
    padding: 7px;
    padding-inline: 12px;

    // box-shadow:
    //   0 0 0 3px color-mix(in srgb, var(--c-accent) 14%, transparent),
    //   var(--glass-shadow);
  }

  // ── top active stripe (1-line accent, like a colored tab) ──
  &__active-stripe {
    height:     3px;
    background: linear-gradient(90deg, var(--c-accent), var(--c-accent-2));
    box-shadow: var(--glow-accent-sm);
  }

  // ── SVG illustration background ────────────────────────────────────────
  &__bg {
    position:       absolute;
    inset:          0;
    pointer-events: none;
    color:          var(--c-accent);   // SVGs use currentColor
    overflow:       hidden;
    border-radius:  inherit;
  }

  &__bg-svg {
    position: absolute;
    inset:    0;
    width:    100%;
    height:   100%;
    object-fit: cover;
  }

  // ── Cover image overlay ───────────────────────────────────────────────
  &__cover {
    position:            absolute;
    inset:               0;
    background-size:     cover;
    background-position: center;
    opacity:             0.07;
    pointer-events:      none;
    border-radius:       inherit;
    // fade to transparent at bottom so text stays readable
    -webkit-mask-image:  linear-gradient(to bottom, black 0%, black 40%, transparent 100%);
    mask-image:          linear-gradient(to bottom, black 0%, black 40%, transparent 100%);
  }

  // ── 3-dot menu ─────────────────────────────────────────────────────────
  &__dot-wrap {
    position: absolute;
    top:      var(--sp-3);
    right:    var(--sp-3) !important;
    display: flex;
    justify-content: end;
    // right:    var(--sp-3);
    z-index:  20;
  }
  

  &__countdown {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
  }

  &__count-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 4px;
    border-radius: 12px;

    background: color-mix(in srgb, orange 10%, transparent);
    border: 1px solid color-mix(in srgb, orange 25%, transparent);
    backdrop-filter: blur(8px);
  }

  &__count-value {
    font-size: 18px;
    font-weight: 700;
    line-height: 1;
    color: orange;
    font-variant-numeric: tabular-nums;
  }

  &__count-label {
    margin-top: 4px;
    font-size: 10px;
    text-transform: uppercase;
    color: var(--c-muted);
    letter-spacing: .08em;
  }

  // ── Active badge ────────────────────────────────────────────────────────
  &__active-badge {
    position:    absolute;
    top:         var(--sp-3);
    // shifted left to clear the dot menu (30px btn + 12px right + 4px gap)
    right:       calc(30px + var(--sp-3) + var(--sp-2));
    display:     flex;
    align-items: center;
    gap:         4px;
    padding:     3px 10px;
    border-radius: var(--r-full);
    background:  color-mix(in srgb, var(--c-accent) 15%, transparent);
    border:      1px solid color-mix(in srgb, var(--c-accent) 35%, transparent);
    color:       var(--c-accent);
    font-size:   0.6875rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    backdrop-filter: blur(8px);
    white-space: nowrap;
    z-index:     10;
    i { font-size: 0.75rem; }
  }

  // ── Card body ──────────────────────────────────────────────────────────
  &__body {
    position:       relative; // above the bg/cover layers
    z-index:        2;
    display:        flex;
    flex-direction: column;
    gap:            var(--sp-3);
    // padding:        var(--sp-5);
    flex:           1;
  }

  &__badges {
    display:   flex;
    gap:       var(--sp-2);
    flex-wrap: wrap;
    // leave room for top-right badges (dot + active)
    padding-right: var(--sp-8);
  }

  // Reference card style: LARGE bold title, dominant element
  &__title {
    margin:         0;
    font-size:      1.375rem;
    font-weight:    800;
    letter-spacing: -0.03em;
    color:          var(--c-text);
    line-height:    1.2;
    display:            -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow:           hidden;
    // subtle text-shadow for legibility over SVG bg
    text-shadow: 0 1px 8px color-mix(in srgb, var(--c-bg) 40%, transparent);
  }

  &__hosts {
    display:     flex;
    align-items: center;
    gap:         6px;
    font-size:   0.8125rem;
    font-weight: 600;
    color:       var(--c-muted);
    i { color: var(--c-accent); font-size: 0.9rem; }
  }

  &__meta {
    display:        flex;
    flex-direction: column;
    gap:            4px;
  }

  &__meta-row {
    display:     flex;
    align-items: center;
    gap:         6px;
    font-size:   0.78rem;
    color:       var(--c-muted);
    i { font-size: 0.8rem; flex-shrink: 0; }
    span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  }

  // ── Progress pills (replaces RStepper) ────────────────────────────────
  &__pills {
    display:   flex;
    flex-wrap: wrap;
    gap:       var(--sp-1);
  }

  &__pill {
    display:     inline-flex;
    align-items: center;
    gap:         4px;
    padding:     3px 9px;
    border-radius: var(--r-full);
    font-size:   0.72rem;
    font-weight: 600;
    background:  color-mix(in srgb, var(--c-muted) 10%, transparent);
    color:       var(--c-muted);
    border:      1px solid color-mix(in srgb, var(--c-muted) 18%, transparent);
    white-space: nowrap;
    transition:  background var(--t-fast), border-color var(--t-fast);

    i { font-size: 0.72rem; }

    &--done {
      background:  color-mix(in srgb, var(--c-success) 12%, transparent);
      color:       var(--c-success);
      border-color: color-mix(in srgb, var(--c-success) 25%, transparent);
    }
    &--warn {
      background:  color-mix(in srgb, var(--c-danger) 10%, transparent);
      color:       var(--c-danger);
      border-color: color-mix(in srgb, var(--c-danger) 22%, transparent);
    }
    &--info {
      background:  color-mix(in srgb, var(--c-info) 12%, transparent);
      color:       var(--c-info);
      border-color: color-mix(in srgb, var(--c-info) 22%, transparent);
    }
  }

  // ── Footer ────────────────────────────────────────────────────────────
  &__footer {
    display:      flex;
    align-items:  center;
    margin-top:   auto;
    padding-top:  var(--sp-2);
    border-top:   1px solid var(--c-border);
  }

  &__created {
    display:     flex;
    align-items: center;
    gap:         5px;
    font-size:   0.72rem;
    color:       var(--c-muted);
    i { font-size: 0.72rem; }
  }
}

@keyframes countdownBorder {
  from {
    background-position: 0% 50%;
  }
  to {
    background-position: 300% 50%;
  }
}
// ── Card transitions ──────────────────────────────────────────────────────
.ec-badge-enter-active, .ec-badge-leave-active {
  transition: opacity var(--t-fast) var(--ease-out), transform var(--t-fast) var(--ease-out);
}
.ec-badge-enter-from, .ec-badge-leave-to { opacity: 0; transform: translateY(-4px) scale(0.9); }

.ec-menu-enter-active, .ec-menu-leave-active {
  transition: opacity var(--t-fast) var(--ease-out), transform var(--t-fast) var(--ease-out);
}
.ec-menu-enter-from, .ec-menu-leave-to { opacity: 0; transform: translateY(-6px) scale(0.96); }

// ══ ADD CARD ═══════════════════════════════════════════════════════════════
.ec--add {
  min-height:      260px;
  border:          2px dashed var(--c-border);
  background:      color-mix(in srgb, var(--c-surface) 30%, transparent);
  display:         flex;
  align-items:     center;
  justify-content: center;
  padding:         var(--sp-6);
  transition:
    border-color var(--t-base) var(--ease-out),
    background   var(--t-base) var(--ease-out),
    box-shadow   var(--t-base) var(--ease-out),
    transform    var(--t-base) var(--ease-out);

  &:hover {
    border-color: color-mix(in srgb, var(--c-accent) 45%, transparent);
    background:   color-mix(in srgb, var(--c-accent) 4%, transparent);
    box-shadow:   var(--glow-accent-sm);
    transform:    translateY(-3px);

    .ec--add__ring {
      border-color: var(--c-accent);
      color:        var(--c-accent);
      background:   color-mix(in srgb, var(--c-accent) 12%, transparent);
      box-shadow:   var(--glow-accent-sm);
      transform:    scale(1.08);
    }
    .ec--add__label { color: var(--c-accent); }
    .ec--add__svg { opacity: 0.08; }
  }

  &__bg {
    position:       absolute;
    inset:          0;
    pointer-events: none;
    color:          var(--c-accent);
    overflow:       hidden;
    border-radius:  inherit;
  }

  &__svg {
    position: absolute;
    inset: 0;
    width: 100%; height: 100%;
    opacity: 0.04;
    transition: opacity var(--t-base);
  }

  &__inner {
    position:       relative;
    z-index:        2;
    display:        flex;
    flex-direction: column;
    align-items:    center;
    gap:            var(--sp-2);
    text-align:     center;
  }

  &__ring {
    display:         flex;
    align-items:     center;
    justify-content: center;
    width:   52px;
    height:  52px;
    border-radius: 50%;
    border:  2px solid var(--c-border);
    background: color-mix(in srgb, var(--c-surface) 50%, transparent);
    color:   var(--c-muted);
    font-size: 1.5rem;
    margin-bottom: var(--sp-1);
    transition: all var(--t-base) var(--ease-out);
  }

  &__label {
    font-size:   0.9375rem;
    font-weight: 700;
    color:       var(--c-muted);
    transition:  color var(--t-base);
  }

  &__sub {
    font-size:  0.75rem;
    color:      var(--color-w-b-3);
    max-width:  160px;
    line-height: 1.45;
  }
}

// ══ BADGES ═════════════════════════════════════════════════════════════════
.badge {
  display:       inline-flex;
  align-items:   center;
  gap:           4px;
  padding:       2px 9px;
  border-radius: var(--r-full);
  font-size:     0.68rem;
  font-weight:   700;
  letter-spacing: 0.04em;
  text-transform: capitalize;

  &--type {
    background:  color-mix(in srgb, var(--c-accent) 10%, transparent);
    color:       var(--c-accent);
    border:      1px solid color-mix(in srgb, var(--c-accent) 22%, transparent);
    i { font-size: 0.72rem; }
  }
  &-active, &-confirmed {
    background:  color-mix(in srgb, var(--c-success) 12%, transparent);
    color:       var(--c-success);
    border:      1px solid color-mix(in srgb, var(--c-success) 25%, transparent);
  }
  &-PLANNING, &-pending {
    background:  color-mix(in srgb, var(--c-accent-2) 12%, transparent);
    color:       var(--c-accent-2);
    border:      1px solid color-mix(in srgb, var(--c-accent-2) 25%, transparent);
  }
  &-cancelled {
    background:  color-mix(in srgb, var(--c-danger) 10%, transparent);
    color:       var(--c-danger);
    border:      1px solid color-mix(in srgb, var(--c-danger) 22%, transparent);
  }
  &-draft, &-DRAFT {
    background:  color-mix(in srgb, var(--c-info) 10%, transparent);
    color:       var(--c-info);
    border:      1px solid color-mix(in srgb, var(--c-info) 22%, transparent);
  }
}

// ══ LIMIT BADGE ═══════════════════════════════════════════════════════════
.limit-badge {
  display:     flex;
  align-items: center;
  gap:         5px;
  font-size:   0.8125rem;
  color:       var(--c-muted);
  padding:     var(--sp-2) var(--sp-3);
  border-radius: var(--r-md);
  background:  color-mix(in srgb, var(--c-warning) 8%, transparent);
  border:      1px solid color-mix(in srgb, var(--c-warning) 20%, transparent);
  i { color: var(--c-warning); }
  &__sep { color: var(--c-border); }
  a {
    color: var(--c-accent);
    text-decoration: underline;
    text-underline-offset: 2px;
    font-weight: 600;
    &:hover { color: var(--c-accent-2); }
  }
}

.limit-badge-upgrade{
    a {
    color: var(--c-accent);
    text-decoration: underline;
    text-underline-offset: 2px;
    font-weight: 600;
    &:hover { color: var(--c-accent-2); }
  }
}
// ══ DARK MODE ADJUSTMENTS ═════════════════════════════════════════════════
.dark {
  .ec {
    box-shadow:
      0 2px 12px color-mix(in srgb, #000 30%, transparent),
      0 1px 3px  color-mix(in srgb, #000 20%, transparent);

    &:hover {
      box-shadow:
        0 16px 48px color-mix(in srgb, #000 45%, transparent),
        var(--glow-accent-sm);
    }

    &__title {
      text-shadow: 0 1px 12px color-mix(in srgb, #000 50%, transparent);
    }

    &__dot-btn {
      background: color-mix(in srgb, var(--c-surface) 80%, transparent);
    }

    &__menu {
      box-shadow:
        0 8px 32px color-mix(in srgb, #000 50%, transparent),
        0 1px 0 color-mix(in srgb, #fff 4%, transparent) inset;
    }
  }

  .ec--add {
    background: color-mix(in srgb, var(--c-surface) 15%, transparent);
  }

  .sp-stat {
    background: color-mix(in srgb, var(--c-surface) 40%, transparent);
  }
}
</style>
