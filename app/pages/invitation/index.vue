<template>
  <RWrapperPage class="inv-page">
    <RContent>
    <RTable
      ref="tblRef"
      :columns="tableColumns"
      :data="guests"
      :selected-pk="'guestId'"
      :options="{ searchable: true, paging: true }"
      @actionCheck="actionCheck"
    >
      <template #headerApplyFilter>
        <RTblChip v-model="chipFilter" @onRemove="onRemoveChip" />
      </template>
      <template #headerLeft>
        <RTblFilter @on-click="onSaveFilter" :width="'w-[350px]'">
          <RForm
            ref="formFilter"
            class="class-ft-form grid gap-3.5 w-[350px]"
            :state="dataFilter"
          >
            <RFormGroup name="GuestStatus" :label="$t('employee_type')">
              <RSelect v-model="dataFilter.status" 
                :localData="{ data: [ { id: 1, Name: 'all_status', NameEnglish:'all_status'}, { id: 2, Name: 'invited', NameEnglish:'invited'}, { id: 3, Name: 'CONFIRMED', NameEnglish:'CONFIRMED'}, { id: 4, Name: 'DECLINED', NameEnglish:'DECLINED'}, { id: 4, Name: 'ATTENDED', NameEnglish:'ATTENDED'}]}"
              ></RSelect>
            </RFormGroup>
            <RFormGroup name="InvitationStatus" :label="$t('employee_type')">
              <RSelect v-model="dataFilter.sideFamily"
                :localData="{ data: [ { id: 1, Name: 'all', NameEnglish:'all'}, { id: 2, Name: 'not_opened', NameEnglish:'Not opened'}, { id: 3, Name: 'opened', NameEnglish:'opened'}, { id: 4, Name: 'unsend', NameEnglish:'Unsend'}]}"
              ></RSelect>
            </RFormGroup>
            <RFormGroup name="gender" :label="$t('common.gender')">
              <RRadios v-model="dataFilter.gender"
                :options="[ { id: 1, label: 'all', value:''}, { id: 2, label: 'male', value:'male'}, { id: 3, label: 'female', value:'female'}]"
              ></RRadios>
            </RFormGroup>
          </RForm>
        </RTblFilter>
      </template>

      <template #headerRight>
        <div class="inv-tpl-banner__actions">
          <RBtn type="change" :label="tr('common.change')" icon="ri-swap-line"  @click="showTemplatePicker = true" />
          <!-- <RBtn type="setting" :label="tr('common.settings')" :icon="''" @click="navigateTo(localePath('/invitation/settings'))" class="btn-ghost btn-sm" /> -->
        </div>
      </template>

      <!-- Guest column -->
      <template #guest="{ rowData: g }">
        <div class="flex flex-col">
          <div class="g-name">{{ g.guestName }}</div>
          <div class="flex flex-col">
            <div class="g-sub">{{ g.phone || '' }} - {{ g.email || '' }}</div>
            <div v-if="g.sideFamily" class="g-meta">
            <i class="ri-team-line" /> {{ g.sideFamily }} · {{ g.totalGuests }} seat(s)
          </div>
          </div>
        </div>
      </template>

      <!-- RSVP column -->
      <template #rsvp="{ rowData: g }">
        <span class="rsvp-badge" :class="`rsvp-${(g.guestStatus || 'unknown').toLowerCase()}`">
          {{ g.guestStatus || '—' }}
        </span>
      </template>

      <!-- Invitation column -->
      <template #invitation="{ rowData: g }">
        <div v-if="g.invitationStatus === 'SENT'">
          <div class="inv-status inv-status--sent">
            <i class="ri-checkbox-circle-fill" />
            <span>{{ g.channel || 'Sent' }}</span>
          </div>
          <div v-if="g.sentAt" class="inv-time">{{ fmtDateTime(g.sentAt) }}</div>
        </div>
        <div v-else-if="g.invitationStatus === 'FAILED'" class="inv-status inv-status--failed">
          <i class="ri-close-circle-fill" /> Failed
        </div>
        <div v-else class="inv-status inv-status--pending">
          <i class="ri-time-line" /> Not sent
        </div>
      </template>

      <!-- Opened column -->
      <template #opened="{ rowData: g }">
        <div v-if="g.opened">
          <div class="inv-status inv-status--opened">
            <i class="ri-eye-fill" /> {{ g.openCount }}×
          </div>
          <div class="inv-time">{{ fmtDateTime(g.openedAt) }}</div>
          <div v-if="g.deviceInfo" class="inv-device" :title="g.deviceInfo">{{ shortDevice(g.deviceInfo) }}</div>
        </div>
        <div v-else class="inv-status inv-status--pending">
          <i class="ri-eye-off-line" /> Not opened
        </div>
      </template>

      <!-- Actions column -->
      <template #actions="{ rowData: g }">
        <RTblBtns :items="btnActionsList(g)" @actionClick="(type, action) => handleGuestAction(type, g)"/>
      </template>
    </RTable>
    </RContent>
