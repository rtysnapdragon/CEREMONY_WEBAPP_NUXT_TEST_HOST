<template>
  <div class="drive-manager">
    <div class="header">
      <h1 class="title">Google Drive Manager</h1>
    </div>

    <div class="toolbar">
      <button class="btn btn-login" @click="googleDrive.googleOAuthUrl()">
        <i class="ri-google-fill"></i> Connect Google Drive
      </button>
          <button class="btn btn-login" @click="googleDrive.disconnectGoogle()">
        <i class="ri-google-fill"></i> Disconnect
      </button>
      <button
        class="btn btn-sync"
        @click="googleDrive.syncFiles()"
        :disabled="!isConnected"
      >
        <i class="ri-refresh-line" :class="{ 'spin': syncing }"></i>
        {{ syncing ? 'Syncing...' : 'Sync Files' }}
      </button>
      <button
        @click="handleSyncStorage"
        :disabled="!googleDrive.isAuthenticated.value || syncing"
      >
        {{ syncing ? 'Syncing...' : 'Sync to Storage' }}
      </button>
      <div class="search-box">
        <i class="ri-search-line"></i>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search files..."
          @input="filterFiles"
        >
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <i class="ri-loader-4-line spin"></i>
      <p>Loading your files...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <i class="ri-error-warning-line"></i>
      <p>{{ error }}</p>
      <button class="btn btn-retry" @click="retryFetch">Retry</button>
    </div>

    <div v-else-if="filteredFiles?.length === 0" class="empty-state">
      <i class="ri-folder-open-line"></i>
      <p>No files found</p>
      <p v-if="isConnected && searchQuery" class="hint">Try a different search term</p>
      <p v-else-if="isConnected" class="hint">Upload files to Google Drive or sync to view them here</p>
      <p v-else class="hint">Connect your Google Drive to get started</p>
    </div>

    <div v-else class="file-grid">
      <div
        v-for="file in filteredFiles"
        :key="file.FileId"
        class="file-card"
        @click="previewFile(file)"
      >
        <div class="file-icon">
          <i :class="getFileIcon(file.MimeType)"></i>
        </div>
        <div class="file-info">
          <p class="file-name">{{ file.FileName }}</p>
          <p class="file-meta">
            <span>{{ formatFileSize(file.FileSize) }}</span>
            <span>•</span>
            <span>{{ formatDate(file.ModifiedTime) }}</span>
          </p>
        </div>
        <div class="file-actions">
          <a
            :href="file.WebViewLink"
            target="_blank"
            class="action-btn"
            @click.stop
          >
            <i class="ri-external-link-line"></i>
          </a>
        </div>
      </div>
    </div>
<button :disabled="!googleDrive?.isAuthenticated">Sync</button>
    <!-- File Preview Modal -->
    <div v-if="previewFileData" class="preview-modal" @click.self="previewFileData = null">
      <div class="preview-content">
        <button class="close-btn" @click="previewFileData = null">
          <i class="ri-close-line"></i>
        </button>
        <div class="preview-header">
          <i :class="getFileIcon(previewFileData.MimeType)"></i>
          <h3>{{ previewFileData.FileName }}</h3>
        </div>
        <div class="preview-body">
          <iframe
            v-if="isPreviewable(previewFileData.MimeType)"
            :src="`https://drive.google.com/file/d/${previewFileData.FileId}/preview`"
            frameborder="0"
          ></iframe>
          <div v-else class="unsupported-preview">
            <i class="ri-file-warning-line"></i>
            <p>Preview not available for this file type</p>
          </div>
        </div>
        <div class="preview-footer">
          <a
            :href="previewFileData.WebViewLink"
            target="_blank"
            class="btn btn-open"
          >
            <i class="ri-external-link-line"></i> Open in Google Drive
          </a>
          <button class="btn btn-download" @click="downloadFile(previewFileData)">
            <i class="ri-download-line"></i> Download
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useGoogleDrive } from '~/composables/useGoogleDrive.ts'
const googleDrive = useGoogleDrive();

const files = ref([]);
const loading = ref(false);
const error = ref(null);
const syncing = ref(false);
const searchQuery = ref('');
const filteredFiles = ref([]);
const darkMode = ref(false);
const previewFileData = ref(null);
const toast = useToast()

// Check auth status
if (!googleDrive.isAuthenticated.value) { // ✅
  toast.add({ color:'yellow', title:'User is not authenticated'})
  // return
}

// if (!googleDrive?.isAuthenticated) {
//   console.log('User is not authenticated')
// }
const isConnected1 = computed(() => {
  return files.value?.length > 0
  // || googleDrive?.isAuthenticated();
});
const isConnected = computed(() => {
  return googleDrive?.isAuthenticated.value && files.value?.length >= 0;
});

