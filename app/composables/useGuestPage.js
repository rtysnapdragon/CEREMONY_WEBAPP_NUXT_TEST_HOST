// ── RSelect options (bilingual) ───────────────────────────────────────────────
// RSelect v-model stores the WHOLE selected option object, but the guest form +
// API contract use plain string values (gender='male', side='bride', rsvp='pending').
// Every select binds to a local *option* ref (display + pre-selection) and the
// string value is written back into the form via the @selected handler below, so
// the payload sent to the server stays a plain string.
const GENDER_OPTS = [
  { Value: 'male',   NameEnglish: 'Male',   Name: 'បុរស' },
  { Value: 'female', NameEnglish: 'Female', Name: 'ស្ត្រី' },
  { Value: 'other',  NameEnglish: 'Other',  Name: 'ផ្សេងទៀត' },
]

const SIDE_OPTS = [
  { Value: 'bride',  NameEnglish: 'Bride',  Name: 'កូនក្រមុំ' },
  { Value: 'groom',  NameEnglish: 'Groom',  Name: 'កូនកំលោះ' },
  { Value: 'friend', NameEnglish: 'Friend', Name: 'ភ្ញៀវ' },
]

const RSVP_OPTS = [
  { Value: 'confirmed', NameEnglish: 'Confirmed', Name: 'បានបញ្ជាក់' },
  { Value: 'pending',   NameEnglish: 'Pending',   Name: 'កំពុងរង់ចាំ' },
  { Value: 'declined',  NameEnglish: 'Declined',  Name: 'បានបដិសេធ' },
]

