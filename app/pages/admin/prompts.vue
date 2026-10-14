<template>
  <RWrapperPage class="pm-page">
    <RPageHeader title="AI Prompt Manager" subtitle="Customize prompts used by each AI feature">
      <template #actions>
        <button class="btn-primary btn-sm" @click="openAdd">
          <i class="ri-add-line" /> Add Prompt
        </button>
      </template>
    </RPageHeader>

    <!-- Cards grid -->
    <div v-if="store.loading" class="pm-grid">
      <div v-for="i in 2" :key="i" class="pm-card glass-card animate-pulse">
        <div class="pm-card-skel" />
      </div>
    </div>

    <div v-else-if="!store.items.length" class="pm-empty glass-card">
      <i class="ri-robot-2-line pm-empty-icon" />
      <p>No prompt templates yet.</p>
      <button class="btn-primary btn-sm mt-3" @click="openAdd">Add your first prompt</button>
    </div>

    <div v-else class="pm-grid">
      <div
        v-for="item in store.items"
        :key="item.id"
        class="pm-card glass-card"
        :class="{ 'pm-card--inactive': !item.active }"
      >
        <!-- Header -->
        <div class="pm-card-head">
          <div class="pm-card-meta">
            <span class="pm-feature-badge">{{ item.feature }}</span>
            <span v-if="!item.active" class="pm-inactive-badge">Inactive</span>
            <template v-if="item.entityName">
              <span v-if="!item.autoSave" class="pm-review-badge" title="Manual review — users inspect translations before saving">
                <i class="ri-eye-line" /> Review
              </span>
              <span v-else class="pm-autosave-badge" title="Auto-save — translations saved immediately in background">
                <i class="ri-flashlight-line" /> Auto
              </span>
            </template>
          </div>
          <div class="pm-card-actions">
            <button class="btn-icon btn-xs-icon" title="Test prompt" @click="openTest(item)">
              <i class="ri-test-tube-line" />
            </button>
            <button class="btn-icon btn-xs-icon" title="Edit" @click="openEdit(item)">
              <i class="ri-edit-line" />
            </button>
            <button class="btn-icon btn-xs-icon" title="Reset to default" @click="confirmReset(item)">
              <i class="ri-refresh-line" />
            </button>
            <button class="btn-icon btn-xs-icon text-danger" title="Delete" @click="confirmDelete(item)">
              <i class="ri-delete-bin-line" />
            </button>
          </div>
        </div>

        <h3 class="pm-card-name">{{ item.name }}</h3>
        <p v-if="item.description" class="pm-card-desc">{{ item.description }}</p>

        <!-- Entity + translatable fields -->
        <div v-if="item.entityName || item.translatableFields?.length" class="pm-entity-row">
          <span v-if="item.entityName" class="pm-entity-badge">
            <i class="ri-database-2-line" /> {{ item.entityName }}
          </span>
          <span v-for="f in (item.translatableFields ?? [])" :key="f.name" class="pm-field-chip">
            {{ f.label || f.name }}
          </span>
        </div>

        <!-- Variables chip list -->
        <div v-if="item.variables?.length" class="pm-vars">
          <span class="pm-vars-label">Variables:</span>
          <span v-for="v in item.variables" :key="v.name" class="pm-var-chip" :title="v.description">
            {<!-- -->{ v.name }}
          </span>
        </div>

        <!-- Prompt preview -->
        <pre class="pm-preview">{{ truncate(item.template, 300) }}</pre>

        <div class="pm-card-foot">
          <span class="pm-updated">Updated {{ formatDate(item.updatedAt) }}</span>
          <button class="btn-ghost btn-xs" @click="openEdit(item)">
            <i class="ri-pencil-line" /> Edit Prompt
          </button>
        </div>
      </div>
    </div>

    <!-- Add / Edit Drawer -->
    <RDrawer
      v-model:open="showDrawer"
      :title="editing ? 'Edit Prompt Template' : 'Add Prompt Template'"
      icon="ri-robot-2-line"
      width-desktop="680px"
      width-tablet="95vw"
      @close="closeDrawer"
    >
      <template #body>
        <form id="prompt-form" class="pm-form" novalidate @submit.prevent="save">
          <!-- Feature key (immutable after creation) -->
          <div class="pm-field">
            <label class="pm-label">Feature Key <span class="required-star">*</span></label>
            <RInput
              v-model="form.feature"
              :disabled="!!editing"
              placeholder="e.g. translation, ceremony-autotranslate"
              :error="!!errors.feature"
              @on-input="clearError('feature')"
            />
            <span v-if="errors.feature" class="field-error">{{ errors.feature }}</span>
            <span v-else class="pm-hint">Unique key. Cannot be changed after creation.</span>
          </div>

          <!-- Name -->
          <div class="pm-field">
            <label class="pm-label">Name <span class="required-star">*</span></label>
            <RInput
              v-model="form.name"
              placeholder="Translation Prompt"
              :error="!!errors.name"
              @on-input="clearError('name')"
            />
            <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
          </div>

          <!-- Description -->
          <div class="pm-field">
            <label class="pm-label">Description</label>
            <RInput
              v-model="form.description"
              type="textarea"
              :rows="2"
              placeholder="What this prompt is used for…"
            />
          </div>

          <!-- Entity name + translatable fields -->
          <div class="pm-field">
            <label class="pm-label">Entity Name <span class="pm-hint-inline">(optional — e.g. Ceremony, Article)</span></label>
            <RInput
              v-model="form.entityName"
              placeholder="Ceremony"
            />
            <span class="pm-hint">When set, auto-translate will save to the dedicated translation table for this entity.</span>
          </div>

          <div class="pm-field">
            <label class="pm-label">
              Translatable Fields
              <span class="pm-hint-inline">(leave empty to translate all non-blank fields)</span>
            </label>
            <div class="pm-field-rows">
              <div v-for="(f, idx) in form.translatableFields" :key="idx" class="pm-field-row">
                <RInput v-model="f.name" placeholder="fieldName (e.g. name)" class="pm-field-row-name" />
                <RInput v-model="f.label" placeholder="Label (e.g. Ceremony Name)" class="pm-field-row-label" />
                <button type="button" class="btn-icon btn-xs-icon" style="color:var(--c-danger);flex-shrink:0" @click="removeTranslatableField(idx)">
                  <i class="ri-delete-bin-line" />
                </button>
              </div>
            </div>
            <button type="button" class="btn-ghost btn-xs mt-2" @click="addTranslatableField">
              <i class="ri-add-line" /> Add Field
            </button>
          </div>

          <!-- Active toggle -->
          <div class="pm-field pm-field--inline">
            <label class="pm-label">Active</label>
            <RSwitch v-model="form.active" />
            <span class="pm-hint">When inactive, the hardcoded code default is used instead.</span>
          </div>

          <!-- Auto-save toggle (only relevant when entityName is set) -->
          <div v-if="form.entityName" class="pm-field pm-field--inline pm-autosave-field">
            <label class="pm-label">Auto-save</label>
            <RSwitch v-model="form.autoSave" />
            <div class="pm-autosave-desc">
              <span v-if="form.autoSave" class="pm-hint">
                <i class="ri-flashlight-line" style="color:var(--c-accent)" />
                <strong>Auto:</strong> AI translates and saves immediately in the background after each save.
              </span>
              <span v-else class="pm-hint">
                <i class="ri-eye-line" style="color:var(--c-warning,#f59e0b)" />
                <strong>Review:</strong> After save, a review drawer opens so the user can inspect and edit translations before committing.
              </span>
            </div>
          </div>

          <!-- Variables (JSON editor) -->
          <div class="pm-field">
            <label class="pm-label">Variables <span class="pm-hint-inline">(JSON array — defines {'{'}variable{'}'} hints in editor)</span></label>
            <RInput
              v-model="variablesRaw"
              type="textarea"
              :rows="3"
              :error="!!errors.variables"
              placeholder='[{"name":"languages","description":"…"},{"name":"input","description":"…"}]'
              @on-input="clearError('variables')"
            />
            <span v-if="errors.variables" class="field-error">{{ errors.variables }}</span>
          </div>

          <!-- Template editor -->
          <div class="pm-field">
            <label class="pm-label">
              Prompt Template <span class="required-star">*</span>
              <span class="pm-hint-inline">Use {'{'}variableName{'}'} as placeholders</span>
            </label>

            <!-- Variable chip shortcuts -->
            <div v-if="parsedVariables.length" class="pm-var-inserts">
              <span class="pm-vars-label">Insert:</span>
              <button
                v-for="v in parsedVariables"
                :key="v.name"
                type="button"
                class="pm-var-chip pm-var-chip--btn"
                :title="v.description"
                @click="insertVariable(v.name)"
              >+ {<!-- -->{ v.name }}</button>
            </div>

            <textarea
              ref="templateRef"
              v-model="form.template"
              class="pm-template-editor"
              :class="{ 'input-error': !!errors.template }"
              rows="18"
              placeholder="Enter your prompt here…"
              spellcheck="false"
              @input="clearError('template')"
            />
            <span v-if="errors.template" class="field-error">{{ errors.template }}</span>
            <div class="pm-char-count">{{ form.template.length.toLocaleString() }} chars</div>
          </div>
        </form>
      </template>

      <template #footer>
        <div class="drawer-footer-btns">
          <button class="btn-ghost" @click="closeDrawer">Cancel</button>
          <button type="submit" form="prompt-form" class="btn-primary" :disabled="saving">
            <i v-if="saving" class="ri-loader-4-line animate-spin" />
            {{ saving ? 'Saving…' : 'Save' }}
          </button>
        </div>
      </template>
    </RDrawer>

    <!-- Test Prompt Drawer -->
    <RDrawer
      v-model:open="showTest"
      title="Test Prompt"
      icon="ri-test-tube-line"
      width-desktop="760px"
      width-tablet="95vw"
      @close="showTest = false"
    >
      <template #body>
        <div class="pm-test">
          <!-- Input -->
          <div class="pm-field">
            <label class="pm-label">Sample Input <span class="pm-hint-inline">(field: source text)</span></label>
            <div v-for="(_, idx) in testInputs" :key="idx" class="pm-test-input-row">
              <RInput v-model="testInputs[idx].field" placeholder="fieldName" style="flex:1" />
              <span class="pm-test-sep">:</span>
              <RInput v-model="testInputs[idx].value" placeholder="Source text to translate" style="flex:2" />
              <button type="button" class="btn-icon btn-xs-icon text-danger" @click="testInputs.splice(idx,1)">
                <i class="ri-delete-bin-line" />
              </button>
            </div>
            <button type="button" class="btn-ghost btn-xs mt-1" @click="testInputs.push({ field:'', value:'' })">
              <i class="ri-add-line" /> Add field
            </button>
          </div>

          <!-- Target languages -->
          <div class="pm-field">
            <label class="pm-label">Target Languages</label>
            <div class="pm-test-langs">
              <label v-for="l in langStore.activeItems" :key="l.code" class="pm-test-lang-check">
                <input type="checkbox" :value="l.code" v-model="testLangs" />
                {{ l.name }} <code>{{ l.code }}</code>
              </label>
            </div>
          </div>

          <!-- Run button -->
          <button class="btn-primary btn-sm" :disabled="testRunning || !canRunTest" @click="runTest">
            <i :class="testRunning ? 'ri-loader-4-line animate-spin' : 'ri-play-circle-line'" />
            {{ testRunning ? 'Running…' : 'Run Test' }}
          </button>

          <!-- Rendered prompt preview -->
          <div v-if="testRenderedPrompt" class="pm-field">
            <label class="pm-label pm-label--section">
              <i class="ri-eye-line" /> Rendered Prompt sent to AI
            </label>
            <pre class="pm-test-prompt">{{ testRenderedPrompt }}</pre>
          </div>

          <!-- Result -->
          <div v-if="testResult" class="pm-field">
            <label class="pm-label pm-label--section">
              <i class="ri-sparkling-line" /> AI Response
            </label>
            <div v-for="(langMap, field) in testResult" :key="field" class="pm-test-result-block">
              <div class="pm-test-result-field">{{ field }}</div>
              <div v-for="(val, lang) in langMap" :key="lang" class="pm-test-result-row">
                <code class="pm-test-result-lang">{{ lang }}</code>
                <span class="pm-test-result-val">{{ val }}</span>
              </div>
            </div>
          </div>

          <div v-if="testError" class="pm-test-error">
            <i class="ri-error-warning-line" /> {{ testError }}
          </div>
        </div>
      </template>
      <template #footer>
        <div class="drawer-footer-btns">
          <button class="btn-ghost" @click="showTest = false">Close</button>
          <button class="btn-primary btn-sm" :disabled="testRunning || !canRunTest" @click="runTest">
            <i :class="testRunning ? 'ri-loader-4-line animate-spin' : 'ri-play-circle-line'" />
            Run Test
          </button>
        </div>
      </template>
    </RDrawer>

    <!-- Reset confirm -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="resettingItem" class="modal-backdrop" @click.self="resettingItem = null">
          <div class="modal-box">
            <h3 class="modal-title"><i class="ri-refresh-line" /> Reset to Default?</h3>
            <p class="modal-body-text">
              The DB override for <strong>{{ resettingItem.feature }}</strong> will be removed.
              The hardcoded code default will be used until you add a new template.
            </p>
            <div class="modal-actions">
              <button class="btn-ghost" @click="resettingItem = null">Cancel</button>
              <button class="btn-warning" :disabled="acting" @click="doReset">
                <i v-if="acting" class="ri-loader-4-line animate-spin" /> Reset
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete confirm -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="deletingItem" class="modal-backdrop" @click.self="deletingItem = null">
          <div class="modal-box">
            <h3 class="modal-title"><i class="ri-delete-bin-line" /> Delete Prompt?</h3>
            <p class="modal-body-text">
              Delete <strong>{{ deletingItem.name }}</strong>? This cannot be undone.
            </p>
            <div class="modal-actions">
              <button class="btn-ghost" @click="deletingItem = null">Cancel</button>
              <button class="btn-danger" :disabled="acting" @click="doDelete">
                <i v-if="acting" class="ri-loader-4-line animate-spin" /> Delete
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </RWrapperPage>
</template>

