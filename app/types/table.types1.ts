// ─────────────────────────────────────────────────────────────────────────────
// types/table.types.ts  –  Enterprise Table Type Definitions
// ─────────────────────────────────────────────────────────────────────────────

import type { ColumnDef, SortingState, ColumnFiltersState, VisibilityState, RowSelectionState, GroupingState, ExpandedState, PaginationState } from '@tanstack/vue-table'

// ── HTTP / API ────────────────────────────────────────────────────────────────

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface HttpRequestConfig<TBody = unknown> {
  url: string
  method?: HttpMethod
  params?: Record<string, unknown>
  data?: TBody
  headers?: Record<string, string>
  timeout?: number
  withCredentials?: boolean
}

export interface HttpResponse<T = unknown> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
}

export interface ApiError {
  message: string
  status?: number
  code?: string
  details?: unknown
}

// ── Pagination ────────────────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

// ── Sort / Filter / Group payloads sent to API ─────────────────────────────

export interface SortPayload {
  field: string
  direction: 'asc' | 'desc'
}

export interface FilterPayload {
  field: string
  operator: 'eq' | 'neq' | 'contains' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'between'
  value: unknown
}

export interface TableQueryPayload {
  page?: number
  pageSize?: number
  sort?: SortPayload[]
  filters?: FilterPayload[]
  groupBy?: string[]
  search?: string
}

// ── Column Definition Extensions ──────────────────────────────────────────────

export interface TableColumnMeta {
  /** If true, long cell content is clamped and shows expand modal */
  isClamp?: boolean
  /** Max lines before clamping */
  clampLines?: number
  /** Pin column left or right */
  pin?: 'left' | 'right'
  /** Min width in px */
  minWidth?: number
  /** Width in px */
  width?: number
  /** Max width in px */
  maxWidth?: number
  /** Required permission(s) to see this column */
  permission?: string | string[]
  /** Custom badge config */
  badge?: BadgeConfig
  /** Row action slot name */
  slot?: string
  /** Whether this column is exportable */
  exportable?: boolean
  /** Alignment */
  align?: 'left' | 'center' | 'right'
}

export interface BadgeConfig {
  colorMap?: Record<string, string>
  defaultColor?: string
}

export type EnterpriseColumnDef<TData> = ColumnDef<TData> & {
  meta?: TableColumnMeta
}

// ── API Source Config ─────────────────────────────────────────────────────────

export interface ApiSourceConfig {
  /** Real API endpoint (server-side mode) */
  url?: string
  /** Local data array (client-side mode) */
  data?: unknown[]
  /** HTTP method for fetching data (default: GET) */
  method?: HttpMethod
  /** Additional static params merged into every request */
  defaultParams?: Record<string, unknown>
  /** Transform raw API response → { data[], meta } */
  transform?: (raw: unknown) => PaginatedResponse<unknown>
}

// ── Row Action ────────────────────────────────────────────────────────────────

export interface RowAction<TData = unknown> {
  label: string
  icon?: string
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral'
  /** Hide action based on row data */
  hidden?: (row: TData) => boolean
  /** Disable action based on row data */
  disabled?: (row: TData) => boolean
  /** Required permission */
  permission?: string
  action: (row: TData) => void | Promise<void>
}

// ── Bulk Action ───────────────────────────────────────────────────────────────

export interface BulkAction<TData = unknown> {
  label: string
  icon?: string
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral'
  permission?: string
  action: (rows: TData[]) => void | Promise<void>
}

// ── Main Table Props ──────────────────────────────────────────────────────────

export interface EnterpriseTableProps<TData = unknown> {
  // ── Data source
  api: ApiSourceConfig

  // ── Columns
  columns: EnterpriseColumnDef<TData>[]

  // ── Features toggles
  serverSide?: boolean
  selectable?: boolean
  expandable?: boolean
  groupable?: boolean
  virtualScroll?: boolean
  virtualScrollHeight?: number   // px, default 500
  stickyHeader?: boolean
  exportCsv?: boolean
  columnVisibility?: boolean
  urlPersist?: boolean           // persist sort/filter/page in URL query

  // ── Pagination
  defaultPageSize?: number
  pageSizeOptions?: number[]
  hidePagination?: boolean

  // ── Actions
  rowActions?: RowAction<TData>[]
  bulkActions?: BulkAction<TData>[]

  // ── Permissions helper
  userPermissions?: string[]

  // ── Misc
  rowKey?: keyof TData
  searchPlaceholder?: string
  emptyText?: string
  loadingText?: string
  density?: 'compact' | 'default' | 'comfortable'
  striped?: boolean
  bordered?: boolean
}

// ── Emits ─────────────────────────────────────────────────────────────────────

export interface EnterpriseTableEmits<TData> {
  'row-click': [row: TData]
  'row-select': [rows: TData[]]
  'sort-change': [payload: SortPayload[]]
  'filter-change': [payload: FilterPayload[]]
  'page-change': [page: number, pageSize: number]
  'export': [rows: TData[]]
  'expand': [row: TData, expanded: boolean]
}

// ── Table State (exposed via defineExpose) ────────────────────────────────────

export interface EnterpriseTableExpose<TData> {
  refresh: () => Promise<void>
  resetFilters: () => void
  resetSorting: () => void
  getSelectedRows: () => TData[]
  clearSelection: () => void
  exportCsvNow: () => void
}
