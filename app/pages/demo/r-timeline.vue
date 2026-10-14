<script setup lang="ts">
/**
 * pages/demo/timeline.vue
 * Full RTimeline_1 showcase — every prop, slot, color, mode
 */
import { ref, onMounted } from 'vue'

useHead({ title: 'RTimeline_1 — Demo' })
definePageMeta({ layout: 'navbar' })

// ── 1. Basic items ────────────────────────────────────────────────────────
const basicItems: RTimelineItem[] = [
  {
    date:        'Mar 15, 2025',
    title:       'Project Kickoff',
    description: 'Initial planning and team alignment meeting completed.',
    icon:        'i-lucide-rocket',
    value:       'kickoff',
  },
  {
    date:        'Mar 22, 2025',
    title:       'Design Phase',
    description: 'Wireframes and high-fidelity mockups delivered.',
    icon:        'i-lucide-palette',
    value:       'design',
  },
  {
    date:        'Mar 29, 2025',
    title:       'Development Sprint',
    description: 'Core features implemented and unit tested.',
    icon:        'i-lucide-code',
    value:       'development',
  },
  {
    date:        'Apr 5, 2025',
    title:       'Testing & Deployment',
    description: 'QA sign-off and production release.',
    icon:        'i-lucide-check-circle',
    value:       'deployment',
  },
]

// ── 2. Auto-play active step ───────────────────────────────────────────────
const autoActive = ref(0)
onMounted(() => {
  setInterval(() => {
    autoActive.value = (autoActive.value + 1) % basicItems.length
  }, 2000)
})

// ── 3. Status badges ──────────────────────────────────────────────────────
const statusItems: RTimelineItem[] = [
  {
    date:        'Jan 10, 2025',
    title:       'Order placed',
    icon:        'i-lucide-shopping-cart',
    status:      'Completed',
    statusColor: 'success',
    value:       0,
  },
  {
    date:        'Jan 11, 2025',
    title:       'Payment confirmed',
    icon:        'i-lucide-credit-card',
    status:      'Completed',
    statusColor: 'success',
    value:       1,
  },
  {
    date:        'Jan 12, 2025',
    title:       'Packaging',
    icon:        'i-lucide-package',
    status:      'In Progress',
    statusColor: 'warning',
    value:       2,
  },
  {
    date:        'Jan 14, 2025',
    title:       'Delivery',
    icon:        'i-lucide-truck',
    status:      'Pending',
    statusColor: 'neutral',
    value:       3,
  },
]

// ── 4. With meta data ─────────────────────────────────────────────────────
const metaItems: RTimelineItem[] = [
  {
    date:  'Feb 1, 2025',
    title: 'Server deployment',
    icon:  'i-lucide-server',
    value: 0,
    meta:  { Region: 'ap-southeast-1', Instance: 't3.medium', Duration: '4m 22s' },
  },
  {
    date:  'Feb 1, 2025',
    title: 'Database migration',
    icon:  'i-lucide-database',
    value: 1,
    meta:  { Tables: '48', Rows: '1.2M', Duration: '12m 08s' },
  },
  {
    date:  'Feb 2, 2025',
    title: 'CDN cache flush',
    icon:  'i-lucide-globe',
    value: 2,
    meta:  { Files: '3,204', Regions: '12', Duration: '18s' },
  },
]

// ── 5. Remix icons (v-html) ───────────────────────────────────────────────
const remixItems: RTimelineItem[] = [
  {
    date:       'Q1 2025',
    title:      'Strategy defined',
    remixIcon:  'ri-flag-2-line',
    value:      0,
  },
  {
    date:       'Q2 2025',
    title:      'Team assembled',
    remixIcon:  'ri-team-line',
    value:      1,
  },
  {
    date:       'Q3 2025',
    title:      'Product shipped',
    remixIcon:  'ri-rocket-line',
    value:      2,
  },
  {
    date:       'Q4 2025',
    title:      'Growth achieved',
    remixIcon:  'ri-line-chart-line',
    value:      3,
  },
]