<script setup>
definePageMeta({
  layout: 'navbar',
  middleware: ['auth'],
})

const store = usePromptTemplateStore()
const toast = useToastStore()

// ── State ─────────────────────────────────────────────────────────────────────
const showDrawer   = ref(false)
const editing      = ref(null)
const saving       = ref(false)
const acting       = ref(false)
const resettingItem = ref(null)
const deletingItem  = ref(null)
const templateRef  = ref(null)
const errors       = reactive({})

const defaultForm = () => ({
  feature: '', name: '', description: '', template: '', active: true, autoSave: true,
  entityName: '', translatableFields: [],
})

const addTranslatableField = () => form.translatableFields.push({ name: '', label: '' })
const removeTranslatableField = (idx) => form.translatableFields.splice(idx, 1)
const form = reactive(defaultForm())
const variablesRaw = ref('[]')

// ── Computed ──────────────────────────────────────────────────────────────────
const parsedVariables = computed(() => {
  try { return JSON.parse(variablesRaw.value) || [] } catch { return [] }
})

// ── Helpers ───────────────────────────────────────────────────────────────────
const clearError = (f) => { delete errors[f] }

const validate = () => {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.feature?.trim()) errors.feature = 'Feature key is required.'
  if (!form.name?.trim())    errors.name    = 'Name is required.'
  if (!form.template?.trim()) errors.template = 'Prompt template is required.'
  if (variablesRaw.value?.trim() && variablesRaw.value.trim() !== '[]') {
    try { JSON.parse(variablesRaw.value) }
    catch { errors.variables = 'Must be a valid JSON array.' }
  }
  return !Object.keys(errors).length
}

