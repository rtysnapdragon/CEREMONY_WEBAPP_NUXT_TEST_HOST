export function useCheckinPage() {
  const checkinStore = useCheckinStore()
  const eventStore = useEventStore()
  const guestStore = useGuestStore()
  const toast = useToastStore()

  // ── QR check-in state ──────────────────────────────────────────────────────
  const qrCode = ref('')
  const qrResult = ref(null)

  // ── Manual modal state ─────────────────────────────────────────────────────
  const showManual = ref(false)
  const manualDevice = ref('')
  const guestSearch = ref('')
  const guestResults = ref([])
  const selectedGuest = ref(null)

  // ── Computed stats ─────────────────────────────────────────────────────────
  const qrCount = computed(() => checkinStore.logs.filter((l) => l.checkinMethod === 'QR').length)
  const manualCount = computed(() => checkinStore.logs.filter((l) => l.checkinMethod === 'MANUAL').length)

  // ── Init ───────────────────────────────────────────────────────────────────
  const { init } = useEventPage(async () => {
    await checkinStore.fetchLogs()
    if (!guestStore.guests?.length) guestStore.fetchGuests(0)
  }, 5_000)

  // ── Helpers ────────────────────────────────────────────────────────────────
  const formatCheckinTime = (dt) => {
    if (!dt) return ''
    return new Date(dt).toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  }

  const extractQrCode = (raw) => {
    const s = raw?.trim() ?? ''
    try {
      const url = new URL(s)
      const segments = url.pathname.split('/').filter(Boolean)
      return segments[segments.length - 1] || s
    } catch { return s }
  }

  // ── QR check-in ────────────────────────────────────────────────────────────
  const checkinByQr = async () => {
    if (!qrCode.value) return
    const result = await checkinStore.checkinByQr(extractQrCode(qrCode.value))
    qrResult.value = result.success
      ? { success: true, message: `Checked in: ${result.data?.guestName ?? 'Guest'}` }
      : { success: false, message: result.error || 'Check-in failed. QR code not found.' }
    if (result.success) {
      qrCode.value = ''
      toast.add(qrResult.value.message, 'Checked In')
      await checkinStore.fetchLogs()
    }
    setTimeout(() => { qrResult.value = null }, 4000)
  }

  // ── Guest search ───────────────────────────────────────────────────────────
  const onGuestSearch = () => {
    const q = guestSearch.value.trim().toLowerCase()
    selectedGuest.value = null
    if (!q) { guestResults.value = []; return }
    guestResults.value = (guestStore.guests ?? [])
      .filter((g) => g.name?.toLowerCase().includes(q) && g.status !== 'ATTENDED')
      .slice(0, 8)
  }

  const selectGuest = (g) => {
    selectedGuest.value = g
    guestSearch.value = g.name
    guestResults.value = []
  }

  // ── Manual modal ───────────────────────────────────────────────────────────
  const closeManual = () => {
    showManual.value = false
    selectedGuest.value = null
    guestSearch.value = ''
    guestResults.value = []
    manualDevice.value = ''
  }

  const openManual = () => { closeManual(); showManual.value = true }

  const doManualCheckin = async () => {
    if (!selectedGuest.value) return
    const result = await checkinStore.checkinGuest(selectedGuest.value.id, 'MANUAL', manualDevice.value)
    if (result.success) {
      toast.add(`${selectedGuest.value.name} checked in`, 'Checked In')
      closeManual()
      await checkinStore.fetchLogs()
    } else {
      toast.add(result.error || 'Check-in failed', 'Error')
    }
  }

  return {
    checkinStore, eventStore,
    qrCode, qrResult,
    showManual, manualDevice, guestSearch, guestResults, selectedGuest,
    qrCount, manualCount,
    init,
    formatCheckinTime,
    checkinByQr, onGuestSearch, selectGuest,
    openManual, closeManual, doManualCheckin,
  }
}
