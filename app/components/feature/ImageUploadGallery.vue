<script setup>
// components/letter/ImageUploadGallery.vue
// ─────────────────────────────────────────────────────────────────────────────
// Reusable image gallery uploader.
// • Drag-and-drop or click-to-browse
// • Per-image upload progress ring
// • Preview grid with caption input
// • Reorder via drag-and-drop
// • Delete with confirm animation
// • Emits final URL list upward via v-model
//
// Usage:
//   <ImageUploadGallery v-model="letter.gallery" :max="12" :t-by="tBy" />
// ─────────────────────────────────────────────────────────────────────────────
import axios from "axios"

const toast = useToast()
const props = defineProps(['modelValue', 'max', 'uploadUrl', 'tBy'])
const modelValue = computed(() => props.modelValue)
const max = computed(() => props.max)
const uploadUrl = computed(() => props.uploadUrl)
const tBy = computed(() => props.tBy)

const emit = defineEmits(['update:modelValue'])

// ── Local list synced to model ─────────────────────────────────────────────
const images = computed({
  get: () => modelValue.value,
  set: (v) => emit('update:modelValue', v),
})

const canAdd = computed(() => images.value.length < (props.max ?? 12))

// ── Drop zone ──────────────────────────────────────────────────────────────
const dropZoneRef = ref(null)
const isDraggingOver = ref(false)
const fileInputRef   = ref(null)

function onDragOver(e) { e.preventDefault(); isDraggingOver.value = true }
function onDragLeave()            { isDraggingOver.value = false }
function onDrop(e) {
  e.preventDefault()
  isDraggingOver.value = false
  const files = [...(e.dataTransfer?.files ?? [])]
  addFiles(files)
}
function browseFiles() { fileInputRef.value?.click() }
function onFileInput(e) {
  const files = [...((e.target).files ?? [])]
  addFiles(files)
  if (fileInputRef.value) fileInputRef.value.value = ''
}

// ── Add & upload ───────────────────────────────────────────────────────────
function uid() {
  return Math.random().toString(36).slice(2, 10)
}

async function addFiles(files) {
  const MAX_SIZE = 10 * 1024 * 1024;
  const imageFiles = files.filter(file => {
      if (!file.type.startsWith("image/")) return false;

      if (file.size > MAX_SIZE) {
          console.warn(`${file.name} exceeds 10 MB`);
          return false;
      }

      return true;
  });
  for (const file of imageFiles) {
    const id     = uid()
    const localPreview    = URL.createObjectURL(file)
    const entry ={
      id,
      url: '',
      localPreview,
      caption: '',
      fileName: file.name,
      file,
      status: 'uploading',
      progress: 0,
    }

    // Append optimistically, then upload directly to the API (parallel per file)
    images.value = [...images.value, entry]
    uploadFile(id, file)
  }
}

const _apiBase = () => {
  const tmpServer = useCookie('tmp_server').value
  const { config } = helper()
  return (tmpServer || config.apiUrl || '').replace(/\/$/, '')
}

const _resolveUrl = (raw) => {
  if (!raw) return ''
  if (raw.startsWith('http')) return raw
  return _apiBase() + raw
}

async function uploadFile(id, file) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('mediaType', 'IMAGE')
  const entry = images.value.find(i => i.id === id)
  if (entry?.caption) formData.append('altText', entry.caption)
  const eventId = useEventStore().activeEvent?.id
  if (eventId) formData.append('eventId', eventId)

  const endpoint = props.uploadUrl || '/api/v1/media/upload'
  const url = endpoint.startsWith('http') ? endpoint : `${_apiBase()}${endpoint}`
  const token = useCookie('access_token').value

  try {
    const result = await axios.post(url, formData, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      onUploadProgress: (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100)
          updateImage(id, { progress: pct })
        }
      },
    })

    // Backend envelope: { code, message, data: MediaResponse { id, fileUrl, thumbnailUrl, ... }, timestamp }
    const body = result?.data
    const payload = body?.data ?? body
    const rawUrl = payload?.fileUrl ?? payload?.thumbnailUrl ?? payload?.url ?? ''
    if (!rawUrl) throw new Error("Upload response missing 'fileUrl'")

    const img = images.value.find(i => i.id === id);

    if (img?.localPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(img.localPreview);
    }

    updateImage(id, { url: _resolveUrl(rawUrl), file: undefined, localPreview: undefined, status: 'done', progress: 100 })
  } catch (err) {
    const img = images.value.find(i => i.id === id);

    if (img?.localPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(img.localPreview);
    }
    const msg = err?.response?.data?.message ?? err.message
    updateImage(id, { status: 'error', error: msg, progress: 0 })
    toast.add({ title: `Upload failed: ${msg ?? 'Error'}`, color: 'danger' })
  }
}

