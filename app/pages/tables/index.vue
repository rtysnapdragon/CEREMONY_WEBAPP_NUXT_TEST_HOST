<template>
  <RWrapperPage class="tables-page">
    <RPageHeader title="Seating Tables" :subtitle="`${tableStore.items.length} tables · ${totalSeated} / ${totalCapacity} seats filled`">
      <template #actions>
        <RBtn type="add" :label="$t('add_table')" icon="ri-add-line" :disabled="!eventStore.activeEvent" @click="openAdd" />
      </template>
    </RPageHeader>

    <!-- Stats -->
    <div class="table-stats-row animate-fade-up delay-1">
      <div v-for="stat in stats" :key="stat.key" class="gsr-card glass-widget">
        <div class="gsr-icon" :style="{ background: stat.bg, color: stat.color }"><i :class="stat.icon" /></div>
        <div class="gsr-value" :style="{ color: stat.color }">{{ stat.value }}</div>
        <div class="gsr-label">{{ stat.label }}</div>
      </div>
    </div>

    <!-- No wedding -->
    <div v-if="!eventStore.activeEvent" class="glass-card empty-state animate-fade-up">
      <div class="empty-icon"><i class="ri-layout-grid-line" /></div>
      <h3>No wedding selected</h3>
      <p>Select a wedding from the sidebar to manage seating tables.</p>
    </div>

    <template v-else>
      <div v-if="tableStore.loading && tableStore.items.length === 0" class="loading-state glass-card animate-fade-up">
        <i class="ri-loader-4-line animate-spin" style="font-size:1.5rem;color:var(--c-muted)" />
        <span class="text-muted">Loading tables...</span>
      </div>

      <div v-else-if="tableStore.items.length === 0" class="glass-card empty-state animate-fade-up">
        <div class="empty-icon"><i class="ri-layout-grid-line" /></div>
        <h3>No tables yet</h3>
        <p>Add tables to manage your wedding seating arrangement</p>
        <button class="btn-primary" @click="openAdd"><i class="ri-add-line" /> Add First Table</button>
      </div>

      <RTable  v-else
        :data="tableStore.items"
        :columns="columnsLocal"
        :showTemplate="true"
        :showSearch="true"
        :options="{paging: false}"
      >
        <template #headerRight>
          <div v-if="tableStore.items.length === 0" class="glass-card empty-state animate-fade-up">
            <div class="empty-icon"><i class="ri-layout-grid-line" /></div>
            <h3>No tables yet</h3>
            <p>Add tables to manage your wedding seating arrangement</p>
            <RBtns :data="[{ label: $t('Add First Table'), icon: 'ri-add-line'}]" @click="(type, list) => { openAdd(); }" />
          </div>
        </template>
        <template #template="{ data }">
          <div class="tables-grid animate-fade-up delay-2">
            <div v-for="table in data" :key="table.id" class="table-card glass-card">
              <div class="table-card-header">
                <div class="table-icon-wrap" :class="`icon-${table.status}`">
                  <i class="ri-layout-grid-fill" />
                </div>
                <div class="table-info">
                  <h3 class="table-number">{{ table.tableName || `Table ${table.tableNumber}` }}</h3>
                  <span class="table-num-sub">#{{ table.tableNumber }}</span>
                </div>
                <span class="badge" :class="statusBadge(table.status)">{{ statusLabel(table.status) }}</span>
              </div>
              <div class="table-capacity-bar">
                <div class="cap-row">
                  <span class="cap-label">Seats filled</span>
                  <span class="cap-val">{{ table.occupancy }} / {{ table.capacity }}</span>
                </div>
                <div class="cap-bar">
                  <div
                    class="cap-fill"
                    :class="table.occupancy >= table.capacity ? 'cap-full' : 'cap-ok'"
                    :style="{ width: table.capacity ? `${Math.min(100, (table.occupancy / table.capacity) * 100)}%` : '0%' }"
                  />
                </div>
              </div>
              <div v-if="table.guests?.length" class="table-guests">
                <div v-for="g in table.guests.slice(0, 4)" :key="g.id" class="mini-avatar-chip">
                  {{ (g.guestName?.[0] ?? '?').toUpperCase() }}
                </div>
                <span v-if="table.guests.length > 4" class="more-guests">+{{ table.guests.length - 4 }}</span>
              </div>
              <div class="table-actions">
                <RBtn type="edit" icon="ri-edit-line" :label="$t('Edit')" size="s" @click="openEdit(table)" />
                <RBtn type="delete" icon="ri-delete-bin-line" :label="$t('Delete')" size="s" color="danger" @click="conDelete(table)" />
              </div>
            </div>
          </div>
        </template>
      </RTable>
    </template>

    <!-- Add/Edit Drawer -->
    <RDrawer v-model:open="showModal" :title="editing ? 'Edit Table' : 'Add Table'" icon="ri-layout-grid-line" width-desktop="460px" @close="closeModal">
        <RForm ref="formFilter" class="drawer-form" novalidate @onSubmit="save">
          <div class="form-row-2">
            <RFormGroup :label="tr('table_number')">
              <RInput v-model="form.tableNumber" placeholder="e.g. T1" />
            </RFormGroup>
            <RFormGroup :label="tr('table_name')">
              <RInput v-model="form.tableName" placeholder="e.g. Rose Table" />
            </RFormGroup>
          </div>
          <div class="form-row-2">
            <RFormGroup :label="tr('capacity')">
              <RInput v-model="form.capacity" type="number" placeholder="8" />
            </RFormGroup>
            <RFormGroup :label="tr('status')">
              <RSelect v-model="form.status" pk="id" default-select="available" :localData=" { data: [{ id: 'available', Name: 'available', NameEnglish:'Available'}, { id: 'full', Name: 'full', NameEnglish:'Full'}, { id: 'reserved', Name: 'reserved', NameEnglish:'Reserved'}]}" />
            </RFormGroup>
          </div>
        </RForm>
      <template #footer>
        <RBtn type="cancel" :label="$t('cancel')" color="cancel"  icon="cancel"  :disabled="saving" @click=closeModal />
        <RBtn type="save" :label="$t('save')" color="save" :icon="saving ? 'ri-loader-4-line' : 'ri-save-line'"  :disabled="saving" @click=save />
      </template>
    </RDrawer>
  </RWrapperPage>
