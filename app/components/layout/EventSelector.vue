<!-- components/sidebar/SEventSelector.vue -->
<!--
  Event / Wedding selector for the sidebar.

  Props:
    is-collapsed  Boolean  – sidebar is in icon-only mode

  When expanded  → full card trigger with name + date + arrow
  When collapsed → 40×40 rounded avatar (initials + colour ring)
                   hovering shows a rich RTooltip with event name & date
                   clicking still opens the picker dropdown
-->

<script setup>
import { formatDate } from '~/helpers/str'

const props = defineProps({
  isCollapsed: { type: Boolean, default: false },
})

const emit = defineEmits(['toggle-collapse', 'close'])

// ── Store ─────────────────────────────────────────────────────────────────
const eventStore    = useEventStore()
const events        = computed(() => eventStore.events)
const activeEvent   = computed(() => eventStore.activeEvent)
const activeEventId = computed(() => eventStore.activeEventId)
const { tr } = useTr()
const { tBy } = useSarikaLocale()
const toast         = useToast()

// ── Toast when no weddings ────────────────────────────────────────────────
watch(
  () => [eventStore.loading, eventStore.initialized, events.value.length],
  ([loading, initialized]) => {
    if (!loading && initialized && events.value.length === 0) {
      toast.add({
        color:       'orange',
        icon:        'i-lucide-calendar-x',
        title:       tr('events.no_wedding_found'),
        description: tr('events.no_wedding_hint'),
        duration:    6000,
      })
    }
  },
)

// ── Dropdown state ────────────────────────────────────────────────────────
const showEventPicker = ref(false)

// ── Click-outside to close picker ─────────────────────────────────────────
const rootRef = ref(null)

function onClickOutside(e) {
  if (rootRef.value && !rootRef.value.contains(e.target)) {
    showEventPicker.value = false
  }
}

watch(showEventPicker, (open) => {
  if (open) {
    nextTick(() => document.addEventListener('mousedown', onClickOutside))
  } else {
    document.removeEventListener('mousedown', onClickOutside)
  }
})

onUnmounted(() => document.removeEventListener('mousedown', onClickOutside))

// ── Actions ───────────────────────────────────────────────────────────────
function selectEvent(id) {
  eventStore.setActiveEvent(id)
  showEventPicker.value = false
}

function togglePicker() {
  showEventPicker.value = !showEventPicker.value
}

// ── Helpers ───────────────────────────────────────────────────────────────

/** Two-letter initials from the active event title */
const initials = computed(() => {
  const title = tBy({ en: activeEvent.value?.title, km: activeEvent.value?.titleKm }) ?? ''
  return title
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('')
    || '?'
})

/** Short date string for tooltip / collapsed view */
const shortDate = computed(() =>
  activeEvent.value
    ? formatDate(activeEvent.value.date, { month: 'short', day: 'numeric' })
    : '—',
)

/** Full date string for expanded trigger */
const fullDate = computed(() =>
  activeEvent.value
    ? formatDate(activeEvent.value.date, { month: 'short', day: 'numeric', year: 'numeric' })
    : '—',
)

/** Ring / dot colour — fallback to accent */
const eventColor = computed(() => activeEvent.value?.color || 'var(--c-accent)')
</script>

