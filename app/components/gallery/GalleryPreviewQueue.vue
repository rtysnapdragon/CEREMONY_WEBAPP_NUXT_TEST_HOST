<template>
  <Transition name="slide-down">
    <div v-if="items.length" class="preview-panel glass-card animate-fade-up">
      <!-- Header -->
      <div class="preview-header">
        <span class="preview-title">
          Ready to upload · {{ items.length }} file(s)
        </span>

        <div class="preview-actions">
          <button
            class="btn-ghost btn-sm"
            :disabled="uploading"
            @click.stop="$emit('clear')"
          >
            Cancel
          </button>

          <button
            class="btn-primary btn-sm"
            :disabled="uploading"
            @click.stop="$emit('upload-all')"
          >
            <i v-if="uploading" class="ri-loader-4-line animate-spin" />

            <i v-else class="ri-upload-2-line" />

            Upload all
          </button>
        </div>
      </div>

      <!-- Files -->
      <div class="preview-grid">
        <div
          v-for="(item, index) in items"
          :key="item.id || index"
          class="preview-item"
        >
          <!-- Video -->
          <video
            v-if="item.file.type.startsWith('video/')"
            :src="item.previewUrl"
            class="preview-thumb"
            muted
            playsinline
          />

          <!-- Image -->
          <RImage
            v-else
            :src="item.previewUrl"
            :alt="item.file.name"
            class="preview-thumb"
          />

          <!-- Info -->
          <div class="preview-info">
            <span class="preview-name">
              {{ item.file.name }}
            </span>

            <span class="preview-size">
              {{ formatSize(item.file.size) }}
            </span>
          </div>

          <!-- Status -->
          <div class="preview-status">
            <i
              v-if="item.status === 'done'"
              class="ri-checkbox-circle-fill"
              style="color: var(--c-success)"
            />

            <i
              v-else-if="item.status === 'error'"
              class="ri-error-warning-fill"
              style="color: var(--c-danger)"
            />

            <i
              v-else-if="item.status === 'uploading'"
              class="ri-loader-4-line animate-spin"
              style="color: var(--c-accent)"
            />

            <button
              v-else
              class="preview-remove"
              @click.stop="$emit('remove', index)"
            >
              <i class="ri-close-line" />
            </button>
          </div>
        </div>
      </div>

      <!-- Progress -->
      <div v-if="uploading" class="upload-progress">
        <div
          class="upload-progress-bar"
          :style="{
            width: `${uploadProgress}%`,
          }"
        />
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  items: {
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

defineEmits(["remove", "clear", "upload-all"]);

function formatSize(bytes) {
  if (!bytes) {
    return "0 Bytes";
  }

  const units = ["Bytes", "KB", "MB", "GB"];

  const index = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${parseFloat(
    (bytes / Math.pow(1024, index)).toFixed(2),
  )} ${units[index]}`;
}
</script>

<style lang="scss" scoped>
/* ─────────────────────────────
   Preview Panel
───────────────────────────── */

.preview-panel {
  padding: var(--sp-5);
  border-radius: var(--r-2xl);
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-3);
  margin-bottom: var(--sp-4);
}

.preview-title {
  font-weight: 600;
  font-size: 0.9375rem;
}

.preview-actions {
  display: flex;
  gap: var(--sp-2);
}

.preview-grid {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);

  min-height: 280px;
  max-height: 300px;
  overflow-y: auto;

  margin-bottom: var(--sp-3);
}

.preview-item {
  display: flex;
  align-items: center;
  gap: var(--sp-3);

  padding: var(--sp-2) var(--sp-3);

  border-radius: var(--r-lg);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--c-border);
}

.preview-thumb {
  width: 48px;
  height: 48px;

  object-fit: cover;

  border-radius: var(--r-md);

  flex-shrink: 0;
}

.preview-info {
  flex: 1;
  min-width: 0;
}

.preview-name {
  display: block;

  font-size: 0.8125rem;
  font-weight: 500;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.preview-size {
  font-size: 0.75rem;
  color: var(--c-muted);
}

.preview-status {
  flex-shrink: 0;
  font-size: 1.1rem;
}

.preview-remove {
  width: 28px;
  height: 28px;

  border-radius: var(--r-md);

  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.2);

  color: var(--c-danger);

  cursor: pointer;

  font-size: 0.875rem;

  display: flex;
  align-items: center;
  justify-content: center;

  transition: all var(--t-fast);

  &:hover {
    background: rgba(248, 113, 113, 0.2);
  }
}

/* ─────────────────────────────
   Upload Progress
───────────────────────────── */

.upload-progress {
  height: 4px;

  border-radius: 99px;

  background: rgba(255, 255, 255, 0.08);

  overflow: hidden;
}

.upload-progress-bar {
  height: 100%;

  background: var(--c-accent);

  border-radius: 99px;

  transition: width 0.3s ease;
}

/* ─────────────────────────────
   Animation
───────────────────────────── */

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s var(--ease-out);
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* ─────────────────────────────
   Responsive
───────────────────────────── */

@media (max-width: 640px) {
  .preview-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .preview-actions {
    width: 100%;
  }

  .preview-actions button {
    flex: 1;
  }
}
</style>