onMounted(async () => {
  if (!googleDrive.isAuthenticated.value) {
    console.log('User is not authenticated')
  }
  await handleSyncStorage()
  await fetchFiles()
  await handleSync()
});

// Example usage in component
const handleSync = async () => {
  try {
    await googleDrive.syncDriveData()
    // Refresh files after sync
    files.value = await googleDrive.fetchFiles()
  } catch (error) {
    // Handle error in UI
  }
}
const fetchFiles = async () => {
  try {
    loading.value = true;
    error.value = null;
    files.value = await googleDrive.loadDriveFiles();
    filteredFiles.value = files.value;
  } catch (err) {
    error.value = 'Failed to load files. Please try again.';
    console.log('Error fetching files:', err);
  } finally {
    loading.value = false;
  }
};

const retryFetch = () => {
  error.value = null;
  fetchFiles();
};

const filterFiles = () => {
  if (!searchQuery.value) {
    filteredFiles.value = files.value;
    return;
  }
  const query = searchQuery.value.toLowerCase();
  filteredFiles.value = files.value.filter(file =>
    file.FileName.toLowerCase().includes(query)
  );
};

const previewFile = (file) => {
  previewFileData.value = file;
};

const downloadFile = async (file) => {
  try {
    const downloadUrl = await googleDrive.getDownloadUrl(file.FileId);
    window.open(downloadUrl, '_blank');
  } catch (err) {
    console.log('Error downloading file:', err);
    // Show error notification
  }
};


const handleSyncStorage = async () => {
  if (!googleDrive.isAuthenticated.value) return

  try {
    syncing.value = true
    const result = await googleDrive.syncDriveDataStorage()
    console.log('Sync to storage result:', result)
    // optionally show notification to user
  } catch (err) {
    console.error('Failed to sync to storage:', err)
  } finally {
    syncing.value = false
  }
}
const isPreviewable = (mimeType) => {
  const previewableTypes = [
    'application/pdf',
    'image/',
    'text/',
    'application/vnd.google-apps.document',
    'application/vnd.google-apps.spreadsheet',
    'application/vnd.google-apps.presentation'
  ];
  return previewableTypes.some(type => mimeType.includes(type));
};

const getFileIcon = (mimeType) => {
  const icons = {
    'folder': 'ri-folder-3-fill',
    'image/': 'ri-image-fill',
    'video/': 'ri-movie-fill',
    'audio/': 'ri-music-2-fill',
    'application/pdf': 'ri-file-pdf-fill',
    'application/vnd.google-apps.document': 'ri-file-text-fill',
    'application/vnd.google-apps.spreadsheet': 'ri-file-excel-fill',
    'application/vnd.google-apps.presentation': 'ri-slideshow-fill',
    'application/zip': 'ri-file-zip-fill',
    'default': 'ri-file-fill'
  };

  for (const [key, icon] of Object.entries(icons)) {
    if (mimeType?.includes(key)) return icon;
  }
  return icons.default;
};

const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i]);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString();
};


definePageMeta({
  layout:'navbar1'
})
</script>

<style lang="scss" scoped>
:root{
  --primary-color: #4a6cf7;
  --secondary-color: #10b981;
  --text-color: #1f2937;
  --bg-color: #f9fafb;
  --card-bg: #ffffff;
  --border-color: #e5e7eb;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --rounded-sm: 0.5rem;
  --rounded-md: 1rem;
  --rounded-lg: 1.5rem;
  --transition: all 0.2s ease;
}

.dark {
  --primary-color: #6366f1;
  --secondary-color: #10b981;
  --text-color: #f3f4f6;
  --bg-color: #111827;
  --card-bg: #1f2937;
  --border-color: #374151;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.3);
}

.drive-manager {
  min-height: 100vh;
  padding: 2rem;
  transition: var(--transition);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  .title {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-color);
    margin: 0;
  }

  .controls {
    display: flex;
    gap: 1rem;
  }
}

.theme-toggle {
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition);

  &:hover {
    transform: scale(1.05);
  }

  i {
    font-size: 1.25rem;
  }
}

