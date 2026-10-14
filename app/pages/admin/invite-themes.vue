<template>
  <div class="inv-themes-page">
    <RPageHeader
      title="Invite Themes"
      subtitle="Manage color themes for guest invitation pages"
      icon="ri-mail-star-line"
    >
      <template #actions>
        <button class="btn-primary" @click="openCreate">
          <i class="ri-add-line" /> New Invite Theme
        </button>
      </template>
    </RPageHeader>

    <!-- Main layout -->
    <div class="themes-layout animate-fade-up delay-1">
      <!-- Sidebar -->
      <aside class="themes-sidebar">
        <div class="sidebar-search">
          <input v-model="search" class="search-input" placeholder="Search invite themes…" />
        </div>
        <div class="sidebar-list">
          <div
            v-for="theme in filteredThemes"
            :key="theme.id"
            class="theme-card"
            :class="{ active: selectedId === theme.id }"
            @click="selectTheme(theme)"
          >
            <!-- 4-dot invite color swatches -->
            <div class="inv-swatches">
              <span class="inv-swatch" :style="{ background: swatchOf(theme, '--inv-primary') }" title="Primary" />
              <span class="inv-swatch" :style="{ background: swatchOf(theme, '--inv-secondary') }" title="Secondary" />
              <span class="inv-swatch inv-swatch-bg" :style="{ background: swatchOf(theme, '--inv-bg') }" title="Background" />
              <span class="inv-swatch" :style="{ background: swatchOf(theme, '--inv-text') }" title="Text" />
            </div>
            <div class="theme-card-header">
              <span class="theme-card-name">{{ theme.name }}</span>
            </div>
            <div v-if="theme.description" class="theme-card-desc">{{ theme.description }}</div>
            <div class="theme-card-actions" @click.stop>
              <button class="btn-xs" title="Edit colors" @click="selectTheme(theme)">
                <i class="ri-edit-line" />
              </button>
              <button class="btn-xs" title="Duplicate" @click="duplicate(theme)">
                <i class="ri-file-copy-line" />
              </button>
              <button class="btn-xs btn-danger-xs" title="Delete" @click="askDelete(theme)">
                <i class="ri-delete-bin-line" />
              </button>
            </div>
          </div>

          <div v-if="filteredThemes.length === 0" class="sidebar-empty">
            <i class="ri-mail-star-line" style="font-size:2rem;opacity:.3" />
            <p>No invite themes yet</p>
          </div>
        </div>
        <div class="sidebar-footer">
          <button class="btn-primary" style="width:100%" @click="openCreate">
            <i class="ri-add-line" /> Create Theme
          </button>
        </div>
      </aside>

      <!-- Editor panel -->
      <div class="editor-panel">
        <div v-if="!selected" class="editor-empty">
          <i class="ri-mail-star-line" style="font-size:3rem;opacity:.25;display:block;margin-bottom:12px" />
          <p style="color:var(--c-muted)">Select an invite theme from the sidebar to edit its colors</p>
        </div>

        <template v-else>
          <div class="editor-head">
            <div>
              <h2 class="editor-title">{{ selected.name }}</h2>
              <p v-if="selected.description" class="editor-subtitle">{{ selected.description }}</p>
            </div>
            <button class="btn-ghost btn-sm" @click="openEdit(selected)">
              <i class="ri-settings-3-line" /> Settings
            </button>
          </div>

          <!-- Live invite preview strip -->
          <div
            class="inv-preview-strip"
            :style="{
              background: tokens['--inv-bg'] || '#1a1208',
              borderColor: tokens['--inv-secondary'] || '#a07830',
            }"
          >
            <div class="inv-preview-header" :style="{ color: tokens['--inv-primary'] || '#c9a84c' }">
              <i class="ri-heart-fill" style="margin-right:6px" />
              Invitation Preview
            </div>
            <p class="inv-preview-body" :style="{ color: tokens['--inv-text'] || '#f5e6c8' }">
              You are cordially invited to celebrate with us
            </p>
            <button
              class="inv-preview-btn"
              :style="{
                background: tokens['--inv-primary'] || '#c9a84c',
                color: tokens['--inv-bg'] || '#1a1208',
              }"
            >
              RSVP Now
            </button>
          </div>

          <!-- 4 color token rows -->
          <div class="token-editor">
            <div class="token-editor-header">
              <div class="token-col-label">Invite Token</div>
              <div class="token-col-color">Color</div>
            </div>

            <div v-for="def in INVITE_TOKEN_DEFS" :key="def.token" class="token-row">
              <div class="token-meta">
                <code class="token-name">{{ def.token }}</code>
                <span class="token-desc">{{ def.description }}</span>
              </div>
              <div class="token-color-cell">
                <button
                  class="color-swatch"
                  :style="{ background: tokens[def.token] || def.lightValue }"
                  @click.stop="openPicker($event, def.token)"
                />
                <input
                  :value="tokens[def.token] || def.lightValue"
                  class="hex-input"
                  placeholder="#c9a84c"
                  @input="onInput(def.token, ($event.target as HTMLInputElement).value)"
                />
              </div>
            </div>

            <div class="save-bar">
              <span class="text-muted" style="font-size:0.8rem">4 invite color tokens</span>
              <button class="btn-primary" :disabled="saving" @click="saveColors">
                <i v-if="saving" class="ri-loader-4-line animate-spin" />
                <i v-else class="ri-save-line" />
                {{ saving ? 'Saving…' : 'Save Colors' }}
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Create / Edit drawer -->
    <RDrawer v-model:open="showDrawer" :title="editingTheme ? 'Edit Invite Theme' : 'New Invite Theme'" icon="ri-mail-star-line" width-desktop="420px" @close="showDrawer = false">
      <template #body>
        <form id="inv-theme-form" novalidate @submit.prevent="saveTheme">
          <div class="form-group">
            <label class="input-label">Name <span class="required-star">*</span></label>
            <RInput v-model="form.name" :error="!!formErr.name" placeholder="e.g. Golden Elegance" @on-input="delete formErr.name" />
            <span v-if="formErr.name" class="field-error">{{ formErr.name }}</span>
          </div>
          <div class="form-group">
            <label class="input-label">Description</label>
            <RInput v-model="form.description" type="textarea" :rows="2" placeholder="Optional description…" />
          </div>
        </form>
      </template>
      <template #footer>
        <div class="drawer-footer-btns">
          <button class="btn-ghost" @click="showDrawer = false">Cancel</button>
          <button type="submit" form="inv-theme-form" class="btn-primary" :disabled="drawerSaving">
            {{ drawerSaving ? 'Saving…' : (editingTheme ? 'Update' : 'Create') }}
          </button>
        </div>
      </template>
    </RDrawer>

    <!-- Delete confirm -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="deletingTheme" class="modal-backdrop" @click.self="deletingTheme = null">
          <div class="inv-modal">
            <div class="inv-modal-header">
              <span>Delete Invite Theme</span>
              <button class="btn-icon" @click="deletingTheme = null"><i class="ri-close-line" /></button>
            </div>
            <div class="inv-modal-body">
              <p>Delete <strong>{{ deletingTheme.name }}</strong>? This cannot be undone.</p>
            </div>
            <div class="inv-modal-footer">
              <button class="btn-ghost" @click="deletingTheme = null">Cancel</button>
              <button class="btn-danger" :disabled="deleting" @click="doDelete">
                {{ deleting ? 'Deleting…' : 'Delete' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Floating color picker -->
    <Teleport to="body">
      <div
        v-if="pickerToken"
        class="color-picker-float"
        :style="{ left: pickerPos.x + 'px', top: pickerPos.y + 'px' }"
        @click.stop
        @mousedown.stop
      >
        <div class="cpf-header" @mousedown.prevent="startDrag">
          <span class="cpf-title">{{ pickerToken }}</span>
          <button class="cpf-close" @click="pickerToken = null"><i class="ri-close-line" /></button>
        </div>
        <RColorPicker
          :model-value="toHex(tokens[pickerToken] ?? '')"
          @update:model-value="(v: string) => { onInput(pickerToken!, v) }"
        />
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { INVITE_TOKEN_DEFS } from '~/composables/useThemePage'

definePageMeta({
  layout: 'navbar',
  middleware: ['auth'],
})

const themeStore = useThemeStore()
const toast = useToastStore()

// ── State ─────────────────────────────────────────────────────────────────────
const search      = ref('')
const selectedId  = ref<string | null>(null)
const tokens      = reactive<Record<string, string>>({})
const saving      = ref(false)

const showDrawer   = ref(false)
const editingTheme = ref<any>(null)
const drawerSaving = ref(false)
const form         = reactive({ name: '', description: '' })
const formErr      = reactive<Record<string, string>>({})

const deletingTheme = ref<any>(null)
const deleting      = ref(false)

const pickerToken = ref<string | null>(null)
const pickerPos   = reactive({ x: 0, y: 0 })
let   isDragging  = false
let   dragOffset  = { x: 0, y: 0 }

// ── Computed ──────────────────────────────────────────────────────────────────
const inviteThemes = computed(() =>
  themeStore.themes.filter((t: any) => t.type === 'INVITATION')
)

const filteredThemes = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return inviteThemes.value
  return inviteThemes.value.filter((t: any) =>
    t.name.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
  )
})

