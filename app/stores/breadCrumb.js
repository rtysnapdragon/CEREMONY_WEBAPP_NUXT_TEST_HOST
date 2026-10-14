import { defineStore, acceptHMRUpdate } from "#imports";
export const useBreadCrumb22 = defineStore("breadCrumbStore", {
  state: () => ({
    data: {
      hasBack: false,
      toolTip: null,
      label: null,
      fnBack: () => {},
    },
  }),
  getters: {},

  actions: {
    add(d) {
      this.data = d;
    },
  },
});

// make sure to pass the right store definition, `useAuth` in this case.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useBreadCrumb22, import.meta.hot));
}
