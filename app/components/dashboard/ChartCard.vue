<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">{{ title }}</h3>
    <div class="h-64">
      <canvas ref="canvasRef"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, nextTick } from 'vue'
import { Chart, ChartType, registerables } from 'chart.js'

// Register Chart.js components
Chart.register(...registerables)

// Props definition
const props = defineProps<{
  title: string
  chartData: any
  chartOptions?: any
  type?: ChartType
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

// Create chart when component mounts
onMounted(async () => {
  await nextTick()
  if (canvasRef.value) {
    chartInstance = new Chart(canvasRef.value.getContext('2d')!, {
      type: props.type || 'line',
      data: props.chartData,
      options: props.chartOptions || {
        responsive: true,
        maintainAspectRatio: false,
      },
    })
  }
})

// Cleanup on unmount
onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})
</script>
