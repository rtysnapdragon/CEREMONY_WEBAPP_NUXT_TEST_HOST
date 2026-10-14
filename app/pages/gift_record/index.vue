<template>
  <RWrapperPage>
    <!-- Stats -->
    <div class="gift-stats-row animate-fade-up delay-1">
      <div v-for="stat in giftStats" :key="stat.key" class="gsr-card">
        <div
          class="gsr-icon"
          :style="{ background: stat.bg, color: stat.color }"
        >
          <i :class="stat.icon" />
        </div>
        <div class="gsr-value" :style="{ color: stat.color }">
          {{ stat.value }}
        </div>
        <div class="gsr-label">{{ stat.label }}</div>
      </div>
    </div>

    <RContent>
    <RTable
      :key="`gifts-${giftStore.gifts.length > 0 ? 'loaded' : 'empty'}`"
      :columns="giftColumns"
      :data="filteredGifts"
      :options="{ searchable: false, paging: true }"
      @reloadByFixedData="giftStore.fetchGifts(0)"
    >
      <template #headerRight
        ><div class="flex items-center w-full gap-4">
          <NuxtLink to="/gift_record/quick" class="qg-nav-btn">
            <i class="ri-flashlight-line" />
            Quick Gift
          </NuxtLink>
          <RBtn
            type="add"
            icon="add"
            :label="tr('gifts.add_gift')"
            @click="openAdd"
          /></div
      ></template>
      <template #guestName="{ rowData }">
        <div class="guest-cell">
          <RAvatar :src="rowData.avatar" size="sm" />
          <span class="guest-name">{{ rowData.guestName }}</span>
        </div>
      </template>
      <template #type="{ rowData }">
        <span
          class="badge"
          :class="rowData.type === 'cash' ? 'badge-success' : 'badge-info'"
        >
          <i
            :class="
              rowData.type === 'cash'
                ? 'ri-money-dollar-circle-line'
                : 'ri-gift-line'
            "
          />
          {{
            rowData.type === "cash" ? tr("gifts.cash") : tr("gifts.non_cash")
          }}
        </span>
      </template>
      <template #amount="{ rowData }">
        <span v-if="rowData.type === 'cash'" class="amount-val"
          >${{ rowData.amount?.toLocaleString() }}</span
        >
        <span v-else class="text-muted" style="font-size: 0.8125rem">{{
          rowData.description || "—"
        }}</span>
      </template>
      <template #receivedAt="{ rowData }">
        <span class="text-muted" style="font-size: 0.8125rem">{{
          formatGiftDate(rowData.receivedAt)
        }}</span>
      </template>
      <template #actions="{ rowData }">
        <RTblBtns
          :items="[
            { type: 'edit', icon: 'edit', label: tr('common.edit') },
            { type: 'delete', icon: 'delete', label: tr('common.delete') },
          ]"
          @action-click="
            (action, rowData) => {
              action.type === 'edit'
                ? openEdit(rowData)
                : actionDelete(rowData);
            }
          "
        />
      </template>
    </RTable>
    </RContent>

    <!-- Add / Edit Drawer -->
    <RSlider
      v-model="showModal"
      :title="editingGift ? tr('gifts.edit_gift') : tr('gifts.add_gift')"
      icon="ri-gift-line"
      width-desktop="520px"
      width-tablet="92vw"
      @close="closeModal"
    >
      <RForm
        id="gift-form"
        class="drawer-form"
        novalidate
        @submit.prevent="saveGift"
      >
        <RFormGroup :label="tr('gifts.gift_type')">
          <RRadios
            v-model="giftForm.priority"
            :options="[
              {
                label: tr('gifts.cash'),
                value: 'cash',
                icon: 'ri-money-dollar-circle-line',
              },
              {
                label: tr('gifts.non_cash'),
                value: 'non_cash',
                icon: 'ri-gift-line',
              },
            ]"
            @onChange="
              (e) => {
                e.value == 'cash'
                  ? (giftForm.type = 'cash')
                  : (giftForm.type = 'item');
              }
            "
          >
            <template #label="{ option }">
              <span class="priority-label">
                <i :class="option.icon" />
                {{ option.label }}
              </span>
            </template>
          </RRadios>
        </RFormGroup>
        <div class="form-row-2">
          <RFormGroup :label="tr('gifts.gifted_by')">
            <RInput v-model="giftForm.guestName" placeholder="Guest name" />
          </RFormGroup>
          <RFormGroup
            :label="tr('gifts.gift_amount') + '(USD)'"
            v-if="giftForm.type === 'cash'" required
          >
            <RInput
              v-model.number="giftForm.amount"
              type="number"
              placeholder="0.00"
            />
          </RFormGroup>
        </div>
        <RFormGroup :label="tr('gifts.gift_description')">
          <RInput
            v-model="giftForm.description"
            :placeholder="
              giftForm.type === 'cash'
                ? 'Optional note'
                : 'e.g. Crystal vase set'
            "
          />
        </RFormGroup>
        <RFormGroup :label="tr('gifts.gift_date')">
          <RDateInputPicker v-model="giftForm.receivedAt" />
        </RFormGroup>
        <AIAutoTranslateCheckbox v-model="autoTranslate" />
      </RForm>
      <template #footer>
        <RBtn
          type="cancel"
          icon="cancel"
          :label="tr('common.cancel')"
          @click="closeModal"
          :disabled="saving"
        />
        <RBtn
          type="save"
          :icon="saving ? 'ri-loader-4-line' : 'save'"
          :label="tr('common.save')"
          @click="saveGift"
          :disabled="saving"
        />
      </template>
    </RSlider>
  </RWrapperPage>
