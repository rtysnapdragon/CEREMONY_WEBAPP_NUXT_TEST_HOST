<template>
  <RWrapperPage>
    <RPageHeader :title="tr('invitation_templates')" :subtitle="`${templates.length} templates`" />

      <RTable
        :columns="columns"
        :data="templates"
        :options="{ searchable: true, paging: true }"
        @reloadByFixedData="fetchTemplates()"
      >
        <template #headerRight>
          <RBtn type="add" :label="tr('new_template')" @click="openCreate" />
        </template>
        <template #name="{ rowData }">
          <div>
            <div class="tpl-name">{{ rowData.name }}</div>
            <div class="tpl-key">{{ rowData.templateKey }}</div>
          </div>
        </template>

        <template #active="{ rowData }">
          <span class="badge" :class="rowData.active ? 'badge-success' : 'badge-muted'">
            {{ rowData.active ? 'Active' : 'Inactive' }}
          </span>
        </template>

        <template #orgs="{ rowData }">
          <div class="tpl-org-chips">
            <template v-if="rowData.assignedOrgCount > 0">
              <!-- Show cached orgs if available, otherwise just the count -->
              <template v-if="rowData.orgs && rowData.orgs.length">
                <span v-for="org in rowData.orgs.slice(0, 3)" :key="org.id" class="tpl-org-chip">{{ org.name }}</span>
                <span v-if="rowData.orgs.length > 3" class="tpl-org-chip tpl-org-more">+{{ rowData.orgs.length - 3 }}</span>
              </template>
              <span v-else class="tpl-org-chip">{{ rowData.assignedOrgCount }} org{{ rowData.assignedOrgCount !== 1 ? 's' : '' }}</span>
            </template>
            <span v-else class="tpl-no-orgs">—</span>
          </div>
        </template>

        <template #createdAt="{ rowData }">
          <span class="sub-text">{{ formatDate(rowData.createdAt) }}</span>
        </template>

        <template #actions="{ rowData }">
          <RTblBtns :items="[
            { type: 'add' ,icon:'ri-building-2-line'},
            { type: 'edit' ,icon:'ri-edit-line'},
            { type: 'delete' ,icon:'ri-delete-bin-line'},
          ]" @action-click="(type) => type=='add'? openAssignOrgs(rowData) : type=='edit' ? openEdit(rowData) : confirmDelete(rowData)" />
        </template>
      </RTable>

    <!-- Create / Edit Drawer -->
    <RDrawer
      v-model:open="showModal"
      :title="editing ? 'Edit Template' : 'New Template'"
      icon="ri-mail-settings-line"
      width-desktop="500px"
      width-tablet="92vw"
      @close="closeModal"
    >
        <form id="tpl-form" class="drawer-form" novalidate @submit.prevent="save">
          <div class="form-group">
            <label class="input-label">Name <span class="required-star">*</span></label>
            <RInput v-model="form.name" placeholder="Classic Wedding" :error="!!errors.name" @on-input="clearError('name')" />
            <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
          </div>
          <div class="form-group">
            <label class="input-label">Template Key <span class="required-star">*</span></label>
            <RInput v-model="form.templateKey" placeholder="classic" leading-icon="ri-key-line" :error="!!errors.templateKey" @on-input="clearError('templateKey')" />
            <span v-if="errors.templateKey" class="field-error">{{ errors.templateKey }}</span>
          </div>
          <div class="form-group">
            <label class="input-label">Description</label>
            <RInput v-model="form.description" type="textarea" :rows="3" placeholder="Template description…" />
          </div>
          <div class="form-group">
            <label class="input-label">Thumbnail URL</label>
            <RInput v-model="form.thumbnail" placeholder="https://…" leading-icon="ri-image-line" />
          </div>

          <!-- Theme Picker -->
          <div class="tpl-section-title"><i class="ri-palette-line" /> Color Theme</div>
          <div class="form-group">
            <label class="input-label">INVITATION Theme</label>
            <div v-if="invThemesLoading" class="sub-text" style="padding:8px 0">Loading themes…</div>
            <select v-else v-model="form.themeId" class="input">
              <option value="">— No theme (use template defaults) —</option>
              <option v-for="t in invThemes" :key="t.id" :value="t.id">{{ t.name }} ({{ t.code }})</option>
            </select>
            <!-- Preview swatches for selected theme -->
            <div v-if="selectedInvTheme" class="tpl-theme-preview">
              <div
                v-for="(vals, token) in previewSwatches(selectedInvTheme)"
                :key="token"
                class="tpl-swatch-item"
                :title="`${token}: light=${vals.light} dark=${vals.dark}`"
              >
                <div class="tpl-swatch-dot" :style="{ background: vals.light }" />
              </div>
            </div>
            <p class="sub-text" style="margin-top:4px">
              Create INVITATION-type themes in <strong>Admin → Themes</strong>.
            </p>
          </div>

          <div class="form-group" style="margin-top:var(--sp-2)">
            <label class="input-label" style="display:flex;align-items:center;gap:8px">
              Active
              <RSwitch v-model="form.active" />
            </label>
          </div>
        </form>
      <template #footer>
        <div class="drawer-footer-btns">
          <button type="button" class="btn-ghost" @click="closeModal">Cancel</button>
          <button type="submit" form="tpl-form" class="btn-primary" :disabled="saving">
            <i v-if="saving" class="ri-loader-4-line animate-spin" />
            {{ editing ? 'Update' : 'Create' }}
          </button>
        </div>
      </template>
    </RDrawer>

    <!-- Assign Orgs Drawer -->
    <RDrawer
      v-model:open="showAssignOrgs"
      title="Assign to Organizations"
      icon="ri-building-2-line"
      width-desktop="520px"
      width-tablet="92vw"
      @close="showAssignOrgs = false"
    >
      <template v-if="assignTarget">
        <div class="tpl-assign-header">
          <div class="tpl-assign-name">{{ assignTarget.name }}</div>
          <div class="tpl-assign-key sub-text">{{ assignTarget.templateKey }}</div>
        </div>
        <div class="tpl-search" style="margin-bottom:var(--sp-3)">
          <i class="ri-search-line" />
          <input v-model="orgSearch" class="input" placeholder="Search organizations…" />
        </div>
        <div v-if="orgsLoading" class="state-center">
          <i class="ri-loader-4-line animate-spin" style="font-size:1.5rem;color:var(--c-accent)" />
        </div>
        <div v-else class="tpl-org-list">
          <div
            v-for="org in filteredOrgs"
            :key="org.id"
            class="tpl-org-row"
            :class="{ assigned: isOrgAssigned(org.id) }"
            @click="toggleOrg(org)"
          >
            <div class="tpl-org-info">
              <div class="tpl-org-avatar">
                <i class="ri-building-2-line" />
              </div>
              <div>
                <div class="tpl-org-name">{{ org.name }}</div>
                <div class="sub-text">{{ org.subscriptionPlan || 'FREE' }}</div>
              </div>
            </div>
            <div class="tpl-org-check" :class="{ active: isOrgAssigned(org.id) }">
              <i v-if="orgToggling === org.id" class="ri-loader-4-line animate-spin" />
              <i v-else-if="isOrgAssigned(org.id)" class="ri-check-line" />
            </div>
          </div>
          <div v-if="filteredOrgs.length === 0" class="state-center sub-text" style="padding:var(--sp-6)">
            No organizations found
          </div>
        </div>
      </template>
      <template #footer>
        <button class="btn-ghost" @click="showAssignOrgs = false">Close</button>
      </template>
    </RDrawer>

    <!-- Delete confirm -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="deletingItem" class="modal-backdrop" @click.self="deletingItem = null">
          <div class="modal-box">
            <div class="modal-icon danger"><i class="ri-delete-bin-line" /></div>
            <h3 class="modal-title">Delete Template</h3>
            <p class="modal-desc">Delete <strong>{{ deletingItem.name }}</strong>? This cannot be undone.</p>
            <div class="modal-footer">
              <button class="btn-ghost" @click="deletingItem = null">Cancel</button>
              <button class="btn-primary" style="background:var(--c-danger)" :disabled="deleting" @click="doDelete">
                <i v-if="deleting" class="ri-loader-4-line animate-spin" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </RWrapperPage>
