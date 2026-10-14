<script setup lang="ts">
// pages/demo/stepper.vue
// Full RStepper showcase — all modes, slots, custom icons, bilingual, form
import { ref, shallowRef } from 'vue'
import type { RStepperItem } from '@/components/R/RStepper.vue'
import { useUIStore } from '@/stores/ui'

const ui = useUIStore()

// ── 1. Basic ────────────────────────────────────────────────────────────────
const basicIdx = ref(0)
const basicItems: RStepperItem[] = [
  { title: 'Address',  description: 'Add your address here',            icon: 'i-lucide-house' },
  { title: 'Shipping', description: 'Set your preferred shipping method', icon: 'i-lucide-truck' },
  { title: 'Checkout', description: 'Confirm your order',               icon: 'i-lucide-credit-card' },
]

// ── 2. RemixIcon items ───────────────────────────────────────────────────────
const remixIdx = ref(0)
const remixItems: RStepperItem[] = [
  { title: 'Account',  description: 'Create your account',   riIcon: 'ri-user-add-line' },
  { title: 'Profile',  description: 'Complete your profile', riIcon: 'ri-profile-line'  },
  { title: 'Security', description: 'Set up 2FA',            riIcon: 'ri-shield-check-line' },
  { title: 'Done',     description: 'Welcome aboard!',       riIcon: 'ri-rocket-line'   },
]

// ── 3. Vertical ─────────────────────────────────────────────────────────────
const vertIdx = ref(1)
const vertItems: RStepperItem[] = [
  { title: 'Plan',     description: 'Choose a subscription plan',    riIcon: 'ri-price-tag-3-line' },
  { title: 'Payment',  description: 'Enter payment details',         riIcon: 'ri-bank-card-line'   },
  { title: 'Confirm',  description: 'Review and confirm',            riIcon: 'ri-checkbox-circle-line' },
]

// ── 4. Status badges ────────────────────────────────────────────────────────
const statusIdx = ref(1)
const statusItems: RStepperItem[] = [
  { title: 'Upload',    description: 'File uploaded',   riIcon: 'ri-upload-cloud-2-line', status: 'success' },
  { title: 'Validate',  description: 'Validating...',  riIcon: 'ri-loader-4-line',        status: 'warning' },
  { title: 'Process',   description: 'Pending',        riIcon: 'ri-time-line' },
  { title: 'Complete',  description: 'Awaiting',       riIcon: 'ri-flag-line' },
]

// ── 5. Optional steps ────────────────────────────────────────────────────────
const optIdx = ref(0)
const optItems: RStepperItem[] = [
  { title: 'Basic Info',    riIcon: 'ri-information-line' },
  { title: 'Profile Photo', riIcon: 'ri-image-add-line',  optional: true },
  { title: 'Bio',           riIcon: 'ri-quill-pen-line',  optional: true, description: 'Tell us about yourself' },
  { title: 'Submit',        riIcon: 'ri-send-plane-line' },
]

// ── 6. Bilingual km/en ──────────────────────────────────────────────────────
const khmIdx = ref(0)
const khmItems: RStepperItem[] = [
  { title: 'Personal',  labelKm: 'ព័ត៌មានផ្ទាល់ខ្លួន', description: 'Enter your details', descriptionKm: 'បញ្ចូលព័ត៌មានរបស់អ្នក', riIcon: 'ri-user-line' },
  { title: 'Documents', labelKm: 'ឯកសារ',              description: 'Upload documents',    descriptionKm: 'បង្ហោះឯកសារ',          riIcon: 'ri-file-text-line' },
  { title: 'Review',    labelKm: 'ពិនិត្យឡើងវិញ',      description: 'Confirm submission',  descriptionKm: 'បញ្ជាក់ការដាក់ស្នើ',    riIcon: 'ri-eye-line' },
]

// ── 7. Sizes ────────────────────────────────────────────────────────────────
const sizeIdx = ref(1)
const sizeItems: RStepperItem[] = [
  { title: 'Step 1', riIcon: 'ri-number-1' },
  { title: 'Step 2', riIcon: 'ri-number-2' },
  { title: 'Step 3', riIcon: 'ri-number-3' },
]

