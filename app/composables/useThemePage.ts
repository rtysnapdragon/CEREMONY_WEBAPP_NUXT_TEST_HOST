import { nextTick } from 'vue'
import type { ThemeItem, ThemePreset, ThemeTokenItem } from '~/stores/theme'

// ── Module-level constants (shared, not per-instance) ───────────────────────

export const DEFAULT_TOKENS: ThemeTokenItem[] = [
  { id: '', token: '--c-bg',       lightValue: '#f8f5f0',               darkValue: '#0a0a0b',               category: 'core',      description: 'Page background',          sortOrder: 1 },
  { id: '', token: '--c-surface',  lightValue: '#ffffff',               darkValue: '#1a1a1e',               category: 'core',      description: 'Surface / card background', sortOrder: 2 },
  { id: '', token: '--c-accent',   lightValue: '#ff8c42',               darkValue: '#ff8c42',               category: 'core',      description: 'Primary accent color',      sortOrder: 3 },
  { id: '', token: '--c-accent-2', lightValue: '#ffb347',               darkValue: '#ffb347',               category: 'core',      description: 'Secondary accent',          sortOrder: 4 },
  { id: '', token: '--c-border',   lightValue: 'rgba(255,140,66,0.16)', darkValue: 'rgba(255,140,66,0.20)', category: 'core',      description: 'Border color',              sortOrder: 5 },
  { id: '', token: '--c-text',     lightValue: '#1a1510',               darkValue: '#f0ece4',               category: 'core',      description: 'Primary text',              sortOrder: 6 },
  { id: '', token: '--c-muted',    lightValue: '#8a7f72',               darkValue: '#a9a9aa',               category: 'core',      description: 'Muted / secondary text',    sortOrder: 7 },
  { id: '', token: '--c-success',  lightValue: '#4ade80',               darkValue: '#4ade80',               category: 'semantic',  description: 'Success state',             sortOrder: 8 },
  { id: '', token: '--c-danger',   lightValue: '#f87171',               darkValue: '#f87171',               category: 'semantic',  description: 'Error / danger state',      sortOrder: 9 },
  { id: '', token: '--c-info',     lightValue: '#60a5fa',               darkValue: '#60a5fa',               category: 'semantic',  description: 'Info state',                sortOrder: 10 },
  { id: '', token: '--c-hover',    lightValue: 'rgba(133,129,127,0.15)',darkValue: 'rgba(85,85,85,0.2)',    category: 'component', description: 'Hover background',          sortOrder: 11 },
  { id: '', token: '--sidebar-bg', lightValue: '#f8f9fc',               darkValue: '#111318',               category: 'component', description: 'Sidebar background',        sortOrder: 12 },
  { id: '', token: '--card-bg',    lightValue: '#ffffff',               darkValue: '#1c1c1e',               category: 'component', description: 'Card background',           sortOrder: 13 },
  { id: '', token: '--c-active',   lightValue: '#ff8c42',               darkValue: '#ff8c42',               category: 'component', description: 'Active state color',        sortOrder: 14 },
]

export const DEFAULT_TOKEN_MAP: Record<string, { light: string; dark: string }> = {}
DEFAULT_TOKENS.forEach((t) => { DEFAULT_TOKEN_MAP[t.token] = { light: t.lightValue, dark: t.darkValue } })

export const TABS = [
  { id: 'core',       label: 'Core Tokens',  icon: 'ri-circle-fill' },
  { id: 'semantic',   label: 'Semantic',     icon: 'ri-info-fill' },
  { id: 'component',  label: 'Component',    icon: 'ri-layout-fill' },
  { id: 'typography', label: 'Typography',   icon: 'ri-text' },
  { id: 'spacing',    label: 'Spacing',      icon: 'ri-layout-column-line' },
  { id: 'radius',     label: 'Radius',       icon: 'ri-rounded-corner' },
  { id: 'shadow',     label: 'Shadow',       icon: 'ri-stack-line' },
  { id: 'presets',    label: 'Presets',      icon: 'ri-magic-line' },
]

