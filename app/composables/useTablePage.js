export function useTablePage() {
  const tableStore = useWeddingTableStore()
  const eventStore = useEventStore()
  const toast = useToastStore()

  const showModal = ref(false)
  const editing = ref(null)
  const saving = ref(false)
  const deletingItem = ref(null)
  const deleting = ref(false)

  const defaultForm = () => ({ tableNumber: '', tableName: '', capacity: 8, status: 'available' })
  const form = reactive(defaultForm())

  const { init } = useEventPage(() => tableStore.fetchTables(), 30_000)

  const totalCapacity = computed(() => tableStore.items.reduce((s, t) => s + (t.capacity ?? 0), 0))
  const totalSeated = computed(() => tableStore.items.reduce((s, t) => s + (t.occupancy ?? 0), 0))

  const stats = computed(() => [
    { key: 'total',  icon: 'ri-layout-grid-fill',    value: tableStore.items.length,                                    label: 'Total Tables',    color: 'var(--c-accent)',   bg: 'rgba(255,140,66,0.12)' },
    { key: 'cap',    icon: 'ri-group-fill',           value: totalCapacity.value,                                        label: 'Total Capacity',  color: 'var(--c-info)',     bg: 'rgba(96,165,250,0.12)' },
    { key: 'seated', icon: 'ri-user-fill',            value: totalSeated.value,                                          label: 'Seated Guests',   color: 'var(--c-success)',  bg: 'rgba(74,222,128,0.12)' },
    { key: 'avail',  icon: 'ri-checkbox-circle-fill', value: tableStore.items.filter((t) => t.status === 'available').length, label: 'Available', color: '#d4a843',           bg: 'rgba(212,168,67,0.12)' },
  ])

  const statusLabel = (s) => ({ available: 'Available', full: 'Full', reserved: 'Reserved' }[s] ?? s)
  const statusBadge = (s) => ({ available: 'badge-success', full: 'badge-danger', reserved: 'badge-warning' }[s] ?? 'badge-muted')

  const openAdd = () => { editing.value = null; Object.assign(form, defaultForm()); showModal.value = true }
  const openEdit = (item) => {
    editing.value = item
    Object.assign(form, { tableNumber: item.tableNumber, tableName: item.tableName, capacity: item.capacity, status: item.status })
    showModal.value = true
  }
  const closeModal = () => { showModal.value = false; editing.value = null }

  const save = async () => {
    saving.value = true
    try {
      const result = editing.value
        ? await tableStore.updateTable(editing.value.id, { ...form })
        : await tableStore.addTable({ ...form })
      if (result.success) { toast.add(editing.value ? 'Table updated' : 'Table added', 'Success'); closeModal() }
      else toast.add(result.error || 'Failed to save', 'Error')
    } finally { saving.value = false }
  }

  const confirmDelete = (item) => { deletingItem.value = item }
  const doDelete = async () => {
    deleting.value = true
    try {
      const result = await tableStore.deleteTable(deletingItem.value.id)
      if (result.success) toast.add('Table removed', 'Deleted')
      else toast.add('Failed to delete', 'Error')
      deletingItem.value = null
    } finally { deleting.value = false }
  }

  return {
    tableStore, eventStore,
    showModal, editing, saving, deletingItem, deleting,
    form, stats, totalCapacity, totalSeated,
    statusLabel, statusBadge,
    init, openAdd, openEdit, closeModal, save, confirmDelete, doDelete,
  }
}
