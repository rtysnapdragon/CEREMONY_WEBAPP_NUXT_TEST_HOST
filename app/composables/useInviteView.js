// app/composables/useInviteView.js
// One normalised "view model" for every letter template.
//
// Accepts BOTH shapes and merges them, so the editor preview (legacy `letter`
// fields) and the public customer page (invite API payload) render the same:
//   legacy : title, host1Name, host1Name1, venue, weddingDate, story, ...
//   API    : guestName, currentStatus, ceremonyVenue, storyTimeline, wishes, ...
// Every legacy field is still read first, so nothing in the editor breaks.

const DEF = {
  countdown: 'Countdown to Our Wedding',
  rsvp: 'RSVP',
  gallery: 'Gallery',
  story: 'Our Love Story',
  gift: 'Gift Registry',
  ceremony: 'Ceremony',
  reception: 'Reception',
  thanks: 'Thank you for celebrating with us!',
  footerTitle: 'With Love',
  footerMessage: 'Thank you for being part of our special day',
}

const SUCCESS = ['ACCEPTED', 'ATTENDING', 'CONFIRMED', 'GOING', 'YES']
const DANGER = ['DECLINED', 'REJECTED', 'NOT_ATTENDING', 'NO']
const WARNING = ['MAYBE', 'TENTATIVE']

const text = (v) => (v === undefined || v === null ? '' : String(v).trim())
const first = (...vals) => vals.find((v) => v !== undefined && v !== null && v !== '')
const list = (v) => (Array.isArray(v) ? v : [])
const nameOf = (v) => (typeof v === 'string' ? v.trim() : text(v?.name ?? v?.fullName))

const parseDate = (iso) => {
  if (!iso) return null
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : d
}
const fmtDate = (iso) => {
  const d = parseDate(iso)
  if (!d) return typeof iso === 'string' ? iso : ''
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  }).format(d)
}
const fmtShortDate = (iso) => {
  const d = parseDate(iso)
  return d
    ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(d)
    : ''
}
const fmtTime = (iso) => {
  const d = parseDate(iso)
  return d
    ? new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(d)
    : ''
}
const dayKey = (iso) => text(iso).slice(0, 10)

const youtubeId = (value) => {
  const s = text(value)
  if (/^[\w-]{11}$/.test(s)) return s
  return s.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/)([\w-]{11})/)?.[1] ?? ''
}

// Returns the user's own text, or '' when it is empty / still the API's English default.
const custom = (value, defaultEn) => {
  const v = text(value)
  return v && v.toLowerCase() !== defaultEn.toLowerCase() ? v : ''
}

