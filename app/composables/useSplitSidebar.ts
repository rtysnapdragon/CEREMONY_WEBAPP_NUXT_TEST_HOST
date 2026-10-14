// composables/useSplitSidebar.ts
// Unified single-panel sidebar — Claude.ai style
// Drag handle resizes the whole panel; collapse = icon-only mode

const PANEL_MIN = 52    // icon-only (collapsed) width px
const PANEL_EXPANDED = 232   // default expanded width px
const PANEL_MAX = 320   // maximum draggable width px
const SNAP_COLLAPSE = 100   // drag below this → snap to collapsed
const SNAP_EXPAND = 130   // drag above this when collapsed → snap to expanded
const STORAGE_KEY = 'cld-sidebar-width'

// ── Custom SVG cursors (base64) ───────────────────────────────
// Idle: dual arrows + accent centre bar, 32×32, hotspot 16 16
const CUR_IDLE = `url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj48cmVjdCB4PSIxNC41IiB5PSI1IiB3aWR0aD0iMyIgaGVpZ2h0PSIyMiIgcng9IjEuNSIgZmlsbD0icmdiYSgwLDAsMCwwLjE4KSIvPjxyZWN0IHg9IjE1IiB5PSI1IiB3aWR0aD0iMiIgaGVpZ2h0PSIyMiIgcng9IjEiIGZpbGw9IndoaXRlIi8+PHBvbHlnb24gcG9pbnRzPSI4LDE2IDE0LDEwIDE0LDIyIiBmaWxsPSJyZ2JhKDAsMCwwLDAuMTgpIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxLDEpIi8+PHBvbHlnb24gcG9pbnRzPSI4LDE2IDE0LDEwIDE0LDIyIiBmaWxsPSJ3aGl0ZSIvPjxwb2x5Z29uIHBvaW50cz0iMjQsMTYgMTgsMTAgMTgsMjIiIGZpbGw9InJnYmEoMCwwLDAsMC4xOCkiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEsMSkiLz48cG9seWdvbiBwb2ludHM9IjI0LDE2IDE4LDEwIDE4LDIyIiBmaWxsPSJ3aGl0ZSIvPjxyZWN0IHg9IjE1LjIiIHk9IjUuNSIgd2lkdGg9IjEuNiIgaGVpZ2h0PSIyMSIgcng9IjAuOCIgZmlsbD0iIzRmNjNkMiIvPjxwb2x5Z29uIHBvaW50cz0iOC41LDE2IDEzLjUsMTAuNSAxMy41LDIxLjUiIGZpbGw9IiM0ZjYzZDIiLz48cG9seWdvbiBwb2ludHM9IjIzLjUsMTYgMTguNSwxMC41IDE4LjUsMjEuNSIgZmlsbD0iIzRmNjNkMiIvPjwvc3ZnPg==") 16 16, col-resize`
// Active / grabbing: bolder, glowing
const CUR_ACTIVE = `url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj48cmVjdCB4PSIxNCIgeT0iNCIgd2lkdGg9IjQiIGhlaWdodD0iMjQiIHJ4PSIyIiBmaWxsPSJyZ2JhKDc5LDk5LDIxMCwwLjIpIi8+PHJlY3QgeD0iMTQuNSIgeT0iNC41IiB3aWR0aD0iMyIgaGVpZ2h0PSIyMyIgcng9IjEuNSIgZmlsbD0icmdiYSgwLDAsMCwwLjE1KSIvPjxyZWN0IHg9IjE1IiB5PSI0IiB3aWR0aD0iMiIgaGVpZ2h0PSIyNCIgcng9IjEiIGZpbGw9IndoaXRlIi8+PHBvbHlnb24gcG9pbnRzPSI3LDE2IDE0LDkgMTQsMjMiIGZpbGw9InJnYmEoMCwwLDAsMC4xNSkiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEsMSkiLz48cG9seWdvbiBwb2ludHM9IjcsMTYgMTQsOSAxNCwyMyIgZmlsbD0id2hpdGUiLz48cG9seWdvbiBwb2ludHM9IjI1LDE2IDE4LDkgMTgsMjMiIGZpbGw9InJnYmEoMCwwLDAsMC4xNSkiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEsMSkiLz48cG9seWdvbiBwb2ludHM9IjI1LDE2IDE4LDkgMTgsMjMiIGZpbGw9IndoaXRlIi8+PHJlY3QgeD0iMTUuMiIgeT0iNC41IiB3aWR0aD0iMS42IiBoZWlnaHQ9IjIzIiByeD0iMC44IiBmaWxsPSIjNGY2M2QyIi8+PHBvbHlnb24gcG9pbnRzPSI3LjUsMTYgMTMuNSw5LjUgMTMuNSwyMi41IiBmaWxsPSIjNGY2M2QyIi8+PHBvbHlnb24gcG9pbnRzPSIyNC41LDE2IDE4LjUsOS41IDE4LjUsMjIuNSIgZmlsbD0iIzRmNjNkMiIvPjwvc3ZnPg==") 16 16, col-resize`


