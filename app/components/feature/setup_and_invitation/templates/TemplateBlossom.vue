<script setup>
// components/letter/templates/TemplateBlossom.vue
// Pink floral watercolour — soft, feminine, Khmer wedding aesthetic
// import type { LetterData, GalleryImage } from '~/composables/useLetterData'

const props = defineProps(['data', 'mini'])
const letter = computed(() => props.data)
const mini = computed(() => props.mini)

// Optional — Blossom's copy is Khmer-first by design, but we still hook
// into the app's locale (if available) to decide whether to surface the
// Khmer lunar calendar date and the new section labels in Khmer or English.
// Falls back to Khmer if `useTr()` isn't wired up the same way everywhere.
const { locale } = useTr ? useTr() : { locale: ref('km') }
const isKhmer = computed(() => (locale?.value ?? 'km') === 'km')

const { toKhmerLunar } = useKhmerLunarDate()
const { remaining } = useEventCountdown(() => letter.value?.eventDate)
const { buildCalendarLinks } = useAddToCalendar()

const fmtDate = (iso) => {
  if (!iso) return ''
  try { return new Intl.DateTimeFormat('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' }).format(new Date(iso)) }
  catch { return iso }
}

const doneImages = (gallery) => (gallery ?? []).filter(g => g.status === 'done' && g.url)

// Authentic Khmer lunar (Chhankitek) date, computed from the same
// Gregorian date already stored on the letter — shown alongside the
// manually-entered `weddingDateKm` text when the app language is Khmer.
const khmerLunarDate = computed(() => toKhmerLunar(letter.value?.eventDate))

const calendarLinks = computed(() => buildCalendarLinks({
  title: letter.value?.title || (isKhmer.value ? 'ពិធីមង្គលការ' : 'Wedding'),
  description: letter.value?.opening ?? '',
  location: letter.value?.venueAddress ?? '',
  startISO: letter.value?.eventDate,
  durationHours: 4,
}))

const hasStory = computed(() => (letter.value?.story ?? []).length > 0)
const hasBlessing = computed(() => !!(letter.value?.blessing))