export function useInviteView(source) {
  const raw = computed(() => toValue(source) ?? {})
  const { locale } = useTr()
  const isKhmer = computed(() => (locale?.value ?? raw.value.language ?? 'km') === 'km')

  const { toKhmerLunar } = useKhmerLunarDate()
  const { buildCalendarLinks } = useAddToCalendar()

  const view = computed(() => {
    const r = raw.value
    const kh = isKhmer.value
    const t = (en, km) => (kh ? km : en)
    // custom text wins; otherwise a localised default
    const localized = (value, defaultEn, defaultKm) => custom(value, defaultEn) || t(defaultEn, defaultKm)

    const labels = {
      dear: t('Dear', 'សូមគោរពអញ្ជើញ'),
      party: (n) => t(`Party of ${n}`, `ចំនួន ${n} នាក់`),
      brideSide: t("Bride's family", 'ខាងកូនក្រមុំ'),
      groomSide: t("Groom's family", 'ខាងកូនកំលោះ'),
      days: t('Days', 'ថ្ងៃ'),
      hours: t('Hrs', 'ម៉ោង'),
      minutes: t('Min', 'នាទី'),
      seconds: t('Sec', 'វិនាទី'),
      meals: t('Meal options', 'ជម្រើសអាហារ'),
      videos: t('Videos', 'វីដេអូ'),
      wishes: t('Guest wishes', 'ពាក្យជូនពរ'),
      qr: t('Show this at the entrance', 'បង្ហាញ QR នេះនៅទ្វារចូល'),
      copy: t('Copy', 'ចម្លង'),
      copied: t('Copied', 'បានចម្លង'),
      account: t('Account', 'គណនី'),
      holder: t('Name', 'ឈ្មោះ'),
      giftThanks: t('Thank you for your gift', 'សូមអរគុណចំពោះអំណោយរបស់អ្នក'),
      telegram: t('Get updates on Telegram', 'ទទួលដំណឹងតាម Telegram'),
      events: t('Ceremony & Reception', 'ពិធី និងពិធីជប់លៀង'),
    }

    // ── Dates ────────────────────────────────────────────────────────────
    const eventDate = first(r.eventDate, r.ceremonyDate, r.receptionDate) ?? ''
    const gregorian = fmtDate(eventDate)
    const lunar = toKhmerLunar(eventDate) || ''
    const primaryDate = (kh ? lunar : gregorian) || gregorian
    const secondaryDate = kh ? gregorian : lunar

    // ── Hosts ────────────────────────────────────────────────────────────
    const hostOf = (n) => {
      const roleRaw = text(r[`host${n}Role`]).toLowerCase()
      const role = roleRaw.includes('bride')
        ? 'bride'
        : roleRaw.includes('groom')
          ? 'groom'
          : n === 1 ? 'groom' : 'bride'
      const legacy = [r[`host${n}Name1`], r[`host${n}Name2`]].map(text).filter(Boolean)
      const parents = legacy.length ? legacy : list(r[`host${n}Parents`]).map(nameOf).filter(Boolean)
      return {
        name: text(r[`host${n}Name`]),
        role, // 'groom' | 'bride'  (works with tr('groom') / tr('bride'))
        roleLabel: role === 'bride' ? 'កូនក្រមុំ / Bride' : 'កូនកំលោះ / Groom',
        avatar: r[`host${n}Avatar`] ?? '',
        parents,
        address: text(r[`host${n}Address`]),
      }
    }

    // ── Ceremony / reception ────────────────────────────────────────────
    const eventBlock = (key, title, date, venue, address, defaultEn, defaultKm) => ({
      key,
      title: localized(title, defaultEn, defaultKm),
      date: date && dayKey(date) !== dayKey(eventDate) ? fmtDate(date) : '',
      time: venue || address ? fmtTime(date) : '',
      venue: text(venue),
      address: text(address),
    })
    const events = [
      eventBlock('ceremony', r.ceremonyTitle, r.ceremonyDate, r.ceremonyVenue, r.ceremonyAddress, DEF.ceremony, 'ពិធីមង្គលការ'),
      eventBlock('reception', r.receptionTitle, r.receptionDate, r.receptionVenue, r.receptionAddress, DEF.reception, 'ពិធីជប់លៀង'),
    ].filter((e) => e.venue || e.address)

    // ── Story (legacy `story` or API `storyTimeline`) ───────────────────
    const storySrc = list(r.story).length ? list(r.story) : list(r.storyTimeline)
    const story = storySrc.map((c) => ({
      year: text(c?.year ?? c?.date),
      title: text(c?.title ?? c?.name),
      text: text(c?.text ?? c?.description),
    }))

    // ── RSVP / guest ────────────────────────────────────────────────────
    const status = text(first(r.currentStatus, r.action)).toUpperCase()
    const tone = SUCCESS.includes(status) ? 'success'
      : DANGER.includes(status) ? 'danger'
        : WARNING.includes(status) ? 'warning' : 'neutral'
    const statusLabel = {
      success: t('Attending', 'នឹងចូលរួម'),
      danger: t('Not attending', 'មិនអាចចូលរួម'),
      warning: t('Maybe', 'អាចមកបាន'),
      neutral: t('Awaiting your reply', 'កំពុងរង់ចាំចម្លើយ'),
    }[tone]
    const actions = list(r.availableActions).map((a) => {
      const key = text(a)
      const up = key.toUpperCase()
      const isYes = /ACCEPT|ATTEND|CONFIRM/.test(up) || up === 'YES'
      const isNo = /DECLIN|REJECT/.test(up) || up === 'NO'
      return {
        key,
        tone: isYes ? 'success' : isNo ? 'danger' : 'neutral',
        label: isYes ? t('I will attend', 'ខ្ញុំនឹងចូលរួម')
          : isNo ? t('Decline', 'មិនអាចចូលរួម')
            : key.charAt(0) + key.slice(1).toLowerCase().replace(/_/g, ' '),
      }
    })
    const maxGuests = Number(r.maxGuests) || 0
    const facts = [
      r.allowGuestCount && maxGuests ? t(`Up to ${maxGuests} guests`, `អតិបរមា ${maxGuests} នាក់`) : '',
      r.allowPlusOne ? t('+1 welcome', 'អាចនាំមកជាមួយ +1') : '',
      r.allowChildren ? t('Children welcome', 'ស្វាគមន៍កុមារ') : '',
      r.rsvpRequired ? t('RSVP required', 'ត្រូវការបញ្ជាក់ការចូលរួម') : '',
    ].filter(Boolean)
    const side = text(r.sideFamily).toUpperCase()
    const telegramUrl = /t\.me\/\w+/.test(text(r.telegramBotUrl)) ? text(r.telegramBotUrl) : ''

    // ── Meals / gifts / videos / wishes ─────────────────────────────────
    const meals = r.mealSelection
      ? list(r.mealOptions).map((m) => ({
        name: typeof m === 'string' ? m : text(m?.name ?? m?.title ?? m?.label),
        description: typeof m === 'string' ? '' : text(m?.description ?? m?.note),
      })).filter((m) => m.name)
      : []

    const giftOptions = list(r.giftOptions).map((g) => ({
      label: typeof g === 'string' ? g : text(first(g?.label, g?.bankName, g?.bank, g?.name, g?.type)),
      holder: text(first(g?.accountName, g?.holder, g?.owner)),
      account: text(first(g?.accountNumber, g?.account, g?.number)),
      qr: text(first(g?.qrUrl, g?.qrImage, g?.qr)),
      url: text(first(g?.url, g?.link)),
      note: text(first(g?.note, g?.description)),
    })).filter((g) => g.label || g.account || g.qr || g.url)
    const giftTotal = Number(r.totalGiftAmount) || 0
    const giftCurrency = text(first(list(r.giftHistory)[0]?.currency, r.currency))
    const gifts = {
      show: !!r.showGiftInfo && giftOptions.length > 0,
      title: localized(r.giftTitle, DEF.gift, 'ព័ត៌មានអំណោយ'),
      options: giftOptions,
      totalText: giftTotal > 0
        ? `${new Intl.NumberFormat('en-US').format(giftTotal)}${giftCurrency ? ` ${giftCurrency}` : ''}`
        : '',
    }

    const videos = list(r.videos).map((v, i) => {
      const url = typeof v === 'string' ? v : text(first(v?.url, v?.src, v?.link))
      const id = youtubeId(first(v?.youtubeId, v?.embedId, url))
      return {
        key: v?.id ?? i,
        url,
        title: typeof v === 'string' ? `${t('Video', 'វីដេអូ')} ${i + 1}` : text(v?.title) || `${t('Video', 'វីដេអូ')} ${i + 1}`,
        embed: id ? `https://www.youtube-nocookie.com/embed/${id}` : '',
        file: /\.(mp4|webm|ogg)(\?|$)/i.test(url),
      }
    }).filter((v) => v.url || v.embed)

    const wishes = list(r.wishes)
      .map((w, i) => {
        const name = text(w?.guestName ?? w?.name)
        return {
          id: w?.id ?? i,
          name,
          initial: (name.charAt(0) || '♥').toUpperCase(),
          message: text(w?.message),
          iso: text(w?.createdAt),
          date: fmtShortDate(w?.createdAt),
        }
      })
      .filter((w) => w.message)
      .sort((a, b) => b.iso.localeCompare(a.iso))

    // ── Gallery (accepts items without `status`) ────────────────────────
    const gallerySrc = list(r.gallery).length ? list(r.gallery) : list(r.galleryLegacy)
    const gallery = gallerySrc
      .map((g, i) => (typeof g === 'string' ? { id: i, url: g, caption: '' } : { ...g, id: g?.id ?? i }))
      .filter((g) => g.url && (g.status === undefined || g.status === 'done'))

    return {
      lang: kh ? 'km' : 'en',
      isKhmer: kh,
      t,
      labels,

      // legacy fields (unchanged names)
      title: text(first(r.title, r.heroTitle, r.invitationTitle)),
      arUrl: r.arUrl ?? '',
      opening: r.opening ?? '',
      closing: r.closing ?? '',
      blessing: r.blessing ?? '',
      inviteTo: r.inviteTo ?? '',
      rsvpNote: r.rsvpNote ?? '',
      contacts: r.contacts ?? '',
      weddingDateText: r.weddingDate ?? '',
      venue: text(first(r.venue, r.venueName, r.ceremonyVenue)),
      venueAddress: text(first(r.venueAddress, r.ceremonyAddress)),
      mapUrl: r.mapUrl ?? '',
      schedule: list(r.schedule),
      host1: hostOf(1),
      host2: hostOf(2),

      // dates
      eventDate,
      gregorian,
      lunar,
      primaryDate,
      secondaryDate,

      // new API fields
      events,
      story,
      storyTitle: localized(r.storyTitle, DEF.story, 'រឿងរ៉ាវស្នេហា'),
      countdown: {
        show: r.showCountdown !== false,
        title: localized(r.countdownTitle, DEF.countdown, 'រាប់ថយក្រោយថ្ងៃមង្គលការ'),
        date: first(r.countdownDate, eventDate) ?? '',
      },
      guest: {
        name: text(first(r.guestName, r.guestNameField)),
        side: side === 'BRIDE' ? labels.brideSide : side === 'GROOM' ? labels.groomSide : '',
        total: Number(r.totalGuests) || 0,
      },
      rsvp: {
        show: r.showRsvp !== false,
        title: custom(r.rsvpTitle, DEF.rsvp),
        status,
        statusLabel,
        tone,
        icon: { success: 'ri-checkbox-circle-line', danger: 'ri-close-circle-line', warning: 'ri-question-line', neutral: 'ri-time-line' }[tone],
        message: text(r.message),
        facts,
        actions,
      },
      telegramUrl,
      meals,
      gifts,
      videos,
      wishes,
      gallery,
      galleryTitle: custom(r.galleryTitle, DEF.gallery),
      qrCode: r.qrCode ?? '',
      inviteUrl: r.inviteUrl ?? '',
      thanks: {
        title: localized(r.footerTitle, DEF.footerTitle, 'ដោយក្តីស្រឡាញ់'),
        message: localized(r.thankYouMessage, DEF.thanks, 'សូមអរគុណដែលបានចូលរួមអបអរជាមួយយើងខ្ញុំ'),
        footer: localized(r.footerMessage, DEF.footerMessage, 'សូមអរគុណដែលបានជាផ្នែកនៃថ្ងៃពិសេសរបស់យើង'),
      },
    }
  })

  const { remaining } = useEventCountdown(() => view.value.countdown.date)

  const calendarLinks = computed(() => buildCalendarLinks({
    title: view.value.title || (isKhmer.value ? 'ពិធីមង្គលការ' : 'Wedding'),
    description: view.value.opening,
    location: [view.value.venue, view.value.venueAddress].filter(Boolean).join(', '),
    startISO: view.value.eventDate,
    durationHours: 4,
  }))

  return { view, remaining, calendarLinks, isKhmer }
}
