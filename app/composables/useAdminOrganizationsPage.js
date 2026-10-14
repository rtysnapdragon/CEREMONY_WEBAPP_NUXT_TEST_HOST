export function useAdminOrganizationsPage() {
  const toast = useToast()

  const loading = ref(false)
  const orgs = ref([])
  const search = ref('')
  const filterStatus = ref('')

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

  const init = async () => {
    await nextTick()
    await fetchOrgs()
  }

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

  const showDetail = ref(false)
  const detailOrg = ref(null)

  const openDetail = (org) => { detailOrg.value = org; showDetail.value = true }

  const openAssignFromDetail = () => {
    showDetail.value = false
    nextTick(() => openAssign(detailOrg.value))
  }

  const formatDate = (dt) => {
    if (!dt) return '—'
    return new Date(dt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

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

  const assignPlan = async () => {
    if (!selectedPlanName.value || !selected.value) return
    assigning.value = true
    try {
      const { error } = await useHttp(`/api/v1/organizations/${selected.value.id}`, {
        method: 'PUT',
        data: { name: selected.value.name, subscriptionPlan: selectedPlanName.value },
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

  return {
    loading, orgs, search, filterStatus, filteredRows,
    showDetail, detailOrg,
    showAssign, selected, selectedPlanName, availablePlans, plansLoading, assigning,
    init, fetchOrgs, openDetail, openAssignFromDetail, formatDate,
    openAssign, assignPlan, planClass, planIcon, planIconClass,
  }
}
