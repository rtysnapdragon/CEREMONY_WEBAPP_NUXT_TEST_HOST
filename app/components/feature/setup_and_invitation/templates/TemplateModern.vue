<script setup>
const props = defineProps(['data', 'mini'])
const letter = computed(() => props.data)
const mini = computed(() => props.mini)

const fmtDate = (iso) => {
  if (!iso) return ''
  try { return new Intl.DateTimeFormat('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' }).format(new Date(iso)) }
  catch { return iso }
}

const doneImages = (gallery) => (gallery ?? []).filter(g => g.status === 'done' && g.url)
</script>

<template>
  <div class="tmn-root" :class="{ 'tmn-mini': mini }">

    <!-- Top accent bar -->
    <div class="tmn-accent-bar"/>

    <!-- Header -->
    <header class="tmn-header">
      <div class="tmn-label">Wedding Invitation</div>
      <h1 class="tmn-title">{{ letter?.title ?? "" }}</h1>
      <div class="tmn-rule"/>
      <div class="tmn-names">
        <span class="tmn-name-block">
          <span class="tmn-name-km">{{ letter?.host1Name ?? "" }}</span>
        </span>
        <span class="tmn-amp">×</span>
        <span class="tmn-name-block">
          <span class="tmn-name-km">{{ letter?.host2Name ?? "" }}</span>
        </span>
      </div>
    </header>

    <!-- Date band -->
    <div class="tmn-date-band">
      <span class="tmn-date-main">{{ letter?.weddingDate ?? "" }}</span>
      <span class="tmn-date-en">{{ fmtDate(letter?.eventDate ?? "") }}</span>
    </div>

    <!-- Content body -->
    <div class="tmn-body">

      <!-- Opening -->
      <section class="tmn-section">
        <p class="tmn-opening" style="white-space:pre-line">{{ letter?.opening ?? "" }}</p>
      </section>

      <!-- Couple details -->
      <section class="tmn-section">
        <div class="tmn-sec-label">01 — Couple</div>
        <div class="tmn-couple">
          <div class="tmn-party">
            <div class="tmn-party-tag">GROOM / ក្រូម</div>
            <div class="tmn-party-name">{{ letter?.host1Name ?? "" }}</div>
            <div class="tmn-party-sub">{{ letter?.host1Name1 ?? "" }} · {{ letter?.host1Name2 ?? "" }}</div>
            <div class="tmn-party-addr">{{ letter?.host1Address ?? "" }}</div>
          </div>
          <div class="tmn-couple-divider">
            <div class="tmn-cd-line"/>
            <div class="tmn-cd-icon">❤</div>
            <div class="tmn-cd-line"/>
          </div>
          <div class="tmn-party">
            <div class="tmn-party-tag">BRIDE / 花嫁</div>
            <div class="tmn-party-name">{{ letter?.host2Name ?? "" }}</div>
            <div class="tmn-party-sub">{{ letter?.host2Name1 ?? "" }} · {{ letter?.host2Name2 ?? "" }}</div>
            <div class="tmn-party-addr">{{ letter?.host2Address ?? "" }}</div>
          </div>
        </div>
      </section>

      <!-- Venue -->
      <section class="tmn-section">
        <div class="tmn-sec-label">02 — Venue</div>
        <div class="tmn-venue-block">
          <div class="tmn-venue-name">{{ letter?.venue ?? "" }}</div>
          <div class="tmn-venue-addr">{{ letter?.venueAddress ?? "" }}</div>
          <a v-if="letter?.mapUrl" :href="letter?.mapUrl ?? ''" target="_blank" class="tmn-map-btn">
            View on Map →
          </a>
        </div>
      </section>

      <!-- Schedule -->
      <section class="tmn-section">
        <div class="tmn-sec-label">03 — Schedule</div>
        <div v-for="(item,i) in (letter?.schedule ?? [])" :key="item?.id ?? i" class="tmn-sched">
          <div class="tmn-sched-idx">{{ String(i+1).padStart(2,'0') }}</div>
          <div class="tmn-sched-content">
            <div class="tmn-sched-header">
              <span class="tmn-sched-day">{{ item?.name ?? "" }}</span>
              <span class="tmn-sched-time" v-if="item?.startTime || item?.endTime">
                {{ item?.startTime ? String(item?.startTime).slice(0,5) : '' }}
                {{ item?.startTime && item?.endTime ? '–' : '' }}
                {{ item?.endTime ? String(item?.endTime).slice(0,5) : '' }}
              </span>
            </div>
            <p v-if="item?.description" class="tmn-sched-prog" style="white-space:pre-line">{{ item?.description }}</p>
          </div>
        </div>
      </section>

      <!-- RSVP -->
      <section class="tmn-section">
        <div class="tmn-sec-label">04 — RSVP</div>
        <p class="tmn-rsvp-text" style="white-space:pre-line">{{ letter?.rsvpNote ?? "" }}</p>
        <div class="tmn-contacts">{{ letter?.contacts ?? "" }}</div>
      </section>

      <!-- Gallery: Masonry-style (CSS columns) -->
      <section v-if="doneImages(letter.gallery ?? []).length" class="tmn-section">
        <div class="tmn-sec-label">05 — Gallery</div>
        <div class="tmn-gallery">
          <div
            v-for="img in doneImages(letter.gallery ?? [])"
            :key="img.id"
            class="tmn-gallery-item"
          >
            <img :src="img?.url ?? ''" :alt="img?.caption ?? ''" loading="lazy"/>
            <p v-if="img?.caption" class="tmn-gallery-cap">{{ img?.caption ?? '' }}</p>
          </div>
        </div>
      </section>
    </div>

    <!-- Footer -->
    <footer class="tmn-footer">
      <div class="tmn-rule"/>
      <div class="tmn-footer-content">
        <span class="tmn-closing">{{ letter?.closing ?? "" }}</span>
        <span class="tmn-footer-sig">{{ letter?.host1Name ?? "" }} + {{ letter?.host2Name ?? "" }}</span>
      </div>
    </footer>
  </div>
