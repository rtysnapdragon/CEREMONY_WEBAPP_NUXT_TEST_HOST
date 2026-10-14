<script setup lang="ts">
// pages/demo/avatar.vue
// Direct Nuxt 4 equivalent of the React DemoOne component.
// Click or drag-and-drop an image onto the avatar to change it.
import { ref } from 'vue'
import { useUIStore } from '@/stores/ui'

const ui    = useUIStore()
const photo = ref('https://avatar.vercel.sh/john')

async function handleUpload(file: File) {
  try {
    await ui.withLoading('avatar-upload', async () => {
      // ── Local preview (matches React URL.createObjectURL behaviour) ──
      photo.value = URL.createObjectURL(file)

      // ── Replace the block above with your real API call, e.g.: ──
      // const form = new FormData()
      // form.append('avatar', file)
      // const { url } = await $fetch<{ url: string }>('/api/avatar', {
      //   method: 'POST',
      //   body: form,
      // })
      // photo.value = url
    })
    ui.success('Avatar updated', 'Your profile picture has been changed.')
  } catch {
    ui.error('Upload failed', 'Please try again.')
  }
}
const user = { avatar: '/img/rithy.jpg' }
const team = ['/img/a.jpg', '/img/b.jpg', '/img/c.jpg', '/img/d.jpg', '/img/e.jpg', '/img/f.jpg']
const unreadCount = ref(0) // try 0 vs 3 — chip now correctly hides at 0
definePageMeta({layout:'navbar'})

</script>

<template>
  <!-- Toast portal (place once in app.vue in production) -->
  <RToast />
  <div class="demo-page">
    <!-- Default fallback: female profile avatar -->
<RAvatar :src="user.avatar" size="2xl" :chip="true"/>

<!-- Explicit gender configurations -->
<RAvatar :src="user.avatar" gender="female" />
<RAvatar :src="user.avatar" gender="male" />


    <!-- Basic single avatar -->
  <RAvatar :src="user.avatar" size="m" />

  <!-- Online status dot -->
  <RAvatar :src="user.avatar" :online="true" />
  <RAvatar :src="user.avatar" :online="false" />

  <!-- Count chip — hides automatically when 0 -->
  <RAvatar :src="user.avatar" :chip="unreadCount" />

  <!-- Text/short chip -->
  <RAvatar :src="user.avatar" chip="NEW" />

  <!-- Custom chip slot (your own markup, e.g. a verified checkmark) -->
  <RAvatar :src="user.avatar">
    <template #chip>
      <i class="ri-verified-chip-fill" style="color:#3b82f6; font-size:14px;" />
    </template>
  </RAvatar>

  <!-- Group avatars with overflow -->
  <RAvatar :src="team" :maxSrc="4" size="s" :online="true" />

  <!-- Square-ish, no border, custom bg -->
  <RAvatar
    :src="user.avatar"
    round="s"
    border="s"
    background="wrapper"
    borderColor="orange"
  />

  <!-- Skip the built-in preview-on-click modal -->
  <RAvatar :src="user.avatar" notUsePreviewImage />

    <RAvatar :chip="true" ></RAvatar>
    <UAvatar
      src="https://github.com/benjamincanac.png"
      loading="lazy"
      :chip="{
        inset: true
      }"
    />
  <UTooltip text="Benjamin Canac">
      <UAvatar
        src="https://github.com/benjamincanac.png"
        alt="Benjamin Canac"
        loading="lazy"
      />
    </UTooltip>
    <!-- Radial glow — mirrors the React cn() gradient backdrop -->
    <div class="demo-page__glow" aria-hidden="true" />

    <RAvatarUploader
      v-model="photo"
      name="John Doe"
      size="xl"
      shape="circle"
      @upload="handleUpload"
      @error="ui.error('Invalid file', $event)"
    />
  </div>
</template>

<style lang="scss" scoped>

.demo-page {
  position:        relative;
  min-height:      100dvh;
  display:         flex;
  align-items:     center;
  justify-content: center;
  background:      var(--c-bg);
  overflow:        hidden;

  // Radial accent glow — equivalent of the React tailwind radial-gradient
  &__glow {
    pointer-events:  none;
    position:        absolute;
    top:             -10%;
    left:            50%;
    transform:       translateX(-50%);
    width:           100%;
    height:          100%;
    border-radius:   50%;
    background:      radial-gradient(
      ellipse at center,
      rgba(255, 140, 66, 0.1) 0%,
      transparent 55%
    );
    filter:          blur(30px);
  }
}
</style>
