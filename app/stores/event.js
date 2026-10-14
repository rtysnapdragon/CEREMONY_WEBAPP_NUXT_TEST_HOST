// stores/event.js — Weddings store connected to Spring API
import { defineStore, acceptHMRUpdate } from 'pinia'

const PLAN_LIMITS = { FREE: 1, PROFESSIONAL: 10, ENTERPRISE: Infinity }

const STATUS_COLORS = {
  PLANNING: 'var(--c-accent)',
  CONFIRMED: 'var(--c-accent-2)',
  IN_PROGRESS: 'var(--c-success)',
  COMPLETED: 'var(--c-muted)',
  CANCELLED: 'var(--c-danger)',
}

// ── Generic dynamic event fields (mirrors backend EventDataRequest) ──
const DYNAMIC_FIELDS = [
  // General / Template
  'subtitle', 'templateType', 'language', 'theme',
  // Hero / Header
  'heroTitle', 'heroSubtitle', 'heroDescription', 'heroImage', 'heroVideo', 'logo',
  // Hosts / Organizers (extended)
  'host1Role', 'host2Role', 'host1Title', 'host2Title', 'host1Photo', 'host2Photo',
  'host1Bio', 'host2Bio', 'host1Name1', 'host1Name2', 'host1Address', 'host2Name1', 'host2Name2', 'host2Address',
  'host1Parents', 'host2Parents', 'familyMessage', 'parentFamilies',
  // Invitation copy
  'opening', 'invitationTitle', 'invitationMessage', 'inviteTo', 'guestGreeting', 'guestName', 'guestMessage',
  // Event details (extended)
  'eventName', 'eventTypeLabel', 'eventEndDate', 'startTime', 'endTime', 'timezone',
  'venueName', 'venueAddress', 'venueDescription', 'venuePhone', 'mapUrl', 'latitude', 'longitude',
  // Ceremony block
  'ceremonyTitle', 'ceremonyDate', 'ceremonyTime', 'ceremonyVenue', 'ceremonyAddress', 'ceremonyMapUrl',
  // Reception block
  'receptionTitle', 'receptionDate', 'receptionTime', 'receptionVenue', 'receptionAddress', 'receptionMapUrl',
  // Love story
  'storyTitle', 'storyDescription', 'loveStory', 'storyTimeline', 'timeline',
  // Countdown
  'showCountdown', 'countdownTitle', 'countdownDate',
  // RSVP / contacts
  'showRsvp', 'rsvpTitle', 'rsvpNote', 'rsvpUrl', 'rsvpRequired', 'contacts', 'contactName', 'contactPhone', 'contactEmail',
  // Guest options
  'allowGuestCount', 'maxGuests', 'allowPlusOne', 'allowChildren', 'mealSelection', 'mealOptions',
  // Gift / Registry
  'showGiftInfo', 'giftTitle', 'giftMessage', 'giftNote', 'registryUrl', 'bankAccount', 'bankName', 'accountName', 'giftOptions',
  // Gallery copy & media
  'galleryTitle', 'galleryDescription', 'gallery',
  // Videos / Music
  'musicTitle', 'musicArtist', 'musicUrl', 'videos', 'videoItems', 'youtubeEmbedId', 'musicPlaying',
  // Social / Sharing
  'hashtag', 'instagramUrl', 'facebookUrl', 'telegramUrl', 'shareTitle', 'shareDescription', 'shareImage',
  // Special messages
  'announcement', 'importantNote', 'specialNote', 'closing', 'thankYouMessage',
  // Custom sections / Theme config / Footer
  'sections', 'customSections', 'themeConfig', 'footerTitle', 'footerMessage', 'footerLogo', 'footerNote',
]

// Backend LocalDateTime fields that need second-padding before sending
const DATETIME_FIELDS = ['eventDate', 'eventEndDate']