</RWrapperPage>
<!-- ── TEMPLATE PICKER MODAL ── -->
<RModal v-model="showTemplatePicker" :title="tr('invitations.change_template')" class="w-[800px]" >
  <div class="flex gap-1 justify-center items-center">
  <div v-if="loadingTemplates" class="inv-state" style="padding:var(--sp-10)">
    <i class="ri-loader-fill animate-spin" style="font-size:1.5rem" />
  </div>
  <div v-else-if="!myTemplates.length" class="inv-state" style="padding:var(--sp-10)">
    <i class="ri-palette-line" style="font-size:2.5rem;opacity:0.3" />
    <p>{{ tr('invitations.no_templates_assigned') }}</p>
    <p class="tpl-hint">{{ tr('invitations.ask_admin') }}</p>
  </div>
  <div v-else class="tpl-grid">
    <div v-for="tpl in myTemplates" :key="tpl.id" class="tpl-card" :class="{ 'tpl-card--active': tpl.isActive }">
      <div class="tpl-thumb">
        <RImage v-if="tpl.thumbnailUrl" :src="tpl.thumbnailUrl" :alt="tpl.templateName" />
        <i v-else class="ri-palette-line" />
      </div>
      <div class="tpl-info">
        <span class="tpl-name">{{ tpl.templateName }}</span>
        <span class="tpl-key">{{ tpl.templateKey }}</span>
      </div>
      <RBtn v-if="!tpl.isActive" type="save" :label="tr('common.activate')" @click="setActive(tpl)" :disabled="settingActive === tpl.templateId" :icon="settingActive === tpl.templateId ? 'ri-loader-4-line animate-spin' : 'ri-checkbox-circle-fill'" />
      <RBadge v-else :label="tr('common.active')" icon="ri-checkbox-circle-fill" color="success" />
    </div>
  </div>
  </div>
</RModal>
</template>

<script setup>
definePageMeta({ layout: 'navbar', middleware: ['auth', 'permission'], permission: 'SEND_INVITATION' })

const { tr } = useTr()
const localePath = useLocalePath()
const toast = useToast()
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
const tblRef = ref(null)
const chipFilter = ref([]);
const dataFilter = ref({
  gender: null,
  status: [],
  sideFamily:null,
});
// Server-side data — no client-side filtering
const guests = computed(() => invitationStore.items)
const totalElements = computed(() => invitationStore.totalElements)
const totalPages = computed(() => invitationStore.totalPages)
const currentPage = computed(() => invitationStore.page)

// Filters (bound to server-side params)
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
const guestSelect = ref([])

const tableColumns = computed(() => [
  { key: 'guest',      label: tr('invitations.guest'),      sortable: false },
  { key: 'rsvp',       label: 'RSVP',                       sortable: false, width: '120px' },
  { key: 'invitation', label: tr('invitations.invitation'), sortable: false },
  { key: 'opened',     label: tr('invitations.opened'),     sortable: false },
  { key: 'actions',    label: '',                           sortable: false, width: '150px', align: 'center' },
])

