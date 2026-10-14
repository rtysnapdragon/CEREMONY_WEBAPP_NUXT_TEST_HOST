<template>
  <section class="flex h-full min-h-0 flex-col">
    <!-- Loading -->
    <div
      v-if="loading && !tasks.length"
      class="flex min-h-48 flex-1 items-center justify-center gap-[var(--sp-3)] rounded-[var(--r-xl)] border border-[var(--c-border)] p-[var(--sp-8)] shadow-sm"
    >
      <i class="ri-loader-4-line animate-spin text-2xl text-[var(--c-muted)]" />

      <span class="text-sm text-[var(--c-muted)]">
        {{ tr("common.loading") }}
      </span>
    </div>

    <template v-else>
      <!-- Desktop -->
      <div
        class="hidden min-h-0 flex-1 gap-[var(--sp-5)] md:grid md:grid-cols-3 md:items-stretch"
      >
        <TaskKanbanColumn
          v-for="(column, index) in columns"
          :key="column.status"
          :column="column"
          :column-index="index"
          :column-count="columns.length"
          :is-dragging="isDragging"
          :dragged-task-id="draggedTaskId"
          :drag-over-status="dragOverStatus"
          :moving-task-id="movingTaskId"
          class="h-full min-h-0"
          @drag-start="$emit('drag-start', $event.task, $event.event)"
          @drag-end="$emit('drag-end')"
          @drag-enter="$emit('drag-enter', $event)"
          @drag-over="$emit('drag-over', $event)"
          @drag-leave="$emit('drag-leave', $event)"
          @drop="$emit('drop', $event)"
          @add="$emit('add', $event)"
          @edit="$emit('edit', $event)"
          @delete="$emit('delete', $event)"
          @complete="$emit('complete', $event)"
          @move-previous="$emit('move-previous', $event)"
          @move-next="$emit('move-next', $event)"
        />
      </div>

      <!-- Mobile -->
      <TaskMobileList
        class="min-h-0 md:hidden"
        :tasks="tasks"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
        @complete="$emit('complete', $event)"
      />
    </template>
  </section>
</template>

<script setup>
defineProps({
  loading: Boolean,

  tasks: {
    type: Array,
    default: () => [],
  },

  columns: {
    type: Array,
    default: () => [],
  },

  isDragging: Boolean,

  draggedTaskId: {
    type: [String, Number, null],
    default: null,
  },

  dragOverStatus: {
    type: [String, null],
    default: null,
  },

  movingTaskId: {
    type: [String, Number, null],
    default: null,
  },
});

defineEmits([
  "drag-start",
  "drag-end",
  "drag-enter",
  "drag-over",
  "drag-leave",
  "drop",
  "add",
  "edit",
  "delete",
  "complete",
]);

const { tr } = useTaskPage();
</script>
