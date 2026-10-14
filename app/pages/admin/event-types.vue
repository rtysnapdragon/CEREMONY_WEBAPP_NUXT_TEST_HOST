<template>
  <RWrapperPage>
    <RPageHeader title="Event Types" :subtitle="`${types.length} event types configured`" />
    <RTable
      :columns="[
        { key: 'icon', label: 'Icon' ,slot:'icon'},
        { key: 'name', label: 'Name' },
        { key: 'code', label: 'Code' ,slot:'code'},
        { key: 'sortOrder', label: 'Sort' },
        { key: 'active', label: 'Status' ,slot:'active'},
        { key: 'actions', label: 'Actions',slot:'action' },
      ]"
      :data="types"
      :loading="loading"
      >
        <template #headerRight>
          <RBtn type="add" :label="$t('new_type')" icon="add" @click="openCreate"/>
        </template>
        <template #icon="{ rowData }">
          <td><i :class="rowData.icon" style="font-size:1.3rem;color:var(--c-accent)" /></td>
        </template>
        <template #code="{ rowData }">
          <td><code class="code-chip">{{ rowData.code }}</code></td>
        </template>
        <template #active="{ rowData }">
          <span
            class="badge"
            :class="rowData.active ? 'badge-success' : 'badge-muted'"
            style="cursor:pointer"
            @click="toggleActive(rowData)"
          >
            {{ rowData.active ? 'Active' : 'Inactive' }}
          </span>
        </template>
        <template #action="{ rowData }">
          <RTblBtns :items="[{type: 'edit', label: 'edit',icon:'ri-edit-line',color:'primary'}, { type: 'delete', label:'delete', icon:'ri-delete-bin-line',color:'danger'}]"
          @actionClick="(type, action) => { type === 'edit' ? openEdit(rowData) : confirmDelete(rowData) }"/>
        </template>
    </RTable>
  </RWrapperPage>
      
  <!-- Create / Edit Modal -->
  <RSlider v-model="showModal" :title="editingType ? 'Edit Event Type' : 'New Event Type'"  width="300">
    <RForm class="modal-form" novalidate @submit.prevent="saveType">
      <div class="form-row-2">
        <RFormGroup :label="'Name'" :required="true">
          <RInput v-model="form.name" placeholder="e.g. Wedding" />
        </RFormGroup>
        <RFormGroup :label="'Code'" :required="true">
          <RInput v-model="form.code" placeholder="e.g. WEDDING" style="text-transform:uppercase" :disabled="!!editingType" />
        </RFormGroup>
      </div>
      <div class="form-row-2">
        <RFormGroup :label="'Icon class'">
            <RInput v-model="form.icon" trailing-icon="ri-calendar-event-line" placeholder="ri-hearts-line" />
        </RFormGroup>
        <RFormGroup :label="'Sort Order'">
          <RInput v-model.number="form.sortOrder" type="number" min="1" />
        </RFormGroup>
      </div>
      <RFormGroup :label="'Description'">
        <RInput v-model="form.description" placeholder="Brief description" />
      </RFormGroup>
      <div class="fc-section">
        <p class="fc-title">Field Configuration</p>
        <div class="form-row-2">
          <RFormGroup :label="'Host 1 Label'">
            <RInput v-model="fc.host1Label" placeholder="Bride / Organizer / Birthday Person" />
          </RFormGroup>
          <RFormGroup>
            <template #label>
              Host 2 Label
              <span class="text-muted text-xs">
                (leave blank for single-host)
              </span>
            </template>
            <RInput v-model="fc.host2Label" placeholder="Groom / Co-Host" />
          </RFormGroup>
        </div>
        <RFormGroup :label="'Date Label'">
          <RInput v-model="fc.dateLabel" placeholder="Wedding Date / Event Date" />
        </RFormGroup>
        <div class="fc-toggles">
          <RFormGroup :label="'Feature Configuration'">
            <RCheckbox v-model="fc.coupleEvent" label="Couple event (shows both host fields side-by-side)" />
            <RCheckbox v-model="fc.showCeremony" label="Show ceremony schedule section" />
          </RFormGroup>
        </div>
      </div>
      <RCheckbox v-model="form.active" label="Active (visible in event type selector)"/>
    </RForm>
    <template #footer>
      <RBtn type="cancel" color="cancel" icon="cancel" :label="$t('cancel')" @click="closeModal"/>
      <RBtn type="save" color="success" :loading="saving" :label="$t('save')"/>
    </template>
  </RSlider>
