<template>
  <Teleport to="body">
    <Transition name="mv">
      <div v-if="modelValue" class="mv-backdrop" @click.self="close" @keydown.esc="close">

        <!-- Empty guard -->
        <div v-if="!items.length" class="mv-empty">
          <i class="ri-image-off-line" style="font-size:3rem;color:rgba(255,255,255,.3)" />
          <p style="color:rgba(255,255,255,.4);margin:8px 0 0">No media to display</p>
          <button class="mv-btn mv-close" style="margin-top:16px" @click="close"><i class="ri-close-line" /> Close</button>
        </div>

        <template v-else>
        <!-- Header -->
        <div class="mv-header">
          <div class="mv-header-info">
            <span class="mv-title">{{ current?.altText || current?.fileName || 'Media' }}</span>
            <span class="mv-meta">{{ indexLabel }} · {{ current?.mediaType ?? 'FILE' }}</span>
          </div>
          <div class="mv-header-actions">
            <button v-if="current?.fileUrl" class="mv-btn" :title="downloading ? 'Downloading…' : 'Download'" :disabled="downloading" @click="downloadFile">
              <i v-if="downloading" class="mv-spin ri-loader-4-line" />
              <i v-else class="ri-download-line" />
            </button>
            <button v-if="current?.fileUrl" class="mv-btn" :title="urlCopied ? 'Copied!' : 'Copy URL'" @click="copyUrl">
              <i v-if="urlCopied" class="ri-check-line" style="color:#4ade80" />
              <i v-else class="ri-link" />
            </button>
            <a v-if="current?.fileUrl" :href="current.fileUrl" target="_blank" class="mv-btn" title="Open in new tab">
              <i class="ri-external-link-line" />
            </a>
            <button class="mv-btn mv-close" @click="close" title="Close">
              <i class="ri-close-line" />
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="mv-body">
          <!-- Prev -->
          <button v-if="items.length > 1" class="mv-nav mv-prev" @click="prev">
            <i class="ri-arrow-left-s-line" />
          </button>

          <!-- Media -->
          <div class="mv-media">

            <!-- Loading spinner -->
            <div v-if="mediaLoading" class="mv-loading">
              <i class="ri-loader-4-line mv-spin" />
            </div>

            <!-- IMAGE -->
            <template v-else-if="isImage">
              <!-- Broken image error -->
              <div v-if="imgBroken" class="mv-error">
                <i class="ri-image-off-line" style="font-size:3rem;color:rgba(255,255,255,.3)" />
                <p>Failed to load image</p>
                <a v-if="current.fileUrl" :href="current.fileUrl" target="_blank" class="mv-doc-btn mv-doc-btn-primary">
                  <i class="ri-external-link-line" /> Open directly
                </a>
              </div>
              <template v-else>
                <RImage
                  :key="current.fileUrl"
                  :src="current.fileUrl"
                  :alt="current.altText || current.fileName"
                  class="mv-img"
                  :style="imgStyle"
                  @load="onImgLoad"
                  @error="imgBroken = true"
                  @wheel.prevent="onWheel"
                  @mousedown="onDragStart"
                  @touchstart.passive="onTouchStart"
                />
                <div class="mv-zoom-controls">
                  <button class="mv-zoom-btn" @click="zoomOut" title="Zoom out"><i class="ri-zoom-out-line" /></button>
                  <span class="mv-zoom-label">{{ Math.round(zoom * 100) }}%</span>
                  <button class="mv-zoom-btn" @click="zoomIn" title="Zoom in"><i class="ri-zoom-in-line" /></button>
                  <button class="mv-zoom-btn" @click="resetZoom" title="Reset"><i class="ri-refresh-line" /></button>
                </div>
              </template>
            </template>

            <!-- VIDEO -->
            <template v-else-if="isVideo">
              <div v-if="videoBroken" class="mv-error">
                <i class="ri-video-off-line" style="font-size:3rem;color:rgba(255,255,255,.3)" />
                <p>Failed to load video</p>
                <a v-if="current.fileUrl" :href="current.fileUrl" download class="mv-doc-btn mv-doc-btn-primary">
                  <i class="ri-download-line" /> Download
                </a>
              </div>
              <template v-else>
                <video
                  :key="current.fileUrl"
                  :src="current.fileUrl"
                  class="mv-video"
                  :style="imgStyle"
                  controls
                  autoplay
                  @error="videoBroken = true"
                  @click.stop
                  @wheel.prevent="onWheel"
                />
                <div class="mv-zoom-controls">
                  <button class="mv-zoom-btn" @click="zoomOut" title="Zoom out"><i class="ri-zoom-out-line" /></button>
                  <span class="mv-zoom-label">{{ Math.round(zoom * 100) }}%</span>
                  <button class="mv-zoom-btn" @click="zoomIn" title="Zoom in"><i class="ri-zoom-in-line" /></button>
                  <button class="mv-zoom-btn" @click="resetZoom" title="Reset"><i class="ri-refresh-line" /></button>
                </div>
              </template>
            </template>

            <!-- AUDIO -->
            <template v-else-if="isAudio">
              <div class="mv-audio-wrap">
                <i class="ri-music-2-line mv-audio-icon" />
                <p class="mv-audio-name">{{ current.fileName || current.altText || 'Audio file' }}</p>
                <audio
                  :key="current.fileUrl"
                  :src="current.fileUrl"
                  controls
                  autoplay
                  class="mv-audio"
                  @error="audioBroken = true"
                />
                <p v-if="audioBroken" class="mv-error-inline"><i class="ri-error-warning-line" /> Failed to load audio</p>
              </div>
            </template>

            <!-- DOCUMENT / PDF -->
            <template v-else-if="isDocument">
              <div class="mv-doc-wrap">
                <i class="mv-doc-icon" :class="docIcon" />
                <p class="mv-doc-name">{{ current.fileName || current.altText || 'Document' }}</p>
                <p v-if="current.fileSize" class="mv-doc-size">{{ formatSize(current.fileSize) }}</p>
                <div class="mv-doc-actions">
                  <a :href="current.fileUrl" target="_blank" class="mv-doc-btn">
                    <i class="ri-eye-line" /> Preview
                  </a>
                  <button class="mv-doc-btn mv-doc-btn-primary" :disabled="downloading" @click="downloadFile">
                    <i v-if="downloading" class="mv-spin ri-loader-4-line" /><i v-else class="ri-download-line" /> Download
                  </button>
                </div>
              </div>
            </template>

            <!-- UNKNOWN -->
            <template v-else>
              <div class="mv-unknown">
                <i class="ri-file-unknow-line mv-unknown-icon" />
                <p>{{ current.fileName || 'Unknown file' }}</p>
                <p v-if="!current.fileUrl" style="color:rgba(255,255,255,.35);font-size:.8rem">No download URL available</p>
                <a v-if="current.fileUrl" :href="current.fileUrl" download class="mv-doc-btn mv-doc-btn-primary">
                  <i class="ri-download-line" /> Download
                </a>
              </div>
            </template>
          </div>

          <!-- Next -->
          <button v-if="items.length > 1" class="mv-nav mv-next" @click="next">
            <i class="ri-arrow-right-s-line" />
          </button>
        </div>

        <!-- Thumbnails strip -->
        <div v-if="items.length > 1" class="mv-strip">
          <div
            v-for="(item, i) in items"
            :key="item.id || i"
            class="mv-thumb"
            :class="{ active: i === currentIndex }"
            @click="currentIndex = i; resetZoom()"
          >
            <!-- image or video with thumbnail -->
            <RImage
              v-if="item.thumbnailUrl || isImageType(item)"
              :src="item.thumbnailUrl || item.fileUrl"
              :alt="item.altText"
              @error="(e) => (e.target as HTMLImageElement).style.display = 'none'"
            />
            <!-- video without thumbnail — seek to 0.1s on loadedmetadata to show first frame -->
            <video
              v-else-if="resolveType(item) === 'video'"
              :src="item.fileUrl"
              class="mv-thumb-video"
              preload="metadata"
              muted
              playsinline
              @loadedmetadata="(e) => { (e.target as HTMLVideoElement).currentTime = 0.1 }"
            />
            <span v-else class="mv-thumb-icon"><i :class="thumbIcon(item)" /></span>
          </div>
        </div>
        </template><!-- end v-else (items not empty) -->
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface MediaItem {
  id?: string
  fileUrl: string
  thumbnailUrl?: string
  fileName?: string
  altText?: string
  mediaType?: string   // IMAGE | VIDEO | AUDIO | DOCUMENT
  mimeType?: string
  fileSize?: number
}

