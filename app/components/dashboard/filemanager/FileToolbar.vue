<script setup>

const search = ref("")

</script>

<template>

<div class="bg-white border-b p-4 flex justify-between">

<input
v-model="search"
placeholder="Search files..."
class="border rounded px-3 py-2 w-72"
/>

<div class="flex gap-2">

<FileUpload />

<button class="bg-blue-600 text-white px-4 py-2 rounded">
New Folder
</button>

</div>

</div>

</template>