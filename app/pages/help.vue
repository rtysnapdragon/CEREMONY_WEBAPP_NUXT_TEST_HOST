<template>
  <RWrapperPage>
    <RBreadCrumb title="Help & Info" subtitle="Documentation, guides, and support resources" icon="i-heroicons-information-circle" />

    <!-- Search -->
    <div class="help-search-card">
      <UIcon name="i-heroicons-magnifying-glass" class="help-search-card__icon" />
      <input
        v-model="searchQuery"
        class="help-search-card__input"
        placeholder="Search documentation, guides, FAQs…"
      />
    </div>

    <div class="help-layout">
      <!-- Left: main content -->
      <div class="help-main">

        <!-- Quick links -->
        <div class="help-section">
          <h3 class="help-section__title">Quick Start</h3>
          <div class="help-cards">
            <NuxtLink
              v-for="card in quickLinks" :key="card.label"
              :to="card.to"
              class="help-card"
            >
              <div class="help-card__icon-wrap" :style="{ background: card.bg }">
                <UIcon :name="card.icon" class="help-card__icon" :style="{ color: card.color }" />
              </div>
              <div>
                <p class="help-card__label">{{ card.label }}</p>
                <p class="help-card__desc">{{ card.desc }}</p>
              </div>
              <UIcon name="i-heroicons-arrow-right" class="help-card__arrow" />
            </NuxtLink>
          </div>
        </div>

        <!-- FAQ -->
        <div class="help-section">
          <h3 class="help-section__title">Frequently Asked Questions</h3>
          <div class="faq-list">
            <div
              v-for="(faq, i) in filteredFAQs" :key="i"
              class="faq-item"
              :class="{ 'faq-item--open': openFAQ === i }"
            >
              <button class="faq-item__question" @click="openFAQ = openFAQ === i ? null : i">
                <span>{{ faq.q }}</span>
                <UIcon
                  name="i-heroicons-chevron-right"
                  class="faq-item__chevron"
                  :class="{ 'faq-item__chevron--open': openFAQ === i }"
                />
              </button>
              <Transition name="accordion">
                <div v-if="openFAQ === i" class="faq-item__answer">
                  <p>{{ faq.a }}</p>
                </div>
              </Transition>
            </div>
          </div>
        </div>

        <!-- Version info -->
        <div class="help-section">
          <h3 class="help-section__title">System Information</h3>
          <div class="sys-info">
            <div v-for="item in sysInfo" :key="item.label" class="sys-info__row">
              <span class="sys-info__label">{{ item.label }}</span>
              <span class="sys-info__value">{{ item.value }}</span>
            </div>
          </div>
        </div>

      </div>

      <!-- Right: support sidebar -->
      <div class="help-sidebar">

        <div class="help-sidebar-card">
          <h4 class="help-sidebar-card__title">Contact Support</h4>
          <p class="help-sidebar-card__desc">Our team is available Mon–Fri, 9am–6pm (UTC+7)</p>
          <div class="help-contact-list">
            <a href="mailto:support@workspace.io" class="help-contact-item">
              <UIcon name="i-heroicons-envelope" class="help-contact-item__icon" />
              <span>support@workspace.io</span>
            </a>
            <a href="#" class="help-contact-item">
              <UIcon name="i-heroicons-chat-bubble-left-right" class="help-contact-item__icon" />
              <span>Live Chat</span>
            </a>
          </div>
          <button class="btn-primary" style="width:100%;justify-content:center;margin-top:12px;">
            Open a Ticket
          </button>
        </div>

        <div class="help-sidebar-card">
          <h4 class="help-sidebar-card__title">Resources</h4>
          <div class="help-resource-list">
            <a v-for="res in resources" :key="res.label" href="#" class="help-resource">
              <UIcon :name="res.icon" class="help-resource__icon" />
              <span>{{ res.label }}</span>
              <UIcon name="i-heroicons-arrow-top-right-on-square" class="help-resource__ext" />
            </a>
          </div>
        </div>

        <div class="help-sidebar-card help-sidebar-card--accent">
          <UIcon name="i-heroicons-bolt" class="help-sidebar-card__big-icon" />
          <h4 class="help-sidebar-card__title" style="color:var(--color-accent);">What's New</h4>
          <ul class="help-changelog">
            <li v-for="item in changelog" :key="item">{{ item }}</li>
          </ul>
          <a href="#" class="help-changelog-link">View full changelog →</a>
        </div>

      </div>
    </div>
  </RWrapperPage>
</template>

<script setup lang="ts">
const searchQuery = ref('')
const openFAQ = ref<number | null>(0)