const statCards = computed(() => [
  { label: tr('invitations.total_guests'), value: totalElements.value, icon: 'ri-group-line', color: 'var(--c-accent)', bg: 'color-mix(in srgb, var(--c-accent) 12%, transparent)' },
  { label: tr('invitations.sent'), value: sentCount.value, icon: 'ri-send-plane-fill', color: 'var(--c-info)', bg: 'color-mix(in srgb, var(--c-info) 12%, transparent)' },
  { label: tr('invitations.opened'), value: openedCount.value, icon: 'ri-eye-fill', color: 'var(--c-success)', bg: 'color-mix(in srgb, var(--c-success) 12%, transparent)' },
  { label: tr('common.confirmed'), value: confirmedCount.value, icon: 'ri-checkbox-circle-fill', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
])

// Debounce timer for search
let searchTimer = null

function actionCheck(guest) {
  console.log("Check Guest====>", guest.guestId);
  if (guestSelect.value.includes(guest.guestId)) {
    guestSelect.value = guestSelect.value.filter(id => id !== guest.guestId)
  } else {
    guestSelect.value.push(guest.guestId)
  }
  console.log("action check===>", guestSelect.value)
}

async function load(page = 0) {
  if (!wid.value) return
  await invitationStore.fetch(wid.value, {
    page,
    size: 20,
    search: search.value,
    status: dataFilter.value.status || '',
    gender: dataFilter.value.gender || ''
  })
}
function onSaveFilter(close) {
    const status = Array.isArray(dataFilter.value.status)
    ? dataFilter.value.status
    : dataFilter.value.status != null
      ? [dataFilter.value.status]
      : []
    const sideFamily = Array.isArray(dataFilter.value.sideFamily)
    ? dataFilter.value.sideFamily
    : dataFilter.value.sideFamily != null
      ? [dataFilter.value.sideFamily]
      : []
    
    const gender = dataFilter.value.gender

  chipFilter.value = [
    {
      pk: "status",
      src: "",
      icon: "S",
      value:
        dataFilter.value?.status == null
          ? ""
          : dataFilter.value?.status == "invitation_sent"
          ? tr("invitations.sent")
          : dataFilter.value?.status == "invitation_opened"
          ? tr("invitations.opened")
          : dataFilter.value?.status == "invitation_confirmed"
          ? tr("invitations.confirmed")
          : dataFilter.value?.status == "invitation_cancelled"
          ? tr("invitations.cancelled")
          : "",
    },
    {
      pk: "sideFamily",
      src: "",
      icon: "S",
      value: sideFamily == null ? "" : sideFamily == 1 ? "Bride Side" : "Groom Side",
    },
    {
      pk: "gender",
      src: "",
      icon: "G",
      value: gender == null ? "" : gender == 1 ? "Male" : gender == 0 ? "Female" : "Custom",
    },
  ];
  close();
}

function onRemoveChip(d) {
  if (isNotEmpty(d)) {
    chipFilter.value = chipFilter.value.filter((f) => f.pk != d.pk);
    if (dataFilter.value[d.pk]) dataFilter.value[d.pk] = null;
    if (d.pk == "status") {
      dataFilter.value.status = dataFilter.value.status.filter((v) => v != "invitation_sent");
    } else if (d.pk == "status") {
      dataFilter.value.status = dataFilter.value.status.filter((v) => v != "invitation_opened");
    } else if (d.pk == "status") {
      dataFilter.value.status = dataFilter.value.status.filter((v) => v != "invitation_confirmed");
    } else if (d.pk == "status") {
      dataFilter.value.status = dataFilter.value.status.filter((v) => v != "invitation_cancelled");
    }
    if (d.pk == "sideFamily") {
      dataFilter.value.sideFamily = dataFilter.value.sideFamily.filter((v) => v != 1);
    } else if (d.pk == "sideFamily") {
      dataFilter.value.sideFamily = dataFilter.value.sideFamily.filter((v) => v != 0);
    }
    if (d.pk == "gender") {
      dataFilter.value.gender = dataFilter.value.gender.filter((v) => v != 1);
    } else if (d.pk == "gender") {
      dataFilter.value.gender = dataFilter.value.gender.filter((v) => v != 0);
    }
  }
  load(0);
}

async function handleGuestAction(type, guest) {
  switch (type) {
    case 'view':
      if (guest.inviteToken) {
        await navigateTo(guestInviteUrl(guest), {
        external: true,
        open: {
          target: '_blank',
          windowFeatures: {
            noopener: true,
            noreferrer: true,
          },
        },
      })
        // window.open(url, '_blank')
      }
      break;
    case 'edit':
      toast.add({title: 'Coming soon... ',color: 'warning', description: 'This feature will be available soon.'})
      break;
    case 'copy':
      await copyLink(guest)
      break;
    case 'telegram':
      sendTelegram(guest)
      break;
    case 'email':
      sendEmail(guest)
      break;
    case 'whatsapp':
      waLink(guest)
      break;
    case 'delete':
      toast.add({title: 'Coming soon... ',color: 'warning', description: 'This feature will be available soon.'})
      break;
  }
}

const btnActionsList = (g) => [
  {
    type: 'view',
    label: tr('view_invitation'),
    icon: 'ri-external-link-line',
  },
  {
    type: 'edit',
    label: tr('edit'),
    icon: 'ri-edit-line',
  },
  {
    type: 'copy',
    label: tr('copy_link'),
    icon: copying === g.guestId ? 'ri-checkbox-circle-line' : 'ri-file-copy-line' 
  },
  canSendInvite && g.telegramChatId && {
    type: 'telegram',
    label: tr('send_via_telegram'),
    icon: 'ri-telegram-line',
    disabled: sending === g.guestId
  },
  {
    type: 'email',
    label: tr('send_via_mail'),
    icon: emailSending === g.guestId ? 'ri-loader-4-line animate-spin' : 'ri-mail-send-line',
    disabled: emailSending === g.guestId
  },
  {
    type: 'whatsapp',
    label: tr('send_via_whatsapp'),
    icon: 'ri-whatsapp-line',
  },
  {
    type: 'delete',
    label: tr('delete'),
    icon: 'ri-delete-bin-line',
  }
].filter(Boolean)

const formSubmit = () => {
  formRef.value.submit()
}

const handleFilterChange = (filterState) => {
  console.log("Filter:", filterState)
}
function onSearchInput() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => load(0), 400)
}

