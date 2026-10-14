<template>
  <div class="w-invite-frame">
    <p v-if="heading" class="w-invite-frame__heading w-km">{{ heading }}</p>

    <div
      class="w-invite-frame__box"
      :style="{ aspectRatio: ratio }"
      :class="{ 'w-invite-frame__box--editable': editable && !$slots.default && !text }"
      @click="editable && !$slots.default && !text && changeImage()"
    >
      <svg class="w-invite-frame__border" viewBox="0 0 600 160" preserveAspectRatio="none" aria-hidden="true">
        <rect x="5" y="5" width="590" height="150" rx="75" />
        <rect x="13" y="13" width="574" height="134" rx="67" />
      </svg>

      <i class="w-invite-frame__ornament w-invite-frame__ornament--left ri-leaf-line" aria-hidden="true" />
      <i class="w-invite-frame__ornament w-invite-frame__ornament--right ri-leaf-line" aria-hidden="true" />

      <img v-if="image" :src="image" :alt="heading || 'Photo'" class="w-invite-frame__img" />

      <!-- default slot: any content (text, a list, an icon) renders centered
           on top of the frame — falls back to the empty photo placeholder
           when nothing is passed and no image is set -->
      <div class="w-invite-frame__content">
        <slot>
          <p v-if="text" class="w-invite-frame__text w-km">{{ text }}</p>
          <div v-else-if="!image" class="w-invite-frame__empty">
            <i class="ri-image-add-line" />
            <span v-if="editable">Click to add photo</span>
          </div>
        </slot>
      </div>

      <i v-if="editable && image && !$slots.default && !text" class="ri-camera-line w-invite-frame__edit-badge" aria-hidden="true" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'WInviteFrame',
  props: {
    heading: { type: String, default: 'សូមគោរពអញ្ជើញ' },
    text: { type: String, default: '' }, // shorthand content prop — e.g. couple names — used when no slot is passed
    image: { type: String, default: '' }, // png, jpg, or svg url
    ratio: { type: String, default: '5.2 / 1' }, // width/height — pill-shaped by default like the reference
    editable: { type: Boolean, default: false },
  },
  emits: ['update'],
  methods: {
    changeImage() {
      const url = window.prompt('Photo URL (png, jpg, or svg):', this.image || '')
      if (url === null) return
      this.$emit('update', { image: url })
    },
  },
}
</script>

<style lang="scss">
.w-invite-frame {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;

  &__heading {
    font-size: var(--w-fs-h2);
    color: var(--w-primary-strong);
    text-align: center;
    margin: 0;
  }

  &__box {
    position: relative;
    width: 100%;
    max-width: 520px;
    border-radius: var(--w-radius-pill);
    overflow: hidden;
    background: var(--w-surface-glass);
    display: grid;
    place-items: center;

    &--editable {
      cursor: pointer;
    }

    &--editable:hover .w-invite-frame__border rect {
      stroke: var(--w-accent);
    }
  }

  &__border {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;

    rect {
      fill: none;
      stroke: var(--w-primary);
      stroke-width: 2;
      transition: stroke var(--w-dur-fast) var(--w-ease);
    }
  }

  &__ornament {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    color: var(--w-primary);
    font-size: 1.4rem;
    z-index: 1;

    &--left {
      left: -0.6rem;
      transform: translateY(-50%) scaleX(-1);
    }

    &--right {
      right: -0.6rem;
    }
  }

  &__img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__content {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--w-space-sm) var(--w-space-lg);
  }

  &__text {
    margin: 0;
    text-align: center;
    font-weight: 600;
    color: var(--w-text);
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
    color: var(--w-text-muted);
    font-size: var(--w-fs-small);

    i {
      font-size: 1.6rem;
    }
  }

  &__edit-badge {
    position: absolute;
    bottom: 8px;
    right: 8px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.55);
    color: #fff;
    display: grid;
    place-items: center;
    font-size: 0.9rem;
  }
}
</style>