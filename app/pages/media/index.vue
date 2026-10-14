<template>
  <RWrapperPage class="media-page">
    <RPageHeader
      title="Media Library"
      :subtitle="`${mediaStore.pagination.totalElements} files`"
    >
      <template #actions>
        <template v-if="selectMode">
          <span class="select-count">{{ selected.size }} selected</span>
          <button class="btn-ghost" :disabled="selectingAll" @click="selectAll">
            <i v-if="selectingAll" class="ri-loader-4-line animate-spin" />
            <span v-else>All ({{ mediaStore.pagination.totalElements }})</span>
          </button>
          <button
            class="btn-primary"
            style="background: var(--c-danger)"
            :disabled="selected.size === 0 || deleting"
            @click="deleteSelected"
          >
            <i v-if="deleting" class="ri-loader-4-line animate-spin" />
            <i v-else class="ri-delete-bin-line" />
            Delete {{ selected.size > 0 ? `(${selected.size})` : "" }}
          </button>
          <button class="btn-ghost" @click="exitSelect">Cancel</button>
        </template>
        <template v-else>
          <button class="btn-ghost" @click="selectMode = true">
            <i class="ri-checkbox-multiple-line" /> Select
          </button>
          <button class="btn-primary" @click="triggerUpload">
            <i class="ri-upload-2-line" /> Upload
          </button>
        </template>
        <input
          ref="fileInput"
          type="file"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx"
          multiple
          style="display: none"
          @change="onFileChange"
        />
      </template>
    </RPageHeader>

    <!-- Filter bar -->
    <div class="glass-card media-filter animate-fade-up delay-1">
      <div class="flex gap-1.5">
        <button
          v-for="f in typeFilters"
          :key="f.value"
          class="filter-chip"
          :class="{ active: mediaStore.filterType === f.value }"
          @click="onFilterType(f.value)"
        >
          <i :class="f.icon" /> {{ f.label }}
        </button>
      </div>
      <div class="mf-search">
        <i class="ri-search-line" />
        <input
          :value="mediaStore.searchQuery"
          type="text"
          class="input input-sm"
          placeholder="Search files..."
          @input="mediaStore.setSearch($event.target.value)"
        />
      </div>
    </div>

    <!-- Upload queue -->
    <Transition name="slide-down">
      <div
        v-if="uploadQueue.length"
        class="glass-card upload-queue animate-fade-up"
      >
        <div class="uq-header">
          <span v-if="!uploading">{{ uploadQueue.length }} file(s) ready</span>
          <span v-else
            >Uploading
            {{ uploadQueue.filter((i) => i.status === "done").length }} /
            {{ uploadQueue.length }}…</span
          >
          <div style="display: flex; gap: var(--sp-3)">
            <button
              class="btn-ghost btn-sm"
              :disabled="uploading"
              @click="uploadQueue = []"
            >
              Cancel
            </button>
            <button
              class="btn-primary btn-sm"
              :disabled="uploading"
              @click="uploadAll"
            >
              <i v-if="uploading" class="ri-loader-4-line animate-spin" />
              <i v-else class="ri-upload-2-line" />
              Upload all
            </button>
          </div>
        </div>
        <div class="uq-list">
          <div v-for="(item, i) in uploadQueue" :key="i" class="uq-item">
            <div class="uq-thumb-wrap">
              <img
                v-if="item.preview"
                :src="item.preview"
                class="uq-thumb"
                :alt="item.file.name"
              />
              <div v-else class="uq-thumb uq-thumb-icon">
                <i :class="fileIcon(item.file.type)" />
              </div>
              <div v-if="item.status === 'done'" class="uq-done-badge">
                <i class="ri-check-line" />
              </div>
              <div v-else-if="item.status === 'error'" class="uq-err-badge">
                <i class="ri-close-line" />
              </div>
            </div>
            <div class="uq-info">
              <div class="uq-name">{{ item.file.name }}</div>
              <div class="uq-bar-wrap">
                <div
                  class="uq-bar"
                  :class="{
                    'uq-bar--done': item.status === 'done',
                    'uq-bar--error': item.status === 'error',
                  }"
                  :style="{ width: item.progress + '%' }"
                />
              </div>
              <div class="uq-pct">
                <span
                  v-if="item.status === 'error'"
                  style="color: var(--c-danger)"
                  >Failed</span
                >
                <span v-else>{{ item.progress }}%</span>
              </div>
            </div>
            <button
              v-if="item.status === 'pending'"
              class="btn-icon btn-xs-icon"
              @click="uploadQueue.splice(i, 1)"
            >
              <i class="ri-close-line" />
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Loading -->
    <div
      v-if="mediaStore.loading"
      class="loading-state glass-card animate-fade-up"
    >
      <i
        class="ri-loader-4-line animate-spin"
        style="font-size: 1.5rem; color: var(--c-muted)"
      />
      <span class="text-muted">Loading media...</span>
    </div>

    <!-- Empty -->
    <div
      v-else-if="mediaStore.filtered.length === 0"
      class="glass-card empty-state animate-fade-up"
    >
      <div class="empty-icon"><i class="ri-image-line" /></div>
      <h3>No media files</h3>
      <p>Upload images, videos, or documents to get started.</p>
      <button class="btn-primary" @click="triggerUpload">
        <i class="ri-upload-2-line" /> Upload
      </button>
    </div>

    <!-- Masonry grid (gallery style) -->
    <div v-else class="ml-masonry animate-fade-up delay-2">
      <div
        v-for="item in mediaStore.filtered"
        :key="item.id"
        class="ml-item"
        :class="{ 'ml-item--selected': selected.has(item.id) }"
        @click="selectMode ? toggleSelect(item.id) : openPreview(item)"
      >
        <!-- Media content — single if/else-if chain -->
        <img
          v-if="item.mediaType === 'IMAGE' && !imgErrors.has(item.id)"
          :src="item.thumbnailUrl || item.fileUrl"
          :alt="item.altText || item.originalName"
          class="ml-img"
          loading="lazy"
          @error="imgErrors.add(item.id)"
        />
        <div
          v-else-if="item.mediaType === 'IMAGE'"
          class="ml-icon ml-icon--broken"
        >
          <i class="ri-image-2-line" />
        </div>
        <video
          v-else-if="item.mediaType === 'VIDEO'"
          :src="item.fileUrl"
          class="ml-img"
          muted
          loop
          playsinline
          preload="metadata"
          @mouseenter="(e) => e.target.play()"
          @mouseleave="
            (e) => {
              e.target.pause();
              e.target.currentTime = 0;
            }
          "
        />
        <div
          v-else-if="item.mediaType === 'AUDIO'"
          class="ml-icon ml-icon--audio"
        >
          <i class="ri-music-fill" />
        </div>
        <div v-else class="ml-icon ml-icon--doc">
          <i class="ri-file-text-fill" />
        </div>

        <!-- Play badge — standalone, only for VIDEO -->
        <div
          v-if="item.mediaType === 'VIDEO' && !selectMode"
          class="ml-play-badge"
        >
          <i class="ri-play-fill" />
        </div>

        <!-- Select checkbox -->
        <div
          v-if="selectMode"
          class="ml-select-check"
          :class="{ active: selected.has(item.id) }"
        >
          <i
            :class="
              selected.has(item.id)
                ? 'ri-checkbox-circle-fill'
                : 'ri-checkbox-blank-circle-line'
            "
          />
        </div>

        <!-- Hover overlay -->
        <div class="ml-overlay">
          <div class="ml-overlay-top">
            <span class="ml-badge">{{ item.mediaType }}</span>
            <div class="ml-actions">
              <button class="ml-btn" @click.stop="openEdit(item)">
                <i class="ri-edit-line" />
              </button>
              <button
                class="ml-btn ml-btn--danger"
                @click.stop="confirmDelete(item)"
              >
                <i class="ri-delete-bin-line" />
              </button>
            </div>
          </div>
        </div>

        <!-- Caption -->
        <div class="ml-caption">
          <span class="ml-caption-name">{{ item.originalName }}</span>
          <span class="ml-caption-size">{{ formatSize(item.fileSize) }}</span>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div
      v-if="mediaStore.pagination.totalPages > 1"
      class="pagination animate-fade-up"
    >
      <button
        class="btn-ghost btn-sm"
        :disabled="mediaStore.pagination.page === 0"
        @click="loadPage(mediaStore.pagination.page - 1)"
      >
        <i class="ri-arrow-left-s-line" />
      </button>
      <span class="pg-info"
        >{{ mediaStore.pagination.page + 1 }} /
        {{ mediaStore.pagination.totalPages }}</span
      >
      <button
        class="btn-ghost btn-sm"
        :disabled="
          mediaStore.pagination.page >= mediaStore.pagination.totalPages - 1
        "
        @click="loadPage(mediaStore.pagination.page + 1)"
      >
        <i class="ri-arrow-right-s-line" />
      </button>
    </div>

    <!-- Media Viewer -->
    <MediaViewer
      v-model="viewerOpen"
      :items="viewerItems"
      :index="viewerIndex"
    />

    <!-- Edit Drawer -->
    <RDrawer
      v-model:open="showEditDrawer"
      title="Edit Media"
      icon="ri-edit-line"
      width-desktop="420px"
      @close="showEditDrawer = false"
    >
        <div class="drawer-form">
          <div v-if="editingItem" class="media-edit-preview">
            <img
              v-if="editingItem.mediaType === 'IMAGE'"
              :src="editingItem.thumbnailUrl || editingItem.fileUrl"
              :alt="editingItem.altText"
            />
            <div v-else class="media-edit-icon">
              <i :class="mediaTypeIcon(editingItem.mediaType)" />
            </div>
            <span class="mc-name-sm">{{ editingItem.originalName }}</span>
          </div>
          <div class="form-group">
            <label class="input-label">Alt Text</label>
            <input
              v-model="editForm.altText"
              type="text"
              class="input"
              placeholder="Describe this file..."
            />
          </div>
          <div class="form-group">
            <label class="input-label">Media Type</label>
            <select v-model="editForm.mediaType" class="input">
              <option value="IMAGE">Image</option>
              <option value="VIDEO">Video</option>
              <option value="AUDIO">Audio</option>
              <option value="DOCUMENT">Document</option>
            </select>
          </div>
        </div>
      <template #footer>
        <RBtn type="cancel" :label="$t('cancel')" @click="showEditDrawer = false" />
        <RBtn type="save" iconLoading="ri-loader-4-line" :label="$t('save')" :disabled="saving" @click="saveEdit" />
      </template>
    </RDrawer>
  </RWrapperPage>
