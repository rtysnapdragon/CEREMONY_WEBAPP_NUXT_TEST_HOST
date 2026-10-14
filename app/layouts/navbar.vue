<template>
  <div class="r-app-layout">
    <!-- Desktop Sidebar -->
    <AppSidebar class="app-layout__sidebar" />

    <div class="r-app-layout__content">
      <!-- Sticky Top Navbar -->
      <header class="app-layout__header">
        <AppActionNavbar />
      </header>

      <!-- Main Content -->
      <div class="r-app-layout__main">
        <!--
          Global RBreadCrumb — lives outside the scroll container so it
          always stays pinned at the top, independent of:
            1) how far the page below has scrolled
            2) the async onMounted timing of each page's usePageBreadcrumb()
          `sticky` (not `fixed`) keeps it inside the flex flow so the
          sidebar/header layout never has to know about it.
        -->
        <div class="r-app-layout__breadcrumb">
          <RBreadCrumb class="py-2 px-2" />
        </div>

        <div class="r-app-layout__scroll">
          <slot />
        </div>
      </div>
    </div>

    <!-- Mobile -->
    <MobileDrawer />
    <MobileBottomNav />
  </div>
</template>
<script setup lang="ts">

</script>
<style lang="scss" scoped>
.r-app-layout {
  display: flex;
  height: 100dvh;
  width: 100%;
  overflow: hidden;

  &__sidebar {
    flex-shrink: 0;

    @media (max-width: 768px) {
      display: none !important;
    }
  }

  &__content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  &__header {
    position: sticky;
    top: 0;
    z-index: 100;
    flex-shrink: 0;
    padding: var(--sp-1) 0;
    background: var(--c-surface);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  &__main {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    padding: 0 !important;
    background-color: var(--c-bg) !important;
    overflow: hidden; // this box itself never scrolls — only &__scroll does
  }

  // Pinned breadcrumb strip — flex-shrink:0 keeps its own height,
  // sticky keeps it visible even though it's already outside the
  // scrolling box (belt-and-suspenders if __main's overflow rules
  // ever change).
  &__breadcrumb {
    // flex-shrink: 0;
    // position: sticky;
    // top: 0;
    // z-index: 30;
    padding: 0 10px;
    // background: var(--c-bg);
  }

  // The only scrollable region — page <slot /> content lives here.
  &__scroll {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;

    scrollbar-gutter: stable;

    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      // modern look (auto-hide until hover)
      background: transparent;
      border-radius: 999px;
      transition: background .25s;
    }

    &:hover::-webkit-scrollbar-thumb {
      background: rgba(120, 120, 120, .6);
    }

    &:hover::-webkit-scrollbar-thumb {
      background: rgba(120,120,120,.45);
    }

    &::-webkit-scrollbar-thumb:hover {
      background: var(--c-primary);
    }
  }

  @media (max-width: 768px) {
    &__scroll {
      padding-bottom: calc(80px + env(safe-area-inset-bottom));
      scrollbar-width: none;
      -ms-overflow-style: none;

      &::-webkit-scrollbar {
        display: none;
      }
    }
  }
}
</style>
