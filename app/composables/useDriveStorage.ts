// import { useDriveStore } from '~/stores/drive';

export const useDriveStorage = () => {
  const toast = useToast()
  const config = useRuntimeConfig();
  const driveStore = useDriveStore();

  const fetchStorage = async () => {
    driveStore.setLoading(true);
    driveStore.setError(null);

    try {
      const {data, error } = await useHttp(`api/drive/storage`,{
        method: "POST"
      });
      driveStore.setStorage(data?.value)
         // Set Google connection status
      driveStore.setGoogleConnected(!!data?.value.google_connected);

      return data?.value;
    } catch (error: any) {
      driveStore.setError(error.message || 'Failed to fetch storage');
      driveStore.setGoogleConnected(false);
      throw error;
    } finally {
      driveStore.setLoading(false);
    }
  };

  const fetchFiles = async (pageSize = 50) => {
    driveStore.setLoading(true);
    driveStore.setError(null);

    try {
      const { data,error} = await useHttp(`api/drive/files`, {
        method:"POST",
        data: {
          page_size: pageSize,
        },
      });
      driveStore.setFiles(data?.value?.files);
      // Update Google connection status
      driveStore.setGoogleConnected(!!data?.value.google_connected);
      return data?.value;
    } catch (error: any) {
      driveStore.setError(error.message || 'Failed to fetch files');
      driveStore.setGoogleConnected(false);
      throw error;
    } finally {
      driveStore.setLoading(false);
    }
  };

  const uploadFile = async (file: File) => {
    console.log("File---------> ", file)
    const formData = new FormData();
    formData.append('File', file);
    console.log("Form Data POST ---------> ", formData)

    try {
      const { data, error} = await useHttp(`api/drive/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        data: formData,
      });
      
      // Refresh files and storage
      await fetchFiles();
      await fetchStorage();
      
      return data?.value;
    } catch (error: any) {
      driveStore.setError(error.message || 'Failed to upload file');
      throw error;
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      const { data, error} = await useHttp(`api/drive/delete?FileId=${fileId}`, {
        method: 'GET',
      });
      
      // Refresh files and storage
      await fetchFiles();
      await fetchStorage();
    } catch (error: any) {
      driveStore.setError(error.message || 'Failed to delete file');
      throw error;
    }
  };

  const disconnectDrive = async () => {
    driveStore.setLoading(true);
    driveStore.setError(null);

    try {
      const { data, error } = await useHttp('api/google/disconnect', {
        method: 'POST',
      });

      if (data?.value) {
        driveStore.clearDriveData();
        toast.add({
          title: 'Disconnected',
          description: 'Google Drive disconnected successfully',
          color: 'green'
        });
      } else {
        driveStore.setError(error?.message || 'Failed to disconnect');
      }
    } catch (error: any) {
      toast.add({
        title: 'Error',
        description: 'Failed to disconnect',
        color: 'red'
      });
      driveStore.setError(error.message || 'Failed to disconnect');
      throw error;
    } finally {
      driveStore.setLoading(false);
    }
  };


  return {
    fetchStorage,
    fetchFiles,
    uploadFile,
    deleteFile,
    disconnectDrive, // ← expose it
  };
};