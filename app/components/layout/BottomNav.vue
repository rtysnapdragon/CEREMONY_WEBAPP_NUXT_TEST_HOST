<template>
  <nav class="bottom-nav">
    <NuxtLink
      v-for="item in bottomNavItems"
      :key="item.id"
      :to="item.path"
      class="bottom-nav-item"
      :class="{ active: item.active }"
    >
      <div class="bni-icon-wrap">
        <i :class="item.active ? item.iconActive : item.icon" />
        <span v-if="item.badge" class="bni-badge">{{ item.badge }}</span>
      </div>
      <span>{{ tr(item.key) }}</span>
    </NuxtLink>
  </nav>
</template>

<script setup>
const { tr } = useTr()
const { bottomNavItems } = useMenu()
</script>

<style lang="scss">
.bni-icon-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bni-badge {
  position: absolute;
  top: -5px;
  right: -8px;
  background: var(--c-accent);
  color: white;
  font-size: 0.5rem;
  font-weight: 700;
  width: 14px;
  height: 14px;
  border-radius: var(--r-full);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
