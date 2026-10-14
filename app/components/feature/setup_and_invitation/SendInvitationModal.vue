<script setup>
// components/modals/SendInvitationModal.vue
// ─────────────────────────────────────────────────────────────────────────────
// Three-step modal:
//   Step 1 — Select guests  (search, filter by status, select all)
//   Step 2 — Choose channel (In-app link · WhatsApp · Telegram · Facebook · Copy)
//   Step 3 — Sending progress + result
// ─────────────────────────────────────────────────────────────────────────────

// ── Props / Emits ─────────────────────────────────────────────────────────
const props = defineProps(['modelValue', 'data', 'inviteBaseUrl'])

const data = computed(() => props.data)
const inviteBaseUrl = computed(() => props.inviteBaseUrl)
const { tr } = useTr()
const emit = defineEmits('update:modelValue', 'sent')

const show = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

// ── Store ─────────────────────────────────────────────────────────────────
const guestStore  = useGuestStore()
const toast       = useToastStore()
const http        = useHttp()

mounted( async () => {
  const { guests } = guestStore
  await guestStore.fetchGuests()
})
const guests     = computed(() => guestStore.guests ?? [])
const search     = ref('')
const filterStatus = ref('all')

const filtered = computed(() =>
  guests.value.filter(g => {
    const q = search.value.toLowerCase()
    const matchQ = !q || g.name.toLowerCase().includes(q) || (g.nameKm ?? '').includes(q)
      || (g.phone ?? '').includes(q)
    const matchS = filterStatus.value === 'all' || g.status === filterStatus.value
    return matchQ && matchS
  })
)

const selected  = ref(new Set())
const allChecked = computed(() =>
  filtered.value.length > 0 && filtered.value.every(g => selected.value.has(g.id))
)
const someChecked = computed(() =>
  filtered.value.some(g => selected.value.has(g.id)) && !allChecked.value
)

function toggleAll() {
  if (allChecked.value) {
    filtered.value.forEach(g => selected.value.delete(g.id))
  } else {
    filtered.value.forEach(g => selected.value.add(g.id))
  }
  // trigger reactivity
  selected.value = new Set(selected.value)
}

function toggle(id) {
  const s = new Set(selected.value)
  s.has(id) ? s.delete(id) : s.add(id)
  selected.value = s
}

const channels = [
  { key: 'inapp',    labelEn: 'In-App Link',  labelKm: 'តំណក្នុងApp',   icon: 'ri-link-m',          color: '#ff8c42', available: true  },
  { key: 'whatsapp', labelEn: 'WhatsApp',      labelKm: 'WhatsApp',       icon: 'ri-whatsapp-line',   color: '#25d366', available: true  },
  { key: 'telegram', labelEn: 'Telegram',      labelKm: 'Telegram',       icon: 'ri-telegram-line',   color: '#2ca5e0', available: true  },
  { key: 'facebook', labelEn: 'Facebook',      labelKm: 'Facebook',       icon: 'ri-facebook-circle-line', color: '#1877f2', available: true  },
  { key: 'copy',     labelEn: 'Copy Link',     labelKm: 'ចម្លងតំណ',      icon: 'ri-clipboard-line',  color: '#8a7f72', available: true  },
  { key: 'sms',      labelEn: 'SMS',           labelKm: 'SMS',            icon: 'ri-message-2-line',  color: '#4ade80', available: false },
]

const selectedChannels = ref(new Set(['whatsapp', 'telegram']))

function toggleChannel(key) {
  const s = new Set(selectedChannels.value)
  s.has(key) ? s.delete(key) : s.add(key)
  selectedChannels.value = s
}

const step = ref(1)

const inviteUrl = computed(() =>
  props.inviteBaseUrl ?? `${typeof window !== 'undefined' ? window.location.origin : ''}/invite/view`
)

const shareText = computed(() =>
  `🎊 ${data.value?.title}\n` +
  `${data.value?.host1Name} ❤ ${data.value?.host2Name}\n` +
  `📅 ${data.value?.weddingDate}\n` +
  `📍 ${data.value?.venue}\n\n` +
  `👉 ${inviteUrl.value}`
)

