<script setup>
const props = defineProps(['data', 'mini'])
const letter = computed(() => props.data)
const mini = computed(() => props.mini)
const doneImages = (gallery) => (gallery ?? []).filter(g => g.status === 'done' && g.url)
</script>

<template>
  <div class="tv-root" :class="{ 'tv-mini': mini }">

    <!-- Ornate corner borders (pure CSS) -->
    <div class="tv-corner tv-corner--tl" />
    <div class="tv-corner tv-corner--tr" />
    <div class="tv-corner tv-corner--bl" />
    <div class="tv-corner tv-corner--br" />
    <!-- Inner border frame -->
    <div class="tv-frame">

      <!-- Header flourish -->
      <div class="tv-flourish">❦</div>
      <div class="tv-ornament"><span class="tv-o-line" /><span class="tv-o-text">✦ ✦ ✦</span><span class="tv-o-line" /></div>

      <header class="tv-header">
        <p class="tv-pre">ពិធីអាពាហ៍ពិពាហ៍ / Wedding Invitation</p>
        <h1 class="tv-title">{{ letter?.title ?? "" }}</h1>
        <div class="tv-ornament"><span class="tv-o-line" /><span class="tv-o-text">♦ ♦ ♦</span><span class="tv-o-line" /></div>
        <div class="tv-couple-banner">
          <span>{{ letter?.host1Name ?? "" }}</span>
          <span class="tv-banner-amp">&amp;</span>
          <span>{{ letter?.host2Name ?? "" }}</span>
        </div>
      </header>

      <!-- Opening -->
      <section class="tv-section tv-opening">
        <p style="white-space:pre-line">{{ letter?.opening ?? "" }}</p>
      </section>

      <!-- Horizontal rule with flourish -->
      <div class="tv-hr"><span class="tv-hr-line" /><span class="tv-hr-flr">❧</span><span class="tv-hr-line" /></div>

      <!-- Couple -->
      <section class="tv-couple">
        <div class="tv-party">
          <div class="tv-party-seal"><RImage :src="letter?.host1Avatar ?? ''"  width="120" height="200" errorType="avatar" /></div>
          <div class="tv-party-role">ក្រូម · Groom</div>
          <div class="tv-party-name">{{ letter?.host1Name ?? "" }}</div>
          <div class="tv-party-parents">
            <span>{{ letter?.host1Name1 ?? "" }}</span>
            <span>{{ letter?.host1Name2 ?? "" }}</span>
          </div>
          <div class="tv-party-addr">{{ letter?.host1Address ?? "" }}</div>
        </div>

        <div class="tv-couple-center">
          <div class="tv-wax-seal">♥</div>
        </div>

        <div class="tv-party tv-party--right">
          <div class="tv-party-seal"><RImage :src="letter?.host2Avatar ?? ''" width="120" height="200" errorType="avatar" /></div>
          <div class="tv-party-role">花嫁 · Bride</div>
          <div class="tv-party-name">{{ letter?.host2Name ?? "" }}</div>
          <div class="tv-party-parents">
            <span>{{ letter?.host2Name1 ?? "" }}</span>
            <span>{{ letter?.host2Name2 ?? "" }}</span>
          </div>
          <div class="tv-party-addr">{{ letter?.host2Address ?? "" }}</div>
        </div>
      </section>

      <div class="tv-hr"><span class="tv-hr-line" /><span class="tv-hr-flr">❧</span><span class="tv-hr-line" /></div>

      <!-- Event details -->
      <section class="tv-section tv-event">
        <div class="tv-event-stamp">
          <div class="tv-stamp-label">DATE</div>
          <div class="tv-stamp-value">{{ letter?.eventDate ?? "" }}</div>
        </div>
        <div class="tv-event-venue">
          <div class="tv-venue-name">{{ letter?.venue ?? "" }}</div>
          <div class="tv-venue-addr">{{ letter?.venueAddress ?? "" }}</div>
          <a v-if="letter?.mapUrl" :href="letter?.mapUrl ?? '' " target="_blank" class="tv-map-link">
            ✦ View on Map ✦
          </a>
        </div>
      </section>

      <div class="tv-hr"><span class="tv-hr-line" /><span class="tv-hr-flr">❧</span><span class="tv-hr-line" /></div>

      <!-- Schedule -->
      <section class="tv-section">
        <div class="tv-sec-heading">Programme of Ceremonies</div>
        <div v-for="(item, i) in letter?.schedule ?? []" :key="item?.id ?? i" class="tv-sched-item">
          <div class="tv-sched-roman">{{ ['I','II','III','IV','V','VI'][i] ?? i+1 }}</div>
          <div class="tv-sched-body">
            <div class="tv-sched-day">{{ item?.name ?? "" }}</div>
            <div class="tv-sched-time" v-if="item?.startTime || item?.endTime">
              ◈
              {{ item?.startTime ? String(item?.startTime).slice(0,5) : '' }}
              {{ item?.startTime && item?.endTime ? '–' : '' }}
              {{ item?.endTime ? String(item?.endTime).slice(0,5) : '' }}
            </div>
            <p class="tv-sched-prog" style="white-space:pre-line">{{ item?.description ?? "" }}</p>
          </div>
        </div>
      </section>

      <div class="tv-hr"><span class="tv-hr-line" /><span class="tv-hr-flr">❧</span><span class="tv-hr-line" /></div>

      <!-- RSVP -->
      <section class="tv-section tv-rsvp">
        <div class="tv-sec-heading">R · S · V · P</div>
        <p style="white-space:pre-line;font-size:12.5px">{{ letter?.rsvpNote ?? "" }}</p>
        <div class="tv-contacts">✦ {{ letter?.contacts ?? "" }} ✦</div>
      </section>

      <!-- Gallery: polaroid style -->
      <section v-if="doneImages(letter?.gallery ?? []).length" class="tv-section">
        <div class="tv-sec-heading">Memories · រូបភាព</div>
        <div class="tv-gallery">
          <div
            v-for="(img, idx) in doneImages(letter?.gallery ?? [])"
            :key="img.id"
            class="tv-polaroid"
            :style="{ transform: `rotate(${(idx % 2 === 0 ? 1 : -1) * (1 + (idx % 3))}deg)` }"
          >
            <RImage :src="img?.url ?? ''" :alt="img?.caption ?? ''" loading="lazy" />
            <p class="tv-polaroid-cap">{{ img?.caption ?? '' }}</p>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <div class="tv-hr"><span class="tv-hr-line" /><span class="tv-hr-flr">❧</span><span class="tv-hr-line" /></div>

      <footer class="tv-footer">
        <div class="tv-flourish tv-flourish--sm">❦</div>
        <p class="tv-closing">{{ letter?.closing ?? "" }}</p>
        <p class="tv-sig">{{ letter?.host1Name ?? "" }} · {{ letter?.host2Name ?? "" }}</p>
      </footer>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// ── Root ──────────────────────────────────────────────────────────────────