function updateImage(id, patch) {
  images.value = images.value.map(img =>
    img.id === id ? { ...img, ...patch } : img
  )
}

// ── Delete ────────────────────────────────────────────────────────────────
const deletingId = ref(null)

async function removeImage(id) {
  const img = images.value.find(i => i.id === id);
  if (img?.localPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(img.localPreview);
  }

  deletingId.value = id
  await new Promise(r => setTimeout(r, 280)) // let fade-out play
  images.value = images.value.filter(img => img.id !== id)
  deletingId.value = null
}

// ── Caption update ────────────────────────────────────────────────────────
function updateCaption(id, caption) {
  updateImage(id, { caption })
}

// ── Drag reorder ──────────────────────────────────────────────────────────
const dragSrcId = ref(null)

function onItemDragStart(id) { dragSrcId.value = id }
function onItemDragOver(e, id) {
  e.preventDefault()
  if (!dragSrcId.value || dragSrcId.value === id) return
  const src = images.value.findIndex(i => i.id === dragSrcId.value)
  const dst = images.value.findIndex(i => i.id === id)
  if (src === -1 || dst === -1) return
  const arr = [...images.value]
  const [moved] = arr.splice(src, 1)
  arr.splice(dst, 0, moved)
  images.value = arr
}
function onItemDragEnd() { dragSrcId.value = null }

// ── Cleanup blob URLs on unmount ──────────────────────────────────────────
onUnmounted(() => {
  images.value.forEach(img => {
    if (img.localPreview?.startsWith('blob:')) URL.revokeObjectURL(img.localPreview)
  })
})
</script>

<template>
  <div class="iug-root">
    <!-- ── Drop zone ──────────────────────────────────────────────────── -->
    <div
      v-if="canAdd"
      ref="dropZoneRef"
      class="iug-dropzone"
      :class="{ 'iug-dropzone--over': isDraggingOver }"
      role="button"
      tabindex="0"
      :aria-label="tBy({ en: 'Upload images', km: 'បញ្ចូលរូបភាព' })"
      @click="browseFiles"
      @keydown.enter.space.prevent="browseFiles"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
    >
      <div class="iug-dz-icon">
        <i class="ri-image-add-line" />
      </div>
      <p class="iug-dz-title">
        {{ tBy({ en: 'Drop photos here or click to browse', km: 'ទម្លាក់រូបភាព ឬចុចដើម្បីរើស' }) }}
      </p>
      <p class="iug-dz-sub">
        {{ tBy({ en: 'JPG · PNG · WEBP · up to 10 MB each', km: 'JPG · PNG · WEBP · អតិបរមា 10 MB' }) }}
        <span v-if="props.max"> · {{ images.length }}/{{ props.max }}</span>
      </p>
    </div>

    <!-- Hidden file input -->
    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      multiple
      class="iug-hidden-input"
      @change="onFileInput"
    />

    <!-- ── Gallery grid ───────────────────────────────────────────────── -->
    <div v-if="images.length" class="iug-grid">
      <TransitionGroup name="iug-item">
        <div
          v-for="img in images"
          :key="img.id"
          class="iug-card"
          :class="{
            'iug-card--deleting': deletingId === img.id,
            'iug-card--dragging': dragSrcId === img.id,
          }"
          draggable="true"
          @dragstart="onItemDragStart(img.id)"
          @dragover="onItemDragOver($event, img.id)"
          @dragend="onItemDragEnd"
        >
          <!-- Image preview -->
          <div class="iug-img-wrap">
            <RImage
              :src="img?.url || img?.localPreview || ''"
              :alt="img?.fileName ?? ''"
              class="iug-img"
              loading="lazy"
            />

            <!-- Upload progress overlay -->
            <Transition name="iug-overlay">
              <div v-if="img.status === 'uploading'" class="iug-overlay">
                <!-- SVG progress ring -->
                <svg class="iug-ring" viewBox="0 0 44 44" aria-hidden="true">
                  <circle class="iug-ring-track" cx="22" cy="22" r="18" />
                  <circle
                    class="iug-ring-fill"
                    cx="22" cy="22" r="18"
                    :stroke-dasharray="`${2 * Math.PI * 18}`"
                    :stroke-dashoffset="`${2 * Math.PI * 18 * (1 - img.progress / 100)}`"
                  />
                </svg>
                <span class="iug-pct">{{ img.progress }}%</span>
              </div>
            </Transition>

            <!-- Error state -->
            <div v-if="img.status === 'error'" class="iug-error-overlay">
              <i class="ri-error-warning-fill" />
              <!-- <span>{{ img.error ?? 'Error' }}</span> -->
            </div>

            <!-- Done checkmark flash -->
            <Transition name="iug-done">
              <div v-if="img.status === 'done' && img.progress === 100" class="iug-done-flash">
                <i class="ri-checkbox-circle-fill" />
              </div>
            </Transition>

            <!-- Drag handle -->
            <div class="iug-drag-handle" title="Drag to reorder">
              <i class="ri-drag-move-2-line" />
            </div>

            <!-- Delete button -->
            <RTooltip :text="img.status === 'uploading' ? tBy({ en: 'Uploading…', km: 'កំពុងផ្ទុក…' }) : tBy({ en: 'Remove', km: 'លុប' })">
              <button
                class="iug-del-btn"
                :disabled="img.status === 'uploading'"
                @click.stop="removeImage(img.id)"
              >
                <i class="ri-close-line" />
              </button>
            </RTooltip>
          </div>

          <!-- Caption input -->
          <!-- <input
            :value="img.caption"
            type="text"
            class="iug-caption"
            :placeholder="tBy({ en: 'Add caption…', km: 'បន្ថែមចំណងជើង…' })"
            :disabled="img.status === 'uploading'"
            @input="updateCaption(img.id, ($event.target as HTMLInputElement).value)"
          /> -->
          <div class="iug-file-name" :title="img.fileName">
            <i class="ri-file-image-line" /> <span>{{ img.fileName }}</span>
          </div>

          <!-- Upload status bar -->
          <div
            v-if="img.status === 'uploading'"
            class="iug-status-bar"
          >
            <div class="iug-status-fill" :style="{ width: img.progress + '%' }" />
          </div>
        </div>
      </TransitionGroup>
    </div>

    <!-- Empty state when max reached -->
    <p v-if="!canAdd" class="iug-max-note">
      <i class="ri-information-line" />
      {{ tBy({ en: `Maximum ${props.max} photos reached`, km: `បានដល់អតិបរមា ${props.max} រូប` }) }}
    </p>
  </div>