.toolbar {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;

  .btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    border-radius: var(--rounded-sm);
    font-weight: 500;
    transition: var(--transition);
    border: none;
    cursor: pointer;

    i {
      font-size: 1.1rem;
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }

  .btn-login {
    background-color: var(--primary-color);
    color: white;

    &:hover:not(:disabled) {
      background-color: white;
      box-shadow: var(--shadow-md);
    }
  }

  .btn-sync {
    background-color: var(--secondary-color);
    color: white;

    &:hover:not(:disabled) {
      background-color: var(--secondary-color);
      box-shadow: var(--shadow-md);
    }
  }

  .search-box {
    flex: 1;
    min-width: 250px;
    position: relative;
    display: flex;
    align-items: center;

    i {
      position: absolute;
      left: 1rem;
      color: var(--text-color);
      opacity: 0.7;
    }

    input {
      width: 100%;
      padding: 0.75rem 1rem 0.75rem 2.5rem;
      border-radius: var(--rounded-sm);
      border: 1px solid var(--border-color);
      background-color: var(--card-bg);
      color: var(--text-color);
      transition: var(--transition);

      &:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(74, 108, 247, 0.2);
      }
    }
  }
}

.file-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.file-card {
  background-color: var(--card-bg);
  border-radius: var(--rounded-md);
  box-shadow: var(--shadow-sm);
  padding: 1.25rem;
  transition: var(--transition);
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    border-color: var(--primary-color);
  }

  .file-icon {
    width: 3rem;
    height: 3rem;
    border-radius: var(--rounded-sm);
    background-color: rgba(74, 108, 247, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
    color: var(--primary-color);

    i {
      font-size: 1.5rem;
    }
  }

  .file-info {
    flex: 1;

    .file-name {
      font-weight: 500;
      color: var(--text-color);
      margin-bottom: 0.5rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .file-meta {
      font-size: 0.875rem;
      color: var(--text-color);
      opacity: 0.7;
      display: flex;
      gap: 0.5rem;
    }
  }

  .file-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 1rem;

    .action-btn {
      color: var(--primary-color);
      background: none;
      border: none;
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: var(--transition);

      &:hover {
        background-color: rgba(74, 108, 247, 0.1);
      }

      i {
        font-size: 1.1rem;
      }
    }
  }
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  background-color: var(--card-bg);
  border-radius: var(--rounded-md);
  box-shadow: var(--shadow-sm);
  border: 1px dashed var(--border-color);

  i {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: var(--primary-color);
    opacity: 0.7;
  }

  p {
    color: var(--text-color);
    margin: 0.5rem 0;
  }

  .hint {
    opacity: 0.7;
    font-size: 0.9rem;
  }
}

.error-state {
  i {
    color: #ef4444;
  }

  .btn-retry {
    margin-top: 1rem;
    background-color: var(--primary-color);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: var(--rounded-sm);
    cursor: pointer;
    transition: var(--transition);

    &:hover {
      background-color: white;
    }
  }
}

.preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);

  .preview-content {
    background-color: var(--card-bg);
    border-radius: var(--rounded-md);
    width: 90%;
    max-width: 900px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: var(--shadow-lg);
    overflow: hidden;
  }

  .close-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    color: var(--text-color);
    font-size: 1.5rem;
    cursor: pointer;
    z-index: 10;
    opacity: 0.7;
    transition: var(--transition);

    &:hover {
      opacity: 1;
    }
  }

  .preview-header {
    padding: 1.5rem;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    gap: 1rem;

    i {
      font-size: 1.5rem;
      color: var(--primary-color);
    }

    h3 {
      margin: 0;
      color: var(--text-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .preview-body {
    flex: 1;
    padding: 1.5rem;
    overflow: auto;

    iframe {
      width: 100%;
      height: 500px;
      border: none;
      border-radius: var(--rounded-sm);
    }
  }

  .unsupported-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 300px;
    color: var(--text-color);
    opacity: 0.7;

    i {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
  }

  .preview-footer {
    padding: 1.5rem;
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: flex-end;
    gap: 1rem;

    .btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      border-radius: var(--rounded-sm);
      font-weight: 500;
      transition: var(--transition);
      cursor: pointer;
    }

    .btn-open {
      background-color: var(--primary-color);
      color: white;
      border: none;

      &:hover {
        background-color: white;
      }
    }

    .btn-download {
      background-color: var(--secondary-color);
      color: white;
      border: none;

      &:hover {
        background-color: var(--primary-color)
      }
    }
  }
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .drive-manager {
    padding: 1rem;
  }

  .toolbar {
    flex-direction: column;
    gap: 1rem;

    .search-box {
      min-width: 100%;
    }
  }

  .file-grid {
    grid-template-columns: 1fr;
  }

  .preview-modal {
    .preview-content {
      width: 95%;
      max-height: 85vh;
    }

    .preview-body {
      padding: 1rem;

      iframe {
        height: 300px;
      }
    }
  }
}
</style>
