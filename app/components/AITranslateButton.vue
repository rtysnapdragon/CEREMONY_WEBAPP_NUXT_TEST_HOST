<template>
  <button
    type="button"
    class="ai-translate-btn"
    :class="{ loading: aiStore.loading, translated }"
    :disabled="aiStore.loading || !canTranslate"
    :title="aiStore.loading ? 'Translating...' : 'Auto-translate with AI'"
    @click="translate"
  >
    <i :class="aiStore.loading ? 'ri-loader-4-line animate-spin' : translated ? 'ri-check-line' : 'ri-sparkling-line'" />
    <span>{{ aiStore.loading ? 'Translating...' : translated ? 'Translated' : label }}</span>
  </button>
</template>

<script setup>
/**
 * AITranslateButton
 *
 * Props:
 *   fields   — object of { fieldKey: sourceText } to translate  e.g. { title: 'Wedding', venue: 'Ballroom' }
 *   languages — array of { code, name } — defaults to EN + KM
 *
 * Emits:
 *   result(translations) — { fieldKey: { en: '...', km: '...' } }
 */
const props = defineProps({
  fields: { type: Object, required: true },
  languages: {
    type: Array,
    default: () => [
      { code: 'en', name: 'English' },
      { code: 'km', name: 'Khmer' },
    ],
  },
  label: { type: String, default: 'AI Translate' },
})

const emit = defineEmits(['result'])

const aiStore = useAIStore()
const toast = useToastStore()
const translated = ref(false)

const canTranslate = computed(() =>
  Object.values(props.fields).some((v) => v && String(v).trim().length > 0)
)

const translate = async () => {
  // filter out empty values
  const input = Object.fromEntries(
    Object.entries(props.fields).filter(([, v]) => v && String(v).trim())
  )
  if (!Object.keys(input).length) return

  const result = await aiStore.translate(input, props.languages)
  if (!result) {
    toast.add(aiStore.error ?? 'AI translation failed', 'Error')
    return
  }

  translated.value = true
  setTimeout(() => { translated.value = false }, 3000)
  emit('result', result)
}
</script>

<style lang="scss">
.ai-translate-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: var(--r-md);
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid rgba(var(--c-accent-rgb, 139, 92, 246), 0.35);
  background: rgba(var(--c-accent-rgb, 139, 92, 246), 0.08);
  color: var(--c-accent);
  transition: all var(--t-fast);
  white-space: nowrap;

  i { font-size: 0.9rem; }

  &:hover:not(:disabled) {
    background: rgba(var(--c-accent-rgb, 139, 92, 246), 0.16);
    border-color: rgba(var(--c-accent-rgb, 139, 92, 246), 0.5);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  &.translated {
    border-color: rgba(var(--c-success-rgb, 34, 197, 94), 0.4);
    background: rgba(var(--c-success-rgb, 34, 197, 94), 0.08);
    color: var(--c-success);
  }
}
</style>
