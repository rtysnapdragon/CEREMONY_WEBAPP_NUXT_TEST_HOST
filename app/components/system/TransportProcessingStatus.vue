<template>
  <UTooltip :text="`Tracking: ${ui.trackStage}`">
    <button
      class="relative w-[36px] h-[36px] flex items-center justify-center rounded-full border-2 transition-colors"
      :class="[
        borderClass,
      ]"
      @click="advanceTrackingStage"
    >
      <!-- Spinner or colored ring inside -->
      <div
        class="absolute inset-0 -m-[2px] rounded-full border-2 border-transparent z-0"
        :class="ringClass"
      ></div>

      <!-- Truck icon -->
      <UIcon
        name="i-heroicons-truck"
        class="relative z-10 w-5 h-5 text-current"
        :class="{ 'animate-truck-move': ui.trackStage === 'in_transit' }"
      />

      <!-- Badge -->
      <div
        class="absolute top-0 right-0 -mt-1 -mr-1 text-white text-[10px] font-semibold w-4 h-4 flex items-center justify-center rounded-full z-10 shadow"
        :class="badgeClass"
      >
        {{ badgeContent }}
      </div>
    </button>
  </UTooltip>
</template>
<script setup lang="ts">
import { computed } from 'vue'

const ui = useUIStore()

const stageBadgeMap = {
  pending: { content: '…', color: 'bg-gray-400', border: 'border-gray-400' },
  picking: { content: '2', color: 'bg-yellow-400', border: 'border-yellow-400' },
  packed: { content: '1', color: 'bg-purple-500', border: 'border-purple-500' },
  in_transit: { content: '3', color: 'bg-blue-600', border: 'border-blue-600' },
  delivered: { content: '✅', color: 'bg-green-500', border: 'border-green-500' },
  canceled: { content: '✖', color: 'bg-red-500', border: 'border-red-500' },
}

const badgeContent = computed(() => stageBadgeMap[ui.trackStage]?.content ?? '')
const badgeClass = computed(() => stageBadgeMap[ui.trackStage]?.color ?? 'bg-gray-300')
const borderClass = computed(() => stageBadgeMap[ui.trackStage]?.border ?? 'border-gray-300')

const ringClass = computed(() => {
  switch (ui.trackStage) {
    case 'in_transit':
      return 'border-t-blue-500 border-r-transparent animate-spin'
    case 'delivered':
      return 'border-green-500'
    case 'picking':
      return 'border-yellow-400 animate-pulse'
    case 'packed':
      return 'border-purple-400'
    case 'canceled':
      return 'border-red-500'
    default:
      return 'border-gray-300'
  }
})

const trackStages = ['pending', 'picking', 'packed', 'in_transit', 'delivered', 'canceled']
const advanceTrackingStage = () => {
  const currentIndex = trackStages.indexOf(ui.trackStage)
  const nextIndex = (currentIndex + 1) % trackStages.length
  ui.setTrackStage(trackStages[nextIndex] as typeof ui.trackStage)
}
</script>



<style lang="scss">
/* Optional truck bounce animation */
@keyframes truck-move {
  0%, 100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(2px);
  }
}
.animate-truck-move {
  animation: truck-move 0.6s infinite ease-in-out;
}
</style>