<template>
  <RWrapperPage class="ai-translate-page">

    <RPageHeader title="AI Translate" subtitle="Translate any content into multiple languages using Gemini AI">
      <template #actions>
        <NuxtLink to="/ai/batch-translate" class="btn-ghost btn-sm">
          <i class="ri-translate-ai-line" /> Batch Translate
        </NuxtLink>
        <button class="btn-ghost btn-sm" :disabled="!hasHistory" @click="clearHistory">
          <i class="ri-delete-bin-line" /> Clear History
        </button>
      </template>
    </RPageHeader>

    <!-- Feature Presets -->
    <div class="glass-card at-presets-card animate-fade-up">
      <div class="at-presets-header">
        <span class="at-panel-title"><i class="ri-apps-line" /> Quick Presets</span>
        <span class="at-hint">Select a feature to pre-fill the relevant fields</span>
      </div>
      <div class="at-presets-grid">
        <button
          v-for="preset in PRESETS"
          :key="preset.key"
          class="at-preset-btn"
          :class="{ active: activePreset === preset.key }"
          @click="applyPreset(preset)"
        >
          <i :class="preset.icon" />
          <span>{{ preset.label }}</span>
        </button>
        <button
          class="at-preset-btn"
          :class="{ active: activePreset === 'custom' }"
          @click="setCustom"
        >
          <i class="ri-edit-2-line" />
          <span>Custom</span>
        </button>
      </div>
    </div>

    <div class="at-layout animate-fade-up delay-1">

      <!-- Left: Input Panel -->
      <div class="glass-card at-input-panel">
        <div class="at-panel-header">
          <span class="at-panel-title">
            <i :class="currentPreset?.icon ?? 'ri-edit-line'" />
            {{ currentPreset?.label ?? 'Custom Fields' }}
          </span>
          <button class="btn-ghost btn-xs" @click="clearFields">
            <i class="ri-eraser-line" /> Clear
          </button>
        </div>

        <!-- Preset description -->
        <p v-if="currentPreset?.description" class="at-preset-desc">
          <i class="ri-information-line" /> {{ currentPreset.description }}
        </p>

        <!-- Fields list -->
        <div class="at-fields">
          <div v-for="(field, idx) in fields" :key="idx" class="at-field-row">
            <div class="at-field-key">
              <span v-if="field.locked" class="at-field-label">
                <i class="ri-lock-line" /> {{ field.key }}
              </span>
              <input
                v-else
                v-model="field.key"
                class="input input-sm"
                placeholder="Field name"
                @keydown.enter.prevent="focusText(idx)"
              />
              <button v-if="!field.locked && fields.length > 1" class="btn-icon btn-xs-icon" @click="removeField(idx)">
                <i class="ri-close-line" />
              </button>
            </div>
            <textarea
              :ref="el => textareaRefs[idx] = el"
              v-model="field.value"
              class="input at-textarea"
              :placeholder="field.placeholder || `Enter ${field.key || 'text'}...`"
              rows="2"
            />
          </div>
        </div>

        <button class="btn-ghost btn-sm at-add-field" @click="addField">
          <i class="ri-add-line" /> Add Field
        </button>

        <!-- Target Languages -->
        <div class="at-lang-section">
          <label class="at-section-label">Target Languages</label>
          <div class="at-lang-chips">
            <button
              v-for="lang in availableLangs"
              :key="lang.code"
              type="button"
              class="at-lang-chip"
              :class="{ selected: selectedLangCodes.includes(lang.code) }"
              @click="toggleLang(lang)"
            >
              <i v-if="selectedLangCodes.includes(lang.code)" class="ri-check-line" />
              {{ lang.name }} <span class="at-lang-code">{{ lang.code }}</span>
            </button>
          </div>
          <p v-if="langStore.loading" class="at-hint">
            <i class="ri-loader-4-line animate-spin" /> Loading languages...
          </p>
        </div>

        <!-- Translate Button -->
        <button
          class="btn-primary at-translate-btn"
          :disabled="aiStore.loading || !canTranslate"
          @click="translate"
        >
          <i :class="aiStore.loading ? 'ri-loader-4-line animate-spin' : 'ri-sparkling-line'" />
          {{ aiStore.loading ? 'Translating...' : 'Translate' }}
        </button>

        <p v-if="aiStore.error" class="at-error">
          <i class="ri-error-warning-line" /> {{ aiStore.error }}
        </p>
      </div>

      <!-- Right: Result Panel -->
      <div class="at-result-col">

        <!-- Current result -->
        <div v-if="result" class="glass-card at-result-panel animate-scale-in">
          <div class="at-panel-header">
            <span class="at-panel-title"><i class="ri-sparkling-2-line" /> Result</span>
            <div class="at-result-actions">
              <button class="btn-ghost btn-xs" @click="copyAll">
                <i class="ri-file-copy-line" /> Copy All
              </button>
              <button class="btn-ghost btn-xs" @click="saveToHistory">
                <i class="ri-bookmark-line" /> Save
              </button>
            </div>
          </div>

          <div v-for="(translations, fieldKey) in result" :key="fieldKey" class="at-result-field">
            <div class="at-result-field-label">{{ fieldKey }}</div>
            <div class="at-result-langs">
              <div
                v-for="(text, langCode) in translations"
                :key="langCode"
                class="at-result-lang-row"
              >
                <span class="at-result-lang-badge">{{ langCode }}</span>
                <span class="at-result-text">{{ text }}</span>
                <button class="btn-icon btn-xs-icon at-copy-btn" title="Copy" @click="copyText(text)">
                  <i class="ri-file-copy-line" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else-if="!aiStore.loading" class="glass-card at-empty">
          <i class="ri-sparkling-2-line" />
          <p>Choose a preset or add custom fields, then click <strong>Translate</strong>.</p>
        </div>

        <!-- Loading skeleton -->
        <div v-if="aiStore.loading" class="glass-card at-skeleton">
          <div v-for="i in fields.length" :key="i" class="at-skel-block">
            <div class="skel skel-label" />
            <div v-for="j in selectedLangs.length" :key="j" class="skel skel-row" />
          </div>
        </div>

        <!-- History -->
        <div v-if="history.length" class="glass-card at-history-panel">
          <div class="at-panel-header">
            <span class="at-panel-title"><i class="ri-history-line" /> History</span>
            <span class="at-hint">{{ history.length }} saved</span>
          </div>
          <div class="at-history-list">
            <div
              v-for="(entry, i) in history"
              :key="i"
              class="at-history-item"
              @click="loadHistory(entry)"
            >
              <div class="at-history-preview">
                <span class="at-history-keys">
                  <i :class="PRESETS.find(p => p.key === entry.preset)?.icon ?? 'ri-edit-line'" />
                  {{ entry.preset ?? 'custom' }}
                </span>
                <span class="at-history-time">{{ entry.time }}</span>
              </div>
              <p class="at-history-snippet">
                {{ Object.values(entry.input)[0]?.slice(0, 70) }}{{ Object.values(entry.input)[0]?.length > 70 ? '…' : '' }}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  </RWrapperPage>
