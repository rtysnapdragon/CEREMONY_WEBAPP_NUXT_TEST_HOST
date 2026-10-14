const PERM_GROUPS = [
  { label: 'User Management',  icon: 'ri-user-settings-line',       colorClass: 'pg-blue',
    codes: ['VIEW_USER', 'CREATE_USER', 'UPDATE_USER', 'DELETE_USER', 'ASSIGN_ROLE'] },
  { label: 'Role Management',  icon: 'ri-shield-keyhole-line',       colorClass: 'pg-purple',
    codes: ['ROLE_VIEW', 'ROLE_CREATE', 'ROLE_UPDATE', 'ROLE_DELETE'] },
  { label: 'Wedding',          icon: 'ri-hearts-line',               colorClass: 'pg-pink',
    codes: ['VIEW_WEDDING', 'CREATE_WEDDING', 'UPDATE_WEDDING', 'DELETE_WEDDING', 'WEDDING_SETTING'] },
  { label: 'Guest',            icon: 'ri-group-line',                colorClass: 'pg-teal',
    codes: ['VIEW_GUEST', 'CREATE_GUEST', 'UPDATE_GUEST', 'DELETE_GUEST', 'EXPORT_GUEST_LIST'] },
  { label: 'Invitation',       icon: 'ri-mail-send-line',            colorClass: 'pg-orange',
    codes: ['SEND_INVITATION', 'RESEND_INVITATION', 'VIEW_NOTIFICATION'] },
  { label: 'Table & Seating',  icon: 'ri-layout-grid-line',          colorClass: 'pg-indigo',
    codes: ['VIEW_TABLE', 'CREATE_TABLE', 'UPDATE_TABLE', 'DELETE_TABLE', 'ASSIGN_GUEST_TABLE', 'VIEW_SEATING'] },
  { label: 'Finance',          icon: 'ri-money-dollar-circle-line',  colorClass: 'pg-green',
    codes: ['VIEW_FINANCE', 'MANAGE_BUDGET', 'ADD_GIFT_RECORD', 'EXPORT_FINANCE_REPORT'] },
  { label: 'Task',             icon: 'ri-task-line',                 colorClass: 'pg-yellow',
    codes: ['VIEW_TASK', 'CREATE_TASK', 'UPDATE_TASK', 'DELETE_TASK', 'ASSIGN_TASK'] },
  { label: 'Ceremony',         icon: 'ri-music-line',                colorClass: 'pg-rose',
    codes: ['VIEW_CEREMONY', 'CREATE_CEREMONY', 'UPDATE_CEREMONY', 'DELETE_CEREMONY'] },
  { label: 'Check-in',         icon: 'ri-qr-code-line',              colorClass: 'pg-cyan',
    codes: ['CHECKIN_GUEST', 'MANUAL_CHECKIN', 'VIEW_CHECKIN_LOG'] },
  { label: 'Reports',          icon: 'ri-bar-chart-line',            colorClass: 'pg-slate',
    codes: ['EXPORT_REPORT', 'VIEW_SECURITY_REPORT', 'VIEW_AUDIT_LOGS', 'EXPORT_FINANCE_REPORT'] },
  { label: 'Platform',         icon: 'ri-settings-4-line',           colorClass: 'pg-red',
    codes: ['ORG_VIEW', 'ORG_CREATE', 'ORG_UPDATE', 'ORG_DELETE', 'ACCOUNT_BLOCK', 'SUBSCRIPTION_MANAGE', 'SYSTEM_MONITORING', 'MANAGE_GLOBAL_SETTINGS'] },
]