</template>

<script setup>
definePageMeta({ layout: 'navbar', middleware: ['auth'], permission: 'hasRole(SUPER_ADMIN)' })
const toast = useToastStore()
const { tr } = useTr()

// ── INVITATION themes ──────────────────────────────────────────────────────────
const invThemes = ref([])
const invThemesLoading = ref(false)

const fetchInvThemes = async () => {
  invThemesLoading.value = true
  try {
    const { data } = await useHttp('/api/v1/themes/invitation', { method: 'GET', isGlobal: true })
    invThemes.value = data.value?.data ?? data.value ?? []
  } catch (e) {
    console.error('fetchInvThemes error', e)
  } finally {
    invThemesLoading.value = false
  }
}

const selectedInvTheme = computed(() => invThemes.value.find(t => t.id === form.themeId) ?? null)

const previewSwatches = (theme) => {
  if (!theme?.tokens) return {}
  return Object.fromEntries(Object.entries(theme.tokens).slice(0, 8))
}

// ── Table columns ──────────────────────────────────────────────────────────────
const columns = [
  { key: 'name',      label: 'Template',   sortable: true },
  { key: 'active',    label: 'Status',     width: '90px' },
  { key: 'orgs',      label: 'Assigned Orgs', width: '220px' },
  { key: 'createdAt', label: 'Created',    width: '120px' },
  { key: 'actions',   label: '',           width: '110px', align: 'center' },
]

