/**
 * Language tab helpers shared by all bilingual form composables.
 *
 * Usage:
 *   const { langStore, langTabItems, activeLangIndex, flagEmoji, emptyTranslations } = useLangTabs()
 *
 *   // In form defaultForm():
 *   translations: emptyTranslations(['name', 'description'])
 *   // → { name: { en: '', km: '', fr: '' }, description: { en: '', km: '', fr: '' } }
 *
 *   // In template:
 *   <RTab v-model="activeLangIndex" :items="langTabItems" not-clear-route>
 *     <template v-for="lang in langStore.activeItems" #[lang.code]>...</template>
 *   </RTab>
 */
export function useLangTabs() {
  const langStore = useLanguageStore()

  const activeLangIndex = ref(0)

  const activeLang = computed(
    () => langStore.activeItems[activeLangIndex.value]?.code ?? 'en'
  )

  const langTabItems = computed(() =>
    langStore.activeItems.map((l) => ({
      label: `${flagEmoji(l.flag)} ${l.code.toUpperCase()}`,
      slot: l.code,
    }))
  )

  /**
   * Converts an ISO-3166-1 alpha-2 country code to a flag emoji.
   * e.g. "GB" → "🇬🇧", "KH" → "🇰🇭"
   */
  const flagEmoji = (code) =>
    code
      ? [...code.toUpperCase()].map((c) => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0))).join('')
      : ''

  /**
   * Builds a blank translations map for the given field names,
   * keyed by every active language code.
   *
   * @param {string[]} fields  e.g. ['name', 'description']
   * @returns {{ [field]: { [langCode]: '' } }}
   */
  const emptyTranslations = (fields) => {
    const langs = langStore.activeItems.length
      ? langStore.activeItems
      : [{ code: 'en' }, { code: 'km' }]
    const map = {}
    fields.forEach((field) => {
      map[field] = {}
      langs.forEach((l) => { map[field][l.code] = '' })
    })
    return map
  }

  /**
   * Populates a translations map from an existing item's translations,
   * filling missing lang slots with empty strings.
   *
   * @param {object} existing  item.translations (may be undefined)
   * @param {string[]} fields
   */
  const populateTranslations = (existing, fields) => {
    const langs = langStore.activeItems.length
      ? langStore.activeItems
      : [{ code: 'en' }, { code: 'km' }]
    const map = {}
    fields.forEach((field) => {
      map[field] = {}
      langs.forEach((l) => {
        map[field][l.code] = existing?.[field]?.[l.code] ?? ''
      })
    })
    return map
  }

  /**
   * Translation display helper — reads from item.translations[field][locale],
   * falls back to item[field], then empty string.
   */
  const tr = (item, field) => {
    const { locale } = useSarikaLocale()
    return item?.translations?.[field]?.[locale.value] || item?.[field] || ''
  }

  return {
    langStore,
    activeLangIndex,
    activeLang,
    langTabItems,
    flagEmoji,
    emptyTranslations,
    populateTranslations,
    tr,
  }
}
