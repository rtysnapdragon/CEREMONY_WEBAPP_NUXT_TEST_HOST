<template>
  <RWrapperPage>
    <RContent>
    <RTable
      :key="`users-${users.length > 0 ? 'loaded' : 'empty'}`"
      :columns="tableColumns"
      :data="users"
      :loading="loading"
      :options="{ searchable: true }"
      @reloadByFixedData="fetchUsers()"
    >
      <template #headerRight>
        <RBtn
          v-if="canCreate"
          type="add"
          :label="tr('add_user')"
          icon="add"
          @click="showCreateModal = true"
        />
      </template>
      <template #name="{ rowData }">
        <div class="um-user-cell">
          <RAvatar
            :src="rowData.avatar"
            size="sm"
            shape="circle"
            :chip="rowData.status == 'ACTIVE' ? true : false"
            :clickable="!!rowData.avatar"
            @click.stop="rowData.avatar && openAvatarViewer(rowData)"
          />
          <div>
            <div class="um-fullname">
              {{ rowData.firstName }} {{ rowData.lastName }}
            </div>
            <div class="um-phone">{{ rowData.phone || "—" }}</div>
          </div>
        </div>
      </template>
      <template #username="{ rowData }">
        <span class="um-td-mono">{{ rowData.username }}</span>
      </template>
      <template #email="{ rowData }">
        <span class="um-td-mono">{{ rowData.email }}</span>
      </template>
      <template #status="{ rowData }">
        <span
          class="um-status-badge"
          :class="rowData.status === 'ACTIVE' ? 'active' : 'inactive'"
        >
          {{ rowData.status }}
        </span>
      </template>
      <template #roles="{ rowData }">
        <div class="um-roles">
          <span v-for="r in rowData.roles" :key="r" class="um-role-badge">{{
            r
          }}</span>
        </div>
      </template>
      <template #actions="{ rowData }">
        <RTblBtns
          :items="[
            {
              type: 'update',
              label: tr('update'),
              icon: 'ri-pencil-line',
              color: 'update',
            },
            {
              type: 'view',
              label: tr('view'),
              icon: 'ri-eye-line',
              color: 'primary',
            },
            ...(canAssignRole
              ? [
                  {
                    type: 'add',
                    label: tr('assign_role'),
                    icon: 'ri-shield-user-line',
                    color: 'danger',
                  },
                ]
              : []),
          ]"
          @actionClick="
            (type, action) => {
              type === 'view' ? viewUser(rowData) : openAssignRole(rowData);
            }
          "
        />
      </template>
    </RTable>
    </RContent>

    <AssignRoleModal
      v-if="canAssignRole"
      v-model="showAssignRole"
      :user="selectedUser"
      :user-id="selectedUser?.id"
      @saved="fetchUsers"
    />

    <!-- Create User Modal -->
    <RSlider
      :title="tr('add_user')"
      v-model="showCreateModal"
      icon="ri-user-add-line"
      description="Add a new user"
    >
      <RForm @onSubmit="createUser">
        <div class="form-row-2">
          <RFormGroup :label="tr('first_name')">
            <RInput
              v-model="createForm.firstName"
              :placeholder="tr('first_name')"
            />
          </RFormGroup>
          <RFormGroup :label="tr('last_name')">
            <RInput
              v-model="createForm.lastName"
              :placeholder="tr('last_name')"
            />
          </RFormGroup>
        </div>
        <RFormGroup :label="tr('username')" required>
          <RInput v-model="createForm.username" :placeholder="tr('username')" />
        </RFormGroup>
        <RFormGroup :label="tr('email')" required>
          <RInput
            v-model="createForm.email"
            :placeholder="tr('email')"
            type="email"
          />
        </RFormGroup>
        <RFormGroup :label="tr('password')" required>
          <RInput
            v-model="createForm.password"
            :type="showPw ? 'text' : 'password'"
            :placeholder="tr('password')"
          >
            <template #trailling>
              <button
                type="button"
                class="btn-icon um-pw-toggle"
                @click="showPw = !showPw"
              >
                <i :class="showPw ? 'ri-eye-off-line' : 'ri-eye-line'" />
              </button>
            </template>
          </RInput>
        </RFormGroup>
        <div class="form-row-2">
          <RFormGroup :label="tr('gender')">
            <RSelect
              v-model="createForm.gender"
              pk="value"
              default-select="MALE"
              :local-data="{
                data: [
                  { value: 'MALE', Name: 'Male' },
                  { value: 'FEMALE', Name: 'Female' },
                  { value: 'OTHER', Name: 'Other' },
                ],
              }"
            />
          </RFormGroup>
          <RFormGroup :label="tr('phone')">
            <RInput v-model="createForm.phone" placeholder="+855..." />
          </RFormGroup>
        </div>
        <RFormGroup :label="tr('role')">
          <RSelect
            v-model="createForm.roleId"
            pk="value"
            :local-data="{
              data: [...roles.map((r) => ({ value: r.id, Name: r.name }))],
            }"
          />
        </RFormGroup>
      </RForm>
      <template #footer class="modal-footer">
        <RBtn
          type="cancel"
          icon="cancel"
          label="cancel"
          :loading="creating"
          :disabled="creating"
        />
        <RBtn
          type="save"
          icon="save"
          label="save"
          :loading="creating"
          :disabled="creating"
        />
      </template>
    </RSlider>

    <MediaViewer
      v-model="avatarViewerOpen"
      :items="avatarViewerItems"
      :index="0"
    />
  </RWrapperPage>
