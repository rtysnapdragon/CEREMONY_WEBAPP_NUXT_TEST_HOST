<template>
  <div class="w-bg-wrap">
   type ========> {{ type }}
   isInlineSvg ========> {{ isInlineSvg }}
    <!-- fixed backdrop: does not scroll, swaps freely via props -->
    <div class="w-bg" :class="`w-bg--${type}`" :style="cssVars">
      <div
        v-if="type === 'image' && !isInlineSvg"
        class="w-bg__image"
        :style="{ backgroundImage: `url(${value})` }"
      />

      <div v-else-if="type === 'image' && isInlineSvg" class="w-bg__image w-bg__image--inline" v-html="value" />

      <video v-else-if="type === 'video'" class="w-bg__video" :src="value" autoplay muted loop playsinline />

      <div v-else-if="type === 'particles'" class="w-bg__particles">
        <span v-for="n in particleCount" :key="n" class="w-bg__dot" :style="dotStyle(n)" />
      </div>

      <!-- gradient (default) needs no extra markup, styled purely via CSS vars -->

      <div v-if="overlay" class="w-bg__overlay" />
    </div>

    <!-- normal-flow content that scrolls over the fixed backdrop -->
    <div class="w-bg-wrap__content">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'RTemaplateBackground',
  props: {
    // 'gradient' | 'image' | 'video' | 'particles'
    type: { type: String, default: 'gradient' },
    // for type="image": a URL to a .png/.jpg/.webp/.svg file, OR raw inline
    // "<svg>...</svg>" markup (auto-detected). For type="video": a video url.
    // For type="gradient": optional [from, to] CSS color stop override.
    value: { type: [String, Array], default: null },
    overlay: { type: Boolean, default: true },
    particleCount: { type: Number, default: 24 },
  },
  computed: {
    isInlineSvg() {
      return typeof this.value === 'string' && this.value.trim().startsWith('<svg')
    },
    cssVars() {
      if (this.type === 'gradient') {
        const [from, to] = Array.isArray(this.value) && this.value.length === 2
          ? this.value
          : ['var(--w-bg)', 'var(--w-bg-alt)']
        return { '--w-bg-from': from, '--w-bg-to': to }
      }
      return {}
    },
  },
  methods: {
    dotStyle(n) {
      const left = (n * 37) % 100
      const delay = (n % 12) * 0.6
      const duration = 10 + (n % 7)
      const size = 2 + (n % 4)
      return {
        left: `${left}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        width: `${size}px`,
        height: `${size}px`,
      }
    },
  },
}
</script>

<style lang="scss">
.w-bg-wrap {
  position: relative;
  min-height: 100%;

  &__content {
    position: relative;
    z-index: 1;
  }
}

.w-bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;

  &--gradient {
    background: linear-gradient(160deg, var(--w-bg-from, var(--w-bg)) 0%, var(--w-bg-to, var(--w-bg-alt)) 100%);
  }

  &__image,
  &__video {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__image {
    background-size: cover;
    background-position: center;

    &--inline {
      background: none;

      svg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
      }
    }
  }

  &__overlay {
    position: absolute;
    inset: 0;
    background: var(--w-overlay);
  }

  &__particles {
    position: absolute;
    inset: 0;
  }

  &__dot {
    position: absolute;
    bottom: -10px;
    border-radius: 50%;
    background: var(--w-primary);
    opacity: 0.5;
    animation-name: w-float-up;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
  }
}
.w-bg__image--inline {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;

  svg {
    display: block;
    width: 100%;
    height: 100%;
  }
}
@keyframes w-float-up {
  0% {
    transform: translateY(0);
    opacity: 0;
  }
  10% {
    opacity: 0.6;
  }
  100% {
    transform: translateY(-110vh);
    opacity: 0;
  }
}
</style>