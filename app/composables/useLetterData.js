// composables/useLetterData.ts
// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for the invitation letter reactive state.
// Shared between LetterSetupPage, EditorLetter, PreviewLetter, LetterDocument.
// Letter content is single default-language (no Khmer/English paired fields).
// Schedule is loaded from the real ceremonies API as a flat list.
// ─────────────────────────────────────────────────────────────────────────────
import { parseDate } from '@internationalized/date'

import TemplateMidnight from '~/components/feature/setup_and_invitation/templates/TemplateMidnight.vue'
import TemplateModern from '~/components/feature/setup_and_invitation/templates/TemplateModern.vue'
import TemplateForest from '~/components/feature/setup_and_invitation/templates/TemplateForest.vue'
import TemplateBlossom from '~/components/feature/setup_and_invitation/templates/TemplateBlossom.vue'
import TemplateRoyalGold from '~/components/feature/setup_and_invitation/templates/TemplateRoyalGold.vue'
import TemplateVintage from '~/components/feature/setup_and_invitation/templates/TemplateVintage.vue'
import TemplateClassic from '~/components/feature/setup_and_invitation/templates/TemplateClassic.vue'
import LetterDocument from '~/components/feature/setup_and_invitation/LetterDocument.vue'

// ─────────────────────────────────────────────────────────────────────────────
// Template presets
// ─────────────────────────────────────────────────────────────────────────────

const inlineFloralSvg = `
<svg viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="800" fill="#fffbf5" />
  <g fill="none" stroke="#c9974b" stroke-width="1" opacity="0.35">
    <circle cx="40" cy="60" r="30" />
    <circle cx="90" cy="40" r="14" />
    <circle cx="360" cy="740" r="34" />
    <circle cx="320" cy="770" r="16" />
  </g>
</svg>
`.trim()

export const LETTER_TEMPLATES = [
  {
    key: 'midnight',
    label: 'midnight',
    bg: '#0d0d1a',
    border: '#7c4dff',
    component: TemplateMidnight,
    thumbnail: '/templates/midnight.jpg'
  },
  {
    key: 'modern',
    label: 'modern',
    bg: '#f8f8f8',
    border: '#333',
    component: TemplateModern,
    thumbnail: '/templates/modern.jpg'
  },
  {
    key: 'forest',
    label: 'forest',
    bg: '#f0f7f4',
    border: '#66bb6a',
    component: TemplateForest,
    thumbnail: '/templates/forest.jpg'
  },
  {
    key: 'blossom',
    label: 'blossom',
    bg: '#fff0f5',
    border: '#f48fb1',
    component: TemplateBlossom,
    thumbnail: '/templates/blossom.jpg'
  },
  {
    key: 'royal',
    label: 'royal_gold',
    bg: '#1a0a2e',
    border: '#d4af37',
    component: TemplateRoyalGold,
    thumbnail: '/templates/royal.jpg'
  },
  {
    key: 'document',
    label: 'document',
    bg: '#fff',
    border: '#333',
    component: LetterDocument,
    thumbnail: '/templates/document.jpg'
  },
  {
    key: 'vintage',
    label: 'vintage',
    bg: '#fdf6f0',
    border: '#c8a882',
    component: TemplateVintage,
    thumbnail: '/templates/vintage.png'
  },
  {
    key: 'classic',
    label: 'classic',
    bg: '#fdf6f0',
    border: '#c8a882',
    component: TemplateClassic,
    thumbnail: '/templates/classic.png',
    background: { type: 'image', value: inlineFloralSvg },
  }
]


