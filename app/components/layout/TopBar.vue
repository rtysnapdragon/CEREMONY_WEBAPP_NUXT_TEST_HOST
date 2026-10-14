<template>
  <div class="topbar-inner">
    <!-- Page title -->
    <div class="topbar-title">
      <h1>{{ pageTitle }}</h1>
      <div class="topbar-breadcrumb">
        <span>RamaGallery</span>
        <span class="topbar-breadcrumb__sep">/</span>
        <span class="topbar-breadcrumb__current">{{ pageTitle }}</span>
      </div>
    </div>

    <div class="topbar-actions">
      <!-- Search -->
      <div class="topbar-search">
        <span class="topbar-search__icon">⊘</span>
        <input
          v-model="searchQuery"
          class="topbar-search__input"
          placeholder="Search users, content..."
          @keyup.enter="doSearch"
        />
        <kbd class="topbar-search__kbd">⌘K</kbd>
      </div>

      <!-- Refresh -->
      <button class="btn btn--ghost btn--icon" :class="{ 'topbar-refresh--spinning': store.loading }" @click="store.refresh()">
        ↻
      </button>

      <!-- Theme toggle -->
      <button class="btn btn--ghost btn--icon topbar-theme" @click="cycleTheme">
        <span v-if="colorMode.value === 'dark'">☾</span>
        <span v-else-if="colorMode.value === 'light'">☀</span>
        <span v-else>◑</span>
      </button>

      <!-- Notifications -->
      <button class="btn btn--ghost btn--icon topbar-notif">
        <span>◧</span>
        <span class="topbar-notif__dot" />
      </button>

      <!-- Last update -->
      <div class="topbar-updated">
        <span class="pulse-dot" />
        <span>{{ lastUpdated }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDashboardStore } from '~/stores/dashboard'

const store = useDashboardStore()
const colorMode = useColorMode()
const route = useRoute()
const searchQuery = ref('')

const pageTitle = computed(() => {
  const map: Record<string, string> = {
    '/': 'Dashboard', '/realtime': 'Realtime', '/analytics': 'Analytics',
    '/content': 'Content', '/users': 'Users', '/comments': 'Comments',
    '/likes': 'Likes', '/views': 'Views', '/chat': 'Chat', '/logs': 'Logs',
    '/settings': 'Settings',
  }
  return map[route.path] || 'Dashboard'
})

const lastUpdated = computed(() => {
  if (!store.lastUpdated) return 'Never'
  const diff = Math.floor((Date.now() - store.lastUpdated) / 1000)
  if (diff < 60) return `${diff}s ago`
  return `${Math.floor(diff / 60)}m ago`
})

const themes = ['system', 'light', 'dark'] as const
const cycleTheme = () => {
  const idx = themes.indexOf(colorMode.preference as any)
  colorMode.preference = themes[(idx + 1) % themes.length]
}

const doSearch = () => {
  if (searchQuery.value) navigateTo(`/users?q=${searchQuery.value}`)
}
</script>

<style lang="scss">
.topbar-inner {
  display: flex;
  align-items: center;
  gap: $space-md;
  width: 100%;
}

.topbar-title {
  flex: 0 0 auto;
  margin-right: auto;

  h1 {
    font-family: $font-display;
    font-size: 1rem;
    font-weight: 700;
    line-height: 1;
    margin-bottom: 2px;
  }
}

.topbar-breadcrumb {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  color: var(--text-muted);
  font-family: $font-mono;

  &__sep { opacity: .4; }
  &__current { color: var(--accent); }
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: $space-sm;
}

.topbar-search {
  display: flex;
  align-items: center;
  gap: $space-sm;
  background: var(--bg-elevated);
  border: 1px solid var(--border-color);
  border-radius: $radius-md;
  padding: 6px 10px;
  transition: border-color $transition-fast;

  &:focus-within { border-color: var(--accent); }

  &__icon { font-size: 0.875rem; color: var(--text-muted); }

  &__input {
    background: none;
    border: none;
    outline: none;
    font-family: $font-body;
    font-size: 0.8125rem;
    color: var(--text-primary);
    width: 180px;
    &::placeholder { color: var(--text-muted); }
  }

  &__kbd {
    font-size: 0.65rem;
    font-family: $font-mono;
    color: var(--text-muted);
    background: var(--bg-overlay);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    padding: 1px 5px;
  }
}

@keyframes spin { to { transform: rotate(360deg); } }
.topbar-refresh--spinning { animation: spin 1s linear infinite; }

.topbar-theme { font-size: 1rem; }

.topbar-notif {
  position: relative;
  &__dot {
    position: absolute;
    top: 6px; right: 6px;
    width: 6px; height: 6px;
    background: var(--accent);
    border-radius: 50%;
    border: 1.5px solid var(--bg-surface);
  }
}

.topbar-updated {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: $font-mono;
  font-size: 0.7rem;
  color: var(--text-muted);
  white-space: nowrap;
}
</style>