const truncate = (str, n) => str?.length > n ? str.slice(0, n) + '…' : str

const formatDate = (dt) => {
  if (!dt) return ''
  return new Date(dt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

const insertVariable = (name) => {
  const el = templateRef.value
  if (!el) { form.template += `{${name}}`; return }
  const start = el.selectionStart
  const end   = el.selectionEnd
  form.template = form.template.slice(0, start) + `{${name}}` + form.template.slice(end)
  nextTick(() => { el.selectionStart = el.selectionEnd = start + name.length + 2; el.focus() })
}

// ── Modal handlers ─────────────────────────────────────────────────────────────
const openAdd = () => {
  editing.value = null
  Object.assign(form, defaultForm())
  variablesRaw.value = '[]'
  showDrawer.value = true
}

const openEdit = (item) => {
  editing.value = item
  Object.assign(form, {
    feature: item.feature,
    name: item.name,
    description: item.description ?? '',
    template: item.template,
    active: item.active,
    autoSave: item.autoSave ?? true,
    entityName: item.entityName ?? '',
    translatableFields: item.translatableFields?.length
      ? item.translatableFields.map((f) => ({ name: f.name, label: f.label || '' }))
      : [],
  })
  variablesRaw.value = item.variables?.length
    ? JSON.stringify(item.variables, null, 2)
    : '[]'
  showDrawer.value = true
}

const closeDrawer = () => {
  showDrawer.value = false
  editing.value = null
  Object.keys(errors).forEach((k) => delete errors[k])
}

// ── CRUD ───────────────────────────────────────────────────────────────────────
const save = async () => {
  if (!validate()) return
  saving.value = true
  try {
    const payload = {
      feature:           form.feature.trim(),
      name:              form.name.trim(),
      description:       form.description?.trim() || null,
      template:          form.template,
      variables:         variablesRaw.value?.trim() || null,
      active:            form.active,
      autoSave:          form.autoSave,
      entityName:        form.entityName?.trim() || null,
      translatableFields: form.translatableFields.filter((f) => f.name.trim()).length
        ? JSON.stringify(form.translatableFields.filter((f) => f.name.trim()))
        : null,
    }
    const result = editing.value
      ? await store.updatePrompt(editing.value.id, payload)
      : await store.addPrompt(payload)

    if (result?.data) {
      toast.add(editing.value ? 'Prompt updated.' : 'Prompt created.', 'Saved')
      closeDrawer()
    } else {
      toast.add(result?.error || 'Failed to save.', 'Error')
    }
  } finally {
    saving.value = false
  }
}

const confirmReset  = (item) => { resettingItem.value = item }
const confirmDelete = (item) => { deletingItem.value  = item }

const doReset = async () => {
  acting.value = true
  try {
    const ok = await store.resetToDefault(resettingItem.value.feature)
    if (ok) { toast.add('Reset to code default.', 'Reset'); resettingItem.value = null }
    else toast.add('Reset failed.', 'Error')
  } finally { acting.value = false }
}

const doDelete = async () => {
  acting.value = true
  try {
    const ok = await store.deletePrompt(deletingItem.value.id)
    if (ok) { toast.add('Prompt deleted.', 'Deleted'); deletingItem.value = null }
    else toast.add('Delete failed.', 'Error')
  } finally { acting.value = false }
}

// ── Test Prompt ────────────────────────────────────────────────────────────────
const langStore = useLanguageStore()
const showTest        = ref(false)
const testItem        = ref(null)
const testRunning     = ref(false)
const testInputs      = ref([{ field: 'greeting', value: 'Welcome to the wedding!' }])
const testLangs       = ref([])
const testRenderedPrompt = ref('')
const testResult      = ref(null)
const testError       = ref('')

const canRunTest = computed(() =>
  testInputs.value.some((r) => r.field.trim() && r.value.trim()) && testLangs.value.length
)

const openTest = (item) => {
  testItem.value = item
  testRenderedPrompt.value = ''
  testResult.value = null
  testError.value = ''
  // Default: select default language + first non-default
  const defCode = langStore.activeItems.find((l) => l.isDefault)?.code ?? langStore.activeItems[0]?.code
  testLangs.value = langStore.activeItems.slice(0, 3).map((l) => l.code)
  showTest.value = true
}

const runTest = async () => {
  testRunning.value = true
  testRenderedPrompt.value = ''
  testResult.value = null
  testError.value = ''

  const input = Object.fromEntries(
    testInputs.value.filter((r) => r.field.trim() && r.value.trim()).map((r) => [r.field.trim(), r.value.trim()])
  )
  const languages = testLangs.value.map((code) => {
    const lang = langStore.activeItems.find((l) => l.code === code)
    return { code, name: lang?.name ?? code }
  })

  try {
    const { data, error } = await useHttp('/api/v1/admin/prompts/test', {
      method: 'POST',
      body: { input, languages },
      isGlobal: true,
    })
    if (error?.value) {
      testError.value = error.value?.data?.message || 'Test failed'
      return
    }
    const res = data.value?.data ?? data.value
    testRenderedPrompt.value = res?.renderedPrompt ?? ''
    testResult.value = res?.result ?? null
  } catch (e) {
    testError.value = e.message || 'Unexpected error'
  } finally {
    testRunning.value = false
  }
}

// ── Init ───────────────────────────────────────────────────────────────────────
onMounted(async () => {
  await nextTick()
  await store.fetchAll()
  if (!langStore.items.length) await langStore.fetchLanguages()
})
</script>

<style lang="scss">
.pm-page { display: flex; flex-direction: column; gap: var(--sp-5); }

.pm-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(540px, 1fr));
  gap: var(--sp-5);
}

