<template>
  <RWrapperPage class="orgs-page">
    <RPageHeader title="Organizations" subtitle="Manage organizations and assign subscription plans" />
    <!-- Table -->
    <RTable
      :key="`orgs-${filteredRows.length > 0 ? 'loaded' : 'empty'}`"
      :columns="columns"
      :data="filteredRows"
      :loading="loading"
      :options="{ searchable: true, paging: true }"
      @reloadByFixedData="fetchOrgs()"
    >
      <template #headerApplyFilter>
        <RTblChip v-model="chipFilter" @onRemove="onRemoveChip" />
      </template>
      <template #headerLeft>
        <RTblFilter @on-click="onSaveFilter" :width="'w-[350px]'">
          <RForm
            ref="formFilter"
            class="class-ft-form grid gap-3.5 w-[350px]"
            :state="dataFilter"
          >
            <RFormGroup name="GuestStatus" :label="$t('employee_type')">
              <RSelect v-model="filterStatus"
                :localData="{ data: [ { id: 1, Name: 'all_status', NameEnglish:'all_status'}, { id: 2, Name: 'active', NameEnglish:'active'}, { id: 3, Name: 'inactive', NameEnglish:'inactive'}, { id: 4, Name: 'suspended', NameEnglish:'suspended'}]}"
              ></RSelect>
            </RFormGroup>
          </RForm>
        </RTblFilter>
      </template>

      <template #name="{ rowData }">
        <div class="org-cell">
          <div class="org-avatar">
            <img v-if="rowData.logo" :src="rowData.logo" class="org-logo" />
            <i v-else class="ri-building-2-line" />
          </div>
          <div>
            <div class="org-name">{{ rowData.name }}</div>
            <div class="org-id">{{ rowData.id }}</div>
          </div>
        </div>
      </template>
      <template #subscriptionPlan="{ rowData }">
        <span class="plan-badge" :class="planClass(rowData.subscriptionPlan)">
          {{ rowData.subscriptionPlan || 'FREE' }}
        </span>
      </template>
      <template #status="{ rowData }">
        <RStatus :text="rowData.status" :color="rowData.status === 'ACTIVE' ? 'nenoBlue' : 'red'" variant="outline" />
      </template>
      <template #createdAt="{ rowData }">{{ formatDate(rowData.createdAt) }}</template>
      <template #eventTypes="{ rowData }">
        <div v-if="rowData.eventTypes?.length" class="org-et-chips">
          <span v-for="et in rowData.eventTypes.slice(0, 3)" :key="et.eventTypeId || et.id" class="org-et-chip">
            <i :class="et.eventTypeIcon || et.icon || 'ri-calendar-line'" />
            {{ et.eventTypeName || et.name || et.eventTypeCode }}
          </span>
          <span v-if="rowData.eventTypes.length > 3" class="org-et-chip org-et-more">
            +{{ rowData.eventTypes.length - 3 }}
          </span>
        </div>
        <span v-else class="org-et-all">All types</span>
      </template>

      <template #actions="{ rowData }">
        <div class="orgs-actions" @click.stop>
          <button class="btn-icon-sm" title="View Detail" @click="openDetail(rowData)">
            <i class="ri-eye-line" />
          </button>
          <button class="btn-icon-sm" title="Edit" @click="openEdit(rowData)">
            <i class="ri-edit-line" />
          </button>
          <button class="btn-icon-sm btn-icon-sm--danger" title="Delete" @click="confirmDelete(rowData)">
            <i class="ri-delete-bin-line" />
          </button>
        </div>
      </template>
    </RTable>

    <!-- Detail Drawer -->
    <RSlider v-model="showDetail" icon="ri-building-2-line" title="Organization Detail" description="View and edit organization information">
      <template v-if="detailOrg">
        <div class="org-detail-header">
          <div class="org-avatar-lg">
            <img v-if="detailOrg.logo" :src="detailOrg.logo" class="org-logo" />
            <i v-else class="ri-building-2-line" />
          </div>
          <div>
            <h3 class="org-detail-name">{{ detailOrg.name }}</h3>
            <span class="plan-badge" :class="planClass(detailOrg.subscriptionPlan)">
              {{ detailOrg.subscriptionPlan || 'FREE' }}
            </span>
            <span class="um-status-badge" :class="detailOrg.status === 'ACTIVE' ? 'active' : 'inactive'" style="margin-left:6px">
              {{ detailOrg.status }}
            </span>
          </div>
        </div>

        <div class="org-info-grid">
          <div class="org-info-item">
            <span class="org-info-label"><i class="ri-fingerprint-line" /> ID</span>
            <span class="org-info-value mono">{{ detailOrg.id }}</span>
          </div>
          <div class="org-info-item">
            <span class="org-info-label"><i class="ri-mail-line" /> Email</span>
            <span class="org-info-value">{{ detailOrg.email || '—' }}</span>
          </div>
          <div class="org-info-item">
            <span class="org-info-label"><i class="ri-phone-line" /> Phone</span>
            <span class="org-info-value">{{ detailOrg.phone || '—' }}</span>
          </div>
          <div class="org-info-item">
            <span class="org-info-label"><i class="ri-map-pin-line" /> Address</span>
            <span class="org-info-value">{{ detailOrg.address || '—' }}</span>
          </div>
          <div class="org-info-item">
            <span class="org-info-label"><i class="ri-heart-line" /> Weddings</span>
            <span class="org-info-value">{{ detailOrg.weddingCount ?? '—' }}</span>
          </div>
          <div class="org-info-item">
            <span class="org-info-label"><i class="ri-calendar-line" /> Created</span>
            <span class="org-info-value">{{ formatDate(detailOrg.createdAt) }}</span>
          </div>
          <div v-if="detailOrg.subscriptionExpiredAt" class="org-info-item">
            <span class="org-info-label"><i class="ri-time-line" /> Plan Expires</span>
            <span class="org-info-value">{{ formatDate(detailOrg.subscriptionExpiredAt) }}</span>
          </div>
        </div>

        <div class="org-detail-actions">
          <button class="btn-ghost" style="flex:1" @click="openAssignFromDetail">
            <i class="ri-vip-crown-line" /> Change Plan
          </button>
          <button class="btn-ghost" style="flex:1" @click="openEventTypesFromDetail">
            <i class="ri-calendar-event-line" /> Event Types
          </button>
        </div>
      </template>
      <template #footer>
        <button class="btn-ghost" @click="showDetail = false">Close</button>
      </template>
    </RSlider>

    <!-- Event Types Drawer -->
    <RSlider v-model="showEventTypes" icon="ri-calendar-event-line" title="Event Types" description="Assign allowed event types for this organization">
      <template v-if="etOrg">
        <div class="arm-user-chip" style="margin-bottom:var(--sp-4)">
          <div class="org-avatar">
            <img v-if="etOrg.logo" :src="etOrg.logo" class="org-logo" />
            <i v-else class="ri-building-2-line" />
          </div>
          <div class="arm-chip-info">
            <span class="arm-chip-name">{{ etOrg.name }}</span>
            <span class="arm-chip-email">
              {{ etAssigned.length ? `${etAssigned.length} type(s) assigned` : 'All types allowed (no restriction)' }}
            </span>
          </div>
        </div>

        <div v-if="etLoading" class="arm-loading">
          <i class="ri-loader-4-line animate-spin" style="font-size:2rem;color:var(--c-accent)" />
        </div>
        <div v-else>
          <p class="et-hint">
            <i class="ri-information-line" />
            When no types are assigned, the org can create events of <strong>any</strong> type. Assign specific types to restrict access.
          </p>
          <div class="et-type-list">
            <div
              v-for="et in eventTypeStore.types"
              :key="et.id"
              class="et-type-row"
              :class="{ assigned: isEtAssigned(et.id) }"
              @click="toggleEt(et)"
            >
              <div class="et-type-info">
                <div class="et-type-icon">
                  <i :class="et.icon || 'ri-calendar-line'" />
                </div>
                <div>
                  <div class="et-type-name">{{ et.name }}</div>
                  <div class="et-type-code">{{ et.code }}</div>
                </div>
              </div>
              <div class="et-type-check" :class="{ active: isEtAssigned(et.id) }">
                <i v-if="etSaving === et.id" class="ri-loader-4-line animate-spin" />
                <i v-else-if="isEtAssigned(et.id)" class="ri-check-line" />
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <button class="btn-ghost" @click="showEventTypes = false">Close</button>
      </template>
    </RSlider>

    <!-- Edit Drawer -->
    <RSlider v-model="showEdit" title="Edit Organization" icon="ri-edit-line" description="Update organization information">
      <template v-if="editingOrg">
        <div class="org-form">
          <div class="form-group">
            <label class="input-label">Name <span class="required-star">*</span></label>
            <input v-model="editForm.name" class="input" :class="{ 'input-error': editErrors.name }" @input="delete editErrors.name" placeholder="Organization name" />
            <span v-if="editErrors.name" class="field-error">{{ editErrors.name }}</span>
          </div>
          <div class="form-group">
            <label class="input-label">Email</label>
            <input v-model="editForm.email" class="input" type="email" placeholder="contact@example.com" />
          </div>
          <div class="form-group">
            <label class="input-label">Phone</label>
            <input v-model="editForm.phone" class="input" placeholder="+855 ..." />
          </div>
          <div class="form-group">
            <label class="input-label">Address</label>
            <textarea v-model="editForm.address" class="input" rows="2" placeholder="Address" />
          </div>
          <div class="form-group">
            <label class="input-label">Logo URL</label>
            <input v-model="editForm.logo" class="input" placeholder="https://..." />
          </div>
        </div>
      </template>
      <template #footer>
        <button class="btn-ghost" @click="showEdit = false">Cancel</button>
        <button class="btn-primary" :disabled="editSaving" @click="saveEdit">
          <i v-if="editSaving" class="ri-loader-4-line animate-spin" />
          <i v-else class="ri-save-line" />
          Save
        </button>
      </template>
    </RSlider>

    <!-- Assign Plan Drawer -->
    <RSlider v-model="showAssign" icon="ri-vip-crown-line" title="Assign Subscription Plan" description="Change the subscription plan for this organization">
      <template v-if="selected">
        <div class="arm-user-chip">
          <div class="org-avatar">
            <img v-if="selected.logo" :src="selected.logo" class="org-logo" />
            <i v-else class="ri-building-2-line" />
          </div>
          <div class="arm-chip-info">
            <span class="arm-chip-name">{{ selected.name }}</span>
            <span class="arm-chip-email">Current: <strong>{{ selected.subscriptionPlan || 'FREE' }}</strong></span>
          </div>
        </div>

        <div v-if="plansLoading" class="arm-loading">
          <i class="ri-loader-4-line animate-spin" style="font-size:2rem;color:var(--c-accent)" />
        </div>
        <div v-else class="arm-roles" style="margin-top:var(--sp-3)">
          <div
            v-for="plan in availablePlans"
            :key="plan.id"
            class="arm-role-card"
            :class="{
              selected: selectedPlanName === plan.name,
              assigned: (selected.subscriptionPlan || 'FREE') === plan.name,
            }"
            @click="selectedPlanName = plan.name"
          >
            <div v-if="(selected.subscriptionPlan || 'FREE') === plan.name" class="arm-assigned-badge">
              <i class="ri-check-double-line" /> Current
            </div>
            <div class="arm-role-left">
              <div class="arm-role-icon" :class="planIconClass(plan.name)">
                <i :class="planIcon(plan.name)" />
              </div>
              <div class="arm-role-text">
                <span class="arm-role-name">{{ plan.displayName || plan.name }}</span>
                <span v-if="plan.description" class="arm-role-desc">{{ plan.description }}</span>
                <div class="arm-perms" style="margin-top:6px">
                  <span class="arm-perm-tag">{{ plan.maxWeddings === -1 ? '∞' : plan.maxWeddings }} weddings</span>
                  <span class="arm-perm-tag">{{ plan.maxGuestsPerWedding === -1 ? '∞' : plan.maxGuestsPerWedding }} guests</span>
                  <span class="arm-perm-tag">{{ plan.maxUsers === -1 ? '∞' : plan.maxUsers }} users</span>
                  <span v-if="plan.telegramInvite" class="arm-perm-tag">Telegram</span>
                  <span v-if="plan.emailInvite" class="arm-perm-tag">Email</span>
                  <span v-if="plan.gallery" class="arm-perm-tag">Gallery</span>
                </div>
              </div>
            </div>
            <div class="arm-role-right">
              <div class="arm-role-check" :class="{ active: selectedPlanName === plan.name }">
                <i class="ri-check-line" />
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <button class="btn-ghost" @click="showAssign = false">Cancel</button>
        <button class="btn-primary" :disabled="!selectedPlanName || assigning" @click="assignPlan">
          <i v-if="assigning" class="ri-loader-4-line animate-spin" />
          <i v-else class="ri-vip-crown-line" />
          Assign Plan
        </button>
      </template>
    </RSlider>
  </RWrapperPage>
