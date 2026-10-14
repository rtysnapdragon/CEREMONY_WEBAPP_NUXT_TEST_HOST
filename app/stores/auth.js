import axios from "axios";
import { defineStore, acceptHMRUpdate } from "pinia";

// Consistent cookie options — must match on every read/write/clear
const isProd = process.env.NODE_ENV === 'production'
function cookieOpts(maxAge = 60 * 60 * 24) {
  return { maxAge, sameSite: 'lax', secure: isProd, path: '/' }
}
function accessCookie(maxAge)  { return useCookie('access_token',  cookieOpts(maxAge ?? 60 * 60 * 24)) }
function refreshCookie(maxAge) { return useCookie('refresh_token', cookieOpts(maxAge ?? 60 * 60 * 24 * 7)) }

function resolveAvatarUrl(path) {
  if (!path || path.startsWith('http')) return path
  try {
    const { config } = helper()
    const base = (config.apiUrl || '').replace(/\/$/, '')
    return base ? base + path : path
  } catch {
    return path
  }
}
import { useCookie } from "#app";
import { useToast } from "#imports";
// import { useRouter } from "vue-router";
import { useState } from "#app"; // Adjust the import path as necessary
import { useHttp } from '~/composables/http'; // Adjust the import path as necessary
import { navigateTo } from "#app";
import { jwtDecode } from "jwt-decode"; // Ensure correct import
// import { useToast } from '#imports';
import api from "~/helpers/apis";
// Capture the current path
// const router = useRouter();
import { v4 as uuidv4 } from "uuid";
export const useAuthStore = defineStore("auth", {
  // export const useAuth = () => useState('authToken', () => null);  // Store authentication state
  state: () => ({
    _hydrated: false,
    auth_token: null,
    access_token: null,
    refresh_token: null,
    token: null,
    lastRefresh: null,
    permissions: [],
    logoutTimer: null,
    isLoading: false,
    isAuthenticate: false,
    refreshTokenExpiry: null,
    refreshTokenCookie: null,
    user: null,
    isRefreshing: false,
    isAuthenticated: false,
    deviceId: "",
    refreshTokenValue: null, // ✅ renamed to avoid conflict
    accessToken: null,
  }),
  // persist: true,// Enable Nuxt persistence

  getters: {
    currentUser: (state) => state.user,
    isAuthentication: (state) =>
      !!state.access_token && !!state.isAuthenticated,
    isLoggedIn: (state) => !!state.user,
    isCustomer: (state) => state.user?.roles?.includes("GENERAL") ?? false,
    canManageFleet: (state) => state.user?.roles?.includes("SYSTEM") ?? false,
    fullName: (state) => {
      if (!state.user) return "Guest";
      const fn = state.user.firstName ?? "";
      const ln = state.user.lastName ?? "";
      return (fn + " " + ln).trim() || state.user.username || "User";
    },
    initials: (state) => {
      if (!state.user) return "G";
      const fn = state.user.firstName?.[0] ?? "";
      const ln = state.user.lastName?.[0] ?? "";
      return (
        (fn + ln).toUpperCase() ||
        (state.user.username?.[0] ?? "U").toUpperCase()
      );
    },
    avatar: (state) => state.user?.avatar ?? null,
    loading: (state) => state.isLoading,
  },

  actions: {
    initDeviceId() {
      if (process.client) {
        const savedId = localStorage?.getItem("device_id");
        if (savedId) {
          this.deviceId = savedId;
        } else {
          const newId = uuidv4(); // generate a new device ID
          localStorage.setItem("device_id", newId);
          this.deviceId = newId;
        }
      }
    },

    async fetchMe() {
      try {
        const { data, error, status } = await useHttp("/api/v1/users/me", {
          method: "GET",
          isGlobal: true,
        });
        if (error?.value) {
          if (handleAuthError(status)) return
          return
        }
        const profile = data.value?.data ?? data.value;
        if (!profile) return;
        this.user = {
          ...this.user,
          id: profile.id ?? this.user?.id,
          username: profile.username ?? this.user?.username,
          email: profile.email ?? this.user?.email,
          firstName: profile.firstName ?? "",
          lastName: profile.lastName ?? "",
          avatar: profile.avatar ? resolveAvatarUrl(profile.avatar) : null,
          phone: profile.phone ?? "",
          gender: profile.gender ?? "",
          roles: profile.roles ?? this.user?.roles ?? [],
          organizationId: profile.organizationId ?? this.user?.organizationId,
          subscriptionPlan:
            profile.subscriptionPlan ?? this.user?.subscriptionPlan ?? "FREE",
          status: profile.status ?? "ACTIVE",
        };
      } catch {}
    },

    async initialize() {
      // Initialize store from cookies
      this.accessToken = accessCookie().value || null;
      this.refreshToken = refreshCookie().value || null;
      this.isAuthenticated = this.accessToken;

      if (this.isAuthenticated) {
        try {
          // Fetch user data if authenticated
          await this.fetchUser();
        } catch (error) {
          this.logout();
        }
      }
    },

    initRememberedUsername() {
      if (process.client) {
        const savedUsername = useCookie("is_remembered").value;
        if (savedUsername) {
          this.rememberedUsername = savedUsername;
        }
      }
    },

    async checkAuthState() {
      // Simple check without server verification
      if (this.isAuthenticated) {
        return true;
      }

      // Optional: Add lightweight token presence check
      const token = accessCookie().value;
      if (!token) {
        this.logout();
        return false;
      }

      return this.isAuthenticated;
    },

    async login(credentials, remember = false) {
      const toast = useToast();
      try {
        this.isLoading = true;

        const { data, error } = await useHttp("/api/v1/auth/login", {
          method: "POST",
          data: {
            username: credentials.username,
            password: credentials.password,
          },
          isLogin: true,
        });

        if (isNotEmpty(error?.value)) {
          const status = error.value?.status;
          let errorMessage =
            error.value?.message || "Login failed. Please try again.";
          if (status === 401 || status === 403)
            errorMessage = "Invalid username or password.";
          if (status === 0 || error.value?.code === "network_error")
            errorMessage = "Server is not responding. Please try again later.";
          toast.add({ color: "red", title: errorMessage });
          return { success: false, error: errorMessage };
        }

        // Network error: axios throws without a response (e.response undefined) so
        // error.value ends up undefined — isNotEmpty misses it. Catch it here.
        if (data.value === null) {
          const msg = "Cannot connect to server. Check your network.";
          toast.add({  color: "red", title: msg });
          return { success: false, error: msg };
        }

        const authData = data.value?.data ?? data.value;
        if (!authData?.accessToken) {
          const msg = "Login failed: no token received.";
          toast.add({ color: "red", title: msg });
          return { success: false, error: msg };
        }

        const isProd = process.env.NODE_ENV === "production";
        const user = {
          id: authData.userId,
          username: authData.username,
          firstName: authData.firstName ?? "",
          lastName: authData.lastName ?? "",
          email: authData.email,
          avatar: authData.avatar ? resolveAvatarUrl(authData.avatar) : null,
          organizationId: authData.organizationId,
          roles: authData.roles ?? [],
          permissions: authData.permissions ?? [],
        };

        // Tokens — 30-day lifetime when "Remember me", otherwise 1-day / 7-day
        const accessMaxAge  = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24
        const refreshMaxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7
        accessCookie(accessMaxAge).value = authData.accessToken;
        refreshCookie(refreshMaxAge).value = authData.refreshToken;
        useCookie("database", {
          maxAge: refreshMaxAge,
          sameSite: "lax",
          secure: isProd,
          path: "/",
        }).value = authData.organizationId;

        // User profile + permissions — localStorage (survives page refresh, client-only)
        if (process.client) {
          localStorage.setItem("user_data", JSON.stringify(user));
          localStorage.setItem(
            "permissions",
            JSON.stringify(authData.permissions ?? []),
          );
        }

        // Sync into Pinia state
        this.access_token = authData.accessToken;
        this.refreshTokenValue = authData.refreshToken;
        this.permissions = authData.permissions ?? [];
        this.user = user;
        this.isAuthenticated = true;

        // Remember me — persist or clear the saved username + flag cookies
        if (remember) {
          useCookie("is_remembered", {
            maxAge: 60 * 60 * 24 * 30,
            path: "/",
          }).value = credentials.username;
          useCookie("remember_me", {
            maxAge: 60 * 60 * 24 * 30,
            path: "/",
          }).value = "1";
        } else {
          useCookie("is_remembered", { path: "/" }).value = null;
          useCookie("remember_me", { path: "/" }).value = null;
        }

        await this.hydrate();
        // fetchMe is called inside hydrate; persist the updated user (with correct roles) to localStorage
        if (process.client) {
          localStorage.setItem("user_data", JSON.stringify(this.user));
        }
        await Promise.all([
          useEventStore().fetchEvents(),
          usePlanStore().fetchPlan(),
        ]);
        return { success: true };
      } catch (err) {
        const msg = err?.message || "Login failed.";
        toast.add({ color: "red", title: msg, timeout: 5000 });
        this.clearAuth();
        return { success: false, error: msg };
      } finally {
        this.isLoading = false;
      }
    },

    async register(formData) {
      const toast = useToast();
      try {
        this.isLoading = true;
        const { data, error } = await useHttp("/api/v1/auth/register", {
          method: "POST",
          data: {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone ?? "",
            organizationName: formData.organizationName || formData.username,
          },
          isLogin: true,
        });

        if (error?.value) {
          const msg = error.value?.message || "Registration failed.";
          toast.add({ color: "red", title: msg });
          return { success: false, error: msg };
        }

        const authData = data.value?.data ?? data.value;
        if (!authData?.accessToken) {
          const msg = "Registration failed: no token received.";
          toast.add({ color: "red", title: msg });
          return { success: false, error: msg };
        }

        const isProd = process.env.NODE_ENV === "production";
        const user = {
          id: authData.userId,
          username: authData.username,
          firstName: authData.firstName ?? "",
          lastName: authData.lastName ?? "",
          email: authData.email,
          avatar: authData.avatar ? resolveAvatarUrl(authData.avatar) : null,
          organizationId: authData.organizationId,
          roles: authData.roles ?? [],
          permissions: authData.permissions ?? [],
        };

        // Keep registration session handling identical to password login.
        // These values were previously undefined, causing a ReferenceError
        // after the API had already created the account successfully.
        const remember = Boolean(formData.remember);
        const accessMaxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24;
        const refreshMaxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7;
        accessCookie(accessMaxAge).value = authData.accessToken;
        refreshCookie(refreshMaxAge).value = authData.refreshToken;
        useCookie("database", {
          maxAge: refreshMaxAge,
          sameSite: "lax",
          secure: isProd,
          path: "/",
        }).value = authData.organizationId;

        if (process.client) {
          localStorage.setItem("user_data", JSON.stringify(user));
          localStorage.setItem(
            "permissions",
            JSON.stringify(authData.permissions ?? []),
          );
        }

        this.access_token = authData.accessToken;
        this.refreshTokenValue = authData.refreshToken;
        this.permissions = authData.permissions ?? [];
        this.user = user;
        this.isAuthenticated = true;

        await this.fetchMe();
        await useEventStore().fetchEvents();
        return { success: true };
      } catch (err) {
        const msg = err?.message || "Registration failed.";
        toast.add({ color: "red", title: msg });
        return { success: false, error: msg };
      } finally {
        this.isLoading = false;
      }
    },

    // Called from login.vue after Google Sign-In widget gives us an ID token
    async loginWithGoogle({ idToken }) {
      const toast = useToast();
      try {
        this.isLoading = true;
        const { data, error } = await useHttp("/api/v1/auth/oauth/google", {
          method: "POST",
          data: { idToken },
          isLogin: true,
        });

        if (error?.value) {
          const msg = error.value?.message || "Google login failed.";
          toast.add({ color: "red", title: msg });
          return { success: false, error: msg };
        }

        const authData = data.value?.data ?? data.value;
        if (!authData?.accessToken) {
          const msg = "Google login failed: no token received.";
          toast.add({ color: "red", title: msg });
          return { success: false, error: msg };
        }

        const isProd = process.env.NODE_ENV === "production";
        const user = {
          id: authData.userId,
          username: authData.username,
          firstName: authData.firstName ?? "",
          lastName: authData.lastName ?? "",
          email: authData.email,
          avatar: authData.avatar ? resolveAvatarUrl(authData.avatar) : null,
          organizationId: authData.organizationId,
          roles: authData.roles ?? [],
          permissions: authData.permissions ?? [],
        };

        const accessMaxAge = 60 * 60 * 24;
        const refreshMaxAge = 60 * 60 * 24 * 7;
        accessCookie(accessMaxAge).value = authData.accessToken;
        refreshCookie(refreshMaxAge).value = authData.refreshToken;
        useCookie("database", {
          maxAge: refreshMaxAge,
          sameSite: "lax",
          secure: isProd,
          path: "/",
        }).value = authData.organizationId;

        if (process.client) {
          localStorage.setItem("user_data", JSON.stringify(user));
          localStorage.setItem(
            "permissions",
            JSON.stringify(authData.permissions ?? []),
          );
        }

        this.access_token = authData.accessToken;
        this.refreshTokenValue = authData.refreshToken;
        this.permissions = authData.permissions ?? [];
        this.user = user;
        this.isAuthenticated = true;

        await this.fetchMe();
        await useEventStore().fetchEvents();
        return { success: true };
      } catch (err) {
        const msg = err?.message || "Google login failed.";
        toast.add({ color: "red", title: msg });
        return { success: false, error: msg };
      } finally {
        this.isLoading = false;
      }
    },
    async loginWithFacebook({ accessToken }) {
      const toast = useToast();
      try {
        this.isLoading = true;
        const { data, error } = await useHttp("/api/v1/auth/oauth/facebook", {
          method: "POST",
          data: { accessToken },
          isLogin: true,
        });

        if (error?.value) {
          const msg = error.value?.message || "Facebook login failed.";
          toast.add({ color: "red", title: msg });
          return { success: false, error: msg };
        }

        const authData = data.value?.data ?? data.value;
        if (!authData?.accessToken) {
          const msg = "Facebook login failed: no token received.";
          toast.add({ color: "red", title: msg });
          return { success: false, error: msg };
        }

        const isProd = process.env.NODE_ENV === "production";
        const user = {
          id: authData.userId,
          username: authData.username,
          firstName: authData.firstName ?? "",
          lastName: authData.lastName ?? "",
          email: authData.email,
          avatar: authData.avatar ? resolveAvatarUrl(authData.avatar) : null,
          organizationId: authData.organizationId,
          roles: authData.roles ?? [],
          permissions: authData.permissions ?? [],
        };

        const accessMaxAge = 60 * 60 * 24;
        const refreshMaxAge = 60 * 60 * 24 * 7;
        accessCookie(accessMaxAge).value = authData.accessToken;
        refreshCookie(refreshMaxAge).value = authData.refreshToken;
        useCookie("database", {
          maxAge: refreshMaxAge,
          sameSite: "lax",
          secure: isProd,
          path: "/",
        }).value = authData.organizationId;

        if (process.client) {
          localStorage.setItem("user_data", JSON.stringify(user));
          localStorage.setItem(
            "permissions",
            JSON.stringify(authData.permissions ?? []),
          );
        }

        this.access_token = authData.accessToken;
        this.refreshTokenValue = authData.refreshToken;
        this.permissions = authData.permissions ?? [];
        this.user = user;
        this.isAuthenticated = true;

        await this.fetchMe();
        await useEventStore().fetchEvents();
        return { success: true };
      } catch (err) {
        const msg = err?.message || "Facebook login failed.";
        toast.add({ color: "red", title: msg });
        return { success: false, error: msg };
      } finally {
        this.isLoading = false;
      }
    },

    async loginWithTikTok({ accessToken }) {
      const toast = useToast();
      try {
        this.isLoading = true;
        const { data, error } = await useHttp("/api/v1/auth/oauth/tiktok", {
          method: "POST",
          data: { accessToken },
          isLogin: true,
        });

        if (error?.value) {
          const msg = error.value?.message || "TikTok login failed.";
          toast.add({ color: "red", title: msg });
          return { success: false, error: msg };
        }

        const authData = data.value?.data ?? data.value;
        if (!authData?.accessToken) {
          const msg = "TikTok login failed: no token received.";
          toast.add({ color: "red", title: msg });
          return { success: false, error: msg };
        }

        const isProd = process.env.NODE_ENV === "production";
        const user = {
          id: authData.userId,
          username: authData.username,
          firstName: authData.firstName ?? "",
          lastName: authData.lastName ?? "",
          email: authData.email,
          avatar: authData.avatar ? resolveAvatarUrl(authData.avatar) : null,
          organizationId: authData.organizationId,
          roles: authData.roles ?? [],
          permissions: authData.permissions ?? [],
        };

        const accessMaxAge = 60 * 60 * 24;
        const refreshMaxAge = 60 * 60 * 24 * 7;
        accessCookie(accessMaxAge).value = authData.accessToken;
        refreshCookie(refreshMaxAge).value = authData.refreshToken;
        useCookie("database", {
          maxAge: refreshMaxAge,
          sameSite: "lax",
          secure: isProd,
          path: "/",
        }).value = authData.organizationId;

        if (process.client) {
          localStorage.setItem("user_data", JSON.stringify(user));
          localStorage.setItem(
            "permissions",
            JSON.stringify(authData.permissions ?? []),
          );
        }

        this.access_token = authData.accessToken;
        this.refreshTokenValue = authData.refreshToken;
        this.permissions = authData.permissions ?? [];
        this.user = user;
        this.isAuthenticated = true;

        await this.fetchMe();
        await useEventStore().fetchEvents();
        return { success: true };
      } catch (err) {
        const msg = err?.message || "TikTok login failed.";
        toast.add({ color: "red", title: msg });
        return { success: false, error: msg };
      } finally {
        this.isLoading = false;
      }
    },

    // Called from Telegram widget onauth callback with widget data
    async loginWithTelegram(telegramData) {
      const toast = useToast();
      try {
        this.isLoading = true;
        const { data, error } = await useHttp("/api/v1/auth/oauth/telegram", {
          method: "POST",
          data: telegramData,
          isLogin: true,
        });

        if (error?.value) {
          const msg = error.value?.message || "Telegram login failed.";
          toast.add({ color: "red", title: msg });
          return { success: false, error: msg };
        }

        const authData = data.value?.data ?? data.value;
        if (!authData?.accessToken) {
          const msg = "Telegram login failed: no token received.";
          toast.add({ color: "red", title: msg });
          return { success: false, error: msg };
        }

        const isProd = process.env.NODE_ENV === "production";
        const user = {
          id: authData.userId,
          username: authData.username,
          firstName: authData.firstName ?? "",
          lastName: authData.lastName ?? "",
          email: authData.email,
          avatar: authData.avatar ? resolveAvatarUrl(authData.avatar) : null,
          organizationId: authData.organizationId,
          roles: authData.roles ?? [],
          permissions: authData.permissions ?? [],
        };

        const accessMaxAge = 60 * 60 * 24;
        const refreshMaxAge = 60 * 60 * 24 * 7;
        accessCookie(accessMaxAge).value = authData.accessToken;
        refreshCookie(refreshMaxAge).value = authData.refreshToken;
        useCookie("database", {
          maxAge: refreshMaxAge,
          sameSite: "lax",
          secure: isProd,
          path: "/",
        }).value = authData.organizationId;

        if (process.client) {
          localStorage.setItem("user_data", JSON.stringify(user));
          localStorage.setItem(
            "permissions",
            JSON.stringify(authData.permissions ?? []),
          );
        }

        this.access_token = authData.accessToken;
        this.refreshTokenValue = authData.refreshToken;
        this.permissions = authData.permissions ?? [];
        this.user = user;
        this.isAuthenticated = true;

        await useEventStore().fetchEvents();
        return { success: true };
      } catch (err) {
        const msg = err?.message || "Telegram login failed.";
        toast.add({ color: "red", title: msg });
        return { success: false, error: msg };
      } finally {
        this.isLoading = false;
      }
    },

    handleAuthError(error) {
      console.log("Authentication error:", error);

      // Clear any existing auth data
      this.clearAuth();

      // Determine error message
      let errorMessage = "Login failed";
      if (error.response) {
        // Handle HTTP error responses
        const status = error.response.status;
        const data = error.response.data;

        if (status === 401) {
          errorMessage = data.message || "Invalid credentials";
        } else if (status === 400) {
          errorMessage = data.message || "Validation error";
        } else if (status === 500) {
          errorMessage = "Server error - please try again later";
        } else if (data?.message) {
          errorMessage = data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Set store message
      this.message = errorMessage;

      // Show error toast
      const toast = useToast();
      toast.add({
        color: "red",
        title: errorMessage,
        timeout: 5000, // 5 seconds
      });
    },

    async getUserProfile() {
      this.isLoading = true;
      const toast = useToast();

      try {
        // 1. Get access token from cookie
        const accessToken = accessCookie().value;

        if (!accessToken) {
          throw new Error("No authentication token found");
        }

        // 2. Verify token locally with jwtDecode
        try {
          const decoded = jwtDecode(accessToken);

          if (decoded.exp * 1000 < Date.now()) {
            console.log("Token expired at:", new Date(decoded.exp * 1000));
            throw new Error("Token expired");
          }
        } catch (decodeError) {
          this.clearAuth();
          throw new Error("Invalid authentication token");
        }

        // 3. Fetch user profile
        const { data, error } = await useHttp("/api/v1/users/me", {
          method: "GET",
        });

        // 4. Handle errors
        if (error.value) {
          if (error.status === 401) {
            throw new Error("Session expired. Please login again.");
          } else if (error.status === 404) {
            throw new Error("User profile not found");
          } else {
            throw new Error(error.message || "Failed to fetch profile");
          }
        }

        // 5. Set user data in store
        this.user = data.value;
        return data.value;
      } catch (err) {
        console.log("Profile fetch failed:", err);

        // If token is invalid or expired → clear auth
        if (
          err.message.includes("expired") ||
          err.message.includes("Invalid authentication")
        ) {
          this.clearAuth();
        }

        // Let component handle UI
        toast.add({
          title: err.message,
          color: "red",
        });

        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    // Delegates to useRefreshToken composable which handles queue, expiry check, and retry
    async refreshToken(force = false) {
      return useRefreshToken(force);
    },

    async logout() {
      // Backend is stateless — no logout endpoint exists. Just clear client state.
      this.clearAuth();

      await navigateTo("/auth/login", { replace: true });
    },

    async checkSession() {
      try {
        console.log(
          "Refreshing with token   ========  lll:",
          this.refreshToken,
        );
        const res = await this.refreshToken();
        console.log("New access token ====================lllllllllk:", res);
      } catch (err) {
        console.log("Failed to refresh token:", err);
      }
    },

    setAuthCookies(data) {
      console.log("Set Auth Cookies Data:", data); // Log the data
      console.log(
        "Set Auth Cookies Data access token from backend :",
        data.accessToken,
      ); // Log the data
      const accessCookie = () => ({
        maxAge: 60 * 60 * 24 * 7, // 1 week
        secure: process.env.NODE_ENV !== "development", // false in dev
        sameSite: "lax", // Changed from strict
        path: "/", // Critical for cross-route persistence
        httpOnly: false, // Needed for client-side access
        domain:
          process.env.NODE_ENV === "development"
            ? "localhost"
            : ".yourdomain.com",
      });
      accessCookie.value = data.accessToken;
    },

    // SSR Compatibility:
    // In your auth store
    async init() {
      if (process.server) return;

      await this.hydrate();
      await this.checkAuthState();
    },

    setAccessToken(token) {
      this.accessToken = token;
      this.isAuthenticated = !!token;
      accessCookie().value = token;
    },

    // setRefreshToken(token) {
    //     this.refreshToken = token;
    //     refreshCookie().value = token;
    // },
    setTokens(access, refresh, expiresIn) {
      this.accessToken = access;
      this.refreshToken = refresh;
      this.refreshTokenExpiry = new Date(Date.now() + expiresIn * 1000);
    },

    clearTokens() {
      this.accessToken = null;
      this.refreshToken = null;
      this.refreshTokenExpiry = null;
    },

    async redirectToLogin() {
      await navigateTo("/auth/login", { replace: true });
    },

    // Decode token (if needed)
    decodeToken(token) {
      if (!token) return null;
      try {
        return jwtDecode(token); // Decode the token
      } catch (error) {
        console.log("Error decoding token:", error);
        return null;
      }
    },

    async hydrate() {
      if (process.client) {
        this.access_token = accessCookie().value;
        this.refresh_token = refreshCookie().value;
        this.isAuthenticated = !!this.access_token;
        this._hydrated = true;

        // Restore user + permissions from localStorage if not already in state
        if (!this.user) {
          try {
            const savedUser = localStorage.getItem("user_data");
            const savedPerms = localStorage.getItem("permissions");
            if (savedUser) this.user = JSON.parse(savedUser);
            if (savedPerms) this.permissions = JSON.parse(savedPerms);
          } catch {}
        }

        if (this.access_token) {
          await this.fetchMe();
        }
      }
    },

    // Helper methods for better organization
    clearAuthState() {
      // Clear in-memory auth state
      this.user = null;
      this.permissions = [];
      this.lastRefresh = null;
      this.auth_token = null;

      // Clear logout timer if it exists
      if (this.logoutTimer) {
        clearTimeout(this.logoutTimer);
        this.logoutTimer = null;
      }
    },

    clearAuthCookies() {
      accessCookie().value = null;
      refreshCookie().value = null;
      useCookie("database").value = null;
    },

    fallbackLogout() {
      this.clearAuth();
      if (process.client) window.location.href = "/auth/login";
    },

    // Add this method to check multiple permissions
    hasAnyPermission(requiredPermissions) {
      if (!requiredPermissions || requiredPermissions.length === 0) return true;
      return requiredPermissions.some((perm) =>
        this.permissions.includes(perm),
      );
    },

    async loadFromCookies() {
      const authTokenCookie = useCookie("auth_token");
      const accessTokenCookie = accessCookie();
      const refreshTokenCookie = refreshCookie();

      this.auth_token = authTokenCookie.value;
      this.access_token = accessTokenCookie.value;
      this.refresh_token = refreshTokenCookie.value;

      if (this.access_token) {
        this.isAuthenticate = true;
      }
    },

    clearAuth() {
      // Reset store state
      this.auth_token = null;
      this.access_token = null;
      this.refresh_token = null;
      this.user = null;
      this.permissions = [];
      this.isAuthenticate = false;
      this.isAuthenticated = false;
      this.lastRefresh = null;
      this.refreshTokenValue = null;
      this.accessToken = null;
      this.refreshToken = null;
      this.token = null;
      this.deviceId = "";

      // Clear cookies (Nuxt handles expiration automatically)
      const auth = useCookie("auth_token");
      const access = accessCookie();
      const refresh = refreshCookie();

      // Clear database cookie
      useCookie("database").value = null;
      useCookie("remember_me").value = null;

      auth.value = null;
      access.value = null;
      refresh.value = null;

      // Clear client-only items
      if (process.client) {
        localStorage.removeItem("device_id");
        localStorage.removeItem("user_data");
        localStorage.removeItem("permissions");
        localStorage.removeItem("cached_weddings");
        localStorage.removeItem("sel_wedding");
      }

      try {
        useEventStore().reset();
      } catch {}

      // Clear any timers
      if (this.logoutTimer) {
        clearTimeout(this.logoutTimer);
        this.logoutTimer = null;
      }
    },

    setupTokenRefresh(expiresIn) {
      // Refresh token 5 minutes before expiry
      const refreshTime = (expiresIn - 300) * 1000;

      if (this.logoutTimer) {
        clearTimeout(this.logoutTimer);
      }

      this.logoutTimer = setTimeout(async () => {
        await this.refreshToken();
      }, refreshTime);
    },

    // Start auto-logout timer
    startAutoLogoutTimer() {
      if (!this.auth_token) return;

      // Decode the token to get the expiration time
      const decodedToken = jwtDecode(this.auth_token);
      const expirationTime = decodedToken.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();

      // Calculate the remaining time until the token expires
      const timeUntilExpiration = expirationTime - currentTime;

      if (timeUntilExpiration > 0) {
        // Set a timer to log out the user when the token expires
        this.logoutTimer = setTimeout(() => {
          this.logout(); // Log out the user
        }, timeUntilExpiration);
      } else {
        // If the token is already expired, log out immediately
        this.logout();
      }
    },

    setUser(userData) {
      console.log("Setting User Data:", userData);
      this.user = userData;
      console.log("888888888888 Set user : ", this.user);
    },
  },
});

// make sure to pass the right store definition, `useAuth` in this case.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
