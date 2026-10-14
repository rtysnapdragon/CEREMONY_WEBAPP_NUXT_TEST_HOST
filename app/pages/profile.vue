<template>
  <RWrapperPage class="profile-page">
    <div class="profile-inner">
      <div class="profile-header">
        <h1 class="profile-title">Profile</h1>
        <p class="profile-sub">Manage your account information</p>
      </div>

      <div class="profile-layout">
        <!-- Sidebar -->
        <div class="profile-sidebar">
          <div class="sidebar-card">
            <div class="avatar-section">
              <div class="avatar-wrap">
                <!-- Loading overlay while uploading -->
                <div v-if="avatarUploading" class="avatar-loading">
                  <i class="ri-loader-4-line spin"></i>
                </div>
                <AppAvatar
                  :src="authStore.avatar"
                  :name="authStore.fullName"
                  :size="80"
                  shape="circle"
                  :border="true"
                  :clickable="!!authStore.avatar"
                  :style="avatarUploading ? 'opacity:0.4' : ''"
                  class="profile-avatar-av"
                  @click="authStore.avatar && openAvatarViewer()"
                />
                <!-- Upload button -->
                <button class="avatar-cam" type="button" :disabled="avatarUploading" @click="fileInput?.click()">
                  <i class="ri-camera-line"></i>
                </button>
                <!-- Remove button — only shown when avatar exists -->
                <button
                  v-if="currentAvatar !== DEFAULT_AVATAR"
                  class="avatar-remove"
                  type="button"
                  :disabled="avatarUploading"
                  title="Remove photo"
                  @click="removeAvatar"
                >
                  <i class="ri-close-line"></i>
                </button>
                <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleAvatarUpload" />
              </div>
              <h2 class="sidebar-name">{{ authStore.fullName || '—' }}</h2>
              <p class="sidebar-role">{{ userRoleLabel }}</p>
            </div>

            <nav class="sidebar-nav">
              <button
                v-for="item in navItems"
                :key="item.id"
                class="nav-item"
                :class="{ active: activeTab === item.id }"
                type="button"
                @click="activeTab = item.id"
              >
                <i :class="item.icon"></i>
                {{ item.label }}
              </button>
            </nav>
          </div>
        </div>

        <!-- Main content -->
        <div class="profile-main">
          <!-- Personal Info -->
          <div v-if="activeTab === 'personal'" class="section-card">
            <h3 class="section-title" style="margin-bottom:1.5rem">Personal Information</h3>

            <div v-if="loading" class="loading-state">
              <i class="ri-loader-4-line spin"></i> Loading profile...
            </div>

            <form v-else novalidate class="profile-form" @submit.prevent="saveProfile">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">First Name <span class="req">*</span></label>
                  <input v-model="form.firstName" class="form-input" :class="{ 'input-error': errors.firstName }" placeholder="First name" @input="delete errors.firstName" />
                  <span v-if="errors.firstName" class="field-error">{{ errors.firstName }}</span>
                </div>
                <div class="form-group">
                  <label class="form-label">Last Name</label>
                  <input v-model="form.lastName" class="form-input" placeholder="Last name" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Username</label>
                <div class="input-action-row">
                  <input :value="authStore.user?.username" class="form-input" disabled style="opacity:0.6;cursor:not-allowed;flex:1" />
                  <button type="button" class="btn-change" @click="openUsernameModal">
                    <i class="ri-pencil-line" /> Change
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Email Address</label>
                <div class="input-action-row">
                  <input :value="authStore.user?.email" class="form-input" disabled style="opacity:0.6;cursor:not-allowed;flex:1" />
                  <button type="button" class="btn-change" @click="openEmailModal">
                    <i class="ri-mail-settings-line" /> Change
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Phone Number</label>
                <input v-model="form.phone" class="form-input" placeholder="+855 ..." />
              </div>

              <div class="form-actions">
                <button type="submit" class="btn-primary" :disabled="saving">
                  <i :class="saving ? 'ri-loader-4-line spin' : 'ri-save-line'"></i>
                  {{ saving ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </form>
          </div>

          <!-- Security -->
          <div v-if="activeTab === 'security'" class="section-card">
            <div class="section-title-row">
              <h3 class="section-title">Change Password</h3>
              <NuxtLink to="/auth/forgot-password" class="forgot-link">
                <i class="ri-question-line"></i> Forgot password?
              </NuxtLink>
            </div>
            <form novalidate class="profile-form" @submit.prevent="changePassword">
              <div class="form-group">
                <label class="form-label">Current Password <span class="req">*</span></label>
                <input v-model="pwForm.currentPassword" type="password" class="form-input" :class="{ 'input-error': pwErrors.currentPassword }" @input="delete pwErrors.currentPassword" />
                <span v-if="pwErrors.currentPassword" class="field-error">{{ pwErrors.currentPassword }}</span>
              </div>
              <div class="form-group">
                <label class="form-label">New Password <span class="req">*</span></label>
                <input v-model="pwForm.newPassword" type="password" class="form-input" :class="{ 'input-error': pwErrors.newPassword }" @input="delete pwErrors.newPassword" />
                <span v-if="pwErrors.newPassword" class="field-error">{{ pwErrors.newPassword }}</span>
              </div>
              <div class="form-group">
                <label class="form-label">Confirm New Password <span class="req">*</span></label>
                <input v-model="pwForm.confirmPassword" type="password" class="form-input" :class="{ 'input-error': pwErrors.confirmPassword }" @input="delete pwErrors.confirmPassword" />
                <span v-if="pwErrors.confirmPassword" class="field-error">{{ pwErrors.confirmPassword }}</span>
              </div>
              <div class="form-actions">
                <button type="submit" class="btn-primary" :disabled="pwSaving">
                  <i :class="pwSaving ? 'ri-loader-4-line spin' : 'ri-lock-line'"></i>
                  {{ pwSaving ? 'Updating...' : 'Update Password' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </RWrapperPage>

  <!-- ── Change Email Modal ───────────────────────────────────── -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="showEmailModal" class="modal-backdrop" @click.self="closeEmailModal">
        <div class="modal-box">
          <div class="modal-header">
            <h3 class="modal-title"><i class="ri-mail-settings-line" /> Change Email</h3>
            <button class="modal-close" type="button" @click="closeEmailModal"><i class="ri-close-line" /></button>
          </div>

          <!-- Step 1: enter new email -->
          <template v-if="emailStep === 1">
            <div class="modal-body">
              <p class="modal-desc">Enter your new email address. We'll send a 6-digit code to verify it.</p>
              <div class="form-group">
                <label class="form-label">New Email Address</label>
                <input v-model="emForm.newEmail" type="email" class="form-input" :class="{ 'input-error': emErrors.newEmail }"
                       placeholder="new@email.com" autocomplete="email" @input="delete emErrors.newEmail" />
                <span v-if="emErrors.newEmail" class="field-error">{{ emErrors.newEmail }}</span>
              </div>
              <div v-if="emServerError" class="auth-error">
                <i class="ri-error-warning-line" /> {{ emServerError }}
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-outline-sm" :disabled="emSaving" @click="closeEmailModal">Cancel</button>
              <button type="button" class="btn-primary-sm" :disabled="emSaving" @click="requestEmailCode">
                <i v-if="emSaving" class="ri-loader-4-line animate-spin" />
                <i v-else class="ri-mail-send-line" />
                {{ emSaving ? 'Sending…' : 'Send Code' }}
              </button>
            </div>
          </template>

          <!-- Step 2: enter 6-digit code -->
          <template v-else>
            <div class="modal-body">
              <p class="modal-desc">
                We sent a 6-digit code to <strong>{{ emForm.newEmail }}</strong>.
                Enter it below to confirm your new email.
              </p>
              <div class="form-group">
                <label class="form-label">Verification Code</label>
                <input v-model="emForm.code" class="form-input code-input" :class="{ 'input-error': emErrors.code }"
                       placeholder="000000" maxlength="6" inputmode="numeric" autocomplete="one-time-code"
                       @input="delete emErrors.code" />
                <span v-if="emErrors.code" class="field-error">{{ emErrors.code }}</span>
              </div>
              <div v-if="emServerError" class="auth-error">
                <i class="ri-error-warning-line" /> {{ emServerError }}
              </div>
              <button type="button" class="resend-link" :disabled="resendCooldown > 0" @click="requestEmailCode">
                <span v-if="resendCooldown > 0">Resend code in {{ resendCooldown }}s</span>
                <span v-else><i class="ri-refresh-line" /> Resend code</span>
              </button>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-outline-sm" :disabled="emSaving" @click="emailStep = 1; emServerError = ''">Back</button>
              <button type="button" class="btn-primary-sm" :disabled="emSaving" @click="verifyEmailCode">
                <i v-if="emSaving" class="ri-loader-4-line animate-spin" />
                <i v-else class="ri-check-line" />
                {{ emSaving ? 'Verifying…' : 'Confirm Change' }}
              </button>
            </div>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- ── Change Username Modal ─────────────────────────────────── -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="showUsernameModal" class="modal-backdrop" @click.self="closeUsernameModal">
        <div class="modal-box">
          <div class="modal-header">
            <h3 class="modal-title"><i class="ri-user-settings-line" /> Change Username</h3>
            <button class="modal-close" type="button" @click="closeUsernameModal"><i class="ri-close-line" /></button>
          </div>
          <div class="modal-body">
            <p class="modal-desc">Enter a new username and confirm with your current password.</p>

            <div class="form-group">
              <label class="form-label">New Username</label>
              <input v-model="unForm.newUsername" class="form-input" :class="{ 'input-error': unErrors.newUsername }"
                     placeholder="new_username" autocomplete="off"
                     @input="delete unErrors.newUsername" />
              <span v-if="unErrors.newUsername" class="field-error">{{ unErrors.newUsername }}</span>
            </div>

            <div class="form-group">
              <label class="form-label">Current Password</label>
              <div class="input-pw-wrap">
                <input v-model="unForm.currentPassword" :type="showPw ? 'text' : 'password'"
                       class="form-input" :class="{ 'input-error': unErrors.currentPassword }"
                       placeholder="••••••••" autocomplete="current-password"
                       @input="delete unErrors.currentPassword" />
                <button type="button" class="pw-toggle" @click="showPw = !showPw">
                  <i :class="showPw ? 'ri-eye-off-line' : 'ri-eye-line'" />
                </button>
              </div>
              <span v-if="unErrors.currentPassword" class="field-error">{{ unErrors.currentPassword }}</span>
            </div>

            <div v-if="unServerError" class="auth-error" style="margin-top:0.5rem">
              <i class="ri-error-warning-line" /> {{ unServerError }}
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-outline-sm" :disabled="unSaving" @click="closeUsernameModal">Cancel</button>
            <button type="button" class="btn-primary-sm" :disabled="unSaving" @click="submitUsernameChange">
              <i v-if="unSaving" class="ri-loader-4-line animate-spin" />
              <i v-else class="ri-check-line" />
              {{ unSaving ? 'Saving…' : 'Confirm Change' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <MediaViewer v-model="avatarViewerOpen" :items="avatarViewerItems" :index="0" />
</template>

<script setup>
const DEFAULT_AVATAR = '/images/defaultProfile.png'

const avatarViewerOpen = ref(false)
const avatarViewerItems = ref([])
const openAvatarViewer = () => {
  avatarViewerItems.value = [{
    fileUrl: authStore.avatar,
    thumbnailUrl: authStore.avatar,
    altText: authStore.fullName,
    mediaType: 'IMAGE',
  }]
  avatarViewerOpen.value = true
}

const authStore = useAuthStore()
const toast = useToastStore()

const fileInput = ref(null)
const activeTab = ref('personal')
const loading = ref(false)
const saving = ref(false)
const avatarUploading = ref(false)
const pwSaving = ref(false)

const form = reactive({ firstName: '', lastName: '', email: '', phone: '' })
const errors = reactive({})
const pwForm = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' })
const pwErrors = reactive({})

// ── Change email modal (2-step with code) ─────────────────────
const showEmailModal = ref(false)
const emailStep = ref(1)
const emSaving = ref(false)
const emForm = reactive({ newEmail: '', code: '' })
const emErrors = reactive({})
const emServerError = ref('')
const resendCooldown = ref(0)
let cooldownTimer = null

function openEmailModal() {
  emForm.newEmail = ''
  emForm.code = ''
  Object.keys(emErrors).forEach((k) => delete emErrors[k])
  emServerError.value = ''
  emailStep.value = 1
  resendCooldown.value = 0
  showEmailModal.value = true
}

function closeEmailModal() {
  showEmailModal.value = false
  clearInterval(cooldownTimer)
}

function startCooldown() {
  resendCooldown.value = 60
  clearInterval(cooldownTimer)
  cooldownTimer = setInterval(() => {
    if (resendCooldown.value > 0) resendCooldown.value--
    else clearInterval(cooldownTimer)
  }, 1000)
}

async function requestEmailCode() {
  Object.keys(emErrors).forEach((k) => delete emErrors[k])
  emServerError.value = ''
  if (!emForm.newEmail.trim()) { emErrors.newEmail = 'Email is required.'; return }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emForm.newEmail.trim())) { emErrors.newEmail = 'Invalid email address.'; return }

  emSaving.value = true
  try {
    const { error } = await useHttp('/api/v1/users/me/request-email-change', {
      method: 'POST',
      body: { newEmail: emForm.newEmail.trim() },
      isGlobal: true,
    })
    if (error?.value) {
      emServerError.value = error.value?.data?.message || error.value?.message || 'Failed to send code.'
      return
    }
    emForm.code = ''
    emailStep.value = 2
    startCooldown()
    toast.add('Verification code sent to your new email', 'Code Sent')
  } finally {
    emSaving.value = false
  }
}

async function verifyEmailCode() {
  Object.keys(emErrors).forEach((k) => delete emErrors[k])
  emServerError.value = ''
  if (!emForm.code.trim()) { emErrors.code = 'Code is required.'; return }
  if (!/^\d{6}$/.test(emForm.code.trim())) { emErrors.code = 'Enter the 6-digit code.'; return }

  emSaving.value = true
  try {
    const { data, error } = await useHttp('/api/v1/users/me/verify-email-change', {
      method: 'POST',
      body: { newEmail: emForm.newEmail.trim(), code: emForm.code.trim() },
      isGlobal: true,
    })
    if (error?.value) {
      emServerError.value = error.value?.data?.message || error.value?.message || 'Verification failed.'
      return
    }
    const updated = data.value?.data ?? data.value
    if (updated?.email) authStore.user = { ...authStore.user, email: updated.email }
    toast.add(`Email changed to "${updated?.email}"`, 'Done')
    closeEmailModal()
  } finally {
    emSaving.value = false
  }
}

// ── Change username modal ──────────────────────────────────────
const showUsernameModal = ref(false)
const unSaving = ref(false)
const showPw = ref(false)
const unForm = reactive({ newUsername: '', currentPassword: '' })
const unErrors = reactive({})
const unServerError = ref('')

function openUsernameModal() {
  unForm.newUsername = ''
  unForm.currentPassword = ''
  Object.keys(unErrors).forEach((k) => delete unErrors[k])
  unServerError.value = ''
  showPw.value = false
  showUsernameModal.value = true
}

function closeUsernameModal() {
  showUsernameModal.value = false
}

async function submitUsernameChange() {
  Object.keys(unErrors).forEach((k) => delete unErrors[k])
  unServerError.value = ''
  if (!unForm.newUsername.trim()) { unErrors.newUsername = 'New username is required.'; return }
  if (unForm.newUsername.trim().length < 3) { unErrors.newUsername = 'Username must be at least 3 characters.'; return }
  if (!unForm.currentPassword) { unErrors.currentPassword = 'Current password is required.'; return }

  unSaving.value = true
  try {
    const { data, error } = await useHttp('/api/v1/users/me/change-username', {
      method: 'POST',
      body: { newUsername: unForm.newUsername.trim(), currentPassword: unForm.currentPassword },
      isGlobal: true,
    })
    if (error?.value) {
      unServerError.value = error.value?.data?.message || error.value?.message || 'Failed to change username.'
      return
    }
    const updated = data.value?.data ?? data.value
    if (updated?.accessToken) {
      const isProd = process.env.NODE_ENV === 'production'
      useCookie('access_token', {
        maxAge: 60 * 60 * 24,
        sameSite: 'lax',
        secure: isProd,
        path: '/',
      }).value = updated.accessToken
      authStore.access_token = updated.accessToken
      authStore.accessToken = updated.accessToken
      authStore.token = updated.accessToken
      authStore.isAuthenticated = true
    }
    if (updated?.refreshToken) {
      const isProd = process.env.NODE_ENV === 'production'
      useCookie('refresh_token', {
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
        secure: isProd,
        path: '/',
      }).value = updated.refreshToken
      authStore.refresh_token = updated.refreshToken
      authStore.refreshToken = updated.refreshToken
      authStore.refreshTokenValue = updated.refreshToken
    }
    if (updated?.username) {
      authStore.user = { ...authStore.user, username: updated.username }
      if (process.client) localStorage.setItem('user_data', JSON.stringify(authStore.user))
    }
    toast.add(`Username changed to "${updated?.username}"`, 'Done')
    closeUsernameModal()
  } finally {
    unSaving.value = false
  }
}

const navItems = [
  { id: 'personal', label: 'Personal Info', icon: 'ri-user-line' },
  { id: 'security', label: 'Security', icon: 'ri-lock-line' },
]

// Reactive avatar — tracks store value immediately when changed
const currentAvatar = computed(() => authStore.avatar || DEFAULT_AVATAR)

const userRoleLabel = computed(() => {
  const roles = authStore.user?.roles
  if (!roles?.length) return ''
  return roles.join(', ')
})

function syncFormFromStore() {
  const u = authStore.user
  if (!u) return
  form.firstName = u.firstName || ''
  form.lastName = u.lastName || ''
  form.email = u.email || ''
  form.phone = u.phone || ''
}

async function fetchMe() {
  loading.value = true
  try {
    await authStore.fetchMe()
    syncFormFromStore()
  } catch {
    toast.add('Failed to load profile', 'Error')
  } finally {
    loading.value = false
  }
}

function validate() {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.firstName?.trim()) errors.firstName = 'First name is required.'
  return Object.keys(errors).length === 0
}

async function saveProfile() {
  if (!validate()) return
  saving.value = true
  try {
    const userId = authStore.user?.id
    if (!userId) { toast.add('User ID not found', 'Error'); return }
    const { data, error } = await useHttp(`/api/v1/users/${userId}`, {
      method: 'PUT',
      body: {
        firstName: form.firstName,
        lastName: form.lastName || undefined,
        phone: form.phone || undefined,
      },
      isGlobal: true,
    })
    if (error?.value) { toast.add(error.value?.data?.message || 'Failed to save', 'Error'); return }
    const updated = data.value?.data ?? data.value
    if (updated) {
      // Patch store — fullName getter recomputes immediately
      authStore.user = {
        ...authStore.user,
        firstName: updated.firstName ?? authStore.user.firstName,
        lastName: updated.lastName ?? authStore.user.lastName,
        phone: updated.phone ?? authStore.user.phone,
      }
      // Sync form back so it shows what was actually saved
      syncFormFromStore()
    }
    toast.add('Profile updated successfully', 'Saved')
  } finally {
    saving.value = false
  }
}

function validatePw() {
  Object.keys(pwErrors).forEach((k) => delete pwErrors[k])
  if (!pwForm.currentPassword) pwErrors.currentPassword = 'Current password is required.'
  if (!pwForm.newPassword || pwForm.newPassword.length < 6) pwErrors.newPassword = 'New password must be at least 6 characters.'
  if (pwForm.newPassword !== pwForm.confirmPassword) pwErrors.confirmPassword = 'Passwords do not match.'
  return Object.keys(pwErrors).length === 0
}

async function changePassword() {
  if (!validatePw()) return
  pwSaving.value = true
  try {
    const userId = authStore.user?.id
    const { error } = await useHttp(`/api/v1/users/${userId}`, {
      method: 'PUT',
      body: { password: pwForm.newPassword, currentPassword: pwForm.currentPassword },
      isGlobal: true,
    })
    if (error?.value) { toast.add(error.value?.data?.message || 'Failed to change password', 'Error'); return }
    toast.add('Password changed successfully', 'Updated')
    pwForm.currentPassword = ''
    pwForm.newPassword = ''
    pwForm.confirmPassword = ''
  } finally {
    pwSaving.value = false
  }
}

function resolveApiUrl(path) {
  if (!path) return path
  if (path.startsWith('http')) return path
  const tmpServer = useCookie('tmp_server').value
  const { config } = helper()
  const base = (tmpServer || config.apiUrl || '').replace(/\/$/, '')
  return base + path
}

async function handleAvatarUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  avatarUploading.value = true
  try {
    const fd = new FormData()
    fd.append('file', file)
    const { data, error } = await useHttp('/api/v1/files/upload', { method: 'POST', body: fd, isGlobal: true })
    if (error?.value) { toast.add('Upload failed', 'Error'); return }
    const rawUrl = (data.value?.data ?? data.value)?.fileUrl
    if (rawUrl) {
      const resolvedUrl = resolveApiUrl(rawUrl)
      const userId = authStore.user?.id
      const { error: saveErr } = await useHttp(`/api/v1/users/${userId}`, {
        method: 'PUT',
        body: { avatar: rawUrl, firstName: authStore.user?.firstName || '' },
        isGlobal: true,
      })
      if (saveErr?.value) { toast.add('Failed to save avatar', 'Error'); return }
      // Update store — avatar getter reacts immediately, img src updates
      authStore.user = { ...authStore.user, avatar: resolvedUrl }
      toast.add('Profile photo updated', 'Success')
    }
  } finally {
    avatarUploading.value = false
    event.target.value = ''
  }
}

async function removeAvatar() {
  const userId = authStore.user?.id
  if (!userId) return
  avatarUploading.value = true
  try {
    const { error } = await useHttp(`/api/v1/users/${userId}`, {
      method: 'PUT',
      body: { avatar: null, firstName: authStore.user?.firstName || '' },
      isGlobal: true,
    })
    if (error?.value) { toast.add('Failed to remove photo', 'Error'); return }
    authStore.user = { ...authStore.user, avatar: null }
    toast.add('Profile photo removed', 'Done')
  } finally {
    avatarUploading.value = false
  }
}

onMounted(async () => {
  syncFormFromStore()
  await fetchMe()
})

definePageMeta({ layout: 'navbar', middleware: ['auth'] })
</script>

<style scoped lang="scss">
.profile-page {
  min-height: 100vh;
  background: var(--c-bg, #f9fafb);
  padding: 2rem 1rem;
}
.profile-inner { max-width: 900px; margin: 0 auto; }
.profile-header { margin-bottom: 2rem; }
.profile-title { font-size: 1.75rem; font-weight: 700; color: var(--c-text); margin: 0 0 0.25rem; }
.profile-sub { color: var(--c-muted-text); margin: 0; }

.profile-layout {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 1.5rem;
  @media (max-width: 768px) { grid-template-columns: 1fr; }
}

.sidebar-card, .section-card {
  background: var(--c-surface, #fff);
  border-radius: 12px;
  border: 1px solid var(--c-border);
  padding: 1.5rem;
}

.avatar-section { text-align: center; margin-bottom: 1.5rem; }
.avatar-wrap {
  position: relative;
  display: inline-block;
  margin-bottom: 0.75rem;

  &:hover .avatar-remove { opacity: 1; }
}

.profile-avatar {
  width: 80px; height: 80px; border-radius: 50%; object-fit: cover;
  border: 3px solid var(--c-primary, #6366f1);
  transition: opacity 0.2s;
  &.uploading { opacity: 0.4; }
}
.profile-avatar-av {
  transition: opacity 0.2s;
}

.avatar-loading {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.25); border-radius: 50%;
  color: #fff; font-size: 1.25rem; z-index: 2;
}

.avatar-cam {
  position: absolute; bottom: 0; right: 0;
  width: 26px; height: 26px;
  padding: 0; margin: 0; box-sizing: border-box;
  border-radius: 50%;
  background: var(--c-primary, #6366f1); color: #fff;
  border: 2px solid var(--c-surface, #fff);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.7rem; line-height: 1; cursor: pointer; z-index: 3;
  &:hover:not(:disabled) { opacity: 0.85; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}

.avatar-remove {
  position: absolute; top: 0; right: 0;
  width: 22px; height: 22px;
  padding: 0; margin: 0; box-sizing: border-box;
  border-radius: 50%;
  background: var(--c-danger, #ef4444); color: #fff;
  border: 2px solid var(--c-surface, #fff);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.65rem; line-height: 1; cursor: pointer; z-index: 3;
  opacity: 0; transition: opacity 0.15s;
  &:hover:not(:disabled) { background: #dc2626; }
  &:disabled { opacity: 0.3 !important; cursor: not-allowed; }
}

.sidebar-name { font-size: 1rem; font-weight: 600; color: var(--c-text); margin: 0 0 0.25rem; }
.sidebar-role { font-size: 0.8rem; color: var(--c-muted-text); margin: 0; }

.sidebar-nav { display: flex; flex-direction: column; gap: 4px; }
.nav-item {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.5rem 0.75rem; border-radius: 8px; border: none;
  background: transparent; color: var(--c-text); cursor: pointer;
  font-size: 0.875rem; text-align: left; transition: background 0.15s;
  i { font-size: 1rem; }
  &:hover { background: var(--c-hover, rgba(0,0,0,0.05)); }
  &.active { background: var(--c-primary-light, rgba(99,102,241,0.1)); color: var(--c-primary, #6366f1); font-weight: 600; }
}

.section-title-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
.section-title { font-size: 1rem; font-weight: 600; color: var(--c-text); margin: 0; }
.forgot-link {
  font-size: 0.8rem; color: var(--c-primary, #6366f1); text-decoration: none;
  display: inline-flex; align-items: center; gap: 4px;
  &:hover { text-decoration: underline; }
}
.profile-form { display: flex; flex-direction: column; gap: 1rem; }
.form-row {
  display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
  @media (max-width: 600px) { grid-template-columns: 1fr; }
}
.form-group { display: flex; flex-direction: column; gap: 4px; }
.form-label { font-size: 0.8rem; font-weight: 500; color: var(--c-text); }
.req { color: var(--c-danger); margin-left: 2px; }
.form-input {
  padding: 0.5rem 0.75rem; border-radius: 8px;
  border: 1px solid var(--c-border); background: var(--c-bg);
  color: var(--c-text); font-size: 0.875rem; outline: none;
  &:focus { border-color: var(--c-primary, #6366f1); }
  &.input-error { border-color: var(--c-danger) !important; }
}
.field-error { font-size: 0.75rem; color: var(--c-danger); }
.form-hint { font-size: 0.75rem; color: var(--c-muted-text); }
.form-actions { display: flex; justify-content: flex-end; margin-top: 0.5rem; }
.btn-primary {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 0.5rem 1.25rem; border-radius: 8px; border: none;
  background: var(--c-accent); color: #fff;
  font-size: 0.875rem; font-weight: 500; cursor: pointer;
  &:hover:not(:disabled) { opacity: 0.88; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}
.loading-state { color: var(--c-muted-text); font-size: 0.875rem; display: flex; align-items: center; gap: 8px; padding: 1rem 0; }
.spin { animation: spin 1s linear infinite; display: inline-block; }
@keyframes spin { to { transform: rotate(360deg); } }
.hidden { display: none; }

// ── Input with action button ───────────────────────────────────
.input-action-row { display: flex; align-items: center; gap: 8px; }
.btn-change {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 0 12px; height: 38px; border-radius: 8px; border: 1px solid var(--c-border);
  background: var(--c-surface); color: var(--c-text); font-size: 0.8rem; font-weight: 500;
  cursor: pointer; white-space: nowrap; transition: border-color 0.15s, background 0.15s;
  &:hover { border-color: var(--c-accent); background: var(--c-accent-soft); }
}

// ── Modals (theme-aware) ───────────────────────────────────────
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,.55); z-index: 1000;
  display: flex; align-items: center; justify-content: center; padding: 1rem;
}
.modal-box {
  background: var(--c-surface); border: 1px solid var(--c-border);
  border-radius: 12px; width: 100%; max-width: 420px;
  box-shadow: 0 20px 60px rgba(0,0,0,.3); overflow: hidden;
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem 1.25rem; border-bottom: 1px solid var(--c-border);
  background: var(--c-surface);
}
.modal-title { font-size: 1rem; font-weight: 600; color: var(--c-text); display: flex; align-items: center; gap: 6px; }
.modal-close {
  padding: 0; margin: 0; box-sizing: border-box; width: 28px; height: 28px; border-radius: 50%;
  border: 1px solid var(--c-border); background: transparent; color: var(--c-muted); cursor: pointer;
  display: flex; align-items: center; justify-content: center; line-height: 1;
  transition: color 0.15s, background 0.15s;
  &:hover { background: rgba(248,113,113,.15); color: var(--c-danger); border-color: var(--c-danger); }
}
.modal-body { padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; background: var(--c-surface); }
.modal-desc { font-size: 0.85rem; color: var(--c-muted); margin: 0; line-height: 1.5; }
.modal-footer {
  padding: 1rem 1.25rem; border-top: 1px solid var(--c-border);
  display: flex; justify-content: flex-end; gap: 8px;
  background: var(--c-surface);
}
.btn-outline-sm {
  padding: 0.4rem 1rem; border-radius: 8px; border: 1px solid var(--c-border);
  background: transparent; color: var(--c-text); font-size: 0.875rem; cursor: pointer;
  transition: border-color 0.15s;
  &:hover:not(:disabled) { border-color: var(--c-accent); color: var(--c-accent); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}
.btn-primary-sm {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 0.4rem 1rem; border-radius: 8px; border: none;
  background: var(--c-accent); color: #fff; font-size: 0.875rem; font-weight: 500; cursor: pointer;
  transition: opacity 0.15s;
  &:hover:not(:disabled) { opacity: 0.88; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}
.input-pw-wrap { position: relative;
  .form-input { padding-right: 2.5rem; }
}
.pw-toggle {
  position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
  padding: 0; border: none; background: transparent; color: var(--c-muted); cursor: pointer;
  font-size: 1rem; line-height: 1;
  &:hover { color: var(--c-text); }
}
.auth-error {
  display: flex; align-items: center; gap: 6px;
  padding: 0.5rem 0.75rem; border-radius: 8px;
  background: rgba(248,113,113,.12); color: var(--c-danger);
  border: 1px solid rgba(248,113,113,.25); font-size: 0.85rem;
}
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.code-input { font-size: 1.5rem; font-weight: 700; letter-spacing: 0.5rem; text-align: center; }
.resend-link {
  background: none; border: none; padding: 0; margin-top: 4px;
  font-size: 0.8rem; color: var(--c-accent); cursor: pointer; text-decoration: underline;
  &:disabled { color: var(--c-muted-text); text-decoration: none; cursor: default; }
}
</style>
