import { ref } from "vue"
import { BrowserMultiFormatReader } from "@zxing/library"

const active = ref(false)
const error = ref<string | null>(null)
const result = ref<string | null>(null)
const stream = ref<MediaStream | null>(null)

let videoEl: HTMLVideoElement | null = null
let codeReader: BrowserMultiFormatReader | null = null
let controls: any = null

async function start(video: HTMLVideoElement) {
  try {
    error.value = null
    result.value = null
    active.value = true
    videoEl = video

    codeReader = new BrowserMultiFormatReader()

    controls = await codeReader.decodeFromVideoDevice(undefined, video, (res, err) => {
      if (res?.getText()) {
        result.value = res.getText()
        stop()
      }
    })
  } catch (e: any) {
    error.value = e?.message || "Scanner init failed"
    active.value = false
  }
}

async function tickNative() {
  if (!active.value || !videoEl) return
  try {
    const detector = new BarcodeDetector({
      formats: ["qr_code", "code_128", "ean_13", "ean_8", "upc_a", "upc_e"]
    })

    const barcodes = await detector.detect(videoEl)
    if (barcodes.length > 0) {
      result.value = barcodes[0].rawValue || ""
      stop()
    }
  } catch (e: any) {
    error.value = e?.message || "Native scanner failed"
    active.value = false
  }
}

function stop() {
  active.value = false

  if (stream.value) {
    stream.value.getTracks().forEach(t => t.stop())
    stream.value = null
  }

  if (videoEl) {
    videoEl.pause()
    videoEl.srcObject = null
  }

  if (controls?.stop) {
    try { controls.stop() } catch {}
  }

  if (codeReader) {
    try { codeReader.reset() } catch {}
    codeReader = null
  }
}

export function useScanner() {
  return { active, error, result, start, stop, tickNative }
}