// ── State ──────────────────────────────────────────────────────────────────────
const loading = ref(false)
const templates = ref([])
const search = ref('')

// ── Fetch templates ────────────────────────────────────────────────────────────
onMounted(async () => {
  await nextTick()
  await Promise.all([fetchTemplates(), fetchInvThemes()])
})

const fetchTemplates = async () => {
  loading.value = true
  try {
    const { data, error } = await useHttp('/api/v1/admin/invitation-templates?page=0&size=200', {
      method: 'GET', isGlobal: true,
    })
    if (error?.value) { toast.add('Failed to load templates', 'Error'); return }
    const raw = data.value?.data ?? data.value ?? []
    const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.content) ? raw.content : [])
    templates.value = list.map(item => ({ ...item, orgs: item.assignedOrgs ?? [] }))
  } catch (err) {
    console.error('fetchTemplates error', err)
    toast.add('Failed to load templates', 'Error')
  } finally {
    loading.value = false
  }
}

const onSearch = () => {
  // Client-side filter via computed not needed since RTable handles it, but we can
  // filter manually if needed. Currently templates array is passed directly.
}

// ── Create / Edit drawer ───────────────────────────────────────────────────────
const showModal = ref(false)
const editing = ref(null)
const saving = ref(false)
const errors = reactive({})

const defaultForm = () => ({
  name: '', templateKey: '', description: '', thumbnail: '', active: false,
  themeId: '',
})
const form = reactive(defaultForm())

const clearError = (f) => { delete errors[f] }

const validate = () => {
  Object.keys(errors).forEach(k => delete errors[k])
  if (!form.name?.trim()) errors.name = 'Name is required.'
  if (!form.templateKey?.trim()) errors.templateKey = 'Template key is required.'
  return Object.keys(errors).length === 0
}

const openCreate = () => {
  editing.value = null
  Object.assign(form, defaultForm())
  showModal.value = true
}

