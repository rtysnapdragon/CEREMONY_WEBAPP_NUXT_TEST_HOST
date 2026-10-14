<template>
  <RWrapperPage class="settings-page">
    <!-- <RPageHeader
      :title="tr('settings.title')"
      subtitle="Manage your account and preferences"
    /> -->

    <div class="settings-layout animate-fade-up delay-1">
      <!-- Sidebar nav -->
      <div class="settings-nav glass-card">
        <button
          v-for="tab in settingsTabs"
          :key="tab.key"
          class="stab"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          <i :class="tab.icon" />
          <span>{{ tr(`settings.${tab.key}`) }}</span>
        </button>
      </div>

      <!-- Content -->
      <div class="settings-content glass-card">
        <!-- Profile -->
        <div v-if="activeTab === 'profile'" class="settings-section">
          <h2 class="settings-section-title">{{ tr("settings.profile") }}</h2>
          <div class="avatar-upload">
            <div class="au-avatar">
              <img
                v-if="authStore.avatar"
                :src="authStore.avatar"
                class="avatar xl"
                alt="avatar"
              />
              <div v-else class="avatar-placeholder xl">
                {{ authStore.initials }}
              </div>
            </div>
            <div>
              <button class="btn-ghost">
                <i class="ri-camera-line" /> Change Photo
              </button>
              <p class="text-muted" style="font-size: 0.75rem; margin-top: 5px">
                JPG, PNG. Max 2MB
              </p>
            </div>
          </div>
          <div class="settings-form">
            <div class="form-row-2">
              <div class="form-group">
                <label class="input-label">{{ tr("auth.firstName") }}</label>
                <input
                  v-model="profileForm.firstName"
                  type="text"
                  class="input"
                />
              </div>
              <div class="form-group">
                <label class="input-label">{{ tr("auth.lastName") }}</label>
                <input
                  v-model="profileForm.lastName"
                  type="text"
                  class="input"
                />
              </div>
            </div>
            <div class="form-group">
              <label class="input-label">{{ tr("auth.email") }}</label>
              <input v-model="profileForm.email" type="email" class="input" />
            </div>
            <div class="form-group">
              <label class="input-label">{{ tr("auth.username") }}</label>
              <input v-model="profileForm.username" type="text" class="input" />
            </div>
            <button
              class="btn-primary"
              style="width: fit-content"
              @click="saveProfile"
            >
              <i class="ri-save-line" /> {{ tr("settings.saveChanges") }}
            </button>
          </div>
        </div>

        <!-- Security -->
        <div v-if="activeTab === 'security'" class="settings-section">
          <h2 class="settings-section-title">{{ tr("settings.security") }}</h2>
          <div class="settings-form">
            <div class="form-group">
              <label class="input-label">Current Password</label>
              <input type="password" class="input" />
            </div>
            <div class="form-group">
              <label class="input-label">{{ tr("auth.password") }}</label>
              <input type="password" class="input" />
            </div>
            <div class="form-group">
              <label class="input-label">{{
                tr("auth.confirmPassword")
              }}</label>
              <input type="password" class="input" />
            </div>
            <button class="btn-primary" style="width: fit-content">
              <i class="ri-lock-2-line" /> Update Password
            </button>
          </div>
        </div>

        <!-- Language -->
        <div v-if="activeTab === 'language'" class="settings-section">
          <h2 class="settings-section-title">{{ tr("settings.language") }}</h2>
          <div class="locale-options">
            <div
              v-for="loc in locales"
              :key="loc.code"
              class="locale-opt"
              :class="{ active: locale === loc.code }"
              @click="setLocaleByCode(loc.code)"
            >
              <span class="lo-flag">{{ loc.flag }}</span>
              <div>
                <div class="lo-name">{{ loc.label }}</div>
                <div class="lo-native">
                  {{ loc.code === "en" ? "English" : "ភាសាខ្មែរ" }}
                </div>
              </div>
              <i v-if="locale === loc.code" class="ri-check-line lo-check" />
            </div>
          </div>
        </div>

        <!-- Theme -->
        <div v-if="activeTab === 'theme'" class="settings-section">
          <h2 class="settings-section-title">{{ tr("settings.theme") }}</h2>
          <div class="theme-options">
            <div
              v-for="theme in themes"
              :key="theme.value"
              class="theme-opt"
              :class="{ active: currentTheme === theme.value }"
              @click="setTheme(theme.value)"
            >
              <div class="to-preview" :class="`tp-${theme.value}`">
                <div class="tp-sidebar" />
                <div class="tp-content">
                  <div class="tp-card" />
                  <div class="tp-card" />
                </div>
              </div>
              <div class="to-info">
                <i :class="theme.icon" />
                <span>{{ tr(`settings.${theme.value}`) }}</span>
                <i
                  v-if="currentTheme === theme.value"
                  class="ri-check-line"
                  style="color: var(--c-accent); margin-left: auto"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Notifications settings -->
        <div v-if="activeTab === 'notifications'" class="settings-section">
          <h2 class="settings-section-title">
            {{ tr("settings.notifications") }}
          </h2>
          <div class="notif-settings">
            <div
              v-for="setting in notifSettings"
              :key="setting.key"
              class="ns-item"
            >
              <div class="ns-info">
                <div class="ns-title">{{ setting.label }}</div>
                <div class="ns-desc">{{ setting.desc }}</div>
              </div>
              <label class="toggle">
                <input v-model="setting.enabled" type="checkbox" />
                <div class="toggle-track" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </RWrapperPage>
</template>