</template>

<script setup>
definePageMeta({ layout: 'navbar', middleware: ['auth'] })

const aiStore = useAIStore()
const langStore = useLanguageStore()
const toast = useToastStore()

// ── Presets ──────────────────────────────────────────────────────────────────
const PRESETS = [
  {
    key: 'wedding',
    label: 'Wedding',
    icon: 'ri-heart-line',
    description: 'Wedding title, venue, and couple names',
    fields: [
      { key: 'title',     placeholder: 'e.g. Chan & Sokhom Wedding', locked: true },
      { key: 'brideName', placeholder: 'e.g. Sokhom Chan',           locked: true },
      { key: 'groomName', placeholder: 'e.g. Dara Pich',             locked: true },
      { key: 'venue',     placeholder: 'e.g. Grand Ballroom, Phnom Penh', locked: true },
    ],
  },
  {
    key: 'ceremony',
    label: 'Ceremony',
    icon: 'ri-calendar-event-line',
    description: 'Ceremony phase names and descriptions',
    fields: [
      { key: 'name',        placeholder: 'e.g. Groom Preparation',              locked: true },
      { key: 'description', placeholder: 'e.g. Traditional groom preparation ceremony', locked: true },
      { key: 'location',    placeholder: 'e.g. Groom House',                    locked: true },
    ],
  },
  {
    key: 'guest',
    label: 'Guest',
    icon: 'ri-group-line',
    description: 'Guest names and notes',
    fields: [
      { key: 'name',  placeholder: 'e.g. Dara Pich', locked: true },
      { key: 'notes', placeholder: 'e.g. VIP table, front row', locked: true },
    ],
  },
  {
    key: 'invitation',
    label: 'Invitation',
    icon: 'ri-mail-line',
    description: 'Invitation letter content',
    fields: [
      { key: 'title',   placeholder: 'e.g. Wedding Invitation',      locked: true },
      { key: 'opening', placeholder: 'e.g. With great joy we invite you…', locked: true },
      { key: 'closing', placeholder: 'e.g. We look forward to celebrating with you', locked: true },
      { key: 'rsvpNote',placeholder: 'e.g. Please confirm by June 1', locked: true },
    ],
  },
  {
    key: 'task',
    label: 'Task',
    icon: 'ri-check-double-line',
    description: 'Task title and notes',
    fields: [
      { key: 'title', placeholder: 'e.g. Book flower decoration', locked: true },
      { key: 'notes', placeholder: 'e.g. Contact vendor by Friday', locked: true },
    ],
  },
  {
    key: 'budget',
    label: 'Budget',
    icon: 'ri-money-dollar-circle-line',
    description: 'Budget category and vendor name',
    fields: [
      { key: 'category',   placeholder: 'e.g. Decoration', locked: true },
      { key: 'vendorName', placeholder: 'e.g. Flower Shop Phnom Penh', locked: true },
      { key: 'notes',      placeholder: 'e.g. Includes delivery and setup', locked: true },
    ],
  },
  {
    key: 'gift',
    label: 'Gift',
    icon: 'ri-gift-line',
    description: 'Gift record description',
    fields: [
      { key: 'description', placeholder: 'e.g. Cash gift from family', locked: true },
    ],
  },
  {
    key: 'table',
    label: 'Seating',
    icon: 'ri-layout-grid-line',
    description: 'Table name and notes',
    fields: [
      { key: 'tableName', placeholder: 'e.g. VIP Table 1', locked: true },
      { key: 'notes',     placeholder: 'e.g. Near the stage, 8 seats', locked: true },
    ],
  },
  {
    key: 'wish',
    label: 'Wish',
    icon: 'ri-chat-heart-line',
    description: 'Wedding wish message',
    fields: [
      { key: 'message', placeholder: 'e.g. Wishing you a lifetime of happiness!', locked: true },
    ],
  },
  {
    key: 'notification',
    label: 'Notification',
    icon: 'ri-notification-3-line',
    description: 'Notification title and message',
    fields: [
      { key: 'title',   placeholder: 'e.g. New guest registered', locked: true },
      { key: 'message', placeholder: 'e.g. A guest has confirmed attendance', locked: true },
    ],
  },
]

