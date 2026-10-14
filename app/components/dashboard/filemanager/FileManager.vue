<script setup>

const route = useRoute()

const folderId = computed(() => route.query.folder || null)

const { folders, files, loadFiles } = useFiles()

watch(folderId, () => {
  loadFiles(folderId.value)
}, { immediate:true })

</script>

<template>

<div class="space-y-6">

<FileBreadcrumb />

<FileGrid
  :folders="folders"
  :files="files"
/>

</div>

</template>