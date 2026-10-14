<template>
  <div class="inv" :style="cssVars">
    <Head>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link
        href="https://fonts.googleapis.com/css2?family=Hanuman:wght@100;300;400;700;900&family=Moul&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap"
        rel="stylesheet"
      />
    </Head>

    <!-- Music -->
    <div v-if="ytId" class="music">
      <iframe
        :src="`https://www.youtube.com/embed/${ytId}?autoplay=1&loop=1&playlist=${ytId}&controls=0&mute=${a.musicPlaying.value ? 0 : 1}`"
        style="display: none"
        allow="autoplay"
      />
      <button @click="a.musicPlaying.value = !a.musicPlaying.value">
        {{ a.musicPlaying.value ? "🎵" : "🔇" }}
      </button>
    </div>

    <div class="enter">
      <!-- 1. HERO -->
      <section class="hero">
        <div
          v-if="coverImage"
          class="hero-bg"
          :style="`background-image:url('${a.imgUrl(coverImage)}')`"
        />
        <div class="hero-ring r1" />
        <div class="hero-ring r2" />
        <div class="hero-ring r3" />
        <div class="hero-in">
          <p class="opening">
            {{ inv.invitationContent?.opening || "សូមគោរពអញ្ជើញ" }}
          </p>
          <h1 v-if="host1">{{ host1 }}</h1>
          <div v-if="host1 && host2" class="amp">&amp;</div>
          <h1 v-if="host2">{{ host2 }}</h1>
          <InviteCover
            v-if="coverImage"
            :cover-image="coverImage"
            :img-url-fn="a.imgUrl"
            wrapper-style="margin:32px auto;width:180px;height:180px;border-radius:50%;border:3px solid var(--inv-primary);overflow:hidden;"
          />
          <p class="date-en">{{ a.fmtDateEn(mainDate) }}</p>
          <p class="date-kh">{{ a.fmtDateKh(mainDate) }}</p>
        </div>
      </section>

      <!-- 2. GUEST -->
      <section class="sec center">
        <div class="narrow">
          <p class="label">ជូនចំពោះ</p>
          <h2 class="guest">{{ inv.guestName }}</h2>
          <p v-if="inv.sideFamily" class="gold">
            {{ a.sideFamilyKh(inv.sideFamily) }}
          </p>
          <p v-if="inv.totalGuests" class="muted">
            ចំនួនទីកន្លែង: {{ inv.totalGuests }} នាក់
          </p>
          <div
            v-if="inv.currentStatus && inv.currentStatus !== 'INVITED'"
            :class="['badge', inv.currentStatus]"
          >
            <span>{{ statusIcon }}</span
            ><span>{{ statusTextKh }}</span>
          </div>
        </div>
      </section>

      <!-- 3. COUNTDOWN -->
      <section v-if="a.countdown.value" class="sec alt center">
        <div class="narrow">
          <p class="label">ពេលវេលានៅសល់</p>
          <div class="grid4">
            <div
              v-for="u in a.countdown.value"
              :key="u.label"
              class="card tight"
            >
              <div class="num">{{ u.value }}</div>
              <div class="cap">{{ u.label }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 4. STORY -->
      <section v-if="story.content || story.title" class="sec center">
        <div class="wide">
          <p class="label">{{ story.title || "រឿងរ៉ាវរបស់យើង" }}</p>
          <div class="rule" />
          <p class="body">{{ story.content }}</p>
        </div>
      </section>
      <section v-if="timeline.length" class="sec alt">
        <div class="wide">
          <p class="label center-t">វគ្គសម័យនៃយើង</p>
          <div class="tl">
            <div class="tl-line" />
            <div v-for="(it, i) in timeline" :key="it.id || i" class="tl-item">
              <div class="tl-dot" />
              <div v-if="it.date" class="cap">{{ a.fmtDateKh(it.date) }}</div>
              <div class="gold b">{{ it.title }}</div>
              <div v-if="it.description" class="body sm">
                {{ it.description }}
              </div>
              <img v-if="it.image" :src="a.imgUrl(it.image)" class="img" />
            </div>
          </div>
        </div>
      </section>

      <!-- 5. CEREMONY + RECEPTION (one block, reused) -->
      <section
        v-for="(ev, k) in events"
        :key="k"
        :class="['sec', 'center', k % 2 ? 'alt' : '']"
      >
        <div class="wide">
          <p class="label">✦ {{ ev.label }} ✦</p>
          <div class="stack left">
            <div v-if="ev.date" class="card row">
              <div class="ico">📅</div>
              <div>
                <div class="cap">កាលបរិច្ឆេទ</div>
                <div class="val">{{ a.fmtDateKh(ev.date) }}</div>
                <div class="sub">{{ a.fmtDateEn(ev.date) }}</div>
              </div>
            </div>
            <div v-if="ev.time" class="card row">
              <div class="ico">⏰</div>
              <div>
                <div class="cap">ម៉ោង</div>
                <div class="val">{{ ev.time }}</div>
              </div>
            </div>
            <div v-if="ev.venue" class="card row">
              <div class="ico">📍</div>
              <div>
                <div class="cap">ទីតាំង</div>
                <div class="val">{{ ev.venue }}</div>
                <div v-if="ev.address" class="sub">{{ ev.address }}</div>
                <a
                  :href="`https://maps.google.com?q=${encodeURIComponent(ev.address || ev.venue)}`"
                  target="_blank"
                  class="gold sm"
                  >មើលផែនទី →</a
                >
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 6. SCHEDULE -->
      <section v-if="inv.schedule?.length" class="sec">
        <div class="wide">
          <p class="label center-t">កម្មវិធី</p>
          <div class="stack">
            <div v-for="(it, i) in inv.schedule" :key="i" class="card row top">
              <div class="step">{{ i + 1 }}</div>
              <div style="flex: 1">
                <div class="gold sm">{{ a.fmtTime(it.scheduleTime) }}</div>
                <div class="val b">{{ it.name }}</div>
                <div v-if="it.description" class="sub">
                  {{ it.description }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 7. MAP -->
      <section v-if="mapQuery" class="sec alt" style="padding-top: 0">
        <div class="wide">
          <iframe
            :src="`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`"
            class="map"
            loading="lazy"
            allowfullscreen
          />
        </div>
      </section>

      <!-- 8. SEATING -->
      <section v-if="inv.tableNumber" class="sec center">
        <div class="narrow">
          <p class="label">តុអង្គុយ</p>
          <div class="card seat">
            <div class="big">{{ inv.tableNumber }}</div>
            <div v-if="inv.tableName" class="sub">{{ inv.tableName }}</div>
          </div>
        </div>
      </section>

      <!-- 9. MESSAGE -->
      <section v-if="inv.message" class="sec alt center">
        <div class="wide">
          <p class="label">សាររបស់យើង</p>
          <div class="card pad">
            <p class="body">{{ inv.message }}</p>
          </div>
        </div>
      </section>

      <!-- 10. RSVP -->
      <section
        v-if="['INVITED', 'CONFIRMED'].includes(inv.currentStatus)"
        class="sec center"
      >
        <div class="narrow">
          <p class="label">ការឆ្លើយតប</p>
          <div class="stack">
            <button
              class="btn solid"
              :disabled="a.rsvpLoading.value !== null"
              :style="a.rsvpLoading.value === 'confirm' ? 'opacity:.6' : ''"
              @click="a.rsvp('confirm')"
            >
              {{
                a.rsvpLoading.value === "confirm"
                  ? "កំពុងដំណើរការ..."
                  : "✓ បញ្ជាក់វត្តមាន"
              }}
            </button>
            <button
              class="btn ghost"
              :disabled="a.rsvpLoading.value !== null"
              :style="a.rsvpLoading.value === 'decline' ? 'opacity:.6' : ''"
              @click="a.rsvp('decline')"
            >
              {{
                a.rsvpLoading.value === "decline"
                  ? "កំពុងដំណើរការ..."
                  : "✗ បដិសេធ"
              }}
            </button>
          </div>
        </div>
      </section>

      <!-- 11. DECLINED -->
      <section v-if="inv.currentStatus === 'DECLINED'" class="sec center">
        <div class="narrow card pad" style="border-color: #ef444430">
          <div style="font-size: 48px">😔</div>
          <p style="color: #f87171">អ្នកបានបដិសេធការអញ្ជើញ</p>
          <p class="sub">យើងនឹងខកខានអ្នក</p>
        </div>
      </section>

      <!-- 12. QR -->
      <section class="sec alt center">
        <div class="narrow">
          <p class="label">លេខកូដ QR</p>
          <div class="qr"><QrCode :value="a.qrValue.value" :size="160" /></div>
          <p class="sub" style="margin-top: 16px">
            ស្កែន QR Code សម្រាប់ចូលបញ្ជាក់
          </p>
        </div>
      </section>

      <!-- 13. GIFT -->
      <section
        v-if="inv.bankName || inv.giftQrImageUrl || gifts.length"
        class="sec center"
      >
        <div class="narrow">
          <p class="label">ការផ្ញើអំណោយ</p>
          <div class="card pad">
            <div v-if="inv.bankName" style="margin-bottom: 24px">
              <div class="gold">{{ inv.bankName }}</div>
              <div class="acct">{{ inv.bankAccount }}</div>
              <div class="sub">{{ inv.bankAccountName }}</div>
            </div>
            <img
              v-if="inv.giftQrImageUrl"
              :src="a.imgUrl(inv.giftQrImageUrl)"
              class="giftqr"
            />
            <div
              v-for="(o, i) in gifts"
              :key="o.id || i"
              class="card row"
              style="margin-top: 16px"
            >
              <span style="font-size: 20px">{{ o.icon || "🎁" }}</span>
              <div style="text-align: left">
                <div class="gold b">{{ o.name }}</div>
                <div v-if="o.description" class="sub">{{ o.description }}</div>
                <a v-if="o.url" :href="o.url" target="_blank" class="gold sm"
                  >មើលបន្ថែម →</a
                >
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 13b. VIDEOS -->
      <section v-if="videos.length" class="sec alt center">
        <div class="wide">
          <p class="label">🎬 វីដេអូ</p>
          <div class="vgrid">
            <div v-for="(v, i) in videos" :key="v.id || i" class="card clip">
              <img
                v-if="v.thumbnail"
                :src="a.imgUrl(v.thumbnail)"
                class="thumb"
              />
              <div style="padding: 16px">
                <div class="gold b">{{ v.title }}</div>
                <a :href="v.url" target="_blank" class="gold sm">មើលវីដេអូ →</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 13c. CUSTOM SECTIONS -->
      <section v-if="customs.length" class="sec">
        <div class="wide">
          <template v-for="(s, i) in customs" :key="s.id || i">
            <div v-if="s.enabled !== false" style="margin-bottom: 32px">
              <div v-if="s.title" class="label center-t">{{ s.title }}</div>
              <div
                v-if="s.subtitle"
                class="gold center-t"
                style="margin-bottom: 16px"
              >
                {{ s.subtitle }}
              </div>
              <div v-if="s.content" class="body">{{ s.content }}</div>
              <img v-if="s.image" :src="a.imgUrl(s.image)" class="img c" />
              <iframe
                v-if="s.video"
                :src="s.video"
                class="vid"
                allowfullscreen
              />
            </div>
          </template>
        </div>
      </section>

      <!-- 14. GALLERY -->
      <InviteGallery
        :gallery="inv.gallery"
        :img-url-fn="a.imgUrl"
        section-style="padding:48px 24px;background:var(--inv-bg-alt);"
        item-style="border-radius:12px;overflow:hidden;aspect-ratio:1;border:1px solid color-mix(in srgb,var(--inv-primary) 15%,transparent);"
        label="វិចិត្រសាល"
        label-style="color:color-mix(in srgb,var(--inv-primary) 60%,transparent);font-size:13px;letter-spacing:.2em;text-align:center;margin-bottom:32px;"
      />

      <!-- 15. WISHES -->
      <section class="sec">
        <div class="wide">
          <p class="label center-t">ផ្ញើរប្រាប់ជូន</p>
          <div class="card pad" style="margin-bottom: 24px">
            <textarea
              v-model="a.wishForm.message"
              rows="4"
              placeholder="សរសេរអំណោយទានពាក្យ..."
              class="ta"
            />
            <div
              v-if="a.wishError.value"
              style="color: #f87171; font-size: 13px; margin-top: 8px"
            >
              {{ a.wishError.value }}
            </div>
            <div
              v-if="a.wishSuccess.value"
              style="color: #16a34a; font-size: 13px; margin-top: 8px"
            >
              ✓ បានផ្ញើជោគជ័យ!
            </div>
            <button
              class="btn solid"
              style="margin-top: 16px"
              :disabled="a.wishLoading.value"
              @click="a.submitWish()"
            >
              {{ a.wishLoading.value ? "កំពុងផ្ញើ..." : "ផ្ញើ" }}
            </button>
          </div>
          <div v-if="a.allWishes.value?.length" class="stack">
            <div
              v-for="(w, i) in a.allWishes.value"
              :key="i"
              class="card"
              style="padding: 16px 20px"
            >
              <div class="gold b sm">{{ w.guestName }}</div>
              <div class="body sm" style="line-height: 1.7">
                {{ w.message }}
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 16. SHARE -->
      <section class="sec alt center">
        <div class="narrow">
          <p class="label">{{ social.shareTitle || "ចែករំលែក" }}</p>
          <div
            v-if="social.shareDescription"
            class="body sm"
            style="margin-bottom: 24px"
          >
            {{ social.shareDescription }}
          </div>
          <div class="stack">
            <a
              v-if="social.telegramUrl"
              :href="social.telegramUrl"
              target="_blank"
              class="btn ghost txt"
              >📱 Telegram</a
            >
            <a
              v-if="social.instagramUrl"
              :href="social.instagramUrl"
              target="_blank"
              class="btn ghost txt"
              >📸 Instagram</a
            >
            <a
              v-if="social.facebookUrl"
              :href="social.facebookUrl"
              target="_blank"
              class="btn ghost txt"
              >📘 Facebook</a
            >
            <a
              :href="a.whatsappLink.value"
              target="_blank"
              class="btn ghost txt"
              >💬 WhatsApp</a
            >
            <button class="btn ghost txt" @click="a.copyLink()">
              {{ a.copied.value ? "✓ បានចម្លង!" : "🔗 ចម្លងលីង" }}
            </button>
          </div>
          <div v-if="social.hashtag" class="muted" style="margin-top: 24px">
            #{{ social.hashtag }}
          </div>
        </div>
      </section>

      <!-- 17. SPECIAL MESSAGES -->
      <section v-if="Object.values(special).some(Boolean)" class="sec center">
        <div class="wide">
          <div v-if="special.announcement" class="note red">
            <b>📢 អត្ថបទផ្ញើការ</b>
            <div>{{ special.announcement }}</div>
          </div>
          <div v-if="special.importantNote" class="note orange">
            <b>⚠️ ការពិនិត្យសំខាន់</b>
            <div>{{ special.importantNote }}</div>
          </div>
          <div v-if="special.specialNote" class="note gld">
            <b>✨ ចំណាំពិសេស</b>
            <div>{{ special.specialNote }}</div>
          </div>
          <div v-if="special.closing" class="note">
            <i>{{ special.closing }}</i>
          </div>
          <div v-if="special.thankYouMessage" class="note green">
            <b>🙏</b>
            <div style="font-size: 16px">{{ special.thankYouMessage }}</div>
          </div>
        </div>
      </section>

      <!-- 18. FOOTER -->
      <footer class="foot">
        <p class="ftitle">{{ footer.title || inv.weddingTitle }}</p>
        <p v-if="footer.message" class="body sm" style="margin-bottom: 16px">
          {{ footer.message }}
        </p>
        <img
          v-if="footer.logo"
          :src="a.imgUrl(footer.logo)"
          style="max-width: 120px; margin: 16px auto; border-radius: 50%"
        />
        <p class="muted">{{ footer.note || "✦ ✦ ✦" }}</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, toRef } from "vue";
import { useInviteActions } from "~/composables/useInviteActions";

const props = defineProps({
  inv: { type: Object, required: true },
  token: { type: String, required: true },
  theme: { type: Object, default: () => null },
});
const inv = computed(() => props.inv || {});
const a = useInviteActions(toRef(props, "inv"), props.token);

// ── theme ──
const tc = computed(() => ({
  primary: props.theme?.primary || "#c9a84c",
  secondary: props.theme?.secondary || "#e4b035",
  bg: props.theme?.bg || "#0c0a06",
  text: props.theme?.text || "#f5f0e8",
}));
const cssVars = computed(() => ({
  fontFamily: "Hanuman, sans-serif",
  background: tc.value.bg,
  color: tc.value.text,
  minHeight: "100vh",
  "--inv-primary": tc.value.primary,
  "--inv-secondary": tc.value.secondary,
  "--inv-bg": tc.value.bg,
  "--inv-bg-alt": `color-mix(in srgb, ${tc.value.text} 4%, ${tc.value.bg})`,
  "--inv-text": tc.value.text,
}));

// ── data mapping: supports flat payload AND optional nested objects ──
const i = () => props.inv || {};
const ytId = computed(
  () =>
    (typeof i().youtubeEmbedId === "string"
      ? i().youtubeEmbedId
      : a.youtubeEmbedId?.value) || "",
);
const coverImage = computed(() => i().coverImage || i().heroInfo?.image || "");
const host1 = computed(
  () => i().hostsInfo?.host1Name || i().host1Name || i().groomName,
);
const host2 = computed(
  () => i().hostsInfo?.host2Name || i().host2Name || i().brideName,
);
const mainDate = computed(
  () => i().eventDetails?.date || i().eventDate || i().weddingDate,
);

const story = computed(
  () => i().loveStory || { title: i().storyTitle, content: i().coupleStory },
);
const timeline = computed(() => i().storyTimeline || []);
const events = computed(() => {
  const d = i();
  const mk = (label, info, t, dt, v, ad) => ({
    label,
    date: info?.date || d[dt],
    time: info?.time || (d[dt] ? a.fmtTime(d[dt]) : ""),
    venue: info?.venue || d[v],
    address: info?.address || d[ad],
  });
  return [
    mk(
      "ពិធីកាល",
      d.ceremonyInfo,
      "",
      "ceremonyDate",
      "ceremonyVenue",
      "ceremonyAddress",
    ),
    mk(
      "ពិធីលេងលាក់",
      d.receptionInfo,
      "",
      "receptionDate",
      "receptionVenue",
      "receptionAddress",
    ),
  ].filter((e) => e.venue || e.address || (e.date && e.venue));
});
const mapQuery = computed(
  () => i().weddingLocation || i().venueAddress || i().venue || "",
);
const gifts = computed(() =>
  i().showGiftInfo === false ? [] : i().giftOptions || [],
);
const videos = computed(() => i().videos || []);
const customs = computed(() => i().customSections || i().sections || []);
const social = computed(
  () =>
    i().socialInfo || {
      shareTitle: i().shareTitle,
      shareDescription: i().shareDescription,
      telegramUrl: i().telegramUrl,
      instagramUrl: i().instagramUrl,
      facebookUrl: i().facebookUrl,
      hashtag: i().hashtag,
    },
);
const special = computed(
  () =>
    i().specialMessages || {
      announcement: i().announcement,
      importantNote: i().importantNote,
      specialNote: i().specialNote,
      closing: i().closing,
      thankYouMessage: i().thankYouMessage,
    },
);
const footer = computed(
  () =>
    i().footerInfo || {
      title: i().footerTitle,
      message: i().footerMessage,
      logo: i().footerLogo,
      note: i().footerNote,
    },
);

const statusIcon = computed(
  () =>
    ({ CONFIRMED: "🎉", ATTENDED: "✅", DECLINED: "❌", NO_SHOW: "⚠️" })[
      i().currentStatus
    ] ?? "",
);
const statusTextKh = computed(
  () =>
    ({
      CONFIRMED: "បានបញ្ជាក់វត្តមាន",
      ATTENDED: "បានចុះឈ្មោះចូលរួម",
      DECLINED: "បានបដិសេធ",
      NO_SHOW: "មិនបានមក",
    })[i().currentStatus] ?? "",
);

onMounted(() => a.startCountdown());
</script>

<style>
.inv {
  --p: var(--inv-primary);
  --m: color-mix(in srgb, var(--inv-primary) 60%, transparent);
  --l: color-mix(in srgb, var(--inv-primary) 12%, transparent);
  --bd: color-mix(in srgb, var(--inv-primary) 25%, transparent);
  --soft: color-mix(in srgb, var(--inv-text) 60%, transparent);
}
.inv .enter {
  animation: fadeInUp 0.8s ease both;
}
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
.inv .music {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
}
.inv .music button {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid var(--p);
  background: var(--inv-bg);
  color: var(--p);
  font-size: 20px;
  cursor: pointer;
}
.inv .hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--inv-bg);
}
.inv .hero-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0.15;
}
.inv .hero-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 1px solid var(--bd);
  pointer-events: none;
}
.inv .r1 {
  width: 480px;
  height: 480px;
  opacity: 0.5;
}
.inv .r2 {
  width: 400px;
  height: 400px;
  opacity: 0.7;
}
.inv .r3 {
  width: 320px;
  height: 320px;
}
.inv .hero-in {
  position: relative;
  text-align: center;
  padding: 48px 24px;
}
.inv .opening {
  color: var(--m);
  font-size: 13px;
  letter-spacing: 0.3em;
  margin-bottom: 24px;
  font-family: "Playfair Display", serif;
}
.inv h1 {
  font-family: Moul, sans-serif;
  font-size: clamp(28px, 7vw, 52px);
  color: var(--p);
  line-height: 1.3;
  margin: 0 0 8px;
}
.inv .amp {
  color: var(--m);
  font-size: 20px;
  margin: 8px 0;
}
.inv .date-en {
  color: var(--p);
  font-size: 15px;
  letter-spacing: 0.1em;
  font-family: "Playfair Display", serif;
}
.inv .date-kh {
  color: var(--m);
  font-size: 13px;
  margin-top: 4px;
}
.inv .sec {
  padding: 48px 24px;
  background: var(--inv-bg);
}
.inv .sec.alt {
  background: var(--inv-bg-alt);
}
.inv .center {
  text-align: center;
}
.inv .center-t {
  text-align: center;
}
.inv .narrow {
  max-width: 480px;
  margin: 0 auto;
}
.inv .wide {
  max-width: 600px;
  margin: 0 auto;
}
.inv .label {
  color: var(--m);
  font-size: 13px;
  letter-spacing: 0.2em;
  margin-bottom: 24px;
}
.inv .center-t.label {
  margin-bottom: 32px;
}
.inv .guest {
  font-family: Moul, sans-serif;
  font-size: clamp(20px, 5vw, 32px);
  color: var(--inv-text);
  margin: 0 0 8px;
}
.inv .gold {
  color: var(--p);
}
.inv .muted {
  color: var(--soft);
  font-size: 13px;
}
.inv .b {
  font-weight: 600;
}
.inv .sm {
  font-size: 13px;
}
.inv .body {
  color: var(--inv-text);
  font-size: 15px;
  line-height: 2;
  white-space: pre-line;
}
.inv .body.sm {
  font-size: 14px;
  line-height: 1.7;
}
.inv .rule {
  width: 48px;
  height: 1px;
  background: var(--bd);
  margin: 0 auto 24px;
}
.inv .card {
  background: var(--l);
  border: 1px solid var(--bd);
  border-radius: 16px;
  padding: 24px;
}
.inv .card.tight {
  padding: 20px 8px;
}
.inv .card.pad {
  padding: 32px;
}
.inv .card.clip {
  padding: 0;
  overflow: hidden;
}
.inv .row {
  display: flex;
  align-items: center;
  gap: 16px;
  text-align: left;
}
.inv .row.top {
  align-items: flex-start;
  padding: 20px 24px;
}
.inv .ico {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--l);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}
.inv .cap {
  color: var(--m);
  font-size: 12px;
  margin-bottom: 4px;
}
.inv .val {
  color: var(--inv-text);
  font-size: 15px;
}
.inv .sub {
  color: var(--soft);
  font-size: 12px;
  margin-top: 2px;
}
.inv .stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.inv .grid4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.inv .num {
  font-size: clamp(28px, 7vw, 40px);
  font-weight: 700;
  color: var(--p);
  font-family: "Playfair Display", serif;
  line-height: 1;
}
.inv .badge {
  padding: 8px 20px;
  border-radius: 999px;
  font-size: 13px;
  display: inline-flex;
  gap: 8px;
  align-items: center;
  margin-top: 12px;
}
.inv .badge.CONFIRMED {
  background: #22c55e15;
  color: #16a34a;
  border: 1px solid #22c55e40;
}
.inv .badge.ATTENDED {
  background: var(--l);
  color: var(--p);
  border: 1px solid var(--bd);
}
.inv .badge.DECLINED {
  background: #ef444415;
  color: #dc2626;
  border: 1px solid #ef444440;
}
.inv .badge.NO_SHOW {
  background: #f9731615;
  color: #ea580c;
  border: 1px solid #f9731640;
}
.inv .tl {
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: relative;
}
.inv .tl-line {
  position: absolute;
  left: 24px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, var(--bd), var(--p));
}
.inv .tl-item {
  position: relative;
  padding-left: 56px;
}
.inv .tl-dot {
  position: absolute;
  left: 14px;
  top: 8px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--p);
  border: 3px solid var(--inv-bg);
  z-index: 1;
}
.inv .img {
  margin-top: 12px;
  max-width: 100%;
  border-radius: 12px;
}
.inv .img.c {
  display: block;
  margin: 16px auto;
  max-width: 400px;
  width: 100%;
}
.inv .step {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--inv-primary), var(--inv-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: var(--inv-bg);
  flex-shrink: 0;
}
.inv .map {
  width: 100%;
  height: 240px;
  border: 0;
  border-radius: 16px;
}
.inv .seat {
  border-width: 2px;
  border-radius: 24px;
  padding: 40px 24px;
}
.inv .big {
  font-size: 64px;
  font-weight: 900;
  color: var(--p);
  font-family: "Playfair Display", serif;
  line-height: 1;
}
.inv .btn {
  padding: 16px 32px;
  border-radius: 999px;
  font-size: 15px;
  font-family: Hanuman, sans-serif;
  cursor: pointer;
  width: 100%;
  box-sizing: border-box;
}
.inv .btn.solid {
  border: none;
  font-weight: 700;
  background: linear-gradient(135deg, var(--inv-primary), var(--inv-secondary));
  color: var(--inv-bg);
}
.inv .btn.ghost {
  border: 1px solid var(--bd);
  background: transparent;
  color: var(--m);
}
.inv .btn.txt {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 24px;
  color: var(--inv-text);
  text-decoration: none;
  font-size: 14px;
}
.inv .qr {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  display: inline-block;
}
.inv .acct {
  color: var(--inv-text);
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.1em;
}
.inv .giftqr {
  width: 180px;
  height: 180px;
  object-fit: contain;
  border-radius: 12px;
  margin: 0 auto;
  display: block;
}
.inv .vgrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}
.inv .thumb {
  width: 100%;
  height: 180px;
  object-fit: cover;
}
.inv .vid {
  width: 100%;
  aspect-ratio: 16/9;
  border: 0;
  border-radius: 12px;
  margin-top: 16px;
}
.inv .ta {
  width: 100%;
  background: color-mix(in srgb, var(--inv-text) 5%, transparent);
  border: 1px solid var(--bd);
  border-radius: 12px;
  padding: 16px;
  color: var(--inv-text);
  font-family: Hanuman, sans-serif;
  font-size: 14px;
  resize: none;
  outline: none;
  box-sizing: border-box;
}
.inv .note {
  background: var(--l);
  border: 1px solid var(--bd);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  color: var(--inv-text);
}
.inv .note.red {
  background: #ef444415;
  border-color: #ef444430;
}
.inv .note.orange {
  background: #f9731615;
  border-color: #f9731630;
}
.inv .note.gld {
  background: color-mix(in srgb, var(--inv-primary) 15%, transparent);
}
.inv .note.green {
  background: #22c55e15;
  border-color: #22c55e30;
}
.inv .note b {
  display: block;
  margin-bottom: 8px;
}
.inv .foot {
  padding: 48px 24px;
  background: var(--inv-bg);
  text-align: center;
  border-top: 1px solid var(--l);
}
.inv .ftitle {
  font-family: Moul, sans-serif;
  font-size: clamp(16px, 4vw, 24px);
  color: var(--p);
  margin: 0 0 8px;
}
</style>
