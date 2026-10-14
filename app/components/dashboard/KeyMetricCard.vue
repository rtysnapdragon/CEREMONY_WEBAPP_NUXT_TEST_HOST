<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-gray-600 dark:text-gray-400">{{ title }}</p>
        <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">{{ value }}</p>
        <p class="text-sm mt-2" :class="changeColor">
          <Icon :name="changeIcon" class="inline w-4 h-4 mr-1" aria-hidden="true" />
          {{ change }}
        </p>
      </div>
      <div class="p-3 rounded-xl" :class="iconBg">
        <Icon :name="icon" :class="['w-6', 'h-6', iconColor]" aria-hidden="true" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  value: string | number
  change: string
  changeColor: string
  changeIcon: string
  icon: string
  iconBg: string
  iconColor: string
}>()
</script>
