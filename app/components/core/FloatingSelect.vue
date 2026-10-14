<template>
  <div
    class="select-group"
    :class="{
      focused: isOpen || hasValue,
      error: error
    }"
  >
    <!-- Overlay label / error -->
    <label>{{ error || label }}</label>

    <!-- Control -->
    <div class="control" @click="toggle">
      <!-- Single -->
      <span v-if="!multiple && selectedLabel">
        {{ selectedLabel }}
      </span>

      <!-- Multiple -->
      <div v-if="multiple" class="chips">
        <span
          v-for="opt in selectedOptions"
          :key="opt.value"
          class="chip"
        >
          {{ opt.label }}
          <button @click.stop="remove(opt.value)">×</button>
        </span>
      </div>

      <span class="arrow">▾</span>
    </div>

    <!-- Dropdown -->
    <ul v-show="isOpen" class="dropdown">
      <li
        v-for="opt in options"
        :key="opt.value"
        @click="select(opt)"
        :class="{ active: isSelected(opt.value) }"
      >
        {{ opt.label }}
      </li>
    </ul>
  </div>
</template>

<script setup>
const props = defineProps({
  label: String,
  options: Array,
  modelValue: [String, Array],
  multiple: Boolean,
  error: String
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)

const hasValue = computed(() =>
  props.multiple
    ? Array.isArray(props.modelValue) && props.modelValue.length
    : !!props.modelValue
)

const selectedOptions = computed(() =>
  props.options.filter(o =>
    props.modelValue?.includes?.(o.value)
  )
)

const selectedLabel = computed(() =>
  props.options.find(o => o.value === props.modelValue)?.label
)

function toggle() {
  isOpen.value = !isOpen.value
}

function select(opt) {
  if (props.multiple) {
    const v = [...(props.modelValue || [])]
    const i = v.indexOf(opt.value)
    i === -1 ? v.push(opt.value) : v.splice(i, 1)
    emit('update:modelValue', v)
  } else {
    emit('update:modelValue', opt.value)
    isOpen.value = false
  }
}

function remove(value) {
  emit(
    'update:modelValue',
    props.modelValue.filter(v => v !== value)
  )
}

function isSelected(value) {
  return props.multiple
    ? props.modelValue?.includes?.(value)
    : props.modelValue === value
}

onClickOutside(() => (isOpen.value = false))
</script>

<style scoped lang="scss">

.select-group {
  position: relative;
  margin-bottom: 22px;

  label {
    position: absolute;
    top: 50%;
    left: 12px;
    transform: translateY(-50%);
    background: var(--card);
    padding: 0 6px;
    font-size: 14px;
    color: var(--muted);
    transition: all 0.50s ease;
    pointer-events: none;
  }

  &.focused label {
    top: -7px;
    font-size: 12px;
    color: var(--primary);
  }

  &.error label {
    color: #ff4d4f;
  }

  .control {
    min-height: 48px;
    padding: 12px 14px;
    border: 1px solid var(--border);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    transition: border 0.50s ease;
  }

  &.focused .control {
    border-color: var(--primary);
  }

  &.error .control {
    border-color: #ff4d4f;
  }

  .chips {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .chip {
    background: var(--primary);
    color: #fff;
    border-radius: 12px;
    padding: 4px 8px;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 4px;

    button {
      background: none;
      border: none;
      color: #fff;
      cursor: pointer;
    }
  }

  .arrow {
    opacity: .6;
  }

  .dropdown {
    position: absolute;
    width: 100%;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 14px;
    margin-top: 6px;
    max-height: 200px;
    overflow-y: auto;
    z-index: 20;
  }

  .dropdown li {
    padding: 12px 14px;
    cursor: pointer;
    transition: background 0.50s ease;
  }

  .dropdown li:hover,
  .dropdown li.active {
    background: rgba(136, 116, 225, .15);
  }
}
</style>
