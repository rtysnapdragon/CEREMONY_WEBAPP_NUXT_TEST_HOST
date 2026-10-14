<template>
  <RWrapperPage class="user-info-page">
    <RPageHeader :title="tr('user_detail')" :subtitle="userData.username || '—'">
      <template #actions>
        <button class="btn-icon" @click="goBack"><i class="ri-arrow-left-line" /></button>
        <RBtn v-if="canAssignRole" type="add" icon="ri-shield-user-line" :label="tr('assign_role')" @click="showAssignRoleModal = true" />
      </template>
    </RPageHeader>

    <div v-if="isLoading" class="ui-loading glass-card animate-fade-up">
      <i class="ri-loader-4-line ri-spin" /> Loading...
    </div>

    <div v-else class="ui-grid animate-fade-up delay-1">
      <!-- Profile card -->
      <div class="glass-card ui-profile-card">
        <RAvatar :src="userData.avatarUrl" :label="userData.firstName + ' ' + userData.lastName" size="2xl" :borderColor="userData.gender === 'male' ? 'female' : 'female'" :chip="userData.status == 'ACTIVE' ? true : false"/>
        <!-- <div class="ui-avatar-lg">{{ initials }}</div> -->
        <h2 class="ui-name">{{ userData.firstName }} {{ userData.lastName }}</h2>
        <p class="ui-username">@{{ userData.username }}</p>
        <p class="ui-email"><i class="ri-mail-line" /> {{ userData.email }}</p>
        <div class="ui-roles">
          <span v-for="r in (userData.roles || [])" :key="r" class="um-role-badge">{{ r }}</span>
        </div>
      </div>

      <!-- Details card -->
      <div class="glass-card ui-details-card">
        <h3 class="ui-section-title"><i class="ri-user-3-line" /> {{ tr('basic_information') }}</h3>
        <div class="ui-fields">
          <div class="ui-field">
            <span class="ui-label">{{ tr('username') }}</span>
            <span class="ui-value">{{ userData.username || '—' }}</span>
          </div>
          <div class="ui-field">
            <span class="ui-label">{{ tr('email') }}</span>
            <span class="ui-value">{{ userData.email || '—' }}</span>
          </div>
          <div class="ui-field">
            <span class="ui-label">{{ tr('first_name') }}</span>
            <span class="ui-value">{{ userData.firstName || '—' }}</span>
          </div>
          <div class="ui-field">
            <span class="ui-label">{{ tr('last_name') }}</span>
            <span class="ui-value">{{ userData.lastName || '—' }}</span>
          </div>
          <div class="ui-field">
            <span class="ui-label">{{ tr('gender') }}</span>
            <span class="ui-value">{{ userData.gender || '—' }}</span>
          </div>
          <div class="ui-field">
            <span class="ui-label">{{ tr('phone_number') }}</span>
            <span class="ui-value">{{ userData.phone || '—' }}</span>
          </div>
          <div class="ui-field">
            <span class="ui-label">{{ tr('status') }}</span>
            <span class="ui-value">{{ userData.status || '—' }}</span>
          </div>
        </div>

        <h3 class="ui-section-title mt-6"><i class="ri-time-line" /> {{ tr('system_information') }}</h3>
        <div class="ui-fields">
          <div class="ui-field">
            <span class="ui-label">{{ tr('created_at') }}</span>
            <span class="ui-value">{{ userData.createdAt ? new Date(userData.createdAt).toLocaleString() : '—' }}</span>
          </div>
          <div class="ui-field">
            <span class="ui-label">{{ tr('updated_at') }}</span>
            <span class="ui-value">{{ userData.updatedAt ? new Date(userData.updatedAt).toLocaleString() : '—' }}</span>
          </div>
        </div>
      </div>
    </div>
    <AssignRoleModal v-if="canAssignRole" v-model="showAssignRoleModal" :user="userData" :user-id="userData?.id" @saved="getProfileData" />
  </RWrapperPage>
</template>
<!-- :open="() => { ActionOpenChangePassword('Open') }" -->

