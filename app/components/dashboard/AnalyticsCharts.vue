<template>
  <div class="">
    <!-- Revenue -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Trends</h3>
      <div class="h-64">
        <canvas ref="revenueChart"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Chart, registerables } from 'chart.js'
import { nextTick, onMounted } from 'vue'
import { useAnalyticsData } from '@/composables/useAnalyticsData'

Chart.register(...registerables)
const { revenueChart, statusChart } = useAnalyticsData()


const createCharts = () => {
  if (revenueChart.value) {
    const ctx = revenueChart.value.getContext('2d')
    if (ctx) {
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Revenue',
            data: [180000, 220000, 190000, 250000, 280000, 240000],
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      })
    }
  }

  if (statusChart.value) {
    const ctx = statusChart.value.getContext('2d')
    if (ctx) {
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Delivered', 'In Transit', 'Pending', 'Delayed'],
          datasets: [{
            data: [65, 20, 10, 5],
            backgroundColor: [
              'rgb(34, 197, 94)',
              'rgb(59, 130, 246)',
              'rgb(251, 191, 36)',
              'rgb(239, 68, 68)'
            ]
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      })
    }
  }
}

onMounted(() => {
  nextTick(() => createCharts())
})
</script>
