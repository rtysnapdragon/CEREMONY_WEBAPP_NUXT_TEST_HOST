import { ref, watch } from 'vue'

const selectedColor = ref<string>('')

// Load saved color from localStorage on composable init
if (process.client) {
  const saved = localStorage?.getItem('rty-color-set')
  if (saved) {
    selectedColor.value = saved
    document.documentElement.style.setProperty('--global-color', saved)
  }
}

export function useColorPicker() {
  const setColor = (color: string) => {
    selectedColor.value = color
    localStorage.setItem('rty-color-set', color)
    document.documentElement.style.setProperty('--global-color', color)
  }

  return {
    selectedColor,
    setColor
  }
}