const props = defineProps<{
  modelValue: boolean
  items: MediaItem[]
  index?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
}>()

// ── State ──────────────────────────────────────────────────
const currentIndex = ref(props.index ?? 0)
watch(() => props.index, (v) => { if (v !== undefined) currentIndex.value = v })
watch(() => props.modelValue, (v) => { if (v) { zoom.value = 1; offset.value = { x: 0, y: 0 }; resetErrors() } })

// Error / loading states — reset on each item change
const imgBroken   = ref(false)
const videoBroken = ref(false)
const audioBroken = ref(false)
const mediaLoading = ref(false)

const resetErrors = () => { imgBroken.value = false; videoBroken.value = false; audioBroken.value = false }

watch(currentIndex, () => { resetErrors(); resetZoom() })

const current = computed(() => props.items[currentIndex.value] ?? null)
const indexLabel = computed(() => `${currentIndex.value + 1} / ${props.items.length}`)

// ── Type detection ──────────────────────────────────────────
const resolveType = (item: MediaItem) => {
  const mt = (item.mediaType ?? '').toUpperCase()
  if (mt === 'IMAGE') return 'image'
  if (mt === 'VIDEO') return 'video'
  if (mt === 'AUDIO') return 'audio'
  if (mt === 'DOCUMENT') return 'document'
  // fallback via mimeType
  const mime = (item.mimeType ?? '').toLowerCase()
  if (mime.startsWith('image/')) return 'image'
  if (mime.startsWith('video/')) return 'video'
  if (mime.startsWith('audio/')) return 'audio'
  if (mime.includes('pdf') || mime.includes('word') || mime.includes('sheet') || mime.includes('document')) return 'document'
  // fallback via extension
  const ext = (item.fileUrl ?? '').split('.').pop()?.toLowerCase() ?? ''
  if (['jpg','jpeg','png','gif','webp','svg','avif','bmp'].includes(ext)) return 'image'
  if (['mp4','webm','ogg','mov','avi'].includes(ext)) return 'video'
  if (['mp3','wav','ogg','aac','flac'].includes(ext)) return 'audio'
  if (['pdf','doc','docx','xls','xlsx','ppt','pptx','txt'].includes(ext)) return 'document'
  return 'unknown'
}

