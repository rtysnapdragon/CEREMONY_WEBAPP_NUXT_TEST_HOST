<script setup lang="ts">
// pages/demo/timeline.vue
// Full RTimeline1 showcase — all modes, slots, autoplay, bilingual, custom content
import { ref, onMounted, onBeforeUnmount } from 'vue'
definePageMeta({layout: 'navbar'})
// ── 1. Basic vertical (NuxtUI icons) ────────────────────────────────────────
const basicActive = ref(2)
const basicItems: RTimelineItem[] = [
  { date: 'Mar 15, 2025', title: 'Project Kickoff',         icon: 'i-lucide-rocket',       description: 'Team aligned on goals and roadmap.' },
  { date: 'Mar 22, 2025', title: 'Design Phase',            icon: 'i-lucide-palette',       description: 'Wireframes, prototypes and design tokens.' },
  { date: 'Mar 29, 2025', title: 'Development Sprint',      icon: 'i-lucide-code',          description: 'Feature development and component library.' },
  { date: 'Apr 5, 2025',  title: 'Testing & Deployment',    icon: 'i-lucide-check-circle',  description: 'QA, E2E tests and production release.' },
]

// ── 2. RemixIcon items ───────────────────────────────────────────────────────
const remixActive = ref(1)
const remixItems: RTimelineItem[] = [
  { date: 'Jan 2025', title: 'Idea & Research',   riIcon: 'ri-lightbulb-flash-line',  description: 'Market research and feasibility study.' },
  { date: 'Feb 2025', title: 'Funding Round',     riIcon: 'ri-funds-line',             description: 'Seed funding secured from local investors.',  tag: 'NEW' },
  { date: 'Mar 2025', title: 'MVP Launch',        riIcon: 'ri-rocket-2-line',          description: 'Minimum viable product goes live.', tag: 'LIVE' },
  { date: 'Apr 2025', title: 'User Acquisition',  riIcon: 'ri-user-follow-line',       description: 'First 1,000 users onboarded.' },
  { date: 'May 2025', title: 'Scale',             riIcon: 'ri-bar-chart-grouped-line', description: 'Infrastructure and team expansion.' },
]

// ── 3. Alternating (official UTimeline style) ────────────────────────────────
const altActive = ref(1)
const altItems: RTimelineItem[] = [
  { date: 'Q1 2025', title: 'Planning',     riIcon: 'ri-compass-3-line',      description: 'Strategy and resource planning.' },
  { date: 'Q2 2025', title: 'Build',        riIcon: 'ri-tools-line',           description: 'Core product development.' },
  { date: 'Q3 2025', title: 'Beta',         riIcon: 'ri-flask-line',           description: 'Closed beta with 500 testers.' },
  { date: 'Q4 2025', title: 'Launch',       riIcon: 'ri-global-line',          description: 'Public release worldwide.' },
]

// ── 4. Horizontal ───────────────────────────────────────────────────────────
const hActive = ref(1)
const hItems: RTimelineItem[] = [
  { date: '09:00', title: 'Open',     riIcon: 'ri-door-open-line'   },
  { date: '10:30', title: 'Meeting',  riIcon: 'ri-team-line'         },
  { date: '12:00', title: 'Lunch',    riIcon: 'ri-restaurant-2-line' },
  { date: '14:00', title: 'Sprint',   riIcon: 'ri-speed-line'        },
  { date: '17:00', title: 'Wrap-up',  riIcon: 'ri-checkbox-circle-line' },
]

// ── 5. Auto-play ─────────────────────────────────────────────────────────────
const autoActive = ref(0)

// ── 6. Status colors ──────────────────────────────────────────────────────────
const statusActive = ref(1)
const statusItems: RTimelineItem[] = [
  { date: '10:00', title: 'Package received',  riIcon: 'ri-inbox-archive-line', color: 'success', description: 'Arrived at sorting facility.' },
  { date: '13:30', title: 'In transit',        riIcon: 'ri-truck-line',          color: 'accent',  description: 'On the way to your city.' },
  { date: '16:00', title: 'Customs check',     riIcon: 'ri-building-2-line',     color: 'warning', description: 'Awaiting customs clearance.' },
  { date: '—',     title: 'Out for delivery',  riIcon: 'ri-e-bike-2-line',       color: 'muted',   description: 'Estimated: tomorrow.' },
]

