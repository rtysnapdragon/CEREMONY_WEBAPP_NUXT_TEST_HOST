<template>
  <div class="invite-page">
    <div v-if="loading" class="w-loading">Loading invitation…</div>
    <component
      v-else
      :is="templateComponent"
      :data="inv"
      :token="token"
      :theme="inviteTheme"
    />
  </div>
</template>

<script setup>
import { useWeddingApi } from '~/composables/useWeddingApi'
import { findMockTemplate } from '~/data/mockWeddingTemplates'
import { parseInviteColors, INVITE_SCHEMES } from '~/composables/useInviteTheme'
import { BUILTIN_TEMPLATES ,LETTER_TEMPLATES} from '~/composables/useLetterData'
const route = useRoute()

const activeTemplate = computed(() => {
  return (
    LETTER_TEMPLATES.find(t => t.key === props.templateProp
    // LETTER_TEMPLATES.find(t => t.key === props.letter.template
    )?.component ??
    LETTER_TEMPLATES[0].component
  )
})

function getBase() {
  const tmpServer = useCookie('tmp_server').value
  const { config } = helper()
  return (tmpServer || config.apiUrl || '').replace(/\/$/, '')
}

const userStore = useUserStore()

const { template, pending, error } = storeToRefs(userStore)

const name = ref('WeddingTemplatePage')
const token = route.params.token
const inv = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const BASE = getBase()
    const res = await fetch(`${BASE}/api/v1/invite/${token}`)
    const json = await res.json()
    if (!res.ok) throw new Error(json.message || 'Invitation not found')
    inv.value = json.data
    fetch(`${BASE}/api/v1/invite/${token}/track`, { method: 'POST' }).catch(() => {})
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

// const TEMPLATE_MAP = {
//   classic:  Classic,
//   royal:    Royal,
//   modern:   Modern,
//   blossom:  Sakura,    // closest match: pink/floral
//   forest:   Garden,    // closest match: green/nature
//   midnight: Midnight,
//   vintage:  Rustic,    // closest match: warm/vintage
//   // direct component name aliases
//   garden:   Garden,
//   rustic:   Rustic,
//   sakura:   Sakura,
//   boho:     Boho,
//   celestial: Celestial,
//   tropical: Tropical,
// }

const templateComponent = computed(() => {
  const key = (inv.value?.activeTemplateKey || 'classic').toLowerCase()

  return (
    LETTER_TEMPLATES.find(
      t => t.key.toLowerCase() === key
    )?.component || LETTER_TEMPLATES[0].component
  )
})


definePageMeta({layout: false})
</script>

<style lang="scss">
.invite-page {
  min-height: 100vh;
  width: 100%;
  background: #f8f6f2;
  overflow-x: hidden;
}

.w-loading {
  min-height: 100vh;
  display: grid;
  place-items: center;
  font-family: var(--font-400);
  font-size: 1.1rem;
  color: #666;
}

// .w-loading {
//   min-height: 100vh;
//   display: grid;
//   place-items: center;
//   color: var(--w-text-soft);
//   font-family: var(--w-font-body);
// }
</style>