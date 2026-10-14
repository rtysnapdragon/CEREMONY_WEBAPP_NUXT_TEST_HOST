<template>
  <!-- <UCard class="r-editor-demo" :ui="{ body: 'p-0 sm:p-0' }"> -->
    <!-- <template #header> -->
      <div class="r-editor-demo__head">
        <div>
          <h2 class="r-editor-demo__title">Rich Text Editor</h2>
          <p class="r-editor-demo__subtitle">
            AI assist, images (crop + compress + resize), video, documents, mentions, emoji — all in one editor.
          </p>
        </div>

        <div class="r-editor-demo__head-actions">
          <UBadge v-if="uploadedFiles.length" color="neutral" variant="soft" icon="i-lucide-paperclip">
            {{ uploadedFiles.length }} file{{ uploadedFiles.length === 1 ? '' : 's' }}
          </UBadge>
          <UBadge :color="wordCount ? 'primary' : 'neutral'" variant="soft" icon="i-lucide-type">
            {{ wordCount }} words
          </UBadge>
        </div>
      </div>
    <!-- </template> -->

    <!-- ── Editor ─────────────────────────────────────────────────────────── -->
    <REditorDev1
      ref="editorRef"
      v-model="content"
      content-type="markdown"
      :placeholder="placeholder"
      :mention-items="mentionItems"
      :api="uploadApi"
      :ai-api="aiApi"
      :ai-languages="['English', 'French', 'Spanish', 'German', 'Khmer', 'Japanese']"
      :options="{
        toolbar: true,
        bubbleToolbar: true,
        dragHandle: true,
        suggestionMenu: true,
        mentionMenu: true,
        emojiMenu: true,
        textAlign: true,
        link: true,
        imageUpload: true,
        videoUpload: true,
        fileUpload: true,
        mediaLibrary: true,
        ai: true,
      }"
      :upload-crop="true"
      :upload-crop-shape="'square'"
      :upload-compress="true"
      :upload-compress-quality="0.82"
      :upload-compress-max-px="1920"
      :upload-max-image-size="8 * 1024 * 1024"
      :upload-max-video-size="100 * 1024 * 1024"
      :upload-max-file-size="20 * 1024 * 1024"
      class="r-editor-demo__editor"
      @update:files="uploadedFiles = $event"
      @file-uploaded="onFileEvent('uploaded', $event)"
      @file-changed="onFileEvent('changed', $event)"
      @file-deleted="onFileEvent('deleted', $event)"
      @upload-error="onUploadError"
    />

    <!-- ── Live output — every content type, at once ─────────────────────── -->
    <!-- <template #footer> -->
      <div class="r-editor-demo__output">
        <UTabs v-model="activeFormat" :items="formatTabs" size="xs" class="r-editor-demo__tabs" />

        <pre class="r-editor-demo__code"><code>{{ activeOutput }}</code></pre>
        <!-- Rendered Preview (safe rendering without v-html) -->
        <div v-if="activeFormat === 'rendered'" class="preview-rendered">
          <div v-if="!content" class="empty-preview">No content to preview</div>
          <div v-else ref="renderedContentRef" class="rendered-content"></div>
        </div>

        <div class="r-editor-demo__foot-actions">
          <UButton size="xs" color="neutral" variant="soft" icon="i-lucide-copy" @click="copyOutput">
            Copy {{ activeFormat.toUpperCase() }}
          </UButton>
          <UButton size="xs" color="neutral" variant="ghost" icon="i-lucide-eraser" @click="clearEditor">
            Clear
          </UButton>
        </div>
      </div>
    <!-- </template> -->
  <!-- </UCard> -->
</template>

<script setup>
import { ref, computed, watch, nextTick,useTemplateRef } from 'vue'
definePageMeta({layout:'navbar'})
const toast = useToast?.() ?? { add: () => {} }

const editorRef = useTemplateRef('editorRef')
const renderedContentRef = ref(null)

const placeholder = tBy({
  en: 'Write something, type "/" for commands, "@" to mention, ":" for emoji...',
  km: 'សូមចាប់ផ្ដើមសរសេរ ឬវាយ "/" ដើម្បីមើលពាក្យបញ្ជា'
})
// ─── v-model content (markdown, since content-type="markdown" above) ───────
const content = ref(`# Try everything

Type **/** for commands, **@** to mention someone, **:** for emoji.
Select text to see the AI *Improve* dropdown (fix grammar, translate, summarize...).
Drop in an image (drag the corner to resize it), a video, or a PDF from the toolbar.`)

// ─── Sample data ─────────────────────────────────────────────────────────────
const mentionItems = [
  { label: 'sokha', avatar: { src: 'https://i.pravatar.cc/64?img=12', loading: 'lazy' } },
  { label: 'dara', avatar: { src: 'https://i.pravatar.cc/64?img=32', loading: 'lazy' } },
  { label: 'chenda', avatar: { src: 'https://i.pravatar.cc/64?img=47', loading: 'lazy' } },
]

