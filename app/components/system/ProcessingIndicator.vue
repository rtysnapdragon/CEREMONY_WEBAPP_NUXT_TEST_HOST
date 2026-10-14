<template>
  <div v-if="processingStore.hasActiveProcesses" class="flex items-center space-x-2">
    <div
      v-for="process in processingStore.activeProcesses"
      :key="process.id"
      class="relative"
    >
      <div
        class="!w-6 !h-6 rounded-full border-2 flex items-center justify-center"
        :class="getProcessBorderClass(process.type)"
      >
        <Icon
          :name="getProcessIcon(process.type)"
          :class="`!w-3 !h-3 ${getProcessIconColor(process.type)}`"
        />
        
        <!-- Spinning border animation -->
        <div
          class="absolute inset-0 rounded-full border-5 border-transparent animate-spin"
          :class="getSpinBorderClass(process.type)"
          :style="`border-top-color: ${getProcessColor(process.type)}`"
        ></div>
      </div>
      
      <!-- Tooltip -->
      <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
        {{ process.message }}
        <div v-if="process.progress > 0" class="text-xs mt-1">
          {{ process.progress }}% complete
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const processingStore = useProcessingStore()

const getProcessIcon = (type: string) => {
  const icons: Record<string, string> = {
    report_generation: 'lucide:file-text',
    shipment_tracking: 'lucide:map-pin',
    route_optimization: 'lucide:route',
    data_sync: 'lucide:refresh-cw'
  }
  return icons[type] || 'lucide:loader'
}

const getProcessColor = (type: string) => {
  const colors: Record<string, string> = {
    report_generation: '#3b82f6', // blue
    shipment_tracking: '#10b981', // green
    route_optimization: '#8b5cf6', // purple
    data_sync: '#f59e0b' // yellow
  }
  return colors[type] || '#6b7280'
}

const getProcessBorderClass = (type: string) => {
  const classes: Record<string, string> = {
    report_generation: 'border-blue-200 dark:border-blue-800',
    shipment_tracking: 'border-green-200 dark:border-green-800',
    route_optimization: 'border-purple-200 dark:border-purple-800',
    data_sync: 'border-yellow-200 dark:border-yellow-800'
  }
  return classes[type] || 'border-gray-200 dark:border-gray-800'
}

const getSpinBorderClass = (type: string) => {
  const classes: Record<string, string> = {
    report_generation: 'border-blue-500',
    shipment_tracking: 'border-green-500',
    route_optimization: 'border-purple-500',
    data_sync: 'border-yellow-500'
  }
  return classes[type] || 'border-gray-500'
}

const getProcessIconColor = (type: string) => {
  const colors: Record<string, string> = {
    report_generation: 'text-blue-600 dark:text-blue-400',
    shipment_tracking: 'text-green-600 dark:text-green-400',
    route_optimization: 'text-purple-600 dark:text-purple-400',
    data_sync: 'text-yellow-600 dark:text-yellow-400'
  }
  return colors[type] || 'text-gray-600 dark:text-gray-400'
}
</script>

<style scoped>
.group:hover .group-hover\:opacity-100 {
  opacity: 1;
}
</style>