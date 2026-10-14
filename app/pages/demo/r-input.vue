<template>

<RInput
  v-model="form.name"
  floating-label="Full Name"
/>

<RInput
  v-model="form.email"
  type="email"
  floating-label="Email"
/>

<RInput
  v-model="form.password"
  type="password"
  floating-label="Password"
/>

<RInput
  v-model="form.phone"
  type="tel"
  leading-icon="ri-phone-line"
  floating-label="Phone Number"
/>

<RInput
  v-model="form.description"
  type="textarea"
  floating-label="Description"
/>

<RInput
  v-model="form.company"
  ai
  floating-label="Company Description"
/>

<RInput
  v-model="form.amount"
  type="number"
  trailing-icon="ri-money-dollar-circle-line"
  floating-label="Amount"
/>

</template>

<script setup>
const form = ref({
  name: '',
  email: '',
  password: '',
  phone: '',
  description: '',
  company: '',
  amount: '',
})
</script>