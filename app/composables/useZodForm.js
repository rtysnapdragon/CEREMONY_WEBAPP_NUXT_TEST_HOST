import { reactive, ref, computed } from 'vue'
import { isEqual, cloneDeep } from 'lodash-es'

/**
 * Zod-backed form composable with dirty tracking via lodash isEqual.
 *
 * Usage:
 *   import { z } from 'zod'
 *
 *   const schema = z.object({
 *     name:  z.string().min(1, 'Name is required'),
 *     email: z.string().email('Invalid email'),
 *     seats: z.number().min(1).max(100).optional(),
 *   })
 *
 *   const { form, errors, isDirty, validate, clearError, reset, setInitial } = useZodForm(schema, {
 *     name: '', email: '', seats: 1,
 *   })
 *
 * Validation:
 *   const save = async () => {
 *     if (!validate()) return     // populates errors reactive object
 *     // ...
 *   }
 *
 * Input binding:
 *   <RInput v-model="form.name" :error="!!errors.name" @on-input="clearError('name')" />
 *   <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
 *
 * Dirty detection — pass to RDrawer / RModal / RSlider to block outside-click close:
 *   <RDrawer  :dirty="isDirty" />
 *   <RSlider  :dirty="isDirty" />
 *   <RModal   :dirty="isDirty" />
 *
 * Or via useModalCrud integration:
 *   const crud = useModalCrud({ dirtyRef: isDirty })
 *   <RDrawer :dirty="crud.formDirty.value" />
 *
 * Edit mode — call setInitial() when opening the edit modal:
 *   crud.openEdit(item, (i) => setInitial({ name: i.name, email: i.email }))
 */
export function useZodForm(schema, initialValues) {
  const _initial = cloneDeep(initialValues)
  const form = reactive(cloneDeep(initialValues))
  const errors = reactive({})
  const submitted = ref(false)

  // ── Dirty tracking ─────────────────────────────────────────────────────────
  // True when form values differ from the last setInitial() or initial state
  const isDirty = computed(() => !isEqual(toRawDeep(form), _initial))

  function toRawDeep(obj) {
    // Convert reactive proxy to plain object for isEqual comparison
    return JSON.parse(JSON.stringify(obj))
  }

  // ── Validation ─────────────────────────────────────────────────────────────
  function validate() {
    submitted.value = true
    resetErrors()
    const result = schema.safeParse(toRawDeep(form))
    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path.join('.')
        if (!errors[field]) errors[field] = issue.message
      }
      return false
    }
    return true
  }

  function clearError(field) {
    delete errors[field]
  }

  function resetErrors() {
    Object.keys(errors).forEach(k => delete errors[k])
    submitted.value = false
  }

  // ── Reset ──────────────────────────────────────────────────────────────────
  /**
   * Reset form to initial values (or to newValues if provided).
   * Clears all errors and dirty state.
   */
  function reset(newValues) {
    const vals = newValues ?? _initial
    Object.assign(form, cloneDeep(vals))
    if (newValues) Object.assign(_initial, cloneDeep(newValues))
    resetErrors()
  }

  /**
   * Set new initial values AND populate the form (for edit mode).
   * After calling this, isDirty will be false until the user edits something.
   */
  function setInitial(values) {
    const cloned = cloneDeep(values)
    Object.assign(_initial, cloned)
    Object.assign(form, cloneDeep(cloned))
    resetErrors()
  }

  return {
    form,
    errors,
    isDirty,
    submitted,
    validate,
    clearError,
    resetErrors,
    reset,
    setInitial,
  }
}
