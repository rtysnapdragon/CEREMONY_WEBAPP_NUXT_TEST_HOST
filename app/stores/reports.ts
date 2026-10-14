import { defineStore,acceptHMRUpdate } from 'pinia'

export interface ReportData {
  id: string
  title: string
  type: 'shipments' | 'revenue' | 'performance' | 'customers' | 'fleet'
  period: 'daily' | 'weekly' | 'monthly' | 'yearly'
  data: any[]
  generatedAt: Date
  generatedBy: string
}

export const useReportsStore = defineStore('reports', {
  state: () => ({
    reports: [] as ReportData[],
    loading: false
  }),

  getters: {
    getReportsByType: (state) => (type: string) => 
      state.reports.filter(r => r.type === type),
    
    recentReports: (state) => 
      state.reports.sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime()).slice(0, 5)
  },

  actions: {
    async generateReport(type: ReportData['type'], period: ReportData['period']) {
      this.loading = true
      try {
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        const report: ReportData = {
          id: Date.now().toString(),
          title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report - ${period}`,
          type,
          period,
          data: this.generateMockData(type, period),
          generatedAt: new Date(),
          generatedBy: 'Current User'
        }
        
        this.reports.unshift(report)
        return report
      } catch (error) {
        console.log('Failed to generate report:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    generateMockData(type: string, period: string) {
      const dataPoints = period === 'daily' ? 24 : period === 'weekly' ? 7 : period === 'monthly' ? 30 : 12
      
      return Array.from({ length: dataPoints }, (_, i) => ({
        label: `Period ${i + 1}`,
        value: Math.floor(Math.random() * 1000) + 100,
        count: Math.floor(Math.random() * 50) + 10
      }))
    }
  }
})


// make sure to pass the right store definition, `useAuth` in this case.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useReportsStore, import.meta.hot))
}
