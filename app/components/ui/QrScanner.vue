<template>
  <div class="qr-scanner-wrap">
    <!-- Toggle button -->
    <button
      class="qr-toggle-btn"
      :class="{ active }"
      @click="toggle"
    >
      <span class="qr-btn-icon">{{ active ? '⏹' : '📷' }}</span>
      {{ active ? 'Stop Camera' : 'Scan with Camera' }}
    </button>

    <!-- Camera view -->
    <div v-if="active" class="qr-video-wrap">
      <video ref="videoEl" class="qr-video" autoplay muted playsinline />

      <!-- Scan overlay -->
      <div class="qr-overlay">
        <div class="qr-frame">
          <span class="qr-corner tl" />
          <span class="qr-corner tr" />
          <span class="qr-corner bl" />
          <span class="qr-corner br" />
          <div class="qr-scan-line" />
        </div>
      </div>

      <!-- Status -->
      <div class="qr-status-wrap">
        <div class="qr-status">{{ status }}</div>
      </div>

      <!-- Bottom controls -->
      <div class="qr-controls">
        <div v-if="zoomSupported" class="qr-zoom-row">
          <button class="qr-zoom-btn" @click="adjustZoom(-0.5)">−</button>
          <input
            type="range"
            class="qr-zoom-slider"
            :min="zoomMin"
            :max="zoomMax"
            :step="zoomStep"
            :value="zoom"
            @input="onZoomSlider"
          />
          <button class="qr-zoom-btn" @click="adjustZoom(0.5)">+</button>
          <span class="qr-zoom-label">{{ zoom.toFixed(1) }}×</span>
        </div>
        <div v-if="cameras.length > 1" class="qr-cam-select-wrap">
          <select v-model="selectedCamera" class="qr-cam-select" @change="restart">
            <option v-for="c in cameras" :key="c.deviceId" :value="c.deviceId">
              {{ c.label || 'Camera ' + (cameras.indexOf(c) + 1) }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="error" class="qr-error">{{ error }}</div>
  </div>
</template>

<script setup>
const emit = defineEmits(['scanned'])

const videoEl        = ref(null)
const active         = ref(false)
const cameras        = ref([])
const selectedCamera = ref('')
const status         = ref('Point at QR code…')
const error          = ref('')

const zoom           = ref(1)
const zoomMin        = ref(1)
const zoomMax        = ref(5)
const zoomStep       = ref(0.1)
const zoomSupported  = ref(false)
let videoTrack       = null
let reader           = null
let controls         = null

async function toggle() {
  active.value ? await stop() : await start()
}

async function start() {
  error.value = ''
  active.value = true
  await nextTick()
  try {
    // Require secure context (HTTPS or localhost)
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
      error.value = 'Camera requires HTTPS. Use localhost or a secure connection.'
      active.value = false
      return
    }
    const { BrowserMultiFormatReader } = await import('@zxing/library')
    reader = new BrowserMultiFormatReader()
    // Request camera permission explicitly first so we get a clear error
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    stream.getTracks().forEach(t => t.stop())
    const devices = await reader.listVideoInputDevices()
    cameras.value = devices
    const back = devices.find(d => /back|rear|environment/i.test(d.label))
    selectedCamera.value = back?.deviceId || devices[0]?.deviceId || ''
    await scan()
  } catch (e) {
    active.value = false
    if (e?.name === 'NotAllowedError' || e?.name === 'PermissionDeniedError') {
      error.value = 'Camera permission denied. Please allow camera access in your browser settings.'
    } else if (e?.name === 'NotFoundError' || e?.name === 'DevicesNotFoundError') {
      error.value = 'No camera found on this device.'
    } else if (e?.name === 'NotReadableError' || e?.name === 'TrackStartError') {
      error.value = 'Camera is in use by another app. Close it and try again.'
    } else {
      error.value = e?.message || 'Camera access denied or not available.'
    }
  }
}

async function scan() {
  if (!videoEl.value) return
  status.value = 'Point at QR code…'
  zoomSupported.value = false
  try {
    controls = await reader.decodeFromVideoDevice(
      selectedCamera.value || undefined,
      videoEl.value,
      (result) => {
        if (result) {
          status.value = '✅ Scanned!'
          emit('scanned', result.getText())
          stop()
        }
      }
    )
    await nextTick()
    initZoom()
  } catch (e) {
    error.value = 'Could not start camera: ' + e.message
    active.value = false
  }
}

