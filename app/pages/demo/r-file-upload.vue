<script setup>
// pages/demo/file-upload.vue
// RFileUpload showcase: all modes, progress, retry, crop, compress
import { ref } from 'vue'
// import { useUIStore } from '~/stores/ui'

const ui = useUIStore()
const toast = useRToast()

// ── 1. Basic ──────────────────────────────────────────────────────────────
const basicFiles = ref([])

// ── 2. Multiple images with progress simulation ───────────────────────────
const uploadFiles = ref([])

// Simulated upload function — replace with real $fetch / axios
async function simulateUpload(file, onProgress) {
  return new Promise((resolve, reject) => {
    let pct = 0
    const id = setInterval(() => {
      pct += Math.random() * 18 + 5
      if (pct >= 100) {
        clearInterval(id)
        // ~10% chance of failure
        if (Math.random() < 0.1) {
          reject(new Error('Network error — try again'))
        } else {
          onProgress(100)
          resolve()
        }
      } else {
        onProgress(Math.min(pct, 98))
      }
    }, 160)
  })
}

// ── 3. With compression ───────────────────────────────────────────────────
const compressFiles = ref([])

// ── 4. With crop popup ────────────────────────────────────────────────────
const cropFiles = ref([])

// ── 5. Dimension limits ───────────────────────────────────────────────────
const dimFiles = ref([])

// ── 6. List layout ────────────────────────────────────────────────────────
const listFiles  = ref([])
const fileUpRef  = ref(null)

// ── 7. Non-interactive drop (actions slot) ────────────────────────────────
const niFiles = ref([])

// ── 8. Real API form integration ─────────────────────────────────────────
const formFiles = ref([])
const formTitle = ref('')
const formDesc  = ref('')

async function submitForm() {
  if (!formTitle.value) { ui.error('Validation', 'Title is required'); return }
  if (!formFiles.value.length) { ui.error('Validation', 'Please attach at least one file'); return }
  toast.add('Submitted!', `${formTitle.value} · ${formFiles.value.length} file(s)`)
  formFiles.value = []
  formTitle.value = ''
  formDesc.value  = ''
}

// ── 9. Expose API demo ────────────────────────────────────────────────────
const exposeRef  = ref(null)

function openViaRef()  { exposeRef.value?.open() }
function clearViaRef() { exposeRef.value?.clear() }
function retryViaRef() { exposeRef.value?.retry() }


definePageMeta(({ layout: 'navbar'}))
</script>

