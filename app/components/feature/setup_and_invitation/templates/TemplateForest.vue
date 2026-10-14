<script setup>
// components/letter/templates/TemplateForest.vue
// Earthy forest green — garden / outdoor ceremony
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
  <div class="tf-root" :class="{ 'tf-mini': mini }">

    <!-- Leaf header -->
    <div class="tf-leaf-header">
      <div class="tf-leaf-row">🌿 🍃 🌱 🍃 🌿</div>
    </div>

    <!-- Header -->
    <header class="tf-header">
      <div class="tf-badge">Garden Wedding</div>
      <h1 class="tf-title">{{ letter?.title ?? ""}}</h1>
      <div class="tf-ornament">
        <span class="tf-orn-leaf">🌿</span>
        <span class="tf-orn-line"/>
        <span class="tf-heart">♡</span>
        <span class="tf-orn-line"/>
        <span class="tf-orn-leaf">🌿</span>
      </div>
      <div class="tf-names">
        <span>{{ letter?.host1Name ?? "" }}</span>
        <span class="tf-amp">&</span>
        <span>{{ letter?.host2Name ?? "" }}</span>
      </div>
    </header>

    <!-- Opening -->
    <section class="tf-opening">
      <p style="white-space:pre-line">{{ letter?.opening ?? "" }}</p>
    </section>

    <!-- Couple -->
    <section class="tf-couple">
      <div class="tf-party">
        <div class="tf-party-icon">🌱</div>
        <div class="tf-party-role">ក្រូម / Groom</div>
        <div class="tf-party-name">{{ letter?.host1Name ?? "" }}</div>
        <div class="tf-party-parents">{{ letter?.host1Name1 ?? "" }}<br/>{{ letter?.host1Name2 ?? "" }}</div>
        <div class="tf-party-addr">{{ letter?.host1Address ?? "" }}</div>
      </div>
      <div class="tf-couple-center">
        <div class="tf-tree">🌳</div>
      </div>
      <div class="tf-party">
        <div class="tf-party-icon">🌸</div>
        <div class="tf-party-role">花嫁 / Bride</div>
        <div class="tf-party-name">{{ letter?.host2Name ?? "" }}</div>
        <div class="tf-party-parents">{{ letter?.host2Name1 ?? "" }}<br/>{{ letter?.host2Name2 ?? "" }}</div>
        <div class="tf-party-addr">{{ letter?.host2Address ?? "" }}</div>
      </div>
    </section>

    <!-- Event -->
    <section class="tf-section">
      <div class="tf-event-card">
        <div class="tf-event-icon">📅</div>
        <div class="tf-event-date">{{ letter?.weddingDate ?? "" }}</div>
        <div class="tf-event-en">{{ fmtDate(letter?.eventDate ?? "") }}</div>
        <div class="tf-h-rule"><span class="tf-leaf-sm">🍃</span></div>
        <div class="tf-venue-name">🏡 {{ letter?.venue ?? "" }}</div>
        <div class="tf-venue-addr">{{ letter?.venueAddress ?? "" }}</div>
        <a v-if="letter?.mapUrl" :href="letter?.mapUrl ?? ''" target="_blank" class="tf-map-btn">
          📍 View Map
        </a>
      </div>
    </section>

    <!-- Schedule -->
    <section class="tf-section">
      <div class="tf-sec-heading">🌿 កម្មវិធីពិធីការ / Schedule</div>
      <div v-for="(item,i) in (letter?.schedule ?? [])" :key="item?.id ?? i" class="tf-sched-item">
        <div class="tf-sched-left">
          <div class="tf-sched-badge">{{ i+1 }}</div>
          <div class="tf-sched-connector"/>
        </div>
        <div class="tf-sched-body">
          <div class="tf-sched-day">{{ item?.name ?? "" }}</div>
          <div class="tf-sched-time" v-if="item?.startTime || item?.endTime">
            ⏱
            {{ item?.startTime ? String(item?.startTime).slice(0,5) : '' }}
            {{ item?.startTime && item?.endTime ? '–' : '' }}
            {{ item?.endTime ? String(item?.endTime).slice(0,5) : '' }}
          </div>
          <p v-if="item?.description" class="tf-sched-prog" style="white-space:pre-line">{{ item?.description }}</p>
        </div>
      </div>
    </section>

    <!-- RSVP -->
    <section class="tf-section tf-rsvp">
      <div class="tf-sec-heading">🌿 ការបញ្ជាក់ / RSVP</div>
      <p style="white-space:pre-line;font-size:12.5px">{{ letter?.rsvpNote ?? "" }}</p>
      <div class="tf-contacts">📞 {{ letter?.contacts ?? "" }}</div>
    </section>

    <!-- Gallery -->
    <section v-if="doneImages(letter?.gallery ?? []).length" class="tf-section">
      <div class="tf-sec-heading">📸 រូបភាព / Gallery</div>
      <div class="tf-gallery">
        <div v-for="img in doneImages(letter?.gallery ?? [])" :key="img.id" class="tf-gallery-item">
          <img :src="img?.url ?? ''" :alt="img?.caption ?? ''" loading="lazy"/>
          <p v-if="img?.caption" class="tf-gallery-cap">{{ img?.caption ?? "" }}</p>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="tf-footer">
      <div class="tf-leaf-row tf-leaf-row--sm">🌿 🍃 🌿</div>
      <p class="tf-closing">{{ letter?.closing ?? "" }}</p>
      <p class="tf-sig">{{ letter?.host1Name ?? "" }} 🌿 {{ letter?.host2Name ?? "" }}</p>
    </footer>
  </div>
