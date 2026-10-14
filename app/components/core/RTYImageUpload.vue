<template>
  <div class="nav-profile max-w-fit">
    <!-- <OCAvatar
      :src="getImageUrl(image)"
      :isUrl="refAVT"
      :round="round"
      :size="size"
      :border="border"
    /> -->
    <!-- v-if="getImageUrl(image)" -->
    <div :class="['image-frame  z-50',`image-frame-${round}`]" :style="imageFrame">
      <div :class="[imageStyle,'Image']">
        <img :src="isNotEmpty(image) ? getImageUrl(image) : defaultImage" @click="isNotEmpty(image) ? openModal() : null"  class="thumbnail"  @error="errorHandler"/>
      </div>
    </div>

    <div v-if="showModal" class="modal">
      <div class="modal-image">
        <img :src="isNotEmpty(getImageUrl(image)) ? getImageUrl(image) : (isNotEmpty(imageSrc) ? imageSrc : defaultImage)"  class="popup-image" @error="errorHandler"/>
        <button class="close-button" @click="closeModal">✖</button>
      </div>
    </div>

    <div :class="['absolute-side z-50', `absolute-${props?.customAbsolute}`] ">
      <input
        ref="inputFile"
        type="file"
        name="picture"
        accept="image/png, image/jpeg"
        hidden
        @change="onChangeImage"
      />

      <label
        for="picture"
        class="change-picture-container"
        v-if="isEmpty(getImageUrl(image))"
        @click="eventUpload"
      >
        <span class="text-base mb-[2px]">
          <i v-if="!loading" class="ri-camera-line text-[13px] color-primary"></i>
          <div v-else class="animate-spin">
            <i class="ri-loader-4-line text-[13px]"></i>
          </div>
        </span>
      </label>

      <label v-else for="picture" class="change-picture-container"  @click="eventDelete">
        <span class="text-base mb-[2px]">
          <i class="ri-delete-bin-5-line color-red text-[13px] color-primary"></i>
        </span>
      </label>
    </div>
  </div>
</template>

<script setup>
const { t } = useI18n();
const props = defineProps(['loading', 'round','imageURL','imageFrame','customAbsolute', 'size','imageStyle', 'border','errorType']);
const imageStyle = computed(() => props.imageStyle)
const round = computed(() => props.round ?? 'l');
const size = computed(() => props.round ?? 'ml');
const imageFrame = computed(() => props.imageFrame);
const border = computed(() => props.round ?? 'l');
const defaults = '/img/default-no-img.png';
const imageSrc = ref('');
const showModal = ref(false);
const defaultImg = UseDefaultImagStore();

const defaultImage = computed(() => {
  if (props?.imageURL) {
    return props.imageURL;
  } else {
    return defaults;
  }
});

const errorHandler = (e) => {
  defaultImg.get(e,props.errorType)
  showModal.value = false;
}

const loading = computed(() => props.loading);
const emit = defineEmits(['onDone', 'onDelete']);
const inputFile = ref(null);
const image = defineModel();
const openPopOver = defineModel('openPopOver');
const borderGender = defineModel('Gender');

const refAVT = ref();

const listActions = ref([
  {
    icon: 'ri-upload-cloud-line',
    type: 'upload',
    label: t('upload'),
    color: 'color-nenoBlue',
  },
  {
    icon: 'ri-delete-bin-3-line',
    type: 'delete',
    label: t('delete'),
    color: 'color-red',
  },
]);

watch(image.value, (n) => {
  console.log(image.value);
});

function gender() {
  if (isEmpty(borderGender.value)) return;
  const gen = borderGender.value.toLowerCase();
  return gen;
}

const openModal = () => {
  showModal.value = true;
};

const closeModal = () => showModal.value = false;

function eventUpload() {
  onClickInput();
}

// function eventDelete() {
//   emit('onDelete');
// }

function eventDelete() { // prevent the same file twice to click and not shows up
  emit('onDelete');
  // reset the file input value to allow re-upload of same file
  if (inputFile.value) {
    inputFile.value.value = ''; // this is the key!
  }
}


function fnClickItem(d) {
  if (d == 'upload') {
    openPopOver.value = false;
    onClickInput();
  } else {
    emit('onDelete');
    openPopOver.value = false;
  }
}

function onClickInput() {
  inputFile.value.click();
}

function onChangeImage11(event) { //for crop component
  const file = event.target.files[0];
  if (file) {
    file.crop({
      width: 500,
      height: 500,
      isRounded: true,
      title: "Upload image Profile",
      onDone: async (data) => {
        if (data.file) {
          const reader = new FileReader();
          reader.readAsDataURL(data.file);
          emit("onDone", data.byteArray);
          image.value = data;
        }
      },
    });
  }
  event.target.value = "";
}

const onChangeImage = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  file.compress({
    maxWidth: 1020,
    compressSize: 1000000,
    quality: 0.8,
    onDone: async (data) => {
      image.value = data;
      emit("onDoneUpload", data.byteArray);

      // reset input so same file can be re-uploaded if needed
      if (inputFile.value) {
        inputFile.value.value = '';
      }
    },
  });
};

// 12:000
// 01:
// // 13:00:00

const getImageUrl = (data) => {
  if (data?.file instanceof Blob) {
    refAVT.value = false;
    return URL.createObjectURL(data?.file);
  } else {
    refAVT.value = true;
    return data;
  }
};

</script>

<style lang="scss" scoped>
.dialog {
  background: var(--c-surface);
  padding: 10px;
  border-radius: 10px;
}

.nav-profile {
  position: relative;
  .image-frame {
    width: 104px;
    height: 104px;
    padding: 5px;
    border: 2px solid var(--border-input);
    border-radius: 100%;
  }
  .triangle{
    overflow: hidden;
    & img {
      width: 100%;
      height: auto;
    }
  }
 
  //for merchant product and category
  .image-frame-rounded85{ // with dynamic prop
    padding: 5px;
    border: 2px solid var(--border-input);
    border-radius: 10% !important; 

   .Image{
      width: 90px !important;
      height: 90px !important;
      border-radius: 5%;
      overflow: hidden;
      display: flex;
      justify-content: center;
      & img {
        width: 100%;
        height: auto;
      }
    }
  }

  .absolute-side{
    position:absolute;
    right: 0px;
    bottom: 0px
  }
  .absolute-customAbsolute{ // with dynamic prop
    position:absolute;
    right: -10px  !important;
    bottom: -6px  !important;
  }

  //for merchant management
  .image {
    width: 90px;
    height: 90px;
    border-radius: 100%;
    overflow: hidden;
    display: flex;
    justify-content: center;
    background: #e9eef1;
    object-fit: contain;
    object
      & img {
      width: 100%;
      height: auto;
    }
  }

  .change-picture-container {
    border: 2px solid rgba(0, 0, 0, 0.05);
    background: var(--c-surface);
    color: var(--color-w-b-1);
    border-radius: 100%;
    width: 30px;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: 0.25s ease-in-out;

    &:hover {
      color: var(--color-w-b-4);
    }
  }
}

.thumbnail {
  // max-width: 200px;
  object-fit: cover;
  cursor: pointer;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-image {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100% !important;
  width: 100% !important;
}

.popup-image {
  max-width: 90%;           /* Full width */
  max-height: 80%;          /* 80% of the height */
  object-fit: contain;  /* Maintain aspect ratio */
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