export function useGuestPage() {
  const guestStore = useGuestStore()
  const eventStore = useEventStore()
  const toast = useToastStore()
  const confirm = useConfirmStore()
  const { t } = useI18n()
  const { tBy } = useSarikaLocale()
  const { tr } = useTr()

  // ── Event lifecycle (init + watch + poll) ─────────────────────────────────
  const { init } = useEventPage(() => guestStore.fetchGuests(), 30_000)

  // Re-fetch from server when search/filter changes (server-side filtering)
  watch(() => guestStore.searchQuery, () => guestStore.fetchGuests(0))
  watch(() => guestStore.filterRsvp,  () => guestStore.fetchGuests(0))
  watch(() => guestStore.filterSide,  () => guestStore.fetchGuests(0))

  // ── Modal / CRUD state ────────────────────────────────────────────────────
  const showModal = ref(false)
  const editingGuest = ref(null)
  const saving = ref(false)
  const deletingGuest = ref(null)
  const deleting = ref(false)

  // ── Guest detail drawer (bottom-up) state ────────────────────────────────
  const showGuestDetail = ref(false)
  const selectedGuest = ref(null)

  // ── Import state ──────────────────────────────────────────────────────────
  const showImport = ref(false)
  const importFile = ref(null)
  const importFileRef = ref(null)
  const importResult = ref(null)
  const importing = ref(false)
  const importProgress = ref(0)   // 0–100
  const importTotal = ref(0)      // total rows from server
  const importSaved = ref(0)      // rows saved so far

  // ── Form ──────────────────────────────────────────────────────────────────
  const defaultForm = () => ({
    name: '',
    email: '',
    phone: '',
    gender: 'male',
    address: '',
    side: 'bride',
    seats: 1,
    rsvp: 'pending',
    dietary: '',
    notes: '',
  })

  const guestForm = reactive(defaultForm())

  // ── RSelect option ↔ string sync ─────────────────────────────────────────
  // RSelect v-model holds the option object; the form field holds the string that
  // goes to the server. `*Option` refs power the RSelect display/pre-selection and
  // the `on*Selected` handlers translate a picked option back into a plain string.
  const genderOption = ref(undefined)
  const sideOption = ref(undefined)
  const rsvpOption = ref(undefined)

  const optionFor = (list, value) => list.find((o) => o.Value === value) ?? undefined

  const syncSelectOptions = () => {
    genderOption.value = optionFor(GENDER_OPTS, guestForm.gender)
    sideOption.value = optionFor(SIDE_OPTS, guestForm.side)
    rsvpOption.value = optionFor(RSVP_OPTS, guestForm.rsvp)
  }

  const onGenderSelected = (opt) => { guestForm.gender = opt?.Value ?? '' }
  const onSideSelected   = (opt) => { guestForm.side   = opt?.Value ?? '' }
  const onRsvpSelected   = (opt) => { guestForm.rsvp   = opt?.Value ?? '' }

  // ── Computed ──────────────────────────────────────────────────────────────
  const guestsToRender = computed(() => guestStore.filteredGuests ?? [])

  const guestStats = computed(() => [
    {
      key: 'total',
      icon: 'ri-group-fill',
      value: guestStore.stats.total,
      label: t('total_guests'),
      color: 'var(--c-text)',
      bg: 'rgba(255,255,255,0.08)',
    },
    {
      key: 'confirmed',
      icon: 'ri-checkbox-circle-fill',
      value: guestStore.stats.confirmed,
      label: t('rsvp_confirmed'),
      color: 'var(--c-success)',
      bg: 'rgba(74,222,128,0.12)',
    },
    {
      key: 'pending',
      icon: 'ri-time-fill',
      value: guestStore.stats.pending,
      label: t('rsvp_pending'),
      color: 'var(--c-accent)',
      bg: 'rgba(255,140,66,0.12)',
    },
    {
      key: 'declined',
      icon: 'ri-close-circle-fill',
      value: guestStore.stats.declined,
      label: t('rsvp_declined'),
      color: 'var(--c-danger)',
      bg: 'rgba(248,113,113,0.12)',
    },
  ])

  const rsvpFilters = computed(() => [
    { value: 'all', label: t('all') },
    { value: 'confirmed', label: t('rsvp_confirmed'), count: guestStore.stats.confirmed },
    { value: 'pending',   label: t('rsvp_pending'),   count: guestStore.stats.pending },
    { value: 'declined',  label: t('rsvp_declined'),  count: guestStore.stats.declined },
  ])

  const rsvpOptions = [
    { value: 'confirmed', label: t('rsvp_confirmed'), icon: 'ri-checkbox-circle-line' },
    { value: 'pending',   label: t('rsvp_pending'),   icon: 'ri-time-line' },
    { value: 'declined',  label: t('rsvp_declined'),  icon: 'ri-close-circle-line' },
  ]

  // ── Badge helpers ─────────────────────────────────────────────────────────
  const rsvpBadge = (rsvp) => ({ confirmed: 'badge-success', pending: 'badge-accent', declined: 'badge-danger' })[rsvp] || 'badge-muted'
  const rsvpIcon  = (rsvp) => ({ confirmed: 'ri-checkbox-circle-fill', pending: 'ri-time-line', declined: 'ri-close-circle-line' })[rsvp] || 'ri-question-line'
  const sideBadge = (side) => ({ bride: 'badge-info', groom: 'badge-accent', friend: 'badge-muted' })[side] || 'badge-muted'

  // ── Filter helpers ────────────────────────────────────────────────────────
  const cycleSideFilter = () => {
    const opts = ['all', 'bride', 'groom', 'friend']
    const idx = opts.indexOf(guestStore.filterSide)
    guestStore.filterSide = opts[(idx + 1) % opts.length]
  }

  // ── Table actions ─────────────────────────────────────────────────────────
  const btnActionsList = (g) => [
    { type: 'info',   label: t('view_details'),  icon: 'ri-file-user-line' },
    { type: 'view',   label: t('view_invitation'), icon: 'ri-links-line', showIfAllowed: (g) => g.inviteToken },
    { type: 'edit',   label: t('edit'),            icon: 'ri-edit-line' },
    { type: 'delete', label: t('delete'),           icon: 'ri-delete-bin-line' },
  ]

  // Opens the guest detail in a bottom-up drawer (no separate page).
  const openInfo = (guest) => {
    selectedGuest.value = guest
    showGuestDetail.value = true
  }

  const closeGuestDetail = () => {
    showGuestDetail.value = false
  }

  const handleGuestAction = (type, guest) => {
    if (type === 'info')   return openInfo(guest)
    if (type === 'view')   return window.open(`/invite/${guest.inviteToken}`, '_blank')
    if (type === 'edit')   return openEdit(guest)
    if (type === 'delete') return confirmDelete(guest)
  }

  // ── Modal handlers ────────────────────────────────────────────────────────
  const openAddGuest = () => {
    editingGuest.value = null
    Object.assign(guestForm, defaultForm())
    syncSelectOptions()
    showModal.value = true
  }

  const openEdit = (guest) => {
    editingGuest.value = guest
    Object.assign(guestForm, {
      name:    guest.name,
      email:   guest.email,
      phone:   guest.phone,
      gender:  guest.gender || 'male',
      address: guest.address,
      side:    guest.side,
      seats:   guest.seats,
      rsvp:    guest.rsvp,
      dietary: guest.dietary,
      notes:   guest.notes,
    })
    syncSelectOptions()
    showModal.value = true
  }

  const closeModal = () => {
    showModal.value = false
    editingGuest.value = null
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const saveGuest = async () => {
    saving.value = true
    try {
      if (editingGuest.value) {
        const ok = await guestStore.updateGuest(editingGuest.value.id, { ...guestForm })
        if (ok) { toast.add('Guest updated successfully', 'Success'); closeModal() }
        else      toast.add('Failed to update guest', 'Error')
      } else {
        const ok = await guestStore.addGuest({ ...guestForm })
        if (ok) { toast.add('Guest added successfully', 'Success'); closeModal() }
        else      toast.add('Failed to add guest', 'Error')
      }
    } finally {
      saving.value = false
    }
  }

  const confirmDelete = (guest) => {
    deletingGuest.value = guest
    confirm.show({
      type: 'delete',
      title: t('delete_guest'),
      description: t('are_you_sure_you_want_to_delete_this_guest', { value: guest?.name }),
      onConfirm: async () => { await doDelete() },
      confirmText: t('delete'),
      cancelText: t('cancel'),
    })
  }

  const doDelete = async () => {
    if (!deletingGuest.value) return
    deleting.value = true
    try {
      const ok = await guestStore.deleteGuest(deletingGuest.value.id)
      if (ok) toast.add('Guest removed successfully', 'Deleted')
      else     toast.add('Failed to delete guest', 'Error')
      deletingGuest.value = null
    } finally {
      deleting.value = false
    }
  }

  // ── Import ─────────────────────────────────────────────────────────────────
  const onFileChange = (e) => {
    importFile.value = e.target.files[0] || null
    importResult.value = null
  }

  const doImport = async () => {
    if (!importFile.value) return
    importing.value = true
    importProgress.value = 0
    importTotal.value = 0
    importSaved.value = 0
    importResult.value = null
    try {
      const result = await guestStore.importExcel(importFile.value, (pct, total = 0, saved = 0) => {
        importProgress.value = pct
        if (total) importTotal.value = total
        if (saved) importSaved.value = saved
      })
      importResult.value = result
      if (result?.imported > 0)       toast.add(`${result.imported} guests imported`, 'Import complete')
      else if (result?.failed > 0)    toast.add(`${result.failed} rows failed`, 'Import failed')
      else                            toast.add('No rows were imported', 'Import failed')
    } catch {
      toast.add('Upload failed. Check file format.', 'Error')
    } finally {
      importing.value = false
    }
  }

  // ── Export ─────────────────────────────────────────────────────────────────
  const exportGuests = () => {
    const list = guestStore.filteredGuests
    if (!list.length) { toast.add('No guests to export', 'Export'); return }

    const headers = ['Name', 'Phone', 'Email', 'Side', 'Seats', 'RSVP', 'Meal Preference', 'Notes']
    const rows = list.map((g) =>
      [g.name, g.phone, g.email, g.side, g.seats, g.rsvp, g.dietary, g.notes].map(
        (v) => `"${String(v ?? '').replace(/"/g, '""')}"`,
      ),
    )
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `guests_${guestStore.currentWeddingId}_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.add(`${list.length} guests exported`, 'Export complete')
  }

  return {
    guestStore, eventStore,
    tr, tBy,
    GENDER_OPTS, SIDE_OPTS, RSVP_OPTS,
    genderOption, sideOption, rsvpOption,
    onGenderSelected, onSideSelected, onRsvpSelected, syncSelectOptions,
    showModal, editingGuest, saving, deletingGuest, deleting,
    showGuestDetail, selectedGuest, closeGuestDetail,
    showImport, importFile, importFileRef, importResult, importing, importProgress, importTotal, importSaved,
    guestForm, guestsToRender, guestStats, rsvpFilters, rsvpOptions,
    rsvpBadge, rsvpIcon, sideBadge,
    init, cycleSideFilter,
    btnActionsList, handleGuestAction, openInfo,
    openAddGuest, openEdit, closeModal, saveGuest,
    confirmDelete, doDelete,
    onFileChange, doImport, exportGuests,
  }
}
