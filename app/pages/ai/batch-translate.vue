<template>
  <RWrapperPage class="batch-page">

    <RPageHeader title="Batch AI Translate" subtitle="Load real records from the database and translate them all at once">
      <template #actions>
        <NuxtLink :to="localePath('/ai/translate')" class="btn-ghost btn-sm">
          <i class="ri-edit-line" /> Manual Translate
        </NuxtLink>
      </template>
    </RPageHeader>

    <!-- Feature selector -->
    <div class="glass-card batch-feature-card animate-fade-up">
      <div class="batch-feature-grid">
        <button
          v-for="f in FEATURES"
          :key="f.key"
          class="batch-feature-btn"
          :class="{ active: selectedFeature?.key === f.key }"
          @click="selectFeature(f)"
        >
          <i :class="f.icon" />
          <span>{{ f.label }}</span>
          <span v-if="f.count() > 0" class="batch-count">{{ f.count() }}</span>
        </button>
      </div>
    </div>

    <div v-if="selectedFeature" class="batch-layout animate-fade-up delay-1">

      <!-- Left: Record list -->
      <div class="glass-card batch-list-panel">
        <div class="batch-panel-header">
          <div class="batch-panel-title">
            <i :class="selectedFeature.icon" />
            {{ selectedFeature.label }} Records
            <span class="batch-count-badge">{{ records.length }}</span>
          </div>
          <div class="batch-panel-actions">
            <button class="btn-ghost btn-xs" @click="selectAll">
              {{ allSelected ? 'Deselect All' : 'Select All' }}
            </button>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loadingRecords" class="batch-loading">
          <i class="ri-loader-4-line animate-spin" /> Loading records...
        </div>

        <!-- Empty -->
        <div v-else-if="records.length === 0" class="batch-empty">
          <i :class="selectedFeature.icon" />
          <p>No {{ selectedFeature.label.toLowerCase() }} records found for this wedding.</p>
        </div>

        <!-- Record list -->
        <div v-else class="batch-records">
          <label
            v-for="rec in records"
            :key="rec.id"
            class="batch-record-row"
            :class="{ selected: selectedIds.includes(rec.id), translated: translatedIds.includes(rec.id) }"
          >
            <input type="checkbox" :value="rec.id" v-model="selectedIds" class="batch-checkbox" />
            <div class="batch-record-info">
              <span class="batch-record-name">{{ selectedFeature.displayName(rec) }}</span>
              <span class="batch-record-sub">{{ selectedFeature.displaySub(rec) }}</span>
            </div>
            <i v-if="translatedIds.includes(rec.id)" class="ri-check-circle-fill batch-done-icon" />
            <i v-else-if="failedIds.includes(rec.id)" class="ri-error-warning-line batch-fail-icon" />
          </label>
        </div>

        <!-- Translate btn -->
        <div class="batch-list-footer">
          <span class="batch-hint">{{ selectedIds.length }} selected</span>
          <button
            class="btn-primary"
            :disabled="!selectedIds.length || running"
            @click="runBatch"
          >
            <i :class="running ? 'ri-loader-4-line animate-spin' : 'ri-sparkling-line'" />
            {{ running ? `Translating ${doneCount}/${selectedIds.length}…` : 'Translate Selected' }}
          </button>
        </div>
      </div>

      <!-- Right: Config + Progress -->
      <div class="batch-right-col">

        <!-- Language selector -->
        <div class="glass-card batch-config-card">
          <div class="batch-panel-title" style="margin-bottom:var(--sp-3)">
            <i class="ri-translate-2" /> Target Languages
          </div>
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
        </div>

        <!-- Field mapping -->
        <div class="glass-card batch-config-card">
          <div class="batch-panel-title" style="margin-bottom:var(--sp-3)">
            <i class="ri-list-check-3" /> Fields to Translate
          </div>
          <div class="batch-field-list">
            <label
              v-for="field in selectedFeature.fields"
              :key="field.key"
              class="batch-field-row"
            >
              <input type="checkbox" v-model="field.enabled" class="batch-checkbox" />
              <span class="batch-field-key">{{ field.key }}</span>
              <span class="batch-field-desc">{{ field.label }}</span>
            </label>
          </div>
        </div>

        <!-- Progress log -->
        <div v-if="log.length" class="glass-card batch-log-card">
          <div class="batch-panel-title" style="margin-bottom:var(--sp-3)">
            <i class="ri-terminal-line" /> Progress
            <span class="batch-count-badge">{{ doneCount }}/{{ selectedIds.length }}</span>
          </div>
          <div class="batch-progress-bar">
            <div class="batch-progress-fill" :style="{ width: progressPct + '%' }" />
          </div>
          <div class="batch-log">
            <div
              v-for="(entry, i) in log"
              :key="i"
              class="batch-log-row"
              :class="entry.type"
            >
              <i :class="entry.type === 'ok' ? 'ri-check-line' : entry.type === 'err' ? 'ri-close-line' : 'ri-loader-4-line animate-spin'" />
              <span>{{ entry.msg }}</span>
            </div>
          </div>
          <div v-if="!running && doneCount > 0" class="batch-log-summary">
            <i class="ri-check-double-line" />
            Done — {{ translatedIds.length }} translated, {{ failedIds.length }} failed
          </div>
        </div>

      </div>
    </div>

    <!-- No feature selected -->
    <div v-else class="glass-card batch-empty-state animate-fade-up">
      <i class="ri-sparkling-2-line" />
      <h3>Select a feature above</h3>
      <p>Choose which type of records you want to batch translate.</p>
    </div>

  </RWrapperPage>