<template>
  <div
    ref="rootRef"
    class="ses"
    :class="{ 'ses--collapsed': isCollapsed }"
  >
    <!-- ══════════════════════════════════════════════════════════════════
         EXPANDED  — full card trigger
    ═══════════════════════════════════════════════════════════════════ -->
    <div
      v-if="!isCollapsed"
      class="ses__trigger"
      role="button"
      tabindex="0"
      :aria-expanded="showEventPicker"
      aria-haspopup="listbox"
      @click="togglePicker"
      @keydown.enter.space.prevent="togglePicker"
    >
      <!-- Colour dot -->
      <span v-if="activeEvent?.id" class="ses__dot" :style="{ background: eventColor }" />

      <!-- Text -->
      <div class="ses__info">
        <div class="ses__info" v-if="activeEvent?.id" >
          <span class="ses__name">
            {{ tBy({ en: activeEvent?.title, km: activeEvent?.titleKm }) || tr('new_event') }}
          </span>
          <span class="ses__date">{{ fullDate }}</span>
        </div>
           <!-- Empty -->
        <div v-else class="ses__name ses__empty">
          <i class="ri-calendar-line ses__empty-icon" />
          <span>{{ tr('events.no_weddings_yet') }}</span>
        </div>
      </div>

      <!-- Arrow -->
      <i v-if="events.length > 0"
        class="ri-arrow-down-s-line ses__arrow"
        :class="{ 'ses__arrow--open': showEventPicker }"
      />
    </div>

    <!-- ══════════════════════════════════════════════════════════════════
         COLLAPSED — avatar circle + RTooltip
         Avatar shows initials, ring shows event colour.
         Tooltip shows event name + date on hover, picker opens on click.
    ═══════════════════════════════════════════════════════════════════ -->
    <RTooltip  isPopper placement="right"
      v-else
      :positions="['right']"
      trigger="hover"
      :offset="12"
    >
      <!-- ── Trigger slot: the avatar ───────────────────────────────── -->
      <template #default>
        <button
          type="button"
          class="ses__avatar"
          :class="{ 'ses__avatar--open': showEventPicker }"
          :aria-label="tBy({ en: activeEvent?.title, km: activeEvent?.titleKm }) || tr('new_event')"
          :aria-expanded="showEventPicker"
          aria-haspopup="listbox"
          :style="{ '--avatar-ring': eventColor }"
          @click="togglePicker"
          @keydown.enter.space.prevent="togglePicker"
        >
          <!-- Initials -->
          <span class="ses__avatar-initials">{{ initials }}</span>

          <!-- Colour ring pulse when picker is open -->
          <span v-if="showEventPicker" class="ses__avatar-ring-pulse" />
        </button>
      </template>

      <!-- ── Content slot: rich tooltip card ───────────────────────── -->
      <template v-if="activeEvent" #text>
        <div class="ses__tip">
          <!-- Colour indicator row -->
          <!-- <div class="ses__tip-header">
            <span class="ses__tip-dot" :style="{ background: eventColor }" />
            <span class="ses__tip-label">
              {{ tBy({ en: 'Active Event', km: 'ព្រឹត្តិការណ៍សកម្ម' }) }}
            </span>
          </div>  -->

          <!-- Event name -->
          <div class="ses__tip-name">
            {{ tBy({ en: activeEvent?.title, km: activeEvent?.titleKm }) || tr('new_event') }}
          </div>

          <!-- Date row -->
          <div class="ses__tip-date">
            <i class="ri-calendar-line" />
            {{ fullDate }}
          </div>

          <!-- Hint -->
          <!-- <div class="ses__tip-hint">
            {{ tBy({ en: 'Click to switch event', km: 'ចុចដើម្បីប្តូរព្រឹត្តិការណ៍' }) }}
          </div> -->
        </div>
      </template>
    </RTooltip>

    <!-- ══════════════════════════════════════════════════════════════════
         PICKER DROPDOWN  (shared by both modes)
    ═══════════════════════════════════════════════════════════════════ -->
    <Transition name="ses-fade-up">
      <div
        v-if="showEventPicker && events.length > 0"
        class="ses__picker"
        :class="{ 'ses__picker--side': isCollapsed }"
        role="listbox"
        :aria-label="tr('events.select_event')"
      >

        <!-- Loading -->
        <div v-if="eventStore.loading" class="ses__empty">
          <i class="ri-loader-4-line ses__empty-icon ses--spin" />
          <span>{{ tr('common.loading') }}</span>
        </div>

        <!-- Empty -->
        <div v-else-if="events.length === 0" class="ses__empty">
          <i class="ri-calendar-line ses__empty-icon" />
          <span>{{ tr('events.no_weddings_yet') }}</span>
        </div>

        <!-- List -->
        <template v-else>
          <div
            v-for="ev in events"
            :key="ev.id"
            class="ses__item"
            :class="{ 'ses__item--active': ev.id === activeEventId }"
            role="option"
            :aria-selected="ev.id === activeEventId"
            tabindex="0"
            @click="selectEvent(ev.id)"
            @keydown.enter.space.prevent="selectEvent(ev.id)"
          >
            <span class="ses__ep-dot" :style="{ background: ev.color }" />
            <div class="ses__ep-body">
              <div class="ses__ep-name">{{ tBy({ en: ev.title, km: ev.titleKm }) }}</div>
              <div class="ses__ep-date">
                {{ formatDate(ev.date, { month: 'short', day: 'numeric' }) }}
              </div>
            </div>
            <!-- Active check -->
            <i
              v-if="ev.id === activeEventId"
              class="ri-check-line ses__ep-check"
            />
          </div>
        </template>

      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
// ═══════════════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════════════
.ses {
  position: relative;
  margin: 8px 12px;

  // Collapsed: centre the avatar, give it a fixed footprint
  &--collapsed {
    margin: 8px auto;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 44px;
    height: 44px;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPANDED TRIGGER
// ═══════════════════════════════════════════════════════════════════════════
.ses__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--r-md, 10px);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--glass-border, rgba(255,255,255,0.08));
  cursor: pointer;
  outline: none;
  transition: background 0.15s, border-color 0.15s;
  user-select: none;

  &:hover,
  &:focus-visible {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 140, 66, 0.22);
  }
}

.ses__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.ses__info  { flex: 1; min-width: 0; }