<template>
  <div class="dfu">

    <div class="dfu__page-header">
      <div class="dfu__page-header-left">
        <span class="dfu__page-icon"><i class="ri-upload-cloud-2-line" /></span>
        <div>
          <h1 class="dfu__page-title">RFileUpload</h1>
          <p class="dfu__page-sub">All modes · progress · retry · crop · compress · glass</p>
        </div>
      </div>
    </div>

    <div class="dfu__grid">

      <!-- 1 ── Basic ──────────────────────────────────────── -->
      <div class="dfu__card">
        <p class="dfu__card-title"><i class="ri-information-line" /> Basic</p>
        <RFileUpload
          v-model="basicFiles"
          label="Drop files here"
          description="Any file type accepted"
          multiple
        />
      </div>

      <!-- 2 ── With real upload progress + retry ───────────── -->
      <div class="dfu__card dfu__card--full">
        <p class="dfu__card-title"><i class="ri-loader-4-line" /> Upload progress + retry</p>
        <p class="dfu__card-sub">~10% chance of failure per file — triggers retry button</p>
        <RFileUpload
          v-model="uploadFiles"
          icon="i-lucide-image"
          label="Drop images here"
          description="SVG, PNG, JPG or GIF (max 2 MB each)"
          accept="image/*"
          :max-size="2097152"
          multiple
          :upload-fn="simulateUpload"
        />
      </div>

      <!-- 3 ── Frontend compression ────────────────────────── -->
      <div class="dfu__card">
        <p class="dfu__card-title"><i class="ri-compress-right-line" /> Frontend compression</p>
        <p class="dfu__card-sub">compress: true · quality 0.75 · max 1280px</p>
        <RFileUpload
          v-model="compressFiles"
          label="Drop images to compress"
          description="Images are resized + compressed before upload"
          accept="image/*"
          multiple
          compress
          :compress-quality="0.75"
          :compress-max-px="1280"
        />
      </div>

      <!-- 4 ── Crop popup ──────────────────────────────────── -->
      <div class="dfu__card">
        <p class="dfu__card-title"><i class="ri-crop-line" /> Crop before upload</p>
        <p class="dfu__card-sub">crop: true · cropAspect: 1 (square)</p>
        <RFileUpload
          v-model="cropFiles"
          label="Drop an image to crop"
          accept="image/*"
          :crop="true"
          :crop-aspect="1"
        />
      </div>

      <!-- 5 ── Dimension limits ────────────────────────────── -->
      <div class="dfu__card">
        <p class="dfu__card-title"><i class="ri-artboard-2-line" /> Dimension limits</p>
        <p class="dfu__card-sub">maxWidth: 2000px · minWidth: 200px · maxHeight: 2000px</p>
        <RFileUpload
          v-model="dimFiles"
          label="Drop image"
          description="Must be 200–2000 px wide/tall"
          accept="image/*"
          :max-width="2000"
          :max-height="2000"
          :min-width="200"
          :min-height="200"
        />
      </div>

      <!-- 6 ── List layout + exposed API ──────────────────── -->
      <div class="dfu__card dfu__card--full">
        <p class="dfu__card-title"><i class="ri-list-check-3" /> List layout + expose API</p>
        <div class="dfu__expose-btns">
          <button class="dfu__btn" @click="openViaRef">
            <i class="ri-folder-open-line" /> Open via ref
          </button>
          <button class="dfu__btn" @click="clearViaRef">
            <i class="ri-delete-bin-line" /> Clear via ref
          </button>
          <button class="dfu__btn" @click="retryViaRef">
            <i class="ri-refresh-line" /> Retry via ref
          </button>
        </div>
        <RFileUpload
          ref="exposeRef"
          v-model="listFiles"
          label="Drop files here"
          description="SVG, PNG, JPG or GIF (max 2 MB)"
          layout="list"
          multiple
          :interactive="false"
          :max-size="2097152"
          :upload-fn="simulateUpload"
        >
          <template #actions="{ open }">
            <button class="dfu__action-btn" @click="open()">
              <i class="ri-upload-2-line" />
              Select files
            </button>
          </template>
          <template #files-bottom="{ removeFile, files }">
            <button
              v-if="files?.length"
              class="dfu__remove-all-btn"
              @click="removeFile()"
            >
              <i class="ri-delete-bin-2-line" />
              Remove all {{ files.length }} files
            </button>
          </template>
        </RFileUpload>
      </div>

      <!-- 7 ── Non-interactive (custom actions slot) ────────── -->
      <div class="dfu__card">
        <p class="dfu__card-title"><i class="ri-cursor-line" /> Non-interactive dropzone</p>
        <p class="dfu__card-sub">interactive: false · custom #actions slot</p>
        <RFileUpload
          v-model="niFiles"
          label="Upload your files"
          description="JPG, PNG up to 5 MB"
          :interactive="false"
          multiple
          class="dfu__uploader"
        >
          <template #actions="{ open }">
            <div class="dfu__ni-actions">
              <button class="dfu__action-btn dfu__action-btn--accent" @click="open()">
                <i class="ri-upload-cloud-2-line" />
                Browse files
              </button>
              <span class="dfu__ni-or">or drag and drop</span>
            </div>
          </template>
        </RFileUpload>
      </div>

      <!-- 8 ── Form integration ────────────────────────────── -->
      <div class="dfu__card dfu__card--full">
        <p class="dfu__card-title"><i class="ri-file-add-line" /> In a form</p>
        <form class="dfu__form" @submit.prevent="submitForm">

          <div class="dfu__form-row">
            <div class="dfu__form-field">
              <label class="dfu__form-label">Report title *</label>
              <input
                v-model="formTitle"
                type="text"
                class="dfu__form-input"
                placeholder="Monthly revenue report"
              />
            </div>
            <div class="dfu__form-field">
              <label class="dfu__form-label">Description</label>
              <input
                v-model="formDesc"
                type="text"
                class="dfu__form-input"
                placeholder="Optional notes…"
              />
            </div>
          </div>

          <div class="dfu__form-field">
            <label class="dfu__form-label">Attachments *</label>
            <RFileUpload
              v-model="formFiles"
              label="Attach files"
              description="PDF, DOCX, XLSX or images (max 10 MB each)"
              multiple
              :max-size="10485760"
              compress
              :compress-quality="0.85"
            />
          </div>

          <div class="dfu__form-footer">
            <button type="submit" class="dfu__action-btn dfu__action-btn--accent">
              <i class="ri-send-plane-line" />
              Submit report
            </button>
            <button
              type="button"
              class="dfu__btn"
              @click="formFiles = []; formTitle = ''; formDesc = ''"
            >
              <i class="ri-refresh-line" />
              Reset
            </button>
          </div>
        </form>
      </div>

    </div>
  </div>
</template>

