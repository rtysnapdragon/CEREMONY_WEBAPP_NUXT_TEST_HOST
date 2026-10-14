# Table usage


```vue
<template>
  <div class="users-page">
    <RTYHead :title="$t('user_management')" />
    <RTable
      ref="userTable"
      :api="{ url: apiUrl, method: 'POST' }"
      :columns="columns"
      :keyTable="'user_table'"
      :options="tableOptions"
      :showTemplate="false"
      @onSelectRecord="handleSelectRecord"
      @onRowReorder="handleRowReorder"
      @reloadByFixedData="reloadTable"
    >
      <template #UserActive="{ cellData }">
        {{ console.log("C================>", cellData) }}
        <span :class="cellData ? 'text-green-600' : 'text-red-500'">
          {{ cellData ? t("active") : t("inactive") }}
        </span>
      </template>

      <template #CreatedBy="{ cellData }">
        <span>{{ cellData }}</span>
      </template>

      <template #UpdatedBy="{ cellData }">
        ------------------{{ cellData }}
        <!-- <span>{{ cellData }}</span> -->
      </template>

      <template #actions="{ row }">
        {{ row }}
        <div class="flex gap-2">
          <button
            v-for="btn in btnAction"
            :key="btn.type"
            @click="handleAction(btn.type, row)"
            :disabled="btn.disabled"
            class="px-2 py-1 rounded bg-blue-500 text-white text-xs"
          >
            <i :class="`ri-${btn.icon}-line`"></i> {{ t(btn.label) }}
          </button>
        </div>
      </template>
    </RTable>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
const { t } = useI18n();

const apiUrl = "/api/users/list";

const columns = [
  { title: t("code"), className: "min-width all", data: "UserCode" },
  { title: t("name"), className: "min-width all", data: "Name" },
  { title: t("english_name"), className: "all", data: "NameEnglish" },
  { title: t("username"), className: "min-width", data: "Username" },
  { title: t("email"), className: "min-width", data: "Email" },
  {
    title: t("gender"),
    className: "min-width",
    data: "Gender",
    render: "#Gender",
  },
  {
    title: t("user_type"),
    className: "min-width",
    data: "UserType",
    render: "#UserType",
  },
  {
    title: t("status"),
    className: "min-width",
    data: "IsActive",
    render: "#UserActive",
  },
  {
    title: t("created_by"),
    className: "min-width",
    data: null,
    render: "#CreatedBy",
  },
  {
    title: t("updated_by"),
    className: "min-width",
    data: null,
    render: "#UpdatedBy",
  },
  // { title: t("action"), className: "min-width all", data: "", render: "#Actions" },
];

const btnAction = [
  { label: "edit", type: "edit", icon: "edit", disabled: false },
  { label: "delete", type: "delete", icon: "delete", disabled: false },
  { label: "view", type: "view", icon: "view", disabled: false },
];

const tableOptions = {
  responsive: true,
  showNoData: true,
  isScroll: true,
};

const selectedRows = ref([]);
const userTable = ref();

const handleSelectRecord = (record: any) => {
  console.log("Selected record:", record);
};

const handleRowReorder = (newOrder: any) => {
  console.log("New row order:", newOrder);
};

const reloadTable = () => {
  userTable.value?.fnReload?.();
};

const handleAction = (type: string, row: any) => {
  switch (type) {
    case "edit":
      console.log("Edit", row);
      break;
    case "delete":
      console.log("Delete", row);
      break;
    case "view":
      console.log("View", row);
      break;
  }
};

definePageMeta({
  layout: "navbar",
  middleware: "auth",
});
</script>
```

---

# Usage Example

```vue
<template>
  <RTable
    :data="users"
    :columns="[
      { key: 'id', label: 'ID', className: 'width', width: 80 },
      { key: 'name', label: 'Name', className: 'min-width', minWidth: 150, priority: 10 },
      { key: 'email', label: 'Email', className: 'min-width', minWidth: 200, priority: 5 },
      { key: 'role', label: 'Role', className: 'all', minWidth: 100 },
      { key: 'status', label: 'Status', className: 'width', width: 120 },
      { key: 'actions', label: 'Actions', className: 'width', width: 100 }
    ]"
  />
</template>
```

# Key Features of This Implementation

## 1. Auto-Detection System

- Uses `ResizeObserver` to monitor actual table container width.
- Automatically recalculates when the container resizes.
- No manual breakpoint management needed.

## 2. Intelligent Column Collapse

- `all`: Always collapses to expanded row.
- `width`: Fixed width, never collapses.
- `min-width`: Collapses only when the container is too narrow.

## 3. Smart Width Distribution

- Automatically calculates minimum width required.
- Shows as many columns as fit in the container.
- Prioritizes columns using the `priority` property.

## 4. Visual Feedback

- Console logs for debugging (remove in production).
- Smooth transitions when columns collapse/expand.
- Clear visual indicators for expandable rows.