// ── 6. Dot mode ───────────────────────────────────────────────────────────
const dotItems: RTimelineItem[] = [
  { date: '09:00', title: 'Stand-up meeting',     dot: true, value: 0 },
  { date: '10:30', title: 'Sprint planning',       dot: true, value: 1 },
  { date: '13:00', title: 'Code review session',  dot: true, value: 2 },
  { date: '15:00', title: 'Design sync',           dot: true, value: 3 },
  { date: '16:30', title: 'Release build',         dot: true, value: 4 },
]

// ── 7. Custom slot per item (item.slot) ───────────────────────────────────
const customSlotItems: RTimelineItem[] = [
  {
    date:        'Step 1',
    title:       'Standard item',
    description: 'Uses the global default slot.',
    icon:        'i-lucide-circle',
    value:       0,
  },
  {
    date:  'Step 2',
    title: 'Custom slot item',
    icon:  'i-lucide-star',
    value: 1,
    slot:  'special', // → #special-wrapper, #special-title, etc.
  },
  {
    date:        'Step 3',
    title:       'Standard item',
    description: 'Back to the default.',
    icon:        'i-lucide-circle',
    value:       2,
  },
]

// ── 8. Alternate (zigzag) ─────────────────────────────────────────────────
const altActive = ref(2)

// ── 9. Colors ─────────────────────────────────────────────────────────────
const colorOptions = ['primary', 'success', 'error', 'warning', 'info', 'neutral'] as const
const activeColor = ref<typeof colorOptions[number]>('primary')
const colorActive = ref(2)

// ── 10. Horizontal ────────────────────────────────────────────────────────
const hItems: RTimelineItem[] = basicItems.slice(0, 3)
const hActive = ref(1)
</script>