function initZoom() {
  try {
    const stream = videoEl.value?.srcObject
    if (!stream) return
    videoTrack = stream.getVideoTracks()[0]
    if (!videoTrack) return
    const caps = videoTrack.getCapabilities?.()
    if (caps?.zoom) {
      zoomMin.value  = caps.zoom.min ?? 1
      zoomMax.value  = caps.zoom.max ?? 5
      zoomStep.value = caps.zoom.step ?? 0.1
      zoom.value     = videoTrack.getSettings?.()?.zoom ?? caps.zoom.min ?? 1
      zoomSupported.value = true
    }
  } catch {}
}

async function applyZoom(val) {
  if (!videoTrack || !zoomSupported.value) return
  const clamped = Math.min(zoomMax.value, Math.max(zoomMin.value, val))
  zoom.value = clamped
  try { await videoTrack.applyConstraints({ advanced: [{ zoom: clamped }] }) } catch {}
}

function onZoomSlider(e) { applyZoom(parseFloat(e.target.value)) }
function adjustZoom(delta) { applyZoom(zoom.value + delta) }

async function restart() {
  controls?.stop()
  videoTrack = null
  zoomSupported.value = false
  await nextTick()
  await scan()
}

async function stop() {
  controls?.stop()
  controls = null
  videoTrack = null
  zoomSupported.value = false
  active.value = false
  status.value = 'Point at QR code…'
  zoom.value = 1
}

onUnmounted(() => { controls?.stop() })
</script>

<style lang="scss">
.qr-scanner-wrap { display: flex; flex-direction: column; gap: var(--sp-3); }

.qr-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  border-radius: var(--r-lg);
  border: 1px solid rgba(212,168,67,0.25);
  background: rgba(212,168,67,0.1);
  color: #d4a843;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all var(--t-fast);
  align-self: flex-start;
  &:hover { background: rgba(212,168,67,0.18); }
  &.active { background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.25); color: #f87171; }
}

.qr-btn-icon { font-size: 1rem; }

.qr-video-wrap {
  position: relative;
  border-radius: var(--r-xl);
  overflow: hidden;
  background: #000;
}

.qr-video { width: 100%; height: auto; display: block; }

.qr-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.qr-frame {
  width: 200px;
  height: 200px;
  position: relative;
}

.qr-corner {
  position: absolute;
  width: 28px;
  height: 28px;
  border-color: #d4a843;
  border-style: solid;
  &.tl { top: 0; left: 0; border-width: 2px 0 0 2px; border-radius: 4px 0 0 0; }
  &.tr { top: 0; right: 0; border-width: 2px 2px 0 0; border-radius: 0 4px 0 0; }
  &.bl { bottom: 0; left: 0; border-width: 0 0 2px 2px; border-radius: 0 0 0 4px; }
  &.br { bottom: 0; right: 0; border-width: 0 2px 2px 0; border-radius: 0 0 4px 0; }
}

.qr-scan-line {
  position: absolute;
  left: 4px;
  right: 4px;
  height: 2px;
  background: rgba(212,168,67,0.7);
  animation: qrScanMove 2s ease-in-out infinite;
  top: 0;
}

@keyframes qrScanMove {
  0%   { top: 8px; opacity: 1; }
  50%  { top: calc(100% - 8px); opacity: 0.6; }
  100% { top: 8px; opacity: 1; }
}

.qr-status-wrap {
  position: absolute;
  top: 10px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  pointer-events: none;
}

.qr-status {
  background: rgba(0,0,0,0.6);
  color: rgba(255,255,255,0.7);
  font-size: 0.75rem;
  border-radius: var(--r-full);
  padding: 3px 12px;
}

.qr-controls {
  position: absolute;
  bottom: 10px;
  left: 0;
  right: 0;
  padding: 0 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.qr-zoom-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.qr-zoom-btn {
  width: 28px;
  height: 28px;
  border-radius: var(--r-full);
  background: rgba(0,0,0,0.6);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.15);
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.qr-zoom-slider {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  border-radius: 2px;
  background: rgba(255,255,255,0.2);
  outline: none;
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #d4a843;
    cursor: pointer;
    border: 2px solid #000;
  }
}

.qr-zoom-label { color: rgba(255,255,255,0.6); font-size: 0.75rem; width: 36px; text-align: right; }

.qr-cam-select-wrap { display: flex; justify-content: center; }

.qr-cam-select {
  background: rgba(0,0,0,0.7);
  color: rgba(255,255,255,0.8);
  font-size: 0.75rem;
  border-radius: var(--r-lg);
  padding: 4px 10px;
  border: 1px solid rgba(255,255,255,0.15);
  cursor: pointer;
  font-family: inherit;
}

.qr-error { font-size: 0.8125rem; color: var(--c-danger); }
</style>