export function useGroupManagementPage() {
  const authStore = useAuthStore()
  const toast = useToastStore()

  const canCreate = computed(() => authStore.permissions.includes('ROLE_CREATE'))
  const canUpdate = computed(() => authStore.permissions.includes('ROLE_UPDATE'))
  const canDelete = computed(() => authStore.permissions.includes('ROLE_DELETE'))

  const filter       = ref('')
  const roles        = ref([])
  const allPermissions = ref([])
  const loading      = ref(false)
  const permsLoading = ref(false)
  const saving       = ref(false)
  const deleting     = ref(false)
  const activeRole   = ref(null)
  const showDetail   = ref(false)
  const showEdit     = ref(false)
  const deleteTarget = ref(null)

  const form = reactive({ id: null, name: '', description: '', permissionIds: [] })

  const filteredRoles = computed(() => {
    const q = filter.value.toLowerCase()
    if (!q) return roles.value
    return roles.value.filter(r =>
      r.name?.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q)
    )
  })

  const permGroups = computed(() => PERM_GROUPS)

  const codeToPermMap = computed(() => {
    const m = {}
    allPermissions.value.forEach(p => { m[p.code] = p })
    return m
  })

  const hasPermission = (code) => {
    const rolePerms = activeRole.value?.permissions || []
    return rolePerms.some(p => (p.code || p) === code)
  }

  const assignedInGroup  = (group) => group.codes.filter(c => hasPermission(c)).length
  const selectedInGroup  = (group) =>
    group.codes.filter(c => { const p = codeToPermMap.value[c]; return p && form.permissionIds.includes(p.id) }).length
  const allGroupSelected = (group) =>
    group.codes.every(c => { const p = codeToPermMap.value[c]; return p && form.permissionIds.includes(p.id) })
  const groupPerms       = (group) => group.codes.map(c => codeToPermMap.value[c]).filter(Boolean)
  const unknownGroupCodes = (group) => group.codes.filter(c => !codeToPermMap.value[c])

  const roleIcon = (name = '') => {
    const n = name.toUpperCase()
    if (n.includes('SUPER') || n.includes('ADMIN')) return 'ri-shield-star-line'
    if (n.includes('OWNER'))      return 'ri-vip-crown-line'
    if (n.includes('MANAGER'))    return 'ri-user-settings-line'
    if (n.includes('CHECKIN'))    return 'ri-qr-code-line'
    if (n.includes('ACCOUNTANT')) return 'ri-money-dollar-circle-line'
    if (n.includes('INVITATION')) return 'ri-mail-send-line'
    if (n.includes('TABLE'))      return 'ri-layout-grid-line'
    if (n.includes('CEREMONY'))   return 'ri-music-line'
    if (n.includes('SECURITY'))   return 'ri-shield-check-line'
    if (n.includes('VIEWER'))     return 'ri-eye-line'
    return 'ri-user-line'
  }

  const roleIconClass = (name = '') => {
    const n = name.toUpperCase()
    if (n.includes('SUPER') || n.includes('ADMIN')) return 'ri-danger'
    if (n.includes('OWNER'))      return 'ri-gold'
    if (n.includes('MANAGER'))    return 'ri-purple'
    if (n.includes('CHECKIN'))    return 'ri-cyan'
    if (n.includes('ACCOUNTANT')) return 'ri-green'
    if (n.includes('INVITATION')) return 'ri-orange'
    if (n.includes('TABLE'))      return 'ri-indigo'
    if (n.includes('CEREMONY'))   return 'ri-rose'
    if (n.includes('SECURITY'))   return 'ri-blue'
    return 'ri-default'
  }

  const toggleGroup = (group) => {
    const ids = groupPerms(group).map(p => p.id)
    if (allGroupSelected(group)) {
      form.permissionIds = form.permissionIds.filter(id => !ids.includes(id))
    } else {
      ids.forEach(id => { if (!form.permissionIds.includes(id)) form.permissionIds.push(id) })
    }
  }

  const openDetail = (role) => { activeRole.value = role; showDetail.value = true }

  const startEditFromDetail = () => {
    showDetail.value = false
    nextTick(() => startEdit(activeRole.value))
  }

  const startNew = async () => {
    form.id = null; form.name = ''; form.description = ''; form.permissionIds = []
    showEdit.value = true
    await ensurePermissions()
  }

  const startEdit = async (role) => {
    activeRole.value = role
    await ensurePermissions()
    form.id = role.id
    form.name = role.name
    form.description = role.description || ''
    form.permissionIds = (role.permissions || [])
      .map(p => codeToPermMap.value[p.code || p]?.id)
      .filter(Boolean)
    showEdit.value = true
  }

  const cancelEdit = () => { showEdit.value = false; form.permissionIds = [] }

  const saveRole = async () => {
    if (!form.name.trim()) return
    saving.value = true
    try {
      const body = { name: form.name.trim(), description: form.description.trim(), permissionIds: form.permissionIds }
      let saved
      if (form.id) {
        const { data, error } = await useHttp(`/api/v1/roles/${form.id}`, { method: 'PUT', body, isGlobal: true })
        if (error.value) throw new Error(error.value)
        saved = data.value?.data ?? data.value
        toast.add('Role updated', 'Success')
      } else {
        const { data, error } = await useHttp('/api/v1/roles', { method: 'POST', body, isGlobal: true })
        if (error.value) throw new Error(error.value)
        saved = data.value?.data ?? data.value
        toast.add('Role created', 'Success')
      }
      await fetchRoles()
      activeRole.value = roles.value.find(r => r.id === (saved?.id || form.id)) || null
      showEdit.value = false
    } catch {
      toast.add('Failed to save role', 'Error')
    } finally {
      saving.value = false
    }
  }

  const confirmDelete = (role) => { deleteTarget.value = role }

  const performDelete = async () => {
    if (!deleteTarget.value) return
    deleting.value = true
    try {
      const { error } = await useHttp(`/api/v1/roles/${deleteTarget.value.id}`, { method: 'DELETE', isGlobal: true })
      if (error.value) throw new Error(error.value)
      toast.add('Role deleted', 'Success')
      if (activeRole.value?.id === deleteTarget.value.id) { activeRole.value = null; showDetail.value = false }
      deleteTarget.value = null
      await fetchRoles()
    } catch {
      toast.add('Failed to delete role', 'Error')
    } finally {
      deleting.value = false
    }
  }

  const fetchRoles = async () => {
    loading.value = true
    try {
      const { data, error } = await useHttp('/api/v1/roles', { method: 'GET', isGlobal: true })
      if (error.value) throw new Error(error.value)
      roles.value = data.value?.data ?? data.value ?? []
    } catch {
      toast.add('Failed to load roles', 'Error')
    } finally {
      loading.value = false
    }
  }

  const ensurePermissions = async () => {
    if (allPermissions.value.length) return
    permsLoading.value = true
    try {
      const { data, error } = await useHttp('/api/v1/roles/permissions', { method: 'GET', isGlobal: true })
      if (error.value) throw new Error(error.value)
      allPermissions.value = data.value?.data ?? data.value ?? []
    } catch {
      toast.add('Failed to load permissions', 'Error')
    } finally {
      permsLoading.value = false
    }
  }

  return {
    authStore,
    canCreate, canUpdate, canDelete,
    filter, roles, allPermissions, loading, permsLoading, saving, deleting,
    activeRole, showDetail, showEdit, deleteTarget, form,
    filteredRoles, permGroups, codeToPermMap,
    hasPermission, assignedInGroup, selectedInGroup, allGroupSelected,
    groupPerms, unknownGroupCodes,
    roleIcon, roleIconClass, toggleGroup,
    openDetail, startEditFromDetail, startNew, startEdit, cancelEdit,
    saveRole, confirmDelete, performDelete, fetchRoles, ensurePermissions,
  }
}
