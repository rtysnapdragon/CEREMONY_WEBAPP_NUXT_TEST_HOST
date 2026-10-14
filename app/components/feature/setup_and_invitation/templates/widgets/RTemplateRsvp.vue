<template>
  <RTemplateSection eyebrow="RSVP" title="សូមបញ្ជាក់ការចូលរួម" card>
    <form v-if="!submitted" class="w-rsvp" @submit.prevent="handleSubmit">
      <label class="w-rsvp__field">
        <span>Full name</span>
        <input v-model="form.name" type="text" required placeholder="Your name" />
      </label>

      <div class="w-rsvp__choice">
        <button
          type="button"
          class="w-rsvp__choice-btn"
          :class="{ 'is-active': form.attending === true }"
          @click="form.attending = true"
        >
          <i class="ri-check-line" /> Joyfully accept
        </button>
        <button
          type="button"
          class="w-rsvp__choice-btn"
          :class="{ 'is-active': form.attending === false }"
          @click="form.attending = false"
        >
          <i class="ri-close-line" /> Regretfully decline
        </button>
      </div>

      <label v-if="form.attending" class="w-rsvp__field">
        <span>Number of guests</span>
        <input v-model.number="form.guests" type="number" min="1" max="10" />
      </label>

      <label class="w-rsvp__field">
        <span>Message (optional)</span>
        <textarea v-model="form.message" rows="3" placeholder="A note for the couple" />
      </label>

      <button type="submit" class="w-btn w-rsvp__submit" :disabled="form.attending === null || loading">
        <i class="ri-send-plane-line" />
        {{ loading ? 'Sending…' : 'Send RSVP' }}
      </button>

      <p v-if="errorMsg" class="w-rsvp__error">{{ errorMsg }}</p>
    </form>

    <div v-else class="w-rsvp__thanks">
      <i class="ri-heart-3-fill" />
      <p>Thank you, {{ form.name }} — your response has been received.</p>
    </div>
  </RTemplateSection>
</template>

<script>
import { useWeddingApi } from '~/composables/useWeddingApi'
import RTemplateSection from './RTemplateSection.vue'

export default {
  name: 'WRsvp',
  components: { RTemplateSection },
  props: {
    slug: { type: String, required: true },
  },
  data() {
    return {
      form: { name: '', attending: null, guests: 1, message: '' },
      loading: false,
      submitted: false,
      errorMsg: '',
    }
  },
  methods: {
    async handleSubmit() {
      this.errorMsg = ''
      this.loading = true
      try {
        const { submitRsvp } = useWeddingApi()
        await submitRsvp(this.slug, this.form)
        this.submitted = true
      } catch (e) {
        this.errorMsg = 'Could not send your RSVP — please try again.'
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style lang="scss">
.w-rsvp {
  display: flex;
  flex-direction: column;
  gap: var(--w-space-sm);
  max-width: 420px;
  margin: 0 auto;

  &__field {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    font-size: var(--w-fs-small);
    color: var(--w-text-soft);

    input,
    textarea {
      font-family: var(--w-font-body);
      padding: 0.65rem 0.9rem;
      border-radius: var(--w-radius-sm);
      border: 1px solid var(--w-border);
      background: var(--w-surface);
      color: var(--w-text);
      resize: vertical;

      &:focus {
        outline: 2px solid var(--w-primary);
        outline-offset: 1px;
      }
    }
  }

  &__choice {
    display: flex;
    gap: var(--w-space-xs);
  }

  &__choice-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    padding: 0.65rem;
    border-radius: var(--w-radius-sm);
    border: 1px solid var(--w-border);
    background: var(--w-surface);
    color: var(--w-text-soft);
    cursor: pointer;
    font-family: var(--w-font-body);
    transition: background var(--w-dur-fast) var(--w-ease), color var(--w-dur-fast) var(--w-ease);

    &.is-active {
      background: var(--w-primary);
      color: var(--w-on-primary);
      border-color: var(--w-primary);
    }
  }

  &__submit {
    justify-content: center;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
  }

  &__error {
    color: var(--w-accent);
    font-size: var(--w-fs-small);
    text-align: center;
  }

  &__thanks {
    text-align: center;
    color: var(--w-text-soft);

    i {
      font-size: 2rem;
      color: var(--w-accent);
      display: block;
      margin-bottom: var(--w-space-xs);
    }
  }
}
</style>
