<template>
  <RWrapperPage class="qr-center">
    <RPageHeader title="QR Command Center" subtitle="One scan — check-in, gift, seating, attendance" />

    <div class="qrc-layout">
      <!-- Left: scanner + lookup -->
      <div class="qrc-scanner-col animate-fade-up">
        <div class="qrc-card glass-card">
          <div class="qrc-section-label">Scan or lookup</div>

          <QrScanner @scanned="onScanned" />

          <!-- QR input -->
          <div class="qrc-field">
            <i class="ri-qr-code-line qrc-field-icon" />
            <input
              v-model="qrInput"
              class="input qrc-input"
              :placeholder="scanning ? 'Looking up…' : '🔲 Paste QR code…'"
              :disabled="scanning"
              autocomplete="off"
              @keydown.enter.prevent="lookupQr"
            />
            <button v-if="qrInput" class="qrc-inline-btn" :disabled="scanning" @click="lookupQr">
              <i v-if="scanning" class="ri-loader-4-line animate-spin" />
              <i v-else class="ri-arrow-right-line" />
            </button>
          </div>

          <div class="qrc-divider">— or search by name —</div>

          <!-- Name search -->
          <div class="qrc-field">
            <i class="ri-search-line qrc-field-icon" />
            <input
              v-model="nameSearch"
              class="input qrc-input"
              placeholder="Type guest name…"
              autocomplete="off"
              @input="onNameSearch"
              @keydown.escape="nameResults = []"
            />
            <div v-if="nameResults.length" class="qrc-dropdown">
              <button
                v-for="g in nameResults"
                :key="g.id"
                class="qrc-drop-item"
                @mousedown.prevent="selectGuest(g)"
              >
                <span class="qrc-drop-name">{{ g.name }}</span>
                <span class="qrc-drop-meta">{{ g.status }}<span v-if="g.totalGuests"> · {{ g.totalGuests }} pax</span></span>
              </button>
            </div>
          </div>
        </div>

        <!-- Recent activity -->
        <div v-if="recent.length" class="qrc-recent glass-card">
          <div class="qrc-section-label">Recent</div>
          <RTable
            :key="`qr-recent-${recent.length > 0 ? 'loaded' : 'empty'}`"
            :columns="recentCols"
            :data="recent"
            :options="{ searchable: false, paging: false }"
            @reloadByFixedData="checkinStore.fetchLogs()"
          >
            <template #guestName="{ rowData }">
              <div class="qrc-recent-name-cell">
                <div class="qrc-recent-avatar">{{ (rowData.guestName?.[0] || '?').toUpperCase() }}</div>
                <span class="qrc-recent-name">{{ rowData.guestName }}</span>
              </div>
            </template>
            <template #actions="{ rowData }">
              <div class="qrc-recent-acts">
                <span v-for="act in rowData.actions" :key="act" class="qrc-act-chip">{{ act }}</span>
              </div>
            </template>
            <template #time="{ rowData }">
              <span class="qrc-recent-time">{{ rowData.time }}</span>
            </template>
          </RTable>
        </div>
      </div>

      <!-- Right: result panel -->
      <div class="qrc-result-col">
        <!-- Scanning spinner -->
        <div v-if="scanning" class="qrc-empty glass-card animate-fade-up">
          <i class="ri-loader-4-line animate-spin" style="font-size:2rem;color:var(--c-accent)" />
          <p class="text-muted">Looking up guest…</p>
        </div>

        <!-- Empty state -->
        <div v-else-if="!result" class="qrc-empty glass-card animate-fade-up">
          <i class="ri-qr-scan-2-line" style="font-size:3rem;color:var(--c-muted);opacity:0.4" />
          <p class="text-muted" style="font-size:0.9375rem;font-weight:600">Scan a guest QR code</p>
          <div class="qrc-purposes-grid">
            <div v-for="p in purposes" :key="p.label" class="qrc-purpose">
              <span>{{ p.icon }}</span>
              <span>{{ p.label }}</span>
            </div>
          </div>
        </div>

        <!-- Result card -->
        <div v-else class="qrc-result animate-fade-up">

          <!-- Guest identity -->
          <div class="qrc-guest-card glass-card" :class="{ 'qrc-attended': result.currentStatus === 'ATTENDED' }">
            <div class="qrc-guest-row">
              <div class="qrc-avatar">{{ (result.guestName?.[0] || '?').toUpperCase() }}</div>
              <div class="qrc-guest-info">
                <div class="qrc-guest-name">{{ result.guestName }}</div>
                <div class="qrc-guest-meta">
                  <span class="badge badge-sm" :class="statusBadgeClass(result.currentStatus)">
                    {{ result.currentStatus }}
                  </span>
                  <span v-if="result.totalGuests" class="qrc-meta-chip">👥 {{ result.totalGuests }} pax</span>
                  <span v-if="result.sideFamily" class="qrc-meta-chip">{{ result.sideFamily }} side</span>
                </div>
              </div>
              <button class="btn-icon btn-xs-icon" @click="clearResult"><i class="ri-close-line" /></button>
            </div>

            <!-- Message -->
            <p v-if="result.message" class="qrc-message">{{ result.message }}</p>

            <!-- Seating inline -->
            <div v-if="result.tableNumber" class="qrc-seat-badge">
              🪑 Table {{ result.tableNumber }}<span v-if="result.tableName"> · {{ result.tableName }}</span>
            </div>

            <!-- Check-in timestamp -->
            <div v-if="result.checkedInAt" class="qrc-checkin-time">
              ✅ Checked in {{ fmtTime(result.checkedInAt) }}
            </div>
          </div>

          <!-- ── RSVP actions ── -->
          <div v-if="can('RSVP_CONFIRM') || can('RSVP_DECLINE')" class="qrc-action-card glass-card">
            <div class="qrc-section-label">RSVP</div>
            <div class="qrc-btn-row">
              <button
                v-if="can('RSVP_CONFIRM')"
                class="btn-primary qrc-action-btn"
                :disabled="acting === 'rsvp_confirm'"
                @click="rsvpConfirm"
              >
                <i v-if="acting === 'rsvp_confirm'" class="ri-loader-4-line animate-spin" />
                <template v-else>✅ Confirm RSVP</template>
              </button>
              <button
                v-if="can('RSVP_DECLINE')"
                class="btn-danger qrc-action-btn"
                :disabled="acting === 'rsvp_decline'"
                @click="rsvpDecline"
              >
                <i v-if="acting === 'rsvp_decline'" class="ri-loader-4-line animate-spin" />
                <template v-else>❌ Decline</template>
              </button>
            </div>
          </div>

          <!-- ── Check-in ── -->
          <div v-if="can('CHECKIN')" class="qrc-action-card glass-card">
            <div class="qrc-section-label">Check-in</div>
            <button
              class="btn-primary qrc-action-btn qrc-action-btn--full"
              :disabled="acting === 'checkin'"
              @click="doCheckin"
            >
              <i v-if="acting === 'checkin'" class="ri-loader-4-line animate-spin" />
              <template v-else>🚪 Check In Now</template>
            </button>
          </div>

          <!-- ── Gift — one-tap presets ── -->
          <div v-if="can('RECORD_GIFT')" class="qrc-action-card glass-card">
            <div class="qrc-section-label">Record Gift</div>
            <div class="qrc-tap-label">Tap amount to save instantly</div>
            <div class="qrc-tap-grid">
              <button
                v-for="p in giftPresets"
                :key="p"
                class="qrc-tap-btn"
                :disabled="!!acting"
                @click="tapGift(p)"
              >
                <i v-if="acting === `gift_${p}`" class="ri-loader-4-line animate-spin" />
                <template v-else>${{ p }}</template>
              </button>
            </div>
            <button
              class="qrc-tap-gift-btn"
              :disabled="!!acting"
              @click="tapPhysical"
            >
              <i v-if="acting === 'gift_physical'" class="ri-loader-4-line animate-spin" />
              <template v-else>🎁 Physical Gift</template>
            </button>
            <!-- Custom amount -->
            <div class="qrc-custom-row">
              <div class="qrc-field" style="flex:1">
                <i class="ri-money-dollar-circle-line qrc-field-icon" />
                <input
                  v-model="giftAmount"
                  type="number"
                  min="0"
                  class="input qrc-input"
                  placeholder="Custom amount…"
                  @keydown.enter.prevent="tapGift(null)"
                />
              </div>
              <input
                v-model="giftNote"
                class="input qrc-input"
                style="flex:1"
                placeholder="Note (optional)"
              />
              <button
                class="btn-primary"
                :disabled="!!acting || !giftAmount"
                style="white-space:nowrap;padding:10px 18px"
                @click="tapGift(null)"
              >
                <i v-if="acting === 'gift_custom'" class="ri-loader-4-line animate-spin" />
                <template v-else>✔ Save</template>
              </button>
            </div>

            <!-- Gift history for this guest -->
            <div v-if="result.giftHistory?.length" class="qrc-gift-history">
              <div class="qrc-history-label">Gift history · ${{ result.totalGiftAmount?.toFixed(2) ?? '0.00' }} total</div>
              <RTable
                :key="`qr-gifts-${giftRows.length > 0 ? 'loaded' : 'empty'}`"
                :columns="giftHistoryCols"
                :data="giftRows"
                :options="{ searchable: false, paging: false }"
                @reloadByFixedData="() => {}"
              >
                <template #giftType="{ rowData }">
                  <span class="qrc-history-type">{{ rowData.giftType }}</span>
                </template>
                <template #description="{ rowData }">
                  <span class="qrc-history-desc">{{ rowData.description || '—' }}</span>
                </template>
                <template #amount="{ rowData }">
                  <span class="qrc-history-amount">${{ rowData.amount ?? '—' }}</span>
                </template>
                <template #receivedAt="{ rowData }">
                  <span class="qrc-history-time">{{ fmtTime(rowData.receivedAt) }}</span>
                </template>
              </RTable>
            </div>
          </div>

          <!-- ── Seating detail ── -->
          <div v-if="can('VIEW_SEATING') && result.tableNumber" class="qrc-action-card glass-card">
            <div class="qrc-section-label">Seating</div>
            <div class="qrc-seat-card">
              <div class="qrc-seat-num">{{ result.tableNumber }}</div>
              <div v-if="result.tableName" class="qrc-seat-name">{{ result.tableName }}</div>
            </div>
          </div>

          <!-- ── Attendance ── -->
          <div v-if="result.totalExpected > 0" class="qrc-action-card glass-card">
            <div class="qrc-section-label">Attendance</div>
            <div class="qrc-att-row">
              <span class="qrc-att-val">{{ result.totalAttended }}</span>
              <span class="qrc-att-sep">/ {{ result.totalExpected }}</span>
              <span class="qrc-att-pct">{{ attPct }}%</span>
            </div>
            <div class="qrc-progress-bar">
              <div class="qrc-progress-fill" :style="{ width: attPct + '%' }" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </RWrapperPage>
