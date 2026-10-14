<script setup>
// pages/demo/drawer.vue
// RDrawer showcase — all UDrawer modes + SARIKA extras
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useScreenStore } from '@/stores/screen'
import { useUIStore } from '@/stores/ui'

const screen = useScreenStore()
const ui     = useUIStore()

onMounted(screen.init)
onBeforeUnmount(screen.destroy)
const isOpen = ref(false)
const drawerRef = ref()
const { $rtoast } = useNuxtApp()  // from plugin nuxt
useHead({title:'RDrawer component'})
definePageMeta({layout:'navbar'})
const toast = useToast() // from nuxt ui
const clickOpen =() => {
// $rtoast.premium({
//   title: 'Upgrade Required',
//   description: 'This feature needs Pro plan',
//   action: {
//     label: 'Upgrade',
//     onClick: () => navigateTo('/pricing')
//   },
//   badges: ['Pro', 'Limited']
// })
  toast.add({
    title: 'Wedding saved',
    description: 'Your changes have been stored.',
    color: 'green',
    icon: 'i-lucide-check-circle',
    duration: 5000,
  })
  // Premium alert — same pattern
  toast.alert({
    title: 'Unlock All Premium Blocks',
    description: 'Get instant access to 100+ chart & blocks',
    action: {
      label: 'Last Chance – $149',
      icon: 'i-lucide-zap',
      onClick: () => navigateTo('/upgrade'),
    },
    badges: ['Instant Access', 'No Subscription'],
  })
  isOpen.value = true
}

// ── 1. Auto direction (default) ──────────────────────────────────────────
const autoOpen = ref(false)

// ── 2. Directions ────────────────────────────────────────────────────────
const dirRight  = ref(false)
const dirLeft   = ref(false)
const dirTop    = ref(false)
const dirBottom = ref(false)

// ── 3. Non-dismissible (close button only) ───────────────────────────────
const nonDismiss = ref(false)

// ── 4. No modal (backdrop-less) ──────────────────────────────────────────
const noModal   = ref(false)

// ── 5. No overlay ────────────────────────────────────────────────────────
const noOverlay = ref(false)

// ── 6. No handle ─────────────────────────────────────────────────────────
const noHandle  = ref(false)

// ── 7. handleOnly (drag only from handle) ────────────────────────────────
const handleOnly = ref(false)

// ── 8. shouldScaleBackground ─────────────────────────────────────────────
const scaleBg   = ref(false)

// ── 9. Custom sizes ──────────────────────────────────────────────────────
const sizeOpen  = ref(false)

// ── 10. With title + icon + description (chrome) ─────────────────────────
const chromeOpen = ref(false)

// ── 11. Custom #body slot ────────────────────────────────────────────────
const bodyOpen = ref(false)

// ── 12. With #footer slot ────────────────────────────────────────────────
const footerOpen = ref(false)

// ── 13. Nested drawer ────────────────────────────────────────────────────
const parentOpen = ref(false)
const childOpen  = ref(false)

// ── 14. Full custom #content (no chrome) ─────────────────────────────────
const contentOpen = ref(false)

// ── 15. Form inside drawer ───────────────────────────────────────────────
const formOpen = ref(false)
const formData = ref({ name: '', email: '', role: 'viewer' })
function submitForm() {
  ui.success('Saved!', `${formData.value.name} · ${formData.value.email}`)
  formOpen.value = false
}
</script>

