import { defineStore,acceptHMRUpdate } from 'pinia'
import { useCookie } from '#app'

export const useLayoutStore = defineStore('layout', {
  state: () => ({
    layout: 'navbar',

    // Better use stable key instead of title
    moduleKey: '',

    // UI display title
    moduleTitle: '',

    sidebarCollapsed: false,
    sidebarWidth: 250
  }),
  getters: {},

  // getters: {
  //   moduleTitle: (state) => {
  //     const titles: Record<string, string> = {
  //       dashboard: 'Dashboard',
  //       content: 'Content',
  //       users: 'Users',
  //       settings: 'Settings',
  //       analytics: 'Analytics'
  //     }

  //     return (
  //       titles[state.moduleKey] ||
  //       'Dashboard'
  //     )
  //   }
  // },

  actions: {
    /*
    |--------------------------------------------------------------------------
    | Layout
    |--------------------------------------------------------------------------
    */
    setLayout(layout: string) {
      this.layout = layout

      const cookie = useCookie('rty_layout')
      cookie.value = layout
    },

    /*
    |--------------------------------------------------------------------------
    | Module
    |--------------------------------------------------------------------------
    */
    setModule(module: {
      key: string
      title: string
    }) {
      console.log('module==================>', module)
      this.moduleKey = module.key
      this.moduleTitle = module.title

      useCookie('rty_module_key').value =
        module.key

      useCookie('rty_module_title').value =
        module.title
    },
    setModuleKey(key: string) {
          this.moduleKey = key

          useCookie('rty_module_key').value =
            key
        },

    clearModule() {
      this.moduleKey = ''
      this.moduleTitle = ''

      useCookie('rty_module_key').value = ''
      useCookie('rty_module_title').value = ''
    },

    /*
    |--------------------------------------------------------------------------
    | Sidebar
    |--------------------------------------------------------------------------
    */
    setSidebarCollapsed(
      collapsed: boolean
    ) {
      this.sidebarCollapsed = collapsed

      useCookie(
        'sidebar-collapsed'
      ).value = String(collapsed)
    },

    toggleSidebar() {
      this.sidebarCollapsed =
        !this.sidebarCollapsed

      useCookie(
        'sidebar-collapsed'
      ).value = String(
        this.sidebarCollapsed
      )
    },

    setSidebarWidth(width: number) {
      this.sidebarWidth = width

      useCookie('sidebar-width').value =
        String(width)
    },

    /*
    |--------------------------------------------------------------------------
    | Restore
    |--------------------------------------------------------------------------
    */
    restoreFromCookie() {
      /*
      Layout
      */
      const layout =
        useCookie('rty_layout').value

      if (layout) {
        this.layout = layout
      }

      /*
      Module
      */
      const moduleKey =
        useCookie(
          'rty_module_key'
        ).value

      const moduleTitle =
        useCookie(
          'rty_module_title'
        ).value

      if (moduleKey) {
        this.moduleKey = moduleKey
      }

      if (moduleTitle) {
        this.moduleTitle = moduleTitle
      }

      /*
      Sidebar
      */
      const collapsed =
        useCookie(
          'sidebar-collapsed'
        ).value

      const width =
        useCookie('sidebar-width').value

      this.sidebarCollapsed =
        collapsed === 'true'

      this.sidebarWidth =
        Number(width) || 250
    }
  }
})


// make sure to pass the right store definition, `useAuth` in this case.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useLayoutStore, import.meta.hot))
}