</template>

<script setup>
definePageMeta({ layout: 'navbar', middleware: ['auth'] })

const toast = useToastStore()
const authStore = useAuthStore()
const confirm = useConfirmStore()
const types = ref([])
const loading = ref(false)
const fetchError = ref(null)
const showModal = ref(false)
const saving = ref(false)
const editingType = ref(null)

const form = reactive({
  name: '',
  code: '',
  icon: '',
  description: '',
  sortOrder: 1,
  active: true,
})

const fc = reactive({
  host1Label: '',
  host2Label: '',
  coupleEvent: false,
  dateLabel: 'Event Date',
  showCeremony: false,
})

const fetchTypes = async () => {
  loading.value = true
  fetchError.value = null
  try {
    await nextTick()
    const { data, error } = await useHttp('/api/v1/admin/event-types', { method: 'GET', isGlobal: true })
    if (error?.value) {
      fetchError.value = error.value?.data?.message || 'Failed to load event types'
      toast.add(fetchError.value, 'Error')
      return
    }
    types.value = data.value?.data ?? data.value ?? []
  } catch (e) {
    fetchError.value = e?.message || 'Unexpected error'
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.name = ''
  form.code = ''
  form.icon = ''
  form.description = ''
  form.sortOrder = types.value.length + 1
  form.active = true
  fc.host1Label = ''
  fc.host2Label = ''
  fc.coupleEvent = false
  fc.dateLabel = 'Event Date'
  fc.showCeremony = false
}

const openCreate = () => {
  editingType.value = null
  resetForm()
  showModal.value = true
}

const openEdit = (type) => {
  editingType.value = type
  form.name = type.name
  form.code = type.code
  form.icon = type.icon || ''
  form.description = type.description || ''
  form.sortOrder = type.sortOrder
  form.active = type.active
  const parsed = (() => { try { return JSON.parse(type.fieldConfig || '{}') } catch { return {} } })()
  fc.host1Label = parsed.host1Label || ''
  fc.host2Label = parsed.host2Label || ''
  fc.coupleEvent = parsed.coupleEvent || false
  fc.dateLabel = parsed.dateLabel || 'Event Date'
  fc.showCeremony = parsed.showCeremony || false
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingType.value = null
}

const saveType = async () => {
  if (!form.name?.trim() || !form.code?.trim()) {
    toast.add('Name and Code are required', 'Validation')
    return
  }
  saving.value = true
  try {
    const payload = {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      icon: form.icon.trim() || null,
      description: form.description.trim() || null,
      sortOrder: form.sortOrder,
      active: form.active,
      fieldConfig: JSON.stringify({
        host1Label: fc.host1Label || null,
        host2Label: fc.host2Label || null,
        coupleEvent: fc.coupleEvent,
        dateLabel: fc.dateLabel || 'Event Date',
        showCeremony: fc.showCeremony,
      }),
    }

    const url = editingType.value
      ? `/api/v1/admin/event-types/${editingType.value.id}`
      : '/api/v1/admin/event-types'
    const method = editingType.value ? 'PUT' : 'POST'

    const { data, error } = await useHttp(url, { method, body: payload, isGlobal: true })
    if (error?.value) {
      toast.add(error.value?.data?.message || 'Failed to save', 'Error')
      return
    }

    const saved = data.value?.data ?? data.value
    if (editingType.value) {
      const idx = types.value.findIndex(t => t.id === editingType.value.id)
      if (idx !== -1) types.value.splice(idx, 1, saved)
    } else {
      types.value.push(saved)
    }

    toast.add({ message: `Event type ${editingType.value ? 'updated' : 'created'} successfully` })
    closeModal()
  } finally {
    saving.value = false
  }
}

const toggleActive = async (type) => {
  const payload = {
    name: type.name, code: type.code, icon: type.icon,
    description: type.description, sortOrder: type.sortOrder,
    active: !type.active, fieldConfig: type.fieldConfig,
  }
  const { data, error } = await useHttp(`/api/v1/admin/event-types/${type.id}`, { method: 'PUT', body: payload, isGlobal: true })
  if (error?.value) { toast.add('Failed to update', 'Error'); return }
  const updated = data.value?.data ?? data.value
  const idx = types.value.findIndex(t => t.id === type.id)
  if (idx !== -1) types.value.splice(idx, 1, updated)
  toast.add({ message: `${type.name} ${updated.active ? 'activated' : 'deactivated'}` })
}

const confirmDelete = async (type) => {
  confirm.show({
    type: 'delete',
    title: 'Confirm Delete',
    message: `Delete "${type.name}"? This cannot be undone.`,
    onConfirm: async () => {
      const { error } = await useHttp(`/api/v1/admin/event-types/${type.id}`, { method: 'DELETE', isGlobal: true })
      if (error?.value) { toast.add('Failed to delete', 'Error'); return }
      const idx = types.value.findIndex(t => t.id === type.id)
      if (idx !== -1) types.value.splice(idx, 1)
      toast.add({ message: `${type.name} deleted` })
    }
  })
}

onMounted(async () => {
  await nextTick()
  await fetchTypes()
})

watch(() => authStore.isAuthenticated, (val) => {
  if (val && types.value.length === 0 && !loading.value) fetchTypes()
})
</script>

<style scoped lang="scss">
.types-table { overflow: auto; }

.data-table {
  width: 100%; border-collapse: collapse;
  th, td { padding: .75rem 1rem; text-align: left; border-bottom: 1px solid var(--c-border); }
  th { font-size: .8rem; font-weight: 600; color: var(--c-muted); text-transform: uppercase; letter-spacing: .05em; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: rgba(255,255,255,.02); }
}

.code-chip {
  background: rgba(255,255,255,.06); border: 1px solid var(--c-border);
  border-radius: 4px; padding: 2px 6px; font-size: .75rem; font-family: monospace;
}

.fw-600 { font-weight: 600; color: var(--c-text); }
.actions-cell { display: flex; gap: var(--sp-2); }

.modal-panel {
  width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto;
  border-radius: var(--r-xl); padding: var(--sp-6);
  background: var(--c-surface); border: 1px solid var(--c-border);
}

.modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--sp-5); }
.modal-header h3 { font-size: 1.1rem; font-weight: 700; color: var(--c-text); margin: 0; }
.modal-form { display: flex; flex-direction: column; gap: var(--sp-4); }
.modal-footer { display: flex; gap: var(--sp-3); justify-content: flex-end; margin-top: var(--sp-2); }

.form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-4); @media(max-width:480px){grid-template-columns:1fr;} }

.fc-section {
  padding: var(--sp-4); border-radius: var(--r-md); border: 1px solid var(--c-border);
  background: rgba(255,255,255,.02);
}
.fc-title { font-size: .8rem; font-weight: 600; color: var(--c-muted); text-transform: uppercase; letter-spacing: .05em; margin: 0 0 var(--sp-3); }
.fc-toggles { display: flex; flex-direction: column; gap: var(--sp-2); }

.feature-toggle {
  display: flex; align-items: center; gap: var(--sp-2);
  cursor: pointer; font-size: .875rem; color: var(--c-text);
  input[type=checkbox] { accent-color: var(--c-accent); width: 16px; height: 16px; }
}

.state-center { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem; color: var(--c-muted); gap: var(--sp-3); }
</style>
