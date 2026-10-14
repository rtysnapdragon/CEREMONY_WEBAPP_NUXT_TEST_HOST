<template>
  <RWrapperPage class="checkin-page">
    <RPageHeader
      title="Guest Check-In"
      :subtitle="`${checkinStore.logs.length} guests checked in`"
    >
      <template #actions>
        <button
          class="btn-primary"
          :disabled="!eventStore.activeEvent"
          @click="openManual"
        >
          <i class="ri-user-add-line" /> Manual Check-In
        </button>
      </template>
    </RPageHeader>

    <!-- No event selected -->
    <div
      v-if="!eventStore.activeEvent"
      class="glass-card empty-state animate-fade-up"
    >
      <div class="empty-icon"><i class="ri-qr-scan-2-line" /></div>
      <h3>No event selected</h3>
      <p>Select an event from the sidebar to manage check-in.</p>
    </div>

    <template v-else>
      <!-- Stats -->
      <div class="checkin-stats animate-fade-up delay-1">
        <div class="ci-stat glass-widget">
          <div class="ci-stat-icon is-success">
            <i class="ri-user-follow-fill" />
          </div>
          <div class="ci-stat-body">
            <div class="ci-stat-val">{{ checkinStore.logs.length }}</div>
            <div class="ci-stat-label">Checked in</div>
          </div>
        </div>
        <div class="ci-stat glass-widget">
          <div class="ci-stat-icon is-accent">
            <i class="ri-qr-code-fill" />
          </div>
          <div class="ci-stat-body">
            <div class="ci-stat-val">{{ qrCount }}</div>
            <div class="ci-stat-label">Via QR code</div>
          </div>
        </div>
        <div class="ci-stat glass-widget">
          <div class="ci-stat-icon is-info">
            <i class="ri-hand-coin-fill" />
          </div>
          <div class="ci-stat-body">
            <div class="ci-stat-val">{{ manualCount }}</div>
            <div class="ci-stat-label">Manual</div>
          </div>
        </div>
      </div>

      <!-- Main grid: scanner on the left, log on the right -->
      <div class="checkin-grid">
        <aside class="glass-card qr-card animate-fade-up delay-2">
          <div class="qr-card-header">
            <div class="qr-card-icon"><i class="ri-qr-scan-2-line" /></div>
            <div>
              <h3>QR code check-in</h3>
              <p class="qr-desc">
                Paste or scan a guest's code to check them in.
              </p>
            </div>
          </div>

          <div class="qr-input-stack">
            <RInput
              v-model="qrCode"
              placeholder="Paste QR code here…"
              leading-icon="ri-qr-code-line"
              class="qr-input"
              @keyup.enter="checkinByQr"
            />
            <button
              class="btn-primary qr-submit"
              :disabled="!qrCode || checkinStore.scanning"
              @click="checkinByQr"
            >
              <i
                v-if="checkinStore.scanning"
                class="ri-loader-4-line animate-spin"
              />
              <i v-else class="ri-checkbox-circle-line" />
              Check in
            </button>
          </div>

          <Transition name="fade-up">
            <div
              v-if="qrResult"
              class="qr-result"
              :class="qrResult.success ? 'qr-ok' : 'qr-err'"
              role="status"
              aria-live="polite"
            >
              <i
                :class="
                  qrResult.success
                    ? 'ri-checkbox-circle-fill'
                    : 'ri-error-warning-fill'
                "
              />
              <span>{{ qrResult.message }}</span>
            </div>
          </Transition>

          <div class="qr-divider"><span>or</span></div>

          <button class="btn-ghost qr-manual" @click="openManual">
            <i class="ri-user-search-line" /> Find a guest by name
          </button>
        </aside>

        <section class="glass-card log-card animate-fade-up delay-3">
          <header class="log-head">
            <div class="log-title">
              <h3>Check-in log</h3>
              <span class="log-count">{{ checkinStore.logs.length }}</span>
            </div>
            <button
              class="btn-icon"
              title="Refresh log"
              aria-label="Refresh log"
              @click="checkinStore.fetchLogs()"
            >
              <i
                class="ri-refresh-line"
                :class="{ 'animate-spin': checkinStore.loading }"
              />
            </button>
          </header>

          <RTable
            :key="`checkin-${checkinStore.logs.length > 0 ? 'loaded' : 'empty'}`"
            :columns="tableColumns"
            :data="checkinStore.logs"
            :loading="checkinStore.loading && checkinStore.logs.length === 0"
            :options="{ searchable: false, paging: false }"
            @reloadByFixedData="checkinStore.fetchLogs()"
          >
            <template #guest="{ rowData }">
              <div class="guest-cell">
                <div class="mini-avatar">
                  {{ (rowData.guestName?.[0] ?? "?").toUpperCase() }}
                </div>
                <span class="guest-name">{{
                  rowData.guestName || `Guest #${rowData.guestId}`
                }}</span>
              </div>
            </template>
            <template #method="{ rowData }">
              <span
                class="badge"
                :class="
                  rowData.checkinMethod === 'QR' ? 'badge-accent' : 'badge-info'
                "
              >
                <i
                  :class="
                    rowData.checkinMethod === 'QR'
                      ? 'ri-qr-code-line'
                      : 'ri-hand-coin-line'
                  "
                />
                {{ rowData.checkinMethod }}
              </span>
            </template>
            <template #device="{ rowData }">
              <span class="cell-muted">{{ rowData.deviceInfo || "—" }}</span>
            </template>
            <template #time="{ rowData }">
              <span class="cell-muted">{{
                formatCheckinTime(rowData.checkinTime)
              }}</span>
            </template>
          </RTable>
        </section>
      </div>
    </template>

    <!-- Manual check-in drawer -->
    <RSlider
      v-model="showManual"
      title="Manual Check-In"
      icon="ri-user-follow-line"
      width-desktop="480px"
      width-tablet="92vw"
      @close="closeManual"
    >
        <div class="drawer-form">
          <div class="form-group">
            <label class="input-label"
              >Search guest <span class="required-star">*</span></label
            >
            <div class="ci-search-wrap">
              <RInput
                v-model="guestSearch"
                leading-icon="ri-search-line"
                placeholder="Type guest name…"
                autocomplete="off"
                @on-input="onGuestSearch"
                @keydown.escape="guestResults = []"
              />
              <div v-if="guestResults.length" class="ci-guest-dropdown">
                <button
                  v-for="g in guestResults"
                  :key="g.id"
                  type="button"
                  class="ci-guest-item"
                  @mousedown.prevent="selectGuest(g)"
                >
                  <div class="mini-avatar">
                    {{ (g.name?.[0] ?? "?").toUpperCase() }}
                  </div>
                  <div>
                    <div class="ci-guest-name">{{ g.name }}</div>
                    <div class="ci-guest-meta">
                      {{ g.status }} · {{ g.totalGuests }} seat(s)
                    </div>
                  </div>
                </button>
              </div>
            </div>
            <div v-if="selectedGuest" class="ci-selected-guest">
              <div class="mini-avatar">
                {{ (selectedGuest.name?.[0] ?? "?").toUpperCase() }}
              </div>
              <div class="ci-selected-info">
                <div class="ci-guest-name">{{ selectedGuest.name }}</div>
                <div class="ci-guest-meta">{{ selectedGuest.status }}</div>
              </div>
              <button
                class="btn-icon btn-xs-icon"
                aria-label="Clear guest"
                @click="
                  selectedGuest = null;
                  guestSearch = '';
                "
              >
                <i class="ri-close-line" />
              </button>
            </div>
          </div>
          <div class="form-group">
            <label class="input-label">Device info</label>
            <RInput
              v-model="manualDevice"
              placeholder="e.g. iPad at entrance"
              leading-icon="ri-device-line"
            />
          </div>
        </div>
      <template #footer>
        <div class="drawer-footer-btns">
          <RBtn type="cancel" :label="tr('cancel')" @click="closeManual" />
          <RBtn
            type="save"
            :loading="checkinStore.loading"
            :label="tr('check_in')"
            :disabled="!selectedGuest || checkinStore.loading"
            @click="doManualCheckin"
          />
        </div>
      </template>
    </RSlider>
  </RWrapperPage>