</template>

<script setup>
definePageMeta({ layout: 'navbar', middleware: ['auth'] })

const localePath = (p) => p
const aiStore = useAIStore()
const langStore = useLanguageStore()
const eventStore = useEventStore()
const ceremonyStore = useCeremonyStore()
const taskStore = useTaskStore()
const budgetStore = useBudgetStore()
const guestStore = useGuestStore()
const toast = useToastStore()

// ── Feature definitions ──────────────────────────────────────────────────────
const FEATURES = [
  {
    key: 'ceremony',
    label: 'Ceremonies',
    icon: 'ri-calendar-event-line',
    count: () => ceremonyStore.items.length,
    load: async () => { await ceremonyStore.fetchCeremonies(); return ceremonyStore.items },
    fields: reactive([
      { key: 'name',        label: 'Ceremony Name', enabled: true },
      { key: 'description', label: 'Description',   enabled: true },
    ]),
    displayName: (r) => r.name,
    displaySub:  (r) => r.description || '—',
    getInput: (rec, fields) => Object.fromEntries(
      fields.filter(f => f.enabled && rec[f.key]).map(f => [f.key, rec[f.key]])
    ),
    save: async (rec, result, langs) => {
      const patch = {}
      langs.forEach(l => {
        if (result.name?.[l.code])        patch[`name${cap(l.code)}`]        = result.name[l.code]
        if (result.description?.[l.code]) patch[`description${cap(l.code)}`] = result.description[l.code]
      })
      await ceremonyStore.updateCeremony(rec.id, { ...rec, ...patch })
    },
  },
  {
    key: 'task',
    label: 'Tasks',
    icon: 'ri-check-double-line',
    count: () => taskStore.tasks.length,
    load: async () => { await taskStore.fetchTasks(0); return taskStore.tasks },
    fields: reactive([
      { key: 'title', label: 'Task Title', enabled: true },
      { key: 'notes', label: 'Notes',      enabled: true },
    ]),
    displayName: (r) => r.title,
    displaySub:  (r) => r.notes || '—',
    getInput: (rec, fields) => Object.fromEntries(
      fields.filter(f => f.enabled && rec[f.key]).map(f => [f.key, rec[f.key]])
    ),
    save: async (rec, result, langs) => {
      const patch = {}
      langs.forEach(l => {
        if (result.title?.[l.code]) patch[`title${cap(l.code)}`] = result.title[l.code]
        if (result.notes?.[l.code]) patch[`notes${cap(l.code)}`] = result.notes[l.code]
      })
      await taskStore.updateTask(rec.id, { ...rec, ...patch })
    },
  },
  {
    key: 'budget',
    label: 'Budget',
    icon: 'ri-money-dollar-circle-line',
    count: () => budgetStore.items.length,
    load: async () => { await budgetStore.fetchBudgets(0); return budgetStore.items },
    fields: reactive([
      { key: 'category',   label: 'Category',    enabled: true },
      { key: 'vendorName', label: 'Vendor Name', enabled: true },
      { key: 'notes',      label: 'Notes',       enabled: false },
    ]),
    displayName: (r) => r.vendorName || r.category,
    displaySub:  (r) => r.category,
    getInput: (rec, fields) => Object.fromEntries(
      fields.filter(f => f.enabled && rec[f.key]).map(f => [f.key, rec[f.key]])
    ),
    save: async (rec, result, langs) => {
      const patch = {}
      langs.forEach(l => {
        if (result.category?.[l.code])   patch[`category${cap(l.code)}`]   = result.category[l.code]
        if (result.vendorName?.[l.code]) patch[`vendorName${cap(l.code)}`] = result.vendorName[l.code]
        if (result.notes?.[l.code])      patch[`notes${cap(l.code)}`]      = result.notes[l.code]
      })
      await budgetStore.updateBudget(rec.id, { ...rec, ...patch })
    },
  },
  {
    key: 'guest',
    label: 'Guests',
    icon: 'ri-group-line',
    count: () => guestStore.guests.length,
    load: async () => { await guestStore.fetchGuests(0); return guestStore.guests },
    fields: reactive([
      { key: 'name',  label: 'Guest Name', enabled: true },
      { key: 'notes', label: 'Notes',      enabled: false },
    ]),
    displayName: (r) => r.name,
    displaySub:  (r) => r.notes || r.status || '—',
    getInput: (rec, fields) => Object.fromEntries(
      fields.filter(f => f.enabled && rec[f.key]).map(f => [f.key, rec[f.key]])
    ),
    save: async (rec, result, langs) => {
      const patch = {}
      langs.forEach(l => {
        if (result.name?.[l.code])  patch[`name${cap(l.code)}`]  = result.name[l.code]
        if (result.notes?.[l.code]) patch[`notes${cap(l.code)}`] = result.notes[l.code]
      })
      await guestStore.updateGuest(rec.id, { ...rec, ...patch })
    },
  },
  {
    key: 'wedding',
    label: 'Wedding',
    icon: 'ri-heart-line',
    count: () => eventStore.events.length,
    load: async () => { if (!eventStore.initialized) await eventStore.fetchEvents(); return eventStore.events },
    fields: reactive([
      { key: 'title',     label: 'Wedding Title', enabled: true },
      { key: 'venue',     label: 'Venue',         enabled: true },
      { key: 'brideName', label: 'Bride Name',    enabled: false },
      { key: 'groomName', label: 'Groom Name',    enabled: false },
    ]),
    displayName: (r) => r.title,
    displaySub:  (r) => r.venue || '—',
    getInput: (rec, fields) => Object.fromEntries(
      fields.filter(f => f.enabled && rec[f.key]).map(f => [f.key, rec[f.key]])
    ),
    save: async (rec, result, langs) => {
      const patch = {}
      langs.forEach(l => {
        if (result.title?.[l.code])     patch[`title${cap(l.code)}`]     = result.title[l.code]
        if (result.venue?.[l.code])     patch[`venue${cap(l.code)}`]     = result.venue[l.code]
        if (result.brideName?.[l.code]) patch[`brideName${cap(l.code)}`] = result.brideName[l.code]
        if (result.groomName?.[l.code]) patch[`groomName${cap(l.code)}`] = result.groomName[l.code]
      })
      await eventStore.updateEvent(rec.id, patch)
    },
  },
]

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)

