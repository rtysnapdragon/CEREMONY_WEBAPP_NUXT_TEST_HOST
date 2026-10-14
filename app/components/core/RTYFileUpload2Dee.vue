

<template>
  <div class="rty-upload-container">
    <button
      type="button"
      @click="openModal"
      class="rty-upload-button"
    >
      <!-- <component :is="iconComponent" class="icon" /> -->
      <div v-html="iconComponent" class="icon"></div>
      <span>{{ label }}</span>
    </button>

    <TransitionRoot appear :show="isOpen" as="template">
      <Dialog as="div" @close="closeModal" class="rty-upload-dialog">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="rty-overlay" />
        </TransitionChild>

        <div class="rty-dialog-container">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="rty-dialog-panel">
              <DialogTitle class="rty-dialog-title">
                {{ uploadType === 'video' ? 'Upload Videos' : 'Upload Files' }}
                <button @click="closeModal" class="rty-close-button">
                  <i class="ri-close-line icon"></i> 
                </button>
              </DialogTitle>

              <div
                @drop="handleDrop"
                @dragover="handleDragOver"
                @dragleave="handleDragLeave"
                @click="openFileDialog"
                :class="['rty-drop-zone', { 'active': dropZoneActive }]"
              >
                <!-- <component :is="iconComponent" class="dropzone-icon" /> -->
                <div v-html="iconComponent" class="dropzone-icon"></div>
                <p class="dropzone-text">
                  Drag & drop your {{ uploadType === 'video' ? 'videos' : 'files' }} here or click to browse
                </p>
                <p class="dropzone-hint">
                  Max size: {{ maxSize }}MB • {{ multiple ? 'Multiple files allowed' : 'Single file only' }}
                </p>
              </div>

              <div v-if="errorMessage" class="rty-error-message">
                {{ errorMessage }}
              </div>

              <div v-if="selectedFiles.length > 0" class="rty-file-list">
                <div v-for="(file, index) in selectedFiles" :key="file.name + index" class="rty-file-item">
                  <div class="file-info">
                    <!-- <component :is="iconComponent" class="file-icon" /> -->
                    <div v-html="iconComponent" class="file-icon"></div>
                    <div class="file-details">
                      <p class="file-name">{{ file.name }}</p>
                      <p class="file-size">{{ (file.size / 1024 / 1024).toFixed(2) }}MB</p>
                    </div>
                  </div>
                  <button @click.stop="removeFile(index)" class="rty-remove-button">
                    <XMarkIcon class="icon" />
                  </button>
                </div>
              </div>

              <div class="rty-dialog-actions">
                <button
                  type="button"
                  @click="closeModal"
                  class="rty-cancel-button"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  @click="closeModal"
                  class="rty-confirm-button"
                  :disabled="selectedFiles.length === 0"
                >
                  Confirm Selection
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
// import { Dialog, TransitionRoot, TransitionChild } from '@headlessui/vue'
// import { XMarkIcon, PaperClipIcon, FilmIcon } from '@heroicons/vue/24/outline'
// <i class="ri-close-line"></i>         <!-- XMarkIcon -->
// <i class="ri-attachment-2"></i>      <!-- PaperClipIcon -->
// <i class="ri-movie-line"></i>        <!-- FilmIcon -->

type UploadType = 'file' | 'video'

interface Props {
  uploadType?: UploadType
  multiple?: boolean
  accept?: string
  maxSize?: number // in MB
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  uploadType: 'file',
  multiple: false,
  accept: '',
  maxSize: 10,
  label: 'Upload files'
})

const emit = defineEmits(['files-selected', 'videos-selected'])

const isOpen = ref(true) // Initially open for demonstration purposes
// const isOpen = ref(false)
const selectedFiles = ref<File[]>([])
const errorMessage = ref<string | null>(null)
const dropZoneActive = ref(false)

const defaultAccept = computed(() => {
  if (props.accept) return props.accept
  return props.uploadType === 'video' 
    ? 'video/*' 
    : 'image/*,.pdf,.doc,.docx,.xls,.xlsx'
})

const iconComponent = computed(() => {
  return props.uploadType === 'video' ? "<i class='ri-movie-line'></i>  " :"<i class='ri-attachment-2'></i>"
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
  dropZoneActive.value = false

  if (e.dataTransfer?.files) {
    handleFiles(Array.from(e.dataTransfer.files))
  }
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  dropZoneActive.value = true
}

const handleDragLeave = () => {
  dropZoneActive.value = false
}

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
}

