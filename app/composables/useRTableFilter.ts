// composables/useRTableFilter.ts
// Reactive filter state that can be v-modeled from a parent component.
// Works for both server (state is sent in payload) and local (processLocal applies it).

export interface ColumnFilter {
  key:      string
  value:    any        // string | string[] | { from, to } for range
  operator: 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'range' | 'in'
}

export interface RTableFilterState {
  search:        string
  sort:          { column: string; direction: 'asc' | 'desc' } | null
  columnFilters: ColumnFilter[]
  columnOrder:   string[]          // ordered list of col.key; empty = use props.columns order
  page:          number
  pageSize:      number
}

/** Build an empty default state */
export const defaultFilterState = (): RTableFilterState => ({
  search:        '',
  sort:          null,
  columnFilters: [],
  columnOrder:   [],
  page:          1,
  pageSize:      10,
})

/** Apply column filters to a local row array */
export function applyColumnFilters(rows: any[], filters: ColumnFilter[]): any[] { 
  if (!filters.length) return rows
  return rows.filter(row =>
    filters.every(f => {
      const cell = row[f.key]
      const str  = String(cell ?? '').toLowerCase()
      const fval = String(f.value ?? '').toLowerCase()

      switch (f.operator) {
        case 'equals':     return str === fval
        case 'startsWith': return str.startsWith(fval)
        case 'endsWith':   return str.endsWith(fval)
        case 'in':         return Array.isArray(f.value) && f.value.includes(cell)
        case 'range': {
          const num = parseFloat(String(cell))
          const { from, to } = f.value as { from?: number; to?: number }
          if (from != null && num < from) return false
          if (to   != null && num > to)   return false
          return true
        }
        case 'contains':
        default:           return str.includes(fval)
      }
    })
  )
}

/** Reorder columns according to columnOrder list */
export function applyColumnOrder<T extends { key: string }>(cols: T[], order: string[]): T[] {
  if (!order.length) return cols
  const map  = new Map(cols.map(c => [c.key, c]))
  const head = order.map(k => map.get(k)).filter(Boolean) as T[]
  const tail = cols.filter(c => !order.includes(c.key))
  return [...head, ...tail]
}

/** Serialise filter state to URL query params (for shareable links / back-nav) */
export function filterStateToQuery(state: RTableFilterState): Record<string, string> {
  return {
    q:    state.search,
    p:    String(state.page),
    ps:   String(state.pageSize),
    s:    state.sort ? `${state.sort.column}:${state.sort.direction}` : '',
    cf:   state.columnFilters.length ? JSON.stringify(state.columnFilters) : '',
    co:   state.columnOrder.join(','),
  }
}

/** Parse URL query params back to filter state */
export function queryToFilterState(q: Record<string, string>): Partial<RTableFilterState> {
  const out: Partial<RTableFilterState> = {}
  if (q.q)  out.search   = q.q
  if (q.p)  out.page     = parseInt(q.p) || 1
  if (q.ps) out.pageSize = parseInt(q.ps) || 10
  if (q.s) {
    const [col, dir] = q.s.split(':')
    if (col && (dir === 'asc' || dir === 'desc')) out.sort = { column: col, direction: dir }
  }
  if (q.cf)  { try { out.columnFilters = JSON.parse(q.cf) } catch {} }
  if (q.co)  out.columnOrder = q.co.split(',').filter(Boolean)
  return out
}