// ── 7. Badges ─────────────────────────────────────────────────────────────────
const badgeActive = ref(0)
const badgeItems: RTimelineItem[] = [
  { date: 'Today',    title: 'Notifications', riIcon: 'ri-notification-3-line', badge: 5, color: 'danger' },
  { date: 'Yesterday',title: 'Messages',      riIcon: 'ri-message-3-line',       badge: 2, color: 'info' },
  { date: 'Mon',      title: 'Updates',       riIcon: 'ri-refresh-line',         badge: 0 },
]

// ── 8. Bilingual ──────────────────────────────────────────────────────────────
const khmActive = ref(1)
const khmItems: RTimelineItem[] = [
  {
    date: 'ថ្ងៃចន្ទ ១៥', dateKm: 'ថ្ងៃចន្ទ ១៥ មីនា',
    title: 'Application', titleKm: 'ការដាក់ពាក្យ',
    description: 'Submit your application form.', descriptionKm: 'ដាក់ស្នើពាក្យសុំរបស់អ្នក។',
    riIcon: 'ri-file-add-line',
  },
  {
    date: 'Mar 20',        dateKm: '២០ មីនា',
    title: 'Review',       titleKm: 'ការពិនិត្យ',
    description: 'Our team reviews your documents.', descriptionKm: 'ក្រុមការងារពិនិត្យឯកសាររបស់អ្នក។',
    riIcon: 'ri-search-eye-line',
  },
  {
    date: 'Mar 28',        dateKm: '២៨ មីនា',
    title: 'Decision',     titleKm: 'សេចក្ដីសម្រេច',
    description: 'Final approval decision issued.', descriptionKm: 'សេចក្ដីសម្រេចចុងក្រោយចេញ។',
    riIcon: 'ri-checkbox-circle-line',
  },
]

// ── 9. Custom #indicator + #content slots ────────────────────────────────────
const customActive = ref(0)
const customItems: RTimelineItem[] = [
  { date: 'Step 1', title: 'Upload CV',        description: 'PDF or DOCX, max 5MB',      riIcon: 'ri-upload-cloud-2-line' },
  { date: 'Step 2', title: 'HR Screen',        description: 'Phone call (15-20 min)',     riIcon: 'ri-phone-line'          },
  { date: 'Step 3', title: 'Technical Test',   description: 'Online coding assessment',   riIcon: 'ri-code-s-slash-line'   },
  { date: 'Step 4', title: 'Final Interview',  description: 'With product team (1hr)',    riIcon: 'ri-group-line'          },
  { date: 'Step 5', title: 'Offer',            description: '🎉 Offer letter sent',       riIcon: 'ri-award-line', color: 'success' },
]

// Custom progress percentages per step
const stepProgress = [100, 100, 60, 0, 0]
</script>

