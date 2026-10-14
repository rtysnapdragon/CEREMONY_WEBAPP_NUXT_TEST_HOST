<template>
  <div class="donut-chart-wrap">
    <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`" class="donut-svg">
      <!-- Background ring -->
      <circle
        :cx="center" :cy="center" :r="radius"
        fill="none"
        stroke="var(--border-color)"
        :stroke-width="strokeWidth"
      />
      <!-- Data segments -->
      <circle
        v-for="(segment, i) in segments"
        :key="i"
        :cx="center" :cy="center" :r="radius"
        fill="none"
        :stroke="segment.color"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
        :stroke-dasharray="`${segment.arc} ${circumference}`"
        :stroke-dashoffset="segment.offset"
        :transform="`rotate(-90 ${center} ${center})`"
        class="donut-segment"
      />
    </svg>
    <!-- Center label -->
    <div class="donut-center-label" :style="{ width: size + 'px', height: size + 'px' }">
      <slot name="center">
        <span class="center-value">{{ centerValue }}</span>
        <span class="center-label">{{ centerLabel }}</span>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface DonutDataItem {
  value: number
  color: string
  label: string
}

const props = withDefaults(defineProps<{
  data: DonutDataItem[]
  size?: number
  strokeWidth?: number
  centerValue?: string
  centerLabel?: string
}>(), {
  size: 120,
  strokeWidth: 12,
  centerValue: '',
  centerLabel: '',
})

const center = computed(() => props.size / 2)
const radius = computed(() => (props.size / 2) - (props.strokeWidth / 2) - 4)
const circumference = computed(() => 2 * Math.PI * radius.value)

const total = computed(() => props.data.reduce((sum, d) => sum + d.value, 0))

const segments = computed(() => {
  let currentOffset = circumference.value * 0.25 // Start at top (offset by 25%)
  return props.data.map(item => {
    const arc = (item.value / total.value) * circumference.value
    const offset = circumference.value - currentOffset
    currentOffset += arc
    return { ...item, arc, offset }
  })
})
</script>

<style lang="scss" scoped>
.donut-chart-wrap {
  position: relative;
  display: inline-block;
}

.donut-svg {
  display: block;
}

.donut-segment {
  transition: stroke-dasharray 0.012ms ease;
}

.donut-center-label {
  position: absolute;
  top: 0;
  left: 0;
  @include flex-center;
  flex-direction: column;
  pointer-events: none;
}

.center-value {
  font-size: 23px;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.03em;
}

.center-label {
  font-size: 12px;
  color: var(--text-muted);
}
</style>