// ── 8. Linear (no skip) ──────────────────────────────────────────────────────
const linearIdx = ref(0)
const linearItems: RStepperItem[] = [
  { title: 'Terms',    description: 'Accept terms',      riIcon: 'ri-file-list-3-line' },
  { title: 'Verify',   description: 'Verify your email', riIcon: 'ri-mail-check-line'  },
  { title: 'Activate', description: 'Activate account',  riIcon: 'ri-key-2-line'       },
]

// ── 9. Custom actions + content ──────────────────────────────────────────────
const wfIdx   = ref(0)
const wfStepper = ref<any>(null)

const wfItems: RStepperItem[] = [
  { title: 'Collect',  description: 'Gather requirements', riIcon: 'ri-inbox-archive-line' },
  { title: 'Design',   description: 'Create wireframes',   riIcon: 'ri-pencil-ruler-2-line' },
  { title: 'Build',    description: 'Development phase',   riIcon: 'ri-code-s-slash-line'  },
  { title: 'Test',     description: 'QA & review',         riIcon: 'ri-bug-line'           },
  { title: 'Deploy',   description: 'Launch!',             riIcon: 'ri-rocket-2-line'      },
]

const wfContent = [
  { icon: 'ri-inbox-archive-line', body: 'Write down all user stories, define scope and create project charter.' },
  { icon: 'ri-pencil-ruler-2-line', body: 'Create low-fi wireframes, prototype and iterate with stakeholders.' },
  { icon: 'ri-code-s-slash-line',  body: 'Sprint planning, feature branches, daily standups.' },
  { icon: 'ri-bug-line',           body: 'Unit tests, E2E tests, performance audits and accessibility checks.' },
  { icon: 'ri-rocket-2-line',      body: 'CI/CD pipeline runs, staged rollout, monitoring dashboards go live.' },
]

// ── 10. Checkout form ────────────────────────────────────────────────────────
const checkoutIdx = ref(0)
const checkoutRef = ref<any>(null)
const formData = ref({
  name: '', email: '', street: '', city: '',
  card: '', expiry: '', cvv: '',
})
const formErrors = ref<Record<string, string>>({})

function validateStep(step: number): boolean {
  formErrors.value = {}
  if (step === 0) {
    if (!formData.value.name)   formErrors.value.name   = 'Required'
    if (!formData.value.email)  formErrors.value.email  = 'Required'
    if (!formData.value.street) formErrors.value.street = 'Required'
    if (!formData.value.city)   formErrors.value.city   = 'Required'
  }
  if (step === 1) {
    if (!formData.value.card)   formErrors.value.card   = 'Required'
    if (!formData.value.expiry) formErrors.value.expiry = 'Required'
    if (!formData.value.cvv)    formErrors.value.cvv    = 'Required'
  }
  return Object.keys(formErrors.value).length === 0
}

function checkoutNext() {
  if (!validateStep(checkoutIdx.value)) return
  checkoutIdx.value++
}

const checkoutItems: RStepperItem[] = [
  { title: 'Shipping',  description: 'Delivery address',  riIcon: 'ri-map-pin-line'     },
  { title: 'Payment',   description: 'Card details',      riIcon: 'ri-bank-card-2-line' },
  { title: 'Review',    description: 'Confirm order',     riIcon: 'ri-shopping-bag-line'},
]

function submitOrder() {
  ui.success('Order placed!', 'Your order has been confirmed.')
  checkoutIdx.value = 3  // trigger completion screen
}


definePageMeta({layout: 'navbar'})
</script>

