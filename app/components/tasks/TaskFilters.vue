<template>
  <section
    class="flex flex-col gap-[var(--sp-3)] border border-[var(--c-border)] pb-[var(--sp-3)] shadow-sm sm:flex-row sm:flex-wrap sm:items-center"
  >
    <!-- Status -->
    <div class="flex flex-wrap gap-1.5">
      <button
        v-for="filter in statusFilters"
        :key="filter.value"
        type="button"
        class="inline-flex items-center gap-1.5 rounded-[var(--r-md)] px-[var(--sp-3)] py-2 text-xs font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--c-accent)]/30"
        :class="
          filterStatus === filter.value
            ? 'bg-[var(--c-accent)] text-[var(--c-text)] shadow-sm'
            : 'text-[var(--c-text)] bg-[var(--c-hover)] hover:bg-[var(--c-accent)] hover:text-[var(--c-text)]'
        "
        @click="$emit('update:status', filter.value)"
      >
        <i :class="filter.icon" />

        {{ filter.label }}
      </button>
    </div>

    <!-- Divider -->
    <div class="hidden h-5 w-px bg-[var(--c-border)] sm:block" />

    <!-- Priority -->
    <div class="flex flex-wrap gap-1.5">
      <button
        v-for="filter in priorityFilters"
        :key="filter.value"
        type="button"
        class="rounded-[var(--r-md)] px-[var(--sp-3)] py-2 text-xs font-medium text-[var(--c-muted)] transition-all duration-150 hover:bg-[var(--c-hover)] hover:text-[var(--c-text)] focus:outline-none focus:ring-2 focus:ring-[var(--c-accent)]/30"
        :class="
          filterPriority === filter.value
            ? 'bg-[var(--c-accent)] text-[var(--c-text)] shadow-sm'
            : 'text-[var(--c-text)] bg-[var(--c-hover)] hover:bg-[var(--c-accent)] hover:text-[var(--c-text)]'
        "
        @click="$emit('update:priority', filter.value)"
      >
        {{ filter.label }}
      </button>
    </div>
  </section>
</template>

<script setup>
defineProps({
  statusFilters: {
    type: Array,
    default: () => [],
  },

  priorityFilters: {
    type: Array,
    default: () => [],
  },

  filterStatus: {
    type: [String, null],
    default: null,
  },

  filterPriority: {
    type: [String, null],
    default: null,
  },
});

defineEmits(["update:status", "update:priority"]);
</script>
