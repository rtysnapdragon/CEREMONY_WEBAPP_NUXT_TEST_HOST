<template>
  <GlassCard
    :title="tr('dashboard.invitation_status')"
    icon="i-heroicons-paper-airplane"
    class="animate-fade-in-up delay-200"
  >
    <!-- <template #actions>
      <NuxtLink to="/setup_and_invitation" class="view-all-link">
        {{ tr("common.view_all") }}
        <UIcon name="i-heroicons-arrow-right" class="link-icon" />
      </NuxtLink>
    </template> -->

    <div v-if="!stats" class="loading-state" style="padding: var(--sp-6) 0">
      <i class="ri-loader-4-line animate-spin" style="color: var(--c-muted)" />
    </div>

    <template v-else>
      <div class="inv-stats-grid">
        <div
          v-for="stat in invStats"
          :key="stat.key"
          class="inv-stat-card"
          :class="stat.colorClass"
        >
          <div class="inv-stat-icon">
            <UIcon :name="stat.icon" class="inv-icon" />
          </div>
          <div class="inv-stat-info">
            <p class="inv-stat-value">{{ stat.value }}</p>
            <p class="inv-stat-label">
              {{ tBy({ en: stat.labelEn, km: stat.labelKm }) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Response rate bar -->
      <div class="response-section">
        <div class="response-header">
          <span class="response-label">{{
            tr("dashboard.response_rate")
          }}</span>
          <span class="response-value">{{ responseRate }}%</span>
        </div>
        <div class="progress-bar-full">
          <div
            class="progress-segment confirmed"
            :style="{ width: confirmedPct + '%' }"
          />
          <div
            class="progress-segment pending"
            :style="{ width: pendingPct + '%' }"
          />
          <div
            class="progress-segment declined"
            :style="{ width: declinedPct + '%' }"
          />
        </div>
        <div class="progress-legend">
          <div class="legend-item">
            <div class="legend-dot confirmed-dot" />
            <span>{{ tr("status.confirmed") }} ({{ confirmedPct }}%)</span>
          </div>
          <div class="legend-item">
            <div class="legend-dot pending-dot" />
            <span>{{ tr("status.pending") }} ({{ pendingPct }}%)</span>
          </div>
          <div class="legend-item">
            <div class="legend-dot declined-dot" />
            <span>{{ tr("status.declined") }} ({{ declinedPct }}%)</span>
          </div>
        </div>
      </div>
    </template>
  </GlassCard>
</template>

<script setup>
const props = defineProps({
  stats: { type: Object, default: null },
});

const { tBy } = useSarikaLocale();
const { tr } = useTr();

const total = computed(() => Number(props.stats?.totalGuests ?? 0));
const confirmed = computed(() => Number(props.stats?.confirmedGuests ?? 0));
const attended = computed(() => Number(props.stats?.attendedGuests ?? 0));
const invited = computed(() => Number(props.stats?.invitedGuests ?? 0));
const declined = computed(() => Number(props.stats?.declinedGuests ?? 0));

const confirmedPct = computed(() =>
  total.value > 0
    ? Math.round(((confirmed.value + attended.value) / total.value) * 100)
    : 0,
);
const pendingPct = computed(() =>
  total.value > 0 ? Math.round((invited.value / total.value) * 100) : 0,
);
const declinedPct = computed(() =>
  total.value > 0 ? Math.round((declined.value / total.value) * 100) : 0,
);
const responseRate = computed(() =>
  Math.min(100, confirmedPct.value + declinedPct.value),
);

const invStats = computed(() => [
  {
    key: "total",
    labelEn: "Total Guests",
    labelKm: "ភ្ញៀវសរុប",
    value: total.value,
    icon: "i-heroicons-users",
    colorClass: "stat-orange",
  },
  {
    key: "confirmed",
    labelEn: "Confirmed",
    labelKm: "បានបញ្ជាក់",
    value: confirmed.value + attended.value,
    icon: "i-heroicons-check-circle",
    colorClass: "stat-green",
  },
  {
    key: "pending",
    labelEn: "Pending",
    labelKm: "រង់ចាំ",
    value: invited.value,
    icon: "i-heroicons-clock",
    colorClass: "stat-yellow",
  },
  {
    key: "declined",
    labelEn: "Declined",
    labelKm: "បដិសេធ",
    value: declined.value,
    icon: "i-heroicons-x-circle",
    colorClass: "stat-red",
  },
]);
</script>

<style lang="scss" scoped>
.view-all-link {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  color: var(--c-muted);
  &:hover {
    color: var(--c-accent);
    opacity: 0.8;
  }
}
.link-icon {
  width: 12px;
  height: 12px;
}
.loading-state {
  display: flex;
  justify-content: center;
}

.inv-stats-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: var(--sp-2);
  margin-bottom: var(--sp-4);
}

.inv-stat-card {
  border-radius: var(--r-lg);
  padding: var(--sp-3);
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  // border: 0.5px solid var(--c-border);
  transition: all 0.25s ease;
  &:hover {
    transform: translateY(-1px);
  }
  &.stat-orange {
    background: rgba(249, 115, 22, 0.08);
    // border-color: rgba(249, 115, 22, 0.15);
    .inv-icon {
      color: #f97316;
    }
    .inv-stat-icon {
      background: rgba(249, 115, 22, 0.12);
    }
    .inv-stat-value {
      color: #f97316;
    }
  }
  &.stat-green {
    background: rgba(34, 197, 94, 0.08);
    // border-color: rgba(34, 197, 94, 0.15);
    .inv-icon {
      color: #22c55e;
    }
    .inv-stat-icon {
      background: rgba(34, 197, 94, 0.12);
    }
    .inv-stat-value {
      color: #22c55e;
    }
  }
  &.stat-yellow {
    background: rgba(245, 158, 11, 0.08);
    // border-color: rgba(245, 158, 11, 0.15);
    .inv-icon {
      color: #f59e0b;
    }
    .inv-stat-icon {
      background: rgba(245, 158, 11, 0.12);
    }
    .inv-stat-value {
      color: #f59e0b;
    }
  }
  &.stat-red {
    background: rgba(239, 68, 68, 0.08);
    // border-color: rgba(239, 68, 68, 0.15);
    .inv-icon {
      color: #ef4444;
    }
    .inv-stat-icon {
      background: rgba(239, 68, 68, 0.12);
    }
    .inv-stat-value {
      color: #ef4444;
    }
  }
}

.inv-stat-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--r-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.inv-icon {
  width: 18px;
  height: 18px;
}
.inv-stat-value {
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.03em;
}
.inv-stat-label {
  font-size: 11px;
  color: var(--c-muted);
  font-weight: 500;
}

.response-section {
  padding-top: var(--sp-3);
  // border-top: 1px solid var(--c-border);
}
.response-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--sp-1);
}
.response-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--c-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.response-value {
  font-size: 13px;
  font-weight: 800;
  color: #f97316;
}
.progress-bar-full {
  height: 8px;
  border-radius: var(--r-full);
  overflow: hidden;
  display: flex;
  background: var(--c-border);
  margin-bottom: var(--sp-2);
}
.progress-segment {
  height: 100%;
  transition: width 0.5s ease;
  &.confirmed {
    background: #22c55e;
  }
  &.pending {
    background: #f59e0b;
  }
  &.declined {
    background: #ef4444;
  }
}
.progress-legend {
  display: flex;
  gap: var(--sp-3);
  flex-wrap: wrap;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: var(--sp-1);
  font-size: 11px;
  color: var(--c-muted);
}
.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  &.confirmed-dot {
    background: #22c55e;
  }
  &.pending-dot {
    background: #f59e0b;
  }
  &.declined-dot {
    background: #ef4444;
  }
}
</style>
