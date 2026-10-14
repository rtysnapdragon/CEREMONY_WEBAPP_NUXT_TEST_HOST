// ============================================================
// useTableEngine – TanStack Table Engine Layer (JS)
// Responsible for: row models, sorting, filtering, grouping,
//                  selection, visibility, pinning, expand
// ============================================================

import {
  useVueTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
} from '@tanstack/vue-table'
import { ref, computed } from 'vue'

// ─── Column CSS style helper (exported for DataTable.vue) ─────

/**
 * Returns an inline-style object from column meta width hints.
 * @param {{ width?: string, minWidth?: string, maxWidth?: string } | undefined} meta
 * @returns {Record<string, string>}
 */
export function getColumnStyle(meta) {
  const style = {}
  if (meta?.width)    style['width']     = meta.width
  if (meta?.minWidth) style['min-width'] = meta.minWidth
  if (meta?.maxWidth) style['max-width'] = meta.maxWidth
  return style
}

// ─── Role-based column filter (exported for DataTable.vue) ────

/**
 * Strips columns whose meta.allowedRoles doesn't include any of userRoles.
 * Columns without allowedRoles are always visible.
 * @param {any[]} columns
 * @param {string[]} userRoles
 * @returns {any[]}
 */
export function filterColumnsByRole(columns, userRoles) {
  return columns.filter(col => {
    const allowed = col.meta?.allowedRoles
    if (!allowed || allowed.length === 0) return true
    return allowed.some(r => userRoles.includes(r))
  })
}

// ─── Composable ───────────────────────────────────────────────

/**
 * @param {{
 *   data: import('vue').Ref<any[]>,
 *   columns: any[],
 *   userRoles?: string[],
 *   sorting: import('vue').Ref<any[]>,
 *   columnFilters: import('vue').Ref<any[]>,
 *   globalSearch: import('vue').Ref<string>,
 *   pagination: import('vue').Ref<{ pageIndex: number, pageSize: number }>,
 *   serverSide?: boolean,
 *   selectable?: boolean,
 *   groupable?: boolean,
 *   pageCount?: import('vue').Ref<number>
 * }} opts
 */
export function useTableEngine(opts) {
  // ── Internal state ─────────────────────────────────────────
  const rowSelection     = ref({})
  const columnVisibility = ref({})
  const grouping         = ref([])
  const expanded         = ref({})
  const columnPinning    = ref({ left: [], right: [] })

  // ── Permission-filtered columns (reactive) ─────────────────
  const visibleColumns = computed(() =>
    filterColumnsByRole(opts.columns, opts.userRoles ?? [])
  )

  // ── Auto-initialise pinning from column meta ───────────────
  ;(function initPinning() {
    const left  = []
    const right = []
    for (const col of opts.columns) {
      const id  = col.id ?? col.accessorKey ?? ''
      const pin = col.meta?.pin
      if (pin === 'left')  left.push(id)
      if (pin === 'right') right.push(id)
    }
    columnPinning.value = { left, right }
  })()

  // ── TanStack Table instance ────────────────────────────────
  const table = useVueTable({
    // Data + columns via getters so Vue tracks reactivity
    get data()    { return opts.data.value },
    get columns() { return visibleColumns.value },

    state: {
      get sorting()         { return opts.sorting.value },
      get columnFilters()   { return opts.columnFilters.value },
      get globalFilter()    { return opts.globalSearch.value },
      get pagination()      { return opts.pagination.value },
      get rowSelection()    { return rowSelection.value },
      get columnVisibility(){ return columnVisibility.value },
      get grouping()        { return grouping.value },
      get expanded()        { return expanded.value },
      get columnPinning()   { return columnPinning.value },
    },

    // ── Server-side manual overrides ──────────────────────────
    manualPagination: opts.serverSide ?? false,
    manualSorting:    opts.serverSide ?? false,
    manualFiltering:  opts.serverSide ?? false,
    // pageCount must be supplied externally when server-side
    pageCount: opts.serverSide && opts.pageCount ? opts.pageCount.value : undefined,

    // ── Row models ────────────────────────────────────────────
    getCoreRowModel:       getCoreRowModel(),
    getSortedRowModel:     getSortedRowModel(),
    getFilteredRowModel:   getFilteredRowModel(),
    getGroupedRowModel:    getGroupedRowModel(),
    getExpandedRowModel:   getExpandedRowModel(),
    // Client-side pagination only; server-side handles its own paging
    getPaginationRowModel: opts.serverSide ? undefined : getPaginationRowModel(),

    // ── State setters – proxy back to parent refs ─────────────
    onSortingChange: updater => {
      opts.sorting.value = typeof updater === 'function'
        ? updater(opts.sorting.value) : updater
    },
    onColumnFiltersChange: updater => {
      opts.columnFilters.value = typeof updater === 'function'
        ? updater(opts.columnFilters.value) : updater
    },
    onGlobalFilterChange: updater => {
      opts.globalSearch.value = typeof updater === 'function'
        ? updater(opts.globalSearch.value) : updater
    },
    onPaginationChange: updater => {
      opts.pagination.value = typeof updater === 'function'
        ? updater(opts.pagination.value) : updater
    },
    onRowSelectionChange: updater => {
      rowSelection.value = typeof updater === 'function'
        ? updater(rowSelection.value) : updater
    },
    onColumnVisibilityChange: updater => {
      columnVisibility.value = typeof updater === 'function'
        ? updater(columnVisibility.value) : updater
    },
    onGroupingChange: updater => {
      grouping.value = typeof updater === 'function'
        ? updater(grouping.value) : updater
    },
    onExpandedChange: updater => {
      expanded.value = typeof updater === 'function'
        ? updater(expanded.value) : updater
    },
    onColumnPinningChange: updater => {
      columnPinning.value = typeof updater === 'function'
        ? updater(columnPinning.value) : updater
    },

    // ── Feature flags ─────────────────────────────────────────
    enableRowSelection:      opts.selectable ?? false,
    enableMultiRowSelection: opts.selectable ?? false,
    enableGrouping:          opts.groupable  ?? false,
    enableColumnPinning:     true,
    enableSortingRemoval:    true,
  })

  // ── Derived helpers ────────────────────────────────────────

  /** All currently selected row originals */
  const selectedRows = computed(() =>
    table.getSelectedRowModel().rows.map(r => r.original)
  )

  /** True when at least one row is selected */
  const hasSelection = computed(() => Object.keys(rowSelection.value).length > 0)

  /** Deselect all rows */
  function clearSelection() {
    rowSelection.value = {}
  }

  /**
   * Toggle a column in the grouping state.
   * @param {string} columnId
   */
  function toggleGroupBy(columnId) {
    const current = grouping.value
    grouping.value = current.includes(columnId)
      ? current.filter(id => id !== columnId)
      : [...current, columnId]
  }

  /**
   * Programmatically pin a column.
   * @param {string} columnId
   * @param {'left' | 'right' | false} position  – false to unpin
   */
  function pinColumn(columnId, position) {
    table.getColumn(columnId)?.pin(position)
  }

  return {
    table,
    rowSelection,
    columnVisibility,
    grouping,
    expanded,
    columnPinning,
    selectedRows,
    hasSelection,
    clearSelection,
    toggleGroupBy,
    pinColumn,
    visibleColumns,
  }
}
