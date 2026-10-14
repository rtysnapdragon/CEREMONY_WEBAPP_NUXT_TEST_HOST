<template>
    <div class="flex items-center gap-2">
      <!-- Image Thumbnail -->
      <div
        class="w-[32px] h-[32px] rounded-[7px] border-[2px] border-card overflow-clip flex items-center cursor-pointer"
        @click="handleClick"
      >
        <img ref="refAVT"
          :src="isNotEmpty(imageSrc) ? getImageUrl(imageSrc) : props.fallback"
          alt="Product Image"
          class="object-cover w-full h-full"
          @error="onImageError"
        />
      </div>
      <!-- Image Preview Modal -->
      <div v-if="isPreviewOpen" class="popup-product-image">
        <div class="overlay" @click="closePreview">
          <img
            :src="isNotEmpty(imageSrc) ? getImageUrl(imageSrc) : props.fallback"
            class="pop-product-image w-full h-full object-cover"
            @click.stop="closePreview"
          />
          <button class="close-button absolute top-2 right-2" @click.stop="closePreview">✖</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
    const props = defineProps({
        src: String,
        fallback: {
        type: String,
        default: '/default-image.jpg',
        },
        enablePreview: {
        type: Boolean,
        default: true,
        },
    })
    
    const refAVT = ref(true) // default: assume it's a URL, not a Blob
    const imageFrame = computed(() => {
        return props.imageFrame || 'border-2 border-card'
    })
    const isPreviewOpen = ref(false)
    const isImageValid = ref(true)


    // Determine image URL & type
    const getImageUrl = (data) => {
        if (data?.file instanceof Blob) {
            refAVT.value = false
            return URL.createObjectURL(data.file)
        } else {
            refAVT.value = true
            return data
        }
    }

// 💡 Correctly access props via props.src and props.fallback
const imageSrc = computed(() => {
  return props.src?.length > 0 ? props.src : props.fallback
})

// function handleClick() {
//   if (props.enablePreview && imageSrc.value !== props.fallback) {
//     isPreviewOpen.value = true
//   } else{
//     isPreviewOpen.value = false
//   }
// }
// Handle image preview click
function handleClick() {
  if (props.enablePreview && isImageValid.value && refAVT.value && imageSrc.value !== props.fallback) {
    isPreviewOpen.value = true
  } else {
    isPreviewOpen.value = false
  }
}
function closePreview() {
  isPreviewOpen.value = false
}

// Mark image as broken
function onImageError() {
  isImageValid.value = false
}



</script>
  
  <style lang="scss" scoped>
  .popup-product-image {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 50;
    background-color: rgba(0, 0, 0, 0.7);
    &.image{
        max-width: 90%;           /* Full width */
        max-height: 80%;          /* 80% of the height */
        object-fit: contain;  /* Maintain aspect ratio */
    }
  }

  .overlay {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .pop-product-image {
    max-width: 90%;
    max-height: 90%;
  }

  .close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: var(--color-w-b-3);
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background 0.3s, transform 0.4s;
  &:hover {
    background: var(--color-w-b-3);
    transform: scale(1.1);
  }
  &::before {
    // content: '✖';
    font-size: 16px;
    color: #ff4d4d; // Change color as needed
  }
}
  </style>
  

  <!-- <ImagePreview :src="data.rowData?.ImagePath" :enablePreview="true" :fallback="defaults" /> -->
