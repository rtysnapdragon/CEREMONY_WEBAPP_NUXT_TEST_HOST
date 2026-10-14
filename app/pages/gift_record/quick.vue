<template>
  <RWrapperPage>
    <div class="quick-kiosk">

      <!-- =====================================================
        MAIN
      ====================================================== -->
      <main class="qk-main">
        <!-- ===================================================
          FIND GUEST
        ==================================================== -->
        <section class="qk-find">
          <div class="qk-section-head">
            <div>
              <span class="qk-step">01</span>
              <div class="qk-heading">Find Guest</div>
            </div>

            <i class="ri-qr-scan-2-line qk-head-icon" />
          </div>

          <!-- Scanner -->
          <div class="qk-scanner">
            <QrScanner @scanned="onCameraScanned" />

            <div class="qk-scan-label">
              <i class="ri-camera-line" />
              Scan guest QR
            </div>
          </div>

          <!-- QR -->
          <div class="qk-input-wrap">
            <i class="ri-qr-code-line" />

            <RInput
              v-model="qg.qrInput"
              class="qk-input"
              :placeholder="
                qgScanning ? 'Looking up guest...' : 'Paste QR code'
              "
              :disabled="qgScanning"
              autocomplete="off"
              @keydown.enter.prevent="scanQrCode"
            />

            <button
              v-if="qg.qrInput"
              type="button"
              class="qk-go"
              :disabled="qgScanning"
              @click="scanQrCode"
            >
              <i v-if="qgScanning" class="ri-loader-4-line animate-spin" />
              <i v-else class="ri-arrow-right-line" />
            </button>
          </div>

          <div class="qk-or">
            <span>OR SEARCH</span>
          </div>

          <!-- Guest Search -->
          <div class="qk-search-wrap">
            <div class="qk-input-wrap">
              <i class="ri-search-line" />

              <RInput
                ref="qgGuestInput"
                v-model="qg.guestSearch"
                class="qk-input"
                placeholder="Guest name..."
                autocomplete="off"
                @keydown.escape="qgGuestResults = []"
              />

              <span v-if="qg.guestSearch" class="qk-search-count">
                {{ qgGuestResults.length }}
              </span>
            </div>

            <!-- Results -->
            <div v-if="qgGuestResults.length" class="qk-results">
              <button
                v-for="g in qgGuestResults"
                :key="g.id"
                type="button"
                class="qk-result"
                @mousedown.prevent="selectQgGuest(g)"
              >
                <div class="qk-result-avatar">
                  {{ (g.name?.[0] || "?").toUpperCase() }}
                </div>

                <div class="qk-result-content">
                  <strong>{{ g.name }}</strong>

                  <span>
                    {{ g.status }}
                    <template v-if="g.totalGuests">
                      · {{ g.totalGuests }} pax
                    </template>
                  </span>
                </div>

                <i class="ri-arrow-right-s-line" />
              </button>
            </div>
          </div>
        </section>

        <!-- ===================================================
          RECORD GIFT
        ==================================================== -->
        <section class="qk-record">
          <div class="qk-section-head">
            <div>
              <span class="qk-step">02</span>
              <div class="qk-heading">Record Gift</div>
            </div>

            <i class="ri-gift-2-line qk-head-icon" />
          </div>

          <!-- ===============================================
            EDITING AN EXISTING RECENT GIFT — replaces the
            scan/tap-amount flow with a direct edit form, right
            here in Record Gift, instead of a separate drawer.
          ================================================ -->
          <div v-if="editingGift" class="qk-record-content qk-edit-mode">
            <div class="qk-quick-title">
              <span>Editing Gift</span>
              <small>Update this recorded entry</small>
            </div>

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

            <RFormGroup :label="tr('gifts.gifted_by')">
              <RInput v-model="giftForm.guestName" placeholder="Guest name" />
            </RFormGroup>

            <RFormGroup
              v-if="giftForm.type === 'cash'"
              :label="tr('gifts.gift_amount')"
            >
              <div class="qk-edit-amount-row">
                <div class="qk-currency-toggle">
                  <button
                    type="button"
                    :class="{ active: qgCurrency === 'USD' }"
                    @click="qgCurrency = 'USD'"
                  >
                    $
                  </button>
                  <button
                    type="button"
                    :class="{ active: qgCurrency === 'KHR' }"
                    @click="qgCurrency = 'KHR'"
                  >
                    ៛
                  </button>
                </div>

                <div class="qk-input-wrap qk-edit-amount-input">
                  <span class="qk-currency-symbol">
                    {{ qgCurrency === "USD" ? "$" : "៛" }}
                  </span>

                  <RInput
                    v-model.number="giftForm.amount"
                    type="number"
                    class="qk-input qk-input-currency"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div class="qk-amounts qk-edit-amounts">
                <button
                  v-for="p in qgDisplayPresets"
                  :key="p"
                  type="button"
                  class="qk-amount"
                  @click="giftForm.amount = p"
                >
                  {{ formatAmount(p) }}
                </button>
              </div>
            </RFormGroup>

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

            <!-- gifts.gift_date field hidden — editing already
                 auto-sets giftForm.receivedAt to the current time
                 (see editRecentGift below), so there's nothing left
                 for the person to pick here. -->


            <div class="qk-edit-actions">
              <button
                type="button"
                class="qk-cancel-edit"
                :disabled="saving"
                @click="closeModal"
              >
                Cancel
              </button>
              <button
                type="button"
                class="qk-save"
                :disabled="saving"
                @click="submitEdit"
              >
                <i v-if="saving" class="ri-loader-4-line animate-spin" />
                <template v-else>
                  <i class="ri-check-line" />
                  Save
                </template>
              </button>
            </div>
          </div>

          <!-- ===============================================
            NO GUEST
          ================================================ -->
          <div v-else-if="!qgGuest" class="qk-no-guest">
            <div class="qk-no-guest-icon">
              <i class="ri-scan-2-line" />
            </div>

            <strong>Scan a guest to start</strong>

            <span>
              The gift buttons will appear immediately after selecting a guest.
            </span>
          </div>

          <!-- ===============================================
            SELECTED GUEST
          ================================================ -->
          <Transition v-else name="qk-fast">
            <div class="qk-record-content">
              <!-- Guest -->
              <div class="qk-guest">
                <div class="qk-guest-avatar">
                  {{
                    (
                      (qgGuest.guestName || qgGuest.name)?.[0] || "?"
                    ).toUpperCase()
                  }}
                </div>

                <div class="qk-guest-info">
                  <strong>
                    {{ qgGuest.guestName || qgGuest.name }}
                  </strong>

                  <div class="qk-guest-meta">
                    <span
                      class="qk-status-badge"
                      :class="
                        (qgGuest.currentStatus || qgGuest.status) === 'ATTENDED'
                          ? 'success'
                          : ''
                      "
                    >
                      {{ qgGuest.currentStatus || qgGuest.status }}
                    </span>

                    <span v-if="qgGuest.totalGuests">
                      👥 {{ qgGuest.totalGuests }}
                    </span>

                    <span v-if="qgGuest.tableNumber">
                      🪑 {{ qgGuest.tableNumber }}
                    </span>
                  </div>
                </div>

                <button type="button" class="qk-clear" @click="clearQgGuest">
                  <i class="ri-close-line" />
                </button>
              </div>

              <!-- Quick Amount -->
              <div class="qk-quick-title">
                <span>Quick Amount</span>

                <div class="qk-currency-toggle">
                  <button
                    type="button"
                    :class="{ active: qgCurrency === 'USD' }"
                    @click="qgCurrency = 'USD'"
                  >
                    $
                  </button>
                  <button
                    type="button"
                    :class="{ active: qgCurrency === 'KHR' }"
                    @click="qgCurrency = 'KHR'"
                  >
                    ៛
                  </button>
                </div>
              </div>

              <div class="qk-amounts">
                <button
                  v-for="p in qgDisplayPresets"
                  :key="p"
                  type="button"
                  class="qk-amount"
                  :disabled="qgSaving"
                  @click="tapPreset(p)"
                >
                  <i
                    v-if="qgSaving && qgTapping === p"
                    class="ri-loader-4-line animate-spin"
                  />

                  <template v-else>
                    {{ formatAmount(p) }}
                  </template>
                </button>
              </div>

              <!-- Physical -->
              <button
                type="button"
                class="qk-physical"
                :disabled="qgSaving"
                @click="qgTapPhysical"
              >
                <i
                  v-if="qgSaving && qgTapping === 'gift'"
                  class="ri-loader-4-line animate-spin"
                />

                <template v-else>
                  <i class="ri-gift-line" />
                  Physical Gift
                </template>
              </button>

              <!-- Custom -->
              <div class="qk-custom">
                <div class="qk-input-wrap">
                  <span class="qk-currency-symbol">
                    {{ qgCurrency === "USD" ? "$" : "៛" }}
                  </span>

                  <RInput
                    v-model="qg.amount"
                    type="number"
                    class="qk-input qk-input-currency"
                    placeholder="Custom amount"
                    inputmode="decimal"
                    @keydown.enter.prevent="submitCustom"
                  />
                </div>

                <button
                  type="button"
                  class="qk-save"
                  :disabled="qgSaving || !qg.amount"
                  @click="submitCustom"
                >
                  <i
                    v-if="qgSaving && !qgTapping"
                    class="ri-loader-4-line animate-spin"
                  />

                  <template v-else>
                    <i class="ri-check-line" />
                    Save
                  </template>
                </button>
              </div>

              <!-- Note -->
              <div class="qk-note">
                <i class="ri-edit-line" />

                <RInput
                  v-model="qg.description"
                  class="qk-input"
                  placeholder="Note (optional)"
                />
              </div>
            </div>
          </Transition>
        </section>

        <!-- ===================================================
          RECENT — full gift record list (same source as the main
          gift_record page), with infinite scroll instead of a cap
        ==================================================== -->
        <aside class="qk-recent">
          <div class="qk-recent-head">
            <div>
              <strong>Recent</strong>
              <span>All recorded gifts</span>
            </div>

            <i class="ri-history-line" />
          </div>

          <div ref="recentListEl" class="qk-recent-list">
            <div v-for="r in recentGifts" :key="r.id" class="qk-recent-item">
              <div class="qk-mini-avatar">
                {{ (r.guestName?.[0] || "?").toUpperCase() }}
              </div>

              <div class="qk-recent-info">
                <strong>{{ r.guestName }}</strong>
                <span class="qk-recent-date">{{ formatGiftDate(r.receivedAt) }}</span>
              </div>

              <span
                class="qk-type-badge"
                :class="r.type === 'cash' ? 'success' : 'info'"
              >
                <i
                  :class="
                    r.type === 'cash'
                      ? 'ri-money-dollar-circle-line'
                      : 'ri-gift-line'
                  "
                />
                {{ r.type === "cash" ? tr("gifts.cash") : tr("gifts.non_cash") }}
              </span>

              <strong class="qk-recent-value">
                {{
                  r.type === "cash"
                    ? `$${r.amount?.toLocaleString?.() ?? r.amount}`
                    : r.description || "—"
                }}
              </strong>

              <div class="qk-recent-actions" @click.stop>
                <button
                  type="button"
                  class="qk-recent-action"
                  @click="editRecentGift(r)"
                >
                  <i class="ri-edit-line" />
                </button>
                <button
                  type="button"
                  class="qk-recent-action qk-recent-action-danger"
                  @click="actionDelete(r)"
                >
                  <i class="ri-delete-bin-line" />
                </button>
              </div>
            </div>

            <!-- Infinite scroll sentinel -->
            <div ref="recentSentinel" class="qk-recent-sentinel">
              <template v-if="recentLoading">
                <i class="ri-loader-4-line animate-spin" />
                Loading…
              </template>
              <template v-else-if="!recentHasMore && recentGifts.length">
                No more gifts
              </template>
            </div>
          </div>
        </aside>
      </main>
    </div>

  </RWrapperPage>