const activePreset = ref(null)
const currentPreset = computed(() => PRESETS.find((p) => p.key === activePreset.value) ?? null)

const applyPreset = (preset) => {
  activePreset.value = preset.key
  result.value = null
  fields.value = preset.fields.map((f) => ({ ...f, value: '' }))
}

const setCustom = () => {
  activePreset.value = 'custom'
  result.value = null
  fields.value = [{ key: 'text', value: '', locked: false }]
}

// ── Fields ──────────────────────────────────────────────────────────────────
const fields = ref([{ key: 'text', value: '', locked: false }])
const textareaRefs = ref([])

const addField = () => fields.value.push({ key: `field${fields.value.length + 1}`, value: '', locked: false })
const removeField = (idx) => fields.value.splice(idx, 1)
const clearFields = () => {
  fields.value = fields.value.map((f) => ({ ...f, value: '' }))
  result.value = null
}
const focusText = (idx) => nextTick(() => textareaRefs.value[idx]?.focus())

// ── Languages ────────────────────────────────────────────────────────────────
const DEFAULT_LANGS = [
  { code: 'en', name: 'English' },
  { code: 'km', name: 'Khmer' },
]
const selectedLangs = ref([...DEFAULT_LANGS])
const selectedLangCodes = computed(() => selectedLangs.value.map((l) => l.code))

const availableLangs = computed(() =>
  langStore.activeItems.length ? langStore.activeItems : DEFAULT_LANGS
)

const toggleLang = (lang) => {
  const idx = selectedLangs.value.findIndex((l) => l.code === lang.code)
  if (idx !== -1) {
    if (selectedLangs.value.length === 1) return
    selectedLangs.value.splice(idx, 1)
  } else {
    selectedLangs.value.push({ code: lang.code, name: lang.name })
  }
}

// ── Translate ────────────────────────────────────────────────────────────────
const result = ref(null)

const canTranslate = computed(() =>
  fields.value.some((f) => f.value.trim()) && selectedLangs.value.length > 0
)

