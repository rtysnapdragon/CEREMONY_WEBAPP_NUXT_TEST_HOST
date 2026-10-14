<template>
  <aside
    class="cld-sidebar"
    :class="{
      'cld-sidebar--collapsed': isCollapsed,
      'cld-sidebar--dragging': isDragging,
    }"
    :style="{ width: cssWidth }"
  >
    <!-- ══════════════════════════════════════════════
         INNER WRAPPER (clips content, allows scroll)
    ═══════════════════════════════════════════════ -->
    <div class="cld-inner">
      <div class="cld-top flex justify-between items-center">
        <RLink to="/" class="flex items-center gap-2">
          <div class="cld-workspace__avatar">
            <span class="cld-workspace__letter">W</span>
          </div>
          <Transition name="cld-fade">
            <div v-if="!isCollapsed" class="cld-workspace__info">
              <span class="cld-workspace__name">{{ tr("app.name") }}</span>
            </div>
          </Transition>
        </RLink>
        <RTCustomTooltip
          v-if="!isCollapsed"
          :text="tr('collapse_sidebar')"
          class="!w-[30px] !h-[30px]"
          :isCollapsible="isCollapsed"
        >
          <button
            class="cld-new-btn cld-new-btn--icon-only"
            @click="toggleCollapse"
          >
            <UIcon name="lucide:panel-left-close" class="cld-new-btn__icon" />
          </button>
        </RTCustomTooltip>
      </div>
      <!-- New item CTA (like "New chat" in Claude) -->
      <div class="cld-section">
        <div :class="{ 'cld-section--new': isCollapsed }">
          <RTCustomTooltip
            :isCollapsible="!isCollapsed"
            v-if="isCollapsed"
            :text="tr('expand_sidebar')"
          >
            <button
              class="cld-new-btn cld-new-btn--icon-only"
              @click="toggleCollapse"
            >
              <UIcon name="lucide:panel-left-open" class="cld-new-btn__icon" />
            </button>
          </RTCustomTooltip>
        </div>
      </div>

      <!-- ── SCROLLABLE NAV BODY ─────────────────────── -->
      <div class="cld-scroll">
        <!-- Nav items -->
        <nav class="cld-section">
          <template v-for="item in menu.menu" :key="item.key">
            <!-- Parent item (has children) -->
            <!-- <div class="cld-item-wrap"> -->
            <RTCustomTooltip
              :text="menuLabel(item)"
              :children="item.children"
              :isCollapsible="!isCollapsed"
            >
              <div v-if="item.children?.length" class="cld-parent-group">
                <div
                  type="button"
                  class="cld-item cld-item--parent"
                  :class="{
                    'cld-item--active': isParentActive(item),
                    'cld-item--open': openKeys.has(item.key),
                  }"
                  @click="handleParentClick(item)"
                >
                  <span class="cld-item__icon-wrap">
                    <UIcon :name="item.icon!" class="cld-item__icon" />
                  </span>

                  <span class="cld-item__label">
                    {{ menuLabel(item) }}
                  </span>

                  <UIcon
                    name="i-heroicons-chevron-right"
                    class="cld-item__chevron"
                    :class="{
                      'cld-item__chevron--open': openKeys.has(item.key),
                    }"
                  />
                </div>

                <Transition name="sidebar-expand">
                  <div v-show="openKeys.has(item.key)" class="cld-sub">
                    <RLink
                      v-for="child in item.children"
                      :key="child.key"
                      :to="child.to"
                      class="cld-sub__item"
                      active-class="cld-sub__item--active"
                    >
                      <span class="cld-sub__dot" />
                      <span class="cld-sub__label">
                        {{ menuLabel(child) }}
                      </span>
                    </RLink>
                  </div>
                </Transition>
              </div>
            </RTCustomTooltip>
            <!-- </div> -->

            <!-- Simple nav link collapsed || main menu with icons only and show label tooltip when collapsed -->
            <RTCustomTooltip
              v-if="!item.children?.length"
              :text="menuLabel(item)"
              :isCollapsible="!isCollapsed"
            >
              <Transition
                enter-active-class="transition-all duration-200 ease-out"
                leave-active-class="transition-all duration-150 ease-in"
                enter-from-class="opacity-0 -translate-y-1"
                enter-to-class="opacity-100 translate-y-0"
                leave-from-class="opacity-100 translate-y-0"
                leave-to-class="opacity-0 -translate-y-1"
                name="cld-fade"
              >
                <RLink
                  :to="item.to"
                  class="cld-item"
                  :class="{
                    'cld-item--active': route.path === localePath(item.to),
                  }"
                >
                  <span class="cld-item__icon-wrap">
                    <UIcon :name="item.icon!" class="cld-item__icon" />
                  </span>
                  <span class="cld-item__label">{{ menuLabel(item) }}</span>
                </RLink>
              </Transition>
            </RTCustomTooltip>
          </template>
        </nav>
      </div>

      <!-- ── BOTTOM PINNED ───────────────────────────── -->
      <div class="cld-bottom">
        <div class="cld-bottom__sep" />
        <!-- Bottom nav items -->
        <nav class="cld-bottom__nav">
          <template v-for="item in menu.bottom" :key="item.key">
            <RTCustomTooltip
              :isCollapsible="!isCollapsed"
              :text="menuLabel(item)"
            >
              <Transition
                enter-active-class="transition-all duration-200 ease-out"
                leave-active-class="transition-all duration-150 ease-in"
                enter-from-class="opacity-0 -translate-y-1"
                enter-to-class="opacity-100 translate-y-0"
                leave-from-class="opacity-100 translate-y-0"
                leave-to-class="opacity-0 -translate-y-1"
                name="cld-fade"
              >
                <RLink
                  :to="item.to"
                  class="cld-item"
                  :class="{
                    'cld-item--active': route.path === localePath(item.to),
                  }"
                >
                  <span class="cld-item__icon-wrap">
                    <UIcon :name="item.icon!" class="cld-item__icon" />
                  </span>
                  <span class="cld-item__label">{{ menuLabel(item) }}</span>
                </RLink>
              </Transition>
            </RTCustomTooltip>
          </template>
        </nav>

        <!-- Current Wedding row (same style as old profile) -->
        <div class="cld-profile">
          <EventSelector
            :isCollapsed="isCollapsed"
            :mobile-open="isCollapsed"
          />
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════
         RESIZE HANDLE — right edge, full height
    ═══════════════════════════════════════════════ -->
    <div
      class="cld-handle"
      :class="{ 'cld-handle--active': isDragging }"
      @mousedown="startDrag"
      @dblclick="toggleCollapse"
      title="Drag to resize · Double-click to collapse"
    >
      <!-- Pill indicator shown on hover / drag -->
      <div class="cld-handle__pill">
        <i class="ri-expand-horizontal-s-line cld-handle__pill-icon"></i>
        <!-- <UIcon
          name="i-heroicons-ellipsis-vertical"
          class="cld-handle__pill-icon"
        /> -->
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { MenuItem } from "~/types/navigation";

