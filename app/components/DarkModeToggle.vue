<template>
  <div :class="{ 'dark': isDarkMode }" >
    <div class="relative inline-block">
      <!-- The container for the icons -->
      <div class="flex items-center justify-center h-7 w-7 p-2 rounded-lg hover:bg-blue-50/20 dark:hover:font-bold">
        <div
          @click="toggleDarkMode"
          @mouseenter="showTooltip"
          @mouseleave="hideTooltip"
          class="p-0 cursor-pointer transition-all duration-200"
        >
          <!-- Conditionally switch icons on hover -->
          <i
            :class="isDarkMode ? (isHovered ?  'ri-sun-line text-icon-standard':'ri-moon-line text-icon-standard') : (isHovered ?  'ri-moon-line text-icon-standard':'ri-sun-line text-icon-standard')"
            :style="{ transform: tooltipVisible ? 'scale(1.1)' : 'scale(1)' }"
          ></i>
      </div>
      </div>

      <!-- Tooltip to show the mode -->
      <div class="absolute left-1/2 transform -translate-x-1/2 mt-[15px] p-1 flex justify-self-center items-center bg-[#FAFAFA] shadow-md dark:shadow-md dark:shadow-slate-800 dark:bg-[#505252aa] text-xs rounded"
           v-show="tooltipVisible">
          <div class="flex justify-center items-center min-w-max w-auto px-1">
            <span class="text-[13px] rounded">
            {{ isDarkMode ? tr('dark_light'): tr('light_dark')  }}
        </span>
          </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { tr } = useTr()
import { ref, watch, onMounted } from 'vue';

const isDarkMode = ref(false);
const tooltipVisible = ref(false);
const isHovered = ref(false); // Track hover state

// Toggle dark mode and update the document class
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  document.documentElement.classList.toggle('dark', isDarkMode.value);
};

// Load saved preference from localStorage on the client only
onMounted(() => {
  const savedMode = localStorage?.getItem('dark-mode');
  if (savedMode) {
    isDarkMode.value = savedMode === 'true';
    document.documentElement.classList.toggle('dark', isDarkMode.value);
  }
});

// Persist dark mode preference in localStorage
watch(isDarkMode, (newValue) => {
  if (process.client) {
    localStorage.setItem('dark-mode', newValue);
  }
});

// Show tooltip and Handle hover state to show toggle the moon or darkmode icon
const showTooltip = () => {
  tooltipVisible.value = true;
  isHovered.value = true;
};

// Show tooltip to  and Handle hover state to show toggle the sun or lightmode icon
const hideTooltip = () => {
  tooltipVisible.value = false;
  isHovered.value = false;
};

</script>

<style lang="scss">
/* Initially hide tooltip */
span[v-show="true"] {
  display: block;
}

.transition-all {
  transition: all 0.3s ease-in-out;
}

.text-icon-standard {
  font-size: 0.97rem;
}
</style>
