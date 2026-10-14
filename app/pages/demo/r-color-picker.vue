<template>
  <div class="rcp-usage">

    <!-- ── ១. Single color — button triggers popover ─────────────────────── -->
    <div class="rcp-field">
      <label class="rcp-label">{{ tr('color.primary') }}</label>
      <UPopover :content="{ side: 'bottom', align: 'start' }">
        <!-- Trigger: small color swatch + hex value -->
        <button class="rcp-trigger" type="button">
          <span class="rcp-trigger__swatch" :style="{ background: color1 }" />
          <span class="rcp-trigger__hex">{{ color1 }}</span>
          <i class="ri-arrow-down-s-line rcp-trigger__arrow" />
        </button>

        <!-- Popover content: the picker itself -->
        <template #content>
          <div class="rcp-pop">
            <RColorPicker v-model="color1" format="hex" size="md" />
          </div>
        </template>
      </UPopover>
    </div>

    <!-- ── ២. Two colors (like the screenshot) ──────────────────────────── -->
    <div class="rcp-field">
      <label class="rcp-label">{{ tr('color.gradient_start') }}</label>
      <UPopover :content="{ side: 'bottom', align: 'start' }">
        <button class="rcp-trigger" type="button">
          <span class="rcp-trigger__swatch" :style="{ background: color2 }" />
          <span class="rcp-trigger__hex">{{ color2 }}</span>
          <i class="ri-arrow-down-s-line rcp-trigger__arrow" />
        </button>
        <template #content>
          <div class="rcp-pop">
            <RColorPicker v-model="color2" format="hex" size="md" />
          </div>
        </template>
      </UPopover>
    </div>

    <div class="rcp-field">
      <label class="rcp-label">{{ tr('color.gradient_end') }}</label>
      <UPopover :content="{ side: 'bottom', align: 'start' }">
        <button class="rcp-trigger" type="button">
          <span class="rcp-trigger__swatch" :style="{ background: color3 }" />
          <span class="rcp-trigger__hex">{{ color3 }}</span>
          <i class="ri-arrow-down-s-line rcp-trigger__arrow" />
        </button>
        <template #content>
          <div class="rcp-pop">
            <RColorPicker v-model="color3" format="hex" size="md" />
          </div>
        </template>
      </UPopover>
    </div>

    <!-- ── ៣. Compact inline row (swatch-only trigger, no hex label) ─────── -->
    <div class="rcp-field">
      <label class="rcp-label">{{ tr('color.accent') }}</label>
      <div class="rcp-swatch-row">
        <UPopover
          v-for="(col, key) in swatches"
          :key="key"
          :content="{ side: 'bottom', align: 'start' }"
        >
          <button
            class="rcp-swatch-btn"
            type="button"
            :title="key"
            :style="{ background: col }"
          >
            <i class="ri-check-line rcp-swatch-btn__check" />
          </button>
          <template #content>
            <div class="rcp-pop">
              <RColorPicker v-model="swatches[key]" format="hex" size="sm" />
            </div>
          </template>
        </UPopover>
      </div>
    </div>

  </div>
</template>

<script setup>
const { tr } = useTr()

const color1 = ref('#C6C194')  // matches screenshot color 1
const color2 = ref('#B6807C')  // matches screenshot color 2
const color3 = ref('#ff8c42')  // SARIKA accent default

const swatches = reactive({
  primary:   '#ff8c42',
  secondary: '#ffb347',
  success:   '#4ade80',
  danger:    '#f87171',
})
</script>

<style lang="scss">
// ── Color picker popover wrapper ─────────────────────────────────────────
.rcp-pop {
  padding:         var(--sp-3);
  background:      var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border-radius:   var(--r-xl);
}

// ── Field row ────────────────────────────────────────────────────────────
.rcp-usage {
  display:        flex;
  flex-direction: column;
  gap:            var(--sp-3);
  font-family:    var(--font-fallback);
}

.rcp-field {
  display:        flex;
  flex-direction: column;
  gap:            var(--sp-1);
}

.rcp-label {
  font-size:   0.75rem;
  font-weight: 600;
  color:       var(--c-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

// ── Trigger button ────────────────────────────────────────────────────────
.rcp-trigger {
  display:       inline-flex;
  align-items:   center;
  gap:           var(--sp-2);
  padding:       var(--sp-1) var(--sp-2);
  border:        1px solid var(--c-border);
  border-radius: var(--r-md);
  background:    var(--c-surface);
  cursor:        pointer;
  font-family:   var(--font-fallback);
  transition:    border-color var(--t-fast) var(--ease-out),
                 box-shadow   var(--t-fast) var(--ease-out);

  &:hover {
    border-color: var(--c-accent);
    box-shadow:   var(--glow-accent-sm);
  }

  &__swatch {
    width:         20px;
    height:        20px;
    border-radius: var(--r-sm);
    border:        1px solid color-mix(in srgb, var(--c-text) 12%, transparent);
    flex-shrink:   0;
    display:       block;
  }

  &__hex {
    font-size:   0.8rem;
    font-weight: 600;
    color:       var(--c-text);
    font-family: ui-monospace, monospace;
    letter-spacing: 0.04em;
    min-width:   60px;
  }

  &__arrow {
    font-size: 0.9rem;
    color:     var(--c-muted);
    margin-left: auto;
  }
}

// ── Compact swatch row ────────────────────────────────────────────────────
.rcp-swatch-row {
  display: flex;
  gap:     var(--sp-2);
  flex-wrap: wrap;
}

.rcp-swatch-btn {
  position:      relative;
  width:         28px;
  height:        28px;
  border-radius: var(--r-md);
  border:        2px solid transparent;
  cursor:        pointer;
  transition:    border-color var(--t-fast) var(--ease-out),
                 transform    var(--t-fast) var(--ease-out),
                 box-shadow   var(--t-fast) var(--ease-out);
  overflow:      hidden;

  &__check {
    position:    absolute;
    inset:       0;
    display:     flex;
    align-items: center;
    justify-content: center;
    font-size:   0.9rem;
    color:       #fff;
    opacity:     0;
    transition:  opacity var(--t-fast);
  }

  &:hover {
    border-color: var(--c-accent);
    transform:    scale(1.1);
    box-shadow:   var(--glow-accent-sm);

    .rcp-swatch-btn__check { opacity: 1; }
  }
}
</style>
