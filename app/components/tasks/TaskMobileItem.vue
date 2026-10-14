<template>
  <article
    class="group flex items-start gap-[var(--sp-3)] rounded-[var(--r-lg)] border border-[var(--c-border)] bg-[var(--c-surface)] p-[var(--sp-4)] shadow-sm"
    :class="{
      'opacity-60': task.status === 'completed',

      'border-[var(--c-danger)]': isOverdue(task),
    }"
  >
    <!-- Check -->
    <button
      type="button"
      class="mt-0.5 shrink-0 text-xl text-[var(--c-muted)] transition hover:text-[var(--c-success)]"
      :disabled="task.status === 'completed'"
      @click="task.status !== 'completed' && $emit('complete')"
    >
      <i
        :class="
          task.status === 'completed'
            ? 'ri-checkbox-circle-fill text-[var(--c-success)]'
            : 'ri-circle-line'
        "
      />
    </button>

    <!-- Body -->
    <div class="min-w-0 flex-1">
      <h3
        class="mb-[var(--sp-2)] text-sm font-semibold leading-5 text-[var(--c-text)]"
        :class="task.status === 'completed' ? 'line-through' : ''"
      >
        {{ task.title }}
      </h3>

      <div class="flex flex-wrap items-center gap-2">
        <span
          class="rounded-[var(--r-sm)] px-2 py-1 text-[11px] font-semibold"
          :class="priorityBadge(task.priority)"
        >
          {{ priorityLabel(task.priority) }}
        </span>

        <span
          v-if="task.dueDate"
          class="flex items-center gap-1 text-xs text-[var(--c-muted)]"
          :class="isOverdue(task) ? 'text-[var(--c-danger)]' : ''"
        >
          <i class="ri-calendar-line" />

          {{ fmtDate(task.dueDate) }}
        </span>

        <span
          v-if="task.assignee"
          class="flex items-center gap-1 text-xs text-[var(--c-muted)]"
        >
          <i class="ri-user-line" />

          {{ task.assignee }}
        </span>
      </div>
    </div>

    <!-- Actions -->
    <div class="shrink-0">
      <RTblBtns :items="actionItems" @action-click="handleAction" />
    </div>
  </article>
</template>

<script setup>
defineProps({
  task: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["edit", "delete", "complete"]);

const { priorityBadge, priorityLabel, fmtDate, isOverdue } = useTaskPage();

const actionItems = [
  {
    type: "edit",
    icon: "edit",
    label: "edit",
  },
  {
    type: "delete",
    icon: "delete",
    label: "delete",
    color: "error",
  },
];

const handleAction = (event, item) => {
  if (item.type === "edit") {
    emit("edit");
    return;
  }

  if (item.type === "delete") {
    emit("delete");
  }
};
</script>
