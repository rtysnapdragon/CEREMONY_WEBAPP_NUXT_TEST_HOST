import { reactive, ref, computed } from 'vue'
import { CalendarDate,Time,parseDate,parseTime } from '@internationalized/date'

export function useEventsPage() {
  const eventStore = useEventStore()
  const eventTypeStore = useEventTypeStore()
  const toast = useToast()
  const { tr } = useTr()

  const crud = useModalCrud()
  const { errors, clearError, addError, resetErrors, hasNoErrors } = useFormErrors()

  const showModal = crud.showModal
  const saving = crud.saving
  const editingId = computed(() => crud.editingItem.value?.id ?? null)
  const editingEventData = ref(null)

  const defaultForm = () => ({
    title: '',
    host1Name: '',
    host2Name: '',
    eventDate: undefined,
    eventTime: undefined,
    location: '',
    totalBudget: 0,
    status: 'PLANNING',
    eventTypeId: '',

    groomCode: '',
    brideCode: '',
    groomFirstName: '',
    groomLastName: '',
    groomFatherName: '',
    groomMotherName: '',
    groomPhone: '',
    brideFirstName: '',
    brideLastName: '',
    brideFatherName: '',
    brideMotherName: '',
    bridePhone: '',
    venue: '',
    budget: 0,
    guestCount: 0,
    dressCode: '',
    notes: '',

    ordinandName: '',
    ordinandAge: null,
    monkName: '',
    fatherName: '',
    motherName: '',
    contactPhone: '',
    temple: '',
    prepDate: undefined,
    duration: 7,
    headMonk: '',
    hasRobeOffering: true,
    hasCatering: true,
    hasPhotography: false,

    hostCode: '',
    ownerName: '',
    spouseName: '',
    ownerPhone: '',
    houseAddress: '',
    propertyType: '',
    floors: 1,
    area: 0,
    monkCount: 9,
    cateringNote: '',

    deceasedName: '',
    deceasedAge: null,
    deceasedGender: '',
    dateOfPassing: undefined,
    placeOfPassing: '',
    contactName: '',
    relationship: '',
    ceremonyType: '',
    eventEndDate: undefined,
    hasCremation: true,
    hasMonkChanting: true,

    familyName: '',
    organizerName: '',
    organizerPhone: '',
    gatheringType: '',
    attendeeCount: 0,
    branches: [{ name: '', count: 0 }],
    theme: '',
    hasEntertainment: false,
    hasKidsArea: false,

    ringExchange: true,
    plannedWeddingDate: undefined,

    honorName: '',
    age: null,
    gender: '',
    organizer: '',
    cakeFlavour: '',
    hasVideography: false,

    // ── Generic builder fields (shared across all event types) ──
    subtitle: '',
    templateType: '',
    language: '',
    heroTitle: '',
    heroSubtitle: '',
    heroDescription: '',
    heroImage: '',
    heroVideo: '',
    logo: '',
    host1Role: '',
    host2Role: '',
    host1Title: '',
    host2Title: '',
    host1Photo: '',
    host2Photo: '',
    host1Bio: '',
    host2Bio: '',
    parentFamilies: { host1Parents: [], host2Parents: [], familyMessage: '' },
    opening: '',
    invitationTitle: '',
    invitationMessage: '',
    inviteTo: '',
    guestGreeting: '',
    guestName: '',
    guestMessage: '',
    eventTypeLabel: '',
    startTime: '',
    endTime: '',
    timezone: '',
    venueName: '',
    venueAddress: '',
    venueDescription: '',
    venuePhone: '',
    mapUrl: '',
    latitude: null,
    longitude: null,
    ceremonyTitle: '',
    ceremonyDate: '',
    ceremonyTime: '',
    ceremonyVenue: '',
    ceremonyAddress: '',
    ceremonyMapUrl: '',
    receptionTitle: '',
    receptionDate: '',
    receptionTime: '',
    receptionVenue: '',
    receptionAddress: '',
    receptionMapUrl: '',
    storyTitle: '',
    storyDescription: '',
    timeline: [],
    showCountdown: true,
    countdownTitle: '',
    countdownDate: '',
    showRsvp: true,
    rsvpTitle: '',
    rsvpNote: '',
    rsvpUrl: '',
    rsvpRequired: false,
    allowGuestCount: true,
    maxGuests: null,
    allowPlusOne: false,
    allowChildren: false,
    mealSelection: false,
    mealOptions: [],
    showGiftInfo: false,
    giftTitle: '',
    giftMessage: '',
    giftNote: '',
    registryUrl: '',
    giftOptions: [],
    galleryTitle: '',
    galleryDescription: '',
    musicTitle: '',
    musicArtist: '',
    musicUrl: '',
    videos: [],
    youtubeEmbedId: { value: '' },
    musicPlaying: { value: false },
    hashtag: '',
    instagramUrl: '',
    facebookUrl: '',
    telegramUrl: '',
    shareTitle: '',
    shareDescription: '',
    shareImage: '',
    announcement: '',
    importantNote: '',
    specialNote: '',
    thankYouMessage: '',
    closing: '',
    sections: [],
    themeConfig: {},
    footerTitle: '',
    footerMessage: '',
    footerLogo: '',
    footerNote: '',
    extraData: {},
  })

  // Keys synced between the store record and the form on edit.
  const clone = (v) => (v && typeof v === 'object' ? JSON.parse(JSON.stringify(v)) : v)

  const syncGenericFields = (target, source) => {
    Object.keys(target).forEach((key) => {
      if (source[key] === undefined) return
      const value = source[key]
      target[key] = typeof value === 'object' && value !== null ? clone(value) : value
    })
  }

  const ceremonyDefaultForm = () => ({
    title: '',
    titleKm: '',
    date: undefined,
    time: undefined,
    venue: '',
    venueKm: '',
    type: 'wedding',
    budget: 0,
    status: 'planning',

    name: '',
    description: '',
    address: '',
    durationMinutes: 1,
    scheduleTime: undefined, // or new Date().toISOString() if you want a default
    orderIndex: 0,
    ceremonyStatus: 'PENDING',
  })

  const form = reactive(defaultForm())
  const ceremonyForm = reactive(ceremonyDefaultForm())

  const STATUS_CLASSES = {
    planning: 'accent', confirmed: 'info',
    in_progress: 'success', completed: 'muted', cancelled: 'danger',
  }
  const statusClass = (s) => STATUS_CLASSES[(s || 'planning').toLowerCase()] || 'accent'

  const resetForm = () => {
    Object.assign(form, defaultForm())
    resetErrors()
  }

  const openAdd = () => {
    editingEventData.value = null
    resetErrors()
    crud.openAdd(() => Object.assign(form, defaultForm()))
  }

  const openEdit = (ev) => {
    editingEventData.value = ev
    resetErrors()
    crud.openEdit(ev, () => {
      form.title = ev.title ?? ''
      form.host1Name = ev.host1Name ?? ''
      form.host2Name = ev.host2Name ?? ''

      form.eventDate = ev.date
        ? new CalendarDate(ev.date)
        : undefined

      form.eventTime = ev.date
        ? new Time(ev.date)
        : undefined

      form.location = ev.venue ?? ev.location ?? ''
      form.totalBudget = ev.budget ?? 0
      form.status = (ev.status ?? 'planning').toUpperCase().replace('-', '_')
      form.eventTypeId = ev.eventTypeId ?? ''
      // Generic dynamic fields — synced so edits never wipe stored values
      syncGenericFields(form, { ...ev, ...ev.extraData })
    })
  }

  const closeModal = () => { crud.closeModal(); resetErrors() }

  const setActive = (id) => {
    eventStore.setActiveEvent(id)
    toast.add({color: "red",title:tr('events.active_changed')})
  }

  const validate = () => {
    resetErrors()
    if (!form.title?.trim()) addError('title', tr('validation.title_required'))
    if (!form.eventDate) addError('eventDate', tr('validation.date_required'))
    return hasNoErrors()
  }

  const save = async () => {
    if (!validate()) return
    await crud.save(
      () => eventStore.addEvent(form)
        .then((created) => ({ data: created }))
        .catch((e) => ({ error: String(e?.message || e) })),
      () => eventStore.saveEvent(crud.editingItem.value.id, form),
    )
  }

  const confirmDelete = (ev) => {
    useConfirmStore().show({
      type: 'delete',
      title: tr('common.delete'),
      message: `${tr('common.delete')} "${ev.title}"? ${tr('common.cannot_be_undone')}`,
      onConfirm: async () => {
        const res = await eventStore.removeEvent(ev.id)
        if (res.success) toast.add({color: "red",title:tr('events.deleted')})
        else {
          console.log("Errror delete==================> ", res.error?.message)
          toast.add({color: 'green',title: res.error?.message})
        }
      },
    })
  }

  const init = async () => {
    if (!eventStore.initialized) await eventStore.fetchEvents()
    if (!eventTypeStore.initialized) await eventTypeStore.fetchTypes()
  }

  return {
    eventStore, eventTypeStore,
    showModal, saving, editingId, errors, form,
    statusClass, editingEventData, ceremonyForm,
    clearError,
    init, openAdd, openEdit, closeModal, setActive, save, confirmDelete,
  }
}
