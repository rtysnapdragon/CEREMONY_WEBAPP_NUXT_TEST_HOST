<template>
  <div class="r-editor-page">
    <div class="r-editor-page__header">
      <h1>R Editor - Full Featured Rich Text Editor</h1>
      <div class="r-editor-page__controls">
        <button @click="toggleDarkMode" class="btn btn-secondary">
          {{ isDark ? '☀️ Light' : '🌙 Dark' }}
        </button>
        <button @click="clearContent" class="btn btn-danger">Clear</button>
        <button @click="logContent" class="btn btn-primary">Log Content</button>
      </div>
    </div>

    <!-- The Editor -->
    <div class="r-editor-page__editor-wrapper">

       <div class="space-y-6">
      
          <div class="flex flex-wrap gap-2">
            <UButton @click="focusEditor">
              Focus
            </UButton>
      
            <UButton @click="clearEditor">
              Clear
            </UButton>
      
            <UButton @click="insertText">
              Insert Content
            </UButton>
      
            <UButton @click="setContent">
              Set Content
            </UButton>
      
            <UButton @click="getHTML">
              Get HTML
            </UButton>
      
            <UButton @click="getJSON">
              Get JSON
            </UButton>
      
            <UButton @click="getText">
              Get Text
            </UButton>
          </div>
        </div>

      <REditorDev
        ref="editorRef"
        v-model="content"
        content-type="html"
        :placeholder="placeholder"
        :mention-items="users"
        :options="editorOptions"
        :api="uploadApi"
        :upload-crop="true"
        :upload-crop-shape="'square'"
        :upload-crop-output-px="800"
        :upload-compress="true"
        :upload-compress-quality="0.85"
        @change="handleChange"
        @file-uploaded="handleFileUploaded"
        @file-changed="handleFileChanged"
        @file-deleted="handleFileDeleted"
        @upload-error="handleUploadError"
      />
    </div>

    <!-- Live Preview -->
    <div class="r-editor-page__preview">
      <div class="r-editor-page__preview-header">
        <h2>Live Preview</h2>
        <div class="r-editor-page__preview-tabs">
          <button 
            :class="['tab-btn', { active: previewMode === 'html' }]"
            @click="previewMode = 'html'"
          >
            HTML
          </button>
          <button 
            :class="['tab-btn', { active: previewMode === 'rendered' }]"
            @click="previewMode = 'rendered'"
          >
            Rendered
          </button>
          <button 
            :class="['tab-btn', { active: previewMode === 'json' }]"
            @click="previewMode = 'json'"
          >
            JSON
          </button>
          <button 
            :class="['tab-btn', { active: previewMode === 'text' }]"
            @click="previewMode = 'text'"
          >
            Text
          </button>
            <button 
            :class="['tab-btn', { active: previewMode === 'markdown' }]"
            @click="previewMode = 'markdown'"
          >
            Markdown
          </button>
        </div>
      </div>

      <div class="r-editor-page__preview-content">
        <!-- HTML Preview -->
        <pre v-if="previewMode === 'html'" class="preview-code">{{ content || 'Empty content' }}</pre>

        <!-- Rendered Preview (safe rendering without v-html) -->
        <div v-else-if="previewMode === 'rendered'" class="preview-rendered">
          <div v-if="!content" class="empty-preview">No content to preview</div>
          <div v-else ref="renderedContentRef" class="rendered-content"></div>
        </div>

        <!-- JSON Preview -->
        <pre v-else-if="previewMode === 'json'" class="preview-code">{{ formattedJSON || 'Empty content' }}</pre>

        <!-- Text Preview -->
        <pre v-else-if="previewMode === 'text'" class="preview-code">{{ plainText || 'Empty content' }}</pre>

        <!-- Markdown Preview -->
        <pre v-else-if="previewMode === 'markdown'" class="preview-code">{{ markdownContent || 'Empty content' }}</pre>
      </div>

      <!-- Stats -->
      <div class="r-editor-page__preview-stats">
        <span>Words: {{ wordCount }}</span>
        <span>Characters: {{ charCount }}</span>
        <span>Paragraphs: {{ paragraphCount }}</span>
        <span>Images: {{ imageCount }}</span>
      </div>
    </div>

    <!-- Uploaded Files Gallery -->
    <div v-if="uploadedFiles.length" class="r-editor-page__gallery">
      <h3>Uploaded Files ({{ uploadedFiles.length }})</h3>
      <div class="gallery-grid">
        <div v-for="file in uploadedFiles" :key="file.id" class="gallery-item">
          <img :src="file.url" :alt="file.name" />
          <div class="gallery-item-info">
            <span class="gallery-item-name">{{ file.name }}</span>
            <span class="gallery-item-size">{{ formatBytes(file.size) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
definePageMeta({layout:'navbar'})

// ─── State ──────────────────────────────────────────────────────────────────
const content = ref('')
const editorRef = ref(null)
const previewMode = ref('rendered')
const isDark = ref(false)
const renderedContentRef = ref(null)
const uploadedFiles = ref([])

// ─── Users for mentions ────────────────────────────────────────────────────
const users = ref([])
console.log("Users ===================> ", users.value)
const fixedData = [
  { label: 'sokha', avatar: { src: 'https://i.pravatar.cc/64?img=12', loading: 'lazy' } },
  { label: 'dara', avatar: { src: 'https://i.pravatar.cc/64?img=32', loading: 'lazy' } },
  { label: 'chenda', avatar: { src: 'https://i.pravatar.cc/64?img=47', loading: 'lazy' } },
  { label: 'John Doe', avatar: 'https://i.pravatar.cc/150?img=1' },
  { label: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?img=2' },
  { label: 'Alice Johnson', avatar: 'https://i.pravatar.cc/150?img=3' },
  { label: 'Bob Williams', avatar: 'https://i.pravatar.cc/150?img=4' },
  { label: 'Sarah Miller', avatar: 'https://i.pravatar.cc/150?img=5' },
  { label: 'John Doe', avatar: 'https://i.pravatar.cc/150?img=1' },
  { label: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?img=2' },
  { label: 'Alice Johnson', avatar: 'https://i.pravatar.cc/150?img=3' },
  { label: 'Bob Williams', avatar: 'https://i.pravatar.cc/150?img=4' },
  { label: 'Sarah Miller', avatar: 'https://i.pravatar.cc/150?img=5' },
  { label: 'John Doe', avatar: 'https://i.pravatar.cc/150?img=1' },
  { label: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?img=2' },
  { label: 'Alice Johnson', avatar: 'https://i.pravatar.cc/150?img=3' },
  { label: 'Bob Williams', avatar: 'https://i.pravatar.cc/150?img=4' },
  { label: 'Sarah Miller', avatar: 'https://i.pravatar.cc/150?img=5' },
  { label: 'John Doe', avatar: 'https://i.pravatar.cc/150?img=1' },
  { label: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?img=2' },
  { label: 'Alice Johnson', avatar: 'https://i.pravatar.cc/150?img=3' },
  { label: 'Bob Williams', avatar: 'https://i.pravatar.cc/150?img=4' },
  { label: 'Sarah Miller', avatar: 'https://i.pravatar.cc/150?img=5' },
]
const placeholder = tBy({
  en: 'Write something, type "/" for commands, "@" to mention, ":" for emoji...',
  km: 'សូមចាប់ផ្ដើមសរសេរ ឬវាយ "/" ដើម្បីមើលពាក្យបញ្ជា'
})
onMounted(async () => {
  const { data , error } = await useHttp('/api/v1/users')

  if(isNotEmpty(error.value)){
    toast.add({
      title: 'Error',
      description: 'Failed to fetch users'
    })
    return
  }
 const apiUsers = (data.value ?? []).map((user, index) => ({
    label: user.username,
    avatar: {
      src: `https://i.pravatar.cc/64?img=${index + 50}`, // placeholder avatar
      loading: 'lazy'
    },
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    roles: user.roles,
    status: user.status,
  }))
  const merged = [...fixedData, ...apiUsers]
  users.value = merged.filter(
    (user, index, self) =>
      index === self.findIndex(u => u.label === user.label)
  )
  // users.value = [
  //   ...fixedData,
  //   ...apiUsers,
  // ]
})

console.log("users ================. ", users.value)
// ─── Editor Options ────────────────────────────────────────────────────────
const editorOptions = {
  toolbar: true,
  bubbleToolbar: true,
  dragHandle: true,
  suggestionMenu: true,
  mentionMenu: true,
  emojiMenu: true,
  textAlign: true,
  link: true,
  imageUpload: true,
  mediaLibrary: true,
  ai: true
}

// ─── Upload API Configuration ─────────────────────────────────────────────
const uploadApi = {
  url: '/api/upload', // Your upload endpoint
  method: 'POST',
  fieldName: 'file',
  headers: {
    'X-Requested-With': 'XMLHttpRequest'
  },
  responseUrlKey: 'data.url',
  responseIdKey: 'data.id',
  deleteUrl: '/api/upload',
  deleteMethod: 'DELETE'
}

// ─── Computed Preview Data ────────────────────────────────────────────────
const formattedJSON = computed(() => {
  if (!content.value) return null
  try {
    const editor = editorRef.value?.getEditor()
    if (editor) {
      return JSON.stringify(editor.getJSON(), null, 2)
    }
    return 'Editor not ready'
  } catch (e) {
    return 'Error parsing JSON'
  }
})

const plainText = computed(() => {
  const editor = editorRef.value?.getEditor()
  return editor ? editor.getText() : ''
})

const markdownContent = computed(() => {
  const editor = editorRef.value?.getEditor()
  console.log("editor ==============>> ", editor)
  return editorRef.value?.getMarkdown()
})

const wordCount = computed(() => {
  const text = plainText.value
  return text ? text.trim().split(/\s+/).length : 0
})

const charCount = computed(() => {
  return plainText.value.length
})

const paragraphCount = computed(() => {
  const editor = editorRef.value?.getEditor()
  if (!editor) return 0
  let count = 0
  editor.state.doc.descendants((node) => {
    if (node.type.name === 'paragraph') count++
  })
  return count
})

const imageCount = computed(() => {
  const editor = editorRef.value?.getEditor()
  if (!editor) return 0
  let count = 0
  editor.state.doc.descendants((node) => {
    if (node.type.name === 'image') count++
  })
  return count
})


function focusEditor() {
  editorRef.value.focus()
}

function clearEditor() {
  editorRef.value.clear()
}

function insertText() {
  editorRef.value.insertContent(
    '<p><strong>Hello from REditor!</strong></p>'
  )
}

function setContent() {
  editorRef.value.setContent(`
    <h2>New Content</h2>
    <p>This content was inserted using setContent().</p>
  `)
}

function getHTML() {
  console.log(editorRef.value.getHTML())
}

function getJSON() {
  console.log(editorRef.value.getJSON())
}

function getText() {
  console.log(editorRef.value.getText())
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
  
  // Parse the HTML content
  const parser = new DOMParser()
  const doc = parser.parseFromString(content.value, 'text/html')
  
  // Extract and sanitize body content
  const bodyContent = doc.body.innerHTML
  
  // Sanitize: remove dangerous elements
  const sanitizedContent = sanitizeHTML(bodyContent)
  
  // Insert into preview
  renderedContentRef.value.innerHTML = sanitizedContent
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
    if (previewMode.value === 'rendered') {
      renderContent()
    }
  })
})

// ─── Event Handlers ──────────────────────────────────────────────────────
function handleChange(newContent) {
  console.log('Content changed:', newContent.substring(0, 100) + '...')
}

function handleFileUploaded(file) {
  console.log('File uploaded:', file)
  uploadedFiles.value = [...uploadedFiles.value, file]
}

function handleFileChanged({ old, next }) {
  console.log('File changed:', old, '→', next)
  // Update the file in the list
  const index = uploadedFiles.value.findIndex(f => f.id === old.id)
  if (index !== -1) {
    uploadedFiles.value[index] = next
  }
}

function handleFileDeleted(file) {
  console.log('File deleted:', file)
  uploadedFiles.value = uploadedFiles.value.filter(f => f.id !== file.id)
}

function handleUploadError(error) {
  console.error('Upload error:', error)
  // You could show a toast notification here
}

// ─── Utility Functions ────────────────────────────────────────────────────
function formatBytes(bytes) {
  if (!bytes) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function toggleDarkMode() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
}

function clearContent() {
  editorRef.value?.clear()
  content.value = ''
}

function logContent() {
  const editor = editorRef.value?.getEditor()
  if (editor) {
    console.log('HTML:', editor.getHTML())
    console.log('JSON:', editor.getJSON())
    console.log('Text:', editor.getText())
    console.log('Files:', uploadedFiles.value)
  }
}

// ─── Lifecycle ─────────────────────────────────────────────────────────────
onMounted(() => {
  // Set initial content with some sample text
  content.value = `
    <h1>Welcome to the R Editor</h1>
    <p>This is a <strong>full-featured</strong> rich text editor built with <em>TipTap</em> and <em>Nuxt UI</em>.</p>
    <h2>Features</h2>
    <ul>
      <li>Rich text formatting (bold, italic, underline, etc.)</li>
      <li>Headings (H1-H6)</li>
      <li>Lists (bullet and numbered)</li>
      <li>Blockquotes and code blocks</li>
      <li>Image upload and management</li>
      <li>Mentions (@username)</li>
      <li>Emoji support (:emoji:)</li>
      <li>Slash commands (type /)</li>
      <li>Drag and drop blocks</li>
      <li>AI-powered writing assistance</li>
    </ul>
    <p>Try typing <code>/</code> to see the command menu, or @ to mention someone!</p>
    <blockquote>
      "The best way to predict the future is to invent it." — Alan Kay
    </blockquote>
  `
  
  // Render initial content
  nextTick(renderContent)
})
</script>

<style lang="scss" scoped>
.r-editor-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
}

.r-editor-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--c-border, #e5e7eb);
}

.r-editor-page__header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--c-text, #1f2937);
  margin: 0;
}

