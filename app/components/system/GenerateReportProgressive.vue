<template>
  <div ref="componentRoot" class="flex-col items-center justify-center relative inline-block">
    <UTooltip
      :text="ui.reportStatus === 'generating' ? 'Generating report…' : 'Generate report'"
    >
      <button
        ref="buttonRef"
        @click="togglePanel"
        class="group relative w-[36px] h-[36px] flex items-center justify-center rounded-full border border-1 border-cyan-500 transition-colors overflow-visible"
        :class="{
          ' text-white': ui.reportStatus === 'generating',
          ' text-white': ui.reportStatus === 'success',
          ' text-black dark:bg-gray-700 dark:text-white': ui.reportStatus === 'idle',
        }"
      >
        <!-- Spinning border -->
        <div
          v-if="ui.reportStatus === 'generating'"
          class="absolute inset-0 -m-[4px] rounded-full border-2 border-transparent border-t-blue-500 border-r-transparent animate-spin z-0"
        ></div>

        <!-- Icon Flip Transition -->
        <transition name="flip-icon" mode="out-in">
          <!-- Loading with animated SVG -->
          <svg
            v-if="ui.reportStatus === 'generating'"
            key="loading"
            xmlns="http://www.w3.org/2000/svg"
            class="relative z-10 w-5 h-5 text-white animate-svg-bounce"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M9 12h6m2 0a2 2 0 100-4H7a2 2 0 100 4m2 0v4m0-4H9" />
          </svg>

          <!-- Success -->
          <UIcon
            v-else-if="ui.reportStatus === 'success'"
            key="success"
            name="i-heroicons-check-circle"
            class="relative z-10 w-5 h-5"
          />

          <!-- Idle -->
          <UIcon
            v-else
            key="idle"
            name="i-heroicons-document-text"
            class="relative z-10 w-5 h-5"
          />
        </transition>
      </button>

    </UTooltip>

    <!-- Dropdown Panel -->
    <transition name="fade-slide">
      <div
        ref="dropdownRef"
        v-if="showPanel"
        class="absolute right-0 mt-6 bg-white dark:bg-gray-900 shadow-lg rounded-lg p-6 w-[250px] text-center"
      >
        <div class="flex flex-col items-center justify-center">
          <!-- Animated Circular Progress -->
          <svg class="w-24 h-24 transform -rotate-0" viewBox="0 0 36 36">
            <path
              class="text-gray-200"
              stroke-width="4"
              fill="none"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              :stroke="progressColor"
              stroke-width="4"
              stroke-dasharray="100, 100"
              :stroke-dashoffset="100 - progress"
              stroke-linecap="round"
              fill="none"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <text x="18" y="21.35" class="text-[10px] fill-current text-black dark:text-white" text-anchor="middle">
              {{ progress }}%
            </text>
          </svg>
        </div>
        <div class="flex flex-col gap-4 items-center justify-center w-full">
          <!-- Progress Label -->
          <div class="text-sm font-medium">
            Processing: {{ progress }}%
          </div>

          <!-- Linear Progress Bar -->
          <div class="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              class="h-full transition-all duration-200 ease-linear"
              :style="{
                width: progress + '%',
                backgroundColor: progressColor,
              }"
            ></div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const ui = ref({
  reportStatus: 'idle' // 'idle' | 'generating' | 'success'
})

const showPanel = ref(false)
const progress = ref(0)

// DOM references
const componentRoot = ref(null)
const dropdownRef = ref(null)
const buttonRef = ref(null)

const togglePanel = () => {
  if (ui.value.reportStatus !== 'generating') {
    ui.value.reportStatus = 'generating'
    progress.value = 0
    startProgress()
  }
  showPanel.value = !showPanel.value
}

const progressColor = computed(() => {
  if (progress.value < 50) return '#3b82f6' // blue-500
  if (progress.value < 80) return '#facc15' // yellow-400
  return '#10b981' // green-500
})

const spinColor = computed(() => {
  if (progress.value < 50) return 'text-blue-500 dark:text-blue-200'
  if (progress.value < 80) return 'text-yellow-400 dark:text-yellow-800'
  return 'text-green-500'
})

const startProgress = () => {
  const interval = setInterval(() => {
    if (progress.value < 100) {
      progress.value += 1
    } else {
      clearInterval(interval)
      ui.value.reportStatus = 'success'
      showPanel.value = !showPanel.value
    }
  }, 50)
}


const fetchReportData = async () => {
  const { data } = await axios.get('https://fakestoreapi.com/products')
  return data
}

const fetchReportData1 = async () => {
  const response = await fetch('https://fakestoreapi.com/products')
  if (!response.ok) {
    throw new Error('Failed to fetch data')
  }
  const data = await response.json()
  return data
}

const startProgress1 = async () => {
  ui.value.reportStatus = 'generating'
  showPanel.value = true
  progress.value = 0

  let fakeProgress = 0
  const interval = setInterval(() => {
    if (fakeProgress < 90) {
      fakeProgress += 1
      progress.value = fakeProgress
    }
  }, 50)

  try {
    // ✅ Replace this with real API call
    const data = await fetchReportData()

    clearInterval(interval)
    progress.value = 100

    // Simulate slight delay to show full bar
    setTimeout(() => {
      ui.value.reportStatus = 'success'
      showPanel.value = false

      console.log('Fetched report data:', data) // do something with it
    }, 500)
  } catch (error) {
    clearInterval(interval)
    progress.value = 0
    ui.value.reportStatus = 'idle'
    showPanel.value = false
    console.log('Report generation failed:', error)
  }
}



// Close dropdown on outside click
const handleClickOutside = (event) => {
  const clickedInside =
    componentRoot.value?.contains(event.target) ||
    dropdownRef.value?.contains(event.target) ||
    buttonRef.value?.contains(event.target)

  if (!clickedInside) {
    showPanel.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style lang="scss" scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}



.flip-icon-enter-active,
.flip-icon-leave-active {
  transition: transform 0.4s ease;
  backface-visibility: hidden;
}

.flip-icon-enter-from {
  transform: rotateY(90deg);
}
.flip-icon-enter-to {
  transform: rotateY(0deg);
}
.flip-icon-leave-from {
  transform: rotateY(0deg);
}
.flip-icon-leave-to {
  transform: rotateY(-90deg);
}

@keyframes svg-bounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2) rotate(2deg);
  }
}

.animate-svg-bounce {
  animation: svg-bounce 1s infinite ease-in-out;
}

</style>