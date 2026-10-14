<script setup>
import { LETTER_TEMPLATES } from '~/composables/useLetterData'
const showTemplateModal = defineModel()
const props = defineProps(['data'])
const emit = defineEmits('select-template')
const { tr } = useTr()
const tempSelected = ref(props.data.template)
const search = ref('')

const data = computed(() => props.data)

watch(
  () => props.data.template,
  value => {
    tempSelected.value = value
  }
)

// reset the filter each time the modal is opened
watch(showTemplateModal, open => {
  if (open) search.value = ''
})

// ── State ──────────────────────────────────────────────────────────────────────
const loading = ref(false)
const templates = ref([])

// ── Fetch templates ────────────────────────────────────────────────────────────
onMounted(async () => {
  await nextTick()
  await fetchTemplates()
})

// Normalize a template row so the grid works with one shape everywhere,
// whether it comes from the org-scoped API or the built-in registry.
const normalizeTemplate = (t) => ({
  key: t.templateKey ?? t.key,
  name: t.templateName ?? t.name ?? t.label,
  thumbnailUrl: t.thumbnailUrl ?? t.thumbnail,
  isActive: t.isActive ?? false,
})

const fetchTemplates = async () => {
  loading.value = true
  try {
    // Org-scoped endpoint: planners see the templates assigned to their org.
    // Falls back to the built-in templates when nothing is assigned yet.
    const { data, error } = await useHttp('/api/v1/invitation-templates', {
      method: 'GET', isGlobal: true,
    })
    if (error?.value) throw error.value
    const raw = data.value?.data ?? data.value ?? []
    const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.content) ? raw.content : [])
    templates.value = list.length
      ? list.map(normalizeTemplate)
      : LETTER_TEMPLATES.map(normalizeTemplate)
  } catch (err) {
    console.error('fetchTemplates error', err)
    toast.add('Failed to load templates', 'Error')
  } finally {
    loading.value = false
  }
}

// Search filters the displayed list (matches on the localized template name).
const filteredTemplates = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return templates.value
  return templates.value.filter(t =>
    String(tr(t.name ?? t.key) ?? t.name ?? t.key).toLowerCase().includes(q)
  )
})

const hasSearch = computed(() => search.value.trim().length > 0)

const selectedTemplate = computed(() =>
  templates.value.find(t => t.key === tempSelected.value)
)

const hasChanges = computed(() => tempSelected.value !== data.value?.template)

function selectTemplate(key) {
  tempSelected.value = key
}

function applyTemplate() {
  if (!selectedTemplate.value)
    return

  emit('select-template', selectedTemplate.value.key)
  showTemplateModal.value = false
}
</script>

<template>
  <RModal
    v-model="showTemplateModal"
    title="Choose Template"
    modal-width="1200px"
    :no-close="tempSelected !== data.template || !tempSelected"
  >
    <div v-if="templates.length" class="template-toolbar">
      <div class="template-search">
        <i class="ri-search-ai-2-line" />
        <input v-model="search" type="text" :placeholder="tr('common.search') || 'Search templates'" >
        <button v-if="search" type="button" class="btn-clear" aria-label="Clear search" @click="search = ''"><i class="ri-close-line" /></button>
      </div>
      <span class="template-count">{{ filteredTemplates.length }} / {{ templates.length }}</span>
    </div>

    <div v-if="loading" class="template-grid">
      <RCard
        v-for="i in 8"
        :key="i"
        class="template-card"
        padding="s"
      >
        <RSkeleton class="preview-skeleton" />
        <div class="template-info"> <RSkeleton class="title-skeleton" /> </div>
      </RCard>
    </div>

    <div v-else-if="filteredTemplates.length" class="template-grid">
      <RCard
        v-for="tpl in filteredTemplates"
        :key="tpl.key"
        class="template-card"
        padding="s"
        :class="{ active: tpl.key === data.template ||  tpl.key === tempSelected }"
        tabindex="0"
        role="button"
        :aria-pressed="tpl.key === tempSelected"
        @click="selectTemplate(tpl.key)"
        @keydown.enter.prevent="selectTemplate(tpl.key)"
        @keydown.space.prevent="selectTemplate(tpl.key)"
      >
        <div v-if="tpl.key === tempSelected" class="selected-icon"><i class="ri-check-line" /></div>
        <RImage :src="tpl.thumbnailUrl" :alt="tr(tpl.name ?? tpl.key)" class="preview-image" />
        <div class="template-info"> <div class="title"> {{ tr(tpl.name ?? tpl.key) }} </div> </div>
        <span v-if="tpl.key === data.template" class="current-badge"> {{ tr('common.current') || 'Current' }} </span>
      </RCard>
    </div>

    <div v-else class="template-empty">
      <i class="ri-file-search-line" />
      <p>{{ hasSearch ? (tr('common.no_results', 'No templates match your search.')) : (tr('common.no_templates', 'No templates available yet.')) }}</p>
      <button v-if="hasSearch" type="button" class="template-empty__reset" @click="search = ''">
        {{ tr('common.clear_search', 'Clear search') }}
      </button>
    </div>

    <template #footer>
      <div class="template-footer">
        <span class="template-footer__selected">
          <template v-if="selectedTemplate">
            {{ tr('common.selected', 'Selected') }}: <strong>{{ tr(selectedTemplate.name ?? selectedTemplate.key) }}</strong>
          </template>
        </span>
        <div class="template-footer__actions">
          <RBtn type="cancel"  label="Cancel" @click="showTemplateModal = false" />
          <RBtn type="add"  label="Apply" :disabled="!hasChanges" @click="applyTemplate" />
        </div>
      </div>
    </template>
  </RModal>