</template>

<script setup>
definePageMeta({
  layout: "navbar",
  middleware: ["auth", "permission"],
  title: "user_management",
  permission: "VIEW_USER",
});

const { tr } = useTr();
const {
  authStore,
  canAssignRole,
  canCreate,
  users,
  loading,
  search,
  page,
  pageSize,
  totalPages,
  totalElements,
  selectedUser,
  showAssignRole,
  avatarViewerOpen,
  avatarViewerItems,
  showCreateModal,
  showPw,
  creating,
  roles,
  createForm,
  init,
  fetchUsers,
  onSearch,
  changePage,
  openAssignRole,
  openAvatarViewer,
  viewUser,
  closeCreate,
  createUser,
} = useUserManagementPage();
onMounted(init);

const tableColumns = [
  { key: "name", label: tr("name"), sortable: true },
  { key: "username", label: tr("username"), sortable: true },
  { key: "email", label: tr("email") },
  { key: "status", label: tr("status") },
  { key: "roles", label: tr("roles") || "Roles" },
  { key: "actions", label: tr("actions"), width: "80px", align: "center" },
];

usePageBreadcrumb({
  title: tr("user_management"),
  description: "Manage organization users",
  extra: [
    canCreate.value
      ? {
          icon: "add",
          title: tr("add_user"),
          onClick: () => (showCreateModal.value = true),
        }
      : null,
  ],
});
</script>

<style lang="scss">
.users-page {
  display: flex;
  flex-direction: column;
  gap: var(--sp-5);
}

.um-search-row {
  display: flex;
}
.search-wrap {
  position: relative;
  flex: 1;
  max-width: 360px;
  i {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--c-muted);
    pointer-events: none;
  }
}
.um-search {
  padding-left: 2.25rem !important;
  width: 100%;
}

.um-td-mono {
  font-family: monospace;
  font-size: 0.8125rem;
  color: var(--c-muted);
}

.um-user-cell {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
}
.um-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  flex-shrink: 0;
  background: rgba(255, 140, 66, 0.15);
  color: var(--c-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.8125rem;
}
.um-fullname {
  font-weight: 600;
  font-size: 0.875rem;
}
.um-phone {
  font-size: 0.75rem;
  color: var(--c-muted);
}

.um-status-badge {
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.6875rem;
  font-weight: 700;
  &.active {
    background: rgba(34, 197, 94, 0.12);
    color: #16a34a;
  }
  &.inactive {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
  }
}

.um-roles {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.um-role-badge {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.625rem;
  font-weight: 700;
  background: rgba(255, 140, 66, 0.1);
  color: var(--c-accent);
  text-transform: uppercase;
}

.um-actions {
  display: flex;
  gap: 4px;
  align-items: center;
}
.um-create-modal {
  width: 520px;
  max-width: calc(100vw - 2rem);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}
.um-create-modal .modal-form {
  flex: 1;
  overflow-y: auto;
}
.um-required {
  color: var(--c-danger, #ef4444);
  margin-left: 2px;
}
.um-pw-wrap {
  position: relative;
}
.um-pw-toggle {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
}
.um-assign-btn {
  color: #9333ea !important;
  &:hover {
    background: rgba(147, 51, 234, 0.08) !important;
  }
}

.um-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-3);
  padding: var(--sp-4);
  border-top: 1px solid var(--c-border);
}
.um-pg-btn {
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.um-pg-info {
  font-size: 0.875rem;
  color: var(--c-muted);
  font-weight: 600;
}
</style>
