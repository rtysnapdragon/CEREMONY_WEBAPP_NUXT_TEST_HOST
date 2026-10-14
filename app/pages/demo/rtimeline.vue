<script setup>
// pages/demo/timeline.vue
// RTimeline showcase — mirrors all official NuxtUI UTimeline examples
// plus SARIKA extras: RemixIcon, tags, bilingual, GitHub PR custom slot
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useTimeAgo } from '@vueuse/core'

definePageMeta({layout: 'navbar'})
// ── Shared items ───────────────────────────────────────────────────────────
const projectItems = ref([
  { date: 'Mar 15, 2025', title: 'Project Kickoff',       description: 'Kicked off the project with team alignment.',   icon: 'i-lucide-rocket',        value: 'kickoff'     },
  { date: 'Mar 22, 2025', title: 'Design Phase',          description: 'User research and design workshops.',           icon: 'i-lucide-palette',       value: 'design'      },
  { date: 'Mar 29, 2025', title: 'Development Sprint',    description: 'Frontend and backend development.',             icon: 'i-lucide-code',          value: 'development' },
  { date: 'Apr 5, 2025',  title: 'Testing & Deployment',  description: 'QA testing and performance optimization.',      icon: 'i-lucide-check-circle',  value: 'deployment'  },
])

// ── 4. Reverse v-model ────────────────────────────────────────────────────
const reverseVal = ref('design')

// ── 5. v-model + @select ──────────────────────────────────────────────────
const active = ref('kickoff')
function onSelect(_e, item) {
  if (item.value) active.value = item.value
}

// ── 8. Auto-play ──────────────────────────────────────────────────────────
const autoActive = ref(0)
let timer = null
onMounted(() => {
  timer = setInterval(() => {
    autoActive.value = (autoActive.value + 1) % projectItems.value.length
  }, 2000)
})
onBeforeUnmount(() => clearInterval(timer))

// ── 9. RemixIcon + tags ───────────────────────────────────────────────────
const startupItems = ref([
  { date: 'Jan 2025', title: 'Idea & Research',  riIcon: 'ri-lightbulb-flash-line',  description: 'Market research and feasibility study.',       tag: 'DONE' },
  { date: 'Feb 2025', title: 'Funding Round',    riIcon: 'ri-funds-line',             description: 'Seed funding secured from local investors.',   tag: 'DONE' },
  { date: 'Mar 2025', title: 'MVP Launch',       riIcon: 'ri-rocket-2-line',          description: 'Minimum viable product goes live.',             tag: 'LIVE' },
  { date: 'Apr 2025', title: 'User Acquisition', riIcon: 'ri-user-follow-line',       description: 'First 1,000 users onboarded.' },
  { date: 'May 2025', title: 'Scale',            riIcon: 'ri-bar-chart-grouped-line', description: 'Infrastructure and team expansion.' },
])
const startupActive = ref(2)

// ── 10. Bilingual ─────────────────────────────────────────────────────────
const khmItems = ref([
  { date: 'Mar 15', dateKm: '១៥ មីនា', title: 'Application', titleKm: 'ការដាក់ពាក្យ',     description: 'Submit your application form.',           descriptionKm: 'ដាក់ស្នើពាក្យសុំរបស់អ្នក។', riIcon: 'ri-file-add-line'         },
  { date: 'Mar 20', dateKm: '២០ មីនា', title: 'Review',       titleKm: 'ការពិនិត្យ',        description: 'Our team reviews your documents.',        descriptionKm: 'ក្រុមការងារពិនិត្យឯកសារ។',   riIcon: 'ri-search-eye-line'       },
  { date: 'Mar 28', dateKm: '២៨ មីនា', title: 'Decision',     titleKm: 'សេចក្ដីសម្រេច',      description: 'Final approval decision issued.',         descriptionKm: 'សេចក្ដីសម្រេចចុងក្រោយ។',     riIcon: 'ri-checkbox-circle-line'  },
])
const khmActive = ref(1)