const currentType = computed(() => resolveType(current.value ?? {} as MediaItem))
const isImage    = computed(() => currentType.value === 'image')
const isVideo    = computed(() => currentType.value === 'video')
const isAudio    = computed(() => currentType.value === 'audio')
const isDocument = computed(() => currentType.value === 'document')
const isImageType = (item: MediaItem) => resolveType(item) === 'image'

const docIcon = computed(() => {
  const ext = (current.value?.fileUrl ?? '').split('.').pop()?.toLowerCase() ?? ''
  if (ext === 'pdf') return 'ri-file-pdf-2-line'
  if (['doc','docx'].includes(ext)) return 'ri-file-word-2-line'
  if (['xls','xlsx'].includes(ext)) return 'ri-file-excel-2-line'
  if (['ppt','pptx'].includes(ext)) return 'ri-file-ppt-2-line'
  return 'ri-file-text-line'
})

const thumbIcon = (item: MediaItem) => {
  const t = resolveType(item)
  if (t === 'video')    return 'ri-video-line'
  if (t === 'audio')    return 'ri-music-2-line'
  if (t === 'document') return 'ri-file-text-line'
  return 'ri-file-unknow-line'
}

// ── Navigation ──────────────────────────────────────────────
const prev = () => {
  currentIndex.value = (currentIndex.value - 1 + props.items.length) % props.items.length
  resetZoom()
}
const next = () => {
  currentIndex.value = (currentIndex.value + 1) % props.items.length
  resetZoom()
}
const close = () => emit('update:modelValue', false)

// ── Keyboard ────────────────────────────────────────────────
const onKey = (e: KeyboardEvent) => {
  if (!props.modelValue) return
  if (e.key === 'Escape')     close()
  if (e.key === 'ArrowLeft')  prev()
  if (e.key === 'ArrowRight') next()
  if (e.key === '+')          zoomIn()
  if (e.key === '-')          zoomOut()
}
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))

// ── Zoom & Pan ──────────────────────────────────────────────
const zoom   = ref(1)
const offset = ref({ x: 0, y: 0 })

const imgStyle = computed(() => ({
  transform: `scale(${zoom.value}) translate(${offset.value.x / zoom.value}px, ${offset.value.y / zoom.value}px)`,
  cursor: zoom.value > 1 ? 'grab' : 'default',
}))

const zoomIn  = () => { zoom.value = Math.min(zoom.value + 0.25, 5) }
const zoomOut = () => { zoom.value = Math.max(zoom.value - 0.25, 0.5); if (zoom.value <= 1) offset.value = { x: 0, y: 0 } }
const resetZoom = () => { zoom.value = 1; offset.value = { x: 0, y: 0 } }
const onWheel = (e: WheelEvent) => { e.deltaY < 0 ? zoomIn() : zoomOut() }
const onImgLoad = () => { zoom.value = 1; offset.value = { x: 0, y: 0 } }