export const INVITE_TOKEN_DEFS = [
  { token: '--inv-primary',   label: 'Primary Color',   description: 'Buttons, headings, key accents', lightValue: '#c9a84c', darkValue: '#c9a84c' },
  { token: '--inv-secondary', label: 'Secondary Color', description: 'Borders, subtle accents',        lightValue: '#a07830', darkValue: '#a07830' },
  { token: '--inv-bg',        label: 'Background',      description: 'Page/section background',        lightValue: '#1a1208', darkValue: '#1a1208' },
  { token: '--inv-text',      label: 'Text Color',      description: 'Body text on the invite',        lightValue: '#f5e6c8', darkValue: '#f5e6c8' },
]

export const COLOR_TABS = new Set(['core', 'semantic', 'component'])

export const DEFAULT_TYPOGRAPHY = {
  '--font-base':       'Inter, system-ui, -apple-system, sans-serif',
  '--font-heading':    'Inter, system-ui, -apple-system, sans-serif',
  '--font-body':       'Inter, system-ui, -apple-system, sans-serif',
  '--font-mono':       "'JetBrains Mono', 'Fira Mono', monospace",
  '--font-size-base':  '14px',
  '--font-weight-base':'400',
  '--line-height-base':'1.6',
  '--letter-spacing':  '0em',
}

export const TYPOGRAPHY_FIELDS = [
  { var: '--font-base',        label: 'Font Family',     hint: 'Base font stack',        type: 'text' },
  { var: '--font-heading',     label: 'Heading Font',    hint: 'H1–H6 font stack',       type: 'text' },
  { var: '--font-body',        label: 'Body Font',       hint: 'Paragraphs & labels',    type: 'text' },
  { var: '--font-mono',        label: 'Monospace Font',  hint: 'Code & tokens',          type: 'text' },
  { var: '--font-size-base',   label: 'Base Font Size',  hint: 'e.g. 14px or 0.875rem', type: 'text' },
  { var: '--font-weight-base', label: 'Font Weight',     hint: '400, 500, 600…',         type: 'text' },
  { var: '--line-height-base', label: 'Line Height',     hint: 'e.g. 1.5 or 24px',      type: 'text' },
  { var: '--letter-spacing',   label: 'Letter Spacing',  hint: 'e.g. 0em or 0.02em',    type: 'text' },
]

export const DEFAULT_SPACING = {
  '--sp-0-5': '2px', '--sp-1': '4px',  '--sp-2': '8px',  '--sp-3': '12px',
  '--sp-4':  '16px', '--sp-5': '20px', '--sp-6': '24px', '--sp-8': '32px',
  '--sp-10': '40px', '--sp-12': '48px','--sp-16': '64px',
}

export const SPACING_FIELDS = [
  { var: '--sp-0-5', label: 'Space 0.5', defaultVal: '2px'  },
  { var: '--sp-1',   label: 'Space 1',   defaultVal: '4px'  },
  { var: '--sp-2',   label: 'Space 2',   defaultVal: '8px'  },
  { var: '--sp-3',   label: 'Space 3',   defaultVal: '12px' },
  { var: '--sp-4',   label: 'Space 4',   defaultVal: '16px' },
  { var: '--sp-5',   label: 'Space 5',   defaultVal: '20px' },
  { var: '--sp-6',   label: 'Space 6',   defaultVal: '24px' },
  { var: '--sp-8',   label: 'Space 8',   defaultVal: '32px' },
  { var: '--sp-10',  label: 'Space 10',  defaultVal: '40px' },
  { var: '--sp-12',  label: 'Space 12',  defaultVal: '48px' },
  { var: '--sp-16',  label: 'Space 16',  defaultVal: '64px' },
]

export const DEFAULT_RADIUS = {
  '--r-none': '0px', '--r-sm': '4px', '--r-md': '8px',  '--r-lg': '12px',
  '--r-xl': '16px', '--r-2xl': '24px','--r-full': '9999px',
}

export const RADIUS_FIELDS = [
  { var: '--r-none', label: 'None',  defaultVal: '0px',    preview: 0 },
  { var: '--r-sm',   label: 'Small', defaultVal: '4px',    preview: 4 },
  { var: '--r-md',   label: 'Medium',defaultVal: '8px',    preview: 8 },
  { var: '--r-lg',   label: 'Large', defaultVal: '12px',   preview: 12 },
  { var: '--r-xl',   label: 'XL',    defaultVal: '16px',   preview: 16 },
  { var: '--r-2xl',  label: '2XL',   defaultVal: '24px',   preview: 24 },
  { var: '--r-full', label: 'Full',  defaultVal: '9999px', preview: 9999 },
]

