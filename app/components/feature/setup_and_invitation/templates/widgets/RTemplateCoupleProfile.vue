<template>
  <RTemplateSection eyebrow="Groom & Bride" title="ព័ត៌មានគូស្នេហ៍">
    <div class="w-couple" :class="{ 'w-couple--stacked': screen.isCompact }">
      <article class="w-couple__card">
        <div class="w-couple__photo">
          <img v-if="groom.photo" :src="groom.photo" :alt="groom.name" />
          <i v-else class="ri-user-3-line w-couple__placeholder" />
        </div>
        <h3 class="w-couple__name">{{ groom.name }}</h3>
        <p v-if="groom.parents" class="w-couple__parents w-km">{{ groom.parents }}</p>
      </article>

      <i class="ri-heart-3-fill w-couple__divider" aria-hidden="true" />

      <article class="w-couple__card">
        <div class="w-couple__photo">
          <img v-if="bride.photo" :src="bride.photo" :alt="bride.name" />
          <i v-else class="ri-user-3-line w-couple__placeholder" />
        </div>
        <h3 class="w-couple__name">{{ bride.name }}</h3>
        <p v-if="bride.parents" class="w-couple__parents w-km">{{ bride.parents }}</p>
      </article>
    </div>
  </RTemplateSection>
</template>

<script>
import { useScreenStore } from '~/stores/screen'
import RTemplateSection from './RTemplateSection.vue'

export default {
  name: 'WCoupleProfile',
  components: { RTemplateSection },
  props: {
    groom: { type: Object, required: true }, // { name, photo, parents }
    bride: { type: Object, required: true },
  },
  setup() {
    const screen = useScreenStore()
    return { screen }
  },
}
</script>

<style lang="scss">
.w-couple {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--w-space-lg);

  &--stacked {
    flex-direction: column;
    gap: var(--w-space-md);
  }

  &__card {
    text-align: center;
    flex: 1;
    max-width: 260px;
  }

  &__photo {
    width: 160px;
    height: 160px;
    border-radius: 50%;
    overflow: hidden;
    margin: 0 auto var(--w-space-sm);
    border: 3px solid var(--w-primary);
    box-shadow: 0 12px 30px var(--w-shadow);
    display: grid;
    place-items: center;
    background: var(--w-bg-alt);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__placeholder {
    font-size: 3rem;
    color: var(--w-text-muted);
  }

  &__name {
    font-size: var(--w-fs-h2);
  }

  &__parents {
    margin-top: 0.25rem;
    color: var(--w-text-soft);
    font-size: var(--w-fs-small);
  }

  &__divider {
    color: var(--w-accent);
    font-size: 1.5rem;
  }
}
</style>
