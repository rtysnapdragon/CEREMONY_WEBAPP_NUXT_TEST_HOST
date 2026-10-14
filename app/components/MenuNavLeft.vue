<template>
  <div :class="`navbar-left ${isCollapsed ? 'is-collapsed' : ''}`">
    <div class="navbar-header">
      <Logo
        type="navbar"
        :class="delayShowLogo ? 'opacity-0' : ''"
        :isCollapsed="isCollapsed"
      />
      <OCTooltip
        :text="tr('small_sidebar')"
        v-if="!isCollapsed"
        placement="right"
        class="btn-collapse-for-pc"
      >
        <BtnCollapse @click="showCollapsed" toSmall />
      </OCTooltip>
      <div class="btn-collapse-for-mobile">
        <BtnCollapse toSmall @click="modal = false" />
      </div>
    </div>
    <div
      class="navbar-container sidebar-scroll"
      v-if="!dataMenu.getSelectedData.length"
    >
      <OCTooltip
        :text="tr('large_sidebar')"
        v-if="isCollapsed"
        placement="right"
      >
        <div class="navbar-menu cursor-pointer" @click="showCollapsed">
          <span class="text-xl image-icon ml-[1.5px]">
            <BtnCollapse />
          </span>
          <span class="title-menu line-clamp-1"></span>
        </div>
      </OCTooltip>

      <NuxtLink
        v-if="!isCollapsed"
        :to="!mt.isLayoutMT ? localePath('/') : localePath('/moduleTeacher')"
        class="navbar-menu"
      >
        <span class="text-xl image-icon"><i class="ri-apps-2-line"></i></span>
        <span class="title-menu line-clamp-1">{{ tr("menu") }}</span>
      </NuxtLink>

      <OCTooltip
        v-if="isCollapsed"
        :text="tr('menu')"
        :popper="{ placement: 'right' }"
        style="display: block"
      >
        <NuxtLink
          :to="!mt.isLayoutMT ? localePath('/') : localePath('/moduleTeacher')"
          class="navbar-menu"
        >
          <span class="text-xl image-icon"><i class="ri-apps-2-line"></i></span>
          <span class="title-menu line-clamp-1">{{ tr("menu") }}</span>
        </NuxtLink>
      </OCTooltip>
    </div>
    <div
      class="navbar-container sidebar-scroll"
      v-if="isNotEmpty(dataMenu.getSelectedData)"
      v-for="items in dataMenu.getSelectedData"
    >
      <OCTooltip
        :text="tr('large_sidebar')"
        v-if="isCollapsed"
        placement="right"
      >
        <div class="navbar-menu cursor-pointer" @click="showCollapsed">
          <span class="text-xl image-icon ml-[1.5px]">
            <BtnCollapse />
          </span>
          <span class="title-menu line-clamp-1"></span>
        </div>
      </OCTooltip>
      <!--
      <NuxtLink v-if="!isCollapsed" :to="!mt.isLayoutMT ? localePath('/') : localePath('/moduleTeacher')"
        class="navbar-menu">
        <span class="text-xl image-icon"><i class="ri-apps-2-line"></i></span>
        <span class="title-menu line-clamp-1">{{ tr("menu") }}</span>
      </NuxtLink> -->

      <!-- <OCTooltip v-if="isCollapsed" :text="tr('menu')" :popper="{ placement: 'right' }" style="display: block">
        <NuxtLink :to="!mt.isLayoutMT ? localePath('/') : localePath('/moduleTeacher')" class="navbar-menu">
          <span class="text-xl image-icon"><i class="ri-apps-2-line"></i></span>
          <span class="title-menu line-clamp-1">{{ tr("menu") }}</span>
        </NuxtLink>
      </OCTooltip> -->

      <div :class="`navbar-menu-title ${items.noTitle ? '!hidden' : ''}`">
        <OCTooltip
          class="title-menu line-clamp-1"
          :text="tr(items.title)"
          placement="right"
        >
          {{ tr(items.title) }}
        </OCTooltip>
      </div>

      <!-- no data list menu -->
      <div
        v-if="!dataMenu.getData.length && !isCollapsed"
        class="navbar-menu-title"
      >
        <span class="title-menu line-clamp-1">No list menu to show</span>
      </div>
      <div v-if="dataMenu.getData.length">
        <ListMenu
          :isCollapsed="isCollapsed"
          v-for="item in items.menu"
          :items="item"
          :title="items.title"
          @clicked="modal = false"
        />
      </div>
    </div>

    <div
      class="nav-sidebar-footer select-none"
      :class="!isCollapsed ? 'add-anima-show' : ''"
    >
      <!-- <SwitchDatabase /> -->
      <!-- <ClassMT :prevent="isCollapsed" />
      <AccountingPeriod :prevent="isCollapsed" /> -->
    </div>
  </div>
</template>

<script setup>
const { tr } = useTr();
import { onMounted } from "vue";

const { str, config } = helper();
const route = useRoute();
const dataMenu = useMenuStore();
const mt = useMT();
const delayShowLogo = ref(false);

const props = defineProps(["isCollapsed", "isForMobile"]);
const modal = defineModel();
const isCollapsed = computed(() => props.isCollapsed);
const emit = defineEmits(["showCollapsed"]);
function setWidthHeightFromConfig() {
  const navLeftHeight = !isCollapsed.value ? (config.navLeftHeight ?? 66) : 66;
  document.documentElement.style.setProperty(
    "--height-navbar-header",
    `${navLeftHeight}px`,
  );
}
function showCollapsed() {
  delayShowLogo.value = true;
  setTimeout(() => {
    delayShowLogo.value = false;
  }, 100);
  emit("showCollapsed");
}

function switchBranch() {
  navigateTo(localePath(`/switchdatabase?next=${route.fullPath}`));
}
onMounted(() => {
  setWidthHeightFromConfig();
});
</script>
<style lang="scss">
.switch-icon-db {
  margin-bottom: 24px;
  height: 44px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.btn-collapse-for-mobile {
  display: none;
}

@media (max-width: 768px) {
  .btn-collapse-for-pc {
    display: none;
  }

  .btn-collapse-for-mobile {
    display: flex;
  }
}
</style>
