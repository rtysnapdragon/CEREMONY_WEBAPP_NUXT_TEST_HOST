export function useQuickGift() {
  const giftStore = useGiftStore()
  const guestStore = useGuestStore()
  const toast = useToastStore()

  // ── State ──────────────────────────────────────────────────────────────────
  const showQuick = ref(false)
  const qgSaving = ref(false)
  const qgScanning = ref(false)
  const qgGuest = ref(null)
  const qgRecent = ref([])
  const qgGuestResults = ref([])
  const qgGuestInput = ref(null)
  const qgTapping = ref(null)
  const qgPresets = [10, 20, 50, 100, 200]

  const qg = reactive({
    guestName: '', guestId: '', guestSearch: '',
    qrInput: '', type: 'cash', amount: '', description: '',
  })

  // ── Helpers ────────────────────────────────────────────────────────────────
  const focusQgGuest = () => nextTick(() => qgGuestInput.value?.focus())
  watch(showQuick, (val) => { if (val) focusQgGuest() })

  const extractQrCode = (raw) => {
    const s = raw?.trim() ?? ''
    try {
      const url = new URL(s)
      const segments = url.pathname.split('/').filter(Boolean)
      return segments[segments.length - 1] || s
    } catch { return s }
  }

  // ── Camera / QR scan ───────────────────────────────────────────────────────
  const onCameraScanned = async (code) => { qg.qrInput = code; await scanQrCode() }

  const scanQrCode = async () => {
    const code = extractQrCode(qg.qrInput)
    if (!code || qgScanning.value) return
    qgScanning.value = true
    try {
      const { data, error } = await useHttp(`/api/v1/qr/${code}`, { method: 'GET', isGlobal: true })
      if (error?.value || !data.value) { toast.add('Guest not found for this QR code', 'Not Found'); return }
      const res = data.value?.data ?? data.value
      qgGuest.value = res
      qg.guestName = res.guestName || res.name || ''
      qg.guestId = res.guestId || res.id || ''
      qg.qrInput = ''
      qg.guestSearch = ''
      qgGuestResults.value = []
    } catch { toast.add('Failed to look up QR code', 'Error') }
    finally { qgScanning.value = false }
  }

  // ── Guest name search ──────────────────────────────────────────────────────
  const onQgSearch = () => {
    const q = qg.guestSearch.trim().toLowerCase()
    qgGuest.value = null; qg.guestName = ''; qg.guestId = ''
    if (!q) { qgGuestResults.value = []; return }
    qgGuestResults.value = (guestStore.guests ?? [])
      .filter((g) => g.name.toLowerCase().includes(q)).slice(0, 6)
  }

  const selectQgGuest = (g) => {
    qgGuest.value = g; qg.guestName = g.name; qg.guestId = g.id
    qg.guestSearch = g.name; qgGuestResults.value = []
  }

  const clearQgGuest = () => {
    qgGuest.value = null
    Object.assign(qg, { guestName: '', guestId: '', guestSearch: '', qrInput: '' })
    qgGuestResults.value = []
    focusQgGuest()
  }

  // ── Submit gift ────────────────────────────────────────────────────────────
  const qgSubmit = async () => {
    if (!qgGuest.value || qgSaving.value) return
    if (qg.type === 'cash' && !qg.amount) return
    qgSaving.value = true
    try {
      const guestQrCode = qgGuest.value.qrCode
      let checkedIn = false

      if (guestQrCode) {
        const { data, error } = await useHttp(`/api/v1/qr/${guestQrCode}/gift`, {
          method: 'POST',
          body: { amount: qg.type === 'cash' ? parseFloat(qg.amount) : null, giftType: qg.type === 'cash' ? 'CASH' : 'GIFT', description: qg.description || null },
          isGlobal: true,
        })
        if (error?.value) { toast.add('Failed to record gift', 'Error'); return }
        const res = data.value?.data ?? data.value
        checkedIn = res?.currentStatus === 'ATTENDED' || res?.action === 'GIFT_RECORDED'
        if (res) qgGuest.value = res
        giftStore.fetchGifts(0)
      } else {
        const created = await giftStore.addGift({
          guestName: qg.guestName, guestId: qg.guestId || null,
          type: qg.type, amount: qg.amount, description: qg.description,
          receivedAt: new Date().toISOString().slice(0, 16),
        })
        if (!created) { toast.add('Failed to record gift', 'Error'); return }
      }

      const label = qg.type === 'cash' ? `$${qg.amount}` : qg.description || 'Gift'
      toast.add(`${qg.guestName} — ${label} recorded${checkedIn ? ' · ✅ Checked in' : ''}`, 'Saved')
      qgRecent.value.unshift({ id: Date.now(), guestName: qg.guestName, type: qg.type, amount: qg.amount, description: qg.description, checkedIn })
      if (qgRecent.value.length > 5) qgRecent.value.pop()

      const resetFields = () => {
        qgGuest.value = null
        Object.assign(qg, { guestName: '', guestId: '', guestSearch: '', qrInput: '', amount: '', description: '' })
        focusQgGuest()
      }
      if (guestQrCode && checkedIn) setTimeout(resetFields, 1500)
      else resetFields()
    } finally { qgSaving.value = false }
  }

  const qgTapPreset = async (amount) => {
    if (!qgGuest.value || qgSaving.value) return
    qgTapping.value = amount; qg.amount = String(amount); qg.type = 'cash'
    await qgSubmit(); qgTapping.value = null
  }

  const qgTapPhysical = async () => {
    if (!qgGuest.value || qgSaving.value) return
    qgTapping.value = 'gift'; qg.amount = ''; qg.type = 'item'
    await qgSubmit(); qgTapping.value = null
  }

  return {
    showQuick, qgSaving, qgScanning, qgGuest, qgRecent,
    qgGuestResults, qgGuestInput, qgTapping, qgPresets, qg,
    onCameraScanned, scanQrCode, onQgSearch, selectQgGuest, clearQgGuest,
    qgSubmit, qgTapPreset, qgTapPhysical,
  }
}
