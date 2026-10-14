<template>
  <RBreadCrumb
    title="Event Info"
    description="Manage ceremony events for this wedding"
    icon="i-lucide-calendar"
    :show-back="true"
    back-tooltip="Back to dashboard"
    :back-action="() => navigateTo('/events')"
    :items="[
      { label: 'Events', to: '/events' },
      { label: 'Event Info' },
    ]"
    :actions="[
      { label: 'Add Event', icon: 'i-lucide-plus', to: '/events/new' },
    ]"
  >
    <!-- Override just the icon badge -->
    <template #icon>
      <UIcon name="i-lucide-calendar" class="my-custom-icon" />
    </template>

    <!-- Override just the title -->
    <template #title>
      <h1 class="my-custom-title">Event Info</h1>
    </template>

    <!-- Per-action-item override (keeps the loop, customizes one button's render) -->
    <template #action-item="{ item, onClick }">
      <UButton :icon="item.icon" @click="onClick">{{ item.label }}</UButton>
    </template>

    <!-- OR take over the entire right side yourself -->
    <template #actions="{ actions, onAction }">
      <RBtn
        v-for="a in actions"
        :key="a.label"
        color="primary"
        @click="onAction(a)"
      >
        {{ a.label }}
      </RBtn>
      <RBtn color="neutral" variant="ghost" @click="openMoreMenu">
        More
      </RBtn>
    </template>
  </RBreadCrumb>
</template>

<script setup>
useHead({
  title:'RBreadCrumb using'
})
usePageBreadcrumb({
  // ── Left side: icon + title + description ──────────────────────────
  title: 'Event Info',
  description: 'Manage ceremony events for this wedding',
  icon: 'i-lucide-calendar',

  // ── Back button ──────────────────────────────────────────────────────
  showBack: true,
  backTooltip: 'Back to dashboard',
  fnBack: () => navigateTo('/events'),        // optional — falls back to router.back()

  // ── Breadcrumb trail ─────────────────────────────────────────────────
  separatorIcon: 'i-lucide-chevron-right',    // optional, has a default
  items: [
    { label: 'Events', to: '/events', icon: 'ri-home-smile-2-line' },
    {
      label: 'Categories',
      to: '/events/categories',
      children: [                             // renders as a dropdown chevron
        { label: 'Wedding',   icon: 'ri-heart-line',    to: '/events/categories/wedding' },
        { label: 'Birthday',  icon: 'ri-cake-2-line',   to: '/events/categories/birthday' },
        { label: 'Ceremony',  icon: 'ri-flag-line',     onClick: () => console.log('Ceremony') },
      ],
    },
    { label: 'Event Info' },                  // last crumb, no `to` → rendered as current/active
  ],
    leftButton: {
        icon: 'ri-filter-3-line',
        label: 'Filter',
        tooltip: 'Quick filters',
        render: () => h('div', { class: 'flex flex-col gap-2' }, [
        h('p', 'Filter by status'),
        h(resolveComponent('RBtn'), { size: 'xs' }, () => 'Pending'),
        ]),
        onClick: () => console.log('left button clicked'),
    },
  // ── Right side: action buttons ──────────────────────────────────────
  actions: [
    {
      label: 'Add Event',
      icon: 'i-lucide-plus',
      color: 'primary',
      variant: 'solid',
      size: 'xs',
      to: '/events/new',                      // navigates via NuxtLink logic
    },
    {
      label: 'Export',
      icon: 'ri-download-2-line',
      color: 'neutral',
      variant: 'outline',
      size: 'xs',
      onClick: () => exportEvents(),          // custom handler wins over `to`
    },
    {
      label: 'Save',
      icon: 'ri-save-line',
      color: 'success',
      size: 'xs',
    //   loading: saving.value,                  // reactive loading/disabled both supported
    //   disabled: !isDirty.value,
      onClick: () => submitForm(),
    },
  ],
})

definePageMeta({
  layout: 'navbar',
})
</script>