// /stores/mode.ts
import { defineStore,acceptHMRUpdate } from 'pinia'

export const useModeStore = defineStore('mode', {
  state: () => ({
    darkMode: false
  }),
  getters: {},

  actions: {
    set(value: boolean) {
      this.darkMode = value
    },
    toggle() {
      this.darkMode = !this.darkMode
    }
  }
})


// make sure to pass the right store definition, `useAuth` in this case.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useModeStore, import.meta.hot))
}