</template>

<style lang="scss" scoped>
// ── Root ──────────────────────────────────────────────────────────────────
.iug-root {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
}

// ── Drop zone ─────────────────────────────────────────────────────────────
.iug-dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-8) var(--sp-6);
  border: 2px dashed var(--c-border);
  border-radius: var(--r-lg);
  cursor: pointer;
  text-align: center;
  transition: all var(--t-base);
  background: rgba(255,255,255,0.02);
  outline: none;

  &:hover,
  &:focus-visible {
    border-color: var(--c-accent);
    background: rgba(255, 140, 66, 0.04);
  }

  &--over {
    border-color: var(--c-accent);
    background: rgba(255, 140, 66, 0.08);
    transform: scale(1.01);
  }
}

.iug-dz-icon {
  width: 52px; height: 52px;
  border-radius: var(--r-lg);
  background: rgba(255,140,66,0.10);
  color: var(--c-accent);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem;
  margin-bottom: var(--sp-1);
}

.iug-dz-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--c-text);
}

.iug-dz-sub {
  font-size: 0.75rem;
  color: var(--c-muted);
}

.iug-hidden-input {
  position: absolute;
  width: 1px; height: 1px;
  opacity: 0;
  pointer-events: none;
}

// ── Gallery grid ──────────────────────────────────────────────────────────
.iug-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: var(--sp-3);
}

// ── Card ──────────────────────────────────────────────────────────────────
.iug-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: all var(--t-base) var(--ease-out);

  &--deleting { opacity: 0; transform: scale(0.85); }
  &--dragging { opacity: 0.45; }
}

// ── Image wrapper ─────────────────────────────────────────────────────────
.iug-img-wrap {
  position: relative;
  aspect-ratio: 4 / 3;
  border-radius: var(--r-md);
  overflow: hidden;
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--c-border);

  &:hover .iug-drag-handle { opacity: 1; }
  &:hover .iug-del-btn     { opacity: 1; }
}

.iug-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

// ── Upload overlay ────────────────────────────────────────────────────────
.iug-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.iug-ring {
  width: 44px; height: 44px;
}