export const useSplitSidebar = () => {

  // ── Style injected once ───────────────────────────────────────
  let _styleEl: HTMLStyleElement | null = null
  const injectCursorStyle = () => {
    if (_styleEl || typeof document === 'undefined') return
    _styleEl = document.createElement('style')
    _styleEl.id = 'cld-cursor'
    _styleEl.textContent = `
      .cld-handle           { cursor: ${CUR_IDLE}   !important; }
      .cld-handle--active   { cursor: ${CUR_ACTIVE} !important; }
      body.cld-dragging,
      body.cld-dragging *   { cursor: ${CUR_ACTIVE} !important; user-select: none; }
    `
    document.head.appendChild(_styleEl)
  }

  // ── Shared state ─────────────────────────────────────────────
  const panelWidth = useState<number>('cld-panel-width', () => PANEL_EXPANDED)
  const isCollapsed = useState<boolean>('cld-is-collapsed', () => false)  // default expand mode
  const isDragging = useState<boolean>('cld-is-dragging', () => false)
  // Computed CSS width for the sidebar element
  const cssWidth = computed(() =>
    isCollapsed.value ? `${PANEL_MIN}px` : `${panelWidth.value}px`
  )


const save = () => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        w: panelWidth.value,
        c: isCollapsed.value,
      }),
    )
  } catch {}
}

// watch([panelWidth, isCollapsed], () => {
//   if (typeof localStorage === 'undefined') return

//   localStorage.setItem(
//     STORAGE_KEY,
//     JSON.stringify({
//       w: panelWidth.value,
//       c: isCollapsed.value,
//     }),
//   )
// })

  // Start drag on handle mousedown
  const startDrag = (e: MouseEvent) => {
    e.preventDefault()
    isDragging.value = true
    document.body.classList.add('cld-dragging')

    // Remove CSS transition during drag for instant feedback
    const aside = (e.currentTarget as HTMLElement).closest('.cld-sidebar') as HTMLElement | null
    if (aside) aside.classList.add('cld-sidebar--no-transition')

    const startX = e.clientX
    const startWidth = isCollapsed.value ? PANEL_MIN : panelWidth.value

    const onMove = (mv: MouseEvent) => {
      const next = startWidth + (mv.clientX - startX)

      if (next < SNAP_COLLAPSE) {
        isCollapsed.value = true
      } else {
        isCollapsed.value = false
        panelWidth.value = Math.min(PANEL_MAX, Math.max(PANEL_MIN + 60, next))
      }
    }

    const onUp = () => {
      isDragging.value = false
      document.body.classList.remove('cld-dragging')
      if (aside) aside.classList.remove('cld-sidebar--no-transition')
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      // Persist
      save()
      // try {
      //   localStorage.setItem(STORAGE_KEY, JSON.stringify({
      //     w: panelWidth.value,
      //     c: isCollapsed.value,
      //   }))
      // } catch { }
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  // Toggle collapse (button click / double-click handle)
  const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value
    save()
  }
  // Restore from localStorage + inject cursor styles
  const hydrate = () => {
    injectCursorStyle()
    if (typeof localStorage === 'undefined') return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const saved = JSON.parse(raw)
      if (typeof saved.w === 'number' && saved.w >= PANEL_MIN && saved.w <= PANEL_MAX)
        panelWidth.value = saved.w
      if (typeof saved.c === 'boolean')
        isCollapsed.value = saved.c
    } catch { }
  }

  return {
    // state
    panelWidth,
    isCollapsed,
    isDragging,
    cssWidth,
    // constants
    PANEL_MIN,
    PANEL_EXPANDED,
    PANEL_MAX,
    // actions
    toggleCollapse,
    startDrag,
    hydrate,
  }
}