const selected = computed(() =>
  inviteThemes.value.find((t: any) => t.id === selectedId.value) ?? null
)

// ── Helpers ───────────────────────────────────────────────────────────────────
function swatchOf(theme: any, varName: string): string {
  const tok = theme.tokens?.find((t: any) => t.token === varName)
  return tok?.lightValue || (INVITE_TOKEN_DEFS.find(d => d.token === varName)?.lightValue ?? '#888')
}

function toHex(val: string): string {
  if (!val) return '#000000'
  if (val.startsWith('#')) return val
  return val
}

function selectTheme(theme: any) {
  selectedId.value = theme.id
  // Seed tokens from saved theme data
  INVITE_TOKEN_DEFS.forEach(def => {
    const saved = theme.tokens?.find((t: any) => t.token === def.token)
    tokens[def.token] = saved?.lightValue ?? def.lightValue
  })
}

function onInput(varName: string, value: string) {
  tokens[varName] = value
}

// ── Save colors ───────────────────────────────────────────────────────────────
async function saveColors() {
  if (!selectedId.value) return
  saving.value = true
  try {
    const payload = {
      tokens: INVITE_TOKEN_DEFS.map(def => ({
        token: def.token,
        lightValue: tokens[def.token] || def.lightValue,
        darkValue:  tokens[def.token] || def.lightValue,
        category:   'invitation',
        description: def.description,
        sortOrder:   0,
      })),
    }
    const result = await themeStore.updateTheme(selectedId.value, payload)
    if (result?.success === false) {
      toast.add(result.error || 'Failed to save', 'Error')
    } else {
      toast.add('Invite colors saved', 'Saved')
      await themeStore.fetchThemes()
    }
  } catch {
    toast.add('Failed to save colors', 'Error')
  } finally {
    saving.value = false
  }
}

