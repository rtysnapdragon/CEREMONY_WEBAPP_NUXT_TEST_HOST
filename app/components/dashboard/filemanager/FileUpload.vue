<script setup>

const upload = async (e)=>{

const file = e.target.files[0]

const form = new FormData()

form.append("file",file)

await $fetch("/api/file/upload",{
method:"POST",
body:form
})

}

</script>

<template>

<label class="bg-green-600 text-white px-4 py-2 rounded cursor-pointer">

Upload

<input
type="file"
hidden
@change="upload"
/>

</label>

</template>