<template>
  <RWrapperPage>
    <div class="budget-page">
      <!-- Stat row -->
      <div class="stat-grid animate-fade-up delay-1">
        <div class="stat-card">
          <div class="stat-head">
            <span class="stat-label">{{ tr("budget.totalBudget") }}</span>
            <i class="ri-wallet-3-line" />
          </div>
          <div class="stat-value">
            ${{ budgetStore.totalBudget.toLocaleString() }}
          </div>
          <div class="stat-caption">
            {{ tr("budget.category") }} · {{ budgetStore.categories.length }}
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-head">
            <span class="stat-label">{{ tr("budget.totalSpent") }}</span>
            <i class="ri-shopping-cart-2-line" style="color: var(--c-accent)" />
          </div>
          <div class="stat-value" style="color: var(--c-accent)">
            ${{ budgetStore.totalSpent.toLocaleString() }}
          </div>
          <div class="stat-caption">
            {{ budgetStore.usagePercent }}% {{ tr("budget.usage") }}
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-head">
            <span class="stat-label">{{ tr("budget.remaining") }}</span>
            <i
              class="ri-safe-2-line"
              :style="{
                color:
                  budgetStore.remaining >= 0
                    ? 'var(--c-success)'
                    : 'var(--c-danger)',
              }"
            />
          </div>
          <div
            class="stat-value"
            :style="{
              color:
                budgetStore.remaining >= 0
                  ? 'var(--c-success)'
                  : 'var(--c-danger)',
            }"
          >
            ${{ budgetStore.remaining.toLocaleString() }}
          </div>
          <div class="stat-caption">
            {{ budgetStore.remaining >= 0 ? "Under budget" : "Over budget" }}
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-head">
            <span class="stat-label">{{ tr("budget.usage") }}</span>
            <i class="ri-pie-chart-2-line" style="color: var(--c-info)" />
          </div>
          <div class="stat-value" style="color: var(--c-info)">
            {{ budgetStore.usagePercent }}%
          </div>
          <div class="stat-meter">
            <div
              class="stat-meter-fill"
              :style="{ width: Math.min(100, budgetStore.usagePercent) + '%' }"
            />
          </div>
        </div>
      </div>
      <!-- Main grid: chart (larger) + category breakdown (side panel) -->
      <div class="main-grid animate-fade-up delay-2">
        <div class="panel col-span-8">
          <div class="panel-head">
            <span class="panel-title"
              >{{ tr("budget.plannedExpenses") }} /
              {{ tr("budget.actualExpenses") }}</span
            >
            <div class="pva-legend">
              <span class="legend-row"
                ><span class="legend-dot" style="background: var(--c-info)" />{{
                  tr("budget.plannedExpenses")
                }}</span
              >
              <span class="legend-row"
                ><span
                  class="legend-dot"
                  style="background: var(--c-accent)"
                />{{ tr("budget.actualExpenses") }}</span
              >
            </div>
          </div>
          <div
            v-if="budgetStore.categories.length === 0"
            class="empty-state"
            style="padding: var(--sp-6)"
          >
            <div class="empty-icon"><i class="ri-bar-chart-2-line" /></div>
            <p>{{ tr("budget.noTransactions") }}</p>
          </div>
          <div v-else class="pva-chart-wrap">
            <div
              class="pva-chart-inner"
              :style="{ height: pvaChartHeight + 'px' }"
            >
              <canvas ref="pvaCanvas" />
            </div>
          </div>
        </div>
        <div class="panel col-span-4">
          <div class="panel-head">
            <span class="panel-title">{{ tr("budget.category") }}</span>
          </div>
          <div
            v-if="categoryChartSegments.length === 0"
            class="empty-state"
            style="padding: var(--sp-6)"
          >
            <div class="empty-icon"><i class="ri-pie-chart-line" /></div>
            <p>{{ tr("budget.noTransactions") }}</p>
          </div>
          <div v-else class="pie-widget">
            <div class="pie-caption">
              <span class="pie-caption-value"
                >${{ totalCategorySpent.toLocaleString() }}</span
              >
              <span class="pie-caption-label">{{
                tr("budget.totalSpent")
              }}</span>
            </div>
            <div class="pie-chart-wrap">
              <canvas ref="pieCanvas" />
            </div>
            <div class="pie-legend">
              <div
                v-for="seg in categoryChartSegments"
                :key="seg.id"
                class="legend-row legend-row-interactive"
                @mouseenter="setHoveredSegment(seg.id)"
                @mouseleave="setHoveredSegment(null)"
              >
                <span
                  class="legend-dot"
                  :style="{ background: resolveColor(seg.color) }"
                />
                <span class="legend-name">{{ seg.name }}</span>
                <span class="legend-amount"
                  >${{ seg.value.toLocaleString() }}</span
                >
                <span class="legend-pct">{{ Math.round(seg.percent) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Insight strip -->
      <div
        v-if="budgetStore.summary"
        class="summary-bar animate-fade-up delay-2"
      >
        <div class="summary-item summary-item-main">
          <span class="summary-label">{{ tr("budget.netProfit") }}</span>
          <span
            class="summary-value"
            :style="{
              color:
                Number(budgetStore.summary.netProfit) >= 0
                  ? 'var(--c-success)'
                  : 'var(--c-danger)',
            }"
          >
            ${{ Number(budgetStore.summary.netProfit || 0).toLocaleString() }}
          </span>
          <span
            class="badge"
            :class="
              budgetStore.summary.profitStatus === 'PROFIT'
                ? 'badge-success'
                : budgetStore.summary.profitStatus === 'LOSS'
                  ? 'badge-danger'
                  : 'badge-muted'
            "
            >{{ budgetStore.summary.profitStatus }}</span
          >
        </div>
        <div class="summary-divider" />
        <div class="summary-item">
          <span class="summary-label">{{ tr("budget.giftIncome") }}</span>
          <span class="summary-value-sm" style="color: var(--c-success)">
            ${{
              Number(budgetStore.summary.totalCashIncome || 0).toLocaleString()
            }}
          </span>
        </div>
        <div class="summary-item">
          <span class="summary-label">{{ tr("budget.totalIncome") }}</span>
          <span class="summary-value-sm" style="color: var(--c-success)">
            ${{ Number(budgetStore.summary.totalIncome || 0).toLocaleString() }}
          </span>
        </div>
        <div class="summary-item">
          <span class="summary-label">{{ tr("budget.actualExpenses") }}</span>
          <span class="summary-value-sm" style="color: var(--c-danger)">
            -${{
              Number(
                budgetStore.summary.totalActualExpenses || 0,
              ).toLocaleString()
            }}
          </span>
        </div>
        <div class="summary-item">
          <span class="summary-label">{{ tr("budget.giftCount") }}</span>
          <span class="summary-value-sm">
            {{ budgetStore.summary.cashGiftCount }} cash ·
            {{ budgetStore.summary.physicalGiftCount }} gifts
          </span>
        </div>
        <span class="live-chip"><span class="live-dot-sm" />Live</span>
      </div>
      <!-- Transactions table -->
      <div class="panel animate-fade-up delay-2">
        <div class="panel-head">
          <span class="panel-title">{{ tr("budget.transactions") }}</span>
          <RBtn
            type="add"
            icon="add"
            :label="tr('common.add')"
            @click="openAdd"
          />
        </div>
        <div
          v-if="budgetStore.transactions.length === 0"
          class="empty-state"
          style="padding: var(--sp-8)"
        >
          <div class="empty-icon"><i class="ri-receipt-line" /></div>
          <p>{{ tr("budget.noTransactions") }}</p>
        </div>
        <div v-else class="tx-table-wrap">
          <table class="tx-table">
            <thead>
              <tr>
                <th>{{ tr("budget.vendorName") }}</th>
                <th>{{ tr("budget.category") }}</th>
                <th>Date</th>
                <th class="tx-th-right">{{ tr("budget.actualAmount") }}</th>
                <th>{{ tr("budget.paymentStatus") }}</th>
                <th class="tx-th-actions" />
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="tx in budgetStore.transactions"
                :key="tx.id"
                class="tx-row"
              >
                <td>
                  <div class="tx-desc-cell">
                    <span class="tx-icon"><i class="ri-store-2-line" /></span>
                    <span class="tx-desc">{{
                      tx.vendorName || tx.category
                    }}</span>
                  </div>
                </td>
                <td class="tx-muted">{{ tx.category }}</td>
                <td class="tx-muted">
                  {{
                    tx.createdAt
                      ? new Date(tx.createdAt).toLocaleDateString()
                      : "—"
                  }}
                </td>
                <td class="tx-th-right tx-val">
                  -${{ (tx.actualAmount || 0).toLocaleString() }}
                </td>
                <td>
                  <span
                    class="badge"
                    :class="
                      tx.paymentStatus === 'paid'
                        ? 'badge-success'
                        : tx.paymentStatus === 'partial'
                          ? 'badge-accent'
                          : 'badge-muted'
                    "
                    >{{ tx.paymentStatus }}</span
                  >
                </td>
                <td class="tx-th-actions" @click.stop>
                  <RTblBtns
                    :items="[
                      {
                        type: 'update',
                        icon: 'ri-edit-box-line',
                        label: tr('update'),
                      },
                      {
                        type: 'delete',
                        icon: 'ri-delete-bin-line',
                        label: tr('delete'),
                      },
                    ]"
                    @actionClick="
                      (type, item) =>
                        item.type == 'update'
                          ? openEdit(tx)
                          : confirmDeleteTx(tx)
                    "
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <!-- Add / Edit Drawer -->
      <RSlider
        v-model="showModal"
        :title="
          editingTx ? tr('budget.editTransaction') : tr('budget.addTransaction')
        "
        :icon="editingTx ? 'ri-edit-line' : 'ri-add-circle-line'"
        width-desktop="480px"
        width-tablet="92vw"
        @close="closeModal"
      >
        <RForm id="budget-form" class="drawer-form" novalidate @onSubmit="save">
          <RFormGroup
            :label="tr('budget.category')"
            :help="tr('budget.categoryPlaceholder')"
            required
          >
            <RInput
              v-model="form.category"
              :placeholder="tr('budget.categoryPlaceholder')"
              leading-icon="ri-price-tag-3-line"
            />
          </RFormGroup>
          <RFormGroup :label="tr('budget.vendorName')">
            <RInput
              v-model="form.vendorName"
              :placeholder="tr('budget.vendorName')"
              leading-icon="ri-store-2-line"
            />
          </RFormGroup>
          <div class="form-row-2">
            <RFormGroup :label="tr('budget.plannedAmount')">
              <RInput
                v-model.number="form.plannedAmount"
                type="number"
                :placeholder="'0'"
                leading-icon="ri-money-dollar-circle-line"
              />
            </RFormGroup>
            <RFormGroup :label="tr('budget.actualAmount')">
              <RInput
                v-model.number="form.actualAmount"
                type="number"
                :placeholder="'0'"
                leading-icon="ri-money-dollar-circle-line"
              />
            </RFormGroup>
          </div>
          <RFormGroup :label="tr('budget.paymentStatus')">
            <RSelect
              v-model="form.paymentStatus"
              :localData="{
                data: [
                  {
                    id: 'unpaid',
                    Name: tr('budget.unpaid'),
                    NameEnglish: tr('budget.unpaid'),
                    icon: 'ri-close-line',
                  },
                  {
                    id: 'partial',
                    Name: tr('budget.partial'),
                    NameEnglish: tr('budget.partial'),
                    icon: 'ri-error-warning-line',
                  },
                  {
                    id: 'paid',
                    Name: tr('budget.paid'),
                    NameEnglish: tr('budget.paid'),
                    icon: 'ri-check-line',
                  },
                ],
              }"
            />
          </RFormGroup>
          <RFormGroup :label="tr('budget.notes')">
            <RInput
              v-model="form.notes"
              type="textarea"
              :rows="3"
              :placeholder="tr('budget.notesPlaceholder')"
              leading-icon="ri-price-tag-3-line"
            />
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
            icon="save"
            :label="tr('common.save')"
            :loading="saving"
            @click="save"
            :disabled="saving"
          />
        </template>
      </RSlider>
    </div>
  </RWrapperPage>
