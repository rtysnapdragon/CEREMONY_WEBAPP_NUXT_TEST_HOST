<template>
  <div class="rty-file-upload">
    <Toast />
    <FileUpload
      name="uploadFiles[]"
      :url="uploadUrl"
      :accept="fileAccept"
      :multiple="multiple"
      :maxFileSize="maxFileSize"
      @upload="handleUpload"
      @select="onSelectedFiles"
    >
      <template #header="{ chooseCallback, uploadCallback, clearCallback, files }">
        <div class="rty-file-header">
          <div class="rty-file-actions">
            <Button @click="chooseCallback()" icon="pi pi-folder-open" rounded outlined />
            <Button @click="uploadEvent(uploadCallback)" icon="pi pi-cloud-upload" rounded outlined severity="success" :disabled="!files?.length" />
            <Button @click="clearCallback()" icon="pi pi-times" rounded outlined severity="danger" :disabled="!files?.length" />
          </div>
          <ProgressBar :value="totalSizePercent" class="rty-progress-bar" :showValue="false">
            <span class="rty-progress-info">{{ totalSize }}B / {{ maxFileSize / 1000000 }}MB</span>
          </ProgressBar>
        </div>
      </template>

      <template #content="{ files, uploadedFiles, removeUploadedFileCallback, removeFileCallback }">
        <div class="rty-file-content">
          <div v-if="files.length" class="rty-pending">
            <h5>Pending Uploads</h5>
            <div class="rty-file-list">
              <div v-for="(file, index) in files" :key="file.name + file.size" class="rty-file-item pending">
                <img v-if="isImage(file.type)" :src="file.objectURL" class="preview" />
                <video v-else-if="isVideo(file.type)" :src="file.objectURL" class="preview" controls />
                <span class="filename">{{ file.name }}</span>
                <span class="filesize">{{ formatSize(file.size) }}</span>
                <Badge value="Pending" severity="warn" />
                <Button icon="pi pi-times" @click="removeFile(index, removeFileCallback, file)" rounded outlined size="sm" />
              </div>
            </div>
          </div>

          <div v-if="uploadedFiles.length" class="rty-completed">
            <h5>Completed Uploads</h5>
            <div class="rty-file-list">
              <div v-for="(file, index) in uploadedFiles" :key="file.name + file.size" class="rty-file-item completed">
                <img v-if="isImage(file.type)" :src="file.objectURL" class="preview" />
                <video v-else-if="isVideo(file.type)" :src="file.objectURL" class="preview" controls />
                <span class="filename">{{ file.name }}</span>
                <span class="filesize">{{ formatSize(file.size) }}</span>
                <Badge value="Completed" severity="success" />
                <Button icon="pi pi-times" @click="removeUploadedFileCallback(index)" rounded outlined size="sm" />
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #empty>
        <div class="rty-empty">
          <i class="pi pi-cloud-upload icon" />
          <p>Drag & drop files here to upload</p>
        </div>
      </template>
    </FileUpload>
  </div>
</template>

<script setup>
// import { ref, computed } from 'vue';
// import { usePrimeVue } from 'primevue/config';

const props = defineProps({
  uploadType: {
    type: String,
    default: 'file',
    validator: value => ['file', 'video'].includes(value),
  },
  uploadUrl: {
    type: String,
    required: true,
  },
  multiple: {
    type: Boolean,
    default: true,
  },
  maxFileSize: {
    type: Number,
    default: 5 * 1024 * 1024, // 5MB
  },
});

const emit = defineEmits(['uploaded']);

const toast = useToast();
// const $primevue = usePrimeVue();

const totalSize = ref(0);
const totalSizePercent = ref(0);
const files = ref([]);

const fileAccept = computed(() => {
  return props.uploadType === 'video' ? 'video/*' : 'image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx';
});

const onSelectedFiles = (event) => {
  files.value = event.files;
  totalSize.value = event.files.reduce((acc, file) => acc + file.size, 0);
  totalSizePercent.value = (totalSize.value / props.maxFileSize) * 100;
};

const uploadEvent = (callback) => {
  totalSizePercent.value = (totalSize.value / props.maxFileSize) * 100;
  callback();
};

const handleUpload = (event) => {
  toast.add({ severity: 'success', summary: 'Upload Complete', detail: 'Your files were uploaded.', life: 3000 });
  emit('uploaded', event.files);
  totalSize.value = 0;
  totalSizePercent.value = 0;
};

const removeFile = (index, callback, file) => {
  callback(index);
  totalSize.value -= file.size;
  totalSizePercent.value = (totalSize.value / props.maxFileSize) * 100;
};

const isImage = (type) => type.startsWith('image');
const isVideo = (type) => type.startsWith('video');
</script>

<style lang="scss" scoped>
.rty-file-upload {
  padding: 1.5rem;
  background-color: #fff;
  border-radius: 1rem;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .rty-file-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;

    .rty-file-actions {
      display: flex;
      gap: 0.5rem;
    }

    .rty-progress-bar {
      width: 100%;
      max-width: 280px;
      height: 8px;

      .rty-progress-info {
        font-size: 0.75rem;
        color: #6b7280;
        margin-left: 0.5rem;
      }
    }
  }

  .rty-file-content {
    padding-top: 1.5rem;

    .rty-file-list {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-top: 0.5rem;
    }

    .rty-file-item {
      width: 160px;
      padding: 1rem;
      border-radius: 0.75rem;
      border: 1px solid #ccc;
      text-align: center;
      background-color: #f9fafb;

      &.pending {
        background-color: #fffbea;
        border-color: #facc15;
      }

      &.completed {
        background-color: #f0fdf4;
        border-color: #22c55e;
      }

      .preview {
        height: 96px;
        object-fit: contain;
        margin-bottom: 0.5rem;
      }

      .filename {
        font-size: 0.875rem;
        font-weight: 500;
        display: block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .filesize {
        font-size: 0.75rem;
        color: #6b7280;
      }
    }
  }

  .rty-empty {
    text-align: center;
    padding: 3rem;
    border: 2px dashed #e5e7eb;
    border-radius: 1rem;
    color: #9ca3af;

    .icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
  }
}
</style>

<!-- 
<template>
  <RTYFileUpload
    uploadUrl="/api/upload"
    uploadType="video"
    :maxFileSize="5 * 1024 * 1024"
    :multiple="true"
    @uploaded="handleUploaded"
  />
</template>

<script setup>
function handleUploaded(files) {
  console.log('Uploaded:', files);
}
</script> -->
