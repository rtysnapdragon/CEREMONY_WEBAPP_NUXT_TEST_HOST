// utils/toSettingPayload.js
// ─────────────────────────────────────────────────────────────────────────────
// Maps the invitation-letter reactive state (`useLetterData().letter`) into a
// body that matches the backend `EventSettingRequest` DTO exactly.
//
// Why: the letter object carries ~200 keys, several date pickers emit
// `CalendarDate` objects, and `eventDate` arrives as an ISO string with `.000Z`.
// The backend expects `LocalDateTime` fields as "yyyy-MM-dd'T'HH:mm:ss" and all
// other date-ish fields as plain strings. Sending the raw object produced:
//   HttpMessageNotReadableException: Cannot deserialize LocalDateTime
//   from String "2026-09-01T22:00:00.000Z"
// This util filters/renames keys and normalizes every date before the PUT.
// ─────────────────────────────────────────────────────────────────────────────

// Letter field → translations-table key (bilingual letter copy).
export const LETTER_TRANSLATIONS = {
  inviteTitle:   'title',
  inviteOpening: 'opening',
  groomName:     'host1Name',
  brideName:     'host2Name',
  groomFather:   'host1Name1',
  groomMother:   'host1Name2',
  groomAddress:  'host1Address',
  brideFather:   'host2Name1',
  brideMother:   'host2Name2',
  brideAddress:  'host2Address',
  weddingDate:   'weddingDate',
  venue:         'venue',
  venueAddress:  'venueAddress',
  rsvpNote:      'rsvpNote',
  closing:       'closing',
}

// ── Date coercion ────────────────────────────────────────────────────────────
const pad = (n) => String(n).padStart(2, '0')

function isCalendarLike(v) {
  return v && typeof v === 'object'
    && typeof v.year === 'number'
    && typeof v.month === 'number'
    && typeof v.day === 'number'
}

function dateParts(v) {
  if (isCalendarLike(v)) return { y: v.year, m: v.month, d: v.day }
  if (typeof v === 'string') {
    const m = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
    if (m) return { y: +m[1], m: +m[2], d: +m[3] }
  }
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    return { y: v.getFullYear(), m: v.getMonth() + 1, d: v.getDate() }
  }
  return null
}

function timeParts(v) {
  if (typeof v === 'string') {
    const t = v.match(/T?(\d{1,2}):(\d{2})(?::(\d{2}))?/)
    if (t) return { h: +t[1], mi: +t[2], s: +(t[3] ?? 0) }
  }
  return { h: 0, mi: 0, s: 0 }
}

/** LocalDateTime field → "yyyy-MM-ddTHH:mm:ss" (backend @JsonFormat contract). */
export function toLocalDateTime(v) {
  if (v === null || v === undefined || v === '') return null
  const p = dateParts(v)
  if (!p) return null
  const t = timeParts(v)
  return `${p.y}-${pad(p.m)}-${pad(p.d)}T${pad(t.h)}:${pad(t.mi)}:${pad(t.s)}`
}

/** String date field → "yyyy-MM-dd". Returns '' when unparseable/empty. */
export function toDateOnly(v) {
  if (v === null || v === undefined || v === '') return ''
  const p = dateParts(v)
  if (!p) return ''
  return `${p.y}-${pad(p.m)}-${pad(p.d)}`
}

// ── Translation map (same shape as the legacy page helper) ───────────────────
export function buildLetterTranslations(src) {
  const out = {}
  for (const [key, field] of Object.entries(LETTER_TRANSLATIONS)) {
    const val = String(src?.[field] ?? '')
    if (val.trim()) out[key] = { en: val, km: val }
  }
  return out
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const isEmpty = (v) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '')

function cleanGallery(gallery) {
  if (!Array.isArray(gallery) || !gallery.length) return undefined
  const rows = gallery
    .filter((g) => g && (g.url || g.file))
    .map((g) => {
      const row = {}
      if (g.id != null) row.id = g.id
      if (g.url) row.url = g.url
      if (g.caption) row.caption = g.caption
      return row
    })
    .filter((g) => Object.keys(g).length)
  return rows.length ? rows : undefined
}

function jsonString(value) {
  if (value === undefined || value === null || value === '') return undefined
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value)
  } catch {
    return undefined
  }
}

// Plain letter content fields that share the exact DTO property name.
const CONTENT_FIELDS = [
  'subtitle', 'templateType', 'language', 'theme',
  'heroTitle', 'heroSubtitle', 'heroDescription', 'heroImage', 'heroVideo', 'logo',
  'host1Role', 'host2Role', 'host1Title', 'host2Title', 'host1Photo', 'host2Photo',
  'host1Bio', 'host2Bio', 'host1Name1', 'host1Name2', 'host1Address',
  'host2Name1', 'host2Name2', 'host2Address', 'host1Parents', 'host2Parents',
  'familyMessage', 'parentFamilies',
  'opening', 'invitationTitle', 'invitationMessage', 'inviteTo',
  'guestGreeting', 'guestMessage',
  'eventName', 'eventTypeLabel', 'startTime', 'endTime', 'timezone',
  'venue', 'venueName', 'venueAddress', 'venueDescription', 'venuePhone',
  'mapUrl', 'latitude', 'longitude',
  'ceremonyTitle', 'ceremonyTime', 'ceremonyVenue', 'ceremonyAddress', 'ceremonyMapUrl',
  'receptionTitle', 'receptionTime', 'receptionVenue', 'receptionAddress', 'receptionMapUrl',
  'storyTitle', 'storyDescription', 'loveStory', 'storyTimeline', 'timeline',
  'showCountdown', 'countdownTitle',
  'rsvpTitle', 'rsvpNote', 'rsvpUrl', 'rsvpRequired',
  'contacts', 'contactName', 'contactPhone', 'contactEmail',
  'allowGuestCount', 'maxGuests', 'allowPlusOne', 'allowChildren', 'mealSelection', 'mealOptions',
  'showGiftInfo', 'giftTitle', 'giftMessage', 'giftNote', 'registryUrl', 'accountName', 'giftOptions',
  'galleryTitle', 'galleryDescription', 'videos', 'videoItems',
  'musicTitle', 'musicArtist', 'musicUrl',
  'hashtag', 'instagramUrl', 'facebookUrl', 'telegramUrl',
  'shareTitle', 'shareDescription', 'shareImage',
  'announcement', 'importantNote', 'specialNote', 'closing', 'thankYouMessage',
  'customSections', 'footerTitle', 'footerMessage', 'footerLogo', 'footerNote',
]

