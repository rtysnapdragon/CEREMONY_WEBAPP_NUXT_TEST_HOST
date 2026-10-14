<template>
  <div class="av-root" :style="rootStyle" :title="name || alt" @click="emit('click', $event)">
    <!-- Image -->
    <img
      v-if="src && !imgError"
      :src="src"
      :alt="alt || name"
      class="av-img"
      @error="onError"
      @load="imgLoaded = true"
    />

    <!-- Initials fallback -->
    <span v-else class="av-initials" :style="initialsStyle">{{ initials }}</span>

    <!-- Online indicator -->
    <span v-if="online !== undefined" class="av-badge" :class="online ? 'av-online' : 'av-offline'" />

    <!-- Custom badge slot -->
    <slot name="badge" />
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  src?:     string | null
  name?:    string        // used to generate initials + bg color
  alt?:     string
  size?:    number | string  // px number or css string e.g. "2rem"
  shape?:   'circle' | 'rounded' | 'square'
  online?:  boolean          // undefined = no badge
  color?:   string           // override background color for initials
  border?:  boolean
  clickable?: boolean
}>(), {
  size:      36,
  shape:     'circle',
  border:    false,
  clickable: false,
})

const emit = defineEmits<{ (e: 'click', ev: MouseEvent): void }>()

const imgError  = ref(false)
const imgLoaded = ref(false)

watch(() => props.src, () => { imgError.value = false; imgLoaded.value = false })

const onError = () => { imgError.value = true }

// ── Size ──────────────────────────────────────────────────
const sizeVal = computed(() =>
  typeof props.size === 'number' ? `${props.size}px` : props.size
)

const fontSize = computed(() => {
  const px = typeof props.size === 'number' ? props.size : parseInt(props.size)
  return `${Math.max(10, Math.round(px * 0.38))}px`
})

// ── Shape ─────────────────────────────────────────────────
const radius = computed(() => ({
  circle:  '50%',
  rounded: '8px',
  square:  '0px',
}[props.shape]))

// ── Initials ──────────────────────────────────────────────
const initials = computed(() => {
  if (!props.name) return '?'
  const parts = props.name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
})

// Deterministic color from name
const PALETTE = [
  '#6366f1','#8b5cf6','#ec4899','#f43f5e','#f97316',
  '#eab308','#22c55e','#10b981','#06b6d4','#3b82f6',
]
const bgColor = computed(() => {
  if (props.color) return props.color
  if (!props.name) return '#64748b'
  let hash = 0
  for (let i = 0; i < props.name.length; i++) hash = props.name.charCodeAt(i) + ((hash << 5) - hash)
  return PALETTE[Math.abs(hash) % PALETTE.length]
})

// ── Styles ────────────────────────────────────────────────
const rootStyle = computed(() => ({
  width:       sizeVal.value,
  height:      sizeVal.value,
  minWidth:    sizeVal.value,
  borderRadius: radius.value,
  cursor:      props.clickable || props.onClick ? 'pointer' : 'default',
  border:      props.border ? `2px solid var(--c-border, rgba(255,255,255,.15))` : 'none',
  background:  (!props.src || imgError.value) ? bgColor.value : 'transparent',
}))

const initialsStyle = computed(() => ({
  fontSize: fontSize.value,
}))
</script>

<style scoped>
.av-root {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  user-select: none;
}

.av-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}

.av-initials {
  font-weight: 600;
  color: #fff;
  letter-spacing: 0.02em;
  line-height: 1;
}

/* Online/offline badge */
.av-badge {
  position: absolute;
  bottom: 5%;
  right: 5%;
  width: 26%;
  height: 26%;
  max-width: 12px;
  max-height: 12px;
  min-width: 6px;
  min-height: 6px;
  border-radius: 50%;
  border: 2px solid var(--c-surface, #fff);
}
.av-online  { background: #22c55e; }
.av-offline { background: #94a3b8; }
</style>
