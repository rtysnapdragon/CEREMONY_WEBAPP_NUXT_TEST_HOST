<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">{{ title }}</h3>
    <div class="space-y-4">
      <div v-for="item in metrics" :key="item.label" class="space-y-1">
        <div class="flex items-center justify-between">
          <span class="text-gray-600 dark:text-gray-400">{{ item.label }}</span>
          <span class="font-semibold" :class="item.valueColor">{{ item.value }}</span>
        </div>
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div class="h-2 rounded-full" :class="item.barColor" :style="{ width: item.percentage }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  metrics: {
    label: string
    value: string | number
    percentage: string
    barColor: string
    valueColor: string
  }[]
}>()
</script>
