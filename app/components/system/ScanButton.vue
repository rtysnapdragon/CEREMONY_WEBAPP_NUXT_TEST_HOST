<template>
  <UButton
    @click="openScanner"
    variant="outline"
    size="sm"
    :loading="scannerStore.isScanning"
  >
    <Icon name="lucide:scan-line" class="mr-2" />
    Scan
  </UButton>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  scan: [data: string]
}>()

const scannerStore = useScannerStore()
const { showSuccess } = useGlobalFunctions()

const openScanner = () => {
  // This would trigger the search modal in scan mode
  // For now, we'll simulate a scan
  const mockScanData = `TM${Date.now().toString().slice(-6)}ABCD`
  
  scannerStore.addScanResult({
    type: 'barcode',
    data: mockScanData,
    scannedBy: 'Current User'
  })
  
  emit('scan', mockScanData)
  showSuccess('Barcode scanned successfully!')
}
</script>