<script setup>
const route = useRoute()
const { tr } = useTr()
const authStore = useAuthStore()
const toast = useToastStore()
const canAssignRole = computed(() => authStore.permissions.includes('ASSIGN_ROLE'))
const initials = computed(() => {
  const f = userData.value?.firstName?.[0] || ''
  const l = userData.value?.lastName?.[0] || ''
  return (f + l).toUpperCase() || userData.value?.username?.[0]?.toUpperCase() || '?'
})

const isLoading = ref(false)
const userData = ref({})
const showChangePasswordModal = ref(false)
const showResetPasswordModal = ref(false)
const showAssignRoleModal = ref(false)

// user object passed as JSON query param from the list page
const routeUser = computed(() => {
  try { return JSON.parse(route.query.user || '{}') } catch { return {} }
})

const getProfileData = async () => {
  const userId = routeUser.value?.id
  if (!userId) {
    // no id — fall back to route user data directly
    userData.value = routeUser.value
    return
  }
  isLoading.value = true
  try {
    const { data, error } = await useHttp(`/api/v1/users/${userId}`, { method: 'GET' })
    if (error.value) throw new Error(error.value)
    userData.value = data.value?.data ?? data.value ?? routeUser.value
  } catch {
    // fall back to the data already passed via query
    userData.value = routeUser.value
  } finally {
    isLoading.value = false
  }
}

const goBack = () => navigateTo(localePath('/user_and_privilege/user_management'))

onMounted(getProfileData)

usePageBreadcrumb({
  title:tr('user_management'),
  description: userData.value?.firstName || '' + ' ' + userData.value?.lastName || '',
  backTooltip: 'Back',
  backAction: () => goBack(),
})
definePageMeta({ layout: 'navbar', middleware: ['auth', 'permission'], permission: 'VIEW_USER' })
</script>

<style lang="scss">
.user-info-page { display: flex; flex-direction: column; gap: var(--sp-5); }

.ui-loading {
  display: flex; align-items: center; justify-content: center; gap: var(--sp-2);
  color: var(--c-muted); padding: var(--sp-7);
  i { font-size: 1.25rem; }
}

.ui-grid {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: var(--sp-5);
  @media (max-width: 768px) { grid-template-columns: 1fr; }
}

.ui-profile-card {
  display: flex; flex-direction: column; align-items: center;
  padding: var(--sp-6); text-align: center; gap: var(--sp-2);
}
.ui-avatar-wrap { margin-bottom: var(--sp-2); }
.ui-avatar-lg {
  width: 72px; height: 72px; border-radius: 50%;
  background: rgba(255,140,66,0.15); color: var(--c-accent);
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 1.5rem;
}
.ui-name { font-family: var(--font-700); font-size: 1.125rem; font-weight: 700; }
.ui-username { font-size: 0.875rem; color: var(--c-muted); }
.ui-email { font-size: 0.8125rem; color: var(--c-muted); display: flex; align-items: center; gap: 4px; }
.ui-roles { display: flex; flex-wrap: wrap; justify-content: center; gap: 4px; margin-top: var(--sp-2); }

.ui-details-card { padding: var(--sp-5); }
.ui-section-title {
  font-family: var(--font-700); font-size: 0.9375rem; font-weight: 700;
  display: flex; align-items: center; gap: var(--sp-2);
  margin-bottom: var(--sp-4);
  i { color: var(--c-accent); }
}
.mt-6 { margin-top: var(--sp-6); }
.mt-3 { margin-top: var(--sp-3); }

.ui-fields { display: flex; flex-direction: column; gap: var(--sp-3); }
.ui-field {
  display: flex; justify-content: space-between; align-items: center;
  padding-bottom: var(--sp-3); border-bottom: 1px solid var(--c-border);
  &:last-child { border-bottom: none; }
}
.ui-label { font-size: 0.8125rem; color: var(--c-muted); font-weight: 500; }
.ui-value { font-size: 0.875rem; font-weight: 600; color: var(--c-text); }
</style>