// Keys that never go into the dynamic payload (handled elsewhere or computed client-side)
const SKIP_PAYLOAD_KEYS = new Set([
  // Core (sent explicitly by addEvent/saveEvent)
  'id', 'title', 'host1Name', 'host2Name', 'groomPhone', 'bridePhone',
  'eventTypeId', 'location', 'venue', 'totalBudget', 'budget', 'status', 'coverImage',
  // Backward-compat aliases
  'brideName', 'groomName', 'date', 'time',
  // Computed client-side (fromApi)
  'eventType', 'type', 'color', 'budgetSpent', 'guestCount', 'confirmedGuests',
  'tasks', 'organizationId', 'createdAt', 'updatedAt',
  // Legacy wedding-specific settings (belong to the settings endpoint)
  'coupleStory', 'bankName', 'bankAccount', 'bankAccountName', 'giftQrImageUrl',
  'notifChatId', 'wishNotifChatId', 'giftNotifChatId', 'youtubeUrl',
  // Invitation letter (settings endpoint + translations table)
  'inviteTemplateId', 'inviteThemeId', 'invitePrimaryColor', 'inviteBgColor',
  'inviteMapUrl', 'inviteContacts', 'inviteSchedule', 'inviteSections',
  'musicAutoplay', 'inviteMessage', 'rsvpDeadline', 'allowRsvp', 'showWhatsapp', 'showFacebook',
  'translations',
  'inviteTitle', 'inviteOpening', 'groomFather', 'groomMother', 'groomAddress',
  'brideFather', 'brideMother', 'brideAddress', 'weddingDate',
])

const formatDate = (dt) => {
  if (!dt) return null
  if (dt.length === 16) return `${dt}:00`   // add missing seconds
  return dt.substring(0, 19)                 // strip millis/tz if present
}

/**
 * Builds the dynamic portion of an event payload: known generic fields pass
 * straight through; anything else on the source lands in `extraData`
 * (the backend catch-all JSON column) so no per-type property is ever lost.
 */
const buildDynamicPayload = (src) => {
  const out = {}
  const extras = {}
  Object.keys(src ?? {}).forEach((key) => {
    const value = src[key]
    if (value === undefined || value === null || value === '') return
    if (typeof value === 'function') return
    if (DATETIME_FIELDS.includes(key)) {
      out[key] = formatDate(value)
      return
    }
    if (DYNAMIC_FIELDS.includes(key)) {
      out[key] = value
      return
    }
    if (!SKIP_PAYLOAD_KEYS.has(key)) extras[key] = value
  })
  if (Object.keys(extras).length) out.extraData = extras
  return out
}