</template>

<script setup>
definePageMeta({ layout: 'navbar', middleware: ['auth', 'permission'], permission: 'VIEW_TABLE' })
const { tableStore, eventStore, showModal, editing, saving, deletingItem, deleting, form, stats, totalCapacity, totalSeated, statusLabel, statusBadge, init, openAdd, openEdit, closeModal, save, confirmDelete, doDelete } = useTablePage()
const toast = useToast()
const { tr } = useTr()
const confirm = useConfirmStore()

function conDelete(item) {
  confirm.show({
    type: "delete",
    icon: "ri-delete-bin-line",
    title: "Delete Table",
    message: `Delete <strong>${item?.tableName || `Table ${item?.tableNumber}`}</strong>? This cannot be undone.`,
    confirmText: "Delete",
    cancelText: "Cancel",
    onConfirm: () => {
      // confirmDelete(item)
      doDelete(item)
      toast.add({title:'Table deleted successfully!', type:'success', icon:'ri-delete-bin-line'})
      deletingItem.value = null
      // deletingItem = null
    },
  })
}
onMounted(init)
</script>

<style lang="scss">
.tables-page { display: flex; flex-direction: column; gap: var(--sp-5); }

.table-stats-row {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--sp-4);
  @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); }
}
.gsr-card { padding: var(--sp-4) var(--sp-5); display: flex; flex-direction: column; gap: var(--sp-2); }
.gsr-icon { width: 36px; height: 36px; border-radius: var(--r-md); display: flex; align-items: center; justify-content: center; font-size: 1.125rem; }
.gsr-value { font-family: var(--font-700); font-size: 1.75rem; font-weight: 700; letter-spacing: -0.04em; line-height: 1; }
.gsr-label { font-size: 0.75rem; color: var(--c-muted); font-weight: 500; }