const translate = async () => {
  const input = Object.fromEntries(
    fields.value
      .filter((f) => f.key.trim() && f.value.trim())
      .map((f) => [f.key.trim(), f.value.trim()])
  )
  if (!Object.keys(input).length) return
  result.value = null
  const res = await aiStore.translate(input, selectedLangs.value)
  if (res) result.value = res
}

// ── Copy ─────────────────────────────────────────────────────────────────────
const copyText = async (text) => {
  await navigator.clipboard.writeText(text)
  toast.add('Copied to clipboard', 'Copied')
}

const copyAll = async () => {
  if (!result.value) return
  const lines = []
  for (const [fieldKey, translations] of Object.entries(result.value)) {
    lines.push(`[${fieldKey}]`)
    for (const [lang, text] of Object.entries(translations)) {
      lines.push(`  ${lang}: ${text}`)
    }
  }
  await navigator.clipboard.writeText(lines.join('\n'))
  toast.add('All translations copied', 'Copied')
}

// ── History ──────────────────────────────────────────────────────────────────
const history = ref([])
const hasHistory = computed(() => history.value.length > 0)

const saveToHistory = () => {
  if (!result.value) return
  const input = Object.fromEntries(fields.value.filter((f) => f.value).map((f) => [f.key, f.value]))
  history.value.unshift({
    input,
    result: result.value,
    preset: activePreset.value,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  })
  if (history.value.length > 20) history.value.pop()
  toast.add('Saved to history', 'Saved')
}

const loadHistory = (entry) => {
  activePreset.value = entry.preset ?? 'custom'
  fields.value = Object.entries(entry.input).map(([key, value]) => ({ key, value, locked: entry.preset !== 'custom' && entry.preset !== null }))
  result.value = entry.result
}

const clearHistory = () => { history.value = []; toast.add('History cleared', 'Done') }

// ── Init ─────────────────────────────────────────────────────────────────────
onMounted(() => {
  if (!langStore.items.length) langStore.fetchLanguages()
})
</script>

<style lang="scss">
.ai-translate-page {
  display: flex;
  flex-direction: column;
  gap: var(--sp-5);
}

.at-header-actions { display: flex; align-items: center; gap: var(--sp-3); }

/* Presets */
.at-presets-card {
  padding: var(--sp-4) var(--sp-5);
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

.at-presets-header {
  display: flex;
  align-items: center;
  gap: var(--sp-4);
  flex-wrap: wrap;
}

.at-presets-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
}

.at-preset-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: var(--r-full);
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--c-border);
  background: rgba(255,255,255,0.03);
  color: var(--c-muted);
  transition: all var(--t-fast);
  i { font-size: 0.9rem; }

  &:hover {
    border-color: rgba(var(--c-accent-rgb,139,92,246),0.4);
    color: var(--c-text);
    background: rgba(var(--c-accent-rgb,139,92,246),0.06);
  }

  &.active {
    border-color: var(--c-accent);
    background: rgba(var(--c-accent-rgb,139,92,246),0.14);
    color: var(--c-accent);
  }
}

/* Layout */
.at-layout {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: var(--sp-5);
  align-items: start;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
}

/* Panels */
.at-input-panel,
.at-result-panel,
.at-history-panel,
.at-empty,
.at-skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
  padding: var(--sp-5);
}

.at-result-col { display: flex; flex-direction: column; gap: var(--sp-4); }

.at-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: var(--sp-3);
  border-bottom: 1px solid var(--c-border);
}

.at-panel-title {
  font-weight: 700;
  font-size: 0.9375rem;
  display: flex;
  align-items: center;
  gap: 6px;
  i { color: var(--c-accent); }
}

.at-preset-desc {
  font-size: 0.8rem;
  color: var(--c-muted);
  display: flex;
  align-items: center;
  gap: 5px;
  padding: var(--sp-2) var(--sp-3);
  background: rgba(255,255,255,0.03);
  border-radius: var(--r-md);
  i { color: var(--c-accent); flex-shrink: 0; }
}

/* Fields */
.at-fields { display: flex; flex-direction: column; gap: var(--sp-3); }
.at-field-row { display: flex; flex-direction: column; gap: var(--sp-2); }

.at-field-key {
  display: flex;
  gap: var(--sp-2);
  align-items: center;
  input { flex: 1; font-size: 0.8rem; font-weight: 600; }
}

.at-field-label {
  flex: 1;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--c-accent);
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 10px;
  background: rgba(var(--c-accent-rgb,139,92,246),0.06);
  border: 1px solid rgba(var(--c-accent-rgb,139,92,246),0.15);
  border-radius: var(--r-sm);
  i { font-size: 0.7rem; opacity: 0.6; }
}