</template>

<script setup>
import { defineAsyncComponent, h, computed, watch } from "vue";

const QrScanner = defineAsyncComponent(
  () => import("~/components/ui/QrScanner.vue"),
);

const formatKhmerAmount = (amount) => {
  const value = Number(amount || 0);

  return `${new Intl.NumberFormat("en-US").format(value)} ៛`;
};

const formatUsdAmount = (amount) => {
  const value = Number(amount || 0);

  return `$${new Intl.NumberFormat("en-US").format(value)}`;
};

definePageMeta({
  layout: "navbar",
  middleware: ["auth", "permission"],
  permission: "VIEW_FINANCE",
  title: "gifts.quick_title",
  showBack: true,
});

const {
  qgSaving,
  qgScanning,
  qgGuest,
  qgGuestResults,
  qgTapping,
  qgPresets,
  qg,
  onCameraScanned,
  scanQrCode,
  onQgSearch,
  selectQgGuest,
  clearQgGuest,
  qgSubmit,
  qgTapPreset,
  qgTapPhysical,
} = useQuickGift();

// ------------------------------------------------------------
// Currency toggle for Record Gift ($ / ៛)
// qgPresets comes from useQuickGift() and, going by the original
// formatKhmerAmount-only formatting, is riel-scale (e.g. 5000,
// 10000, 50000...). There's no dollar-scale preset list from the
// composable, so a separate USD_PRESETS set is defined here for
// when the toggle is on $. Adjust these to whatever amounts make
// sense for your typical cash gifts.
//
// ASSUMPTION (please verify against your composable): qgTapPreset(p)
// and qgSubmit() read the shared `qg` reactive object, so setting
// qg.currency before calling them is enough to carry the choice
// through to the save — if useQuickGift() ignores unknown fields
// on `qg`, this is a no-op and the currency won't actually reach
// the backend; in that case qgTapPreset/qgSubmit will need a
// currency param added on their end too.
// ------------------------------------------------------------
const USD_PRESETS = [5, 10, 20, 50, 100];

