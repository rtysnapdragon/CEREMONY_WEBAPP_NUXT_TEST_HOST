<script setup>
const rtab = ref();

useHead({
  title:'RTab'
})
/* 1) v-model by index (old style, still works) */
const index = ref(0);
const basicItems = [
  { label: "Account", icon: "i-lucide-user" },
  { label: "Password", icon: "i-lucide-lock" },
  { label: "Billing", icon: "i-lucide-credit-card" },
];

/* 2) v-model by value + custom slots */
const active = ref("account");
const slotItems = [
  { label: "Account", icon: "i-lucide-user", value: "account", slot: "account" },
  { label: "Password", icon: "i-lucide-lock", value: "password", slot: "password" },
  { label: "Billing", icon: "i-lucide-credit-card", value: "billing", slot: "billing", disabled: true },
];

/* 3) route query: /page?tab=settings */
const routeItems = [
  { label: "Overview", value: "overview" },
  { label: "Settings", value: "settings" },
  { label: "Members", value: "members" },
];

const onChange = (v) => console.log("changed:", v);

</script>

<template>
  <div class="space-y-10 p-6">
    <!-- 1. basic, index based, content via #content slot -->
    <RTab v-model="index" :items="basicItems" :content="false" not-clear-route @on-change="onChange">
      <template #content="{ item, index: i }">
        <p class="py-4">Panel {{ i }} — {{ item.label }}</p>
      </template>
    </RTab>

    <!-- 2. value based, custom item slots, emits the whole item -->
    <RTab ref="rtab" v-model="active" :items="slotItems" is-object not-clear-route @on-change="onChange">
      <template #account="{ item }"><p class="py-4">{{ item.label }} form…</p></template>
      <template #password="{ item }"><p class="py-4">{{ item.label }} form…</p></template>
      <template #billing><p class="py-4">Billing</p></template>
    </RTab>
    <div class="flex gap-2">
      <UButton label="Jump to Password" size="xs" @click="rtab.jumpTo('password')" />
      <UButton label="Jump to index 0" size="xs" variant="soft" @click="rtab.jumpTo(0)" />
    </div>

    <!-- 3. synced with ?tab= (other query params are kept), link variant, no panels -->
    <RTab route-query="tab" variant="link" :items="routeItems" :content="false" />

    <!-- 4. vertical + custom colour + extra ui classes (v4 flat slots) -->
    <RTab
      :items="basicItems"
      orientation="vertical"
      not-clear-route
      class="w-56"
      :ui="{ trigger: 'justify-start', list: 'w-full' }"
      style="--rtab-active: #0ea5e9; --rtab-duration: 450ms"
    />
  </div>
</template>