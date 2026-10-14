<script setup>
import { LETTER_TEMPLATES } from '~/composables/useLetterData'

const props = defineProps(['data','templateProp'])
const data = computed(() => props.data)
const templateProp = computed(() => props.templateProp)

const emit = defineEmits('go-to-editor','send-all')
 
// ── Device switcher ───────────────────────────────────────────────────────
const previewDevice = ref('mobile')

const devices = [
  { key: 'desktop' , icon: 'ri-computer-line',    label: { en: 'Desktop', km: 'កុំព្យូទ័រ'   } },
  { key: 'tablet'  , icon: 'ri-tablet-line',      label: { en: 'Tablet',  km: 'ថេប្លេត'      } },
  { key: 'mobile'  , icon: 'ri-smartphone-line',  label: { en: 'Mobile',  km: 'ទូរស័ព្ទ'     } },
]

// ── Stats from stores ─────────────────────────────────────────────────────
const guestStore = useGuestStore()

const stats = computed(() => ({
  total:     guestStore.stats?.total     ?? 0,
  confirmed: guestStore.stats?.confirmed ?? 0,
  sent:      guestStore.stats?.sent      ?? 0,
  opened:    guestStore.stats?.opened    ?? 0,
}))

const currentTime = ref('')
const updateTime = () => {
  const now = new Date()

  currentTime.value = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })
}
// ── Server template CSS var override ─────────────────────────────────────
// If the letter uses a server-defined template ID not in TEMPLATE_MAP,
// the Classic template renders but with server CSS vars injected on the wrapper.
const { varsFor, overrideCSSFor } = useLetterData()

const wrapperVars = computed(() => {
  // Only inject vars for unknown templates; known templates own their own palette
  if (LETTER_TEMPLATES[props.templateProp]) return {}
  return varsFor(data.value?.template)
})

const overrideCSS = computed(() =>
  LETTER_TEMPLATES[props.templateProp] ? '' : overrideCSSFor(props.templateProp)
)

// Active component — fall back to Classic for unknown server template IDs
const activeComponent = computed(() =>
  LETTER_TEMPLATES[props.templateProp] ?? TemplateClassic
)

// ── Template map ──────────────────────────────────────────────────────────
const activeTemplate = computed(() => {
  console.log("props.templateProp=================> ", props.templateProp)
  return (
    LETTER_TEMPLATES.find(t => t.key === props.templateProp
    // LETTER_TEMPLATES.find(t => t.key === props.letter.template
    )?.component ??
    LETTER_TEMPLATES[0].component
  )
})
mounted(() => {
  updateTime()
})
</script>

<template>
  <div class="plv-root animate-fade-up delay-2">
    <!-- ── Device switcher bar ────────────────────────────────────────── -->
    <div class="plv-device-bar glass-sm">
      <button
        v-for="d in devices"
        :key="d.key"
        class="device-btn"
        :class="{ active: previewDevice === d.key }"
        :title="tBy(d.label)"
        @click="previewDevice = d.key"
      >
        <i :class="d.icon" />
        <span class="hide-mobile">{{ tBy(d.label) }}</span>
      </button>
    </div>

    <!-- ── Device frame stage ─────────────────────────────────────────── -->
    <div class="preview-stage" :class="`device-${previewDevice}`">
      <div
        class="preview-device-frame"
        :class="`frame-${previewDevice}`"
      >

        <!-- Mobile / tablet status bar -->
        <div v-if="previewDevice !== 'desktop'" class="device-chrome">
          <div class="dc-notch" />
          <div class="dc-status">
            <span>{{ currentTime }}</span>
            <div class="dc-icons">
              <i class="ri-wifi-fill" />
              <i class="ri-battery-fill" />
            </div>
          </div>
        </div>

        <!-- Scrollable letter -->
         <!-- Scrollable letter -->
        <div class="device-screen">
          <div class="ld-wrapper" :style="wrapperVars">
            <!-- Inject server override CSS for unknown template IDs -->
            <!-- eslint-disable-next-line vue/no-v-html -->
            <component :is="'style'" v-if="overrideCSS" v-html="overrideCSS" />

              <!-- Delegate to the active template component -->
              <component
                :is="activeTemplate"
                :data="data"
                :device="previewDevice"
              />
              <!-- <TemplateModern :letter="letter" /> -->
              <!-- <TemplateForest :letter="letter" /> -->
              <!-- <TemplateBlossom :letter="letter" /> -->
              <!-- <TemplateRoyalGold :letter="letter" /> -->
              <!-- <TemplateMidnight :letter="letter" /> -->
              <!-- <LetterDocument :letter="letter" :device="previewDevice" /> -->
            </div>

            <!-- iPhone home bar -->
            <div v-if="previewDevice === 'mobile'" class="device-home-bar" />
        </div>
      </div>
    </div>

    <!-- ── Stats bar ──────────────────────────────────────────────────── -->
    <div class="preview-stats glass-card animate-fade-up">

      <div class="ps-item">
        <i class="ri-group-fill" style="color:var(--c-accent)" />
        <div>
          <div class="ps-val">{{ stats.total }}</div>
          <div class="ps-lbl">{{ tBy({ en: 'Recipients', km: 'អ្នកទទួល' }) }}</div>
        </div>
      </div>

      <div class="ps-divider" />

      <div class="ps-item">
        <i class="ri-checkbox-circle-fill" style="color:var(--c-success)" />
        <div>
          <div class="ps-val">{{ stats.confirmed }}</div>
          <div class="ps-lbl">{{ tBy({ en: 'Confirmed', km: 'បានបញ្ជាក់' }) }}</div>
        </div>
      </div>

      <div class="ps-divider" />

      <div class="ps-item">
        <i class="ri-mail-send-fill" style="color:var(--c-info)" />
        <div>
          <div class="ps-val">{{ stats.sent }}</div>
          <div class="ps-lbl">{{ tBy({ en: 'Sent', km: 'បានផ្ញើ' }) }}</div>
        </div>
      </div>

      <div class="ps-divider hide-mobile" />

      <div class="ps-item hide-mobile">
        <i class="ri-eye-fill" style="color:var(--c-accent-2)" />
        <div>
          <div class="ps-val">{{ stats.opened }}</div>
          <div class="ps-lbl">{{ tBy({ en: 'Opened', km: 'បានបើក' }) }}</div>
        </div>
      </div>

      <div class="ps-actions">
        <button class="btn-ghost btn-sm" @click="emit('go-to-editor')">
          <i class="ri-edit-2-line" />
          {{ tBy({ en: 'Edit', km: 'កែប្រែ' }) }}
        </button>
        <button class="btn-primary btn-sm" @click="emit('send-all')">
          <i class="ri-send-plane-fill" />
          {{ tBy({ en: 'Send All', km: 'ផ្ញើទាំងអស់' }) }}
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.plv-root {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-5);
}
.ld-wrapper { min-height: 100%; }

