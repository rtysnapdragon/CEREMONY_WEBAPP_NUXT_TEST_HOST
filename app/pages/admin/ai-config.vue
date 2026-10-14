<template>
  <RWrapperPage class="ai-config-page">
    <RPageHeader title="AI Configuration" subtitle="Configure the Gemini AI provider used for translations" />
    <div class="ai-config-layout animate-fade-up delay-1">
      <!-- Config Card -->
      <div class="glass-card aic-card">
        <div class="aic-section-title">
          <i class="ri-key-2-line" /> API Settings
        </div>

        <div v-if="loading" class="aic-loading">
          <i class="ri-loader-4-line animate-spin" /> Loading configuration...
        </div>

        <form v-else class="aic-form" @submit.prevent="save">

          <!-- Enable / Disable AI feature -->
          <div class="aic-enable-row">
            <div class="aic-enable-info">
              <span class="aic-enable-label">AI Feature</span>
              <span class="aic-enable-sub">
                {{ form.enabled ? 'Enabled — AI translate checkbox shown in all create forms' : 'Disabled — checkbox hidden from all forms' }}
              </span>
            </div>
            <button
              type="button"
              class="aic-toggle"
              :class="{ active: form.enabled }"
              @click="form.enabled = !form.enabled"
            >
              <span class="aic-toggle-knob" />
              <span class="aic-toggle-label">{{ form.enabled ? 'ON' : 'OFF' }}</span>
            </button>
          </div>

          <!-- API Key -->
          <div class="form-group">
            <label class="input-label">
              API Key
              <span class="aic-source-badge" :class="cfg.apiKeySource">{{ cfg.apiKeySource }}</span>
            </label>
            <div class="aic-input-row">
              <input
                v-model="form.apiKey"
                :type="showKey ? 'text' : 'password'"
                class="input"
                placeholder="Enter new API key to override"
                autocomplete="off"
              />
              <button type="button" class="btn-icon" @click="showKey = !showKey">
                <i :class="showKey ? 'ri-eye-off-line' : 'ri-eye-line'" />
              </button>
            </div>
            <p class="aic-hint">
              <i class="ri-information-line" />
              Current source: <strong>{{ cfg.apiKeySource === 'db' ? 'Database (overrides env)' : 'Environment variable' }}</strong>
              <span v-if="cfg.apiKeySource === 'db'"> — key is set</span>
            </p>
          </div>

          <!-- Base URL -->
          <div class="form-group">
            <label class="input-label">
              Base URL
              <span class="aic-source-badge" :class="cfg.baseUrlSource">{{ cfg.baseUrlSource }}</span>
            </label>
            <input v-model="form.baseUrl" type="url" class="input" placeholder="https://generativelanguage.googleapis.com/v1beta/openai" />
            <p class="aic-hint"><i class="ri-information-line" /> OpenAI-compatible endpoint. Default: Gemini v1beta</p>
          </div>

          <!-- Model -->
          <div class="form-group">
            <label class="input-label">
              Model
              <span class="aic-source-badge" :class="cfg.modelSource">{{ cfg.modelSource }}</span>
            </label>
            <div class="aic-model-row">
              <input v-model="form.model" type="text" class="input" placeholder="gemini-2.0-flash-lite" />
              <div class="aic-model-chips">
                <button
                  v-for="m in MODELS"
                  :key="m"
                  type="button"
                  class="aic-chip"
                  :class="{ active: form.model === m }"
                  @click="form.model = m"
                >{{ m }}</button>
              </div>
            </div>
          </div>

          <div class="aic-footer">
            <button type="button" class="btn-ghost" :disabled="testing" @click="test">
              <i :class="testing ? 'ri-loader-4-line animate-spin' : 'ri-flask-line'" />
              {{ testing ? 'Testing...' : 'Test Connection' }}
            </button>
            <button type="submit" class="btn-primary" :disabled="saving">
              <i :class="saving ? 'ri-loader-4-line animate-spin' : 'ri-save-line'" />
              {{ saving ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </form>

        <!-- Test result -->
        <Transition name="fade">
          <div v-if="testResult" class="aic-test-result" :class="testResult.ok ? 'ok' : 'err'">
            <i :class="testResult.ok ? 'ri-check-circle-line' : 'ri-error-warning-line'" />
            <div>
              <strong>{{ testResult.ok ? 'Connection successful' : 'Connection failed' }}</strong>
              <p v-if="testResult.detail">{{ testResult.detail }}</p>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Info Card -->
      <div class="glass-card aic-info-card">
        <div class="aic-section-title"><i class="ri-information-line" /> How it works</div>
        <ul class="aic-info-list">
          <li>
            <i class="ri-database-2-line" />
            <span>Settings saved here override <code>.env</code> / <code>application.yaml</code> without a restart.</span>
          </li>
          <li>
            <i class="ri-key-2-line" />
            <span>The API key is stored securely in the database and never returned in plain text.</span>
          </li>
          <li>
            <i class="ri-sparkling-line" />
            <span>The AI is used for multi-language translation via <code>POST /api/v1/ai/translate</code>.</span>
          </li>
          <li>
            <i class="ri-external-link-line" />
            <span>Get a Gemini API key at <a href="https://aistudio.google.com/apikey" target="_blank">aistudio.google.com</a>.</span>
          </li>
        </ul>

        <div class="aic-endpoints">
          <div class="aic-section-title" style="margin-top:var(--sp-4)"><i class="ri-code-line" /> Endpoints</div>
          <div class="aic-endpoint-row"><span class="aic-method get">GET</span><code>/api/v1/admin/config/ai</code></div>
          <div class="aic-endpoint-row"><span class="aic-method put">PUT</span><code>/api/v1/admin/config/ai</code></div>
          <div class="aic-endpoint-row"><span class="aic-method post">POST</span><code>/api/v1/admin/config/ai/test</code></div>
        </div>
      </div>

    </div>
  </RWrapperPage>
</template>

<script setup>
definePageMeta({ layout: 'navbar', middleware: ['auth'] })

const toast = useToastStore()
const { $http } = useNuxtApp()

const MODELS = [
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
]

const loading = ref(true)
const saving = ref(false)
const testing = ref(false)
const showKey = ref(false)
const testResult = ref(null)

const cfg = ref({
  apiKey: '',
  baseUrl: '',
  model: '',
  apiKeySource: 'env',
  baseUrlSource: 'env',
  modelSource: 'env',
})

const form = reactive({
  enabled: true,
  apiKey: '',
  baseUrl: '',
  model: '',
})

const load = async () => {
  loading.value = true
  try {
    const { data, error } = await useHttp('/api/v1/admin/config/ai', { method: 'GET', isGlobal: true })
    if (error?.value) { toast.add('Failed to load AI config', 'Error'); return }
    const d = data.value?.data ?? data.value
    cfg.value = { ...d }
    form.enabled = d.enabled !== 'false' && d.enabled !== false
    form.baseUrl = d.baseUrl ?? ''
    form.model   = d.model ?? ''
    // never pre-fill apiKey — user must retype to change
  } finally {
    loading.value = false
  }
}

const save = async () => {
  saving.value = true
  testResult.value = null
  try {
    const body = { enabled: String(form.enabled) }
    if (form.apiKey.trim())  body.apiKey  = form.apiKey.trim()
    if (form.baseUrl.trim()) body.baseUrl = form.baseUrl.trim()
    if (form.model.trim())   body.model   = form.model.trim()

    const { error } = await useHttp('/api/v1/admin/config/ai', { method: 'PUT', body, isGlobal: true })
    if (error?.value) { toast.add('Failed to save', 'Error'); return }
    toast.add('AI configuration saved', 'Saved')
    form.apiKey = ''
    await load()
  } finally {
    saving.value = false
  }
}

const test = async () => {
  testing.value = true
  testResult.value = null
  try {
    const { data, error } = await useHttp('/api/v1/admin/config/ai/test', { method: 'POST', isGlobal: true })
    if (error?.value) {
      const msg = error.value?.data?.message ?? error.value?.message ?? 'Connection failed'
      testResult.value = { ok: false, detail: msg }
      return
    }
    const result = data.value?.data ?? data.value
    const preview = result ? Object.entries(result).map(([k, v]) => `${k}: ${v}`).join(' | ') : ''
    testResult.value = { ok: true, detail: preview || 'Translation succeeded' }
  } finally {
    testing.value = false
    // auto-hide after 8s
    setTimeout(() => { testResult.value = null }, 8000)
  }
}

onMounted(load)
</script>

<style lang="scss">
.ai-config-page { display: flex; flex-direction: column; gap: var(--sp-5); }

.ai-config-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: var(--sp-5);
  align-items: start;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
}

.aic-card, .aic-info-card {
  padding: var(--sp-6);
  display: flex;
  flex-direction: column;
  gap: var(--sp-5);
}

.aic-section-title {
  font-weight: 700;
  font-size: 0.9375rem;
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--c-text);
  i { color: var(--c-accent); }
}

