<template>
  <div :style="{ fontFamily: 'Hanuman,sans-serif', background: tc.bg, minHeight: '100vh', color: tc.text, '--inv-primary': tc.primary, '--inv-secondary': tc.secondary }">

    <Head>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link href="https://fonts.googleapis.com/css2?family=Hanuman:wght@400;700&family=Cinzel:wght@400;600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />
    </Head>

    <!-- YouTube Music Player -->
    <div v-if="a.youtubeEmbedId.value" style="position:fixed;bottom:24px;right:24px;z-index:1000;">
      <iframe
        :src="`https://www.youtube.com/embed/${a.youtubeEmbedId.value}?autoplay=1&loop=1&playlist=${a.youtubeEmbedId.value}&controls=0&mute=${a.musicPlaying.value ? 0 : 1}`"
        style="display:none;" allow="autoplay" />
      <button
        @click="a.musicPlaying.value = !a.musicPlaying.value"
        style="width:48px;height:48px;border-radius:50%;border:2px solid #c9a84c;background:#06091acc;color:#c9a84c;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px);">
        {{ a.musicPlaying.value ? '🎵' : '🔇' }}
      </button>
    </div>

    <div class="invitation-enter">

      <!-- ── HERO COVER ─────────────────────────────────────────────── -->
      <section style="position:relative;min-height:100vh;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#06091a;">
        <div v-if="props.inv?.coverImage"
          :style="`position:absolute;inset:0;background-image:url('${a.imgUrl(props.inv.coverImage)}');background-size:cover;background-position:center;opacity:0.1;`" />
        <div style="position:absolute;inset:0;background:linear-gradient(to bottom,#06091acc,#06091a88,#06091aff);" />
        <div style="position:absolute;inset:0;opacity:0.03;background-image:repeating-linear-gradient(45deg,#c9a84c 0,#c9a84c 1px,transparent 0,transparent 50%);background-size:24px 24px;" />

        <!-- Ornamental top -->
        <div style="position:absolute;top:32px;left:0;right:0;text-align:center;">
          <span style="color:#c9a84c50;font-size:20px;letter-spacing:12px;">✦ ◆ ✦</span>
        </div>

        <!-- Concentric rings -->
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;">
          <div style="width:500px;height:500px;border-radius:50%;border:1px solid rgba(200,146,58,0.08);position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);" />
          <div style="width:420px;height:420px;border-radius:50%;border:1px solid rgba(200,146,58,0.12);position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);" />
          <div style="width:340px;height:340px;border-radius:50%;border:1px solid rgba(200,146,58,0.16);position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);" />
        </div>

        <div style="position:relative;text-align:center;padding:48px 24px;">
          <div style="font-size:28px;margin-bottom:16px;">👑</div>
          <p style="color:#c9a84c80;font-size:12px;letter-spacing:0.4em;text-transform:uppercase;margin-bottom:24px;font-family:'Cinzel',serif;">
            Royal Wedding Invitation
          </p>
          <p style="color:#c9a84c60;font-size:13px;margin-bottom:20px;font-family:'Hanuman',sans-serif;">
            សូមគោរពអញ្ជើញ
          </p>

          <h1 style="font-family:'Cinzel',serif;font-weight:700;font-size:clamp(22px,6vw,44px);color:#c9a84c;letter-spacing:0.15em;text-transform:uppercase;line-height:1.2;margin-bottom:8px;">
            {{ props.inv?.groomName }}
          </h1>
          <div style="color:#c9a84c50;font-size:18px;margin:12px 0;">✦ &amp; ✦</div>
          <h1 style="font-family:'Cinzel',serif;font-weight:700;font-size:clamp(22px,6vw,44px);color:#c9a84c;letter-spacing:0.15em;text-transform:uppercase;line-height:1.2;margin-bottom:32px;">
            {{ props.inv?.brideName }}
          </h1>

          <InviteCover
            :cover-image="props.inv.coverImage"
            :img-url-fn="a.imgUrl"
            wrapper-style="margin:0 auto 32px;width:180px;height:180px;border-radius:50%;border:3px solid #c9a84c;overflow:hidden;box-shadow:0 0 0 8px rgba(200,146,58,0.1),0 0 0 16px rgba(200,146,58,0.05);"
          />

          <!-- Gold rule with diamond -->
          <div style="display:flex;align-items:center;gap:12px;margin:0 auto 20px;max-width:240px;">
            <div style="flex:1;height:1px;background:linear-gradient(to right,transparent,#c9a84c50);" />
            <span style="color:#c9a84c;font-size:12px;">◆</span>
            <div style="flex:1;height:1px;background:linear-gradient(to left,transparent,#c9a84c50);" />
          </div>

          <p style="color:#c9a84c;font-size:14px;font-family:'Cinzel',serif;letter-spacing:0.1em;">
            {{ a.fmtDateEn(props.inv?.weddingDate) }}
          </p>
          <p style="color:#c9a84c70;font-size:13px;margin-top:4px;">
            {{ a.fmtDateKh(props.inv?.weddingDate) }}
          </p>
        </div>
      </section>

      <!-- ── GUEST GREETING ─────────────────────────────────────────── -->
      <section style="padding:48px 24px;text-align:center;background:#080c22;">
        <div style="max-width:480px;margin:0 auto;">
          <div style="display:flex;align-items:center;gap:12px;margin:0 auto 20px;max-width:200px;">
            <div style="flex:1;height:1px;background:#c9a84c30;" />
            <span style="color:#c9a84c60;font-size:12px;">◆</span>
            <div style="flex:1;height:1px;background:#c9a84c30;" />
          </div>
          <p style="color:#c9a84c70;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:16px;font-family:'Cinzel',serif;">Honoured Guest</p>
          <p style="color:#c9a84c60;font-size:13px;margin-bottom:8px;font-family:'Hanuman',sans-serif;">ជូនចំពោះ</p>
          <h2 style="font-family:'Crimson Text',serif;font-size:clamp(22px,5vw,34px);color:#e8e0d0;margin-bottom:8px;">
            {{ props.inv?.guestName }}
          </h2>
          <p v-if="props.inv?.sideFamily" style="color:#c9a84c;font-size:13px;margin-bottom:12px;">
            {{ a.sideFamilyKh(props.inv.sideFamily) }}
          </p>
          <p v-if="props.inv?.totalGuests" style="color:#e8e0d090;font-size:13px;margin-bottom:20px;">
            ចំនួនទីកន្លែង: {{ props.inv.totalGuests }} នាក់
          </p>
          <div v-if="props.inv?.currentStatus && props.inv.currentStatus !== 'INVITED'" :style="statusStyle">
            <span>{{ statusIcon }}</span><span>{{ statusTextKh }}</span>
          </div>
        </div>
      </section>

      <!-- ── COUNTDOWN ──────────────────────────────────────────────── -->
      <section v-if="a.countdown.value" style="padding:48px 24px;background:#06091a;">
        <div style="max-width:480px;margin:0 auto;text-align:center;">
          <p style="color:#c9a84c70;font-size:12px;letter-spacing:0.3em;text-transform:uppercase;margin-bottom:32px;font-family:'Cinzel',serif;">ពេលវេលានៅសល់</p>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;">
            <div v-for="unit in a.countdown.value" :key="unit.label"
              style="background:rgba(200,146,58,0.06);border:1px solid rgba(200,146,58,0.2);border-radius:8px;padding:20px 8px;">
              <div style="font-size:clamp(28px,7vw,40px);font-weight:700;color:#c9a84c;font-family:'Cinzel',serif;line-height:1;">
                {{ unit.value }}
              </div>
              <div style="font-size:11px;color:#c9a84c70;margin-top:8px;font-family:'Hanuman',sans-serif;">{{ unit.label }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── COUPLE STORY ───────────────────────────────────────────── -->
      <section v-if="props.inv?.coupleStory" style="padding:48px 24px;background:#080c22;">
        <div style="max-width:600px;margin:0 auto;text-align:center;">
          <div style="display:flex;align-items:center;gap:12px;margin:0 auto 24px;max-width:240px;">
            <div style="flex:1;height:1px;background:#c9a84c30;" />
            <span style="color:#c9a84c60;font-size:12px;">◆</span>
            <div style="flex:1;height:1px;background:#c9a84c30;" />
          </div>
          <p style="color:#c9a84c70;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:24px;font-family:'Cinzel',serif;">Our Story</p>
          <p style="color:#e8e0d0cc;font-size:16px;line-height:2;white-space:pre-line;font-family:'Crimson Text',serif;">{{ props.inv.coupleStory }}</p>
        </div>
      </section>

      <!-- ── WEDDING DETAILS ────────────────────────────────────────── -->
      <section style="padding:48px 24px;background:#06091a;">
        <div style="max-width:600px;margin:0 auto;">
          <div style="text-align:center;margin-bottom:32px;">
            <div style="display:flex;align-items:center;gap:12px;margin:0 auto 12px;max-width:240px;">
              <div style="flex:1;height:1px;background:#c9a84c30;" />
              <span style="color:#c9a84c60;font-size:12px;">◆</span>
              <div style="flex:1;height:1px;background:#c9a84c30;" />
            </div>
            <p style="color:#c9a84c70;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;font-family:'Cinzel',serif;">ព័ត៌មានពិធី</p>
          </div>
          <div style="display:grid;gap:16px;">
            <div style="background:rgba(200,146,58,0.06);border:1px solid rgba(200,146,58,0.2);border-radius:8px;padding:24px;display:flex;align-items:center;gap:16px;">
              <div style="width:48px;height:48px;border-radius:8px;background:rgba(200,146,58,0.1);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">📅</div>
              <div>
                <div style="color:#c9a84c70;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;font-family:'Cinzel',serif;margin-bottom:4px;">Date</div>
                <div style="color:#e8e0d0;font-size:15px;font-family:'Crimson Text',serif;">{{ a.fmtDateKh(props.inv?.weddingDate) }}</div>
                <div style="color:#e8e0d090;font-size:12px;margin-top:2px;">{{ a.fmtDateEn(props.inv?.weddingDate) }}</div>
              </div>
            </div>
            <div style="background:rgba(200,146,58,0.06);border:1px solid rgba(200,146,58,0.2);border-radius:8px;padding:24px;display:flex;align-items:center;gap:16px;">
              <div style="width:48px;height:48px;border-radius:8px;background:rgba(200,146,58,0.1);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">⏰</div>
              <div>
                <div style="color:#c9a84c70;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;font-family:'Cinzel',serif;margin-bottom:4px;">Time</div>
                <div style="color:#e8e0d0;font-size:15px;font-family:'Crimson Text',serif;">{{ a.fmtTime(props.inv?.weddingDate) }}</div>
              </div>
            </div>
            <div style="background:rgba(200,146,58,0.06);border:1px solid rgba(200,146,58,0.2);border-radius:8px;padding:24px;display:flex;align-items:center;gap:16px;">
              <div style="width:48px;height:48px;border-radius:8px;background:rgba(200,146,58,0.1);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">📍</div>
              <div>
                <div style="color:#c9a84c70;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;font-family:'Cinzel',serif;margin-bottom:4px;">Venue</div>
                <div style="color:#e8e0d0;font-size:15px;font-family:'Crimson Text',serif;">{{ props.inv?.weddingLocation }}</div>
                <a v-if="props.inv?.weddingLocation"
                  :href="`https://maps.google.com?q=${encodeURIComponent(props.inv.weddingLocation)}`"
                  target="_blank" style="color:#c9a84c;font-size:12px;margin-top:4px;display:inline-block;">
                  មើលផែនទី →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── EVENT SCHEDULE ─────────────────────────────────────────── -->
      <section v-if="props.inv?.schedule?.length" style="padding:48px 24px;background:#080c22;">
        <div style="max-width:600px;margin:0 auto;">
          <div style="text-align:center;margin-bottom:32px;">
            <p style="color:#c9a84c70;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;font-family:'Cinzel',serif;">✦ ◆ ✦ កម្មវិធី ✦ ◆ ✦</p>
          </div>
          <div style="display:flex;flex-direction:column;gap:16px;">
            <div v-for="(item, i) in props.inv.schedule" :key="i"
              style="background:rgba(200,146,58,0.06);border:1px solid rgba(200,146,58,0.2);border-radius:8px;padding:20px 24px;display:flex;gap:16px;align-items:flex-start;">
              <div style="width:36px;height:36px;border-radius:4px;background:linear-gradient(135deg,#1a2a6c,#4a6fdb);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff;flex-shrink:0;font-family:'Cinzel',serif;">
                {{ String(i+1).padStart(2,'0') }}
              </div>
              <div style="flex:1;">
                <div style="color:#7b9fe8;font-size:12px;margin-bottom:2px;font-family:'Cinzel',serif;">{{ a.fmtTime(item.scheduleTime) }}</div>
                <div style="color:#e8e0d0;font-size:15px;font-weight:600;margin-bottom:4px;font-family:'Crimson Text',serif;">{{ item.name }}</div>
                <div v-if="item.description" style="color:#e8e0d099;font-size:13px;">{{ item.description }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── GOOGLE MAPS EMBED ──────────────────────────────────────── -->
      <section v-if="props.inv?.weddingLocation" style="background:#06091a;">
        <div style="max-width:600px;margin:0 auto;padding:0 24px 48px;">
          <iframe
            :src="`https://maps.google.com/maps?q=${encodeURIComponent(props.inv.weddingLocation)}&output=embed`"
            style="width:100%;height:240px;border:0;border-radius:8px;filter:grayscale(0.4) invert(0.85) hue-rotate(200deg);"
            loading="lazy" allowfullscreen />
        </div>
      </section>

      <!-- ── SEATING ────────────────────────────────────────────────── -->
      <section v-if="props.inv?.tableNumber" style="padding:48px 24px;background:#080c22;text-align:center;">
        <div style="max-width:360px;margin:0 auto;">
          <p style="color:#c9a84c70;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:24px;font-family:'Cinzel',serif;">✦ Royal Table ✦</p>
          <div style="background:rgba(200,146,58,0.06);border:2px solid rgba(200,146,58,0.3);border-radius:12px;padding:40px 24px;position:relative;">
            <div style="position:absolute;top:-1px;left:50%;transform:translateX(-50%);background:#080c22;padding:0 12px;">
              <span style="color:#c9a84c;font-size:12px;">◆</span>
            </div>
            <div style="font-size:72px;font-weight:700;color:#c9a84c;font-family:'Cinzel',serif;line-height:1;">
              {{ props.inv.tableNumber }}
            </div>
            <div v-if="props.inv.tableName" style="color:#e8e0d090;font-size:14px;margin-top:12px;font-family:'Crimson Text',serif;">{{ props.inv.tableName }}</div>
            <div style="position:absolute;bottom:-1px;left:50%;transform:translateX(-50%);background:#080c22;padding:0 12px;">
              <span style="color:#c9a84c;font-size:12px;">◆</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ── PERSONAL MESSAGE ───────────────────────────────────────── -->
      <section v-if="props.inv?.message" style="padding:48px 24px;background:#06091a;">
        <div style="max-width:600px;margin:0 auto;text-align:center;">
          <p style="color:#c9a84c70;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:24px;font-family:'Cinzel',serif;">✦ ◆ Royal Message ◆ ✦</p>
          <div style="background:rgba(200,146,58,0.06);border:1px solid rgba(200,146,58,0.2);border-radius:8px;padding:32px;position:relative;">
            <div style="font-size:48px;color:#c9a84c15;position:absolute;top:16px;left:20px;font-family:'Crimson Text',serif;line-height:1;">"</div>
            <p style="color:#e8e0d0cc;font-size:16px;line-height:2;white-space:pre-line;font-family:'Crimson Text',serif;position:relative;z-index:1;">{{ props.inv.message }}</p>
            <div style="font-size:48px;color:#c9a84c15;position:absolute;bottom:0px;right:20px;font-family:'Crimson Text',serif;line-height:1;">"</div>
          </div>
        </div>
      </section>

      <!-- ── RSVP BUTTONS ───────────────────────────────────────────── -->
      <section v-if="props.inv?.currentStatus === 'INVITED' || props.inv?.currentStatus === 'CONFIRMED'"
        style="padding:48px 24px;background:#080c22;text-align:center;">
        <div style="max-width:360px;margin:0 auto;">
          <p style="color:#c9a84c70;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:24px;font-family:'Cinzel',serif;">RSVP</p>
          <div style="display:flex;flex-direction:column;gap:12px;">
            <button @click="a.rsvp('confirm')" :disabled="a.rsvpLoading.value !== null"
              style="padding:16px 32px;border-radius:4px;border:none;background:linear-gradient(135deg,#1a2a6c,#4a6fdb);color:#fff;font-size:14px;font-weight:600;font-family:'Cinzel',serif;cursor:pointer;letter-spacing:0.05em;"
              :style="a.rsvpLoading.value === 'confirm' ? 'opacity:0.6' : ''">
              {{ a.rsvpLoading.value === 'confirm' ? 'Processing...' : '✦ បញ្ជាក់វត្តមាន ✦' }}
            </button>
            <button @click="a.rsvp('decline')" :disabled="a.rsvpLoading.value !== null"
              style="padding:16px 32px;border-radius:4px;border:1px solid rgba(200,146,58,0.3);background:transparent;color:#c9a84c80;font-size:14px;font-family:'Hanuman',sans-serif;cursor:pointer;"
              :style="a.rsvpLoading.value === 'decline' ? 'opacity:0.6' : ''">
              {{ a.rsvpLoading.value === 'decline' ? 'Processing...' : '✗ បដិសេធ' }}
            </button>
          </div>
        </div>
      </section>

      <!-- ── DECLINED STATE ─────────────────────────────────────────── -->
      <section v-if="props.inv?.currentStatus === 'DECLINED'" style="padding:48px 24px;text-align:center;background:#080c22;">
        <div style="max-width:360px;margin:0 auto;background:#ef444408;border:1px solid #ef444420;border-radius:8px;padding:32px;">
          <div style="font-size:48px;margin-bottom:16px;">😔</div>
          <p style="color:#f87171;font-size:15px;margin-bottom:8px;font-family:'Crimson Text',serif;">អ្នកបានបដិសេធការអញ្ជើញ</p>
          <p style="color:#e8e0d060;font-size:13px;">យើងនឹងខកខានអ្នក</p>
        </div>
      </section>

      <!-- ── QR CODE ────────────────────────────────────────────────── -->
      <section style="padding:48px 24px;background:#06091a;text-align:center;">
        <div style="max-width:360px;margin:0 auto;">
          <p style="color:#c9a84c70;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:24px;font-family:'Cinzel',serif;">Royal Entry Code</p>
          <div style="background:#fff;border-radius:8px;padding:24px;display:inline-block;box-shadow:0 0 0 4px rgba(200,146,58,0.2),0 0 0 8px rgba(200,146,58,0.08);">
            <QrCode :value="a.qrValue.value" :size="160" />
          </div>
          <p style="color:#e8e0d060;font-size:12px;margin-top:16px;">ស្កែន QR Code សម្រាប់ចូលបញ្ជាក់</p>
        </div>
      </section>

      <!-- ── GIFT SECTION ───────────────────────────────────────────── -->
      <section v-if="props.inv?.bankName || props.inv?.giftQrImageUrl" style="padding:48px 24px;background:#080c22;">
        <div style="max-width:480px;margin:0 auto;text-align:center;">
          <p style="color:#c9a84c70;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:24px;font-family:'Cinzel',serif;">✦ ◆ Royal Gift ◆ ✦</p>
          <div style="background:rgba(200,146,58,0.06);border:1px solid rgba(200,146,58,0.2);border-radius:8px;padding:32px;">
            <div v-if="props.inv.bankName" style="margin-bottom:24px;">
              <div style="color:#c9a84c;font-size:14px;margin-bottom:8px;font-family:'Cinzel',serif;">{{ props.inv.bankName }}</div>
              <div style="color:#e8e0d0;font-size:20px;font-weight:700;letter-spacing:0.1em;font-family:'Cinzel',serif;">{{ props.inv.bankAccount }}</div>
              <div style="color:#e8e0d090;font-size:13px;margin-top:4px;">{{ props.inv.bankAccountName }}</div>
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
        section-style="padding:48px 24px;background:#06091a;"
        item-style="border-radius:8px;overflow:hidden;aspect-ratio:1;background:rgba(200,146,58,0.06);border:1px solid rgba(200,146,58,0.15);"
        label="✦ Royal Gallery ✦"
        label-style="color:#c9a84c70;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;text-align:center;margin-bottom:32px;font-family:'Cinzel',serif;"
      />

      <!-- ── WISH FORM + LIST ───────────────────────────────────────── -->
      <section style="padding:48px 24px;background:#080c22;">
        <div style="max-width:600px;margin:0 auto;">
          <p style="color:#c9a84c70;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;text-align:center;margin-bottom:32px;font-family:'Cinzel',serif;">✦ ◆ ផ្ញើរប្រាប់ជូន ◆ ✦</p>
          <div style="background:rgba(200,146,58,0.06);border:1px solid rgba(200,146,58,0.2);border-radius:8px;padding:24px;margin-bottom:24px;">
            <textarea v-model="a.wishForm.message" rows="4" placeholder="សរសេរអំណោយទានពាក្យ..."
              style="width:100%;background:#ffffff06;border:1px solid rgba(200,146,58,0.2);border-radius:6px;padding:16px;color:#e8e0d0;font-family:'Hanuman',sans-serif;font-size:14px;resize:none;outline:none;box-sizing:border-box;" />
            <div v-if="a.wishError.value" style="color:#f87171;font-size:13px;margin-top:8px;">{{ a.wishError.value }}</div>
            <div v-if="a.wishSuccess.value" style="color:#4ade80;font-size:13px;margin-top:8px;">✦ បានផ្ញើជោគជ័យ!</div>
            <button @click="a.submitWish()" :disabled="a.wishLoading.value"
              style="margin-top:16px;width:100%;padding:14px;border-radius:4px;border:none;background:linear-gradient(135deg,#1a2a6c,#4a6fdb);color:#fff;font-size:14px;font-weight:600;font-family:'Cinzel',serif;cursor:pointer;letter-spacing:0.05em;">
              {{ a.wishLoading.value ? 'Sending...' : '✦ ផ្ញើ ✦' }}
            </button>
          </div>
          <div v-if="a.allWishes.value?.length" style="display:flex;flex-direction:column;gap:12px;">
            <div v-for="(w, i) in a.allWishes.value" :key="i"
              style="background:rgba(200,146,58,0.06);border:1px solid rgba(200,146,58,0.15);border-radius:8px;padding:16px 20px;">
              <div style="color:#c9a84c;font-size:13px;font-weight:600;margin-bottom:6px;font-family:'Cinzel',serif;">{{ w.guestName }}</div>
              <div style="color:#e8e0d0cc;font-size:14px;line-height:1.7;font-family:'Crimson Text',serif;">{{ w.message }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── SHARE SECTION ──────────────────────────────────────────── -->
      <section style="padding:48px 24px;background:#06091a;text-align:center;">
        <div style="max-width:360px;margin:0 auto;">
          <p style="color:#c9a84c70;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:24px;font-family:'Cinzel',serif;">✦ ចែករំលែក ✦</p>
          <div style="display:flex;flex-direction:column;gap:12px;">
            <a v-if="props.inv?.telegramBotUrl" :href="props.inv.telegramBotUrl" target="_blank"
              style="display:flex;align-items:center;justify-content:center;gap:10px;padding:14px 24px;border-radius:4px;border:1px solid rgba(200,146,58,0.3);color:#e8e0d0;text-decoration:none;font-size:14px;font-family:'Cinzel',serif;letter-spacing:0.05em;">
              Telegram
            </a>
            <a :href="a.whatsappLink.value" target="_blank"
              style="display:flex;align-items:center;justify-content:center;gap:10px;padding:14px 24px;border-radius:4px;border:1px solid rgba(200,146,58,0.3);color:#e8e0d0;text-decoration:none;font-size:14px;font-family:'Cinzel',serif;letter-spacing:0.05em;">
              WhatsApp
            </a>
            <a :href="a.facebookLink.value" target="_blank"
              style="display:flex;align-items:center;justify-content:center;gap:10px;padding:14px 24px;border-radius:4px;border:1px solid rgba(200,146,58,0.3);color:#e8e0d0;text-decoration:none;font-size:14px;font-family:'Cinzel',serif;letter-spacing:0.05em;">
              Facebook
            </a>
            <button @click="a.copyLink()"
              style="display:flex;align-items:center;justify-content:center;gap:10px;padding:14px 24px;border-radius:4px;border:1px solid rgba(200,146,58,0.3);background:transparent;color:#e8e0d0;font-size:14px;font-family:'Cinzel',serif;cursor:pointer;width:100%;letter-spacing:0.05em;">
              {{ a.copied.value ? '✦ Copied! ✦' : 'Copy Link' }}
            </button>
          </div>
        </div>
      </section>

      <!-- ── FOOTER ─────────────────────────────────────────────────── -->
      <footer style="padding:48px 24px;background:#080c22;text-align:center;border-top:1px solid rgba(200,146,58,0.15);">
        <div style="font-size:20px;margin-bottom:12px;">👑</div>
        <p style="font-family:'Cinzel',serif;font-size:clamp(14px,4vw,22px);color:#c9a84c;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:12px;">
          {{ props.inv?.weddingTitle }}
        </p>
        <div style="display:flex;align-items:center;gap:12px;margin:0 auto;max-width:200px;">
          <div style="flex:1;height:1px;background:#c9a84c25;" />
          <span style="color:#c9a84c40;font-size:12px;">◆</span>
          <div style="flex:1;height:1px;background:#c9a84c25;" />
        </div>
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
const tc = computed(() => ({ primary: props.theme?.primary || '#4a6fdb', secondary: props.theme?.secondary || '#c9a84c', bg: props.theme?.bg || '#06091a', text: props.theme?.text || '#e0e8ff' }))
onMounted(() => a.startCountdown())

const statusStyle = computed(() => {
  const map = {
    CONFIRMED: 'background:#22c55e12;color:#4ade80;border:1px solid #22c55e25;',
    ATTENDED:  'background:#c9a84c12;color:#c9a84c;border:1px solid #c9a84c25;',
    DECLINED:  'background:#ef444412;color:#f87171;border:1px solid #ef444425;',
    NO_SHOW:   'background:#f9731612;color:#fb923c;border:1px solid #f9731625;',
  }
  return (map[props.inv?.currentStatus] ?? '') + ' padding:8px 20px;border-radius:4px;font-size:13px;font-family:Cinzel,serif;display:inline-flex;align-items:center;gap:8px;letter-spacing:0.05em;'
})
const statusIcon = computed(() => ({
  CONFIRMED: '🎉', ATTENDED: '✅', DECLINED: '❌', NO_SHOW: '⚠️',
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
