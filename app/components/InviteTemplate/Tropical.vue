<template>
  <div :style="{ fontFamily: 'Hanuman,sans-serif', background: tc.bg, minHeight: '100vh', color: tc.text, '--inv-primary': tc.primary, '--inv-secondary': tc.secondary }">

    <Head>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link href="https://fonts.googleapis.com/css2?family=Hanuman:wght@400;700&family=Pacifico&family=Poppins:wght@300;400;600&display=swap" rel="stylesheet" />
    </Head>

    <!-- YouTube Music Player -->
    <div v-if="a.youtubeEmbedId.value" style="position:fixed;bottom:24px;right:24px;z-index:1000;">
      <iframe
        :src="`https://www.youtube.com/embed/${a.youtubeEmbedId.value}?autoplay=1&loop=1&playlist=${a.youtubeEmbedId.value}&controls=0&mute=${a.musicPlaying.value ? 0 : 1}`"
        style="display:none;" allow="autoplay" />
      <button
        @click="a.musicPlaying.value = !a.musicPlaying.value"
        style="width:48px;height:48px;border-radius:50%;border:2px solid #2dd4bf;background:#04120fcc;color:#2dd4bf;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px);">
        {{ a.musicPlaying.value ? '🎵' : '🔇' }}
      </button>
    </div>

    <div class="invitation-enter">

      <!-- ── HERO COVER ─────────────────────────────────────────────── -->
      <section style="position:relative;min-height:100vh;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#04120f;">
        <div v-if="props.inv?.coverImage"
          :style="`position:absolute;inset:0;background-image:url('${a.imgUrl(props.inv.coverImage)}');background-size:cover;background-position:center;opacity:0.12;`" />
        <div style="position:absolute;inset:0;background:linear-gradient(to bottom,#04120fcc,#04120f99,#04120fff);" />

        <!-- Tropical decorations -->
        <div style="position:absolute;top:40px;left:24px;font-size:32px;opacity:0.45;">🌴</div>
        <div style="position:absolute;top:40px;right:24px;font-size:32px;opacity:0.45;">🌴</div>
        <div style="position:absolute;top:110px;left:8px;font-size:22px;opacity:0.3;">🌺</div>
        <div style="position:absolute;top:110px;right:8px;font-size:22px;opacity:0.3;">🌺</div>
        <div style="position:absolute;bottom:80px;left:16px;font-size:24px;opacity:0.3;">🦋</div>
        <div style="position:absolute;bottom:80px;right:16px;font-size:24px;opacity:0.3;">🌊</div>
        <div style="position:absolute;bottom:180px;left:40px;font-size:16px;opacity:0.2;">🌴</div>
        <div style="position:absolute;bottom:180px;right:40px;font-size:16px;opacity:0.2;">🌺</div>

        <!-- Concentric rings -->
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;">
          <div style="width:480px;height:480px;border-radius:50%;border:1px solid rgba(45,212,191,0.1);position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);" />
          <div style="width:400px;height:400px;border-radius:50%;border:1px solid rgba(45,212,191,0.14);position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);" />
          <div style="width:320px;height:320px;border-radius:50%;border:1px solid rgba(45,212,191,0.18);position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);" />
        </div>

        <div style="position:relative;text-align:center;padding:48px 24px;">
          <p style="color:#2dd4bf99;font-size:13px;letter-spacing:0.3em;margin-bottom:24px;font-family:'Poppins',sans-serif;">
            🌴 សូមគោរពអញ្ជើញ 🌴
          </p>

          <h1 style="font-family:'Pacifico',cursive;font-size:clamp(26px,6vw,48px);color:#2dd4bf;line-height:1.3;margin-bottom:8px;">
            {{ props.inv?.groomName }}
          </h1>
          <div style="color:#fb923c60;font-size:20px;margin:8px 0;">🌺 &amp; 🌺</div>
          <h1 style="font-family:'Pacifico',cursive;font-size:clamp(26px,6vw,48px);color:#2dd4bf;line-height:1.3;margin-bottom:32px;">
            {{ props.inv?.brideName }}
          </h1>

          <InviteCover
            :cover-image="props.inv.coverImage"
            :img-url-fn="a.imgUrl"
            wrapper-style="margin:0 auto 32px;width:180px;height:180px;border-radius:50%;border:3px solid #2dd4bf;overflow:hidden;box-shadow:0 0 0 8px rgba(45,212,191,0.1),0 0 0 16px rgba(45,212,191,0.05);"
          />

          <div style="color:#2dd4bf60;font-size:14px;letter-spacing:0.2em;margin-bottom:12px;">🌴 · · · 🌺 · · · 🌴</div>
          <p style="color:#fb923c;font-size:15px;font-family:'Poppins',sans-serif;">
            {{ a.fmtDateEn(props.inv?.weddingDate) }}
          </p>
          <p style="color:#2dd4bf80;font-size:13px;margin-top:4px;">
            {{ a.fmtDateKh(props.inv?.weddingDate) }}
          </p>
        </div>
      </section>

      <!-- ── GUEST GREETING ─────────────────────────────────────────── -->
      <section style="padding:48px 24px;text-align:center;background:#061a14;">
        <div style="max-width:480px;margin:0 auto;">
          <p style="color:#2dd4bf80;font-size:13px;letter-spacing:0.2em;margin-bottom:16px;">ជូនចំពោះ</p>
          <h2 style="font-family:'Pacifico',cursive;font-size:clamp(18px,4.5vw,28px);color:#e8faf8;margin-bottom:8px;">
            {{ props.inv?.guestName }}
          </h2>
          <p v-if="props.inv?.sideFamily" style="color:#2dd4bf;font-size:14px;margin-bottom:16px;">
            {{ a.sideFamilyKh(props.inv.sideFamily) }}
          </p>
          <p v-if="props.inv?.totalGuests" style="color:#e8faf899;font-size:13px;margin-bottom:20px;">
            ចំនួនទីកន្លែង: {{ props.inv.totalGuests }} នាក់
          </p>
          <div v-if="props.inv?.currentStatus && props.inv.currentStatus !== 'INVITED'" :style="statusStyle">
            <span>{{ statusIcon }}</span><span>{{ statusTextKh }}</span>
          </div>
        </div>
      </section>

      <!-- ── COUNTDOWN ──────────────────────────────────────────────── -->
      <section v-if="a.countdown.value" style="padding:48px 24px;background:#04120f;">
        <div style="max-width:480px;margin:0 auto;text-align:center;">
          <p style="color:#2dd4bf80;font-size:13px;letter-spacing:0.2em;margin-bottom:32px;">ពេលវេលានៅសល់</p>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;">
            <div v-for="unit in a.countdown.value" :key="unit.label"
              style="background:rgba(45,212,191,0.08);border:1px solid rgba(45,212,191,0.2);border-radius:16px;padding:20px 8px;">
              <div style="font-size:clamp(28px,7vw,40px);font-weight:700;color:#2dd4bf;font-family:'Poppins',sans-serif;line-height:1;">
                {{ unit.value }}
              </div>
              <div style="font-size:11px;color:#2dd4bf80;margin-top:8px;">{{ unit.label }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── COUPLE STORY ───────────────────────────────────────────── -->
      <section v-if="props.inv?.coupleStory" style="padding:48px 24px;background:#061a14;">
        <div style="max-width:600px;margin:0 auto;text-align:center;">
          <p style="color:#2dd4bf80;font-size:13px;letter-spacing:0.2em;margin-bottom:24px;">🌺 រឿងរ៉ាវរបស់យើង 🌺</p>
          <div style="width:48px;height:1px;background:#2dd4bf40;margin:0 auto 24px;" />
          <p style="color:#e8faf8cc;font-size:15px;line-height:2;white-space:pre-line;font-family:'Poppins',sans-serif;">{{ props.inv.coupleStory }}</p>
        </div>
      </section>

      <!-- ── WEDDING DETAILS ────────────────────────────────────────── -->
      <section style="padding:48px 24px;background:#04120f;">
        <div style="max-width:600px;margin:0 auto;">
          <p style="color:#2dd4bf80;font-size:13px;letter-spacing:0.2em;text-align:center;margin-bottom:32px;">ព័ត៌មានពិធី</p>
          <div style="display:grid;gap:16px;">
            <div style="background:rgba(45,212,191,0.08);border:1px solid rgba(45,212,191,0.2);border-radius:16px;padding:24px;display:flex;align-items:center;gap:16px;">
              <div style="width:48px;height:48px;border-radius:12px;background:rgba(45,212,191,0.12);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">📅</div>
              <div>
                <div style="color:#2dd4bf80;font-size:12px;margin-bottom:4px;">កាលបរិច្ឆេទ</div>
                <div style="color:#e8faf8;font-size:15px;">{{ a.fmtDateKh(props.inv?.weddingDate) }}</div>
                <div style="color:#e8faf899;font-size:12px;margin-top:2px;">{{ a.fmtDateEn(props.inv?.weddingDate) }}</div>
              </div>
            </div>
            <div style="background:rgba(45,212,191,0.08);border:1px solid rgba(45,212,191,0.2);border-radius:16px;padding:24px;display:flex;align-items:center;gap:16px;">
              <div style="width:48px;height:48px;border-radius:12px;background:rgba(45,212,191,0.12);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">⏰</div>
              <div>
                <div style="color:#2dd4bf80;font-size:12px;margin-bottom:4px;">ម៉ោង</div>
                <div style="color:#e8faf8;font-size:15px;">{{ a.fmtTime(props.inv?.weddingDate) }}</div>
              </div>
            </div>
            <div style="background:rgba(45,212,191,0.08);border:1px solid rgba(45,212,191,0.2);border-radius:16px;padding:24px;display:flex;align-items:center;gap:16px;">
              <div style="width:48px;height:48px;border-radius:12px;background:rgba(45,212,191,0.12);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">📍</div>
              <div>
                <div style="color:#2dd4bf80;font-size:12px;margin-bottom:4px;">ទីតាំង</div>
                <div style="color:#e8faf8;font-size:15px;">{{ props.inv?.weddingLocation }}</div>
                <a v-if="props.inv?.weddingLocation"
                  :href="`https://maps.google.com?q=${encodeURIComponent(props.inv.weddingLocation)}`"
                  target="_blank" style="color:#2dd4bf;font-size:12px;margin-top:4px;display:inline-block;">
                  មើលផែនទី →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── EVENT SCHEDULE ─────────────────────────────────────────── -->
      <section v-if="props.inv?.schedule?.length" style="padding:48px 24px;background:#061a14;">
        <div style="max-width:600px;margin:0 auto;">
          <p style="color:#2dd4bf80;font-size:13px;letter-spacing:0.2em;text-align:center;margin-bottom:32px;">🌴 កម្មវិធី 🌴</p>
          <div style="display:flex;flex-direction:column;gap:16px;">
            <div v-for="(item, i) in props.inv.schedule" :key="i"
              style="background:rgba(45,212,191,0.08);border:1px solid rgba(45,212,191,0.2);border-radius:16px;padding:20px 24px;display:flex;gap:16px;align-items:flex-start;">
              <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#0f766e,#2dd4bf);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff;flex-shrink:0;">
                {{ i + 1 }}
              </div>
              <div style="flex:1;">
                <div style="color:#2dd4bf;font-size:13px;margin-bottom:2px;">{{ a.fmtTime(item.scheduleTime) }}</div>
                <div style="color:#e8faf8;font-size:15px;font-weight:600;margin-bottom:4px;">{{ item.name }}</div>
                <div v-if="item.description" style="color:#e8faf899;font-size:13px;">{{ item.description }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── GOOGLE MAPS EMBED ──────────────────────────────────────── -->
      <section v-if="props.inv?.weddingLocation" style="background:#04120f;">
        <div style="max-width:600px;margin:0 auto;padding:0 24px 48px;">
          <iframe
            :src="`https://maps.google.com/maps?q=${encodeURIComponent(props.inv.weddingLocation)}&output=embed`"
            style="width:100%;height:240px;border:0;border-radius:16px;filter:hue-rotate(140deg) saturate(0.8);"
            loading="lazy" allowfullscreen />
        </div>
      </section>

      <!-- ── SEATING ────────────────────────────────────────────────── -->
      <section v-if="props.inv?.tableNumber" style="padding:48px 24px;background:#061a14;text-align:center;">
        <div style="max-width:360px;margin:0 auto;">
          <p style="color:#2dd4bf80;font-size:13px;letter-spacing:0.2em;margin-bottom:24px;">🌴 តុអង្គុយ 🌴</p>
          <div style="background:rgba(45,212,191,0.08);border:2px solid rgba(45,212,191,0.3);border-radius:24px;padding:40px 24px;">
            <div style="font-size:64px;font-weight:900;color:#2dd4bf;font-family:'Poppins',sans-serif;line-height:1;">
              {{ props.inv.tableNumber }}
            </div>
            <div v-if="props.inv.tableName" style="color:#e8faf899;font-size:14px;margin-top:12px;">{{ props.inv.tableName }}</div>
          </div>
        </div>
      </section>

      <!-- ── PERSONAL MESSAGE ───────────────────────────────────────── -->
      <section v-if="props.inv?.message" style="padding:48px 24px;background:#04120f;">
        <div style="max-width:600px;margin:0 auto;text-align:center;">
          <p style="color:#2dd4bf80;font-size:13px;letter-spacing:0.2em;margin-bottom:24px;">🌺 សាររបស់យើង 🌺</p>
          <div style="background:rgba(45,212,191,0.08);border:1px solid rgba(45,212,191,0.2);border-radius:16px;padding:32px;position:relative;">
            <div style="font-size:48px;color:#2dd4bf20;position:absolute;top:16px;left:20px;font-family:serif;line-height:1;">"</div>
            <p style="color:#e8faf8cc;font-size:15px;line-height:2;white-space:pre-line;font-family:'Poppins',sans-serif;position:relative;z-index:1;">{{ props.inv.message }}</p>
            <div style="font-size:48px;color:#2dd4bf20;position:absolute;bottom:0px;right:20px;font-family:serif;line-height:1;">"</div>
          </div>
        </div>
      </section>

      <!-- ── RSVP BUTTONS ───────────────────────────────────────────── -->
      <section v-if="props.inv?.currentStatus === 'INVITED' || props.inv?.currentStatus === 'CONFIRMED'"
        style="padding:48px 24px;background:#061a14;text-align:center;">
        <div style="max-width:360px;margin:0 auto;">
          <p style="color:#2dd4bf80;font-size:13px;letter-spacing:0.2em;margin-bottom:24px;">ការឆ្លើយតប</p>
          <div style="display:flex;flex-direction:column;gap:12px;">
            <button @click="a.rsvp('confirm')" :disabled="a.rsvpLoading.value !== null"
              style="padding:16px 32px;border-radius:999px;border:none;background:linear-gradient(135deg,#0f766e,#2dd4bf);color:#fff;font-size:15px;font-weight:700;font-family:'Hanuman',sans-serif;cursor:pointer;"
              :style="a.rsvpLoading.value === 'confirm' ? 'opacity:0.6' : ''">
              {{ a.rsvpLoading.value === 'confirm' ? 'កំពុងដំណើរការ...' : '✓ បញ្ជាក់វត្តមាន' }}
            </button>
            <button @click="a.rsvp('decline')" :disabled="a.rsvpLoading.value !== null"
              style="padding:16px 32px;border-radius:999px;border:1px solid rgba(45,212,191,0.3);background:transparent;color:#2dd4bf80;font-size:15px;font-family:'Hanuman',sans-serif;cursor:pointer;"
              :style="a.rsvpLoading.value === 'decline' ? 'opacity:0.6' : ''">
              {{ a.rsvpLoading.value === 'decline' ? 'កំពុងដំណើរការ...' : '✗ បដិសេធ' }}
            </button>
          </div>
        </div>
      </section>

      <!-- ── DECLINED STATE ─────────────────────────────────────────── -->
      <section v-if="props.inv?.currentStatus === 'DECLINED'" style="padding:48px 24px;text-align:center;background:#061a14;">
        <div style="max-width:360px;margin:0 auto;background:#ef444408;border:1px solid #ef444420;border-radius:16px;padding:32px;">
          <div style="font-size:48px;margin-bottom:16px;">😔</div>
          <p style="color:#f87171;font-size:15px;margin-bottom:8px;">អ្នកបានបដិសេធការអញ្ជើញ</p>
          <p style="color:#e8faf860;font-size:13px;">យើងនឹងខកខានអ្នក</p>
        </div>
      </section>

      <!-- ── QR CODE ────────────────────────────────────────────────── -->
      <section style="padding:48px 24px;background:#04120f;text-align:center;">
        <div style="max-width:360px;margin:0 auto;">
          <p style="color:#2dd4bf80;font-size:13px;letter-spacing:0.2em;margin-bottom:24px;">លេខកូដ QR</p>
          <div style="background:#fff;border-radius:16px;padding:24px;display:inline-block;">
            <QrCode :value="a.qrValue.value" :size="160" />
          </div>
          <p style="color:#e8faf860;font-size:12px;margin-top:16px;">ស្កែន QR Code សម្រាប់ចូលបញ្ជាក់</p>
        </div>
      </section>

      <!-- ── GIFT SECTION ───────────────────────────────────────────── -->
      <section v-if="props.inv?.bankName || props.inv?.giftQrImageUrl" style="padding:48px 24px;background:#061a14;">
        <div style="max-width:480px;margin:0 auto;text-align:center;">
          <p style="color:#2dd4bf80;font-size:13px;letter-spacing:0.2em;margin-bottom:24px;">🌺 ការផ្ញើអំណោយ 🌺</p>
          <div style="background:rgba(45,212,191,0.08);border:1px solid rgba(45,212,191,0.2);border-radius:16px;padding:32px;">
            <div v-if="props.inv.bankName" style="margin-bottom:24px;">
              <div style="color:#2dd4bf;font-size:14px;margin-bottom:8px;">{{ props.inv.bankName }}</div>
              <div style="color:#e8faf8;font-size:20px;font-weight:700;letter-spacing:0.1em;">{{ props.inv.bankAccount }}</div>
              <div style="color:#e8faf899;font-size:13px;margin-top:4px;">{{ props.inv.bankAccountName }}</div>
            </div>
            <div v-if="props.inv.giftQrImageUrl">
              <img :src="a.imgUrl(props.inv.giftQrImageUrl)" style="width:180px;height:180px;object-fit:contain;border-radius:12px;margin:0 auto;" />
            </div>
          </div>
        </div>
      </section>

      <!-- ── GALLERY ────────────────────────────────────────────────── -->
      <InviteGallery
        :gallery="props.inv.gallery"
        :img-url-fn="a.imgUrl"
        section-style="padding:48px 24px;background:#04120f;"
        item-style="border-radius:12px;overflow:hidden;aspect-ratio:1;background:rgba(45,212,191,0.08);border:1px solid rgba(45,212,191,0.15);"
        label="🌴 វិចិត្រសាល 🌴"
        label-style="color:#2dd4bf80;font-size:13px;letter-spacing:0.2em;text-align:center;margin-bottom:32px;"
      />

      <!-- ── WISH FORM + LIST ───────────────────────────────────────── -->
      <section style="padding:48px 24px;background:#061a14;">
        <div style="max-width:600px;margin:0 auto;">
          <p style="color:#2dd4bf80;font-size:13px;letter-spacing:0.2em;text-align:center;margin-bottom:32px;">🌊 ផ្ញើរប្រាប់ជូន 🌊</p>
          <div style="background:rgba(45,212,191,0.08);border:1px solid rgba(45,212,191,0.2);border-radius:16px;padding:24px;margin-bottom:24px;">
            <textarea v-model="a.wishForm.message" rows="4" placeholder="សរសេរអំណោយទានពាក្យ..."
              style="width:100%;background:#ffffff08;border:1px solid rgba(45,212,191,0.2);border-radius:12px;padding:16px;color:#e8faf8;font-family:'Hanuman',sans-serif;font-size:14px;resize:none;outline:none;box-sizing:border-box;" />
            <div v-if="a.wishError.value" style="color:#f87171;font-size:13px;margin-top:8px;">{{ a.wishError.value }}</div>
            <div v-if="a.wishSuccess.value" style="color:#4ade80;font-size:13px;margin-top:8px;">✓ បានផ្ញើជោគជ័យ!</div>
            <button @click="a.submitWish()" :disabled="a.wishLoading.value"
              style="margin-top:16px;width:100%;padding:14px;border-radius:999px;border:none;background:linear-gradient(135deg,#0f766e,#2dd4bf);color:#fff;font-size:14px;font-weight:700;font-family:'Hanuman',sans-serif;cursor:pointer;">
              {{ a.wishLoading.value ? 'កំពុងផ្ញើ...' : 'ផ្ញើ' }}
            </button>
          </div>
          <div v-if="a.allWishes.value?.length" style="display:flex;flex-direction:column;gap:12px;">
            <div v-for="(w, i) in a.allWishes.value" :key="i"
              style="background:rgba(45,212,191,0.08);border:1px solid rgba(45,212,191,0.2);border-radius:12px;padding:16px 20px;">
              <div style="color:#2dd4bf;font-size:13px;font-weight:600;margin-bottom:6px;">{{ w.guestName }}</div>
              <div style="color:#e8faf8cc;font-size:14px;line-height:1.7;">{{ w.message }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── SHARE SECTION ──────────────────────────────────────────── -->
      <section style="padding:48px 24px;background:#04120f;text-align:center;">
        <div style="max-width:360px;margin:0 auto;">
          <p style="color:#2dd4bf80;font-size:13px;letter-spacing:0.2em;margin-bottom:24px;">ចែករំលែក</p>
          <div style="display:flex;flex-direction:column;gap:12px;">
            <a v-if="props.inv?.telegramBotUrl" :href="props.inv.telegramBotUrl" target="_blank"
              style="display:flex;align-items:center;justify-content:center;gap:10px;padding:14px 24px;border-radius:999px;border:1px solid rgba(45,212,191,0.3);color:#e8faf8;text-decoration:none;font-size:14px;font-family:'Hanuman',sans-serif;">
              📱 Telegram
            </a>
            <a :href="a.whatsappLink.value" target="_blank"
              style="display:flex;align-items:center;justify-content:center;gap:10px;padding:14px 24px;border-radius:999px;border:1px solid rgba(45,212,191,0.3);color:#e8faf8;text-decoration:none;font-size:14px;font-family:'Hanuman',sans-serif;">
              💬 WhatsApp
            </a>
            <a :href="a.facebookLink.value" target="_blank"
              style="display:flex;align-items:center;justify-content:center;gap:10px;padding:14px 24px;border-radius:999px;border:1px solid rgba(45,212,191,0.3);color:#e8faf8;text-decoration:none;font-size:14px;font-family:'Hanuman',sans-serif;">
              📘 Facebook
            </a>
            <button @click="a.copyLink()"
              style="display:flex;align-items:center;justify-content:center;gap:10px;padding:14px 24px;border-radius:999px;border:1px solid rgba(45,212,191,0.3);background:transparent;color:#e8faf8;font-size:14px;font-family:'Hanuman',sans-serif;cursor:pointer;width:100%;">
              {{ a.copied.value ? '✓ បានចម្លង!' : '🔗 ចម្លងលីង' }}
            </button>
          </div>
        </div>
      </section>

      <!-- ── FOOTER ─────────────────────────────────────────────────── -->
      <footer style="padding:48px 24px;background:#061a14;text-align:center;border-top:1px solid rgba(45,212,191,0.15);">
        <p style="font-family:'Pacifico',cursive;font-size:clamp(14px,3.5vw,22px);color:#2dd4bf;margin-bottom:8px;">
          {{ props.inv?.weddingTitle }}
        </p>
        <p style="color:#2dd4bf40;font-size:14px;">🌴 🌺 🦋</p>
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
const tc = computed(() => ({ primary: props.theme?.primary || '#2dd4bf', secondary: props.theme?.secondary || '#99f6e4', bg: props.theme?.bg || '#04120f', text: props.theme?.text || '#e0f8f5' }))
onMounted(() => a.startCountdown())

const statusStyle = computed(() => {
  const map = {
    CONFIRMED: 'background:#22c55e15;color:#4ade80;border:1px solid #22c55e30;',
    ATTENDED:  'background:#2dd4bf15;color:#2dd4bf;border:1px solid #2dd4bf30;',
    DECLINED:  'background:#ef444415;color:#f87171;border:1px solid #ef444430;',
    NO_SHOW:   'background:#f9731615;color:#fb923c;border:1px solid #f9731630;',
  }
  return (map[props.inv?.currentStatus] ?? '') + ' padding:8px 20px;border-radius:999px;font-size:13px;font-family:Hanuman,sans-serif;display:inline-flex;align-items:center;gap:8px;'
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
</style>
