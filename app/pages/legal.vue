<script setup>
definePageMeta({ layout: 'navbar' })
useHead({
  title: 'Terms & Privacy Policy',
})
</script>

<template>
  <RWrapperPage>
  <RButton icon="ri-sun-line">Hello</RButton>
  <RButton icon="ri-moon-line">Hello</RButton>
  <RButton icon="ri-search-line">Hello</RButton>
  <RButton icon="ri-folder-line">Hello</RButton>
  <RButton icon="ri-arrow-right-line">Hello</RButton>
  <RButton icon="ri-arrow-left-line">Hello</RButton>
  <RButton icon="ri-arrow-up-line">Hello</RButton>
  <RButton icon="ri-arrow-down-line">Hello</RButton>
  <RButton class="rounded-full bg-primary text-white hover:bg-primary-hover">Hello</RButton>
  <div class="container mx-auto max-w-3xl py-10">
    <h1 class="text-3xl font-bold mb-8">Terms & Privacy Policy</h1>

    <!-- TERMS -->
    <section id="terms" class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">
        Terms & Conditions
      </h2>

      <p class="mb-4">
        By accessing or using this application, you agree to comply with
        and be bound by the following terms and conditions.
      </p>

      <h3 class="text-lg font-semibold mt-4 mb-2">1. Use of Service</h3>
      <p class="mb-4">
        You agree to use the service only for lawful purposes and in
        accordance with applicable laws.
      </p>

      <h3 class="text-lg font-semibold mt-4 mb-2">2. Accounts</h3>
      <p class="mb-4">
        You are responsible for maintaining the confidentiality of your
        account credentials.
      </p>

      <h3 class="text-lg font-semibold mt-4 mb-2">3. Termination</h3>
      <p class="mb-4">
        We reserve the right to suspend or terminate access at any time.
      </p>
    </section>

    <!-- PRIVACY -->
    <section id="privacy">
      <h2 class="text-2xl font-semibold mb-4">
        Privacy Policy
      </h2>

      <p class="mb-4">
        Your privacy is important to us. This policy explains how we
        collect, use, and protect your information.
      </p>

      <h3 class="text-lg font-semibold mt-4 mb-2">
        1. Information We Collect
      </h3>
      <p class="mb-4">
        We may collect personal information such as name, email address,
        and usage data.
      </p>

      <h3 class="text-lg font-semibold mt-4 mb-2">
        2. How We Use Information
      </h3>
      <p class="mb-4">
        Information is used to provide, improve, and secure our services.
      </p>

      <h3 class="text-lg font-semibold mt-4 mb-2">
        3. Data Protection
      </h3>
      <p class="mb-4">
        We implement appropriate security measures to protect your data.
      </p>
    </section>
  </div>

  </RWrapperPage>
</template>