<template>
  <RToast />

  <div class="dtl">

    <RPageHeader
      title="RTimeline1"
      subtitle="All modes · slots · RemixIcon · autoplay · bilingual · dark/light"
      icon="i-lucide-git-commit-vertical"
    />

    <!-- ── 1. Basic vertical ─────────────────────────────── -->
    <RCard title="Vertical — NuxtUI icons" icon="i-lucide-info" class="dtl__card">
      <RTimeline1
        v-model="basicActive"
        :items="basicItems"
      />
    </RCard>

    <!-- ── 2. RemixIcon + tags ───────────────────────────── -->
    <RCard title="RemixIcon + tags" icon="i-lucide-image" class="dtl__card dtl__card--half">
      <RTimeline1
        v-model="remixActive"
        :items="remixItems"
        size="lg"
      />
    </RCard>

    <!-- ── 3. Alternating ────────────────────────────────── -->
    <RCard title="Alternating (official UTimeline style)" icon="i-lucide-layout-dashboard" class="dtl__card">
      <div class="dtl__alt-wrap">
        <RTimeline1
          v-model="altActive"
          :items="altItems"
          mode="alternating"
          class="w-full"
        />
      </div>
    </RCard>

    <!-- ── 4. Horizontal ─────────────────────────────────── -->
    <RCard title="Horizontal" icon="i-lucide-arrow-right" class="dtl__card">
      <RTimeline1
        v-model="hActive"
        :items="hItems"
        mode="horizontal"
      >
        <template #content="{ item, index }">
          <div class="dtl__h-content">
            <i :class="hItems[index]?.riIcon" class="dtl__h-icon" />
            <p>{{ item?.title }} details go here.</p>
          </div>
        </template>
      </RTimeline1>
    </RCard>

    <!-- ── 5. Auto-play ───────────────────────────────────── -->
    <RCard title="Auto-play" icon="i-lucide-play-circle" class="dtl__card dtl__card--half">
      <RTimeline1
        v-model="autoActive"
        :items="basicItems"
        :show-date="false"
        auto-play
        :auto-play-interval="1800"
      />
      <p class="dtl__sub">
        <i class="ri-loop-left-line" /> Auto-advances every 1.8s
      </p>
    </RCard>

    <!-- ── 6. Status colors ───────────────────────────────── -->
    <RCard title="Status colors" icon="i-lucide-palette" class="dtl__card dtl__card--half">
      <RTimeline1
        v-model="statusActive"
        :items="statusItems"
      />
    </RCard>

    <!-- ── 7. Badges ──────────────────────────────────────── -->
    <RCard title="Badge overlays" icon="i-lucide-badge" class="dtl__card dtl__card--half">
      <RTimeline1
        v-model="badgeActive"
        :items="badgeItems"
        :show-date="false"
      />
    </RCard>

    <!-- ── 8. Bilingual km/en ─────────────────────────────── -->
    <RCard title="Bilingual km / en" icon="i-lucide-languages" class="dtl__card dtl__card--half">
      <RTimeline1
        v-model="khmActive"
        :items="khmItems"
      />
    </RCard>

    <!-- ── 9. Custom #indicator + #content ──────────────── -->
    <RCard title="Custom slots — hiring pipeline" icon="i-lucide-layers" class="dtl__card dtl__card--half">
      <RTimeline1
        v-model="customActive"
        :items="customItems"
        :show-date="false"
      >
        <!-- Custom indicator: numbered circle with glow -->
        <template #indicator="{ index, isActive, isPast }">
          <span
            :class="[
              'dtl__step-num',
              { 'dtl__step-num--active': isActive, 'dtl__step-num--done': isPast },
            ]"
          >
            <i v-if="isPast" class="ri-check-line" />
            <template v-else>{{ index + 1 }}</template>
          </span>
        </template>

        <!-- Custom content: progress bar -->
        <template #content="{ index, isActive }">
          <Transition name="dtl-fade">
            <div v-if="isActive || stepProgress[index] > 0" class="dtl__progress-wrap">
              <div class="dtl__progress-bar">
                <div
                  class="dtl__progress-fill"
                  :style="{ width: stepProgress[index] + '%' }"
                />
              </div>
              <span class="dtl__progress-pct">{{ stepProgress[index] }}%</span>
            </div>
          </Transition>
        </template>
      </RTimeline1>
    </RCard>

    <!-- ── 10. Custom #connector slot ───────────────────── -->
    <RCard title="Custom connector — dashed pulse" icon="i-lucide-git-merge" class="dtl__card dtl__card--half">
      <RTimeline1
        v-model="basicActive"
        :items="basicItems.slice(0, 3)"
        size="sm"
      >
        <template #connector="{ isPast }">
          <div :class="['dtl__custom-conn', { 'dtl__custom-conn--active': isPast }]" />
        </template>
      </RTimeline1>
    </RCard>

    <!-- ── 11. ui passthrough ────────────────────────────── -->
    <RCard title=":ui passthrough" icon="i-lucide-sliders-horizontal" class="dtl__card">
      <p class="dtl__sub">Even-row flip applied via <code>:ui</code> → identical to official NuxtUI alternating example.</p>
      <div class="dtl__alt-wrap">
        <RTimeline1
          v-model="altActive"
          :items="altItems"
          mode="alternating"
          :ui="{
            item: 'even:flex-row-reverse even:-translate-x-[calc(100%-2rem)] even:text-right',
          }"
          class="translate-x-[calc(50%-1rem)] w-full"
        />
      </div>
    </RCard>

  </div>