const scrollToRsvp = () => {
  document.getElementById('tb-rsvp-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <div class="tb-root" :class="{ 'tb-mini': mini }">

    <!-- Soft floating background blossoms (decorative, behind content) -->
    <div class="tb-bg-petals" aria-hidden="true">
      <span class="tb-bg-petal">🌸</span>
      <span class="tb-bg-petal">🌺</span>
      <span class="tb-bg-petal">🌸</span>
    </div>

    <!-- Floral header band -->
    <div class="tb-floral-band">
      <span class="tb-flower">🌸</span>
      <span class="tb-flower">🌺</span>
      <span class="tb-flower">🌸</span>
      <span class="tb-flower">🌺</span>
      <span class="tb-flower">🌸</span>
    </div>

    <!-- Header -->
    <header class="tb-header tb-anim">
      <p class="tb-pre">— ពិធីមង្គលការ / Wedding Invitation —</p>
      <h1 class="tb-title">{{ letter?.title ?? "" }}</h1>
      <div class="tb-names">
        <span class="tb-name">{{ letter?.host1Name ?? "" }}</span>
        <span class="tb-amp">❤</span>
        <span class="tb-name">{{ letter?.host2Name ?? "" }}</span>
      </div>
    </header>

    <!-- Watercolour divider -->
    <div class="tb-wc-divider">
      <span>✦</span><span class="tb-wc-line"/><span>✦</span>
    </div>

    <!-- Opening -->
    <section class="tb-opening tb-anim">
      <p style="white-space:pre-line">{{ letter?.opening ?? "" }}</p>
    </section>

    <!-- Couple cards -->
    <section class="tb-couple tb-anim">
      <div class="tb-party tb-party--groom">
        <div class="tb-party-flower">🌿</div>
        <div class="tb-party-role">ក្រូម / Groom</div>
        <div class="tb-party-name">{{ letter?.host1Name ?? "" }}</div>
        <div class="tb-party-parents">{{ letter?.host1Name1 ?? "" }} · {{ letter?.host1Name2 ?? "" }}</div>
        <div class="tb-party-addr">{{ letter?.host1Address ?? "" }}</div>
      </div>
      <div class="tb-couple-heart">
        <div class="tb-heart-circle">💕</div>
      </div>
      <div class="tb-party tb-party--bride">
        <div class="tb-party-flower">🌷</div>
        <div class="tb-party-role">កូនក្រមុំ / Bride</div>
        <div class="tb-party-name">{{ letter?.host2Name ?? "" }}</div>
        <div class="tb-party-parents">{{ letter?.host2Name1 ?? "" }} · {{ letter?.host2Name2 ?? "" }}</div>
        <div class="tb-party-addr">{{ letter?.host2Address ?? "" }}</div>
      </div>
    </section>

    <!-- Parents' blessing (optional) -->
    <section v-if="hasBlessing" class="tb-section tb-blessing tb-anim">
      <div class="tb-section-title">🌷 {{ isKhmer ? 'ពរជ័យពីមាតាបិតា' : 'Blessing' }}</div>
      <p style="white-space:pre-line">{{ letter?.blessing ?? '' }}</p>
    </section>

    <!-- Date & Venue -->
    <section class="tb-event tb-anim">
      <div class="tb-event-inner">
        <div class="tb-event-icon">📅</div>
        <div class="tb-event-date">{{ letter?.weddingDate ?? "" }}</div>
        <div v-if="isKhmer && khmerLunarDate" class="tb-event-lunar">🌙 {{ khmerLunarDate }}</div>
        <div class="tb-event-date-en">{{ fmtDate(letter?.eventDate ?? "") }}</div>
        <div class="tb-wc-divider"><span>✦</span><span class="tb-wc-line"/><span>✦</span></div>
        <div class="tb-event-venue">🏛️ {{ letter?.venue ?? "" }}</div>
        <div class="tb-event-addr">{{ letter?.venueAddress ?? "" }}</div>
        <div class="tb-event-actions">
          <a v-if="letter?.mapUrl" :href="letter.mapUrl" target="_blank" class="tb-map-btn">
            📍 មើលផែនទី
          </a>
          <a v-if="calendarLinks.googleUrl" :href="calendarLinks.googleUrl" target="_blank" class="tb-map-btn tb-map-btn--ghost">
            🗓️ {{ isKhmer ? 'ដាក់ក្នុងប្រតិទិន' : 'Add to calendar' }}
          </a>
        </div>
      </div>
    </section>

    <!-- Countdown -->
    <section v-if="remaining.isValid && !remaining.isPast" class="tb-section tb-countdown tb-anim">
      <div class="tb-section-title">⏳ {{ isKhmer ? 'រាប់ថយក្រោយថ្ងៃមង្គលការ' : 'Counting Down' }}</div>
      <div class="tb-countdown-grid">
        <div class="tb-cd-unit">
          <span class="tb-cd-value">{{ remaining.days }}</span>
          <span class="tb-cd-label">{{ isKhmer ? 'ថ្ងៃ' : 'Days' }}</span>
        </div>
        <div class="tb-cd-unit">
          <span class="tb-cd-value">{{ remaining.hours }}</span>
          <span class="tb-cd-label">{{ isKhmer ? 'ម៉ោង' : 'Hrs' }}</span>
        </div>
        <div class="tb-cd-unit">
          <span class="tb-cd-value">{{ remaining.minutes }}</span>
          <span class="tb-cd-label">{{ isKhmer ? 'នាទី' : 'Min' }}</span>
        </div>
        <div class="tb-cd-unit">
          <span class="tb-cd-value">{{ remaining.seconds }}</span>
          <span class="tb-cd-label">{{ isKhmer ? 'វិនាទី' : 'Sec' }}</span>
        </div>
      </div>
    </section>

    <!-- Schedule -->
    <section class="tb-section tb-anim">
      <div class="tb-section-title">🌸 កម្មវិធីពិធីការ</div>
      <div v-for="(item, i) in (letter?.schedule ?? [])" :key="item?.id ?? i" class="tb-sched">
        <div class="tb-sched-badge">{{ i + 1 }}</div>
        <div class="tb-sched-body">
          <div class="tb-sched-day">{{ item?.name ?? "" }}</div>
          <div class="tb-sched-time" v-if="item?.startTime || item?.endTime">
            ⏱
            {{ item?.startTime ? String(item?.startTime).slice(0,5) : '' }}
            {{ item?.startTime && item?.endTime ? '–' : '' }}
            {{ item?.endTime ? String(item?.endTime).slice(0,5) : '' }}
          </div>
          <p v-if="item?.description" class="tb-sched-prog" style="white-space:pre-line">{{ item?.description }}</p>
        </div>
      </div>
    </section>

    <!-- Our Story (optional) -->
    <section v-if="hasStory" class="tb-section tb-story tb-anim">
      <div class="tb-section-title">🌼 {{ isKhmer ? 'រឿងរ៉ាវស្នេហា' : 'Our Story' }}</div>
      <div class="tb-story-list">
        <div v-for="(chapter, i) in (letter?.story ?? [])" :key="i" class="tb-story-item">
          <div class="tb-story-year">{{ chapter?.year ?? '' }}</div>
          <div class="tb-story-body">
            <div class="tb-story-title">{{ chapter?.title ?? '' }}</div>
            <p class="tb-story-text">{{ chapter?.text ?? '' }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- RSVP -->
    <section id="tb-rsvp-anchor" class="tb-section tb-rsvp tb-anim">
      <div class="tb-section-title">🌺 ការបញ្ជាក់ / RSVP</div>
      <p style="white-space:pre-line">{{ letter?.rsvpNote ?? "" }}</p>
      <div class="tb-contacts">📞 {{ letter?.contacts ?? "" }}</div>
    </section>

    <!-- Gallery -->
    <section v-if="doneImages(letter?.gallery ?? []).length" class="tb-gallery tb-anim">
      <div class="tb-section-title">📸 រូបភាព / Gallery</div>
      <div class="tb-gallery-grid">
        <div
          v-for="img in doneImages((letter?.gallery ?? []))"
          :key="img.id"
          class="tb-gallery-item"
        >
          <RImage :src="img.url ?? ''" :alt="img.caption ?? ''" loading="lazy" />
          <p v-if="img?.caption" class="tb-gallery-caption">{{ img?.caption ?? '' }}</p>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="tb-footer tb-anim">
      <div class="tb-floral-band tb-floral-band--sm">
        <span>🌸</span><span>🌺</span><span>🌸</span>
      </div>
      <p class="tb-closing">{{ letter?.closing ?? "" }}</p>
      <p class="tb-sig">{{ letter?.host1Name ?? "" }} ❤ {{ letter?.host2Name ?? "" }}</p>
    </footer>

    <!-- Sticky quick-action bar (guest view only, not in mini/preview mode) -->
    <div v-if="!mini" class="tb-quickbar">
      <button type="button" class="tb-quickbar-btn" @click="scrollToRsvp">
        💌 RSVP
      </button>
      <a v-if="letter?.mapUrl" :href="letter?.mapUrl" target="_blank" class="tb-quickbar-btn">
        📍 {{ isKhmer ? 'ផែនទី' : 'Map' }}
      </a>
      <a v-if="calendarLinks.googleUrl" :href="calendarLinks.googleUrl" target="_blank" class="tb-quickbar-btn">
        🗓️ {{ isKhmer ? 'ប្រតិទិន' : 'Calendar' }}
      </a>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tb-root {
  position: relative;
  overflow: hidden;
  background: #fff0f5;
  color: #4a0030;
  font-family: 'Battambang','NotoSansKhmer', serif;
  font-size: 14px;
  line-height: 1.8;
  padding: 0 0 40px;

  &.tb-mini { font-size: 12px; }
}

// ── Entrance animation ───────────────────────────────────────────────────
.tb-anim { animation: tb-fade-up .7s cubic-bezier(.22,1,.36,1) both; }
@keyframes tb-fade-up {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .tb-anim, .tb-bg-petal, .tb-flower { animation: none !important; }
}

// ── Background floating petals ──────────────────────────────────────────
.tb-bg-petals { position: absolute; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
.tb-bg-petal {
  position: absolute;
  font-size: 2.4rem;
  opacity: .12;
  animation: tb-drift 14s ease-in-out infinite;

  &:nth-child(1) { top: 6%;  left: 8%;  animation-delay: 0s; }
  &:nth-child(2) { top: 24%; right: 10%; font-size: 3rem; animation-delay: 3s; }
  &:nth-child(3) { top: 55%; left: 14%; animation-delay: 6s; }
}
@keyframes tb-drift {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50%      { transform: translateY(-18px) rotate(8deg); }
}

.tb-root > :not(.tb-bg-petals) { position: relative; z-index: 1; }

// ── Floral band ───────────────────────────────────────────────────────────
.tb-floral-band {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: linear-gradient(135deg, #ffe4ef, #ffc8e0);
  font-size: 1.4rem;

  &--sm { padding: 8px; font-size: 1rem; background: linear-gradient(135deg, #ffe4ef, #ffc8e0); }
}

.tb-flower { animation: sway 3s ease-in-out infinite; &:nth-child(2) { animation-delay: .4s; } &:nth-child(3) { animation-delay: .8s; } &:nth-child(4) { animation-delay: 1.2s; } }
@keyframes sway { 0%,100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }

// ── Header ────────────────────────────────────────────────────────────────
.tb-header { text-align: center; padding: 28px 24px 16px; }
.tb-pre { font-size: 11px; letter-spacing: .18em; text-transform: uppercase; color: #e91e8c; opacity: .8; margin-bottom: 8px; }
.tb-title { font-size: clamp(18px,4vw,26px); font-weight: 700; color: #e91e8c; margin: 0 0 14px; }
.tb-names { display: flex; align-items: center; justify-content: center; gap: 14px; font-size: 17px; font-weight: 700; color: #c0004a; }
.tb-amp { font-size: 18px; color: #e91e8c; }

// ── Watercolour divider ───────────────────────────────────────────────────
.tb-wc-divider { display: flex; align-items: center; gap: 10px; justify-content: center; margin: 14px 0; color: #e91e8c; opacity: .5; font-size: 12px; }
.tb-wc-line { flex: 1; max-width: 80px; height: 1px; background: #e91e8c; }

// ── Opening ───────────────────────────────────────────────────────────────
.tb-opening { text-align: center; font-size: 13px; padding: 0 24px 16px; opacity: .9; }

// ── Couple ────────────────────────────────────────────────────────────────
.tb-couple { display: grid; grid-template-columns: 1fr auto 1fr; gap: 12px; padding: 16px 20px; background: rgba(233,30,140,.04); border-top: 1px solid rgba(233,30,140,.15); border-bottom: 1px solid rgba(233,30,140,.15); }
.tb-party { text-align: center; }
.tb-party-flower { font-size: 1.5rem; margin-bottom: 4px; }
.tb-party-role { font-size: 10px; text-transform: uppercase; letter-spacing: .12em; color: #e91e8c; opacity: .7; }
.tb-party-name { font-size: 15px; font-weight: 700; color: #e91e8c; }
.tb-party-en { font-size: 11px; opacity: .6; }
.tb-party-parents { font-size: 11px; opacity: .75; margin-top: 4px; }
.tb-party-addr { font-size: 10px; opacity: .55; margin-top: 3px; line-height: 1.4; }
.tb-couple-heart { display: flex; align-items: center; justify-content: center; padding-top: 28px; }
.tb-heart-circle { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg,#ffc8e0,#ffadd1); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }

// ── Blessing ─────────────────────────────────────────────────────────────
.tb-blessing { padding: 0 20px 16px; text-align: center; }
.tb-blessing p { font-size: 12.5px; padding: 14px; border: 1px dashed rgba(233,30,140,.3); border-radius: 12px; background: rgba(255,255,255,.5); opacity: .9; }

// ── Event ─────────────────────────────────────────────────────────────────
.tb-event { padding: 20px; }
.tb-event-inner { background: rgba(255,255,255,.7); border: 1px solid rgba(233,30,140,.2); border-radius: 12px; padding: 18px; text-align: center; }
.tb-event-icon { font-size: 1.5rem; margin-bottom: 6px; }
.tb-event-date { font-size: 15px; font-weight: 700; color: #e91e8c; }
.tb-event-lunar { font-size: 12px; color: #c0004a; opacity: .8; margin-top: 2px; }
.tb-event-date-en { font-size: 11px; opacity: .6; margin: 4px 0 12px; }
.tb-event-venue { font-size: 14px; font-weight: 600; margin: 6px 0 3px; }
.tb-event-addr { font-size: 12px; opacity: .7; margin-bottom: 10px; }
.tb-event-actions { display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap; }
.tb-map-btn { display: inline-block; padding: 5px 14px; border: 1px solid rgba(233,30,140,.4); border-radius: 999px; font-size: 12px; color: #e91e8c; text-decoration: none; background: rgba(233,30,140,.07); }
.tb-map-btn--ghost { background: transparent; }

// ── Countdown ────────────────────────────────────────────────────────────
.tb-countdown { padding: 0 20px 16px; text-align: center; }
.tb-countdown-grid { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; }
.tb-cd-unit { display: flex; flex-direction: column; align-items: center; min-width: 60px; padding: 10px 6px; border-radius: 12px; background: linear-gradient(135deg, #ffe4ef, #ffc8e0); }
.tb-cd-value { font-size: 20px; font-weight: 700; color: #c0004a; font-variant-numeric: tabular-nums; }
.tb-cd-label { font-size: 9.5px; opacity: .7; margin-top: 2px; }

// ── Section ───────────────────────────────────────────────────────────────
.tb-section { padding: 0 20px 16px; }
.tb-section-title { font-size: 13px; font-weight: 700; color: #e91e8c; margin-bottom: 12px; letter-spacing: .05em; }

// ── Schedule ──────────────────────────────────────────────────────────────
.tb-sched { display: flex; gap: 10px; padding: 10px; border: 1px solid rgba(233,30,140,.15); border-radius: 10px; margin-bottom: 8px; background: rgba(255,255,255,.5); }
.tb-sched-badge { width: 22px; height: 22px; border-radius: 50%; background: rgba(233,30,140,.12); color: #e91e8c; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
.tb-sched-body { flex: 1; }
.tb-sched-day { font-size: 13px; font-weight: 700; color: #e91e8c; }
.tb-sched-time { font-size: 11px; opacity: .65; }
.tb-sched-prog { font-size: 12px; line-height: 1.7; opacity: .85; margin: 4px 0 0; }

// ── Story ────────────────────────────────────────────────────────────────
.tb-story-list { display: flex; flex-direction: column; gap: 12px; }
.tb-story-item { display: flex; gap: 12px; align-items: flex-start; }
.tb-story-year { flex: none; font-weight: 700; color: #e91e8c; font-size: 13px; min-width: 44px; }
.tb-story-title { font-weight: 700; font-size: 13px; color: #c0004a; }
.tb-story-text { font-size: 12px; opacity: .8; margin: 2px 0 0; }

// ── RSVP ─────────────────────────────────────────────────────────────────
.tb-rsvp { font-size: 12.5px; scroll-margin-top: 24px; }
.tb-contacts { margin-top: 8px; font-weight: 700; font-size: 13px; color: #e91e8c; }

// ── Gallery ───────────────────────────────────────────────────────────────
.tb-gallery { padding: 0 20px 16px; }
.tb-gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 8px; }
.tb-gallery-item { border-radius: 10px; overflow: hidden; border: 2px solid rgba(233,30,140,.2); img { width: 100%; aspect-ratio:1; object-fit:cover; display:block; } }
.tb-gallery-caption { font-size: 10px; text-align: center; color: #c0004a; padding: 3px 4px; background: rgba(255,240,245,.8); }

// ── Footer ────────────────────────────────────────────────────────────────
.tb-footer { text-align: center; padding: 16px 20px 0; }
.tb-closing { font-size: 13px; opacity: .7; margin-bottom: 10px; }
.tb-sig { font-size: 16px; font-weight: 700; color: #e91e8c; }

// ── Sticky quick-action bar ─────────────────────────────────────────────
.tb-quickbar {
  position: sticky;
  bottom: 12px;
  z-index: 5;
  display: flex;
  justify-content: center;
  gap: 8px;
  margin: 24px 20px 0;
  padding: 10px;
  background: rgba(255,240,245,.92);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(233,30,140,.25);
  border-radius: 999px;
  box-shadow: 0 8px 24px rgba(233,30,140,.18);
}
.tb-quickbar-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 14px;
  border: none;
  border-radius: 999px;
  background: #e91e8c;
  color: #fff;
  font-size: 11.5px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  font-family: inherit;
  transition: transform .15s ease, box-shadow .15s ease;

  &:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(233,30,140,.35); }
}
</style>