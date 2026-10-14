<template>
  <article
    draggable="true"
    class="group min-h-[209px] relative cursor-grab rounded-[var(--r-md)] border border-[var(--c-border)] bg-[var(--c-surface)] p-[var(--sp-4)] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:cursor-grabbing active:scale-[0.98]"
    :class="[
      isOverdue(task) ? 'border-[var(--c-danger)]' : '',
      draggedTaskId === task.id ? 'scale-[0.98] rotate-1 opacity-40' : '',
      movingTaskId === task.id ? 'pointer-events-none opacity-50' : '',
    ]"
    @dragstart="$emit('drag-start', $event)"
    @dragend="$emit('drag-end')"
  >
    <!-- Drag Handle -->
    <div
      class="absolute left-1/2 top-1 -translate-x-1/2 text-[var(--c-muted)] opacity-0 transition-opacity group-hover:opacity-100"
      title="Drag task"
    >
      <i class="ri-draggable text-base" />
    </div>

    <!-- Top -->
    <div
      class="mb-[var(--sp-3)] flex items-start justify-between gap-[var(--sp-2)]"
    >
      <span
        class="rounded-[var(--r-sm)] px-2 py-1 text-[11px] font-semibold"
        :class="priorityBadge(task.priority)"
      >
        {{ priorityLabel(task.priority) }}
      </span>

      <div class="flex items-center gap-1">
        <!-- Move previous/next: keyboard/mouse alternative to drag -->
        <div
          class="flex items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-within:opacity-100"
          @mousedown.stop
          @click.stop
        >
          <button
            v-if="columnIndex > 0"
            type="button"
            class="flex h-6 w-6 items-center justify-center rounded-[var(--r-sm)] text-[var(--c-muted)] transition-colors hover:bg-[var(--c-muted)]/10 hover:text-[var(--c-text)]"
            :aria-label="tr('tasks.move_previous') || 'Move to previous column'"
            :disabled="movingTaskId === task.id"
            @click="$emit('move-previous')"
          >
            <i class="ri-arrow-left-s-line text-base" />
          </button>

          <button
            v-if="columnIndex < columnCount - 1"
            type="button"
            class="flex h-6 w-6 items-center justify-center rounded-[var(--r-sm)] text-[var(--c-muted)] transition-colors hover:bg-[var(--c-muted)]/10 hover:text-[var(--c-text)]"
            :aria-label="tr('tasks.move_next') || 'Move to next column'"
            :disabled="movingTaskId === task.id"
            @click="$emit('move-next')"
          >
            <i class="ri-arrow-right-s-line text-base" />
          </button>
        </div>

        <div
          class="opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-within:opacity-100"
          @mousedown.stop
          @click.stop
        >
          <RTblBtns :items="actionItems" @action-click="handleAction" />
        </div>
      </div>
    </div>

    <!-- Title -->
    <h3
      class="mb-[var(--sp-2)] text-sm font-semibold leading-5 text-[var(--c-text)]"
    >
      {{ task.title }}
    </h3>

    <!-- Notes -->
    <p
      v-if="task.notes"
      class="mb-[var(--sp-3)] line-clamp-2 text-xs leading-5 text-[var(--c-muted)]"
    >
      {{ task.notes }}
    </p>

    <!-- Meta -->
    <div
      class="flex flex-wrap items-center gap-x-[var(--sp-3)] gap-y-[var(--sp-2)] text-xs text-[var(--c-muted)]"
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

    <!-- Moving -->
    <div
      v-if="movingTaskId === task.id"
      class="mt-[var(--sp-3)] flex items-center justify-center gap-[var(--sp-2)] rounded-[var(--r-md)] bg-[var(--c-info)]/10 px-[var(--sp-3)] py-2 text-xs font-medium text-[var(--c-info)]"
    >
      <i class="ri-loader-4-line animate-spin" />
      Updating...
    </div>

    <!-- Complete -->
    <div
      v-if="task.status !== 'completed' && movingTaskId !== task.id"
      class="mt-[var(--sp-4)] border-t border-[var(--c-border)] pt-[var(--sp-3)]"
    >
      <button
        type="button"
        class="flex w-full items-center justify-center gap-[var(--sp-2)] rounded-[var(--r-md)] border border-[var(--c-border)] px-[var(--sp-3)] py-2 text-xs font-medium text-[var(--c-muted)] transition hover:border-[var(--c-success)] hover:bg-[var(--c-success)]/10 hover:text-[var(--c-success)]"
        @click.stop="$emit('complete')"
      >
        <i class="ri-checkbox-circle-line text-base" />
        {{ tr("tasks.mark_done") }}
      </button>
    </div>
  </article>
</template>

<script setup>
const props = defineProps({
  task: { type: Object, required: true },
  isDragging: Boolean,
  draggedTaskId: { type: [String, Number, null], default: null },
  movingTaskId: { type: [String, Number, null], default: null },
  columnIndex: { type: Number, default: 0 },
  columnCount: { type: Number, default: 1 },
});

const emit = defineEmits([
  "drag-start",
  "drag-end",
  "edit",
  "delete",
  "complete",
  "move-previous",
  "move-next",
]);

const { tr, priorityBadge, priorityLabel, fmtDate, isOverdue } = useTaskPage();

const actionItems = [
  { type: "edit", icon: "edit", label: "edit" },
  { type: "delete", icon: "delete", label: "delete", color: "error" },
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
