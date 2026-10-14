<template>
  <header class="top-bar">
    <div class="flex items-center gap-3">
      <!-- Back -->
      <button
        v-if="showBack"
        type="button"
        class="top-bar__back cursor-pointer"
        @click="goBack"
        aria-label="Go back"
      >
        <i class="ri-arrow-left-s-line text-2xl"></i>
      </button>

      <!-- Dynamic Page Header -->
      <div class="flex items-center gap-3">
        <div
          v-if="pageIcon"
          class="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-lg"
          :class="pageIconBg"
        >
          <i :class="pageIcon" class="text-xl text-[var(--c-text)]" />
        </div>

        <div class="flex gap-0.5 min-w-0 flex-col">
          <h5 class="text-[10px] font-bold leading-5">
            {{ tr(pageTitle) }} {{ tr(pageDescription) }}
          </h5>
          <div v-if="isDashboard" class="action-group">
            <span
              v-if="daysLeft !== null"
              class="countdown-badge"
              :class="daysLeft <= 7 ? 'urgent' : ''"
            >
              <i class="ri-calendar-event-line" />
              {{
                daysLeft > 0
                  ? tBy({
                      en: `${daysLeft} days to wedding`,
                      km: `${daysLeft} ថ្ងៃទៀតដល់ពិធី`,
                    })
                  : daysLeft === 0
                    ? tBy({
                        en: "Wedding day! 🎉",
                        km: "ថ្ងៃពិធីមហាមង្គល! 🎉",
                      })
                    : tBy({
                        en: `${Math.abs(daysLeft)} days ago`,
                        km: `កន្លងទៅ ${Math.abs(daysLeft)} ថ្ងៃ`,
                      })
              }}
            </span>
            <span v-if="liveStats" class="live-chip">
              <span class="live-dot-sm" />
              Live · {{ lastUpdatedLabel }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <!-- Mobile menu toggle -->
    <div
      class="mobile-bar__menu-btn cursor-pointer"
      @click="toggleMobile"
      aria-label="Open menu"
    >
      <i class="ri-menu-line" />
    </div>

    <div class="top-bar__right">
      <!-- Dark mode -->
      <div
        class="top-bar__mode flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-700 transition-all duration-200 hover:bg-slate-200 dark:text-slate-200 dark:hover:bg-slate-700"
        @click="themeStore.toggleTheme()"
      >
        <i
          :class="themeStore.isDark ? 'ri-sun-line' : 'ri-moon-line'"
          class="text-[20px] transition-transform duration-200"
        />
      </div>

      <!-- Language -->
      <LanguageSwitcher />

      <!-- Profile avatar trigger -->
      <div
        ref="profileBtnRef"
        class="tb-profile cursor-pointer"
        @click.stop="toggleProfile"
      >
        <RAvatar
          :src="authStore.avatar || undefined"
          :name="authStore.fullName"
          size="xs"
          class="pointer-events-none"
        />
      </div>
    </div>

    <!-- Dropdown — teleported to body to escape overflow:hidden on layout -->
    <Teleport to="body">
      <Transition name="tb-dropdown">
        <div
          v-if="profileOpen"
          ref="dropdownRef"
          class="tb-profile-dropdown"
          :style="dropdownStyle"
        >
          <RLink to="/profile" @click.stop="profileOpen = false">
            <div class="tb-dd__user-info">
              <RAvatar
                :src="authStore.avatar || undefined"
                :name="authStore.fullName"
                size="sm"
                shape="circle"
              />
              <div>
                <div class="tb-dd__uname">{{ authStore.fullName }}</div>
                <div class="tb-dd__uemail">{{ authStore.user?.email }}</div>
              </div>
              <button
                class="tb-dd__link tb-dd__link--danger"
                @click.self="handleLogout"
              >
                <i class="ri-logout-box-r-line" /> {{ tr("sign_out") }}
              </button>
            </div>
          </RLink>
        </div>
      </Transition>
    </Teleport>
  </header>
</template>

<script setup>
const { tr } = useTr();
const { toggleMobile } = useSidebar();
const authStore = useAuthStore();
const themeStore = useThemeStore();
const route = useRoute();
const profileOpen = ref(false);
const profileBtnRef = ref(null);
const dropdownRef = ref(null);
const dropdownStyle = ref({});
const { tBy } = useSarikaLocale();
const eventStore = useEventStore();
const { liveStats, lastUpdated, start } = useLiveData();

const hour = new Date().getHours();

const greeting = computed(() => {
  return hour < 12
    ? "Good Morning"
    : hour < 18
      ? "Good Afternoon"
      : "Good Evening";
});

const greetingKm = computed(() => {
  return hour < 12 ? "អរុណសួស្តី" : hour < 18 ? "ទិវាសួស្តី" : "សាយណ្ហសួស្តី";
});

const activeEvent = computed(() => {
  return eventStore.activeEvent;
});

const daysLeft = computed(() => {
  if (!activeEvent.value?.date) return null;
  const diff = new Date(activeEvent.value.date) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

const isDashboard = computed(() => {
  return route.path === "/dashboard" || route.meta.title === "Dashboard";
});

const pageTitle = computed(() => {
  if (isDashboard.value) {
    return tBy({
      en: greeting.value,
      km: greetingKm.value,
    });
  }

  return String(route.meta.title || "");
});

const pageDescription = computed(() => {
  if (isDashboard.value) {
    return activeEvent.value?.title || tr("events.no_event_selected");
  }

  return String(route.meta.description || "");
});

const lastUpdatedLabel = computed(() => {
  if (!lastUpdated.value) return "";
  return lastUpdated.value.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
});

const pageIcon = computed(() => {
  return String(route.meta.icon || "");
});

const pageIconBg = computed(() => {
  return String(route.meta.iconBg || "bg-gray-500");
});

const showBack = computed(() => {
  return route.meta.showBack === true;
});

const goBack = () => {
  window.history.back();
};

const toggleProfile = () => {
  if (!profileOpen.value) {
    const rect = profileBtnRef.value?.getBoundingClientRect();
    if (rect) {
      dropdownStyle.value = {
        position: "fixed",
        top: `${rect.bottom + 8}px`,
        right: `${window.innerWidth - rect.right}px`,
        zIndex: "9999",
      };
    }
  }

  profileOpen.value = !profileOpen.value;
};

const handleClickOutside = (e) => {
  if (!profileOpen.value) return;

  const target = e.target;

  if (profileBtnRef.value?.contains(target)) return;
  if (dropdownRef.value?.contains(target)) return;

  profileOpen.value = false;
};

onMounted(() => {
  start();
  document.addEventListener("click", handleClickOutside, true);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside, true);
});

/**
 * ----------------------------------------
 * Logout
 * ----------------------------------------
 */

const handleLogout = async () => {
  profileOpen.value = false;
  authStore.clearAuth();

  await navigateTo("/auth/login", {
    replace: true,
  });
};
</script>

<style lang="scss" scoped>
.top-bar__title {
  display: flex;
  align-items: center;
  gap: 6px;
  h4 {
    font-size: large;
    font-weight: 600;
  }
}

.top-bar__back {
  width: 30px;
  height: 30px;
  padding: 0;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--c-muted);

  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: var(--c-border);
    color: var(--c-text);
  }

  i {
    font-size: 1.5rem;
  }
}
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  max-height: var(--header-height);
  padding: 16px 16px;
  background: var(--c-bg);
}

