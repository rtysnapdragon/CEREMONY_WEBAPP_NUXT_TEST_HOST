<template>
  <RWrapperPage class="notifications-page">
    <RPageHeader :title="tr('notifications.title')" :subtitle="`${notifStore.unreadCount} ${tr('notifications.unread')}`">
      <template #actions>
        <button v-if="notifStore.unreadCount > 0" class="btn-ghost" @click="notifStore.markAllRead()">
          <i class="ri-check-double-line" /> {{ tr('notifications.markAllRead') }}
        </button>
      </template>
    </RPageHeader>

    <!-- Filter tabs -->
    <div class="notif-tabs animate-fade-up delay-1">
      <button v-for="tab in tabs" :key="tab.value" class="notif-tab" :class="{ active: activeTab === tab.value }" @click="activeTab = tab.value">
        {{ tab.label }}
        <span v-if="tab.count" class="tab-count">{{ tab.count }}</span>
      </button>
    </div>

    <!-- Notification list -->
    <div class="notif-list animate-fade-up delay-2">
      <div v-if="filteredNotifications.length === 0" class="empty-state glass-card">
        <div class="empty-icon"><i class="ri-notification-off-line" /></div>
        <h3>{{ tr('notifications.noNotifications') }}</h3>
        <p>You're all caught up!</p>
      </div>

      <div
        v-for="notif in filteredNotifications"
        :key="notif.id"
        class="notif-item glass-widget"
        :class="{ unread: !notif.read }"
        @click="notifStore.markRead(notif.id)"
      >
        <div class="ni-icon" :class="`ni-${notif.type}`">
          <i :class="typeIcon(notif.type)" />
        </div>
        <div class="ni-content">
          <div class="ni-title">{{ notif.title }}</div>
          <div class="ni-msg">{{ notif.message }}</div>
          <div class="ni-time">{{ timeAgo(notif.time) }}</div>
        </div>
        <div class="ni-right">
          <div v-if="!notif.read" class="ni-dot" />
          <button class="btn-icon btn-xs-icon ni-del" @click.stop="notifStore.deleteNotification(notif.id)">
            <i class="ri-close-line" />
          </button>
        </div>
      </div>
    </div>
  </RWrapperPage>
</template>

<script setup>
definePageMeta({ layout: 'navbar', middleware: ['auth', 'permission'], permission: 'VIEW_NOTIFICATION' })
const { notifStore, activeTab, tabs, filteredNotifications, typeIcon, timeAgo, tr, init } = useNotificationPage()
onMounted(init)
</script>

<style lang="scss">
.notifications-page { display: flex; flex-direction: column; gap: var(--sp-5); }

.notif-tabs {
  display: flex;
  gap: var(--sp-2);
  border-bottom: 1px solid var(--c-border);
  padding-bottom: var(--sp-1);
}

.notif-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--c-muted);
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all var(--t-fast);

  &:hover { color: var(--c-text); }
  &.active { color: var(--c-accent); border-bottom-color: var(--c-accent); }
}

.tab-count {
  background: var(--c-accent);
  color: white;
  font-size: 0.6rem;
  font-weight: 700;
  width: 16px;
  height: 16px;
  border-radius: var(--r-full);
  display: flex;
  align-items: center;
  justify-content: center;
}

.notif-list { display: flex; flex-direction: column; gap: var(--sp-3); }

.notif-item {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-4);
  padding: var(--sp-4) var(--sp-5);
  border-radius: var(--r-xl);
  cursor: pointer;
  transition: all var(--t-fast);
  position: relative;

  &:hover { border-color: rgba(255,140,66,0.15); transform: translateX(2px); }
  &.unread { background: rgba(255,140,66,0.04); }
}

.ni-icon {
  width: 44px; height: 44px;
  border-radius: var(--r-lg);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;

  &.ni-success  { background: rgba(74,222,128,0.12);  color: var(--c-success, #4ade80); }
  &.ni-info     { background: rgba(96,165,250,0.12);  color: var(--c-info, #60a5fa); }
  &.ni-warning  { background: rgba(255,179,71,0.12);  color: var(--c-accent-2, #ffb347); }
  &.ni-error    { background: rgba(239,68,68,0.12);   color: #f87171; }
  &.ni-accent   { background: rgba(255,140,66,0.12);  color: var(--c-accent); }
  &.ni-wish     { background: rgba(251,113,133,0.12); color: #fb7185; }
  &.ni-gift     { background: rgba(167,139,250,0.12); color: #a78bfa; }
  &.ni-email    { background: rgba(96,165,250,0.12);  color: var(--c-info, #60a5fa); }
  &.ni-telegram { background: rgba(56,189,248,0.12);  color: #38bdf8; }
  &.ni-sms      { background: rgba(74,222,128,0.12);  color: var(--c-success, #4ade80); }
}

.ni-content { flex: 1; min-width: 0; }
.ni-title { font-size: 0.9375rem; font-weight: 600; color: var(--c-text); margin-bottom: 3px; }
.ni-msg { font-size: 0.8125rem; color: var(--c-muted); line-height: 1.5; margin-bottom: 5px; }
.ni-time { font-size: 0.75rem; color: var(--c-muted); opacity: 0.7; }

.ni-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--sp-2);
  flex-shrink: 0;
}

.ni-dot { width: 8px; height: 8px; border-radius: var(--r-full); background: var(--c-accent); animation: glowPulse 2s ease-in-out infinite; }

.ni-del { opacity: 0; transition: opacity var(--t-fast); }
.notif-item:hover .ni-del { opacity: 1; }
.live-chip { display: inline-flex; align-items: center; gap: 4px; font-size: 0.7rem; font-weight: 600; color: var(--c-success); margin-left: 8px; vertical-align: middle; }
.live-dot-sm { width: 6px; height: 6px; border-radius: 50%; background: var(--c-success); display: inline-block; animation: pulse-live 1.5s infinite; }
@keyframes pulse-live { 0%,100%{opacity:1;transform:scale(1);}50%{opacity:.4;transform:scale(.8);} }
</style>
