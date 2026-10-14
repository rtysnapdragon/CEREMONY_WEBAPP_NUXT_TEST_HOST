<script setup>
const props = defineProps({
  to: {
    type: [String, Object],
    required: true
  }
})

// const localePath = useLocalePath()

const to = computed(() => {
  if (typeof props.to !== 'string') return props.to

  return /^(https?:)?\/\//.test(props.to)
    ? props.to
    : localePath(props.to)
})
</script>

<template>
  <ULink
    v-bind="$attrs"
    :to="to"
  >
    <slot />
  </ULink>
</template>

<!-- 
<script setup lang="ts">
import type { NuxtLinkProps } from '#app'

const props = defineProps<NuxtLinkProps>()

const localePath = useLocalePath()

const to = computed(() => {
  if (typeof props.to !== 'string') {
    return props.to
  }

  return /^(https?:)?\/\//.test(props.to)
    ? props.to
    : localePath(props.to)
})
</script>

<template>
  <NuxtLink
    v-bind="$attrs"
    v-bind="props"
    :to="to"
  >
    <slot />
  </NuxtLink>
</template> -->