// Drag to pan
let dragging = false
let dragStart = { x: 0, y: 0 }
const onDragStart = (e: MouseEvent) => {
  if (zoom.value <= 1) return
  dragging = true
  dragStart = { x: e.clientX - offset.value.x, y: e.clientY - offset.value.y }
  const onMove = (me: MouseEvent) => {
    if (!dragging) return
    offset.value = { x: me.clientX - dragStart.x, y: me.clientY - dragStart.y }
  }
  const onUp = () => { dragging = false; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
}

// Touch pinch-zoom
let touchDist = 0
const onTouchStart = (e: TouchEvent) => {
  if (e.touches.length === 2) {
    touchDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY)
    const onMove = (te: TouchEvent) => {
      if (te.touches.length !== 2) return
      const d = Math.hypot(te.touches[0].clientX - te.touches[1].clientX, te.touches[0].clientY - te.touches[1].clientY)
      zoom.value = Math.min(Math.max(zoom.value * (d / touchDist), 0.5), 5)
      touchDist = d
    }
    window.addEventListener('touchmove', onMove, { passive: true })
    window.addEventListener('touchend', () => window.removeEventListener('touchmove', onMove), { once: true })
  }
}

// ── Copy URL ────────────────────────────────────────────────
const urlCopied = ref(false)
const copyUrl = async () => {
  const url = current.value?.fileUrl
  if (!url) return
  await navigator.clipboard.writeText(url)
  urlCopied.value = true
  setTimeout(() => { urlCopied.value = false }, 2000)
}

// ── Download ────────────────────────────────────────────────
const downloading = ref(false)

