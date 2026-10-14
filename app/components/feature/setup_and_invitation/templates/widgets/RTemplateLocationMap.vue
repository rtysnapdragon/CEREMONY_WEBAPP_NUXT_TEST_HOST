<template>
  <RTemplateSection eyebrow="Venue" title="ទីតាំងកម្មវិធី" card>
    <div class="w-location" :class="{ 'w-location--stacked': screen.isCompact }">
      <div class="w-location__details">
        <p class="w-location__address">{{ address }}</p>
        <p v-if="addressKm" class="w-location__address w-km">{{ addressKm }}</p>

        <a v-if="mapUrl" :href="mapUrl" target="_blank" rel="noopener" class="w-btn w-location__cta">
          <i class="ri-map-pin-line" />
          Open in Maps
        </a>
      </div>

      <div class="w-location__qr">
        <div class="w-location__qr-frame">
          <img v-if="qrCode" :src="qrCode" alt="Location QR code" />
          <i v-else class="ri-qr-code-line w-location__qr-placeholder" />
        </div>
        <p class="w-location__qr-caption">Scan for directions</p>
      </div>
    </div>
  </RTemplateSection>
</template>

<script>
import { useScreenStore } from '~/stores/screen'
import RTemplateSection from './RTemplateSection.vue'

export default {
  name: 'WLocationMap',
  components: { RTemplateSection },
  props: {
    address: { type: String, required: true },
    addressKm: { type: String, default: '' },
    mapUrl: { type: String, default: '' },
    qrCode: { type: String, default: '' }, // pre-generated QR image url; backend can render one from mapUrl
  },
  setup() {
    const screen = useScreenStore()
    return { screen }
  },
}
</script>

<style lang="scss">
.w-location {
  display: flex;
  align-items: center;
  gap: var(--w-space-lg);

  &--stacked {
    flex-direction: column-reverse;
    text-align: center;
  }

  &__details {
    flex: 1;
  }

  &__address {
    color: var(--w-text-soft);
    margin-bottom: 0.4rem;
  }

  &__cta {
    margin-top: var(--w-space-sm);
  }

  &__qr {
    flex: none;
    text-align: center;
  }

  &__qr-frame {
    width: 160px;
    height: 160px;
    border-radius: var(--w-radius-md);
    border: 2px solid var(--w-primary);
    padding: var(--w-space-xs);
    background: var(--w-surface);
    display: grid;
    place-items: center;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  &__qr-placeholder {
    font-size: 3rem;
    color: var(--w-text-muted);
  }

  &__qr-caption {
    margin-top: var(--w-space-xs);
    font-size: var(--w-fs-small);
    color: var(--w-text-muted);
  }
}
</style>
