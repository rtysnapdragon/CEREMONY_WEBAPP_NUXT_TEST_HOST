<template>
  <RDrawer
    v-model:open="props.open"
    :title="tBy({ en: 'Review Translations', km: 'ពិនិត្យការបកប្រែ' })"
    icon="ri-translate-2"
    width-desktop="720px"
    width-tablet="95vw"
    @close="$emit('update:open', false)"
  >
    <template #body>
      <!-- Header info -->
      <div class="tr-info">
        <i class="ri-information-line" />
        <span>
          {{ tBy({ en: 'Review and edit the AI-translated values before saving. All changes are saved only when you click "Save All".', km: 'ពិនិត្យ និងកែប្រែតម្លៃដែលបកប្រែដោយ AI មុននឹងរក្សាទុក។ ការផ្លាស់ប្ដូរទាំងអស់ត្រូវបានរក្សាទុកតែពេលអ្នកចុច "Save All" ប៉ុណ្ណោះ។' }) }}
        </span>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="tr-loading">
        <div class="tr-loading-row" v-for="i in 3" :key="i">
          <div class="tr-skel tr-skel-label" />
          <div class="tr-skel tr-skel-input" v-for="j in languages.length || 2" :key="j" />
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="tr-error">
        <i class="ri-error-warning-line" />
        {{ error }}
        <button class="btn-ghost btn-xs ml-2" @click="load">
          <i class="ri-refresh-line" /> Retry
        </button>
      </div>

      <!-- Translation grid -->
      <div v-else-if="rows.length" class="tr-grid">
        <!-- Language column headers -->
        <div class="tr-thead">
          <div class="tr-th tr-th--field">
            {{ tBy({ en: 'Field', km: 'វាល' }) }}
          </div>
          <div v-for="lang in languages" :key="lang.code" class="tr-th">
            <span v-if="lang.flag" class="tr-flag">{{ flagEmoji(lang.flag) }}</span>
            {{ lang.name }}
            <span class="tr-lang-code">({{ lang.code }})</span>
          </div>
        </div>

        <!-- Rows: one per field -->
        <div v-for="row in rows" :key="row.fieldName" class="tr-row">
          <div class="tr-cell tr-cell--label">
            <span class="tr-field-label">{{ row.label }}</span>
            <span class="tr-field-name">{{ row.fieldName }}</span>
          </div>
          <div v-for="lang in languages" :key="lang.code" class="tr-cell">
            <textarea
              v-model="edits[row.fieldName][lang.code]"
              class="tr-input"
              :dir="lang.direction === 'RTL' ? 'rtl' : 'ltr'"
              rows="2"
              :placeholder="`${row.label} in ${lang.name}`"
            />
          </div>
        </div>
      </div>

      <!-- Empty (no fields configured) -->
      <div v-else-if="!loading" class="tr-empty">
        {{ tBy({ en: 'No translatable fields configured for this feature.', km: 'មិនមានវាលដែលអាចបកប្រែបានសម្រាប់មុខងារនេះ។' }) }}
      </div>
    </template>

    <template #footer>
      <div class="tr-footer">
        <div class="tr-footer-left">
          <!-- Auto-save toggle -->
          <label class="tr-toggle-label">
            <RSwitch v-model="localAutoSave" size="sm" />
            <span>{{ tBy({ en: 'Auto-save in future', km: 'រក្សាទុកដោយស្វ័យប្រវត្តិ' }) }}</span>
          </label>
          <span class="tr-toggle-hint">
            {{ localAutoSave
              ? tBy({ en: 'AI will save translations automatically after each save.', km: 'AI នឹងរក្សាទុកការបកប្រែដោយស្វ័យប្រវត្តិ។' })
              : tBy({ en: 'You will always be asked to review before saving.', km: 'អ្នកនឹងត្រូវបានស្នើសុំពិនិត្យជានិច្ច។' })
            }}
          </span>
        </div>
        <div class="tr-footer-right">
          <button class="btn-ghost" @click="$emit('update:open', false)">
            {{ tBy({ en: 'Skip', km: 'រំលង' }) }}
          </button>
          <button class="btn-primary" :disabled="saving || !rows.length" @click="saveAll">
            <i v-if="saving" class="ri-loader-4-line animate-spin" />
            <i v-else class="ri-save-line" />
            {{ tBy({ en: 'Save All', km: 'រក្សាទុកទាំងអស់' }) }}
          </button>
        </div>
      </div>
    </template>
  </RDrawer>
</template>

<script setup>
const props = defineProps({
  open:        { type: Boolean, default: false },
  feature:     { type: String,  required: true },
  entityId:    { type: String,  required: true },
  /** { fieldName: "source text" } — the fields to translate */
  fields:      { type: Object,  default: () => ({}) },
  /** Optional field metadata: [{ name, label }] from promptTemplate.translatableFields */
  fieldsMeta:  { type: Array,   default: () => [] },
  /** Current autoSave setting from the prompt template */
  autoSave:    { type: Boolean, default: true },
})

const emit = defineEmits(['update:open', 'saved', 'update:autoSave'])

const langStore = useLanguageStore()
const toast = useToastStore()

const loading  = ref(false)
const saving   = ref(false)
const error    = ref(null)
/** { fieldName: { langCode: value } } — editable results */
const edits    = reactive({})
const localAutoSave = ref(props.autoSave)

const drawerOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
})

watch(() => props.autoSave, (v) => { localAutoSave.value = v })
watch(localAutoSave, (v) => emit('update:autoSave', v))

// Open → load
watch(() => props.open, async (v) => {
  if (v) await load()
})

const languages = computed(() =>
  langStore.activeItems.length ? langStore.activeItems : []
)

