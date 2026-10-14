<!-- components/R/ToastPremium.vue -->
<script setup>
const props = defineProps({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  action: {
    type: Object, // { label, icon?, onClick? }
    default: null,
  },
  badges: {
    type: Array, // string[]
    default: () => ['Instant Access', 'No Subscription'],
  },
})
const id = computed(() => props.id)
const title = computed(() => props.title)
const description = computed(() => props.description)
const action = computed(() => props.action)
const badges = computed(() => props.badges)
const emit = defineEmits(['close'])

function handleAction() {
  props.action?.onClick?.()
  emit('close', props.id)
}
</script>

<template>
  <div class="r-toast-premium">
    <!-- Close -->
    <button class="r-toast-premium__close" @click="$emit('close', id)">
      <i class="ri-close-line" />
    </button>
    <!-- Header -->
    <div class="r-toast-premium__header">
      <span class="r-toast-premium__dot" />
      <span class="r-toast-premium__title">{{ title }}</span>
    </div>

    <!-- Description -->
    <p v-if="description" class="r-toast-premium__desc">
      {{ description }}
    </p>

    <!-- CTA Button -->
    <button v-if="action" class="r-toast-premium__action" @click="handleAction">
      <i v-if="action.icon" :class="action.icon" />
      {{ action.label }}
      <i class="ri-arrow-right-s-line" />
    </button>

    <!-- Badges -->
    <div v-if="badges?.length" class="r-toast-premium__badges">
      <span v-for="badge in badges" :key="badge" class="r-toast-premium__badge">
        <i class="ri-checkbox-line" />
        {{ badge }}
      </span>
    </div>
  </div>
</template>

<style lang="scss">
.r-toast-premium {
  position: relative;
  width: 320px;
  padding: 20px 20px 16px;
  border-radius: 16px;
  background: #1a1f2e;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  color: #fff;
  display: flex;
  flex-direction: column;
  gap: 10px;

  // Animate in
  animation: premiumSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;

  &__close {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 24px;
    height: 24px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.08);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.5);
    font-size: 13px;
    transition: background 0.15s, color 0.15s;

    &:hover {
      background: rgba(255, 255, 255, 0.14);
      color: #fff;
    }
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-right: 24px;
  }

  &__dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: #22c55e; // green-500
    flex-shrink: 0;
    box-shadow: 0 0 8px rgba(34, 197, 94, 0.6);
  }

  &__title {
    font-size: 14px;
    font-weight: 700;
    line-height: 1.3;
    color: #fff;
  }

  &__desc {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.5;
    margin: 0;
    padding-left: 17px; // align with title past the dot
  }

  &__action {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    width: 100%;
    padding: 11px 16px;
    border-radius: 50px;
    background: rgba(255, 255, 255, 0.10);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #fff;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
    margin-top: 2px;

    i { font-size: 14px; }

    &:hover {
      background: rgba(255, 255, 255, 0.16);
      border-color: rgba(255, 255, 255, 0.2);
    }
  }

  &__badges {
    display: flex;
    gap: 14px;
    padding-left: 2px;
  }

  &__badge {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11.5px;
    font-weight: 500;
    color: #22c55e;

    i { font-size: 12px; }
  }
}

@keyframes premiumSlideIn {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>