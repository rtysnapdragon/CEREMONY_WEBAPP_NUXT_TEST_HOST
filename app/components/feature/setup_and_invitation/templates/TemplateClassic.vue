<script setup>
// components/letter/templates/TemplateClassic.vue
// Classic warm crimson on ivory — the original Khmer ceremony style
const props = defineProps(['data', 'mini', 'device'])
const emit = defineEmits(['rsvp'])

const mini = computed(() => props.mini)
const device = computed(() => props.device)
const { tr } = useTr()

// Single normalised view model: legacy editor fields + invite API fields.
const { view, remaining, calendarLinks } = useInviteView(() => props.data)

const hasStory = computed(() => view.value.story.length > 0)
const hasBlessing = computed(() => !!view.value.blessing)

const scrollToRsvp = () => {
  document.getElementById('tc-rsvp-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <div class="lx-frame" :lang="view.lang" :data-device="device">
    <div class="tc-root" :class="{ 'tc-mini': mini }">
      <!-- Top border gradient -->
      <div class="tc-top-border" aria-hidden="true" />

      <!-- Header -->
      <header class="tc-header tc-anim">
        <div class="tc-ornament" aria-hidden="true">
          <span class="tc-orn-line" />
          <span class="tc-orn-lotus">❧</span>
          <span class="tc-orn-line" />
        </div>
        <div v-if="view.arUrl"><img :src="view.arUrl" alt="" /></div>
        <p class="tc-subtitle">{{ tr('invitation') }}</p>
        <h1 class="tc-title">{{ view.title }}</h1>
        <div class="tc-ornament" aria-hidden="true">
          <span class="tc-orn-line" />
          <span class="tc-orn-lotus">❧</span>
          <span class="tc-orn-line" />
        </div>
      </header>

      <!-- Invite to -->
      <RTemplateInvitedTo :inviteTo="view.inviteTo" class="tc-anim" />

      <!-- Guest greeting (API) -->
      <LetterExtras :view="view" :sections="['guest']" :mini="mini" class="tc-anim" />

      <!-- Opening -->
      <section class="tc-section tc-opening tc-anim">
        <p class="tc-pre-line">{{ view.opening }}</p>
      </section>

      <!-- Couple -->
      <section class="tc-section tc-couple tc-anim" aria-label="Couple">
        <div v-for="host in [view.host1, view.host2]" :key="host.role + host.name" class="tc-party-wrap">
          <div class="tc-party">
            <div class="tc-party-icon">
              <RImage
                :src="host.avatar"
                :alt="host.name"
                :width="100"
                :height="100"
                :class="'rounded-full'"
              />
            </div>
            <div class="tc-party-role">{{ tr(host.role) }}</div>
            <div class="tc-party-name-km">{{ host.name }}</div>
            <div class="tc-party-parents">
              <span v-for="p in host.parents" :key="p">{{ p }}</span>
            </div>
            <div class="tc-party-address">{{ host.address }}</div>
          </div>
        </div>
        <div class="tc-couple-divider" aria-hidden="true">
          <span class="tc-heart">♡</span>
        </div>
      </section>

      <!-- Parents' blessing (optional) -->
      <section v-if="hasBlessing" class="tc-section tc-blessing tc-anim">
        <div class="tc-section-heading" role="heading" aria-level="2">
          <span class="tc-sh-line" />
          <span>{{ tr('blessing') }}</span>
          <span class="tc-sh-line" />
        </div>
        <p class="tc-pre-line">{{ view.blessing }}</p>
      </section>

      <!-- Date & Venue -->
      <section class="tc-section tc-event-box tc-anim">
        <div class="tc-event-title">
          <i class="ri-calendar-heart-line" aria-hidden="true" /> {{ view.primaryDate }}
        </div>
        <div v-if="view.secondaryDate" class="tc-event-date-en">{{ view.secondaryDate }}</div>
        <div class="tc-divider-thin" />
        <div class="tc-venue-name">{{ view.venue }}</div>
        <div class="tc-venue-addr">{{ view.venueAddress }}</div>
        <div class="tc-event-actions">
          <a v-if="view.mapUrl" :href="view.mapUrl" target="_blank" rel="noopener" class="tc-map-btn">
            <i class="ri-map-pin-line" aria-hidden="true" /> {{ tr('view_map') }}
          </a>
          <a v-if="calendarLinks.googleUrl" :href="calendarLinks.googleUrl" target="_blank" rel="noopener" class="tc-map-btn tc-map-btn--ghost">
            <i class="ri-calendar-check-line" aria-hidden="true" /> {{ tr('add_to_calendar') }}
          </a>
        </div>
      </section>

      <!-- Ceremony / reception blocks (API) -->
      <LetterExtras :view="view" :sections="['events']" :mini="mini" class="tc-anim" />

      <!-- Countdown -->
      <section v-if="view.countdown.show && remaining.isValid && !remaining.isPast" class="tc-section tc-countdown tc-anim">
        <div class="tc-section-heading" role="heading" aria-level="2">
          <span class="tc-sh-line" />
          <span>{{ view.countdown.title || tr('countdown') }}</span>
          <span class="tc-sh-line" />
        </div>
        <div class="tc-countdown-grid" role="timer">
          <div class="tc-cd-unit">
            <span class="tc-cd-value">{{ remaining.days }}</span>
            <span class="tc-cd-label">{{ tr('days') }}</span>
          </div>
          <div class="tc-cd-unit">
            <span class="tc-cd-value">{{ remaining.hours }}</span>
            <span class="tc-cd-label">{{ tr('hours') }}</span>
          </div>
          <div class="tc-cd-unit">
            <span class="tc-cd-value">{{ remaining.minutes }}</span>
            <span class="tc-cd-label">{{ tr('minutes') }}</span>
          </div>
          <div class="tc-cd-unit">
            <span class="tc-cd-value">{{ remaining.seconds }}</span>
            <span class="tc-cd-label">{{ tr('seconds') }}</span>
          </div>
        </div>
      </section>

      <!-- Schedule -->
      <section class="tc-section tc-anim">
        <div class="tc-section-heading" role="heading" aria-level="2">
          <span class="tc-sh-line" />
          <span>{{ tr('ceremony_schedule') }}</span>
          <span class="tc-sh-line" />
        </div>
        <div class="tc-schedule-list">
          <div
            v-for="(item, i) in view.schedule"
            :key="item?.id ?? i"
            class="tc-schedule-item"
          >
            <div class="tc-sched-head">
              <span class="tc-sched-num">{{ i + 1 }}</span>
              <div>
                <div class="tc-sched-day">{{ item?.name ?? '' }}</div>
                <div v-if="item?.startTime || item?.endTime" class="tc-sched-time">
                  <i class="ri-time-line" aria-hidden="true" />
                  {{ item?.startTime ? String(item?.startTime).slice(0, 5) : '' }}
                  {{ item?.startTime && item?.endTime ? '–' : '' }}
                  {{ item?.endTime ? String(item?.endTime).slice(0, 5) : '' }}
                </div>
              </div>
            </div>
            <p v-if="item?.description" class="tc-sched-prog tc-pre-line">{{ item?.description }}</p>
          </div>
        </div>
      </section>

      <!-- Our Story (optional) -->
      <section v-if="hasStory" class="tc-section tc-story tc-anim">
        <div class="tc-section-heading" role="heading" aria-level="2">
          <span class="tc-sh-line" />
          <span>{{ view.storyTitle }}</span>
          <span class="tc-sh-line" />
        </div>
        <div class="tc-story-list">
          <div v-for="(chapter, i) in view.story" :key="i" class="tc-story-item">
            <div class="tc-story-year">{{ chapter.year }}</div>
            <div class="tc-story-body">
              <div class="tc-story-title">{{ chapter.title }}</div>
              <p class="tc-story-text">{{ chapter.text }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- RSVP -->
      <section v-if="view.rsvp.show" id="tc-rsvp-anchor" class="tc-section tc-rsvp tc-anim">
        <div class="tc-section-heading" role="heading" aria-level="2">
          <span class="tc-sh-line" />
          <span>{{ view.rsvp.title || tr('rsvp') }}</span>
          <span class="tc-sh-line" />
        </div>
        <p class="tc-pre-line">{{ view.rsvpNote }}</p>
        <div v-if="view.contacts" class="tc-contacts"><i class="ri-phone-fill" aria-hidden="true" /> {{ view.contacts }}</div>
      </section>
      <LetterExtras :view="view" :sections="['rsvp']" :mini="mini" class="tc-anim" @rsvp="emit('rsvp', $event)" />

      <!-- Gallery -->
      <section v-if="view.gallery.length" class="tc-section tc-anim">
        <div class="tc-section-heading" role="heading" aria-level="2">
          <span class="tc-sh-line" />
          <span>{{ view.galleryTitle || tr('gallery') }}</span>
          <span class="tc-sh-line" />
        </div>
        <div class="tc-gallery">
          <div
            v-for="img in view.gallery"
            :key="img.id"
            class="tc-gallery-item"
          >
            <img
              :src="img.url"
              :alt="img?.caption ?? ''"
              loading="lazy"
              @error="(e) => { e.target.src = '/images/default_thumbnail_image.png'; e.target.onerror = null }"
            />
            <p v-if="img?.caption" class="tc-gallery-cap">{{ img?.caption }}</p>
          </div>
        </div>
      </section>

      <!-- Meals · gifts · videos · wishes · thank-you (API) -->
      <LetterExtras
        :view="view"
        :sections="['meals', 'gifts', 'videos', 'wishes', 'thanks']"
        :mini="mini"
        class="tc-anim"
      />

      <!-- QRCode -->
      <section v-if="view.qrCode" class="tc-section tc-qr tc-anim">
        <QrCode :value="view.inviteUrl" :size="100" />
      </section>

      <!-- Footer -->
      <footer class="tc-footer tc-anim">
        <div class="tc-ornament tc-ornament--footer" aria-hidden="true">
          <span class="tc-orn-line" />
          <span class="tc-orn-lotus">❧</span>
          <span class="tc-orn-line" />
        </div>
        <p class="tc-closing">{{ view.closing }}</p>
        <p class="tc-signatures">
          <span>{{ view.host1.name }}</span>
          <span class="tc-sig-amp" aria-hidden="true">❤</span>
          <span>{{ view.host2.name }}</span>
        </p>
        <div class="tc-bottom-border" aria-hidden="true" />
      </footer>

      <!-- Sticky quick-action bar (guest view only, not in mini/preview mode) -->
      <nav v-if="!mini || device == 'tablet'" class="tc-quickbar tc-anim" aria-label="Quick actions">
        <button v-if="view.rsvp.show" type="button" class="tc-quickbar-btn" @click="scrollToRsvp">
          <i class="ri-mail-check-line" aria-hidden="true" /> {{ device !== 'mobile' ? tr('rsvp') : 'RSVP' }}
        </button>
        <a v-if="view.mapUrl" :href="view.mapUrl" target="_blank" rel="noopener" class="tc-quickbar-btn">
          <i class="ri-map-pin-line" aria-hidden="true" /> {{ device !== 'mobile' ? tr('view_map') : 'Map' }}
        </a>
        <a v-if="calendarLinks.googleUrl" :href="calendarLinks.googleUrl" target="_blank" rel="noopener" class="tc-quickbar-btn">
          <i class="ri-calendar-check-line" aria-hidden="true" /> {{ device !== 'mobile' ? tr('add_to_calendar') : 'Calendar' }}
        </a>
      </nav>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/letter' as *;

// ── Frame (container for responsive queries) ──────────────────────────────
.lx-frame {
  @include lx-frame;
  background: #f3e8dc;
}

// ── Root ──────────────────────────────────────────────────────────────────
.tc-root {
  // theme tokens consumed by <LetterExtras>
  --lx-accent: #c0392b;
  --lx-text: #2c1810;
  --lx-surface: rgba(0, 0, 0, .025);
  --lx-border: rgba(192, 57, 43, .2);
  --lx-radius: 12px;
  --lx-on-btn: #fff;
  --lx-gutter: 0px;

  --tc-pad-x: 28px;

  @include lx-card-column;
  position: relative;
  background: #fdf6ef;
  color: #2c1810;
  font-family: 'Battambang', 'NotoSansKhmer', serif;
  font-size: 14px;
  line-height: 1.8;
  padding: 32px var(--tc-pad-x) 40px;
  min-height: 100%;

  // faint watermark medallion behind everything — subtle, not distracting
  &::before {
    content: '';
    position: absolute;
    top: 120px;
    left: 50%;
    width: min(480px, 100%);
    aspect-ratio: 1;
    transform: translateX(-50%);
    background: radial-gradient(circle, rgba(192, 57, 43, .05), transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  > * { position: relative; z-index: 1; }

  &.tc-mini { font-size: 13px; --tc-pad-x: 20px; padding-block: 24px 32px; }

  @include lx-tablet  { --tc-pad-x: 48px; font-size: 15px; }
  @include lx-desktop { --tc-pad-x: 64px; font-size: 16px; }
}

.tc-pre-line { white-space: pre-line; margin: 0; }

// ── Entrance animation ───────────────────────────────────────────────────
.tc-anim { animation: tc-fade-up .7s cubic-bezier(.22, 1, .36, 1) both; }
@keyframes tc-fade-up {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
@include lx-reduce-motion {
  .tc-anim, .tc-heart { animation: none; }
}

// ── Borders ───────────────────────────────────────────────────────────────
.tc-top-border,
.tc-bottom-border {
  height: 3px;
  background: linear-gradient(90deg, transparent, #c0392b, transparent);
}
.tc-top-border    { margin: -32px calc(var(--tc-pad-x) * -1) 28px; }
.tc-bottom-border { margin: 28px calc(var(--tc-pad-x) * -1) -12px; }

// ── Header ────────────────────────────────────────────────────────────────
.tc-header { text-align: center; margin-bottom: 24px; }
.tc-subtitle { font-size: 11px; letter-spacing: .2em; text-transform: uppercase; color: #c0392b; margin-bottom: 8px; opacity: .8; }
.tc-title { font-size: clamp(18px, 4vw, 26px); font-weight: 700; color: #c0392b; line-height: 1.3; margin: 8px 0 12px; overflow-wrap: anywhere; }
@include lx-tablet  { .tc-title { font-size: 30px; } .tc-subtitle { font-size: 12px; } }
@include lx-desktop { .tc-title { font-size: 36px; } }

// ── Ornament ─────────────────────────────────────────────────────────────
.tc-ornament { display: flex; align-items: center; gap: 10px; justify-content: center; margin: 8px 0; opacity: .55; }
.tc-ornament--footer { margin-bottom: 12px; }
.tc-orn-line { flex: 1; max-width: 80px; height: 1px; background: #c0392b; }
.tc-orn-lotus { font-size: 14px; color: #c0392b; }

// ── Sections ─────────────────────────────────────────────────────────────
.tc-section { margin-bottom: 22px; }
.tc-section-heading { display: flex; align-items: center; gap: 10px; font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #c0392b; margin-bottom: 14px; opacity: .85; }
.tc-sh-line { flex: 1; height: 1px; background: #c0392b; opacity: .3; }
@include lx-tablet { .tc-section-heading { font-size: 12.5px; } }

// ── Opening ───────────────────────────────────────────────────────────────
.tc-opening { text-align: center; font-size: 13px; opacity: .9; padding: 0 8px; }
@include lx-tablet { .tc-opening { font-size: 15px; padding: 0 32px; } }

// ── Couple ────────────────────────────────────────────────────────────────
// DOM order: [groom wrap][bride wrap][divider] → placed in 3 columns on the grid
.tc-couple {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 16px;
  padding: 16px;
  background: rgba(0, 0, 0, .025);
  border: 1px solid rgba(192, 57, 43, .15);
  border-radius: 12px;

  .tc-party-wrap:nth-child(1) { grid-column: 1; grid-row: 1; }
  .tc-party-wrap:nth-child(2) { grid-column: 3; grid-row: 1; }
  .tc-couple-divider          { grid-column: 2; grid-row: 1; }

  @include lx-couple-stack;
  @include lx-narrow {
    .tc-party-wrap:nth-child(1) { grid-column: 1; grid-row: 1; }
    .tc-couple-divider          { grid-column: 1; grid-row: 2; padding-top: 0; }
    .tc-party-wrap:nth-child(2) { grid-column: 1; grid-row: 3; }
  }
  @include lx-tablet { gap: 28px; padding: 28px 24px; }
}
.tc-party { text-align: center; display: flex; flex-direction: column; gap: 3px; }
.tc-party-icon { font-size: 24px; margin-bottom: 4px; display: flex; justify-content: center; }
.tc-party-role { font-size: 10px; text-transform: uppercase; letter-spacing: .12em; color: #c0392b; opacity: .7; }
.tc-party-name-km { font-size: 15px; font-family: var(--font-400) !important; font-weight: 700 !important; color: #c0392b; overflow-wrap: anywhere; }
.tc-party-name-en { font-size: 12px; opacity: .6; }
.tc-party-parents { display: flex; flex-direction: column; font-size: 11px; opacity: .75; gap: 1px; margin-top: 4px; }
.tc-party-address { font-size: 10.5px; opacity: .6; margin-top: 4px; line-height: 1.5; }
.tc-couple-divider { display: flex; align-items: center; justify-content: center; padding-top: 36px; }
.tc-heart { font-size: 22px; color: #c0392b; animation: heartbeat 2s ease-in-out infinite; }
@keyframes heartbeat { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }
@include lx-tablet {
  .tc-party-name-km { font-size: 18px; }
  .tc-party-role { font-size: 11px; }
  .tc-party-parents { font-size: 12.5px; }
  .tc-party-address { font-size: 12px; }
}

// ── Blessing ─────────────────────────────────────────────────────────────
.tc-blessing { text-align: center; font-size: 13px; padding: 16px; border: 1px dashed rgba(192, 57, 43, .3); border-radius: 12px; background: rgba(192, 57, 43, .03); opacity: .95; }

// ── Event box ─────────────────────────────────────────────────────────────
.tc-event-box { text-align: center; padding: 18px; border: 1px solid rgba(192, 57, 43, .2); border-radius: 12px; background: rgba(192, 57, 43, .04); }
.tc-event-title { font-size: 15px; font-weight: 700; color: #c0392b; margin-bottom: 4px; font-family: var(--font-400); }
.tc-event-date-en { font-size: 11px; opacity: .6; margin-bottom: 12px; }
.tc-divider-thin { height: 1px; background: rgba(192, 57, 43, .2); margin: 10px auto; width: 60%; }
.tc-venue-name { font-size: 14px; font-weight: 600; margin-bottom: 4px; font-family: var(--font-400); overflow-wrap: anywhere; }
.tc-venue-addr { font-size: 12px; opacity: .7; margin-bottom: 10px; overflow-wrap: anywhere; }
.tc-event-actions { display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap; margin-top: 6px; }
.tc-map-btn {
  @include lx-interactive(#c0392b);
  display: inline-flex; align-items: center; gap: 5px; padding: 6px 14px;
  border: 1px solid rgba(192, 57, 43, .35); border-radius: 999px;
  font-size: 12px; color: #c0392b; text-decoration: none; background: rgba(192, 57, 43, .08);
  transition: background .2s;
  &:hover { background: rgba(192, 57, 43, .15); }
}
.tc-map-btn--ghost { background: transparent; }
@include lx-tablet { .tc-event-box { padding: 28px; } .tc-event-title { font-size: 18px; } .tc-venue-name { font-size: 16px; } .tc-venue-addr { font-size: 13.5px; } }

// ── Countdown ────────────────────────────────────────────────────────────
.tc-countdown-grid { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; }
.tc-cd-unit { display: flex; flex-direction: column; align-items: center; min-width: 62px; padding: 10px 6px; border-radius: 10px; background: rgba(192, 57, 43, .06); border: 1px solid rgba(192, 57, 43, .18); }
.tc-cd-value { font-size: 20px; font-weight: 700; color: #c0392b; font-variant-numeric: tabular-nums; }
.tc-cd-label { font-size: 9.5px; text-transform: uppercase; letter-spacing: .1em; opacity: .65; margin-top: 2px; }
@include lx-tablet { .tc-cd-unit { min-width: 84px; padding: 14px 10px; } .tc-cd-value { font-size: 28px; } .tc-cd-label { font-size: 11px; } }

// ── Schedule ──────────────────────────────────────────────────────────────
.tc-schedule-list {
  display: grid; gap: 10px;
  @include lx-desktop { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
.tc-schedule-item { border: 1px solid rgba(192, 57, 43, .15); border-radius: 10px; padding: 12px 14px; background: rgba(0, 0, 0, .02); }
.tc-sched-head { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 8px; }
.tc-sched-num { width: 22px; height: 22px; border-radius: 50%; background: rgba(192, 57, 43, .12); color: #c0392b; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
.tc-sched-day { font-size: 13px; font-weight: 700; color: #c0392b; }
.tc-sched-time { font-size: 11px; opacity: .65; }
.tc-sched-prog { font-size: 12px; line-height: 1.7; opacity: .85; }
@include lx-tablet { .tc-sched-day { font-size: 15px; } .tc-sched-time { font-size: 12.5px; } .tc-sched-prog { font-size: 13.5px; } }

// ── Story ────────────────────────────────────────────────────────────────
.tc-story-list { display: flex; flex-direction: column; gap: 12px; }
.tc-story-item { display: flex; gap: 12px; align-items: flex-start; }
.tc-story-year { flex: none; font-weight: 700; color: #c0392b; font-size: 13px; min-width: 44px; }
.tc-story-title { font-weight: 700; font-size: 13px; color: #2c1810; }
.tc-story-text { font-size: 12px; opacity: .8; margin: 2px 0 0; }
@include lx-tablet { .tc-story-title { font-size: 15px; } .tc-story-text { font-size: 13.5px; } .tc-story-year { font-size: 15px; min-width: 56px; } }

// ── RSVP ─────────────────────────────────────────────────────────────────
.tc-rsvp { font-size: 12.5px; scroll-margin-top: 24px; text-align: center; }
.tc-contacts { margin-top: 10px; font-weight: 600; font-size: 13px; color: #c0392b; font-family: var(--font-400); }

// ── Gallery ───────────────────────────────────────────────────────────────
.tc-gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 8px; @include lx-tablet { grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 12px; } }
.tc-gallery-item {
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid rgba(192, 57, 43, .15);

  img { width: 100%; aspect-ratio: 1; object-fit: cover; display: block; }
}
.tc-gallery-cap { font-size: 10px; text-align: center; color: #5c2318; padding: 3px 4px; background: rgba(253, 246, 239, .9); margin: 0; }

// ── QR ───────────────────────────────────────────────────────────────────
.tc-qr { display: flex; justify-content: center; }

// ── Footer ────────────────────────────────────────────────────────────────
.tc-footer { text-align: center; margin-top: 8px; }
.tc-closing { font-size: 13px; opacity: .75; margin-bottom: 14px; }
.tc-signatures { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 14px; font-size: 15px; font-weight: 700; span { color: #c0392b; } }
.tc-sig-amp { font-size: 14px; color: #c0392b !important; }
@include lx-tablet { .tc-signatures { font-size: 18px; } .tc-closing { font-size: 15px; } }

// ── Sticky quick-action bar ─────────────────────────────────────────────
.tc-quickbar {
  position: sticky;
  @include lx-safe-bottom(12px);
  z-index: 5;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
  padding: 10px;
  background: rgba(253, 246, 239, .92);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(192, 57, 43, .2);
  border-radius: 999px;
  box-shadow: 0 8px 24px rgba(192, 57, 43, .15);
}

.tc-quickbar-btn {
  @include lx-interactive(#fff);
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 14px;
  border: none;
  border-radius: 999px;
  background: #c0392b;
  color: #fff;
  font-size: 11.5px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  font-family: inherit;
  transition: transform .15s ease, box-shadow .15s ease;

  &:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(192, 57, 43, .35); }
  @include lx-reduce-motion { transition: none; &:hover { transform: none; } }
}
@include lx-tablet { .tc-quickbar { width: fit-content; margin-inline: auto; } .tc-quickbar-btn { font-size: 13px; padding: 8px 20px; } }
</style>