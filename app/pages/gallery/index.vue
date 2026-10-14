<template>
  <PlanGate
    feature="gallery"
    label="Gallery is not available on your current plan"
  >
    <RWrapperPage>
      <!-- Page Header -->
      <RPageHeader
        title="Photo Gallery"
        :subtitle="`${galleryStore.items.length} photos`"
      >
        <template #actions>
          <button class="btn-primary" @click="triggerUpload">
            <i class="ri-upload-2-line" />
            Upload Photos
          </button>

          <input
            ref="fileInput"
            type="file"
            accept="image/*,video/*"
            multiple
            class="hidden-file-input"
            @change="onFileInputChange"
          />
        </template>
      </RPageHeader>

      <!-- No wedding selected -->
      <div
        v-if="!eventStore.activeEvent"
        class="empty-state glass-card animate-fade-up"
      >
        <div class="empty-icon">
          <i class="ri-image-line" />
        </div>

        <h3>No wedding selected</h3>

        <p>Select a wedding from the sidebar to manage the gallery.</p>
      </div>

      <template v-else>
        <!-- Upload -->
        <GalleryUpload
          :is-dragging="isDragging"
          :preview-queue="previewQueue"
          :uploading="uploading"
          :upload-progress="uploadProgress"
          @upload="triggerUpload"
          @drag-enter="isDragging = true"
          @drag-over="isDragging = true"
          @drag-leave="onDragLeave"
          @drop="onDrop"
          @remove="removeFromQueue"
          @clear="clearQueue"
          @upload-all="uploadAll"
        />

        <!-- Loading -->
        <div
          v-if="galleryStore.loading"
          class="loading-state glass-card animate-fade-up"
        >
          <i class="ri-loader-4-line animate-spin" />

          <span class="text-muted"> Loading gallery... </span>
        </div>

        <!-- Empty -->
        <div
          v-else-if="galleryStore.items.length === 0 && !previewQueue.length"
          class="empty-state glass-card animate-fade-up"
        >
          <div class="empty-icon">
            <i class="ri-image-2-line" />
          </div>

          <h3>No photos yet</h3>

          <p>Drag &amp; drop or click Upload to add wedding photos</p>
        </div>

        <!-- Gallery -->
        <GalleryGrid
          v-else-if="galleryStore.items.length"
          :items="galleryStore.items"
          @open="openLightbox"
          @delete="confirmDelete"
        />
      </template>

      <!-- Lightbox -->
      <GalleryLightbox
        :photo="lightboxPhoto"
        :index="lightboxIndex"
        :total="galleryStore.items.length"
        @close="lightboxPhoto = null"
        @previous="lightboxStep(-1)"
        @next="lightboxStep(1)"
      />

      <!-- Delete modal -->
      <GalleryDeleteModal
        :photo="deletingItem"
        :deleting="deleting"
        @cancel="deletingItem = null"
        @confirm="doDelete"
      />
    </RWrapperPage>
  </PlanGate>
</template>

<script setup>
definePageMeta({
  layout: "navbar",
  middleware: ["auth", "permission"],
  permission: "VIEW_WEDDING",
});

const {
  galleryStore,
  eventStore,

  fileInput,
  isDragging,

  lightboxPhoto,
  lightboxIndex,

  deletingItem,
  deleting,

  previewQueue,
  uploading,
  uploadProgress,

  init,
  triggerUpload,
  addFiles,
  onFileInputChange,
  onDrop,
  onDragLeave,

  removeFromQueue,
  clearQueue,
  uploadAll,

  formatSize,

  openLightbox,
  lightboxStep,

  confirmDelete,
  doDelete,
} = useGalleryPage();

onMounted(init);
</script>

<style lang="scss" scoped>
.hidden-file-input {
  display: none;
}

/* ─────────────────────────────
   Page Shared States
───────────────────────────── */

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-3);
  padding: var(--sp-8);

  i {
    font-size: 1.5rem;
    color: var(--c-muted);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--sp-3);
  padding: var(--sp-12);
  text-align: center;

  h3 {
    font-family: var(--font-700);
    font-size: 1.125rem;
    font-weight: 700;
  }

  p {
    font-size: 0.875rem;
    color: var(--c-muted);
    max-width: 320px;
  }
}

.empty-icon {
  font-size: 2.5rem;
  color: var(--c-muted);
  opacity: 0.4;
}
</style>