<template>
  <RToast />

  <div class="ddr">
    <RPageHeader
      title="RDrawer"
      subtitle="UDrawer wrapper · all props · all slots · nested · responsive"
      icon="i-lucide-panel-right"
    />

    <!-- ── Grid of trigger cards ─────────────────────────── -->
    <div class="ddr__grid">

      <!-- 1 Auto direction -->
      <div class="ddr__trigger-card">
        <p class="ddr__trigger-label">Auto direction</p>
        <p class="ddr__trigger-sub">bottom on mobile · right on desk</p>
        <RBtn :label="$t('open')" icon="i-lucide-panel-right" @click="autoOpen = true"></RBtn>
        <RDrawer
          v-model:open="autoOpen"
          title="Auto Direction"
          icon="ri-magic-line"
          description="Switches direction based on screen size."
        >
          <template #body>
            <div class="ddr__content-block">
              <i class="ri-device-line ddr__big-icon" />
              <p>Current device: <strong>{{ screen.breakpoint }}</strong></p>
              <p class="ddr__muted">On mobile → bottom. On tablet/desktop → right.</p>
            </div>
          </template>
        </RDrawer>
      </div>

      <!-- 2a Right -->
      <div class="ddr__trigger-card">
        <p class="ddr__trigger-label">direction: right</p>
        <RBtn :label="$t('open')" icon="i-lucide-panel-right" @click="dirRight = true"></RBtn>
        <RDrawer v-model:open="dirRight" direction="right" title="Right Drawer" icon="ri-layout-right-line">
          <template #body><div class="ddr__content-block"><i class="ri-layout-right-line ddr__big-icon" /><p>Slides from the right.</p></div></template>
        </RDrawer>
      </div>

      <!-- 2b Left -->
      <div class="ddr__trigger-card">
        <p class="ddr__trigger-label">direction: left</p>
        <RBtn :label="$t('open')" icon="i-lucide-panel-left" @click="dirLeft = true"></RBtn>
        <RDrawer v-model:open="dirLeft" direction="left" title="Left Drawer" icon="ri-layout-left-line">
          <template #body><div class="ddr__content-block"><i class="ri-layout-left-line ddr__big-icon" /><p>Slides from the left.</p></div></template>
        </RDrawer>
      </div>

      <!-- 2c Top -->
      <div class="ddr__trigger-card">
        <p class="ddr__trigger-label">direction: top</p>
        <RBtn :label="$t('open')" icon="i-lucide-panel-top" @click="dirTop = true"></RBtn>
        <RDrawer v-model:open="dirTop" direction="top" title="Top Drawer" icon="ri-layout-top-line">
          <template #body><div class="ddr__content-block"><i class="ri-layout-top-line ddr__big-icon" /><p>Slides from the top.</p></div></template>
        </RDrawer>
      </div>

      <!-- 2d Bottom -->
      <div class="ddr__trigger-card">
        <p class="ddr__trigger-label">direction: bottom</p>
        <RBtn :label="$t('open')" icon="i-lucide-panel-bottom" @click="dirBottom = true"></RBtn>
        <RDrawer v-model:open="dirBottom" direction="bottom" title="Bottom Drawer" icon="ri-layout-bottom-line">
          <template #body><div class="ddr__content-block"><i class="ri-layout-bottom-line ddr__big-icon" /><p>Slides from the bottom.</p></div></template>
        </RDrawer>
      </div>

      <!-- 3 Non-dismissible -->
      <div class="ddr__trigger-card">
        <p class="ddr__trigger-label">dismissible: false</p>
        <p class="ddr__trigger-sub">Close button only</p>
        <RBtn :label="$t('open')" icon="ri-book-open-line" @click="nonDismiss = true"></RBtn>
        <RDrawer
          v-model:open="nonDismiss"
          direction="right"
          :dismissible="false"
          title="Non-Dismissible"
          icon="ri-lock-line"
          description="Click × or the button below to close."
        >
          <template #body>
            <div class="ddr__content-block">
              <i class="ri-lock-line ddr__big-icon" />
              <p>Clicking outside or pressing Escape will NOT close this.</p>
              <RBtn variant="outline" icon="i-lucide-x" @click="nonDismiss = false">Close manually</RBtn>
            </div>
          </template>
        </RDrawer>
      </div>

      <!-- 4 modal:false -->
      <div class="ddr__trigger-card">
        <p class="ddr__trigger-label">modal: false</p>
        <p class="ddr__trigger-sub">Page remains interactive</p>
        <RBtn :label="$t('open')" icon="ri-book-open-line" @click="nonDismiss = true"></RBtn>
        <RDrawer
          v-model:open="noModal"
          direction="right"
          :modal="false"
          title="No Modal"
          icon="ri-window-line"
        >
          <template #body><div class="ddr__content-block"><i class="ri-window-line ddr__big-icon" /><p>Background stays fully interactive.</p></div></template>
        </RDrawer>
      </div>

      <!-- 5 overlay:false -->
      <div class="ddr__trigger-card">
        <p class="ddr__trigger-label">overlay: false</p>
        <RBtn :label="$t('open')" icon="ri-book-open-line" @click="nonDismiss = true"></RBtn>
        <RDrawer
          v-model:open="noOverlay"
          direction="right"
          :overlay="false"
          title="No Overlay"
          icon="ri-eye-off-line"
        >
          <template #body><div class="ddr__content-block"><i class="ri-eye-off-line ddr__big-icon" /><p>No backdrop/overlay rendered.</p></div></template>
        </RDrawer>
      </div>

      <!-- 6 handle:false -->
      <div class="ddr__trigger-card">
        <p class="ddr__trigger-label">handle: false</p>
        <RBtn :label="$t('open')" icon="ri-book-open-line" @click="nonDismiss = true"></RBtn>
        <RDrawer
          v-model:open="noHandle"
          direction="bottom"
          :handle="false"
          title="No Handle"
          icon="ri-drag-move-2-line"
        >
          <template #body><div class="ddr__content-block"><i class="ri-drag-move-2-line ddr__big-icon" /><p>Drag handle is hidden.</p></div></template>
        </RDrawer>
      </div>

      <!-- 7 handleOnly -->
      <div class="ddr__trigger-card">
        <p class="ddr__trigger-label">handle-only: true</p>
        <p class="ddr__trigger-sub">Drag only from handle bar</p>
        <RBtn :label="$t('open')" icon="ri-book-open-line" @click="nonDismiss = true"></RBtn>
        <RDrawer
          v-model:open="handleOnly"
          direction="bottom"
          :handle-only="true"
          title="Handle Only"
          icon="ri-drag-drop-line"
        >
          <template #body><div class="ddr__content-block"><i class="ri-drag-drop-line ddr__big-icon" /><p>Only the handle bar responds to drag.</p></div></template>
        </RDrawer>
      </div>

      <!-- 8 shouldScaleBackground -->
      <div class="ddr__trigger-card">
        <p class="ddr__trigger-label">should-scale-background</p>
        <RBtn :label="$t('open')" icon="ri-book-open-line" @click="nonDismiss = true"></RBtn>
        <RDrawer
          v-model:open="scaleBg"
          direction="bottom"
          :should-scale-background="true"
          title="Scale Background"
          icon="ri-picture-in-picture-line"
        >
          <template #body><div class="ddr__content-block"><i class="ri-picture-in-picture-line ddr__big-icon" /><p>Page scales down behind the drawer.</p></div></template>
        </RDrawer>
      </div>

      <!-- 9 Custom sizes -->
      <div class="ddr__trigger-card">
        <p class="ddr__trigger-label">Custom sizes per device</p>
        <p class="ddr__trigger-sub">desk: 700px · tab: 360px · mob: 100vw</p>
        <RBtn :label="$t('open')" icon="ri-book-open-line" @click="nonDismiss = true"></RBtn>
        <RDrawer
          v-model:open="sizeOpen"
          direction="right"
          title="Custom Size"
          icon="ri-fullscreen-line"
          width-desktop="700px"
          width-tablet="360px"
          width-mobile="100vw"
        >
          <template #body>
            <div class="ddr__content-block">
              <i class="ri-fullscreen-line ddr__big-icon" />
              <p>Width changes per breakpoint.</p>
              <p class="ddr__muted">Desktop: 700px · Tablet: 360px · Mobile: 100vw</p>
            </div>
          </template>
        </RDrawer>
      </div>

      <!-- 10 Chrome (title + icon + description) -->
      <div class="ddr__trigger-card">
        <p class="ddr__trigger-label">Chrome: title + icon + desc</p>
        <RBtn :label="$t('open')" icon="ri-book-open-line" @click="nonDismiss = true"></RBtn>
        <RDrawer
          v-model:open="chromeOpen"
          direction="right"
          title="SARIKA Chrome Header"
          icon="ri-dashboard-3-line"
          description="Icon · title · description + close button auto-rendered."
        >
          <template #body>
            <div class="ddr__content-block">
              <p>Body slot content goes here.</p>
            </div>
          </template>
        </RDrawer>
      </div>

      <!-- 11 #body slot only -->
      <div class="ddr__trigger-card">
        <p class="ddr__trigger-label">#body slot</p>
        <RBtn :label="$t('open')" icon="ri-book-open-line" @click="nonDismiss = true"></RBtn>
        <RDrawer v-model:open="bodyOpen" direction="right">
          <template #body="{ close }">
            <div class="ddr__content-block">
              <i class="ri-inbox-archive-line ddr__big-icon" />
              <p>Using <code>#body</code> slot directly.</p>
              <RBtn variant="ghost" @click="close">Close from slot</RBtn>
            </div>
          </template>
        </RDrawer>
      </div>

      <!-- 12 #footer slot -->
      <div class="ddr__trigger-card">
        <p class="ddr__trigger-label">#footer slot</p>
        <RBtn :label="$t('open')" icon="ri-book-open-line" @click="nonDismiss = true"></RBtn>
        <RDrawer
          v-model:open="footerOpen"
          direction="right"
          title="Drawer with Footer"
          icon="ri-layout-bottom-2-line"
        >
          <template #body>
            <div class="ddr__content-block">
              <p>Scroll the body while footer stays pinned.</p>
              <div v-for="i in 12" :key="i" class="ddr__list-item">List item {{ i }}</div>
            </div>
          </template>
          <template #footer="{ close }">
            <div class="ddr__footer-actions">
              <RBtn variant="ghost" @click="close">Cancel</RBtn>
              <RBtn icon="i-lucide-check" @click="close">Confirm</RBtn>
            </div>
          </template>
        </RDrawer>
      </div>

      <!-- 13 Nested drawer -->
      <div class="ddr__trigger-card">
        <p class="ddr__trigger-label">Nested drawer</p>
        <p class="ddr__trigger-sub">Parent → Child via nested prop</p>
        <RBtn :label="$t('open')" icon="ri-book-open-line" @click="nonDismiss = true"></RBtn>

        <RDrawer
          v-model:open="parentOpen"
          direction="right"
          title="Parent Drawer"
          icon="ri-parent-line"
          description="Opens a nested child drawer."
        >
          <template #body>
            <div class="ddr__content-block">
              <p>This is the parent drawer.</p>
              <RBtn :label="$t('open')" icon="ri-book-open-line" @click="nonDismiss = true"></RBtn>
            </div>
          </template>

          <!-- Child drawer — nested prop tells vaul to layer correctly -->
          <RDrawer
            v-model:open="childOpen"
            direction="right"
            :nested="true"
            title="Child Drawer"
            icon="ri-git-branch-line"
            description="Nested inside parent. Close me first."
            width-desktop="360px"
            width-tablet="320px"
            width-mobile="88vw"
          >
            <template #body>
              <div class="ddr__content-block">
                <i class="ri-git-branch-line ddr__big-icon" />
                <p>I am the nested child drawer.</p>
              </div>
            </template>
          </RDrawer>
        </RDrawer>
      </div>

      <!-- 14 Full #content override (no chrome) -->
      <div class="ddr__trigger-card">
        <p class="ddr__trigger-label">#content full override</p>
        <p class="ddr__trigger-sub">No chrome — you own everything</p>
        <RBtn type="save" :label="$t('open')" icon="ri-book-open-line" @click="nonDismiss = true"></RBtn>
        <RDrawer v-model:open="contentOpen" direction="bottom" :handle="false">
          <template #content="{ close }">
            <div class="ddr__custom-content">
              <div class="ddr__custom-header">
                <span class="ddr__custom-pill" />
              </div>
              <div class="ddr__custom-body">
                <i class="ri-sparkling-line ddr__big-icon" />
                <h3>Full custom content</h3>
                <p class="ddr__muted">No SARIKA chrome. You own the entire drawer.</p>
                <RBtn @click="close">Got it</RBtn>
              </div>
            </div>
          </template>
        </RDrawer>
      </div>

      <!-- 15 Form inside drawer -->
      <div class="ddr__trigger-card ddr__trigger-card--full">
        <p class="ddr__trigger-label">Form inside drawer</p>
        <RBtn :label="$t('open')" icon="ri-book-open-line" @click="nonDismiss = true"></RBtn>
        <RDrawer
          v-model:open="formOpen"
          direction="right"
          title="Create User"
          icon="ri-user-add-line"
          description="Fill in the fields and save."
          :dismissible="false"
        >
          <template #body>
            <div class="ddr__form">
              <div class="ddr__form-field">
                <label class="ddr__form-label">Full name *</label>
                <input v-model="formData.name" class="ddr__form-input" placeholder="Rithy Sok" />
              </div>
              <div class="ddr__form-field">
                <label class="ddr__form-label">Email *</label>
                <input v-model="formData.email" type="email" class="ddr__form-input" placeholder="rithy@example.com" />
              </div>
              <div class="ddr__form-field">
                <label class="ddr__form-label">Role</label>
                <select v-model="formData.role" class="ddr__form-select">
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
            </div>
          </template>
          <template #footer="{ close }">
            <div class="ddr__footer-actions">
              <RBtn color="cancel" variant="soft" @click="close">{{ $t('cancel') }}</RBtn>
              <RBtn type="save" :label="$t('save')" icon="i-lucide-save" @click="save"></RBtn>
            </div>
          </template>
        </RDrawer>
      </div>

    </div><!-- /grid -->
  </div>
