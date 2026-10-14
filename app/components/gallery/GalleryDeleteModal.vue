<template>
  <Teleport to="body">
    <div v-show="photo" class="modal-overlay" @click.self="$emit('cancel')">
      <div class="modal-panel glass-card">
        <!-- Header -->
        <div class="modal-header">
          <h3>Delete Photo</h3>

          <button class="btn-icon" @click="$emit('cancel')">
            <i class="ri-close-line" />
          </button>
        </div>

        <!-- Content -->
        <p class="modal-message">
          Delete

          <strong>
            {{ photo?.filename || "this photo" }}
          </strong>

          ? This cannot be undone.
        </p>

        <!-- Footer -->
        <div class="modal-footer">
          <button
            class="btn-ghost"
            :disabled="deleting"
            @click="$emit('cancel')"
          >
            Cancel
          </button>

          <button
            class="btn-primary delete-button"
            :disabled="deleting"
            @click="$emit('confirm')"
          >
            <i v-if="deleting" class="ri-loader-4-line animate-spin" />

            <i v-else class="ri-delete-bin-line" />

            Delete
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  photo: {
    type: Object,
    default: null,
  },

  deleting: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["cancel", "confirm"]);
</script>

<style lang="scss" scoped>
/* ─────────────────────────────
   Modal
───────────────────────────── */

.modal-overlay {
  position: fixed;
  inset: 0;

  background: rgba(0, 0, 0, 0.6);

  backdrop-filter: blur(8px);

  z-index: 300;

  display: flex;

  align-items: center;
  justify-content: center;

  padding: var(--sp-4);
}

.modal-panel {
  width: min(420px, 100%);

  border-radius: var(--r-2xl);

  padding: var(--sp-6);
}

/* ─────────────────────────────
   Header
───────────────────────────── */

.modal-header {
  display: flex;

  align-items: center;

  justify-content: space-between;

  margin-bottom: var(--sp-4);

  h3 {
    font-family: var(--font-700);

    font-size: 1.125rem;

    font-weight: 700;
  }
}

/* ─────────────────────────────
   Message
───────────────────────────── */

.modal-message {
  margin-bottom: var(--sp-5);

  color: var(--c-muted);

  font-size: 0.875rem;

  line-height: 1.6;

  strong {
    color: var(--c-text);
    font-weight: 600;
  }
}

/* ─────────────────────────────
   Footer
───────────────────────────── */

.modal-footer {
  display: flex;

  justify-content: flex-end;

  gap: var(--sp-3);

  padding-top: var(--sp-4);

  border-top: 1px solid var(--c-border);
}

.delete-button {
  background: var(--c-danger) !important;
}

/* ─────────────────────────────
   Animation
───────────────────────────── */

.modal-enter-active,
.modal-leave-active {
  transition: all var(--t-base) var(--ease-out);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-panel,
.modal-leave-to .modal-panel {
  transform: scale(0.94) translateY(12px);
}
</style>
