<template>
    <div class="nav-profile max-w-fit">
      <!-- <OCAvatar
        :src="getImageUrl(image)"
        :isUrl="refAVT"
        :round="round"
        :size="size"
        :border="border"
      /> -->
      <div class="image-frame z-50">
        <img :src="image ? getImageUrl(image) : defaults" class="w-full h-full" />
      </div>
  
      <div class="absolute bottom-[0px] right-[0px] z-50">
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
          v-if="getImageUrl(image)"
          @click="eventUpload"
        >
          <span class="text-base mb-[2px]">
            <i v-if="!loading" class="ri-camera-line text-[13px] color-primary"></i>
            <div v-else class="animate-spin">
              <i class="ri-loader-4-line text-[13px]"></i>
            </div>
          </span>
        </label>
  
        <label
          for="picture"
          class="change-picture-container"
          v-else
          @click="eventDelete"
        >
          <span class="text-base mb-[2px]">
            <i class="ri-delete-bin-5-line color-red text-[13px] color-primary"></i>
          </span>
        </label>
      </div>
    </div>
  </template>
  
  <script setup>
  const { t } = useI18n();
  const props = defineProps(["loading", "round", "size", "border"]);
  const round = computed(() => props.round ?? "l");
  const size = computed(() => props.round ?? "ml");
  const border = computed(() => props.round ?? "l");
  import defaults from "/images/profile_female.png";
  
  
  
  const loading = computed(() => props.loading);
  const emit = defineEmits(["onDone", "onDelete"]);
  const inputFile = ref(null);
  const image = defineModel();
  const openPopOver = defineModel("openPopOver");
  const borderGender = defineModel("Gender");
  
  const refAVT = ref();
  
  const listActions = ref([
    {
      icon: "ri-upload-cloud-line",
      type: "upload",
      label: t("upload"),
      color: "color-nenoBlue",
    },
    {
      icon: "ri-delete-bin-3-line",
      type: "delete",
      label: t("delete"),
      color: "color-red",
    },
  ]);
  
  
  
  watch(image.value, (n) => {
    console.log(image.value);
  });
  
  function gender() {
    if (borderGender.value) return;
    const gen = borderGender.value.toLowerCase();
    return gen;
  }
  
  function eventUpload() {
    onClickInput();
  }
  
  function eventDelete() {
    emit("onDelete");
  }
  
  function fnClickItem(d) {
    if (d == "upload") {
      openPopOver.value = false;
      onClickInput();
    } else {
      emit("onDelete");
      openPopOver.value = false;
    }
  }
  
  function onClickInput() {
    inputFile.value.click();
  }
  
  // change image profile
  function onChangeImage(event) {
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
  
  const getImageUrl = (data) => {
    if (data?.file instanceof Blob) {
      refAVT.value = false;
      return URL.createObjectURL(data?.file);
    } else {
      refAVT.value = true;
      return data;
    }
  
    // if (data?.file instanceof Blob) return URL.createObjectURL(data?.file);
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
  
    .image-frame{
      width: 90px;
      height: 90px;
      padding: 5px;
      border: 2px solid rgba(0, 0, 0,0.05); 
      border-radius: 100%;
  
      border: 3px solid rgb(0, 0, 0)
      & img {
        width: 100%;
        height: auto;
      }
    }


    .change-picture-container {
    border: 2px solid rgba(0, 0, 0,0.05); 
    // border: 4px solid var(--bg-content);
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
</style>
  