<script setup lang="ts">
interface Props {
  src: string
  title?: string
  width?: string | number
  height?: string | number
  rounded?: boolean
  frameborder?: string | number
  allow?: string
  allowFullscreen?: boolean
  sandbox?: string
  referrerPolicy?: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url'
  loading?: 'eager' | 'lazy'
  name?: string
  scrolling?: 'auto' | 'yes' | 'no'
  skeleton?: boolean
  fallbackText?: string
}

withDefaults(defineProps<Props>(), {
  title: 'iframe',
  width: '100%',
  height: '720px',
  rounded: true,
  frameborder: '0',
  allow: 'fullscreen',
  allowFullscreen: true,
  referrerPolicy: 'strict-origin-when-cross-origin',
  loading: 'lazy',
  scrolling: 'auto',
  skeleton: true,
  fallbackText: 'Loading…',
})

const emit = defineEmits<{
  (e: 'load' | 'error', event: Event): void
}>()

defineOptions({ inheritAttrs: false })

const iframeRef = ref<HTMLIFrameElement | null>(null)
const isLoading = ref(true)
const hasError = ref(false)

function toCss(value: string | number): string {
  return typeof value === 'number' ? `${value}px` : value
}

function onLoad(event: Event) {
  isLoading.value = false
  hasError.value = false
  emit('load', event)
}

function onError(event: Event) {
  isLoading.value = false
  hasError.value = true
  emit('error', event)
}

defineExpose({ iframe: iframeRef })
</script>

<template>
  <div
    class="relative overflow-hidden bg-white"
    :class="rounded ? 'rounded-2xl shadow-xl border' : ''"
  >
    <div
      v-if="skeleton && isLoading && !hasError"
      class="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm"
    >
      <div class="flex items-center gap-3">
        <div
          class="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"
        />
        <span class="text-sm text-gray-600">
          {{ fallbackText }}
        </span>
      </div>
    </div>

    <div
      v-if="hasError"
      class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-white/80 text-center"
    >
      <span class="text-3xl">⚠️</span>
      <span class="text-sm text-gray-600">Failed to load content</span>
      <slot name="error" />
    </div>

    <iframe
      ref="iframeRef"
      :src="src"
      :title="title"
      :allow="allow"
      :allowfullscreen="allowFullscreen || undefined"
      :sandbox="sandbox || undefined"
      :referrerpolicy="referrerPolicy"
      :loading="loading"
      :name="name || undefined"
      :scrolling="scrolling"
      :frameborder="frameborder"
      :style="{ width: toCss(width), height: toCss(height) }"
      class="block border-0"
      v-bind="$attrs"
      @load="onLoad"
      @error="onError"
    />
  </div>
</template>

<!--
usage:
<template>
  <RIframe
    src="https://app.example.com/demo/calendar"
    height="850px"
    title="Live calendar"
    :rounded="true"
    @load="onLoaded"
    @error="onFailed"
  />
</template>
-->
