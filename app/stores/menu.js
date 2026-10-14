import { defineStore, acceptHMRUpdate } from "#imports";
import menuData from '~/assets/json/data_menu.json'

export const useMenuStore = defineStore("MenuStore", {
  state: () => ({
    loading: true,
    current: null,
    data: [],
    selected: null,
  }),
  getters: {
    getLoading: (state) => state.loading,
    getCurrent: (state) => state.current,
    getData: (state) => state.data,
    getSelectedData: (state) => {
      console.log("State data =============> ",state.data)
      return state.data?.filter((e) => e.title == state.selected);
    },
    getParent: (state) => {
      return state;
    },
  },
  actions: {
    setCurrent(data) {
      this.current = data;
    },
    getActionPermission(permission) {
      if (isEmpty(permission)) return 1;
      if (permission.toLowerCase() == "dev") return 1;
      const p = this.current?.actions?.find(
        (v) => v.Name.toLowerCase() == permission.toLowerCase()
      );
      if (isEmpty(p)) return 0;
      return p.Value;
    },
    setSelected(title) {
      this.selected = title;
    },
    clear() {
      this.data = [];
    },
    async get() {
      this.loading = true;

      const data = await useMenu();

      this.data = data;

      this.loading = false;
    },
    loadModule(title) {
      const module = menuData.find(m => m.title === title)
      this.activeModule = title
      this.moduleMenu = module?.menu || []
    }
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMenuStore, import.meta.hot));
}
