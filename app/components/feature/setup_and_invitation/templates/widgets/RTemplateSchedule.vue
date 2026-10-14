<template>
  <RTemplateSection eyebrow="Agenda" :title="title" card>
    <ol class="w-schedule">
      <li v-for="(item, i) in items" :key="i" class="w-schedule__item">
        <div class="w-schedule__marker">
          <i :class="item.icon || 'ri-calendar-event-line'" />
        </div>
        <div class="w-schedule__content">
          <p class="w-schedule__time">{{ item.time }}</p>
          <h3 class="w-schedule__label">{{ item.label }}</h3>
          <p v-if="item.note" class="w-schedule__note w-km">{{ item.note }}</p>
        </div>
      </li>
    </ol>
  </RTemplateSection>
</template>

<script>
import RTemplateSection from './RTemplateSection.vue'

export default {
  name: 'WSchedule',
  components: { RTemplateSection },
  props: {
    title: { type: String, default: 'Schedule of Events' },
    // [{ time, label, note, icon }]
    items: { type: Array, default: () => [] },
  },
}
</script>

<style lang="scss">
.w-schedule {
  list-style: none;
  margin: 0;
  padding: 0;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 19px;
    top: 8px;
    bottom: 8px;
    width: 1px;
    background: var(--w-border);
  }

  &__item {
    display: flex;
    gap: var(--w-space-sm);
    padding-bottom: var(--w-space-md);
    position: relative;

    &:last-child {
      padding-bottom: 0;
    }
  }

  &__marker {
    flex: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: var(--w-primary);
    color: var(--w-on-primary);
    z-index: 1;
  }

  &__time {
    font-size: var(--w-fs-small);
    color: var(--w-primary-strong);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  &__label {
    font-size: var(--w-fs-h2);
    margin-top: 0.15rem;
  }

  &__note {
    margin-top: 0.25rem;
    color: var(--w-text-soft);
  }
}
</style>
