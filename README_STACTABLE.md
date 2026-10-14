# Enterprise DataTable — Nuxt 4 + NuxtUI 4 + TanStack

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    DataTable.vue                         │
│   (UI rendering — NuxtUI components + scoped CSS)        │
├────────────────────┬────────────────────────────────────┤
│  useTableData()    │       useTableEngine()              │
│  ─ DATA LAYER ─    │      ─ ENGINE LAYER ─               │
│  API calls         │   useVueTable() (TanStack)          │
│  pagination        │   row models                        │
│  sorting state     │   sorting / filter state            │
│  filter state      │   grouping state                    │
│  URL sync          │   selection state                   │
│  caching (30s)     │   column visibility                 │
│  local transforms  │   column pinning                    │
├────────────────────┴────────────────────────────────────┤
│                    useHttp()                             │
│   axios · GET · POST · PUT · PATCH · DELETE              │
│   cancel tokens · auth interceptor · error normalise     │
└─────────────────────────────────────────────────────────┘
```

## File Structure

```
components/
  DataTable.vue            ← main reusable component

composables/
  useHttp.ts               ← axios HTTP client
  useTableData.ts          ← data layer (API, pagination, cache, URL)
  useTableEngine.ts        ← TanStack Table engine

types/
  table.types.ts           ← all TypeScript interfaces

utils/
  export.ts                ← CSV export utility

USAGE.vue                  ← usage examples
```

## Installation

```bash
# Core table engine
npm install @tanstack/vue-table @tanstack/vue-virtual

# HTTP client
npm install axios

# NuxtUI (already in Nuxt 4 projects)
npm install @nuxt/ui
```

`nuxt.config.ts`:
```ts
export default defineNuxtConfig({
  modules: ['@nuxt/ui'],
})
```

## Features Matrix

| Feature                    | Mode          | Notes                                      |
|---------------------------|---------------|--------------------------------------------|
| Sorting                   | Local + Server| Server sends `sorting[]` in payload        |
| Filtering                 | Local + Server| Server sends `filters[]` in payload        |
| Global search             | Local + Server| Server sends `search` string               |
| Pagination                | Local + Server| Server sends `page` + `pageSize`           |
| Row selection             | Local         | `selectable` prop, emits `selection-change`|
| Bulk actions              | Local         | Runs when rows selected                    |
| Row actions               | Local         | Dropdown per row, `hidden`/`disabled` fns  |
| Column visibility         | Local         | Toggle via popover                         |
| Column pinning            | Local         | `meta: { pin: 'left' | 'right' }`          |
| Grouping                  | Local         | `groupable` prop                           |
| Virtual scrolling         | Local         | `virtualize` + `rowHeight` props           |
| Sticky header             | Local/Server  | `stickyHeader` prop                        |
| CSV export                | Local         | Respects `meta.exportable: false`          |
| Clamped text modal        | Local         | `meta: { isClamp, clampLength }`           |
| Badge cells               | Local         | `meta: { badge: { value: 'variant' } }`    |
| Custom slot render        | Local         | `meta: { slot: 'slotName' }`               |
| Permission-based columns  | Local         | `meta: { allowedRoles: [] }`               |
| URL query persistence     | Both          | `syncUrl` prop                             |
| Dynamic column width      | Local         | `meta: { width, minWidth, maxWidth }`      |
| Loading / skeleton        | Both          | Auto from API or `loading` prop override   |
| Empty state               | Both          | Default + `#empty` slot override           |
| Error state               | Both          | Retry button                               |
| Dark / light mode         | Both          | CSS variables from NuxtUI design tokens    |

## Server-Side Payload Shape

When `serverSide: true`, every pagination/sort/filter change sends:

```ts
{
  page: 1,
  pageSize: 20,
  sorting: [{ id: 'name', desc: false }],
  filters: [{ id: 'role', value: 'admin' }],
  search: 'alice'
}
```

**POST**: payload sent as request body.  
**GET**: payload serialised as query params.

## useHttp API

```ts
const { data, loading, error, execute, cancel, reset } = useHttp({
  method: 'POST',
  url: '/api/endpoint',
  body: { key: 'value' },
  onSuccess: (data) => console.log(data),
  onError: (err) => console.error(err),
})

// Execute later (lazy by default)
await execute()

// Execute with overrides
await execute({ url: '/api/other', body: { key: 'new' } })

// Shorthand helpers
const { execute } = useGet('/api/users', { page: 1 })
const { execute } = usePost('/api/users', { name: 'Alice' })
const { execute } = useDelete('/api/users', { id: 42 })
```

## Column Meta Reference

```ts
meta: {
  pin?: 'left' | 'right'
  isClamp?: boolean         // truncate long text, click to expand modal
  clampLength?: number      // chars before truncating (default 60)
  allowedRoles?: string[]   // hide column if user role not in list
  minWidth?: string         // CSS e.g. '120px'
  width?: string            // CSS e.g. '200px'
  maxWidth?: string         // CSS e.g. '400px'
  badge?: Record<string, BadgeVariant>  // value → badge color map
  slot?: string             // named slot for custom render
  exportable?: boolean      // include in CSV (default true)
}
```