</template>

<script setup>
import {
  Chart,
  PieController,
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
} from "chart.js";

Chart.register(
  PieController,
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
);

definePageMeta({
  layout: "navbar",
  middleware: ["auth", "permission"],
  title: "budget.title",
});

const {
  budgetStore,
  showModal,
  editingTx,
  saving,
  autoTranslate,
  deletingTx,
  deleting,
  form,
  pct,
  tr,
  init,
  openAdd,
  openEdit,
  closeModal,
  save,
  confirmDelete,
  doDelete,
} = useBudgetPage();

const confirm = useConfirmStore();
function confirmDeleteTx(item) {
  deletingTx.value = item;
  confirm.show({
    type: "delete",
    title: tr("budget.deleteTransaction"),
    message:
      tr("common.delete") +
      " " +
      (deletingTx?.value?.vendorName || deletingTx?.value?.category) +
      "?",
    icon: "warning",
    color: "error",
    onConfirm: async () => {
      await doDelete();
    },
  });
}

// --- Chart data prep (no store/API changes) ---
const CHART_COLORS = [
  "var(--c-accent)",
  "var(--c-info)",
  "var(--c-success)",
  "var(--c-danger)",
  "#a78bfa",
  "#f472b6",
  "#facc15",
  "#34d399",
];