// ── Device switcher ───────────────────────────────────────────────────────
.plv-device-bar {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 5px;
  border-radius: var(--r-full);
}

.device-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: var(--r-full);
  border: none;
  background: none;
  color: var(--c-muted);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all var(--t-fast);
  white-space: nowrap;

  i { font-size: 0.9375rem; }

  &:hover { color: var(--c-text); background: rgba(255,255,255,0.05); }
  &.active { background: rgba(255,140,66,0.15); color: var(--c-accent); }
}

// ── Device stage ──────────────────────────────────────────────────────────
.preview-stage {
  width: 100%;
  display: flex;
  justify-content: center;
  transition: all var(--t-spring);

  &.device-desktop .preview-device-frame { width: min(960px, 100%); border-radius: var(--r-xl); }
  &.device-tablet  .preview-device-frame { width: min(768px, 100%); border-radius: 24px; }
  &.device-mobile  .preview-device-frame { width: min(390px, 100%); border-radius: 44px; }
}

.preview-device-frame {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  overflow: hidden;
  box-shadow: 0 32px 64px rgba(0,0,0,0.4);
  transition: all var(--t-spring);
  position: relative;

  &.frame-mobile { border-width: 8px; border-color: #1c1c1e; }
  &.frame-tablet { border-width: 6px; border-color: #2c2c2e; }
}

// ── Status bar chrome ─────────────────────────────────────────────────────
.device-chrome {
  background: var(--c-surface);
  padding: 0 20px;
}

.dc-notch {
  width: 120px;
  height: 28px;
  background: #1c1c1e;
  border-radius: 0 0 20px 20px;
  margin: 0 auto;
}

.dc-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0 2px;
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--c-text);

  .dc-icons { display: flex; gap: 4px; font-size: 0.75rem; }
}

// ── Scrollable letter area ────────────────────────────────────────────────
.device-screen {
  overflow-y: auto;
  max-height: 780px;
    /* Hide scrollbar - Firefox */
  scrollbar-width: none;

  /* Hide scrollbar - IE and old Edge */
  -ms-overflow-style: none;

  /* Hide scrollbar - Chrome, Safari, Edge */
  &::-webkit-scrollbar {
    display: none;
  }

  .frame-desktop & { max-height: 72vh; }
  .frame-tablet  & { max-height: 900px; }
  .frame-mobile  & { max-height: 720px; }
}

// ── iPhone home indicator ─────────────────────────────────────────────────
.device-home-bar {
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--c-surface);

  &::after {
    content: '';
    width: 120px;
    height: 4px;
    background: rgba(255,255,255,0.2);
    border-radius: var(--r-full);
  }
}

// ── Stats bar ─────────────────────────────────────────────────────────────
.preview-stats {
  display: flex;
  align-items: center;
  gap: var(--sp-5);
  padding: var(--sp-4) var(--sp-6);
  border-radius: var(--r-2xl);
  flex-wrap: wrap;
  width: min(700px, 100%);

  @media (max-width: 640px) { gap: var(--sp-3); padding: var(--sp-4); }
}

.ps-item {
  display: flex;
  align-items: center;
  gap: var(--sp-3);

  i { font-size: 1.25rem; }
  .ps-val { font-size: 1.25rem; font-weight: 700; line-height: 1; }
  .ps-lbl { font-size: 0.75rem; color: var(--c-muted); margin-top: 1px; }
}

.ps-divider { width: 1px; height: 36px; background: var(--c-border); }

.ps-actions {
  margin-left: auto;
  display: flex;
  gap: var(--sp-2);

  @media (max-width: 640px) { margin-left: 0; flex-basis: 100%; }
}
</style>
