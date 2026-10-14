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
  <div class="trg-root" :class="{ 'trg-mini': mini }">

    <!-- Gold top bar -->
    <div class="trg-topbar">
      <div class="trg-topbar-inner">
        <span class="trg-crown">👑</span>
        <span class="trg-topbar-text">Royal Wedding</span>
        <span class="trg-crown">👑</span>
      </div>
    </div>

    <!-- Header -->
    <header class="trg-header">
      <div class="trg-ornament">
        <span class="trg-orn-line"/><span class="trg-orn-gem">◆</span><span class="trg-orn-line"/>
      </div>
      <p class="trg-pre">ពិធីមង្គលការ / Royal Wedding Invitation</p>
      <h1 class="trg-title">{{ letter?.title ?? "" }}</h1>
      <div class="trg-ornament">
        <span class="trg-orn-line"/><span class="trg-orn-gem">◆</span><span class="trg-orn-line"/>
      </div>
      <div class="trg-couple-names">
        <span>{{ letter?.host1Name ?? "" }}</span>
        <span class="trg-amp">♛</span>
        <span>{{ letter?.host2Name ?? "" }}</span>
      </div>
    </header>

    <!-- Opening -->
    <section class="trg-section trg-opening">
      <p style="white-space:pre-line">{{ letter?.opening ?? "" }}</p>
    </section>

    <!-- Couple -->
    <section class="trg-couple">
      <div class="trg-party">
        <div class="trg-party-crest">🏅</div>
        <div class="trg-party-role">ក្រូម / Groom</div>
        <div class="trg-party-name">{{ letter?.host1Name ?? "" }}</div>
        <div class="trg-party-parents">{{ letter?.host1Name1 ?? "" }}<br/>{{ letter?.host1Name2 ?? "" }}</div>
        <div class="trg-party-addr">{{ letter?.host1Address ?? "" }}</div>
      </div>
      <div class="trg-divider-vertical">
        <span class="trg-dv-gem">◆</span>
        <span class="trg-dv-line"/>
        <span class="trg-dv-heart">♥</span>
        <span class="trg-dv-line"/>
        <span class="trg-dv-gem">◆</span>
      </div>
      <div class="trg-party">
        <div class="trg-party-crest">🏅</div>
        <div class="trg-party-role">花嫁 / Bride</div>
        <div class="trg-party-name">{{ letter?.host2Name ?? "" }}</div>
        <div class="trg-party-parents">{{ letter?.host2Name1 ?? "" }}<br/>{{ letter?.host2Name2 ?? "" }}</div>
        <div class="trg-party-addr">{{ letter?.host2Address ?? "" }}</div>
      </div>
    </section>

    <!-- Event box -->
    <section class="trg-event">
      <div class="trg-event-box">
        <div class="trg-event-label">📅 {{ letter?.weddingDate ?? "" }}</div>
        <div class="trg-event-en">{{ fmtDate(letter?.eventDate ?? "") }}</div>
        <div class="trg-ornament" style="margin:10px 0"><span class="trg-orn-line"/><span class="trg-orn-gem" style="font-size:8px">◆</span><span class="trg-orn-line"/></div>
        <div class="trg-venue">🏛️ {{ letter?.venue ?? "" }}</div>
        <div class="trg-venue-addr">{{ letter?.venueAddress ?? "" }}</div>
        <a v-if="letter?.mapUrl" :href="letter?.mapUrl ?? ''" target="_blank" class="trg-map-btn">📍 View Map</a>
      </div>
    </section>

    <!-- Schedule -->
    <section class="trg-section">
      <div class="trg-sec-title">
        <span class="trg-orn-line"/><span>◆ កម្មវិធីពិធីការ ◆</span><span class="trg-orn-line"/>
      </div>
      <div v-for="(item,i) in (letter?.schedule ?? [])" :key="item?.id ?? i" class="trg-sched">
        <div class="trg-sched-num">{{ i+1 }}</div>
        <div class="trg-sched-body">
          <div class="trg-sched-day">{{ item?.name ?? "" }}</div>
          <div class="trg-sched-time" v-if="item?.startTime || item?.endTime">
            ⏱
            {{ item?.startTime ? String(item?.startTime).slice(0,5) : '' }}
            {{ item?.startTime && item?.endTime ? '–' : '' }}
            {{ item?.endTime ? String(item?.endTime).slice(0,5) : '' }}
          </div>
          <p v-if="item?.description" class="trg-sched-prog" style="white-space:pre-line">{{ item?.description }}</p>
        </div>
      </div>
    </section>

    <!-- RSVP -->
    <section class="trg-section">
      <div class="trg-sec-title">
        <span class="trg-orn-line"/><span>◆ ការបញ្ជាក់ ◆</span><span class="trg-orn-line"/>
      </div>
      <p style="white-space:pre-line;font-size:12.5px">{{ letter?.rsvpNote ?? "" }}</p>
      <div class="trg-contacts">📞 {{ letter?.contacts ?? "" }}</div>
    </section>

    <!-- Gallery -->
    <section v-if="doneImages(letter?.gallery ?? []).length" class="trg-section">
      <div class="trg-sec-title">
        <span class="trg-orn-line"/><span>◆ រូបភាព ◆</span><span class="trg-orn-line"/>
      </div>
      <div class="trg-gallery">
        <div v-for="img in doneImages(letter?.gallery ?? [])" :key="img.id" class="trg-gallery-item">
          <RImage :src="img?.url ?? ''" :alt="img?.caption ?? ''" loading="lazy" />
          <p v-if="img?.caption" class="trg-gallery-cap">{{ img?.caption ?? "" }}</p>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="trg-footer">
      <div class="trg-ornament"><span class="trg-orn-line"/><span class="trg-orn-gem">◆</span><span class="trg-orn-line"/></div>
      <p class="trg-closing">{{ letter?.closing ?? "" }}</p>
      <p class="trg-sig">{{ letter?.host1Name ?? "" }} ♥ {{ letter?.host2Name ?? "" }}</p>
      <div class="trg-bottom-bar"/>
    </footer>
  </div>