</template>

<script setup>
definePageMeta({
  layout: "navbar",
  middleware: ["auth", "permission"],
  permission: "VIEW_MEDIA",
});

const mediaStore = useMediaStore();
const toast = useToastStore();

const confirmStore = useConfirmStore();
const fileInput = ref(null);
const uploadQueue = ref([]);
const uploading = ref(false);
const imgErrors = reactive(new Set());
const selectMode = ref(false);
const selected = reactive(new Set());
const selectingAll = ref(false);
const deleting = ref(false);
const viewerOpen = ref(false);
const viewerItems = ref([]);
const viewerIndex = ref(0);
const editingItem = ref(null);
const showEditDrawer = ref(false);
const editForm = reactive({ altText: "", mediaType: "IMAGE" });
const saving = ref(false);

onMounted(() => mediaStore.fetchMedia());

const typeFilters = [
  { value: "ALL", label: "All", icon: "ri-folders-line" },
  { value: "IMAGE", label: "Images", icon: "ri-image-line" },
  { value: "VIDEO", label: "Videos", icon: "ri-video-line" },
  { value: "AUDIO", label: "Audio", icon: "ri-music-line" },
  { value: "DOCUMENT", label: "Docs", icon: "ri-file-text-line" },
];

const onFilterType = (type) => mediaStore.setFilter(type);

