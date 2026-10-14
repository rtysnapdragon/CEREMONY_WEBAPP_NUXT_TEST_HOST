<template>
  <div>
    <div
      class="drop-zone animate-fade-up"
      :class="{
        'drop-zone--active': isDragging,
        'drop-zone--compact': previewQueue.length > 0,
      }"
      @dragenter.prevent="$emit('drag-enter')"
      @dragover.prevent="$emit('drag-over')"
      @dragleave.prevent="$emit('drag-leave')"
      @drop.prevent="$emit('drop', $event)"
      @click="$emit('upload')"
    >
      <div class="drop-zone-inner">
        <i class="ri-drag-drop-line drop-zone-icon" />
        <p class="drop-zone-text">Drag &amp; drop photos here</p>
        <p class="drop-zone-sub">or click to browse · JPG, PNG, GIF, MP4</p>
      </div>
    </div>
    <GalleryPreviewQueue
      :items="previewQueue"
      :uploading="uploading"
      :upload-progress="uploadProgress"
      @remove="$emit('remove', $event)"
      @clear="$emit('clear')"
      @upload-all="$emit('upload-all')"
    />
  </div>
</template>

<script setup>
defineProps({
  isDragging: {
    type: Boolean,
    default: false,
  },

  previewQueue: {
    type: Array,
    default: () => [],
  },

  uploading: {
    type: Boolean,
    default: false,
  },

  uploadProgress: {
    type: Number,
    default: 0,
  },
});

defineEmits([
  "upload",
  "drag-enter",
  "drag-over",
  "drag-leave",
  "drop",
  "remove",
  "clear",
  "upload-all",
]);
</script>

<style lang="scss" scoped>
/* ─────────────────────────────
   Drop Zone
───────────────────────────── */

.drop-zone {
  border: 2px dashed var(--c-border);
  border-radius: var(--r-2xl);

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;

  transition: all var(--t-base);

  padding: var(--sp-10) var(--sp-60);

  background: rgba(255, 255, 255, 0.02);

  &--compact {
    padding: var(--sp-5) var(--sp-6);
  }

  &--active {
    border-color: var(--c-accent);
    background: rgba(var(--c-accent-rgb, 139, 92, 246), 0.06);
  }

  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.04);
  }
}

.drop-zone-inner {
  text-align: center;
  pointer-events: none;
}

.drop-zone-icon {
  font-size: 2.5rem;
  color: var(--c-muted);
  margin-bottom: var(--sp-2);
  display: block;

  .drop-zone--compact & {
    font-size: 1.5rem;
    margin-bottom: 4px;
  }
}

.drop-zone-text {
  font-weight: 600;
  font-size: 0.9375rem;
  margin-bottom: 4px;

  .drop-zone--compact & {
    font-size: 0.875rem;
    display: inline;
  }
}

.drop-zone-sub {
  font-size: 0.8125rem;
  color: var(--c-muted);

  .drop-zone--compact & {
    display: inline;
    margin-left: 4px;
  }
}
</style>
