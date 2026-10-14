<script setup>

const props = defineProps({
  file:Object
})

</script>

<template>

<div class="border rounded-xl p-4 bg-white hover:shadow relative group">

<div class="text-4xl text-center">

<span v-if="file.type==='image'">🖼</span>
<span v-else-if="file.type==='pdf'">📕</span>
<span v-else>📄</span>

</div>

<p class="text-sm truncate text-center mt-2">
{{file.name}}
</p>

<div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100">
⋮
</div>

</div>

</template>