const quickLinks = [
  { label:'Getting Started', desc:'Set up your workspace in minutes', icon:'i-heroicons-rocket-launch', to:'/', bg:'#dbeafe', color:'#1d4ed8' },
  { label:'Reports Guide',   desc:'Create, schedule, and share reports', icon:'i-heroicons-document-chart-bar', to:'/reports', bg:'#dcfce7', color:'#15803d' },
  { label:'API Reference',   desc:'Integrate with our REST API', icon:'i-heroicons-code-bracket', to:'/integrations/api', bg:'#ede9fe', color:'#7c3aed' },
  { label:'User Management', desc:'Invite, manage roles and permissions', icon:'i-heroicons-users', to:'/users', bg:'#fef3c7', color:'#b45309' },
]

const faqs = [
  { q:'How do I create a scheduled report?', a:'Go to Reports → New Report → fill in the form → on the Share & Schedule step, enable Scheduled Delivery and choose your frequency. The report will be auto-generated and emailed to recipients.' },
  { q:'How do I invite a team member?', a:'Navigate to Users → Invite User, enter their email, and assign a role. They will receive an invitation email with a link to join your workspace.' },
  { q:'Can I export my data?', a:'Yes. Most data tables have a Download button. Reports can be exported in PDF, XLSX, CSV, or JSON formats from the Reports page.' },
  { q:'How do I connect a webhook?', a:'Go to Integrations → Webhooks → Add Webhook. Paste your endpoint URL, select the events to listen for, and save. We`ll send a test event to verify.' },
  { q:'Where can I find my API keys?', a:'Your API keys are under Integrations → API. You can create new keys, view usage, and revoke old ones from that page.' },
  { q:'What is the data retention policy?', a:'Report data is retained for 12 months on the Pro plan and 24 months on Enterprise. Raw event logs are retained for 90 days.' },
  { q:'How do I enable two-factor authentication?', a:'Go to Settings → Security → Two-Factor Authentication and toggle it on. You`ll be prompted to scan a QR code with an authenticator app.' },
  { q:'Can I change my billing cycle?', a:'Yes. Under Settings → Billing, click Change Plan to switch between monthly and annual billing. Annual plans include a 20% discount.' },
]

const filteredFAQs = computed(() => {
  if (!searchQuery.value) return faqs
  const q = searchQuery.value.toLowerCase()
  return faqs.filter(f => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q))
})

const sysInfo = [
  { label: 'App Version',       value: 'v3.12.4' },
  { label: 'Nuxt Version',      value: 'Nuxt 4.0' },
  { label: 'NuxtUI Version',    value: 'v4.0' },
  { label: 'Last Updated',      value: 'May 15, 2026' },
  { label: 'Plan',              value: 'Pro' },
  { label: 'Data Region',       value: 'Asia Pacific (ap-southeast-1)' },
]

const resources = [
  { label: 'API Documentation',   icon: 'i-heroicons-code-bracket' },
  { label: 'Video Tutorials',     icon: 'i-heroicons-play-circle' },
  { label: 'Community Forum',     icon: 'i-heroicons-users' },
  { label: 'Status Page',         icon: 'i-heroicons-signal' },
  { label: 'Privacy Policy',      icon: 'i-heroicons-shield-check' },
  { label: 'Terms of Service',    icon: 'i-heroicons-document-text' },
]

const changelog = [
  'Report sharing & permissions (v3.12)',
  'Live Network real-time feed (v3.11)',
  'Mobile sidebar drawer (v3.10)',
  'Dark mode improvements (v3.9)',
]
definePageMeta({layout:'navbar'})
</script>

<style lang="scss">
.help-search-card {
  display: flex; align-items: center; gap: 12px;
  background: var(--c-surface); border: 1.5px solid var(--color-border);
  border-radius: 14px; padding: 14px 18px; margin-bottom: 24px;
  transition: border-color 0.15s, background 0.25s;

  &:focus-within { border-color: var(--color-accent); }

  &__icon { width: 20px; height: 20px; color: var(--color-text-muted); flex-shrink: 0; }

  &__input {
    flex: 1; border: none; background: transparent; font-size: 0.95rem;
    color: var(--color-text-primary); outline: none; font-family: inherit;
    &::placeholder { color: var(--color-text-muted); }
  }
}

.help-layout {
  display: grid; grid-template-columns: 1fr 280px; gap: 18px; align-items: flex-start;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
}

.help-main { display: flex; flex-direction: column; gap: 24px; min-width: 0; }

.help-section {
  &__title {
    font-size: 0.88rem; font-weight: 720; color: var(--color-text-primary);
    letter-spacing: -0.01em; margin-bottom: 12px;
  }
}

// Quick links
.help-cards { display: flex; flex-direction: column; gap: 6px; }