</template>

<style lang="scss" scoped>
.tmn-root {
  background: #f8f8f8;
  color: #1a1a1a;
  font-family: 'DM Sans', 'Inter', sans-serif;
  font-size: 14px;
  line-height: 1.7;
  padding: 0 0 40px;

  &.tmn-mini { font-size: 12px; }
}

.tmn-accent-bar { height: 4px; background: #1a1a2e; }

.tmn-header { padding: 32px 28px 20px; }
.tmn-label { font-size: 10px; letter-spacing: .28em; text-transform: uppercase; color: #666; margin-bottom: 12px; }
.tmn-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(20px,5vw,32px); font-weight: 300; color: #1a1a2e; line-height: 1.2; margin: 0 0 20px; }
.tmn-rule { height: 1px; background: #1a1a2e; opacity: .12; margin: 16px 0; }
.tmn-names { display: flex; align-items: center; gap: 20px; }
.tmn-name-block { display: flex; flex-direction: column; }
.tmn-name-km { font-size: 15px; font-weight: 700; color: #1a1a2e; }
.tmn-name-en { font-size: 11px; color: #666; margin-top: 1px; }
.tmn-amp { font-size: 18px; color: #1a1a2e; opacity: .3; flex-shrink: 0; }

.tmn-date-band { background: #1a1a2e; color: #fff; padding: 16px 28px; display: flex; flex-direction: column; gap: 2px; }
.tmn-date-main { font-family: 'Battambang',serif; font-size: 15px; font-weight: 600; }
.tmn-date-en { font-size: 11px; opacity: .6; }

.tmn-body { padding: 0 28px; }

.tmn-section { padding: 20px 0; border-bottom: 1px solid rgba(0,0,0,.07); &:last-child { border-bottom: none; } }
.tmn-sec-label { font-size: 10px; letter-spacing: .2em; text-transform: uppercase; color: #999; margin-bottom: 12px; font-weight: 600; }
.tmn-opening { font-size: 13px; opacity: .85; }

.tmn-couple { display: grid; grid-template-columns: 1fr auto 1fr; gap: 14px; align-items: start; }
// .tmn-party { }
.tmn-party-tag { font-size: 9px; letter-spacing: .16em; text-transform: uppercase; color: #999; margin-bottom: 4px; }
.tmn-party-name { font-size: 14px; font-weight: 700; color: #1a1a2e; margin-bottom: 4px; }
.tmn-party-sub { font-size: 11px; color: #555; }
.tmn-party-addr { font-size: 10px; color: #888; margin-top: 3px; line-height: 1.4; }
.tmn-couple-divider { display: flex; flex-direction: column; align-items: center; gap: 4px; padding-top: 20px; }
.tmn-cd-line { flex: 1; width: 1px; background: #ddd; }
.tmn-cd-icon { font-size: 14px; color: #1a1a2e; opacity: .25; }

.tmn-venue-block { padding: 14px; border: 1px solid #e0e0e0; border-radius: 8px; background: #fff; }
.tmn-venue-name { font-size: 14px; font-weight: 700; color: #1a1a2e; margin-bottom: 4px; }
.tmn-venue-addr { font-size: 12px; color: #666; margin-bottom: 10px; }
.tmn-map-btn { font-size: 12px; color: #1a1a2e; text-decoration: none; font-weight: 600; border-bottom: 1px solid #1a1a2e; padding-bottom: 1px; &:hover { opacity: .7; } }

.tmn-sched { display: flex; gap: 14px; padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,.05); &:last-child { border-bottom: none; } }
.tmn-sched-idx { font-size: 11px; font-weight: 700; color: #bbb; min-width: 24px; padding-top: 2px; font-family: monospace; }
.tmn-sched-content { flex: 1; }
.tmn-sched-header { display: flex; align-items: baseline; gap: 12px; margin-bottom: 4px; }
.tmn-sched-day { font-size: 13px; font-weight: 700; color: #1a1a2e; }
.tmn-sched-time { font-size: 11px; color: #888; }
.tmn-sched-prog { font-size: 12px; color: #444; line-height: 1.7; margin: 0; }

.tmn-rsvp-text { font-size: 12.5px; opacity: .85; }
.tmn-contacts { margin-top: 10px; font-weight: 700; font-size: 13px; color: #1a1a2e; }

// Masonry gallery
.tmn-gallery { columns: 3; column-gap: 8px; @media (max-width: 360px) { columns: 2; } }
.tmn-gallery-item { break-inside: avoid; margin-bottom: 8px; border-radius: 6px; overflow: hidden; img { width:100%; display:block; } }
.tmn-gallery-cap { font-size: 10px; color: #555; padding: 3px 6px; background: rgba(248,248,248,.9); }

.tmn-footer { padding: 0 28px 0; }
.tmn-footer-content { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; flex-wrap: wrap; gap: 8px; }
.tmn-closing { font-size: 12px; color: #888; }
.tmn-footer-sig { font-size: 14px; font-weight: 700; color: #1a1a2e; }
</style>
