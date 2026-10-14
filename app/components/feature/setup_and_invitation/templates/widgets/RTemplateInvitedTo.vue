<template>
  <div v-if="$slots.invitedTo" class="w-invited-to__extra">
    <slot name="invitedTo" />
  </div>

  <WInviteFrame :heading="heading" :image="image" :editable="editable" @update="$emit('update', $event)">
    <p class="w-invited-to__content" style="white-space: pre-line">{{ inviteTo || '…' }}</p>
  </WInviteFrame>
</template>

<script setup>
import WInviteFrame from './RInviteFrame.vue'

defineProps({
  inviteTo: { type: String, default: '' },
  heading: { type: String, default: 'សូមគោរពអញ្ជើញ' },
  image: { type: String, default: '' },
  editable: { type: Boolean, default: false },
})

defineEmits(['update'])
</script>

<style lang="scss">
.w-invited-to {
  &__extra {
    margin-bottom: var(--w-space-sm);
    text-align: center;
  }

  &__content {
    margin: 0;
    text-align: center;
    color: var(--w-text);
    line-height: 1.8;
  }
}
</style>