</template>

<style lang="scss" scoped>

.ddr {
  padding:        var(--space-8);
  max-width:      960px;
  margin:         0 auto;
  display:        flex;
  flex-direction: column;
  gap:            var(--space-5);

  @include mobile-only { padding: var(--space-4); }

  // Responsive card grid
  &__grid {
    display:  grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap:      var(--space-2);
    align-items: start;

    @include mobile-only { grid-template-columns: 1fr; }
  }

  // Trigger card
  &__trigger-card {
    display:        flex;
    flex-direction: column;
    gap:            var(--space-3);
    padding:        var(--space-4);
    background:     var(--c-surface);
    border:         1px solid var(--c-border);
    border-radius:  var(--radius-lg);

    &--full { grid-column: 1 / -1; flex-direction: row; align-items: center; flex-wrap: wrap; }
  }

  &__trigger-label {
    font-size:   0.82rem;
    font-weight: 600;
    color:       var(--c-text);
    margin:      0;
  }

  &__trigger-sub {
    font-size: 0.72rem;
    color:     var(--c-muted);
    margin:    0 0 var(--space-1);
  }

  // Body content blocks
  &__content-block {
    display:        flex;
    flex-direction: column;
    align-items:    flex-start;
    gap:            var(--space-3);
    font-size:      0.875rem;
    color:          var(--c-text);
  }

  &__big-icon {
    font-size: 2.5rem;
    color:     var(--c-accent);
    line-height: 1;
    filter:    drop-shadow(var(--glow-text));
  }

  &__muted {
    font-size: 0.78rem;
    color:     var(--c-muted);
    margin:    0;
  }

  &__list-item {
    padding:       var(--space-3) 0;
    border-bottom: 1px solid var(--c-border);
    font-size:     0.875rem;
    color:         var(--c-text);
  }

  // Footer actions
  &__footer-actions {
    display:         flex;
    align-items:     center;
    justify-content: flex-end;
    gap:             var(--space-3);
  }

  // Full custom content
  &__custom-content {
    display:        flex;
    flex-direction: column;
    height:         100%;
    background:     var(--c-surface);
  }

  &__custom-header {
    display:         flex;
    justify-content: center;
    padding:         var(--space-3);
  }

  &__custom-pill {
    width:         40px;
    height:        4px;
    border-radius: 999px;
    background:    var(--c-border);
  }

  &__custom-body {
    flex:           1;
    display:        flex;
    flex-direction: column;
    align-items:    center;
    justify-content: center;
    gap:            var(--space-4);
    padding:        var(--space-6);
    text-align:     center;

    h3 { font-size: 1.1rem; font-weight: 700; color: var(--c-text); margin: 0; }
    p  { margin: 0; }
  }

  // Form
  &__form {
    display:        flex;
    flex-direction: column;
    gap:            var(--space-4);
  }

  &__form-field {
    display:        flex;
    flex-direction: column;
    gap:            var(--space-2);
  }

  &__form-label {
    font-size:   0.82rem;
    font-weight: 500;
    color:       var(--c-text);
  }

  &__form-input,
  &__form-select {
    height:        38px;
    padding:       0 var(--space-3);
    font-family:   var(--font-fallback);
    font-size:     0.875rem;
    color:         var(--c-text);
    background:    var(--c-surface);
    border:        1px solid var(--c-border);
    border-radius: var(--radius-md);
    outline:       none;
    width:         100%;
    @include transition(fast);

    &::placeholder { color: var(--c-muted); }
    &:focus { border-color: var(--c-accent); box-shadow: 0 0 0 3px rgba(255,140,66,0.12); }
  }

  &__form-select { cursor: pointer; }
}
</style>