function onFilterChange(data) {
  console.log("On data filter ================> ",data)
  tblRef.value.reload()
  load(0)
}

function goToPage(page) {
  if (page < 0 || page >= totalPages.value) return
  load(page)
}
function guestInviteUrl(g) {
  // if (g?.inviteUrl) return g.inviteUrl
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return `${origin}/invites/${g?.inviteToken ?? ''}`
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
    toast.add({title: tBy({en:`"${tpl.templateName}" is now active`, km:`"${tpl.templateName}" is now active`}), color: 'success', icon: 'ri-checkbox-circle-line'})
  } catch (e) {
    toast.add({title: e.message || 'Failed to activate template', color: 'error', icon: 'ri-error-warning-line'})
  } finally { settingActive.value = null }
}

async function sendTelegram(g) {
  sending.value = g.guestId
  try {
    await invitationStore.sendTelegram(wid.value, g.guestId)
    toast.add({title:`Telegram sent to ${g.guestName}`, color: 'success', icon: 'ri-telegram-line'})
  } catch (e) {
    toast.add({title: e.message || 'Failed to send Telegram', color: 'error', icon: 'ri-error-warning-line'})
  } finally { sending.value = null }
}

async function sendAllTelegram() {
  bulkSending.value = true
  try {
    const res = await invitationStore.sendAllTelegram(wid.value, bulkStatus.value)
    toast.add({title: tBy({en:`Sent: ${res?.sent ?? 0} · Skipped: ${res?.skipped ?? 0} · Failed: ${res?.failed ?? 0}`, km:`Sent: ${res?.sent ?? 0} · Skipped: ${res?.skipped ?? 0} · Failed: ${res?.failed ?? 0}`}), color: 'success', icon: 'ri-telegram-line'})
    await load(currentPage.value)
  } catch (e) {
    toast.add({title: e.message || 'Bulk Telegram failed', color: 'error', icon: 'ri-error-warning-line'})
  } finally { bulkSending.value = false }
}

