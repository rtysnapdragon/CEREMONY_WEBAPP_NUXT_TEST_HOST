// composables/useFileUpload.js — File upload via Spring API
// POST /api/v1/files/upload → returns { url, filename, fileId }
// GET  /api/v1/weddings/{id}/files
// DELETE /api/v1/files/{fileId}

export const useFileUpload = () => {
  const eventStore = useEventStore()
  const uploading = ref(false)
  const files = ref([])

  const uploadFile = async (file) => {
    uploading.value = true
    try {
      const formData = new FormData()
      formData.append('file', file)
      const { data, error } = await useHttp('/api/v1/files/upload', {
        method: 'POST', data: formData, isGlobal: true,
      })
      if (error.value) return { success: false, error: error.value }
      return { success: true, data: data.value?.data ?? data.value }
    } finally {
      uploading.value = false
    }
  }

  const fetchWeddingFiles = async () => {
    const id = eventStore.activeEvent?.id
    if (!id) return
    const { data } = await useHttp(`/api/v1/events/${id}/files`, { method: 'GET', isGlobal: true })
    const result = data.value?.data ?? data.value
    files.value = Array.isArray(result) ? result : result?.content ?? []
  }

  const deleteFile = async (fileId) => {
    const { error } = await useHttp(`/api/v1/files/${fileId}`, { method: 'DELETE', isGlobal: true })
    if (error.value) return { success: false, error: error.value }
    files.value = files.value.filter((f) => f.id !== fileId)
    return { success: true }
  }

  return { uploading, files, uploadFile, fetchWeddingFiles, deleteFile }
}
