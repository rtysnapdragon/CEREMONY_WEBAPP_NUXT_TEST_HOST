<script setup>
const { tr } = useTr()
const { toKhmerLunar } = useKhmerLunarDate()
const props = defineProps(['data','mini','device'])

const data = computed(() => props.data)
const mini = computed(() => props.mini)
const device = computed(() => props.device)

// Derive template-specific colours
const themeVars = computed(() => {
  const tc = data.value?.themeConfig
  return {
    '--lt-primary': tc?.primaryColor || data.value?.primaryColor || '#c0392b',
    '--lt-bg':      tc?.backgroundColor || data.value?.bgColor || '#fdf6ef',
    '--lt-border':  data.value?.template === 'royal' ? '#d4af37'
                  : data.value?.template === 'modern' ? '#333'
                  : '#c8a882',
    '--lt-secondary': tc?.secondaryColor || '',
    '--lt-text': tc?.textColor || '',
    '--lt-accent': tc?.accentColor || '',
    '--lt-font': tc?.fontFamily || "'Battambang','NotoSansKhmer',serif",
    '--lt-heading-font': tc?.headingFont || '',
  }
})

// Format the EN date nicely
const formattedDateEn = computed(() => {
  if (!data.value?.eventDate) return ''
  try {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    }).format(new Date(data.value?.eventDate))
  } catch { return data.value?.eventDate }
})

const openingFontSize = computed(() => {
  if(mini.value) return '15px';
  switch (device.value) {
    case 'mobile':
      return '16px'
    case 'tablet':
      return '20px'
    default:
      return '25px'
  }
})

const dynamicFontSize = ( value_mobile, value_tablet, value_desktop) => {
  if(mini.value) return '15px';
  switch (device.value) {
    case 'mobile':
      return value_mobile
    case 'tablet':
      return value_tablet
    default:
      return value_desktop
  }
}

// Helper to parse JSON fields
const parseJSON = (val) => {
  if (!val) return []
  try { return typeof val === 'string' ? JSON.parse(val) : val } catch { return [] }
}

// Helper for Khmer lunar date
// const { toKhmerLunar } = useKhmerLunarDate()
const khmerLunarDate = computed(() => toKhmerLunar(data.value?.eventDate))
const primaryDate = computed(() => khmerLunarDate.value || formattedDateEn.value)
const secondaryDate = computed(() => formattedDateEn.value)

// Countdown logic
onMounted(() => {
  if (data.value?.showCountdown && data.value?.countdownDate) {
    const updateCountdown = () => {
      const target = new Date(data.value.countdownDate).getTime()
      const now = new Date().getTime()
      const diff = target - now
      if (diff <= 0) return
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const secs = Math.floor((diff % (1000 * 60)) / 1000)
      const daysEl = document.getElementById('cd-days')
      const hoursEl = document.getElementById('cd-hours')
      const minsEl = document.getElementById('cd-mins')
      const secsEl = document.getElementById('cd-secs')
      if (daysEl) daysEl.textContent = String(days).padStart(2, '0')
      if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0')
      if (minsEl) minsEl.textContent = String(mins).padStart(2, '0')
      if (secsEl) secsEl.textContent = String(secs).padStart(2, '0')
    }
    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    onBeforeUnmount(() => clearInterval(interval))
  }
})
</script>

