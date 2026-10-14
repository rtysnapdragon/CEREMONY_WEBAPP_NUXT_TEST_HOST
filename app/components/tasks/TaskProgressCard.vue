<template>
  <section
    class="grid grid-cols-1 gap-[var(--sp-4)] sm:grid-cols-2 xl:grid-cols-4"
  >
    <!-- Overall Progress -->
    <div
      class="rounded-[var(--r-md)] border border-[var(--c-border)] bg-[var(--c-surface)] p-[var(--sp-5)] shadow-sm transition-shadow hover:shadow-md"
    >
      <div class="flex items-start justify-between gap-[var(--sp-4)]">
        <div>
          <p class="text-sm font-medium text-[var(--c-muted)]">
            {{ tr("tasks.overall_progress") }}
          </p>

          <div class="mt-1 flex items-baseline gap-1">
            <span
              class="text-2xl font-bold tracking-tight text-[var(--c-text)]"
            >
              {{ completionRate }}
            </span>

            <span class="text-sm font-medium text-[var(--c-muted)]"> % </span>
          </div>
        </div>

        <div
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--r-lg)] bg-[var(--c-success)]/10 text-[var(--c-success)]"
        >
          <i class="ri-task-line text-xl" />
        </div>
      </div>

      <div
        class="mt-[var(--sp-4)] h-2 overflow-hidden rounded-[var(--r-full)] bg-[var(--c-border)]"
      >
        <div
          class="h-full rounded-[var(--r-full)] bg-[var(--c-success)] transition-all duration-500 ease-out"
          :style="{
            width: `${completionRate}%`,
          }"
        />
      </div>

      <p class="mt-[var(--sp-3)] text-xs text-[var(--c-muted)]">
        {{ completedCount }} {{ tr("status.done") }}
      </p>
    </div>

    <!-- Completed -->
    <div
      class="rounded-[var(--r-md)] border border-[var(--c-border)] bg-[var(--c-surface)] p-[var(--sp-5)] shadow-sm transition-shadow hover:shadow-md"
    >
      <div class="flex items-start justify-between gap-[var(--sp-4)]">
        <div>
          <p class="text-sm font-medium text-[var(--c-muted)]">
            {{ tr("status.done") }}
          </p>

          <p
            class="mt-1 text-2xl font-bold tracking-tight text-[var(--c-text)]"
          >
            {{ completedCount }}
          </p>
        </div>

        <div
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--r-lg)] bg-[var(--c-success)]/10 text-[var(--c-success)]"
        >
          <i class="ri-checkbox-circle-line text-xl" />
        </div>
      </div>

      <div class="mt-[var(--sp-4)] flex items-center gap-1.5 text-xs">
        <i class="ri-checkbox-circle-fill text-[var(--c-success)]" />

        <span class="text-[var(--c-muted)]">
          {{ tr("tasks.completed_tasks") || tr("status.done") }}
        </span>
      </div>
    </div>

    <!-- In Progress -->
    <div
      class="rounded-[var(--r-md)] border border-[var(--c-border)] bg-[var(--c-surface)] p-[var(--sp-5)] shadow-sm transition-shadow hover:shadow-md"
    >
      <div class="flex items-start justify-between gap-[var(--sp-4)]">
        <div>
          <p class="text-sm font-medium text-[var(--c-muted)]">
            {{ tr("status.in_progress") }}
          </p>

          <p
            class="mt-1 text-2xl font-bold tracking-tight text-[var(--c-text)]"
          >
            {{ inProgressCount }}
          </p>
        </div>

        <div
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--r-lg)] bg-[var(--c-info)]/10 text-[var(--c-info)]"
        >
          <i class="ri-loader-4-line text-xl" />
        </div>
      </div>

      <div class="mt-[var(--sp-4)] flex items-center gap-1.5 text-xs">
        <i class="ri-time-line text-[var(--c-info)]" />

        <span class="text-[var(--c-muted)]">
          {{ tr("tasks.currently_working") || tr("status.in_progress") }}
        </span>
      </div>
    </div>

    <!-- Pending -->
    <div
      class="rounded-[var(--r-md)] border border-[var(--c-border)] bg-[var(--c-surface)] p-[var(--sp-5)] shadow-sm transition-shadow hover:shadow-md"
    >
      <div class="flex items-start justify-between gap-[var(--sp-4)]">
        <div>
          <p class="text-sm font-medium text-[var(--c-muted)]">
            {{ tr("status.pending") }}
          </p>

          <p
            class="mt-1 text-2xl font-bold tracking-tight text-[var(--c-text)]"
          >
            {{ pendingCount }}
          </p>
        </div>

        <div
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--r-lg)] bg-[var(--c-muted)]/10 text-[var(--c-muted)]"
        >
          <i class="ri-time-line text-xl" />
        </div>
      </div>

      <div class="mt-[var(--sp-4)] flex items-center justify-between">
        <span class="flex items-center gap-1.5 text-xs text-[var(--c-muted)]">
          <i class="ri-circle-line" />
          {{ tr("status.pending") }}
        </span>

        <span
          v-if="overdueCount"
          class="flex items-center gap-1 text-xs font-medium text-[var(--c-danger)]"
        >
          <i class="ri-alarm-warning-line" />
          {{ overdueCount }}
        </span>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  completionRate: {
    type: [Number, String],
    default: 0,
  },

  completedCount: {
    type: Number,
    default: 0,
  },

  inProgressCount: {
    type: Number,
    default: 0,
  },

  pendingCount: {
    type: Number,
    default: 0,
  },

  overdueCount: {
    type: Number,
    default: 0,
  },
});

const { tr } = useTaskPage();
</script>
