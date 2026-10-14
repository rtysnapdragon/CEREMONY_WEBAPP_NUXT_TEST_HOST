// composables/useLocale.js — Locale & translation helpers
// All translations come from the API (translationStore). No bundled locale files needed.

export const useSarikaLocale = () => {
  const translationStore = useTranslationStore()

  // Reactive current language code from store (set by LanguageSwitcher via db_lang cookie)
  const locale = computed(() => translationStore.currentLang || 'en')

  const isKhmer   = computed(() => locale.value === 'km')
  const isEnglish = computed(() => locale.value === 'en')

  /**
   * tBy({ en: 'English text', km: 'Khmer text', zh: '中文' })
   * Returns the value for the currently active language, falls back to en.
   */
  const tBy = (map = {}) => {
    const lang = locale.value
    return map[lang] ?? map.en ?? Object.values(map)[0] ?? ''
  }

  // No-op — locale switching is handled by LanguageSwitcher via the API
  const switchLocale = () => {}
  const setLocaleByCode = () => {}

  const currentLocaleLabel = computed(() => {
    const labels = { km: 'ខ្មែរ', zh: '中文', fr: 'Français', ar: 'العربية' }
    return labels[locale.value] ?? 'English'
  })

  return {
    locale,
    isKhmer,
    isEnglish,
    tBy,
    switchLocale,
    setLocaleByCode,
    currentLocaleLabel,
  }
}