const qgCurrency = ref("KHR");

const qgDisplayPresets = computed(() =>
  qgCurrency.value === "USD" ? USD_PRESETS : qgPresets,
);

function formatAmount(amount) {
  return qgCurrency.value === "USD"
    ? formatUsdAmount(amount)
    : formatKhmerAmount(amount);
}

async function tapPreset(p) {
  qg.currency = qgCurrency.value;
  await qgTapPreset(p);
  await refreshRecent();
}

async function submitCustom() {
  qg.currency = qgCurrency.value;
  await qgSubmit();
  await refreshRecent();
}

// The search box previously relied on an "@on-input" event from
// RInput to call onQgSearch — if RInput doesn't actually emit an
// event with that name (many input wrappers only emit
// update:modelValue), typing would update qg.guestSearch via
// v-model but never trigger a search, and clearing the box would
// never clear the results dropdown either. Watching qg.guestSearch
// directly fires on every change regardless of what RInput emits,
// and explicitly empties qgGuestResults the moment the field is
// blank instead of only on Escape.
watch(
  () => qg.guestSearch,
  (val) => {
    if (!val) {
      qgGuestResults.value = [];
      return;
    }
    onQgSearch();
  },
);

// Edit for Recent Gifts now happens inline in the Record Gift panel
// instead of a drawer — still the same useGiftPage() composable/state
// as the main gift_record table page, so it stays in sync with that
// page's data rather than duplicating the logic.
const {
  giftStore,
  editingGift,
  saving,
  deletingGift,
  giftForm,
  tr,
  formatGiftDate,
  openEdit,
  closeModal,
  saveGift,
  confirmDelete,
  doDelete,
} = useGiftPage();

