<template>
  <section v-if="normalizedGallery?.length" :style="sectionStyle">
    <div style="max-width:600px;margin:0 auto;">
      <p :style="labelStyle">{{ label }}</p>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;">
        <div
          v-for="(item, i) in normalizedGallery"
          :key="item.id || i"
          :style="[itemStyle, { cursor: 'zoom-in' }]"
          @click="open(i)"
        >
          <img
            :src="resolveUrl(item.url || item.fileUrl)"
            style="width:100%;height:100%;object-fit:cover;transition:transform 0.3s ease;"
            :alt="item.alt || item.caption || ''"
            @mouseover="(e) => (e.target as HTMLImageElement).style.transform = 'scale(1.05)'"
            @mouseleave="(e) => (e.target as HTMLImageElement).style.transform = 'scale(1)'"
          />
        </div>
      </div>
    </div>

    <MediaViewer
      v-model="viewerOpen"
      :items="viewerItems"
      :index="viewerIndex"
    />
  </section>
</template>

<script setup lang="ts">
interface GalleryItem {
  id?: string
  fileUrl?: string
  url?: string
  thumbnail?: string
  caption?: string
  alt?: string
  status?: string
  category?: string
  sortOrder?: number
}

const props = defineProps<{
  gallery: GalleryItem[]
  imgUrlFn: (path: string) => string
  sectionStyle?: string | Record<string, string>
  itemStyle?: string | Record<string, string>
  label?: string
  labelStyle?: string | Record<string, string>
}>()

const viewerOpen = ref(false)
const viewerItems = ref<any[]>([])
const viewerIndex = ref(0)

// Normalize gallery items to handle both old and new structures
const normalizedGallery = computed(() => {
  return (props.gallery || []).map(item => ({
    id: item.id,
    fileUrl: item.fileUrl,
    url: item.url || item.fileUrl,
    thumbnail: item.thumbnail || item.url || item.fileUrl,
    caption: item.caption,
    alt: item.alt || item.caption,
    status: item.status,
    category: item.category,
    sortOrder: item.sortOrder,
  }))
})

const resolveUrl = (path: string) => path ? props.imgUrlFn(path) : ''

const open = (index: number) => {
  viewerItems.value = normalizedGallery.value.map((item) => ({
    fileUrl: resolveUrl(item.url || item.fileUrl),
    thumbnailUrl: resolveUrl(item.thumbnail),
    altText: item.alt || item.caption || '',
    mediaType: 'IMAGE',
  }))
  viewerIndex.value = index
  viewerOpen.value = true
}
</script>