.tables-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--sp-4);
}

.table-card { padding: var(--sp-5); display: flex; flex-direction: column; gap: var(--sp-4); }

.table-card-header { display: flex; align-items: center; gap: var(--sp-3); }

.table-icon-wrap {
  width: 44px; height: 44px; border-radius: var(--r-lg); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; font-size: 1.25rem;
  &.icon-available { background: rgba(74,222,128,0.12); color: var(--c-success); }
  &.icon-full { background: rgba(248,113,113,0.12); color: var(--c-danger); }
  &.icon-reserved { background: rgba(245,158,11,0.12); color: #f59e0b; }
}

.table-info { flex: 1; min-width: 0; }
.table-number { font-family: var(--font-700); font-size: 0.9375rem; font-weight: 700; }
.table-num-sub { font-size: 0.75rem; color: var(--c-muted); }

.table-capacity-bar { display: flex; flex-direction: column; gap: var(--sp-1); }
.cap-row { display: flex; justify-content: space-between; align-items: center; }
.cap-label { font-size: 0.75rem; color: var(--c-muted); }
.cap-val { font-size: 0.8125rem; font-weight: 600; }
.cap-bar { height: 6px; border-radius: 99px; background: rgba(255,255,255,0.06); overflow: hidden; }
.cap-fill { height: 100%; border-radius: 99px; transition: width 0.4s var(--ease-out); &.cap-ok { background: var(--c-success); } &.cap-full { background: var(--c-danger); } }

.table-guests { display: flex; align-items: center; gap: var(--sp-1); flex-wrap: wrap; }
.mini-avatar-chip {
  width: 28px; height: 28px; border-radius: 50%; border: 2px solid var(--c-bg);
  background: rgba(255,140,66,0.15); color: var(--c-accent);
  display: flex; align-items: center; justify-content: center; font-size: 0.6875rem; font-weight: 700;
}
.more-guests { font-size: 0.75rem; color: var(--c-muted); margin-left: var(--sp-1); }

.table-actions { display: flex; gap: var(--sp-2); border-top: 1px solid var(--c-border); padding-top: var(--sp-3); }

.badge-danger { background: rgba(248,113,113,0.12); border: 1px solid rgba(248,113,113,0.25); color: var(--c-danger); }
.badge-warning { background: rgba(245,158,11,0.12); border: 1px solid rgba(245,158,11,0.25); color: #f59e0b; }

.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px);
  z-index: 300; display: flex; align-items: center; justify-content: center; padding: var(--sp-4);
}
.modal-panel { width: min(520px, 100%); max-height: 90dvh; overflow-y: auto; border-radius: var(--r-2xl); padding: var(--sp-6); }
.modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--sp-6); h3 { font-family: var(--font-700); font-size: 1.125rem; font-weight: 700; } }
.modal-footer { display: flex; justify-content: flex-end; gap: var(--sp-3); padding-top: var(--sp-2); border-top: 1px solid var(--c-border); }
.modal-enter-active, .modal-leave-active { transition: all var(--t-base) var(--ease-out); }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal-panel, .modal-leave-to .modal-panel { transform: scale(0.94) translateY(12px); }

.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--sp-3); padding: var(--sp-12); text-align: center; h3 { font-family: var(--font-700); font-size: 1.125rem; font-weight: 700; } p { font-size: 0.875rem; color: var(--c-muted); max-width: 320px; } }
.empty-icon { font-size: 2.5rem; color: var(--c-muted); opacity: 0.4; }
.loading-state { display: flex; align-items: center; justify-content: center; gap: var(--sp-3); padding: var(--sp-8); }
.drawer-form { display: flex; flex-direction: column; gap: var(--sp-4); }
.drawer-footer-btns { display: flex; justify-content: flex-end; gap: var(--sp-3); }
.required-star { color: var(--c-danger); margin-left: 2px; }
</style>
