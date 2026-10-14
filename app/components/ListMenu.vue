<template>
  <OCTooltip :text="tr(items.title)" :popper="{ placement: 'right' }"
    :prevent="!isCollapsed || (isCollapsed && modelIsCollapsed)" style="display: block">
    <NuxtLink v-if="isNotEmpty(items.href)" :to="localePath(linkTo(title, items.href))" class="navbar-menu"
      :class="{ active: checkActive(items.href) }" @click="fnClick(items)">
      <span class="text-xl image-icon" v-html="items.icon"></span>
      <span class="title-menu line-clamp-1">{{ tr(items.title) }}</span>
      <span class="vertical-line"></span>
    </NuxtLink>

    <div class="group-navbar-menu" v-else-if="isNotEmpty(items?.menu) && !isCollapsed">
      <div class="navbar-menu cursor-pointer" :class="{ active: checkActiveGroupSubMenu() }"
        @click="fnToggleCollapse()">
        <span class="text-xl image-icon" v-html="items.icon"></span>
        <span class="title-menu line-clamp-1">{{ tr(items.title) }}</span>
        <div class="btn-arrow" v-if="!isCollapsed">
          <i :class="isShowGroupCollapse
              ? 'ri-arrow-down-s-line'
              : 'ri-arrow-right-s-line'
            "></i>
        </div>
        <span class="vertical-line"></span>
      </div>
      <div class="group-list" v-if="isShowGroupCollapse && !isCollapsed">
        <NuxtLink class="nav-sub-menu" v-for="item in items?.menu" :class="{ active: checkActive(item.href) }"
          :to="localePath(linkTo(title, item.href))" @click="fnClick(item)">
          <div class="line-active"></div>
          <OCTooltip class="w-full" :text="tr(item.title)" :popper="{ placement: 'right' }">
            <div class="title-menu">
              {{ tr(item.title) }}
            </div>
          </OCTooltip>
        </NuxtLink>
      </div>
    </div>

    <OCPopover class="color-bg-content" closeDelay="100" mode="hover" v-model="modelIsCollapsed"
      v-if="isNotEmpty(items?.menu) && isCollapsed">
      <template #trigger>
        <div class="navbar-menu cursor-pointer" :class="{ active: checkActiveGroupSubMenu() }">
          <span class="text-xl image-icon" :class="modelIsCollapsed ? 'color-primary' : ''" v-html="items.icon"></span>
          <span class="vertical-line"></span>
        </div>
      </template>
      <div class="group-list">
        <div class="navbar-menu">
          <span class="text-xl image-icon" v-html="items.icon"></span>
          <span class="title-menu">{{ tr(items.title) }}</span>
        </div>
        <NuxtLink class="nav-sub-menu" v-for="item in items?.menu" :class="{ active: checkActive(item.href) }"
          :to="localePath(linkTo(title, item.href))" @click="fnClick(item)">
          <div class="line-active"></div>
          <div class="title-menu">{{ tr(item.title) }}</div>
        </NuxtLink>
      </div>
    </OCPopover>
  </OCTooltip>
</template>

<script setup>
const props = defineProps(["items", "title", "isCollapsed"]);
const items = computed(() => {
  return props.items;
});
const title = computed(() => {
  return props.title;
});
const isCollapsed = computed(() => props.isCollapsed);
const emit = defineEmits(["clicked"]);
const router = useRouter();
const isShowGroupCollapse = ref(false);
const modelIsCollapsed = ref(false);

function checkActive(href) {
  if (isEmpty(href)) return;
  let menu = href.toLowerCase().replace(/\/$/, "").replace(/^\/+/, "");
  let arrPath = router.currentRoute.value.path
    .replace(/\/$/, "")
    .split("/")
    .map((d) => d.toLowerCase());
  let isActive = arrPath.includes(menu);
  return isActive;
}

function checkActiveGroupSubMenu() {
  if (isNotEmpty(items.value?.menu)) {
    let currentPath = router.currentRoute.value.path
      .replace(/\/$/, "")
      .split("/")
      .map((d) => d.toLowerCase());
    let subMenu = items.value?.menu;
    let isActive = isNotEmpty(
      subMenu.filter((s) =>
        currentPath.some(
          (p) =>
            s.href.toLowerCase().replace(/\/$/, "").replace(/^\/+/, "") == p
        )
      )
    );
    return isActive;
  }
}

onMounted(() => {
  checkActiveGroupSubMenu();
  getLocalShowGroupMenu();
});

function fnToggleCollapse() {
  isShowGroupCollapse.value = !isShowGroupCollapse.value;
  localStorage.setItem(
    "isShowGroupCollapse",
    `${items.value.title}:${isShowGroupCollapse.value}`
  );
}

function getLocalShowGroupMenu() {
  let local = localStorage?.getItem("isShowGroupCollapse")?.split(":");
  if (isEmpty(local)) return;
  if (items.value.title == local[0] && local[1] == "true")
    isShowGroupCollapse.value = true;
}

const ocTableStore = useOCTableDataStore();
const ocChipStore = useRChipDataStore();
const ocSlideStore = useOCSlideDataStore();

const { config } = helper();
const { tr } = useTr()
const { locale } = useI18n()

function fnClick(data) {
  emit("clicked");
  ocTableStore.clearAllData();
  ocChipStore.clearAllData();
  ocSlideStore.clearAllData();

  sessionStorage.setItem("navbarTitle", data.title)
  useHead({
    title: `${tr(data.title)} | ${config.appName}`,
    meta: [
      { property: 'og:title', content: `${tr(data.title)} ${config.appName}` },
      { name: 'twitter:title', content: `${tr(data.title)} ${config.appName}` },
      { property: 'lang', content: locale },
      { name: 'twitter:card', content: 'summary_large_image' },
    ].filter(Boolean), // removes `false` entries
  });
}

function linkTo(link, href) {
  return `/${link}${href}`;
}
</script>

<style lang="scss" scoped>
.group-navbar-menu {
  overflow: hidden;
  width: calc(100% - 24px);

  .btn-arrow {
    position: absolute;
    font-size: 15px;
    right: 0px;
  }
}

.group-list {
  display: flex;
  flex-direction: column;
  padding: 0px 33px;
  animation: show_group_list 0.3s ease-in-out;
  opacity: 1;

  @keyframes show_group_list {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }

  .nav-sub-menu {
    height: 40px;
    display: flex;
    grid-gap: 25px;
    align-items: center;
    cursor: pointer;
    transition: 0.25s ease-in-out;
    font-size: 15px;
    position: relative;
    border-left: 1px solid var(--color-w-b-4);

    .title-menu {
      margin-left: 25px !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      white-space: nowrap !important;
      // max-width: 150px !important;
      width: calc(100% - 30px);
    }

    .line-active {
      position: absolute;
      width: 1px;
      border-radius: 4px;
      height: 22px;
      left: -1px;
    }

    &:hover {
      color: var(--color-primary);
    }

    &.router-link-active,
    &.active {
      .line-active {
        background: var(--color-primary);
      }
    }
  }
}

.is-collapsed {
  .group-list {
    padding: 10px 16px !important;

    .navbar-menu {
      padding: 0px 0px;
      height: 18px;
      min-height: 18px;
      margin-left: -9px;
      margin-bottom: 15px;

      .title-menu {
        opacity: 1 !important;
        visibility: visible !important;
      }
    }

    .nav-sub-menu {
      .title-menu {
        opacity: 1 !important;
        visibility: visible;
      }
    }
  }
}
</style>