</template>

<script setup>
definePageMeta({ layout: 'navbar', middleware: ['auth'] })

const toast = useToastStore()
const { t } = useI18n()
const eventTypeStore = useEventTypeStore()

// ── Columns ────────────────────────────────────────────────────────────────────
const columns = [
  { key: 'name',             label: t('name') },
  { key: 'email',            label: t('contact') },
  { key: 'subscriptionPlan', label: t('plan') },
  { key: 'status',           label: t('status') },
  { key: 'eventTypes',       label: 'Event Types', width: '180px' },
  { key: 'weddingCount',     label: t('weddings'), align: 'center' },
  { key: 'createdAt',        label: t('created_at') },
  { key: 'actions',          label: t('actions'), width: '110px', align: 'center' },
]

// ── Data fetching ──────────────────────────────────────────────────────────────
const loading = ref(false)
const orgs = ref([])
const search = ref('')
const filterStatus = ref('')
const chipFilter = ref([]);
const dataFilter = ref({
  status: [],
});

const filteredRows = computed(() => {
  let list = orgs.value
  if (filterStatus.value) list = list.filter(o => o.status === filterStatus.value)
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(o =>
      (o.name || '').toLowerCase().includes(q) ||
      (o.email || '').toLowerCase().includes(q) ||
      (o.id || '').toLowerCase().includes(q)
    )
  }
  return list
})

