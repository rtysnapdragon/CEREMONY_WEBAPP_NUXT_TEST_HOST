<template>
  <div :style="{ fontFamily: 'Hanuman,sans-serif', background: tc.bg, minHeight: '100vh', color: tc.text, '--inv-primary': tc.primary, '--inv-secondary': tc.secondary }">

    <Head>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link href="https://fonts.googleapis.com/css2?family=Hanuman:wght@400;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
    </Head>

    <!-- YouTube Music Player -->
    <div v-if="a.youtubeEmbedId.value" style="position:fixed;bottom:24px;right:24px;z-index:1000;">
      <iframe
        :src="`https://www.youtube.com/embed/${a.youtubeEmbedId.value}?autoplay=1&loop=1&playlist=${a.youtubeEmbedId.value}&controls=0&mute=${a.musicPlaying.value ? 0 : 1}`"
        style="display:none;" allow="autoplay" />
      <button
        @click="a.musicPlaying.value = !a.musicPlaying.value"
        style="width:48px;height:48px;border-radius:50%;border:1px solid rgba(255,255,255,0.2);background:#111;color:#fff;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;">
        {{ a.musicPlaying.value ? '🎵' : '🔇' }}
      </button>
    </div>

    <div class="invitation-enter">

      <!-- ── HERO COVER ─────────────────────────────────────────────── -->
      <section style="position:relative;min-height:100vh;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#0d0d0d;">
        <div v-if="props.inv?.coverImage"
          :style="`position:absolute;inset:0;background-image:url('${a.imgUrl(props.inv.coverImage)}');background-size:cover;background-position:center;opacity:0.08;`" />
        <div style="position:absolute;inset:0;background:linear-gradient(to bottom,#0d0d0dee,#0d0d0d88,#0d0d0dff);" />

        <div style="position:relative;text-align:center;padding:48px 24px;max-width:600px;">
          <p style="color:#88888880;font-size:11px;letter-spacing:0.4em;text-transform:uppercase;margin-bottom:40px;font-family:'Inter',sans-serif;">
            Wedding Invitation
          </p>

          <InviteCover
            :cover-image="props.inv.coverImage"
            :img-url-fn="a.imgUrl"
            wrapper-style="margin:0 auto 40px;width:160px;height:160px;border-radius:50%;overflow:hidden;border:1px solid rgba(255,255,255,0.15);"
          />

          <h1 style="font-family:'Inter',sans-serif;font-weight:700;font-size:clamp(24px,6vw,40px);color:#ffffff;letter-spacing:0.15em;text-transform:uppercase;line-height:1.2;margin-bottom:8px;">
            {{ props.inv?.groomName }}
          </h1>
          <div style="color:#888;font-size:16px;margin:12px 0;font-family:'Inter',sans-serif;">&amp;</div>
          <h1 style="font-family:'Inter',sans-serif;font-weight:700;font-size:clamp(24px,6vw,40px);color:#ffffff;letter-spacing:0.15em;text-transform:uppercase;line-height:1.2;margin-bottom:40px;">
            {{ props.inv?.brideName }}
          </h1>

          <div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:32px;">
            <p style="color:#888;font-size:13px;font-family:'Inter',sans-serif;letter-spacing:0.1em;">
              {{ a.fmtDateEn(props.inv?.weddingDate) }}
            </p>
            <p style="color:#555;font-size:12px;margin-top:6px;">
              {{ a.fmtDateKh(props.inv?.weddingDate) }}
            </p>
          </div>
        </div>
      </section>

      <!-- ── GUEST GREETING ─────────────────────────────────────────── -->
      <section style="padding:48px 24px;text-align:center;background:#111111;border-top:1px solid rgba(255,255,255,0.06);">
        <div style="max-width:480px;margin:0 auto;">
          <p style="color:#55555580;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;margin-bottom:16px;font-family:'Inter',sans-serif;">Guest</p>
          <h2 style="font-family:'Inter',sans-serif;font-size:clamp(20px,5vw,28px);font-weight:600;color:#fff;margin-bottom:8px;">
            {{ props.inv?.guestName }}
          </h2>
          <p v-if="props.inv?.sideFamily" style="color:#888;font-size:13px;margin-bottom:12px;">
            {{ a.sideFamilyKh(props.inv.sideFamily) }}
          </p>
          <p v-if="props.inv?.totalGuests" style="color:#e0e0e080;font-size:13px;margin-bottom:20px;font-family:'Inter',sans-serif;">
            Seats: {{ props.inv.totalGuests }}
          </p>
          <div v-if="props.inv?.currentStatus && props.inv.currentStatus !== 'INVITED'" :style="statusStyle">
            <span>{{ statusIcon }}</span><span>{{ statusTextKh }}</span>
          </div>
        </div>
      </section>

      <!-- ── COUNTDOWN ──────────────────────────────────────────────── -->
      <section v-if="a.countdown.value" style="padding:48px 24px;background:#0d0d0d;border-top:1px solid rgba(255,255,255,0.06);">
        <div style="max-width:480px;margin:0 auto;text-align:center;">
          <p style="color:#55555580;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;margin-bottom:32px;font-family:'Inter',sans-serif;">ពេលវេលានៅសល់</p>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">
            <div v-for="unit in a.countdown.value" :key="unit.label"
              style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:20px 8px;">
              <div style="font-size:clamp(28px,7vw,40px);font-weight:700;color:#fff;font-family:'Inter',sans-serif;line-height:1;font-variant-numeric:tabular-nums;">
                {{ unit.value }}
              </div>
              <div style="font-size:11px;color:#555;margin-top:8px;font-family:'Hanuman',sans-serif;">{{ unit.label }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── COUPLE STORY ───────────────────────────────────────────── -->
      <section v-if="props.inv?.coupleStory" style="padding:48px 24px;background:#111111;border-top:1px solid rgba(255,255,255,0.06);">
        <div style="max-width:600px;margin:0 auto;">
          <p style="color:#55555580;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;margin-bottom:24px;text-align:center;font-family:'Inter',sans-serif;">Our Story</p>
          <div style="border-left:2px solid rgba(255,255,255,0.1);padding-left:24px;">
            <p style="color:#e0e0e0cc;font-size:15px;line-height:2;white-space:pre-line;font-family:'Inter',sans-serif;">{{ props.inv.coupleStory }}</p>
          </div>
        </div>
      </section>

      <!-- ── WEDDING DETAILS ────────────────────────────────────────── -->
      <section style="padding:48px 24px;background:#0d0d0d;border-top:1px solid rgba(255,255,255,0.06);">
        <div style="max-width:600px;margin:0 auto;">
          <p style="color:#55555580;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;text-align:center;margin-bottom:32px;font-family:'Inter',sans-serif;">ព័ត៌មានពិធី</p>
          <div style="display:grid;gap:12px;">
            <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-left:2px solid rgba(255,255,255,0.2);border-radius:0 8px 8px 0;padding:20px 24px;display:flex;align-items:center;gap:16px;">
              <span style="font-size:20px;">📅</span>
              <div>
                <div style="color:#888;font-size:11px;font-family:'Inter',sans-serif;letter-spacing:0.1em;margin-bottom:4px;">DATE</div>
                <div style="color:#e0e0e0;font-size:14px;font-family:'Inter',sans-serif;">{{ a.fmtDateEn(props.inv?.weddingDate) }}</div>
                <div style="color:#555;font-size:12px;margin-top:2px;">{{ a.fmtDateKh(props.inv?.weddingDate) }}</div>
              </div>
            </div>
            <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-left:2px solid rgba(255,255,255,0.2);border-radius:0 8px 8px 0;padding:20px 24px;display:flex;align-items:center;gap:16px;">
              <span style="font-size:20px;">⏰</span>
              <div>
                <div style="color:#888;font-size:11px;font-family:'Inter',sans-serif;letter-spacing:0.1em;margin-bottom:4px;">TIME</div>
                <div style="color:#e0e0e0;font-size:14px;font-family:'Inter',sans-serif;">{{ a.fmtTime(props.inv?.weddingDate) }}</div>
              </div>
            </div>
            <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-left:2px solid rgba(255,255,255,0.2);border-radius:0 8px 8px 0;padding:20px 24px;display:flex;align-items:center;gap:16px;">
              <span style="font-size:20px;">📍</span>
              <div>
                <div style="color:#888;font-size:11px;font-family:'Inter',sans-serif;letter-spacing:0.1em;margin-bottom:4px;">LOCATION</div>
                <div style="color:#e0e0e0;font-size:14px;font-family:'Inter',sans-serif;">{{ props.inv?.weddingLocation }}</div>
                <a v-if="props.inv?.weddingLocation"
                  :href="`https://maps.google.com?q=${encodeURIComponent(props.inv.weddingLocation)}`"
                  target="_blank" style="color:#888;font-size:12px;margin-top:4px;display:inline-block;font-family:'Inter',sans-serif;">
                  View Map →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── EVENT SCHEDULE ─────────────────────────────────────────── -->
      <section v-if="props.inv?.schedule?.length" style="padding:48px 24px;background:#111111;border-top:1px solid rgba(255,255,255,0.06);">
        <div style="max-width:600px;margin:0 auto;">
          <p style="color:#55555580;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;text-align:center;margin-bottom:32px;font-family:'Inter',sans-serif;">SCHEDULE</p>
          <div style="display:flex;flex-direction:column;gap:0;">
            <div v-for="(item, i) in props.inv.schedule" :key="i"
              style="display:flex;gap:16px;padding:20px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
              <div style="width:32px;text-align:center;">
                <span style="font-size:12px;font-family:'Inter',sans-serif;color:#555;font-weight:600;">{{ String(i+1).padStart(2,'0') }}</span>
              </div>
              <div style="flex:1;">
                <div style="color:#555;font-size:11px;font-family:'Inter',sans-serif;letter-spacing:0.1em;margin-bottom:4px;">{{ a.fmtTime(item.scheduleTime) }}</div>
                <div style="color:#e0e0e0;font-size:15px;font-family:'Inter',sans-serif;font-weight:500;margin-bottom:4px;">{{ item.name }}</div>
                <div v-if="item.description" style="color:#888;font-size:13px;font-family:'Inter',sans-serif;">{{ item.description }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── GOOGLE MAPS EMBED ──────────────────────────────────────── -->
      <section v-if="props.inv?.weddingLocation" style="background:#0d0d0d;border-top:1px solid rgba(255,255,255,0.06);">
        <div style="max-width:600px;margin:0 auto;padding:0 24px 48px;">
          <iframe
            :src="`https://maps.google.com/maps?q=${encodeURIComponent(props.inv.weddingLocation)}&output=embed`"
            style="width:100%;height:240px;border:0;border-radius:4px;filter:grayscale(1) invert(0.9);"
            loading="lazy" allowfullscreen />
        </div>
      </section>

      <!-- ── SEATING ────────────────────────────────────────────────── -->
      <section v-if="props.inv?.tableNumber" style="padding:48px 24px;background:#111111;text-align:center;border-top:1px solid rgba(255,255,255,0.06);">
        <div style="max-width:360px;margin:0 auto;">
          <p style="color:#55555580;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;margin-bottom:24px;font-family:'Inter',sans-serif;">YOUR TABLE</p>
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:48px 24px;">
            <div style="font-size:80px;font-weight:700;color:#fff;font-family:'Inter',sans-serif;line-height:1;">
              {{ props.inv.tableNumber }}
            </div>
            <div v-if="props.inv.tableName" style="color:#888;font-size:13px;margin-top:12px;font-family:'Inter',sans-serif;">{{ props.inv.tableName }}</div>
          </div>
        </div>
      </section>

      <!-- ── PERSONAL MESSAGE ───────────────────────────────────────── -->
      <section v-if="props.inv?.message" style="padding:48px 24px;background:#0d0d0d;border-top:1px solid rgba(255,255,255,0.06);">
        <div style="max-width:600px;margin:0 auto;">
          <p style="color:#55555580;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;margin-bottom:24px;text-align:center;font-family:'Inter',sans-serif;">MESSAGE</p>
          <div style="border-left:2px solid rgba(255,255,255,0.1);padding:24px 24px;">
            <p style="color:#e0e0e0cc;font-size:15px;line-height:2;white-space:pre-line;font-family:'Inter',sans-serif;">{{ props.inv.message }}</p>
          </div>
        </div>
      </section>

      <!-- ── RSVP BUTTONS ───────────────────────────────────────────── -->
      <section v-if="props.inv?.currentStatus === 'INVITED' || props.inv?.currentStatus === 'CONFIRMED'"
        style="padding:48px 24px;background:#111111;text-align:center;border-top:1px solid rgba(255,255,255,0.06);">
        <div style="max-width:360px;margin:0 auto;">
          <p style="color:#55555580;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;margin-bottom:24px;font-family:'Inter',sans-serif;">RSVP</p>
          <div style="display:flex;flex-direction:column;gap:12px;">
            <button @click="a.rsvp('confirm')" :disabled="a.rsvpLoading.value !== null"
              style="padding:16px 32px;border-radius:4px;border:none;background:#fff;color:#000;font-size:14px;font-weight:600;font-family:'Inter',sans-serif;cursor:pointer;letter-spacing:0.05em;"
              :style="a.rsvpLoading.value === 'confirm' ? 'opacity:0.6' : ''">
              {{ a.rsvpLoading.value === 'confirm' ? 'Processing...' : '✓ បញ្ជាក់វត្តមាន' }}
            </button>
            <button @click="a.rsvp('decline')" :disabled="a.rsvpLoading.value !== null"
              style="padding:16px 32px;border-radius:4px;border:1px solid rgba(255,255,255,0.15);background:transparent;color:#888;font-size:14px;font-family:'Inter',sans-serif;cursor:pointer;"
              :style="a.rsvpLoading.value === 'decline' ? 'opacity:0.6' : ''">
              {{ a.rsvpLoading.value === 'decline' ? 'Processing...' : '✗ បដិសេធ' }}
            </button>
          </div>
        </div>
      </section>

      <!-- ── DECLINED STATE ─────────────────────────────────────────── -->
      <section v-if="props.inv?.currentStatus === 'DECLINED'" style="padding:48px 24px;text-align:center;background:#111111;border-top:1px solid rgba(255,255,255,0.06);">
        <div style="max-width:360px;margin:0 auto;background:#ef444408;border:1px solid #ef444420;border-radius:8px;padding:32px;">
          <div style="font-size:48px;margin-bottom:16px;">😔</div>
          <p style="color:#f87171;font-size:15px;margin-bottom:8px;font-family:'Inter',sans-serif;">Invitation Declined</p>
          <p style="color:#e0e0e060;font-size:13px;">អ្នកបានបដិសេធការអញ្ជើញ</p>
        </div>
      </section>

      <!-- ── QR CODE ────────────────────────────────────────────────── -->
      <section style="padding:48px 24px;background:#0d0d0d;text-align:center;border-top:1px solid rgba(255,255,255,0.06);">
        <div style="max-width:360px;margin:0 auto;">
          <p style="color:#55555580;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;margin-bottom:24px;font-family:'Inter',sans-serif;">QR CODE</p>
          <div style="background:#fff;border-radius:8px;padding:24px;display:inline-block;">
            <QrCode :value="a.qrValue.value" :size="160" />
          </div>
          <p style="color:#e0e0e040;font-size:12px;margin-top:16px;font-family:'Inter',sans-serif;">Scan to verify attendance</p>
        </div>
      </section>

      <!-- ── GIFT SECTION ───────────────────────────────────────────── -->
      <section v-if="props.inv?.bankName || props.inv?.giftQrImageUrl" style="padding:48px 24px;background:#111111;border-top:1px solid rgba(255,255,255,0.06);">
        <div style="max-width:480px;margin:0 auto;text-align:center;">
          <p style="color:#55555580;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;margin-bottom:24px;font-family:'Inter',sans-serif;">GIFT</p>
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:32px;">
            <div v-if="props.inv.bankName" style="margin-bottom:24px;">
              <div style="color:#888;font-size:13px;font-family:'Inter',sans-serif;margin-bottom:8px;">{{ props.inv.bankName }}</div>
              <div style="color:#fff;font-size:20px;font-weight:600;letter-spacing:0.1em;font-family:'Inter',sans-serif;">{{ props.inv.bankAccount }}</div>
              <div style="color:#888;font-size:13px;margin-top:4px;font-family:'Inter',sans-serif;">{{ props.inv.bankAccountName }}</div>
            </div>
            <div v-if="props.inv.giftQrImageUrl">
              <img :src="a.imgUrl(props.inv.giftQrImageUrl)" style="width:180px;height:180px;object-fit:contain;border-radius:8px;margin:0 auto;" />
            </div>
          </div>
        </div>
      </section>

      <!-- ── GALLERY ────────────────────────────────────────────────── -->
      <InviteGallery
        :gallery="props.inv.gallery"
        :img-url-fn="a.imgUrl"
        section-style="padding:48px 24px;background:#0d0d0d;border-top:1px solid rgba(255,255,255,0.06);"
        item-style="border-radius:4px;overflow:hidden;aspect-ratio:1;background:rgba(255,255,255,0.04);"
        label="GALLERY"
        label-style="color:#55555580;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;text-align:center;margin-bottom:32px;font-family:'Inter',sans-serif;"
      />

      <!-- ── WISH FORM + LIST ───────────────────────────────────────── -->
      <section style="padding:48px 24px;background:#111111;border-top:1px solid rgba(255,255,255,0.06);">
        <div style="max-width:600px;margin:0 auto;">
          <p style="color:#55555580;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;text-align:center;margin-bottom:32px;font-family:'Inter',sans-serif;">WISHES</p>
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:24px;margin-bottom:24px;">
            <textarea v-model="a.wishForm.message" rows="4" placeholder="Leave a message..."
              style="width:100%;background:#ffffff06;border:1px solid rgba(255,255,255,0.1);border-radius:4px;padding:16px;color:#e0e0e0;font-family:'Inter',sans-serif;font-size:14px;resize:none;outline:none;box-sizing:border-box;" />
            <div v-if="a.wishError.value" style="color:#f87171;font-size:13px;margin-top:8px;font-family:'Inter',sans-serif;">{{ a.wishError.value }}</div>
            <div v-if="a.wishSuccess.value" style="color:#4ade80;font-size:13px;margin-top:8px;font-family:'Inter',sans-serif;">✓ Message sent!</div>
            <button @click="a.submitWish()" :disabled="a.wishLoading.value"
              style="margin-top:16px;width:100%;padding:14px;border-radius:4px;border:none;background:#fff;color:#000;font-size:14px;font-weight:600;font-family:'Inter',sans-serif;cursor:pointer;letter-spacing:0.05em;">
              {{ a.wishLoading.value ? 'Sending...' : 'Send' }}
            </button>
          </div>
          <div v-if="a.allWishes.value?.length" style="display:flex;flex-direction:column;gap:0;">
            <div v-for="(w, i) in a.allWishes.value" :key="i"
              style="padding:16px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
              <div style="color:#fff;font-size:13px;font-weight:500;margin-bottom:6px;font-family:'Inter',sans-serif;">{{ w.guestName }}</div>
              <div style="color:#e0e0e0cc;font-size:14px;line-height:1.7;font-family:'Inter',sans-serif;">{{ w.message }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── SHARE SECTION ──────────────────────────────────────────── -->
      <section style="padding:48px 24px;background:#0d0d0d;text-align:center;border-top:1px solid rgba(255,255,255,0.06);">
        <div style="max-width:360px;margin:0 auto;">
          <p style="color:#55555580;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;margin-bottom:24px;font-family:'Inter',sans-serif;">SHARE</p>
          <div style="display:flex;flex-direction:column;gap:10px;">
            <a v-if="props.inv?.telegramBotUrl" :href="props.inv.telegramBotUrl" target="_blank"
              style="display:flex;align-items:center;justify-content:center;gap:10px;padding:14px 24px;border-radius:4px;border:1px solid rgba(255,255,255,0.1);color:#e0e0e0;text-decoration:none;font-size:14px;font-family:'Inter',sans-serif;">
              Telegram
            </a>
            <a :href="a.whatsappLink.value" target="_blank"
              style="display:flex;align-items:center;justify-content:center;gap:10px;padding:14px 24px;border-radius:4px;border:1px solid rgba(255,255,255,0.1);color:#e0e0e0;text-decoration:none;font-size:14px;font-family:'Inter',sans-serif;">
              WhatsApp
            </a>
            <a :href="a.facebookLink.value" target="_blank"
              style="display:flex;align-items:center;justify-content:center;gap:10px;padding:14px 24px;border-radius:4px;border:1px solid rgba(255,255,255,0.1);color:#e0e0e0;text-decoration:none;font-size:14px;font-family:'Inter',sans-serif;">
              Facebook
            </a>
            <button @click="a.copyLink()"
              style="display:flex;align-items:center;justify-content:center;gap:10px;padding:14px 24px;border-radius:4px;border:1px solid rgba(255,255,255,0.1);background:transparent;color:#e0e0e0;font-size:14px;font-family:'Inter',sans-serif;cursor:pointer;width:100%;">
              {{ a.copied.value ? '✓ Copied!' : 'Copy Link' }}
            </button>
          </div>
        </div>
      </section>

      <!-- ── FOOTER ─────────────────────────────────────────────────── -->
      <footer style="padding:48px 24px;background:#111111;text-align:center;border-top:1px solid rgba(255,255,255,0.06);">
        <p style="font-family:'Inter',sans-serif;font-weight:600;font-size:clamp(14px,3vw,20px);color:#fff;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:8px;">
          {{ props.inv?.weddingTitle }}
        </p>
        <p style="color:#33333380;font-size:11px;font-family:'Inter',sans-serif;letter-spacing:0.3em;">— — —</p>
      </footer>

    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, toRef } from 'vue'
import { useInviteActions } from '~/composables/useInviteActions'

const props = defineProps({
  inv: { type: Object, required: true },
  token: { type: String, required: true },
  theme: { type: Object, default: () => null },
})

const a = useInviteActions(toRef(props, 'inv'), props.token)
const tc = computed(() => ({ primary: props.theme?.primary || '#e0e0e0', secondary: props.theme?.secondary || '#888888', bg: props.theme?.bg || '#0d0d0d', text: props.theme?.text || '#e0e0e0' }))
onMounted(() => a.startCountdown())

const statusStyle = computed(() => {
  const map = {
    CONFIRMED: 'background:#22c55e10;color:#4ade80;border:1px solid #22c55e25;',
    ATTENDED:  'background:#ffffff10;color:#fff;border:1px solid #ffffff20;',
    DECLINED:  'background:#ef444410;color:#f87171;border:1px solid #ef444425;',
    NO_SHOW:   'background:#f9731610;color:#fb923c;border:1px solid #f9731625;',
  }
  return (map[props.inv?.currentStatus] ?? '') + ' padding:8px 20px;border-radius:4px;font-size:13px;font-family:Inter,sans-serif;display:inline-flex;align-items:center;gap:8px;letter-spacing:0.05em;'
})
const statusIcon = computed(() => ({
  CONFIRMED: '✓', ATTENDED: '✓', DECLINED: '✗', NO_SHOW: '!',
})[props.inv?.currentStatus] ?? '')
const statusTextKh = computed(() => ({
  CONFIRMED: 'បានបញ្ជាក់វត្តមាន',
  ATTENDED:  'បានចុះឈ្មោះចូលរួម',
  DECLINED:  'បានបដិសេធ',
  NO_SHOW:   'មិនបានមក',
})[props.inv?.currentStatus] ?? '')
</script>

<style>
.invitation-enter {
  animation: fadeInUp 0.8s ease both;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-pulse-slow {
  animation: pulseSlow 3s ease-in-out infinite;
}
@keyframes pulseSlow {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}
</style>
