<script setup>

const router = useRouter()

const { folderTree, loadFolders } = useFiles()

onMounted(loadFolders)

const openFolder = (id)=>{
  router.push(`/files?folder=${id}`)
}

</script>

<template>

<div class="w-64 bg-white border-r p-4">

<h2 class="font-semibold mb-4">
Files
</h2>

<div class="space-y-2">

<div
v-for="folder in folderTree"
:key="folder.id"
@click="openFolder(folder.id)"
class="cursor-pointer hover:bg-gray-100 rounded p-2"
>

📁 {{folder.name}}

</div>

</div>

</div>

</template>