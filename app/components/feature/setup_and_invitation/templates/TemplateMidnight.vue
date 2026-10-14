<script setup>
const props = defineProps(['data', 'mini'])
const data = computed(() => props.data)
const mini = computed(() => props.mini)

  // console.log("Data prop -----------------------------------> ", data.value)
  const player = ref(null)

onMounted(() => {
  const script = document.createElement('script')
  script.src = 'https://www.youtube.com/iframe_api'
  document.head.appendChild(script)

  window.onYouTubeIframeAPIReady = () => {
    player.value = new YT.Player('yt-player', {
      videoId: data.value?.youtubeEmbedId?.value,
      playerVars: {
        autoplay: 1,
        controls: 0,
        loop: 1,
        playlist: data.value?.youtubeEmbedId?.value
      },
      events: {
        onReady: (e) => {
          if (data.value?.musicPlaying?.value) {
            e.target.unMute()
            e.target.playVideo()
          } else {
            e.target.mute()
            e.target.playVideo()
          }
        }
      }
    })
  }
})

function toggleMusic() {
  data.value.musicPlaying.value = !data.value.musicPlaying.value

  if (!player.value) return

  if (data.value.musicPlaying.value) {
    player.value.unMute()
    player.value.playVideo()
  } else {
    player.value.mute()
  }
}

const fmtDate = (iso) => {
  if (!iso) return ''
  try { return new Intl.DateTimeFormat('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' }).format(new Date(iso)) }
  catch { return iso }
}

// const doneImages = (gallery) => gallery?.filter(g => g.status === 'done' && g.url)
const doneImages = (gallery) => (gallery ?? []).filter(g => g.status === 'done' && g.url)
// mounted(() => {
//   console.log("Data prop -----------------------------------> ", data.value)
// })
</script>

