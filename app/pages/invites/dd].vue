<template>
  <div v-if="pending" class="w-loading">Loading invitation…</div>
  <RTemplateRenderer
    v-else
    :background="template?.background"
    :sections="template?.sections"
  />
</template>

<script>
import { useWeddingApi } from '~/composables/useWeddingApi'
import { findMockTemplate } from '~/data/mockWeddingTemplates'
import RTemplateRenderer from '~/components/feature/setup_and_invitation/templates/widgets/RTemplateRenderer.vue'

export default {
  name: 'WeddingTemplatePage',
  components: { RTemplateRenderer },
  data() {
    return { template: null, pending: true }
  },
  async created() {
    const slug = this.$route.params.slug
    try {
      const { fetchTemplate } = useWeddingApi()
      this.template = await fetchTemplate(slug)
      if (!this.template?.sections?.length) this.template = findMockTemplate(slug)
    } catch {
      // API not wired yet in this environment — fall back to the mock so
      // the page (and every section) stays fully demonstrable.
      this.template = findMockTemplate(slug)
    } finally {
      this.pending = false
    }
  },
}

definePageMeta({layout: false})
</script>

<style lang="scss">
.w-loading {
  min-height: 100vh;
  display: grid;
  place-items: center;
  color: var(--w-text-soft);
  font-family: var(--w-font-body);
}
</style>