</template>

<style lang="scss" scoped>

.dtl {
  padding:        var(--space-8);
  max-width:      860px;
  margin:         0 auto;
  display:        grid;
  grid-template-columns: 1fr 1fr;
  gap:            var(--space-5);
  align-items:    start;

  @include tablet-only  { grid-template-columns: 1fr; }
  @include mobile-only  { padding: var(--space-4); grid-template-columns: 1fr; }

  // Header spans full width
  :first-child { grid-column: 1 / -1; }

  &__card         { width: 100%; grid-column: 1 / -1; }
  &__card--half   { grid-column: span 1; }

  &__alt-wrap {
    overflow-x: hidden;
    padding:    var(--space-2) 0;
  }

  &__sub {
    font-size:   0.75rem;
    color:       var(--c-muted);
    margin:      var(--space-3) 0 0;
    display:     flex;
    align-items: center;
    gap:         var(--space-2);
    i { color: var(--c-accent); }
    code {
      font-size:     0.7rem;
      padding:       1px 6px;
      background:    rgba(255,140,66,0.08);
      border-radius: var(--radius-sm);
      color:         var(--c-accent);
    }
  }

  // Horizontal content panel
  &__h-content {
    display:     flex;
    align-items: center;
    gap:         var(--space-3);
    padding:     var(--space-4);
    background:  var(--bg-tertiary);
    border:      1px dashed var(--c-border);
    border-radius: var(--radius-lg);
    font-size:   0.875rem;
    color:       var(--c-muted);
  }
  &__h-icon { font-size: 1.4rem; color: var(--c-accent); flex-shrink: 0; }

  // Custom numbered step indicator
  &__step-num {
    width:         32px;
    height:        32px;
    border-radius: 50%;
    border:        2px solid var(--c-border);
    background:    var(--bg-tertiary);
    color:         var(--c-muted);
    font-size:     0.82rem;
    font-weight:   700;
    @include flex-center;
    @include transition;

    &--active {
      border-color: var(--c-accent);
      background:   var(--c-accent);
      color:        #fff;
      box-shadow:   var(--glow-accent-sm);
    }

    &--done {
      border-color: var(--c-accent);
      background:   rgba(255,140,66,0.1);
      color:        var(--c-accent);
    }

    i { font-size: 1rem; }
  }

  // Progress bar in content slot
  &__progress-wrap {
    display:     flex;
    align-items: center;
    gap:         var(--space-3);
    padding:     var(--space-2) 0;
  }

  &__progress-bar {
    flex:          1;
    height:        6px;
    background:    var(--c-border);
    border-radius: var(--radius-full);
    overflow:      hidden;
  }

  &__progress-fill {
    height:        100%;
    background:    var(--c-accent);
    border-radius: var(--radius-full);
    box-shadow:    var(--glow-accent-sm);
    @include transition(slow);
  }

  &__progress-pct {
    font-size:   0.7rem;
    font-weight: 700;
    color:       var(--c-accent);
    min-width:   32px;
    text-align:  right;
  }

  // Custom dashed connector
  &__custom-conn {
    width:           2px;
    min-height:      32px;
    flex:            1;
    background:      repeating-linear-gradient(
      to bottom,
      var(--c-border) 0px,
      var(--c-border) 4px,
      transparent 4px,
      transparent 8px
    );
    @include transition;

    &--active {
      background: repeating-linear-gradient(
        to bottom,
        var(--c-accent) 0px,
        var(--c-accent) 4px,
        transparent 4px,
        transparent 8px
      );
    }
  }
}

// Transition
.dtl-fade-enter-active, .dtl-fade-leave-active { transition: opacity 0.2s ease; }
.dtl-fade-enter-from,   .dtl-fade-leave-to     { opacity: 0; }
</style>
