<template>
  <!-- Mobile Bottom Navigation Bar -->
  <nav class="mobile-bottom-nav">
    <template v-for="item in visibleItems" :key="item.key">
      <div
        v-if="item.children?.length"
        class="mobile-bottom-nav__item cursor-pointer"
        :class="{ 'mobile-bottom-nav__item--active': isActiveParent(item) }"
        @click="openSheet(item)"
      >
        <UIcon :name="item.icon!" class="mobile-bottom-nav__icon" />
        <span class="mobile-bottom-nav__label">{{ label(item) }}</span>
      </div>
      <NuxtLink
        v-else
        :to="item.to"
        class="mobile-bottom-nav__item"
        :class="{ 'mobile-bottom-nav__item--active': route.path === item.to }"
      >
        <UIcon :name="item.icon!" class="mobile-bottom-nav__icon" />
        <span class="mobile-bottom-nav__label">{{ label(item) }}</span>
      </NuxtLink>
    </template>

    <!-- More button -->
    <div
      class="mobile-bottom-nav__item cursor-pointer"
      :class="{ 'mobile-bottom-nav__item--active': isMobileOpen }"
      @click="toggleMobile"
    >
      <UIcon name="i-heroicons-ellipsis-horizontal" class="mobile-bottom-nav__icon" />
      <span class="mobile-bottom-nav__label">More</span>
  </div>
  </nav>

  <!-- Bottom Sheet for children menu -->
  <Teleport to="body">
    <Transition name="sheet-overlay">
      <div v-if="activeSheet" class="sheet-overlay" @click="closeSheet" />
    </Transition>
    <Transition name="sheet">
      <div v-if="activeSheet" class="sheet">
        <div class="sheet__handle" />
        <div class="sheet__header">
          <UIcon :name="activeSheet.icon!" class="sheet__title-icon" />
          <h3 class="sheet__title">{{ label(activeSheet) }}</h3>
        </div>
        <div class="sheet__items">
          <NuxtLink
            v-for="child in activeSheet.children"
            :key="child.key"
            :to="child.to"
            class="sheet__item"
            :class="{ 'sheet__item--active': route.path === child.to }"
            @click="closeSheet"
          >
            <span class="sheet__item-label">{{ label(child) }}</span>
            <UIcon name="i-heroicons-chevron-right" class="sheet__item-chevron" />
          </NuxtLink>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { MenuItem } from '~/types/navigation'
const { isMobileOpen, toggleMobile } = useSidebar()
const ui = useUIStore()
const menu = useMenu()
const route = useRoute()
const { t, te } = useI18n()

const label = (item: MenuItem) => {
  const key = `${item.key}`
  return te(key) ? t(key) : item.label
}

// Show first 4 non-group top items in bottom nav
const visibleItems = computed(() =>
  menu.value?.menu.filter(i => !i.isGroup).slice(0, 4)
)

const activeSheet = ref<MenuItem | null>(null)

const isActiveParent = (item: MenuItem) =>
  item.children?.some(c => route.path === c.to) ?? false

const openSheet = (item: MenuItem) => {
  activeSheet.value = item
}

const closeSheet = () => {
  activeSheet.value = null
}

// Close sheet on route change
watch(() => route.path, () => closeSheet())
</script>

<style lang="scss">
.mobile-bottom-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: var(--c-surface);
  border-top: 1px solid var(--color-border);
  padding: 6px 8px;
  padding-bottom: calc(6px + env(safe-area-inset-bottom));
  gap: 0;
  align-items: center;
  justify-content: space-around;

  @media (max-width: 768px) {
    display: flex;
  }

  &__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    padding: 6px 12px;
    border: none;
    background: transparent;
    cursor: pointer;
    color: var(--color-text-muted);
    text-decoration: none;
    font-family: inherit;
    border-radius: 12px;
    transition: color 0.18s ease, background 0.18s ease;
    min-width: 56px;
    flex: 1;

    &--active {
      color: var(--color-accent);
    }

    &:hover:not(.mobile-bottom-nav__item--active) {
      color: var(--color-text-secondary);
      background: var(--color-item-hover);
    }
  }

  &__icon {
    width: 22px;
    height: 22px;
    transition: transform 0.2s ease;

    .mobile-bottom-nav__item--active & {
      transform: scale(1.08);
    }
  }

  &__label {
    font-size: 0.65rem;
    font-weight: 500;
    letter-spacing: 0.01em;
    white-space: nowrap;
  }
}

// Bottom Sheet
.sheet-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 200;
  backdrop-filter: blur(2px);
}

.sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 201;
  background: var(--c-surface);
  border-radius: 20px 20px 0 0;
  padding: 12px 16px 32px;
  padding-bottom: calc(32px + env(safe-area-inset-bottom));
  box-shadow: 0 -8px 40px rgba(0, 0, 0, 0.15);

  &__handle {
    width: 40px;
    height: 4px;
    border-radius: 2px;
    background: var(--color-border);
    margin: 0 auto 16px;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 4px 14px;
    border-bottom: 1px solid var(--color-border);
    margin-bottom: 8px;
  }

  &__title-icon {
    width: 20px;
    height: 20px;
    color: var(--color-accent);
  }

  &__title {
    font-size: 1rem;
    font-weight: 650;
    color: var(--color-text-primary);
    letter-spacing: -0.01em;
  }

  &__items {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 12px;
    border-radius: 12px;
    text-decoration: none;
    color: var(--color-text-secondary);
    font-size: 0.9rem;
    font-weight: 450;
    transition: background 0.15s ease, color 0.15s ease;

    &--active {
      background: var(--color-item-active-bg);
      color: var(--color-accent);

      .sheet__item-chevron {
        color: var(--color-accent);
      }
    }

    &:hover:not(.sheet__item--active) {
      background: var(--color-item-hover);
      color: var(--color-text-primary);
    }
  }

  &__item-label {
    font-weight: 500;
  }

  &__item-chevron {
    width: 16px;
    height: 16px;
    color: var(--color-text-muted);
  }
}

// Sheet transitions
.sheet-overlay-enter-active,
.sheet-overlay-leave-active {
  transition: opacity 0.25s ease;
}
.sheet-overlay-enter-from,
.sheet-overlay-leave-to {
  opacity: 0;
}

.sheet-enter-active,
.sheet-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.sheet-enter-from,
.sheet-leave-to {
  transform: translateY(100%);
}
</style>
