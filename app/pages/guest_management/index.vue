<template>
  <RWrapperPage>
    <RContent class="animate-fade-up delay-3">
      <RTable
        :key="`guests-${guestStore.filterRsvp}-${guestStore.filterSide}-${guestStore.guests.length > 0 ? 'loaded' : 'empty'}`"
        :columns="tableColumns"
        :data="guestsToRender"
        :loading="guestStore.loading"
        :options="{ searchable: true, paging: true }"
        @reloadByFixedData="guestStore.fetchGuests()"
      >
        <template #headerRight>
          <div class="flex items-center gap-2">
            <RBtn
              type="import"
              :label="tr('import_guest')"
              icon="ri-upload-2-line"
              class="hide-mobile"
              @click="showImport = true"
            />
            <RBtn
              type="export"
              :label="tr('export_guests')"
              icon="ri-download-2-line"
              class="hide-mobile"
              @click="exportGuests"
            />
            <RBtn
              type="add"
              :label="tr('add_guest')"
              icon="ri-user-add-line"
              @click="openAddGuest"
            />
          </div>
        </template>
        <template #name="{ rowData }">
          <div class="guest-name-cell">
            <RAvatar
              :name="rowData.name"
              :src="rowData.avatar"
              size="sm"
              shape="circle"
              :online="true"
            />
            <div>
              <div class="gcn-name">{{ rowData.name }}</div>
              <div class="gcn-email">{{ rowData.email }}</div>
            </div>
          </div>
        </template>
        <template #side="{ rowData }">
          <span class="badge" :class="sideBadge(rowData.side)">{{
            rowData.side
          }}</span>
        </template>
        <template #seats="{ rowData }">
          <span>{{ rowData.seats }}</span>
        </template>
        <template #rsvp="{ rowData }">
          <span class="badge" :class="rsvpBadge(rowData.rsvp)">
            <i :class="rsvpIcon(rowData.rsvp)" />
            {{ tr(rowData.rsvp) }}
          </span>
        </template>
        <template #dietary="{ rowData }">
          <span class="text-muted" style="font-size: 0.8125rem">{{
            rowData.dietary || "—"
          }}</span>
        </template>
        <template #phone="{ rowData }">
          <span class="text-muted" style="font-size: 0.8125rem">{{
            rowData.phone || "—"
          }}</span>
        </template>
        <template #checkin="{ rowData }">
          <span
            v-if="rowData.checkedInAt"
            class="badge badge-success"
            style="font-size: 0.7rem"
          >
            <i class="ri-checkbox-circle-fill" /> Checked In
          </span>
          <span v-else class="text-muted" style="font-size: 0.8125rem">—</span>
        </template>
        <template #actions="{ rowData }">
          <RTblBtns
            :items="btnActionsList(rowData)"
            @actionClick="
              (type, action) => handleGuestAction(type, rowData, action)
            "
          />
        </template>
      </RTable>
    </RContent>

    <!-- Add / Edit Drawer -->
    <RSlider
      v-model="showModal"
      :title="editingGuest ? tr('edit_guest') : tr('add_guest')"
      icon="ri-user-add-line"
    >
      <RForm ref="guestFormRef" @onSubmit="saveGuest" >
        <div class="form-row-2">
          <RFormGroup :label="tr('name')" required>
            <RInput v-model="guestForm.name" :placeholder="tr('name')" />
          </RFormGroup>
          <RFormGroup :label="tr('phone')">
            <RInput v-model="guestForm.phone" type="tel" />
          </RFormGroup>
        </div>
        <div class="form-row-2">
          <RFormGroup :label="tr('email')">
            <RInput v-model="guestForm.email" type="email" />
          </RFormGroup>
          <RFormGroup :label="tr('gender')">
            <RSelect
              v-model="genderOption"
              pk="Value"
              :localData="{ data: GENDER_OPTS }"
              @selected="onGenderSelected"
            />
          </RFormGroup>
        </div>
        <div class="form-row-2">
          <RFormGroup :label="tr('side')">
            <RSelect
              v-model="sideOption"
              pk="Value"
              :localData="{ data: SIDE_OPTS }"
              @selected="onSideSelected"
            />
          </RFormGroup>
          <RFormGroup :label="tr('seats')">
            <RInput
              v-model.number="guestForm.seats"
              type="number"
              placeholder="1"
            />
          </RFormGroup>
        </div>
        <RFormGroup :label="tr('rsvp')">
          <RSelect
            v-model="rsvpOption"
            pk="Value"
            :localData="{ data: RSVP_OPTS }"
            @selected="onRsvpSelected"
          />
        </RFormGroup>
        <div class="form-row-2">
          <RFormGroup label="Meal Preference">
            <RInput
              v-model="guestForm.dietary"
              placeholder="vegetarian, halal..."
            />
          </RFormGroup>
          <RFormGroup :label="tr('notes')">
            <RInput v-model="guestForm.notes" :placeholder="tr('notes')" />
          </RFormGroup>
        </div>
        <RFormGroup :label="tr('address')">
          <RInput v-model="guestForm.address" :placeholder="tr('address')" />
        </RFormGroup>
      </RForm>
      <template #footer>
        <RBtn type="cancel" :label="tr('common.cancel')" @click="closeModal" />
        <RBtn
          type="save"
          :label="tr('save')"
          :icon="saving ? 'ri-loader-4-line animate-spin' : 'ri-save-line'"
          :disabled="saving"
          @click="guestFormRef.submit()"
        />
      </template>
    </RSlider>

    <!-- Import Modal -->
    <RModal v-model="showImport" :title="tr('import_guests_from_excel')">
      <div style="display: flex; flex-direction: column; gap: var(--sp-4)">
        <p class="text-muted" style="font-size: 0.875rem">
          Upload an <strong>.xlsx</strong> file. Required column:
          <code>name</code>.<br />
          Optional:
          <code
            >phone, email, sideFamily (GROOM/BRIDE/FRIEND), gender, totalGuests,
            notes</code
          >
        </p>
        <div
          class="file-drop-zone"
          :class="{ 'has-file': importFile }"
          @click="importFileRef?.click()"
        >
          <i
            class="ri-file-excel-line"
            style="font-size: 2rem; color: var(--c-success)"
          />
          <span v-if="importFile">{{ importFile.name }}</span>
          <span v-else class="text-muted">Click to select .xlsx file</span>
          <input
            ref="importFileRef"
            type="file"
            accept=".xlsx"
            style="display: none"
            @change="onFileChange"
          />
        </div>
        <!-- Upload / processing progress bar -->
        <div v-if="importing" class="import-progress-wrap">
          <div class="import-progress-header">
            <span class="import-progress-label">
              <i
                :class="
                  importTotal === 0
                    ? 'ri-upload-cloud-2-line'
                    : 'ri-loader-4-line ri-spin'
                "
                style="margin-right: 4px"
              />
              {{ importTotal === 0 ? "Uploading file…" : "Saving guests…" }}
            </span>
            <span class="import-progress-pct">
              <template v-if="importTotal > 0">
                {{ importSaved }} / {{ importTotal }}
              </template>
              <template v-else>{{ importProgress }}%</template>
            </span>
          </div>
          <div class="import-progress-track">
            <div
              class="import-progress-bar"
              :style="{ width: importProgress + '%' }"
              :class="{ 'import-progress-done': importProgress >= 100 }"
            />
          </div>
          <p class="import-progress-hint">
            <template v-if="importTotal === 0"
              >Sending file to server…</template
            >
            <template v-else-if="importProgress < 100">
              Saving {{ importSaved }} of {{ importTotal }} guests to database…
            </template>
            <template v-else>Import complete!</template>
          </p>
        </div>

        <div v-if="importResult" class="import-result">
          <div class="badge badge-muted">
            Total rows: {{ importResult.totalRows }}
          </div>
          <div class="badge badge-success">
            Imported: {{ importResult.imported }}
          </div>
          <div v-if="importResult.failed > 0" class="badge badge-danger">
            Failed: {{ importResult.failed }}
          </div>
          <ul
            v-if="importResult.errors?.length"
            style="
              font-size: 0.8rem;
              color: var(--c-danger);
              margin: 4px 0 0;
              padding-left: 1rem;
            "
          >
            <li v-for="err in importResult.errors" :key="err">
              {{ err }}
            </li>
          </ul>
        </div>
      </div>
      <template #footer>
        <RBtn
          type="cancel"
          :label="tr('cancel')"
          :disabled="importing"
          variant="outline"
          @click="
            showImport = false;
            importFile = null;
            importResult = null;
          "
        />
        <RBtn
          type="import"
          :label="tr('import')"
          :loading="importing"
          :icon="importing ? 'ri-loader-4-line' : 'ri-upload-2-line'"
          @click="doImport"
        />
      </template>
    </RModal>

    <!-- Guest Detail — bottom-to-top drawer -->
    <RDrawer
      v-model:open="showGuestDetail"
      direction="bottom"
      :title="tr('guest_detail')"
      icon="ri-user-heart-line"
      :description="selectedGuest?.name || '—'"
      height-desktop="85vh"
      height-tablet="88vh"
      height-mobile="92vh"
      class="guest-detail-drawer"
    >
      <GuestDetailCard :guest="selectedGuest" />
    </RDrawer>
  </RWrapperPage>