const confirm = useConfirmStore();

async function editRecentGift(r) {
  // Await in case openEdit() sets giftForm.receivedAt itself
  // asynchronously (e.g. after a fetch) — awaiting first guarantees
  // our "now" override below runs last and doesn't get clobbered by
  // openEdit's own assignment finishing after us. Safe even if
  // openEdit() is actually synchronous: awaiting a non-promise just
  // resolves immediately.
  await openEdit(r);
  // Auto-fill the date field with the current time instead of the
  // gift's original recorded time — editing a gift now always sets
  // its date to "now", not whatever it was originally recorded as.
  giftForm.receivedAt = new Date();
  // Default the edit form's currency toggle to whatever this gift
  // was already recorded in, so switching between editing a $ gift
  // and a ៛ gift doesn't leave the last-used toggle state showing.
  qgCurrency.value = giftForm.currency === "USD" ? "USD" : "KHR";
}

// ASSUMPTION (same caveat as tapPreset/submitCustom above): saveGift()
// is expected to read giftForm.currency when it builds its request.
// If useGiftPage()'s saveGift() doesn't look at that field, it'll
// need a currency param added on that end for this to actually reach
// the backend.
async function submitEdit() {
  giftForm.currency = qgCurrency.value;
  await saveGift();
  await refreshRecent();
}

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
      await refreshRecent();
    },
  });
};

// ============================================================
// Recent list — infinite scroll over the full gift_record data
// (the same giftStore.fetchGifts(page) the main table page uses),
// appended locally as the person scrolls rather than capped/paged
// with prev/next controls.
//
// ASSUMPTION (please verify against your store): fetchGifts(page)
// is 0-indexed, returns a promise, and populates giftStore.gifts
// with just that page's rows. RECENT_PAGE_SIZE below is a guess —
// set it to whatever page size your store actually uses, since
// it's what tells this code "that was the last page."
// ============================================================
const RECENT_PAGE_SIZE = 15;

const recentGifts = ref([]);
const recentPage = ref(0);
const recentLoading = ref(false);
const recentHasMore = ref(true);
const recentListEl = ref(null);
const recentSentinel = ref(null);
let recentObserver = null;

async function loadMoreRecent() {
  if (recentLoading.value || !recentHasMore.value) return;
  recentLoading.value = true;
  try {
    await giftStore.fetchGifts(recentPage.value);
    const page = giftStore.gifts || [];
    recentGifts.value.push(...page);
    if (page.length < RECENT_PAGE_SIZE) {
      recentHasMore.value = false;
    } else {
      recentPage.value += 1;
    }
  } finally {
    recentLoading.value = false;
  }
}

// The Recent list is a local snapshot built once on mount by
// paging through giftStore.fetchGifts() — it's not reactively tied
// to the store, so a new gift recorded via Quick Amount/custom
// amount, an edit saved, or a delete confirmed never showed up
// here on its own. refreshRecent() resets the pagination state and
// reloads from page 0, and is called after each of those actions
// succeeds.
async function refreshRecent() {
  recentPage.value = 0;
  recentHasMore.value = true;
  recentGifts.value = [];
  await loadMoreRecent();
}