<template>
    <!-- YouTube Music Player -->
   <div v-if="data?.youtubeEmbedId?.value">
    <div id="yt-player" style="display:none"></div>

    <button class="music-btn" @click="toggleMusic">
      <i :class="data?.musicPlaying?.value ? 'ri-volume-up-line' : 'ri-volume-mute-line'" />
    </button>
  </div>

  <div class="tm-root" :class="{ 'tm-mini': mini }">
    <!-- Stars header -->
    <div class="tm-stars-header">
      <div class="tm-stars">
        <span v-for="n in 20" :key="n" class="tm-star" :style="{ left: (n*4.8)+'%', animationDelay: (n*0.15)+'s', top: Math.sin(n)*30+35+'%' }">✦</span>
      </div>
      <div class="tm-planet">🌙</div>
    </div>

    <!-- Header -->
    <header class="tm-header">
      <p class="tm-pre">✦ ពិធីមង្គលការ / Celestial Wedding ✦</p>
      <h1 class="tm-title">{{ data?.title ??  "..." }}</h1>
      <div class="tm-names">
        <span class="tm-name">{{ data?.host1Name ??  "..." }}</span>
        <span class="tm-amp">✦</span>
        <span class="tm-name">{{ data?.host2Name ??  "..." }}</span>
      </div>
      <div class="tm-glow-line"/>
    </header>

    <!-- Opening -->
    <section class="tm-opening">
      <p style="white-space:pre-line">{{ data?.opening ?? "..." }}</p>
    </section>

    <!-- Couple -->
    <section class="tm-couple">
      <div class="tm-party">
        <div class="tm-party-orb tm-party-orb--blue">🌠</div>
        <div class="tm-party-role">ក្រូម / Groom</div>
        <div class="tm-party-name">{{ data?.host1Name ?? "..." }}</div>
        <div class="tm-party-parents">{{ data?.host1Name1 ?? "..." }}<br/>{{ data?.host1Name2 ?? "..." }}</div>
        <div class="tm-party-addr">{{ data?.host1Address ?? "..." }}</div>
      </div>
      <div class="tm-orbit">
        <div class="tm-orbit-ring"/>
        <div class="tm-orbit-heart">💫</div>
      </div>
      <div class="tm-party">
        <div class="tm-party-orb tm-party-orb--purple">🌠</div>
        <div class="tm-party-role">花嫁 / Bride</div>
        <div class="tm-party-name">{{ data?.host2Name ?? "..." }}</div>
        <div class="tm-party-parents">{{ data?.host2Name1 ?? "..." }}<br/>{{ data?.host2Name2 ?? "..." }}</div>
        <div class="tm-party-addr">{{ data?.host2Address ?? "..." }}</div>
      </div>
    </section>

    <!-- Invite to -->
    <RTemplateInvitedTo :inviteTo="data.inviteTo"/>
    <section class="tm-section">
      <div class="tm-sec-title">✦ {{ tBy({en:'Honored to Invite', km:'គោរពជូនចំពោះ'}) }} ✦</div>
      <p style="white-space:pre-line" v-html="data?.inviteTo ?? '...'"/>
    </section>

    <!-- Event -->
    <section class="tm-section">
      <div class="tm-event-box">
        <div class="tm-event-icon">🌌</div>
        <div class="tm-event-date">{{ data?.weddingDate ?? "..." }}</div>
        <div class="tm-event-en">{{ fmtDate(data?.eventDate ?? "...") }}</div>
        <div class="tm-glow-line tm-glow-line--sm"/>
        <div class="tm-venue">🏛️ {{ data?.venue ?? "..." }}</div>
        <div class="tm-venue-addr">{{ data?.venueAddress ?? "..." }}</div>
        <a v-if="data?.mapUrl" :href="data?.mapUrl ?? '' " target="_blank" class="tm-map-btn">📍 View Map</a>
      </div>
    </section>

    <!-- Schedule -->
    <section class="tm-section">
      <div class="tm-sec-title">✦ កម្មវិធីពិធីការ ✦</div>
      <div v-for="(item,i) in data?.schedule ?? []" :key="item?.id ?? i" class="tm-sched  text-left flex justify-start">
        <div class="tm-sched-num">{{ i+1 }}</div>
        <div class="tm-sched-body">
          <div class="tm-sched-day">{{ item?.name ?? "..." }}</div>
          <div class="tm-sched-time" v-if="item?.startTime || item?.endTime">
            ⏱
            {{ item?.startTime ? String(item?.startTime).slice(0,5) : '' }}
            {{ item?.startTime && item?.endTime ? '–' : '' }}
            {{ item?.endTime ? String(item?.endTime).slice(0,5) : '' }}
          </div>
          <p class="tm-sched-prog" style="white-space:pre-line">{{ item?.description ?? "..." }}</p>
        </div>
      </div>
    </section>

    <!-- RSVP -->
    <section class="tm-section">
      <div class="tm-sec-title">✦ ការបញ្ជាក់ / RSVP ✦</div>
      <p style="white-space:pre-line;font-size:12.5px">{{ data?.rsvpNote ?? "..." }}</p>
      <div class="tm-contacts">📞 {{ data?.contacts ?? "..." }}</div>
    </section>

    <!-- Gallery -->
    <section v-if="doneImages(data?.gallery).length" class="tm-section">
      <div class="tm-sec-title">✦ រូបភាព / Gallery ✦</div>
      <div class="tm-gallery">
        <div v-for="img in doneImages(data?.gallery) ?? []" :key="img.id" class="tm-gallery-item">
          <RImage :src="img?.url ?? ''" :alt="img?.caption ?? ''" loading="lazy"/>
          <p v-if="img?.caption" class="tm-gallery-cap">{{ img?.caption ?? "..." }}</p>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="tm-footer">
      <div class="tm-glow-line tm-glow-line--sm"/>
      <p class="tm-closing">{{ data?.closing ?? "..." }}</p>
      <p class="tm-sig">{{ data?.host1Name ?? "..." }} ✦ {{ data?.host2Name ?? "..." }}</p>
      <div class="tm-bottom-stars">✦ ✦ ✦</div>
    </footer>
  </div>
</template>

