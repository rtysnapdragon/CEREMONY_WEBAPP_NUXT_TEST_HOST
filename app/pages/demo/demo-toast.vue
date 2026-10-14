<script setup lang="ts">
/**
 * pages/demo/toast.vue
 * Full showcase for RToast + useToast — every mode, color, option
 */
import { h, ref } from 'vue'

useHead({ title: 'RToast — Demo' })
definePageMeta({ layout: 'navbar' })

const toast = useToast()

// ── 1. Semantic helpers ────────────────────────────────────────────────────
// function showSuccess() {
//   toast.add('Changes saved!', 'Your profile has been updated successfully.')
// }
// function showError() {
//   toast.add('Request failed', 'Could not connect to the server. Please try again.')
// }
// function showWarning() {
//   toast.warning('Unsaved changes', 'You have unsaved edits. They will be lost if you leave.')
// }
// function showInfo() {
//   toast.info('New version available', 'v2.4.0 is ready. Refresh to update.')
// }

// ── 2. All NuxtUI colors ───────────────────────────────────────────────────
const colors = [
  { color: 'primary',  icon: 'i-lucide-zap',          label: 'Primary'  },
  { color: 'success',  icon: 'i-lucide-check-circle',  label: 'Success'  },
  { color: 'error',    icon: 'i-lucide-x-circle',      label: 'Error'    },
  { color: 'warning',  icon: 'i-lucide-alert-triangle',label: 'Warning'  },
  { color: 'info',     icon: 'i-lucide-info',          label: 'Info'     },
  { color: 'neutral',  icon: 'i-lucide-circle',        label: 'Neutral'  },
  { color: 'blue',     icon: 'i-lucide-droplets',      label: 'Blue'     },
  { color: 'green',    icon: 'i-lucide-leaf',          label: 'Green'    },
  { color: 'yellow',   icon: 'i-lucide-sun',           label: 'Yellow'   },
  { color: 'orange',   icon: 'i-lucide-flame',         label: 'Orange'   },
  { color: 'red',      icon: 'i-lucide-heart-crack',   label: 'Red'      },
] as const

function showColor(c: typeof colors[number]) {
  toast.add({
    title:       `${c.label} toast`,
    description: `This is a ${c.label.toLowerCase()} colored toast notification.`,
    color:       c.color as any,
    icon:        c.icon,
  })
}

// ── 3. Orientations ────────────────────────────────────────────────────────
function showVertical() {
  toast.add({
    title:       'Vertical orientation',
    description: 'Actions appear below the content.',
    icon:        'i-lucide-layout-list',
    color:       'primary',
    orientation: 'vertical',
    actions: [{
      label:   'Undo',
      icon:    'i-lucide-undo-2',
      color:   'primary',
      variant: 'outline',
      onClick: (e) => { e?.stopPropagation(); toast.add('Undone!') },
    }],
  })
}
function showHorizontal() {
  toast.add({
    title:       'Horizontal orientation',
    description: 'Actions appear next to the close button.',
    icon:        'i-lucide-layout',
    color:       'info',
    orientation: 'horizontal',
    actions: [{
      label:   'View',
      icon:    'i-lucide-eye',
      color:   'info',
      variant: 'soft',
      onClick: (e) => { e?.stopPropagation() },
    }],
  })
}

// ── 4. Duration & progress ────────────────────────────────────────────────
function showPersistent() {
  toast.add({
    title:       'Persistent toast',
    description: 'This will not auto-dismiss. Close manually.',
    icon:        'i-lucide-pin',
    color:       'warning',
    duration:    0,
    progress:    false,
    close:       true,
  })
}
function showNoProgress() {
  toast.add({
    title:       'No progress bar',
    description: 'Progress bar is hidden.',
    icon:        'i-lucide-eye-off',
    color:       'neutral',
    progress:    false,
  })
}
function showShort() {
  toast.add({
    title:    'Gone in 1.5s',
    icon:     'i-lucide-timer',
    color:    'success',
    duration: 1500,
  })
}

// ── 5. Custom close button ────────────────────────────────────────────────
function showCustomClose() {
  toast.add({
    title:       'Custom close',
    description: 'The close button has a rounded-full outline style.',
    icon:        'i-lucide-x-circle',
    color:       'primary',
    close: {
      color:   'primary',
      variant: 'outline',
      class:   'rounded-full',
    },
  })
}

