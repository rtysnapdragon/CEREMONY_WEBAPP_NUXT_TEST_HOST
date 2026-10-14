import { ref, computed, reactive } from 'vue'

/**
 * Core composable for invitation template pages (invite/[token].vue).
 * Provides formatting helpers, countdown, RSVP, wishes, gift recording, and sharing.
 */
export function useInviteActions(invRef, token) {
  function getBase() {
    const tmpServer = useCookie('tmp_server').value
    const { config } = helper()
    return (tmpServer || config.apiUrl || '').replace(/\/$/, '')
  }
  const BASE = getBase()

  // ── Music / YouTube ──────────────────────────────────────────────────
  const musicPlaying = computed(() => invRef.value?.musicPlaying?.value ?? false)

  const youtubeEmbedId = computed(() => {
    const id = invRef.value?.youtubeEmbedId?.value
    if (id) return id
    const url = invRef.value?.youtubeUrl || invRef.value?.musicUrl || ''
    if (!url) return ''
    const m = url.match(/(?:youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{11})/)
    return m ? m[1] : ''
  })

  // ── Countdown ────────────────────────────────────────────────────────
  const countdown = ref(null)
  let countdownTimer = null

  function buildCountdown() {
    const showCountdown = invRef.value?.showCountdown ?? true
    if (!showCountdown) return (countdown.value = null)
    const dateStr = invRef.value?.countdownDate || invRef.value?.weddingDate || invRef.value?.eventDate
    if (!dateStr) return (countdown.value = null)
    const diff = new Date(dateStr) - Date.now()
    if (diff <= 0) return (countdown.value = null)
    const days  = Math.floor(diff / 86400000)
    const hours = Math.floor((diff % 86400000) / 3600000)
    const mins  = Math.floor((diff % 3600000) / 60000)
    const secs  = Math.floor((diff % 60000) / 1000)
    countdown.value = [
      { label: 'ថ្ងៃ', value: String(days).padStart(2, '0') },
      { label: 'ម៉ោង', value: String(hours).padStart(2, '0') },
      { label: 'នាទី', value: String(mins).padStart(2, '0') },
      { label: 'វិនាទី', value: String(secs).padStart(2, '0') },
    ]
  }

  function startCountdown() {
    buildCountdown()
    countdownTimer = setInterval(buildCountdown, 1000)
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => clearInterval(countdownTimer))
    }
  }

  // ── Date / time formatters ──────────────────────────────────────────
  const KH_MONTHS = ['មករា','កុម្ភៈ','មីនា','មេសា','ឧសភា','មិថុនា','កក្កដា','សីហា','កញ្ញា','តុលា','វិច្ឆិកា','ធ្នូ']
  const KH_DAYS   = ['អាទិត្យ','ចន្ទ','អង្គារ','ពុធ','ព្រហស្បតិ៍','សុក្រ','សៅរ៍']

  function fmtDateEn(dt) {
    if (!dt) return '—'
    const d = new Date(dt)
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  }

  function fmtDateKh(dt) {
    if (!dt) return '—'
    const d = new Date(dt)
    return `ថ្ងៃ${KH_DAYS[d.getDay()]} ទី${d.getDate()} ខែ${KH_MONTHS[d.getMonth()]} ឆ្នាំ${d.getFullYear()}`
  }

  function fmtTime(dt) {
    if (!dt) return '—'
    const d = new Date(dt)
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  function sideFamilyKh(side) {
    const map = { GROOM: 'ខាងប្រុស', BRIDE: 'ខាងស្រី', BOTH: 'ម្ខាង' }
    return map[side?.toUpperCase()] ?? side ?? ''
  }

  // ── Image URL helper ────────────────────────────────────────────────
  function imgUrl(path) {
    if (!path) return ''
    if (path.startsWith('http')) return path
    return `${BASE}${path.startsWith('/') ? '' : '/'}${path}`
  }

  // ── RSVP ────────────────────────────────────────────────────────────
  const rsvpLoading = ref(null)

  async function rsvp(action) {
    const showRsvp = invRef.value?.showRsvp ?? true
    if (!showRsvp) return
    rsvpLoading.value = action
    try {
      const res = await fetch(`${BASE}/api/v1/invite/${token}/rsvp/${action}`, {
        method: 'POST',
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'RSVP failed')
      if (invRef.value) {
        invRef.value.currentStatus = action === 'confirm' ? 'CONFIRMED' : 'DECLINED'
      }
    } catch (e) {
      console.error('RSVP error:', e)
    } finally {
      rsvpLoading.value = null
    }
  }

  // ── Wishes ──────────────────────────────────────────────────────────
  const wishForm = reactive({ message: '' })
  const wishLoading = ref(false)
  const wishError = ref('')
  const wishSuccess = ref(false)
  const allWishes = ref([])

  function loadWishes() {
    allWishes.value = invRef.value?.wishes ?? []
  }

  async function submitWish() {
    if (!wishForm.message.trim()) {
      wishError.value = 'សូមបំពេញសារ'
      return
    }
    wishLoading.value = true
    wishError.value = ''
    wishSuccess.value = false
    try {
      const res = await fetch(`${BASE}/api/v1/invite/${token}/wishes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: invRef.value?.guestName || invRef.value?.name || 'Guest',
          message: wishForm.message.trim(),
        }),
      })
      if (!res.ok) throw new Error('Failed')
      const guestName = invRef.value?.guestName || invRef.value?.name || 'Guest'
      allWishes.value = [
        { guestName, message: wishForm.message.trim(), createdAt: new Date().toISOString() },
        ...allWishes.value,
      ]
      wishForm.message = ''
      wishSuccess.value = true
      setTimeout(() => { wishSuccess.value = false }, 3000)
    } catch {
      wishError.value = 'បានបរាជ័យ! សូមព្យាយាមម្ដងទៀត'
    } finally {
      wishLoading.value = false
    }
  }

  onMounted(() => loadWishes())

  // ── Gift Recording ──────────────────────────────────────────────────
  const giftForm = reactive({ amount: '', giftType: 'CASH', description: '' })
  const giftLoading = ref(false)
  const giftError = ref('')
  const giftSuccess = ref(false)
  const localGifts = ref([])

  const allGifts = computed(() => {
    const history = invRef.value?.giftHistory ?? []
    return [...localGifts.value, ...history]
  })

  async function recordGift() {
    if (!giftForm.amount || Number(giftForm.amount) <= 0) {
      giftError.value = 'សូមបញ្ចូលចំនួនទឹកប្រាក់'
      return
    }
    const qrCode = invRef.value?.qrCode
    if (!qrCode) {
      giftError.value = 'មិនអាចរកឃើញ QR Code បាន'
      return
    }
    giftLoading.value = true
    giftError.value = ''
    giftSuccess.value = false
    try {
      const res = await fetch(`${BASE}/api/v1/qr/${qrCode}/gift`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(giftForm.amount),
          giftType: giftForm.giftType,
          description: giftForm.description.trim(),
        }),
      })
      if (!res.ok) throw new Error('Failed')
      const json = await res.json()
      const newGift = {
        amount: Number(giftForm.amount),
        giftType: giftForm.giftType,
        description: giftForm.description.trim(),
        receivedAt: new Date().toISOString(),
      }
      localGifts.value.unshift(newGift)
      if (json.data) {
        invRef.value.currentStatus = json.data.currentStatus
        invRef.value.giftHistory = json.data.giftHistory ?? invRef.value.giftHistory
        invRef.value.totalGiftAmount = json.data.totalGiftAmount ?? invRef.value.totalGiftAmount
      }
      giftForm.amount = ''
      giftForm.description = ''
      giftSuccess.value = true
      setTimeout(() => { giftSuccess.value = false }, 3000)
    } catch (e) {
      giftError.value = 'ការកំណត់អំណោយបរាជ័យ! សូមព្យាយាមម្ដងទៀត'
    } finally {
      giftLoading.value = false
    }
  }

  // ── QR / sharing ────────────────────────────────────────────────────
  const qrValue = computed(() => {
    if (typeof window === 'undefined') return ''
    return `${window.location.origin}/invite/${token}`
  })

  const whatsappLink = computed(() => {
    const url = qrValue.value
    const groom = invRef.value?.groomName || invRef.value?.host2Name || ''
    const bride = invRef.value?.brideName || invRef.value?.host1Name || ''
    const msg = encodeURIComponent(`${groom} & ${bride} — You are invited!\n${url}`)
    return `https://wa.me/?text=${msg}`
  })

  const facebookLink = computed(() => {
    const url = qrValue.value
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
  })

  const telegramLink = computed(() => {
    return invRef.value?.telegramBotUrl || `https://t.me/share/url?url=${encodeURIComponent(qrValue.value)}`
  })

  const copied = ref(false)
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(qrValue.value)
      copied.value = true
      setTimeout(() => { copied.value = false }, 2000)
    } catch {}
  }

  // ── Theme / Colors ──────────────────────────────────────────────────
  const themeColors = computed(() => {
    const tc = invRef.value?.themeConfig
    if (tc) {
      return {
        primary: tc.primaryColor || '#c9a84c',
        secondary: tc.secondaryColor || '#e4b035',
        background: tc.backgroundColor || '#0c0a06',
        text: tc.textColor || '#f5f0e8',
        accent: tc.accentColor || '#c9a84c',
      }
    }
    return {
      primary: '#c9a84c',
      secondary: '#e4b035',
      background: '#0c0a06',
      text: '#f5f0e8',
      accent: '#c9a84c',
    }
  })

  // ── Helpers for new fields ──────────────────────────────────────────
  // Love story timeline
  const storyTimeline = computed(() => invRef.value?.storyTimeline ?? [])

  // Ceremony info
  const ceremonyInfo = computed(() => ({
    title: invRef.value?.ceremonyTitle,
    date: invRef.value?.ceremonyDate,
    time: invRef.value?.ceremonyTime,
    venue: invRef.value?.ceremonyVenue,
    address: invRef.value?.ceremonyAddress,
    mapUrl: invRef.value?.ceremonyMapUrl,
  }))

  // Reception info
  const receptionInfo = computed(() => ({
    title: invRef.value?.receptionTitle,
    date: invRef.value?.receptionDate,
    time: invRef.value?.receptionTime,
    venue: invRef.value?.receptionVenue,
    address: invRef.value?.receptionAddress,
    mapUrl: invRef.value?.receptionMapUrl,
  }))

  // Schedule with full details
  const scheduleItems = computed(() => invRef.value?.schedule ?? [])

  // Gift options
  const giftOptions = computed(() => invRef.value?.giftOptions ?? [])

  // Videos
  const videos = computed(() => invRef.value?.videos ?? [])

  // Custom sections
  const customSections = computed(() => invRef.value?.sections ?? [])

  // Social sharing URLs
  const instagramUrl = computed(() => invRef.value?.instagramUrl)
  const facebookUrl = computed(() => invRef.value?.facebookUrl)
  const telegramUrl = computed(() => invRef.value?.telegramUrl)

  // Social sharing
  const socialInfo = computed(() => ({
    hashtag: invRef.value?.hashtag,
    instagramUrl: instagramUrl.value,
    facebookUrl: facebookUrl.value,
    telegramUrl: telegramUrl.value,
    shareTitle: invRef.value?.shareTitle || invRef.value?.weddingTitle,
    shareDescription: invRef.value?.shareDescription || invRef.value?.invitationMessage,
    shareImage: invRef.value?.shareImage || invRef.value?.coverImage || invRef.value?.heroImage,
  }))

  // Special messages
  const specialMessages = computed(() => ({
    announcement: invRef.value?.announcement,
    importantNote: invRef.value?.importantNote,
    specialNote: invRef.value?.specialNote,
    closing: invRef.value?.closing,
    thankYouMessage: invRef.value?.thankYouMessage,
  }))

  // Footer
  const footerInfo = computed(() => ({
    title: invRef.value?.footerTitle,
    message: invRef.value?.footerMessage,
    logo: invRef.value?.footerLogo,
    note: invRef.value?.footerNote,
  }))

  // Guest options
  const guestOptions = computed(() => ({
    allowGuestCount: invRef.value?.allowGuestCount ?? true,
    maxGuests: invRef.value?.maxGuests ?? 2,
    allowPlusOne: invRef.value?.allowPlusOne ?? false,
    allowChildren: invRef.value?.allowChildren ?? false,
    mealSelection: invRef.value?.mealSelection ?? false,
    mealOptions: invRef.value?.mealOptions ?? [],
  }))

  // RSVP settings
  const rsvpSettings = computed(() => ({
    showRsvp: invRef.value?.showRsvp ?? true,
    title: invRef.value?.rsvpTitle,
    note: invRef.value?.rsvpNote,
    deadline: invRef.value?.rsvpDeadline,
    url: invRef.value?.rsvpUrl,
    required: invRef.value?.rsvpRequired ?? false,
  }))

  // Contact info
  const contactInfo = computed(() => ({
    name: invRef.value?.contactName,
    phone: invRef.value?.contactPhone,
    email: invRef.value?.contactEmail,
    contacts: invRef.value?.contacts,
  }))

  // Countdown settings
  const countdownSettings = computed(() => ({
    show: invRef.value?.showCountdown ?? true,
    title: invRef.value?.countdownTitle,
    date: invRef.value?.countdownDate,
  }))

  // Hero info
  const heroInfo = computed(() => ({
    title: invRef.value?.heroTitle,
    subtitle: invRef.value?.heroSubtitle,
    description: invRef.value?.heroDescription,
    image: invRef.value?.heroImage,
    video: invRef.value?.heroVideo,
    logo: invRef.value?.logo,
  }))

  // Hosts / Parents
  const hostsInfo = computed(() => ({
    host1Name: invRef.value?.host1Name,
    host2Name: invRef.value?.host2Name,
    host1Role: invRef.value?.host1Role,
    host2Role: invRef.value?.host2Role,
    host1Title: invRef.value?.host1Title,
    host2Title: invRef.value?.host2Title,
    host1Photo: invRef.value?.host1Photo,
    host2Photo: invRef.value?.host2Photo,
    host1Bio: invRef.value?.host1Bio,
    host2Bio: invRef.value?.host2Bio,
    host1Name1: invRef.value?.host1Name1,
    host1Name2: invRef.value?.host1Name2,
    host1Address: invRef.value?.host1Address,
    host2Name1: invRef.value?.host2Name1,
    host2Name2: invRef.value?.host2Name2,
    host2Address: invRef.value?.host2Address,
    familyMessage: invRef.value?.familyMessage,
  }))

  // Invitation content
  const invitationContent = computed(() => ({
    opening: invRef.value?.opening,
    title: invRef.value?.invitationTitle,
    message: invRef.value?.invitationMessage,
    inviteTo: invRef.value?.inviteTo,
    guestGreeting: invRef.value?.guestGreeting,
  }))

  // Event details
  const eventDetails = computed(() => ({
    name: invRef.value?.eventName || invRef.value?.weddingTitle,
    typeLabel: invRef.value?.eventTypeLabel,
    date: invRef.value?.eventDate || invRef.value?.weddingDate,
    endDate: invRef.value?.eventEndDate,
    startTime: invRef.value?.startTime,
    endTime: invRef.value?.endTime,
    timezone: invRef.value?.timezone,
    venue: invRef.value?.venue || invRef.value?.weddingLocation,
    venueName: invRef.value?.venueName,
    venueAddress: invRef.value?.venueAddress,
    venueDescription: invRef.value?.venueDescription,
    venuePhone: invRef.value?.venuePhone,
    mapUrl: invRef.value?.mapUrl,
    latitude: invRef.value?.latitude,
    longitude: invRef.value?.longitude,
  }))

  // Love story
  const loveStory = computed(() => ({
    title: invRef.value?.storyTitle,
    description: invRef.value?.storyDescription,
    content: invRef.value?.loveStory || invRef.value?.coupleStory,
  }))

  // Gallery
  const galleryItems = computed(() => invRef.value?.gallery ?? invRef.value?.galleryLegacy ?? [])

  return {
    // Music
    musicPlaying,
    youtubeEmbedId,
    // Countdown
    countdown,
    startCountdown,
    // Formatters
    fmtDateEn,
    fmtDateKh,
    fmtTime,
    sideFamilyKh,
    // Image helper
    imgUrl,
    // RSVP
    rsvp,
    rsvpLoading,
    rsvpSettings,
    // Wishes
    wishForm,
    wishLoading,
    wishError,
    wishSuccess,
    allWishes,
    submitWish,
    // Gift recording
    giftForm,
    giftLoading,
    giftError,
    giftSuccess,
    localGifts,
    allGifts,
    recordGift,
    // QR / sharing
    qrValue,
    whatsappLink,
    facebookLink,
    telegramLink,
    copied,
    copyLink,
    // Theme
    themeColors,
    // New fields helpers
    storyTimeline,
    ceremonyInfo,
    receptionInfo,
    scheduleItems,
    giftOptions,
    videos,
    customSections,
    socialInfo,
    specialMessages,
    footerInfo,
    guestOptions,
    contactInfo,
    countdownSettings,
    heroInfo,
    hostsInfo,
    invitationContent,
    eventDetails,
    loveStory,
    galleryItems,
  }
}