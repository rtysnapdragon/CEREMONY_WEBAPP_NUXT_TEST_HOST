// import { useAuthStore } from '~/stores/auth';

export const useGoogleAuth = () => {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();
  const router = useRouter();

  const login = async () => {
    try {
      const response = await $fetch(`${config.public.apiBase}/api/google/auth-url/`, {
        method: 'POST',
      });

      if (response.AuthUrl) {
        // Redirect to Google OAuth
        window.location.href = response.AuthUrl;
      }
    } catch (error) {
      console.error('Error initiating Google login:', error);
      throw error;
    }
  };

  const verifyCode = async (code: string) => {
    try {
      const response = await $fetch(`${config.public.apiBase}/api/google/verify-code/`, {
        method: 'POST',
        body: {
          code: code,
        },
      });

      // Store user data and tokens
      authStore.setUser({
        email: response.email,
        name: response.name,
        picture: response.picture,
      });

      authStore.setTokens({
        access_token: response.access_token,
      });

      return response;
    } catch (error) {
      console.error('Error verifying code:', error);
      throw error;
    }
  };

  const disconnect = async () => {
    try {
      await $fetch(`${config.public.apiBase}/api/google/disconnect/`, {
        method: 'POST',
      });

      authStore.logout();
      router.push('/');
    } catch (error) {
      console.error('Error disconnecting:', error);
      throw error;
    }
  };

  return {
    login,
    verifyCode,
    disconnect,
  };
};