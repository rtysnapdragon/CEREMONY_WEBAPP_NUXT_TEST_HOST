// plugins/translations.js
// All translations come from the API. Language is stored in db_lang cookie only.
// No URL prefixes, no i18n_redirected — fully dynamic switching.

export default defineNuxtPlugin(async () => {
  const translationStore = useTranslationStore()
  const dbLangCookie = useCookie('db_lang', { default: () => 'en' })
  await translationStore.loadLanguage(dbLangCookie.value || 'en')
})
