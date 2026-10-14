<template>
  <div v-if="!guest" class="gdc-empty glass-card">
    <i class="ri-user-unfollow-line" />
    <span>{{ tr('guests.empty') }}</span>
  </div>

  <div v-else class="gdc-grid">
    <!-- Profile card -->
    <div class="glass-card gdc-profile-card">
      <RAvatar
        :src="guest.avatarUrl || ''"
        :gender="guest.gender"
        size="2xl"
        :chip="!!guest.checkedInAt"
      />
      <h2 class="gdc-name">{{ guest.name }}</h2>
      <p v-if="guest.code" class="gdc-code"><i class="ri-qr-code-line" /> {{ guest.code }}</p>
      <div class="gdc-badges">
        <span class="badge" :class="sideBadge(guest.side)">
          <i :class="sideIcon(guest.side)" /> {{ sideLabel(guest.side) }}
        </span>
        <span class="badge" :class="rsvpBadge(guest.rsvp)">
          <i :class="rsvpIcon(guest.rsvp)" /> {{ rsvpLabel(guest.rsvp) }}
        </span>
      </div>
      <p v-if="guest.phone" class="gdc-contact"><i class="ri-phone-line" /> {{ guest.phone }}</p>
      <p v-if="guest.email" class="gdc-contact"><i class="ri-mail-line" /> {{ guest.email }}</p>
      <div class="gdc-meta">
        <span class="gdc-meta-chip"><i class="ri-user-2-line" /> {{ guest.seats }} {{ tr('seats') }}</span>
        <span v-if="guest.dietary" class="gdc-meta-chip"><i class="ri-restaurant-2-line" /> {{ guest.dietary }}</span>
      </div>
      <RBtn
        v-if="inviteLink"
        class="gdc-open-invite"
        :label="tr('view_invitation')"
        icon="ri-links-line"
        @click="openInvite"
      />
    </div>

    <!-- Details card -->
    <div class="glass-card gdc-details-card">
      <h3 class="gdc-section-title"><i class="ri-contacts-book-2-line" /> {{ tr('basic_information') }}</h3>
      <div class="gdc-fields">
        <div class="gdc-field">
          <span class="gdc-label">{{ tr('name') }}</span>
          <span class="gdc-value">{{ guest.name || '—' }}</span>
        </div>
        <div class="gdc-field">
          <span class="gdc-label">{{ tr('phone') }}</span>
          <span class="gdc-value">{{ guest.phone || '—' }}</span>
        </div>
        <div class="gdc-field">
          <span class="gdc-label">{{ tr('email') }}</span>
          <span class="gdc-value">{{ guest.email || '—' }}</span>
        </div>
        <div class="gdc-field">
          <span class="gdc-label">{{ tr('gender') }}</span>
          <span class="gdc-value">{{ cap(guest.gender) }}</span>
        </div>
        <div class="gdc-field">
          <span class="gdc-label">{{ tr('side') }}</span>
          <span class="gdc-value">{{ sideLabel(guest.side) }}</span>
        </div>
        <div class="gdc-field">
          <span class="gdc-label">{{ tr('seats') }}</span>
          <span class="gdc-value">{{ guest.seats }}</span>
        </div>
        <div class="gdc-field">
          <span class="gdc-label">{{ tr('dietary') }}</span>
          <span class="gdc-value">{{ guest.dietary || '—' }}</span>
        </div>
        <div class="gdc-field gdc-field-block">
          <span class="gdc-label">{{ tr('address') }}</span>
          <span class="gdc-value">{{ guest.address || '—' }}</span>
        </div>
        <div v-if="guest.notes" class="gdc-field gdc-field-block">
          <span class="gdc-label">{{ tr('notes') }}</span>
          <span class="gdc-value gdc-value-muted">{{ guest.notes }}</span>
        </div>
      </div>

      <h3 v-if="guest.inviteToken" class="gdc-section-title mt-6"><i class="ri-mail-send-line" /> {{ tr('invitation') }}</h3>
      <div v-if="guest.inviteToken" class="gdc-fields">
        <div class="gdc-field">
          <span class="gdc-label">{{ tr('invitation_link') }}</span>
          <span class="gdc-value gdc-invite-link">
            <span class="gdc-link-text">{{ inviteLink }}</span>
            <button class="btn-icon gdc-copy" title="Copy" @click="copyInvite"><i class="ri-file-copy-line" /></button>
          </span>
        </div>
        <div class="gdc-field">
          <span class="gdc-label">{{ tr('rsvp_status') }}</span>
          <span class="badge" :class="rsvpBadge(guest.rsvp)">
            <i :class="rsvpIcon(guest.rsvp)" /> {{ rsvpLabel(guest.rsvp) }}
          </span>
        </div>
        <div class="gdc-field">
          <span class="gdc-label">{{ tr('attendance') }}</span>
          <span v-if="guest.checkedInAt" class="badge badge-success">
            <i class="ri-checkbox-circle-fill" /> {{ fmtDate(guest.checkedInAt) }}
          </span>
          <span v-else class="gdc-value">—</span>
        </div>
      </div>

      <h3 class="gdc-section-title mt-6"><i class="ri-time-line" /> {{ tr('system_information') }}</h3>
      <div class="gdc-fields">
        <div class="gdc-field">
          <span class="gdc-label">{{ tr('created_at') }}</span>
          <span class="gdc-value">{{ fmtDate(guest.createdAt) }}</span>
        </div>
        <div class="gdc-field">
          <span class="gdc-label">{{ tr('updated_at') }}</span>
          <span class="gdc-value">{{ fmtDate(guest.updatedAt) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  guest: { type: Object, default: null },
})