onMounted(async () => {
  await loadMoreRecent();
  recentObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) loadMoreRecent();
    },
    { root: recentListEl.value, rootMargin: "150px" },
  );
  if (recentSentinel.value) recentObserver.observe(recentSentinel.value);
});

onBeforeUnmount(() => {
  recentObserver?.disconnect();
});
</script>

<style lang="scss">
/* ==========================================================
   QUICK KIOSK
   Designed for fast repeated gift recording.
========================================================== */

.quick-kiosk {
  min-height: 100dvh;
  height: 100dvh;

  box-sizing: border-box;

  background: var(--c-bg, #0b0b0d);
  color: var(--c-text);

  display: flex;
  flex-direction: column;

  @media (max-width: 700px) {
    height: auto;
    min-height: 100dvh;
    padding: 12px;
  }
}

/* ==========================================================
   HEADER
========================================================== */

.qk-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--c-border);
}

.qk-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.qk-icon {
  width: 46px;
  height: 46px;
  flex: 0 0 46px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 12px;
  background: color-mix(in srgb, var(--c-accent) 14%, transparent);
  border: 1px solid var(--c-border);
  color: var(--c-accent);
  font-size: 22px;
}

.qk-brand-text {
  min-width: 0;

  h1 {
    margin: 0;
    font-size: 20px;
    line-height: 1.2;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  span {
    display: block;
    margin-top: 3px;
    color: var(--c-muted);
    font-size: 12px;
  }
}

.qk-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qk-ready {
  display: inline-flex;
  align-items: center;
  gap: 6px;

  padding: 7px 11px;

  border: 1px solid var(--c-border);
  border-radius: 999px;

  color: var(--c-success);
  background: color-mix(in srgb, var(--c-success) 8%, transparent);

  font-size: 12px;
  font-weight: 700;
}

.qk-live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--c-success);
}

.qk-exit {
  display: inline-flex;
  align-items: center;
  gap: 5px;

  padding: 7px 12px;

  border: 1px solid var(--c-border);
  border-radius: 8px;

  color: var(--c-muted);
  text-decoration: none;
  font-size: 12px;
  font-weight: 700;

  transition: 0.12s ease;

  &:hover {
    color: var(--c-danger);
    background: color-mix(in srgb, var(--c-danger) 8%, transparent);
  }
}

/* ==========================================================
   MAIN GRID
   Top panels fill available screen height
   Recent stays at bottom
========================================================== */

.qk-main {
  display: grid;

  /* Left column: Find Guest (top) + Recent (bottom).
     Right column: Record Gift, spanning both rows at full height. */
  grid-template-columns:
    minmax(300px, 0.85fr)
    minmax(400px, 1.15fr);

  grid-template-rows: auto minmax(0, 1fr);

  grid-template-areas:
    "find   record"
    "recent record";

  gap: 14px;

  height: calc(100dvh - 105px);
  min-height: 0;

  align-items: stretch;

  .qk-find {
    grid-area: find;

    min-height: 0;
    height: auto;
    align-self: start;
    box-sizing: border-box;
  }

  .qk-record {
    grid-area: record;

    min-height: 0;
    height: 100%;
    box-sizing: border-box;
  }

  .qk-recent {
    grid-area: recent;

    min-height: 0;
    height: 100%;
    box-sizing: border-box;

    display: flex;
    flex-direction: column;
  }

  .qk-recent-list {
    flex: 1;
    min-height: 0;
    max-height: none;
    overflow-y: auto;
  }

  @media (max-width: 850px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    grid-template-areas:
      "find"
      "record"
      "recent";

    height: auto;
    min-height: 0;

    .qk-find,
    .qk-record,
    .qk-recent {
      height: auto;
    }

    .qk-recent-list {
      max-height: 300px;
    }
  }
}
/* ==========================================================
   PANELS
========================================================== */

.qk-find,
.qk-record,
.qk-recent {
  min-width: 0;

  padding: 16px;

  // border: 1px solid var(--c-border);
  border-radius: var(--r-md);

  background: var(--c-surface);
  box-sizing: border-box;
}

.qk-section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  margin-bottom: 14px;
}

.qk-step {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-width: 26px;
  height: 20px;

  margin-bottom: 5px;

  border-radius: 5px;

  background: color-mix(in srgb, var(--c-accent) 12%, transparent);

  color: var(--c-accent);

  font-size: 10px;
  font-weight: 900;
}

.qk-heading {
  font-size: 15px;
  font-weight: 800;
}

.qk-head-icon {
  color: var(--c-muted);
  font-size: 20px;
}

/* ==========================================================
   SCANNER
========================================================== */