</template>

<script setup>
definePageMeta({
  layout: "navbar",
  middleware: ["auth", "permission"],
  permission: "VIEW_GUEST",
});

const { tr } = useTr();
const {
  guestStore,
  eventStore,
  GENDER_OPTS,
  SIDE_OPTS,
  RSVP_OPTS,
  genderOption,
  sideOption,
  rsvpOption,
  onGenderSelected,
  onSideSelected,
  onRsvpSelected,
  showModal,
  editingGuest,
  saving,
  showGuestDetail,
  selectedGuest,
  showImport,
  importFile,
  importFileRef,
  importResult,
  importing,
  importProgress,
  importTotal,
  importSaved,
  guestForm,
  guestsToRender,
  guestStats,
  rsvpFilters,
  rsvpBadge,
  rsvpIcon,
  sideBadge,
  init,
  cycleSideFilter,
  btnActionsList,
  handleGuestAction,
  openAddGuest,
  closeModal,
  saveGuest,
  confirmDelete,
  doDelete,
  onFileChange,
  doImport,
  exportGuests,
} = useGuestPage();

// ── Header via useBreadCrumb state (rendered by <RBreadCrumb> in the layout) ──
const breadcrumb = usePageBreadcrumb({
  title: tr("common.guests"),
  icon: "ri-user-add-line",
});

