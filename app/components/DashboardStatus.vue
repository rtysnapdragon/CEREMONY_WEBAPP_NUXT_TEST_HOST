<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <div 
      v-for="stat in stats" 
      :key="stat.title"
      class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200"
    >
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600 dark:text-gray-400">{{ stat.title }}</p>
          <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">{{ stat.value }}</p>
          <p class="text-sm mt-2" :class="stat.changeColor">
            <Icon :name="stat.changeIcon" class="inline w-4 h-4 mr-1" />
            {{ stat.change }}
          </p>
        </div>
        <div class="p-3 rounded-xl" :class="stat.iconBg">
          <Icon :name="stat.icon" :class="`w-6 h-6 ${stat.iconColor}`" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface DashboardStat {
  title: string
  value: string
  change: string
  changeColor: string
  changeIcon: string
  icon: string
  iconBg: string
  iconColor: string
}

const props = defineProps<{
  activeShipments: number
  totalVehicles: number
  deliveredToday: number
  revenue: number
}>()

const stats = computed((): DashboardStat[] => [
  {
    title: 'Active Shipments',
    value: props.activeShipments.toString(),
    change: '+12% from last month',
    changeColor: 'text-green-600 dark:text-green-400',
    changeIcon: 'lucide:trending-up',
    icon: 'lucide:package',
    iconBg: 'bg-blue-100 dark:bg-blue-900/20',
    iconColor: 'text-blue-600 dark:text-blue-400'
  },
  {
    title: 'Total Vehicles',
    value: props.totalVehicles.toString(),
    change: '2 in maintenance',
    changeColor: 'text-yellow-600 dark:text-yellow-400',
    changeIcon: 'lucide:wrench',
    icon: 'lucide:truck',
    iconBg: 'bg-green-100 dark:bg-green-900/20',
    iconColor: 'text-green-600 dark:text-green-400'
  },
  {
    title: 'Delivered Today',
    value: props.deliveredToday.toString(),
    change: '+8% from yesterday',
    changeColor: 'text-green-600 dark:text-green-400',
    changeIcon: 'lucide:trending-up',
    icon: 'lucide:check-circle',
    iconBg: 'bg-purple-100 dark:bg-purple-900/20',
    iconColor: 'text-purple-600 dark:text-purple-400'
  },
  {
    title: 'Revenue',
    value: `$${(props.revenue / 1000).toFixed(0)}K`,
    change: '+15% from last week',
    changeColor: 'text-green-600 dark:text-green-400',
    changeIcon: 'lucide:trending-up',
    icon: 'lucide:dollar-sign',
    iconBg: 'bg-orange-100 dark:bg-orange-900/20',
    iconColor: 'text-orange-600 dark:text-orange-400'
  }
])
</script>