async function sendEmail(g) {
  emailSending.value = g.guestId
  try {
    await invitationStore.sendEmail(wid.value, g.guestId)
    toast.add({title:`Email sent to ${g.guestName}`, color: 'success', icon: 'ri-mail-send-line'})
  } catch (e) {
    toast.add({title: e?.data?.message || e.message || 'Failed to send email', color: 'error', icon: 'ri-error-warning-line'})
  } finally { emailSending.value = null }
}

async function sendAllEmail() {
  bulkEmailSending.value = true
  try {
    const res = await invitationStore.sendAllEmail(wid.value, bulkStatus.value)
    toast.add({title: tBy({en:`Sent: ${res?.sent ?? 0} · Skipped: ${res?.skipped ?? 0} · Failed: ${res?.failed ?? 0}`, km:`Sent: ${res?.sent ?? 0} · Skipped: ${res?.skipped ?? 0} · Failed: ${res?.failed ?? 0}`}), color: 'success', icon: 'ri-mail-send-line'})
    await load(currentPage.value)
  } catch (e) {
    toast.add({title: e.message || 'Bulk email failed', color: 'error', icon: 'ri-error-warning-line'})
  } finally { bulkEmailSending.value = false }
}

async function copyLink(g) {
  copying.value = g.guestId
  try { await navigator.clipboard.writeText(guestInviteUrl(g));
    toast.add({ color: 'green', title: tBy({en:`Copied ${g.guestName}`, km:`បានចម្លង ${g.guestName} រួចហើយ`}), icon: "ri-copy-fill"})
    } catch {}
  setTimeout(() => { copying.value = null }, 1500)
}

function waLink(g) {
  if(!g.phone) return toast.add({ color: 'error', title: tBy({en:`Phone number not found for ${g.guestName}`, km:`លេខទូរស័ព្ទមិនត្រូវបានរកឃើញសម្រាប់ ${g.guestName}`}), icon: "ri-error-warning-line"})
  const msg = encodeURIComponent(`Dear ${g.guestName},\nYou are invited!\n${guestInviteUrl(g)}`)
  navigateTo(`https://wa.me/${g.phone?.replace(/\D/g, '')}?text=${msg}`, { external: true ,open: { target: '_blank' }})
}

// function waLink(g) {
//   const phone = g.phone?.replace(/\D/g, '')

//   if (!phone) return

//   const msg = encodeURIComponent(
//     `Dear ${g.guestName},\nYou are invited!\n${g.inviteUrl}`
//   )

//   return navigateTo(
//     `https://wa.me/${phone}?text=${msg}`,
//     {
//       external: true,
//       open: {
//         target: '_blank'
//       }
//     }
//   )
// }

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
watch(wid, (val) => { if (val) load(0) }, { immediate: true })
onMounted(() => { if (!eventStore.initialized) eventStore.fetchEvents() })

usePageBreadcrumb({
  title:tr('invitations.title'),
  description:`${totalElements.value} ${tr('common.guests')} · ${sentCount.value} ${tr('invitations.sent')} · ${openedCount.value} ${tr('invitations.opened')}`,
  actions: [
    ...(wid.value && canSendInvite.value) ? [
    {
      label: tr('telegram'),
      icon: bulkSending.value ? 'ri-loader-4-line animate-spin' : 'ri-telegram-line',
      type: 'send',
      color: 'create',
      disabled: guestSelect.value?.length === 0 || bulkSending.value,
      onClick: () => sendAllTelegram()
    },
    {
      label: tr('email'),
      icon: bulkEmailSending.value ? 'ri-loader-4-line animate-spin' : 'ri-mail-send-line',
      type: 'send',
      color: 'create',
      disabled: guestSelect.value?.length === 0 || bulkEmailSending.value,
      onClick: () => sendAllEmail()
    }
  ] : []]
})
</script>

