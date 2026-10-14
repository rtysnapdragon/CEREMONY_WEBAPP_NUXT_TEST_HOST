import { z } from 'zod'

export function useSetupPage() {
  const toast = useToastStore()
  const eventStore = useEventStore()
  const ceremonyStore = useCeremonyStore()
  const confirm = useConfirmStore()
  const planStore = usePlanStore()
  const promptStore = usePromptTemplateStore()
  const { tBy } = useSarikaLocale()
  const { tr } = useTr()
  const localePath = (p) => p

  const editingEvent = ref(null)
  const showTransReview = ref(false)
  const transReviewProps = ref({ feature: 'ceremony', entityId: '', fields: {}, fieldsMeta: [], autoSave: true })
  const ceremonyPrompt = computed(() => promptStore.byFeature('ceremony'))
  const activeEvent = computed(() => eventStore.activeEvent)
  const  editingCeremony = ref(null)

  const isOpen = ref(false)
  const showModal = ref(false)
  const editingId = ref(null)
  const formRef = ref()
  const saving = ref(false)

  const defaultForm = () => ({
    name: '', nameKm: '',
    scheduleTime: activeEvent.value?.date
      ? activeEvent.value.date.substring(0, 10) + 'T08:00'
      : '',
    durationMinutes: 60,
    address: '', addressKm: '',
    description: '', descriptionKm: '',
    status: 'pending',
    orderIndex: ceremonyStore.items.length,
  })

  const eventForm = reactive(defaultForm())
  const phaseForm = reactive(defaultForm())

  const timelineItems = computed(() =>
    ceremonyStore.items.map((c, i) => ({
      value: i + 1,
      title: c.name,
      titleKm: c.nameKm,
      description: c.description,
      descriptionKm: c.descriptionKm,
      scheduleTime: c.scheduleTime,
      address: c.address,
      addressKm: c.addressKm,
      durationMinutes: c.durationMinutes,
      id: c.id,
    }))
  )

  const phaseSchema = z.object({
    name: z.string().min(2, 'Name is required (min 2 chars)'),
    scheduleTime: z.string().min(1, 'Start time is required'),
    durationMinutes: z.number({ required_error: 'Duration is required', invalid_type_error: 'Must be a number' }).min(5, 'Min 5 minutes'),
    nameKm: z.string().optional(),
    address: z.string().optional(),
    addressKm: z.string().optional(),
    description: z.string().optional(),
    descriptionKm: z.string().optional(),
  })

  function submitForm() { formRef.value.submit() }
  function onError(e) { console.warn('form error', e.errors) }

  const addPhase = () => {
    editingId.value = null
    Object.assign(phaseForm, defaultForm())
    isOpen.value = true
  }

  const handleAction = (type, item) => {
    if (type === 'edit') {
      editingCeremony.value = item
      showModal.value = true
      const c = ceremonyStore.items.find(x => x.id === item.id)
      if (!c) return
      editingId.value = c.id
      Object.assign(phaseForm, {
        name: c.name, nameKm: c.nameKm,
        scheduleTime: c.scheduleTime ? c.scheduleTime.substring(0, 16) : '',
        durationMinutes: c.durationMinutes,
        address: c.address, addressKm: c.addressKm,
        description: c.description, descriptionKm: c.descriptionKm,
        status: c.status,
        orderIndex: c.orderIndex,
      })
      isOpen.value = true
    } else if (type === 'delete') {
      confirm.show({
        type: 'delete',
        message: tr('ceremony.delete_phase', 'Delete this phase?'),
        onConfirm: async () => {
          const res = await ceremonyStore.deleteCeremony(item.id)
          if (res.success) toast.add(tr('ceremony.phase_deleted', 'Phase deleted'), 'Success')
          else toast.add(tr('ceremony.delete_failed', 'Failed to delete'), 'Error')
        }
      })
    }
  }

  const savePhase = async (event) => {
    saving.value = true
    try {
      const form = { ...event.data, status: phaseForm.status, orderIndex: phaseForm.orderIndex }
      const res = editingId.value
        ? await ceremonyStore.updateCeremony(editingId.value, form)
        : await ceremonyStore.addCeremony(form)

      if (!res.success) throw new Error(res.error?.message || tr('ceremony.save_failed', 'Failed to save'))
      toast.add(editingId.value ? tr('ceremony.phase_updated', 'Phase updated') : tr('ceremony.phase_added', 'Phase added'), 'Success')
      isOpen.value = false
      editingId.value = null

      if (res.data && ceremonyPrompt.value && !ceremonyPrompt.value.autoSave) {
        transReviewProps.value = {
          feature: 'ceremony',
          entityId: res.data.id,
          fields: {
            name: res.data.name || '',
            description: res.data.description || '',
            address: res.data.address || '',
          },
          fieldsMeta: ceremonyPrompt.value.translatableFields ?? [],
          autoSave: false,
        }
        showTransReview.value = true
      }
    } catch (err) {
      toast.add(err?.message || tr('ceremony.save_failed', 'Failed to save phase'), 'Error')
    } finally {
      saving.value = false
    }
  }

  const onPhaseTranslated = (result) => {
    if (result.name?.km)        phaseForm.nameKm = result.name.km
    if (result.description?.km) phaseForm.descriptionKm = result.description.km
    if (result.address?.km)     phaseForm.addressKm = result.address.km
  }

  const timeOnly = (dt) => {
    if (!dt) return '—'
    if (typeof dt === 'string') return dt.length >= 16 ? dt.substring(11, 16) : dt
    return ''
  }

  const addMinutes = (time, mins) => {
    if (!time || time === '—') return '—'
    const [h, m] = time.split(':').map(Number)
    const total = h * 60 + m + (mins || 0)
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
  }

  const statusBadge = (s) => ({
    planning: 'badge-accent',
    confirmed: 'badge-info',
    in_progress: 'badge-success',
    completed: 'badge-muted',
    cancelled: 'badge-danger',
  }[s] || 'badge-muted')

  const openAddEvent = () => {
    editingEvent.value = null
    editingCeremony.value = null
    showModal.value = true
    Object.assign(eventForm, defaultForm())
    if (eventStore.atWeddingLimit) {
      toast.add(
        tr('ceremony.wedding_limit', 'You have reached the wedding limit. Upgrade your plan to add more.'),
        tr('ceremony.wedding_limit_title', 'Wedding Limit Reached'),
      )
      return
    }
  }

  const editEvent = (ev) => { editingEvent.value = ev; Object.assign(eventForm, { ...ev }); showModal.value = true }
  const closeModal = () => { showModal.value = false; editingEvent.value = null }

  const handleView = (event) => {
    const queryParam = queryParams('event', {...({ id: event.id, name:event.name,status: event.status,title:event.title,eventType:event.eventType}) })
    navigateTo(localePath(`/events/info${queryParam}`))
  }

  const onCreated = (created) => {
    if (created?.id) eventStore.setActiveEvent(created.id)
    closeModal()
  }

  const onTranslated = (result) => {
    if (result.title?.km) eventForm.titleKm = result.title.km
    if (result.venue?.km)  eventForm.venueKm = result.venue.km
  }

  const saveEvent = async () => {
    saving.value = true
    try {
      eventStore.updateEvent(editingEvent.value.id, { ...eventForm })
      toast.add(tr('events.updated'), 'Success')
      closeModal()
    } catch (err) {
      const msg = err?.response?._data?.message ?? err?.message ?? tr('events.update_failed', 'Failed to save event')
      toast.add(msg, 'Error')
    } finally {
      saving.value = false
    }
  }

  const updateCeremonyAutoSave = async (val) => {
    const prompt = ceremonyPrompt.value
    if (!prompt) return
    await promptStore.updatePrompt(prompt.id, { autoSave: val })
  }

  const { init: eventInit } = useEventPage(() => ceremonyStore.fetchCeremonies())

  const init = async () => {
    if (!promptStore.items.length) promptStore.fetchAll()
    await eventInit()
  }

  return {
    eventStore, ceremonyStore, planStore, promptStore,
    tBy, localePath,
    activeEvent, ceremonyPrompt,
    editingEvent, showTransReview, transReviewProps,
    isOpen, showModal, editingId, formRef, saving,
    eventForm, phaseForm, timelineItems, phaseSchema,
    init, submitForm, onError,
    addPhase, handleAction, savePhase, onPhaseTranslated,
    timeOnly, addMinutes, statusBadge,
    openAddEvent, editEvent, closeModal, handleView,
    onCreated, onTranslated, saveEvent, updateCeremonyAutoSave,
  }
}