</template>

<script setup>
definePageMeta({
  layout: 'navbar',
  middleware: ['auth', 'permission'],
  permission: 'VIEW_GUEST',
})

const { tBy } = useSarikaLocale()
const toast = useToastStore()
const guestStore = useGuestStore()
const eventStore = useEventStore()
const checkinStore = useCheckinStore()

// ── State ─────────────────────────────────────────────────────────────────────
const qrInput   = ref('')
const nameSearch = ref('')
const nameResults = ref([])
const scanning  = ref(false)
const acting    = ref(null) // which action is in-flight
const result    = ref(null)
const giftAmount = ref('')
const giftNote   = ref('')
const recent    = ref([])

const giftPresets = [10, 20, 50, 100, 200]

const recentCols = [
  { key: 'guestName', label: 'Guest' },
  { key: 'actions', label: 'Actions' },
  { key: 'time', label: 'Time', align: 'right' },
]

const giftHistoryCols = [
  { key: 'giftType', label: 'Type', width: '80px' },
  { key: 'description', label: 'Note' },
  { key: 'amount', label: 'Amount', align: 'right', width: '90px' },
  { key: 'receivedAt', label: 'Time', align: 'right', width: '80px' },
]

const giftRows = computed(() =>
  result.value?.giftHistory?.map((g, i) => ({ ...g, _idx: i })) ?? []
)