.qk-scanner {
  position: relative;

  min-height: 210px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-bottom: 10px;
  padding: 10px;

  overflow: hidden;

  border: 1px dashed var(--c-border);
  border-radius: 12px;

  background: rgba(255, 255, 255, 0.015);
}

.qk-scan-label {
  position: absolute;
  left: 10px;
  bottom: 10px;

  display: inline-flex;
  align-items: center;
  gap: 5px;

  padding: 5px 8px;

  border-radius: 6px;

  background: rgba(0, 0, 0, 0.5);

  color: var(--c-muted);

  font-size: 10px;
  font-weight: 700;
}

/* ==========================================================
   INPUTS
========================================================== */

.qk-input-wrap {
  position: relative;

  display: flex;
  align-items: center;

  width: 100%;
  min-width: 0;

  margin-bottom: 9px;

  > i {
    position: absolute;
    left: 13px;
    z-index: 2;

    color: var(--c-muted);
    font-size: 16px;

    pointer-events: none;
  }
}

.qk-input {
  width: 100%;

  min-height: 46px;

  padding-left: 40px !important;

  font-size: 14px !important;
}

.qk-go {
  position: absolute;
  right: 5px;

  width: 36px;
  height: 36px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 1px solid var(--c-border);
  border-radius: 7px;

  background: color-mix(in srgb, var(--c-accent) 12%, transparent);

  color: var(--c-accent);

  cursor: pointer;
}

.qk-search-count {
  position: absolute;
  right: 12px;

  color: var(--c-muted);

  font-size: 11px;
  font-weight: 700;
}

.qk-or {
  display: flex;
  align-items: center;
  gap: 8px;

  margin: 9px 0;

  color: var(--c-muted);

  font-size: 9px;
  font-weight: 800;

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: var(--c-border);
  }
}

/* ==========================================================
   SEARCH RESULTS
========================================================== */

.qk-search-wrap {
  position: relative;
}

.qk-results {
  position: absolute;

  left: 0;
  right: 0;
  top: calc(100% + 3px);

  z-index: 100;

  overflow: hidden;

  border: 1px solid var(--c-border);
  border-radius: 10px;

  background: var(--c-surface);

  box-shadow: 0 14px 35px rgba(0, 0, 0, 0.35);
}

.qk-result {
  display: flex;
  align-items: center;
  gap: 10px;

  width: 100%;

  padding: 9px 10px;

  border: 0;
  border-bottom: 1px solid var(--c-border);

  background: transparent;

  color: inherit;

  text-align: left;

  cursor: pointer;

  &:last-child {
    border-bottom: 0;
  }

  &:hover {
    background: color-mix(in srgb, var(--c-accent) 7%, transparent);
  }
}

.qk-result-avatar {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background: color-mix(in srgb, var(--c-accent) 12%, transparent);

  color: var(--c-accent);

  font-size: 12px;
  font-weight: 800;
}

.qk-result-content {
  display: flex;
  flex-direction: column;

  flex: 1;
  min-width: 0;

  strong {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    font-size: 13px;
  }

  span {
    margin-top: 2px;

    color: var(--c-muted);

    font-size: 10px;
  }

  + i {
    color: var(--c-muted);
  }
}

/* ==========================================================
   NO GUEST
========================================================== */

.qk-no-guest {
  min-height: 390px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  padding: 20px;

  text-align: center;
}

.qk-no-guest-icon {
  width: 60px;
  height: 60px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-bottom: 12px;

  border: 1px solid var(--c-border);
  border-radius: 14px;

  background: rgba(255, 255, 255, 0.025);

  color: var(--c-muted);

  font-size: 25px;
}

.qk-no-guest strong {
  font-size: 14px;
}

.qk-no-guest span {
  max-width: 260px;

  margin-top: 5px;

  color: var(--c-muted);

  font-size: 11px;
  line-height: 1.5;
}

/* ==========================================================
   GUEST
========================================================== */

.qk-record-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ==========================================================
   EDIT MODE (Record Gift panel repurposed for editing an
   existing Recent Gifts entry, instead of a separate drawer)
========================================================== */