const openEdit = (tpl) => {
  editing.value = tpl
  Object.assign(form, {
    name: tpl.name,
    templateKey: tpl.templateKey,
    description: tpl.description || '',
    thumbnail: tpl.thumbnailUrl || '',
    active: tpl.active ?? true,
    themeId: tpl.themeId || '',
  })
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editing.value = null
  Object.keys(errors).forEach(k => delete errors[k])
}

const save = async () => {
  if (!validate()) return
  saving.value = true
  try {
    const payload = {
      name: form.name, templateKey: form.templateKey,
      description: form.description, thumbnailUrl: form.thumbnail,
      isActive: form.active,
      themeId: form.themeId || null,
    }
    if (editing.value) {
      const { data, error } = await useHttp(`/api/v1/admin/invitation-templates/${editing.value.id}`, {
        method: 'PUT', body: payload, isGlobal: true,
      })
      if (error?.value) throw new Error(error.value?.message || 'Failed')
      const updated = data.value?.data ?? data.value
      const idx = templates.value.findIndex(t => t.id === editing.value.id)
      if (idx !== -1) templates.value.splice(idx, 1, { ...templates.value[idx], ...updated })
      toast.add('Template updated', 'Success')
    } else {
      const { data, error } = await useHttp('/api/v1/admin/invitation-templates', {
        method: 'POST', body: payload, isGlobal: true,
      })
      if (error?.value) throw new Error(error.value?.message || 'Failed')
      const created = data.value?.data ?? data.value
      templates.value.unshift({ ...created, orgs: [] })
      toast.add('Template created', 'Success')
    }
    closeModal()
  } catch (err) {
    toast.add(err.message || 'Failed to save', 'Error')
  } finally {
    saving.value = false
  }
}

// ── Delete ─────────────────────────────────────────────────────────────────────
const deletingItem = ref(null)
const deleting = ref(false)

const confirmDelete = (tpl) => { deletingItem.value = tpl }

const doDelete = async () => {
  deleting.value = true
  try {
    const { error } = await useHttp(`/api/v1/admin/invitation-templates/${deletingItem.value.id}`, {
      method: 'DELETE', isGlobal: true,
    })
    if (error?.value) throw new Error(error.value?.message || 'Failed')
    const idx = templates.value.findIndex(t => t.id === deletingItem.value.id)
    if (idx !== -1) templates.value.splice(idx, 1)
    toast.add('Template deleted', 'Deleted')
    deletingItem.value = null
  } catch (err) {
    toast.add(err.message || 'Failed to delete', 'Error')
  } finally {
    deleting.value = false
  }
}

// ── Assign Orgs drawer ─────────────────────────────────────────────────────────
const showAssignOrgs = ref(false)
const assignTarget = ref(null)
const allOrgs = ref([])
const orgsLoading = ref(false)
const orgSearch = ref('')
const orgToggling = ref(null)

// Reactive Set for fast lookup
const assignedOrgIds = computed(() => new Set((assignTarget.value?.orgs ?? []).map(o => o.id)))
const isOrgAssigned = (orgId) => assignedOrgIds.value.has(orgId)

const filteredOrgs = computed(() => {
  const q = orgSearch.value.toLowerCase()
  return q ? allOrgs.value.filter(o => o.name?.toLowerCase().includes(q)) : allOrgs.value
})