const purposes = [
  { icon: '💌', label: 'Invitation' },
  { icon: '✅', label: 'Check-in' },
  { icon: '🎁', label: 'Gift' },
  { icon: '🪑', label: 'Seating' },
  { icon: '📊', label: 'Attendance' },
]

// ── Computed ──────────────────────────────────────────────────────────────────
const attPct = computed(() => {
  if (!result.value?.totalExpected) return 0
  return Math.round((result.value.totalAttended / result.value.totalExpected) * 100)
})

const can = (action) => result.value?.availableActions?.includes(action)

// ── Lookup ────────────────────────────────────────────────────────────────────

// QR images encode the full invite/qr URL — extract just the last path segment
const extractQrCode = (raw) => {
  const s = raw?.trim() ?? ''
  try {
    const url = new URL(s)
    const segments = url.pathname.split('/').filter(Boolean)
    return segments[segments.length - 1] || s
  } catch {
    return s
  }
}

const onScanned = async (code) => {
  qrInput.value = code
  await lookupQr()
}

const lookupQr = async () => {
  const code = extractQrCode(qrInput.value)
  if (!code || scanning.value) return
  scanning.value = true
  try {
    const { data, error } = await useHttp(`/api/v1/qr/${code}`, { method: 'GET', isGlobal: true })
    if (error?.value || !data.value) { toast.add('Guest not found for this QR code', 'Not Found'); return }
    result.value = data.value?.data ?? data.value
    qrInput.value = ''
    nameSearch.value = ''
    nameResults.value = []
  } catch { toast.add('Failed to look up QR code', 'Error') }
  finally { scanning.value = false }
}

