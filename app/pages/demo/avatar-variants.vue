<script setup lang="ts">
// pages/demo/avatar-variants.vue
// Showcases all RAvatarUploader props, sizes, shapes, and edge cases.
import { ref } from 'vue'
import { useUIStore } from '@/stores/ui'

const ui = useUIStore()

// Independent v-model per demo slot
const photoCircle = ref('https://avatar.vercel.sh/john')
const photoSquare = ref('https://avatar.vercel.sh/jane')
const photoSm     = ref('')
const photoMd     = ref('https://avatar.vercel.sh/alice')
const photoLg     = ref('https://avatar.vercel.sh/bob')
const photoXl     = ref('')

// Shared upload handler — swap for real API in production
async function upload(setter: (url: string) => void, file: File) {
  await ui.withLoading('avatar', async () => {
    await new Promise(r => setTimeout(r, 800)) // simulate latency
    setter(URL.createObjectURL(file))
  })
  ui.success('Avatar updated')
}

definePageMeta({layout:'navbar'})
</script>

<template>
  <RToast />

  <div class="av-page">
    <RPageHeader
      title="RAvatarUploader"
      subtitle="Click or drag-and-drop an image to change the avatar."
      icon="i-lucide-user-round"
    />

    <!-- ── Sizes ── -->
    <RCard title="Sizes" icon="i-lucide-scaling" class="av-card">
      <div class="av-row">
        <div v-for="s in ['sm', 'md', 'lg', 'xl'] as const" :key="s" class="av-cell">
          <RAvatarUploader
            :model-value="s === 'sm' ? photoSm : s === 'md' ? photoMd : s === 'lg' ? photoLg : photoXl"
            name="John Doe"
            :size="s"
            @update:model-value="(url) => {
              if (s === 'sm') photoSm = url
              else if (s === 'md') photoMd = url
              else if (s === 'lg') photoLg = url
              else photoXl = url
            }"
            @upload="(file) => upload(
              (url) => {
                if (s === 'sm') photoSm = url
                else if (s === 'md') photoMd = url
                else if (s === 'lg') photoLg = url
                else photoXl = url
              },
              file
            )"
            @error="ui.error('Invalid file', $event)"
          />
          <span class="av-label">{{ s }}</span>
        </div>
      </div>
    </RCard>

    <!-- ── Shapes ── -->
    <RCard title="Shapes" icon="i-lucide-shapes" class="av-card">
      <div class="av-row">
        <div class="av-cell">
          <RAvatarUploader
            v-model="photoCircle"
            name="John Doe"
            size="lg"
            shape="circle"
            @upload="(f) => upload((url) => (photoCircle = url), f)"
            @error="ui.error('Invalid file', $event)"
          />
          <span class="av-label">circle</span>
        </div>
        <div class="av-cell">
          <RAvatarUploader
            v-model="photoSquare"
            name="Jane Doe"
            size="lg"
            shape="square"
            @upload="(f) => upload((url) => (photoSquare = url), f)"
            @error="ui.error('Invalid file', $event)"
          />
          <span class="av-label">square</span>
        </div>
      </div>
    </RCard>

    <!-- ── Disabled ── -->
    <RCard title="Disabled state" icon="i-lucide-lock" class="av-card">
      <div class="av-row">
        <RAvatarUploader
          model-value="https://avatar.vercel.sh/disabled"
          name="Locked User"
          size="lg"
          disabled
        />
      </div>
    </RCard>

    <!-- ── No image (initials fallback) ── -->
    <RCard title="No image — initials fallback" icon="i-lucide-user" class="av-card">
      <div class="av-row">
        <div v-for="name in ['Rithy Sok', 'Alice KH', 'Bob Pheap']" :key="name" class="av-cell">
          <RAvatarUploader
            :name="name"
            size="lg"
            @upload="(f) => upload(() => {}, f)"
            @error="ui.error('Invalid file', $event)"
          />
          <span class="av-label">{{ name }}</span>
        </div>
      </div>
    </RCard>

    <!-- ── In a form ── -->
    <RCard title="Inside a user form" icon="i-lucide-user-pen" class="av-card">
      <div class="av-form-demo">
        <RAvatarUploader
          v-model="photoCircle"
          name="John Doe"
          size="xl"
          @upload="(f) => upload((url) => (photoCircle = url), f)"
          @error="ui.error('Invalid file', $event)"
        />
        <div class="av-form-demo__fields">
          <div class="av-field">
            <label class="av-field__label">Full name</label>
            <input class="av-field__input" type="text" value="John Doe" />
          </div>
          <div class="av-field">
            <label class="av-field__label">Email</label>
            <input class="av-field__input" type="email" value="john@example.com" />
          </div>
          <RBtn icon="i-lucide-check" size="sm">Save changes</RBtn>
        </div>
      </div>
    </RCard>
  </div>
</template>

<style lang="scss" scoped>
.av-page {
  padding:    var(--space-8);
  max-width:  780px;
  margin:     0 auto;
  display:    flex;
  flex-direction: column;
  gap:        var(--space-5);

  @include mobile-only {
    padding: var(--space-4);
  }
}

.av-card {
  width: 100%;
}

.av-row {
  display:     flex;
  align-items: flex-end;
  gap:         var(--space-6);
  flex-wrap:   wrap;
  padding-top: var(--space-2);
}

.av-cell {
  display:        flex;
  flex-direction: column;
  align-items:    center;
  gap:            var(--space-3);
}

.av-label {
  font-size:  0.75rem;
  color:      var(--c-muted);
  font-weight: 500;
  font-family: var(--font-fallback);
}

/* In-form layout */
.av-form-demo {
  display:     flex;
  align-items: flex-start;
  gap:         var(--space-6);
  flex-wrap:   wrap;

  &__fields {
    flex:           1;
    min-width:      220px;
    display:        flex;
    flex-direction: column;
    gap:            var(--space-4);
  }
}

.av-field {
  display:        flex;
  flex-direction: column;
  gap:            var(--space-2);

  &__label {
    font-size:   0.82rem;
    font-weight: 500;
    color:       var(--c-text);
  }

  &__input {
    width:         100%;
    height:        38px;
    padding:       0 var(--space-3);
    font-family:   var(--font-fallback);
    font-size:     0.875rem;
    color:         var(--c-text);
    background:    var(--c-surface);
    border:        1px solid var(--c-border);
    border-radius: var(--radius-md);
    outline:       none;
    transition:    var(--transition-fast);

    &:focus {
      border-color: var(--c-accent);
      box-shadow:   0 0 0 3px rgba(255, 140, 66, 0.12);
    }
  }
}
</style>