export const DEFAULT_SHADOWS = {
  '--shadow-xs':    '0 1px 2px rgba(0,0,0,0.07)',
  '--shadow-sm':    '0 2px 6px rgba(0,0,0,0.10)',
  '--shadow-md':    '0 4px 12px rgba(0,0,0,0.12)',
  '--shadow-lg':    '0 8px 24px rgba(0,0,0,0.14)',
  '--shadow-xl':    '0 16px 40px rgba(0,0,0,0.16)',
  '--shadow-2xl':   '0 24px 64px rgba(0,0,0,0.20)',
  '--shadow-inner': 'inset 0 2px 4px rgba(0,0,0,0.08)',
}

export const SHADOW_FIELDS = [
  { var: '--shadow-xs',    label: 'XS',           defaultVal: '0 1px 2px rgba(0,0,0,0.07)'   },
  { var: '--shadow-sm',    label: 'SM',           defaultVal: '0 2px 6px rgba(0,0,0,0.10)'   },
  { var: '--shadow-md',    label: 'MD',           defaultVal: '0 4px 12px rgba(0,0,0,0.12)'  },
  { var: '--shadow-lg',    label: 'LG',           defaultVal: '0 8px 24px rgba(0,0,0,0.14)'  },
  { var: '--shadow-xl',    label: 'XL',           defaultVal: '0 16px 40px rgba(0,0,0,0.16)' },
  { var: '--shadow-2xl',   label: '2XL',          defaultVal: '0 24px 64px rgba(0,0,0,0.20)' },
  { var: '--shadow-inner', label: 'Inner Shadow', defaultVal: 'inset 0 2px 4px rgba(0,0,0,0.08)' },
]

export const PREVIEW_TOKENS = [
  { var: '--c-bg' }, { var: '--c-surface' }, { var: '--c-accent' }, { var: '--c-border' },
  { var: '--c-text' }, { var: '--c-muted' }, { var: '--c-success' }, { var: '--c-danger' },
]

// ── Composable ───────────────────────────────────────────────────────────────