const onNameSearch = () => {
  const q = nameSearch.value.trim().toLowerCase()
  if (!q) { nameResults.value = []; return }
  nameResults.value = (guestStore.guests ?? []).filter(g => g.name.toLowerCase().includes(q)).slice(0, 6)
}

const selectGuest = async (g) => {
  nameResults.value = []
  nameSearch.value = g.name
  if (g.qrCode) {
    qrInput.value = g.qrCode
    await lookupQr()
  } else {
    // No QR — build a minimal result from GuestResponse fields
    result.value = {
      guestId: g.id,
      guestName: g.name,
      currentStatus: g.status,
      totalGuests: g.totalGuests,
      qrCode: null,
      availableActions: g.status !== 'DECLINED' ? ['RECORD_GIFT'] : [],
    }
  }
}

const clearResult = () => {
  result.value = null
  giftAmount.value = ''
  giftNote.value = ''
  nameSearch.value = ''
}

// ── Actions ───────────────────────────────────────────────────────────────────
const refresh = async () => {
  const code = result.value?.qrCode
  if (!code) return
  const { data } = await useHttp(`/api/v1/qr/${code}`, { method: 'GET', isGlobal: true })
  if (data.value) result.value = data.value?.data ?? data.value
}

const pushRecent = (guestName, actions) => {
  recent.value.unshift({ id: Date.now(), guestName, actions, time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) })
  if (recent.value.length > 8) recent.value.pop()
}

const rsvpConfirm = async () => {
  const code = result.value?.qrCode
  if (!code) return
  acting.value = 'rsvp_confirm'
  try {
    const { data, error } = await useHttp(`/api/v1/qr/${code}/rsvp/confirm`, { method: 'POST', isGlobal: true })
    if (error?.value) { toast.add('RSVP failed', 'Error'); return }
    result.value = data.value?.data ?? data.value
    toast.add(`${result.value.guestName} RSVP confirmed`, 'RSVP')
    pushRecent(result.value.guestName, ['✅ RSVP'])
  } finally { acting.value = null }
}

const rsvpDecline = async () => {
  const code = result.value?.qrCode
  if (!code) return
  acting.value = 'rsvp_decline'
  try {
    const { data, error } = await useHttp(`/api/v1/qr/${code}/rsvp/decline`, { method: 'POST', isGlobal: true })
    if (error?.value) { toast.add('Failed', 'Error'); return }
    result.value = data.value?.data ?? data.value
    toast.add(`${result.value.guestName} declined`, 'RSVP')
    pushRecent(result.value.guestName, ['❌ Declined'])
  } finally { acting.value = null }
}

const doCheckin = async () => {
  const wid = eventStore.activeEvent?.id
  const code = result.value?.qrCode
  if (!wid || !code) return
  acting.value = 'checkin'
  try {
    const { error } = await useHttp(`/api/v1/events/${wid}/checkin/qr/${code}`, { method: 'POST', isGlobal: true })
    if (error?.value) { toast.add('Check-in failed', 'Error'); return }
    await refresh()
    toast.add(`${result.value?.guestName} checked in`, 'Check-in')
    pushRecent(result.value?.guestName, ['🚪 Checked in'])
    checkinStore.fetchLogs()
  } finally { acting.value = null }
}