const triggerUpload = () => fileInput.value?.click();

const onFileChange = (e) => {
  const files = Array.from(e.target.files || []);
  files.forEach((file) => {
    const preview = file.type.startsWith("image/")
      ? URL.createObjectURL(file)
      : null;
    uploadQueue.value.push({ file, preview, progress: 0, status: "pending" });
  });
  e.target.value = "";
};

const uploadAll = async () => {
  uploading.value = true;
  let success = 0;
  for (const item of uploadQueue.value) {
    item.status = "uploading";
    item.progress = 0;
    const result = await mediaStore.uploadWithProgress(
      item.file,
      "",
      null,
      (pct) => {
        item.progress = pct;
      },
    );
    if (result) {
      item.status = "done";
      item.progress = 100;
      success++;
    } else {
      item.status = "error";
    }
  }
  uploading.value = false;
  await nextTick();
  setTimeout(() => {
    uploadQueue.value = [];
    toast.add(`${success} file(s) uploaded`, "Upload complete");
  }, 800);
};

const toggleSelect = (id) => {
  selected.has(id) ? selected.delete(id) : selected.add(id);
};
const selectAll = async () => {
  if (selectingAll.value) return;
  selectingAll.value = true;
  try {
    const ids = await mediaStore.fetchAllIds();
    ids.forEach((id) => selected.add(id));
  } finally {
    selectingAll.value = false;
  }
};
const exitSelect = () => {
  selectMode.value = false;
  selected.clear();
};