// Chart.js needs resolved color strings, not raw CSS custom properties.
function resolveColor(value) {
  if (typeof value === "string" && value.startsWith("var(")) {
    const name = value.slice(4, -1).trim();
    const resolved = getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();
    return resolved || "#888";
  }
  return value;
}

// Adds alpha to ANY valid CSS color (hex, rgb(), hsl(), named) by letting
// the canvas 2D context normalize it, rather than assuming a 6-digit hex
// string and string-concatenating an alpha suffix onto it (which silently
// breaks — and desaturates every slice to the same fallback color — the
// moment a design token is defined as rgb()/hsl() instead of hex).
let alphaCtx = null;
function withAlpha(color, alpha) {
  if (!alphaCtx) alphaCtx = document.createElement("canvas").getContext("2d");
  alphaCtx.fillStyle = "#000";
  alphaCtx.fillStyle = color;
  const normalized = alphaCtx.fillStyle; // always "#rrggbb" for opaque input
  const hex = normalized.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const totalCategorySpent = computed(() =>
  budgetStore.categories.reduce((sum, c) => sum + (c.spent || 0), 0),
);

const categoryChartSegments = computed(() => {
  const total = totalCategorySpent.value;
  if (!total) return [];
  let cumulative = 0;
  return budgetStore.categories
    .filter((c) => (c.spent || 0) > 0)
    .map((cat, i) => {
      const value = cat.spent || 0;
      const percent = (value / total) * 100;
      const start = cumulative;
      cumulative += percent;
      return {
        id: cat.id,
        name: cat.name,
        value,
        percent,
        start,
        end: cumulative,
        color: CHART_COLORS[i % CHART_COLORS.length],
      };
    });
});

const pvaChartHeight = computed(() =>
  Math.max(140, budgetStore.categories.length * 44 + 24),
);

// --- Chart.js instances ---
const pieCanvas = ref(null);
const pvaCanvas = ref(null);
let pieChart = null;
let pvaChart = null;
const hoveredSegmentId = ref(null);

function setHoveredSegment(id) {
  hoveredSegmentId.value = id;
  renderPieChart();
}

function renderPieChart() {
  if (!pieCanvas.value) return;
  const segs = categoryChartSegments.value;
  const hovered = hoveredSegmentId.value;
  const data = {
    labels: segs.map((s) => s.name),
    datasets: [
      {
        data: segs.map((s) => s.value),
        backgroundColor: segs.map((s) => {
          const c = resolveColor(s.color);
          // Dim non-hovered slices when the person hovers a legend row —
          // ties the custom legend to the chart without Chart.js's own legend.
          if (hovered && s.id !== hovered) return withAlpha(c, 0.35);
          return c;
        }),
        borderColor: resolveColor("var(--c-surface)"),
        borderWidth: 3,
        hoverOffset: 10,
      },
    ],
  };
  if (pieChart) {
    pieChart.data = data;
    pieChart.update();
    return;
  }
  pieChart = new Chart(pieCanvas.value, {
    type: "pie",
    data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 400, animateRotate: true },
      plugins: {
        tooltip: {
          callbacks: {
            label: (ctx) =>
              `${ctx.label}: $${Number(ctx.parsed).toLocaleString()}`,
          },
        },
      },
    },
  });
}

