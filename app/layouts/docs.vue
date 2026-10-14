<template>
  <div class="docs-layout">
    <!-- Keyboard users can jump past the sidebar and navbar -->
    <a href="#docs-content" class="docs-layout__skip">
      {{ t('skip_to_content') }}
    </a>

    <!-- Pinned to the viewport: the page scrolls, the sidebar doesn't.
         It only gets its own scrollbar when its content is taller than the screen. -->
    <div class="docs-layout__sidebar">
      <DocsSidebar />
    </div>

    <main class="docs-layout__main">
      <AppActionNavbar />

      <div id="docs-content" class="docs-layout__content" tabindex="-1">
        <slot />
      </div>
    </main>

    <!-- Only rendered when a page actually provides a TOC (no empty 256px gap) -->
    <aside
      v-if="$slots.toc"
      class="docs-layout__toc"
      :aria-label="t('on_this_page')"
    >
      <div class="docs-layout__toc-inner">
        <slot name="toc" />
      </div>
    </aside>
  </div>
</template>

<script setup>
const { t } = useI18n()
</script>

<style lang="scss" scoped>
.docs-layout {
  display: flex;
  align-items: flex-start; // lets the sidebar / TOC be sticky
  min-height: 100vh;
  background: var(--c-bg);

  &__skip {
    position: fixed;
    top: var(--sp-2, 0.5rem);
    left: var(--sp-2, 0.5rem);
    z-index: 10000;

    padding: 0.5rem 1rem;
    border-radius: 8px;

    background: var(--c-surface);
    color: var(--c-text);
    border: 1px solid var(--c-border);

    font-size: 0.875rem;
    text-decoration: none;

    transform: translateY(-200%);
    transition: transform 0.15s ease;

    &:focus {
      transform: translateY(0);
    }
  }

  &__sidebar {
    flex-shrink: 0;

    position: sticky;
    top: 0;
    align-self: flex-start;
    height: 100vh;
    height: 100dvh; // mobile browsers: excludes the collapsing URL bar

    overflow-x: hidden;
    overflow-y: auto; // scrolls internally, and only when it overflows
    overscroll-behavior: contain; // wheel at the end doesn't scroll the page behind it
  }

  &__main {
    flex: 1;
    min-width: 0; // lets wide code blocks / tables scroll instead of stretching the page
    padding-inline: var(--sp-10);
  }

  &__content {
    width: 100%;
    max-width: 52rem; // comfortable reading measure on wide screens
    margin-inline: auto;
    padding-block: var(--sp-6, 1.5rem) var(--sp-16, 4rem);

    &:focus {
      outline: none;
    }
  }

  &__toc {
    width: 256px;
    flex-shrink: 0;

    position: sticky;
    top: 0;
    align-self: flex-start;
    max-height: 100vh;
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  &__toc-inner {
    padding: var(--sp-6, 1.5rem) var(--sp-4, 1rem);
  }
}

// Smooth in-page anchor jumps (TOC links), unless the user opts out
@media (prefers-reduced-motion: no-preference) {
  :global(html) {
    scroll-behavior: smooth;
  }
}

// TOC is secondary — hide it before the content gets cramped
@media (max-width: 1200px) {
  .docs-layout__toc {
    display: none;
  }
}

@media (max-width: 1024px) {
  .docs-layout__main {
    padding-inline: var(--sp-6, 1.5rem);
  }
}

@media (max-width: 640px) {
  .docs-layout__main {
    padding-inline: var(--sp-4, 1rem);
  }
}

@media (prefers-reduced-motion: reduce) {
  .docs-layout__skip {
    transition: none;
  }
}
</style>