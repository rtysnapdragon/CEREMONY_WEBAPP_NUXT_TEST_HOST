<template>
  <RTemplateSection eyebrow="Our Story" :title="title">
    <div class="w-story" :class="{ 'w-story--stacked': screen.isCompact }">
      <article v-for="(chapter, i) in chapters" :key="i" class="w-story__chapter">
        <div class="w-story__photo">
          <img v-if="chapter.photo" :src="chapter.photo" :alt="chapter.title" />
        </div>
        <p class="w-story__year">{{ chapter.year }}</p>
        <h3 class="w-story__chapter-title">{{ chapter.title }}</h3>
        <p class="w-story__text">{{ chapter.text }}</p>
      </article>
    </div>
  </RTemplateSection>
</template>

<script>
import { useScreenStore } from '~/stores/screen'
import RTemplateSection from './RTemplateSection.vue'

export default {
  name: 'WStory',
  components: { RTemplateSection },
  props: {
    title: { type: String, default: 'Our Story' },
    // [{ year, title, text, photo }]
    chapters: { type: Array, default: () => [] },
  },
  setup() {
    const screen = useScreenStore()
    return { screen }
  },
}
</script>

<style lang="scss">
.w-story {
  display: flex;
  gap: var(--w-space-md);

  &--stacked {
    flex-direction: column;
  }

  &__chapter {
    flex: 1;
    text-align: center;
  }

  &__photo {
    aspect-ratio: 4 / 5;
    border-radius: var(--w-radius-md);
    overflow: hidden;
    background: var(--w-bg-alt);
    margin-bottom: var(--w-space-xs);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__year {
    font-family: var(--w-font-display);
    color: var(--w-primary-strong);
  }

  &__chapter-title {
    font-size: var(--w-fs-h2);
    margin: 0.2rem 0;
  }

  &__text {
    color: var(--w-text-soft);
    font-size: var(--w-fs-small);
  }
}
</style>
