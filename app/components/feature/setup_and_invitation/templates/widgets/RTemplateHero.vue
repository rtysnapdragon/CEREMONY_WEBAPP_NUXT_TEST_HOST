<template>
  <header class="w-hero" :class="`w-hero--${screen.isCompact ? 'compact' : 'wide'}`">
    <div class="w-container w-hero__inner">
      <p class="w-eyebrow w-hero__eyebrow">{{ eyebrowText }}</p>

      <WMonogram :initials="initials" size="lg" class="w-hero__monogram" />

      <h1 class="w-hero__names">
        <span>{{ groomName }}</span>
        <i class="ri-heart-fill w-hero__heart" aria-hidden="true" />
        <span>{{ brideName }}</span>
      </h1>

      <p class="w-hero__date">{{ formattedDate }}</p>

      <div v-if="showCountdown" class="w-hero__countdown">
        <div v-for="unit in countdownUnits" :key="unit.label" class="w-hero__unit">
          <span class="w-hero__unit-value">{{ unit.value }}</span>
          <span class="w-hero__unit-label">{{ unit.label }}</span>
        </div>
      </div>

      <p v-if="km" class="w-km w-hero__km">{{ km }}</p>
    </div>
  </header>
</template>

<script>
import { useScreenStore } from '~/stores/screen'
import { useCountdown } from '~/composables/useCountdown'
import WMonogram from './RTemplateMonogram.vue'

export default {
  name: 'WHero',
  components: { WMonogram },
  props: {
    groomName: { type: String, required: true },
    brideName: { type: String, required: true },
    eventDate: { type: String, required: true }, // ISO string
    eyebrowText: { type: String, default: 'The Wedding Invitation' },
    km: { type: String, default: '' }, // optional khmer line, e.g. សូមគោរពអញ្ជើញ
    showCountdown: { type: Boolean, default: true },
  },
  setup(props) {
    const screen = useScreenStore()
    const { remaining } = useCountdown(() => props.eventDate)
    return { screen, remaining }
  },
  computed: {
    initials() {
      const g = this.groomName?.trim()?.[0] || ''
      const b = this.brideName?.trim()?.[0] || ''
      return `${g}${b}`
    },
    formattedDate() {
      const d = new Date(this.eventDate)
      if (Number.isNaN(d.getTime())) return this.eventDate
      return d.toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' })
    },
    countdownUnits() {
      const r = this.remaining
      return [
        { label: 'Days', value: r.days },
        { label: 'Hours', value: r.hours },
        { label: 'Min', value: r.minutes },
        { label: 'Sec', value: r.seconds },
      ]
    },
  },
}
</script>

<style lang="scss">
.w-hero {
  min-height: 100vh;
  display: grid;
  place-items: center;
  text-align: center;
  padding: var(--w-space-xl) 0;

  &--compact {
    min-height: 92vh;
    padding: var(--w-space-lg) 0;
  }

  &__inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--w-space-sm);
  }

  &__eyebrow {
    order: 0;
  }

  &__monogram {
    margin: var(--w-space-sm) 0;
  }

  &__names {
    font-size: var(--w-fs-hero);
    display: flex;
    align-items: center;
    gap: var(--w-space-sm);
    flex-wrap: wrap;
    justify-content: center;
  }

  &__heart {
    color: var(--w-accent);
    font-size: 0.5em;
  }

  &__date {
    color: var(--w-text-soft);
    font-size: var(--w-fs-h2);
    letter-spacing: 0.05em;
  }

  &__countdown {
    display: flex;
    gap: var(--w-space-sm);
    margin-top: var(--w-space-sm);
  }

  &__unit {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 64px;
    padding: var(--w-space-xs);
    border-radius: var(--w-radius-md);
    background: var(--w-surface-glass);
    border: 1px solid var(--w-border);

    &-value {
      font-family: var(--w-font-display);
      font-size: 1.6rem;
      color: var(--w-primary-strong);
    }

    &-label {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--w-text-muted);
    }
  }

  &__km {
    margin-top: var(--w-space-sm);
    color: var(--w-text-soft);
    text-align: center;
  }
}
</style>
