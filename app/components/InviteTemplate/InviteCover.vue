<template>
  <div
    v-if="coverImage"
    :style="[wrapperStyle, { cursor: 'zoom-in' }]"
    @click="open"
  >
    <img
      :src="resolveUrl(coverImage)"
      style="width:100%;height:100%;object-fit:cover;"
      :alt="alt"
    />
  </div>

  <MediaViewer
    v-model="viewerOpen"
    :items="viewerItems"
    :index="0"
  />
</template>

<script setup lang="ts">
const props = defineProps<{
  coverImage: string
  imgUrlFn: (path: string) => string
  wrapperStyle?: string | Record<string, string>
  alt?: string
}>()

const viewerOpen = ref(false)
const viewerItems = ref<any[]>([])

const resolveUrl = (path: string) => props.imgUrlFn(path)

const open = () => {
  viewerItems.value = [{
    fileUrl: props.imgUrlFn(props.coverImage),
    thumbnailUrl: props.imgUrlFn(props.coverImage),
    altText: props.alt || 'Cover photo',
    mediaType: 'IMAGE',
  }]
  viewerOpen.value = true
}
</script>