const guestSubtitle = computed(
  () =>
    `${guestStore.stats.total} ${tr("common.guests")} · ${guestStore.stats.confirmed} ${tr("status.confirmed")}`,
);

// Stats arrive only after the guest fetch completes, so re-sync the
// breadcrumb description reactively once the store data changes.
watch(guestSubtitle, (v) => breadcrumb.set({ description: v }), {
  immediate: true,
});

const guestFormRef = ref();

const tableColumns = computed(() => [
  { key: "name", label: tr("name"), sortable: true },
  { key: "side", label: tr("side"), sortable: true },
  { key: "seats", label: tr("seats"), align: "center" },
  { key: "rsvp", label: tr("rsvp") },
  { key: "dietary", label: tr("dietary") },
  { key: "phone", label: tr("phone") },
  { key: "checkin", label: tr("check_in") },
  { key: "notes", label: tr("note") },
  { key: "actions", label: tr("actions"), width: "110px", align: "center" },
]);

onMounted(init);
</script>

<style lang="scss">
/* ── BADGE ── */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: var(--r-full);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.badge-accent {
  background: rgba(255, 140, 66, 0.15);
  color: var(--c-accent);
  border: 1px solid rgba(255, 140, 66, 0.25);
}
.badge-success {
  background: rgba(74, 222, 128, 0.12);
  color: var(--c-success);
  border: 1px solid rgba(74, 222, 128, 0.2);
}
.badge-danger {
  background: rgba(248, 113, 113, 0.12);
  color: var(--c-danger);
  border: 1px solid rgba(248, 113, 113, 0.2);
}
.badge-info {
  background: rgba(96, 165, 250, 0.12);
  color: var(--c-info);
  border: 1px solid rgba(96, 165, 250, 0.2);
}
.badge-muted {
  background: rgba(122, 117, 133, 0.12);
  color: var(--c-muted);
  border: 1px solid rgba(122, 117, 133, 0.2);
}

.guests-page {
  display: flex;
  flex-direction: column;
  gap: var(--sp-5);
  @include mobile-only {
    gap: var(--sp-2);
  }
}

.no-wedding-banner {
  display: flex;
  align-items: center;
  gap: var(--sp-4);
  padding: var(--sp-4) var(--sp-5);
  border: 1px solid rgba(255, 140, 66, 0.25);
  background: rgba(255, 140, 66, 0.06);
  border-radius: var(--r-lg);
  flex-wrap: wrap;
  p {
    margin: 0;
  }
}

.page-heading {
  font-family: var(--font-800);
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin-bottom: 2px;
}
.page-sub {
  font-size: 0.875rem;
  color: var(--c-muted);
}
.header-btns {
  display: flex;
  gap: var(--sp-3);
  align-items: center;
}

.guest-stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--sp-4);
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @include mobile-only {
    gap: var(--sp-2);
  }
}

.gsr-card {
  padding: var(--sp-4) var(--sp-5);
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}
.gsr-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--r-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
}
.gsr-value {
  font-family: var(--font-700);
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1;
}
.gsr-label {
  font-size: 0.75rem;
  color: var(--c-muted);
  font-weight: 500;
}

.guest-filters {
  padding: var(--sp-4) var(--sp-5);
  display: flex;
  align-items: center;
  gap: var(--sp-4);
  flex-wrap: wrap;
}

