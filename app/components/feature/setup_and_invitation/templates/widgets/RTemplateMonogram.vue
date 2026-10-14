<template>
  <div class="w-monogram" :class="`w-monogram--${size}`">
    <svg viewBox="0 0 200 200" class="w-monogram__ring" aria-hidden="true">
      <circle cx="100" cy="100" r="94" />
      <circle cx="100" cy="100" r="80" />
    </svg>
    <div class="w-monogram__inner">
      <slot>
        <span class="w-monogram__initials">{{ initials }}</span>
      </slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WMonogram',
  props: {
    initials: { type: String, default: '' },
    size: { type: String, default: 'md' }, // sm | md | lg
  },
}
</script>

<style lang="scss">
.w-monogram {
  position: relative;
  display: grid;
  place-items: center;
  width: 140px;
  height: 140px;
  margin: 0 auto;

  &--sm {
    width: 88px;
    height: 88px;
  }

  &--lg {
    width: 200px;
    height: 200px;
  }

  &__ring {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;

    circle {
      fill: none;
      stroke: var(--w-primary);
      stroke-width: 1.5;
    }
  }

  &__inner {
    position: relative;
    display: grid;
    place-items: center;
    width: 70%;
    height: 70%;
    border-radius: 50%;
    background: var(--w-surface-glass);
  }

  &__initials {
    font-family: var(--w-font-script);
    font-size: 2rem;
    color: var(--w-primary-strong);
  }
}
</style>