const { tr } = useTr()
const toast = useToastStore()

// ── Badge / label helpers ────────────────────────────────────────────────
const rsvpBadge = (r) => ({ confirmed: 'badge-success', pending: 'badge-accent', declined: 'badge-danger' })[r] || 'badge-muted'
const rsvpIcon  = (r) => ({ confirmed: 'ri-checkbox-circle-fill', pending: 'ri-time-line', declined: 'ri-close-circle-line' })[r] || 'ri-question-line'
const sideBadge = (s) => ({ bride: 'badge-info', groom: 'badge-accent', friend: 'badge-muted' })[s] || 'badge-muted'
const sideIcon  = (s) => ({ bride: 'ri-user-heart-fill', groom: 'ri-user-2-fill', friend: 'ri-group-fill' })[s] || 'ri-group-line'
const sideLabel = (s) => tr(s || '')
const rsvpLabel = (r) => tr(r ? `status.${r}` : '')
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : '—')
const fmtDate = (d) => (d ? new Date(d).toLocaleString() : '—')

// ── Invitation ───────────────────────────────────────────────────────────
const inviteLink = computed(() =>
  props.guest?.inviteToken ? `${window.location.origin}/invite/${props.guest.inviteToken}` : '',
)
const openInvite = () => {
  if (inviteLink.value) window.open(inviteLink.value, '_blank')
}
const copyInvite = async () => {
  if (!inviteLink.value) return
  try {
    await navigator.clipboard.writeText(inviteLink.value)
    toast.add('Invitation link copied', tr('common.success'))
  } catch {
    toast.add('Failed to copy link', 'Error')
  }
}
</script>

<style lang="scss" scoped>
.gdc-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: var(--sp-2); padding: var(--sp-7); text-align: center; color: var(--c-muted);
  font-size: 0.875rem;
  i { font-size: 1.5rem; }
}

.gdc-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: var(--sp-5);
  @media (max-width: 900px) { grid-template-columns: 1fr; }
}

.gdc-profile-card {
  display: flex; flex-direction: column; align-items: center;
  padding: var(--sp-6); text-align: center; gap: var(--sp-2); align-self: start;
}
.gdc-name { font-family: var(--font-700); font-size: 1.125rem; font-weight: 700; }
.gdc-code { font-size: 0.8125rem; color: var(--c-muted); display: flex; align-items: center; gap: 4px; }
.gdc-contact { font-size: 0.8125rem; color: var(--c-muted); display: flex; align-items: center; gap: 4px; }
.gdc-badges { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; margin-top: var(--sp-1); }
.gdc-meta { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; margin-top: var(--sp-3); }
.gdc-meta-chip {
  display: inline-flex; align-items: center; gap: 4px; font-size: 0.75rem;
  padding: 3px 10px; border-radius: 999px; background: rgba(255,255,255,0.06);
  border: 1px solid var(--c-border); color: var(--c-muted);
}
.gdc-open-invite { margin-top: var(--sp-1); }

.gdc-details-card { padding: var(--sp-5); }
.gdc-section-title {
  font-family: var(--font-700); font-size: 0.9375rem; font-weight: 700;
  display: flex; align-items: center; gap: var(--sp-2);
  margin-bottom: var(--sp-4);
  i { color: var(--c-accent); }
}
.mt-6 { margin-top: var(--sp-6); }

.gdc-fields { display: flex; flex-direction: column; gap: var(--sp-3); }
.gdc-field {
  display: flex; justify-content: space-between; align-items: center; gap: var(--sp-4);
  padding-bottom: var(--sp-3); border-bottom: 1px solid var(--c-border);
  &:last-child { border-bottom: none; }
}
.gdc-field-block { flex-direction: column; align-items: flex-start; gap: var(--sp-1); }
.gdc-label { font-size: 0.8125rem; color: var(--c-muted); font-weight: 500; white-space: nowrap; }
.gdc-value { font-size: 0.875rem; font-weight: 600; color: var(--c-text); word-break: break-word; text-align: right; }
.gdc-value-muted { font-weight: 500; color: var(--c-muted); text-align: left; }

.gdc-invite-link { display: inline-flex; align-items: center; gap: 6px; max-width: 100%; }
.gdc-link-text {
  font-weight: 500; color: var(--c-accent); font-size: 0.8125rem;
  max-width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.gdc-copy { font-size: 0.9rem; color: var(--c-muted); }
.gdc-copy:hover { color: var(--c-accent); }
</style>