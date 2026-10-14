import { isEqual, cloneDeep } from 'lodash-es'

/**
 * Generic modal + CRUD state shared by all page composables.
 *
 * Basic usage (no dirty tracking):
 *   const crud = useModalCrud()
 *
 * With dirty tracking via form reactive:
 *   const crud = useModalCrud({ form: myReactiveForm })
 *   <RDrawer :dirty="crud.formDirty.value" />
 *
 * With dirty tracking via useZodForm:
 *   const { form, isDirty } = useZodForm(schema, initial)
 *   const crud = useModalCrud({ dirtyRef: isDirty })
 *   <RDrawer :dirty="crud.formDirty.value" />
 *
 * CRUD usage:
 *   crud.openAdd(() => reset())           → resets form, opens modal (add mode)
 *   crud.openEdit(item, (i) => reset(i))  → sets snapshot, opens modal (edit mode)
 *   crud.closeModal()                     → hides modal, clears state + dirty
 *   crud.confirmDelete(item)              → sets deletingItem
 *   await crud.doDelete((item) => store.deleteItem(item.id), onSuccess)
 *   await crud.save(createFn, updateFn, onSuccess)
 *
 * onSuccess receives the result's `.data` value.
 */
export function useModalCrud(options = {}) {
  const toast = useToastStore()

  const showModal    = ref(false)
  const editingItem  = ref(null)
  const saving       = ref(false)
  const deletingItem = ref(null)
  const deleting     = ref(false)

  // ── Dirty tracking ─────────────────────────────────────────────────────────
  const _snapshot = ref(null)

  const formDirty = computed(() => {
    // External isDirty (e.g. from useZodForm) takes priority
    if (options.dirtyRef !== undefined) {
      const v = options.dirtyRef
      return v?.value ?? (typeof v === 'boolean' ? v : false)
    }
    const rawForm = options.form?.value ?? options.form
    if (!rawForm) return false

    const plain = JSON.parse(JSON.stringify(rawForm))

    if (_snapshot.value !== null) {
      // Edit mode: dirty when form differs from snapshot
      return !isEqual(plain, _snapshot.value)
    }
    // Add mode: dirty when any field has a non-empty value
    return _hasAnyValue(plain)
  })

  function _hasAnyValue(obj) {
    if (!obj || typeof obj !== 'object') return false
    for (const v of Object.values(obj)) {
      if (Array.isArray(v)) {
        if (v.length > 0) return true
      } else if (v !== null && v !== undefined && v !== '' && v !== 0 && v !== false) {
        if (typeof v === 'object') {
          if (_hasAnyValue(v)) return true
        } else {
          return true
        }
      }
    }
    return false
  }

  // ── Modal handlers ─────────────────────────────────────────────────────────
  const openAdd = (resetForm) => {
    editingItem.value = null
    _snapshot.value = null   // add mode — no snapshot
    resetForm?.()
    showModal.value = true
  }

  const openEdit = (item, populateForm) => {
    editingItem.value = item
    _snapshot.value = null
    populateForm?.(item)
    // Snapshot taken after populate so baseline matches populated form
    nextTick(() => {
      const rawForm = options.form?.value ?? options.form
      if (rawForm) _snapshot.value = cloneDeep(JSON.parse(JSON.stringify(rawForm)))
    })
    showModal.value = true
  }

  const closeModal = () => {
    showModal.value = false
    editingItem.value = null
    _snapshot.value = null
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  const confirmDelete = (item) => {
    deletingItem.value = item
  }

  /**
   * @param {(item) => Promise<{data?, error?}>} deleteFn
   * @param {(data) => void}                     onSuccess
   */
  const doDelete = async (deleteFn, onSuccess) => {
    if (!deletingItem.value) return
    deleting.value = true
    try {
      const result = await deleteFn(deletingItem.value)
      if (result?.data) {
        toast.add('Deleted successfully', 'Deleted')
        deletingItem.value = null
        onSuccess?.(result.data)
      } else {
        toast.add(result?.error || 'Failed to delete', 'Error')
      }
    } finally {
      deleting.value = false
    }
  }

  // ── Save ───────────────────────────────────────────────────────────────────
  /**
   * @param {() => Promise<{data?, error?}>} createFn
   * @param {() => Promise<{data?, error?}>} updateFn
   * @param {(data) => void}                 onSuccess
   */
  const save = async (createFn, updateFn, onSuccess) => {
    saving.value = true
    try {
      const result = editingItem.value ? await updateFn() : await createFn()
      if (result?.data) {
        toast.add(editingItem.value ? 'Updated successfully' : 'Created successfully', 'Success')
        closeModal()
        onSuccess?.(result.data)
      } else {
        toast.add(result?.error || 'Operation failed', 'Error')
      }
    } finally {
      saving.value = false
    }
  }

  return {
    showModal,
    editingItem,
    saving,
    deletingItem,
    deleting,
    formDirty,
    openAdd,
    openEdit,
    closeModal,
    confirmDelete,
    doDelete,
    save,
  }
}