function renderPvaChart() {
  if (!pvaCanvas.value) return;
  const cats = budgetStore.categories;
  const mutedColor = resolveColor("var(--c-muted)");
  const textColor = resolveColor("var(--c-text)");
  const gridColor = "rgba(255, 255, 255, 0.06)";
  // Each row is normalized to a 0-100 scale against its own planned/actual
  // max, not one shared max across all categories — otherwise one large
  // category (e.g. a $988M line item) flattens every smaller bar to
  // nothing. Tooltips still show the real dollar amount via rawValues.
  const rawPlanned = cats.map((c) => c.budget || 0);
  const rawActual = cats.map((c) => c.spent || 0);
  const rowMax = cats.map((c, i) => Math.max(rawPlanned[i], rawActual[i], 1));
  const data = {
    labels: cats.map((c) => c.name),
    datasets: [
      {
        label: tr("budget.plannedExpenses"),
        data: rawPlanned.map((v, i) => (v / rowMax[i]) * 100),
        rawValues: rawPlanned,
        backgroundColor: resolveColor("var(--c-info)"),
        borderRadius: 4,
        barThickness: 10,
      },
      {
        label: tr("budget.actualExpenses"),
        data: rawActual.map((v, i) => (v / rowMax[i]) * 100),
        rawValues: rawActual,
        backgroundColor: resolveColor("var(--c-accent)"),
        borderRadius: 4,
        barThickness: 10,
      },
    ],
  };
  if (pvaChart) {
    pvaChart.data = data;
    pvaChart.update();
    return;
  }
  pvaChart = new Chart(pvaCanvas.value, {
    type: "bar",
    data,
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 400 },
      scales: {
        x: {
          beginAtZero: true,
          max: 100,
          grid: { color: gridColor },
          ticks: {
            color: mutedColor,
            callback: (v) => v + "%",
          },
        },
        y: {
          grid: { display: false },
          ticks: { color: textColor },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const raw = ctx.dataset.rawValues[ctx.dataIndex];
              return `${ctx.dataset.label}: $${Number(raw).toLocaleString()}`;
            },
          },
        },
      },
    },
  });
}