<style lang="scss">
.inv-page {
  .inv-header-actions {
    display: flex;
    align-items: center;
    gap: var(--sp-2);
    flex-wrap: wrap;
  }

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

  .inv-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--sp-4);
    @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); }
  }

  .inv-stat {
    display: flex;
    align-items: center;
    gap: var(--sp-3);
    padding: var(--sp-4) var(--sp-5);
    &__icon {
      width: 44px; height: 44px;
      border-radius: var(--r-lg);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.25rem; flex-shrink: 0;
    }
    &__value { font-size: 1.625rem; font-weight: 700; color: var(--c-text); line-height: 1; }
    &__label { font-size: 0.75rem; color: var(--c-muted); margin-top: 3px; }
  }

  .inv-tpl-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--sp-4);
    padding: var(--sp-4) var(--sp-5);
    flex-wrap: wrap;
    &__left { display: flex; align-items: center; gap: var(--sp-3); flex: 1; min-width: 0; }
    &__icon {
      width: 40px; height: 40px;
      border-radius: var(--r-md);
      background: color-mix(in srgb, var(--c-accent) 12%, transparent);
      color: var(--c-accent);
      font-size: 1.125rem;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    &__label {
      font-size: 0.6875rem; font-weight: 600;
      text-transform: uppercase; letter-spacing: 0.08em;
      color: var(--c-muted); margin-bottom: 2px;
    }
    &__name {
      font-size: 0.9375rem; font-weight: 600; color: var(--c-text);
      display: flex; align-items: center; gap: var(--sp-2);
    }
    &__none { font-size: 0.875rem; color: var(--c-muted); }
    &__actions { display: flex; gap: var(--sp-2); flex-direction: row; justify-content: center; white-space: nowrap;; }
  }

  .inv-tpl-key {
    padding: 2px 7px; border-radius: var(--r-sm);
    background: color-mix(in srgb, var(--c-accent) 12%, transparent);
    color: var(--c-accent); font-size: 0.6875rem; font-family: monospace; font-weight: 700;
  }

  .inv-filters {
    display: flex; gap: var(--sp-3); align-items: center; flex-wrap: nowrap;
    @media (max-width: 640px) { flex-wrap: wrap; }
  }

  .inv-search {
    position: relative; flex: 1; min-width: 180px;
    i { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--c-muted); pointer-events: none; font-size: 0.9375rem; }
    .input { padding-left: 36px; }
  }

  .inv-count {
    font-size: 0.75rem; color: var(--c-muted); white-space: nowrap;
    padding: 4px var(--sp-3); border-radius: var(--r-full);
    border: 1px solid var(--c-border);
  }

  .input-sm { padding: 8px 12px !important; font-size: 0.8125rem !important; }

  .inv-table-wrapper {
    display: flex; flex-direction: column; gap: var(--sp-3);
  }

  .inv-pagination {
    display: flex; align-items: center; justify-content: center; gap: var(--sp-4);
  }
  .inv-page-info { font-size: 0.8125rem; color: var(--c-muted); }

  .g-name { font-size: 0.875rem; font-weight: 600; color: var(--c-text); }
  .g-sub { font-size: 0.75rem; color: var(--c-muted); margin-top: 2px; }
  .g-meta {
    font-size: 0.6875rem; color: var(--c-muted); opacity: 0.7; margin-top: 2px;
    display: flex; align-items: center; gap: 4px;
    i { font-size: 0.75rem; }
  }

  .rsvp-badge {
    display: inline-block; padding: 3px 9px; border-radius: var(--r-full);
    font-size: 0.6875rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.04em; white-space: nowrap;
    &.rsvp-invited   { background: color-mix(in srgb, var(--c-accent) 15%, transparent);  color: var(--c-accent); }
    &.rsvp-confirmed { background: color-mix(in srgb, var(--c-success) 15%, transparent); color: var(--c-success); }
    &.rsvp-declined  { background: color-mix(in srgb, var(--c-danger) 15%, transparent);  color: var(--c-danger); }
    &.rsvp-attended  { background: color-mix(in srgb, var(--c-success) 10%, transparent); color: var(--c-success); }
    &.rsvp-no_show   { background: rgba(255,179,71,0.15); color: var(--c-accent-2); }
    &.rsvp-unknown   { background: var(--c-hover); color: var(--c-muted); }
  }

  .inv-status {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 0.8125rem; font-weight: 500;
    &--sent    { color: var(--c-success); }
    &--failed  { color: var(--c-danger); }
    &--opened  { color: var(--c-info); }
    &--pending { color: var(--c-muted); font-weight: 400; }
  }

  .inv-time { font-size: 0.6875rem; color: var(--c-muted); margin-top: 2px; }
  .inv-device {
    font-size: 0.6875rem; color: var(--c-muted);
    max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 2px;
  }

  .inv-actions { display: flex; gap: 4px; flex-wrap: nowrap; }

  .iact {
    width: 30px; height: 30px;
    display: inline-flex; align-items: center; justify-content: center;
    border-radius: var(--r-sm); font-size: 0.9375rem;
    border: 1px solid transparent; cursor: pointer; text-decoration: none;
    transition: opacity 0.15s, transform 0.1s; flex-shrink: 0;
    background: none;
    &:hover { opacity: 0.85; transform: scale(1.08); }
    &:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
    &--view  { background: color-mix(in srgb, var(--c-accent) 12%, transparent); color: var(--c-accent); border-color: color-mix(in srgb, var(--c-accent) 25%, transparent); }
    &--copy  { background: var(--c-hover); color: var(--c-muted); border-color: var(--c-border); }
    &--tg    { background: #229ed918; color: #229ed9; border-color: #229ed930; }
    &--email { background: #ea433518; color: #ea4335; border-color: #ea433530; }
    &--wa    { background: #25d36618; color: #25d366; border-color: #25d36630; }
  }

  // Template picker
  .tpl-hint { font-size: 0.75rem; color: var(--c-muted); }
  .tpl-grid {
    display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--sp-3);
    max-height: 420px; overflow-y: auto;
    @media (max-width: 480px) { grid-template-columns: 1fr; }
  }
  .tpl-card {
    display: flex; flex-direction: column; gap: var(--sp-2);
    padding: var(--sp-3); border: 1px solid var(--c-border);
    border-radius: var(--r-lg); background: var(--c-surface);
    transition: border-color 0.15s;
    &:hover { border-color: color-mix(in srgb, var(--c-accent) 40%, transparent); }
    &--active { border-color: var(--c-accent); background: color-mix(in srgb, var(--c-accent) 5%, var(--c-surface)); }
  }
  .tpl-thumb {
    width: 100%; height: 80px; border-radius: var(--r-sm);
    background: var(--c-hover); display: flex; align-items: center; justify-content: center;
    overflow: hidden; font-size: 2rem; color: var(--c-muted);
    img { width: 100%; height: 100%; object-fit: cover; }
  }
  .tpl-info { display: flex; align-items: center; justify-content: space-between; gap: var(--sp-2); min-width: 0; }
  .tpl-name { font-size: 0.8125rem; font-weight: 600; color: var(--c-text); flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .tpl-key {
    padding: 2px 6px; border-radius: var(--r-sm);
    background: color-mix(in srgb, var(--c-accent) 10%, transparent);
    color: var(--c-accent); font-size: 0.6875rem; font-family: monospace; font-weight: 700; white-space: nowrap;
  }
  .tpl-set-btn { width: 100%; justify-content: center; }
  .tpl-active-badge {
    width: 100%; display: flex; align-items: center; justify-content: center;
    gap: 5px; padding: 6px; border-radius: var(--r-sm);
    background: color-mix(in srgb, var(--c-success) 10%, transparent);
    color: var(--c-success); font-size: 0.75rem; font-weight: 600;
  }

  .hide-xs { @media (max-width: 480px) { display: none; } }
}

.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.55); backdrop-filter: blur(6px);
  z-index: 300; display: flex; align-items: center; justify-content: center; padding: var(--sp-4);
}
.modal-panel {
  width: min(600px, 100%); max-height: 85dvh; overflow-y: auto;
  border-radius: var(--r-2xl); padding: var(--sp-6);
  display: flex; flex-direction: column; gap: var(--sp-4);
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  h3 { font-size: 1.125rem; font-weight: 700; color: var(--c-text); margin: 0; }
}
</style>
