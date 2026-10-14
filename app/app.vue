<template>
  <UApp :toaster="toaster">
    <NuxtLoadingIndicator color="gold" />
    <InternetNetworkStatus />
    <PrintPreviewModal />
    <RConfirm />
    <RToast />
    <div
      id="app"
      class="bg-default"
      vaul-drawer-wrapper
      data-vaul-drawer-wrapper
    >
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </div>
  </UApp>
</template>

<script setup lang="ts">
const { locale } = useI18n();

// Watch locale and update HTML lang attribute
watch(
  locale,
  (val) => {
    if (val) document.documentElement.lang = val;
  },
);

const appConfig = useAppConfig();

// Global keyboard shortcuts using nuxt app shortcuts
defineShortcuts({
  "G-H": () => navigateTo("/"),
  "G-E": () => navigateTo("/email"),
});

// Text direction for Reka UI
const textDirection = useTextDirection({ initialValue: "ltr" });
const dir = computed(() => (textDirection.value === "rtl" ? "rtl" : "ltr"));
const colorMode = useColorMode();
const color = computed(() =>
  colorMode.value === "dark" ? "#09090b" : "#ffffff",
);
const { theme } = useAppSettings();
// Set HTML language attribute from i18n locale
useHead({
  htmlAttrs: {
    lang: locale,
  },
  meta: [
    { charset: "utf-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    { key: "theme-color", name: "theme-color", content: color },
  ],
  link: [{ rel: "icon", href: "/favicon.ico" }],
  bodyAttrs: {
    class: computed(
      () =>
        `color-${theme.value?.color || "default"} theme-${theme.value?.type || "default"}`,
    ),
  },
});

const toaster = { 
  component: 'UToaster', 
  options: {
    timeout: 3000, 
    max: 3
  }
}
</script>

<style lang="scss">
.r-toast {
  li[role='alert'] {
    background: red !important;
  }
}

.r-toast-title {
  font-weight: 700;
}

.r-toast-description {
  color: #d1d5db;
}

.r-toast-close {
  color: #fff;
}

[data-slot='toast'] {
  border-radius: 16px !important;
  background: #1f2937 !important;
  color: #fff !important;
  border: 1px solid #374151 !important;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.2);

  [data-slot='toast-title'] {
    font-weight: 700;
    color: #fff;
  }

  [data-slot='toast-description'] {
    color: #d1d5db;
  }

  button {
    color: #fff;

    &:hover {
      background: rgba(255, 255, 255, 0.08);
    }
  }
}
</style>