function renderCharts() {
  nextTick(() => {
    renderPieChart();
    renderPvaChart();
  });
}

watch(categoryChartSegments, renderCharts, { deep: true });
watch(() => budgetStore.categories, renderCharts, { deep: true });

onMounted(async () => {
  await init();
  renderCharts();
});

onBeforeUnmount(() => {
  pieChart?.destroy();
  pvaChart?.destroy();
});
</script>

<style lang="scss">
.budget-page {
  display: flex;
  flex-direction: column;

  gap: var(--sp-3);

  width: 100%;
  min-width: 0;
  max-width: 100%;

  /* Viewport height minus header/navbar */
  min-height: calc(100vh - 86px);
  min-height: calc(100dvh - 86px);

  /*
   * Don't use overflow: hidden here.
   * The page must be able to grow and scroll when
   * there are many cards/transactions.
   */
  overflow-x: hidden;
  overflow-y: visible;

  box-sizing: border-box;

  @media (max-width: 1200px) {
    gap: var(--sp-4);
    scroll-behavior: smooth;
    scrollbar-width: thin;
    -webkit-overflow-scrolling: touch;
  }
}

/* ---------- Stat row ---------- */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--sp-3);
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 420px) {
    gap: var(--sp-2);
  }
}
.stat-card {
  background: var(--c-surface);
  // border: 1px solid var(--c-border);
  border-radius: var(--r-md);
  padding: var(--sp-4) var(--sp-5);
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
  min-width: 0;
}
.stat-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  i {
    font-size: 1.0625rem;
    color: var(--c-muted);
  }
}
.stat-label {
  font-size: 0.8125rem;
  color: var(--c-muted);
  font-weight: 500;
}
.stat-value {
  font-family: var(--font-700);
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  overflow-wrap: break-word;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.stat-caption {
  font-size: 0.75rem;
  color: var(--c-muted);
}
.stat-meter {
  height: 5px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  overflow: hidden;
  margin-top: 2px;
}
.stat-meter-fill {
  height: 100%;
  border-radius: 999px;
  background: var(--c-info);
  transition: width var(--t-base) var(--ease-out);
}

/* ---------- Main grid (chart + side panel) ---------- */
.main-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  align-items: start;
  gap: var(--sp-3);
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    .col-span-8,
    .col-span-4 {
      grid-column: auto;
    }
  }
}
.col-span-8 {
  grid-column: span 8;
}
.col-span-4 {
  grid-column: span 4;
}

