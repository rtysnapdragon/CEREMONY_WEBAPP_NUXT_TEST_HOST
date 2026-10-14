<template>
  <div class="bar-chart-component">
    <div class="chart-wrap">
      <!-- Y-axis labels -->
      <div class="y-axis">
        <span v-for="label in yLabels" :key="label" class="y-label">{{ label }}</span>
      </div>

      <!-- Bars -->
      <div class="bars-area">
        <!-- Grid lines -->
        <div v-for="i in gridLines" :key="i" class="grid-line" :style="{ bottom: (i / gridLines) * 100 + '%' }" />

        <!-- Bar groups -->
        <div v-for="(item, i) in data" :key="i" class="bar-group">
          <div class="bar-stack">
            <div
              class="bar"
              :style="{
                height: (item.value / maxValue) * 100 + '%',
                background: item.color || 'var(--accent-orange)',
              }"
              :title="`${item.label}: ${item.value}`"
            >
              <div class="bar-tooltip">{{ item.value }}</div>
            </div>
          </div>
          <span class="x-label">{{ item.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface BarDataItem {
  label: string
  value: number
  color?: string
}

const props = withDefaults(defineProps<{
  data: BarDataItem[]
  gridLines?: number
  height?: number
}>(), {
  gridLines: 4,
  height: 200,
})

const maxValue = computed(() => Math.max(...props.data.map(d => d.value)) * 1.1)

const yLabels = computed(() => {
  const labels = []
  for (let i = props.gridLines; i >= 0; i--) {
    labels.push(Math.round((i / props.gridLines) * maxValue.value))
  }
  return labels
})
</script>

<style lang="scss" scoped>
.bar-chart-component {
  width: 100%;
}

.chart-wrap {
  display: flex;
  gap: var(--s-2);
  height: v-bind('height + "px"');
}

.y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-bottom: 24px;
  width: 40px;
  flex-shrink: 0;
}

.y-label {
  font-size: 12px;
  color: var(--text-muted);
  text-align: right;
}

.bars-area {
  flex: 1;
  display: flex;
  align-items: flex-end;
  gap: var(--s-2);
  position: relative;
  padding-bottom: 24px;
  border-left: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
}

.grid-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--border-color);
  opacity: 0.5;
}

.bar-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--s-1);
  height: 100%;
  justify-content: flex-end;
  position: relative;
}

.bar-stack {
  width: 100%;
  max-width: 40px;
  display: flex;
  align-items: flex-end;
  height: calc(100% - 24px);
  position: relative;
}

.bar {
  width: 100%;
  min-height: 4px;
  border-radius: var(--r-sm) var(--r-sm) 0 0;
  transition: height 0.25s ease;
  position: relative;
  cursor: pointer;

  &:hover .bar-tooltip {
    opacity: 1;
    transform: translateX(-50%) translateY(-4px);
  }
}

.bar-tooltip {
  position: absolute;
  bottom: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%) translateY(0);
  background: var(--c-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--r-sm);
  padding: 2px 6px;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  opacity: 0;
  transition: all 0.25s ease;
  pointer-events: none;
}

.x-label {
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
  position: absolute;
  bottom: -20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 50px;
}
</style>
