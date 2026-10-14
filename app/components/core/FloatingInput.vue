<template>
  <div
    class="input-group"
    :class="{
      focused: isFocused || modelValue,
      error: error,
      disabled: disabled
    }"
  >
    <!-- Overlay Label / Error -->
    <label>
      {{ error || label }}
    </label>
    <!-- hide placeholder when input has value -->
    <div class="input-wrapper">
      <input
        :type="type"
        :value="modelValue"
        :placeholder="(isFocused || modelValue) ? '' : placeholder",
        :disabled="disabled"
        @input="$emit('update:modelValue', $event.target.value)"
        @focus="isFocused = true"
        @blur="isFocused = false"
      />

      <!-- 🔥 Trailing slot -->
      <div v-if="$slots.trailing" class="trailing">
        <slot name="trailing" />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  modelValue: String,
  type: { type: String, default: 'text' },
  error: String,
  disabled: { type: Boolean, default: false }, // ✅ NEW
  placeholder: { type: String, default: '' } // ✅ NEW
})

defineEmits(['update:modelValue'])

const isFocused = ref(false)
</script>

<style scoped lang="scss">

.input-group {
  position: relative;
  margin-bottom: 22px;

  .input-wrapper {
    // position: relative;
    display: flex;
    align-items: center;
    .trailing {
      position: absolute;
      right: 12px;
      display: flex;
      justify-self: unset;
      align-items: center;
    }
  }

 
  input {
    width: 100%;
    padding: 10px 14px;
    font-size: 15px;
    background: transparent;
    border: 1px solid var(--border);
    border-radius: 14px;
    color: var(--text);
    outline: none;
    transition: border 0.50s ease;;
  }

  label {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: var(--card);
    padding: 0 6px;
    font-size: 14px;
    color: var(--muted);
    pointer-events: none;
    transition: all 0.50s ease;;
  }

  &.focused label {
    top: 0;
    font-size: 10px;
    // color: var(--primary);
  }

  /* ✅ Hover only */
  &:hover:not(.error) {
    label {
      color: var(--primary);
    }

    input {
      border-color: var(--primary);
    }
  }

  // /* ❌ Focus should not change color */
  // &.focused input {
  //   border-color: var(--border);
  // }
  
 /* ✅ ACTIVE / FOCUS ONLY */
  &.focused:not(.error):not(.disabled) {
    label {
      color: var(--primary);
    }

    input {
      border-color: var(--primary);
    }
  }
 /* ❌ Hover does NOTHING */
  &:hover {
    label {
      color: var(--muted);
    }

    input {
      border-color: var(--border);
    }
  }
  // &.focused input {
  //   // border-color: var(--primary);
  // }

    /* Disabled */
  &.disabled {
    input {
      opacity: 0.6;
      cursor: not-allowed;
    }

    label {
      color: var(--muted);
    }
  }
  
  /* Error overrides everything */
  &.error {
    input {
      border-color: #ff4d4f;
    }

    label {
      color: #ff4d4f;
    }
  }
}
</style>