</template>

<script setup>
const { tr } = useTr()
definePageMeta({ layout: 'navbar', middleware: ['auth', 'permission'], permission: 'CHECKIN_GUEST' })

const {
  checkinStore,
  eventStore,
  qrCode,
  qrResult,
  showManual,
  manualDevice,
  guestSearch,
  guestResults,
  selectedGuest,
  qrCount,
  manualCount,
  init,
  formatCheckinTime,
  checkinByQr,
  onGuestSearch,
  selectGuest,
  openManual,
  closeManual,
  doManualCheckin,
} = useCheckinPage();

const tableColumns = [
  { key: "guest", label: "Guest" },
  { key: "method", label: "Method", width: "120px" },
  { key: "device", label: "Device" },
  { key: "time", label: "Time", width: "160px" },
];

onMounted(init);
</script>

<style lang="scss">
.checkin-page {
  display: flex;
  flex-direction: column;
  gap: var(--sp-5);
}

/* ── Stats ───────────────────────────────────────────── */
.checkin-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--sp-4);
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: var(--sp-3);
  }
}
.ci-stat {
  padding: var(--sp-4) var(--sp-5);
  display: flex;
  align-items: center;
  gap: var(--sp-4);
}
.ci-stat-icon {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: var(--r-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  &.is-success {
    background: rgba(74, 222, 128, 0.12);
    color: var(--c-success);
  }
  &.is-accent {
    background: rgba(255, 140, 66, 0.12);
    color: var(--c-accent);
  }
  &.is-info {
    background: rgba(96, 165, 250, 0.12);
    color: var(--c-info);
  }
}
.ci-stat-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.ci-stat-val {
  font-family: var(--font-700);
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1.1;
}
.ci-stat-label {
  font-size: 0.75rem;
  color: var(--c-muted);
}

/* ── Main grid ───────────────────────────────────────── */
.checkin-grid {
  display: grid;
  grid-template-columns: minmax(300px, 380px) minmax(0, 1fr);
  gap: var(--sp-5);
  align-items: start;
  @media (max-width: 1024px) {
    grid-template-columns: minmax(0, 1fr);
  }
}

/* QR card */
.qr-card {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
  position: sticky;
  top: var(--sp-5);
  @media (max-width: 1024px) {
    position: static;
  }
}
.qr-card-header {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-3);
  h3 {
    font-family: var(--font-700);
    font-size: 1rem;
    font-weight: 700;
  }
}
.qr-card-icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: var(--r-md);
  background: rgba(255, 140, 66, 0.12);
  color: var(--c-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}