// ── 11. GitHub PR ─────────────────────────────────────────────────────────
const prItems = [
  { username: 'J-Michalek',    date: '2025-05-24T14:58:55Z',       title: 'opened this',                                 avatar: { src: 'https://github.com/J-Michalek.png',    loading: 'lazy' }, value: 'open'     },
  { username: 'J-Michalek',    date: '2025-05-26T19:30:14+02:00',  title: 'marked this pull request as ready for review', icon:   'i-lucide-check-circle',                        value: 'ready'    },
  { username: 'benjamincanac', date: '2025-05-27T11:01:20Z',       title: 'commented on this',                           avatar: { src: 'https://github.com/benjamincanac.png', loading: 'lazy' }, description: "I've made a few changes, let me know what you think! Updated design, removed unnecessary divs.", value: 'comment1' },
  { username: 'J-Michalek',    date: '2025-05-27T11:15:00Z',       title: 'commented on this',                           avatar: { src: 'https://github.com/J-Michalek.png',    loading: 'lazy' }, description: 'Looks great! Good job on cleaning it up.',                                                       value: 'comment2' },
  { username: 'benjamincanac', date: '2025-05-27T12:00:00Z',       title: 'merged this',                                 icon:   'i-lucide-git-merge',                            value: 'merged'   },
]

// ── 12. Custom description ────────────────────────────────────────────────
const feedItems = ref([
  { date: '2 hours ago', title: 'New comment on your post',   riIcon: 'ri-chat-3-line',     description: 'Alice: "Great article! Learned a lot from it."' },
  { date: '5 hours ago', title: 'Your PR was merged',         riIcon: 'ri-git-merge-line',  description: 'feat/date-picker merged into main by @admin'    },
  { date: 'Yesterday',   title: 'New follower',               riIcon: 'ri-user-add-line',   description: 'Bob started following you.'                      },
  { date: '3 days ago',  title: 'Server deployment success',  riIcon: 'ri-server-line',     description: 'v2.4.1 deployed to production in 42s ✓'         },
])
</script>

<template>
  <RToast />

  <div class="dtl">
    <RPageHeader
      title="RTimeline"
      subtitle="NuxtUI UTimeline wrapper · all modes · custom slots · RemixIcon"
      icon="i-lucide-git-commit-vertical"
    />

    <!-- 1 — Vertical default-value -->
    <RCard title="Vertical (default)" icon="i-lucide-list" class="dtl__card dtl__half">
      <RTimeline :items="projectItems" :default-value="2" class="w-full" />
    </RCard>

    <!-- 2 — Alternating -->
    <RCard title="Alternating" icon="i-lucide-layout-dashboard" class="dtl__card dtl__half">
      <div class="dtl__alt-wrap">
        <RTimeline :items="projectItems" :default-value="2" mode="alternating" />
      </div>
    </RCard>

    <!-- 3 — Horizontal -->
    <RCard title="Horizontal" icon="i-lucide-arrow-right" class="dtl__card">
      <RTimeline :items="projectItems" :default-value="2" mode="horizontal" class="w-full" />
    </RCard>

    <!-- 4 — Reverse + v-model -->
    <RCard title="Reverse + v-model" icon="i-lucide-arrow-up" class="dtl__card dtl__half">
      <RTimeline v-model="reverseVal" :items="projectItems" reverse class="w-full" />
      <p class="dtl__meta">Active: <code>{{ reverseVal }}</code></p>
    </RCard>

    <!-- 5 — v-model + @select -->
    <RCard title="v-model + @select" icon="i-lucide-pointer" class="dtl__card dtl__half">
      <RTimeline v-model="active" :items="projectItems" class="w-full" @select="onSelect" />
      <p class="dtl__meta">Active value: <code>{{ active }}</code></p>
    </RCard>

    <!-- 6 — size xs -->
    <RCard title="Size xs" icon="i-lucide-minimize-2" class="dtl__card dtl__half">
      <RTimeline :items="projectItems" :default-value="2" size="xs" class="w-full" />
    </RCard>

    <!-- 7 — color neutral -->
    <RCard title="Color neutral" icon="i-lucide-circle" class="dtl__card dtl__half">
      <RTimeline :items="projectItems" :default-value="2" color="neutral" class="w-full" />
    </RCard>

    <!-- 8 — Auto-play (official pattern) -->
    <RCard title="Auto-play — 2s interval" icon="i-lucide-play" class="dtl__card dtl__half">
      <RTimeline v-model="autoActive" :items="projectItems" class="w-full" />
      <p class="dtl__meta">
        <i class="ri-loop-left-line" />
        Auto-advances · index: <code>{{ autoActive }}</code>
      </p>
    </RCard>

    <!-- 9 — RemixIcon + tags -->
    <RCard title="RemixIcon + tags" icon="i-lucide-image" class="dtl__card dtl__half">
      <RTimeline v-model="startupActive" :items="startupItems" class="w-full" />
    </RCard>

    <!-- 10 — Bilingual km/en -->
    <RCard title="Bilingual km / en" icon="i-lucide-languages" class="dtl__card dtl__half">
      <RTimeline v-model="khmActive" :items="khmItems" class="w-full" />
    </RCard>

    <!-- 11 — GitHub PR custom slots (mirrors official example exactly) -->
    <RCard title="Custom #title + #date — GitHub PR" icon="i-lucide-git-pull-request" class="dtl__card">
      <RTimeline
        :items="prItems"
        size="xs"
        :ui="{
          date: 'float-end ms-1',
          description: 'px-3 py-2 ring ring-default mt-2 rounded-md text-default',
        }"
        class="w-96"
      >
        <template #title="{ item }">
          <span class="dtl__pr-user">{{ item.username }}</span>
          <span class="dtl__pr-action">&nbsp;{{ item.title }}</span>
        </template>

        <template #date="{ item }">
          {{ useTimeAgo(new Date(item.date)).value }}
        </template>
      </RTimeline>
    </RCard>

    <!-- 12 — Custom #description -->
    <RCard title="Custom #description slot" icon="i-lucide-layout-list" class="dtl__card dtl__half">
      <RTimeline :items="feedItems" :default-value="0" size="sm" class="w-full">
        <template #description="{ item }">
          <div class="dtl__feed-card">
            <i class="ri-double-quotes-l dtl__feed-quote" aria-hidden="true" />
            {{ item.description }}
          </div>
        </template>
      </RTimeline>
    </RCard>

    <!-- 13 — :ui passthrough float date right -->
    <RCard title=":ui passthrough — float date" icon="i-lucide-sliders-horizontal" class="dtl__card dtl__half">
      <RTimeline
        :items="projectItems.slice(0, 3)"
        :default-value="1"
        size="sm"
        :ui="{ date: 'float-end text-xs text-muted' }"
        class="w-full"
      />
    </RCard>

  </div>
