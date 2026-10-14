<template>
  <RWrapperPage class="inv-page">

    <!-- ── HEADER ── -->
    <div class="inv-header animate-fade-up">
      <div class="inv-header__left">
        <h1 class="page-heading">{{ tr('invitations.title') }}</h1>
        <p class="page-sub">
          <span>{{ guests.length }} {{ tr('common.guests') }}</span>
          <span class="sep">·</span>
          <span>{{ sentCount }} {{ tr('invitations.sent') }}</span>
          <span class="sep">·</span>
          <span>{{ openedCount }} {{ tr('invitations.opened') }}</span>
        </p>
      </div>
      <div v-if="wid && canSendInvite" class="inv-header__actions">
        <select v-model="bulkStatus" class="input input-sm" style="min-width:110px">
          <option value="">{{ tr('common.all') }}</option>
          <option value="INVITED">{{ tr('common.invited') }}</option>
          <option value="CONFIRMED">{{ tr('common.confirmed') }}</option>
          <option value="DECLINED">{{ tr('common.declined') }}</option>
        </select>
        <button class="btn-ghost" :disabled="bulkSending" @click="sendAllTelegram">
          <i v-if="bulkSending" class="ri-loader-4-line animate-spin" />
          <i v-else class="ri-telegram-line" />
          <span class="hide-xs">Telegram</span>
        </button>
        <button class="btn-ghost" :disabled="bulkEmailSending" @click="sendAllEmail">
          <i v-if="bulkEmailSending" class="ri-loader-4-line animate-spin" />
          <i v-else class="ri-mail-send-line" />
          <span class="hide-xs">Email</span>
        </button>
      </div>
    </div>

    <!-- ── NO WEDDING ── -->
    <div v-if="!wid" class="glass-card inv-empty animate-fade-up">
      <i class="ri-mail-open-line inv-empty__icon" />
      <h3>{{ tr('common.no_wedding_selected') }}</h3>
      <p>{{ tr('common.select_wedding_first') }}</p>
    </div>

    <template v-else>

      <!-- ── STATS ── -->
      <div class="inv-stats animate-fade-up">
        <div v-for="s in statCards" :key="s.label" class="inv-stat glass-card">
          <div class="inv-stat__icon" :style="{ color: s.color, background: s.bg }">
            <i :class="s.icon" />
          </div>
          <div>
            <div class="inv-stat__value">{{ s.value }}</div>
            <div class="inv-stat__label">{{ s.label }}</div>
          </div>
        </div>
      </div>

      <!-- ── TEMPLATE BANNER ── -->
      <div class="glass-card inv-tpl-banner animate-fade-up">
        <div class="inv-tpl-banner__left">
          <div class="inv-tpl-banner__icon">
            <i class="ri-palette-line" />
          </div>
          <div>
            <div class="inv-tpl-banner__label">{{ tr('invitations.active_template') }}</div>
            <div v-if="activeTemplate" class="inv-tpl-banner__name">
              {{ activeTemplate.templateName }}
              <span class="inv-tpl-key">{{ activeTemplate.templateKey }}</span>
            </div>
            <div v-else class="inv-tpl-banner__none">{{ tr('invitations.no_template_selected') }}</div>
          </div>
        </div>
        <div class="inv-tpl-banner__actions">
          <button class="btn-ghost btn-sm" @click="showTemplatePicker = true">
            <i class="ri-swap-line" />
            {{ tr('common.change') }}
          </button>
          <NuxtLink :to="localePath('/invitation/settings')" class="btn-ghost btn-sm">
            <i class="ri-settings-4-line" />
            {{ tr('common.settings') }}
          </NuxtLink>
        </div>
      </div>

      <!-- ── FILTERS ── -->
      <div class="inv-filters animate-fade-up">
        <div class="inv-search">
          <i class="ri-search-line" />
          <input
            v-model="search"
            class="input"
            :placeholder="tr('guests.search_placeholder')"
          />
        </div>
        <select v-model="filterStatus" class="input input-sm">
          <option value="">{{ tr('invitations.all_rsvp') }}</option>
          <option value="INVITED">{{ tr('common.invited') }}</option>
          <option value="CONFIRMED">{{ tr('common.confirmed') }}</option>
          <option value="DECLINED">{{ tr('common.declined') }}</option>
          <option value="ATTENDED">Attended</option>
          <option value="NO_SHOW">No Show</option>
        </select>
        <select v-model="filterOpen" class="input input-sm">
          <option value="">{{ tr('invitations.all_open') }}</option>
          <option value="opened">{{ tr('invitations.opened') }}</option>
          <option value="not_opened">{{ tr('invitations.not_opened') }}</option>
        </select>
        <span class="inv-count">{{ filtered.length }} / {{ guests.length }}</span>
      </div>

      <!-- ── TABLE CARD ── -->
      <div class="glass-card inv-table-card animate-fade-up">

        <!-- Loading -->
        <div v-if="loading" class="inv-state">
          <i class="ri-loader-4-line animate-spin" />
          {{ tr('common.loading') }}
        </div>

        <!-- Empty -->
        <div v-else-if="!filtered.length" class="inv-state">
          <i class="ri-inbox-2-line" style="font-size:2.5rem;opacity:0.3" />
          <p>{{ tr('guests.empty') }}</p>
        </div>

        <!-- Table -->
        <div v-else class="inv-table-wrap">
          <table class="inv-table">
            <thead>
              <tr>
                <th>{{ tr('common.guest') }}</th>
                <th>{{ tr('invitations.rsvp') }}</th>
                <th class="hide-sm">{{ tr('invitations.invitation_col') }}</th>
                <th class="hide-sm">{{ tr('invitations.opened') }}</th>
                <th>{{ tr('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="g in filtered" :key="g.guestId">

                <!-- Guest -->
                <td>
                  <div class="g-name">{{ g.guestName }}</div>
                  <div class="g-sub">{{ g.phone || g.email || '—' }}</div>
                  <div v-if="g.sideFamily" class="g-meta">
                    <i class="ri-team-line" /> {{ g.sideFamily }} · {{ g.totalGuests }} seat(s)
                  </div>
                </td>

                <!-- RSVP Badge -->
                <td>
                  <span class="rsvp-badge" :class="`rsvp-${(g.guestStatus || 'unknown').toLowerCase()}`">
                    {{ g.guestStatus || '—' }}
                  </span>
                </td>

                <!-- Invitation status -->
                <td class="hide-sm">
                  <template v-if="g.invitationStatus === 'SENT'">
                    <div class="inv-status inv-status--sent">
                      <i class="ri-checkbox-circle-fill" />
                      <span>{{ g.channel || 'Sent' }}</span>
                    </div>
                    <div v-if="g.sentAt" class="inv-time">{{ fmtDateTime(g.sentAt) }}</div>
                  </template>
                  <div v-else-if="g.invitationStatus === 'FAILED'" class="inv-status inv-status--failed">
                    <i class="ri-close-circle-fill" /> Failed
                  </div>
                  <div v-else class="inv-status inv-status--pending">
                    <i class="ri-time-line" /> Not sent
                  </div>
                </td>

                <!-- Opened -->
                <td class="hide-sm">
                  <template v-if="g.opened">
                    <div class="inv-status inv-status--opened">
                      <i class="ri-eye-fill" /> {{ g.openCount }}×
                    </div>
                    <div class="inv-time">{{ fmtDateTime(g.openedAt) }}</div>
                    <div v-if="g.deviceInfo" class="inv-device" :title="g.deviceInfo">{{ shortDevice(g.deviceInfo) }}</div>
                  </template>
                  <div v-else class="inv-status inv-status--pending">
                    <i class="ri-eye-off-line" /> Not opened
                  </div>
                </td>

                <!-- Actions -->
                <td>
                  <div class="inv-actions">
                    <a v-if="g.inviteUrl" :href="g.inviteUrl" target="_blank" class="iact iact--view" title="View invitation">
                      <i class="ri-external-link-line" />
                    </a>
                    <button class="iact iact--copy" :title="tr('invitations.copy_link')" @click="copyLink(g)">
                      <i :class="copying === g.guestId ? 'ri-checkbox-circle-line' : 'ri-file-copy-line'" />
                    </button>
                    <button
                      v-if="canSendInvite && g.telegramChatId"
                      class="iact iact--tg"
                      :disabled="sending === g.guestId"
                      title="Send via Telegram"
                      @click="sendTelegram(g)"
                    >
                      <i v-if="sending === g.guestId" class="ri-loader-4-line animate-spin" />
                      <i v-else class="ri-telegram-line" />
                    </button>
                    <button
                      v-if="canSendInvite && g.email"
                      class="iact iact--email"
                      :disabled="emailSending === g.guestId"
                      title="Send via Email"
                      @click="sendEmail(g)"
                    >
                      <i v-if="emailSending === g.guestId" class="ri-loader-4-line animate-spin" />
                      <i v-else class="ri-mail-send-line" />
                    </button>
                    <a
                      v-if="g.phone"
                      :href="waLink(g)"
                      target="_blank"
                      class="iact iact--wa"
                      title="Send via WhatsApp"
                    >
                      <i class="ri-whatsapp-line" />
                    </a>
                  </div>
                </td>

              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </template>

    <!-- ── TEMPLATE PICKER MODAL ── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showTemplatePicker" class="modal-overlay" @click.self="showTemplatePicker = false">
          <div class="modal-panel glass-card animate-scale-in">
            <div class="modal-header">
              <h3>{{ tr('invitations.choose_template') }}</h3>
              <button class="btn-icon" @click="showTemplatePicker = false"><i class="ri-close-line" /></button>
            </div>
            <div class="tpl-picker">
              <div v-if="loadingTemplates" class="inv-state" style="padding:var(--sp-10)">
                <i class="ri-loader-4-line animate-spin" style="font-size:1.5rem" />
              </div>
              <div v-else-if="!myTemplates.length" class="inv-state" style="padding:var(--sp-10)">
                <i class="ri-palette-line" style="font-size:2.5rem;opacity:0.3" />
                <p>{{ tr('invitations.no_templates_assigned') }}</p>
                <p class="tpl-hint">{{ tr('invitations.ask_admin') }}</p>
              </div>
              <div v-else class="tpl-grid">
                <div
                  v-for="tpl in myTemplates"
                  :key="tpl.id"
                  class="tpl-card"
                  :class="{ 'tpl-card--active': tpl.isActive }"
                >
                  <div class="tpl-thumb">
                    <img v-if="tpl.thumbnailUrl" :src="tpl.thumbnailUrl" :alt="tpl.templateName" />
                    <i v-else class="ri-palette-line" />
                  </div>
                  <div class="tpl-info">
                    <span class="tpl-name">{{ tpl.templateName }}</span>
                    <span class="tpl-key">{{ tpl.templateKey }}</span>
                  </div>
                  <button
                    v-if="!tpl.isActive"
                    class="btn-primary btn-sm tpl-set-btn"
                    :disabled="settingActive === tpl.templateId"
                    @click="setActive(tpl)"
                  >
                    <i v-if="settingActive === tpl.templateId" class="ri-loader-4-line animate-spin" />
                    <span v-else>{{ tr('common.activate') }}</span>
                  </button>
                  <span v-else class="tpl-active-badge">
                    <i class="ri-checkbox-circle-fill" />
                    {{ tr('common.active') }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </RWrapperPage>
</template>

<script setup>
// import { useAuthStore } from '~/stores/auth'
import { useInvitationsStore } from '~/stores/invitations'
const { tr } =  useTr()
definePageMeta({ layout: 'navbar', middleware: ['auth', 'permission'], permission: 'SEND_INVITATION' })

const localePath = (p) => p
const toast = useToastStore()
const auth = useAuthStore()
const eventStore = useEventStore()
const invitationStore = useInvitationsStore()

const canSendInvite = computed(() => {
  const roles = auth.user?.roles ?? []
  return roles.some(r => ['SUPER_ADMIN', 'OWNER', 'MANAGER', 'INVITATION_MANAGER'].includes(r))
    || auth.permissions?.includes('SEND_INVITATION')
})
const wid = computed(() => eventStore.activeEvent?.id)

const loading = computed(() => invitationStore.loading)
const bulkSending = ref(false)
const bulkEmailSending = ref(false)
const sending = ref(null)
const emailSending = ref(null)
const copying = ref(null)
const guests = computed(() => invitationStore.items)
const search = ref('')
const filterStatus = ref('')
const filterOpen = ref('')
const bulkStatus = ref('')

const showTemplatePicker = ref(false)
const loadingTemplates = ref(false)
const settingActive = ref(null)
const myTemplates = computed(() => invitationStore.templates)
const activeTemplate = computed(() => invitationStore.activeTemplate)

const openedCount = computed(() => invitationStore.openedCount)
const sentCount = computed(() => invitationStore.sentCount)
const confirmedCount = computed(() => invitationStore.confirmedCount)

const statCards = computed(() => [
  { label: tr('invitations.total_guests'), value: guests.value.length, icon: 'ri-group-line', color: 'var(--c-accent)', bg: 'color-mix(in srgb, var(--c-accent) 12%, transparent)' },
  { label: tr('invitations.sent'), value: sentCount.value, icon: 'ri-send-plane-fill', color: 'var(--c-info)', bg: 'color-mix(in srgb, var(--c-info) 12%, transparent)' },
  { label: tr('invitations.opened'), value: openedCount.value, icon: 'ri-eye-fill', color: 'var(--c-success)', bg: 'color-mix(in srgb, var(--c-success) 12%, transparent)' },
  { label: tr('common.confirmed'), value: confirmedCount.value, icon: 'ri-checkbox-circle-fill', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
])

const filtered = computed(() => guests.value.filter((g) => {
  const q = search.value.toLowerCase()
  const matchSearch = !q || g.guestName?.toLowerCase().includes(q) || g.phone?.includes(q) || g.email?.toLowerCase().includes(q)
  const matchStatus = !filterStatus.value || g.guestStatus === filterStatus.value
  const matchOpen = !filterOpen.value || (filterOpen.value === 'opened' && g.opened) || (filterOpen.value === 'not_opened' && !g.opened)
  return matchSearch && matchStatus && matchOpen
}))

async function load() {
  if (!wid.value) return
  await invitationStore.fetch(wid.value, { force: true })
}

async function loadTemplates() {
  loadingTemplates.value = true
  try { await invitationStore.fetchTemplates() } catch {}
  finally { loadingTemplates.value = false }
}

async function setActive(tpl) {
  settingActive.value = tpl.templateId
  try {
    await invitationStore.setActiveTemplate(tpl.templateId)
    toast.add(`"${tpl.templateName}" is now active`)
  } catch (e) {
    toast.add(e.message || 'Failed to activate template')
  } finally {
    settingActive.value = null
  }
}

async function sendTelegram(g) {
  sending.value = g.guestId
  try {
    await invitationStore.sendTelegram(wid.value, g.guestId)
    toast.add(`Telegram sent to ${g.guestName}`)
  } catch (e) {
    toast.add(e.message || 'Failed to send Telegram')
  } finally { sending.value = null }
}

async function sendAllTelegram() {
  bulkSending.value = true
  try {
    const res = await invitationStore.sendAllTelegram(wid.value, bulkStatus.value)
    toast.add(`Sent: ${res?.sent ?? 0} · Skipped: ${res?.skipped ?? 0} · Failed: ${res?.failed ?? 0}`)
    await load()
  } catch (e) {
    toast.add(e.message || 'Bulk Telegram failed')
  } finally { bulkSending.value = false }
}

async function sendEmail(g) {
  emailSending.value = g.guestId
  try {
    await invitationStore.sendEmail(wid.value, g.guestId)
    toast.add(`Email sent to ${g.guestName}`)
  } catch (e) {
    toast.add(e?.data?.message || e.message || 'Failed to send email')
  } finally { emailSending.value = null }
}

async function sendAllEmail() {
  bulkEmailSending.value = true
  try {
    const res = await invitationStore.sendAllEmail(wid.value, bulkStatus.value)
    toast.add(`Sent: ${res?.sent ?? 0} · Skipped: ${res?.skipped ?? 0} · Failed: ${res?.failed ?? 0}`)
    await load()
  } catch (e) {
    toast.add(e.message || 'Bulk email failed')
  } finally { bulkEmailSending.value = false }
}

async function copyLink(g) {
  copying.value = g.guestId
  try { await navigator.clipboard.writeText(g.inviteUrl); toast.add('Link copied!') } catch {}
  setTimeout(() => { copying.value = null }, 1500)
}

function waLink(g) {
  const msg = encodeURIComponent(`Dear ${g.guestName},\nYou are invited!\n${g.inviteUrl}`)
  return `https://wa.me/${g.phone?.replace(/\D/g, '')}?text=${msg}`
}

function fmtDateTime(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function shortDevice(ua) {
  if (!ua) return ''
  if (ua.includes('iPhone')) return '📱 iPhone'
  if (ua.includes('Android')) return '📱 Android'
  if (ua.includes('Windows')) return '💻 Windows'
  if (ua.includes('Mac')) return '💻 Mac'
  return '🌐 Browser'
}

watch(showTemplatePicker, (val) => { if (val) loadTemplates() })
watch(wid, (val) => { if (val) load() }, { immediate: true })
onMounted(() => { if (!eventStore.initialized) eventStore.fetchEvents() })
</script>

<style lang="scss">
.inv-page {
  // padding: var(--sp-6);
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--sp-5);

  // ── Header ──────────────────────────────────────────────
  .inv-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: var(--sp-4);

    &__left {
      .page-heading { margin: 0; }
      .page-sub {
        display: flex;
        align-items: center;
        gap: var(--sp-2);
        font-size: 0.875rem;
        color: var(--c-muted);
        margin-top: 4px;
        .sep { opacity: 0.4; }
      }
    }

    &__actions {
      display: flex;
      align-items: center;
      gap: var(--sp-2);
      flex-wrap: wrap;
    }
  }

  // ── Empty / no wedding ───────────────────────────────────
  .inv-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--sp-3);
    padding: var(--sp-12);
    text-align: center;

    &__icon { font-size: 3rem; color: var(--c-muted); opacity: 0.35; }
    h3 { font-size: 1.0625rem; font-weight: 600; color: var(--c-text); margin: 0; }
    p { font-size: 0.875rem; color: var(--c-muted); margin: 0; }
  }

  // ── Stats ────────────────────────────────────────────────
  .inv-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--sp-4);
    @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); }
    @media (max-width: 480px) { grid-template-columns: repeat(2, 1fr); }
  }

  .inv-stat {
    display: flex;
    align-items: center;
    gap: var(--sp-3);
    padding: var(--sp-4) var(--sp-5);

    &__icon {
      width: 44px;
      height: 44px;
      border-radius: var(--r-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    &__value {
      font-size: 1.625rem;
      font-weight: 700;
      color: var(--c-text);
      line-height: 1;
    }

    &__label {
      font-size: 0.75rem;
      color: var(--c-muted);
      margin-top: 3px;
    }
  }

  // ── Template banner ──────────────────────────────────────
  .inv-tpl-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--sp-4);
    padding: var(--sp-4) var(--sp-5);
    flex-wrap: wrap;

    &__left {
      display: flex;
      align-items: center;
      gap: var(--sp-3);
      flex: 1;
      min-width: 0;
    }

    &__icon {
      width: 40px;
      height: 40px;
      border-radius: var(--r-md);
      background: color-mix(in srgb, var(--c-accent) 12%, transparent);
      color: var(--c-accent);
      font-size: 1.125rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    &__label {
      font-size: 0.6875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--c-muted);
      margin-bottom: 2px;
    }

    &__name {
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--c-text);
      display: flex;
      align-items: center;
      gap: var(--sp-2);
    }

    &__none { font-size: 0.875rem; color: var(--c-muted); }

    &__actions { display: flex; gap: var(--sp-2); flex-shrink: 0; }
  }

  .inv-tpl-key {
    padding: 2px 7px;
    border-radius: var(--r-sm);
    background: color-mix(in srgb, var(--c-accent) 12%, transparent);
    color: var(--c-accent);
    font-size: 0.6875rem;
    font-family: monospace;
    font-weight: 700;
  }

  // ── Filters ──────────────────────────────────────────────
  .inv-filters {
    display: flex;
    gap: var(--sp-3);
    align-items: center;
    flex-wrap: nowrap;
  }

  .inv-search {
    position: relative;
    flex: 1;
    min-width: 200px;

    i {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--c-muted);
      pointer-events: none;
      font-size: 0.9375rem;
    }

    .input { padding-left: 36px; }
  }

  .inv-count {
    font-size: 0.75rem;
    color: var(--c-muted);
    white-space: nowrap;
    padding: 4px var(--sp-3);
    background: var(--c-surface-alt);
    border-radius: var(--r-full);
    border: 1px solid var(--c-border);
  }

  .input-sm { padding: 12px 12px !important; font-size: 0.8125rem !important; }

  // ── Table card ───────────────────────────────────────────
  .inv-table-card { padding: 0; overflow: hidden; }

  .inv-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--sp-3);
    padding: var(--sp-12);
    color: var(--c-muted);
    font-size: 0.875rem;
    text-align: center;
  }

  .inv-table-wrap { overflow-x: auto; }

  .inv-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 600px;

    th {
      padding: 10px var(--sp-4);
      text-align: left;
      font-size: 0.6875rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      color: var(--c-muted);
      border-bottom: 1px solid var(--c-border);
      white-space: nowrap;
    }

    td {
      padding: 12px var(--sp-4);
      border-bottom: 1px solid var(--c-border);
      vertical-align: middle;
    }

    tr:last-child td { border-bottom: none; }

    tr:hover td {
      background: color-mix(in srgb, var(--c-accent) 3%, transparent);
    }

    .hide-sm { @media (max-width: 900px) { display: none; } }

    // Guest cell
    .g-name { font-size: 0.875rem; font-weight: 600; color: var(--c-text); }
    .g-sub { font-size: 0.75rem; color: var(--c-muted); margin-top: 2px; }
    .g-meta {
      font-size: 0.6875rem;
      color: var(--c-muted);
      opacity: 0.7;
      margin-top: 2px;
      display: flex;
      align-items: center;
      gap: 4px;
      i { font-size: 0.75rem; }
    }

    // RSVP badge
    .rsvp-badge {
      display: inline-block;
      padding: 3px 9px;
      border-radius: var(--r-full);
      font-size: 0.6875rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      white-space: nowrap;

      &.rsvp-invited    { background: color-mix(in srgb, var(--c-accent) 15%, transparent);  color: var(--c-accent); }
      &.rsvp-confirmed  { background: color-mix(in srgb, var(--c-success) 15%, transparent); color: var(--c-success); }
      &.rsvp-declined   { background: color-mix(in srgb, var(--c-danger) 15%, transparent);  color: var(--c-danger); }
      &.rsvp-attended   { background: color-mix(in srgb, var(--c-success) 10%, transparent); color: var(--c-success); }
      &.rsvp-no_show    { background: color-mix(in srgb, var(--c-warning) 15%, transparent); color: var(--c-warning); }
      &.rsvp-unknown    { background: var(--c-surface-alt); color: var(--c-muted); }
    }

    // Invitation / opened status
    .inv-status {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 0.8125rem;
      font-weight: 500;

      &--sent   { color: var(--c-success); }
      &--failed { color: var(--c-danger); }
      &--opened { color: var(--c-info); }
      &--pending { color: var(--c-muted); font-weight: 400; }
    }

    .inv-time {
      font-size: 0.6875rem;
      color: var(--c-muted);
      margin-top: 2px;
    }

    .inv-device {
      font-size: 0.6875rem;
      color: var(--c-muted);
      max-width: 140px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-top: 2px;
    }

    // Action buttons
    .inv-actions {
      display: flex;
      gap: 4px;
      flex-wrap: nowrap;
    }

    .iact {
      width: 30px;
      height: 30px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--r-sm);
      font-size: 0.9375rem;
      border: 1px solid transparent;
      cursor: pointer;
      text-decoration: none;
      transition: opacity 0.15s, transform 0.1s;
      flex-shrink: 0;

      &:hover { opacity: 0.85; transform: scale(1.08); }
      &:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

      &--view  { background: color-mix(in srgb, var(--c-accent) 12%, transparent);  color: var(--c-accent);  border-color: color-mix(in srgb, var(--c-accent) 25%, transparent); }
      &--copy  { background: var(--c-surface-alt); color: var(--c-muted); border-color: var(--c-border); }
      &--tg    { background: #229ed918; color: #229ed9; border-color: #229ed930; }
      &--email { background: #ea433518; color: #ea4335; border-color: #ea433530; }
      &--wa    { background: #25d36618; color: #25d366; border-color: #25d36630; }
    }
  }

  // ── Template picker modal ────────────────────────────────
  .tpl-picker { padding: var(--sp-4); }

  .tpl-hint { font-size: 0.75rem; color: var(--c-muted); }

  .tpl-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--sp-3);
    max-height: 480px;
    overflow-y: auto;
    @media (max-width: 480px) { grid-template-columns: 1fr; }
  }

  .tpl-card {
    display: flex;
    flex-direction: column;
    gap: var(--sp-2);
    padding: var(--sp-3);
    border: 1px solid var(--c-border);
    border-radius: var(--r-lg);
    background: var(--c-surface);
    transition: border-color 0.15s;

    &:hover { border-color: color-mix(in srgb, var(--c-accent) 40%, transparent); }

    &--active {
      border-color: var(--c-accent);
      background: color-mix(in srgb, var(--c-accent) 5%, var(--c-surface));
    }
  }

  .tpl-thumb {
    width: 100%;
    height: 80px;
    border-radius: var(--r-sm);
    background: var(--c-surface-alt);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    font-size: 2rem;
    color: var(--c-muted);

    img { width: 100%; height: 100%; object-fit: cover; }
  }

  .tpl-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--sp-2);
    min-width: 0;
  }

  .tpl-name {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--c-text);
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tpl-key {
    padding: 2px 6px;
    border-radius: var(--r-sm);
    background: color-mix(in srgb, var(--c-accent) 10%, transparent);
    color: var(--c-accent);
    font-size: 0.6875rem;
    font-family: monospace;
    font-weight: 700;
    white-space: nowrap;
  }

  .tpl-set-btn { width: 100%; justify-content: center; }

  .tpl-active-badge {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 6px;
    border-radius: var(--r-sm);
    background: color-mix(in srgb, var(--c-success) 10%, transparent);
    color: var(--c-success);
    font-size: 0.75rem;
    font-weight: 600;
  }

  // ── Responsive helpers ───────────────────────────────────
  .hide-xs { @media (max-width: 480px) { display: none; } }
}

.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px);
  z-index: 300; display: flex; align-items: center; justify-content: center; padding: var(--sp-4);
}
.modal-panel {
  width: min(600px, 100%); max-height: 85dvh; overflow-y: auto;
  border-radius: var(--r-2xl); padding: var(--sp-6);
  display: flex; flex-direction: column; gap: var(--sp-4);
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  h3 { font-family: var(--font-700); font-size: 1.125rem; font-weight: 700; }
}
.modal-enter-active, .modal-leave-active { transition: all var(--t-base) var(--ease-out); }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal-panel, .modal-leave-to .modal-panel { transform: scale(0.95) translateY(10px); }
</style>