const downloadFile = async () => {
  const url = current.value?.fileUrl
  if (!url) return
  downloading.value = true
  try {
    const res = await fetch(url, { mode: 'cors' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const blob = await res.blob()
    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = current.value?.fileName || url.split('/').pop() || 'download'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(objectUrl)
  } catch {
    // fallback: open in new tab
    window.open(url, '_blank')
  } finally {
    downloading.value = false
  }
}

// ── Utils ───────────────────────────────────────────────────
const formatSize = (bytes: number) => {
  if (bytes < 1024)         return `${bytes} B`
  if (bytes < 1024 * 1024)  return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
</script>

<style scoped>
/* Backdrop */
.mv-backdrop {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,.92);
  display: flex; flex-direction: column;
  outline: none;
}

/* Transition */
.mv-enter-active, .mv-leave-active { transition: opacity 120ms ease; }
.mv-enter-from, .mv-leave-to { opacity: 0; }

/* Header */
.mv-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; flex-shrink: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,.6), transparent);
}
.mv-header-info { display: flex; flex-direction: column; gap: 2px; }
.mv-title { color: #fff; font-size: .9rem; font-weight: 600; max-width: 400px; truncate: ellipsis; white-space: nowrap; overflow: hidden; }
.mv-meta  { color: rgba(255,255,255,.5); font-size: .72rem; text-transform: uppercase; letter-spacing: .05em; }
.mv-header-actions { display: flex; align-items: center; gap: 6px; }
.mv-btn {
  display: flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; border-radius: 8px; border: none;
  background: rgba(255,255,255,.1); color: #fff; cursor: pointer;
  font-size: 1.1rem; text-decoration: none;
  transition: background 120ms;
}
.mv-btn:hover { background: rgba(255,255,255,.2); }
.mv-close:hover { background: rgba(239,68,68,.5); }

/* Body */
.mv-body {
  flex: 1; display: flex; align-items: center; justify-content: center;
  position: relative; overflow: hidden; min-height: 0;
}

/* Nav arrows */
.mv-nav {
  position: absolute; top: 50%; transform: translateY(-50%);
  z-index: 10; width: 44px; height: 44px; border-radius: 50%; border: none;
  background: rgba(255,255,255,.12); color: #fff; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.4rem; transition: background 120ms;
}
.mv-nav:hover { background: rgba(255,255,255,.25); }
.mv-prev { left: 16px; }
.mv-next { right: 16px; }

/* Media area */
.mv-media { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; padding: 16px 72px; box-sizing: border-box; }

/* Image */
.mv-img {
  max-width: 100%; max-height: 100%; object-fit: contain;
  border-radius: 4px; transition: transform 80ms ease-out;
  user-select: none; -webkit-user-drag: none;
}

/* Zoom controls */
.mv-zoom-controls {
  position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; gap: 4px;
  background: rgba(0,0,0,.55); backdrop-filter: blur(8px);
  border-radius: 24px; padding: 4px 10px; border: 1px solid rgba(255,255,255,.1);
}
.mv-zoom-btn {
  width: 28px; height: 28px; border-radius: 50%; border: none;
  background: transparent; color: #fff; cursor: pointer; font-size: .9rem;
  display: flex; align-items: center; justify-content: center;
  transition: background 100ms;
}
.mv-zoom-btn:hover { background: rgba(255,255,255,.15); }
.mv-zoom-label { color: rgba(255,255,255,.7); font-size: .72rem; min-width: 38px; text-align: center; }

/* Video */
.mv-video {
  max-width: 100%; max-height: 100%;
  width: auto; height: auto;
  object-fit: contain;
  border-radius: 6px; outline: none;
  display: block;
  transform-origin: center;
  transition: transform 80ms ease-out;
}

/* Audio */
.mv-audio-wrap {
  display: flex; flex-direction: column; align-items: center; gap: 16px;
  background: rgba(255,255,255,.06); border-radius: 16px; padding: 40px 48px;
  border: 1px solid rgba(255,255,255,.1);
}
.mv-audio-icon { font-size: 4rem; color: rgba(255,255,255,.5); }
.mv-audio-name { color: #fff; font-size: .95rem; font-weight: 500; margin: 0; text-align: center; }
.mv-audio { width: 340px; max-width: 80vw; }

/* Document */
.mv-doc-wrap {
  display: flex; flex-direction: column; align-items: center; gap: 14px;
  background: rgba(255,255,255,.06); border-radius: 16px; padding: 48px 56px;
  border: 1px solid rgba(255,255,255,.1); text-align: center;
}
.mv-doc-icon { font-size: 4.5rem; color: rgba(255,255,255,.5); }
.mv-doc-name { color: #fff; font-size: 1rem; font-weight: 500; margin: 0; max-width: 320px; word-break: break-all; }
.mv-doc-size { color: rgba(255,255,255,.4); font-size: .8rem; margin: 0; }
.mv-doc-actions { display: flex; gap: 10px; margin-top: 8px; }
.mv-doc-btn {
  display: flex; align-items: center; gap: 6px; padding: 8px 18px;
  border-radius: 8px; font-size: .85rem; font-weight: 500; text-decoration: none;
  background: rgba(255,255,255,.1); color: #fff; border: 1px solid rgba(255,255,255,.15);
  transition: background 120ms; cursor: pointer;
}
.mv-doc-btn:hover { background: rgba(255,255,255,.2); }
.mv-doc-btn-primary { background: var(--c-accent, #6366f1); border-color: transparent; }
.mv-doc-btn-primary:hover { filter: brightness(1.1); }

/* Unknown */
.mv-unknown { display: flex; flex-direction: column; align-items: center; gap: 12px; }
.mv-unknown-icon { font-size: 4rem; color: rgba(255,255,255,.4); }
.mv-unknown p { color: rgba(255,255,255,.6); margin: 0; }

/* Thumbnail strip */
.mv-strip {
  flex-shrink: 0; display: flex; gap: 6px; padding: 10px 16px;
  overflow-x: auto; justify-content: center;
  background: linear-gradient(to top, rgba(0,0,0,.6), transparent);
  scrollbar-width: thin; scrollbar-color: rgba(255,255,255,.2) transparent;
}
.mv-thumb {
  width: 52px; height: 52px; border-radius: 6px; flex-shrink: 0; cursor: pointer;
  border: 2px solid transparent; overflow: hidden;
  background: rgba(255,255,255,.08); display: flex; align-items: center; justify-content: center;
  transition: border-color 120ms, transform 120ms;
}
.mv-thumb:hover { transform: scale(1.05); }
.mv-thumb.active { border-color: var(--c-accent, #6366f1); }
.mv-thumb img, .mv-thumb-video { width: 100%; height: 100%; object-fit: cover; }
.mv-thumb-icon { color: rgba(255,255,255,.5); font-size: 1.2rem; }

/* Empty state */
.mv-empty {
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
}

/* Loading spinner */
.mv-loading {
  display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;
  color: rgba(255,255,255,.4); font-size: 2.5rem;
}
@keyframes mv-spin { to { transform: rotate(360deg); } }
.mv-spin { animation: mv-spin .8s linear infinite; display: inline-block; }

/* Error state */
.mv-error {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  color: rgba(255,255,255,.5); font-size: .9rem; text-align: center;
}
.mv-error-inline {
  color: rgba(239,68,68,.8); font-size: .8rem; margin: 4px 0 0;
  display: flex; align-items: center; gap: 4px;
}
</style>