// ── Create / Edit theme ───────────────────────────────────────────────────────
function openCreate() {
  editingTheme.value = null
  Object.assign(form, { name: '', description: '' })
  Object.keys(formErr).forEach(k => delete formErr[k])
  showDrawer.value = true
}

function openEdit(theme: any) {
  editingTheme.value = theme
  Object.assign(form, { name: theme.name, description: theme.description ?? '' })
  Object.keys(formErr).forEach(k => delete formErr[k])
  showDrawer.value = true
}

async function saveTheme() {
  Object.keys(formErr).forEach(k => delete formErr[k])
  if (!form.name.trim()) { formErr.name = 'Name is required.'; return }

  drawerSaving.value = true
  try {
    if (editingTheme.value) {
      const result = await themeStore.updateTheme(editingTheme.value.id, {
        name: form.name.trim(),
        description: form.description.trim() || null,
      })
      if (result?.success === false) { toast.add(result.error || 'Failed', 'Error'); return }
      toast.add('Theme updated', 'Saved')
    } else {
      const result = await themeStore.createTheme({
        name: form.name.trim(),
        description: form.description.trim() || null,
        type: 'INVITATION',
        isDefault: false,
      })
      if (result?.success === false) { toast.add(result.error || 'Failed', 'Error'); return }
      toast.add('Invite theme created', 'Created')
      if (result?.data?.id) selectedId.value = result.data.id
    }
    showDrawer.value = false
    await themeStore.fetchThemes()
    if (selectedId.value) {
      const fresh = themeStore.themes.find((t: any) => t.id === selectedId.value)
      if (fresh) selectTheme(fresh)
    }
  } finally {
    drawerSaving.value = false
  }
}

