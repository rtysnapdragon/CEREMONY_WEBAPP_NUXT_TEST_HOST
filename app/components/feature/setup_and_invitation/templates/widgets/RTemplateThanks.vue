<template>
  <footer class="w-thanks">
    <div class="w-container w-thanks__inner">
      <WMonogram :initials="initials" size="sm" />
      <p class="w-thanks__message w-km">{{ message }}</p>
      <p class="w-thanks__names">{{ groomName }} &amp; {{ brideName }}</p>
    </div>
  </footer>
</template>

<script>
import WMonogram from './RTemplateMonogram.vue'

export default {
  name: 'WThanks',
  components: { WMonogram },
  props: {
    groomName: { type: String, required: true },
    brideName: { type: String, required: true },
    message: { type: String, default: 'សូមអរគុណដែលបានចែករំលែកភាពរីករាយជាមួយយើងខ្ញុំ' },
  },
  computed: {
    initials() {
      const g = this.groomName?.trim()?.[0] || ''
      const b = this.brideName?.trim()?.[0] || ''
      return `${g}${b}`
    },
  },
}
</script>

<style lang="scss">
.w-thanks {
  padding: var(--w-space-xl) 0 var(--w-space-lg);
  text-align: center;

  &__inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--w-space-sm);
  }

  &__message {
    color: var(--w-text-soft);
    max-width: 420px;
  }

  &__names {
    font-family: var(--w-font-script);
    font-size: 1.6rem;
    color: var(--w-primary-strong);
  }
}
</style>
