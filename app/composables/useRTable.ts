import type { Ref } from 'vue'

export interface RTableColumn {
  key: string
  label?: string
  sortable?: boolean
  class?: string
  rowClass?: string
  render?: string | ((val: any, row: any) => string)
  isClamp?: boolean
  clampLines?: number
}

export interface RTableApi {
  url: string
  method?: 'GET' | 'POST' | 'PUT'
  data?: Record<string, any>
}

export interface RTableOptions {
  rowCallback?: (row: any) => any
  showNoData?: boolean
  isScroll?: boolean
  pageSize?: number
  pageSizes?: number[]
}

export interface RTableState {
  data: Ref<any[]>
  dataSrc: Ref<any[]>
  total: Ref<number>
  loading: Ref<boolean>
  page: Ref<number>
  pageSize: Ref<number>
  search: Ref<string>
  sort: Ref<{ column: string; direction: 'asc' | 'desc' } | null>
  selected: Ref<any[]>
  reload: () => Promise<void>
  clearSearch: () => void
  onSearch: (q: string) => void
  onSort: (col: string) => void
  onPage: (p: number) => void
  onPageSize: (s: number) => void
}

export function useRTable(
  api: Ref<RTableApi | undefined>,
  localData: Ref<any[]>,
  options: Ref<RTableOptions>
): RTableState {
  const data = ref<any[]>([])
  const dataSrc = ref<any[]>([])
  const total = ref(0)
  const loading = ref(false)
  const page = ref(1)
  const pageSize = ref(options.value.pageSize ?? 10)
  const search = ref('')
  const sort = ref<{ column: string; direction: 'asc' | 'desc' } | null>(null)

  const selected = ref<any[]>([])

  // Build body payload for server requests
  const buildPayload = () => ({
    page: page.value,
    pageSize: pageSize.value,
    search: search.value || undefined,
    sortBy: sort.value?.column || undefined,
    sortDir: sort.value?.direction || undefined,
  })

  const fetchServer = async () => {
    if (!api.value) return
    loading.value = true
    try {
      const payload = {
        ...api.value.data,
        ...buildPayload(),
      }
      const res: any = await useHttp(api.value.url, {
        method: api.value.method ?? 'POST',
        data: payload,
      })
      dataSrc.value = res?.data ?? res?.Data ?? res?.items ?? res ?? []
      total.value = res?.total ?? res?.Total ?? res?.count ?? dataSrc.value.length
      data.value = applyRowCallback(dataSrc.value)
    } catch (_e) {
      data.value = []
      total.value = 0
    } finally {
      loading.value = false
    }
  }

  const processLocal = () => {
    let src = [...localData.value]

    if (search.value) {
      const q = search.value.toLowerCase()
      src = src.filter((row) =>
        Object.values(row).some((v) => String(v ?? '').toLowerCase().includes(q))
      )
    }

    if (sort.value) {
      const { column, direction } = sort.value
      src.sort((a, b) => {
        const av = a[column] ?? ''
        const bv = b[column] ?? ''
        const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true })
        return direction === 'asc' ? cmp : -cmp
      })
    }

    total.value = src.length

    const start = (page.value - 1) * pageSize.value
    dataSrc.value = src
    data.value = applyRowCallback(src.slice(start, start + pageSize.value))
  }

  const applyRowCallback = (rows: any[]) => {
    if (!options.value.rowCallback) return rows
    return rows.map(options.value.rowCallback)
  }

  const reload = async () => {
    if (api.value) {
      await fetchServer()
    } else {
      processLocal()
    }
  }

  const onSearch = useDebounceFn((q: string) => {
    search.value = q
    page.value = 1
    reload()
  }, 350)

  const clearSearch = () => {
    search.value = ''
    page.value = 1
    reload()
  }

  const onSort = (col: string) => {
    if (sort.value?.column === col) {
      sort.value =
        sort.value.direction === 'asc'
          ? { column: col, direction: 'desc' }
          : null
    } else {
      sort.value = { column: col, direction: 'asc' }
    }
    page.value = 1
    reload()
  }

  const onPage = (p: number) => {
    page.value = p
    reload()
  }

  const onPageSize = (s: number) => {
    pageSize.value = s
    page.value = 1
    reload()
  }

  // Watch local data changes
  watch(
    localData,
    () => {
      if (!api.value) processLocal()
    },
    { immediate: true, deep: true }
  )

  // Watch api changes
  watch(
    api,
    () => {
      if (api.value) reload()
    },
    { immediate: true }
  )

  return {
    data,
    dataSrc,
    total,
    loading,
    page,
    pageSize,
    search,
    sort,
    selected,
    reload,
    clearSearch,
    onSearch,
    onSort,
    onPage,
    onPageSize,
  }
}