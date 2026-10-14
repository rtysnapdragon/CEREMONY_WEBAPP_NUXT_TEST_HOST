<template>
  <div class="flex flex-col gap-[var(--sp-3)]">
    <TaskMobileItem
      v-for="task in tasks"
      :key="task.id"
      :task="task"
      @edit="$emit('edit', task)"
      @delete="$emit('delete', task)"
      @complete="$emit('complete', task.id)"
    />

    <div
      v-if="!tasks.length"
      class="flex flex-col items-center justify-center gap-[var(--sp-3)] rounded-[var(--r-xl)] border border-dashed border-[var(--c-border)] bg-[var(--c-surface)] p-[var(--sp-10)] text-center"
    >
      <div
        class="flex h-12 w-12 items-center justify-center rounded-[var(--r-lg)] bg-[var(--c-hover)] text-[var(--c-muted)]"
      >
        <i class="ri-task-line text-2xl" />
      </div>

      <h3 class="text-sm font-semibold text-[var(--c-text)]">
        {{ tr("tasks.no_tasks") }}
      </h3>
    </div>
  </div>
</template>

<script setup>
defineProps({
  tasks: {
    type: Array,
    default: () => [],
  },
});

defineEmits(["edit", "delete", "complete"]);

const { tr } = useTaskPage();
</script>