</template>

<style lang="scss" scoped>
.trg-root {
  background: #1a0a2e;
  color: #f0e6c8;
  font-family: 'Battambang','NotoSansKhmer', serif;
  font-size: 14px;
  line-height: 1.8;
  padding: 0 0 40px;

  &.trg-mini { font-size: 12px; }
}

.trg-topbar {
  background: linear-gradient(90deg, #0d0520, #2a0f50, #0d0520);
  padding: 12px 20px;
  text-align: center;
  border-bottom: 2px solid #d4af37;
}
.trg-topbar-inner { display: flex; align-items: center; justify-content: center; gap: 10px; }
.trg-crown { font-size: 1.1rem; }
.trg-topbar-text { font-size: 11px; letter-spacing: .3em; text-transform: uppercase; color: #d4af37; font-weight: 600; }

.trg-header { text-align: center; padding: 28px 24px 16px; }
.trg-pre { font-size: 10px; letter-spacing: .2em; text-transform: uppercase; color: #d4af37; opacity: .8; margin-bottom: 10px; }
.trg-title { font-size: clamp(18px,4vw,26px); font-weight: 700; color: #d4af37; margin: 10px 0; text-shadow: 0 0 20px rgba(212,175,55,.4); }
.trg-couple-names { display: flex; align-items: center; justify-content: center; gap: 14px; font-size: 16px; font-weight: 700; color: #f0e6c8; margin-top: 10px; }
.trg-amp { color: #d4af37; font-size: 18px; }

.trg-ornament { display: flex; align-items: center; gap: 8px; justify-content: center; margin: 10px 0; opacity: .6; }
.trg-orn-line { flex: 1; max-width: 80px; height: 1px; background: #d4af37; }
.trg-orn-gem { font-size: 10px; color: #d4af37; }

.trg-section { padding: 0 20px 18px; }
.trg-opening { text-align: center; font-size: 13px; opacity: .85; padding: 0 24px 16px; }

.trg-couple { display: grid; grid-template-columns: 1fr auto 1fr; gap: 12px; padding: 18px 20px; border-top: 1px solid rgba(212,175,55,.2); border-bottom: 1px solid rgba(212,175,55,.2); background: rgba(212,175,55,.04); }
.trg-party { text-align: center; }
.trg-party-crest { font-size: 1.3rem; margin-bottom: 6px; }
.trg-party-role { font-size: 10px; text-transform: uppercase; letter-spacing: .12em; color: #d4af37; opacity: .7; }
.trg-party-name { font-size: 15px; font-weight: 700; color: #d4af37; }
.trg-party-en { font-size: 11px; opacity: .6; }
.trg-party-parents { font-size: 11px; opacity: .7; margin-top: 4px; }
.trg-party-addr { font-size: 10px; opacity: .5; margin-top: 3px; line-height: 1.4; }

.trg-divider-vertical { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 16px 4px; }
.trg-dv-gem { font-size: 9px; color: #d4af37; }
.trg-dv-line { flex: 1; width: 1px; background: rgba(212,175,55,.3); }
.trg-dv-heart { font-size: 16px; color: #d4af37; }

.trg-event { padding: 18px 20px; }
.trg-event-box { border: 1px solid rgba(212,175,55,.3); border-radius: 12px; padding: 18px; text-align: center; background: rgba(212,175,55,.05); }
.trg-event-label { font-size: 15px; font-weight: 700; color: #d4af37; margin-bottom: 4px; }
.trg-event-en { font-size: 11px; opacity: .55; margin-bottom: 10px; }
.trg-venue { font-size: 14px; font-weight: 600; color: #f0e6c8; }
.trg-venue-addr { font-size: 12px; opacity: .6; margin-bottom: 10px; }
.trg-map-btn { display: inline-block; padding: 5px 14px; border: 1px solid rgba(212,175,55,.4); border-radius: 999px; font-size: 12px; color: #d4af37; text-decoration: none; background: rgba(212,175,55,.08); }

.trg-sec-title { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; letter-spacing: .1em; color: #d4af37; margin-bottom: 14px; }

.trg-sched { display: flex; gap: 10px; padding: 10px 12px; border: 1px solid rgba(212,175,55,.15); border-radius: 10px; margin-bottom: 8px; background: rgba(212,175,55,.04); }
.trg-sched-num { width: 22px; height: 22px; border-radius: 50%; background: rgba(212,175,55,.15); color: #d4af37; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.trg-sched-day { font-size: 13px; font-weight: 700; color: #d4af37; }
.trg-sched-time { font-size: 11px; opacity: .6; }
.trg-sched-prog { font-size: 12px; line-height: 1.7; opacity: .8; margin: 4px 0 0; }

.trg-contacts { margin-top: 10px; font-weight: 700; color: #d4af37; font-size: 13px; }

.trg-gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px,1fr)); gap: 8px; }
.trg-gallery-item { border-radius: 8px; overflow: hidden; border: 1px solid rgba(212,175,55,.25); img { width:100%; aspect-ratio:1; object-fit:cover; display:block; } }
.trg-gallery-cap { font-size: 10px; text-align:center; color: #d4af37; padding: 3px; background: rgba(26,10,46,.8); }

.trg-footer { text-align: center; padding: 16px 20px 0; }
.trg-closing { font-size: 13px; opacity: .7; margin-bottom: 10px; }
.trg-sig { font-size: 16px; font-weight: 700; color: #d4af37; }
.trg-bottom-bar { height: 3px; background: linear-gradient(90deg, transparent, #d4af37, transparent); margin-top: 20px; }
</style>