.aic-loading {
  display: flex; align-items: center; gap: var(--sp-3);
  color: var(--c-muted); padding: var(--sp-6) 0; font-size: 0.9rem;
}

.aic-form { display: flex; flex-direction: column; gap: var(--sp-4); }

.aic-enable-row {
  display: flex; align-items: center; justify-content: space-between; gap: var(--sp-4);
  padding: var(--sp-4); border-radius: var(--r-md);
  border: 1px solid var(--c-border); background: rgba(255,255,255,0.02);
}

.aic-enable-info { display: flex; flex-direction: column; gap: 2px; }
.aic-enable-label { font-weight: 700; font-size: 0.9rem; }
.aic-enable-sub { font-size: 0.775rem; color: var(--c-muted); }

.aic-toggle {
  display: flex; align-items: center; gap: 8px;
  padding: 4px 8px 4px 4px; border-radius: var(--r-full);
  border: 1px solid var(--c-border); background: rgba(255,255,255,0.04);
  cursor: pointer; transition: all var(--t-fast); flex-shrink: 0;

  &.active {
    background: rgba(var(--c-success-rgb,34,197,94),0.12);
    border-color: rgba(var(--c-success-rgb,34,197,94),0.4);
    .aic-toggle-knob { background: var(--c-success); transform: translateX(20px); }
    .aic-toggle-label { color: var(--c-success); }
  }
}