const openAssignOrgs = async (tpl) => {
  assignTarget.value = { ...tpl, orgs: [] }
  orgSearch.value = ''
  showAssignOrgs.value = true
  orgsLoading.value = true
  try {
    // Load all orgs + this template's assigned orgs in parallel
    const [orgsResult, assignedResult] = await Promise.all([
      allOrgs.value.length
        ? Promise.resolve(null)
        : useHttp('/api/v1/organizations/list', {
            method: 'POST', isGlobal: true,
            body: { page: 1, pageSize: 500, search: '', sort: { field: 'name', direction: 'ASC' } },
          }),
      useHttp(`/api/v1/admin/invitation-templates/${tpl.id}/orgs`, {
        method: 'GET', isGlobal: true,
      }),
    ])

    if (orgsResult && !orgsResult.error?.value) {
      const payload = orgsResult.data.value?.data ?? orgsResult.data.value
      const content = Array.isArray(payload?.content) ? payload.content
        : Array.isArray(payload) ? payload : []
      allOrgs.value = content
    }

    if (!assignedResult.error?.value) {
      const payload = assignedResult.data.value?.data ?? assignedResult.data.value
      const list = Array.isArray(payload) ? payload : []
      // OrganizationTemplateResponse uses orgId/orgName — normalize to { id, name }
      assignTarget.value = {
        ...assignTarget.value,
        orgs: list.map(o => ({ id: o.orgId ?? o.id, name: o.orgName ?? o.name })),
      }
    }
  } catch (e) {
    console.error('openAssignOrgs error', e)
  } finally {
    orgsLoading.value = false
  }
}

