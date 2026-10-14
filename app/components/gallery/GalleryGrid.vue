<template>
  <div class="masonry animate-fade-up delay-1">
    <div
      v-for="photo in items"
      :key="photo.id"
      class="masonry-item"
      @click="$emit('open', photo)"
    >
      <!-- Video -->
      <video
        v-if="photo.type === 'video'"
        :src="photo.url"
        class="masonry-img"
        muted
        loop
        playsinline
        @mouseenter="playVideo"
        @mouseleave="pauseVideo"
      />

      <!-- Image -->
      <RImage
        v-else
        :src="photo.url"
        :alt="photo.caption || photo.filename"
        class="masonry-img"
        loading="lazy"
      />

      <!-- Video badge -->
      <div v-if="photo.type === 'video'" class="masonry-video-badge">
        <i class="ri-play-fill" />
      </div>

      <!-- Overlay -->
      <div class="masonry-overlay">
        <button
          class="masonry-delete"
          title="Delete"
          @click.stop="$emit('delete', photo)"
        >
          <i class="ri-delete-bin-line" />
        </button>
      </div>

      <!-- Caption -->
      <div v-if="photo.caption" class="masonry-caption">
        {{ photo.caption }}
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    default: () => [],
  },
});

defineEmits(["open", "delete"]);

function playVideo(event) {
  event.target.play().catch(() => {});
}

function pauseVideo(event) {
  event.target.pause();
}
</script>

<style lang="scss" scoped>
/* ─────────────────────────────
   Masonry
───────────────────────────── */

.masonry {
  columns: 4 220px;
  column-gap: var(--sp-3);

  @media (max-width: 900px) {
    columns: 3 160px;
  }

  @media (max-width: 600px) {
    columns: 2 140px;
  }
}

.masonry-item {
  break-inside: avoid;

  position: relative;

  margin-bottom: var(--sp-3);

  border-radius: var(--r-xl);

  overflow: hidden;

  cursor: pointer;

  background: rgba(255, 255, 255, 0.04);

  border: 1px solid var(--c-border);

  &:hover {
    .masonry-overlay {
      opacity: 1;
    }

    .masonry-img {
      transform: scale(1.03);
    }
  }
}

.masonry-img {
  width: 100%;

  display: block;

  transition: transform 0.35s ease;
}

/* ─────────────────────────────
   Overlay
───────────────────────────── */

.masonry-overlay {
  position: absolute;
  inset: 0;

  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.35) 0%,
    transparent 40%,
    transparent 60%,
    rgba(0, 0, 0, 0.5) 100%
  );

  opacity: 0;

  transition: opacity var(--t-fast);

  display: flex;

  align-items: flex-start;
  justify-content: flex-end;

  padding: var(--sp-2);
}

.masonry-delete {
  width: 32px;
  height: 32px;

  border-radius: var(--r-md);

  background: rgba(248, 113, 113, 0.2);

  border: 1px solid rgba(248, 113, 113, 0.35);

  color: var(--c-danger);

  cursor: pointer;

  font-size: 1rem;

  display: flex;
  align-items: center;
  justify-content: center;

  transition: all var(--t-fast);

  backdrop-filter: blur(4px);

  &:hover {
    background: rgba(248, 113, 113, 0.4);
  }
}

/* ─────────────────────────────
   Video
───────────────────────────── */

.masonry-video-badge {
  position: absolute;

  top: var(--sp-2);
  left: var(--sp-2);

  width: 28px;
  height: 28px;

  border-radius: var(--r-full);

  background: rgba(0, 0, 0, 0.55);

  backdrop-filter: blur(4px);

  display: flex;
  align-items: center;
  justify-content: center;

  color: #fff;

  font-size: 0.875rem;
}

/* ─────────────────────────────
   Caption
───────────────────────────── */

.masonry-caption {
  position: absolute;

  bottom: 0;
  left: 0;
  right: 0;

  padding: var(--sp-2) var(--sp-3);

  background: linear-gradient(to top, rgba(0, 0, 0, 0.75), transparent);

  font-size: 0.75rem;

  color: #fff;

  white-space: nowrap;

  overflow: hidden;

  text-overflow: ellipsis;
}
</style>