.top-bar__right {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.top-bar__mode {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  padding: 3px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--c-text);
  transition:
    background 0.13s,
    color 0.13s;
  &:hover {
    background: var(--c-border);
    color: var(--c-text);
  }
  &-icon {
    font-size: 0.95rem;
  }
}

.tb-profile {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border-radius: 50%;
  cursor: pointer;
  transition: opacity 0.13s;
  &:hover {
    opacity: 0.85;
  }
}

.mobile-bar__menu-btn {
  display: none;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  color: var(--c-text);
  font-size: 1.1rem;
  &:hover {
    background: var(--c-border);
  }
  @media (max-width: 768px) {
    display: flex;
  }
}
</style>

<style lang="scss">
/* Global — teleported dropdown lives in <body>, outside scoped styles */
.tb-profile-dropdown {
  min-width: 220px;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 12px;
  padding: 6px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.22);

  .tb-dd__user-info {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px 10px;
  }

  .tb-dd__uname {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--c-text);
  }

  .tb-dd__uemail {
    font-size: 0.72rem;
    color: var(--c-muted);
    margin-top: 1px;
  }

  .tb-dd__divider {
    border: none;
    border-top: 1px solid var(--c-border);
    margin: 4px 0;
  }

  .tb-dd__link {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border-radius: 8px;
    font-size: 0.825rem;
    color: var(--c-text);
    text-decoration: none;
    cursor: pointer;
    background: none;
    border: none;
    width: 100%;
    text-align: left;
    font-family: inherit;
    transition: background 0.12s;

    &:hover {
      background: rgba(255, 255, 255, 0.06);
    }

    &--danger {
      color: var(--c-danger);
      &:hover {
        background: rgba(248, 113, 113, 0.08) !important;
      }
    }

    i {
      font-size: 0.9rem;
    }
  }
}

.tb-dropdown-enter-active,
.tb-dropdown-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.tb-dropdown-enter-from,
.tb-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}

.action-group {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  flex-wrap: wrap;
}

.countdown-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: var(--r-full);
  color: var(--c-danger);
  font-size: 0.8125rem;
  font-weight: 600;
  &.urgent {
    color: var(--c-danger);
  }
}

.live-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--c-success);
}
.live-dot-sm {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--c-success);
  animation: pulse-live 1.5s infinite;
}
@keyframes pulse-live {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(0.8);
  }
}
</style>