.r-editor-page__controls {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.5rem 1rem;
  border: 1px solid transparent;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--c-accent, #6366f1);
  color: white;
}
.btn-primary:hover {
  background: var(--c-accent-dark, #4f46e5);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.btn-secondary {
  background: var(--c-surface, #f3f4f6);
  color: var(--c-text, #1f2937);
  border-color: var(--c-border, #e5e7eb);
}
.btn-secondary:hover {
  background: var(--c-bg, #e5e7eb);
}

.btn-danger {
  background: #ef4444;
  color: white;
}
.btn-danger:hover {
  background: #dc2626;
}

.r-editor-page__editor-wrapper {
  margin-bottom: 2rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}

/* ─── Preview Section ────────────────────────────────────────────────────── */
.r-editor-page__preview {
  border: 1px solid var(--c-border, #e5e7eb);
  border-radius: 0.75rem;
  overflow: hidden;
  margin-bottom: 2rem;
}

.r-editor-page__preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: var(--c-surface, #f9fafb);
  border-bottom: 1px solid var(--c-border, #e5e7eb);
}

.r-editor-page__preview-header h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--c-text, #1f2937);
  margin: 0;
}

.r-editor-page__preview-tabs {
  display: flex;
  gap: 0.25rem;
  background: var(--c-bg, #f3f4f6);
  padding: 0.25rem;
  border-radius: 0.5rem;
}

.tab-btn {
  padding: 0.375rem 0.75rem;
  border: none;
  border-radius: 0.375rem;
  background: transparent;
  color: var(--c-text-muted, #6b7280);
  font-size: 0.813rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: var(--c-text, #1f2937);
}

.tab-btn.active {
  background: white;
  color: var(--c-accent, #6366f1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.r-editor-page__preview-content {
  padding: 1.5rem;
  min-height: 200px;
  max-height: 500px;
  overflow-y: auto;
  background: var(--c-bg, white);
}

.preview-code {
  margin: 0;
  font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
  font-size: 0.813rem;
  line-height: 1.6;
  color: var(--c-text, #1f2937);
  white-space: pre-wrap;
  word-break: break-all;
}

.preview-rendered {
  min-height: 100px;
}

.rendered-content {
  max-width: 100%;
}

.rendered-content :deep(h1) {
  font-size: 2rem;
  font-weight: 700;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.rendered-content :deep(h2) {
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: 1.25rem;
  margin-bottom: 0.625rem;
}

.rendered-content :deep(h3) {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.rendered-content :deep(p) {
  margin-bottom: 0.75rem;
  line-height: 1.7;
}

.rendered-content :deep(strong) {
  font-weight: 700;
}

.rendered-content :deep(em) {
  font-style: italic;
}

.rendered-content :deep(ul),
.rendered-content :deep(ol) {
  margin-top: 0.5rem;
  margin-bottom: 0.75rem;
  padding-left: 1.5rem;
}

.rendered-content :deep(li) {
  margin-bottom: 0.25rem;
  line-height: 1.6;
}

.rendered-content :deep(blockquote) {
  border-left: 4px solid var(--c-accent, #6366f1);
  padding-left: 1rem;
  margin: 0.75rem 0;
  color: var(--c-text-muted, #6b7280);
  font-style: italic;
}

.rendered-content :deep(code) {
  background: var(--c-bg, #f3f4f6);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
}

.rendered-content :deep(pre) {
  background: var(--c-bg, #1f2937);
  color: #e5e7eb;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 0.75rem 0;
}

.rendered-content :deep(pre code) {
  background: transparent;
  padding: 0;
  color: inherit;
}

.rendered-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin: 0.5rem 0;
}

.rendered-content :deep(a) {
  color: var(--c-accent, #6366f1);
  text-decoration: underline;
}

.empty-preview {
  color: var(--c-text-muted, #6b7280);
  font-style: italic;
  padding: 2rem 0;
  text-align: center;
}

/* ─── Stats ────────────────────────────────────────────────────────────────── */
.r-editor-page__preview-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--c-surface, #f9fafb);
  border-top: 1px solid var(--c-border, #e5e7eb);
  font-size: 0.813rem;
  color: var(--c-text-muted, #6b7280);
}

.r-editor-page__preview-stats span {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.r-editor-page__preview-stats span::before {
  content: '•';
  margin-right: 0.25rem;
}

.r-editor-page__preview-stats span:first-child::before {
  content: '';
}

/* ─── Gallery ──────────────────────────────────────────────────────────────── */
.r-editor-page__gallery {
  margin-top: 2rem;
}

.r-editor-page__gallery h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--c-text, #1f2937);
  margin-bottom: 1rem;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.gallery-item {
  border: 1px solid var(--c-border, #e5e7eb);
  border-radius: 0.5rem;
  overflow: hidden;
  background: var(--c-surface, #f9fafb);
}

.gallery-item img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  display: block;
}

.gallery-item-info {
  padding: 0.5rem;
}

.gallery-item-name {
  display: block;
  font-size: 0.813rem;
  font-weight: 500;
  color: var(--c-text, #1f2937);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gallery-item-size {
  display: block;
  font-size: 0.75rem;
  color: var(--c-text-muted, #6b7280);
}

/* ─── Dark Mode ────────────────────────────────────────────────────────────── */
:global(.dark) .r-editor-page {
  --c-text: #e5e7eb;
  --c-text-muted: #9ca3af;
  --c-bg: #1f2937;
  --c-surface: #374151;
  --c-border: #4b5563;
  --c-accent: #818cf8;
}

:global(.dark) .r-editor-page__preview-header {
  background: var(--c-surface);
}

:global(.dark) .r-editor-page__preview-content {
  background: var(--c-bg);
}

:global(.dark) .tab-btn.active {
  background: var(--c-surface);
  color: var(--c-accent);
}

:global(.dark) .r-editor-page__preview-stats {
  background: var(--c-surface);
}

:global(.dark) .btn-secondary {
  background: var(--c-surface);
  color: var(--c-text);
  border-color: var(--c-border);
}

:global(.dark) .gallery-item {
  background: var(--c-surface);
  border-color: var(--c-border);
}

:global(.dark) .preview-code {
  color: var(--c-text);
}

/* ─── Responsive ────────────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .r-editor-page {
    padding: 1rem;
  }

  .r-editor-page__header {
    flex-direction: column;
    align-items: stretch;
  }

  .r-editor-page__header h1 {
    font-size: 1.25rem;
  }

  .r-editor-page__preview-header {
    flex-direction: column;
    align-items: stretch;
  }

  .r-editor-page__preview-tabs {
    width: 100%;
    justify-content: space-between;
  }

  .tab-btn {
    flex: 1;
    text-align: center;
    font-size: 0.75rem;
    padding: 0.375rem 0.5rem;
  }

  .r-editor-page__preview-content {
    padding: 1rem;
    max-height: 300px;
  }

  .r-editor-page__preview-stats {
    gap: 0.75rem;
    font-size: 0.75rem;
    padding: 0.5rem 1rem;
  }

  .gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }

  .gallery-item img {
    height: 120px;
  }
}
</style>