.at-textarea {
  font-size: 0.9rem;
  resize: vertical;
  min-height: 60px;
  line-height: 1.6;
}

.at-add-field { align-self: flex-start; font-size: 0.8125rem; }

/* Languages */
.at-lang-section { display: flex; flex-direction: column; gap: var(--sp-2); }

.at-section-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--c-muted);
}

.at-lang-chips { display: flex; flex-wrap: wrap; gap: var(--sp-2); }

.at-lang-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  border-radius: var(--r-full);
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid var(--c-border);
  background: transparent;
  color: var(--c-muted);
  transition: all var(--t-fast);
  &:hover { border-color: var(--c-accent); color: var(--c-text); }
  &.selected {
    border-color: var(--c-accent);
    background: rgba(var(--c-accent-rgb,139,92,246),0.12);
    color: var(--c-accent);
    i { font-size: 0.75rem; }
  }
}

.at-lang-code {
  font-size: 0.7rem; font-family: monospace; opacity: 0.7;
  background: rgba(255,255,255,0.06); padding: 1px 5px; border-radius: 4px;
}

.at-translate-btn {
  width: 100%; justify-content: center; gap: 8px;
  padding: 0.75rem; font-size: 1rem;
}

.at-error {
  font-size: 0.8125rem; color: var(--c-danger);
  display: flex; align-items: center; gap: 5px;
  i { flex-shrink: 0; }
}

.at-hint { font-size: 0.75rem; color: var(--c-muted); display: flex; align-items: center; gap: 5px; }

/* Result */
.at-result-actions { display: flex; gap: var(--sp-2); }
.at-result-field { display: flex; flex-direction: column; gap: var(--sp-2); }

.at-result-field-label {
  font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.05em; color: var(--c-accent);
}

.at-result-langs { display: flex; flex-direction: column; gap: 6px; }

.at-result-lang-row {
  display: flex; align-items: flex-start; gap: var(--sp-3);
  padding: var(--sp-2) var(--sp-3);
  background: rgba(255,255,255,0.03);
  border-radius: var(--r-md);
  border: 1px solid var(--c-border);
  &:hover .at-copy-btn { opacity: 1; }
}

.at-result-lang-badge {
  font-size: 0.7rem; font-family: monospace; font-weight: 700; color: var(--c-accent);
  background: rgba(var(--c-accent-rgb,139,92,246),0.1);
  border: 1px solid rgba(var(--c-accent-rgb,139,92,246),0.2);
  padding: 2px 8px; border-radius: var(--r-sm);
  flex-shrink: 0; min-width: 32px; text-align: center; margin-top: 2px;
}

.at-result-text {
  flex: 1; font-size: 0.9rem; line-height: 1.6; color: var(--c-text); word-break: break-word;
}

.at-copy-btn { opacity: 0; transition: opacity var(--t-fast); margin-left: auto; }

/* Empty */
.at-empty {
  align-items: center; justify-content: center; text-align: center;
  padding: var(--sp-12); color: var(--c-muted);
  i { font-size: 2.5rem; opacity: 0.3; color: var(--c-accent); }
  p { font-size: 0.9rem; max-width: 280px; line-height: 1.6; }
}

/* Skeleton */
.at-skeleton { gap: var(--sp-4); }
.at-skel-block { display: flex; flex-direction: column; gap: 6px; }
.skel {
  border-radius: var(--r-sm);
  background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
.skel-label { height: 12px; width: 80px; }
.skel-row { height: 36px; }

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* History */
.at-history-list { display: flex; flex-direction: column; gap: var(--sp-2); }

.at-history-item {
  padding: var(--sp-3); border-radius: var(--r-md);
  border: 1px solid var(--c-border); cursor: pointer;
  transition: all var(--t-fast);
  &:hover {
    border-color: rgba(var(--c-accent-rgb,139,92,246),0.3);
    background: rgba(var(--c-accent-rgb,139,92,246),0.04);
  }
}

.at-history-preview {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;
}

.at-history-keys {
  font-size: 0.75rem; font-weight: 700; color: var(--c-accent);
  display: flex; align-items: center; gap: 4px; font-family: monospace;
}

.at-history-time { font-size: 0.7rem; color: var(--c-muted); }

.at-history-snippet {
  font-size: 0.8rem; color: var(--c-muted); line-height: 1.4;
  overflow: hidden; display: -webkit-box;
  -webkit-line-clamp: 2; -webkit-box-orient: vertical;
}
</style>
