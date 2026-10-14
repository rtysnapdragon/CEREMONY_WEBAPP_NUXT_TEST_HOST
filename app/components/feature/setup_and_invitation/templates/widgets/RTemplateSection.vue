<template>
  <section
    ref="rootEl"
    class="w-section w-reveal"
    :class="[{ 'w-section--card': card, 'is-visible': isVisible }, `w-section--${screen.isCompact ? 'compact' : 'wide'}`]"
  >
    <div class="w-container w-section__inner">
      <p v-if="eyebrow" class="w-eyebrow">{{ eyebrow }}</p>
      <h2 v-if="title" class="w-section__title">{{ title }}</h2>
      <p v-if="subtitle" class="w-section__subtitle">{{ subtitle }}</p>

      <div class="w-section__body">
        <slot />
      </div>
    </div>
  </section>
</template>

<script>
import { useScreenStore } from '~/stores/screen'

export default {
  name: 'WSection',
  props: {
    eyebrow: { type: String, default: '' },
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    card: { type: Boolean, default: false },
  },
  setup() {
    const screen = useScreenStore()
    return { screen }
  },
  data() {
    return { isVisible: false, observer: null }
  },
  mounted() {
    if (!process.client || !('IntersectionObserver' in window)) {
      this.isVisible = true
      return
    }
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          this.isVisible = true
          this.observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    this.observer.observe(this.$refs.rootEl)
  },
  beforeUnmount() {
    if (this.observer) this.observer.disconnect()
  },
}
</script>

<style lang="scss">
.w-section {
  padding: var(--w-space-xl) 0;
  text-align: center;


  &--compact {
    padding: var(--w-space-lg) 0;
  }

  &--card &__inner {
    background: var(--w-surface-glass);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border: 1px solid var(--w-border);
    border-radius: var(--w-radius-lg);
    padding: var(--w-space-lg) var(--w-space-md);
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
    text-align: center;
  }

  &__inner{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  &__title {
    font-family: var(--font-500);
    font-size: var(--w-fs-h1);
    margin-top: var(--w-space-xs);
    text-align: center;
  }

  &__subtitle {
    margin-top: var(--w-space-xs);
    color: var(--w-text-soft);
  }

  &__body {
    margin-top: var(--w-space-md);
  }
}
</style>