.tv-root {
  background: #f5ead0;
  color: #3d2b1f;
  font-family: 'Battambang', 'Georgia', serif;
  font-size: 14px;
  line-height: 1.85;
  position: relative;
  padding: 20px;

  &.tv-mini { font-size: 12px; padding: 12px; }
}

// ── Corner ornaments ──────────────────────────────────────────────────────
.tv-corner {
  position: absolute;
  width: 40px;
  height: 40px;
  border-color: #8b6035;
  border-style: solid;
  opacity: 0.45;
  pointer-events: none;

  &--tl { top: 8px; left: 8px;  border-width: 2px 0 0 2px; }
  &--tr { top: 8px; right: 8px; border-width: 2px 2px 0 0; }
  &--bl { bottom: 8px; left: 8px;  border-width: 0 0 2px 2px; }
  &--br { bottom: 8px; right: 8px; border-width: 0 2px 2px 0; }
}

// ── Inner frame ───────────────────────────────────────────────────────────
.tv-frame {
  border: 1px solid rgba(139, 96, 53, 0.3);
  padding: 24px 22px 28px;
}

// ── Flourish ──────────────────────────────────────────────────────────────
.tv-flourish {
  text-align: center;
  font-size: 2rem;
  color: #8b6035;
  opacity: 0.6;
  line-height: 1;
  margin-bottom: 8px;

  &--sm { font-size: 1.2rem; margin: 0 0 8px; }
}

