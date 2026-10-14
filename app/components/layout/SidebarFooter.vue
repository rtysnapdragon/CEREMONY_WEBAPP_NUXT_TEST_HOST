<template>
  <div class="sidebar-footer">
    <UButton
      icon="i-lucide-moon"
      color="neutral"
      variant="ghost"
      @click="toggleTheme"
    />
  </div>
</template>

<script setup lang="ts">
const colorMode = useColorMode()

const toggleTheme = () => {
  colorMode.preference =
    colorMode.value === 'dark'
      ? 'light'
      : 'dark'
}
</script>

<style scoped lang="scss">
.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--color-border);

  display: flex;
  justify-content: center;
}
</style>