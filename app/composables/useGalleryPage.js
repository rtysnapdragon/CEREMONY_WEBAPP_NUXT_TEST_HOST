export function useGalleryPage() {
  const galleryStore = useGalleryStore()
  const eventStore = useEventStore()
  const toast = useToastStore()

  const fileInput = ref(null)
  const isDragging = ref(false)
  const lightboxPhoto = ref(null)
  const lightboxIndex = ref(0)
  const deletingItem = ref(null)
  const deleting = ref(false)

  const previewQueue = ref([])
  const uploading = ref(false)
  const uploadProgress = ref(0)

  let dragCounter = 0

  const { init } = useEventPage(() => galleryStore.fetchGallery())

  const triggerUpload = () => fileInput.value?.click()

  const addFiles = (files) => {
    for (const file of files) {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) continue
      previewQueue.value.push({ file, previewUrl: URL.createObjectURL(file), status: 'pending' })
    }
  }

  const onFileInputChange = (e) => {
    addFiles(Array.from(e.target.files ?? []))
    e.target.value = ''
  }

  const onDrop = (e) => {
    isDragging.value = false
    dragCounter = 0
    addFiles(Array.from(e.dataTransfer.files ?? []))
  }

  const onDragLeave = () => {
    dragCounter--
    if (dragCounter <= 0) { isDragging.value = false; dragCounter = 0 }
  }

  const removeFromQueue = (i) => {
    URL.revokeObjectURL(previewQueue.value[i].previewUrl)
    previewQueue.value.splice(i, 1)
  }

  const clearQueue = () => {
    previewQueue.value.forEach((item) => URL.revokeObjectURL(item.previewUrl))
    previewQueue.value = []
  }

  const uploadAll = async () => {
    uploading.value = true
    uploadProgress.value = 0
    const total = previewQueue.value.filter((i) => i.status === 'pending').length
    let done = 0

    for (const item of previewQueue.value) {
      if (item.status !== 'pending') continue
      item.status = 'uploading'
      const result = await galleryStore.uploadPhoto(item.file)
      item.status = result.success ? 'done' : 'error'
      done++
      uploadProgress.value = Math.round((done / total) * 100)
    }

    const successCount = previewQueue.value.filter((i) => i.status === 'done').length
    const errorCount = previewQueue.value.filter((i) => i.status === 'error').length

    uploading.value = false
    if (successCount) toast.add(`${successCount} photo(s) added to gallery`, 'Uploaded')
    if (errorCount) toast.add(`${errorCount} file(s) failed`, 'Error')

    setTimeout(() => { clearQueue(); uploadProgress.value = 0 }, 1200)
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const openLightbox = (photo) => {
    lightboxIndex.value = galleryStore.items.findIndex((p) => p.id === photo.id)
    lightboxPhoto.value = photo
  }

  const lightboxStep = (dir) => {
    const next = lightboxIndex.value + dir
    if (next < 0 || next >= galleryStore.items.length) return
    lightboxIndex.value = next
    lightboxPhoto.value = galleryStore.items[next]
  }

  const confirmDelete = (photo) => { deletingItem.value = photo }

  const doDelete = async () => {
    deleting.value = true
    try {
      const result = await galleryStore.deletePhoto(deletingItem.value.id)
      if (result.success) toast.add('Photo removed', 'Deleted')
      else toast.add('Failed to delete', 'Error')
      deletingItem.value = null
    } finally {
      deleting.value = false
    }
  }

  return {
    galleryStore, eventStore,
    fileInput, isDragging, lightboxPhoto, lightboxIndex, deletingItem, deleting,
    previewQueue, uploading, uploadProgress,
    init, triggerUpload, addFiles, onFileInputChange, onDrop, onDragLeave,
    removeFromQueue, clearQueue, uploadAll,
    formatSize, openLightbox, lightboxStep,
    confirmDelete, doDelete,
  }
}