<template>
  <RToast />

  <div class="drs">
    <RPageHeader
      title="RStepper"
      subtitle="All modes · slots · RemixIcon · dark/light · bilingual"
      icon="i-lucide-git-branch"
    />

    <!-- ── 1. Basic (NuxtUI icon) ──────────────────────── -->
    <RCard title="Basic — NuxtUI icons" icon="i-lucide-info" class="drs__card">
      <RStepper
        v-model="basicIdx"
        :items="basicItems"
      >
        <template #content="{ item }">
          <div class="drs__placeholder">
            <i class="ri-file-list-3-line" />
            This is the <strong>{{ item?.title }}</strong> step.
          </div>
        </template>
      </RStepper>
    </RCard>

    <!-- ── 2. RemixIcon items ───────────────────────────── -->
    <RCard title="RemixIcon (ri-*)" icon="i-lucide-image" class="drs__card">
      <RStepper
        v-model="remixIdx"
        :items="remixItems"
        size="lg"
      >
        <template #content="{ item, index }">
          <div class="drs__placeholder">
            <i :class="remixItems[index]?.riIcon ?? 'ri-check-line'" />
            {{ item?.title }} — step {{ index + 1 }} of {{ remixItems.length }}
          </div>
        </template>
      </RStepper>
    </RCard>

    <!-- ── 3. Vertical ─────────────────────────────────── -->
    <RCard title="Vertical orientation" icon="i-lucide-list" class="drs__card drs__card--half">
      <RStepper
        v-model="vertIdx"
        :items="vertItems"
        orientation="vertical"
        size="md"
      >
        <template #content="{ item }">
          <div class="drs__placeholder">{{ item?.description }}</div>
        </template>
      </RStepper>
    </RCard>

    <!-- ── 4. Status badges ─────────────────────────────── -->
    <RCard title="Step statuses" icon="i-lucide-badge-check" class="drs__card">
      <div class="drs__hint-row">
        <RBadge variant="success" dot>success</RBadge>
        <RBadge variant="warning" dot>warning</RBadge>
        <RBadge variant="default" dot>pending (default)</RBadge>
      </div>
      <RStepper
        v-model="statusIdx"
        :items="statusItems"
        :show-content="false"
      />
    </RCard>

    <!-- ── 5. Optional steps ────────────────────────────── -->
    <RCard title="Optional steps" icon="i-lucide-asterisk" class="drs__card">
      <RStepper
        v-model="optIdx"
        :items="optItems"
        :show-content="false"
      />
    </RCard>

    <!-- ── 6. Bilingual ────────────────────────────────── -->
    <RCard title="Bilingual km / en" icon="i-lucide-languages" class="drs__card">
      <p class="drs__sub">Labels & descriptions switch with locale via labelKm / descriptionKm</p>
      <RStepper
        v-model="khmIdx"
        :items="khmItems"
        :show-content="false"
      />
    </RCard>

    <!-- ── 7. Sizes ─────────────────────────────────────── -->
    <RCard title="Sizes" icon="i-lucide-scaling" class="drs__card">
      <div class="drs__stack">
        <div v-for="s in ['sm', 'md', 'lg'] as const" :key="s" class="drs__size-row">
          <span class="drs__size-label">{{ s }}</span>
          <RStepper
            v-model="sizeIdx"
            :items="sizeItems"
            :size="s"
            :show-actions="false"
            :show-content="false"
          />
        </div>
      </div>
    </RCard>

    <!-- ── 8. Linear (no skip) ─────────────────────────── -->
    <RCard title="Linear mode" hint="Steps must be completed in order" icon="i-lucide-lock" class="drs__card">
      <RStepper
        v-model="linearIdx"
        :items="linearItems"
        linear
        :show-content="false"
      />
    </RCard>

    <!-- ── 9. Custom #indicator + #actions + #content ──── -->
    <RCard title="Custom slots — workflow" icon="i-lucide-layers" class="drs__card">
      <RStepper
        ref="wfStepper"
        v-model="wfIdx"
        :items="wfItems"
        :show-actions="false"
      >
        <!-- Custom indicator with pulsing ring on active -->
        <template #indicator="{ index, isActive, isCompleted }">
          <span :class="['drs__wi', { 'drs__wi--active': isActive, 'drs__wi--done': isCompleted }]">
            <i v-if="isCompleted" class="ri-check-line" />
            <i v-else :class="wfItems[index]?.riIcon" />
          </span>
        </template>

        <!-- Rich content panel -->
        <template #content="{ index }">
          <div class="drs__wf-content">
            <i :class="wfContent[index]?.icon" class="drs__wf-icon" />
            <p>{{ wfContent[index]?.body }}</p>
          </div>
        </template>

        <!-- Custom actions -->
        <template #actions="{ prev, next, isFirst, isLast }">
          <div class="drs__wf-actions">
            <button class="drs__wf-btn drs__wf-btn--ghost" :disabled="isFirst" @click="prev">
              <i class="ri-arrow-left-line" /> Back
            </button>
            <div class="drs__wf-progress">
              Step {{ wfIdx + 1 }} / {{ wfItems.length }}
            </div>
            <button class="drs__wf-btn drs__wf-btn--solid" @click="next">
              {{ isLast ? 'Complete' : 'Continue' }}
              <i :class="isLast ? 'ri-check-double-line' : 'ri-arrow-right-line'" />
            </button>
          </div>
        </template>

        <!-- Custom completion slot -->
        <template #completion="{ reset }">
          <div class="drs__wf-done">
            <i class="ri-rocket-2-line" />
            <h3>Project launched 🎉</h3>
            <button class="drs__wf-btn drs__wf-btn--ghost" @click="reset">
              <i class="ri-refresh-line" /> Start new project
            </button>
          </div>
        </template>
      </RStepper>
    </RCard>

    <!-- ── 10. Checkout form integration ───────────────── -->
    <RCard title="Checkout form" icon="i-lucide-shopping-cart" class="drs__card">
      <RStepper
        v-model="checkoutIdx"
        :items="checkoutItems"
        :show-actions="false"
      >
        <template #content="{ index }">

          <!-- Step 0: Shipping -->
          <div v-if="index === 0" class="drs__form">
            <div class="drs__form-row">
              <div class="drs__field">
                <label class="drs__label">Full name *</label>
                <input v-model="formData.name" class="drs__input" :class="{ 'drs__input--err': formErrors.name }" placeholder="John Doe" />
                <p v-if="formErrors.name" class="drs__err"><i class="ri-error-warning-line" />{{ formErrors.name }}</p>
              </div>
              <div class="drs__field">
                <label class="drs__label">Email *</label>
                <input v-model="formData.email" type="email" class="drs__input" :class="{ 'drs__input--err': formErrors.email }" placeholder="john@example.com" />
                <p v-if="formErrors.email" class="drs__err"><i class="ri-error-warning-line" />{{ formErrors.email }}</p>
              </div>
            </div>
            <div class="drs__form-row">
              <div class="drs__field">
                <label class="drs__label">Street *</label>
                <input v-model="formData.street" class="drs__input" :class="{ 'drs__input--err': formErrors.street }" placeholder="123 Main St" />
                <p v-if="formErrors.street" class="drs__err"><i class="ri-error-warning-line" />{{ formErrors.street }}</p>
              </div>
              <div class="drs__field">
                <label class="drs__label">City *</label>
                <input v-model="formData.city" class="drs__input" :class="{ 'drs__input--err': formErrors.city }" placeholder="Phnom Penh" />
                <p v-if="formErrors.city" class="drs__err"><i class="ri-error-warning-line" />{{ formErrors.city }}</p>
              </div>
            </div>
          </div>

          <!-- Step 1: Payment -->
          <div v-else-if="index === 1" class="drs__form">
            <div class="drs__field">
              <label class="drs__label">Card number *</label>
              <input v-model="formData.card" class="drs__input" :class="{ 'drs__input--err': formErrors.card }" placeholder="4111 1111 1111 1111" />
              <p v-if="formErrors.card" class="drs__err"><i class="ri-error-warning-line" />{{ formErrors.card }}</p>
            </div>
            <div class="drs__form-row">
              <div class="drs__field">
                <label class="drs__label">Expiry *</label>
                <input v-model="formData.expiry" class="drs__input" :class="{ 'drs__input--err': formErrors.expiry }" placeholder="MM / YY" />
                <p v-if="formErrors.expiry" class="drs__err"><i class="ri-error-warning-line" />{{ formErrors.expiry }}</p>
              </div>
              <div class="drs__field">
                <label class="drs__label">CVV *</label>
                <input v-model="formData.cvv" class="drs__input" :class="{ 'drs__input--err': formErrors.cvv }" placeholder="123" />
                <p v-if="formErrors.cvv" class="drs__err"><i class="ri-error-warning-line" />{{ formErrors.cvv }}</p>
              </div>
            </div>
          </div>

          <!-- Step 2: Review -->
          <div v-else-if="index === 2" class="drs__review">
            <div class="drs__review-row"><span>Name</span><strong>{{ formData.name }}</strong></div>
            <div class="drs__review-row"><span>Email</span><strong>{{ formData.email }}</strong></div>
            <div class="drs__review-row"><span>Address</span><strong>{{ formData.street }}, {{ formData.city }}</strong></div>
            <div class="drs__review-row"><span>Card</span><strong>**** **** **** {{ formData.card.slice(-4) || '—' }}</strong></div>
          </div>

        </template>

        <!-- Validation-aware actions -->
        <template #actions="{ isFirst, isLast }">
          <div class="drs__co-actions">
            <button class="rs__btn rs__btn--ghost" :disabled="isFirst" @click="checkoutIdx--">
              <i class="ri-arrow-left-line" /> Back
            </button>
            <button v-if="!isLast" class="rs__btn rs__btn--solid" @click="checkoutNext">
              Continue <i class="ri-arrow-right-line" />
            </button>
            <button v-else class="rs__btn rs__btn--solid" @click="submitOrder">
              Place order <i class="ri-shopping-bag-check-line" />
            </button>
          </div>
        </template>
      </RStepper>
    </RCard>

  </div>
