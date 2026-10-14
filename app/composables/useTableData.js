// ============================================================
// useTableData – Data Layer Composable (JS)
// Handles: API calls via useHttp, pagination, sorting,
//          filtering, URL persistence, 30s in-memory cache
// ============================================================

import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// import  useHttp from './useHttp.js'

// ─── Simple in-memory cache ───────────────────────────────────

const queryCache = new Map() // key → { data[], total, ts }
const CACHE_TTL  = 30_000    // 30 s

function cacheKey(url, payload) {
  return `${url}::${JSON.stringify(payload)}`
}

// ─── URL ↔ State serialisation ────────────────────────────────

function payloadToQuery(p) {
  const q = {
    page:     String(p.page),
    pageSize: String(p.pageSize),
  }
  if (p.sorting?.length)  q.sort    = JSON.stringify(p.sorting)
  if (p.filters?.length)  q.filters = JSON.stringify(p.filters)
  if (p.search)           q.search  = p.search
  return q
}

function queryToPayload(query, defaults) {
  return {
    page:     query.page     ? Number(query.page)     : defaults.page,
    pageSize: query.pageSize ? Number(query.pageSize) : defaults.pageSize,
    sorting:  query.sort     ? JSON.parse(query.sort)    : undefined,
    filters:  query.filters  ? JSON.parse(query.filters) : undefined,
    search:   query.search   ?? undefined,
  }
}

// ─── Composable ───────────────────────────────────────────────

/**
 * @param {{
 *   source: { api?: { url: string, method?: string, headers?: object, timeout?: number }, data?: any[] },
 *   serverSide?: boolean,
 *   syncUrl?: boolean,
 *   defaultPageSize?: number,
 *   onQueryChange?: (payload: object) => void
 * }} options
 */
