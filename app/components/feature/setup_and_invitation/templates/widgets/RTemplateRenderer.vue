<template>
  <WBackground :type="background.type" :value="background.value">
    <component
      :is="resolve(section.component)"
      v-for="(section, i) in localSections"
      :key="section.id || i"
      v-bind="section.props"
      :editable="editable"
      @update="onSectionUpdate(i, $event)"
    />
  </WBackground>
</template>

<script>
import WBackground from './RTemplateBackground.vue'
import WHero from './RTemplateHero.vue'
import WCoupleProfile from './RTemplateCoupleProfile.vue'
import WStory from './RTemplateStory.vue'
import WSchedule from './RTemplateSchedule.vue'
import WLocationMap from './RTemplateLocationMap.vue'
import WGiftPayment from './RTemplateGiftPayment.vue'
import WRsvp from './RTemplateRsvp.vue'
import WInviteFrame from './RInviteFrame.vue'
import WThanks from './RTemplateThanks.vue'
const toast = useToastStore()


// Registry keyed by the string every template's schema uses to reference a
// section. Add new section components here once, then any template's JSON
// (from the CMS/builder) can drop them in, in any order, with any props.
const REGISTRY = {
  hero: WHero,
  couple: WCoupleProfile,
  frame: WInviteFrame,
  gallery: WGallery,
  story: WStory,
  schedule: WSchedule,
  location: WLocationMap,
  gift: WGiftPayment,
  rsvp: WRsvp,
  thanks: WThanks,
}

export default {
  name: 'WTemplateRenderer',
  components: { WBackground },
  props: {
    // { type: 'gradient' | 'image' | 'video' | 'particles', value }
    background: { type: Object, default: () => ({ type: 'gradient', value: null }) },
    // [{ id, component: 'hero' | 'couple' | ..., props: {...} }]
    sections: { type: Array, default: () => [] },
    // when true, every section renders its own inline-editable controls
    // (see WEditable.vue) instead of static text/images
    editable: { type: Boolean, default: false },
  },
  emits: ['change'],
  data() {
    // local, mutable clone — props are read-only, and edits need somewhere
    // to land before being sent back up for saving
    return { localSections: this.sections.map((s) => ({ ...s, props: { ...s.props } })) }
  },
  watch: {
    sections: {
      deep: true,
      handler(next) {
        this.localSections = next.map((s) => ({ ...s, props: { ...s.props } }))
      },
    },
  },
  methods: {
    resolve(key) {
      const cmp = REGISTRY[key]
      if (!cmp && process.dev) {
        // eslint-disable-next-line no-console
        console.warn(`[WTemplateRenderer] Unknown section "${key}" — check the template schema.`)
      }
      return cmp || 'div'
    },
    onSectionUpdate(index, patch) {
      const section = this.localSections[index]
      section.props = { ...section.props, ...patch }
      this.$emit('change', this.localSections)
    },
  },
}
</script>