.ses__name {
  display: block;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--c-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ses__date {
  display: block;
  font-size: 0.6875rem;
  color: var(--c-muted);
  margin-top: 1px;
}

.ses__arrow {
  color: var(--c-muted);
  font-size: 1rem;
  flex-shrink: 0;
  transition: transform 0.18s ease;

  &--open { 
    transform: rotate(180deg); 
    display:flex;
    justify-content: right;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// COLLAPSED — AVATAR CIRCLE
// ═══════════════════════════════════════════════════════════════════════════
.ses__avatar {
  // Fixed 40×40 pill
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;

  // Glass background
  background: rgba(255, 255, 255, 0.06);

  // Colour ring from event
  border: 2px solid var(--avatar-ring, var(--c-accent, #ff8c42));
  box-shadow: 0 0 0 0 var(--avatar-ring, var(--c-accent, #ff8c42));

  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  outline: none;
  padding: 0;
  transition:
    background  0.15s ease,
    box-shadow  0.2s  ease,
    transform   0.15s ease;

  &:hover,
  &:focus-visible {
    background: rgba(255, 255, 255, 0.12);
    box-shadow: 0 0 0 3px rgba(var(--avatar-ring, 255, 140, 66), 0.25);
    transform: scale(1.06);
  }

  // When picker is open — stronger glow
  &--open {
    background: rgba(255, 255, 255, 0.10);
    box-shadow: 0 0 0 4px rgba(var(--avatar-ring, 255, 140, 66), 0.35);
  }
}

.ses__avatar-initials {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--c-text);
  letter-spacing: 0.04em;
  line-height: 1;
  pointer-events: none;
  user-select: none;
}

// Animated ring that pulses when picker is open
.ses__avatar-ring-pulse {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid var(--avatar-ring, var(--c-accent, #ff8c42));
  opacity: 0.45;
  animation: ses-ring-pulse 1.4s ease-out infinite;
  pointer-events: none;
}

@keyframes ses-ring-pulse {
  0%   { transform: scale(1);    opacity: 0.5; }
  70%  { transform: scale(1.22); opacity: 0;   }
  100% { transform: scale(1.22); opacity: 0;   }
}

// ═══════════════════════════════════════════════════════════════════════════
// RICH TOOLTIP CARD  (inside RTooltip #content slot)
// ═══════════════════════════════════════════════════════════════════════════
.ses__tip {
  background: var(--c-surface, #1a1a2e);
  border: 1px solid var(--c-border, rgba(255,255,255,0.08));
  border-radius: 12px;
  padding: 12px 14px;
  min-width: 180px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.28);
  display: flex;
  flex-direction: column;
  gap: 5px;

  // Arrow pointer on the left side (towards the avatar)
  &::before {
    content: '';
    position: absolute;
    left: -5px;
    top: 50%;
    transform: translateY(-50%) rotate(45deg);
    width: 8px;
    height: 8px;
    background: var(--c-surface, #1a1a2e);
    border-left: 1px solid var(--c-border, rgba(255,255,255,0.08));
    border-bottom: 1px solid var(--c-border, rgba(255,255,255,0.08));
  }
}

.ses__tip-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
}

.ses__tip-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.ses__tip-label {
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--c-muted);
}

.ses__tip-name {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--c-text);
  line-height: 1.3;
}

.ses__tip-date {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.75rem;
  color: var(--c-muted);

  i { font-size: 0.8rem; opacity: 0.7; }
}

.ses__tip-hint {
  margin-top: 4px;
  padding-top: 6px;
  border-top: 1px solid var(--c-border, rgba(255,255,255,0.07));
  font-size: 0.68rem;
  color: var(--c-muted);
  opacity: 0.7;
}

// ═══════════════════════════════════════════════════════════════════════════
// PICKER DROPDOWN
// ═══════════════════════════════════════════════════════════════════════════
.ses__picker {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 0;
  right: 0;
  background: var(--c-bg);
  border: 1px solid var(--c-border);
  border-radius: var(--r-lg, 12px);
  padding: 6px;
  z-index: 200;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.22);
  min-width: 200px;
  overflow-y: auto !important;

  // Collapsed: open to the right of the avatar
  &--side {
    bottom: 0;
    left: calc(100% + 10px);
    right: auto;
  }
}

// ─── Item ─────────────────────────────────────────────────────────────────
.ses__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: var(--r-sm, 8px);
  cursor: pointer;
  outline: none;
  transition: background 0.13s;
  user-select: none;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--c-text);
  text-overflow: ellipsis;
  overflow-y: auto !important;

  &:hover,
  &:focus-visible {
    background: rgba(255, 255, 255, 0.06);
  }

  &--active {
    background: rgba(255, 140, 66, 0.10);
  }
}

.ses__ep-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.ses__ep-body { flex: 1; min-width: 0; }

.ses__ep-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--c-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ses__ep-date {
  font-size: 0.6875rem;
  color: var(--c-muted);
  margin-top: 1px;
}

.ses__ep-check {
  font-size: 0.9rem;
  color: var(--c-accent, #ff8c42);
  flex-shrink: 0;
}

// ─── Empty ────────────────────────────────────────────────────────────────
.ses__empty {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  color: var(--c-muted);
  font-size: 0.8rem;
}

.ses__empty-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.ses--spin {
  animation: ses-spin 1s linear infinite;
}

@keyframes ses-spin { to { transform: rotate(360deg); } }

// ═══════════════════════════════════════════════════════════════════════════
// TRANSITION
// ═══════════════════════════════════════════════════════════════════════════
.ses-fade-up-enter-active,
.ses-fade-up-leave-active {
  transition: opacity 0.18s ease, transform 0.18s var(--ease-out, ease-out);
}
.ses-fade-up-enter-from,
.ses-fade-up-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>