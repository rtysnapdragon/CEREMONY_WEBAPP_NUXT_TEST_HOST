// composables/useSidebar.ts
import { useCookie } from '#app'

export const useSidebar = () => {
  const isCollapsed = useState<boolean>('sidebar-collapsed', () => false)
  const isMobileOpen = useState<boolean>('sidebar-mobile-open', () => false)
  const isSidebarOpen = useState('sidebar-mobile-open', () => false)

  const toggle = () => { isCollapsed.value = !isCollapsed.value }
  const collapse = () => { isCollapsed.value = true }
  const expand = () => { isCollapsed.value = false }
  const openMobile = () => { isMobileOpen.value = true }
  const closeMobile = () => { isMobileOpen.value = false }
  const toggleMobile = () => { isMobileOpen.value = !isMobileOpen.value }
  const toggleSidebar = () => { isSidebarOpen.value = !isSidebarOpen.value }
  const closeSidebar = () => { isSidebarOpen.value = false }
  const sidebarExpanded = useCookie<boolean>('is_sidebar', { default: () => true })
  
  return {
    isCollapsed,
    // isCollapsed: readonly(isCollapsed),
    isMobileOpen: readonly(isMobileOpen),
    isSidebarOpen,
    sidebarExpanded,
    toggleSidebar,
    toggle,
    collapse,
    expand,
    openMobile,
    closeMobile,
    toggleMobile,
    closeSidebar
  }
}