import { defineStore,acceptHMRUpdate } from 'pinia'

export interface ScanResult {
  id: string
  type: 'barcode' | 'qr'
  data: string
  timestamp: Date
  location?: string
  scannedBy?: string
}

export const useScannerStore = defineStore('scanner', {
  state: () => ({
    scanHistory: [] as ScanResult[],
    isScanning: false,
    lastScanResult: null as ScanResult | null,
    scannerEnabled: true
  }),

  getters: {
    recentScans: (state) => state.scanHistory.slice(0, 10),
    scansByType: (state) => (type: 'barcode' | 'qr') => 
      state.scanHistory.filter(scan => scan.type === type)
  },

  actions: {
    addScanResult(result: Omit<ScanResult, 'id' | 'timestamp'>) {
      const scanResult: ScanResult = {
        id: Date.now().toString(),
        timestamp: new Date(),
        ...result
      }
      
      this.scanHistory.unshift(scanResult)
      this.lastScanResult = scanResult
      
      // Keep only last 100 scans
      if (this.scanHistory.length > 100) {
        this.scanHistory = this.scanHistory.slice(0, 100)
      }
    },

    setScanning(scanning: boolean) {
      this.isScanning = scanning
    },

    clearScanHistory() {
      this.scanHistory = []
      this.lastScanResult = null
    }
  }
})

// make sure to pass the right store definition, `useAuth` in this case.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useScannerStore, import.meta.hot))
}