.panel {
  background: var(--c-surface);
  // border: 1px solid var(--c-border);
  border-radius: var(--r-md);
  padding: var(--sp-5);
  min-width: 0;
  @media (max-width: 480px) {
    padding: var(--sp-4);
  }
}
.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--sp-2);
}
.panel-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--c-text);
}

/* ---------- Pie chart ---------- */
.pva-legend {
  display: flex;
  gap: var(--sp-4);
  font-size: 0.75rem;
  color: var(--c-muted);
}
.pva-chart-wrap {
  position: relative;
  width: 100%;
  margin-top: var(--sp-4);
  max-height: 320px;
  overflow-y: auto;
  scroll-behavior: smooth;
}
.pva-chart-inner {
  position: relative;
  width: 100%;
}

.pie-widget {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
  margin-top: var(--sp-2);
}
.pie-caption {
  display: flex;
  align-items: baseline;
  gap: var(--sp-2);
  flex-wrap: wrap;
}
.pie-caption-value {
  font-family: var(--font-700);
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.pie-caption-label {
  font-size: 0.75rem;
  color: var(--c-muted);
}
.pie-chart-wrap {
  position: relative;
  width: 100%;
  height: 160px;
  display: flex;
  justify-content: center;
}
.pie-chart-wrap canvas {
  max-width: 160px;
}
.pie-legend {
  display: flex;
  flex-direction: column;
  gap: 2px;

  max-height: 103px;

  overflow-y: auto;
  overflow-x: hidden;

  scroll-behavior: smooth;
}

/* Small screens */
@media (max-width: 640px) {
  .pie-legend {
    max-height: none;
    height: 100%;
  }
}
.legend-row {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  font-size: 0.8125rem;
}
.legend-row-interactive {
  padding: 6px var(--sp-2);
  margin: 0 calc(var(--sp-2) * -1);
  border-radius: var(--r-md);
  cursor: default;
  transition: background var(--t-fast);
  &:hover {
    background: rgba(255, 255, 255, 0.04);
  }
}
.legend-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}
.legend-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--c-text);
}
.legend-amount {
  font-size: 0.75rem;
  color: var(--c-muted);
  flex-shrink: 0;
}
.legend-pct {
  font-weight: 700;
  color: var(--c-muted);
  flex-shrink: 0;
  min-width: 34px;
  text-align: right;
}