// ── State ────────────────────────────────────────────────────────────────────
const selectedFeature = ref(null)
const records = ref([])
const loadingRecords = ref(false)
const selectedIds = ref([])
const translatedIds = ref([])
const failedIds = ref([])
const running = ref(false)
const doneCount = ref(0)
const log = ref([])

const allSelected = computed(() => records.value.length > 0 && selectedIds.value.length === records.value.length)
const progressPct = computed(() => selectedIds.value.length ? Math.round((doneCount.value / selectedIds.value.length) * 100) : 0)

const selectAll = () => {
  selectedIds.value = allSelected.value ? [] : records.value.map((r) => r.id)
}

const selectFeature = async (f) => {
  selectedFeature.value = f
  selectedIds.value = []
  translatedIds.value = []
  failedIds.value = []
  log.value = []
  doneCount.value = 0
  loadingRecords.value = true
  try {
    records.value = await f.load()
  } finally {
    loadingRecords.value = false
  }
}

// ── Languages ────────────────────────────────────────────────────────────────
const DEFAULT_LANGS = [{ code: 'en', name: 'English' }, { code: 'km', name: 'Khmer' }]
const selectedLangs = ref([...DEFAULT_LANGS])
const selectedLangCodes = computed(() => selectedLangs.value.map((l) => l.code))
const availableLangs = computed(() => langStore.activeItems.length ? langStore.activeItems : DEFAULT_LANGS)

