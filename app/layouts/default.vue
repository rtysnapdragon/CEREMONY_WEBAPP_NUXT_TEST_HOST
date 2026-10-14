<template>
  <div class="app-shell">
    <!-- Sidebar overlay (tablet/mobile) -->
    <!-- <div
      class="sidebar-overlay"
      :class="{ active: mobileOpen }"
      @click="mobileOpen = false"
    /> -->

    <!-- Sidebar -->
    <AppSidebar_new
      :collapsed="sidebarCollapsed"
      :mobile-open="mobileOpen"
      @toggle-collapse="sidebarCollapsed = !sidebarCollapsed"
      @close="mobileOpen = false"
    />

    <!-- Main content -->
    <main class="app-main" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <!-- Header -->
      <AppHeader @open-sidebar="mobileOpen = true" />

      <!-- Page content -->
      <div class="app-content">
        <slot />
      </div>
    </main>

    <!-- Bottom nav (mobile) -->
    <BottomNav />

    <!-- Toast notifications -->
    <ToastNotifications />

    <!-- Mobile sticky fab -->
    <div class="mobile-sticky-actions">
      <button class="btn-primary fab-btn" @click="$emit('quick-action')">
        <i class="ri-add-line" />
      </button>
    </div>
  </div>
</template>

<script setup>
const sidebarCollapsed = ref(false)
const mobileOpen = ref(false)

// Close sidebar on route change (mobile)
const route = useRoute()
watch(() => route.path, () => { mobileOpen.value = false })

// Directive: v-click-outside
const app = useNuxtApp()
</script>

<style lang="scss">
.fab-btn {
  width: 50px;
  height: 50px;
  border-radius: var(--r-full);
  padding: 0;
  font-size: 1.375rem;
  box-shadow: 0 8px 24px rgba(255,140,66,0.45);
}
</style>