.qk-edit-mode {
  gap: 10px;
}
.qk-edit-actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}
.qk-cancel-edit {
  flex: 1;
  min-height: 46px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 1px solid var(--c-border);
  border-radius: 9px;

  background: rgba(255, 255, 255, 0.04);

  color: var(--c-muted);

  font-size: 12px;
  font-weight: 800;

  cursor: pointer;

  transition: background 0.12s ease, color 0.12s ease;

  &:hover:not(:disabled) {
    background: color-mix(in srgb, var(--c-danger) 8%, transparent);
    color: var(--c-danger);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
}
.qk-edit-mode .qk-save {
  flex: 1;
  min-width: 0;
}

.qk-guest {
  display: flex;
  align-items: center;
  gap: 10px;

  padding: 10px;

  border: 1px solid var(--c-border);
  border-radius: 11px;

  background: color-mix(in srgb, var(--c-accent) 5%, transparent);
}

.qk-guest-avatar {
  width: 48px;
  height: 48px;
  flex: 0 0 48px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 10px;

  background: color-mix(in srgb, var(--c-accent) 15%, transparent);

  color: var(--c-accent);

  font-size: 18px;
  font-weight: 900;
}

.qk-guest-info {
  flex: 1;
  min-width: 0;

  > strong {
    display: block;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    font-size: 15px;
  }
}

.qk-guest-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;

  margin-top: 4px;

  color: var(--c-muted);

  font-size: 10px;
}

.qk-status-badge {
  padding: 3px 6px;

  border: 1px solid var(--c-border);
  border-radius: 5px;

  font-size: 9px;
  font-weight: 800;

  &.success {
    color: var(--c-success);
    background: color-mix(in srgb, var(--c-success) 10%, transparent);
  }
}

.qk-clear {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 0;
  border-radius: 7px;

  background: rgba(255, 255, 255, 0.04);

  color: var(--c-muted);

  cursor: pointer;

  &:hover {
    color: var(--c-danger);
  }
}

/* ==========================================================
   QUICK AMOUNTS
========================================================== */

.qk-quick-title {
  display: flex;
  align-items: center;
  justify-content: space-between;

  span {
    font-size: 12px;
    font-weight: 800;
  }

  small {
    color: var(--c-muted);
    font-size: 9px;
  }
}

/* ==========================================================
   CURRENCY TOGGLE ($ / ៛)
========================================================== */

.qk-currency-toggle {
  display: inline-flex;
  align-items: center;

  padding: 2px;

  border: 1px solid var(--c-border);
  border-radius: 8px;

  background: rgba(255, 255, 255, 0.03);

  button {
    min-width: 30px;
    height: 24px;

    border: 0;
    border-radius: 6px;

    background: transparent;

    color: var(--c-muted);

    font-size: 12px;
    font-weight: 800;

    cursor: pointer;

    transition: background 0.12s ease, color 0.12s ease;

    &.active {
      background: var(--c-accent);
      color: #111;
    }

    &:not(.active):hover {
      color: var(--c-text);
    }
  }
}

.qk-currency-symbol {
  position: absolute;
  left: 13px;
  z-index: 2;

  color: var(--c-muted);
  font-size: 13px;
  font-weight: 800;

  pointer-events: none;
}

.qk-input-currency {
  padding-left: 32px !important;
}

/* Currency toggle + amount input side by side, used in the Edit
   form's gift_amount field */
.qk-edit-amount-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qk-edit-amount-input {
  flex: 1;
  min-width: 0;
  margin-bottom: 0;
}

.qk-edit-amounts {
  margin-top: 8px;

  .qk-amount {
    min-height: 46px;
    font-size: 14px;
  }
}

.qk-amounts {
  display: grid;

  grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));

  gap: 8px;
}