<style lang="scss" scoped>
.dfu {
  padding:        var(--space-8, 32px);
  max-width:      960px;
  margin:         0 auto;
  display:        flex;
  flex-direction: column;
  gap:            var(--space-5, 20px);
  font-family:    var(--font-fallback, 'Inter', system-ui, sans-serif);

  @include mobile-only { padding: 16px; }

  // ── Page header ──
  &__page-header {
    display:     flex;
    align-items: center;
    gap:         var(--space-4, 16px);
  }

  &__page-header-left {
    display:     flex;
    align-items: center;
    gap:         var(--space-3, 12px);
  }

  &__page-icon {
    width:         52px;
    height:        52px;
    border-radius: 50%;
    background:    rgba(255,140,66,0.1);
    color:         var(--c-accent, #ff8c42);
    font-size:     1.5rem;
    @include flex-center;
    box-shadow:    0 0 24px rgba(255,140,66,0.15);
  }

  &__page-title {
    font-size:   1.4rem;
    font-weight: 700;
    color:       var(--c-text, #1a1510);
    margin:      0;
  }

  &__page-sub {
    font-size: 0.78rem;
    color:     var(--c-muted, #8a7f72);
    margin:    2px 0 0;
  }

  // ── Grid ──
  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap:     var(--space-4, 16px);
    align-items: start;

    @include mobile-only { grid-template-columns: 1fr; }
  }

  // ── Card ──
  &__card {
    display:        flex;
    flex-direction: column;
    gap:            var(--space-3, 12px);
    padding:        var(--space-4, 16px);
    background:     var(--c-surface, #fff);
    border:         1px solid var(--c-border, rgba(255,140,66,0.16));
    border-radius:  var(--radius-lg, 16px);

    &--full { grid-column: 1 / -1; }
  }

  &__card-title {
    font-size:   0.85rem;
    font-weight: 600;
    color:       var(--c-text, #1a1510);
    display:     flex;
    align-items: center;
    gap:         6px;
    margin:      0;
    i { color: var(--c-accent, #ff8c42); }
  }

  &__card-sub {
    font-size: 0.72rem;
    color:     var(--c-muted, #8a7f72);
    margin:    0 0 var(--space-1, 4px);
  }

  // ── Expose buttons ──
  &__expose-btns {
    display:   flex;
    gap:       var(--space-2, 8px);
    flex-wrap: wrap;
  }

  // ── Shared button ──
  &__btn {
    display:       inline-flex;
    align-items:   center;
    gap:           6px;
    padding:       6px 14px;
    border:        1px solid var(--c-border, rgba(255,140,66,0.16));
    border-radius: var(--radius-md, 10px);
    background:    transparent;
    color:         var(--c-muted, #8a7f72);
    font-size:     0.78rem;
    font-family:   inherit;
    cursor:        pointer;
    @include transition(fast);
    &:hover { border-color: var(--c-accent, #ff8c42); color: var(--c-accent, #ff8c42); }
    i { font-size: 0.9rem; }
  }

  &__action-btn {
    display:       inline-flex;
    align-items:   center;
    gap:           8px;
    padding:       8px 18px;
    border:        1px solid var(--c-border, rgba(255,140,66,0.16));
    border-radius: var(--radius-md, 10px);
    background:    transparent;
    color:         var(--c-text, #1a1510);
    font-size:     0.875rem;
    font-weight:   500;
    font-family:   inherit;
    cursor:        pointer;
    @include transition(fast);
    &:hover { border-color: var(--c-accent, #ff8c42); color: var(--c-accent, #ff8c42); }
    i { font-size: 1rem; color: var(--c-accent, #ff8c42); }

    &--accent {
      border-color: var(--c-accent, #ff8c42);
      background:   var(--c-accent, #ff8c42);
      color:        #fff;
      box-shadow:   0 0 16px rgba(255,140,66,0.22);
      &:hover { background: var(--c-accent-2, #ffb347); border-color: var(--c-accent-2, #ffb347); }
      i { color: #fff !important; }
    }
  }

  &__remove-all-btn {
    display:       inline-flex;
    align-items:   center;
    gap:           6px;
    margin-top:    var(--space-2, 8px);
    padding:       6px 14px;
    border:        1px solid rgba(248,113,113,0.25);
    border-radius: var(--radius-md, 10px);
    background:    transparent;
    color:         var(--c-danger, #f87171);
    font-size:     0.78rem;
    font-family:   inherit;
    cursor:        pointer;
    @include transition(fast);
    &:hover { background: rgba(248,113,113,0.08); }
    i { font-size: 0.88rem; }
  }

  &__ni-actions {
    display:        flex;
    flex-direction: column;
    align-items:    center;
    gap:            var(--space-2, 8px);
  }

  &__ni-or {
    font-size: 0.72rem;
    color:     var(--c-muted, #8a7f72);
  }

  // ── Form ──
  &__form {
    display:        flex;
    flex-direction: column;
    gap:            var(--space-4, 16px);
  }

  &__form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-4, 16px);
    @include mobile-only { grid-template-columns: 1fr; }
  }

  &__form-field {
    display:        flex;
    flex-direction: column;
    gap:            var(--space-2, 8px);
  }

  &__form-label {
    font-size:   0.82rem;
    font-weight: 500;
    color:       var(--c-text, #1a1510);
  }

  &__form-input {
    height:        38px;
    padding:       0 var(--space-3, 12px);
    font-family:   inherit;
    font-size:     0.875rem;
    color:         var(--c-text, #1a1510);
    background:    var(--c-surface, #fff);
    border:        1px solid var(--c-border, rgba(255,140,66,0.16));
    border-radius: var(--radius-md, 10px);
    outline:       none;
    @include transition(fast);
    &::placeholder { color: var(--c-muted, #8a7f72); }
    &:focus { border-color: var(--c-accent, #ff8c42); box-shadow: 0 0 0 3px rgba(255,140,66,0.12); }
  }

  &__form-footer {
    display:     flex;
    align-items: center;
    gap:         var(--space-3, 12px);
  }

  &__uploader { min-height: 160px; }
}
</style>