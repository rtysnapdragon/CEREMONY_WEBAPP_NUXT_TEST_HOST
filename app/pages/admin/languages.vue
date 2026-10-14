<template>
  <RWrapperPage class="animate-fade-up delay-1">
      <RPageHeader title="Languages" :subtitle="`${langStore.items.length} languages configured`" />
      <RTable :key="`langs-${langStore.items.length > 0 ? 'loaded' : 'empty'}`" :columns="tableColumns" :data="langStore.items" :loading="langStore.loading" :options="{ searchable: false, paging: false }" @reloadByFixedData="langStore.fetchLanguages()">
        <template #headerRight>
          <RBtn type="add" :label="$t('add_new_language')" icon="add" @click="openCreate"/>
        </template>
        <template #flag="{ rowData }">
          <span v-if="rowData.flag" :class="`fi fi-${rowData.flag.toLowerCase()}`" class="lang-flag-icon"></span>
          <span v-else class="text-muted">—</span>
        </template>
        <template #code="{ rowData }">
          <span class="lang-code">{{ rowData.code }}</span>
        </template>
        <template #name="{ rowData }">
          <div>
            <div class="lang-name">{{ rowData.name }}</div>
            <div v-if="rowData.nativeName" class="lang-native">{{ rowData.nativeName }}</div>
          </div>
        </template>
        <template #direction="{ rowData }">
          <span class="badge badge-muted" style="font-size:0.7rem">{{ rowData.direction || 'LTR' }}</span>
        </template>
        <template #sortOrder="{ rowData }">
          <span class="text-muted" style="font-size:0.82rem">{{ rowData.sortOrder ?? 0 }}</span>
        </template>
        <template #isDefault="{ rowData }">
          <span v-if="rowData.isDefault" class="badge badge-accent" style="font-size:0.7rem">Default</span>
          <span v-else class="text-muted">—</span>
        </template>
        <template #isActive="{ rowData }">
          <span class="badge" :class="rowData.isActive ? 'badge-success' : 'badge-muted'">
            {{ rowData.isActive ? 'Active' : 'Inactive' }}
          </span>
        </template>
        <template #actions="{ rowData }">
          <RTblBtns :items="[{type: 'edit', label: 'edit',icon:'ri-edit-line',color:'primary'}, { type: 'delete', label:'delete', icon:'ri-delete-bin-line',color:'danger'}]"
          @actionClick="(type, action) => { type === 'edit' ? openEdit(rowData) : confirmDelete(rowData) }"/>
        </template>
      </RTable>
    </RWrapperPage>

    <!-- Create / Edit Drawer -->
    <RDrawer
      v-model:open="showDrawer"
      :title="editing ? 'Edit Language' : 'Add Language'"
      icon="ri-translate-2"
      width-desktop="480px"
      width-tablet="92vw"
      @close="closeDrawer"
    >
      <RForm id="lang-form" class="drawer-form" novalidate @submit.prevent="save">
        <!-- Flag + Code -->
        <div class="form-row-2">
          <RFormGroup>
            <template #label ><label class="input-label">Flag Code <span class="text-muted" style="font-size:0.72rem">(ISO country)</span></label> </template>
            <RInput v-model="form.flag" leading placeholder="e.g. GB, KH, US" :maxlength="10" leading-icon="ri-flag-line" :error="!!errors.flag" @on-input="clearError('flag')">
              <template #leading>       <div v-if="form.flag" class="flag-preview">
                <span :class="`fi fi-${form.flag.toLowerCase()}`" style="width:2rem;height:1.5rem;display:inline-block"></span>
              </div> </template>
            </RInput>
          </RFormGroup>
          <RFormGroup :help="form.flag ? '' : 'errors.flag'" required>
            <template #label ><label class="input-label">Language Code <span class="text-muted" style="font-size:0.72rem">(ISO country)</span></label> </template>
            <RInput v-model="form.flag" leading placeholder="e.g. GB, KH, US" :maxlength="10" leading-icon="ri-flag-line" :error="!!errors.flag" @on-input="clearError('flag')"> 
              <template #leading >
                <div v-if="form.flag" class="flag-preview">
                  <span :class="`fi fi-${form.flag.toLowerCase()}`" style="width:2rem;height:1.5rem;display:inline-block"></span>
                </div>
              </template>
            </RInput> 
          </RFormGroup>
          <RFormGroup :label="'Language Code '" :help="errors.code" required >
            <RInput v-model="form.code" placeholder="e.g. en, km, zh" :maxlength="10" leading-icon="ri-code-line" :error="!!errors.code" @on-input="clearError('code')" />
          </RFormGroup>
        </div>
        <!-- Name + Native Name -->
        <div class="form-row-2">
          <RFormGroup :label="'Name'" :help="errors.name" required >
            <RInput v-model="form.name" placeholder="e.g. English" :error="!!errors.name" @on-input="clearError('name')" />
          </RFormGroup>
          <RFormGroup :label="'Native Name'"  >
            <RInput v-model="form.nativeName" placeholder="e.g. ខ្មែរ, 中文, العربية" />
          </RFormGroup>
        </div>
        <!-- Direction + Sort Order -->
        <div class="form-row-2">
          <RFormGroup :label="'Text Direction'">
            <RSelect v-model="form.direction" :localData="{ data: [{ id: 1, Name: 'LTR — Left to Right'},{ id: 2, Name: 'RTL — Right to Left'}]}" placeholder="e.g. LTR" :error="!!errors.direction" @on-input="clearError('direction')" />
          </RFormGroup>
          <RFormGroup :label="'Sort Order'">
            <RInput v-model.number="form.sortOrder" type="number" placeholder="0" />
          </RFormGroup>
        </div>
        <!-- Toggles -->
        <div class="form-row-2">
          <RFormGroup :label="'Active'">
            <RSwitch v-model="form.isActive" label="Active" />
            <p class="hint-text">Inactive languages are hidden from translation tabs</p>
          </RFormGroup>
          <RFormGroup :label="'Default Language'">
            <RSwitch v-model="form.isDefault" label="Set as Default" />
            <p class="hint-text">Fallback when a translation is missing</p>
          </RFormGroup>
        </div>
      </RForm>
      <template #footer>
        <RBtn type="cancel" color="cancel" icon="cancel" :label="$t('cancel')" @click="closeDrawer"/>
        <RBtn type="save" color="success" :icon=" saving ? 'ri-loader-4-line' : 'save'" :loading="saving" :label="saving ? $t('saving') : $t('save')"/>
      </template>
    </RDrawer>