<script setup>
definePageMeta({
  middleware: "auth",
  layout: "navbar",
  title: "settings.title",
});
const { locale, locales, setLocaleByCode } = useSarikaLocale();
const { themes, currentTheme, setTheme } = useTheme();
const authStore = useAuthStore();
const toast = useToastStore();
const { tr } = useTr();

const activeTab = ref("profile");

const settingsTabs = [
  { key: "profile", icon: "ri-user-line" },
  { key: "security", icon: "ri-shield-keyhole-line" },
  { key: "language", icon: "ri-translate-2" },
  { key: "theme", icon: "ri-palette-line" },
  { key: "notifications", icon: "ri-notification-3-line" },
];

const profileForm = reactive({
  firstName: authStore.user?.firstName || "",
  lastName: authStore.user?.lastName || "",
  email: authStore.user?.email || "",
  username: authStore.user?.username || "",
});

const saveProfile = () => {
  authStore.updateProfile({ ...profileForm });
  toast.add("Profile updated");
};

const notifSettings = reactive([
  {
    key: "rsvp",
    label: "RSVP Notifications",
    desc: "Get notified when guests confirm or decline",
    enabled: true,
  },
  {
    key: "tasks",
    label: "Task Reminders",
    desc: "Get notified about upcoming task deadlines",
    enabled: true,
  },
  {
    key: "budget",
    label: "Budget Alerts",
    desc: "Get notified when spending exceeds thresholds",
    enabled: false,
  },
  {
    key: "system",
    label: "System Updates",
    desc: "Receive product updates and announcements",
    enabled: true,
  },
]);
</script>

<style lang="scss">
.settings-page {
  display: flex;
  flex-direction: column;
  gap: var(--sp-5);
}

.settings-layout {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: var(--sp-5);
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.settings-nav {
  display: flex;
  flex-direction: column;
  padding: var(--sp-3);
  gap: 2px;

  @media (max-width: 768px) {
    flex-direction: row;
    overflow-x: auto;
  }
}

.stab {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: 10px 12px;
  border-radius: var(--r-md);
  border: none;
  background: none;
  color: var(--c-muted);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all var(--t-fast);
  white-space: nowrap;

  i {
    font-size: 1.0625rem;
    flex-shrink: 0;
  }
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: var(--c-text);
  }
  &.active {
    background: rgba(255, 140, 66, 0.1);
    color: var(--c-accent);
  }
}

.settings-section {
  display: flex;
  flex-direction: column;
  gap: var(--sp-5);
}
.settings-section-title {
  font-family: var(--font-700);
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: var(--sp-2);
}

.avatar-upload {
  display: flex;
  align-items: center;
  gap: var(--sp-5);
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
}

/* Locale */
.locale-options {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

.locale-opt {
  display: flex;
  align-items: center;
  gap: var(--sp-4);
  padding: var(--sp-4) var(--sp-5);
  border-radius: var(--r-lg);
  border: 1px solid var(--c-border);
  cursor: pointer;
  transition: all var(--t-fast);

  &:hover {
    border-color: rgba(255, 140, 66, 0.2);
    background: rgba(255, 255, 255, 0.03);
  }
  &.active {
    border-color: rgba(255, 140, 66, 0.3);
    background: rgba(255, 140, 66, 0.06);
  }
}

.lo-flag {
  font-size: 1.75rem;
}
.lo-name {
  font-size: 0.9375rem;
  font-weight: 600;
}
.lo-native {
  font-size: 0.8125rem;
  color: var(--c-muted);
}
.lo-check {
  color: var(--c-accent);
  font-size: 1.125rem;
  margin-left: auto;
}

/* Theme */
.theme-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--sp-4);
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

.theme-opt {
  border: 1px solid var(--c-border);
  border-radius: var(--r-lg);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--t-fast);
  &:hover {
    border-color: rgba(255, 140, 66, 0.2);
  }
  &.active {
    border-color: rgba(255, 140, 66, 0.4);
  }
}

.to-preview {
  height: 80px;
  display: flex;
  gap: 4px;
  padding: 6px;

  &.tp-dark {
    background: #0a0a0b;
  }
  &.tp-light {
    background: #f8f5f0;
  }
  &.tp-system {
    background: linear-gradient(135deg, #0a0a0b 50%, #f8f5f0 50%);
  }
}

.tp-sidebar {
  width: 20px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.08);
}
.tp-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.tp-card {
  height: 100%;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.06);
}

.to-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  font-size: 0.875rem;
  font-weight: 500;
  border-top: 1px solid var(--c-border);
  i:first-child {
    color: var(--c-muted);
  }
}

/* Notification toggles */
.notif-settings {
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
}

.ns-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-4);
  padding: var(--sp-4) var(--sp-5);
  border-radius: var(--r-lg);
  border: 1px solid var(--c-border);
  transition: background var(--t-fast);
  &:hover {
    background: rgba(255, 255, 255, 0.02);
  }
}

.ns-title {
  font-size: 0.9375rem;
  font-weight: 600;
  margin-bottom: 2px;
}
.ns-desc {
  font-size: 0.8125rem;
  color: var(--c-muted);
}

/* Toggle */
.toggle {
  position: relative;
  cursor: pointer;
  flex-shrink: 0;

  input {
    display: none;
  }

  .toggle-track {
    width: 44px;
    height: 24px;
    border-radius: var(--r-full);
    background: var(--c-border);
    transition: background var(--t-fast);
    position: relative;

    &::after {
      content: "";
      position: absolute;
      top: 3px;
      left: 3px;
      width: 18px;
      height: 18px;
      border-radius: var(--r-full);
      background: white;
      transition: transform var(--t-base) var(--ease-out);
    }
  }

  input:checked ~ .toggle-track {
    background: var(--c-accent);
    &::after {
      transform: translateX(20px);
    }
  }
}
</style>
