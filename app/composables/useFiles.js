export const useFiles = () => {

const folders = ref([])
const files = ref([])
const folderTree = ref([])
const breadcrumbs = ref([])

const loadFiles = async(folder)=>{

const res = await $fetch("/api/file/list",{
method:"POST",
body:{folder_id:folder}
})

folders.value = res.folders
files.value = res.files
breadcrumbs.value = res.breadcrumbs

}

const loadFolders = async()=>{

folderTree.value = await $fetch("/api/file/tree")

}

return{
folders,
files,
folderTree,
breadcrumbs,
loadFiles,
loadFolders
}

}