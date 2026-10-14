<template>
  <Teleport to="body">
    <div v-show="photo" class="lightbox-overlay" @click.self="$emit('close')">
      <!-- Close -->
      <button class="lightbox-close btn-icon" @click="$emit('close')">
        <i class="ri-close-line" />
      </button>

      <!-- Previous -->
      <button
        v-if="index > 0"
        class="lightbox-nav lightbox-nav--prev"
        @click.stop="$emit('previous')"
      >
        <i class="ri-arrow-left-s-line" />
      </button>

      <!-- Video -->
      <video
        v-if="photo?.type === 'video'"
        :src="photo?.url"
        class="lightbox-img"
        controls
        autoplay
        loop
        playsinline
      />

      <!-- Image -->
      <RImage
        v-else
        :src="photo?.url"
        :alt="photo?.caption"
        class="lightbox-img"
      />

      <!-- Next -->
      <button
        v-if="index < total - 1"
        class="lightbox-nav lightbox-nav--next"
        @click.stop="$emit('next')"
      >
        <i class="ri-arrow-right-s-line" />
      </button>

      <!-- Caption -->
      <div v-if="photo?.caption" class="lightbox-caption">
        {{ photo.caption }}
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  photo: {
    type: Object,
    default: null,
  },

  index: {
    type: Number,
    default: 0,
  },

  total: {
    type: Number,
    default: 0,
  },
});

defineEmits(["close", "previous", "next"]);
</script>

<style lang="scss" scoped>
/* ─────────────────────────────
   Lightbox
───────────────────────────── */

.lightbox-overlay {
  position: fixed;
  inset: 0;

  background: rgba(0, 0, 0, 0.92);

  backdrop-filter: blur(16px);

  z-index: 400;

  display: flex;

  align-items: center;
  justify-content: center;

  padding: var(--sp-6);
}

.lightbox-close {
  position: absolute;

  top: var(--sp-4);
  right: var(--sp-4);

  background: rgba(255, 255, 255, 0.1) !important;

  border: 1px solid rgba(255, 255, 255, 0.15) !important;

  color: #fff !important;
}

/* ─────────────────────────────
   Navigation
───────────────────────────── */

.lightbox-nav {
  position: absolute;

  top: 50%;

  transform: translateY(-50%);

  width: 44px;
  height: 44px;

  border-radius: var(--r-full);

  background: rgba(255, 255, 255, 0.1);

  border: 1px solid rgba(255, 255, 255, 0.15);

  color: #fff;

  cursor: pointer;

  font-size: 1.5rem;

  display: flex;
  align-items: center;
  justify-content: center;

  transition: background var(--t-fast);

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  &--prev {
    left: var(--sp-4);
  }

  &--next {
    right: var(--sp-4);
  }
}

/* ─────────────────────────────
   Image
───────────────────────────── */

.lightbox-img {
  max-width: 88vw;
  max-height: 85vh;

  object-fit: contain;

  border-radius: var(--r-xl);
}

/* ─────────────────────────────
   Caption
───────────────────────────── */

.lightbox-caption {
  position: absolute;

  bottom: var(--sp-6);

  left: 50%;

  transform: translateX(-50%);

  background: rgba(0, 0, 0, 0.6);

  color: #fff;

  font-size: 0.875rem;

  padding: var(--sp-2) var(--sp-4);

  border-radius: var(--r-full);

  white-space: nowrap;

  max-width: 80vw;

  overflow: hidden;

  text-overflow: ellipsis;
}

/* ─────────────────────────────
   Mobile
───────────────────────────── */

@media (max-width: 600px) {
  .lightbox-overlay {
    padding: var(--sp-4);
  }

  .lightbox-nav {
    width: 38px;
    height: 38px;

    font-size: 1.25rem;

    &--prev {
      left: var(--sp-2);
    }

    &--next {
      right: var(--sp-2);
    }
  }

  .lightbox-img {
    max-width: 94vw;
    max-height: 80vh;
  }
}
</style>