export function useThemePage() {
  const themeStore = useThemeStore()
  const toast      = useToastStore()
  const authStore  = useAuthStore()

  // ── Editor state ───────────────────────────────────────────────────────────
  const selectedThemeId = ref<string | null>(null)
  const editTokens      = reactive<Record<string, { light: string; dark: string }>>({})
  const activeTab       = ref<string>('core')
  const showPreview     = ref(true)
  const previewDark     = ref(false)
  const saving          = ref(false)
  const sidebarSearch   = ref('')

  const editTypography = reactive<Record<string, string>>({ ...DEFAULT_TYPOGRAPHY })
  const editSpacing    = reactive<Record<string, string>>({ ...DEFAULT_SPACING })
  const editRadius     = reactive<Record<string, string>>({ ...DEFAULT_RADIUS })
  const editShadows    = reactive<Record<string, string>>({ ...DEFAULT_SHADOWS })

  // ── Color picker state ─────────────────────────────────────────────────────
  const pickerTarget = ref<{ token: string; mode: 'light' | 'dark' } | null>(null)
  const pickerPos    = ref({ x: 200, y: 200 })

  // ── Create / Edit drawer state ─────────────────────────────────────────────
  const showDrawer    = ref(false)
  const editingTheme  = ref<ThemeItem | null>(null)
  const drawerSaving  = ref(false)
  const form          = reactive({ name: '', code: '', description: '', type: 'APP' })
  const errors        = reactive<Record<string, string>>({})

  // ── Delete state ───────────────────────────────────────────────────────────
  const deletingTheme = ref<ThemeItem | null>(null)
  const deleting      = ref(false)

  // ── Import file ref ────────────────────────────────────────────────────────
  const importFileRef = ref<HTMLInputElement | null>(null)

  // ── Computed ───────────────────────────────────────────────────────────────
  const appThemes = computed(() => themeStore.themes.filter((t) => t.type !== 'INVITATION'))

  const filteredThemes = computed(() => {
    if (!sidebarSearch.value.trim()) return appThemes.value
    const q = sidebarSearch.value.toLowerCase()
    return appThemes.value.filter(
      (t) => t.name.toLowerCase().includes(q) || t.code.toLowerCase().includes(q),
    )
  })

  const selectedTheme = computed<ThemeItem | null>(() =>
    themeStore.themes.find((t) => t.id === selectedThemeId.value) ?? null,
  )

  const tabTokens = computed<ThemeTokenItem[]>(() => {
    if (!selectedTheme.value || !COLOR_TABS.has(activeTab.value)) return []
    const tokens = selectedTheme.value.tokens?.length ? selectedTheme.value.tokens : DEFAULT_TOKENS
    return tokens
      .filter((t) => t.category === activeTab.value)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
  })

  const previewStyle = computed<Record<string, string>>(() => {
    const mode = previewDark.value ? 'dark' : 'light'
    const style: Record<string, string> = {}
    for (const [varName, vals] of Object.entries(editTokens)) {
      const val = vals[mode]
      if (val) style[varName] = val
    }
    for (const [v, val] of Object.entries(editTypography)) { if (val) style[v] = val }
    for (const [v, val] of Object.entries(editSpacing))    { if (val) style[v] = val }
    for (const [v, val] of Object.entries(editRadius))     { if (val) style[v] = val }
    for (const [v, val] of Object.entries(editShadows))    { if (val) style[v] = val }
    return style
  })

  // ── Drag logic for color picker ────────────────────────────────────────────
  let _drag: { startX: number; startY: number; origX: number; origY: number } | null = null

  function startDrag(e: MouseEvent) {
    _drag = { startX: e.clientX, startY: e.clientY, origX: pickerPos.value.x, origY: pickerPos.value.y }
    document.addEventListener('mousemove', onDragMove)
    document.addEventListener('mouseup', stopDrag)
  }
  function onDragMove(e: MouseEvent) {
    if (!_drag) return
    pickerPos.value = {
      x: Math.max(0, _drag.origX + e.clientX - _drag.startX),
      y: Math.max(0, _drag.origY + e.clientY - _drag.startY),
    }
  }
  function stopDrag() {
    _drag = null
    document.removeEventListener('mousemove', onDragMove)
    document.removeEventListener('mouseup', stopDrag)
  }

  // ── Token methods ──────────────────────────────────────────────────────────
  const toCode = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const activeTabs = computed(() => TABS)

  function selectTheme(theme: ThemeItem) {
    selectedThemeId.value = theme.id
    activeTab.value = 'core'
    const tokenList = theme.tokens?.length ? theme.tokens : DEFAULT_TOKENS
    tokenList.forEach((t) => {
      editTokens[t.token] = { light: t.lightValue ?? '', dark: t.darkValue ?? '' }
    })
    DEFAULT_TOKENS.forEach((d) => {
      if (!editTokens[d.token]) editTokens[d.token] = { light: d.lightValue, dark: d.darkValue }
    })
    INVITE_TOKEN_DEFS.forEach((d) => {
      if (!editTokens[d.token]) editTokens[d.token] = { light: d.lightValue, dark: d.darkValue }
    })
    const extras: Record<string, string> = theme.extras ?? {}
    for (const f of TYPOGRAPHY_FIELDS) editTypography[f.var] = extras[f.var] ?? DEFAULT_TYPOGRAPHY[f.var as keyof typeof DEFAULT_TYPOGRAPHY] ?? ''
    for (const f of SPACING_FIELDS)    editSpacing[f.var]    = extras[f.var] ?? DEFAULT_SPACING[f.var as keyof typeof DEFAULT_SPACING] ?? ''
    for (const f of RADIUS_FIELDS)     editRadius[f.var]     = extras[f.var] ?? DEFAULT_RADIUS[f.var as keyof typeof DEFAULT_RADIUS] ?? ''
    for (const f of SHADOW_FIELDS)     editShadows[f.var]    = extras[f.var] ?? DEFAULT_SHADOWS[f.var as keyof typeof DEFAULT_SHADOWS] ?? ''
  }

  function onTokenChange(varName: string, mode: 'light' | 'dark', value: string) {
    if (!editTokens[varName]) editTokens[varName] = { light: '', dark: '' }
    editTokens[varName][mode] = value
  }

  function resetToken(varName: string) {
    const def = DEFAULT_TOKEN_MAP[varName]
    if (!def) return
    editTokens[varName] = { ...def }
  }

  function togglePicker(e: MouseEvent, token: string, mode: 'light' | 'dark') {
    if (pickerTarget.value?.token === token && pickerTarget.value?.mode === mode) {
      pickerTarget.value = null
      return
    }
    const x = Math.min(e.clientX + 12, window.innerWidth - 320)
    const y = Math.min(e.clientY + 12, window.innerHeight - 400)
    pickerPos.value = { x, y }
    pickerTarget.value = { token, mode }
  }

  function toHex(value: string): string {
    if (!value) return '#000000'
    if (/^#[0-9a-fA-F]{3,8}$/.test(value)) {
      return value.length === 4
        ? `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`
        : value.substring(0, 7)
    }
    return '#000000'
  }

  function applyPickerColor(token: string, mode: 'light' | 'dark', hex: string) {
    if (!editTokens[token]) editTokens[token] = { light: '', dark: '' }
    editTokens[token][mode] = hex
    onTokenChange(token, mode, hex)
  }

  function currentValue(varName: string): string {
    const t = editTokens[varName]
    if (!t) return ''
    return previewDark.value ? t.dark : t.light
  }

  function buildExtrasForCategory(category: 'typography' | 'spacing' | 'radius' | 'shadow'): Record<string, string> {
    const existing: Record<string, string> = { ...((selectedTheme.value as any)?.extras ?? {}) }
    const source =
      category === 'typography' ? editTypography :
      category === 'spacing'    ? editSpacing    :
      category === 'radius'     ? editRadius     :
                                  editShadows
    for (const [k, v] of Object.entries(source)) existing[k] = v
    return existing
  }

  async function saveTokens() {
    if (!selectedThemeId.value) return
    saving.value = true
    try {
      const tab = activeTab.value
      let payload: Record<string, unknown>

      if (tab === 'invitation') {
        const tokens = INVITE_TOKEN_DEFS.map((def, i) => ({
          token: def.token,
          lightValue: editTokens[def.token]?.light ?? def.lightValue,
          darkValue:  editTokens[def.token]?.dark  ?? def.darkValue,
          category: 'invitation',
          description: def.description,
          sortOrder: i,
        }))
        payload = { tokens }
      } else if (COLOR_TABS.has(tab)) {
        const sourceTokens = selectedTheme.value?.tokens?.length ? selectedTheme.value.tokens : DEFAULT_TOKENS
        const tokens = Object.entries(editTokens).map(([token, vals]) => {
          const src = sourceTokens.find((t) => t.token === token)
          const def = DEFAULT_TOKENS.find((t) => t.token === token)
          return {
            token,
            lightValue: vals.light,
            darkValue:  vals.dark,
            category:    src?.category    ?? def?.category    ?? 'core',
            description: src?.description ?? def?.description ?? '',
            sortOrder:   src?.sortOrder   ?? def?.sortOrder   ?? 0,
          }
        })
        payload = { tokens }
      }
      else if (tab === 'typography' || tab === 'spacing' || tab === 'radius' || tab === 'shadow') {
        payload = { extras: buildExtrasForCategory(tab) }
      }
      else {
        return // presets tab — nothing to save
      }

      const result = await themeStore.updateTheme(selectedThemeId.value, payload)
      if (result.error) { toast.add(result.error, 'Error'); return }

      toast.add('Saved', 'Saved')
      await themeStore.fetchThemes()

      const isActive = themeStore.themes.find((t) => t.id === selectedThemeId.value)?.isDefault
      if (isActive) await themeStore.fetchCurrent()

      const root = document.documentElement
      if (COLOR_TABS.has(tab)) {
        const appMode = themeStore.isDark ? 'dark' : 'light'
        for (const [varName, vals] of Object.entries(editTokens)) {
          const val = vals[appMode]
          if (val) root.style.setProperty(varName, val)
        }
      }
      else {
        const source =
          tab === 'typography' ? editTypography :
          tab === 'spacing'    ? editSpacing    :
          tab === 'radius'     ? editRadius     :
                                 editShadows
        for (const [k, v] of Object.entries(source)) {
          if (v) root.style.setProperty(k, v)
        }
      }
    }
    finally {
      saving.value = false
    }
  }

  // ── Theme actions ──────────────────────────────────────────────────────────
  async function doActivate(theme: ThemeItem) {
    const result = await themeStore.activateTheme(theme.id)
    if (result.error) { toast.add(result.error, 'Error'); return }
    toast.add(`"${theme.name}" is now the active theme`, 'Activated')
    const activated = themeStore.themes.find((t) => t.id === theme.id)
    if (activated) {
      const tokenList = activated.tokens?.length ? activated.tokens : DEFAULT_TOKENS
      tokenList.forEach((t) => { editTokens[t.token] = { light: t.lightValue ?? '', dark: t.darkValue ?? '' } })
      const appMode = themeStore.isDark ? 'dark' : 'light'
      const root = document.documentElement
      tokenList.forEach((t) => {
        const val = appMode === 'light' ? t.lightValue : t.darkValue
        if (val) root.style.setProperty(t.token, val)
      })
      const activatedExtras: Record<string, string> = (activated as any).extras ?? {}
      for (const [k, v] of Object.entries(activatedExtras)) { if (v) root.style.setProperty(k, v) }
    }
  }

  async function doToggleActive(theme: ThemeItem) {
    const next = !theme.isActive
    const result = await themeStore.toggleActive(theme.id, next)
    if (result.error) toast.add(result.error, 'Error')
    else toast.add(`"${theme.name}" ${next ? 'enabled' : 'disabled'}`, 'Done')
  }

  async function doDuplicate(theme: ThemeItem) {
    const result = await themeStore.duplicateTheme(theme.id)
    if (result.error) toast.add(result.error, 'Error')
    else {
      toast.add(`Duplicated "${theme.name}"`, 'Done')
      if (result.data) selectTheme(result.data)
    }
  }

  async function doExport(theme: ThemeItem) {
    try {
      const json = await themeStore.exportTheme(theme.id)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `theme-${theme.code ?? theme.id}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.add('Theme exported', 'Export')
    }
    catch { toast.add('Export failed', 'Error') }
  }

  async function onImportFile(e: Event) {
    const files = Array.from((e.target as HTMLInputElement).files ?? [])
    if (!files.length) return

    let ok = 0
    let fail = 0
    let lastImported: any = null

    for (const file of files) {
      try {
        const text = await file.text()
        const json = JSON.parse(text)

        // Support merged file: array of themes OR single theme object
        const themes: object[] = Array.isArray(json) ? json : [json]

        for (const theme of themes) {
          const result = await themeStore.importTheme(theme)
          if (result.error) { fail++; continue }
          ok++
          lastImported = result.data
        }
      } catch {
        fail++
      }
    }

    if (importFileRef.value) importFileRef.value.value = ''

    if (ok > 0) {
      toast.add(`${ok} theme${ok > 1 ? 's' : ''} imported`, 'Import')
      if (lastImported) selectTheme(lastImported)
    }
    if (fail > 0) toast.add(`${fail} theme${fail > 1 ? 's' : ''} failed`, 'Import Error')
  }

  function previewPreset(preset: ThemePreset) {
    try {
      const tokens: Record<string, { light: string; dark: string }> = JSON.parse(preset.tokensJson)
      themeStore.applyPreview(tokens)
      Object.entries(tokens).forEach(([k, v]) => { editTokens[k] = v })
    }
    catch { toast.add('Invalid preset tokens', 'Error') }
  }

  async function applyPresetConfirm(preset: ThemePreset) {
    if (!selectedThemeId.value) { toast.add('Select a theme first', 'Error'); return }
    const result = await themeStore.applyPreset(selectedThemeId.value, preset.id)
    if (result.error) toast.add(result.error, 'Error')
    else {
      toast.add(`Preset "${preset.name}" applied`, 'Preset')
      await themeStore.fetchThemes()
      const theme = themeStore.themes.find((t) => t.id === selectedThemeId.value)
      if (theme) selectTheme(theme)
    }
  }

  // ── Create / Edit drawer ───────────────────────────────────────────────────
  function openCreate() {
    editingTheme.value = null
    Object.assign(form, { name: '', code: '', description: '', type: 'APP' })
    Object.keys(errors).forEach((k) => delete errors[k])
    showDrawer.value = true
  }

  function openEditModal(theme: ThemeItem) {
    editingTheme.value = theme
    Object.assign(form, { name: theme.name, code: theme.code, description: theme.description ?? '', type: (theme as any).type ?? 'APP' })
    Object.keys(errors).forEach((k) => delete errors[k])
    showDrawer.value = true
  }

  function closeDrawer() {
    showDrawer.value = false
    editingTheme.value = null
    Object.keys(errors).forEach((k) => delete errors[k])
  }

  async function saveTheme() {
    Object.keys(errors).forEach((k) => delete errors[k])
    if (!form.name.trim()) { errors.name = 'Name is required.'; return }
    drawerSaving.value = true
    try {
      if (editingTheme.value) {
        const result = await themeStore.updateTheme(editingTheme.value.id, { ...form })
        if (result.error) toast.add(result.error, 'Error')
        else { toast.add('Theme updated', 'Updated'); closeDrawer() }
      }
      else {
        const result = await themeStore.createTheme({
          ...form,
          tokens: DEFAULT_TOKENS.map((t) => ({
            token: t.token, lightValue: t.lightValue, darkValue: t.darkValue,
            category: t.category, description: t.description, sortOrder: t.sortOrder,
          })),
        })
        if (result.error) toast.add(result.error, 'Error')
        else {
          toast.add('Theme created', 'Created')
          closeDrawer()
          if (result.data) selectTheme(result.data)
        }
      }
    }
    finally { drawerSaving.value = false }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  function confirmDelete(theme: ThemeItem) {
    deletingTheme.value = theme
  }

  async function doDelete() {
    if (!deletingTheme.value) return
    deleting.value = true
    try {
      const result = await themeStore.deleteTheme(deletingTheme.value.id)
      if (result.error) toast.add(result.error, 'Error')
      else {
        toast.add('Theme deleted', 'Deleted')
        if (selectedThemeId.value === deletingTheme.value.id) selectedThemeId.value = null
        deletingTheme.value = null
      }
    }
    finally { deleting.value = false }
  }

  // ── Color picker helpers ───────────────────────────────────────────────────
  function closePicker() { pickerTarget.value = null }
  function onKeyDown(e: KeyboardEvent) { if (e.key === 'Escape') pickerTarget.value = null }

  // ── Init / Cleanup ─────────────────────────────────────────────────────────
  const init = async () => {
    await nextTick()
    await themeStore.fetchThemes()
    await themeStore.fetchPresets()
    const def = themeStore.themes.find((t) => t.isDefault) ?? themeStore.themes[0]
    if (def) selectTheme(def)
    document.addEventListener('click', closePicker)
    document.addEventListener('keydown', onKeyDown)
  }

  const cleanup = () => {
    document.removeEventListener('click', closePicker)
    document.removeEventListener('keydown', onKeyDown)
    stopDrag()
  }

  // ── Watch ──────────────────────────────────────────────────────────────────
  watch(
    () => selectedTheme.value?.id,
    () => {
      const theme = selectedTheme.value
      if (theme) selectTheme(theme)
    },
  )

  watch(
    () => authStore.isAuthenticated,
    (val) => { if (val && !themeStore.themes.length && !themeStore.loading) themeStore.fetchThemes() },
  )

  return {
    // stores
    themeStore,
    authStore,
    // editor state
    selectedThemeId, editTokens, activeTab, showPreview, previewDark, saving, sidebarSearch,
    editTypography, editSpacing, editRadius, editShadows,
    // color picker
    pickerTarget, pickerPos,
    // drawer state
    showDrawer, editingTheme, drawerSaving, form, errors,
    // delete state
    deletingTheme, deleting,
    // refs
    importFileRef,
    // computed
    filteredThemes, selectedTheme, tabTokens, previewStyle, activeTabs,
    // token methods
    toCode, selectTheme, onTokenChange, resetToken, togglePicker, toHex, applyPickerColor,
    currentValue, buildExtrasForCategory, saveTokens,
    // theme actions
    doActivate, doToggleActive, doDuplicate, doExport, onImportFile, previewPreset, applyPresetConfirm,
    // drawer
    openCreate, openEditModal, closeDrawer, saveTheme,
    // delete
    confirmDelete, doDelete,
    // drag
    startDrag,
    // lifecycle
    init, cleanup,
  }
}
