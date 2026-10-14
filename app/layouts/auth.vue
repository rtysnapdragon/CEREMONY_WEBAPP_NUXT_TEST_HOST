<template>
  <div class="auth-layout ambient-glow">
    <!-- Background decoration -->
    <div class="auth-bg">
      <div class="bg-orb bg-orb-1" />
      <div class="bg-orb bg-orb-2" />
      <div class="bg-grid" />
    </div>

    <!-- Header -->
    <header class="auth-header">
      <NuxtLink to="/" class="auth-logo">
        <div class="logo-icon">
          <i class="ri-heart-3-fill" />
        </div>
        <span class="logo-name">Sarika</span>
      </NuxtLink>

      <div class="auth-header-actions">
        <LanguageSwitcher />
        <button class="btn-icon" @click="toggleTheme()">
          <i :class="themeIcon" />
        </button>
      </div>
    </header>

    <!-- Content -->
    <main class="auth-main">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="auth-footer">
      <span>© {{ new Date().getFullYear() }} Sarika. All rights reserved.</span>
    </footer>

    <ToastNotifications />
  </div>
</template>

<script setup>
const { toggleTheme, themeIcon } = useTheme()

useHead({
  script: [{ src: 'https://accounts.google.com/gsi/client', async: true, defer: true }],
})
</script>

<style lang="scss">

.auth-layout {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  position: relative;
  background: var(--c-bg);
  overflow: hidden;
}

.auth-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.bg-orb {
  position: absolute;
  border-radius: var(--r-full);
  filter: blur(80px);
  opacity: 0.12;

  &-1 {
    width: 500px;
    height: 500px;
    background: var(--c-accent);
    top: -150px;
    right: -100px;
    animation: floatY 8s ease-in-out infinite;
  }

  &-2 {
    width: 400px;
    height: 400px;
    background: var(--c-accent-2);
    bottom: -100px;
    left: -100px;
    animation: floatY 10s ease-in-out infinite reverse;
  }
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,140,66,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,140,66,0.03) 1px, transparent 1px);
  background-size: 60px 60px;
}

.auth-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--sp-5) var(--sp-8);
  position: relative;
  z-index: 10;

  @media (max-width: 768px) { padding: var(--sp-4); }
}

.auth-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;

  .logo-icon {
    width: 32px;
    height: 32px;
    border-radius: var(--r-md);
    background: linear-gradient(135deg, var(--c-accent), var(--c-accent-2));
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1rem;
  }

  .logo-name {
    font-family: var(--font-800);
    font-size: 1.125rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    color: var(--c-text);
  }
}

.auth-header-actions {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
}

.btn-sm {
  padding: 6px 14px !important;
  font-size: 0.8125rem !important;
}

.auth-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--sp-8) var(--sp-4);
  position: relative;
  z-index: 10;
}

.auth-footer {
  text-align: center;
  padding: var(--sp-5);
  font-size: 0.75rem;
  color: var(--c-muted);
  position: relative;
  z-index: 10;
}
</style>
