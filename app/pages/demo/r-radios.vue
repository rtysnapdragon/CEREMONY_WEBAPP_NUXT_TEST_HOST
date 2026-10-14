<template>
  <div class="rradios-demo">
    <h1>RRadios — Usage Reference</h1>

    <!-- 1. Basic radio group -->
    <section>
      <h2>1. Basic radio group — local data</h2>
      <RRadios
        v-model="form.gender"
        :options="[
          { label: 'Male', value: 'M' },
          { label: 'Female', value: 'F' },
          { label: 'Other', value: 'O' }
        ]"
      />
      <pre>{{ form.gender }}</pre>
    </section>

    <!-- 2. Legacy field-name data (option/value attribute bridge) -->
    <section>
      <h2>2. Legacy field names — option-attribute / value-attribute</h2>
      <RRadios
        v-model="form.department"
        :options="departments"
        option-attribute="NameEnglish"
        value-attribute="Id"
      />
      <pre>{{ form.department }}</pre>
    </section>

    <!-- 3. Checkbox-styled group (still single-select) -->
    <section>
      <h2>3. Checkbox-styled group — mode-check-box</h2>
      <RRadios
        v-model="form.plan"
        :options="[
          { label: 'Basic', value: 'basic' },
          { label: 'Pro', value: 'pro' },
          { label: 'Enterprise', value: 'enterprise' }
        ]"
        mode-check-box
      />
      <pre>{{ form.plan }}</pre>
    </section>

    <!-- 4. Single item — real toggle, not a locked radio -->
    <section>
      <h2>4. Single item — toggleable</h2>
      <RRadios
        v-model="form.agreedToTerms"
        :options="[{ label: 'I agree to the terms and conditions', value: true }]"
        mode-check-box
      />
      <p class="hint">Click it twice — it un-toggles, unlike a plain radio.</p>
      <pre>{{ form.agreedToTerms }}</pre>
    </section>

    <!-- 5. Single item, radio style (circle, not square) -->
    <section>
      <h2>5. Single item — radio style</h2>
      <RRadios
        v-model="form.subscribed"
        :options="[{ label: 'Notify me about updates', value: 'yes' }]"
      />
      <pre>{{ form.subscribed }}</pre>
    </section>

    <!-- 6. Custom label slot -->
    <section>
      <h2>6. Custom label content</h2>
      <RRadios v-model="form.priority" :options="priorities">
        <template #label="{ option }">
          <span class="priority-label">
            <i :class="option.icon" />
            {{ option.label }}
          </span>
        </template>
      </RRadios>
      <pre>{{ form.priority }}</pre>
    </section>

    <!-- 7. Override hook classes via ui prop -->
    <section>
      <h2>7. Custom layout via :ui override</h2>
      <RRadios
        v-model="form.status"
        :options="[
          { label: 'Draft', value: 'draft' },
          { label: 'Published', value: 'published' },
          { label: 'Archived', value: 'archived' }
        ]"
        :ui="{ fieldset: 'ui-rradio-fieldset flex-col items-start gap-y-2' }"
      />
      <pre>{{ form.status }}</pre>
    </section>

    <!-- 8. Disabled -->
    <section>
      <h2>8. Disabled</h2>
      <RRadios
        v-model="form.locked"
        :options="[
          { label: 'Option A', value: 'a' },
          { label: 'Option B', value: 'b' }
        ]"
        disabled
      />
    </section>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

// ---- 2: legacy field-name data ----
const departments = ref([
  { Id: 1, NameEnglish: 'Engineering' },
  { Id: 2, NameEnglish: 'Sales' },
  { Id: 3, NameEnglish: 'HR' }
])

// ---- 6: custom label data ----
const priorities = ref([
  { label: 'Low', value: 'low', icon: 'ri-arrow-down-line' },
  { label: 'Medium', value: 'medium', icon: 'ri-subtract-line' },
  { label: 'High', value: 'high', icon: 'ri-arrow-up-line' }
])

// ---- form state ----
const form = reactive({
  gender: undefined,
  department: undefined,
  plan: undefined,
  agreedToTerms: undefined,
  subscribed: undefined,
  priority: undefined,
  status: undefined,
  locked: 'a'
})
</script>

<style lang="scss" scoped>
.rradios-demo {
  max-width: 560px;
  margin: 0 auto;
  padding: var(--sp-6, 24px);

  section {
    margin-bottom: var(--sp-6, 24px);
    padding-bottom: var(--sp-5, 20px);
    border-bottom: 1px solid var(--c-border);
  }

  h2 {
    font-size: 14px;
    margin-bottom: var(--sp-2, 8px);
    color: var(--c-muted);
  }

  pre {
    margin-top: var(--sp-2, 8px);
    font-size: 12px;
    background: var(--c-surface);
    padding: var(--sp-2, 8px);
    border-radius: var(--r-sm, 8px);
    overflow-x: auto;
  }

  .hint {
    font-size: 12px;
    color: var(--c-muted);
    margin: var(--sp-1, 4px) 0 0;
  }

  .priority-label {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
}
</style>