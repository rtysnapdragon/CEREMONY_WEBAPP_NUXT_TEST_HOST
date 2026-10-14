// stores/useRTableStore.ts
// Pinia store — shared/cross-component table state
// Auto-imported by Nuxt 4 via #imports

import { defineStore,acceptHMRUpdate } from 'pinia'
import type { RTableColumn, RTableApi, RTableOptions } from '~/composables/useRTable'

export interface RTableStoreEntry {
  id: string
  // data: object
  data: any[]
  dataSrc: any[]
  selected: any[]
  total: number
  page: number
  pageSize: number
  search: string
  sort: { column: string; direction: 'asc' | 'desc' } | null
  loading: boolean
  columns: RTableColumn[]
  api: RTableApi | null
  options: RTableOptions

  columnFilters?: any[]
  columnOrder?: string[]
}
function getStorageKey(id: string) {
  return `r-table:${id}`
}
export const useRTableDataStore = defineStore('RTableData', {
  state: () => ({
    tables: {}, 
    data: {},
    row: null,
  }),
  getters: {
    getData: (state) => state.data,
    getTable:    (s) => (id: string) => s.tables[id],
    getSelected: (s) => (id: string): any[] => s.tables[id]?.selected ?? [],
    getTotal:    (s) => (id: string): number => s.tables[id]?.total ?? 0,
    isLoading:   (s) => (id: string): boolean => s.tables[id]?.loading ?? false,
  },

  actions: {

    init(id: string, opts: Partial<RTableStoreEntry> = {}) {
      if (!this.tables[id]) {
        const saved = process.client
        ? localStorage.getItem(getStorageKey(id))
        : null

        const persisted = saved ? JSON.parse(saved) : {}
        this.tables[id] = {
          id,
          data: [], dataSrc: [], selected: [],
          total: persisted.total ?? 0, 

      page: persisted.page ?? 1,
      pageSize: persisted.pageSize ?? opts.options?.pageSize ?? 10,

      search: '',
      sort: null,
      loading: false,

          // pageSize: opts.options?.pageSize ?? 10,
          columns: [], api: null,
          options: { showNoData: true, pageSizes: [10, 25, 50, 100] },
          ...opts,
        }
      }
    },

    clearAllData(stateKey) {
      if (isNotEmpty(stateKey)) {
        this.data = { ...this.data, ...{ [stateKey]: {} } };
      } else {
        this.data = {};
      }
    },
    clearData(stateKey) {
      if (isEmpty(stateKey)) return;
      this.data = {
        ...this.data,
        ...{ [stateKey]: { ...this.data[stateKey], ...{ data: [] } } },
      };
    },
    setData(data) {
      this.data = data;
    },
    upDateData(stateKey, obj) {
    //   const listTable = this.data[stateKey];
      if (isEmpty(this.data[stateKey])) return;
      if (isEmpty(obj)) return;

      if (this.data[stateKey]?.data?.some((e) => e.Id === obj.Id)) {
        this.data[stateKey].data = this.data[stateKey].data.map((e) => {
          if (e.Id === obj.Id) {
            return { ...e, ...obj };
          }
          return e;
        });

        console.log(obj, "===>>>", this.data[stateKey]);
      }
    },
    setRow(row) {
      this.row = row;
    },
    patch(id: string, payload: Partial<RTableStoreEntry>) {
      if (this.tables[id]) Object.assign(this.tables[id], payload)
    },

    setSelected(id: string, rows: any[]) {
      if (this.tables[id]) this.tables[id].selected = rows
    },

    clearSelected(id: string) {
      if (this.tables[id]) this.tables[id].selected = []
    },

    setLoading(id: string, val: boolean) {
      if (this.tables[id]) this.tables[id].loading = val
    },

    destroy(id: string) {
      delete this.tables[id]
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useRTableDataStore, import.meta.hot));
}