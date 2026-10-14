<template>
    <h1>User Management</h1>
    <RWrapperPage>
    <!-- Basic Usage -->
    <RTable
      :data="users"
      :columns="columns"
      :options="tableOptions"
      :loading="loading"
      :selected-pk="'id'"
      :checkbox="true"
      :store-id="'users-table'"
      @update:modelValue="handleSelectionChange"
      @reloadByFixedData="handleReload"
    >
      <!-- Header Slots -->
      <template #headerLeft>
        <div class="header-left-actions">
          <UButton color="primary" @click="addUser">
            <UIcon name="i-ri-add-line" />
            Add User
          </UButton>
        </div>
      </template>

      <template #headerRight>
        <div class="header-right-actions">
          <UButton color="error" @click="deleteSelected" :disabled="selectedUsers.length === 0">
            <UIcon name="i-ri-delete-bin-line" />
            Delete Selected ({{ selectedUsers.length }})
          </UButton>
        </div>
      </template>

      <!-- Column Slots for Custom Rendering -->
      <template #name="{ rowData, value }">
        <div class="user-name-cell">
          <UAvatar :src="rowData.avatar" size="sm" />
          <span>{{ value }}</span>
        </div>
      </template>

      <template #status="{ rowData, value }">
        <UBadge :color="getStatusColor(value)">
          {{ value }}
        </UBadge>
      </template>

      <template #actions="{ rowData }">
        <div class="action-buttons">
          <UButton color="primary" variant="ghost" size="sm" @click="editUser(rowData)">
            <UIcon name="i-ri-edit-line" />
          </UButton>
          <UButton color="error" variant="ghost" size="sm" @click="deleteUser(rowData)">
            <UIcon name="i-ri-delete-bin-line" />
          </UButton>
        </div>
      </template>

      <!-- Card Template for Mobile -->
      <template #card="{ row, index }">
        <div class="mobile-card">
          <div class="card-header">
            <h3>{{ row.name }}</h3>
            <UBadge :color="getStatusColor(row.status)">{{ row.status }}</UBadge>
          </div>
          <div class="card-body">
            <p><strong>Email:</strong> {{ row.email }}</p>
            <p><strong>Role:</strong> {{ row.role }}</p>
            <p><strong>Department:</strong> {{ row.department }}</p>
          </div>
          <div class="card-actions">
            <UButton color="primary" size="sm" @click="editUser(row)">Edit</UButton>
            <UButton color="error" size="sm" @click="deleteUser(row)">Delete</UButton>
          </div>
        </div>
      </template>
    </RTable>
  </RWrapperPage>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
definePageMeta({layout: 'navbar'})
// ─── State ────────────────────────────────────────────────────────────────────
const loading = ref(false)
const selectedUsers = ref([])
const users = ref([])

// ─── Table Configuration ─────────────────────────────────────────────────────
const columns = [
  {
    key: 'name',
    label: 'Name',
    sortable: true,
    className: '', // Will collapse on mobile
  },
  {
    key: 'email',
    label: 'Email',
    sortable: true,
    className: 'width', // Fixed width, never collapses
  },
  {
    key: 'role',
    label: 'Role',
    sortable: true,
    className: 'width', // Always collapses to expanded row on mobile
  },
  {
    key: 'department',
    label: 'Department',
    sortable: true,
    className: 'min-width',
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    className: 'width',
  },
  {
    key: 'actions',
    label: 'Actions',
    sortable: false,
    className: 'width',
    slot: '#actions' // Uses the actions slot above
  }
]

const tableOptions = {
  showNoData: true,
  pageSize: 10,
  pageSizes: [10, 25, 50, 100],
  info: true, // Show "Showing X to Y of Z entries"
  paging: true, // Show pagination controls
  rowCallback: (row) => {
    // Add custom row properties
    return {
      ...row,
      _rowClass: row.status === 'active' ? 'row-active' : 'row-inactive'
    }
  }
}

// ─── Methods ──────────────────────────────────────────────────────────────────
const getStatusColor = (status) => {
  const colors = {
    active: 'success',
    inactive: 'error',
    pending: 'warning',
    archived: 'neutral'
  }
  return colors[status] || 'neutral'
}

const handleSelectionChange = (selected) => {
  selectedUsers.value = selected
  console.log('Selected users:', selected)
}

const handleReload = () => {
  console.log('Reload triggered')
  fetchUsers()
}

// ─── CRUD Operations ─────────────────────────────────────────────────────────
const fetchUsers = async () => {
  loading.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    users.value = [
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Admin',
        department: 'IT',
        status: 'active',
        avatar: 'https://i.pravatar.cc/150?u=1'
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'Manager',
        department: 'Marketing',
        status: 'active',
        avatar: 'https://i.pravatar.cc/150?u=2'
      },
      {
        id: 3,
        name: 'Bob Johnson',
        email: 'bob@example.com',
        role: 'Developer',
        department: 'IT',
        status: 'pending',
        avatar: 'https://i.pravatar.cc/150?u=3'
      },
      {
        id: 4,
        name: 'Alice Brown',
        email: 'alice@example.com',
        role: 'Designer',
        department: 'Design',
        status: 'inactive',
        avatar: 'https://i.pravatar.cc/150?u=4'
      },
      {
        id: 5,
        name: 'Charlie Wilson',
        email: 'charlie@example.com',
        role: 'Developer',
        department: 'IT',
        status: 'active',
        avatar: 'https://i.pravatar.cc/150?u=5'
      }
    ]
  } catch (error) {
    console.error('Error fetching users:', error)
  } finally {
    loading.value = false
  }
}

const addUser = () => {
  // Navigate to add user page or open modal
  console.log('Add new user')
}

const editUser = (user) => {
  console.log('Edit user:', user)
  // Open edit modal or navigate to edit page
}

const deleteUser = (user) => {
  if (confirm(`Delete user "${user.name}"?`)) {
    console.log('Delete user:', user)
    users.value = users.value.filter(u => u.id !== user.id)
  }
}

const deleteSelected = () => {
  if (selectedUsers.value.length === 0) return
  if (confirm(`Delete ${selectedUsers.value.length} selected users?`)) {
    const ids = new Set(selectedUsers.value.map(u => u.id))
    users.value = users.value.filter(u => !ids.has(u.id))
    selectedUsers.value = []
  }
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(() => {
  fetchUsers()
})

// ─── Expose ──────────────────────────────────────────────────────────────────
defineExpose({
  fetchUsers,
  selectedUsers,
  users
})
</script>

<style scoped>
.page-container {
  margin: 0 auto;
}

/* Header custom styling */
.header-left-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-right-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Cell custom styling */
.user-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name-cell span {
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

/* Mobile Card Styling */
.mobile-card {
  background: var(--ui-bg);
  border: 1px solid var(--ui-border);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.card-body {
  margin-bottom: 12px;
}

.card-body p {
  margin: 6px 0;
  font-size: 14px;
}

.card-actions {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--ui-border);
}

/* Row custom classes (from rowCallback) */
:deep(.row-active) {
  background-color: rgba(16, 185, 129, 0.05);
}

:deep(.row-inactive) {
  background-color: rgba(239, 68, 68, 0.05);
  opacity: 0.7;
}
</style>