<template>
  <div class="demo">
    <RPageHeader
      title="RTimeline_1"
      subtitle="Reusable timeline — NuxtUI 4.8.2 · SARIKA tokens · all slots"
      icon="i-lucide-git-branch"
    />

    <!-- ── 1. Basic vertical ─────────────────────────────────────────── -->
    <RCard title="Basic vertical" icon="i-lucide-list">
      <RTimeline_1 :items="basicItems" :default-value="2" />
    </RCard>

    <!-- ── 2. Auto-play active step ──────────────────────────────────── -->
    <RCard title="Auto-play (v-model)" icon="i-lucide-play-circle">
      <p class="demo-hint">Active step cycles every 2 s via <code>v-model</code>.</p>
      <RTimeline_1 v-model="autoActive" :items="basicItems" />
    </RCard>

    <!-- ── 3. Status badges ───────────────────────────────────────────── -->
    <RCard title="Status badges" icon="i-lucide-tag">
      <RTimeline_1 :items="statusItems" :default-value="2" />
    </RCard>

    <!-- ── 4. Meta key/value ──────────────────────────────────────────── -->
    <RCard title="Meta key/value pairs" icon="i-lucide-list-tree">
      <RTimeline_1 :items="metaItems" :default-value="1" />
    </RCard>

    <!-- ── 5. Remix icons (v-html) ───────────────────────────────────── -->
    <RCard title="Remix icons via v-html" icon="i-lucide-code-2">
      <p class="demo-hint">
        Items use <code>remixIcon: 'ri-flag-2-line'</code> — rendered safely
        via <code>v-html</code> inside the indicator slot.
      </p>
      <RTimeline_1 :items="remixItems" :default-value="1" />
    </RCard>

    <!-- ── 6. Dot mode ───────────────────────────────────────────────── -->
    <RCard title="Dot mode" icon="i-lucide-more-vertical">
      <RTimeline_1 :items="dotItems" :default-value="2" />
    </RCard>

    <!-- ── 7. Custom #wrapper slot override ──────────────────────────── -->
    <RCard title="Custom #wrapper slot" icon="i-lucide-layout">
      <p class="demo-hint">
        Override the full content area for all items with <code>#wrapper</code>.
      </p>
      <RTimeline_1 :items="basicItems" :default-value="1">
        <template #wrapper="{ item }">
          <div class="custom-card">
            <div class="custom-card__head">
              <span class="custom-card__date">{{ item.date }}</span>
              <span class="custom-card__title">{{ item.title }}</span>
            </div>
            <p v-if="item.description" class="custom-card__desc">{{ item.description }}</p>
          </div>
        </template>
      </RTimeline_1>
    </RCard>

    <!-- ── 8. Per-item named slot (item.slot = 'special') ────────────── -->
    <RCard title="Per-item named slot" icon="i-lucide-star">
      <p class="demo-hint">
        Item 2 sets <code>slot: 'special'</code> → use
        <code>#special-wrapper</code> to render it differently.
      </p>
      <RTimeline_1 :items="customSlotItems" :default-value="1">
        <!-- Named slot only for item with slot='special' -->
        <template #special-wrapper="{ item }">
          <div class="special-item">
            <UIcon name="i-lucide-star" class="special-item__icon" />
            <div>
              <p class="special-item__label">{{ item.date }}</p>
              <p class="special-item__title">{{ item.title }}</p>
              <p class="special-item__sub">This item uses a completely custom layout via #special-wrapper</p>
            </div>
          </div>
        </template>
      </RTimeline_1>
    </RCard>

    <!-- ── 9. Custom #indicator slot ─────────────────────────────────── -->
    <RCard title="Custom #indicator slot" icon="i-lucide-circle-dot">
      <RTimeline_1 :items="basicItems" :default-value="1">
        <template #indicator="{ item }">
          <span class="custom-dot" :data-value="item.value">
            <UIcon :name="item.icon ?? 'i-lucide-circle'" class="w-3 h-3" />
          </span>
        </template>
      </RTimeline_1>
    </RCard>

    <!-- ── 10. Alternate zigzag ───────────────────────────────────────── -->
    <RCard title="Alternate (zigzag)" icon="i-lucide-git-commit-horizontal">
      <p class="demo-hint">
        <code>alternate</code> prop applies
        <code>even:flex-row-reverse</code> + translate to create a zigzag layout.
      </p>
      <div class="zigzag-wrap">
        <RTimeline_1
          v-model="altActive"
          :items="basicItems"
          alternate
          class="translate-x-[calc(50%-1rem)]"
        />
      </div>
    </RCard>

    <!-- ── 11. Colors ─────────────────────────────────────────────────── -->
    <RCard title="Colors" icon="i-lucide-palette">
      <div class="demo-row mb-4">
        <RButton
          v-for="c in colorOptions"
          :key="c"
          size="xs"
          :variant="activeColor === c ? 'solid' : 'outline'"
          :color="c === 'primary' ? 'primary' : 'neutral'"
          @click="activeColor = c"
        >{{ c }}</RButton>
      </div>
      <RTimeline_1
        :items="basicItems"
        :color="activeColor"
        :default-value="colorActive"
      />
    </RCard>

    <!-- ── 12. Horizontal ─────────────────────────────────────────────── -->
    <RCard title="Horizontal orientation" icon="i-lucide-arrow-right">
      <RTimeline_1
        v-model="hActive"
        :items="hItems"
        orientation="horizontal"
      />
    </RCard>

    <!-- ── 13. Custom :ui passthrough ────────────────────────────────── -->
    <RCard title=":ui passthrough" icon="i-lucide-sliders-horizontal">
      <p class="demo-hint">
        Merge any slot class overrides on top of SARIKA defaults with <code>:ui</code>.
      </p>
      <RTimeline_1
        :items="basicItems"
        :default-value="1"
        :ui="{
          indicator: 'rounded-lg',  // square instead of circle
          title: 'text-[var(--c-accent)] text-base',
          date:  'text-xs font-bold text-[var(--c-accent)] uppercase',
        }"
      />
    </RCard>

    <!-- ── 14. Prefix / Suffix slots ─────────────────────────────────── -->
    <RCard title="#prefix + #suffix slots" icon="i-lucide-layers">
      <RTimeline_1 :items="basicItems.slice(0, 3)" :default-value="1">
        <template #prefix>
          <div class="slot-banner slot-banner--prefix">
            <UIcon name="i-lucide-calendar-range" />
            Q1 2025 Milestones
          </div>
        </template>
        <template #suffix>
          <div class="slot-banner slot-banner--suffix">
            <UIcon name="i-lucide-flag" />
            Sprint complete
          </div>
        </template>
      </RTimeline_1>
    </RCard>

  </div>
