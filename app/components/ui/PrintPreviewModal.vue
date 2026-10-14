<script setup lang="ts">
const {
  visible,
  html,
  closePreview,
} = usePrintPreview()

const iframeRef = ref<HTMLIFrameElement>()

const injectHtml = () => {
  const iframe = iframeRef.value
  if (!iframe) return

  const doc = iframe.contentDocument
  if (!doc) return

  doc.open()
  doc.write(html.value)
  doc.close()
}

watch(visible, async (v) => {
  if (v) {
    await nextTick()
    injectHtml()
  }
})

const print = () => {
  iframeRef.value?.contentWindow?.print()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="visible"
        class="ppm-backdrop"
      >
        <div class="ppm-modal">

          <div class="ppm-header">
            <h3>Print Preview</h3>

            <div class="ppm-actions">
              <button @click="print">
                <i class="ri-printer-line" />
                Print
              </button>

              <button @click="closePreview">
                <i class="ri-close-line" />
              </button>
            </div>
          </div>

          <iframe
            ref="iframeRef"
            class="ppm-frame"
          />

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss">
.ppm-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0,0,0,.7);
  backdrop-filter: blur(12px);

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 20px;
}

.ppm-modal {
  width: min(1400px, 100%);
  height: min(95vh, 100%);
  background: var(--c-surface);
  border-radius: 24px;
  overflow: hidden;

  border: 1px solid var(--c-border);

  display: flex;
  flex-direction: column;
}

.ppm-header {
  height: 64px;
  padding: 0 20px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  border-bottom: 1px solid var(--c-border);
}

.ppm-actions {
  display: flex;
  gap: 12px;
}

.ppm-frame {
  flex: 1;
  width: 100%;
  border: 0;
  background: white;
}
</style>


<!-- import { buildHtml } from '~/utils/print/letter'

const { openPreview } = usePrintPreview()

const previewLetter = () => {
  openPreview(buildHtml(letter))
} -->