/* Card */
.pm-card {
  padding: var(--sp-5);
  display: flex; flex-direction: column; gap: var(--sp-3);
  border: 1px solid var(--c-border);
  transition: border-color .15s;
  &:hover { border-color: var(--c-accent); }
  &.pm-card--inactive { opacity: .6; }
}
.pm-card-skel { height: 220px; background: var(--c-surface); border-radius: var(--r-md); }

.pm-card-head {
  display: flex; align-items: center; justify-content: space-between; gap: var(--sp-3);
}
.pm-card-meta { display: flex; align-items: center; gap: var(--sp-2); }
.pm-card-actions { display: flex; gap: var(--sp-1); }

.pm-feature-badge {
  display: inline-block; padding: 2px 10px;
  background: rgba(var(--c-accent-rgb,99,102,241),.12);
  color: var(--c-accent); border-radius: 99px;
  font-size: .72rem; font-weight: 600; font-family: monospace;
}
.pm-inactive-badge {
  display: inline-block; padding: 2px 8px;
  background: rgba(248,113,113,.12); color: var(--c-danger);
  border-radius: 99px; font-size: .7rem; font-weight: 600;
}
.pm-review-badge {
  display: inline-flex; align-items: center; gap: 3px; padding: 2px 8px;
  background: rgba(245,158,11,.12); color: var(--c-warning,#f59e0b);
  border-radius: 99px; font-size: .7rem; font-weight: 600;
}
.pm-autosave-badge {
  display: inline-flex; align-items: center; gap: 3px; padding: 2px 8px;
  background: rgba(var(--c-accent-rgb,99,102,241),.12); color: var(--c-accent);
  border-radius: 99px; font-size: .7rem; font-weight: 600;
}
.pm-autosave-field { align-items: flex-start !important; }
.pm-autosave-desc { display: flex; flex-direction: column; gap: 2px; }

.pm-card-name { font-size: 1rem; font-weight: 600; color: var(--c-text); margin: 0; }
.pm-card-desc { font-size: .8rem; color: var(--c-muted); margin: 0; }

.pm-entity-row {
  display: flex; flex-wrap: wrap; align-items: center; gap: var(--sp-2); margin-bottom: 2px;
}
.pm-entity-badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 2px 8px; border-radius: 4px;
  background: rgba(16,185,129,.12); border: 1px solid rgba(16,185,129,.25);
  color: var(--c-success,#10b981); font-size: .72rem; font-weight: 600;
}
.pm-field-chip {
  padding: 2px 8px; border-radius: 4px;
  background: rgba(var(--c-accent-rgb,99,102,241),.1); border: 1px solid rgba(var(--c-accent-rgb,99,102,241),.2);
  color: var(--c-accent); font-size: .72rem;
}
.pm-field-rows { display: flex; flex-direction: column; gap: var(--sp-2); }
.pm-field-row {
  display: flex; align-items: center; gap: var(--sp-2);
  .pm-field-row-name { flex: 0 0 180px; }
  .pm-field-row-label { flex: 1; }
}

.pm-vars {
  display: flex; flex-wrap: wrap; align-items: center; gap: var(--sp-2);
}
.pm-vars-label { font-size: .72rem; color: var(--c-muted); font-weight: 500; }
.pm-var-chip {
  display: inline-block; padding: 2px 8px;
  background: var(--c-surface); border: 1px solid var(--c-border);
  border-radius: 4px; font-size: .72rem; font-family: monospace; color: var(--c-text);
  &.pm-var-chip--btn {
    cursor: pointer; transition: background .12s, border-color .12s;
    &:hover { background: rgba(var(--c-accent-rgb,99,102,241),.1); border-color: var(--c-accent); color: var(--c-accent); }
  }
}

.pm-preview {
  background: var(--c-bg); border: 1px solid var(--c-border); border-radius: var(--r-md);
  padding: var(--sp-3) var(--sp-4); font-size: .75rem; font-family: monospace;
  color: var(--c-muted); white-space: pre-wrap; word-break: break-word;
  max-height: 130px; overflow: hidden; flex: 1;
}

.pm-card-foot {
  display: flex; align-items: center; justify-content: space-between;
  padding-top: var(--sp-2); border-top: 1px solid var(--c-border);
}
.pm-updated { font-size: .72rem; color: var(--c-muted); }

/* Empty */
.pm-empty {
  padding: var(--sp-10); text-align: center; color: var(--c-muted);
  display: flex; flex-direction: column; align-items: center; gap: var(--sp-2);
}
.pm-empty-icon { font-size: 2.5rem; color: var(--c-muted); }

/* Form */
.pm-form { display: flex; flex-direction: column; gap: var(--sp-5); padding: var(--sp-1); }
.pm-field { display: flex; flex-direction: column; gap: var(--sp-2); }
.pm-field--inline { flex-direction: row; align-items: center; gap: var(--sp-3); }
.pm-label { font-size: .8rem; font-weight: 600; color: var(--c-text); }
.pm-hint { font-size: .72rem; color: var(--c-muted); }
.pm-hint-inline { font-size: .72rem; color: var(--c-muted); font-weight: 400; margin-left: var(--sp-2); }

.pm-var-inserts {
  display: flex; flex-wrap: wrap; align-items: center; gap: var(--sp-2);
  margin-bottom: var(--sp-2);
}

.pm-template-editor {
  width: 100%; font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: .8rem;
  line-height: 1.6; padding: var(--sp-3) var(--sp-4);
  background: var(--c-bg); color: var(--c-text);
  border: 1px solid var(--c-border); border-radius: var(--r-md);
  resize: vertical; outline: none; transition: border-color .15s;
  &:focus { border-color: var(--c-accent); }
  &.input-error { border-color: var(--c-danger); }
}
.pm-char-count {
  font-size: .7rem; color: var(--c-muted); text-align: right; margin-top: -var(--sp-1);
}

/* Modals */
.modal-backdrop {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,.55); display: flex; align-items: center; justify-content: center;
}
.modal-box {
  background: var(--c-surface); border: 1px solid var(--c-border);
  border-radius: var(--r-xl); padding: var(--sp-6); max-width: 440px; width: 90%;
  display: flex; flex-direction: column; gap: var(--sp-4);
}
.modal-title { font-size: 1rem; font-weight: 700; color: var(--c-text); margin: 0; }
.modal-body-text { font-size: .875rem; color: var(--c-muted); margin: 0; }
.modal-actions { display: flex; justify-content: flex-end; gap: var(--sp-3); }
.btn-warning {
  padding: var(--sp-2) var(--sp-5); background: #f59e0b; color: #fff;
  border-radius: var(--r-md); font-weight: 600; font-size: .875rem;
  &:hover { background: #d97706; }
}

/* Test Drawer */
.pm-test { display: flex; flex-direction: column; gap: var(--sp-5); padding: var(--sp-1); }
.pm-test-input-row {
  display: flex; align-items: center; gap: var(--sp-2); margin-bottom: var(--sp-2);
}
.pm-test-sep { color: var(--c-muted); font-weight: 700; }
.pm-test-langs {
  display: flex; flex-wrap: wrap; gap: var(--sp-3);
}
.pm-test-lang-check {
  display: flex; align-items: center; gap: var(--sp-2);
  font-size: .8rem; color: var(--c-text); cursor: pointer;
  code { font-size: .7rem; color: var(--c-muted); background: var(--c-surface);
         padding: 1px 5px; border-radius: 4px; }
}
.pm-test-prompt {
  background: var(--c-bg); border: 1px solid var(--c-border); border-radius: var(--r-md);
  padding: var(--sp-4); font-size: .75rem; font-family: monospace;
  white-space: pre-wrap; word-break: break-word; color: var(--c-text);
  max-height: 300px; overflow-y: auto;
}
.pm-label--section {
  font-size: .8rem; font-weight: 700; color: var(--c-accent);
  display: flex; align-items: center; gap: var(--sp-2);
}
.pm-test-result-block {
  background: var(--c-surface); border: 1px solid var(--c-border);
  border-radius: var(--r-md); padding: var(--sp-3) var(--sp-4);
  margin-bottom: var(--sp-3);
}
.pm-test-result-field {
  font-size: .75rem; font-weight: 700; font-family: monospace;
  color: var(--c-accent); margin-bottom: var(--sp-2);
}
.pm-test-result-row {
  display: flex; align-items: baseline; gap: var(--sp-3); padding: var(--sp-1) 0;
  border-top: 1px solid var(--c-border);
}
.pm-test-result-lang {
  flex-shrink: 0; font-size: .7rem; background: var(--c-bg);
  padding: 2px 6px; border-radius: 4px; color: var(--c-muted);
}
.pm-test-result-val { font-size: .875rem; color: var(--c-text); }
.pm-test-error {
  background: rgba(248,113,113,.1); border: 1px solid rgba(248,113,113,.25);
  border-radius: var(--r-md); padding: var(--sp-3) var(--sp-4);
  font-size: .8rem; color: var(--c-danger);
  display: flex; align-items: center; gap: var(--sp-2);
}
.mt-1 { margin-top: var(--sp-1); }

.required-star { color: var(--c-danger); margin-left: 2px; }
.input-error { border-color: var(--c-danger) !important; }
.field-error {
  display: flex; align-items: center; gap: 4px;
  font-size: .75rem; color: var(--c-danger);
  &::before { content: '⚠'; font-size: .7rem; }
}
.text-danger { color: var(--c-danger) !important; }
.mt-3 { margin-top: var(--sp-3); }
</style>
