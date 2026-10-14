<template>
  <div
    :style="inviteTheme ? {
      '--inv-primary': inviteTheme.primary,
      '--inv-secondary': inviteTheme.secondary,
      '--inv-bg': inviteTheme.bg,
      '--inv-text': inviteTheme.text,
    } : {}"
  >
  {{ console.log("templateComponent========> ", templateComponent)}}
    <!-- Loading -->
    <div v-if="loading" class="min-h-screen flex flex-col items-center justify-center gap-4"
      :style="{ background: inviteTheme?.bg || '#0c0a06' }">
      <div class="w-14 h-14 rounded-full border-2 animate-spin"
        :style="{ borderColor: (inviteTheme?.primary || '#c9a84c') + '33', borderTopColor: inviteTheme?.primary || '#c9a84c' }" />
      <p :style="{ color: (inviteTheme?.primary || '#c9a84c') + '99', fontSize: '14px', letterSpacing: '0.2em', fontFamily: 'Hanuman,sans-serif' }">
        {{ tr('common.loading') }}
      </p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="min-h-screen flex flex-col items-center justify-center text-center p-8"
      :style="{ background: inviteTheme?.bg || '#0c0a06' }">
      <div class="text-6xl mb-4">💔</div>
      <p style="color:#ffffff99; font-size:16px; margin-bottom:8px;">{{ tr('invite.not_found') }}</p>
      <p style="color:#ffffff40; font-size:13px;">{{ error }}</p>
    </div>

    <!-- Dynamic template -->
    <component
      v-else-if="inv"
      :is="templateComponent"
      :inv="inv"
      :token="token"
      :theme="inviteTheme"
    />
  </div>
</template>

<script setup>
import Classic   from '~/components/InviteTemplate/Classic.vue'
import Garden    from '~/components/InviteTemplate/Garden.vue'
import Modern    from '~/components/InviteTemplate/Modern.vue'
import Royal     from '~/components/InviteTemplate/Royal.vue'
import Rustic    from '~/components/InviteTemplate/Rustic.vue'
import Sakura    from '~/components/InviteTemplate/Sakura.vue'
import Midnight  from '~/components/InviteTemplate/Midnight.vue'
import Boho      from '~/components/InviteTemplate/Boho.vue'
import Celestial from '~/components/InviteTemplate/Celestial.vue'
import Tropical  from '~/components/InviteTemplate/Tropical.vue'


import { parseInviteColors, INVITE_SCHEMES } from '~/composables/useInviteTheme'
import { BUILTIN_TEMPLATES ,LETTER_TEMPLATES} from '~/composables/useLetterData'

const activeTemplate = computed(() => {
  return (
    LETTER_TEMPLATES.find(t => t.key === props.templateProp
    // LETTER_TEMPLATES.find(t => t.key === props.letter.template
    )?.component ??
    LETTER_TEMPLATES[0].component
  )
})

definePageMeta({ layout: false })

const { tBy } = useSarikaLocale()
const { tr } = useTr()
const route = useRoute()
const token = route.params.token

function getBase() {
  const tmpServer = useCookie('tmp_server').value
  const { config } = helper()
  return (tmpServer || config.apiUrl || '').replace(/\/$/, '')
}

const loading = ref(true)
const error = ref('')
const inv = ref(null)

// Maps templateKey (from backend/BUILTIN_TEMPLATES) → InviteTemplate component
// BUILTIN_TEMPLATES ids: classic, royal, modern, blossom, forest, midnight, vintage
// InviteTemplate components: Classic, Garden, Modern, Royal, Rustic, Sakura, Midnight, Boho, Celestial, Tropical
const TEMPLATE_MAP = {
  classic:  Classic,
  royal:    Royal,
  modern:   Modern,
  blossom:  Sakura,    // closest match: pink/floral
  forest:   Garden,    // closest match: green/nature
  midnight: Midnight,
  vintage:  Rustic,    // closest match: warm/vintage
  // direct component name aliases
  garden:   Garden,
  rustic:   Rustic,
  sakura:   Sakura,
  boho:     Boho,
  celestial: Celestial,
  tropical: Tropical,
}

const templateComponent = computed(() => {
  const key = (inv.value?.activeTemplateKey || 'classic').toLowerCase()
  return TEMPLATE_MAP[key] || Classic
})

// Derive theme: prefer stored inviteColors JSON, fall back to BUILTIN_TEMPLATES vars, then INVITE_SCHEMES[0]
const inviteTheme = computed(() => {
  if (inv.value?.inviteColors) {
    const parsed = parseInviteColors(inv.value.inviteColors)
    if (parsed) return parsed
  }
  const key = (inv.value?.activeTemplateKey || 'classic').toLowerCase()
  const builtin = BUILTIN_TEMPLATES.find(t => t.id === key)
  if (builtin?.vars) {
    return {
      primary:   builtin.vars['--lt-primary']   || builtin.vars['--inv-primary']   || INVITE_SCHEMES[0].primary,
      secondary: builtin.vars['--lt-secondary'] || builtin.vars['--inv-secondary'] || INVITE_SCHEMES[0].secondary,
      bg:        builtin.vars['--lt-bg']        || builtin.vars['--inv-bg']        || INVITE_SCHEMES[0].bg,
      text:      builtin.vars['--lt-text']      || builtin.vars['--inv-text']      || INVITE_SCHEMES[0].text,
    }
  }
  return INVITE_SCHEMES[0]
})

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
</script>
