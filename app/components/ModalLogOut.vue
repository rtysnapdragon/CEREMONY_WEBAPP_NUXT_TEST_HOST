<template>
  <div class="mr-[-7px] cursor-pointer">
    <UPopover :popper="{ placement: 'bottom-end' }"
      :ui="{ ring: '', container: 'z-[200]', background: '', rounded: '!rounded-[18px]' }">
      <RTooltip :text="dataUser.getData.LoginName">
        <div :class="`flex justify-center items-center p-[3px] rounded-full border`">
          <img :src="imagePath??defaultImg" @error="fnErrorImg" class="rounded-full aspect-square w-full h-full object-cover" />
        </div>
      </RTooltip>

      <template #panel="{ close }">
        <div class="modal-logout-container color-bg-content">
          <div class="modal-logout-bg bg-primary"></div>

          <div class="nav-profile-user">
            <RUploadProfile v-model="imagePath" :loading="loading" gender="transparent" iconSize="sm" @onDone="getFileFromUpload"
              @onDelete="fnDeleteImage" />
            <div class="group-user-info">
              <div class="flex flex-col">
                <div class="text-center font-semibold text-[15px] color-w-b-1">
                  {{ dataUser.getData.FirstName }}
                  {{ dataUser.getData.LastName }}
                </div>
                <div class="text-center font-normal text-[12px] color-w-b-2">
                  @{{ dataUser.getData.LoginName }}
                </div>
              </div>
            </div>

            <div class="group-actions">
              <slot />
              <NuxtLink class="nav-menu-action hover-to-color-primary" :to="localePath('/profile')" @click="close"><i
                  class="ri-settings-line"></i><span>{{ tr("manage_profile") }}</span></NuxtLink>
              <NuxtLink class="nav-menu-action hover-to-color-primary" @click="actionLogOut"><i
                  class="ri-arrow-left-circle-line"></i><span>{{ tr("logout") }}</span></NuxtLink>
            </div>
          </div>
        </div>
      </template>
    </UPopover>
  </div>
</template>

<script setup>
const { tr } = useTr()
import defaultImg from "/images/profile_male.png";
const { str, config } = helper();

function fnErrorImg(event) {
  event.target.src = defaultImg;
}

const props = defineProps(["open", "layoutType"]);
const emit = defineEmits(["update:open"]);
const dataUser = useUserProfileStore();
console.log("urt ---------z. ",dataUser)
const userCatch = useCookie("rty_user_data");

const imagePath = computed(() => {
  console.log('imagePath >>', typeof dataUser.getData.ImagePath)
  if (isNotEmpty(dataUser.getData.ImagePath)) {
    if (typeof dataUser.getData.ImagePath == 'string') {
      return getUrl(dataUser.getData.ImagePath, true)
    }
    return undefined
  }
  return undefined
})

function actionLogOut() {
  userCatch.value = null;
  // useAuthorizeIframe({
  //   action: "clear_authorize_cookie",
  //   data: {
  //     sameSite: config.sameSite,
  //   },
  // });

  navigateTo(localePath("/auth/login"));
}

const inputFile = ref(null);
const uploadProfile = ref(false);
const loading = ref(false)

const getFileFromUpload = async (data) => {
  if (data) {
    loading.value = true
    dataUser.getData.Image = data;
    dataUser.getData.IsChangeImage = true;
    await dataUser.updatedProfile(dataUser.getData);
    loading.value = false
  }
};

const fnDeleteImage = async () => {
  loading.value = true
  dataUser.getData.Image = [];
  dataUser.getData.IsChangeImage = true;
  await dataUser.updatedProfile(dataUser.getData);
  loading.value = false
}
</script>

<style lang="scss" scoped>
.border {
  border: 1px solid var(--color-w-b-1);
  width: 26px;
  height: 26px;
}

.modal-logout-container {
  position: relative;
  background-color: var(--c-surface);
  display: flex;
  flex-direction: column;
  width: 216px;
  border-radius: 18px;
  overflow: hidden;

  .modal-logout-bg {
    height: 80px;
  }
}

.nav-profile-user {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: -20px;

  .group-user-info {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .picture-profile {
    width: 90px;
    height: 90px;
    display: flex;
    justify-content: end;
    align-items: end;
    border-radius: 100%;
    background: var(--bg-content);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
      padding: 6px;
    }
  }

  .group-actions {
    width: 100%;
    display: flex;
    flex-direction: column;
    grid-gap: 16px;
    padding: 20px 30px 28px 30px;

    .nav-menu-action {
      display: flex;
      align-items: center;
      grid-gap: 10px;
      color: var(--color-w-b-2);
      transition: 0.25s ease-in-out !important;

      i {
        font-size: 14px;
        line-height: 14px;
      }

      span {
        font-size: 13px !important;
        line-height: 13px !important;
      }

      &:hover {
        color: var(--color-primary);
      }
    }
  }

  .change-picture-container {
    border: 4px solid var(--bg-content);
    background: var(--c-surface);
    color: var(--color-w-b-1);
    border-radius: 100%;
    width: 35px;
    height: 35px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: 0.25s ease-in-out;

    &:hover {
      color: var(--color-primary);
    }
  }
}
</style>