</template>

<script setup>
definePageMeta({ layout: 'navbar', middleware: ['auth'], permission: undefined })

const confirm = useConfirmStore()
const langStore = useLanguageStore()
const toast = useToastStore()
const authStore = useAuthStore()

onMounted(async () => {
  await nextTick()
  await langStore.fetchLanguages()
})

watch(() => authStore.isAuthenticated, (val) => {
  if (val && langStore.items.length === 0 && !langStore.loading) langStore.fetchLanguages()
})

const tableColumns = computed(() => [
  { key: 'flag',      label: '',          width: '48px' },
  { key: 'code',      label: 'Code',      width: '80px' },
  { key: 'name',      label: 'Name' },
  { key: 'direction', label: 'Direction', width: '90px' },
  { key: 'sortOrder', label: 'Order',     width: '70px' },
  { key: 'isDefault', label: 'Default',   width: '80px' },
  { key: 'isActive',  label: 'Status',    width: '90px' },
  { key: 'actions',   label: '',          width: '80px', align: 'center' },
])

const defaultForm = () => ({
  code: '', name: '', nativeName: '', flag: '',
  direction: 'LTR', sortOrder: 0, isActive: true, isDefault: false,
})

const showDrawer = ref(false)
const editing = ref(null)
const saving = ref(false)
const form = reactive(defaultForm())
const errors = reactive({})

const clearError = (field) => { delete errors[field] }

const validate = () => {
  Object.keys(errors).forEach(k => delete errors[k])
  if (!form.code?.trim()) errors.code = 'Language code is required.'
  else if (form.code.length < 2) errors.code = 'Code must be at least 2 characters.'
  else if (form.code.length > 10) errors.code = 'Code must be at most 10 characters.'
  if (!form.name?.trim()) errors.name = 'Name is required.'
  if (form.flag && form.flag.length > 10) errors.flag = 'Flag code must be at most 10 characters.'
  return Object.keys(errors).length === 0
}

const openCreate = () => {
  editing.value = null
  Object.assign(form, defaultForm())
  Object.keys(errors).forEach(k => delete errors[k])
  showDrawer.value = true
}

const openEdit = (lang) => {
  editing.value = lang
  Object.assign(form, {
    code: lang.code,
    name: lang.name,
    nativeName: lang.nativeName ?? '',
    flag: lang.flag ?? '',
    direction: lang.direction ?? 'LTR',
    sortOrder: lang.sortOrder ?? 0,
    isActive: lang.isActive ?? true,
    isDefault: lang.isDefault ?? false,
  })
  Object.keys(errors).forEach(k => delete errors[k])
  showDrawer.value = true
}

const closeDrawer = () => {
  showDrawer.value = false
  editing.value = null
}

const save = async () => {
  if (!validate()) return
  saving.value = true
  try {
    const result = editing.value
      ? await langStore.updateLanguage(editing.value.id, { ...form })
      : await langStore.createLanguage({ ...form })
    if (result?.success) {
      toast.add(editing.value ? 'Language updated' : 'Language added', 'Success')
      closeDrawer()
    } else {
      toast.add(result?.error ?? 'Failed to save', 'Error')
    }
  } finally {
    saving.value = false
  }
}

const confirmDelete = (lang) => {
  confirm.show({
    type: 'delete',
    title: 'Delete Language',
    message: `Delete <strong>${lang.name} (${lang.code})</strong>? This cannot be undone.`,
    onConfirm: async () => {
      const result = await langStore.deleteLanguage(lang.id)
      if (result?.success) toast.add('Language deleted', 'Deleted')
      else toast.add(result?.error ?? 'Failed to delete', 'Error')
    },
  })
}
</script>

<style lang="scss">

.lang-flag-icon { width: 1.5rem; height: 1.125rem; display: inline-block; vertical-align: middle; }
.lang-code {
  font-family: monospace; font-size: 0.8rem; font-weight: 700;
  background: rgba(255,255,255,0.06); border: 1px solid var(--c-border);
  padding: 2px 8px; border-radius: var(--r-sm); color: var(--c-accent);
}
.lang-name { font-weight: 500; font-size: 0.875rem; }
.lang-native { color: var(--c-muted); font-size: 0.78rem; margin-top: 2px; }

.form-row-2 {
  display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-4);
  @media (max-width: 480px) { grid-template-columns: 1fr; }
}
.flag-preview { font-size: 1.8rem; margin-top: 6px; line-height: 1; }
.hint-text { font-size: 0.72rem; color: var(--c-muted); margin-top: 4px; }
.required-star { color: var(--c-danger); margin-left: 2px; }
.field-error { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; color: var(--c-danger); margin-top: 4px; &::before { content: '⚠'; font-size: 0.7rem; } }
.row-actions { display: flex; gap: 4px !important; justify-content: center !important; }
</style>
