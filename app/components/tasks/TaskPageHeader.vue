<template>
  <div class="flex flex-col gap-[var(--sp-3)] overflow-y-auto pb-4">
    <div
      v-if="!tasks.length"
      class="flex min-h-40 items-center justify-center rounded-[var(--r-md)] border border-dashed border-[var(--c-border)] p-[var(--sp-6)] text-center"
    >
      <div>
        <i class="ri-inbox-line mb-2 block text-2xl text-[var(--c-muted)]" />
        <p class="text-xs text-[var(--c-muted)]">{{ tr("common.noData") }}</p>
      </div>
    </div>

    <article
      v-for="task in tasks"
      :key="task.id"
      class="rounded-[var(--r-md)] border border-[var(--c-border)] bg-[var(--c-surface)] p-[var(--sp-4)] shadow-sm"
      :class="isOverdue(task) ? 'border-[var(--c-danger)]' : ''"
    >
      <div
        class="mb-[var(--sp-2)] flex items-start justify-between gap-[var(--sp-2)]"
      >
        <div class="flex flex-wrap items-center gap-2">
          <span
            class="rounded-[var(--r-sm)] px-2 py-1 text-[11px] font-semibold"
            :class="priorityBadge(task.priority)"
          >
            {{ priorityLabel(task.priority) }}
          </span>
          <span
            class="rounded-[var(--r-sm)] bg-[var(--c-muted)]/10 px-2 py-1 text-[11px] font-medium text-[var(--c-muted)]"
          >
            {{ statusLabel(task.status) }}
          </span>
        </div>

        <RTblBtns
          :items="actionItems"
          @action-click="(event, item) => handleAction(item, task)"
        />
      </div>

      <h3 class="mb-1 text-sm font-semibold text-[var(--c-text)]">
        {{ task.title }}
      </h3>

      <p
        v-if="task.notes"
        class="mb-[var(--sp-2)] line-clamp-2 text-xs leading-5 text-[var(--c-muted)]"
      >
        {{ task.notes }}
      </p>

      <div
        class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--c-muted)]"
      >
        <span
          v-if="task.dueDate"
          class="flex items-center gap-1"
          :class="isOverdue(task) ? 'text-[var(--c-danger)]' : ''"
        >
          <i class="ri-calendar-line" />
          {{ fmtDate(task.dueDate) }}
        </span>
        <span v-if="task.assignee" class="flex items-center gap-1">
          <i class="ri-user-line" />
          {{ task.assignee }}
        </span>
      </div>

      <button
        v-if="task.status !== 'completed'"
        type="button"
        class="mt-[var(--sp-3)] flex w-full items-center justify-center gap-2 rounded-[var(--r-md)] border border-[var(--c-border)] px-3 py-2 text-xs font-medium text-[var(--c-muted)] transition hover:border-[var(--c-success)] hover:bg-[var(--c-success)]/10 hover:text-[var(--c-success)]"
        @click="$emit('complete', task)"
      >
        <i class="ri-checkbox-circle-line text-base" />
        {{ tr("tasks.mark_done") }}
      </button>
    </article>
  </div>
</template>

<script setup>
defineProps({
  tasks: { type: Array, default: () => [] },
});

const emit = defineEmits(["edit", "delete", "complete"]);

const { tr, priorityBadge, priorityLabel, fmtDate, isOverdue } = useTaskPage();

const actionItems = [
  { type: "edit", icon: "edit", label: "edit" },
  { type: "delete", icon: "delete", label: "delete", color: "error" },
];

const statusLabelMap = computed(() => ({
  pending: tr("status.pending"),
  "in-progress": tr("status.in_progress"),
  completed: tr("status.done"),
  cancelled: tr("status.cancelled"),
}));

const statusLabel = (status) => statusLabelMap.value[status] ?? status;

const handleAction = (item, task) => {
  if (item.type === "edit") emit("edit", task);
  if (item.type === "delete") emit("delete", task);
};
</script>
