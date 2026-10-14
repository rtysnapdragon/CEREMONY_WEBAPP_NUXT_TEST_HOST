import type { MenuItem } from '~/types/navigation'
import menuData from '~/assets/json/data_menu.json'

export interface MenuData {
  menu: MenuItem[]
  bottom: MenuItem[]
}

export const useMenu = () => {
  const authStore = useAuthStore()
  const matches = (required: string | string[] | null | undefined, granted: string[] = []) => {
    if (!required) return true
    const requiredValues = Array.isArray(required) ? required : [required]
    return requiredValues.some(value => granted.includes(value))
  }

  const hasPermission = (permission?: string | string[] | null): boolean => {
    if (!permission) return true
    return matches(permission, authStore.permissions)
  }

  const hasRole = (role?: string | string[] | null): boolean => {
    return matches(role, authStore.user?.roles ?? [])
  }

  const filterItems = (items: MenuItem[]): MenuItem[] =>
    items
      .filter(item => hasPermission(item.permission) && hasRole(item.role))
      .map(item => ({
        ...item,
        children: item.children?.length ? filterItems(item.children) : item.children,
      }))

  const filteredMenu = computed<MenuData>(() => ({
    menu: filterItems((menuData as MenuData).menu),
    bottom: filterItems((menuData as MenuData).bottom),
  }))

  return filteredMenu
}
