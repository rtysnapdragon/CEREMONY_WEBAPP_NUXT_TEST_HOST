<script setup>
const { data: home } = await useAsyncData(() => queryCollection('content').path('/').first())

useSeoMeta({
  title: home.value?.title,
  description: home.value?.description
})

useHead({
    title: tBy({en: 'Components usage',km:'ការប្រើប្រាស់ Components'}),
    description: home.value?.description
})

const route = useRoute()
const { data: page } = await useAsyncData(() =>
  queryCollection('content')
    .path('/docs')
    .first()
)

console.log("DATA =========> ",page)
const { data } = await useAsyncData(() =>
  queryCollection('content')
    .path('/docs')
    .first()
)

console.log("Data =============> ",data.value)
// const path = computed(() => {
//   const slug = route.params.slug

//   if (!slug) {
//     return '/docs'
//   }

//   if (Array.isArray(slug)) {
//     return `/docs/${slug.join('/')}`
//   }

//   return `/docs/${slug}`
// })
const path = computed(() => {
  const slug = route.params.slug

  if (!slug) {
    return '/docs'
  }

  return `/docs/${[].concat(slug).join('/')}`
})

watchEffect(() => {
  console.log('Route params:', route.params)
  console.log('Content path:', path.value)
})

definePageMeta({
    layout: false
})
</script>

<template>
  <main>
    <ContentDoc>
      <template v-slot="{ doc }">
        <article>
          <h1>{{ doc.title }}</h1>
          <ContentRenderer :value="doc" />
        </article>
      </template>
      <template #not-found>
        <h1>Document not found</h1>
      </template>
    </ContentDoc>
  </main>
</template>