const deleteSelected = () => {
  if (!selected.size) return;
  confirmStore.show({
    type: "delete",
    title: "Delete Selected",
    description: `Delete ${selected.size} file(s)? This cannot be undone.`,
    onConfirm: async () => {
      deleting.value = true;
      const ids = [...selected];
      const result = await mediaStore.deleteAllMedia(ids);
      deleting.value = false;
      selected.clear();
      if (result.skipped > 0 && result.deleted === 0) {
        toast.add(
          `All ${result.skipped} file(s) are in use by articles or categories and cannot be deleted.`,
          "Delete Failed",
        );
      } else if (result.skipped > 0) {
        toast.add(
          `${result.deleted} deleted, ${result.skipped} skipped (still in use).`,
          "Partial Delete",
        );
      } else {
        toast.add(`${result.deleted} file(s) deleted`, "Deleted");
      }
      exitSelect();
    },
  });
};

const openPreview = (item) => {
  viewerItems.value = mediaStore.filtered.map((m) => ({
    id: m.id,
    fileUrl: m.fileUrl,
    thumbnailUrl: m.thumbnailUrl,
    fileName: m.originalName,
    altText: m.altText,
    mediaType: m.mediaType,
    mimeType: m.mimeType,
    fileSize: m.fileSize,
  }));
  viewerIndex.value = mediaStore.filtered.findIndex((m) => m.id === item.id);
  viewerOpen.value = true;
};

const openEdit = (item) => {
  editingItem.value = item;
  editForm.altText = item.altText;
  editForm.mediaType = item.mediaType;
  showEditDrawer.value = true;
};

const saveEdit = async () => {
  saving.value = true;
  try {
    const result = await mediaStore.update(editingItem.value.id, {
      altText: editForm.altText,
      mediaType: editForm.mediaType,
    });
    if (result?.data) {
      toast.add("Media updated", "Success");
      showEditDrawer.value = false;
    } else toast.add(result?.error || "Failed to update", "Error");
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (item) => {
  confirmStore.show({
    type: "delete",
    title: "Delete Media",
    description: `Delete "${item.originalName}"? This cannot be undone.`,
    onConfirm: async () => {
      const result = await mediaStore.deleteMedia(item.id);
      if (result?.data) toast.add("File deleted", "Deleted");
      else toast.add(result?.error || "Failed to delete", "Error");
    },
  });
};

const copyUrl = (url) => {
  navigator.clipboard.writeText(url);
  toast.add("URL copied to clipboard", "Copied");
};

const loadPage = (page) => mediaStore.fetchMedia(page);

const formatSize = (bytes) => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");

const fileIcon = (mime = "") => {
  if (mime.startsWith("image/")) return "ri-image-line";
  if (mime.startsWith("video/")) return "ri-video-line";
  if (mime.startsWith("audio/")) return "ri-music-line";
  return "ri-file-text-line";
};

const mediaTypeIcon = (type) =>
  ({
    IMAGE: "ri-image-line",
    VIDEO: "ri-video-line",
    AUDIO: "ri-music-line",
    DOCUMENT: "ri-file-text-line",
  })[type] ?? "ri-file-line";
</script>

<style lang="scss">
.media-page {
  display: flex;
  flex-direction: column;
  background: var(--c-bg);
  gap: var(--sp-5);
}

.media-filter {
  height: 100px;
  padding: var(--sp-3) var(--sp-5);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--sp-3);
  .mf-search {
    display: flex;
    align-items: center;
    gap: var(--sp-2);
    color: var(--c-muted);
    input {
      width: 200px;
    }
  }
}

.upload-queue {
  padding: var(--sp-5);
  .uq-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--sp-4);
    font-weight: 600;
    font-size: 0.875rem;
  }
  .uq-list {
    display: flex;
    flex-direction: column;
    gap: var(--sp-2);
  }
  .uq-item {
    display: flex;
    align-items: center;
    gap: var(--sp-3);
    padding: var(--sp-2) var(--sp-3);
    background: rgba(255, 255, 255, 0.04);
    border-radius: var(--r-md);
    border: 1px solid var(--c-border);
  }
  .uq-thumb-wrap {
    position: relative;
    flex-shrink: 0;
  }
  .uq-thumb {
    width: 44px;
    height: 44px;
    object-fit: cover;
    border-radius: var(--r-sm);
    display: block;
  }
  .uq-thumb-icon {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.06);
    border-radius: var(--r-sm);
    font-size: 1.25rem;
    color: var(--c-muted);
  }
  .uq-done-badge,
  .uq-err-badge {
    position: absolute;
    inset: 0;
    border-radius: var(--r-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    font-weight: 700;
  }
  .uq-done-badge {
    background: rgba(34, 197, 94, 0.75);
    color: #fff;
  }
  .uq-err-badge {
    background: rgba(239, 68, 68, 0.75);
    color: #fff;
  }
  .uq-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .uq-name {
    font-size: 0.75rem;
    color: var(--c-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .uq-bar-wrap {
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 99px;
    overflow: hidden;
  }
  .uq-bar {
    height: 100%;
    border-radius: 99px;
    background: var(--c-accent);
    transition: width 0.15s ease;
    &--done {
      background: var(--c-success);
    }
    &--error {
      background: var(--c-danger);
    }
  }
  .uq-pct {
    font-size: 0.7rem;
    color: var(--c-muted);
  }
}

/* ── Masonry (gallery style) ── */
.ml-masonry {
  columns: 4 220px;
  column-gap: var(--sp-3);
  @media (max-width: 900px) {
    columns: 3 160px;
  }
  @media (max-width: 600px) {
    columns: 2 140px;
  }
}

.ml-item {
  break-inside: avoid;
  position: relative;
  margin-bottom: var(--sp-3);
  border-radius: var(--r-xl);
  overflow: hidden;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--c-border);
  &:hover .ml-overlay {
    opacity: 1;
  }
  &:hover .ml-img {
    transform: scale(1.03);
  }
}

.ml-img {
  width: 100%;
  display: block;
  transition: transform 0.35s ease;
}

.ml-icon {
  width: 100%;
  aspect-ratio: 4/3;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.5rem;
  &--audio {
    background: rgba(236, 72, 153, 0.12);
    color: #f472b6;
  }
  &--doc {
    background: rgba(59, 130, 246, 0.12);
    color: #60a5fa;
  }
  &--broken {
    background: rgba(255, 255, 255, 0.04);
    color: var(--c-muted);
  }
}

.select-count {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--c-text);
}