defineEmits<{ new: [] }>();

const menu = useMenu();
const colorMode = useColorMode();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { tr } = useTr();
const translationStore = useTranslationStore();

// With strategy: "no_prefix", all routes share the same URLs — no locale prefix needed
const localePath = (path: string | undefined) => path ?? "/";

// Reactive map — re-renders when language switches
const _tmap = computed(() => translationStore.map);

const humanize = (key: string) =>
  key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const menuLabel = (item: MenuItem) => {
  const map = _tmap.value;
  const key = `${item.label}`;
  // 1. DB translation map (live, switches on language change)
  // 2. Humanized fallback so "setup_and_invitation" → "Setup And Invitation"
  return map[key] ?? humanize(key);
};

const {
  isCollapsed,
  isDragging,
  cssWidth,
  toggleCollapse,
  startDrag,
  hydrate,
} = useSplitSidebar();

const handleParentClick1 = (item: MenuItem) => {
  if (isCollapsed.value) {
    toggleCollapse();

    nextTick(() => {
      toggleKey(item.key);
    });

    return;
  }

  toggleKey(item.key);
};
const handleParentClick3 = (item: MenuItem) => {
  if (isCollapsed.value) {
    if (item.to) {
      navigateTo(localePath(item.to));
    }
    return;
  }

  toggleKey(item.key);
};

//Navigate to first child when collapsed (common UX)
// const handleParentClick3 = (item: MenuItem) => {
//   if (isCollapsed.value) {
//     // Route directly when collapsed
//     if (item.to) {
//       navigateTo(localePath(item.to))
//       return
//     }

//     // Fallback: route to first child
//     const firstChild = item.children?.[0]
//     if (firstChild) {
//       navigateTo(localePath(firstChild.to))
//     }