// Point these at your real Nitro/Nuxt server routes.
const uploadApi = {
  url: '/api/uploads',
  method: 'POST',
  fieldName: 'file',
  responseUrlKey: 'url',   // { url: '...' } in the JSON response
  responseIdKey: 'id',     // { id: '...' } — used for delete
  deleteUrl: '/api/uploads',
  deleteMethod: 'DELETE',
}
const aiApi = '/api/completion'

// ─── File tracking (mirrors REditor's own uploadedFiles, via emits) ────────
const uploadedFiles = ref([])

function onFileEvent(kind, payload) {
  console.log(`[REditor] file ${kind}`, payload)
}

function onUploadError(payload) {
  toast.add({ color: 'error', title: 'Upload failed', description: payload?.message ?? String(payload) })
}

// ─── Word count ──────────────────────────────────────────────────────────────
const wordCount = computed(() => {
  const text = editorRef.value?.getText?.() ?? content.value.replace(/[#*_`>-]/g, '')
  return text.trim() ? text.trim().split(/\s+/).length : 0
})

// ─── Live output — Markdown / HTML / JSON, all at once ─────────────────────
const formatTabs = [
  { label: 'Rendered', value: 'rendered', icon: 'i-lucide-eye' },
  { label: 'Markdown', value: 'markdown', icon: 'i-lucide-hash' },
  { label: 'HTML', value: 'html', icon: 'i-lucide-code-2' },
  { label: 'JSON', value: 'json', icon: 'i-lucide-braces' },
]
const activeFormat = ref('rendered')

const activeOutput = computed(() => {
  if (activeFormat.value === 'html') return editorRef.value?.getHTML?.() ?? ''
  if (activeFormat.value === 'json') return JSON.stringify(editorRef.value?.getJSON?.() ?? {}, null, 2)
  if (activeFormat.value === 'rendered') return renderContent()
  return content.value
})

async function copyOutput() {
  try {
    await navigator.clipboard.writeText(activeOutput.value)
    toast.add({ color: 'success', title: `${activeFormat.value.toUpperCase()} copied` })
  } catch {
    toast.add({ color: 'error', title: 'Could not copy to clipboard' })
  }
}

function clearEditor() {
  editorRef.value?.clear?.()
}


// ─── Render Content Safely ─────────────────────────────────────────────────
function renderContent() {
  if (!renderedContentRef.value || !content.value) {
    if (renderedContentRef.value) {
      renderedContentRef.value.innerHTML = ''
    }
    return
  }

  // Create a temporary container
  const tempDiv = document.createElement('div')
   // Convert markdown -> HTML
  // const html = markdownToHtml(content.value)

  // Parse the HTML content
  const parser = new DOMParser()
  const doc = parser.parseFromString(content.value, 'text/html')
  
  // Extract and sanitize body content
  const bodyContent = doc.body.innerHTML
  
  // Sanitize: remove dangerous elements
  const sanitizedContent = sanitizeHTML(bodyContent)
  
  // Insert into preview
  renderedContentRef.value.innerHTML = sanitizedContent
  // renderedContentRef.value.innerHTML = sanitizeHTML(html)
}

function sanitizeHTML(html) {
  // Simple sanitization - remove script tags and dangerous attributes
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html
  
  // Remove script tags
  const scripts = tempDiv.querySelectorAll('script')
  scripts.forEach(script => script.remove())
  
  // Remove on* attributes (event handlers)
  const allElements = tempDiv.querySelectorAll('*')
  allElements.forEach(el => {
    for (const attr of el.attributes) {
      if (attr.name.startsWith('on')) {
        el.removeAttribute(attr.name)
      }
      // Remove javascript: URLs
      if (attr.name === 'href' || attr.name === 'src') {
        if (attr.value.toLowerCase().startsWith('javascript:')) {
          el.removeAttribute(attr.name)
        }
      }
    }
  })
  
  return tempDiv.innerHTML
}

// ─── Watch Content ─────────────────────────────────────────────────────────
watch(content, () => {
  nextTick(() => {
    if (activeFormat.value === 'rendered') {
      renderContent()
    }
  })
})
</script>

<style scoped>
.r-editor-demo {
  --ui-primary: var(--c-accent);
  --ui-border: var(--c-border);
  width: 100%;
  margin: 0 auto;
}

.r-editor-demo__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.r-editor-demo__title {
  font-size: 1.0625rem;
  font-weight: 700;
  color: var(--c-text);
  margin: 0;
}

.r-editor-demo__subtitle {
  font-size: 0.8125rem;
  color: var(--c-muted);
  margin: 0.125rem 0 0;
}

.r-editor-demo__head-actions {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  flex-shrink: 0;
}

.r-editor-demo__editor {
  border: none;
  border-radius: 0;
  min-height: 420px;
}

.r-editor-demo__output {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.r-editor-demo__tabs {
  width: fit-content;
}

.r-editor-demo__code {
  margin: 0;
  max-height: 180px;
  overflow: auto;
  padding: 0.75rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--c-border);
  border-radius: 0.5rem;
  font-size: 0.75rem;
  line-height: 1.5;
  color: var(--c-text);
  white-space: pre-wrap;
  word-break: break-word;
}

.r-editor-demo__foot-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>
