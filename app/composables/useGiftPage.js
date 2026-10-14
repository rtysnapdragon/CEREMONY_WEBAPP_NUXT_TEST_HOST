import { formatDate } from '~/helpers/str'
import { CalendarDate, today, getLocalTimeZone } from '@internationalized/date'

export function useGiftPage() {
  const giftStore = useGiftStore()
  const guestStore = useGuestStore()
  const eventStore = useEventStore()
  const toast = useToastStore()
  const translationStore = useTranslationStore()
  const langStore = useLanguageStore()
  const { tr } = useTr()
  const t = tr

  // ── Filters ────────────────────────────────────────────────────────────────
  const searchQuery = ref('')
  const typeFilter = ref('all')

  // ── Modal (add/edit) ───────────────────────────────────────────────────────
  const showModal = ref(false)
  const editingGift = ref(null)
  const saving = ref(false)
  const autoTranslate = ref(false)

  // ── Delete confirm ─────────────────────────────────────────────────────────
  const deletingGift = ref(null)
  const deleting = ref(false)
  // ── Form ───────────────────────────────────────────────────────────────────
  const basic        = shallowRef<CalendarDate | null>(new CalendarDate(2025, 6, 15))
  const defaultForm = () => ({
    guestName: '', guestId: '', type: 'cash', amount: '',priority:'item',
    description: '', 
    receivedAt:  today(getLocalTimeZone()),
    // receivedAt: new Date().toISOString().slice(0, 16),
  })
  const giftForm = reactive(defaultForm())

  // ── Init (5s poll on event day) ────────────────────────────────────────────
  const { init } = useEventPage(async () => {
    await giftStore.fetchGifts(0)
    if (!guestStore.guests?.length) guestStore.fetchGuests(0)
  }, 10_000)

  // ── Table config ───────────────────────────────────────────────────────────
  const typeFilters = [
    { value: 'all', label: 'All' },
    { value: 'cash', label: t('gifts.cash') },
    { value: 'item', label: t('gifts.non_cash') },
  ]

  const giftColumns = computed(() => [
    { key: 'guestName', label: 'Guest' },
    { key: 'type', label: t('gifts.gift_type'), width: '110px' },
    { key: 'amount', label: t('gifts.gift_amount') },
    { key: 'receivedAt', label: t('gifts.gift_date'), width: '130px' },
    { key: 'actions', label: '', width: '72px', align: 'right' },
  ])

  // ── Stats ──────────────────────────────────────────────────────────────────
  const giftStats = computed(() => [
    { key: 'total', icon: 'ri-gift-2-fill', value: giftStore.stats.total, label: 'Total Gifts', color: 'var(--c-accent)', bg: 'rgba(255,140,66,0.12)' },
    { key: 'cash', icon: 'ri-money-dollar-circle-fill', value: `$${giftStore.stats.totalCash.toLocaleString()}`, label: t('gifts.total_cash'), color: 'var(--c-success)', bg: 'rgba(74,222,128,0.12)' },
    { key: 'items', icon: 'ri-box-3-fill', value: giftStore.stats.itemCount, label: t('gifts.non_cash'), color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
    { key: 'avg', icon: 'ri-bar-chart-box-fill', value: `$${Math.round(giftStore.stats.avgCash).toLocaleString()}`, label: 'Avg Cash Gift', color: '#d4a843', bg: 'rgba(212,168,67,0.12)' },
  ])

  // ── Filtered data ──────────────────────────────────────────────────────────
  const filteredGifts = computed(() => {
    let list = giftStore.gifts
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      list = list.filter((g) => g.guestName.toLowerCase().includes(q) || (g.description ?? '').toLowerCase().includes(q))
    }
    if (typeFilter.value !== 'all') list = list.filter((g) => g.type === typeFilter.value)
    return list
  })

  // ── Format helper ──────────────────────────────────────────────────────────
  const formatGiftDate = (dt) =>
    dt ? formatDate(new Date(dt), { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

  // ── Modal handlers ─────────────────────────────────────────────────────────
  const openAdd = () => {
    editingGift.value = null
    Object.assign(giftForm, defaultForm())
    showModal.value = true
  }

  const openEdit = (gift) => {
    console.log("Open edit -------------> ", gift)
    // editingGift.value = gift
    Object.assign(giftForm, {
      guestName: gift.guestName, guestId: gift.guestId,
      type: gift.type, amount: gift.amount, description: gift.description,
      receivedAt: gift.receivedAt ? new Date(gift.receivedAt).toISOString().slice(0, 16) : defaultForm().receivedAt,
    })
    showModal.value = true
  }

  const closeModal = () => { showModal.value = false; editingGift.value = null }

  // ── Save ───────────────────────────────────────────────────────────────────
  const saveGift = async () => {
    saving.value = true
    try {
      if (editingGift.value) {
        const updated = await giftStore.updateGift(editingGift.value.id, { ...giftForm, updatedAt: editingGift.value.updatedAt })
        if (updated) toast.add('Gift updated', t('common.success'))
        else toast.add('Failed to update gift', 'Error')
      } else {
        const created = await giftStore.addGift({ ...giftForm })
        if (created) {
          toast.add('Gift recorded', t('common.success'))
          if (autoTranslate.value && created.id) {
            const langs = langStore.activeItems.length ? langStore.activeItems : [{ code: 'en', name: 'English' }, { code: 'km', name: 'Khmer' }]
            const input = {}
            if (giftForm.description) input.description = giftForm.description
            if (Object.keys(input).length)
              translationStore.aiTranslate(input, langs, { keyPrefix: `gift.${created.id}`, feature: 'gift', referenceId: created.id })
                .then(() => toast.add('Translations saved', 'AI')).catch(() => {})
          }
        } else toast.add('Failed to record gift', 'Error')
      }
      closeModal()
    } finally { saving.value = false }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  const confirmDelete = (gift) => { deletingGift.value = gift }

  const doDelete = async () => {
    if (!deletingGift.value) return
    deleting.value = true
    try {
      const ok = await giftStore.deleteGift(deletingGift.value.id)
      if (ok) toast.add('Gift record removed', 'Deleted')
      else toast.add('Failed to delete gift', 'Error')
      deletingGift.value = null
    } finally { deleting.value = false }
  }

  return {
    giftStore, guestStore, eventStore,
    searchQuery, typeFilter,
    showModal, editingGift, saving, autoTranslate,
    deletingGift, deleting,
    giftForm,
    typeFilters, giftColumns, giftStats, filteredGifts,
    init, formatGiftDate, tr,
    openAdd, openEdit, closeModal, saveGift, confirmDelete, doDelete,
  }
}