const fromApi = (w) => {
  const ed = w.eventData || w.extraData || {}
  const host1Name = w.host1Name ?? w.brideName ?? ed.host1Name ?? ''
  const host2Name = w.host2Name ?? w.groomName ?? ed.host2Name ?? ''
  const eventDate = w.eventDate ?? w.weddingDate ?? ed.eventDate ?? null
  return ({
  id: w.id,
  title: w.title || ed.eventName || `${host1Name} & ${host2Name}`.trim() || 'Untitled Event',
  // New canonical fields
  host1Name,
  host2Name,
  // Backward-compat aliases for invite templates that still use brideName/groomName
  brideName: w.brideName ?? host1Name,
  groomName: w.groomName ?? host2Name,
  bridePhone: w.bridePhone ?? ed.bridePhone ?? '',
  groomPhone: w.groomPhone ?? ed.groomPhone ?? '',
  eventTypeId: w.eventTypeId ?? null,
  eventType: w.eventType ?? null,
  date: eventDate ? new Date(eventDate).toISOString() : null,
  time: eventDate
    ? new Date(eventDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null,
  venue: w.translations?.venue?.km ?? w.translations?.venue?.en ?? w.venueKm ?? w.location ?? ed.venue ?? ed.venueName ?? '',
  location: w.location ?? ed.location ?? '',
  status: (w.status ?? 'PLANNING').toLowerCase(),
  type: w.eventType?.code?.toLowerCase() ?? ed.templateType ?? 'wedding',
  color: STATUS_COLORS[w.status] ?? STATUS_COLORS.PLANNING,
  coverImage: w.coverImage ?? ed.coverImage ?? '',
  budget: w.totalBudget ? Number(w.totalBudget) : (ed.budget ? Number(ed.budget) : 0),
  budgetSpent: 0,
  guestCount: 0,
  confirmedGuests: 0,
  tasks: { total: 0, completed: 0 },
  organizationId: w.organizationId,
  coupleStory: w.coupleStory ?? ed.coupleStory ?? ed.loveStory ?? '',
  bankName: w.bankName ?? ed.bankName ?? '',
  bankAccount: w.bankAccount ?? ed.bankAccount ?? '',
  bankAccountName: w.bankAccountName ?? ed.accountName ?? ed.bankAccountName ?? '',
  notifChatId: w.notifChatId ?? ed.notifChatId ?? '',
  wishNotifChatId: w.wishNotifChatId ?? ed.wishNotifChatId ?? '',
  giftNotifChatId: w.giftNotifChatId ?? ed.giftNotifChatId ?? '',
  createdAt: w.createdAt,
  updatedAt: w.updatedAt,
  // invitation letter
  inviteTemplateId: w.inviteTemplateId ?? ed.templateType ?? '',
  inviteThemeId: w.inviteThemeId ?? null,
  invitePrimaryColor: w.invitePrimaryColor ?? '#c0392b',
  inviteBgColor: w.inviteBgColor ?? '#fdf6ef',
  inviteMapUrl: w.inviteMapUrl ?? ed.mapUrl ?? '',
  inviteContacts: w.inviteContacts ?? ed.contacts ?? '',
  inviteSchedule: w.inviteSchedule ? (() => { try { return JSON.parse(w.inviteSchedule) } catch { return [] } })() : (ed.schedule ?? []),
  // ── Invitation letter — single default-language fields (no Km/En pairing) ──
  // Value resolution: translations.<key>.<km> → translations.<key>.<en> → flat column.
  inviteTitle: w.translations?.inviteTitle?.km ?? w.translations?.inviteTitle?.en ?? w.inviteTitleKm ?? ed.invitationTitle ?? '',
  inviteOpening: w.translations?.inviteOpening?.km ?? w.translations?.inviteOpening?.en ?? w.inviteOpeningKm ?? ed.opening ?? '',
  groomFather: w.translations?.groomFather?.km ?? w.translations?.groomFather?.en ?? w.groomFatherKm ?? ed.host2Name1 ?? '',
  groomMother: w.translations?.groomMother?.km ?? w.translations?.groomMother?.en ?? w.groomMotherKm ?? ed.host2Name2 ?? '',
  groomAddress: w.translations?.groomAddress?.km ?? w.translations?.groomAddress?.en ?? w.groomAddressKm ?? ed.host2Address ?? '',
  brideFather: w.translations?.brideFather?.km ?? w.translations?.brideFather?.en ?? w.brideFatherKm ?? ed.host1Name1 ?? '',
  brideMother: w.translations?.brideMother?.km ?? w.translations?.brideMother?.en ?? w.brideMotherKm ?? ed.host1Name2 ?? '',
  brideAddress: w.translations?.brideAddress?.km ?? w.translations?.brideAddress?.en ?? w.brideAddressKm ?? ed.host1Address ?? '',
  weddingDate: w.translations?.weddingDate?.km ?? w.translations?.weddingDate?.en ?? w.weddingDateKm ?? '',
  // Column value wins when set; falls back to legacy bilingual letter translations
  venueAddress: w.venueAddress || (w.translations?.venueAddress?.km ?? w.translations?.venueAddress?.en ?? w.venueAddressKm ?? ed.venueAddress ?? ''),
  // Column value wins when set; falls back to legacy bilingual letter translations
  rsvpNote: w.rsvpNote || (w.translations?.rsvpNote?.km ?? w.translations?.rsvpNote?.en ?? w.rsvpNoteKm ?? ed.rsvpNote ?? ''),
  // Column value wins when set; falls back to legacy bilingual letter translations
  closing: w.closing || (w.translations?.closing?.km ?? w.translations?.closing?.en ?? w.closingKm ?? ed.closing ?? ''),
  translations: w.translations ?? {},
  // invitation behaviour
  inviteSections: w.inviteSections ? (() => { try { return JSON.parse(w.inviteSections) } catch { return null } })() : (ed.sections ?? null),
  musicAutoplay: w.musicAutoplay ?? ed.musicAutoplay ?? false,
  inviteMessage: w.inviteMessage ?? ed.invitationMessage ?? '',
  rsvpDeadline: w.rsvpDeadline ?? ed.rsvpDeadline ?? '',
  allowRsvp: w.allowRsvp ?? ed.showRsvp ?? true,
  showWhatsapp: w.showWhatsapp ?? true,
  showFacebook: w.showFacebook ?? true,
  // ── Generic dynamic event fields (event-agnostic builder) ──
  subtitle: w.subtitle ?? ed.subtitle ?? '',
  templateType: w.templateType ?? ed.templateType ?? '',
  language: w.language ?? ed.language ?? '',
  theme: w.theme ?? ed.theme ?? '',
  heroTitle: w.heroTitle ?? ed.heroTitle ?? '',
  heroSubtitle: w.heroSubtitle ?? ed.heroSubtitle ?? '',
  heroDescription: w.heroDescription ?? ed.heroDescription ?? '',
  heroImage: w.heroImage ?? ed.heroImage ?? '',
  heroVideo: w.heroVideo ?? ed.heroVideo ?? '',
  logo: w.logo ?? ed.logo ?? '',
  host1Role: w.host1Role ?? ed.host1Role ?? '',
  host2Role: w.host2Role ?? ed.host2Role ?? '',
  host1Title: w.host1Title ?? ed.host1Title ?? '',
  host2Title: w.host2Title ?? ed.host2Title ?? '',
  host1Photo: w.host1Photo ?? ed.host1Photo ?? '',
  host2Photo: w.host2Photo ?? ed.host2Photo ?? '',
  host1Bio: w.host1Bio ?? ed.host1Bio ?? '',
  host2Bio: w.host2Bio ?? ed.host2Bio ?? '',
  host1Name1: w.host1Name1 ?? ed.host1Name1 ?? '',
  host1Name2: w.host1Name2 ?? ed.host1Name2 ?? '',
  host1Address: w.host1Address ?? ed.host1Address ?? '',
  host2Name1: w.host2Name1 ?? ed.host2Name1 ?? '',
  host2Name2: w.host2Name2 ?? ed.host2Name2 ?? '',
  host2Address: w.host2Address ?? ed.host2Address ?? '',
  host1Parents: w.host1Parents ?? ed.host1Parents ?? [],
  host2Parents: w.host2Parents ?? ed.host2Parents ?? [],
  familyMessage: w.familyMessage ?? ed.familyMessage ?? '',
  parentFamilies: w.parentFamilies ?? ed.parentFamilies ?? { host1Parents: [], host2Parents: [], familyMessage: '' },
  opening: w.opening ?? ed.opening ?? '',
  invitationTitle: w.invitationTitle ?? ed.invitationTitle ?? '',
  invitationMessage: w.invitationMessage ?? ed.invitationMessage ?? '',
  inviteTo: w.inviteTo ?? ed.inviteTo ?? '',
  guestGreeting: w.guestGreeting ?? ed.guestGreeting ?? '',
  guestName: w.guestName ?? ed.guestName ?? '',
  guestMessage: w.guestMessage ?? ed.guestMessage ?? '',
  eventName: w.eventName ?? ed.eventName ?? '',
  eventTypeLabel: w.eventTypeLabel ?? ed.eventTypeLabel ?? '',
  eventEndDate: w.eventEndDate ?? ed.eventEndDate ?? null,
  startTime: w.startTime ?? ed.startTime ?? '',
  endTime: w.endTime ?? ed.endTime ?? '',
  timezone: w.timezone ?? ed.timezone ?? '',
  venueName: w.venueName ?? ed.venueName ?? '',
  venueDescription: w.venueDescription ?? ed.venueDescription ?? '',
  venuePhone: w.venuePhone ?? ed.venuePhone ?? '',
  mapUrl: w.mapUrl ?? ed.mapUrl ?? '',
  latitude: w.latitude ?? ed.latitude ?? null,
  longitude: w.longitude ?? ed.longitude ?? null,
  ceremonyTitle: w.ceremonyTitle ?? ed.ceremonyTitle ?? '',
  ceremonyDate: w.ceremonyDate ?? ed.ceremonyDate ?? '',
  ceremonyTime: w.ceremonyTime ?? ed.ceremonyTime ?? '',
  ceremonyVenue: w.ceremonyVenue ?? ed.ceremonyVenue ?? '',
  ceremonyAddress: w.ceremonyAddress ?? ed.ceremonyAddress ?? '',
  ceremonyMapUrl: w.ceremonyMapUrl ?? ed.ceremonyMapUrl ?? '',
  receptionTitle: w.receptionTitle ?? ed.receptionTitle ?? '',
  receptionDate: w.receptionDate ?? ed.receptionDate ?? '',
  receptionTime: w.receptionTime ?? ed.receptionTime ?? '',
  receptionVenue: w.receptionVenue ?? ed.receptionVenue ?? '',
  receptionAddress: w.receptionAddress ?? ed.receptionAddress ?? '',
  receptionMapUrl: w.receptionMapUrl ?? ed.receptionMapUrl ?? '',
  schedule: w.schedule ?? ed.schedule ?? [],
  storyTitle: w.storyTitle ?? ed.storyTitle ?? '',
  storyDescription: w.storyDescription ?? ed.storyDescription ?? '',
  loveStory: w.loveStory ?? ed.loveStory ?? '',
  storyTimeline: w.storyTimeline ?? ed.storyTimeline ?? [],
  timeline: w.timeline ?? ed.timeline ?? w.storyTimeline ?? ed.storyTimeline ?? [],
  showCountdown: w.showCountdown ?? ed.showCountdown ?? true,
  countdownTitle: w.countdownTitle ?? ed.countdownTitle ?? '',
  countdownDate: w.countdownDate ?? ed.countdownDate ?? '',
  showRsvp: w.showRsvp ?? ed.showRsvp ?? true,
  rsvpTitle: w.rsvpTitle ?? ed.rsvpTitle ?? '',
  rsvpUrl: w.rsvpUrl ?? ed.rsvpUrl ?? '',
  rsvpRequired: w.rsvpRequired ?? ed.rsvpRequired ?? false,
  contacts: w.contacts ?? ed.contacts ?? '',
  contactName: w.contactName ?? ed.contactName ?? '',
  contactPhone: w.contactPhone ?? ed.contactPhone ?? '',
  contactEmail: w.contactEmail ?? ed.contactEmail ?? '',
  allowGuestCount: w.allowGuestCount ?? ed.allowGuestCount ?? true,
  maxGuests: w.maxGuests ?? ed.maxGuests ?? null,
  allowPlusOne: w.allowPlusOne ?? ed.allowPlusOne ?? false,
  allowChildren: w.allowChildren ?? ed.allowChildren ?? false,
  mealSelection: w.mealSelection ?? ed.mealSelection ?? false,
  mealOptions: w.mealOptions ?? ed.mealOptions ?? [],
  showGiftInfo: w.showGiftInfo ?? ed.showGiftInfo ?? false,
  giftTitle: w.giftTitle ?? ed.giftTitle ?? '',
  giftMessage: w.giftMessage ?? ed.giftMessage ?? '',
  giftNote: w.giftNote ?? ed.giftNote ?? '',
  registryUrl: w.registryUrl ?? ed.registryUrl ?? '',
  accountName: w.accountName ?? ed.accountName ?? '',
  giftOptions: w.giftOptions ?? ed.giftOptions ?? [],
  galleryTitle: w.galleryTitle ?? ed.galleryTitle ?? '',
  galleryDescription: w.galleryDescription ?? ed.galleryDescription ?? '',
  gallery: w.gallery ?? ed.gallery ?? [],
  videos: w.videos ?? ed.videos ?? w.videoItems ?? ed.videoItems ?? [],
  videoItems: w.videoItems ?? ed.videoItems ?? w.videos ?? ed.videos ?? [],
  youtubeEmbedId: w.youtubeEmbedId ?? ed.youtubeEmbedId ?? { value: '' },
  musicPlaying: w.musicPlaying ?? ed.musicPlaying ?? { value: false },
  musicTitle: w.musicTitle ?? ed.musicTitle ?? '',
  musicArtist: w.musicArtist ?? ed.musicArtist ?? '',
  musicUrl: w.musicUrl ?? ed.musicUrl ?? '',
  hashtag: w.hashtag ?? ed.hashtag ?? '',
  instagramUrl: w.instagramUrl ?? ed.instagramUrl ?? '',
  facebookUrl: w.facebookUrl ?? ed.facebookUrl ?? '',
  telegramUrl: w.telegramUrl ?? ed.telegramUrl ?? '',
  shareTitle: w.shareTitle ?? ed.shareTitle ?? '',
  shareDescription: w.shareDescription ?? ed.shareDescription ?? '',
  shareImage: w.shareImage ?? ed.shareImage ?? '',
  announcement: w.announcement ?? ed.announcement ?? '',
  importantNote: w.importantNote ?? ed.importantNote ?? '',
  specialNote: w.specialNote ?? ed.specialNote ?? '',
  thankYouMessage: w.thankYouMessage ?? ed.thankYouMessage ?? '',
  sections: w.sections ?? ed.sections ?? w.customSections ?? ed.customSections ?? [],
  customSections: w.customSections ?? ed.customSections ?? w.sections ?? ed.sections ?? [],
  themeConfig: w.themeConfig ?? ed.themeConfig ?? {},
  footerTitle: w.footerTitle ?? ed.footerTitle ?? '',
  footerMessage: w.footerMessage ?? ed.footerMessage ?? '',
  footerLogo: w.footerLogo ?? ed.footerLogo ?? '',
  footerNote: w.footerNote ?? ed.footerNote ?? '',
  extraData: ed,
})}

export const useEventStore = defineStore('event', {
  state: () => ({
    events: [],
    loading: false,
    initialized: false,
    // Incremented whenever the local event list changes. A response that began
    // before a mutation must not replace the newer local state.
    eventRevision: 0,
    activeEventId: useCookie('current_wedding_id', { maxAge: 60 * 60 * 24 * 30 }).value || '',
  }),

  getters: {
    activeEvent: (state) =>
      state.events.find((e) => e.id === state.activeEventId) || state.events[0] || null,
    upcomingEvents: (state) =>
      state.events.filter((e) => e.status === 'planning' || e.status === 'confirmed' || e.status === 'in_progress'),
    totalGuests: (state) =>
      state.events.reduce((acc, e) => acc + (e.guestCount || 0), 0),
    weddingLimit: () => {
      const plan = (useAuthStore().user?.subscriptionPlan ?? 'FREE').toUpperCase()
      return PLAN_LIMITS[plan] ?? 1
    },
    atWeddingLimit: (state) => {
      const plan = (useAuthStore().user?.subscriptionPlan ?? 'FREE').toUpperCase()
      const limit = PLAN_LIMITS[plan] ?? 1
      return limit !== Infinity && state.events.length >= limit
    },
  },

  actions: {
    reset() {
      this.events = []
      this.loading = false
      this.initialized = false
      this.eventRevision += 1
      this.activeEventId = ''
      useCookie('current_wedding_id', { path: '/' }).value = null
    },

    async fetchEvents() {
      const revisionAtRequestStart = this.eventRevision
      this.loading = true
      try {
        const { data, error, status } = await useHttp('/api/v1/events?page=0&size=50&pagination=true', {
          method: 'GET',
          isGlobal: true,
        })
        // Creating an event can finish while this request is in flight. Do not
        // let the older empty response erase that newly created event.
        if (revisionAtRequestStart !== this.eventRevision) return

        if (error?.value) {
          this.initialized = true
          handleAuthError(status)
          return
        }
        const result = data.value?.data ?? data.value
        const list = (result?.content ?? []).map(fromApi)
        this.events = list
        if (list.length > 0 && !list.find((e) => e.id === this.activeEventId)) {
          this.setActiveEvent(list[0].id)
        } else if (this.activeEventId) {
          this._syncGuestStore(this.activeEventId)
        }
        this.initialized = true
      } finally {
        this.loading = false
      }
    },

    setActiveEvent(id) {
      this.activeEventId = id
      useCookie('current_wedding_id', { maxAge: 60 * 60 * 24 * 30 }).value = id
      this._syncGuestStore(id)
    },

    _syncGuestStore(id) {
      if (!process.client || !id) return
      const stores = [
        () => useGuestStore(),
        () => useGiftStore(),
        () => useBudgetStore(),
        () => useTaskStore(),
        () => useCeremonyStore(),
        () => useScheduleStore(),
        () => useCheckinStore(),
        () => useWeddingTableStore(),
        () => useWishStore(),
        () => useGalleryStore(),
      ]
      stores.forEach((fn) => {
        try {
          const s = fn()
          if (typeof s.setWeddingId === 'function') s.setWeddingId(id)
        } catch {}
      })
    },

    async addEvent(eventData) {
      // Auto-build title from couple names if not explicitly provided
      const title = eventData.title
        || `${eventData.brideName || eventData.host1Name || ''} & ${eventData.groomName || eventData.host2Name || ''}`.trim()
        || 'My Event'

      const payload = {
        title,
        host1Name: eventData.host1Name || eventData.brideName || '',
        host2Name: eventData.host2Name || eventData.groomName || '',
        groomPhone: eventData.groomPhone || '',
        bridePhone: eventData.bridePhone || '',
        eventDate: formatDate(eventData.eventDate ?? eventData.date),
        location: eventData.venue || eventData.location || '',
        totalBudget: eventData.budget ?? eventData.totalBudget ?? 0,
        status: 'PLANNING',
        eventTypeId: eventData.eventTypeId ?? null,
        coverImage: eventData.coverImage || undefined,
        ...buildDynamicPayload(eventData),
      }
      const { data, error, status } = await useHttp('/api/v1/events', {
        method: 'POST',
        body: payload,
        isGlobal: true,
      })
      if (error?.value) {
        if (handleAuthError(status)) return null
        throw error.value
      }
      const created = fromApi(data.value?.data ?? data.value)
      this.eventRevision += 1
      this.events.unshift(created)
      this.initialized = true
      this.setActiveEvent(created.id)  // set active + update cookie + sync child stores
      return created
    },

    updateEvent(id, data) {
      const idx = this.events.findIndex((e) => e.id === id)
      if (idx !== -1) this.events[idx] = { ...this.events[idx], ...data }
    },

    async saveEvent(id, eventData) {
      const payload = {
        title: eventData.title || `${eventData.host1Name || ''} & ${eventData.host2Name || ''}`.trim() || 'My Event',
        host1Name: eventData.host1Name || '',
        host2Name: eventData.host2Name || '',
        groomPhone: eventData.groomPhone || '',
        bridePhone: eventData.bridePhone || '',
        eventDate: formatDate(eventData.eventDate ?? eventData.date),
        location: eventData.location || eventData.venue || '',
        totalBudget: eventData.totalBudget ?? eventData.budget ?? 0,
        status: (eventData.status || 'planning').toUpperCase(),
        eventTypeId: eventData.eventTypeId ?? null,
        coverImage: eventData.coverImage || undefined,
        ...buildDynamicPayload(eventData),
      }
      const { data, error } = await useHttp(`/api/v1/events/${id}`, {
        method: 'PUT',
        body: payload,
        isGlobal: true,
      })
      if (error?.value) return { success: false, error: error.value }
      const updated = fromApi(data.value?.data ?? data.value)
      this.updateEvent(id, updated)
      return { success: true, data: updated }
    },

    async removeEvent(id) {
      const { error } = await useHttp(`/api/v1/events/${id}`, {
        method: 'DELETE',
        isGlobal: true,
      })
      if (error?.value) return { success: false, error: error.value }
      this.deleteEvent(id)
      return { success: true }
    },

    deleteEvent(id) {
      const _evidx = this.events.findIndex((e) => e.id === id); if (_evidx !== -1) this.events.splice(_evidx, 1)
      if (this.activeEventId === id) {
        this.setActiveEvent(this.events[0]?.id || '')
      }
    },
  },
})

// make sure to pass the right store definition, `useAuth` in this case.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useEventStore, import.meta.hot))
}
