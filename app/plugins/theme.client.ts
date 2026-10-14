export default defineNuxtPlugin(async () => {
  const themeStore = useThemeStore()
  // Initialize dark/light mode first (synchronous — reads localStorage)
  themeStore.initialize()
  // Then fetch server-side theme tokens and apply them
  await themeStore.fetchCurrent()
})
