<script setup>

// const { data: navigation } =
//   await useAsyncData(
//     'navigation',
//     () => queryCollectionNavigation()
//   )

  const { data } = await useAsyncData('docs-nav', () =>
  queryCollectionNavigation('content')
  // queryCollectionNavigation('docs')
)

</script>

<template>
  <div class="docs-container">
    <ul class="docs-list">
      <li
        v-for="item in data"
        :key="item.path"
        class="docs-item"
      >
        <NuxtLink :to="`/docs${item.path}`">
          {{ item.title }}
        </NuxtLink>

        <ul
          v-if="item.children"
          class="docs-children"
        >
          <li
            v-for="child in item.children"
            :key="child.path"
            class="docs-child-item"
          >
            <NuxtLink :to="`${child.path}`">
              {{ child.title }}
            </NuxtLink>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.docs-container {
  max-width: 80rem; // equivalent to maxWidth-8xl (adjust as needed)
  margin: 0 auto;
  padding: 1rem;
  width: 360px;
  flex: 1 1 0%;
  display: flex;
}

.docs-list {
  width: 100%;
  list-style: none;
  padding: 0;
  margin: 0;
}

.docs-item {
  margin-bottom: 0.75rem;

  > a {
    display: inline-block;
    color: #2563eb;
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
}

.docs-children {
  margin-left: 1rem;
  margin-top: 0.5rem;
  list-style: none;
  padding: 0;

  .docs-child-item {
    margin-bottom: 0.25rem;

    > a {
      color: #4b5563;
      text-decoration: none;

      &:hover {
        color: #2563eb;
      }
    }
  }
}
</style>