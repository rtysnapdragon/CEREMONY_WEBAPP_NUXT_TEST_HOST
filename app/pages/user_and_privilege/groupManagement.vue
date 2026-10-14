<template>
  <RWrapperPage>
    <OCHead :title="$t('group_management')" />
    <OCIframe path="/GroupManagement" />
  </RWrapperPage>
</template>

<script setup>
const dataMenu = useMenuStore();

mounted(async () => {
  if (!dataMenu.getData.length) {
    await dataMenu.get();
  }

  dataMenu.setSelected("user_and_privilege");
});

definePageMeta({ layout: 'navbar', middleware: ['auth', 'permission'], permission: 'ROLE_VIEW' })
</script>