.qk-amount {
  min-height: 62px;

  border: 1px solid var(--c-border);
  border-radius: 10px;

  background: color-mix(in srgb, var(--c-accent) 8%, transparent);

  color: var(--c-accent);

  font-size: 17px;
  font-weight: 900;

  cursor: pointer;

  transition:
    transform 0.08s ease,
    background 0.08s ease;

  &:hover:not(:disabled) {
    background: color-mix(in srgb, var(--c-accent) 16%, transparent);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
}

/* ==========================================================
   PHYSICAL GIFT
========================================================== */

.qk-physical {
  min-height: 46px;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 7px;

  border: 1px solid var(--c-border);
  border-radius: 9px;

  background: color-mix(in srgb, var(--c-info) 7%, transparent);

  color: var(--c-info);

  font-size: 12px;
  font-weight: 800;

  cursor: pointer;

  &:hover:not(:disabled) {
    background: color-mix(in srgb, var(--c-info) 14%, transparent);
  }

  &:disabled {
    opacity: 0.45;
  }
}

/* ==========================================================
   CUSTOM
========================================================== */

.qk-custom {
  display: grid;

  grid-template-columns: minmax(0, 1fr) 100px;

  gap: 8px;
}

.qk-custom .qk-input-wrap {
  margin-bottom: 0;
}

.qk-save {
  min-height: 46px;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 5px;

  border: 0;
  border-radius: 9px;

  background: var(--c-accent);

  color: #111;

  font-size: 12px;
  font-weight: 900;

  cursor: pointer;

  &:hover:not(:disabled) {
    filter: brightness(1.08);
  }

  &:active:not(:disabled) {
    transform: scale(0.97);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.qk-note {
  position: relative;

  display: flex;
  align-items: center;

  > i {
    position: absolute;
    left: 13px;
    z-index: 2;

    color: var(--c-muted);
    font-size: 15px;
  }

  .qk-input {
    min-height: 42px;
  }
}

/* ==========================================================
   RECENT
========================================================== */

.qk-recent {
  padding: 14px;
}

.qk-recent-head {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 10px;

  > div {
    display: flex;
    flex-direction: column;
  }

  strong {
    font-size: 13px;
  }

  span {
    margin-top: 2px;

    color: var(--c-muted);

    font-size: 9px;
  }

  > i {
    color: var(--c-muted);
    font-size: 17px;
  }
}

.qk-recent-list {
  display: flex;
  flex-direction: column;

  gap: 5px;

  max-height: 490px;

  overflow-y: auto;

  scrollbar-width: thin;
}

.qk-recent-item {
  display: flex;
  align-items: center;

  min-width: 0;

  gap: 8px;

  padding: 7px;

  border: 1px solid var(--c-border);
  border-radius: 8px;

  background: rgba(255, 255, 255, 0.015);

  transition: background 0.12s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.035);

    .qk-recent-actions {
      opacity: 1;
    }
  }
}

.qk-mini-avatar {
  width: 30px;
  height: 30px;
  flex: 0 0 30px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 7px;

  background: rgba(255, 255, 255, 0.05);

  color: var(--c-muted);

  font-size: 10px;
  font-weight: 900;
}

.qk-recent-info {
  flex: 1;
  min-width: 0;

  display: flex;
  flex-direction: column;

  strong {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    font-size: 10px;
  }
}

.qk-recent-date {
  margin-top: 1px;

  color: var(--c-muted);

  font-size: 8px;
}

.qk-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;

  flex: 0 0 auto;

  padding: 3px 7px;

  border-radius: 999px;

  font-size: 8px;
  font-weight: 800;

  i {
    font-size: 9px;
  }

  &.success {
    color: var(--c-success);
    background: color-mix(in srgb, var(--c-success) 10%, transparent);
  }

  &.info {
    color: var(--c-info);
    background: color-mix(in srgb, var(--c-info) 10%, transparent);
  }
}

.qk-recent-value {
  max-width: 70px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  color: var(--c-success);

  font-size: 10px;
}

.qk-recent-sentinel {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  min-height: 36px;
  padding: 8px;

  color: var(--c-muted);

  font-size: 10px;
  font-weight: 700;
}

/* Edit/delete actions on each Recent row — hidden until hover so the
   list stays visually calm during rapid-entry use, matching the same
   hover-reveal pattern the main gift_record table already uses. */
.qk-recent-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 0 0 auto;
  opacity: 0;
  transition: opacity 0.12s ease;

  @media (max-width: 850px) {
    opacity: 1;
  }
}
.qk-recent-action {
  width: 26px;
  height: 26px;
  flex: 0 0 26px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 1px solid var(--c-border);
  border-radius: 6px;

  background: rgba(255, 255, 255, 0.04);

  color: var(--c-muted);

  font-size: 12px;

  cursor: pointer;

  transition: background 0.12s ease, color 0.12s ease;

  &:hover {
    background: color-mix(in srgb, var(--c-accent) 12%, transparent);
    color: var(--c-accent);
  }
}
.qk-recent-action-danger:hover {
  background: color-mix(in srgb, var(--c-danger) 12%, transparent) !important;
  color: var(--c-danger) !important;
}

/* ==========================================================
   FAST TRANSITION
========================================================== */

.qk-fast-enter-active,
.qk-fast-leave-active {
  transition:
    opacity 0.08s ease,
    transform 0.08s ease;
}

.qk-fast-enter-from,
.qk-fast-leave-to {
  opacity: 0;
  transform: translateY(-3px);
}

/* ==========================================================
   MOBILE
========================================================== */

@media (max-width: 850px) {
  .qk-main {
    grid-template-columns: 1fr;
  }

  .qk-scanner {
    min-height: 240px;
  }

  .qk-no-guest {
    min-height: 260px;
  }

  .qk-recent-list {
    max-height: 300px;
  }
}

@media (max-width: 520px) {
  .quick-kiosk {
    padding: 8px;
  }

  .qk-header {
    margin-bottom: 10px;
  }

  .qk-brand-text span {
    display: none;
  }

  .qk-ready span:last-child {
    display: none;
  }

  .qk-exit span {
    display: none;
  }

  .qk-find,
  .qk-record,
  .qk-recent {
    padding: 11px;
    border-radius: 10px;
  }

  .qk-amount {
    min-height: 58px;
  }

  .qk-custom {
    grid-template-columns: 1fr 88px;
  }
}
</style>
