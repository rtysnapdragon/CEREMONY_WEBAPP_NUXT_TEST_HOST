import { defineStore,acceptHMRUpdate } from 'pinia';
import type { DriveStorage, DriveFile } from '~/types';

export const useDriveStore = defineStore('drive', {
  state: () => ({
    storage: null as DriveStorage | null,
    files: [] as DriveFile[],
    isLoading: false,
    error: null as string | null,
      // ✅ Google connection status
    isGoogleConnected: false,  // true if user connected to Google
  }),

  getters: {
    getStorage: (state) => state.storage,
    getFiles: (state) => state.files,
    getTotalFiles: (state) => state.files?.length,
    getGoogleConnected: (state) => state.isGoogleConnected, // getter for Google status
  },

  actions: {
    setStorage(storage: DriveStorage) {
      this.storage = storage;
    },

    setFiles(files: DriveFile[]) {
      this.files = files;
    },

    setLoading(loading: boolean) {
      this.isLoading = loading;
    },

    setError(error: string | null) {
      this.error = error;
    },

    clearDriveData() {
      this.storage = null;
      this.files = [];
      this.error = null;
    },

    // ✅ Actions to update Google connection status
    setGoogleConnected(status: boolean) {
      this.isGoogleConnected = status;
    },
  },
});


// make sure to pass the right store definition, `useAuth` in this case.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDriveStore, import.meta.hot))
}