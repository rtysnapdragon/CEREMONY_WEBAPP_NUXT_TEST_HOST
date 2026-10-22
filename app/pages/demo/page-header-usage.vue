<!-- pages/examples/page-header-usage.vue -->
<!--
  Demonstrates every usage pattern for RPageHeader and RBreadcrumb.
  Copy the pattern you need.
-->

<script setup>
/* ─────────────────────────────────────────────────────────────────────────────
   1. Set up the breadcrumb state once in the page's setup block.
      RPageHeader / RBreadcrumb will pick it up automatically.
───────────────────────────────────────────────────────────────────────────── */

const header = useBreadCrumb()

// Title + icon
header.setTitle(
  'User Detail',
  'View and manage a single user account',
  'i-lucide-user',
)

// Breadcrumb trail
header.setBreadcrumbs([
  {
    label: 'Dashboard',
    icon:  'i-lucide-layout-dashboard',
    to:    '/',
  },
  {
    label: 'Users',
    icon:  'i-lucide-users',
    // children dropdown example
    children: [
      { label: 'All Users',    to: '/users'        },
      { label: 'Create User',  to: '/users/create' },
    ],
  },
  {
    label: 'Sok Dara',   // current page — no `to`, renders as .rph-current
  },
])

// Back button
header.setBack(
  () => navigateTo('/users'),
  'Back to Users',
)

// Clean up when the page unmounts (optional but tidy)
onUnmounted(() => header.clear())
</script>

<template>
  <div style="padding: 24px; display: flex; flex-direction: column; gap: 48px;">

    <!-- ══════════════════════════════════════════════════════════════════════
         PATTERN 1 — RPageHeader driven entirely by composable state
         Actions injected via slot
    ═══════════════════════════════════════════════════════════════════════ -->
    <section>
      <p class="ex-label">Pattern 1 — composable state + #actions slot</p>

      <RPageHeader>
        <template #actions>
          <UButton
            icon="i-lucide-pencil"
            label="Edit"
            color="neutral"
            variant="outline"
            size="sm"
          />
          <UButton
            icon="i-lucide-trash-2"
            label="Delete"
            color="error"
            variant="soft"
            size="sm"
          />
        </template>
      </RPageHeader>
    </section>


    <!-- ══════════════════════════════════════════════════════════════════════
         PATTERN 2 — RPageHeader with inline props (no composable needed)
    ═══════════════════════════════════════════════════════════════════════ -->
    <section>
      <p class="ex-label">Pattern 2 — fully inline props</p>

      <RPageHeader
        title="Settings"
        subtitle="Configure your workspace"
        icon="i-lucide-settings"
        show-back
        back-tooltip="Go back"
        :items="[
          { label: 'Home', to: '/' },
          { label: 'Settings' },
        ]"
      >
        <template #actions>
          <UButton
            icon="i-lucide-save"
            label="Save changes"
            size="sm"
          />
        </template>
      </RPageHeader>
    </section>


    <!-- ══════════════════════════════════════════════════════════════════════
         PATTERN 3 — RBreadcrumb standalone (no header title)
         with has-action — actions rendered INSIDE the breadcrumb bar
    ═══════════════════════════════════════════════════════════════════════ -->
    <section>
      <p class="ex-label">  Pattern 3 — RBreadcrumb with hasAction (actions inside crumb row)</p>

      <RBreadcrumb
        has-action
        :items="[
          { label: 'Reports', to: '/reports' },
          { label: 'Sales Report' },
        ]"
        show-back
        back-tooltip="Back to Reports"
      >
        <template #actions>
          <UBadge color="orange" variant="soft" size="sm">
            <UIcon name="i-lucide-clock" class="mr-1 w-3 h-3" />
            Last updated 5 min ago
          </UBadge>
          <UButton
            icon="i-lucide-download"
            label="Export CSV"
            size="xs"
            color="neutral"
            variant="outline"
          />
        </template>
      </RBreadcrumb>

      <!-- Then title/subtitle are just plain HTML below -->
      <div style="margin-top: 6px;">
        <h1 class="ex-page-title">Sales Report</h1>
        <p class="ex-page-sub">Monthly breakdown — June 2026</p>
      </div>
    </section>


    <!-- ══════════════════════════════════════════════════════════════════════
         PATTERN 4 — RBreadcrumb composable-driven, no props at all
         Actions inline via has-action slot
    ═══════════════════════════════════════════════════════════════════════ -->
    <section>
      <p class="ex-label">Pattern 4 — RBreadcrumb, composable state, hasAction with badge</p>

      <!--
        State was already set in this page's setup() above.
        has-action enables the #actions slot on RBreadcrumb.
      -->
      <RBreadcrumb has-action>
        <template #actions>
          <UBadge color="orange" variant="soft" size="sm">
            <UIcon name="i-heroicons-heart" class="mr-1 w-3 h-3" />
            21 days to wedding
          </UBadge>
          <UButton
            icon="i-heroicons-plus"
            label="New Event"
            color="primary"
            size="sm"
          />
        </template>
      </RBreadcrumb>
    </section>


    <!-- ══════════════════════════════════════════════════════════════════════
         PATTERN 5 — Minimal: title + actions only, no breadcrumb
    ═══════════════════════════════════════════════════════════════════════ -->
    <section>
      <p class="ex-label">Pattern 5 — title + actions, no breadcrumb</p>

      <RPageHeader
        title="Inventory"
        subtitle="Manage products and stock levels"
        icon="i-lucide-package"
      >
        <template #actions>
          <UButton icon="i-lucide-upload" label="Import" color="neutral" variant="outline" size="sm" />
          <UButton icon="i-lucide-plus" label="Add Product" size="sm" />
        </template>
      </RPageHeader>
    </section>


    <!-- ══════════════════════════════════════════════════════════════════════
         PATTERN 6 — Programmatic back with custom onClick crumb
    ═══════════════════════════════════════════════════════════════════════ -->
    <section>
      <p class="ex-label">Pattern 6 — onClick breadcrumb item + programmatic back</p>

      <RPageHeader
        title="Order #1042"
        icon="i-lucide-shopping-cart"
        show-back
        back-tooltip="Back to Orders"
        :items="[
          { label: 'Orders',      onClick: () => navigateTo('/orders') },
          { label: 'Order #1042' },
        ]"
      >
        <template #actions>
          <UButton icon="i-lucide-printer" label="Print Receipt" color="neutral" variant="ghost" size="sm" />
          <UButton icon="i-lucide-check" label="Mark Paid" color="success" size="sm" />
        </template>
      </RPageHeader>
    </section>

  </div>
</template>

<style scoped lang="scss">
.ex-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-muted, #888);
  margin-bottom: 10px;
  padding-left: 2px;
}

.ex-page-title {
  font-size: 1.7rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.2;
  color: var(--color-text-primary, #111);
}

.ex-page-sub {
  margin-top: 4px;
  font-size: 0.92rem;
  color: var(--color-text-muted, #888);
}

section {
  border-bottom: 1px dashed rgba(128, 128, 128, 0.2);
  padding-bottom: 32px;
}
</style>
