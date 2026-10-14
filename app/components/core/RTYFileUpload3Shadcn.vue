<script setup lang="ts">
import { ref, computed } from 'vue'
import { X, Upload, Video, File } from 'lucide-vue-next'

type UploadType = 'file' | 'video'

interface Props {
  uploadType?: UploadType
  multiple?: boolean
  accept?: string
  maxSize?: number // in MB
  label?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  uploadType: 'file',
  multiple: false,
  accept: '',
  maxSize: 10,
  label: 'Upload files',
  class: ''
})

const emit = defineEmits(['files-selected', 'videos-selected'])

const selectedFiles = ref<File[]>([])
const errorMessage = ref<string | null>(null)
const isDragOver = ref(false)

const defaultAccept = computed(() => {
  if (props.accept) return props.accept
  return props.uploadType === 'video' 
    ? 'video/*' 
    : 'image/*,.pdf,.doc,.docx,.xls,.xlsx'
})

const iconComponent = computed(() => {
  return props.uploadType === 'video' ? Video : File
})

const openFileDialog = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.multiple = props.multiple
  input.accept = defaultAccept.value

  input.onchange = (e: Event) => {
    const files = (e.target as HTMLInputElement).files
    if (files) handleFiles(Array.from(files))
  }

  input.click()
}

const handleFiles = (files: File[]) => {
  errorMessage.value = null

  // Validate file sizes
  const oversizedFiles = files.filter(file => file.size > props.maxSize * 1024 * 1024)
  if (oversizedFiles.length > 0) {
    errorMessage.value = `Some files exceed the maximum size of ${props.maxSize}MB`
    return
  }

  selectedFiles.value = props.multiple 
    ? [...selectedFiles.value, ...files] 
    : [files[0]]

  if (props.uploadType === 'video') {
    emit('videos-selected', selectedFiles.value)
  } else {
    emit('files-selected', selectedFiles.value)
  }
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = false

  if (e.dataTransfer?.files) {
    handleFiles(Array.from(e.dataTransfer.files))
  }
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
}
</script>

<template>
  <div :class="['flex flex-col gap-4', props.class]">
    <div
      @click="openFileDialog"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      :class="[
        'relative rounded-lg border-2 border-dashed border-muted cursor-pointer transition-colors hover:border-primary',
        isDragOver ? 'border-primary bg-accent/50' : 'bg-background'
      ]"
    >
      <div class="flex flex-col items-center justify-center gap-4 p-8 text-center">
        <Upload class="w-8 h-8 text-muted-foreground" />
        <div class="space-y-1">
          <p class="text-sm font-medium text-foreground">
            Drag & drop your {{ uploadType === 'video' ? 'videos' : 'files' }} here or click to browse
          </p>
          <p class="text-xs text-muted-foreground">
            Max size: {{ maxSize }}MB • {{ multiple ? 'Multiple files allowed' : 'Single file only' }}
          </p>
        </div>
      </div>
    </div>

    <div v-if="errorMessage" class="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
      {{ errorMessage }}
    </div>

    <div v-if="selectedFiles.length > 0" class="space-y-2">
      <div v-for="(file, index) in selectedFiles" :key="file.name + index" class="flex items-center justify-between p-3 rounded-md bg-muted/50">
        <div class="flex items-center gap-3">
          <component :is="iconComponent" class="w-5 h-5 text-muted-foreground" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate text-foreground">{{ file.name }}</p>
            <p class="text-xs text-muted-foreground">{{ (file.size / 1024 / 1024).toFixed(2) }}MB</p>
          </div>
        </div>
        <button
          @click.stop="removeFile(index)"
          class="p-1 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<!-- 

npm install lucide-vue-next

<template>
  <div class="max-w-md mx-auto">
    <RTYFileUpload 
      upload-type="video"
      @videos-selected="handleVideos"
      label="Upload Videos"
      :multiple="true"
      :max-size="50"
      class="mt-4"
    />
  </div>
</template>

<script setup>
const handleVideos = (videos) => {
  console.log('Selected videos:', videos)
  // Handle video upload logic here
}
</script>



<template>
  <div class="max-w-md mx-auto">
    <RTYFileUpload 
      @files-selected="handleFiles"
      label="Upload Documents"
      class="mt-4"
    />
  </div>
</template>

<script setup>
const handleFiles = (files) => {
  console.log('Selected files:', files)
  // Handle file upload logic here
}
</script> -->