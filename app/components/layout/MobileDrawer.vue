<template>
  <Teleport to="body">
    <!-- Overlay -->
    <Transition name="drawer-overlay">
      <div v-if="isMobileOpen" class="drawer-overlay" @click="closeMobile" />
    </Transition>

    <!-- Drawer panel -->
    <Transition name="drawer">
      <div v-if="isMobileOpen" class="drawer">
        <!-- Header -->
        <div class="drawer__header">
          <div class="drawer__brand">
            <div class="drawer__brand-icon">
              <UIcon name="i-heroicons-squares-2x2" />
            </div>
            <span class="drawer__brand-name">{{ tr("app_name") }}</span>
          </div>
          <button class="drawer__close" @click="closeMobile">
            <i class="ri-close-line"></i>
          </button>
        </div>

        <!-- Scrollable nav -->
        <div class="drawer__body">
          <nav class="drawer__nav">
            <template v-for="item in menu.menu" :key="item.key">
              <!-- Group label -->
              <div v-if="item.isGroup" class="drawer__group-label">
                {{ item.label }}
              </div>

              <!-- Item with children -->
              <div v-else-if="item.children?.length" class="drawer__section">
                <button
                  class="drawer__item"
                  :class="{ 'drawer__item--active': isActiveParent(item) }"
                  @click="toggle(item.key)"
                >
                  <UIcon :name="item.icon!" class="drawer__item-icon" />
                  <span class="drawer__item-label">{{ tr(item.label) }}</span>
                  <UIcon
                    name="i-heroicons-chevron-right"
                    class="drawer__item-chevron"
                    :class="{
                      'drawer__item-chevron--open': openKeys.has(item.key),
                    }"
                  />
                </button>
                <Transition name="accordion">
                  <div v-if="openKeys.has(item.key)" class="drawer__children">
                    <NuxtLink
                      v-for="child in item.children"
                      :key="child.key"
                      :to="child.to"
                      class="drawer__child"
                      :class="{
                        'drawer__child--active': route.path === child.to,
                      }"
                      @click="closeMobile"
                    >
                      <span class="drawer__child-dot" />
                      {{ tr(child.label) }}
                    </NuxtLink>
                  </div>
                </Transition>
              </div>

              <!-- Simple link -->
              <NuxtLink
                v-else
                :to="item.to"
                class="drawer__item"
                :class="{ 'drawer__item--active': route.path === item.to }"
                @click="closeMobile"
              >
                <UIcon :name="item.icon!" class="drawer__item-icon" />
                <span class="drawer__item-label">{{ tr(item.label) }}</span>
              </NuxtLink>
            </template>
          </nav>
        </div>

        <!-- Footer -->
        <div class="drawer__footer">
          <div class="drawer__footer-nav">
            <NuxtLink
              v-for="item in menu.bottom"
              :key="item.key"
              :to="item.to"
              class="drawer__footer-item"
              @click="closeMobile"
            >
              <UIcon :name="item.icon!" class="drawer__footer-icon" />
              <span>{{ tr(item.label) }}</span>
            </NuxtLink>
          </div>

          <!-- Color mode -->
          <button class="drawer__mode-btn" @click="toggleColorMode">
            <UIcon
              :name="isDark ? 'i-heroicons-sun' : 'i-heroicons-moon'"
              class="drawer__mode-icon"
            />
            <span>{{ tr(isDark ? "light_mode" : "dark_mode") }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const { tr } = useTr();
const { isMobileOpen, closeMobile } = useSidebar();
const menu = useMenu();
// const ui = useUIStore()
const route = useRoute();

const openKeys = ref<Set<string>>(new Set());

const toggle = (key: string) => {
  if (openKeys.value.has(key)) {
    openKeys.value.delete(key);
  } else {
    openKeys.value.add(key);
  }
  openKeys.value = new Set(openKeys.value);
};

const isActiveParent = (item: any) =>
  item.children?.some((c: any) => route.path === c.to) ?? false;

// Auto-open active parents
watch(
  () => route.path,
  () => {
    menu.value.menu.forEach((item) => {
      if (item.children?.some((c) => route.path === c.to)) {
        openKeys.value.add(item.key);
      }
    });
  },
);

// Close drawer on route change
watch(
  () => route.path,
  () => closeMobile(),
);

const colorMode = useColorMode();

const isDark = computed(() => colorMode.value === "dark");
const toggleColorMode = () => {
  colorMode.preference = isDark.value ? "light" : "dark";
};
</script>

<style lang="scss">
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 300;
  backdrop-filter: blur(3px);
}

