// composables/useStatusColor.ts
import { useUIStore } from '~/stores/ui'


export function useStatusColor() {
const ui = useUIStore()
const ringClass = computed(() => {
switch (ui.trackStage) {
case 'pending': return 'ring-yellow-400'
case 'picking': return 'ring-amber-500'
case 'packed': return 'ring-indigo-400'
case 'in_transit': return 'ring-sky-500'
case 'delivered': return 'ring-emerald-500'
case 'canceled': return 'ring-rose-500'
default: return 'ring-gray-400'
}
})
return { ringClass }
} 