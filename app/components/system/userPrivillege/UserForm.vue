<script setup>
import { useUserStore } from '~/stores/userStore';

const userStore = useUserStore();
const form = ref({ username: '', email: '', password: '', roleId: '' });
const file = ref(null);

const handleSubmit = async () => {
  const formData = new FormData();
  formData.append('username', form.value.username);
  formData.append('email', form.value.email);
  formData.append('password', form.value.password);
  formData.append('roleId', form.value.roleId);
  if (file.value) formData.append('image', file.value);

  await userStore.submitUser(formData);
};
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <UInput v-model="form.username" placeholder="Username" required />
    <UInput v-model="form.email" placeholder="Email" type="email" required />
    <UInput v-model="form.password" placeholder="Password" type="password" required />
    <USelect v-model="form.roleId" :options="userStore.roles" placeholder="Select Role" />
    <UInput type="file" @change="e => file = e.target.files[0]" />
    <UButton type="submit">Save</UButton>
  </form>
</template>
