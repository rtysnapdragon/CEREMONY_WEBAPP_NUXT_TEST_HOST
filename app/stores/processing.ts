import { defineStore,acceptHMRUpdate } from 'pinia'

export interface ProcessingStatus {
  id: string
  type: 'report_generation' | 'shipment_tracking' | 'route_optimization' | 'data_sync'
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number
  message: string
  startedAt: Date
  completedAt?: Date
  relatedId?: string
}

export const useProcessingStore = defineStore('processing', {
  state: () => ({
    activeProcesses: [] as ProcessingStatus[],
    completedProcesses: [] as ProcessingStatus[]
  }),

  getters: {
    hasActiveProcesses: (state) => state.activeProcesses.length > 0,
    reportGenerationActive: (state) => 
      state.activeProcesses.some(p => p.type === 'report_generation'),
    trackingProcessActive: (state) => 
      state.activeProcesses.some(p => p.type === 'shipment_tracking'),
    
    getProcessByType: (state) => (type: string) => 
      state.activeProcesses.find(p => p.type === type),
    
    getProcessStatusColor: () => (status: string) => {
      const colors: Record<string, string> = {
        pending: 'yellow',
        processing: 'blue',
        completed: 'green',
        error: 'red'
      }
      return colors[status] || 'gray'
    }
  },

  actions: {
    startProcess(type: ProcessingStatus['type'], message: string, relatedId?: string) {
      const process: ProcessingStatus = {
        id: Date.now().toString(),
        type,
        status: 'processing',
        progress: 0,
        message,
        startedAt: new Date(),
        relatedId
      }
      
      this.activeProcesses.push(process)
      return process.id
    },

    updateProgress(processId: string, progress: number, message?: string) {
      const process = this.activeProcesses.find(p => p.id === processId)
      if (process) {
        process.progress = progress
        if (message) process.message = message
      }
    },

    completeProcess(processId: string, success: boolean = true) {
      const processIndex = this.activeProcesses.findIndex(p => p.id === processId)
      if (processIndex !== -1) {
        const process = this.activeProcesses[processIndex]
        process.status = success ? 'completed' : 'error'
        process.progress = 100
        process.completedAt = new Date()
        
        // Move to completed processes
        this.completedProcesses.unshift(process)
        this.activeProcesses.splice(processIndex, 1)
        
        // Keep only last 50 completed processes
        if (this.completedProcesses.length > 50) {
          this.completedProcesses = this.completedProcesses.slice(0, 50)
        }
      }
    }
  }
})


// make sure to pass the right store definition, `useAuth` in this case.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useProcessingStore, import.meta.hot))
}
