// composables/useGoogleDrive.ts
import { useCookie } from '#app'
import { ref } from 'vue'
import { useDriveStore } from '~/stores/drive';

export const useGoogleDrive = () => {
  const toast = useToast()
  const authToken = useCookie('google_drive_token')
  const driveStore = useDriveStore();
  console.log("Auth Token ------------------------- ", authToken.value)
  const isAuthenticated = ref(false)

  // Check authentication status
  const checkAuth = () => {
    isAuthenticated.value = !!authToken.value
    return isAuthenticated.value
  }
  const redirectUri  =
    process.env.NODE_ENV === 'production'
      ? `${process.env.API_URL_PROD}`
      : `http://localhost:3000/verify_access`

      console.log("Base URL -----------L>> ", redirectUri )
  //   const BASE_URL =
  // process.env.NODE_ENV === "production"
  //   ? process.env.API_URL_PROD
  //   : process.env.API_URL_DEV;

  console.log("Base Url ------------------------- ", redirectUri )

  // Function that fetches auth URL and redirects
  const googleOAuthUrl  = async () => {
    try {
      const { data, error } = await useHttp('/api/google/auth_url', {
        method: 'POST',
        // data: { redirect_uri: redirectUri}
      })

      if (error?.value || !data?.value?.AuthUrl) {
        console.log('Login failed:', error || 'No URL in response')
        throw new Error(error?.value?.message || 'Failed to get auth URL')
      }
       // Update Google connection status
      driveStore.setGoogleConnected(!!data?.value.Connected);

      window.location.href = data?.value?.AuthUrl
    } catch (err) {
           // Update Google connection status
      driveStore.setGoogleConnected(false);
      console.log('Unexpected error during login:', err)
      throw err
    }
  }


  // Function to trigger backend sync
  const syncFiles = async () => {
    try {
      checkAuth()
      if (!isAuthenticated.value) {
        throw new Error('Not authenticated')
      }

      const { data, error } = await useHttp('/api/files/sync', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken.value}`
        }
      })

      if (error?.value) {
        throw new Error(error.value?.message || 'Sync failed')
      }

      return data
    } catch (err) {
      console.log('File sync error:', err)
      throw err
    }
  }

  // Function to fetch list of files
  const fetchFiles = async () => {
    try {
      checkAuth()
      if (!isAuthenticated.value) {
        return []
      }

      const { data, error } = await useHttp('/api/drive/sync_files', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken.value}`
        }
      })

      if (error) {
        console.log('Fetch files error:', error)
        return []
      }

      return data || []
    } catch (err) {
      console.log('Unexpected error:', err)
      return []
    }
  }

  // Get download URL for a file
  const getDownloadUrl = async (fileId: string) => {
    try {
      checkAuth()
      if (!isAuthenticated.value) {
        throw new Error('Not authenticated')
      }

      const { data, error } = await useHttp(`/api/google_drive/download/${fileId}`, {
        headers: {
          Authorization: `Bearer ${authToken.value}`
        }
      })

      if (error || !data?.url) {
        throw new Error(error?.message || 'Failed to get download URL')
      }

      return data.url
    } catch (err) {
      console.log('Download error:', err)
      throw err
    }
  }

  // Logout function
  const logout = () => {
    authToken.value = null
    isAuthenticated.value = false
    navigateTo('/') // Redirect to home
  }

  const loadDriveFiles = async () => {
    const { data, error } = await useHttp('/api/google/files')

    if (error?.value) {
      toast.add({ color:'error', title:error.value?.Message})
      return
    }
    console.log("FILES:", data.value?.files)
    return data?.value
  } 

  const disconnectGoogle = async () => {
    await useHttp('/api/google/disconnect', { method: 'POST' })

    // Clear cookies
    useCookie('google_drive_token').value = null
    useCookie('user_email').value = null

    return true
  }

  const syncDriveData = async () => {
    try {
      const token = useCookie('google_drive_token').value
      const {data,error} = await useHttp('/api/google_drive/sync_data', {
        baseURL: 'https://riththy-tech-api-django.onrender.com',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      return data
    } catch (error) {
      console.log("Drive sync failed:", error)
      throw error
    }
  }


  // Initialize auth status
  checkAuth()

  return {
    isAuthenticated,
    googleOAuthUrl ,
    syncFiles,
    fetchFiles,
    getDownloadUrl,
    logout,
    checkAuth,
    syncDriveData,
    loadDriveFiles,
    disconnectGoogle
  }
}