<style lang="scss" scoped>
.tm-root {
  background: radial-gradient(ellipse at top, #160a2e 0%, #0d0d1a 60%);
  color: #e8e0ff;
  font-family: 'Battambang','NotoSansKhmer', serif;
  font-size: 14px;
  line-height: 1.8;
  padding: 0 0 40px;
  width: 100%;
  margin: 0 auto;
  min-height: 100dvh;

  &.tm-mini { font-size: 12px; }
}

.tm-stars-header { position: relative; height: 80px; overflow: hidden; background: linear-gradient(180deg,#0d0520,transparent); }
.tm-stars { position: absolute; inset: 0; }
.tm-star { position: absolute; font-size: 8px; color: #7c4dff; opacity: 0.7; animation: twinkle 2s ease-in-out infinite alternate; }
@keyframes twinkle { 0% { opacity:.3; transform: scale(.7); } 100% { opacity:1; transform: scale(1.2); } }
.tm-planet { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); font-size: 2.5rem; filter: drop-shadow(0 0 20px rgba(124,77,255,.8)); }

.tm-header { text-align: center; padding: 20px 24px 16px; }
.tm-pre { font-size: 10px; letter-spacing: .2em; text-transform: uppercase; color: #7c4dff; opacity: .9; margin-bottom: 10px; }
.tm-title { font-size: clamp(17px,4vw,24px); font-weight: 700; color: #b39ddb; margin: 8px 0 14px; text-shadow: 0 0 30px rgba(124,77,255,.6); }
.tm-names { display: flex; align-items: center; justify-content: center; gap: 14px; font-size: 16px; font-weight: 700; color: #e8e0ff; margin-bottom: 14px; }
.tm-amp { color: #7c4dff; font-size: 14px; }
.tm-name { color: #b39ddb; }
.tm-glow-line { height: 1px; background: linear-gradient(90deg,transparent,#7c4dff,transparent); margin: 8px auto; max-width: 80%; &--sm { max-width: 60%; } }

.tm-opening { text-align: center; font-size: 13px; padding: 0 24px 16px; opacity: .85; }

.tm-couple { display: grid; grid-template-columns: 1fr auto 1fr; gap: 12px; padding: 16px 20px; border-top: 1px solid rgba(124,77,255,.2); border-bottom: 1px solid rgba(124,77,255,.2); background: rgba(124,77,255,.04); }
.tm-party { text-align: center; }
.tm-party-orb { font-size: 1.5rem; margin-bottom: 6px; &--blue { filter: hue-rotate(220deg) drop-shadow(0 0 8px rgba(96,165,250,.6)); } &--purple { filter: drop-shadow(0 0 8px rgba(124,77,255,.6)); } }
.tm-party-role { font-size: 10px; text-transform: uppercase; letter-spacing: .12em; color: #7c4dff; opacity: .8; }
.tm-party-name { font-size: 15px; font-weight: 700; color: #b39ddb; }
.tm-party-en { font-size: 11px; opacity: .55; }
.tm-party-parents { font-size: 11px; opacity: .65; margin-top: 4px; }
.tm-party-addr { font-size: 10px; opacity: .45; margin-top: 3px; line-height: 1.4; }

.tm-orbit { display: flex; align-items: center; justify-content: center; position: relative; padding-top: 20px; }
.tm-orbit-ring { position: absolute; width: 48px; height: 48px; border-radius: 50%; border: 1px solid rgba(124,77,255,.35); animation: orbit-spin 8s linear infinite; }
@keyframes orbit-spin { to { transform: rotate(360deg); } }
.tm-orbit-heart { font-size: 1.3rem; filter: drop-shadow(0 0 6px rgba(124,77,255,.8)); }

.tm-section { padding: 0 20px 18px;display: flex;flex-direction: column; align-items: center; }
.tm-event-box { border: 1px solid rgba(124,77,255,.25); border-radius: 12px; padding: 18px; text-align: center; background: rgba(124,77,255,.05); box-shadow: 0 0 24px rgba(124,77,255,.08) inset; }
.tm-event-icon { font-size: 1.5rem; margin-bottom: 6px; }
.tm-event-date { font-size: 15px; font-weight: 700; color: #b39ddb; }
.tm-event-en { font-size: 11px; opacity: .5; margin-bottom: 12px; }
.tm-venue { font-size: 14px; font-weight: 600; color: #e8e0ff; }
.tm-venue-addr { font-size: 12px; opacity: .55; margin-bottom: 10px; }
.tm-map-btn { display: inline-block; padding: 5px 14px; border: 1px solid rgba(124,77,255,.4); border-radius: 999px; font-size: 12px; color: #b39ddb; text-decoration: none; background: rgba(124,77,255,.1); }

.tm-sec-title { text-align: center; font-size: 12px; font-weight: 700; letter-spacing: .12em; color: #7c4dff; margin-bottom: 14px; }
.tm-sched { display: flex; gap: 10px; padding: 10px 12px; border: 1px solid rgba(124,77,255,.15); border-radius: 10px; margin-bottom: 8px; background: rgba(124,77,255,.04); }
.tm-sched-num { width: 22px; height: 22px; border-radius: 50%; background: rgba(124,77,255,.15); color: #b39ddb; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.tm-sched-day { font-size: 13px; font-weight: 700; color: #b39ddb; }
.tm-sched-time { font-size: 11px; opacity: .6; }
.tm-sched-prog { font-size: 12px; line-height: 1.7; opacity: .75; margin: 4px 0 0; }
.tm-contacts { margin-top: 8px; font-weight: 700; color: #b39ddb; font-size: 13px; }

.tm-gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px,1fr)); gap: 8px;justify-content: center; align-items: center;}
.tm-gallery-item { border-radius: 8px; overflow: hidden; border: 1px solid rgba(124,77,255,.25); box-shadow: 0 0 10px rgba(124,77,255,.1); img { width:100%; aspect-ratio:1; object-fit:cover; display:block; } }
.tm-gallery-cap { font-size: 10px; text-align:center; color: #b39ddb; padding: 3px; background: rgba(13,13,26,.85); }

.tm-footer { text-align: center; padding: 16px 20px 0; }
.tm-closing { font-size: 13px; opacity: .65; margin-bottom: 10px; }
.tm-sig { font-size: 16px; font-weight: 700; color: #b39ddb; text-shadow: 0 0 12px rgba(124,77,255,.5); }
.tm-bottom-stars { color: #7c4dff; font-size: 14px; margin-top: 12px; letter-spacing: 8px; }
</style>
