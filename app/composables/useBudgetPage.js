import { pct } from '~/helpers/str'

export function useBudgetPage() {
  // ── Service layer ───────────────────────────────────────────────────────────
  const budgetStore = useBudgetStore()
  const translationStore = useTranslationStore()
  const langStore = useLanguageStore()
  const toast = useToastStore()

  // ── Init (30s poll) ────────────────────────────────────────────────────────
  const { eventStore, init } = useEventPage(async () => {
    await budgetStore.fetchBudgets(0)
    await budgetStore.fetchSummary()
  }, 30_000)

  // ── Modal state ────────────────────────────────────────────────────────────
  const showModal = ref(false)
  const editingTx = ref(null)
  const saving = ref(false)
  const autoTranslate = ref(false)

  // ── Delete confirm ─────────────────────────────────────────────────────────
  const deletingTx = ref(null)
  const deleting = ref(false)

  // ── Form ───────────────────────────────────────────────────────────────────
  const defaultForm = () => ({
    category: '', vendorName: '',
    plannedAmount: 0, actualAmount: 0,
    paymentStatus: 'unpaid', notes: '',
  })
  const form = reactive(defaultForm())

  // ── Modal handlers ─────────────────────────────────────────────────────────
  const openAdd = () => {
    editingTx.value = null
    autoTranslate.value = false
    Object.assign(form, defaultForm())
    showModal.value = true
  }

  const openEdit = (tx) => {
    editingTx.value = tx
    Object.assign(form, {
      category: tx.category,
      vendorName: tx.vendorName,
      plannedAmount: tx.plannedAmount,
      actualAmount: tx.actualAmount,
      paymentStatus: tx.paymentStatus,
      notes: tx.notes,
    })
    showModal.value = true
  }

  const closeModal = () => {
    showModal.value = false
    editingTx.value = null
    Object.assign(form, defaultForm())
  }

  // ── Save ───────────────────────────────────────────────────────────────────
  const save = async () => {
    saving.value = true
    try {
      let result
      if (editingTx.value) {
        result = await budgetStore.updateBudget(editingTx.value.id, { ...form })
      } else {
        result = await budgetStore.addBudget({ ...form })
      }

      if (result?.success) {
        toast.add(
          editingTx.value ? 'Transaction updated' : 'Transaction added',
          'Saved',
        )
        if (!editingTx.value && autoTranslate.value && result.data?.id) {
          const id = result.data.id
          const langs = langStore.activeItems.length
            ? langStore.activeItems
            : [{ code: 'en', name: 'English' }, { code: 'km', name: 'Khmer' }]
          const input = {}
          if (form.category)   input.category   = form.category
          if (form.vendorName) input.vendorName  = form.vendorName
          if (form.notes)      input.notes       = form.notes
          if (Object.keys(input).length)
            translationStore.aiTranslate(input, langs, {
              keyPrefix: `budget.${id}`, feature: 'budget', referenceId: id,
            }).then(() => toast.add('Translations saved', 'AI')).catch(() => {})
        }
        closeModal()
      } else {
        toast.add('Failed to save transaction', 'Error')
      }
    } finally {
      saving.value = false
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  const confirmDelete = (tx) => { deletingTx.value = tx }

  const doDelete = async () => {
    if (!deletingTx.value) return
    deleting.value = true
    try {
      const result = await budgetStore.deleteBudget(deletingTx.value.id)
      if (result?.success) toast.add('Transaction removed', 'Deleted')
      else toast.add('Failed to delete', 'Error')
      deletingTx.value = null
    } finally { deleting.value = false }
  }

  const { tr } = useTr()

  return {
    budgetStore, eventStore,
    showModal, editingTx, saving, autoTranslate,
    deletingTx, deleting,
    form,
    pct, tr,
    init, openAdd, openEdit, closeModal, save, confirmDelete, doDelete,
  }
}