.iug-ring-track {
  fill: none;
  stroke: rgba(255,255,255,0.15);
  stroke-width: 3;
}

.iug-ring-fill {
  fill: none;
  stroke: var(--c-accent);
  stroke-width: 3;
  stroke-linecap: round;
  transform: rotate(-90deg);
  transform-origin: center;
  transition: stroke-dashoffset 0.2s var(--ease-out);
}

.iug-pct {
  font-size: 11px;
  font-weight: 700;
  color: #fff;
}

// ── Error overlay ─────────────────────────────────────────────────────────
.iug-error-overlay {
  position: absolute;
  inset: 0;
  background: rgba(248,113,113,0.18);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;

  i { font-size: 1.5rem; color: var(--c-danger); }
  span { font-size: 11px; color: var(--c-danger); text-align: center; padding: 0 6px; }
}

// ── Done flash ────────────────────────────────────────────────────────────
.iug-done-flash {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;

  i { font-size: 2rem; color: var(--c-success); filter: drop-shadow(0 0 6px rgba(74,222,128,0.5)); }
}

// ── Drag handle ───────────────────────────────────────────────────────────
.iug-drag-handle {
  position: absolute;
  top: 6px; left: 6px;
  width: 24px; height: 24px;
  border-radius: var(--r-sm);
  background: rgba(0,0,0,0.45);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.875rem;
  cursor: grab;
  opacity: 0;
  transition: opacity var(--t-fast);

  &:active { cursor: grabbing; }
}

// ── Delete button ─────────────────────────────────────────────────────────
.iug-del-btn {
  position: absolute;
  top: 6px; right: 6px;
  width: 24px; height: 24px;
  border-radius: var(--r-sm);
  background: rgba(0,0,0,0.45);
  border: none;
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.875rem;
  cursor: pointer;
  opacity: 0;
  transition: all var(--t-fast);

  &:hover { background: var(--c-danger); }
  &:disabled { cursor: not-allowed; opacity: 0.3 !important; }
}

// ── Caption ───────────────────────────────────────────────────────────────
// .iug-caption {
//   font-size: 11px;
//   color: var(--c-text);
//   background: rgba(255,255,255,0.05);
//   border: 1px solid var(--c-border);
//   border-radius: var(--r-sm);
//   padding: 4px 8px;
//   width: 100%;
//   outline: none;
//   font-family: inherit;
//   transition: border-color var(--t-fast);

//   &::placeholder { color: var(--c-muted); opacity: 0.6; }
//   &:focus { border-color: rgba(255,140,66,0.4); }
// }

// ── Filen name show ───────────────────────────────────────────────────────────────
.iug-file-name {
  display: flex;
  align-items: center;
  gap: 5px;
  width: 100%;
  font-size: 11px;
  color: var(--c-muted);
  padding: 4px 6px;
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--c-border);
  border-radius: var(--r-sm);
  overflow: hidden;

  i {
    flex-shrink: 0;
    color: var(--c-accent);
  }

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

// ── Status bar ────────────────────────────────────────────────────────────
.iug-status-bar {
  height: 3px;
  background: rgba(255,255,255,0.08);
  border-radius: var(--r-full);
  overflow: hidden;
}

.iug-status-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--c-accent), var(--c-accent-2));
  border-radius: var(--r-full);
  transition: width 0.2s var(--ease-out);
}

// ── Max note ──────────────────────────────────────────────────────────────
.iug-max-note {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  font-size: 0.8125rem;
  color: var(--c-muted);
  padding: var(--sp-3) var(--sp-4);
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--c-border);
  border-radius: var(--r-md);
}

// ── Transitions ───────────────────────────────────────────────────────────
.iug-item-enter-active,
.iug-item-leave-active { transition: all var(--t-base) var(--ease-out); }
.iug-item-enter-from   { opacity: 0; transform: scale(0.88) translateY(8px); }
.iug-item-leave-to     { opacity: 0; transform: scale(0.85); }
.iug-item-move         { transition: transform var(--t-base) var(--ease-out); }

.iug-overlay-enter-active,
.iug-overlay-leave-active { transition: opacity var(--t-fast); }
.iug-overlay-enter-from,
.iug-overlay-leave-to     { opacity: 0; }

.iug-done-enter-active { transition: all 0.4s; }
.iug-done-leave-active { transition: all 0.6s; }
.iug-done-enter-from   { opacity: 0; transform: scale(0.5); }
.iug-done-leave-to     { opacity: 0; transform: scale(1.4); }
</style>
