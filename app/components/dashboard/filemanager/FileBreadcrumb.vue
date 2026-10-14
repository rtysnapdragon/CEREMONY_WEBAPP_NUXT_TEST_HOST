<script setup>

const { breadcrumbs } = useFiles()

</script>

<template>

<div class="flex items-center text-sm text-gray-500 gap-2">

<span>Home</span>

<span
v-for="b in breadcrumbs"
:key="b.id"
>

 / {{b.name}}

</span>

</div>

</template>