export function useTableData(options) {
  const {
    // source,
    source = {
      data: [],
      api: null
    },
    serverSide     = false,
    syncUrl        = false,
    defaultPageSize = 10,
  } = options

  // ── Reactive state ─────────────────────────────────────────
  const sorting       = ref([])
  const columnFilters = ref([])
  const globalSearch  = ref('')
  const pagination    = ref({ pageIndex: 0, pageSize: defaultPageSize })
  const rowData       = ref([])
  const totalRows     = ref(0)
  const isLoading     = ref(false)
  const fetchError    = ref(null)

  // ── URL hydration (Nuxt router) ────────────────────────────
  let route  = null
  let router = null

  if (syncUrl) {
    try {
      route  = useRoute()
      router = useRouter()
      const initial = queryToPayload(route.query, { page: 1, pageSize: defaultPageSize })
      if (initial.page)     pagination.value.pageIndex = initial.page - 1
      if (initial.pageSize) pagination.value.pageSize  = initial.pageSize
      if (initial.sorting)  sorting.value              = initial.sorting
      if (initial.filters)  columnFilters.value        = initial.filters
      if (initial.search)   globalSearch.value         = initial.search
    } catch {
      // not inside a Nuxt/router context – skip silently
    }
  }

  // ── Computed query payload (sent to API / emitted) ─────────
  const queryPayload = computed(() => ({
    page:     pagination.value.pageIndex + 1,
    pageSize: pagination.value.pageSize,
    sorting:  sorting.value.map(s => ({ id: s.id, desc: s.desc })),
    filters:  columnFilters.value.map(f => ({ id: f.id, value: f.value })),
    search:   globalSearch.value || undefined,
  }))

  // ── Remote fetch via useHttp ───────────────────────────────
  async function fetchData() {
    if (!source.api?.url) return

    const payload = queryPayload.value
    const key     = cacheKey(source.api.url, payload)

    // Cache hit – skip network
    const cached = queryCache.get(key)
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      rowData.value   = cached.data ?? []
      totalRows.value = cached.total ?? 0
      return
    }

    isLoading.value = true
    fetchError.value = null

    const method = (source.api.method ?? 'POST').toUpperCase()

    // useHttp signature: (url, options)
    // GET → data goes into params (query string); POST/others → body
    const httpOptions = {
      method,
      // Pass table query payload as `data`; useOptions inside useHttp
      // routes it to params or body based on the method.
      data: payload,
      // Forward any extra headers defined on the api config
      headers: source.api.headers ?? undefined,
      timeout: source.api.timeout ?? 30_000,
    }

    const { data, error } = await useHttp(source.api.url, httpOptions)

    isLoading.value = false

    if (error.value) {
      fetchError.value = error.value
      return
    }

    const res = data.value ?? []
    if (res && typeof res === 'object') {
      // Expects: { data: [], total: number, page: number, pageSize: number }
      rowData.value   = res.data   ?? res              // fallback: raw array
      totalRows.value = res.total  ?? (Array.isArray(res) ? res.length : 0)
      queryCache.set(key, { data: rowData.value, total: totalRows.value, ts: Date.now() })
    }
  }

  // ── Local transforms (static data) ────────────────────────
  function applyLocalTransforms() {
    if (!source.data) return
    let rows = [...source.data]

    // Global search across all string-coercible values
    if (globalSearch.value) {
      const q = globalSearch.value.toLowerCase()
      rows = rows.filter(row =>
        Object.values(row).some(v => String(v ?? '').toLowerCase().includes(q))
      )
    }

    // Column filters
    for (const f of columnFilters.value) {
      rows = rows.filter(row => {
        const val = row[f.id]
        if (Array.isArray(f.value)) return f.value.includes(val)
        return String(val ?? '').toLowerCase().includes(String(f.value).toLowerCase())
      })
    }

    // Sorting (first sort descriptor only)
    if (sorting.value.length) {
      const { id, desc } = sorting.value[0]
      rows.sort((a, b) => {
        const av = a[id]
        const bv = b[id]
        const cmp = av == null ? -1 : bv == null ? 1 : av < bv ? -1 : av > bv ? 1 : 0
        return desc ? -cmp : cmp
      })
    }

    totalRows.value = rows.length

    // Client-side pagination slice
    const start       = pagination.value.pageIndex * pagination.value.pageSize
    rowData.value = rows.slice(start, start + pagination.value.pageSize)
  }

  // ── Push current state into URL query params ───────────────
  function pushToUrl() {
    if (!syncUrl || !router) return
    const q = payloadToQuery(queryPayload.value)
    router.replace({ query: q }).catch(() => {})
  }

  // ── Public refresh ─────────────────────────────────────────
  async function refresh() {
    if (serverSide && source.api) {
      await fetchData()
    } else {
      applyLocalTransforms()
    }
    options.onQueryChange?.(queryPayload.value)
    pushToUrl()
  }

  // ── Watchers: reset page on filter/search/sort change ──────
  watch([sorting, columnFilters, globalSearch], () => {
    pagination.value = { ...pagination.value, pageIndex: 0 }
    refresh()
  })

  watch(pagination, refresh, { deep: true })

  // ── Initial load ───────────────────────────────────────────
  if (source.data && source.data.length > 0) {
    applyLocalTransforms()
    totalRows.value = source.data.length
  }
  if (source.api) {
    fetchData()
  }

  // ── Pagination derived state ───────────────────────────────
  const pageCount       = computed(() => Math.max(1, Math.ceil(totalRows.value / pagination.value.pageSize)))
  const canPreviousPage = computed(() => pagination.value.pageIndex > 0)
  const canNextPage     = computed(() => pagination.value.pageIndex < pageCount.value - 1)

  function goToPage(index) {
    pagination.value = {
      ...pagination.value,
      pageIndex: Math.max(0, Math.min(index, pageCount.value - 1)),
    }
  }
  function nextPage()          { goToPage(pagination.value.pageIndex + 1) }
  function prevPage()          { goToPage(pagination.value.pageIndex - 1) }
  function setPageSize(size)   { pagination.value = { pageIndex: 0, pageSize: size } }
  function invalidateCache()   { queryCache.clear() }

  return {
    // ── State ──
    rowData,
    totalRows,
    isLoading,
    fetchError,
    sorting,
    columnFilters,
    globalSearch,
    pagination,
    queryPayload,
    pageCount,
    canPreviousPage,
    canNextPage,
    // ── Actions ──
    refresh,
    goToPage,
    nextPage,
    prevPage,
    setPageSize,
    invalidateCache,
  }
}