const toggleLang = (lang) => {
  const idx = selectedLangs.value.findIndex((l) => l.code === lang.code)
  if (idx !== -1) { if (selectedLangs.value.length > 1) selectedLangs.value.splice(idx, 1) }
  else selectedLangs.value.push({ code: lang.code, name: lang.name })
}

// ── Batch run ────────────────────────────────────────────────────────────────
const runBatch = async () => {
  if (!selectedIds.value.length || !selectedFeature.value) return
  running.value = true
  doneCount.value = 0
  translatedIds.value = []
  failedIds.value = []
  log.value = []

  const toProcess = records.value.filter((r) => selectedIds.value.includes(r.id))
  const f = selectedFeature.value

  for (const rec of toProcess) {
    const name = f.displayName(rec)
    log.value.push({ type: 'loading', msg: `Translating "${name}"…` })

    try {
      const input = f.getInput(rec, f.fields)
      if (!Object.keys(input).length) {
        log.value[log.value.length - 1] = { type: 'err', msg: `"${name}" — no enabled fields with content, skipped` }
        failedIds.value.push(rec.id)
        doneCount.value++
        continue
      }

      const result = await aiStore.translate(input, selectedLangs.value)
      if (!result) throw new Error(aiStore.error ?? 'Translation failed')

      await f.save(rec, result, selectedLangs.value)

      translatedIds.value.push(rec.id)
      log.value[log.value.length - 1] = { type: 'ok', msg: `"${name}" — translated and saved` }
    } catch (e) {
      failedIds.value.push(rec.id)
      log.value[log.value.length - 1] = { type: 'err', msg: `"${name}" — ${e.message ?? 'failed'}` }
    }

    doneCount.value++
    // small delay to avoid hammering the AI rate limit
    if (doneCount.value < toProcess.length) await new Promise((r) => setTimeout(r, 400))
  }

  running.value = false
  const ok = translatedIds.value.length
  const fail = failedIds.value.length
  if (ok > 0) toast.add(`${ok} record${ok > 1 ? 's' : ''} translated${fail ? `, ${fail} failed` : ''}`, 'Done')
  else toast.add('All translations failed', 'Error')
}

// ── Init ─────────────────────────────────────────────────────────────────────
const { init: eventInit } = useEventPage(() => {})
onMounted(async () => {
  if (!langStore.items.length) langStore.fetchLanguages()
  await eventInit()
})
</script>

<style lang="scss">
.batch-page { display: flex; flex-direction: column; gap: var(--sp-5); }

/* Feature selector */
.batch-feature-card { padding: var(--sp-4) var(--sp-5); }

.batch-feature-grid {
  display: flex; flex-wrap: wrap; gap: var(--sp-2);
}

.batch-feature-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 16px; border-radius: var(--r-full);
  font-size: 0.8125rem; font-weight: 600; cursor: pointer;
  border: 1px solid var(--c-border); background: rgba(255,255,255,0.03);
  color: var(--c-muted); transition: all var(--t-fast);
  i { font-size: 0.9rem; }
  &:hover { border-color: rgba(var(--c-accent-rgb,139,92,246),0.4); color: var(--c-text); }
  &.active {
    border-color: var(--c-accent);
    background: rgba(var(--c-accent-rgb,139,92,246),0.14);
    color: var(--c-accent);
  }
}

.batch-count {
  font-size: 0.7rem; background: rgba(255,255,255,0.1);
  padding: 1px 6px; border-radius: var(--r-full); min-width: 20px; text-align: center;
}

/* Layout */
.batch-layout {
  display: grid; grid-template-columns: 1fr 320px; gap: var(--sp-5); align-items: start;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
}

.batch-right-col { display: flex; flex-direction: column; gap: var(--sp-4); }

/* Panels */
.batch-list-panel, .batch-config-card, .batch-log-card {
  padding: var(--sp-5); display: flex; flex-direction: column; gap: var(--sp-4);
}

.batch-panel-header {
  display: flex; align-items: center; justify-content: space-between;
  padding-bottom: var(--sp-3); border-bottom: 1px solid var(--c-border);
}

.batch-panel-title {
  font-weight: 700; font-size: 0.9375rem;
  display: flex; align-items: center; gap: 6px;
  i { color: var(--c-accent); }
}

.batch-panel-actions { display: flex; gap: var(--sp-2); }

.batch-count-badge {
  font-size: 0.7rem; font-weight: 700;
  background: rgba(var(--c-accent-rgb,139,92,246),0.12);
  color: var(--c-accent); border: 1px solid rgba(var(--c-accent-rgb,139,92,246),0.2);
  padding: 1px 7px; border-radius: var(--r-full);
}