.gf-search {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--c-border);
  border-radius: var(--r-full);
  padding: 7px 14px;
  flex: 1;
  min-width: 200px;
  max-width: 320px;
  transition: all var(--t-fast);
  i {
    color: var(--c-muted);
    font-size: 0.9rem;
  }
  &:focus-within {
    border-color: rgba(255, 140, 66, 0.3);
    background: rgba(255, 255, 255, 0.06);
  }
}

.gf-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  font-size: 0.8125rem;
  color: var(--c-text);
  font-family: inherit;
  &::placeholder {
    color: var(--c-muted);
  }
}
.gf-clear {
  background: none;
  border: none;
  color: var(--c-muted);
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  &:hover {
    color: var(--c-text);
  }
}
.gf-chips {
  display: flex;
  gap: var(--sp-2);
  flex-wrap: wrap;
}

.filter-chip {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: var(--r-full);
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--c-border);
  color: var(--c-muted);
  transition: all var(--t-fast);
  font-family: inherit;
  &:hover {
    background: rgba(255, 255, 255, 0.07);
    color: var(--c-text);
  }
  &.active {
    background: rgba(255, 140, 66, 0.12);
    border-color: rgba(255, 140, 66, 0.25);
    color: var(--c-accent);
  }
}

.chip-count {
  background: rgba(255, 255, 255, 0.08);
  padding: 1px 6px;
  border-radius: var(--r-full);
  font-size: 0.6875rem;
}
.gf-right {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  margin-left: auto;
}

.filter-active-dot {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 6px;
  height: 6px;
  border-radius: var(--r-full);
  background: var(--c-accent);
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-3);
  padding: var(--sp-8);
}

.guest-name-cell {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
}
.gcn-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--c-text);
}
.gcn-email {
  font-size: 0.75rem;
  color: var(--c-muted);
}

.row-actions {
  display: flex;
  gap: 4px;
  // opacity: 0;
  transition: opacity var(--t-fast);
}
// tr:hover .row-actions {
//   opacity: 1;
// }
.btn-xs-icon {
  width: 30px !important;
  height: 30px !important;
  border-radius: var(--r-sm) !important;
}

.table-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-4);
  padding: var(--sp-4) var(--sp-5);
  border-top: 1px solid var(--c-border);
  button:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
}
.page-info {
  font-size: 0.8125rem;
  color: var(--c-muted);
}

.guest-cards {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

.rsvp-options {
  display: flex;
  gap: var(--sp-2);
  flex-wrap: wrap;
}

.rsvp-opt {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: var(--r-full);
  cursor: pointer;
  font-size: 0.8125rem;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--c-border);
  color: var(--c-muted);
  transition: all var(--t-fast);
  user-select: none;
  input {
    display: none;
  }
  &:hover {
    background: rgba(255, 255, 255, 0.07);
    color: var(--c-text);
  }
  &.active {
    background: rgba(255, 140, 66, 0.12);
    border-color: rgba(255, 140, 66, 0.3);
    color: var(--c-accent);
  }
}

.file-drop-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--sp-2);
  padding: var(--sp-6);
  border-radius: var(--r-lg);
  border: 2px dashed var(--c-border);
  cursor: pointer;
  transition: all var(--t-fast);
  &:hover,
  &.has-file {
    border-color: var(--c-success);
    background: rgba(74, 222, 128, 0.05);
  }
}

.import-progress-wrap {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
  padding: var(--sp-3) var(--sp-4);
  background: rgba(255, 140, 66, 0.06);
  border: 1px solid rgba(255, 140, 66, 0.18);
  border-radius: var(--r-md);
}
.import-progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8125rem;
  color: var(--c-text);
}
.import-progress-label {
  display: flex;
  align-items: center;
  font-weight: 500;
}
.import-progress-pct {
  font-weight: 700;
  color: var(--c-accent);
  font-size: 0.9rem;
  min-width: 38px;
  text-align: right;
}
.import-progress-track {
  height: 8px;
  background: var(--c-border);
  border-radius: var(--r-full);
  overflow: hidden;
}
.import-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--c-accent), var(--c-accent-2));
  border-radius: var(--r-full);
  transition: width 0.25s ease-out;
  &.import-progress-done {
    background: linear-gradient(90deg, var(--c-success), #22c55e);
  }
}
.import-progress-hint {
  font-size: 0.775rem;
  color: var(--c-muted);
  margin: 0;
}

.import-result {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
  align-items: center;
}

.modal-enter-active,
.modal-leave-active {
  transition: all var(--t-base) var(--ease-out);
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal-panel,
.modal-leave-to .modal-panel {
  transform: scale(0.94) translateY(12px);
}
</style>
