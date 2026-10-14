<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <div
      v-for="metric in keyMetrics"
      :key="metric.title"
      class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600 dark:text-gray-400">{{ metric.title }}</p>
          <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">{{ metric.value }}</p>
          <p class="text-sm mt-2" :class="metric.changeColor">
            <Icon :name="metric.changeIcon" class="inline w-4 h-4 mr-1" />
            {{ metric.change }}
          </p>
        </div>
        <div class="p-3 rounded-xl" :class="metric.iconBg">
          <Icon :name="metric.icon" :class="`w-6 h-6 ${metric.iconColor}`" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAnalyticsData } from '../../composables/useAnalyticsData'
const { keyMetrics } = useAnalyticsData()
</script>
