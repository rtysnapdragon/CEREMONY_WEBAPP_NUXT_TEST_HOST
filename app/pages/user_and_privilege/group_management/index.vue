<template>
  <RWrapperPage class="rm-page">

    <RPageHeader :title="tr('group_management')" :subtitle="tr('menu.group_management') || 'Manage roles and their permissions'">
      <template #actions>
        <button v-if="canCreate" class="btn-primary" @click="startNew">
          <i class="ri-add-line" /> {{ tr('new_role') || 'New Role' }}
        </button>
      </template>
    </RPageHeader>

    <!-- Search bar -->
    <div class="rm-toolbar animate-fade-up delay-1">
      <div class="rm-search-wrap">
        <i class="ri-search-line" />
        <input v-model="filter" class="input" :placeholder="tr('search') || 'Search roles…'" />
      </div>
    </div>

    <!-- Table -->
    <div class="animate-fade-up delay-2">
      <RTable
        :key="`roles-${filteredRoles.length > 0 ? 'loaded' : 'empty'}`"
        :columns="tableColumns"
        :data="filteredRoles"
        :loading="loading"
        :options="{ searchable: false, paging: false }"
        @reloadByFixedData="fetchRoles()"
      >
        <template #name="{ rowData }">
          <div class="rm-role-cell">
            <div class="rm-role-icon" :class="roleIconClass(rowData.name)">
              <i :class="roleIcon(rowData.name)" />
            </div>
            <div>
              <div class="rm-role-name">{{ rowData.name }}</div>
              <div v-if="rowData.description" class="rm-role-desc">{{ rowData.description }}</div>
            </div>
          </div>
        </template>
        <template #permCount="{ rowData }">
          <span class="rm-perm-count-badge">
            {{ (rowData.permissions || []).length }} permissions
          </span>
        </template>
        <template #actions="{ rowData }">
          <div class="rm-row-actions" @click.stop>
            <button class="btn-icon btn-xs-icon" :title="tr('view')" @click="openDetail(rowData)">
              <i class="ri-eye-line" />
            </button>
            <button v-if="canUpdate" class="btn-icon btn-xs-icon" :title="tr('edit')" @click="startEdit(rowData)">
              <i class="ri-edit-line" />
            </button>
            <button v-if="canDelete" class="btn-icon btn-xs-icon btn-danger-icon" :title="tr('common.delete')" @click="confirmDelete(rowData)">
              <i class="ri-delete-bin-line" />
            </button>
          </div>
        </template>
      </RTable>
    </div>

    <!-- View Detail Drawer -->
    <RSlider v-model="showDetail" icon="ri-shield-line" :title="activeRole?.name || 'Role'" description="View role permissions">
      <template v-if="activeRole">
        <div class="rm-drawer-header">
          <div class="rm-detail-icon" :class="roleIconClass(activeRole.name)">
            <i :class="roleIcon(activeRole.name)" />
          </div>
          <div>
            <h3 class="rm-detail-name">{{ activeRole.name }}</h3>
            <p v-if="activeRole.description" class="rm-detail-subdesc">{{ activeRole.description }}</p>
          </div>
        </div>

        <div class="rm-perm-groups">
          <div v-for="group in permGroups" :key="group.label" class="rm-perm-group">
            <div class="rm-perm-group-header">
              <div class="rm-perm-group-icon" :class="group.colorClass">
                <i :class="group.icon" />
              </div>
              <span class="rm-perm-group-label">{{ group.label }}</span>
              <span class="rm-perm-group-count">{{ assignedInGroup(group) }} / {{ group.codes.length }}</span>
            </div>
            <div class="rm-perm-chips">
              <span
                v-for="code in group.codes"
                :key="code"
                class="rm-perm-chip"
                :class="hasPermission(code) ? 'has' : 'missing'"
              >
                <i :class="hasPermission(code) ? 'ri-check-line' : 'ri-close-line'" />
                {{ code }}
              </span>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <button class="btn-ghost" @click="showDetail = false">Close</button>
        <button v-if="canUpdate" class="btn-primary" @click="startEditFromDetail">
          <i class="ri-edit-line" /> Edit
        </button>
      </template>
    </RSlider>

    <!-- Edit / Create Drawer -->
    <RSlider
      v-model="showEdit"
      :icon="form.id ? 'ri-edit-line' : 'ri-add-line'"
      :title="form.id ? 'Edit Role' : 'New Role'"
      description="Configure role name and permissions"
    >
      <div class="rm-edit-fields">
        <div class="form-group">
          <label class="input-label">Role Name <span class="rm-required">*</span></label>
          <input v-model="form.name" class="input" placeholder="e.g. MANAGER" />
        </div>
        <div class="form-group">
          <label class="input-label">Description</label>
          <input v-model="form.description" class="input" placeholder="Short description (optional)" />
        </div>
      </div>

      <div v-if="permsLoading" class="rm-perm-loading">
        <i class="ri-loader-4-line ri-spin" /> Loading permissions…
      </div>
      <div v-else class="rm-perm-groups">
        <div v-for="group in permGroups" :key="group.label" class="rm-perm-group editable">
          <div class="rm-perm-group-header">
            <div class="rm-perm-group-icon" :class="group.colorClass">
              <i :class="group.icon" />
            </div>
            <span class="rm-perm-group-label">{{ group.label }}</span>
            <span class="rm-perm-group-count">{{ selectedInGroup(group) }} / {{ group.codes.length }}</span>
            <button class="rm-select-all-btn" :class="{ active: allGroupSelected(group) }" @click="toggleGroup(group)">
              {{ allGroupSelected(group) ? 'Deselect all' : 'Select all' }}
            </button>
          </div>
          <div class="rm-perm-chips">
            <label
              v-for="perm in groupPerms(group)"
              :key="perm.id"
              class="rm-perm-toggle"
              :class="{ checked: form.permissionIds.includes(perm.id) }"
            >
              <input type="checkbox" :value="perm.id" v-model="form.permissionIds" />
              <i :class="form.permissionIds.includes(perm.id) ? 'ri-check-line' : 'ri-add-line'" />
              {{ perm.code }}
            </label>
            <span
              v-for="code in unknownGroupCodes(group)"
              :key="code"
              class="rm-perm-chip missing"
              title="Not available in your org"
            >
              <i class="ri-lock-line" /> {{ code }}
            </span>
          </div>
        </div>
      </div>

      <template #footer>
        <button class="btn-ghost" @click="cancelEdit">{{ tr('common.cancel') }}</button>
        <button class="btn-primary" :disabled="!form.name.trim() || saving" @click="saveRole">
          <i v-if="saving" class="ri-loader-4-line ri-spin" />
          <i v-else class="ri-save-line" />
          {{ tr('common.save') }}
        </button>
      </template>
    </RSlider>

    <!-- Delete confirm modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
          <div class="modal-panel glass-card animate-scale-in" style="max-width:380px">
            <div class="modal-header">
              <h3>{{ tr('delete_role') || 'Delete Role' }}</h3>
              <button class="btn-icon" @click="deleteTarget = null"><i class="ri-close-line" /></button>
            </div>
            <div class="modal-form">
              <p style="color:var(--c-muted);line-height:1.6">
                {{ tr('delete_role_confirm') || 'Are you sure you want to delete' }}
                <strong style="color:var(--c-text)"> {{ deleteTarget?.name }}</strong>?
                This cannot be undone.
              </p>
            </div>
            <div class="modal-footer">
              <button class="btn-ghost" @click="deleteTarget = null">{{ tr('common.cancel') }}</button>
              <button class="btn-danger" :disabled="deleting" @click="performDelete">
                <i v-if="deleting" class="ri-loader-4-line ri-spin" />
                <i v-else class="ri-delete-bin-line" />
                {{ tr('common.delete') || 'Delete' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </RWrapperPage>
</template>

<script setup>
definePageMeta({ layout: 'navbar', middleware: ['auth', 'permission'], permission: 'ROLE_VIEW' })

const {
  canCreate, canUpdate, canDelete,
  filter, roles, allPermissions, loading, permsLoading, saving, deleting,
  activeRole, showDetail, showEdit, deleteTarget, form,
  filteredRoles, permGroups, codeToPermMap,
  hasPermission, assignedInGroup, selectedInGroup, allGroupSelected,
  groupPerms, unknownGroupCodes,
  roleIcon, roleIconClass, toggleGroup,
  openDetail, startEditFromDetail, startNew, startEdit, cancelEdit,
  saveRole, confirmDelete, performDelete, fetchRoles,
} = useGroupManagementPage()

const tableColumns = [
  { key: 'name',      label: 'Role',        sortable: true },
  { key: 'permCount', label: 'Permissions' },
  { key: 'actions',   label: '',            width: '110px', align: 'center' },
]

onMounted(fetchRoles)
</script>

<style lang="scss">
.rm-page { display: flex; flex-direction: column; gap: var(--sp-5); }

.rm-toolbar {
  display: flex; gap: var(--sp-3);
}
.rm-search-wrap {
  position: relative; flex: 1; max-width: 360px;
  i { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--c-muted); pointer-events: none; }
  .input { padding-left: 36px; width: 100%; }
}

/* ── Table cell ── */
.rm-role-cell { display: flex; align-items: center; gap: var(--sp-3); }
.rm-role-icon {
  width: 34px; height: 34px; border-radius: var(--r-lg); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  i { font-size: 1rem; }
}
.rm-role-name { font-weight: 600; font-size: 0.875rem; }
.rm-role-desc { font-size: 0.75rem; color: var(--c-muted); }

.rm-perm-count-badge {
  display: inline-flex; align-items: center;
  padding: 3px 10px; border-radius: 999px;
  font-size: 0.6875rem; font-weight: 700;
  background: rgba(255,140,66,0.1); color: var(--c-accent);
}

.rm-row-actions { display: flex; gap: 4px; justify-content: center; }

/* ── Drawer header ── */
.rm-drawer-header {
  display: flex; align-items: center; gap: var(--sp-4);
  padding-bottom: var(--sp-4); border-bottom: 1px solid var(--c-border); margin-bottom: var(--sp-4);
}
.rm-detail-icon {
  width: 48px; height: 48px; border-radius: var(--r-xl); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  i { font-size: 1.375rem; }
}
.rm-detail-name { font-size: 1.1rem; font-weight: 800; }
.rm-detail-subdesc { font-size: 0.8rem; color: var(--c-muted); margin-top: 3px; }

/* ── Edit fields ── */
.rm-edit-fields { display: flex; flex-direction: column; gap: var(--sp-3); margin-bottom: var(--sp-4); }
.rm-required { color: var(--c-danger); margin-left: 2px; }

/* ── Permission groups ── */
.rm-perm-groups { display: flex; flex-direction: column; gap: var(--sp-3); }

.rm-perm-loading {
  display: flex; align-items: center; gap: var(--sp-2); color: var(--c-muted); padding: var(--sp-4);
  i { font-size: 1.25rem; color: var(--c-accent); }
}

.rm-perm-group {
  border: 1px solid var(--c-border); border-radius: var(--r-xl); overflow: hidden;
}
.rm-perm-group-header {
  display: flex; align-items: center; gap: var(--sp-3);
  padding: var(--sp-3) var(--sp-4); background: var(--c-surface-1);
}
.rm-perm-group-icon {
  width: 28px; height: 28px; border-radius: var(--r-lg); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  i { font-size: 0.875rem; }
}
.rm-perm-group-label { font-weight: 700; font-size: 0.875rem; flex: 1; }
.rm-perm-group-count { font-size: 0.75rem; color: var(--c-muted); font-weight: 600; }

.rm-select-all-btn {
  font-size: 0.6875rem; font-weight: 600; padding: 3px 10px; border-radius: 999px;
  border: 1px solid var(--c-border); cursor: pointer; color: var(--c-muted);
  background: transparent; transition: all 0.15s;
  &:hover { border-color: var(--c-accent); color: var(--c-accent); }
  &.active { background: rgba(255,140,66,0.1); border-color: var(--c-accent); color: var(--c-accent); }
}

.rm-perm-chips { display: flex; flex-wrap: wrap; gap: 5px; padding: var(--sp-3) var(--sp-4); }

.rm-perm-chip {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 9px; border-radius: 999px;
  font-size: 0.625rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;
  i { font-size: 0.65rem; }
  &.has     { background: rgba(34,197,94,0.1); color: #16a34a; }
  &.missing { background: var(--c-surface-2); color: var(--c-muted); opacity: 0.6; }
}

.rm-perm-toggle {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 4px 10px; border-radius: 999px;
  font-size: 0.625rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;
  border: 1px solid var(--c-border); cursor: pointer; transition: all 0.15s;
  i { font-size: 0.65rem; }
  &:hover { border-color: rgba(255,140,66,0.4); }
  &.checked { background: rgba(255,140,66,0.12); border-color: var(--c-accent); color: var(--c-accent); }
  input[type="checkbox"] { display: none; }
}

/* ── Role icon color classes ── */
.ri-danger  { background: rgba(239,68,68,0.1);   i { color: #ef4444; } }
.ri-gold    { background: rgba(234,179,8,0.12);   i { color: #ca8a04; } }
.ri-purple  { background: rgba(147,51,234,0.1);   i { color: #9333ea; } }
.ri-cyan    { background: rgba(6,182,212,0.1);    i { color: #0891b2; } }
.ri-green   { background: rgba(34,197,94,0.1);    i { color: #16a34a; } }
.ri-orange  { background: rgba(255,140,66,0.1);   i { color: var(--c-accent); } }
.ri-indigo  { background: rgba(99,102,241,0.1);   i { color: #6366f1; } }
.ri-rose    { background: rgba(244,63,94,0.1);    i { color: #e11d48; } }
.ri-blue    { background: rgba(59,130,246,0.1);   i { color: #3b82f6; } }
.ri-default { background: rgba(255,140,66,0.1);   i { color: var(--c-accent); } }

/* ── Permission group color classes ── */
.pg-blue    { background: rgba(59,130,246,0.1);   i { color: #3b82f6; } }
.pg-purple  { background: rgba(147,51,234,0.1);   i { color: #9333ea; } }
.pg-pink    { background: rgba(236,72,153,0.1);   i { color: #db2777; } }
.pg-teal    { background: rgba(20,184,166,0.1);   i { color: #0d9488; } }
.pg-orange  { background: rgba(255,140,66,0.1);   i { color: var(--c-accent); } }
.pg-indigo  { background: rgba(99,102,241,0.1);   i { color: #6366f1; } }
.pg-green   { background: rgba(34,197,94,0.1);    i { color: #16a34a; } }
.pg-yellow  { background: rgba(234,179,8,0.12);   i { color: #ca8a04; } }
.pg-rose    { background: rgba(244,63,94,0.1);    i { color: #e11d48; } }
.pg-cyan    { background: rgba(6,182,212,0.1);    i { color: #0891b2; } }
.pg-slate   { background: rgba(100,116,139,0.1);  i { color: #64748b; } }
.pg-red     { background: rgba(239,68,68,0.1);    i { color: #ef4444; } }

/* ── Misc ── */
.btn-danger {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 0 var(--sp-4); height: 38px; border-radius: var(--r-lg);
  background: rgba(239,68,68,0.12); color: #ef4444;
  border: 1px solid rgba(239,68,68,0.3); font-weight: 600; cursor: pointer;
  transition: all var(--t-fast);
  &:hover { background: rgba(239,68,68,0.2); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}
.btn-danger-icon {
  color: var(--c-danger, #ef4444) !important;
  &:hover { background: rgba(239,68,68,0.08) !important; }
}
</style>