const doGift = async (amount, giftType, description) => {
  const code = result.value?.qrCode
  const guestId = result.value?.guestId
  const wid = eventStore.activeEvent?.id
  if (!wid) return

  if (code) {
    const { data, error } = await useHttp(`/api/v1/qr/${code}/gift`, {
      method: 'POST',
      body: { amount: amount ?? null, giftType, description: description || null },
      isGlobal: true,
    })
    if (error?.value) { toast.add('Failed to record gift', 'Error'); return false }
    result.value = data.value?.data ?? data.value
  } else {
    const { error } = await useHttp(`/api/v1/events/${wid}/gifts`, {
      method: 'POST',
      body: { guestId, amount: amount ?? null, giftType, description: description || null },
      isGlobal: true,
    })
    if (error?.value) { toast.add('Failed to record gift', 'Error'); return false }
  }
  return true
}

const tapGift = async (preset) => {
  const amt = preset ?? parseFloat(giftAmount.value)
  if (!amt && preset === null) return
  acting.value = preset ? `gift_${preset}` : 'gift_custom'
  try {
    const ok = await doGift(amt, 'CASH', giftNote.value)
    if (!ok) return
    const label = `$${amt}`
    const checkedIn = result.value?.action === 'GIFT_RECORDED' || result.value?.currentStatus === 'ATTENDED'
    toast.add(`${result.value?.guestName} — ${label} recorded${checkedIn ? ' · ✅ Checked in' : ''}`, 'Gift')
    pushRecent(result.value?.guestName, [label, ...(checkedIn ? ['✅'] : [])])
    giftAmount.value = ''
    giftNote.value = ''
  } finally { acting.value = null }
}

