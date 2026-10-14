<script setup>

const props = defineProps({
  folders:Array,
  files:Array
})

const router = useRouter()

const openFolder = (id)=>{
  router.push(`/files?folder=${id}`)
}

</script>

<template>

<div>

<!-- folders -->

<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">

<div
v-for="folder in folders"
:key="folder.id"
@click="openFolder(folder.id)"
class="p-4 border rounded-xl bg-white cursor-pointer hover:shadow"
>

<div class="text-4xl">📁</div>

<p class="text-sm truncate">
{{folder.name}}
</p>

</div>

</div>


<!-- files -->

<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-6">

<FileCard
v-for="file in files"
:key="file.id"
:file="file"
/>

</div>

</div>

</template>