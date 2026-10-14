<template>
  <GlassCard
    :title="tr('dashboard.ceremony_progress')"
    icon="i-heroicons-sparkles"
    class="animate-fade-in-up"
  >
    <!-- <template #actions>
      <NuxtLink to="/ceremony" class="view-all-link">
        {{ tr("common.manage") }}
        <UIcon name="i-heroicons-arrow-right" class="view-all-icon" />
      </NuxtLink>
    </template> -->

    <!-- Wedding Date Banner -->
    <div v-if="activeEvent" class="wedding-banner">
      <div class="banner-left">
        <p class="banner-label">{{ tr("ceremony.wedding_date") }}</p>
        <p class="banner-date">{{ weddingDateLabel }}</p>
      </div>
      <div v-if="countdown" class="banner-countdown">
        <div class="countdown-item">
          <span class="countdown-num">{{ countdown.days }}</span>
          <span class="countdown-unit">{{
            tr("ceremony.countdown_days")
          }}</span>
        </div>
        <div class="countdown-item">
          <span class="countdown-num">{{ countdown.hours }}</span>
          <span class="countdown-unit">{{ tr("ceremony.countdown_hrs") }}</span>
        </div>
        <div class="countdown-item">
          <span class="countdown-num">{{ countdown.minutes }}</span>
          <span class="countdown-unit">{{ tr("ceremony.countdown_min") }}</span>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="ceremonyStore.loading" class="ceremony-loading">
      <i class="ri-loader-4-line animate-spin" style="color: var(--c-muted)" />
      <span class="text-muted" style="font-size: 0.8125rem">Loading...</span>
    </div>

    <!-- Ceremony phases -->
    <div v-else class="phases">
      <div
        v-for="(phase, idx) in ceremonyStore.items"
        :key="phase.id"
        class="phase-item"
        :class="{
          'phase-completed': phase.status === 'done',
          'phase-active': phase.status === 'in-progress',
        }"
      >
        <div class="phase-indicator">
          <div class="phase-dot">
            <UIcon
              v-if="phase.status === 'done'"
              name="i-heroicons-check"
              class="phase-check"
            />
          </div>
          <div v-if="idx < ceremonyStore.items.length - 1" class="phase-line" />
        </div>
        <div class="phase-content">
          <div class="phase-header">
            <h4 class="phase-name">{{ phase.name }}</h4>
            <UBadge
              :color="
                phase.status === 'done'
                  ? 'green'
                  : phase.status === 'in-progress'
                    ? 'orange'
                    : 'gray'
              "
              variant="soft"
              size="xs"
            >
              {{
                phase.status === "done"
                  ? tr("status.done")
                  : phase.status === "in-progress"
                    ? tr("status.active")
                    : tr("status.upcoming")
              }}
            </UBadge>
          </div>
          <p class="phase-time">
            {{ formatTime(phase.scheduleTime) }}
            <span v-if="phase.address"> · {{ phase.address }}</span>
          </p>
          <div class="phase-progress">
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: phaseProgress(phase) + '%' }"
              />
            </div>
            <span class="progress-label">{{ phaseProgress(phase) }}%</span>
          </div>
        </div>
      </div>
    </div>
  </GlassCard>
</template>

<script setup>
const props = defineProps({
  activeEvent: { type: Object, default: null },
});

const { tr } = useTr();
const ceremonyStore = useCeremonyStore();
const eventStore = useEventStore();

const weddingDateLabel = computed(() => {
  if (!props.activeEvent?.date) return "—";
  return new Date(props.activeEvent.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

const countdown = computed(() => {
  if (!props.activeEvent?.date) return null;
  const diff = new Date(props.activeEvent.date) - new Date();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return {
    days: String(days).padStart(2, "0"),
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
  };
});

const formatTime = (dt) => {
  if (!dt) return "";
  return new Date(dt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const phaseProgress = (phase) => {
  if (phase.status === "done") return 100;
  if (phase.status === "in-progress") return 50;
  return 0;
};

onMounted(async () => {
  if (!eventStore.initialized) await eventStore.fetchEvents();
  if (eventStore.activeEvent?.id) await ceremonyStore.fetchCeremonies();
});

watch(
  () => eventStore.activeEvent?.id,
  (id) => {
    if (id) ceremonyStore.fetchCeremonies();
  },
);
</script>

<style lang="scss" scoped>
$accent-orange: #f97316;
$accent-gold: #d4a843;

.view-all-link {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  color: var(--c-muted);
  &:hover {
    color: var(--c-accent);
  }
}
.view-all-icon {
  width: 12px;
  height: 12px;
}

.wedding-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(
    135deg,
    rgba($accent-orange, 0.1) 0%,
    rgba($accent-gold, 0.08) 100%
  );
  // border: 1px solid rgba($accent-orange, 0.2);
  border-radius: var(--r-lg);
  padding: var(--sp-3) var(--sp-4);
  margin-bottom: var(--sp-4);
  gap: var(--sp-4);
  flex-wrap: wrap;
}
.banner-label {
  font-size: 10px;
  color: var(--c-muted);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: var(--sp-1);
}
.banner-date {
  font-size: 15px;
  font-weight: 800;
  color: var(--c-text);
  letter-spacing: -0.02em;
}
.banner-countdown {
  display: flex;
  gap: var(--sp-3);
}
.countdown-item {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.countdown-num {
  font-size: 18px;
  font-weight: 800;
  color: $accent-orange;
  letter-spacing: -0.04em;
  line-height: 1;
}
.countdown-unit {
  font-size: 0.6rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--c-muted);
  margin-top: 2px;
}

.ceremony-loading,
.ceremony-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-6) 0;
}

.phases {
  display: flex;
  flex-direction: column;
}
.phase-item {
  display: flex;
  gap: var(--sp-3);
  min-height: 72px;
}
.phase-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 20px;
}
.phase-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid var(--c-border);
  background: var(--c-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 250ms ease;
  .phase-completed & {
    background: var(--c-muted);
    border-color: var(--c-muted);
  }
  .phase-active & {
    background: $accent-orange;
    border-color: $accent-orange;
    box-shadow: 0 0 12px $accent-orange;
  }
}
.phase-check {
  width: 10px;
  height: 10px;
  color: white;
}
.phase-line {
  flex: 1;
  width: 2px;
  background: var(--c-border);
  margin: var(--sp-1) 0;
}
.phase-content {
  flex: 1;
  padding-bottom: var(--sp-3);
}
.phase-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--sp-1);
  gap: var(--sp-2);
}
.phase-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--c-text);
}
.phase-time {
  font-size: 10px;
  color: var(--c-muted);
  margin-bottom: var(--sp-2);
}
.phase-progress {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
}
.progress-bar {
  flex: 1;
  height: 5px;
  border-radius: var(--r-full);
  background: var(--c-border);
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  border-radius: var(--r-full);
  background: linear-gradient(90deg, $accent-orange 0%, $accent-gold 100%);
  transition: width 0.5s;
}
.progress-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--c-muted);
  min-width: 28px;
  text-align: right;
}
</style>