.aic-toggle-knob {
  width: 20px; height: 20px; border-radius: 50%;
  background: var(--c-muted); transition: all var(--t-fast);
}

.aic-toggle-label { font-size: 0.7rem; font-weight: 700; color: var(--c-muted); }

.aic-source-badge {
  font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
  padding: 2px 7px; border-radius: var(--r-full); margin-left: 6px;
  &.db  { background: rgba(var(--c-success-rgb,34,197,94),0.12); color: var(--c-success); border: 1px solid rgba(var(--c-success-rgb,34,197,94),0.25); }
  &.env { background: rgba(255,255,255,0.06); color: var(--c-muted); border: 1px solid var(--c-border); }
}

.aic-input-row {
  display: flex; gap: var(--sp-2); align-items: center;
  input { flex: 1; }
}

.aic-hint {
  font-size: 0.75rem; color: var(--c-muted); margin-top: 4px;
  display: flex; align-items: center; gap: 4px; flex-wrap: wrap;
  i { flex-shrink: 0; }
}

.aic-model-row { display: flex; flex-direction: column; gap: var(--sp-2); }

.aic-model-chips { display: flex; flex-wrap: wrap; gap: var(--sp-2); }

.aic-chip {
  padding: 4px 12px; border-radius: var(--r-full); font-size: 0.75rem;
  font-weight: 500; cursor: pointer; border: 1px solid var(--c-border);
  background: transparent; color: var(--c-muted); transition: all var(--t-fast);
  &:hover { border-color: var(--c-accent); color: var(--c-text); }
  &.active { border-color: var(--c-accent); background: rgba(var(--c-accent-rgb,139,92,246),0.12); color: var(--c-accent); }
}

.aic-footer {
  display: flex; justify-content: flex-end; gap: var(--sp-3);
  padding-top: var(--sp-3); border-top: 1px solid var(--c-border);
}

/* Test result */
.aic-test-result {
  display: flex; align-items: flex-start; gap: var(--sp-3);
  padding: var(--sp-4); border-radius: var(--r-md); font-size: 0.875rem;
  i { font-size: 1.25rem; flex-shrink: 0; margin-top: 1px; }
  p { font-size: 0.8rem; color: var(--c-muted); margin-top: 2px; }
  &.ok  { background: rgba(var(--c-success-rgb,34,197,94),0.08); border: 1px solid rgba(var(--c-success-rgb,34,197,94),0.2); i { color: var(--c-success); } }
  &.err { background: rgba(var(--c-danger-rgb,239,68,68),0.08);  border: 1px solid rgba(var(--c-danger-rgb,239,68,68),0.2);  i { color: var(--c-danger);  } }
}

/* Info card */
.aic-info-list {
  list-style: none; padding: 0; margin: 0;
  display: flex; flex-direction: column; gap: var(--sp-3);
  li {
    display: flex; align-items: flex-start; gap: var(--sp-3);
    font-size: 0.875rem; color: var(--c-muted); line-height: 1.5;
    i { color: var(--c-accent); flex-shrink: 0; margin-top: 2px; }
    a { color: var(--c-accent); text-decoration: underline; }
    code { font-family: monospace; font-size: 0.8rem; background: rgba(255,255,255,0.06); padding: 1px 6px; border-radius: 4px; }
  }
}

.aic-endpoints { display: flex; flex-direction: column; gap: var(--sp-2); }
.aic-endpoint-row { display: flex; align-items: center; gap: var(--sp-3); font-size: 0.8rem; code { color: var(--c-muted); } }
.aic-method {
  font-size: 0.65rem; font-weight: 700; padding: 2px 7px; border-radius: var(--r-sm); min-width: 42px; text-align: center;
  &.get  { background: rgba(34,197,94,0.12);  color: #22c55e; }
  &.put  { background: rgba(245,158,11,0.12); color: #f59e0b; }
  &.post { background: rgba(59,130,246,0.12); color: #3b82f6; }
}

.fade-enter-active, .fade-leave-active { transition: opacity var(--t-base); }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