//     return
//   }

//   // Normal accordion behavior when expanded
//   toggleKey(item.key)
// }

//Navigate to first child when collapsed (common UX)
const handleParentClick = (item: MenuItem) => {
  if (isCollapsed.value) {
    const firstChild = item.children?.[0];

    if (firstChild) {
      navigateTo(localePath(firstChild.to));
    }

    return;
  }

  toggleKey(item.key);
};

onMounted(hydrate);

const isDark = computed(() => colorMode.value === "dark");
const toggleColorMode = () => {
  colorMode.preference = isDark.value ? "light" : "dark";
};

// ── Active helpers ─────────────────────────────────────────────
const isParentActive = (item: MenuItem) =>
  item.children?.some((c) => route.path === localePath(c.to)) ?? false;

// ── Accordion ─────────────────────────────────────────────────
const openKeys = ref<Set<string>>(new Set());

const toggleKey = (key: string) => {
  if (openKeys.value.has(key)) {
    openKeys.value = new Set();
    return;
  }

  openKeys.value = new Set([key]);
};

// Auto-open parent of active route
watch(
  () => route.path,
  () => {
    // Don't open submenus when sidebar is collapsed
    if (isCollapsed.value) {
      openKeys.value = new Set();
      return;
    }

    const activeParent = menu.value?.menu.find((item) =>
      item.children?.some((child) => route.path === localePath(child.to)),
    );

    if (activeParent) {
      openKeys.value = new Set([activeParent.key]);
    }
  },
  { immediate: true },
);

// watch(
//   () => route.path,
//   () => {
//     const activeParent =
//       menu.value?.menu.find(item =>
//         item.children?.some(
//           child =>
//             route.path === localePath(child.to)
//         )
//       )

//     if (activeParent) {
//       openKeys.value = new Set([
//         activeParent.key,
//       ])
//     }
//   },
//   { immediate: true }
// )

// Close accordion on collapse
watch(isCollapsed, (v) => {
  if (v) openKeys.value = new Set();
});

// ── Rail icon click when collapsed ────────────────────────────
const handleIconClick = (item: MenuItem) => {
  if (!isCollapsed.value) return;
  // Expand then open accordion
  toggleCollapse();
  nextTick(() => toggleKey(item.key));
};

const navigateTo = (path: string) => {
  router.push(path);
  // auto-open the accordion for the parent whose `to` matches
  menu.value?.menu.forEach((item) => {
    if (item.to && localePath(item.to) === path && item.children?.length) {
      openKeys.value = new Set([...openKeys.value, item.key]);
    }
  });
};

const handleLogout = async () => {
  await authStore.logout();
  router.push(localePath("/auth/login"));
};
</script>

<style lang="scss" scoped>
// ══════════════════════════════════════════════════════════════
// SIDEBAR SHELL
// ══════════════════════════════════════════════════════════════
.cld-sidebar {
  position: relative;
  height: 100vh;
  flex-shrink: 0;
  display: flex;
  flex-direction: row;
  // Width animated only for collapse/expand button, NOT drag (handled via no-transition class)
  &:not(.cld-sidebar--dragging) {
    transition: width 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @media (max-width: 768px) {
    display: none;
  }
  &--collapsed {
    width: var(--sidebar-collapsed, 64px) !important;
  }
}

// ── Inner panel ───────────────────────────────────────────────
.cld-inner {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--c-surface);
  border-right: 1px solid var(--color-border);
  overflow: hidden;
  transition:
    background 0.25s,
    border-color 0.25s;
}

// ══════════════════════════════════════════════════════════════
// WORKSPACE SWITCHER (top)
// ══════════════════════════════════════════════════════════════
.cld-top {
  padding: 10px 14px 6px;
  min-height: var(--header-height) !important;
  flex-shrink: 0;
}

