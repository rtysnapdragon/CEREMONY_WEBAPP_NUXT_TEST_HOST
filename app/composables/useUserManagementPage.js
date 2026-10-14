export function useUserManagementPage() {
  const authStore = useAuthStore()
  const toast = useToastStore()
  const localePath = (p) => p

  const canAssignRole = computed(() => authStore.permissions.includes('ASSIGN_ROLE'))
  const canCreate = computed(() => authStore.permissions.includes('CREATE_USER'))

  const users = ref([])
  const loading = ref(false)
  const search = ref('')
  const page = ref(0)
  const pageSize = 20
  const totalPages = ref(1)

  let searchTimer

  const resolveAvatar = (avatar) => {
    if (!avatar) return null
    if (avatar.startsWith('http')) return avatar
    const base = (helper().config.apiUrl || '').replace(/\/$/, '')
    return `${base}${avatar}`
  }

  const fromApi = (u) => ({
    ...u,
    avatar: resolveAvatar(u.avatar),
    roles: u.roles || [],
  })

  const fetchUsers = async () => {
    loading.value = true
    try {
      const searchParam = search.value ? `&search=${encodeURIComponent(search.value)}` : ''
      const { data, error } = await useHttp(
        `/api/v1/users?page=${page.value}&size=${pageSize}${searchParam}&pagination=true`,
        { method: 'GET', isGlobal: true }
      )
      if (error.value) throw new Error(error.value)
      const result = data.value?.data ?? data.value
      users.value = (result?.content || []).map(fromApi)
      totalPages.value = result?.totalPages || 1
    } catch {
      toast.add('Failed to load users', 'Error')
    } finally {
      loading.value = false
    }
  }

  const onSearch = () => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(() => { page.value = 0; fetchUsers() }, 350)
  }

  const changePage = (p) => { page.value = p; fetchUsers() }

  const selectedUser = ref(null)
  const showAssignRole = ref(false)
  const openAssignRole = (user) => { selectedUser.value = user; showAssignRole.value = true }

  const avatarViewerOpen = ref(false)
  const avatarViewerItems = ref([])
  const openAvatarViewer = (user) => {
    avatarViewerItems.value = [{
      fileUrl: user.avatar, thumbnailUrl: user.avatar,
      altText: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
      mediaType: 'IMAGE',
    }]
    avatarViewerOpen.value = true
  }

  const viewUser = (user) => {
    navigateTo(localePath(`/user_and_privilege/user_management/info?user=${user.id}`))
  }

  // Create user
  const showCreateModal = ref(false)
  const showPw = ref(false)
  const creating = ref(false)
  const roles = ref([])

  const defaultCreateForm = () => ({
    username: '', email: '', password: '',
    firstName: '', lastName: '', gender: '', phone: '', roleId: '',
  })
  const createForm = reactive(defaultCreateForm())

  const fetchRoles = async () => {
    if (roles.value.length) return
    const { data } = await useHttp('/api/v1/roles', { method: 'GET', isGlobal: true })
    roles.value = data.value?.data ?? data.value ?? []
  }

  const closeCreate = () => {
    showCreateModal.value = false
    showPw.value = false
    Object.assign(createForm, defaultCreateForm())
  }

  watch(showCreateModal, (val) => { if (val) fetchRoles() })

  const createUser = async () => {
    creating.value = true
    try {
      const payload = {
        username: createForm.username,
        email: createForm.email,
        password: createForm.password,
        ...(createForm.firstName && { firstName: createForm.firstName }),
        ...(createForm.lastName  && { lastName:  createForm.lastName }),
        ...(createForm.gender    && { gender:    createForm.gender }),
        ...(createForm.phone     && { phone:     createForm.phone }),
        ...(createForm.roleId    && { roleId:    createForm.roleId }),
      }
      const { error } = await useHttp('/api/v1/users', { method: 'POST', body: payload, isGlobal: true })
      if (error.value) throw new Error(error.value?.message || 'Failed to create user')
      toast.add('User created successfully', 'Success')
      closeCreate()
      await fetchUsers()
    } catch (e) {
      toast.add(e?.message || 'Failed to create user', 'Error')
    } finally {
      creating.value = false
    }
  }

  const init = () => fetchUsers()

  return {
    authStore, canAssignRole, canCreate,
    users, loading, search, page, pageSize, totalPages,
    selectedUser, showAssignRole,
    avatarViewerOpen, avatarViewerItems,
    showCreateModal, showPw, creating, roles, createForm,
    init, fetchUsers, onSearch, changePage,
    openAssignRole, openAvatarViewer, viewUser,
    fetchRoles, closeCreate, createUser,
  }
}
