/**
 * Reactive form validation helpers shared by all page composables.
 *
 * Usage:
 *   const { errors, clearError, validate, resetErrors } = useFormErrors()
 *
 *   const validate = () => {
 *     resetErrors()
 *     if (!form.name?.trim()) addError('name', 'Name is required.')
 *     return hasNoErrors()
 *   }
 */
export function useFormErrors() {
  const errors = reactive({})

  const clearError = (field) => { delete errors[field] }

  const addError = (field, message) => { errors[field] = message }

  const resetErrors = () => { Object.keys(errors).forEach((k) => delete errors[k]) }

  const hasNoErrors = () => Object.keys(errors).length === 0

  return {
    errors,
    clearError,
    addError,
    resetErrors,
    hasNoErrors,
  }
}