const tapPhysical = async () => {
  acting.value = 'gift_physical'
  try {
    const ok = await doGift(null, 'GIFT', giftNote.value)
    if (!ok) return
    toast.add(`${result.value?.guestName} — Physical gift recorded`, 'Gift')
    pushRecent(result.value?.guestName, ['🎁 Gift'])
    giftNote.value = ''
  } finally { acting.value = null }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtTime = (dt) => {
  if (!dt) return '—'
  return new Date(dt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

const statusBadgeClass = (s) => ({
  ATTENDED: 'badge-success',
  CONFIRMED: 'badge-info',
  INVITED: 'badge-accent',
  DECLINED: 'badge-danger',
  NO_SHOW: 'badge-danger',
}[s] ?? '')

const { init } = useEventPage(async () => {
  if (!guestStore.guests?.length) await guestStore.fetchGuests()
})
onMounted(init)
</script>

<style lang="scss" scoped>
.qr-center { display: flex; flex-direction: column; gap: var(--sp-6); }

.qrc-layout {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: var(--sp-5);
  align-items: start;
  @media (max-width: 860px) { grid-template-columns: 1fr; }
}

.qrc-scanner-col { display: flex; flex-direction: column; gap: var(--sp-4); }
.qrc-result-col { display: flex; flex-direction: column; gap: var(--sp-4); }

.qrc-card {
  padding: var(--sp-5);
  border-radius: var(--r-2xl);
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
}

.qrc-section-label {
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--c-muted);
}

.qrc-field {
  position: relative;
  display: flex;
  align-items: center;
  .qrc-field-icon {
    position: absolute;
    left: 12px;
    color: var(--c-muted);
    font-size: 0.95rem;
    pointer-events: none;
  }
}

.qrc-input { padding-left: 2.25rem !important; width: 100%; }

.qrc-inline-btn {
  position: absolute; right: 8px;
  width: 28px; height: 28px;
  border-radius: var(--r-md);
  background: rgba(255,140,66,0.12);
  border: 1px solid rgba(255,140,66,0.2);
  color: var(--c-accent);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 0.9rem;
  &:disabled { opacity: 0.4; cursor: not-allowed; }
}

.qrc-divider {
  text-align: center; font-size: 0.75rem; color: var(--c-muted);
  position: relative;
  &::before, &::after {
    content: ''; position: absolute; top: 50%;
    width: 28%; height: 1px; background: var(--c-border);
  }
  &::before { left: 0; } &::after { right: 0; }
}

.qrc-dropdown {
  position: absolute; top: calc(100% + 4px); left: 0; right: 0;
  background: var(--c-surface-2); border: 1px solid var(--c-border);
  border-radius: var(--r-lg); overflow: hidden; z-index: 50;
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}

.qrc-drop-item {
  width: 100%; text-align: left; padding: 9px 14px;
  display: flex; align-items: center; justify-content: space-between;
  gap: var(--sp-3); background: none; border: none; cursor: pointer;
  font-family: inherit; border-bottom: 1px solid var(--c-border);
  transition: background var(--t-fast);
  &:last-child { border-bottom: none; }
  &:hover { background: rgba(255,140,66,0.06); }
}
.qrc-drop-name { font-size: 0.875rem; font-weight: 600; color: var(--c-text); }
.qrc-drop-meta { font-size: 0.75rem; color: var(--c-muted); }

// ── Empty / loading ──────────────────────────────────────────────────────────
.qrc-empty {
  padding: var(--sp-10) var(--sp-6);
  border-radius: var(--r-2xl);
  display: flex; flex-direction: column; align-items: center;
  gap: var(--sp-4); text-align: center;
}

.qrc-purposes-grid {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: var(--sp-3);
  width: 100%; margin-top: var(--sp-2);
  @media (max-width: 500px) { grid-template-columns: repeat(3, 1fr); }
}

.qrc-purpose {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: var(--sp-3); border-radius: var(--r-lg);
  background: rgba(255,255,255,0.04); font-size: 0.75rem;
  color: var(--c-muted);
  span:first-child { font-size: 1.25rem; }
}

// ── Result ───────────────────────────────────────────────────────────────────
.qrc-result { display: flex; flex-direction: column; gap: var(--sp-4); }

.qrc-guest-card {
  padding: var(--sp-5);
  border-radius: var(--r-2xl);
  border: 1px solid rgba(255,140,66,0.15);
  display: flex; flex-direction: column; gap: var(--sp-3);
  &.qrc-attended { border-color: rgba(74,222,128,0.25); background: rgba(74,222,128,0.04); }
}

.qrc-guest-row { display: flex; align-items: center; gap: var(--sp-4); }

.qrc-avatar {
  width: 52px; height: 52px; border-radius: var(--r-xl); flex-shrink: 0;
  background: linear-gradient(135deg, rgba(255,140,66,0.25), rgba(212,168,67,0.25));
  color: var(--c-accent);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.375rem; font-weight: 800; font-family: var(--font-800);
  border: 1px solid rgba(255,140,66,0.2);
}

.qrc-guest-info { flex: 1; min-width: 0; }
.qrc-guest-name { font-family: var(--font-700); font-size: 1.125rem; font-weight: 700; color: var(--c-text); }
.qrc-guest-meta { display: flex; align-items: center; gap: var(--sp-2); flex-wrap: wrap; margin-top: 4px; }
.qrc-meta-chip { font-size: 0.8125rem; color: var(--c-muted); }

.qrc-message { font-size: 0.875rem; color: var(--c-muted); font-style: italic; }

.qrc-seat-badge {
  font-size: 0.875rem; font-weight: 600; color: var(--c-accent);
  background: rgba(255,140,66,0.08); border: 1px solid rgba(255,140,66,0.2);
  border-radius: var(--r-lg); padding: 6px 12px; display: inline-block;
}

.qrc-checkin-time {
  font-size: 0.8125rem; color: var(--c-success);
  display: flex; align-items: center; gap: 6px;
}

// ── Action cards ─────────────────────────────────────────────────────────────
.qrc-action-card {
  padding: var(--sp-5);
  border-radius: var(--r-2xl);
  display: flex; flex-direction: column; gap: var(--sp-4);
}

.qrc-btn-row { display: flex; gap: var(--sp-3); }

.qrc-action-btn {
  flex: 1; padding: 13px;
  font-size: 0.9375rem; font-weight: 700; font-family: var(--font-700);
  &--full { width: 100%; }
}

// ── Tap gift grid ─────────────────────────────────────────────────────────────
.qrc-tap-label {
  font-size: 0.6875rem; color: var(--c-muted);
  text-align: center; letter-spacing: 0.05em;
}

.qrc-tap-grid {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: var(--sp-2);
  @media (max-width: 500px) { grid-template-columns: repeat(3, 1fr); }
}

.qrc-tap-btn {
  padding: 18px 8px; border-radius: var(--r-xl);
  border: 1px solid rgba(255,140,66,0.2);
  background: rgba(255,140,66,0.07);
  color: var(--c-accent); font-size: 1rem; font-weight: 700;
  font-family: var(--font-700); cursor: pointer; transition: all 0.12s; text-align: center;
  &:hover:not(:disabled) { background: rgba(255,140,66,0.18); border-color: rgba(255,140,66,0.45); transform: scale(1.04); }
  &:active:not(:disabled) { transform: scale(0.97); }
  &:disabled { opacity: 0.45; cursor: not-allowed; }
}

.qrc-tap-gift-btn {
  width: 100%; padding: 14px; border-radius: var(--r-xl);
  border: 1px solid rgba(139,92,246,0.25); background: rgba(139,92,246,0.08);
  color: #a78bfa; font-size: 0.9375rem; font-weight: 700;
  font-family: var(--font-700); cursor: pointer; transition: all 0.12s; text-align: center;
  &:hover:not(:disabled) { background: rgba(139,92,246,0.16); border-color: rgba(139,92,246,0.4); }
  &:active:not(:disabled) { transform: scale(0.98); }
  &:disabled { opacity: 0.45; cursor: not-allowed; }
}

.qrc-custom-row { display: flex; align-items: center; gap: var(--sp-3); }

// ── Gift history ──────────────────────────────────────────────────────────────
.qrc-gift-history {
  border-top: 1px solid var(--c-border); padding-top: var(--sp-3);
  display: flex; flex-direction: column; gap: var(--sp-2);
}
.qrc-history-label { font-size: 0.75rem; font-weight: 600; color: var(--c-muted); margin-bottom: var(--sp-1); }
.qrc-history-type { color: var(--c-accent); font-weight: 600; }
.qrc-history-desc { color: var(--c-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.qrc-history-amount { color: var(--c-text); font-weight: 700; }
.qrc-history-time { color: var(--c-muted); font-size: 0.75rem; }

// ── Seating card ─────────────────────────────────────────────────────────────
.qrc-seat-card {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: var(--sp-5); border-radius: var(--r-xl);
  background: rgba(255,140,66,0.06); border: 1px solid rgba(255,140,66,0.15);
}
.qrc-seat-num { font-size: 3rem; font-weight: 800; font-family: var(--font-800); color: var(--c-accent); line-height: 1; }
.qrc-seat-name { font-size: 0.9375rem; color: var(--c-muted); }

// ── Attendance ───────────────────────────────────────────────────────────────
.qrc-att-row { display: flex; align-items: baseline; gap: var(--sp-2); }
.qrc-att-val { font-size: 2rem; font-weight: 800; font-family: var(--font-800); color: var(--c-text); }
.qrc-att-sep { font-size: 1rem; color: var(--c-muted); }
.qrc-att-pct { font-size: 0.875rem; font-weight: 700; color: var(--c-accent); margin-left: auto; }
.qrc-progress-bar {
  height: 6px; border-radius: 99px; background: rgba(255,255,255,0.06); overflow: hidden;
}
.qrc-progress-fill {
  height: 100%; border-radius: 99px;
  background: linear-gradient(90deg, var(--c-accent), #d4a843);
  transition: width 0.5s ease;
}

// ── Recent ────────────────────────────────────────────────────────────────────
.qrc-recent {
  padding: var(--sp-4) var(--sp-5);
  border-radius: var(--r-2xl);
  display: flex; flex-direction: column; gap: var(--sp-3);
}

.qrc-recent-name-cell { display: flex; align-items: center; gap: var(--sp-2); }

.qrc-recent-avatar {
  width: 28px; height: 28px; border-radius: var(--r-md); flex-shrink: 0;
  background: rgba(255,140,66,0.12); color: var(--c-accent);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.8125rem; font-weight: 700;
}

.qrc-recent-name { font-size: 0.875rem; font-weight: 600; color: var(--c-text); }
.qrc-recent-acts { display: flex; gap: 4px; flex-wrap: wrap; }

.qrc-act-chip {
  font-size: 0.6875rem; font-weight: 600; color: var(--c-accent);
  background: rgba(255,140,66,0.1); border-radius: 99px; padding: 2px 7px;
}

.qrc-recent-time { font-size: 0.75rem; color: var(--c-muted); }
</style>
