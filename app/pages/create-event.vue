<template>
  <EventEmptyState />
</template>

<script setup>
definePageMeta({ layout: false, middleware: ['auth'] })

const eventStore = useEventStore()

onMounted(async () => {
  await nextTick()
  if (eventStore.initialized && eventStore.events.length > 0) {
    navigateTo('/', { replace: true })
  }
})
</script>