const rows = computed(() => {
  const meta = props.fieldsMeta ?? []
  return Object.keys(edits).map((fieldName) => {
    const m = meta.find((f) => f.name === fieldName)
    return { fieldName, label: m?.label || fieldName }
  })
})

const flagEmoji = (code) =>
  code ? [...code.toUpperCase()].map((c) => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0))).join('') : ''

async function load() {
  if (!props.feature || !props.fields || !Object.keys(props.fields).length) return
  loading.value = true
  error.value   = null

  if (!langStore.items.length) await langStore.fetchLanguages()

  try {
    const { data, error: err } = await useHttp('/api/v1/translations/ai-preview', {
      method: 'POST',
      body: { feature: props.feature, fields: props.fields },
      isGlobal: true,
    })

    if (err?.value) {
      error.value = err.value?.data?.message || 'AI translation failed'
      return
    }

    const result = data.value?.data ?? data.value ?? {}
    // Populate edits reactive with all fields × languages
    Object.keys(props.fields).forEach((fieldName) => {
      if (!edits[fieldName]) edits[fieldName] = {}
      langStore.activeItems.forEach((lang) => {
        edits[fieldName][lang.code] = result[fieldName]?.[lang.code] ?? ''
      })
    })
  } catch (e) {
    error.value = e?.message || 'Unexpected error'
  } finally {
    loading.value = false
  }
}

async function saveAll() {
  saving.value = true
  try {
    const { error: err } = await useHttp('/api/v1/translations/save-reviewed', {
      method: 'POST',
      body: {
        feature: props.feature,
        entityId: props.entityId,
        translations: edits,
      },
      isGlobal: true,
    })

    if (err?.value) {
      toast.add(err.value?.data?.message || 'Failed to save translations', 'Error')
      return
    }

    toast.add(tBy({ en: 'Translations saved', km: 'ការបកប្រែត្រូវបានរក្សាទុក' }), 'Success')
    emit('saved', { feature: props.feature, entityId: props.entityId, translations: edits })
    emit('update:open', false)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped lang="scss">
.tr-info {
  display: flex; align-items: flex-start; gap: 8px;
  background: rgba(var(--c-accent-rgb,99,102,241),.08);
  border: 1px solid rgba(var(--c-accent-rgb,99,102,241),.2);
  border-radius: var(--r-md); padding: var(--sp-3) var(--sp-4);
  font-size: .82rem; color: var(--c-muted); margin-bottom: var(--sp-4);
  i { color: var(--c-accent); flex-shrink: 0; margin-top: 2px; }
}

.tr-loading { display: flex; flex-direction: column; gap: var(--sp-3); }
.tr-loading-row { display: flex; gap: var(--sp-3); align-items: flex-start; }
.tr-skel { border-radius: var(--r-sm); background: var(--c-surface); animation: pulse 1.5s infinite; }
.tr-skel-label { width: 120px; height: 52px; flex-shrink: 0; }
.tr-skel-input { flex: 1; height: 52px; }
@keyframes pulse { 0%,100%{opacity:.6} 50%{opacity:.3} }

.tr-error {
  display: flex; align-items: center; gap: 8px;
  padding: var(--sp-4); color: var(--c-danger); font-size: .85rem;
  background: rgba(248,113,113,.08); border: 1px solid rgba(248,113,113,.2);
  border-radius: var(--r-md);
}

.tr-grid { display: flex; flex-direction: column; gap: 0; }

.tr-thead {
  display: flex; gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-3);
  background: var(--c-surface); border-radius: var(--r-md) var(--r-md) 0 0;
  border: 1px solid var(--c-border); border-bottom: none;
}
.tr-th {
  flex: 1; font-size: .73rem; font-weight: 600; color: var(--c-muted);
  display: flex; align-items: center; gap: 4px;
  &.tr-th--field { flex: 0 0 140px; }
}
.tr-lang-code { opacity: .6; font-size: .68rem; }
.tr-flag { font-size: .9rem; }

.tr-row {
  display: flex; gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-3);
  border: 1px solid var(--c-border); border-top: none;
  &:last-child { border-radius: 0 0 var(--r-md) var(--r-md); }
  &:hover { background: rgba(255,255,255,.02); }
}

.tr-cell {
  flex: 1;
  &.tr-cell--label { flex: 0 0 140px; display: flex; flex-direction: column; justify-content: center; gap: 2px; }
}

.tr-field-label { font-size: .82rem; font-weight: 600; color: var(--c-text); }
.tr-field-name  { font-size: .7rem; color: var(--c-muted); font-family: monospace; }

.tr-input {
  width: 100%; resize: vertical; min-height: 52px;
  padding: var(--sp-2) var(--sp-3);
  background: var(--c-bg); border: 1px solid var(--c-border); border-radius: var(--r-sm);
  font-size: .82rem; color: var(--c-text); font-family: inherit;
  transition: border-color .15s;
  &:focus { outline: none; border-color: var(--c-accent); }
}

.tr-empty {
  text-align: center; padding: var(--sp-8);
  color: var(--c-muted); font-size: .85rem;
}

.tr-footer {
  display: flex; align-items: center; justify-content: space-between;
  gap: var(--sp-4); flex-wrap: wrap;
}
.tr-footer-left { display: flex; flex-direction: column; gap: 4px; }
.tr-footer-right { display: flex; gap: var(--sp-3); align-items: center; }
.tr-toggle-label { display: flex; align-items: center; gap: 8px; font-size: .83rem; font-weight: 500; cursor: pointer; }
.tr-toggle-hint { font-size: .73rem; color: var(--c-muted); }
</style>
