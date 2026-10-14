// composables/useAnalyticsData.ts
import { ref } from 'vue'

export const useAnalyticsData = () => {
  const selectedPeriod = ref('30d')
  const loading = ref(false)
  const revenueChart = ref<HTMLCanvasElement | null>(null)
  const statusChart = ref<HTMLCanvasElement | null>(null)

  const periodOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' }
  ]

  const keyMetrics = [
    {
      title: 'Total Revenue',
      value: '$2.4M',
      change: '+12% from last month',
      changeColor: 'text-green-600 dark:text-green-400',
      changeIcon: 'lucide:trending-up',
      icon: 'lucide:dollar-sign',
      iconBg: 'bg-green-100 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Shipments Delivered',
      value: '1,247',
      change: '+8% from last month',
      changeColor: 'text-green-600 dark:text-green-400',
      changeIcon: 'lucide:trending-up',
      icon: 'lucide:package-check',
      iconBg: 'bg-blue-100 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Fleet Efficiency',
      value: '92%',
      change: '+3% from last month',
      changeColor: 'text-green-600 dark:text-green-400',
      changeIcon: 'lucide:trending-up',
      icon: 'lucide:truck',
      iconBg: 'bg-purple-100 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      title: 'Customer Retention',
      value: '87%',
      change: '-2% from last month',
      changeColor: 'text-red-600 dark:text-red-400',
      changeIcon: 'lucide:trending-down',
      icon: 'lucide:users',
      iconBg: 'bg-orange-100 dark:bg-orange-900/20',
      iconColor: 'text-orange-600 dark:text-orange-400'
    }
  ]

  return {
    selectedPeriod,
    loading,
    periodOptions,
    keyMetrics,
    revenueChart,
    statusChart
  }
}