/* Records */
.batch-loading, .batch-empty {
  display: flex; align-items: center; gap: var(--sp-3);
  color: var(--c-muted); padding: var(--sp-6) 0; font-size: 0.875rem;
  flex-direction: column;
  i { font-size: 1.5rem; opacity: 0.4; }
}

.batch-records {
  display: flex; flex-direction: column; gap: 4px;
  max-height: 420px; overflow-y: auto;
}

.batch-record-row {
  display: flex; align-items: center; gap: var(--sp-3);
  padding: var(--sp-2) var(--sp-3); border-radius: var(--r-md);
  border: 1px solid transparent; cursor: pointer;
  transition: all var(--t-fast);
  &:hover { background: rgba(255,255,255,0.03); border-color: var(--c-border); }
  &.selected { background: rgba(var(--c-accent-rgb,139,92,246),0.06); border-color: rgba(var(--c-accent-rgb,139,92,246),0.2); }
  &.translated { border-color: rgba(var(--c-success-rgb,34,197,94),0.25); background: rgba(var(--c-success-rgb,34,197,94),0.05); }
}

.batch-checkbox { width: 16px; height: 16px; cursor: pointer; flex-shrink: 0; accent-color: var(--c-accent); }

.batch-record-info { flex: 1; min-width: 0; }
.batch-record-name { display: block; font-size: 0.875rem; font-weight: 600; color: var(--c-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.batch-record-sub  { display: block; font-size: 0.75rem; color: var(--c-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.batch-done-icon { color: var(--c-success); font-size: 1rem; flex-shrink: 0; }
.batch-fail-icon { color: var(--c-danger);  font-size: 1rem; flex-shrink: 0; }

.batch-list-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding-top: var(--sp-3); border-top: 1px solid var(--c-border);
}

.batch-hint { font-size: 0.8rem; color: var(--c-muted); }

/* Fields */
.batch-field-list { display: flex; flex-direction: column; gap: var(--sp-2); }
.batch-field-row {
  display: flex; align-items: center; gap: var(--sp-3);
  font-size: 0.875rem; cursor: pointer;
}
.batch-field-key { font-family: monospace; font-size: 0.8rem; color: var(--c-accent); min-width: 90px; font-weight: 700; }
.batch-field-desc { color: var(--c-muted); font-size: 0.8rem; }

/* Progress */
.batch-progress-bar {
  height: 4px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden;
}
.batch-progress-fill {
  height: 100%; background: var(--c-accent);
  border-radius: 2px; transition: width 0.3s ease;
}

/* Log */
.batch-log {
  display: flex; flex-direction: column; gap: 4px;
  max-height: 280px; overflow-y: auto;
}
.batch-log-row {
  display: flex; align-items: flex-start; gap: var(--sp-2); font-size: 0.8rem;
  padding: 3px 0;
  i { flex-shrink: 0; margin-top: 1px; font-size: 0.85rem; }
  &.ok      { color: var(--c-success); }
  &.err     { color: var(--c-danger); }
  &.loading { color: var(--c-muted); }
}

.batch-log-summary {
  display: flex; align-items: center; gap: var(--sp-2);
  font-size: 0.8rem; font-weight: 600; color: var(--c-accent);
  padding-top: var(--sp-2); border-top: 1px solid var(--c-border);
}

/* Empty state */
.batch-empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: var(--sp-3); padding: var(--sp-12); text-align: center;
  i { font-size: 3rem; color: var(--c-accent); opacity: 0.25; }
  h3 { font-weight: 700; font-size: 1.125rem; }
  p { font-size: 0.875rem; color: var(--c-muted); }
}

/* Reuse from translate page */
.at-lang-chips { display: flex; flex-wrap: wrap; gap: var(--sp-2); }
.at-lang-chip {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 12px; border-radius: var(--r-full); font-size: 0.8125rem;
  font-weight: 500; cursor: pointer; border: 1px solid var(--c-border);
  background: transparent; color: var(--c-muted); transition: all var(--t-fast);
  &:hover { border-color: var(--c-accent); color: var(--c-text); }
  &.selected { border-color: var(--c-accent); background: rgba(var(--c-accent-rgb,139,92,246),0.12); color: var(--c-accent); i { font-size: 0.75rem; } }
}
.at-lang-code { font-size: 0.7rem; font-family: monospace; opacity: 0.7; background: rgba(255,255,255,0.06); padding: 1px 5px; border-radius: 4px; }
</style>
