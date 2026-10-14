<template>
  <RTemplateSection eyebrow="Gift" title="ជូនអំណោយអាពាហ៍ពិពាហ៍" subtitle="Your presence is the greatest gift — a contribution is warmly welcome too.">
    <div class="w-gift" :class="{ 'w-gift--stacked': screen.isCompact }">
      <article v-for="(method, i) in methods" :key="i" class="w-gift__card">
        <div class="w-gift__qr">
          <img v-if="method.qrCode" :src="method.qrCode" :alt="method.label" />
          <i v-else class="ri-bank-card-line w-gift__placeholder" />
        </div>
        <h4 class="w-gift__label">{{ method.label }}</h4>
        <p class="w-gift__account">{{ method.accountName }}</p>
        <button type="button" class="w-btn w-btn--ghost w-gift__copy" @click="copy(method.accountNumber)">
          <i class="ri-file-copy-line" />
          {{ method.accountNumber }}
        </button>
        <span v-if="copiedIndex === i" class="w-gift__copied">Copied</span>
      </article>
    </div>
  </RTemplateSection>
</template>

<script>
import { useScreenStore } from '~/stores/screen'
import RTemplateSection from './RTemplateSection.vue'

export default {
  name: 'WGiftPayment',
  components: { RTemplateSection },
  props: {
    // [{ label, accountName, accountNumber, qrCode }]
    methods: { type: Array, default: () => [] },
  },
  setup() {
    const screen = useScreenStore()
    return { screen }
  },
  data() {
    return { copiedIndex: null }
  },
  methods: {
    async copy(value) {
      const idx = this.methods.findIndex((m) => m.accountNumber === value)
      try {
        await navigator.clipboard.writeText(value)
        this.copiedIndex = idx
        setTimeout(() => (this.copiedIndex = null), 1500)
      } catch (e) {
        // clipboard may be unavailable (non-secure context) — fail silently
      }
    },
  },
}
</script>

<style lang="scss">
.w-gift {
  display: flex;
  gap: var(--w-space-md);
  flex-wrap: wrap;
  justify-content: center;

  &--stacked {
    flex-direction: column;
  }

  &__card {
    flex: 1;
    min-width: 200px;
    max-width: 260px;
    text-align: center;
    padding: var(--w-space-md);
    border-radius: var(--w-radius-md);
    background: var(--w-surface);
    border: 1px solid var(--w-border);
  }

  &__qr {
    width: 120px;
    height: 120px;
    margin: 0 auto var(--w-space-xs);
    border-radius: var(--w-radius-sm);
    background: var(--w-bg-alt);
    display: grid;
    place-items: center;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  &__placeholder {
    font-size: 2.4rem;
    color: var(--w-text-muted);
  }

  &__label {
    font-size: var(--w-fs-body);
    color: var(--w-primary-strong);
  }

  &__account {
    font-size: var(--w-fs-small);
    color: var(--w-text-soft);
    margin-top: 0.2rem;
  }

  &__copy {
    margin-top: var(--w-space-xs);
    width: 100%;
    justify-content: center;
    font-size: var(--w-fs-small);
  }

  &__copied {
    display: block;
    margin-top: 0.3rem;
    font-size: 0.75rem;
    color: var(--w-accent);
  }
}
</style>