<template>
  <div
    class="ld-root"
    :class="[`ld-tpl--${data.template}`, { 'ld-mini': mini }]"
    :style="themeVars"
  >
    <!-- ── Decorative top border ── -->
    <div class="ld-top-border" />

    <!-- ── Hero / Header ── -->
    <section v-if="data?.heroTitle || data?.heroSubtitle || data?.heroDescription || data?.heroImage || data?.heroVideo" class="ld-section ld-hero">
      <div v-if="data?.heroImage" class="ld-hero-bg" :style="{ backgroundImage: `url(${data.heroImage})` }" />
      <div class="ld-hero-overlay" />
      <div class="ld-hero-content">
        <h2 v-if="data?.heroTitle" class="ld-hero-title">{{ data.heroTitle }}</h2>
        <h3 v-if="data?.heroSubtitle" class="ld-hero-subtitle">{{ data.heroSubtitle }}</h3>
        <p v-if="data?.heroDescription" class="ld-hero-description">{{ data.heroDescription }}</p>
        <div v-if="data?.heroVideo" class="ld-hero-video">
          <iframe :src="data.heroVideo" allow="autoplay; encrypted-media" allowfullscreen></iframe>
        </div>
      </div>
    </section>

    <!-- ── Header ── -->
    <header class="ld-header">
      <!-- Ornament top -->
      <div class="ld-ornament">
        <span class="ld-orn-line" />
        <span class="ld-orn-diamond" />
        <span class="ld-orn-line" />
      </div>

      <p class="ld-subtitle">
        {{ tBy({ en:'Wedding Invitation', km:'ពិធីមង្គលការ' }) }}
      </p>

      <h1 class="ld-title">{{ data?.title }}</h1>

      <!-- Ornament bottom -->
      <div class="ld-ornament">
        <span class="ld-orn-line" />
        <span class="ld-orn-lotus">❧</span>
        <span class="ld-orn-line" />
      </div>
    </header>

    <!-- ── Invite To ── -->
    <section v-if="data?.inviteTo" class="ld-section ld-invite-to">
      <p class="ld-invite-label">{{ tBy({ en:'You are invited to', km:'សូមគោរពអញ្ជើញមកកាន់' }) }}</p>
      <p class="ld-invite-name">{{ data.inviteTo }}</p>
    </section>

    <!-- ── Opening message ── -->
    <section class="ld-section ld-opening">
      <p :style="{ fontSize: openingFontSize }">{{ data?.opening }}</p>
    </section>

    <!-- ── Couple info ── -->
    <section class="ld-section ld-couple">

      <!-- Groom side -->
      <div class="ld-party">
        <div class="ld-party-icon">👨</div>
        <div :style="{fontSize: dynamicFontSize('10px', '12px', '13px')}" class="ld-party-role">{{ tr('groom')}}</div>
        <div :style="{fontSize: dynamicFontSize('16px', '18px', '20px')}" class="ld-party-name-km">{{ data?.host1Name }}</div>
        <div :style="{fontSize: dynamicFontSize('10px', '12px', '13px')}" class="ld-party-name-en">{{ data?.host1Name }}</div>
        <div :style="{fontSize: dynamicFontSize('10px', '12px', '13px')}" class="ld-party-parents">
          <span>{{ data?.host1Name1 }}</span>
          <span>{{ data?.host1Name2 }}</span>
        </div>
        <div :style="{fontSize: dynamicFontSize('10px', '12px', '13px')}" class="ld-party-address">{{ data?.host1Address }}</div>
      </div>

      <div class="ld-couple-divider">
        <span class="ld-heart">♡</span>
      </div>

      <!-- Bride side -->
      <div class="ld-party">
        <div class="ld-party-icon">👩</div>
        <div :style="{fontSize: dynamicFontSize('10px', '12px', '13px')}" class="ld-party-role">{{ tr('bride')}}</div>
        <div :style="{fontSize: dynamicFontSize('16px', '18px', '20px')}" class="ld-party-name-km">{{ data?.host2Name }}</div>
        <div :style="{fontSize: dynamicFontSize('16px', '18px', '20px')}" class="ld-party-name-en">{{ data?.host2Name }}</div>
        <div :style="{fontSize: dynamicFontSize('10px', '12px', '13px')}" class="ld-party-parents">
          <span>{{ data?.host2Name1 }}</span>
          <span>{{ data?.host2Name2 }}</span>
        </div>
        <div :style="{fontSize: dynamicFontSize('10px', '12px', '13px')}" class="ld-party-address">{{ data?.host2Address }}</div>
      </div>
    </section>

    <!-- ── Ceremony ── -->
    <section v-if="data?.ceremonyTitle || data?.ceremonyDate || data?.ceremonyTime || data?.ceremonyVenue || data?.ceremonyAddress" class="ld-section ld-ceremony">
      <div class="ld-section-heading">
        <span class="ld-sh-line" />
        <span :style="{fontSize: dynamicFontSize('16px', '18px', '20px')}">{{ data?.ceremonyTitle || tBy({en:'Ceremony',km:'ពិធីកាល'}) }}</span>
        <span class="ld-sh-line" />
      </div>
      <div class="ld-ceremony-details">
        <div v-if="data?.ceremonyDate" class="ld-ceremony-item">
          <i class="ri-calendar-heart-line" /> {{ data.ceremonyDate }}
        </div>
        <div v-if="data?.ceremonyTime" class="ld-ceremony-item">
          <i class="ri-time-line" /> {{ data.ceremonyTime }}
        </div>
        <div v-if="data?.ceremonyVenue" class="ld-ceremony-item">
          <i class="ri-map-pin-line" /> {{ data.ceremonyVenue }}
        </div>
        <div v-if="data?.ceremonyAddress" class="ld-ceremony-item">
          <i class="ri-map-pin-2-line" /> {{ data.ceremonyAddress }}
        </div>
        <a v-if="data?.ceremonyMapUrl" :href="data.ceremonyMapUrl" target="_blank" class="ld-map-btn">
          <i class="ri-map-pin-line" /> {{ tBy({en:'View Map',km:'មើលផែនទី'}) }}
        </a>
      </div>
    </section>

    <!-- ── Reception ── -->
    <section v-if="data?.receptionTitle || data?.receptionDate || data?.receptionTime || data?.receptionVenue || data?.receptionAddress" class="ld-section ld-reception">
      <div class="ld-section-heading">
        <span class="ld-sh-line" />
        <span :style="{fontSize: dynamicFontSize('16px', '18px', '20px')}">{{ data?.receptionTitle || tBy({en:'Reception',km:'ពិធីលេងលាក់'}) }}</span>
        <span class="ld-sh-line" />
      </div>
      <div class="ld-reception-details">
        <div v-if="data?.receptionDate" class="ld-reception-item">
          <i class="ri-calendar-heart-line" /> {{ data.receptionDate }}
        </div>
        <div v-if="data?.receptionTime" class="ld-reception-item">
          <i class="ri-time-line" /> {{ data.receptionTime }}
        </div>
        <div v-if="data?.receptionVenue" class="ld-reception-item">
          <i class="ri-map-pin-line" /> {{ data.receptionVenue }}
        </div>
        <div v-if="data?.receptionAddress" class="ld-reception-item">
          <i class="ri-map-pin-2-line" /> {{ data.receptionAddress }}
        </div>
        <a v-if="data?.receptionMapUrl" :href="data.receptionMapUrl" target="_blank" class="ld-map-btn">
          <i class="ri-map-pin-line" /> {{ tBy({en:'View Map',km:'មើលផែនទី'}) }}
        </a>
      </div>
    </section>

    <!-- ── Love Story ── -->
    <section v-if="data?.storyTitle || data?.loveStory || data?.storyTimeline?.length" class="ld-section ld-story">
      <div class="ld-section-heading">
        <span class="ld-sh-line" />
        <span :style="{fontSize: dynamicFontSize('16px', '18px', '20px')}">{{ data?.storyTitle || tBy({en:'Our Love Story',km:'រឿងរ៉ាវរបស់យើង'}) }}</span>
        <span class="ld-sh-line" />
      </div>
      <p v-if="data?.storyDescription" class="ld-story-description">{{ data.storyDescription }}</p>
      <div v-if="data?.loveStory" class="ld-story-content" style="white-space: pre-line">{{ data.loveStory }}</div>
      <div v-if="data?.storyTimeline?.length" class="ld-story-timeline">
        <div v-for="(item, i) in parseJSON(data.storyTimeline)" :key="i" class="ld-story-timeline-item">
          <div class="ld-story-year">{{ item.date || '' }}</div>
          <div class="ld-story-body">
            <div class="ld-story-title">{{ item.title || '' }}</div>
            <p class="ld-story-text">{{ item.description || '' }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Countdown ── -->
    <section v-if="data?.showCountdown && data?.countdownDate" class="ld-section ld-countdown">
      <div class="ld-section-heading">
        <span class="ld-sh-line" />
        <span :style="{fontSize: dynamicFontSize('16px', '18px', '20px')}">{{ data?.countdownTitle || tBy({en:'Countdown',km:'ការរាំងពេល'}) }}</span>
        <span class="ld-sh-line" />
      </div>
      <div class="ld-countdown-grid">
        <div class="ld-cd-unit">
          <span class="ld-cd-value" :id="'cd-days'">00</span>
          <span class="ld-cd-label">{{ tBy({en:'Days',km:'ថ្ងៃ'}) }}</span>
        </div>
        <div class="ld-cd-unit">
          <span class="ld-cd-value" :id="'cd-hours'">00</span>
          <span class="ld-cd-label">{{ tBy({en:'Hours',km:'ម៉ោង'}) }}</span>
        </div>
        <div class="ld-cd-unit">
          <span class="ld-cd-value" :id="'cd-mins'">00</span>
          <span class="ld-cd-label">{{ tBy({en:'Minutes',km:'នាទី'}) }}</span>
        </div>
        <div class="ld-cd-unit">
          <span class="ld-cd-value" :id="'cd-secs'">00</span>
          <span class="ld-cd-label">{{ tBy({en:'Seconds',km:'វិនាទី'}) }}</span>
        </div>
      </div>
    </section>

    <!-- ── Date & Venue ── -->
    <section class="ld-section ld-event-box">
      <div :style="{fontSize: dynamicFontSize('16px', '18px', '20px')}" class="ld-event-title">
        <i class="ri-calendar-heart-line" />
        {{ data?.eventName || data?.title }}
      </div>
      <div :style="{fontSize: dynamicFontSize('16px', '18px', '20px')}" class="ld-event-date-en">{{ primaryDate }}</div>
      <div v-if="secondaryDate" :style="{fontSize: dynamicFontSize('16px', '18px', '20px')}" class="ld-event-date-en">{{ secondaryDate }}</div>
      <div class="ld-divider-thin" />
      <div :style="{fontSize: dynamicFontSize('10px', '12px', '13px')}" class="ld-venue-name">{{ data?.venueName || data?.venue }}</div>
      <div :style="{fontSize: dynamicFontSize('10px', '12px', '13px')}" class="ld-venue-addr">{{ data?.venueAddress }}</div>
      <a
        v-if="data?.mapUrl"
        :href="data?.mapUrl ?? ''"
        target="_blank"
        class="ld-map-btn"
      >
        <i  class="ri-map-pin-line" /> <span :style="{fontSize: dynamicFontSize('16px', '18px', '20px')}">{{ tBy({en:'View Map',km:'មើលផែនទី'}) }}</span>
      </a>
    </section>

    <!-- ── Schedule ── -->
    <section class="ld-section">
      <div class="ld-section-heading">
        <span class="ld-sh-line" />
        <span :style="{fontSize: dynamicFontSize('16px', '18px', '20px')}">{{ tBy({en:'Ceremony Schedule',km:'កម្មវិធីពិធីការ'}) }}</span>
        <span class="ld-sh-line" />
      </div>

      <div
        v-for="(item, i) in (data?.schedule ?? [])"
        :key="item?.id ?? i"
        class="ld-schedule-item"
      > 
        <div :style="{fontSize: dynamicFontSize('10px', '12px', '13px')}" class="ld-sched-head">
          <span :style="{fontSize: dynamicFontSize('10px', '12px', '13px')}" class="ld-sched-num">{{ i + 1 }}</span>
          <div >
            <div class="ld-sched-day" :style="{fontSize: dynamicFontSize('10px', '12px', '13px')}">{{ item?.name }}</div>
            <div class="ld-sched-time" :style="{fontSize: dynamicFontSize('10px', '12px', '13px')}">
              <i class="ri-time-line" />
              {{ item?.startTime ? String(item?.startTime).slice(0,5) : '' }}
              {{ item?.startTime && item?.endTime ? '–' : '' }}
              {{ item?.endTime ? String(item?.endTime).slice(0,5) : '' }}
            </div>
          </div>
        </div>
        <p class="ld-sched-prog" :style="{fontSize: dynamicFontSize('10px', '12px', '13px')}" style="white-space: pre-line">{{ item?.description }}</p>
      </div>
    </section>

    <!-- ── Gift / Registry ── -->
    <section v-if="data?.showGiftInfo && (data?.bankNameGift || data?.giftQrImageUrl || data?.giftOptions?.length)" class="ld-section ld-gift">
      <div class="ld-section-heading">
        <span class="ld-sh-line" />
        <span :style="{fontSize: dynamicFontSize('16px', '18px', '20px')}">{{ data?.giftTitle || tBy({en:'Gift Registry',km:'ការចុះឈ្មោះអំណោយ'}) }}</span>
        <span class="ld-sh-line" />
      </div>
      <div v-if="data?.giftMessage" class="ld-gift-message">{{ data.giftMessage }}</div>
      <div v-if="data?.giftNote" class="ld-gift-note">{{ data.giftNote }}</div>
      <div v-if="data?.bankNameGift" class="ld-bank-info">
        <div class="ld-bank-name">{{ data.bankNameGift }}</div>
        <div class="ld-bank-account">{{ data.bankAccountGift }}</div>
        <div class="ld-bank-account-name">{{ data.accountName }}</div>
      </div>
      <div v-if="data?.giftQrImageUrl" class="ld-gift-qr">
        <img :src="data.giftQrImageUrl" alt="Gift QR" />
      </div>
      <div v-if="data?.giftOptions?.length" class="ld-gift-options">
        <div v-for="(opt, i) in parseJSON(data.giftOptions)" :key="i" class="ld-gift-option">
          <div class="ld-gift-option-name">{{ opt.name || '' }}</div>
          <div class="ld-gift-option-desc">{{ opt.description || '' }}</div>
        </div>
      </div>
    </section>

    <!-- ── Videos ── -->
    <section v-if="data?.videos?.length || data?.musicUrl || data?.musicTitle" class="ld-section ld-videos">
      <div class="ld-section-heading">
        <span class="ld-sh-line" />
        <span :style="{fontSize: dynamicFontSize('16px', '18px', '20px')}">{{ tBy({en:'Videos',km:'វីដេអូ'}) }}</span>
        <span class="ld-sh-line" />
      </div>
      <div v-if="data?.musicUrl" class="ld-music-player">
        <iframe :src="data.musicUrl" allow="autoplay; encrypted-media" allowfullscreen></iframe>
      </div>
      <div v-if="data?.videos?.length" class="ld-video-list">
        <div v-for="(video, i) in parseJSON(data.videos)" :key="i" class="ld-video-item">
          <div v-if="video.thumbnail" class="ld-video-thumb">
            <img :src="video.thumbnail" :alt="video.title || 'Video'" />
          </div>
          <div class="ld-video-info">
            <div class="ld-video-title">{{ video.title || '' }}</div>
            <a :href="video.url" target="_blank" class="ld-video-link">{{ tBy({en:'Watch',km:'មើល'}) }}</a>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Social / Sharing ── -->
    <section v-if="data?.hashtag || data?.instagramUrl || data?.facebookUrl || data?.telegramUrl || data?.shareTitle" class="ld-section ld-social">
      <div class="ld-section-heading">
        <span class="ld-sh-line" />
        <span :style="{fontSize: dynamicFontSize('16px', '18px', '20px')}">{{ tBy({en:'Share',km:'ចែករំលែក'}) }}</span>
        <span class="ld-sh-line" />
      </div>
      <div v-if="data?.shareTitle" class="ld-share-title">{{ data.shareTitle }}</div>
      <div v-if="data?.shareDescription" class="ld-share-desc">{{ data.shareDescription }}</div>
      <div class="ld-social-links">
        <a v-if="data?.instagramUrl" :href="data.instagramUrl" target="_blank" class="ld-social-btn">
          <i class="ri-instagram-line" /> Instagram
        </a>
        <a v-if="data?.facebookUrl" :href="data.facebookUrl" target="_blank" class="ld-social-btn">
          <i class="ri-facebook-line" /> Facebook
        </a>
        <a v-if="data?.telegramUrl" :href="data.telegramUrl" target="_blank" class="ld-social-btn">
          <i class="ri-telegram-line" /> Telegram
        </a>
      </div>
      <div v-if="data?.hashtag" class="ld-hashtag">#{{ data.hashtag }}</div>
    </section>

    <!-- ── Special Messages ── -->
    <section v-if="data?.announcement || data?.importantNote || data?.specialNote || data?.thankYouMessage" class="ld-section ld-special">
      <div v-if="data?.announcement" class="ld-special-item ld-announcement">
        <div class="ld-special-icon">📢</div>
        <div class="ld-special-text">{{ data.announcement }}</div>
      </div>
      <div v-if="data?.importantNote" class="ld-special-item ld-important">
        <div class="ld-special-icon">⚠️</div>
        <div class="ld-special-text">{{ data.importantNote }}</div>
      </div>
      <div v-if="data?.specialNote" class="ld-special-item ld-special-note">
        <div class="ld-special-icon">✨</div>
        <div class="ld-special-text">{{ data.specialNote }}</div>
      </div>
      <div v-if="data?.thankYouMessage" class="ld-special-item ld-thankyou">
        <div class="ld-special-icon">🙏</div>
        <div class="ld-special-text">{{ data.thankYouMessage }}</div>
      </div>
    </section>

    <!-- ── Custom Sections ── -->
    <section v-if="data?.sections?.length" class="ld-section ld-custom">
      <div v-for="(section, i) in parseJSON(data.sections)" :key="i" v-if="section.enabled !== false" class="ld-custom-section">
        <div v-if="section.title" class="ld-custom-title">{{ section.title }}</div>
        <div v-if="section.subtitle" class="ld-custom-subtitle">{{ section.subtitle }}</div>
        <div v-if="section.content" class="ld-custom-content" style="white-space: pre-line">{{ section.content }}</div>
        <img v-if="section.image" :src="section.image" class="ld-custom-image" />
        <div v-if="section.video" class="ld-custom-video">
          <iframe :src="section.video" allowfullscreen></iframe>
        </div>
      </div>
    </section>

    <!-- ── RSVP ── -->
    <section class="ld-section ld-rsvp">
      <div class="ld-section-heading">
        <span class="ld-sh-line" />
        <span :style="{fontSize: dynamicFontSize('16px', '18px', '20px')}">{{ tBy({en:'RSVP',km:'ការបញ្ជាក់ RSVP'}) }}</span>
        <span class="ld-sh-line" />
      </div>
      <p :style="{fontSize: dynamicFontSize('10px', '12px', '13px')}" style="white-space: pre-line">{{ data?.rsvpNote }}</p>
      <div :style="{fontSize: dynamicFontSize('10px', '12px', '13px')}" class="ld-contacts">
        <i class="ri-phone-fill" /> {{ data?.contacts }}
      </div>
    </section>

    <!-- ── Closing ── -->
    <footer class="ld-footer">
      <div class="ld-ornament" style="margin-bottom: 12px">
        <span class="ld-orn-line" />
        <span class="ld-orn-lotus">❧</span>
        <span class="ld-orn-line" />
      </div>
      <p class="ld-closing" :style="{fontSize: dynamicFontSize('10px', '12px', '13px')}">{{ data?.closing }}</p>
      <p class="ld-signatures" :style="{fontSize: dynamicFontSize('10px', '12px', '13px')}">
        <span :style="{fontSize: dynamicFontSize('16px', '18px', '20px')}">{{ data?.host1Name }}</span>
        <span class="ld-sig-amp">❤</span>
        <span :style="{fontSize: dynamicFontSize('16px', '18px', '20px')}">{{ data?.host2Name }}</span>
      </p>
      <!-- ── Footer ── -->
      <div v-if="data?.footerTitle || data?.footerMessage || data?.footerLogo || data?.footerNote" class="ld-footer-extra">
        <div v-if="data?.footerLogo" class="ld-footer-logo">
          <img :src="data.footerLogo" alt="Footer Logo" />
        </div>
        <div v-if="data?.footerTitle" class="ld-footer-title">{{ data.footerTitle }}</div>
        <div v-if="data?.footerMessage" class="ld-footer-message">{{ data.footerMessage }}</div>
        <div v-if="data?.footerNote" class="ld-footer-note">{{ data.footerNote }}</div>
      </div>
      <div class="ld-bottom-border" />
    </footer>
  </div>
</template>

<style lang="scss" scoped>
// ── Root ──────────────────────────────────────────────────────────────────
.ld-root {
  background: var(--lt-bg, #fdf6ef);
  color: #2c1810;
  font-family: 'Battambang', 'NotoSansKhmer', serif;
  font-size: 14px;
  line-height: 1.8;
  padding: 32px 28px 40px;
  min-height: 100%;
  // height: 500px;
  // height: calc(100vh - 280px);
  // max-height: 2000px;
  // min-height: 400px;
  overflow-x: hidden;
  &.ld-mini { font-size: 13px; padding: 24px 20px 32px; }
}

// ── Template variants ─────────────────────────────────────────────────────
.ld-tpl--royal {
  background: #1a0a2e;
  color: #f0e6c8;
  .ld-top-border, .ld-bottom-border { background: linear-gradient(90deg, transparent, #d4af37, transparent); }
  .ld-title { color: #d4af37; }
  .ld-heart { color: #d4af37; }
  .ld-orn-diamond { background: #d4af37; }
  .ld-event-box { border-color: rgba(212, 175, 55, 0.3); background: rgba(212, 175, 55, 0.06); }
  .ld-schedule-item { border-color: rgba(212, 175, 55, 0.2); }
  .ld-sched-num { background: rgba(212, 175, 55, 0.15); color: #d4af37; }
  .ld-map-btn { background: rgba(212, 175, 55, 0.15); color: #d4af37; border-color: rgba(212, 175, 55, 0.3); }
}

.ld-tpl--modern {
  font-family: var(--font-400),'DM Sans', 'Inter', sans-serif;
  .ld-title { font-family: var(--font-500),'Cormorant Garamond', serif; }
}

// ── Decorative borders ────────────────────────────────────────────────────
.ld-top-border {
  height: 5px;
  background: linear-gradient(90deg, transparent, var(--lt-primary, #c0392b), transparent);
  margin: -32px -28px 28px;
  border-radius: 0;
}

.ld-bottom-border {
  height: 5px;
  background: linear-gradient(90deg, transparent, var(--lt-primary, #c0392b), transparent);
  margin: 28px -28px -12px;
}

// ── Header ────────────────────────────────────────────────────────────────
.ld-header {
  text-align: center;
  margin-bottom: 24px;
}

.ld-subtitle {
  font-size: 18px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--lt-primary, #c0392b);
  margin-bottom: 8px;
  opacity: 0.8;
}

.ld-title {
  font-size: clamp(20px, 4vw, 28px);
  font-weight: 700;
  color: var(--lt-primary, #c0392b);
  line-height: 1.3;
  margin: 8px 0 12px;
}

// ── Ornament ─────────────────────────────────────────────────────────────
.ld-ornament {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
  margin: 8px 0;
  opacity: 0.55;
}

.ld-orn-line {
  flex: 1;
  max-width: 80px;
  height: 2px;
  background: var(--lt-primary, #c0392b);
}

.ld-orn-diamond {
  width: 5px; height: 5px;
  background: var(--lt-primary, #c0392b);
  transform: rotate(45deg);
}

.ld-orn-lotus { font-size: 30px; color: var(--lt-primary, #c0392b); }

// ── Sections ─────────────────────────────────────────────────────────────
.ld-section {
  margin-bottom: 22px;
}

.ld-section-heading {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 29px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--lt-primary, #c0392b);
  margin-bottom: 14px;
  opacity: 0.85;
}

.ld-sh-line {
  flex: 1;
  height: 1px;
  background: var(--lt-primary, #c0392b);
  opacity: 0.3;
}

// ── Opening ───────────────────────────────────────────────────────────────
.ld-opening {
  text-align: center;
  font-size: clamp(16px, 2.5vw, 25px);
  opacity: 0.9;
  padding: 0 8px;
}

// ── Couple ────────────────────────────────────────────────────────────────
.ld-couple {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 16px;
  align-items: start;
  padding: 16px;
  background: rgba(0,0,0,0.025);
  border: 1px solid color-mix(in srgb, var(--lt-primary, #c0392b) 15%, transparent);
  border-radius: 12px;
}

.ld-party {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.ld-party-icon { font-size: 20px; margin-bottom: 4px; }

.ld-party-role {
  // font-size: 19px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--lt-primary, #c0392b);
  opacity: 0.7;
}

.ld-party-name-km {
  font-size: 29px;
  font-weight: 700;
  color: var(--lt-primary, #c0392b);
}

.ld-party-name-en { font-size: 12px; opacity: 0.6; display: none; }

.ld-party-parents {
  display: flex;
  flex-direction: column;
  font-size: 25px;
  opacity: 0.75;
  gap: 1px;
  margin-top: 4px;
}

.ld-party-address {
  font-size: 20px;
  opacity: 0.6;
  margin-top: 4px;
  line-height: 1.5;
}

.ld-couple-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 36px;
}

.ld-heart {
  font-size: 60px;
  color: var(--lt-primary, #c0392b);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

// ── Event box ─────────────────────────────────────────────────────────────
.ld-event-box {
  text-align: center;
  padding: 18px;
  border: 1px solid color-mix(in srgb, var(--lt-primary, #c0392b) 20%, transparent);
  border-radius: 12px;
  background: color-mix(in srgb, var(--lt-primary, #c0392b) 4%, transparent);
}

.ld-event-title {
  font-size: 21px;
  font-weight: 700;
  color: var(--lt-primary, #c0392b);
  margin-bottom: 4px;
}

.ld-event-date-en {
  font-size: 16px;
  opacity: 0.6;
  margin-bottom: 12px;
}

.ld-divider-thin {
  height: 1px;
  background: color-mix(in srgb, var(--lt-primary, #c0392b) 20%, transparent);
  margin: 10px auto;
  width: 60%;
}

.ld-venue-name { font-size: 22px; font-weight: 600; margin-bottom: 4px; }
.ld-venue-addr { font-size: 18px; opacity: 0.7; margin-bottom: 10px; }

.ld-map-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  border: 1px solid color-mix(in srgb, var(--lt-primary, #c0392b) 35%, transparent);
  border-radius: 999px;
  font-size: 16px;
  color: var(--lt-primary, #c0392b);
  text-decoration: none;
  background: color-mix(in srgb, var(--lt-primary, #c0392b) 8%, transparent);
  transition: all 0.2s;

  &:hover {
    background: color-mix(in srgb, var(--lt-primary, #c0392b) 15%, transparent);
  }
}

// ── Schedule ──────────────────────────────────────────────────────────────
.ld-schedule-item {
  border: 1px solid color-mix(in srgb, var(--lt-primary, #c0392b) 15%, transparent);
  border-radius: 10px;
  padding: 12px 14px;
  margin-bottom: 10px;
  background: rgba(0,0,0,0.02);
}

.ld-sched-head {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 8px;
}

.ld-sched-num {
  width: 25px; height: 25px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--lt-primary, #c0392b) 12%, transparent);
  color: var(--lt-primary, #c0392b);
  font-size: 20px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.ld-sched-day {
  font-size: 23px;
  font-weight: 700;
  color: var(--lt-primary, #c0392b);
}

.ld-sched-time {
  font-size: 19px;
  opacity: 0.65;
}

.ld-sched-prog {
  font-size: 25px;
  line-height: 1.7;
  opacity: 0.85;
  margin: 0;
}

// ── RSVP ─────────────────────────────────────────────────────────────────
.ld-rsvp { font-size: 22px; }

.ld-contacts {
  margin-top: 10px;
  font-weight: 600;
  font-size: 19px;
  color: var(--lt-primary, #c0392b);
}

// ── Footer ────────────────────────────────────────────────────────────────
.ld-footer { text-align: center; margin-top: 8px; }

.ld-closing {
  font-size: 32px;
  font-family: var(--font-500);
  opacity: 0.75;
  margin-bottom: 14px;
}

.ld-signatures {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  font-size: 30px;
  font-weight: 700;

  span { color: var(--lt-primary, #c0392b); }
}

.ld-sig-amp {
  font-size: 30px;
  color: var(--lt-primary, #c0392b) !important;
}
</style>