const closeModal = () => {
  isOpen.value = false
}

const openModal = () => {
  isOpen.value = true
}
</script>

<style lang="scss">
.rty-upload-container {
  font-family: 'Inter', sans-serif;
}

.rty-upload-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background-color: #3b82f6;
  color: white;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1.25rem;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: #2563eb;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
  }

  .icon {
    width: 1.25rem;
    height: 1.25rem;
  }
}

.rty-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 10;
}

.rty-dialog-container {
  position: fixed;
  inset: 0;
  overflow-y: auto;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.rty-dialog-panel {
  width: 100%;
  max-width: 32rem;
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.rty-dialog-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  border-bottom: 1px solid #e5e7eb;
}

.rty-close-button {
  padding: 0.25rem;
  border-radius: 0.375rem;
  color: #6b7280;
  transition: all 0.2s ease;
  border: none;
  background: none;
  cursor: pointer;

  &:hover {
    color: #111827;
    background-color: #f3f4f6;
  }

  .icon {
    width: 1.25rem;
    height: 1.25rem;
  }
}

.rty-drop-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  margin: 1.5rem;
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  background-color: #f9fafb;
  cursor: pointer;
  transition: all 0.2s ease;

  &.active {
    border-color: #3b82f6;
    background-color: #eff6ff;
  }

  &:hover:not(.active) {
    border-color: #9ca3af;
  }

  .dropzone-icon {
    width: 2.5rem;
    height: 2.5rem;
    color: #9ca3af;
    margin-bottom: 1rem;
  }

  .dropzone-text {
    font-size: 1rem;
    font-weight: 500;
    color: #111827;
    margin-bottom: 0.25rem;
    text-align: center;
  }

  .dropzone-hint {
    font-size: 0.875rem;
    color: #6b7280;
    text-align: center;
  }
}

.rty-error-message {
  padding: 0.75rem 1.5rem;
  margin: 0 1.5rem 1.5rem;
  background-color: #fee2e2;
  color: #b91c1c;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.rty-file-list {
  margin: 0 1.5rem 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
}

.rty-file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background-color: white;
  border-bottom: 1px solid #e5e7eb;

  &:last-child {
    border-bottom: none;
  }

  .file-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
    min-width: 0;

    .file-icon {
      width: 1.5rem;
      height: 1.5rem;
      color: #6b7280;
      flex-shrink: 0;
    }

    .file-details {
      min-width: 0;
    }

    .file-name {
      font-size: 0.875rem;
      color: #111827;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .file-size {
      font-size: 0.75rem;
      color: #6b7280;
    }
  }
}

.rty-remove-button {
  padding: 0.25rem;
  border-radius: 0.375rem;
  color: #6b7280;
  transition: all 0.2s ease;
  border: none;
  background: none;
  cursor: pointer;
  flex-shrink: 0;

  &:hover {
    color: #ef4444;
    background-color: #f3f4f6;
  }

  .icon {
    width: 1rem;
    height: 1rem;
  }
}

.rty-dialog-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.rty-cancel-button {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: #4b5563;
  transition: all 0.2s ease;
  border: 1px solid #d1d5db;
  background-color: white;
  cursor: pointer;

  &:hover {
    background-color: #f3f4f6;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(209, 213, 219, 0.5);
  }
}

.rty-confirm-button {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: white;
  transition: all 0.2s ease;
  border: none;
  background-color: #3b82f6;
  cursor: pointer;

  &:hover {
    background-color: #2563eb;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: #3b82f6;
  }
}
</style>
<!-- 
Basic File Upload (Images, Documents)
<template>
  <div>
    <RTYFileUpload 
      @files-selected="handleFiles"
      label="Upload Documents"
    />
  </div>
</template>

<script setup>
const handleFiles = (files) => {
  console.log('Selected files:', files)
  // Handle file upload logic here
}
</script>

Video Upload

<template>
  <div>
    <RTYFileUpload 
      upload-type="video"
      @videos-selected="handleVideos"
      label="Upload Videos"
      :multiple="true"
      :max-size="50"
    />
  </div>
</template>

<script setup>
const handleVideos = (videos) => {
  console.log('Selected videos:', videos)
  // Handle video upload logic here
}
</script> -->