</template>

<style lang="scss" scoped>
.tf-root {
  background: #f0f7f4;
  color: #1b3a1e;
  font-family: 'Battambang','NotoSansKhmer', serif;
  font-size: 14px;
  line-height: 1.8;
  padding: 0 0 40px;

  &.tf-mini { font-size: 12px; }
}

.tf-leaf-header { background: linear-gradient(135deg,#2e7d32,#388e3c); padding: 12px; text-align: center; font-size: 1.2rem; }
.tf-leaf-row { display: flex; justify-content: center; gap: 8px; }
.tf-leaf-row--sm { font-size: 1rem; gap: 6px; margin-bottom: 8px; }

.tf-header { text-align: center; padding: 24px 20px 14px; }
.tf-badge { display: inline-block; padding: 4px 14px; border: 1.5px solid #2e7d32; border-radius: 999px; font-size: 10px; letter-spacing: .18em; text-transform: uppercase; color: #2e7d32; font-weight: 600; margin-bottom: 12px; }
.tf-title { font-size: clamp(17px,4vw,24px); font-weight: 700; color: #1b5e20; margin: 0 0 14px; }
.tf-names { font-size: 16px; font-weight: 700; color: #2e7d32; }
.tf-amp { margin: 0 10px; color: #66bb6a; }

.tf-ornament { display: flex; align-items: center; gap: 8px; justify-content: center; margin: 10px 0; }
.tf-orn-line { flex: 1; max-width: 60px; height: 1px; background: #66bb6a; opacity: .5; }
.tf-orn-leaf { font-size: 14px; }
.tf-heart { color: #2e7d32; font-size: 14px; opacity: .7; }

.tf-opening { text-align: center; font-size: 13px; padding: 0 24px 16px; opacity: .9; }

.tf-couple { display: grid; grid-template-columns: 1fr auto 1fr; gap: 12px; padding: 16px 20px; background: rgba(46,125,50,.05); border-top: 1px solid rgba(46,125,50,.15); border-bottom: 1px solid rgba(46,125,50,.15); }
.tf-party { text-align: center; }
.tf-party-icon { font-size: 1.5rem; margin-bottom: 4px; }
.tf-party-role { font-size: 10px; text-transform: uppercase; letter-spacing: .12em; color: #2e7d32; opacity: .7; }
.tf-party-name { font-size: 15px; font-weight: 700; color: #1b5e20; }
.tf-party-en { font-size: 11px; opacity: .6; }
.tf-party-parents { font-size: 11px; opacity: .75; margin-top: 4px; }
.tf-party-addr { font-size: 10px; opacity: .55; margin-top: 3px; line-height: 1.4; }
.tf-couple-center { display: flex; align-items: center; justify-content: center; }
.tf-tree { font-size: 2rem; }

.tf-section { padding: 0 20px 16px; }

.tf-event-card { background: rgba(255,255,255,.7); border: 1px solid rgba(46,125,50,.2); border-radius: 12px; padding: 18px; text-align: center; }
.tf-event-icon { font-size: 1.5rem; margin-bottom: 6px; }
.tf-event-date { font-size: 15px; font-weight: 700; color: #1b5e20; }
.tf-event-en { font-size: 11px; opacity: .6; margin-bottom: 12px; }
.tf-h-rule { display: flex; align-items: center; justify-content: center; margin: 8px 0; }
.tf-leaf-sm { font-size: 16px; }
.tf-venue-name { font-size: 14px; font-weight: 600; }
.tf-venue-addr { font-size: 12px; opacity: .7; margin-bottom: 10px; }
.tf-map-btn { display: inline-block; padding: 5px 14px; border: 1px solid rgba(46,125,50,.35); border-radius: 999px; font-size: 12px; color: #2e7d32; text-decoration: none; background: rgba(46,125,50,.07); }

.tf-sec-heading { font-size: 13px; font-weight: 700; color: #2e7d32; margin-bottom: 12px; display: flex; align-items: center; gap: 6px; }

// Timeline schedule
.tf-sched-item { display: flex; gap: 10px; margin-bottom: 4px; }
.tf-sched-left { display: flex; flex-direction: column; align-items: center; }
.tf-sched-badge { width: 24px; height: 24px; border-radius: 50%; background: rgba(46,125,50,.15); color: #2e7d32; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.tf-sched-connector { flex: 1; width: 1px; background: rgba(46,125,50,.2); margin: 3px 0; }
.tf-sched-body { flex: 1; padding-bottom: 14px; border-left: none; }
.tf-sched-day { font-size: 13px; font-weight: 700; color: #1b5e20; }
.tf-sched-time { font-size: 11px; opacity: .65; }
.tf-sched-prog { font-size: 12px; line-height: 1.7; opacity: .85; margin: 4px 0 0; }

.tf-rsvp { font-size: 12.5px; }
.tf-contacts { margin-top: 8px; font-weight: 700; color: #2e7d32; font-size: 13px; }

.tf-gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px,1fr)); gap: 8px; }
.tf-gallery-item { border-radius: 10px; overflow: hidden; border: 2px solid rgba(46,125,50,.2); img { width:100%; aspect-ratio:1; object-fit:cover; display:block; } }
.tf-gallery-cap { font-size: 10px; text-align:center; color: #1b5e20; padding: 3px; background: rgba(240,247,244,.9); }

.tf-footer { text-align: center; padding: 16px 20px 0; }
.tf-closing { font-size: 13px; opacity: .7; margin-bottom: 10px; }
.tf-sig { font-size: 16px; font-weight: 700; color: #1b5e20; }
</style>