.ml-item--selected {
  outline: 2px solid var(--c-accent);
  outline-offset: -2px;
}

.ml-select-check {
  position: absolute;
  top: var(--sp-2);
  left: var(--sp-2);
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.6);
  pointer-events: none;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
  &.active {
    color: var(--c-accent);
  }
}

.ml-play-badge {
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
  pointer-events: none;
}

.ml-overlay {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity var(--t-fast);
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.45) 0%,
    transparent 35%,
    transparent 60%,
    rgba(0, 0, 0, 0.6) 100%
  );
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: var(--sp-2);
}

.ml-overlay-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--sp-2);
}

.ml-badge {
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  color: #fff;
  font-size: 0.6rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: var(--r-full);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  flex-shrink: 0;
}

.ml-actions {
  display: flex;
  gap: var(--sp-1);
}

.ml-btn {
  width: 30px;
  height: 30px;
  border-radius: var(--r-md);
  cursor: pointer;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(6px);
  transition: background var(--t-fast);
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
  &--danger {
    background: rgba(248, 113, 113, 0.2);
    border-color: rgba(248, 113, 113, 0.35);
    color: #fca5a5;
  }
  &--danger:hover {
    background: rgba(248, 113, 113, 0.45);
  }
}

.ml-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--sp-2) var(--sp-3);
  background: linear-gradient(to top, rgba(0, 0, 0, 0.72), transparent);
  pointer-events: none;
}
.ml-caption-name {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ml-caption-size {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.6);
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-4);
}
.pg-info {
  font-size: 0.875rem;
  color: var(--c-muted);
}

.drawer-form {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
}
.drawer-footer-btns {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--sp-3);
  width: 100%;
}

.media-edit-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-4);
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--r-lg);
  border: 1px solid var(--c-border);
  img {
    width: 100%;
    max-height: 200px;
    object-fit: contain;
    border-radius: var(--r-md);
    display: block;
  }
}
.media-edit-icon {
  font-size: 3rem;
  color: var(--c-muted);
}
.mc-name-sm {
  font-size: 0.8125rem;
  color: var(--c-muted);
  text-align: center;
  word-break: break-all;
}
</style>