const toggleOrg = async (org) => {
  if (orgToggling.value) return
  orgToggling.value = org.id
  try {
    if (isOrgAssigned(org.id)) {
      await useHttp(`/api/v1/admin/invitation-templates/${assignTarget.value.id}/revoke/${org.id}`, {
        method: 'DELETE', isGlobal: true,
      })
      assignTarget.value = {
        ...assignTarget.value,
        orgs: assignTarget.value.orgs.filter(o => o.id !== org.id),
      }
      toast.add(`Revoked from ${org.name}`, 'Orgs')
    } else {
      await useHttp(`/api/v1/admin/invitation-templates/${assignTarget.value.id}/assign/${org.id}`, {
        method: 'POST', isGlobal: true,
      })
      assignTarget.value = {
        ...assignTarget.value,
        orgs: [...assignTarget.value.orgs, { id: org.id, name: org.name }],
      }
      toast.add(`Assigned to ${org.name}`, 'Orgs')
    }
    // Sync table row count + cached orgs
    const idx = templates.value.findIndex(t => t.id === assignTarget.value.id)
    if (idx !== -1) templates.value.splice(idx, 1, {
      ...templates.value[idx],
      orgs: [...assignTarget.value.orgs],
      assignedOrgCount: assignTarget.value.orgs.length,
    })
  } catch (err) {
    toast.add(err.message || 'Failed', 'Error')
  } finally {
    orgToggling.value = null
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const formatDate = (dt) => {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<style lang="scss">
.tpl-search {
  position: relative; min-width: 220px;
  i { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--c-muted); pointer-events: none; }
  .input { padding-left: 32px; width: 100%; }
}

.tpl-row-actions { display: flex; gap: var(--sp-1); justify-content: center; }
.btn-icon-sm {
  width: 30px; height: 30px; border-radius: var(--r-md);
  border: 1px solid var(--c-border); background: transparent; cursor: pointer;
  display: flex; align-items: center; justify-content: center; color: var(--c-muted);
  transition: all .15s;
  &:hover { color: var(--c-accent); border-color: var(--c-accent); }
  &.danger:hover { color: var(--c-danger); border-color: var(--c-danger); }
}

.tpl-name { font-weight: 600; font-size: 0.875rem; color: var(--c-text); }
.tpl-key  { font-size: 0.7rem; color: var(--c-muted); font-family: monospace; }

/* Org chips in table */
.tpl-org-chips { display: flex; flex-wrap: wrap; gap: 4px; }
.tpl-org-chip {
  display: inline-flex; align-items: center; padding: 2px 8px;
  border-radius: var(--r-full); font-size: 0.7rem; font-weight: 600;
  background: rgba(96,165,250,0.1); color: #60a5fa;
  border: 1px solid rgba(96,165,250,0.2);
  &.tpl-org-more { background: rgba(100,116,139,0.1); color: #64748b; border-color: transparent; }
}
.tpl-no-orgs { font-size: 0.8rem; color: var(--c-muted); }

/* Assign orgs drawer */
.tpl-assign-header {
  padding: var(--sp-3) 0 var(--sp-4);
  border-bottom: 1px solid var(--c-border);
  margin-bottom: var(--sp-4);
}
.tpl-assign-name { font-size: 1rem; font-weight: 700; color: var(--c-text); }
.tpl-assign-key  { margin-top: 2px; }

.tpl-org-list { display: flex; flex-direction: column; gap: var(--sp-2); }
.tpl-org-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: var(--sp-3) var(--sp-4); border-radius: var(--r-lg);
  border: 1px solid var(--c-border); cursor: pointer;
  background: var(--c-surface); transition: all .15s;
  &:hover  { border-color: var(--c-accent); background: rgba(255,140,66,0.04); }
  &.assigned { border-color: var(--c-accent); background: rgba(255,140,66,0.07); }
}
.tpl-org-info { display: flex; align-items: center; gap: var(--sp-3); }
.tpl-org-avatar {
  width: 32px; height: 32px; border-radius: var(--r-md); flex-shrink: 0;
  background: rgba(255,140,66,0.1); color: var(--c-accent);
  display: flex; align-items: center; justify-content: center;
  i { font-size: 0.875rem; }
}
.tpl-org-name { font-size: 0.875rem; font-weight: 600; color: var(--c-text); }
.tpl-org-check {
  width: 22px; height: 22px; border-radius: var(--r-full); flex-shrink: 0;
  border: 2px solid var(--c-border);
  display: flex; align-items: center; justify-content: center;
  color: var(--c-muted); transition: all .15s;
  &.active { background: var(--c-accent); border-color: var(--c-accent); color: #fff; }
  i { font-size: 0.8rem; }
}

.state-center { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: var(--sp-8); }

/* Colors & fonts form */
.tpl-section-title {
  display: flex; align-items: center; gap: var(--sp-2);
  font-size: 0.8125rem; font-weight: 700; color: var(--c-accent);
  margin: var(--sp-4) 0 var(--sp-3); letter-spacing: 0.04em; text-transform: uppercase;
  i { font-size: 1rem; }
}
.tpl-color-grid { display: flex; flex-direction: column; gap: var(--sp-2); }
.tpl-color-row { display: flex; align-items: center; gap: var(--sp-3); }
.tpl-color-label { width: 90px; flex-shrink: 0; font-size: 0.8rem; color: var(--c-muted); }
.tpl-color-input-wrap { display: flex; align-items: center; gap: var(--sp-2); flex: 1; }
.tpl-color-swatch {
  width: 36px; height: 36px; padding: 2px; border-radius: var(--r-md);
  border: 1px solid var(--c-border); background: transparent; cursor: pointer; flex-shrink: 0;
}
.tpl-font-grid { display: flex; flex-direction: column; gap: 0; }

/* Delete confirm modal */
.modal-backdrop {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,.55); display: flex; align-items: center; justify-content: center;
}
.modal-box {
  background: var(--c-surface); border: 1px solid var(--c-border);
  border-radius: var(--r-xl); padding: var(--sp-6); max-width: 400px; width: 90%;
  display: flex; flex-direction: column; align-items: center; gap: var(--sp-3);
}
.modal-icon { width: 52px; height: 52px; border-radius: var(--r-full); display: flex; align-items: center; justify-content: center; font-size: 1.5rem;
  &.danger { background: rgba(248,113,113,.12); color: var(--c-danger); }
}
.modal-title { font-size: 1.1rem; font-weight: 800; color: var(--c-text); }
.modal-desc  { font-size: 0.875rem; color: var(--c-muted); text-align: center; }
.modal-footer { display: flex; gap: var(--sp-2); width: 100%; }
.modal-footer button { flex: 1; }
.modal-enter-active, .modal-leave-active { transition: opacity .2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

.tpl-theme-preview {
  display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px;
}
.tpl-swatch-item { display: flex; align-items: center; }
.tpl-swatch-dot {
  width: 20px; height: 20px; border-radius: 50%;
  border: 1px solid var(--c-border); flex-shrink: 0;
}
</style>