.cld-workspace {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 7px 8px;
  border: none;
  background: transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s;
  overflow: hidden;
  min-height: 40px;

  &:hover {
    background: var(--color-item-hover);
  }

  &__avatar {
    width: 28px;
    height: 28px;
    border-radius: 7px;
    background: linear-gradient(135deg, var(--color-accent), #7b8ff5);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 1px 4px rgba(79, 99, 210, 0.35);
  }

  &__letter {
    font-size: 12px;
    font-weight: 700;
    color: #fff;
    letter-spacing: -0.02em;
  }

  &__info {
    flex: 1;
    min-width: 0;
    text-align: left;
  }

  &__name {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    letter-spacing: -0.015em;
    line-height: 1.2;
  }

  &__sub {
    display: block;
    font-size: 11px;
    color: var(--color-text-muted);
    margin-top: 1px;
    white-space: nowrap;
  }

  &__caret {
    width: 14px;
    height: 14px;
    color: var(--color-text-muted);
    flex-shrink: 0;
  }
}

// ══════════════════════════════════════════════════════════════
// SCROLLABLE BODY
// ══════════════════════════════════════════════════════════════
.cld-scroll {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 0 8px;

  /* Custom scrollbar styles */
  ::-webkit-scrollbar {
    width: 2px !important;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background-color: var(--scrollbar-bg);
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb {
    background-color: var(--scrollbar-thumb-bg);
    border-radius: 10px;
    border: 1px solid var(--scrollbar-bg);
    transition:
      background-color 0.3s ease,
      border-color 0.3s ease;
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: var(--scrollbar-thumb-hover-bg);
    border-color: var(--scrollbar-thumb-border);
  }

  ::-webkit-scrollbar-corner {
    background-color: transparent;
  }
}

// ══════════════════════════════════════════════════════════════
// NEW BUTTON (like "New chat")
// ══════════════════════════════════════════════════════════════
.cld-section {
  padding: 4px 0;

  &--new {
    width: fit-content !important; // or a specific width
    margin: 0 auto;
    padding-bottom: 2px;
    justify-content: flex-start;
  }
}

.cld-new-btn {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 30px !important;
  height: 30px !important;
  // width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 450;
  transition:
    background 0.15s,
    border-color 0.15s,
    color 0.15s;
  white-space: nowrap;
  overflow: hidden;

  &:hover {
    background: var(--color-item-hover);
    border-color: var(--color-accent);
    color: var(--color-text-primary);
  }

  &--icon-only {
    justify-content: center;
    /* padding: 8px;
    border-radius: 10px; */
  }

  &__icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    color: var(--c-text);
  }

  &__label {
    flex: 1;
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

// ══════════════════════════════════════════════════════════════
// DIVIDER / GROUP LABEL
// ══════════════════════════════════════════════════════════════
.cld-divider {
  display: flex;
  align-items: center;
  padding: 10px 10px 4px;
  min-height: 26px;

  &__label {
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: var(--color-text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__line {
    display: block;
    width: 20px;
    height: 1px;
    background: var(--color-border);
    border-radius: 1px;
    margin: 0 auto;
  }
}

// ══════════════════════════════════════════════════════════════
// NAV ITEMS — the core pill row
// ══════════════════════════════════════════════════════════════
.cld-item-wrap {
  display: flex;
  justify-content: start;
  flex-direction: column;
  margin-left: 0;
}

.cld-sub__item {
  position: relative;

  &:hover {
    transform: translateX(2px);
  }
}

.cld-sub__arrow {
  opacity: 0;
  width: 12px;
  height: 12px;
  margin-left: auto;

  transition: all 0.15s ease;
}

.cld-sub__item:hover .cld-sub__arrow {
  opacity: 1;
}

.cld-parent-group {
  width: 100%;
  overflow: visible;
}

.cld-item--parent {
  width: 100%;
  justify-self: start;
}

.cld-sub {
  overflow: hidden;
  margin-left: 18px;
  padding-left: 12px;
  border-left: 1px solid var(--color-border);

  display: flex;

  flex-direction: column;
  gap: 2px;
}

.cld-item {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  // justify-content: center; //effect icon flex
  padding: 7px 15px !important;
  // border-radius: 9px;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  text-decoration: none;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  transition:
    background 0.14s,
    color 0.14s;
  position: relative;
  min-height: 40px !important;

  &:hover {
    // menu hover
    // background: var(--color-item-hover);
    color: var(--c-primary) !important;
  }

  // Active — subtle filled pill like  at sub menu
  &--active {
    // background: var(--c-active);
    color: var(--c-active);
    font-weight: 500;
    min-width: 100% !important;

    // Left accent bar — the tell-tale active indicator submenu-active bar left of main
    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 5px;
      height: 18px;
      background: var(--c-active);
      color: var(--c-active);
      border-radius: 0 4px 4px 0;
    }
  }

  // Parent has active child — lighter
  &--open {
    color: var(--color-text-primary);
  }

  // Mode btn at bottom
  &--mode {
    margin-top: 2px;
  }

  // router-link-active from Nuxt(Active Link bar at left:0 margin)
  &.router-link-exact-active {
    // background: var(--c-active);
    color: var(--c-active);
    font-weight: 500;
    color: var(--c-active) !important;
    //  border-left indicator // Active border-right bar on icon rail ─────────────────────

    &::before {
      content: "";
      position: absolute;
      left: 0 !important; // sits just on the border of the rail
      /* top: 50% !important; */
      transform: translateY(-50%);
      width: 5px !important;
      height: 20px !important;
      background: var(--c-active);
      border-radius: 0px 4px 4px 0px !important;
      pointer-events: none !important;
    }
  }

  &__icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    flex-shrink: 0;
    border-radius: 6px;
    color: var(--c-text);
  }

  &__icon {
    color: var(--c-text);
    // color: currentColor;
    width: 17px;
    height: 17px;
    flex-shrink: 0;
    transition: color 0.14s;
  }
  // Because currentColor inherits the text color from .cld-item.
  &__label {
    // color: var(--color-text-primary) !important;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.3;
    color: var(--c-text);
    padding: 5px 0 !important;
  }

  &__chevron {
    width: 13px;
    height: 13px;
    color: var(--color-text-muted);
    flex-shrink: 0;
    transition:
      transform 0.2s ease,
      color 0.14s;
    // opacity: 0;

    // Only show chevron on hover or when open
    // .cld-item:hover & {
    //   opacity: 1;
    // }

    &--open {
      transform: rotate(90deg);
      opacity: 1 !important;
      color: var(--color-text-secondary);
    }
  }
}

// ══════════════════════════════════════════════════════════════
// SUB-ITEMS
// ══════════════════════════════════════════════════════════════
.cld-sub {
  margin: 1px 0 2px 17px;
  padding-left: 12px;
  border-left: 1.5px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 3px !important;
  overflow: hidden;

  &__item {
    display: flex;
    align-items: center;
    gap: 5px !important;
    padding: 3px 8px 3px 2px !important;
    color: var(--c-text);
    border-radius: 7px;
    text-decoration: none;
    // color: var(--color-text-muted);
    font-size: 12.5px;
    font-weight: 400;
    transition:
      background 0.13s,
      color 0.13s;
    white-space: nowrap;
    overflow: hidden;

    &:hover {
      // background: var(--color-item-hover);
      color: var(--c-primary);
    }

    &--active,
    &.router-link-exact-active {
      color: var(--c-active);
      font-weight: 500;

      .cld-sub__dot {
        background: var(--c-active);
      }
    }
  }

  &__dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--c-text);
    flex-shrink: 0;
    transition: background 0.13s;
  }

  &__label {
    padding: 5px 0 !important;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

// ══════════════════════════════════════════════════════════════
// BOTTOM PINNED AREA
// ══════════════════════════════════════════════════════════════
.cld-bottom {
  flex-shrink: 0;
  padding: 8px 0;

  &__sep {
    height: 1px;
    background: var(--color-border);
    margin: 4px 2px 6px;
    border-radius: 1px;
    transition: background 0.25s;
  }

  &__nav {
    display: flex;
    flex-direction: column;
    gap: 1px;
    margin-bottom: 4px;
  }
}

// ══════════════════════════════════════════════════════════════
// USER PROFILE ROW (Claude.ai-style bottom row)
// ══════════════════════════════════════════════════════════════
.cld-profile {
  display: flex;
  flex-direction: column;
  margin-top: 2px;

  &__btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    // gap: 9px;
    width: 100%;
    padding: 7px 12px 8px;
    border: none;
    background: transparent;
    // border-radius: 10px;
    cursor: pointer;
    font-family: inherit;
    overflow: hidden;
    transition: background 0.15s;

    &:hover {
      background: var(--color-item-hover);
    }
  }

  &__avatar {
    position: relative;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 11px;
    font-weight: 700;
    color: #fff;
    letter-spacing: -0.02em;
  }

  &__status {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #22c55e;
    border: 1.5px solid var(--c-surface);
  }

  &__info {
    flex: 1;
    min-width: 0;
    text-align: left;
  }

  &__name {
    display: block;
    font-size: 12.5px;
    font-weight: 550;
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.2;
  }

  &__email {
    display: block;
    font-size: 10.5px;
    color: var(--color-text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 1px;
  }

  &__mode {
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    border-radius: 7px;
    cursor: pointer;
    color: var(--color-text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition:
      background 0.13s,
      color 0.13s;

    &:hover {
      background: var(--color-border);
      color: var(--color-text-primary);
    }
  }

  &__mode-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 15px;
    height: 15px;
  }
}

// ══════════════════════════════════════════════════════════════
// RESIZE HANDLE
// ══════════════════════════════════════════════════════════════
.cld-handle {
  position: absolute;
  top: 0;
  right: -2px; // straddles the border
  bottom: 0;
  width: 5px;
  z-index: 50;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;

  // Expand hit zone // hover zone show icon
  &::before {
    content: "";
    position: absolute;
    inset: 0 -4px;
  }

  // The visible line
  &::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    width: 1px;
    background: var(--color-border);
    transform: translateX(-50%);
    transition:
      background 0.15s,
      width 0.15s,
      opacity 0.15s;
  }

  &:hover::after,
  &--active::after {
    background: var(--color-accent);
    width: 2px;
    opacity: 0.6;
  }

  // Pill indicator — appears on hover / drag
  &__pill {
    position: relative;
    z-index: 1;
    width: 18px;
    height: 36px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 9px;
    background: var(--c-surface);
    border: 1px solid var(--color-border);
    opacity: 0;
    transform: translateX(0) scale(0.85);
    transition:
      opacity 0.18s ease,
      transform 0.18s ease,
      background 0.15s,
      border-color 0.15s,
      box-shadow 0.18s;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  &__pill-icon {
    width: 12px !important;
    height: 12px !important;
    color: var(--color-text-muted);
    transition: color 0.15s;
  }

  // Show pill on hover
  &:hover &__pill {
    opacity: 1;
    transform: translateX(3px) scale(1);
    border-color: var(--color-accent);
    box-shadow: 0 2px 12px rgba(79, 99, 210, 0.18);
  }

  // Pill active during drag
  &--active &__pill {
    opacity: 1;
    transform: translateX(3px) scale(1.05);
    background: var(--color-accent);
    border-color: var(--color-accent);
    box-shadow: 0 4px 16px rgba(79, 99, 210, 0.35);
  }

  &--active &__pill-icon {
    color: #fff;
  }
}

// Dragging — freeze transitions, enforce cursor everywhere
.cld-sidebar--dragging {
  .cld-inner,
  .cld-inner * {
    pointer-events: none;
  }
}

// ══════════════════════════════════════════════════════════════
// TRANSITIONS
// ══════════════════════════════════════════════════════════════

// Fade for workspace text / profile info
// .cld-fade-enter-active {
//   transition:
//     opacity 0.18s ease 0.06s,
//     transform 0.18s ease 0.06s;
// }
// .cld-fade-leave-active {
//   transition:
//     opacity 0.1s ease,
//     transform 0.1s ease;
// }
// .cld-fade-enter-from {
//   opacity: 0;
//   transform: translateX(-6px);
// }
// .cld-fade-leave-to {
//   opacity: 0;
//   transform: translateX(-4px);
// }

// ══════════════════════════════════════════════════════════════
// SIDEBAR EXPAND TRANSITION (parent -> open children)
// ══════════════════════════════════════════════════════════════
.sidebar-expand-enter-active,
.sidebar-expand-leave-active {
  overflow: hidden;
  transition:
    max-height 0.25s ease,
    opacity 0.2s ease;
}

.sidebar-expand-enter-from,
.sidebar-expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.sidebar-expand-enter-to,
.sidebar-expand-leave-from {
  max-height: 400px;
  opacity: 1;
}

.cld-accordion-enter-from,
.cld-accordion-leave-to {
  max-height: 0;
  opacity: 0;
}

/// Axactly color of item when active
// .cld-item--active,
// .cld-item.router-link-exact-active {
//   color: var(--c-active);
// }
.cld-item--active {
  // background: color-mix(
  //   in srgb,
  //   var(--c-active) 12%,
  //   transparent
  // );

  color: var(--c-active);
}

.cld-item--active .cld-item__icon,
.cld-item.router-link-exact-active .cld-item__icon {
  color: var(--c-active) !important;
}

.cld-item--active .cld-item__label,
.cld-item.router-link-exact-active .cld-item__label {
  color: var(--c-active) !important;
}
</style>