/* ---------- Insight strip ---------- */
.summary-bar {
  background: var(--c-surface);
  // border: 1px dashed var(--c-border);
  border-radius: var(--r-md);
  padding: var(--sp-4) var(--sp-5);
  display: flex;
  align-items: center;
  gap: var(--sp-5);
  flex-wrap: wrap;
  position: relative;
}
.summary-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.summary-item-main {
  flex-direction: row;
  align-items: baseline;
  gap: var(--sp-2);
}
.summary-divider {
  width: 1px;
  align-self: stretch;
  background: var(--c-border);
  @media (max-width: 720px) {
    display: none;
  }
}
.summary-label {
  font-size: 0.75rem;
  color: var(--c-muted);
}
.summary-value {
  font-family: var(--font-700);
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.summary-value-sm {
  font-family: var(--font-700);
  font-size: 0.875rem;
  font-weight: 700;
  white-space: nowrap;
}
.live-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--c-success);
  margin-left: auto;
}
.live-dot-sm {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--c-success);
  animation: pulse-live 1.5s infinite;
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

/* ---------- Transactions table ---------- */

.tx-table-wrap {
  margin-top: var(--sp-3);

  /* Desktop */
  max-height: 185px;
  min-height: 120px;

  overflow-y: auto;
  overflow-x: hidden;

  scroll-behavior: smooth;
  scrollbar-width: thin;

  min-width: 0;

  -webkit-overflow-scrolling: touch;
}

/* =========================================================
   Smaller screens
   Show the complete transaction list
   ========================================================= */

@media (max-width: 1200px) {
  .tx-table-wrap {
    height: auto;
    min-height: 0;
    max-height: none;

    overflow-y: visible;
    overflow-x: hidden;

    scrollbar-width: none;
  }

  .tx-table-wrap::-webkit-scrollbar {
    display: none;
  }
}
.tx-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem;
}
.tx-table thead th {
  position: sticky;
  top: 0;
  background: var(--c-surface);
  text-align: left;
  font-weight: 600;
  color: var(--c-muted);
  font-size: 0.75rem;
  padding: var(--sp-2) var(--sp-3);
  border-bottom: 1px solid var(--c-border);
  white-space: nowrap;
}
.tx-th-right {
  text-align: right;
}
.tx-th-actions {
  width: 64px;
}
.tx-row {
  transition: background var(--t-fast);
  &:hover {
    background: rgba(255, 255, 255, 0.03);
  }
  td {
    padding: var(--sp-3);
    border-bottom: 1px solid var(--c-border);
    vertical-align: middle;
  }
}
.tx-desc-cell {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
}
.tx-icon {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-muted);
  flex-shrink: 0;
  font-size: 0.9375rem;
}
.tx-desc {
  font-weight: 600;
  color: var(--c-text);
  white-space: nowrap;
}
.tx-muted {
  color: var(--c-muted);
  white-space: nowrap;
}
.tx-val {
  font-weight: 700;
  color: var(--c-danger);
  white-space: nowrap;
}
.badge {
  border-radius: 999px;
}

/* Drawer */
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
.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-3);
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

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--sp-3);
  text-align: center;
  p {
    font-size: 0.875rem;
    color: var(--c-muted);
  }
}
.empty-icon {
  font-size: 2rem;
  color: var(--c-muted);
  opacity: 0.4;
}
</style>