</template>

<style lang="scss" scoped>
.drs {
  padding:        var(--space-8);
  max-width:      860px;
  margin:         0 auto;
  display:        flex;
  flex-direction: column;
  gap:            var(--space-5);

  @include mobile-only { padding: var(--space-4); }

  &__card { width: 100%; }
  &__card--half { max-width: 420px; }

  &__sub {
    font-size: 0.78rem;
    color:     var(--c-muted);
    margin:    0 0 var(--space-3);
  }

  &__hint-row {
    display:     flex;
    align-items: center;
    gap:         var(--space-3);
    margin-bottom: var(--space-4);
  }

  &__placeholder {
    display:       flex;
    align-items:   center;
    gap:           var(--space-3);
    padding:       var(--space-5);
    background:    var(--bg-tertiary);
    border:        1px dashed var(--c-border);
    border-radius: var(--radius-lg);
    color:         var(--c-muted);
    font-size:     0.875rem;

    i { font-size: 1.3rem; color: var(--c-accent); }
    strong { color: var(--c-text); }
  }

  &__stack { display: flex; flex-direction: column; gap: var(--space-5); }

  &__size-row {
    display:     flex;
    align-items: center;
    gap:         var(--space-4);
  }

  &__size-label {
    font-size:   0.72rem;
    font-weight: 700;
    color:       var(--c-muted);
    text-transform: uppercase;
    letter-spacing: 0.07em;
    min-width:   24px;
  }

  // Custom workflow indicator
  &__wi {
    width:         36px;
    height:        36px;
    border-radius: 50%;
    border:        2px solid var(--c-border);
    background:    var(--bg-tertiary);
    color:         var(--c-muted);
    @include flex-center;
    font-size:     1rem;
    @include transition;
    position:      relative;

    &--active {
      border-color: var(--c-accent);
      color:        var(--c-accent);
      background:   rgba(255,140,66,0.1);

      &::before {
        content:       '';
        position:      absolute;
        inset:         -5px;
        border-radius: 50%;
        border:        2px solid rgba(255,140,66,0.25);
        animation:     wi-pulse 1.6s ease-in-out infinite;
      }
    }

    &--done {
      border-color: var(--c-accent);
      background:   var(--c-accent);
      color:        #fff;
    }
  }

  @keyframes wi-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0; transform: scale(1.4); }
  }

  // Workflow content
  &__wf-content {
    display:       flex;
    align-items:   flex-start;
    gap:           var(--space-4);
    padding:       var(--space-5);
    background:    var(--bg-tertiary);
    border:        1px solid var(--c-border);
    border-radius: var(--radius-lg);

    p { font-size: 0.875rem; color: var(--c-text); margin: 0; line-height: 1.6; }
  }

  &__wf-icon {
    font-size:  1.8rem;
    color:      var(--c-accent);
    flex-shrink: 0;
    margin-top: 2px;
  }

  &__wf-actions {
    display:         flex;
    align-items:     center;
    justify-content: space-between;
    gap:             var(--space-3);
    padding-top:     var(--space-2);
    border-top:      1px solid var(--c-border);
  }

  &__wf-progress {
    font-size:  0.78rem;
    color:      var(--c-muted);
    font-weight: 500;
  }

  &__wf-btn {
    display:       flex;
    align-items:   center;
    gap:           var(--space-1);
    padding:       7px 16px;
    border-radius: var(--radius-md);
    font-size:     0.82rem;
    font-weight:   500;
    font-family:   var(--font-fallback);
    cursor:        pointer;
    @include transition(fast);
    i { font-size: 0.95rem; }
    &:disabled { opacity: 0.4; cursor: not-allowed; }

    &--ghost {
      border:     1px solid var(--c-border);
      background: transparent;
      color:      var(--c-muted);
      &:hover:not(:disabled) { border-color: var(--c-accent); color: var(--c-accent); }
    }
    &--solid {
      border:     1px solid var(--c-accent);
      background: var(--c-accent);
      color:      #fff;
      box-shadow: var(--glow-accent-sm);
      &:hover:not(:disabled) { background: var(--c-accent-2); }
    }
  }

  &__wf-done {
    display:        flex;
    flex-direction: column;
    align-items:    center;
    gap:            var(--space-4);
    padding:        var(--space-8) var(--space-4);
    text-align:     center;

    i    { font-size: 3rem; color: var(--c-accent); filter: drop-shadow(0 0 12px rgba(255,140,66,0.5)); }
    h3   { font-size: 1.15rem; font-weight: 700; color: var(--c-text); margin: 0; }
  }

  // Form styles
  &__form {
    display:        flex;
    flex-direction: column;
    gap:            var(--space-4);
    padding:        var(--space-4) 0;
  }

  &__form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-3);
    @include mobile-only { grid-template-columns: 1fr; }
  }

  &__field {
    display:        flex;
    flex-direction: column;
    gap:            var(--space-2);
  }

  &__label {
    font-size:   0.82rem;
    font-weight: 500;
    color:       var(--c-text);
  }

  &__input {
    height:        38px;
    padding:       0 var(--space-3);
    font-family:   var(--font-fallback);
    font-size:     0.875rem;
    color:         var(--c-text);
    background:    var(--c-surface);
    border:        1px solid var(--c-border);
    border-radius: var(--radius-md);
    outline:       none;
    @include transition(fast);
    &::placeholder { color: var(--c-muted); }
    &:focus { border-color: var(--c-accent); box-shadow: 0 0 0 3px rgba(255,140,66,0.12); }
    &--err  { border-color: var(--c-danger); }
  }

  &__err {
    display:     flex;
    align-items: center;
    gap:         4px;
    font-size:   0.73rem;
    color:       var(--c-danger);
    margin:      0;
    i { font-size: 0.85rem; }
  }

  // Review
  &__review {
    display:        flex;
    flex-direction: column;
    gap:            0;
    border:         1px solid var(--c-border);
    border-radius:  var(--radius-lg);
    overflow:       hidden;
  }

  &__review-row {
    display:         flex;
    align-items:     center;
    justify-content: space-between;
    padding:         var(--space-3) var(--space-4);
    font-size:       0.875rem;
    border-bottom:   1px solid var(--c-border);
    &:last-child { border-bottom: none; }
    span   { color: var(--c-muted); }
    strong { color: var(--c-text); }
  }

  &__co-actions {
    display:         flex;
    align-items:     center;
    justify-content: space-between;
    padding-top:     var(--space-3);
    border-top:      1px solid var(--c-border);
  }
}
</style>