.qr-desc {
  font-size: 0.8125rem;
  color: var(--c-muted);
  margin-top: 2px;
}
.qr-input-stack {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}
.qr-submit,
.qr-manual {
  width: 100%;
  justify-content: center;
}

.qr-result {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-2);
  padding: 10px 14px;
  border-radius: var(--r-md);
  font-size: 0.875rem;
  i {
    margin-top: 2px;
  }
  &.qr-ok {
    background: rgba(74, 222, 128, 0.1);
    border: 1px solid rgba(74, 222, 128, 0.25);
    color: var(--c-success);
  }
  &.qr-err {
    background: rgba(248, 113, 113, 0.1);
    border: 1px solid rgba(248, 113, 113, 0.25);
    color: var(--c-danger);
  }
}

.qr-divider {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  font-size: 0.75rem;
  color: var(--c-muted);
  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: var(--c-border);
  }
}

/* Log card */
.log-card {
  padding: 0;
  overflow: hidden;
  min-width: 0;
}
.log-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-3);
  padding: var(--sp-4) var(--sp-5);
  border-bottom: 1px solid var(--c-border);
}
.log-title {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  h3 {
    font-family: var(--font-700);
    font-size: 1rem;
    font-weight: 700;
  }
}
.log-count {
  min-width: 24px;
  padding: 2px 8px;
  border-radius: 999px;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.06);
  color: var(--c-muted);
}
.log-card .table-scroll,
.log-card > div:last-child {
  overflow-x: auto;
}

.guest-cell {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
}
.mini-avatar {
  width: 30px;
  height: 30px;
  border-radius: var(--r-md);
  flex-shrink: 0;
  background: rgba(255, 140, 66, 0.12);
  color: var(--c-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8125rem;
  font-weight: 700;
}
.guest-name {
  font-size: 0.875rem;
  font-weight: 600;
}
.cell-muted {
  font-size: 0.8125rem;
  color: var(--c-muted);
}

.badge-accent {
  background: rgba(255, 140, 66, 0.12);
  border: 1px solid rgba(255, 140, 66, 0.25);
  color: var(--c-accent);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.badge-info {
  background: rgba(96, 165, 250, 0.12);
  border: 1px solid rgba(96, 165, 250, 0.25);
  color: var(--c-info);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* ── Drawer ──────────────────────────────────────────── */
.drawer-form {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
}
.drawer-footer-btns {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--sp-3);
  width: 100%;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}
.required-star {
  color: var(--c-danger);
  margin-left: 2px;
}
.btn-xs-icon {
  width: 28px !important;
  height: 28px !important;
  border-radius: var(--r-sm) !important;
}

.ci-search-wrap {
  position: relative;
}
.ci-guest-name {
  font-size: 0.875rem;
  font-weight: 600;
}
.ci-guest-meta {
  font-size: 0.75rem;
  color: var(--c-muted);
}
.ci-selected-info {
  flex: 1;
  min-width: 0;
}

.ci-guest-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 50;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-lg);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  max-height: 280px;
  overflow-y: auto;
}
.ci-guest-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: 10px 14px;
  background: none;
  border: none;
  border-bottom: 1px solid var(--c-border);
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  color: inherit;
  transition: background var(--t-fast);
  &:last-child {
    border-bottom: none;
  }
  &:hover,
  &:focus-visible {
    background: rgba(255, 255, 255, 0.05);
    outline: none;
  }
}
.ci-selected-guest {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  margin-top: var(--sp-2);
  padding: var(--sp-3) var(--sp-4);
  border-radius: var(--r-lg);
  background: rgba(74, 222, 128, 0.06);
  border: 1px solid rgba(74, 222, 128, 0.2);
}

/* ── Empty state ─────────────────────────────────────── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--sp-3);
  padding: var(--sp-12);
  text-align: center;
  h3 {
    font-family: var(--font-700);
    font-size: 1.125rem;
    font-weight: 700;
  }
  p {
    font-size: 0.875rem;
    color: var(--c-muted);
    max-width: 320px;
  }
}
.empty-icon {
  font-size: 2.5rem;
  color: var(--c-muted);
  opacity: 0.4;
}

.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.25s var(--ease-out);
}
.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

@media (prefers-reduced-motion: reduce) {
  .fade-up-enter-active,
  .fade-up-leave-active {
    transition: none;
  }
}
</style>