// ── 6. VNode title / description ──────────────────────────────────────────
function showVNode() {
  toast.add({
    color: 'primary',
    icon:  'i-lucide-trash-2',
    title: h('span', {}, [
      'Item ',
      h('span', { class: 'text-[--c-accent] font-bold' }, '#42'),
      ' deleted',
    ]),
    description: h('span', {}, [
      'Removed from your ',
      h('span', { class: 'font-semibold text-[--c-text]' }, 'account'),
      '.',
    ]),
    actions: [{
      label:   'Undo',
      icon:    'i-lucide-undo-2',
      color:   'neutral',
      variant: 'outline',
      onClick: (e) => { e?.stopPropagation(); toast.add('Restored!') },
    }],
  })
}

// ── 7. Update on close (file upload pattern) ─────────────────────────────
function showFileUpload() {
  const t = toast.add({
    title:       'Uploading file…',
    description: 'Please wait while we upload your file.',
    icon:        'i-lucide-upload-cloud',
    color:       'neutral',
    duration:    0,
    progress:    false,
    close:       false,
    'onUpdate:open': (open: boolean) => {
      if (open) return
      toast.update(t.id, {
        title:           'File uploaded!',
        description:     'Your file has been successfully uploaded.',
        icon:            'i-lucide-check-circle',
        color:           'success',
        duration:        4000,
        progress:        true,
        close:           true,
        'onUpdate:open': undefined,
      })
    },
  })
  // Simulate upload completing after 2.5s
  setTimeout(() => toast.remove(t.id), 2500)
}

// ── 8. Promise toast ──────────────────────────────────────────────────────
function showPromise() {
  const fakeApi = () => new Promise<void>((res, rej) =>
    setTimeout(() => Math.random() > 0.35 ? res() : rej(new Error('Network timeout')), 2000)
  )
  toast.promise(fakeApi(), {
    loading: 'Syncing data…',
    success: 'Sync complete!',
    error:   'Sync failed',
  })
}

// ── 9. Actions demo ───────────────────────────────────────────────────────
function showWithActions() {
  toast.add({
    title:       'Deployment triggered',
    description: 'Production build is queued.',
    icon:        'i-lucide-rocket',
    color:       'info',
    actions: [
      {
        label:   'View logs',
        icon:    'i-lucide-scroll-text',
        color:   'info',
        variant: 'soft',
        onClick: (e) => { e?.stopPropagation(); toast.info('Opening logs…') },
      },
      {
        label:   'Cancel',
        icon:    'i-lucide-ban',
        color:   'neutral',
        variant: 'ghost',
        onClick: (e) => {
          e?.stopPropagation()
          toast.add('Deployment cancelled')
        },
      },
    ],
  })
}

// ── 10. Clear all ─────────────────────────────────────────────────────────
function clearAll() { toast.clear() }
</script>

