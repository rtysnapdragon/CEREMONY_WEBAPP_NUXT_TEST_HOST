# Render columns / cell with button

```
<script setup>
// ... rest of your code ...

const columnsRender = computed(() => {
  const cols = []

  // ── Expand button column ────────────────────────────────────────────
  if (anyExpandable.value) {
    cols.push({
      id: '__expand',
      size: 48,
      class: 'r-table-col-expand',
      enableSorting: false,
      header: () => h('span', { class: 'r-table__expand-placeholder' }),
      cell: ({ row }) => {
        // Only show expand button if there are expanded columns
        if (!hasExpandedCols.value) {
          return h('span', { class: 'r-table__expand-placeholder' })
        }

        const isOpen = row.getIsExpanded()

        // Create the button with icon
        const button = h('button', {
          class: ['r-table__expand-btn', isOpen && 'r-table__expand-btn--open'],
          'aria-label': isOpen ? t('collapse') : t('expand'),
          'aria-expanded': String(isOpen),
          onClick: (e) => {
            e.stopPropagation()
            row.toggleExpanded()
            console.log('Toggle expanded:', row.id, 'new state:', !isOpen)
          },
        }, [
          h(resolveComponent('UIcon'), {
            name: isOpen ? 'i-ri-arrow-down-s-fill' : 'i-ri-arrow-right-s-fill',
          })
        ])

        // Wrap with RTooltip
        return h('div', { class: 'r-table-expand-cell' }, [
          h(resolveComponent('RTooltip'), {
            text: isOpen ? t('collapse') : t('expand'),
            placement: 'top',
            // You can add more RTooltip props here
            // delay: 300,
            // disabled: false,
          }, {
            default: () => button
          })
        ])
      }
    })
  }

  // ── Checkbox column ─────────────────────────────────────────────────
  if (props.selectedPk || props.checkbox) {
    const RCheckbox = resolveComponent('RCheckbox')
    cols.push({
      id: '__select',
      size: 48,
      class: 'r-table-col-checkbox',
      enableSorting: false,
      header: () => h(RCheckbox, {
        indeterminate: isIndeterminate.value,
        'aria-label': t('select_all'),
        'onUpdate:modelValue': toggleAll,
      }),
      cell: ({ row }) => h('div', { class: 'r-table-checkbox-cell' }, [
        h(RCheckbox, {
          modelValue: isRowSelected(row.original),
          'aria-label': t('select_row'),
          'onUpdate:modelValue': () => toggleRow(row.original),
          onClick: (e) => e.stopPropagation(),
        }),
      ])
    })
  }

  // ── Data columns ────────────────────────────────────────────────────
  // ... rest of your data columns code ...

  return cols
})

// ─── Alternative: If RTooltip expects a specific slot structure ──────────

// Some tooltip components use a different API. Here are alternatives:

// Alternative 1: If RTooltip uses default slot
const columnsRenderAlternative1 = computed(() => {
  // ... same code ...

  return h('div', { class: 'r-table-expand-cell' }, [
    h(resolveComponent('RTooltip'), {
      content: isOpen ? t('collapse') : t('expand'),
      placement: 'top',
    }, {
      default: () => button
    })
  ])
})

// Alternative 2: If RTooltip wraps its children directly
const columnsRenderAlternative2 = computed(() => {
  // ... same code ...

  return h('div', { class: 'r-table-expand-cell' }, [
    h(resolveComponent('RTooltip'), {
      title: isOpen ? t('collapse') : t('expand'),
      placement: 'top',
    }, [
      button
    ])
  ])
})

// Alternative 3: If you need to pass the button as a trigger slot
const columnsRenderAlternative3 = computed(() => {
  // ... same code ...

  return h('div', { class: 'r-table-expand-cell' }, [
    h(resolveComponent('RTooltip'), {
      text: isOpen ? t('collapse') : t('expand'),
      placement: 'top',
    }, {
      trigger: () => button
    })
  ])
})

// ─── If RTooltip doesn't work, use a simple div with title attribute ──────

const columnsRenderFallback = computed(() => {
  // ... same code ...

  return h('div', { class: 'r-table-expand-cell' }, [
    h('button', {
      class: ['r-table__expand-btn', isOpen && 'r-table__expand-btn--open'],
      'aria-label': isOpen ? t('collapse') : t('expand'),
      'aria-expanded': String(isOpen),
      title: isOpen ? t('collapse') : t('expand'), // Native browser tooltip
      onClick: (e) => {
        e.stopPropagation()
        row.toggleExpanded()
        console.log('Toggle expanded:', row.id, 'new state:', !isOpen)
      },
    }, [
      h(resolveComponent('UIcon'), {
        name: isOpen ? 'i-ri-arrow-down-s-fill' : 'i-ri-arrow-right-s-fill',
      })
    ])
  ])
})

// ─── If you want a custom tooltip implementation ───────────────────────────

// Custom tooltip component using hover events
const CustomTooltip = {
  props: ['text'],
  setup(props, { slots }) {
    const show = ref(false)

    return () => h('div', {
      class: 'r-table-tooltip-wrapper',
      onMouseenter: () => { show.value = true },
      onMouseleave: () => { show.value = false },
      style: { position: 'relative', display: 'inline-block' }
    }, [
      slots.default?.(),
      show.value ? h('div', {
        class: 'r-table-tooltip-popup',
        style: {
          position: 'absolute',
          bottom: 'calc(100% + 8px)',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--ui-bg-inverted)',
          color: 'var(--ui-text-inverted)',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          whiteSpace: 'nowrap',
          zIndex: 1000,
          pointerEvents: 'none',
        }
      }, props.text) : null
    ])
  }
}

// Then use it like:
const columnsRenderWithCustomTooltip = computed(() => {
  // ... same code ...

  return h('div', { class: 'r-table-expand-cell' }, [
    h(CustomTooltip, {
      text: isOpen ? t('collapse') : t('expand'),
    }, {
      default: () => button
    })
  ])
})

</script>

<style lang="scss" scoped>
// ─── Custom tooltip styles (if using CustomTooltip) ────────────────────────

.r-table-tooltip-wrapper {
  position: relative;
  display: inline-block;
}

.r-table-tooltip-popup {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--ui-bg-inverted, #1a1a1a);
  color: var(--ui-text-inverted, #ffffff);
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 1000;
  pointer-events: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

  // Add a small arrow
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: var(--ui-bg-inverted, #1a1a1a);
  }
}

// ─── Expand button styles ────────────────────────────────────────────────────

.r-table__expand-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--ui-text-muted);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: var(--ui-primary);
    background: color-mix(in srgb, var(--ui-primary) 10%, transparent);
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }

  &--open {
    color: var(--ui-primary);
    background: color-mix(in srgb, var(--ui-primary) 8%, transparent);
  }
}

.r-table-expand-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  min-height: 40px;
}

.r-table__expand-placeholder {
  display: inline-block;
  width: 28px;
  height: 28px;
}

// ─── For accessibility ──────────────────────────────────────────────────────

.r-table__expand-btn:focus-visible {
  outline: 2px solid var(--ui-primary);
  outline-offset: 2px;
  border-radius: 4px;
}

// ─── If using RTooltip from UI library ─────────────────────────────────────

// Adjust based on your RTooltip implementation
.r-table-expand-cell {
  :deep(.r-tooltip) {
    display: inline-flex;
  }

  :deep(.r-tooltip__trigger) {
    display: inline-flex;
  }
}
</style

```

// Pattern 1: Tooltip with content prop
h(resolveComponent('RTooltip'), {
content: isOpen ? t('collapse') : t('expand'),
placement: 'top',
}, {
default: () => button
})

// Pattern 2: Tooltip with text prop
h(resolveComponent('RTooltip'), {
text: isOpen ? t('collapse') : t('expand'),
placement: 'top',
}, {
default: () => button
})

// Pattern 3: Tooltip with title prop (like HTML title)
h(resolveComponent('RTooltip'), {
title: isOpen ? t('collapse') : t('expand'),
placement: 'top',
}, {
default: () => button
})

// Pattern 4: Tooltip wrapping children directly
h(resolveComponent('RTooltip'), {
title: isOpen ? t('collapse') : t('expand'),
placement: 'top',
}, [button])
