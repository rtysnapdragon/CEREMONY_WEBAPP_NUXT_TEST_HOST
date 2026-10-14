<template>
  <article
    class="group relative flex h-full min-h-0 flex-col overflow-hidden rounded-[var(--r-md)] border border-[var(--c-border)] bg-[var(--c-surface)] shadow-sm transition-all duration-200"
    :class="[
      dragOverStatus === column.status
        ? 'border-primary ring-2 ring-primary/20'
        : '',
      isDragging ? 'select-none' : '',
    ]"
    @dragenter.prevent="handleDragEnter"
    @dragover.prevent="handleDragOver"
    @dragleave="handleDragLeave"
    @drop.prevent="handleDrop"
  >
    <!-- ========================================= -->
    <!-- Column Header -->
    <!-- ========================================= -->

    <div
      class="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--c-border)] p-4"
    >
      <div class="flex min-w-0 items-center gap-2">
        <!-- Status indicator -->
        <span
          class="h-2.5 w-2.5 shrink-0 rounded-full"
          :class="column.color || 'bg-[var(--c-muted)]'"
        />

        <!-- Column title -->
        <h3 class="truncate text-sm font-semibold text-[var(--c-text)]">
          {{ column.label }}
        </h3>

        <!-- Count -->
        <span
          class="shrink-0 rounded-full bg-[var(--c-muted)]/10 px-2 py-0.5 text-xs font-medium text-[var(--c-muted)]"
        >
          {{ column.tasks?.length || 0 }}
        </span>
      </div>

      <!-- Add -->
      <button
        type="button"
        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--r-sm)] text-[var(--c-muted)] transition-colors hover:bg-[var(--c-muted)]/10 hover:text-[var(--c-text)]"
        @click="$emit('add', column.status)"
      >
        <i class="ri-add-line text-lg" />
      </button>
    </div>

    <!-- ========================================= -->
    <!-- Scrollable Cards Area -->
    <!-- ========================================= -->

    <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <div class="flex flex-col gap-3 p-3">
        <!-- Empty -->
        <div
          v-if="!column.tasks?.length"
          class="flex min-h-32 items-center justify-center rounded-[var(--r-md)] border border-dashed border-[var(--c-border)] text-center"
        >
          <div>
            <i
              class="ri-inbox-line mb-2 block text-2xl text-[var(--c-muted)]"
            />
            <p class="text-xs text-[var(--c-muted)]">
              {{ tr("common.noData") }}
            </p>
          </div>
        </div>

        <!-- Tasks -->
        <TaskCard
          v-for="task in column.tasks"
          :key="task.id"
          :task="task"
          :is-dragging="isDragging"
          :dragged-task-id="draggedTaskId"
          :moving-task-id="movingTaskId"
          :column-index="columnIndex"
          :column-count="columnCount"
          @drag-start="$emit('drag-start', { task, event: $event })"
          @drag-end="$emit('drag-end')"
          @edit="$emit('edit', task)"
          @delete="$emit('delete', task)"
          @complete="$emit('complete', task)"
          @move-previous="$emit('move-previous', { task, columnIndex })"
          @move-next="$emit('move-next', { task, columnIndex })"
        />
      </div>
    </div>

    <!-- ========================================= -->
    <!-- Column Footer -->
    <!-- ========================================= -->

    <div class="shrink-0 border-t border-[var(--c-border)] p-3">
      <button
        type="button"
        class="flex w-full items-center justify-center gap-2 rounded-[var(--r-sm)] border border-dashed border-[var(--c-border)] px-3 py-2 text-sm font-medium text-[var(--c-muted)] transition-colors hover:border-[var(--c-primary)] hover:bg-[var(--c-primary)]/5 hover:text-[var(--c-primary)]"
        @click="$emit('add', column.status)"
      >
        <i class="ri-add-line" />
        <span>{{ tr("common.add") }}</span>
      </button>
    </div>
  </article>
</template>

<script setup>
const props = defineProps({
  column: { type: Object, required: true },
  columnIndex: { type: Number, default: 0 },
  columnCount: { type: Number, default: 1 },
  isDragging: Boolean,
  draggedTaskId: { type: [String, Number, null], default: null },
  dragOverStatus: { type: [String, null], default: null },
  movingTaskId: { type: [String, Number, null], default: null },
});

const emit = defineEmits([
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
  "move-previous",
  "move-next",
]);

const { tr } = useTaskPage();

const handleDragEnter = (event) =>
  emit("drag-enter", { status: props.column.status, event });
const handleDragOver = (event) =>
  emit("drag-over", { status: props.column.status, event });
const handleDragLeave = (event) =>
  emit("drag-leave", { status: props.column.status, event });
const handleDrop = (event) =>
  emit("drop", { status: props.column.status, event });
</script>