// ── Built-in fallback templates ───────────────────────────────────────────
export const BUILTIN_TEMPLATES = [
  {
    id: 'classic',
    name: 'classic',
    label: 'Classic',
    previewBg: '#fdf6f0',
    previewBorder: '#c8a882',
    vars: {
      '--lt-primary': '#c0392b',
      '--lt-bg':      '#fdf6ef',
      '--lt-border':  '#c8a882',
      '--lt-text':    '#2c1810',
      '--lt-font':    "'Battambang','NotoSansKhmer',serif",
    },
  },
  {
    id: 'royal',
    name: 'royal',
    label: 'Royal Gold',
    previewBg: '#1a0a2e',
    previewBorder: '#d4af37',
    vars: {
      '--lt-primary': '#d4af37',
      '--lt-bg':      '#1a0a2e',
      '--lt-border':  '#d4af37',
      '--lt-text':    '#f0e6c8',
      '--lt-gradient':'linear-gradient(90deg,transparent,#d4af37,transparent)',
    },
    overrideCSS: `.ld-root { color: #f0e6c8; }`,
  },
  {
    id: 'modern',
    name: 'modern',
    label: 'Modern',
    previewBg: '#f5f5f5',
    previewBorder: '#333',
    vars: {
      '--lt-primary': '#1a1a2e',
      '--lt-bg':      '#f8f8f8',
      '--lt-border':  '#333',
      '--lt-text':    '#1a1a2e',
      '--lt-font':    "'DM Sans','Inter',sans-serif",
    },
  },
  {
    id: 'blossom',
    name: 'blossom',
    label: 'Blossom',
    previewBg: '#fff0f5',
    previewBorder: '#e91e8c',
    vars: {
      '--lt-primary': '#e91e8c',
      '--lt-bg':      '#fff0f5',
      '--lt-border':  '#f48fb1',
      '--lt-text':    '#4a0030',
    },
  },
  {
    id: 'forest',
    name: 'forest',
    label: 'Forest',
    previewBg: '#f0f7f4',
    previewBorder: '#2e7d32',
    vars: {
      '--lt-primary': '#2e7d32',
      '--lt-bg':      '#f0f7f4',
      '--lt-border':  '#66bb6a',
      '--lt-text':    '#1b3a1e',
    },
  },
  {
    id: 'midnight',
    name: 'midnight',
    label: 'Midnight',
    previewBg: '#0d0d1a',
    previewBorder: '#7c4dff',
    vars: {
      '--lt-primary': '#7c4dff',
      '--lt-bg':      '#0d0d1a',
      '--lt-border':  '#7c4dff',
      '--lt-text':    '#e8e0ff',
      '--lt-gradient':'linear-gradient(90deg,transparent,#7c4dff,transparent)',
    },
    overrideCSS: `.ld-root { color: #e8e0ff; }`,
  },
  {
    id: 'vintage',
    name: 'vintage',
    label: 'Vintage',
    previewBg: '#f5ead0',
    previewBorder: '#8b6035',
    vars: {
      '--lt-primary': '#8b6035',
      '--lt-bg':      '#f5ead0',
      '--lt-border':  '#c8a882',
      '--lt-text':    '#3d2b1f',
    },
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Default data — single default-language letter
// ─────────────────────────────────────────────────────────────────────────────
export const DEFAULT_LETTER = {
  template:     'classic',
  primaryColor: '#c0392b',
  bgColor:      '#fdf6ef',

  // ── General / Template ────────────────────────────────────────────────────
  id: '',
  eventType: 'wedding',
  templateType: 'celestial',
  language: 'km',
  title: '',
  subtitle: '',
  theme: '',
  status: 'draft',

  // ── Hero / Header ─────────────────────────────────────────────────────────
  heroTitle: '',
  heroSubtitle: '',
  heroDescription: '',
  heroImage: '',
  heroVideo: '',
  logo: '',
  coverImageHero: '',

  // ── Title ─────────────────────────────────────────────────────────────────
  title: 'សិរីសួស្តីអាពាហ៍ពិពាហ៍',
  inviteTo: 'Redy Garden Restaurant',

  // ── Opening ───────────────────────────────────────────────────────────────
  opening:
    'យើងខ្ញុំ មានសេចក្ដីរីករាយ និងសូមគោរពអញ្ជើញ ' +
    'លោក លោកស្រី បណ្ដាញមិត្តភ័ក្តិ ញាតិ មិត្តរួមការងារ ' +
    'ដ៏ជូរចុតជាទីស្រឡាញ់ ចូលរួមក្នុងពិធីមង្គលការ ' +
    'ដ៏សប្បាយ ពោរពេញដោយក្ដីសុខ ក្ដីស្រឡាញ់ ' +
    'និងពរជ័យ ដែលនឹងធ្វើឡើងក្នុងថ្ងៃ និងកន្លែងដូចខាងក្រោម។',

  // ── Hosts / Organizers ────────────────────────────────────────────────────
  host1Name:    'ចាន់ ស្រ',
  host2Name:    'ថែម មុន្នីរ',
  host1Role: 'Bride',
  host2Role: 'Groom',
  host1Title: '',
  host2Title: '',
  host1Photo: '',
  host2Photo: '',
  host1Bio: '',
  host2Bio: '',

  // ── Parents / Families ────────────────────────────────────────────────────
  host1Name1:  'លោក ចាន់ ចំណាស់',
  host1Name2:  'លោកស្រី ចាន់ ដានី',
  host1Address: 'ភូមិ ស្វាយប៉ែន វត្ត ស្វាយប៉ែន ស្រុក ចំការលើ ខេត្ត ភ្នំពេញ',
  host2Name1:  'លោក ថែម ទូចតី',
  host2Name2:  'លោកស្រី ថែម ដួងចន្ទ',
  host2Address: 'ភូមិ ទួលគោក វត្ត ទួលគោក ស្រុក ទួលគោក ខេត្ត ភ្នំពេញ',
  host1Parents: [],
  host2Parents: [],
  familyMessage: '',

  // ── Invitation ────────────────────────────────────────────────────────────
  invitationTitle: '',
  invitationMessage: '',
  inviteTo: 'Redy Garden Restaurant',
  guestGreeting: '',

  // ── Event Details ─────────────────────────────────────────────────────────
  eventName: '',
  eventTypeLabel: '',
  eventDate: parseDate("2026-08-06"),
  eventEndDate: '',
  startTime: '',
  endTime: '',
  timezone: '',
  venue:        'សណ្ឋាគារ ផ្ការ៉ូស ២៤',
  venueName: '',
  venueAddress: 'ផ្ទះលេខ ២០ ផ្លូវ ២១ ខណ្ឌ ចំការមន ក្រុងភ្នំពេញ',
  venueDescription: '',
  venuePhone: '',
  mapUrl:   'https://maps.app.goo.gl/example',
  latitude: null,
  longitude: null,

  // ── Ceremony ──────────────────────────────────────────────────────────────
  ceremonyTitle: '',
  ceremonyDate: '',
  ceremonyTime: '',
  ceremonyVenue: '',
  ceremonyAddress: '',
  ceremonyMapUrl: '',

  // ── Reception ─────────────────────────────────────────────────────────────
  receptionTitle: '',
  receptionDate: '',
  receptionTime: '',
  receptionVenue: '',
  receptionAddress: '',
  receptionMapUrl: '',

  // ── Schedule / Program ────────────────────────────────────────────────────
  schedule: [],

  // ── Love Story ────────────────────────────────────────────────────────────
  storyTitle: '',
  storyDescription: '',
  loveStory: '',
  storyTimeline: [],

  // ── Countdown ─────────────────────────────────────────────────────────────
  showCountdown: true,
  countdownTitle: '',
  countdownDate: '',

  // ── RSVP ──────────────────────────────────────────────────────────────────
  showRsvp: true,
  rsvpTitle: '',
  rsvpNote:
    'សូមផ្ញើការឆ្លើយតបត្រលប់មកមុនថ្ងៃ ១០ ខែ ធ្នូ ឆ្នាំ ២០២៥\n' +
    'ទំនាក់ទំនង: ០១៨ ៤០ ៣ ៦ ៣២\n' +
    'ភ្ញៀវទាំងឆ្ងាយ និងជិតសូមចុះឈ្មោះ\n' +
    'អាហារថ្ងៃត្រង់ ចាប់ពីម៉ោង ១១:០០',
  rsvpDeadline: '',
  rsvpUrl: '',
  rsvpRequired: false,
  contacts: '០១៨ ៤០ ៣ ៦ ៣២ / ០ ០ ២ ៤ ០ ១ ២ ៣',
  contactName: '',
  contactPhone: '',
  contactEmail: '',

  // ── Guest Options ─────────────────────────────────────────────────────────
  allowGuestCount: true,
  maxGuests: 2,
  allowPlusOne: false,
  allowChildren: false,
  mealSelection: false,
  mealOptions: [],

  // ── Gift / Registry ───────────────────────────────────────────────────────
  showGiftInfo: false,
  giftTitle: '',
  giftMessage: '',
  giftNote: '',
  registryUrl: '',
  bankAccountGift: '',
  bankNameGift: '',
  accountName: '',
  giftOptions: [],

  // ── Gallery ───────────────────────────────────────────────────────────────
  galleryTitle: '',
  galleryDescription: '',
  gallery: [],

  // ── Videos ────────────────────────────────────────────────────────────────
  videos: [],
  youtubeEmbedId: { value: '' },
  musicPlaying: { value: false },
  musicTitle: '',
  musicArtist: '',
  musicUrl: '',

  // ── Social / Sharing ──────────────────────────────────────────────────────
  social: {
    shareWhatsapp: true,
    shareFacebook: true,
    shareTelegram: true,
  },
  hashtag: '',
  instagramUrl: '',
  facebookUrl: '',
  telegramUrl: '',
  shareTitle: '',
  shareDescription: '',
  shareImage: '',

  // ── Special Messages ──────────────────────────────────────────────────────
  announcement: '',
  importantNote: '',
  specialNote: '',
  closing: 'ដោយមានក្ដីរីករាយ និងការគោរពយ៉ាងខ្ពស់',
  thankYouMessage: '',

  // ── Custom Sections ───────────────────────────────────────────────────────
  sections: [],

  // ── Theme / Appearance ────────────────────────────────────────────────────
  themeConfig: {
    primaryColor: '#c0392b',
    secondaryColor: '',
    backgroundColor: '',
    textColor: '',
    accentColor: '',
    fontFamily: '',
    headingFont: '',
    backgroundImage: '',
    backgroundPattern: '',
    overlayOpacity: 0.5
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  footerTitle: '',
  footerMessage: '',
  footerLogo: '',
  footerNote: '',

  // ── Legacy weddingDate (for backward compatibility) ───────────────────────
  weddingDate: '',
}

export const SAMPLE_GALLERY = [
{
    id: '1',
    url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200',
    caption: 'Wedding Ceremony',
    status: 'done',
    progress: 100,
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=1200',
    caption: 'Bride & Groom',
    status: 'done',
    progress: 100,
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200',
    caption: 'Reception Hall',
    status: 'done',
    progress: 100,
  },
  {
    id: '4',
    url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1200',
    caption: 'Wedding Rings',
    status: 'done',
    progress: 100,
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Composable
// ─────────────────────────────────────────────────────────────────────────────

export function useLetterData() {
  const templates  = ref(BUILTIN_TEMPLATES)
  const letter = reactive({
    ...DEFAULT_LETTER,
    schedule: [],
    gallery: SAMPLE_GALLERY.map(img => ({ ...img })),
  })

  /**
   * Load the real ceremonies into the letter schedule as a flat list:
   * { id, name, description, startTime, endTime, status }.
   */
  async function loadCeremonies() {
    const ceremonyStore = useCeremonyStore()
    const eventStore = useEventStore()
    const eventId = ceremonyStore._weddingId() || eventStore.activeEvent?.id
    if (!eventId) {
      letter.schedule = []
      return
    }
    const list = await ceremonyStore.getCeremonyById(eventId)
    letter.schedule = (Array.isArray(list) ? list : []).map(c => ({
      id: c.id,
      name: c.name ?? '',
      description: c.description ?? '',
      startTime: c.startTime ?? '',
      endTime: c.endTime ?? '',
      status: c.status ?? '',
    }))
  }

  /**
   * Load the real event gallery into the letter gallery as a flat list:
   * { id, url, caption, status: 'done', progress: 100 }.
   */
  async function loadGallery() {
    const galleryStore = useGalleryStore()
    const eventStore = useEventStore()
    const eventId = galleryStore._weddingId() || eventStore.activeEvent?.id
    if (!eventId) {
      letter.gallery = []
      return
    }
    await galleryStore.fetchGallery()
    letter.gallery = galleryStore.items.map(g => ({
      id: g.id,
      url: g.url,
      caption: g.caption ?? '',
      status: 'done',
      progress: 100,
    }))
  }

  /**
   * Populate the letter from the active event — single default-language fields
   * mapped from the event translations (prefer current locale, then km, then en).
   */
  function loadFromEvent(ev) {
    if (!ev) return
    if (ev.inviteTemplateId) letter.template = ev.inviteTemplateId
    if (ev.invitePrimaryColor) letter.primaryColor = ev.invitePrimaryColor
    if (ev.inviteSecondaryColor) letter.themeConfig.secondaryColor = ev.inviteSecondaryColor
    if (ev.inviteBgColor) letter.bgColor = ev.inviteBgColor
    if (ev.inviteContacts) letter.contacts = ev.inviteContacts
    if (ev.inviteMapUrl) letter.mapUrl = ev.inviteMapUrl
    if (ev.inviteSections) letter.sections = ev.inviteSections
    if (ev.inviteMessage) letter.invitationMessage = ev.inviteMessage
    if (ev.rsvpDeadline) letter.rsvpDeadline = ev.rsvpDeadline
    if (ev.allowRsvp !== undefined) letter.showRsvp = ev.allowRsvp
    if (ev.showWhatsapp !== undefined) letter.social.shareWhatsapp = ev.showWhatsapp
    if (ev.showFacebook !== undefined) letter.social.shareFacebook = ev.showFacebook
    if (ev.musicAutoplay !== undefined) letter.musicPlaying.value = ev.musicAutoplay
    if (ev.youtubeUrl) letter.musicUrl = ev.youtubeUrl
    if (ev.giftQrImageUrl) letter.giftQrImageUrl = ev.giftQrImageUrl
    if (ev.bankName) letter.bankNameGift = ev.bankName
    if (ev.bankAccount) letter.bankAccountGift = ev.bankAccount
    if (ev.bankAccountName) letter.accountName = ev.bankAccountName
    if (ev.coverImage) letter.heroImage = ev.coverImage
    if (ev.coupleStory) letter.loveStory = ev.coupleStory

    const trans = ev.translations ?? {}
    let lang = 'km'
    try {
      const i18n = useI18n()
      if (i18n.locale?.value) lang = i18n.locale.value
    } catch {}
    const pick = (key) => trans[key]?.[lang] ?? trans[key]?.km ?? trans[key]?.en ?? ''

    const MAP = {
      title: 'inviteTitle',
      opening: 'inviteOpening',
      host1Name: 'groomName',
      host2Name: 'brideName',
      host1Name1: 'groomFather',
      host1Name2: 'groomMother',
      host1Address: 'groomAddress',
      host2Name1: 'brideFather',
      host2Name2: 'brideMother',
      host2Address: 'brideAddress',
      venue: 'venue',
      venueAddress: 'venueAddress',
      rsvpNote: 'rsvpNote',
      closing: 'closing',
      weddingDate: 'weddingDate',
      // New fields
      heroTitle: 'inviteHeroTitle',
      heroSubtitle: 'inviteHeroSubtitle',
      heroDescription: 'inviteHeroDescription',
      eventName: 'inviteEventName',
      eventTypeLabel: 'inviteEventTypeLabel',
      startTime: 'inviteStartTime',
      endTime: 'inviteEndTime',
      timezone: 'inviteTimezone',
      venueName: 'inviteVenueName',
      venueDescription: 'inviteVenueDescription',
      venuePhone: 'inviteVenuePhone',
      latitude: 'inviteLatitude',
      longitude: 'inviteLongitude',
      ceremonyTitle: 'inviteCeremonyTitle',
      ceremonyDate: 'inviteCeremonyDate',
      ceremonyTime: 'inviteCeremonyTime',
      ceremonyVenue: 'inviteCeremonyVenue',
      ceremonyAddress: 'inviteCeremonyAddress',
      ceremonyMapUrl: 'inviteCeremonyMapUrl',
      receptionTitle: 'inviteReceptionTitle',
      receptionDate: 'inviteReceptionDate',
      receptionTime: 'inviteReceptionTime',
      receptionVenue: 'inviteReceptionVenue',
      receptionAddress: 'inviteReceptionAddress',
      receptionMapUrl: 'inviteReceptionMapUrl',
      storyTitle: 'inviteStoryTitle',
      storyDescription: 'inviteStoryDescription',
      countdownTitle: 'inviteCountdownTitle',
      countdownDate: 'inviteCountdownDate',
      showCountdown: 'inviteShowCountdown',
      rsvpTitle: 'inviteRsvpTitle',
      guestGreeting: 'inviteGuestGreeting',
      guestNameField: 'inviteGuestName',
      guestMessage: 'inviteGuestMessage',
      allowGuestCount: 'inviteAllowGuestCount',
      maxGuests: 'inviteMaxGuests',
      allowPlusOne: 'inviteAllowPlusOne',
      allowChildren: 'inviteAllowChildren',
      mealSelection: 'inviteMealSelection',
      showGiftInfo: 'inviteShowGiftInfo',
      giftTitle: 'inviteGiftTitle',
      giftMessage: 'inviteGiftMessage',
      giftNote: 'inviteGiftNote',
      registryUrl: 'inviteRegistryUrl',
      galleryTitle: 'inviteGalleryTitle',
      galleryDescription: 'inviteGalleryDescription',
      hashtag: 'inviteHashtag',
      instagramUrl: 'inviteInstagramUrl',
      facebookUrl: 'inviteFacebookUrl',
      telegramUrl: 'inviteTelegramUrl',
      shareTitle: 'inviteShareTitle',
      shareDescription: 'inviteShareDescription',
      shareImage: 'inviteShareImage',
      announcement: 'inviteAnnouncement',
      importantNote: 'inviteImportantNote',
      specialNote: 'inviteSpecialNote',
      thankYouMessage: 'inviteThankYouMessage',
      footerTitle: 'inviteFooterTitle',
      footerMessage: 'inviteFooterMessage',
      footerLogo: 'inviteFooterLogo',
      footerNote: 'inviteFooterNote',
      // Theme config
      themePrimaryColor: 'inviteThemePrimaryColor',
      themeSecondaryColor: 'inviteThemeSecondaryColor',
      themeBackgroundColor: 'inviteThemeBackgroundColor',
      themeTextColor: 'inviteThemeTextColor',
      themeAccentColor: 'inviteThemeAccentColor',
      themeFontFamily: 'inviteThemeFontFamily',
      themeHeadingFont: 'inviteThemeHeadingFont',
      themeBackgroundImage: 'inviteThemeBackgroundImage',
      themeBackgroundPattern: 'inviteThemeBackgroundPattern',
      themeOverlayOpacity: 'inviteThemeOverlayOpacity',
    }
    for (const [field, key] of Object.entries(MAP)) {
      const val = pick(key) || ev[key] || ''
      if (val) letter[field] = val
    }

    // Map theme config fields
    if (ev.invitePrimaryColor) letter.themeConfig.primaryColor = ev.invitePrimaryColor
    if (ev.inviteSecondaryColor) letter.themeConfig.secondaryColor = ev.inviteSecondaryColor
    if (ev.inviteBgColor) letter.themeConfig.backgroundColor = ev.inviteBgColor
    if (ev.inviteTextColor) letter.themeConfig.textColor = ev.inviteTextColor
    if (ev.inviteAccentColor) letter.themeConfig.accentColor = ev.inviteAccentColor
    if (ev.inviteFontFamily) letter.themeConfig.fontFamily = ev.inviteFontFamily
    if (ev.inviteHeadingFont) letter.themeConfig.headingFont = ev.inviteHeadingFont
    if (ev.inviteBackgroundImage) letter.themeConfig.backgroundImage = ev.inviteBackgroundImage
    if (ev.inviteBackgroundPattern) letter.themeConfig.backgroundPattern = ev.inviteBackgroundPattern
    if (ev.inviteOverlayOpacity !== undefined) letter.themeConfig.overlayOpacity = ev.inviteOverlayOpacity

    // Date used by templates for formatting/countdown — prefer the event ISO datetime.
    if (ev.date) letter.eventDate = ev.date
    else if (ev.eventDate) letter.eventDate = ev.eventDate
    else if (letter.weddingDate) letter.eventDate = letter.weddingDate
  }

  /**
   * Build the CSS variable string for a given template.
   * Inject as  :style="{ '--lt-primary': ..., ... }"  on the root element.
   */
  function varsFor(templateId){
    const tpl = templates.value.find(t => t.id === templateId) ?? templates.value[0]
    const out = {}
    for (const [k, v] of Object.entries(tpl.vars)) {
      if (k !== 'extra' && v) out[k] = v
    }
    return out
  }

  /**
   * Returns any extra CSS string that the template wants injected.
   */
  function overrideCSSFor(templateId){
    const tpl = templates.value.find(t => t.id === templateId)
    return tpl?.overrideCSS ?? ''
  }
  
  return { letter, loadFromEvent, loadCeremonies, loadGallery, overrideCSSFor, varsFor }
}