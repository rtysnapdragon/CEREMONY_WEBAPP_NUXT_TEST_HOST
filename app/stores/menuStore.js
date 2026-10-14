// stores/menuStore.ts
import { defineStore,acceptHMRUpdate } from 'pinia'
import menuData from '~/assets/json/menu_data.json'

export const useMenuStore1 = defineStore('menuData', {
  state: () => ({
    activeModule: null,
    moduleMenu: []
  }),
  getters: {},

  actions: {
    loadModule(title) {
      const module = menuData.find(m => m.title === title)
      this.activeModule = title
      this.moduleMenu = module?.menu || []
    }
  }
})


// make sure to pass the right store definition, `useAuth` in this case.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMenuStore1, import.meta.hot))
}