</template>

<script setup>
definePageMeta({
  layout: "navbar",
  middleware: ["auth", "permission"],
  title: "gifts.title",
  permission: "VIEW_FINANCE",
});

const {
  giftStore,
  searchQuery,
  typeFilter,
  showModal,
  editingGift,
  saving,
  autoTranslate,
  deletingGift,
  deleting,
  giftForm,
  typeFilters,
  giftColumns,
  giftStats,
  filteredGifts,
  formatGiftDate,
  init,
  tr,
  openAdd,
  openEdit,
  closeModal,
  saveGift,
  confirmDelete,
  doDelete,
} = useGiftPage();

const confirm = useConfirmStore();

onMounted(init);

const actionDelete = (rowData) => {
  deletingGift.value = rowData;
  confirmDelete();

  confirm.show({
    type: "delete",
    title: tr("gifts.delete_gift_record"),
    description: h(
      "p",
      {
        style: "margin-bottom:var(--sp-5);color:var(--c-muted)",
      },
      [
        tr("gifts.delete_gift_from"),
        h("strong", {}, deletingGift.value?.guestName || ""),
        deletingGift.value?.type === "cash"
          ? ` ($${deletingGift.value?.amount?.toLocaleString("en-US")})`
          : "",
        tr("common.cannot_be_undone"),
      ],
    ),
    onConfirm: async () => {
      await doDelete(rowData);
    },
  });
};
</script>

<style lang="scss">
.gifts-page {
  display: flex;
  flex-direction: column;
  gap: var(--sp-5);
}

/* ---------- Stat row (matches budget dashboard's stat-card) ---------- */
.gift-stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--sp-3);
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
}
.gsr-card {
  background: var(--c-surface) !important;
  backdrop-filter: none !important;
  box-shadow: none !important;
  // border: 1px solid var(--c-border);
  border-radius: var(--r-md);
  padding: var(--sp-4) var(--sp-5);
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
  min-width: 0;
}
.gsr-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--r-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.0625rem;
}
.gsr-value {
  font-family: var(--font-700);
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1;
}
.gsr-label {
  font-size: 0.75rem;
  color: var(--c-muted);
  font-weight: 500;
}

/* ---------- Data table cells ---------- */
.guest-cell {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
}
.guest-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--c-text);
}
.amount-val {
  font-weight: 700;
  color: var(--c-success);
  font-size: 0.9rem;
}
.row-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity var(--t-fast);
}
tr:hover .row-actions {
  opacity: 1;
}
.btn-xs-icon {
  width: 30px !important;
  height: 30px !important;
  border-radius: var(--r-sm) !important;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--sp-4) var(--sp-5);
  border-top: 1px solid var(--c-border);
  flex-wrap: wrap;
  gap: var(--sp-3);
}
.footer-stats {
  display: flex;
  gap: var(--sp-5);
  font-size: 0.8125rem;
  color: var(--c-muted);
}
.table-pagination {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  button:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
}

.live-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--c-success);
  margin-left: 8px;
  vertical-align: middle;
}
.live-dot-sm {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--c-success);
  animation: pulse-live 1.5s infinite;
  display: inline-block;
}
@keyframes pulse-live {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(0.8);
  }
}
/* ---------- Quick Gift nav link (now its own page) ---------- */
.qg-nav-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--r-md);
  // border: 1px solid var(--c-border);
  background: color-mix(in srgb, var(--c-accent) 8%, transparent);
  color: var(--c-accent);
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  transition: background var(--t-fast);
  &:hover {
    background: color-mix(in srgb, var(--c-accent) 16%, transparent);
  }
}
</style>