<template>
  <!-- Drop-in: renders the styled UToaster, place once per layout -->
  <RToast position="bottom-right" :expand="true" />

  <div class="demo">

    <RPageHeader
      title="RToast"
      subtitle="Toast notifications — NuxtUI 4.4.0 · SARIKA tokens"
      icon="i-lucide-bell"
    />

    <!-- ── 1. Semantic helpers ──────────────────────────────────────── -->
    <!-- <RCard title="Semantic helpers" icon="i-lucide-zap">
      <div class="demo-row">
        <RBtn color="success" icon="i-lucide-check-circle" variant="soft" @click="showSuccess">
          Success
        </RBtn>
        <RBtn color="error" icon="i-lucide-x-circle" variant="soft" @click="showError">
          Error
        </RBtn>
        <RBtn color="warning" icon="i-lucide-alert-triangle" variant="soft" @click="showWarning">
          Warning
        </RBtn>
        <RBtn color="info" icon="i-lucide-info" variant="soft" @click="showInfo">
          Info
        </RBtn>
      </div>
    </RCard> -->

    <!-- ── 2. All colors ───────────────────────────────────────────── -->
    <RCard title="All colors" icon="i-lucide-palette">
      <div class="demo-row demo-row--wrap">
        <RBtn
          v-for="c in colors"
          :key="c.color"
          :icon="c.icon"
          variant="outline"
          size="sm"
          @click="showColor(c)"
        >
          {{ c.label }}
        </RBtn>
      </div>
    </RCard>

    <!-- ── 3. Orientation ─────────────────────────────────────────── -->
    <RCard title="Orientation" icon="i-lucide-layout">
      <div class="demo-row">
        <RBtn icon="i-lucide-layout-list" variant="soft" @click="showVertical">
          Vertical (default)
        </RBtn>
        <RBtn icon="i-lucide-layout" variant="soft" @click="showHorizontal">
          Horizontal
        </RBtn>
      </div>
    </RCard>

    <!-- ── 4. Duration & progress ─────────────────────────────────── -->
    <RCard title="Duration &amp; progress" icon="i-lucide-timer">
      <div class="demo-row">
        <RBtn icon="i-lucide-pin" variant="soft" color="warning" @click="showPersistent">
          Persistent (no dismiss)
        </RBtn>
        <RBtn icon="i-lucide-eye-off" variant="soft" color="neutral" @click="showNoProgress">
          No progress bar
        </RBtn>
        <RBtn icon="i-lucide-zap" variant="soft" color="success" @click="showShort">
          Short (1.5s)
        </RBtn>
      </div>
    </RCard>

    <!-- ── 5. Custom close ────────────────────────────────────────── -->
    <RCard title="Custom close button" icon="i-lucide-x">
      <div class="demo-row">
        <RBtn icon="i-lucide-x-circle" variant="soft" @click="showCustomClose">
          Rounded outline close
        </RBtn>
      </div>
    </RCard>

    <!-- ── 6. VNode content ───────────────────────────────────────── -->
    <RCard title="VNode title &amp; description" icon="i-lucide-code-2">
      <div class="demo-row">
        <RBtn icon="i-lucide-trash-2" variant="soft" color="error" @click="showVNode">
          Rich VNode content
        </RBtn>
      </div>
    </RCard>

    <!-- ── 7. Update on close ─────────────────────────────────────── -->
    <RCard title="Update on close (upload pattern)" icon="i-lucide-upload-cloud">
      <p class="demo-hint">Shows a loading toast, then transitions to success after 2.5 s.</p>
      <div class="demo-row">
        <RBtn icon="i-lucide-upload-cloud" variant="soft" color="info" @click="showFileUpload">
          Simulate file upload
        </RBtn>
      </div>
    </RCard>

    <!-- ── 8. Promise toast ───────────────────────────────────────── -->
    <RCard title="Promise toast" icon="i-lucide-loader-circle">
      <p class="demo-hint">
        Automatically shows loading → success or error based on promise resolution.
        65% chance of success.
      </p>
      <div class="demo-row">
        <RBtn icon="i-lucide-refresh-cw" variant="soft" color="primary" @click="showPromise">
          Run async operation
        </RBtn>
      </div>
    </RCard>

    <!-- ── 9. Actions ─────────────────────────────────────────────── -->
    <RCard title="Actions" icon="i-lucide-mouse-pointer-click">
      <div class="demo-row">
        <RBtn icon="i-lucide-rocket" variant="soft" color="info" @click="showWithActions">
          Toast with actions
        </RBtn>
      </div>
    </RCard>

    <!-- ── 10. Clear all ──────────────────────────────────────────── -->
    <RCard title="Clear" icon="i-lucide-trash">
      <div class="demo-row">
        <RBtn icon="i-lucide-trash" variant="soft" color="error" @click="clearAll">
          Clear all toasts
        </RBtn>
      </div>
    </RCard>

  </div>
</template>

<style lang="scss" scoped>
.demo {
  padding:        var(--space-8);
  max-width:      860px;
  margin:         0 auto;
  display:        flex;
  flex-direction: column;
  gap:            var(--space-5);

  @include mobile-only { padding: var(--space-4); }
}

.demo-row {
  display:     flex;
  flex-wrap:   wrap;
  gap:         var(--space-3);
  padding-top: var(--space-1);

  &--wrap { flex-wrap: wrap; }
}

.demo-hint {
  font-size:   0.8rem;
  color:       var(--c-muted);
  margin:      0 0 var(--space-3);
  line-height: 1.5;
}
</style>
