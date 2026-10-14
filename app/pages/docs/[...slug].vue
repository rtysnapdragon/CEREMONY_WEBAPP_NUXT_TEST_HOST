<script setup lang="ts">
const route = useRoute()

const slug = computed(() => {
  const value = route.params.slug

  if (!value) {
    return '/docs'
  }

  return `/docs/${Array.isArray(value) ? value.join('/') : value}`
})

const { data: page } = await useAsyncData(
  `doc-${slug.value}`,
  () =>
    queryCollection('content')
      .path(slug.value)
      .first()
)

if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Document not found'
  })
}

useSeoMeta({
  title: page.value.title,
  description: page.value.description
})

const downloadMarkdown = async () => {
  const response = await fetch('/rtable-example.md')
  const text = await response.text()

  const blob = new Blob([text], {
    type: 'text/markdown'
  })

  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = 'rtable-example.md'
  link.click()

  URL.revokeObjectURL(url)
}

definePageMeta({ layout: 'docs'})
</script>

<template>
  <div class="content-page">
    <div class="docs-toolbar">
      <button class="btn-ghost btn-sm" @click="downloadMarkdown">
        <i class="ri-download-2-line" />
        Download Markdown
      </button>
    </div>

    <article class="content-page__article">
      <ContentRenderer
        v-if="page"
        :value="page"
        class="prose max-w-none"
      />
    </article>
  </div>
</template>

<style lang="scss" scoped>
.content-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--sp-10) var(--sp-4);

  .docs-toolbar {
    display: flex;
    justify-content: flex-end;
    margin-bottom: var(--sp-6);
  }

  &__article {
    max-width: none;
    color: var(--c-text);
    line-height: 1.8;

    :deep(h1) {
      font-size: 2.5rem;
      font-weight: 800;
      color: var(--c-text);
      margin-bottom: var(--sp-6);
    }

    :deep(h2) {
      font-size: 2rem;
      font-weight: 700;
      color: var(--c-text);
      margin: var(--sp-8) 0 var(--sp-4);
    }

    :deep(h3) {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--c-text);
      margin: var(--sp-6) 0 var(--sp-3);
    }

    :deep(p) {
      margin-bottom: var(--sp-4);
      color: var(--c-muted);
    }

    :deep(a) {
      color: var(--c-accent);
      text-decoration: none;
      transition: opacity var(--t-fast);

      &:hover {
        opacity: 0.8;
        text-decoration: underline;
      }
    }

    :deep(ul),
    :deep(ol) {
      padding-left: var(--sp-6);
      margin-bottom: var(--sp-4);
    }

    :deep(li) {
      margin-bottom: var(--sp-2);
      color: var(--c-muted);
    }

    :deep(blockquote) {
      border-left: 4px solid var(--c-border);
      padding-left: var(--sp-4);
      margin: var(--sp-6) 0;
      color: var(--c-muted);
      font-style: italic;
    }

    :deep(pre) {
      padding: var(--sp-4);
      border-radius: var(--r-lg);
      overflow-x: auto;
      background: var(--glass-bg);
      border: 1px solid var(--c-border);
      color: var(--c-text);
      font-size: var(--code-font-size);
      font-family: var(--code-font-family);
    }

    :deep(code) {
      padding: 0.15rem 0.35rem;
      border-radius: var(--r-sm);
      background: var(--c-surface);
      border: 1px solid var(--c-border);
      font-size: var(--code-font-size);
      font-family: var(--code-font-family);
      color: var(--c-accent);
    }

    :deep(img) {
      max-width: 100%;
      height: auto;
      border-radius: var(--r-lg);
    }

    :deep(table) {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: var(--sp-6);

      th {
        background: var(--c-surface);
        color: var(--c-muted);
        font-weight: 600;
        padding: var(--sp-3) var(--sp-4);
        border-bottom: 1px solid var(--c-border);
        text-align: left;
      }

      td {
        padding: var(--sp-3) var(--sp-4);
        border-bottom: 1px solid var(--c-border);
        color: var(--c-text);
      }

      tr:hover td {
        background: var(--c-hover-bg);
      }
    }

    :deep(hr) {
      border: none;
      border-top: 1px solid var(--c-border);
      margin: var(--sp-8) 0;
    }
  }
}
</style>