// Date-only (String) DTO fields sourced from the letter.
const DATE_ONLY_FIELDS = {
  ceremonyDate: 'ceremonyDate',
  receptionDate: 'receptionDate',
  countdownDate: 'countdownDate',
  rsvpDeadline: 'rsvpDeadline',
  weddingDate: 'weddingDate',
}

/**
 * Build a request body for `PUT /api/v1/events/{id}/settings` from the letter
 * state. Only whitelisted `EventSettingRequest` keys are emitted.
 *
 * @param {object} letter   reactive letter state (`useLetterData().letter`)
 * @param {object} ev       active event from the event store (core/wedding fields)
 * @returns {object} DTO-shaped payload
 */
export function buildSettingPayload(letter, ev = {}) {
  const src = letter ?? {}
  const out = {}

  const set = (key, value) => {
    if (isEmpty(value) || typeof value === 'function') return
    out[key] = value
  }

  // ── Core wedding fields (kept from the event so we don't wipe them) ──
  set('title', ev.title || src.title || 'Invitation')
  set('host1Name', ev.host1Name || ev.brideName || src.host1Name || '')
  set('host2Name', ev.host2Name || ev.groomName || src.host2Name || '')
  set('groomPhone', ev.groomPhone)
  set('bridePhone', ev.bridePhone)
  set('location', ev.location ?? src.venue)
  set('eventDate', toLocalDateTime(src.eventDate || ev.date || ev.eventDate))
  set('coverImage', ev.coverImage)
  set('coupleStory', ev.coupleStory ?? src.loveStory)
  set('youtubeUrl', ev.youtubeUrl)
  set('bankName', ev.bankName ?? src.bankNameGift)
  set('bankAccount', ev.bankAccount ?? src.bankAccountGift)
  set('bankAccountName', ev.bankAccountName ?? src.accountName)
  set('giftQrImageUrl', ev.giftQrImageUrl)
  set('notifChatId', ev.notifChatId)
  set('wishNotifChatId', ev.wishNotifChatId)
  set('giftNotifChatId', ev.giftNotifChatId)

  // ── Invitation letter columns ──
  set('inviteTemplateId', src.template || ev.inviteTemplateId)
  set('inviteThemeId', ev.inviteThemeId)
  set('invitePrimaryColor', src.primaryColor || src.themeConfig?.primaryColor || ev.invitePrimaryColor)
  set('inviteBgColor', src.bgColor || ev.inviteBgColor)
  set('inviteMapUrl', src.mapUrl ?? ev.inviteMapUrl)
  set('inviteContacts', src.contacts ?? ev.inviteContacts)
  set('inviteSchedule', jsonString(src.schedule))
  set('inviteSections', jsonString(src.sections))
  set('musicAutoplay', src.musicPlaying?.value ?? ev.musicAutoplay)
  set('inviteMessage', ev.inviteMessage ?? src.invitationMessage)
  set('allowRsvp', src.showRsvp ?? ev.allowRsvp)
  set('showWhatsapp', src.social?.shareWhatsapp ?? ev.showWhatsapp)
  set('showFacebook', src.social?.shareFacebook ?? ev.showFacebook)

  // ── Extended letter content (rename guestNameField → guestName) ──
  for (const field of CONTENT_FIELDS) {
    set(field, src[field])
  }
  set('guestName', src.guestNameField)

  // ── Objects / JSON blobs ──
  set('schedule', Array.isArray(src.schedule) && src.schedule.length ? src.schedule : undefined)
  set('sections', Array.isArray(src.sections) && src.sections.length ? src.sections : undefined)
  set('gallery', cleanGallery(src.gallery))
  set('eventEndDate', toLocalDateTime(src.eventEndDate))
  set('youtubeEmbedId', src.youtubeEmbedId?.value || undefined)
  set('musicPlaying', src.musicPlaying?.value ?? undefined)
  if (src.themeConfig && typeof src.themeConfig === 'object') set('themeConfig', src.themeConfig)

  // ── Date-only String fields ──
  for (const [dtoKey, letterKey] of Object.entries(DATE_ONLY_FIELDS)) {
    const value = toDateOnly(src[letterKey] ?? (dtoKey === 'rsvpDeadline' ? ev.rsvpDeadline : undefined))
    if (value) out[dtoKey] = value
  }

  // ── Bilingual letter copy (translations table) ──
  set('translations', { ...(ev.translations ?? {}), ...buildLetterTranslations(src) })

  return out
}