</template>

<style lang="scss" scoped>

.dtl {
  padding:        var(--space-8);
  max-width:      900px;
  margin:         0 auto;
  display:        grid;
  grid-template-columns: 1fr 1fr;
  gap:            var(--space-5);
  align-items:    start;

  > :first-child  { grid-column: 1 / -1; }

  &__card { width: 100%; grid-column: 1 / -1; }
  &__half { grid-column: span 1; }

  @include tablet-only { grid-template-columns: 1fr; .dtl__half { grid-column: 1 / -1; } }
  @include mobile-only { padding: var(--space-4); grid-template-columns: 1fr; .dtl__half { grid-column: 1 / -1; } }

  &__alt-wrap { overflow-x: hidden; padding: var(--space-2) 0; }

  &__meta {
    margin:      var(--space-3) 0 0;
    font-size:   0.78rem;
    color:       var(--c-muted);
    display:     flex;
    align-items: center;
    gap:         var(--space-2);
    i { color: var(--c-accent); }
    code {
      font-size: 0.72rem; padding: 1px 8px;
      background: rgba(255,140,66,0.08); border: 1px solid rgba(255,140,66,0.15);
      border-radius: var(--radius-sm); color: var(--c-accent);
      font-family: 'Fira Code', monospace;
    }
  }

  &__pr-user   { font-weight: 600; color: var(--c-text); }
  &__pr-action { font-weight: 400; color: var(--c-muted); }

  &__feed-card {
    position: relative; margin-top: var(--space-2);
    padding: var(--space-3) var(--space-4);
    background: var(--bg-tertiary); border: 1px solid var(--c-border);
    border-left: 3px solid var(--c-accent); border-radius: var(--radius-md);
    font-size: 0.8rem; color: var(--c-text); line-height: 1.55;
  }
  &__feed-quote {
    position: absolute; top: var(--space-2); right: var(--space-3);
    font-size: 1.2rem; color: var(--c-border); line-height: 1;
  }
}
</style>
