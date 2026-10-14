<template>
  <div>
    <div v-if="aiStore.enabled" class="ai-auto-cb" :class="{ checked: model }">
      <label class="ai-auto-cb__label">
        <input type="checkbox" v-model="model" class="ai-auto-cb__input" />
        <span class="ai-auto-cb__box">
          <i class="ri-check-line ai-auto-cb__check" />
        </span>
        <i class="ri-sparkling-line ai-auto-cb__icon" />
        <span class="ai-auto-cb__text">Auto translate with AI</span>
        <span class="ai-auto-cb__langs">({{ targetLangLabels }})</span>
      </label>
      <p v-if="model" class="ai-auto-cb__hint">
        <i class="ri-information-line" />
        Fields will be translated to {{ targetLangLabels }} after saving.
      </p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  languages: {
    type: Array,
    default: () => [{ code: 'en', name: 'English' }, { code: 'km', name: 'Khmer' }],
  },
})
const emit = defineEmits(['update:modelValue'])

const aiStore = useAIStore()
const langStore = useLanguageStore()

const model = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const targetLangLabels = computed(() => {
  const langs = props.languages.length ? props.languages
    : langStore.activeItems.length ? langStore.activeItems
    : [{ code: 'en', name: 'English' }, { code: 'km', name: 'Khmer' }]
  return langs.map((l) => l.name || l.code).join(', ')
})
</script>

<style lang="scss">
.ai-auto-cb {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: var(--sp-3) var(--sp-4);
  background: rgba(var(--c-accent-rgb, 139, 92, 246), 0.05);
  border: 1px solid rgba(var(--c-accent-rgb, 139, 92, 246), 0.18);
  border-radius: var(--r-md);
}

.ai-auto-cb__label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.ai-auto-cb__input { display: none; }

.ai-auto-cb__box {
  width: 18px; height: 18px; flex-shrink: 0;
  border-radius: 4px; border: 2px solid rgba(var(--c-accent-rgb,139,92,246),0.4);
  background: transparent; display: flex; align-items: center; justify-content: center;
  transition: all var(--t-fast);

  .ai-auto-cb__input:checked ~ & {
    background: var(--c-accent);
    border-color: var(--c-accent);
  }
}

// CSS sibling trick doesn't work with Vue's v-model computed — use :has or JS
// We'll control via the model ref directly in style
.ai-auto-cb__check {
  font-size: 0.7rem; color: white; opacity: 0; transition: opacity var(--t-fast);
}

// Apply checked state via parent class toggled by Vue
.ai-auto-cb.checked .ai-auto-cb__box {
  background: var(--c-accent);
  border-color: var(--c-accent);
  .ai-auto-cb__check { opacity: 1; }
}

.ai-auto-cb__icon { color: var(--c-accent); font-size: 0.9rem; flex-shrink: 0; }

.ai-auto-cb__text {
  font-size: 0.875rem; font-weight: 600; color: var(--c-text);
}

.ai-auto-cb__langs {
  font-size: 0.75rem; color: var(--c-muted);
}

.ai-auto-cb__hint {
  font-size: 0.75rem; color: var(--c-accent);
  display: flex; align-items: center; gap: 4px;
  i { flex-shrink: 0; }
}
</style>