</template>

<style lang="scss" scoped>
.demo {
  padding:        var(--space-8);
  max-width:      700px;
  margin:         0 auto;
  display:        flex;
  flex-direction: column;
  gap:            var(--space-5);

  @include mobile-only { padding: var(--space-4); }
}

.demo-hint {
  font-size:   0.8rem;
  color:       var(--c-muted);
  margin:      0 0 var(--space-3);
  line-height: 1.5;

  code {
    font-size:     0.73rem;
    background:    rgba(255,140,66,0.1);
    color:         var(--c-accent);
    padding:       1px 5px;
    border-radius: 4px;
    font-family:   monospace;
  }
}

.demo-row {
  display:  flex;
  flex-wrap: wrap;
  gap:      var(--space-2);
}

// ── Zigzag container ─────────────────────────────────────────────────────
.zigzag-wrap {
  overflow: hidden;
  padding:  0 0 var(--space-2);
}

// ── Custom card wrapper example ───────────────────────────────────────────
.custom-card {
  background:    var(--bg-tertiary);
  border:        1px solid var(--c-border);
  border-radius: 10px;
  padding:       10px 14px;
  margin-bottom: 14px;
  transition:    border-color 0.15s;

  &:hover { border-color: var(--c-accent); }

  &__head {
    display:     flex;
    align-items: center;
    gap:         8px;
    flex-wrap:   wrap;
  }

  &__date {
    font-size:     0.7rem;
    color:         var(--c-muted);
    font-family:   monospace;
    text-transform: uppercase;
    background:    var(--c-surface);
    padding:       2px 6px;
    border-radius: 4px;
    border:        1px solid var(--c-border);
  }

  &__title {
    font-size:   0.875rem;
    font-weight: 600;
    color:       var(--c-text);
  }

  &__desc {
    font-size:  0.8rem;
    color:      var(--c-muted);
    margin:     6px 0 0;
    line-height: 1.5;
  }
}

// ── Per-item special slot ─────────────────────────────────────────────────
.special-item {
  display:       flex;
  align-items:   flex-start;
  gap:           10px;
  background:    rgba(255,140,66,0.06);
  border:        1px solid rgba(255,140,66,0.2);
  border-radius: 10px;
  padding:       10px 14px;
  margin-bottom: 14px;

  &__icon {
    color:      var(--c-accent);
    flex-shrink: 0;
    margin-top:  2px;
    font-size:   1rem;
  }

  &__label {
    font-size:  0.7rem;
    color:      var(--c-muted);
    margin:     0;
    font-family: monospace;
  }

  &__title {
    font-size:   0.875rem;
    font-weight: 600;
    color:       var(--c-accent);
    margin:      2px 0;
  }

  &__sub {
    font-size:  0.75rem;
    color:      var(--c-muted);
    margin:     0;
  }
}

// ── Custom indicator dot ──────────────────────────────────────────────────
.custom-dot {
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           100%;
  height:          100%;
  background:      rgba(255,140,66,0.12);
  color:           var(--c-accent);
  border-radius:   inherit;
}

// ── Prefix / Suffix banners ───────────────────────────────────────────────
.slot-banner {
  display:       flex;
  align-items:   center;
  gap:           6px;
  font-size:     0.78rem;
  font-weight:   500;
  padding:       6px 12px;
  border-radius: 8px;

  &--prefix {
    color:      var(--c-muted);
    background: var(--bg-tertiary);
    border:     1px solid var(--c-border);
    margin-bottom: 6px;
  }

  &--suffix {
    color:      var(--c-accent);
    background: rgba(255,140,66,0.07);
    border:     1px solid rgba(255,140,66,0.2);
    margin-top: 6px;
  }
}
</style>