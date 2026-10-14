export function useTaskPage() {
  // ── Service layer ───────────────────────────────────────────────────────────
  const taskStore = useTaskStore()
  const translationStore = useTranslationStore()
  const { tr } = useTr()

  // ── Shared composables ──────────────────────────────────────────────────────
  const { eventStore, init } = useEventPage(() => taskStore.fetchTasks(0), 30_000)
  const crud = useModalCrud()
  const { langStore } = useLangTabs()

  // ── AI translate toggle ─────────────────────────────────────────────────────
  const autoTranslate = ref(false)

  // ── Form ────────────────────────────────────────────────────────────────────
  const defaultForm = () => ({
    title: '',
    priority: 'medium',
    status: 'pending',
    dueDate: '',
    assignee: '',
    assignedToId: '',
    notes: '',
  })
  const form = reactive(defaultForm())

  // ── Computed ────────────────────────────────────────────────────────────────
  const statusFilters = computed(() => [
    { value: 'all',         label: tr('common.all'),          icon: 'ri-list-check' },
    { value: 'pending',     label: tr('status.pending'),      icon: 'ri-circle-line' },
    { value: 'in-progress', label: tr('status.in_progress'),  icon: 'ri-loader-4-line' },
    { value: 'completed',   label: tr('status.completed'),    icon: 'ri-checkbox-circle-line' },
  ])

  const priorityFilters = computed(() => [
    { value: 'all',    label: tr('priority.all') },
    { value: 'urgent', label: tr('priority.urgent') },
    { value: 'high',   label: tr('priority.high') },
    { value: 'medium', label: tr('priority.medium') },
    { value: 'low',    label: tr('priority.low') },
  ])

  const kanbanColumns = computed(() => [
    { status: 'pending',     label: tr('status.pending'),     color: 'var(--c-muted)',   tasks: taskStore.tasks.filter((t) => t.status === 'pending') },
    { status: 'in-progress', label: tr('status.in_progress'), color: 'var(--c-accent)',  tasks: taskStore.tasks.filter((t) => t.status === 'in-progress') },
    { status: 'completed',   label: tr('status.completed'),   color: 'var(--c-success)', tasks: taskStore.tasks.filter((t) => t.status === 'completed') },
  ])

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const priorityBadge = (p) =>
    ({ urgent: 'badge-danger', high: 'badge-danger', medium: 'badge-accent', low: 'badge-muted' }[p] ?? 'badge-muted')

  const priorityLabel = (p) =>
    ({ urgent: tr('priority.urgent'), high: tr('priority.high'),
       medium: tr('priority.medium'), low: tr('priority.low') }[p] ?? p)

  const isOverdue = (task) => {
    if (task.status === 'completed' || task.status === 'cancelled' || !task.dueDate) return false
    return new Date(task.dueDate) < new Date(new Date().toDateString())
  }

  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : '')

  // ── Modal handlers (wrap crud composable) ──────────────────────────────────
  const openAdd = (status = 'pending') => {
    autoTranslate.value = false
    form.status = status
    crud.openAdd(() => Object.assign(form, defaultForm(), { status }))
  }

  const openEdit = (task) =>
    crud.openEdit(task, (t) => Object.assign(form, {
      title: t.title, priority: t.priority, status: t.status,
      dueDate: t.dueDate, assignee: t.assignee, assignedToId: t.assignedToId, notes: t.notes,
    }))

  // ── CRUD ────────────────────────────────────────────────────────────────────
  const save = async () => {
    if (!form.title?.trim()) return useToastStore().error('Title is required', 'Validation')
    await crud.save(
      async () => {
        const result = await taskStore.addTask({ ...form })
        if (result?.data && autoTranslate.value) _aiTranslate(result.data.id)
        return result
      },
      () => taskStore.updateTask(crud.editingItem.value.id, { ...form }),
    )
  }

  const _aiTranslate = (taskId) => {
    const langs = langStore.activeItems.length
      ? langStore.activeItems
      : [{ code: 'en', name: 'English' }, { code: 'km', name: 'Khmer' }]
    const input = {}
    if (form.title) input['title'] = form.title
    if (form.notes) input['notes'] = form.notes
    if (!Object.keys(input).length) return
    translationStore.aiTranslate(input, langs, {
      keyPrefix: `task.${taskId}`, feature: 'task', referenceId: taskId,
    }).then(() => useToastStore().success('Translations saved', 'AI')).catch(() => {})
  }

  const completeTask = async (taskId) => {
    const result = await taskStore.completeTask(taskId)
    if (result?.data) useToastStore().success('Task completed', 'Done')
    else useToastStore().error(result?.error || 'Failed', 'Error')
  }

  const confirmDelete = (task) => crud.confirmDelete(task)

  const doDelete = () =>
    crud.doDelete((task) => taskStore.deleteTask(task.id))

  return {
    taskStore,
    eventStore,
    // spread crud state so page can use them directly
    ...crud,
    // form
    form,
    autoTranslate,
    // computed
    statusFilters,
    priorityFilters,
    kanbanColumns,
    // helpers
    tr,
    priorityBadge,
    priorityLabel,
    isOverdue,
    fmtDate,
    // methods
    init,
    openAdd,
    openEdit,
    save,
    completeTask,
    confirmDelete,
    doDelete,
  }
}
