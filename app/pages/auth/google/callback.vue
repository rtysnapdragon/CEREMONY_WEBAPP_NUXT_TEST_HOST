<template>
  <div class="flex justify-center items-center min-h-screen">
    <p>Redirecting...</p>
  </div>
</template>

<script setup lang="ts">
// Google login uses the GSI popup flow (ID token), not an OAuth redirect.
// This page exists only as a fallback — redirect back to login.
definePageMeta({ layout: false })

onMounted(() => navigateTo('/auth/login', { replace: true }))
</script>