// ── Ornament row ──────────────────────────────────────────────────────────
.tv-ornament {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
  margin: 8px 0;
  opacity: 0.5;
}
.tv-o-line { flex: 1; max-width: 60px; height: 1px; background: #8b6035; }
.tv-o-text { font-size: 10px; color: #8b6035; letter-spacing: 4px; }

// ── Header ────────────────────────────────────────────────────────────────
.tv-header { text-align: center; margin-bottom: 16px; }

.tv-pre {
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #8b6035;
  opacity: 0.8;
  margin-bottom: 10px;
}

.tv-title {
  font-size: clamp(16px, 4vw, 24px);
  font-weight: 700;
  color: #5c3317;
  margin: 8px 0 12px;
  font-style: italic;
}

.tv-couple-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  font-size: 16px;
  font-weight: 700;
  color: #5c3317;
  margin-top: 10px;
}

.tv-banner-amp {
  font-size: 18px;
  color: #8b6035;
  opacity: 0.7;
}

// ── Opening ───────────────────────────────────────────────────────────────
.tv-section { margin-bottom: 16px; }

.tv-opening {
  text-align: center;
  font-size: 12.5px;
  font-style: italic;
  opacity: 0.9;
  padding: 0 8px;
}

// ── HR ────────────────────────────────────────────────────────────────────
.tv-hr {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 14px 0;
  opacity: 0.4;
}
.tv-hr-line { flex: 1; height: 1px; background: #8b6035; }
.tv-hr-flr  { font-size: 14px; color: #8b6035; }

// ── Couple ────────────────────────────────────────────────────────────────
.tv-couple {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 12px;
  padding: 12px 0;
  align-items: start;
}

.tv-party { text-align: center; &--right { text-align: center; } }

.tv-party-seal {
  width: 70px; height:100px;
  border-radius: 10px;
  border: 1.5px solid #8b6035;
  margin: 0 auto 6px;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #8b6035;
  opacity: 0.7;
}

.tv-party-role { font-size: 9px; letter-spacing: 0.16em; text-transform: uppercase; color: #8b6035; opacity: 0.7; margin-bottom: 3px; }
.tv-party-name { font-size: 14px; font-weight: 700; color: #5c3317; }
.tv-party-en   { font-size: 11px; font-style: italic; opacity: 0.6; }
.tv-party-parents { display: flex; flex-direction: column; font-size: 10.5px; opacity: 0.75; margin-top: 4px; gap: 1px; }
.tv-party-addr { font-size: 10px; opacity: 0.55; margin-top: 3px; line-height: 1.4; }

.tv-couple-center { display: flex; align-items: center; justify-content: center; padding-top: 22px; }

.tv-wax-seal {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #c0392b, #7b1e0e);
  color: #f5ead0;
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.25);
}

// ── Event ─────────────────────────────────────────────────────────────────
.tv-event {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}

.tv-event-stamp {
  border: 1.5px solid rgba(139,96,53,0.35);
  padding: 12px 20px;
  border-radius: 4px;
  min-width: 200px;
}

.tv-stamp-label {
  font-size: 9px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: #8b6035;
  opacity: 0.6;
  margin-bottom: 4px;
}

.tv-stamp-value { font-size: 14px; font-weight: 700; color: #5c3317; }
.tv-stamp-en    { font-size: 10.5px; font-style: italic; opacity: 0.55; margin-top: 2px; }

.tv-event-venue { text-align: center; }
.tv-venue-name  { font-size: 14px; font-weight: 700; color: #5c3317; margin-bottom: 4px; }
.tv-venue-addr  { font-size: 12px; opacity: 0.7; margin-bottom: 8px; }
.tv-map-link    { font-size: 11px; color: #8b6035; text-decoration: none; letter-spacing: 0.08em; opacity: 0.8; &:hover { opacity: 1; } }

// ── Section heading ───────────────────────────────────────────────────────
.tv-sec-heading {
  text-align: center;
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #8b6035;
  font-weight: 700;
  margin-bottom: 14px;
  opacity: 0.85;
}

// ── Schedule ──────────────────────────────────────────────────────────────
.tv-sched-item {
  display: flex;
  gap: 12px;
  padding: 10px;
  border: 1px solid rgba(139,96,53,0.15);
  border-radius: 6px;
  margin-bottom: 8px;
  background: rgba(255,255,255,0.3);
}

.tv-sched-roman {
  font-size: 11px;
  font-weight: 700;
  color: #8b6035;
  opacity: 0.65;
  width: 20px;
  flex-shrink: 0;
  padding-top: 2px;
  font-style: italic;
}

.tv-sched-day  { font-size: 13px; font-weight: 700; color: #5c3317; }
.tv-sched-time { font-size: 11px; opacity: 0.6; }
.tv-sched-prog { font-size: 12px; line-height: 1.7; opacity: 0.82; margin: 4px 0 0; font-style: italic; }

// ── RSVP ─────────────────────────────────────────────────────────────────
.tv-rsvp { text-align: center; font-size: 12.5px; }
.tv-contacts { margin-top: 10px; font-weight: 700; color: #8b6035; font-size: 13px; letter-spacing: 0.08em; }

// ── Gallery — polaroid ────────────────────────────────────────────────────
.tv-gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  padding: 8px 0;
}

.tv-polaroid {
  background: #fff;
  padding: 6px 6px 28px;
  box-shadow: 2px 3px 10px rgba(0,0,0,0.18);
  flex: 0 0 auto;
  width: 110px;
  transition: transform 0.2s;

  &:hover { transform: rotate(0deg) scale(1.05) !important; }

  img { width: 100%; aspect-ratio: 1; object-fit: cover; display: block; }
}

.tv-polaroid-cap {
  text-align: center;
  font-size: 10px;
  color: #8b6035;
  margin: 5px 0 0;
  font-style: italic;
  line-height: 1.3;
}

// ── Footer ────────────────────────────────────────────────────────────────
.tv-footer { text-align: center; padding-top: 8px; }
.tv-closing { font-size: 12.5px; font-style: italic; opacity: 0.7; margin-bottom: 8px; }
.tv-sig { font-size: 15px; font-weight: 700; color: #5c3317; letter-spacing: 0.06em; }
</style>