</template>

<style lang="scss" scoped>
// ── Toolbar / search ──────────────────────────────────────────────────────────
.template-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.template-search {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  max-width: 320px;

  i {
    position: absolute;
    left: 12px;
    font-size: 15px;
    color: var(--c-muted);
    pointer-events: none;
  }

  input {
    width: 100%;
    height: 38px;
    padding: 0 34px 0 34px;
    border-radius: 10px;
    border: 1px solid var(--c-border, rgba(150,150,150,.25));
    background: var(--c-surface, transparent);
    color: var(--c-text);
    font-size: 14px;
    outline: none;
    transition: border-color .2s ease, box-shadow .2s ease;

    &::placeholder { color: var(--c-muted); }

    &:focus {
      border-color: orange;
      // box-shadow: 0 0 0 1px rgba(var(--c-accent-rgb, 255,140,102), .15);
    }
  }
}
button.btn-clear {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);

  width: 28px;
  height: 28px;
  padding: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 0;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;

  font-size: 16px;
  line-height: 1;
  color: var(--c-text);
  :hover{
    background: rgb(255, 165, 0,0.5);
    color: #fff;
  }

  i {
    display: inline-block;
    vertical-align: middle;
  }
}

.template-count {
  font-size: 12.5px;
  color: var(--c-muted);
  white-space: nowrap;
}

// ── Grid ──────────────────────────────────────────────────────────────────────
.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 14px;
  max-height: 60vh;
  overflow-y: auto;
  padding: 2px;
}

.template-card {
  position: relative;
  cursor: pointer;
  overflow: hidden;
  border-radius: 18px;

  border: 1px solid transparent;
  outline: none;

  .preview-image {
    display: block;
    width: 100%;
    // aspect-ratio: 3/4;
    object-fit: cover;
  }

  .template-info {
    padding: 5px 0;
  }

  .title {
    text-align: center;
    font-size: 14px;
    font-weight: 600;
    color: var(--c-text);
  }

  .current-badge {
    position: absolute;
    top: 5px;
    left: 5px;
    padding: 3px 9px;
    border-radius: 99px;
    font-size: 11px;
    font-weight: 700;
    // text-transform: uppercase;
    letter-spacing: .04em;
    background: rgb(255, 165, 0,0.5);
    color: #fff;
    backdrop-filter: blur(4px);
    z-index: 4;
  }

  .selected-icon {
    position: absolute;
    top: 5px;
    right: 5px;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: orange;
    color: white; 

    animation: pop .2s ease;
    z-index: 5;

    i {
      font-size: 9px;
      font-weight: 700;
    }
  }

  &.active {
    border: 2px solid orange !important;
    .title {
      color: var(--c-accent);
    }
  }
}

// ── Empty state ───────────────────────────────────────────────────────────────
.template-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 48px 20px;
  text-align: center;
  color: var(--c-muted);

  i { font-size: 28px; opacity: .6; }
  p { margin: 0; font-size: 14px; }
}

.template-empty__reset {
  margin-top: 4px;
  border: none;
  background: none;
  color: var(--c-accent);
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;

  &:hover { text-decoration: underline; }
}

// ── Footer ────────────────────────────────────────────────────────────────────
.template-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  flex-wrap: wrap;
}

.template-footer__selected {
  font-size: 13px;
  color: var(--c-muted);

  strong { color: var(--c-text); }
}

.template-footer__actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

@keyframes pop {
  from {
    opacity: 0;
    transform: scale(.5);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}


.preview-skeleton {
  width: 100%;
  aspect-ratio: 3 / 4;
  border-radius: 12px;
}

.title-skeleton {
  width: 65%;
  height: 16px;
  margin: 6px auto;
  border-radius: 6px;
}
</style>