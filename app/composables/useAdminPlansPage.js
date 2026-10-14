const FEATURE_LABELS = {
  telegramInvite: 'Telegram Invite',
  emailInvite: 'Email Invite',
  gallery: 'Gallery',
  wishes: 'Wishes',
  reports: 'Reports',
  exportGuest: 'Export Guests',
  budgetManagement: 'Budget',
  taskManagement: 'Tasks',
}

export function useAdminPlansPage() {
  const toast = useToastStore()
  const authStore = useAuthStore()
  const confirm = useConfirmStore()

  const plans = ref([])
  const loading = ref(false)
  const fetchError = ref(null)
  const showModal = ref(false)
  const editingPlan = ref(null)
  const saving = ref(false)

  const defaultForm = () => ({
    name: '', displayName: '', description: '', active: true,
    maxEvents: 1, maxGuestsPerEvent: 100, maxUsers: 3,
    telegramInvite: false, emailInvite: false, gallery: false,
    wishes: false, reports: false, exportGuest: false,
    budgetManagement: true, taskManagement: true,
  })
  const form = reactive(defaultForm())

  const fetchPlans = async () => {
    loading.value = true
    fetchError.value = null
    try {
      const { data, error } = await useHttp('/api/v1/admin/subscription-plans', { method: 'GET', isGlobal: true })
      if (error?.value) {
        fetchError.value = error.value?.message ?? 'Failed to load subscription plans'
        toast.add(fetchError.value, 'Error')
        return
      }
      plans.value = data.value?.data ?? data.value ?? []
    } catch (e) {
      fetchError.value = e?.message ?? 'Unexpected error loading plans'
      toast.add(fetchError.value, 'Error')
    } finally {
      loading.value = false
    }
  }

  const init = async () => {
    await nextTick()
    await fetchPlans()
  }

  watch(() => authStore.isAuthenticated, (val) => {
    if (val && plans.value.length === 0 && !loading.value) fetchPlans()
  })

  const openCreate = () => {
    editingPlan.value = null
    Object.assign(form, defaultForm())
    showModal.value = true
  }

  const openEdit = (plan) => {
    editingPlan.value = plan
    Object.assign(form, { ...plan })
    showModal.value = true
  }

  const closeModal = () => { showModal.value = false; editingPlan.value = null }

  const savePlan = async () => {
    saving.value = true
    try {
      const url = editingPlan.value
        ? `/api/v1/admin/subscription-plans/${editingPlan.value.id}`
        : '/api/v1/admin/subscription-plans'
      const method = editingPlan.value ? 'PUT' : 'POST'
      const { error } = await useHttp(url, { method, body: { ...form, name: form.name.toUpperCase() }, isGlobal: true })
      if (error?.value) throw error.value
      toast.add(editingPlan.value ? 'Plan updated' : 'Plan created', 'Success')
      closeModal()
      await fetchPlans()
    } catch (err) {
      toast.add(err?.response?._data?.message ?? 'Failed to save plan', 'Error')
    } finally {
      saving.value = false
    }
  }

  const confirmDelete = (plan) => {
    confirm.show({
      type: 'delete',
      title: 'Delete Plan',
      description: `Delete plan "${plan.name}"? This cannot be undone.`,
      onConfirm: async () => {
        const { error } = await useHttp(`/api/v1/admin/subscription-plans/${plan.id}`, { method: 'DELETE', isGlobal: true })
        if (error?.value) { toast.add('Failed to delete plan', 'Error'); return }
        toast.add('Plan deleted', 'Success')
        await fetchPlans()
      },
    })
  }

  return {
    FEATURE_LABELS,
    plans, loading, fetchError, showModal, editingPlan, saving, form,
    init, fetchPlans, openCreate, openEdit, closeModal, savePlan, confirmDelete,
  }
}
