import { computed, ref } from 'vue'
import { isEqual, cloneDeep } from 'lodash-es'

/**
 * Track whether a reactive form has unsaved changes (dirty state).
 *
 * Usage:
 *   const { isDirty, setSnapshot, reset } = useFormDirty()
 *
 *   // When opening add modal (no snapshot — checks for any non-empty value):
 *   setSnapshot(null)
 *
 *   // When opening edit modal (snapshot = original record values):
 *   setSnapshot(item)
 *
 *   // Pass to RDrawer / RModal to prevent outside-click close:
 *   <RDrawer :dirty="isDirty(form)" />
 *
 *   // Or compute once:
 *   const dirty = computed(() => isDirty(form))
 *   <RDrawer :dirty="dirty" />
 */
export function useFormDirty() {
  const _snapshot = ref(null)

  /**
   * Set the baseline snapshot.
   * - Pass the original item object when editing (isDirty = form ≠ original)
   * - Pass null when adding (isDirty = form has any non-empty value)
   */
  function setSnapshot(values) {
    _snapshot.value = values ? cloneDeep(values) : null
  }

  /**
   * Returns true when the form has unsaved changes.
   * @param {object|Ref} form — reactive form object or ref
   */
  function isDirty(form) {
    const val = form?.value ?? form
    if (!val || typeof val !== 'object') return false

    if (_snapshot.value !== null) {
      // Edit mode: dirty when form differs from the original snapshot
      return !isEqual(val, _snapshot.value)
    }

    // Add mode: dirty when any field has a non-empty value
    return _hasNonEmptyValue(val)
  }

  function _hasNonEmptyValue(obj) {
    if (!obj || typeof obj !== 'object') return false
    for (const v of Object.values(obj)) {
      if (Array.isArray(v)) {
        if (v.length > 0) return true
      } else if (v !== null && v !== undefined && v !== '' && v !== 0 && v !== false) {
        if (typeof v === 'object') {
          if (_hasNonEmptyValue(v)) return true
        } else {
          return true
        }
      }
    }
    return false
  }

  function reset() {
    _snapshot.value = null
  }

  return { isDirty, setSnapshot, reset }
}