onMounted(async () => {
  await nextTick()
  await Promise.all([fetchOrgs(), eventTypeStore.fetchTypes()])
})

const fetchOrgs = async () => {
  loading.value = true
  try {
    const { data, error } = await useHttp('/api/v1/organizations', { method: 'GET', isGlobal: true })
    if (error?.value) { toast.add('Failed to load organizations', 'Error'); return }
    const payload = data.value?.data ?? data.value
    orgs.value = Array.isArray(payload?.content) ? payload.content : (Array.isArray(payload) ? payload : [])
  } catch {
    toast.add('Failed to load organizations', 'Error')
  } finally {
    loading.value = false
  }
}

// ── Detail drawer ──────────────────────────────────────────────────────────────
const showDetail = ref(false)
const detailOrg = ref(null)

const openDetail = (org) => {
  detailOrg.value = org
  showDetail.value = true
}

const openAssignFromDetail = () => {
  showDetail.value = false
  nextTick(() => openAssign(detailOrg.value))
}

const openEventTypesFromDetail = () => {
  showDetail.value = false
  nextTick(() => openEventTypes(detailOrg.value))
}

const formatDate = (dt) => {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

// ── Edit org drawer ────────────────────────────────────────────────────────────
const showEdit = ref(false)
const editForm = reactive({ name: '', email: '', phone: '', address: '', logo: '' })
const editErrors = reactive({})
const editSaving = ref(false)
const editingOrg = ref(null)

const openEdit = (org) => {
  editingOrg.value = org
  Object.assign(editForm, { name: org.name || '', email: org.email || '', phone: org.phone || '', address: org.address || '', logo: org.logo || '' })
  Object.keys(editErrors).forEach(k => delete editErrors[k])
  showEdit.value = true
}

const saveEdit = async () => {
  if (!editingOrg.value) return
  Object.keys(editErrors).forEach(k => delete editErrors[k])
  if (!editForm.name?.trim()) { editErrors.name = 'Name is required.'; return }
  editSaving.value = true
  try {
    const { data, error } = await useHttp(`/api/v1/organizations/${editingOrg.value.id}`, {
      method: 'PUT',
      body: { name: editForm.name, email: editForm.email, phone: editForm.phone, address: editForm.address, logo: editForm.logo, subscriptionPlan: editingOrg.value.subscriptionPlan },
      isGlobal: true,
    })
    if (error?.value) { toast.add(error.value?.message || 'Failed to save', 'Error'); return }
    const updated = data.value?.data ?? data.value
    const idx = orgs.value.findIndex(o => o.id === editingOrg.value.id)
    if (idx !== -1) orgs.value.splice(idx, 1, { ...orgs.value[idx], ...updated })
    if (detailOrg.value?.id === editingOrg.value.id) detailOrg.value = { ...detailOrg.value, ...updated }
    toast.add('Organization updated', 'Success')
    showEdit.value = false
    editingOrg.value = null
  } finally {
    editSaving.value = false
  }
}

// ── Delete org ─────────────────────────────────────────────────────────────────
const confirmStore = useConfirmStore()

const confirmDelete = (org) => {
  confirmStore.show({
    type: 'delete',
    title: 'Delete Organization',
    message: `Delete <strong>${org.name}</strong>? This will remove all associated data and cannot be undone.`,
    onConfirm: async () => {
      const { error } = await useHttp(`/api/v1/organizations/${org.id}`, { method: 'DELETE', isGlobal: true })
      if (error?.value) throw new Error(error.value?.message || 'Failed to delete')
      const idx = orgs.value.findIndex(o => o.id === org.id)
      if (idx !== -1) orgs.value.splice(idx, 1)
      toast.add(`${org.name} deleted`, 'Deleted')
    },
  })
}

// ── Assign plan drawer ─────────────────────────────────────────────────────────
const showAssign = ref(false)
const selected = ref(null)
const selectedPlanName = ref(null)
const availablePlans = ref([])
const plansLoading = ref(false)
const assigning = ref(false)

const openAssign = async (org) => {
  selected.value = org
  selectedPlanName.value = org.subscriptionPlan || 'FREE'
  showAssign.value = true
  if (!availablePlans.value.length) await fetchPlans()
}

const fetchPlans = async () => {
  plansLoading.value = true
  try {
    const { data, error } = await useHttp('/api/v1/admin/subscription-plans', { method: 'GET', isGlobal: true })
    if (error?.value) throw new Error(error.value)
    availablePlans.value = data.value?.data ?? data.value ?? []
  } catch {
    toast.add('Failed to load plans', 'Error')
  } finally {
    plansLoading.value = false
  }
}
function onSaveFilter(close) {
  const statusVal = dataFilter.value?.status
  filterStatus.value = (statusVal && statusVal !== 'all_status') ? statusVal.toUpperCase() : ''

  chipFilter.value = statusVal && statusVal !== 'all_status'
    ? [{ pk: 'status', src: '', icon: 'S', value: statusVal }]
    : []

  close()
}

function onRemoveChip(d) {
  if (isNotEmpty(d)) {
    const idx = chipFilter.value.findIndex((f) => f.pk === d.pk)
    if (idx !== -1) chipFilter.value.splice(idx, 1)
    if (d.pk === 'status') {
      filterStatus.value = ''
      dataFilter.value.status = null
    }
  }
  fetchOrgs()
}

const assignPlan = async () => {
  if (!selectedPlanName.value || !selected.value) return
  assigning.value = true
  try {
    const { error } = await useHttp(`/api/v1/organizations/${selected.value.id}`, {
      method: 'PUT',
      body: { name: selected.value.name, subscriptionPlan: selectedPlanName.value },
      isGlobal: true,
    })
    if (error?.value) throw new Error(error.value)
    toast.add(`Plan changed to ${selectedPlanName.value}`, 'Success')
    if (detailOrg.value?.id === selected.value.id)
      detailOrg.value = { ...detailOrg.value, subscriptionPlan: selectedPlanName.value }
    showAssign.value = false
  } catch {
    toast.add('Failed to assign plan', 'Error')
  } finally {
    assigning.value = false
  }
}

// ── Event Types drawer ─────────────────────────────────────────────────────────
const showEventTypes = ref(false)
const etOrg = ref(null)
const etAssigned = ref([])
const etLoading = ref(false)
const etSaving = ref(null)

// Computed Set so Vue tracks reassignments of etAssigned reactively
const etAssignedIds = computed(() => new Set(etAssigned.value.map(e => e.eventTypeId)))
const isEtAssigned = (eventTypeId) => etAssignedIds.value.has(eventTypeId)

const openEventTypes = async (org) => {
  etOrg.value = org
  etAssigned.value = []
  showEventTypes.value = true
  etLoading.value = true
  try {
    etAssigned.value = await eventTypeStore.fetchOrgEventTypes(org.id)
  } catch {
    toast.add('Failed to load event types', 'Error')
  } finally {
    etLoading.value = false
  }
}

const toggleEt = async (et) => {
  if (etSaving.value) return
  etSaving.value = et.id
  try {
    if (isEtAssigned(et.id)) {
      await eventTypeStore.revokeEventTypeFromOrg(etOrg.value.id, et.id)
      etAssigned.value = etAssigned.value.filter(e => e.eventTypeId !== et.id)
      toast.add(`${et.name} removed`, 'Event Type')
    } else {
      const result = await eventTypeStore.assignEventTypeToOrg(etOrg.value.id, et.id)
      if (result) etAssigned.value = [...etAssigned.value, result]
      toast.add(`${et.name} assigned`, 'Event Type')
    }
    // Sync the table row using splice for guaranteed Vue 3 reactivity
    const idx = orgs.value.findIndex(o => o.id === etOrg.value.id)
    if (idx !== -1) orgs.value.splice(idx, 1, { ...orgs.value[idx], eventTypes: [...etAssigned.value] })
  } catch (err) {
    toast.add(err.message || 'Failed', 'Error')
  } finally {
    etSaving.value = null
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const planClass = (plan) => {
  const p = (plan || 'FREE').toUpperCase()
  if (p === 'ENTERPRISE') return 'plan-enterprise'
  if (p === 'PROFESSIONAL') return 'plan-pro'
  return 'plan-free'
}

const planIcon = (name = '') => {
  const n = name.toUpperCase()
  if (n === 'ENTERPRISE') return 'ri-building-4-line'
  if (n === 'PROFESSIONAL') return 'ri-vip-crown-line'
  return 'ri-gift-line'
}

const planIconClass = (name = '') => {
  const n = name.toUpperCase()
  if (n === 'ENTERPRISE') return 'role-danger'
  if (n === 'PROFESSIONAL') return 'role-gold'
  return 'role-default'
}
</script>

<style lang="scss">
.orgs-page { display: flex; flex-direction: column; gap: var(--sp-5); }

.orgs-toolbar {
  display: flex; align-items: center; gap: var(--sp-3);
  @media (max-width: 600px) { flex-direction: column; align-items: stretch; }
}
.orgs-search {
  flex: 1; position: relative;
  i { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--c-muted); pointer-events: none; }
  .input { padding-left: 36px; width: 100%; }
}
.orgs-actions { display: flex; gap: var(--sp-1); justify-content: center; }
.btn-icon-sm {
  width: 30px; height: 30px; border-radius: var(--r-md);
  border: 1px solid var(--c-border); background: transparent; cursor: pointer;
  display: flex; align-items: center; justify-content: center; color: var(--c-muted);
  transition: all .15s;
  &:hover { color: var(--c-accent); border-color: var(--c-accent); }
  &--danger:hover { color: var(--c-danger); border-color: var(--c-danger); }
}

.org-cell { display: flex; align-items: center; gap: var(--sp-3); }
.org-avatar {
  width: 36px; height: 36px; border-radius: var(--r-lg); flex-shrink: 0;
  background: rgba(255,140,66,0.1); color: var(--c-accent);
  display: flex; align-items: center; justify-content: center; overflow: hidden;
  i { font-size: 1.1rem; }
}
.org-avatar-lg {
  width: 56px; height: 56px; border-radius: var(--r-xl); flex-shrink: 0;
  background: rgba(255,140,66,0.1); color: var(--c-accent);
  display: flex; align-items: center; justify-content: center; overflow: hidden;
  i { font-size: 1.75rem; }
}
.org-logo { width: 100%; height: 100%; object-fit: cover; }
.org-name { font-weight: 600; font-size: 0.875rem; }
.org-id { font-size: 0.7rem; color: var(--c-muted); font-family: monospace; }

.plan-badge {
  display: inline-flex; align-items: center;
  padding: 3px 10px; border-radius: 999px;
  font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;
  &.plan-enterprise { background: rgba(239,68,68,0.1); color: #ef4444; }
  &.plan-pro        { background: rgba(234,179,8,0.12); color: #ca8a04; }
  &.plan-free       { background: rgba(100,116,139,0.1); color: #64748b; }
}

/* Detail drawer */
.org-detail-header {
  display: flex; align-items: center; gap: var(--sp-4);
  padding: var(--sp-3) 0 var(--sp-4);
  border-bottom: 1px solid var(--c-border);
  margin-bottom: var(--sp-3);
}
.org-detail-name { font-size: 1.1rem; font-weight: 800; margin-bottom: 6px; }

.org-info-grid {
  display: flex; flex-direction: column; gap: 0;
  border: 1px solid var(--c-border); border-radius: var(--r-xl); overflow: hidden;
  margin-bottom: var(--sp-4);
}
.org-info-item {
  display: flex; align-items: flex-start; gap: var(--sp-3);
  padding: var(--sp-3) var(--sp-4);
  border-bottom: 1px solid var(--c-border);
  &:last-child { border-bottom: none; }
}
.org-info-label {
  width: 120px; flex-shrink: 0;
  font-size: 0.8rem; font-weight: 600; color: var(--c-muted);
  display: flex; align-items: center; gap: 5px;
  i { font-size: 0.875rem; }
}
.org-info-value {
  flex: 1; font-size: 0.875rem; color: var(--c-text); word-break: break-all;
  &.mono { font-family: monospace; font-size: 0.8rem; }
}
.org-detail-actions { display: flex; gap: var(--sp-2); }

/* Event type chips in table */
.org-et-chips { display: flex; flex-wrap: wrap; gap: 4px; }
.org-et-chip {
  display: inline-flex; align-items: center; gap: 3px;
  padding: 2px 7px; border-radius: var(--r-full);
  font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
  background: rgba(255,140,66,0.1); color: var(--c-accent);
  border: 1px solid rgba(255,140,66,0.2);
  i { font-size: 0.7rem; }
  &.org-et-more { background: rgba(100,116,139,0.1); color: #64748b; border-color: transparent; }
}
.org-et-all { font-size: 0.75rem; color: var(--c-muted); font-style: italic; }

/* Event Types drawer */
.et-hint {
  display: flex; align-items: flex-start; gap: var(--sp-2);
  font-size: 0.8rem; color: var(--c-muted); line-height: 1.5;
  padding: var(--sp-3); border-radius: var(--r-md);
  background: rgba(255,140,66,0.06); border: 1px solid rgba(255,140,66,0.12);
  margin-bottom: var(--sp-4);
  i { font-size: 1rem; color: var(--c-accent); flex-shrink: 0; margin-top: 1px; }
  strong { color: var(--c-text); }
}
.et-type-list { display: flex; flex-direction: column; gap: var(--sp-2); }
.et-type-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: var(--sp-3) var(--sp-4); border-radius: var(--r-lg);
  border: 1px solid var(--c-border); cursor: pointer;
  background: var(--c-surface); transition: all .15s;
  &:hover { border-color: var(--c-accent); background: rgba(255,140,66,0.04); }
  &.assigned { border-color: var(--c-accent); background: rgba(255,140,66,0.07); }
}
.et-type-info { display: flex; align-items: center; gap: var(--sp-3); }
.et-type-icon {
  width: 36px; height: 36px; border-radius: var(--r-md); flex-shrink: 0;
  background: rgba(255,140,66,0.1); color: var(--c-accent);
  display: flex; align-items: center; justify-content: center;
  i { font-size: 1rem; }
}
.et-type-name { font-size: 0.875rem; font-weight: 600; color: var(--c-text); }
.et-type-code { font-size: 0.7rem; color: var(--c-muted); text-transform: uppercase; letter-spacing: 0.05em; }
.et-type-check {
  width: 24px; height: 24px; border-radius: var(--r-full); flex-shrink: 0;
  border: 2px solid var(--c-border);
  display: flex; align-items: center; justify-content: center;
  color: var(--c-muted); transition: all .15s;
  &.active { background: var(--c-accent); border-color: var(--c-accent); color: #fff; }
  i { font-size: 0.875rem; }
}
</style>