.drawer {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: min(300px, 88vw);
  z-index: 301;
  background: var(--c-surface);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 4px 0 32px rgba(0, 0, 0, 0.18);

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 14px;
    border-bottom: 1px solid var(--color-border);
    flex-shrink: 0;
  }

  &__brand {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__brand-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    background: var(--color-accent);
    border-radius: 10px;
    color: #fff;
    font-size: 18px;
  }

  &__brand-name {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--color-text-primary);
    letter-spacing: -0.01em;
  }

  &__close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border: none;
    background: var(--color-item-hover);
    border-radius: 8px;
    cursor: pointer;
    color: var(--color-text-secondary);
    font-size: 18px;
    transition: background 0.15s;

    &:hover {
      background: var(--color-border);
      color: var(--color-text-primary);
    }
  }

  &__body {
    flex: 1;
    overflow-y: auto;
    padding: 10px 10px 0;

    &::-webkit-scrollbar {
      width: 4px;
    }
    &::-webkit-scrollbar-thumb {
      background: var(--color-border);
      border-radius: 2px;
    }
  }

  &__nav {
    display: flex;
    flex-direction: column;
    gap: 1px;
    padding-bottom: 12px;
  }

  &__group-label {
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--color-text-muted);
    padding: 14px 10px 4px;
  }

  &__section {
    display: flex;
    flex-direction: column;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 11px 12px;
    border-radius: 12px;
    border: none;
    background: transparent;
    cursor: pointer;
    color: var(--color-text-secondary);
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 450;
    font-family: inherit;
    transition:
      background 0.18s,
      color 0.18s;
    width: 100%;

    &:hover {
      background: var(--color-item-hover);
      color: var(--color-text-primary);
    }

    &--active {
      background: var(--color-item-active-bg);
      color: var(--color-accent);
    }
  }

  &__item-icon {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }

  &__item-label {
    flex: 1;
    text-align: left;
  }

  &__item-chevron {
    width: 14px;
    height: 14px;
    color: var(--color-text-muted);
    transition: transform 0.22s ease;
    flex-shrink: 0;

    &--open {
      transform: rotate(90deg);
    }
  }

  &__children {
    margin-left: 20px;
    padding-left: 14px;
    border-left: 1.5px solid var(--color-border);
    overflow: hidden;
  }

  &__child {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 10px;
    text-decoration: none;
    color: var(--color-text-secondary);
    font-size: 0.85rem;
    font-weight: 440;
    transition:
      background 0.15s,
      color 0.15s;
    margin: 1px 0;

    &:hover {
      background: var(--color-item-hover);
      color: var(--color-text-primary);
    }

    &--active {
      color: var(--color-accent);
      font-weight: 600;
    }
  }

  &__child-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--color-border);
    flex-shrink: 0;

    .drawer__child--active & {
      background: var(--color-accent);
    }
  }

  &__footer {
    border-top: 1px solid var(--color-border);
    padding: 10px 10px;
    padding-bottom: calc(10px + env(safe-area-inset-bottom));
    flex-shrink: 0;
    background: var(--c-surface);
  }

  &__footer-nav {
    display: flex;
    flex-direction: column;
    gap: 1px;
    margin-bottom: 6px;
  }

  &__footer-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 10px;
    text-decoration: none;
    color: var(--color-text-secondary);
    font-size: 0.85rem;
    font-weight: 450;
    transition:
      background 0.15s,
      color 0.15s;

    &:hover {
      background: var(--color-item-hover);
      color: var(--color-text-primary);
    }
  }

  &__footer-icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }

  &__mode-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 10px 12px;
    border-radius: 10px;
    border: none;
    background: var(--color-item-hover);
    cursor: pointer;
    color: var(--color-text-secondary);
    font-size: 0.85rem;
    font-family: inherit;
    transition:
      background 0.15s,
      color 0.15s;

    &:hover {
      background: var(--color-border);
      color: var(--color-text-primary);
    }
  }

  &__mode-icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }
}

// Drawer transitions
.drawer-overlay-enter-active,
.drawer-overlay-leave-active {
  transition: opacity 0.28s ease;
}
.drawer-overlay-enter-from,
.drawer-overlay-leave-to {
  opacity: 0;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(-100%);
}

// Accordion
.accordion-enter-active,
.accordion-leave-active {
  transition:
    max-height 0.28s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.22s ease;
  overflow: hidden;
  max-height: 300px;
}
.accordion-enter-from,
.accordion-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