.help-card {
  display: flex; align-items: center; gap: 12px; padding: 14px 16px;
  background: var(--c-surface); border: 1px solid var(--color-border);
  border-radius: 14px; text-decoration: none; transition: all 0.15s;

  &:hover { background: var(--color-item-hover); transform: translateX(2px); }

  &__icon-wrap {
    width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
  }

  &__icon  { width: 20px; height: 20px; }
  &__label { font-size: 0.85rem; font-weight: 650; color: var(--color-text-primary); }
  &__desc  { font-size: 0.73rem; color: var(--color-text-muted); margin-top: 1px; }
  &__arrow { width: 16px; height: 16px; color: var(--color-text-muted); margin-left: auto; flex-shrink: 0; }
}

// FAQ
.faq-list { display: flex; flex-direction: column; gap: 4px; }

.faq-item {
  background: var(--c-surface); border: 1px solid var(--color-border);
  border-radius: 14px; overflow: hidden; transition: background 0.25s;

  &--open { border-color: var(--color-accent); }

  &__question {
    display: flex; align-items: center; justify-content: space-between; gap: 10px;
    width: 100%; padding: 14px 16px; border: none; background: transparent;
    cursor: pointer; text-align: left; font-size: 0.85rem; font-weight: 580;
    color: var(--color-text-primary); font-family: inherit; transition: background 0.15s;

    &:hover { background: var(--color-item-hover); }
  }

  &__chevron {
    width: 16px; height: 16px; color: var(--color-text-muted); flex-shrink: 0; transition: transform 0.22s;
    &--open { transform: rotate(90deg); }
  }

  &__answer {
    padding: 0 16px 14px; font-size: 0.82rem; color: var(--color-text-secondary);
    line-height: 1.65; border-top: 1px solid var(--color-border); padding-top: 12px;
  }
}

// Sys info
.sys-info {
  background: var(--c-surface); border: 1px solid var(--color-border);
  border-radius: 14px; overflow: hidden; transition: background 0.25s;

  &__row {
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    padding: 11px 16px; border-bottom: 1px solid var(--color-border);
    &:last-child { border-bottom: none; }
  }

  &__label { font-size: 0.78rem; color: var(--color-text-muted); font-weight: 500; }
  &__value { font-size: 0.78rem; color: var(--color-text-primary); font-weight: 600; font-family: monospace; }
}

// Sidebar
.help-sidebar { display: flex; flex-direction: column; gap: 14px; position: sticky; top: 20px;
  @media (max-width: 900px) { position: static; } }

.help-sidebar-card {
  background: var(--c-surface); border: 1px solid var(--color-border);
  border-radius: 16px; padding: 18px; transition: background 0.25s;

  &--accent { border-color: var(--color-accent); background: var(--color-item-active-bg); }

  &__title {
    font-size: 0.88rem; font-weight: 720; color: var(--color-text-primary);
    margin-bottom: 5px; letter-spacing: -0.01em;
  }

  &__desc { font-size: 0.75rem; color: var(--color-text-muted); margin-bottom: 12px; line-height: 1.5; }

  &__big-icon { width: 22px; height: 22px; color: var(--color-accent); margin-bottom: 6px; }
}

.help-contact-list { display: flex; flex-direction: column; gap: 5px; }

.help-contact-item {
  display: flex; align-items: center; gap: 8px; padding: 9px 10px;
  border-radius: 10px; text-decoration: none; color: var(--color-text-secondary);
  font-size: 0.8rem; font-weight: 500; transition: background 0.15s;

  &:hover { background: var(--color-item-hover); color: var(--color-accent); }

  &__icon { width: 16px; height: 16px; flex-shrink: 0; color: var(--color-accent); }
}

.help-resource-list { display: flex; flex-direction: column; gap: 2px; }

.help-resource {
  display: flex; align-items: center; gap: 8px; padding: 8px 10px;
  border-radius: 10px; text-decoration: none; color: var(--color-text-secondary);
  font-size: 0.8rem; font-weight: 450; transition: background 0.15s;

  &:hover { background: var(--color-item-hover); color: var(--color-text-primary); }

  &__icon { width: 15px; height: 15px; flex-shrink: 0; color: var(--color-text-muted); }
  &__ext  { width: 12px; height: 12px; color: var(--color-text-muted); margin-left: auto; }
}

.help-changelog {
  margin: 0 0 10px 0; padding-left: 16px; display: flex; flex-direction: column; gap: 5px;

  li { font-size: 0.75rem; color: var(--color-text-secondary); line-height: 1.4; }
}

.help-changelog-link {
  font-size: 0.75rem; font-weight: 600; color: var(--color-accent); text-decoration: none;
  &:hover { text-decoration: underline; }
}

// FAQ accordion
.accordion-enter-active, .accordion-leave-active {
  transition: max-height 0.25s ease, opacity 0.2s ease; overflow: hidden; max-height: 300px;
}
.accordion-enter-from, .accordion-leave-to { max-height: 0; opacity: 0; }
</style>