// ── Duplicate ─────────────────────────────────────────────────────────────────
async function duplicate(theme: any) {
  const result = await themeStore.duplicateTheme(theme.id)
  if (result?.success === false) { toast.add(result.error || 'Failed', 'Error'); return }
  toast.add('Theme duplicated', 'Done')
  await themeStore.fetchThemes()
  if (result?.data?.id) {
    const fresh = themeStore.themes.find((t: any) => t.id === result.data.id)
    if (fresh) selectTheme(fresh)
  }
}

// ── Delete ────────────────────────────────────────────────────────────────────
function askDelete(theme: any) { deletingTheme.value = theme }

async function doDelete() {
  if (!deletingTheme.value) return
  deleting.value = true
  try {
    const result = await themeStore.deleteTheme(deletingTheme.value.id)
    if (result?.success === false) { toast.add(result.error || 'Failed', 'Error'); return }
    toast.add('Theme deleted', 'Deleted')
    if (selectedId.value === deletingTheme.value.id) selectedId.value = null
    deletingTheme.value = null
    await themeStore.fetchThemes()
  } finally {
    deleting.value = false
  }
}

// ── Color picker ──────────────────────────────────────────────────────────────
function openPicker(e: MouseEvent, varName: string) {
  pickerToken.value = varName
  pickerPos.x = Math.min(e.clientX + 10, window.innerWidth - 280)
  pickerPos.y = Math.min(e.clientY + 10, window.innerHeight - 320)
}

function startDrag(e: MouseEvent) {
  isDragging = true
  dragOffset = { x: e.clientX - pickerPos.x, y: e.clientY - pickerPos.y }
  const onMove = (ev: MouseEvent) => {
    if (!isDragging) return
    pickerPos.x = ev.clientX - dragOffset.x
    pickerPos.y = ev.clientY - dragOffset.y
  }
  const onUp = () => { isDragging = false; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp) }
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}

const closePicker = (e: MouseEvent) => {
  if (pickerToken.value && !(e.target as HTMLElement).closest('.color-picker-float')) {
    pickerToken.value = null
  }
}

// ── Init ──────────────────────────────────────────────────────────────────────
onMounted(async () => {
  await themeStore.fetchThemes()
  // Auto-select first if any
  const first = inviteThemes.value[0]
  if (first) selectTheme(first)
  document.addEventListener('click', closePicker)
})

onUnmounted(() => {
  document.removeEventListener('click', closePicker)
})
</script>

<style lang="scss" scoped>
.inv-themes-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 24px);
  overflow: hidden;
}

.themes-layout {
  display: flex;
  gap: 0;
  flex: 1;
  overflow: hidden;
  border: 1px solid var(--c-border);
  border-radius: var(--r-lg);
  background: var(--c-surface);
  margin-top: 12px;
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
.themes-sidebar {
  width: 280px;
  min-width: 280px;
  border-right: 1px solid var(--c-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--c-bg);
}

.sidebar-search {
  padding: 12px;
  border-bottom: 1px solid var(--c-border);

  .search-input {
    width: 100%;
    background: var(--c-surface);
    border: 1px solid var(--c-border);
    border-radius: var(--r-md);
    padding: 6px 10px;
    font-size: 0.8125rem;
    color: var(--c-text);
    outline: none;
    &:focus { border-color: var(--c-accent); }
  }
}

.sidebar-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sidebar-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px 16px;
  color: var(--c-muted);
  font-size: 0.8125rem;
  text-align: center;
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid var(--c-border);
}

.theme-card {
  border: 1px solid var(--c-border);
  border-radius: var(--r-md);
  padding: 10px 12px;
  cursor: pointer;
  transition: border-color var(--t-fast), background var(--t-fast);
  background: var(--c-surface);

  &:hover { border-color: var(--c-accent); }
  &.active { border-color: var(--c-accent); background: rgba(255,140,66,0.06); }
}

.inv-swatches {
  display: flex;
  gap: 5px;
  margin-bottom: 8px;
}

.inv-swatch {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.15);
  flex-shrink: 0;

  &.inv-swatch-bg {
    border-style: dashed;
  }
}

.theme-card-header {
  display: flex;
  align-items: center;
  gap: 6px;
}

.theme-card-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--c-text);
}

