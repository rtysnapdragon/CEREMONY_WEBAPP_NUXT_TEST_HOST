<template>
  <div class="space-y-6">
    <!-- Storage Card -->
    <div class="card">
      <h2 class="text-xl font-bold mb-4">Storage Overview</h2>
      
      <div v-if="driveStore.isLoading" class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      </div>
      
      <div v-else-if="storage" class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Used</p>
            <p class="text-2xl font-bold">{{ storage.storage.used_human }}</p>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-600 dark:text-gray-400">Total</p>
            <p class="text-2xl font-bold">{{ storage.storage.total_human }}</p>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
          <div
            class="h-full transition-all duration-300"
            :class="progressBarColor"
            :style="{ width: `${storage.storage.percentage_used}%` }"
          ></div>
        </div>

        <p class="text-sm text-gray-600 dark:text-gray-400 text-center">
          {{ storage.storage.percentage_used.toFixed(1) }}% used
        </p>

        <div class="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Drive Files</p>
            <p class="font-semibold">{{ storage.storage.usage_breakdown.drive_human }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Trash</p>
            <p class="font-semibold">{{ storage.storage.usage_breakdown.trash_human }}</p>
          </div>
        </div>
        <!-- Google Connected Status -->
        <!-- <div class="mt-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">Google Status:</p>
          <span
            :class="googleConnected ? 'text-green-600' : 'text-red-600'"
            class="font-semibold"
          >
            {{ googleConnected ? 'Connected' : 'Not Connected' }}
          </span>
        </div> -->
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold">Google Drive Status</h2>
          <div class="flex items-center space-x-2">
            <span
              :class="driveStore.isGoogleConnected ? 'text-green-600' : 'text-red-600'"
              class="font-semibold"
            >
              {{ driveStore.isGoogleConnected ? 'Connected' : 'Disconnected' }}
            </span>

            <UButton
              v-if="driveStore.isGoogleConnected"
              @click="() => { 
                console.log('clicked'); 
                showDisconnectModal = true; 
              }"
              class="btn-secondary text-sm cursor-pointer"
            >
              Disconnect
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Files List -->
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold">Your Files ({{ driveStore.getTotalFiles }})</h2>
        <div class="flex space-x-2">
          <label class="btn-secondary cursor-pointer">
            <input type="file" @change="handleUpload" class="hidden" />
            Upload
          </label>
          <button @click="refreshData" class="btn-secondary">
            Refresh
          </button>
        </div>
      </div>

      <div v-if="driveStore.isLoading" class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      </div>

      <div v-else-if="files?.length > 0" class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Size</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Modified</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="file in files" :key="file.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td class="px-4 py-3">
                <a
                  :href="file.web_view_link"
                  target="_blank"
                  class="text-primary-600 dark:text-primary-400 hover:underline"
                >
                  {{ file.name }}
                </a>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ file.size_human }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                {{ formatDate(file.modified_time) }}
              </td>
              <!-- <td class="px-4 py-3 text-right">
                <button
                  @click="handleDelete(file.id, file.name)"
                  class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  Delete
                </button>
              </td> -->
                <td class="px-4 py-3 text-right">
                <button
                  @click="openDeleteModal(file)"
                  class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
        No files found
      </div>
    </div>

    <!-- UModal for Delete Confirmation -->
    <UModal v-model:show="deleteModal.show" :title="'Delete File'" :size="'sm'">
      <template #default>
        <p>Are you sure you want to delete <strong>{{ deleteModal.file?.name }}</strong>?</p>
      </template>
      <template #footer>
        <button class="btn btn-secondary" @click="deleteModal.show = false">Cancel</button>
        <button class="btn btn-danger" @click="confirmDelete()">Delete</button>
      </template>
    </UModal>

    <div>
    <RTYModal v-model="showDisconnectModal" v-if="showDisconnectModal" :preventClose = false @onClose="onCloseModal">
      <template #header>
        Disconnect Google Drive
      </template>
      <div class="py-4">
        Are you sure you want to disconnect your Google Drive account?
      </div>
      <template #footer>
        <UButton
          color="gray"
          variant="soft"
          @click="showDisconnectModal = false"
        >
          Cancel
        </UButton>

        <UButton
          color="red"
          @click="handleDisconnect"
        >
          Disconnect
        </UButton>
      </template>
    </RTYModal>
  </div>
  </div>
</template>

<script setup lang="ts">
const driveStore = useDriveStore();
const { fetchStorage, fetchFiles, uploadFile, deleteFile,disconnectDrive } = useDriveStorage();
const showDisconnectModal = ref(false);
const toast = useToast()
// Google connected status
const googleConnected = computed(() => driveStore.getGoogleConnected);
console.log("Google Connected ------------------------------> ", googleConnected)
const storage = computed(() => driveStore.getStorage);
console.log("Storage-----------> ", storage)
const files = computed(() => driveStore.getFiles);
// Check status
console.log(driveStore.getGoogleConnected);

// // Update status
// driveStore.setGoogleConnected(true);  // when user successfully connects
// driveStore.setGoogleConnected(false); // when disconnected

function ActionBtnDisconnected(){
  showDisconnectModal.value = false
}
const progressBarColor = computed(() => {
  const percentage = storage.value?.storage.percentage_used || 0;
  if (percentage > 90) return 'bg-red-500';
  if (percentage > 75) return 'bg-yellow-500';
  return 'bg-primary-500';
});
// Delete using NuPopup
// const confirmDelete = async (fileId: string, fileName: string, closePopup: Function) => {
//   closePopup(); // Close the popup
//   try {
//     await deleteFile(fileId);
//     alert(`File "${fileName}" deleted successfully!`);
//   } catch (error) {
//     alert('Error deleting file');
//   }
// };

const handleDisconnect = async () => {
  try {
    await disconnectDrive();
    showDisconnectModal.value = false;
  } catch (e) {
    toast.add({color:'red',title:'Failed to disconnect Google Drive'});
  }
};
const refreshData = async () => {
  await Promise.all([fetchStorage(), fetchFiles()]);
};
// UModal State
const deleteModal = ref<{ show: boolean; file: any }>({
  show: false,
  file: null
});
// Open delete modal
const openDeleteModal = (file: any) => {
  deleteModal.value.file = file;
  deleteModal.value.show = true;
};

// Confirm delete
const confirmDelete = async () => {
  if (!deleteModal.value.file) return;

  try {
    await deleteFile(deleteModal.value.file.id);
    alert('File deleted successfully!');
  } catch (error) {
    alert('Error deleting file');
  } finally {
    deleteModal.value.show = false;
    deleteModal.value.file = null;
    await fetchFiles();
  }
};

const handleUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;

  try {
    await uploadFile(file);
    alert('File uploaded successfully!');
  } catch (error) {
    alert('Error uploading file');
  }
};

const handleDelete = async (fileId: string, fileName: string) => {
  if (!confirm(`Are you sure you want to delete "${fileName}"?`)) return;

  try {
    await deleteFile(fileId);
    alert('File deleted successfully!');
  } catch (error) {
    alert('Error deleting file');
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Load data on mount
onMounted(() => {
  refreshData();
});
</script>