async function copyLink() {
  await navigator.clipboard.writeText(inviteUrl.value)
  toast.add(tBy({ en: 'Link copied!', km: 'បានចម្លងតំណ!' }))
}

function shareWhatsApp(text) {
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
}

function shareTelegram(text) {
  window.open(`https://t.me/share/url?url=${encodeURIComponent(inviteUrl.value)}&text=${encodeURIComponent(text)}`, '_blank')
}

function shareFacebook() {
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(inviteUrl.value)}`, '_blank', 'width=600,height=400')
}

// ── Sending state ─────────────────────────────────────────────────────────
const sending     = ref(false)
const sendResults = ref([])
const sendProgress = ref(0)

async function startSend() {
  if (selected.value.size === 0) return
  step.value     = 3
  sending.value  = true
  sendResults.value = []
  sendProgress.value = 0

  const ids    = [...selected.value]
  const total  = ids.length

  for (let i = 0; i < ids.length; i++) {
    const id    = ids[i]
    const guest = guests.value.find(g => g.id === id)

    try {
      // ── Real API call ──────────────────────────────────────────────────
      // Sends the invitation to the guest via the selected channels.
      // Replace the endpoint path with your actual route.
      await useHttp('/api/invitations/send', {
        method: 'POST',
        data:{
          guestId:  id,
          channels: [...selectedChannels.value],
          inviteUrl: inviteUrl.value,
          letterSnapshot: {
            title:       data.value?.title,
            groomName:   data.value?.host1Name,
            brideName:   data.value?.host2Name,
            weddingDate: data.value?.weddingDate,
            venue:       data.value?.venue,
          },
        }
      })
      sendResults.value.push({ id, name: guest.name, ok: true })
    } catch (e) {
      sendResults.value.push({ id, name: guest.name, ok: false, err: e?.message })
    }

    sendProgress.value = Math.round(((i + 1) / total) * 100)
    // Small delay so the progress bar animates visibly
    await new Promise(r => setTimeout(r, 120))
  }

  sending.value = false
  const okCount = sendResults.value.filter(r => r.ok).length
  toast.add(
    tBy({ en: 'Done!', km: 'រួចហើយ!' }),
    tBy({ en: `Sent to ${okCount}/${total} guests`, km: `បានផ្ញើទៅ ${okCount}/${total} ភ្ញៀវ` }),
  )
  emit('sent', ids)
}

// ── Quick share (no guest loop) ───────────────────────────────────────────
function quickShare(channelKey) {
  const text = shareText.value
  if (channelKey === 'whatsapp')  return shareWhatsApp(text)
  if (channelKey === 'telegram')  return shareTelegram(text)
  if (channelKey === 'facebook')  return shareFacebook()
  if (channelKey === 'copy')      return copyLink()
}

// ── Reset on close ────────────────────────────────────────────────────────
watch(show, (v) => {
  if (!v) {
    setTimeout(() => {
      step.value = 1
      search.value = ''
      selected.value = new Set()
      sendResults.value = []
      sendProgress.value = 0
      sending.value = false
    }, 300)
  }
})

// Status badge helper
const statusColor = {
  pending:   'var(--color-yellow)',
  confirmed: 'var(--color-green)',
  declined:  'var(--color-red)',
}
</script>

<template>
  <RModal v-model="show" icon="ri-send-plane-fill" :title="tBy({ en: 'Send Invitations', km: 'ផ្ញើការអញ្ជើញ' })" 
    :description="step === 1 ? tBy({ en: 'Select guests to invite', km: 'ជ្រើសភ្ញៀវ' }) : step === 2 ? tBy({ en: 'Choose how to send', km: 'ជ្រើសវិធីផ្ញើ' }) : tBy({ en: 'Sending…', km: 'កំពុងផ្ញើ…' })" >
    <RStepper
      :model-value="step - 1"
      @update:model-value="step = $event + 1"
      :show-actions="false"
      :show-content="false"
      :items="[
        { title: tBy({ en: 'Guests', km: 'ភ្ញៀវ' }), riIcon: 'ri-group-line' },
        { title: tBy({ en: 'Channels', km: 'វិធី' }), riIcon: 'ri-mail-send-line' },
        { title: tBy({ en: 'Send', km: 'ផ្ញើ' }), riIcon: 'ri-send-plane-line' }
      ]"
    />
      
    <!-- ══════════════════════════════════════════════════════════════
         STEP 1 — Guest selector
    ══════════════════════════════════════════════════════════════════ -->
    <Transition name="step-slide" mode="out-in">
      <div v-if="step === 1" key="step1" class="sim-body">
        <!-- Toolbar -->
        <div class="sim-toolbar">
          <div class="sim-search">
            <i class="ri-search-line" />
            <input
              v-model="search"
              type="text"
              class="sim-search-input"
              :placeholder="tBy({ en: 'Search guests…', km: 'ស្វែងរកភ្ញៀវ…' })"
            />
          </div>
          <div class="sim-filters">
            <button
              v-for="s in ['all','pending','confirmed','declined']"
              :key="s"
              class="sim-filter-btn"
              :class="{ active: filterStatus === s }"
              @click="filterStatus = s"
            >
              {{ tBy({
                en: s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1),
                km: s === 'all' ? 'ទាំងអស់' : s === 'pending' ? 'រង់ចាំ' : s === 'confirmed' ? 'បញ្ជាក់' : 'បដិសេធ'
              }) }}
            </button>
          </div>
        </div
        <!-- Select-all row -->
        <label class="sim-select-all">
          <input
            type="checkbox"
            :checked="allChecked"
            :indeterminate="someChecked"
            class="sim-cb"
            @change="toggleAll"
          />
          <span>
            {{ tBy({ en: 'Select all', km: 'ជ្រើសទាំងអស់' }) }}
            <span class="sim-count-badge">{{ filtered.length }}</span>
          </span>
        </label
        <!-- Guest list -->
        <div class="sim-guest-list">
          <template v-if="filtered.length">
            <label
              v-for="g in filtered"
              :key="g.id"
              class="sim-guest-row"
              :class="{ checked: selected.has(g.id) }"
            >
              <input
                type="checkbox"
                :checked="selected.has(g.id)"
                class="sim-cb"
                @change="toggle(g.id)"
              />
              <div class="sim-guest-avatar">
                {{ (g.name ?? '?').charAt(0).toUpperCase() }}
              </div>
              <div class="sim-guest-info">
                <span class="sim-guest-name">{{ g.name }}</span>
                <span v-if="g.nameKm" class="sim-guest-sub">{{ g.nameKm }}</span>
                <span v-if="g.phone" class="sim-guest-sub">{{ g.phone }}</span>
              </div>
              <span
                class="sim-status-dot"
                :style="{ background: statusColor[g.status] }"
                :title="g.status"
              />
            </label>
          </template>
          <div v-else class="sim-empty">
            <i class="ri-user-search-line" />
            <p>{{ tBy({ en: 'No guests found', km: 'រកមិនឃើញភ្ញៀវ' }) }}</p>
          </div>
        </div
        <!-- Quick share row (no guest selection needed) -->
        <div class="sim-quick-share">
          <p class="sim-qs-label">
            {{ tBy({ en: 'Or share directly', km: 'ឬចែករំលែកផ្ទាល់' }) }}
          </p>
          <div class="sim-qs-btns">
            <button
              v-for="ch in channels.filter(c => c.available && c.key !== 'inapp')"
              :key="ch.key"
              class="sim-qs-btn"
              :style="{ '--ch-color': ch.color }"
              :title="tBy({ en: ch.labelEn, km: ch.labelKm })"
              @click="quickShare(ch.key)"
            >
              <i :class="ch.icon" />
              <span>{{ tBy({ en: ch.labelEn, km: ch.labelKm }) }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ══════════════════════════════════════════════════════════════
         STEP 2 — Channel selection
    ══════════════════════════════════════════════════════════════════ -->
    <Transition name="step-slide" mode="out-in">
      <div v-if="step === 2" key="step2" class="sim-body">
        <p class="sim-channel-hint">
          {{ tBy({
            en: `Sending to ${selected.size} selected guest(s). Choose one or more channels:`,
            km: `ផ្ញើទៅ ${selected.size} ភ្ញៀវ។ ជ្រើសវិធី:`,
          }) }}
        </p>
        <div class="sim-channels">
          <button
            v-for="ch in channels"
            :key="ch.key"
            class="sim-channel-card"
            :class="{ active: selectedChannels.has(ch.key), disabled: !ch.available }"
            :disabled="!ch.available"
            @click="ch.available && toggleChannel(ch.key)"
          >
            <div class="sim-ch-icon" :style="{ background: ch.color + '22', color: ch.color }">
              <i :class="ch.icon" />
            </div>
            <div class="sim-ch-body">
              <span class="sim-ch-name">{{ tBy({ en: ch.labelEn, km: ch.labelKm }) }}</span>
              <span v-if="!ch.available" class="sim-ch-soon">
                {{ tBy({ en: 'Coming soon', km: 'ឆាប់ៗ' }) }}
              </span>
            </div>
            <div class="sim-ch-check" :style="{ borderColor: ch.color, background: selectedChannels.has(ch.key) ? ch.color : 'transparent' }">
              <i v-if="selectedChannels.has(ch.key)" class="ri-check-line" style="color:#fff;font-size:11px" />
            </div>
          </button>
        </div>
        <!-- Message preview box -->
        <div class="sim-msg-preview">
          <p class="sim-mp-label">{{ tBy({ en: 'Message preview', km: 'មើលជាមុន' }) }}</p>
          <div class="sim-mp-bubble">
            <pre class="sim-mp-text">{{ shareText }}</pre>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ══════════════════════════════════════════════════════════════
         STEP 3 — Sending progress
    ══════════════════════════════════════════════════════════════════ -->
    <Transition name="step-slide" mode="out-in">
      <div v-if="step === 3" key="step3" class="sim-body">
        <!-- Progress bar -->
        <div v-if="sending" class="sim-progress-wrap">
          <div class="sim-progress-bar">
            <div class="sim-progress-fill" :style="{ width: sendProgress + '%' }" />
          </div>
          <span class="sim-progress-pct">{{ sendProgress }}%</span>
        </div>
        <!-- Done summary -->
        <div v-if="!sending && sendResults.length" class="sim-result-summary">
          <div class="sim-rs-stat ok">
            <i class="ri-checkbox-circle-fill" />
            <span>{{ sendResults.filter(r=>r.ok).length }}
              {{ tBy({ en: 'sent', km: 'ផ្ញើបាន' }) }}</span>
          </div>
          <div v-if="sendResults.some(r=>!r.ok)" class="sim-rs-stat err">
            <i class="ri-error-warning-fill" />
            <span>{{ sendResults.filter(r=>!r.ok).length }}
              {{ tBy({ en: 'failed', km: 'បរាជ័យ' }) }}</span>
          </div>
        </div>
        <!-- Per-guest result list -->
        <div class="sim-result-list">
          <div
            v-for="r in sendResults"
            :key="r.id"
            class="sim-result-row"
            :class="r.ok ? 'ok' : 'err'"
          >
            <i :class="r.ok ? 'ri-checkbox-circle-fill' : 'ri-close-circle-fill'" />
            <span>{{ r.name }}</span>
            <span v-if="r.err" class="sim-result-err">{{ r.err }}</span>
          </div>
          <!-- Pending rows (still sending) -->
          <div
            v-for="id in [...selected].slice(sendResults.length)"
            :key="id"
            class="sim-result-row pending"
          >
            <i class="ri-loader-4-line sim-spin" />
            <span>{{ guests.find(g=>g.id===id)?.name ?? id }}</span>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ── Footer actions ─────────────────────────────────────────── -->
    <template #footer>
      <!-- Step 1 -->
      <template v-if="step === 1">
        <RBtn type="cancel" :label="tr('common.cancel')" @click="show = false" />
        <RBtn type="next" :label="tr('common.next') + selected.size" icon="ri-arrow-right-line" :disabled="selected.size === 0" @click="step = 2" />
      </template>
      <!-- Step 2 -->
      <template v-if="step === 2">
        <RBtn type="back" :label="tr('common.back')" icon="ri-arrow-left-line" @click="step = 1" />
        <RBtn type="next" :label="tr('common.send_now') + '(' + selected.size + ')'" icon="ri-send-plane-fill" :disabled="selectedChannels.size === 0" @click="startSend" />
      </template>
      <!-- Step 3 -->
      <template v-if="step === 3">
        <RBtn type="next" :label="sending ? tr('common.sending') : tr('common.done')" icon="ri-send-plane-fill" :disabled="sending" @click="show = false" />
      </template>
    </template>
  </RModal>
</template>

<style lang="scss" scoped>
// ── Backdrop ──────────────────────────────────────────────────────────────
.sim-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  z-index: 200;
}

// ── Modal shell ───────────────────────────────────────────────────────────
.sim-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 201;
  width: min(580px, calc(100vw - 32px));
  max-height: calc(100dvh - 40px);
  display: flex;
  flex-direction: column;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-2xl);
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

// ── Header ────────────────────────────────────────────────────────────────
.sim-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--sp-5) var(--sp-6);
  border-bottom: 1px solid var(--c-border);
  flex-shrink: 0;
}

.sim-head-left {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
}

.sim-head-icon {
  width: 40px; height: 40px;
  border-radius: var(--r-md);
  background: rgba(255, 140, 66, 0.12);
  color: var(--c-accent);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.125rem;
  flex-shrink: 0;
}

.sim-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--c-text);
}

.sim-sub {
  font-size: 0.75rem;
  color: var(--c-muted);
  margin-top: 1px;
}

.sim-close {
  width: 32px; height: 32px;
  border-radius: var(--r-md);
  border: none;
  background: rgba(255,255,255,0.05);
  color: var(--c-muted);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.125rem;
  transition: all var(--t-fast);

  &:hover { background: rgba(248,113,113,0.1); color: var(--c-danger); }
}

// ── Step indicator ────────────────────────────────────────────────────────
.sim-steps {
  position: relative;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid var(--c-border);
  flex-shrink: 0;
}

.sim-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  z-index: 1;

  &.active .sim-step-dot {
    background: var(--c-accent);
    color: #fff;
    box-shadow: 0 0 0 3px rgba(255,140,66,0.2);
  }

  &.done .sim-step-dot {
    background: var(--c-success);
    color: #fff;
  }
}

.sim-step-dot {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: rgba(255,255,255,0.06);
  border: 1.5px solid var(--c-border);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--c-muted);
  transition: all var(--t-base);
}

.sim-step-label {
  font-size: 0.6875rem;
  color: var(--c-muted);
  font-weight: 500;
}

.sim-step-track {
  position: absolute;
  top: calc(var(--sp-4) + 14px);
  left: calc(var(--sp-8) + 14px);
  right: calc(var(--sp-8) + 14px);
  height: 2px;
  background: var(--c-border);
  z-index: 0;
}

.sim-step-fill {
  height: 100%;
  background: var(--c-accent);
  border-radius: var(--r-full);
  transition: width var(--t-slow) var(--ease-out);
}

// ── Scrollable body ───────────────────────────────────────────────────────
.sim-body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
}

// ── Toolbar ───────────────────────────────────────────────────────────────
.sim-toolbar {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

.sim-search {
  position: relative;
  display: flex;
  align-items: center;

  i {
    position: absolute;
    left: 12px;
    color: var(--c-muted);
    font-size: 0.9375rem;
    pointer-events: none;
  }
}

.sim-search-input {
  width: 100%;
  padding: 9px 12px 9px 36px;
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--c-border);
  border-radius: var(--r-md);
  color: var(--c-text);
  font-size: 0.875rem;
  font-family: inherit;
  outline: none;

  &::placeholder { color: var(--c-muted); opacity: 0.6; }
  &:focus { border-color: rgba(255,140,66,0.4); box-shadow: 0 0 0 3px rgba(255,140,66,0.1); }
}

.sim-filters {
  display: flex;
  gap: var(--sp-2);
  flex-wrap: wrap;
}

.sim-filter-btn {
  padding: 5px 12px;
  border-radius: var(--r-full);
  border: 1px solid var(--c-border);
  background: none;
  color: var(--c-muted);
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all var(--t-fast);

  &:hover { border-color: var(--c-accent); color: var(--c-accent); }
  &.active { background: rgba(255,140,66,0.12); border-color: var(--c-accent); color: var(--c-accent); }
}

// ── Select all ────────────────────────────────────────────────────────────
.sim-select-all {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-2) 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--c-text);
  cursor: pointer;
  user-select: none;
}

.sim-count-badge {
  display: inline-block;
  padding: 1px 7px;
  background: rgba(255,140,66,0.12);
  color: var(--c-accent);
  border-radius: var(--r-full);
  font-size: 0.6875rem;
  font-weight: 700;
  margin-left: 4px;
}

// ── Guest list ────────────────────────────────────────────────────────────
.sim-guest-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
  max-height: 280px;
  overflow-y: auto;
  border: 1px solid var(--c-border);
  border-radius: var(--r-lg);
  padding: var(--sp-2);
}

.sim-guest-row {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: 8px 10px;
  border-radius: var(--r-md);
  cursor: pointer;
  transition: background var(--t-fast);
  user-select: none;

  &:hover { background: rgba(255,255,255,0.04); }
  &.checked { background: rgba(255,140,66,0.07); }
}

.sim-cb {
  width: 16px; height: 16px;
  accent-color: var(--c-accent);
  cursor: pointer;
  flex-shrink: 0;
}

.sim-guest-avatar {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: rgba(255,140,66,0.15);
  color: var(--c-accent);
  font-size: 0.8125rem;
  font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.sim-guest-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.sim-guest-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--c-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sim-guest-sub {
  font-size: 0.6875rem;
  color: var(--c-muted);
}

.sim-status-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.sim-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-8) 0;
  color: var(--c-muted);

  i { font-size: 2rem; opacity: 0.4; }
  p { font-size: 0.875rem; }
}

// ── Quick share strip ─────────────────────────────────────────────────────
.sim-quick-share {
  border-top: 1px solid var(--c-border);
  padding-top: var(--sp-4);
}

.sim-qs-label {
  font-size: 0.75rem;
  color: var(--c-muted);
  font-weight: 500;
  margin-bottom: var(--sp-3);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.sim-qs-btns {
  display: flex;
  gap: var(--sp-2);
  flex-wrap: wrap;
}

.sim-qs-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border: 1px solid color-mix(in srgb, var(--ch-color) 30%, transparent);
  border-radius: var(--r-full);
  background: color-mix(in srgb, var(--ch-color) 10%, transparent);
  color: var(--ch-color);
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all var(--t-fast);

  i { font-size: 0.9375rem; }
  &:hover { background: color-mix(in srgb, var(--ch-color) 18%, transparent); }
}

// ── Channel cards ─────────────────────────────────────────────────────────
.sim-channel-hint {
  font-size: 0.875rem;
  color: var(--c-muted);
  margin-bottom: var(--sp-2);
}

.sim-channels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-3);

  @media (max-width: 420px) { grid-template-columns: 1fr; }
}

.sim-channel-card {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-4);
  border: 1.5px solid var(--c-border);
  border-radius: var(--r-lg);
  background: rgba(255,255,255,0.03);
  cursor: pointer;
  font-family: inherit;
  transition: all var(--t-fast);

  &:hover:not(.disabled) { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.15); }
  &.active { border-color: var(--c-accent); background: rgba(255,140,66,0.07); }
  &.disabled { opacity: 0.45; cursor: not-allowed; }
}

.sim-ch-icon {
  width: 36px; height: 36px;
  border-radius: var(--r-md);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.125rem;
  flex-shrink: 0;
}

.sim-ch-body { flex: 1; text-align: left; }
.sim-ch-name { display: block; font-size: 0.875rem; font-weight: 600; color: var(--c-text); }
.sim-ch-soon { display: block; font-size: 0.6875rem; color: var(--c-muted); margin-top: 1px; }

.sim-ch-check {
  width: 18px; height: 18px;
  border-radius: 50%;
  border: 1.5px solid var(--c-border);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: all var(--t-fast);
}

// ── Message preview ───────────────────────────────────────────────────────
.sim-msg-preview { margin-top: var(--sp-2); }
.sim-mp-label {
  font-size: 0.75rem;
  color: var(--c-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 500;
  margin-bottom: var(--sp-2);
}

.sim-mp-bubble {
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--c-border);
  border-radius: var(--r-lg);
  padding: var(--sp-4);
}

.sim-mp-text {
  font-size: 0.8125rem;
  color: var(--c-text);
  white-space: pre-wrap;
  font-family: inherit;
  line-height: 1.65;
  margin: 0;
}

// ── Progress ──────────────────────────────────────────────────────────────
.sim-progress-wrap {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
}

.sim-progress-bar {
  flex: 1;
  height: 8px;
  background: rgba(255,255,255,0.07);
  border-radius: var(--r-full);
  overflow: hidden;
}

.sim-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--c-accent), var(--c-accent-2));
  border-radius: var(--r-full);
  transition: width 0.25s var(--ease-out);
}

.sim-progress-pct {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--c-accent);
  min-width: 36px;
  text-align: right;
}

// ── Result summary ────────────────────────────────────────────────────────
.sim-result-summary {
  display: flex;
  gap: var(--sp-4);
  padding: var(--sp-4);
  background: rgba(255,255,255,0.03);
  border-radius: var(--r-lg);
  border: 1px solid var(--c-border);
}

.sim-rs-stat {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  font-size: 0.875rem;
  font-weight: 600;

  &.ok  { color: var(--c-success); }
  &.err { color: var(--c-danger); }

  i { font-size: 1.125rem; }
}

// ── Result list ───────────────────────────────────────────────────────────
.sim-result-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 260px;
  overflow-y: auto;
}

.sim-result-row {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: 8px 12px;
  border-radius: var(--r-md);
  font-size: 0.875rem;
  font-weight: 500;

  &.ok      { background: rgba(74,222,128,0.07); color: var(--c-success); }
  &.err     { background: rgba(248,113,113,0.07); color: var(--c-danger); }
  &.pending { background: rgba(255,255,255,0.03); color: var(--c-muted); }
}

.sim-result-err {
  font-size: 0.6875rem;
  opacity: 0.7;
  margin-left: auto;
}

// ── Footer ────────────────────────────────────────────────────────────────
.sim-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--sp-3);
  padding: var(--sp-4) var(--sp-6);
  border-top: 1px solid var(--c-border);
  flex-shrink: 0;
}

// ── Spin animation ────────────────────────────────────────────────────────
.sim-spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

// ── Transitions ───────────────────────────────────────────────────────────
.sim-backdrop-enter-active,
.sim-backdrop-leave-active { transition: opacity var(--t-base); }
.sim-backdrop-enter-from,
.sim-backdrop-leave-to { opacity: 0; }

.sim-modal-enter-active,
.sim-modal-leave-active { transition: all var(--t-base) var(--ease-out); }
.sim-modal-enter-from,
.sim-modal-leave-to { opacity: 0; transform: translate(-50%, calc(-50% + 20px)) scale(0.97); }

.step-slide-enter-active,
.step-slide-leave-active { transition: all 0.2s var(--ease-out); }
.step-slide-enter-from { opacity: 0; transform: translateX(16px); }
.step-slide-leave-to { opacity: 0; transform: translateX(-16px); }
</style>