.theme-card-desc {
  font-size: 0.75rem;
  color: var(--c-muted);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.theme-card-actions {
  display: flex;
  gap: 4px;
  margin-top: 8px;
}

.btn-xs {
  padding: 3px 8px;
  border-radius: var(--r-sm);
  font-size: 0.72rem;
  border: 1px solid var(--c-border);
  background: var(--c-surface);
  color: var(--c-text);
  cursor: pointer;
  &:hover { border-color: var(--c-accent); color: var(--c-accent); }
}

.btn-danger-xs {
  &:hover { border-color: var(--c-danger); color: var(--c-danger); }
}

// ── Editor panel ──────────────────────────────────────────────────────────────
.editor-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--c-muted);
  font-size: 0.875rem;
  padding: 40px;
  text-align: center;
}

.editor-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 12px;
  border-bottom: 1px solid var(--c-border);
}

.editor-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--c-text);
  margin: 0;
}

.editor-subtitle {
  font-size: 0.8rem;
  color: var(--c-muted);
  margin: 2px 0 0;
}

// ── Invite preview strip ──────────────────────────────────────────────────────
.inv-preview-strip {
  margin: 16px 20px 0;
  border-radius: var(--r-lg);
  border: 1px solid;
  padding: 20px 24px;
  text-align: center;
  transition: background 0.3s, border-color 0.3s;
}

.inv-preview-header {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 8px;
  transition: color 0.3s;
}

.inv-preview-body {
  font-size: 0.875rem;
  margin: 0 0 16px;
  transition: color 0.3s;
}

.inv-preview-btn {
  display: inline-block;
  padding: 8px 24px;
  border-radius: var(--r-full);
  border: none;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  cursor: default;
  transition: background 0.3s, color 0.3s;
}

// ── Token editor ──────────────────────────────────────────────────────────────
.token-editor {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}

.token-editor-header {
  display: grid;
  grid-template-columns: 1fr 180px;
  gap: 12px;
  padding: 0 0 8px;
  border-bottom: 1px solid var(--c-border);
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--c-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.token-col-label { }
.token-col-color { }

.token-row {
  display: grid;
  grid-template-columns: 1fr 180px;
  gap: 12px;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--c-border);
  &:last-child { border-bottom: none; }
}

.token-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.token-name {
  font-family: var(--font-mono, monospace);
  font-size: 0.78rem;
  color: var(--c-accent);
  background: rgba(255,140,66,0.08);
  border-radius: 4px;
  padding: 1px 6px;
  width: fit-content;
}

.token-desc {
  font-size: 0.75rem;
  color: var(--c-muted);
}

.token-color-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-swatch {
  width: 32px;
  height: 32px;
  border-radius: var(--r-sm);
  border: 2px solid var(--c-border);
  cursor: pointer;
  flex-shrink: 0;
  transition: transform var(--t-fast);
  &:hover { transform: scale(1.1); border-color: var(--c-accent); }
}

.hex-input {
  flex: 1;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-md);
  padding: 6px 10px;
  font-size: 0.8rem;
  color: var(--c-text);
  outline: none;
  font-family: var(--font-mono, monospace);
  &:focus { border-color: var(--c-accent); }
}

.save-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--c-border);
}

// ── Floating color picker ──────────────────────────────────────────────────────
.color-picker-float {
  position: fixed;
  z-index: 9999;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-lg);
  box-shadow: var(--glass-shadow);
  overflow: hidden;
  min-width: 220px;
}

.cpf-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid var(--c-border);
  cursor: move;
  background: var(--c-bg);
}

.cpf-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--c-muted);
  font-family: var(--font-mono, monospace);
}

.cpf-close {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--c-muted);
  display: flex;
  align-items: center;
  padding: 2px;
  border-radius: 4px;
  &:hover { color: var(--c-text); }
}

// ── Modal ─────────────────────────────────────────────────────────────────────
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.55);
  z-index: 9000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.inv-modal {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-lg);
  width: 380px;
  overflow: hidden;
}

.inv-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--c-border);
  font-weight: 600;
  font-size: 0.9rem;
}

.inv-modal-body {
  padding: 16px;
  font-size: 0.875rem;
  color: var(--c-text);
}

.inv-modal-footer {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding: 12px 16px;
  border-top: 1px solid var(--c-border);
}

.btn-danger {
  background: var(--c-danger);
  color: #fff;
  border: none;
  border-radius: var(--r-sm);
  padding: 8px 16px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  &:disabled { opacity: 0.5; }
  &:hover:not(:disabled) { filter: brightness(1.1); }
}

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>
