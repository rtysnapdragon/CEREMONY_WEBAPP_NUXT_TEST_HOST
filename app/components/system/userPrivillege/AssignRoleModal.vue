<template>
  <RSlider
    v-model="isOpen"
    icon="ri-shield-user-line"
    :title="tr('assign_role')"
    :description="tr('select_role_for_user') || 'Choose a role to assign to this user'"
  >
    <!-- User chip -->
    <div class="arm-user-chip">
      <div class="arm-chip-avatar">{{ userInitials }}</div>
      <div class="arm-chip-info">
        <span class="arm-chip-name">{{ user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user?.username || '—') }}</span>
        <span class="arm-chip-email">{{ user?.email || '—' }}</span>
      </div>
      <div v-if="userRoleNames.length" class="arm-chip-roles">
        <span v-for="r in userRoleNames" :key="r" class="arm-chip-current">
          <i class="ri-shield-line" /> {{ r }}
        </span>
      </div>
    </div>

    <!-- Body -->
    <div class="arm-body">
      <div v-if="loading" class="arm-roles" aria-busy="true">
        <div v-for="n in 4" :key="n" class="arm-role-card arm-role-card--skeleton">
          <div class="arm-role-left">
            <RSkeleton width="36px" height="36px" :ui="{ rounded: 'rounded-lg' }" />
            <div class="arm-role-text arm-skel-text-col">
              <RSkeleton width="45%" height="14px" />
              <RSkeleton width="70%" height="10px" />
              <div class="arm-perms">
                <RSkeleton v-for="p in 3" :key="p" width="52px" height="16px" :ui="{ rounded: 'rounded-full' }" />
              </div>
            </div>
          </div>
          <div class="arm-role-right">
            <RSkeleton width="22px" height="22px" :ui="{ rounded: 'rounded-full' }" />
          </div>
        </div>
      </div>

      <div v-else-if="roles.length === 0" class="arm-empty">
        <i class="ri-shield-cross-line" />
        <p>No roles available</p>
      </div>

      <div v-else class="arm-roles">
        <div
          v-for="role in roles"
          :key="role.id"
          class="arm-role-card"
          :class="{
            selected: selectedRoleId === role.id,
            assigned: isAssigned(role),
          }"
          @click="toggleSelect(role)"
        >
          <div v-if="isAssigned(role)" class="arm-assigned-badge">
            <i class="ri-check-double-line" /> Assigned
          </div>

          <div class="arm-role-left">
            <div class="arm-role-icon" :class="roleIconClass(role.name)">
              <i :class="roleIcon(role.name)" />
            </div>
            <div class="arm-role-text">
              <span class="arm-role-name">{{ role.name }}</span>
              <span v-if="role.description" class="arm-role-desc">{{ role.description }}</span>
              <div class="arm-perms">
                <span v-for="p in (role.permissions || []).slice(0, 6)" :key="p.id || p.code" class="arm-perm-tag">
                  {{ p.code || p }}
                </span>
                <span v-if="(role.permissions || []).length > 6" class="arm-perm-more">
                  +{{ role.permissions.length - 6 }}
                </span>
              </div>
            </div>
          </div>

          <div class="arm-role-right">
            
            <button
              v-if="isAssigned(role)"
              class="arm-remove-btn"
              :class="{ loading: removingId === role.id }"
              :title="tr('remove_role') || 'Remove role'"
              @click.stop="removeRole(role)"
            >
              <i v-if="removingId === role.id" class="ri-loader-4-line ri-spin" />
              <i v-else class="ri-user-unfollow-line" />
            </button>
            <div v-else class="arm-role-check" :class="{ active: selectedRoleId === role.id }">
              <i class="ri-check-line" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <RBtn type="cancel" icon="cancel" :label="tr('common.cancel')" :disabled="saving" @click="close" />
      <RBtn type="save" icon="ri-shield-check-line" :label="saving ? tr('common.saving') || 'Saving…' : tr('common.save')" :loading="saving" :disabled="!selectedRoleId || saving" @click="save" />
    </template>
  </RSlider>
</template>

<script setup>
const { tr } = useTr()
const props = defineProps({
  modelValue: Boolean,
  user: { type: Object, default: null },
  userId: { type: String, default: null },
})
const emit = defineEmits(['update:modelValue', 'saved'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const toast = useToastStore()
const roles = ref([])
const loading = ref(false)
const saving = ref(false)
const removingId = ref(null)
const selectedRoleId = ref(null)

const resolvedUserId = computed(() => props.userId || props.user?.id)

const userInitials = computed(() => {
  const f = props.user?.firstName?.[0] || ''
  const l = props.user?.lastName?.[0] || ''
  return (f + l).toUpperCase() || props.user?.username?.[0]?.toUpperCase() || '?'
})

const userRoleNames = computed(() => props.user?.roles || [])
const isAssigned = (role) => userRoleNames.value.includes(role.name)

const toggleSelect = (role) => {
  if (isAssigned(role)) return
  selectedRoleId.value = selectedRoleId.value === role.id ? null : role.id
}

const roleIcon = (name = '') => {
  const n = name.toUpperCase()
  if (n.includes('SUPER') || n.includes('ADMIN')) return 'ri-shield-star-line'
  if (n.includes('OWNER')) return 'ri-vip-crown-line'
  if (n.includes('MANAGER')) return 'ri-user-settings-line'
  if (n.includes('EDITOR')) return 'ri-edit-2-line'
  return 'ri-user-line'
}

const roleIconClass = (name = '') => {
  const n = name.toUpperCase()
  if (n.includes('SUPER') || n.includes('ADMIN')) return 'role-danger'
  if (n.includes('OWNER')) return 'role-gold'
  if (n.includes('MANAGER')) return 'role-purple'
  if (n.includes('EDITOR')) return 'role-blue'
  return 'role-default'
}

const fetchRoles = async () => {
  loading.value = true
  try {
    const { data, error } = await useHttp('/api/v1/roles', { method: 'GET', isGlobal: true })
    if (error.value) throw new Error(error.value)
    roles.value = data.value?.data ?? data.value ?? []
  } catch {
    toast.add('Failed to load roles', 'Error')
  } finally {
    loading.value = false
  }
}

const save = async () => {
  if (!selectedRoleId.value || !resolvedUserId.value) return
  saving.value = true
  try {
    const { error } = await useHttp(
      `/api/v1/users/${resolvedUserId.value}/roles/${selectedRoleId.value}`,
      { method: 'POST', isGlobal: true }
    )
    if (error.value) throw new Error(error.value)
    toast.add('Role assigned successfully', 'Success')
    emit('saved', selectedRoleId.value)
    close()
  } catch {
    toast.add('Failed to assign role', 'Error')
  } finally {
    saving.value = false
  }
}

const removeRole = async (role) => {
  if (!resolvedUserId.value) return
  removingId.value = role.id
  try {
    const { error } = await useHttp(
      `/api/v1/users/${resolvedUserId.value}/roles/${role.id}`,
      { method: 'DELETE', isGlobal: true }
    )
    if (error.value) throw new Error(error.value)
    toast.add(`Role "${role.name}" removed`, 'Success')
    emit('saved')
  } catch {
    toast.add('Failed to remove role', 'Error')
  } finally {
    removingId.value = null
  }
}

const close = () => {
  selectedRoleId.value = null
  emit('update:modelValue', false)
}

watch(() => props.modelValue, (val) => {
  if (val) fetchRoles()
})
</script>

<style lang="scss">
/* User chip */
.arm-user-chip {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  margin: var(--sp-3) 0;
  padding: var(--sp-3) var(--sp-4);
  background: var(--c-surface-1);
  border: 1px solid var(--c-border);
  border-radius: var(--r-xl);
  flex-wrap: wrap;
}
.arm-chip-avatar {
  width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0;
  background: rgba(255,140,66,0.15); color: var(--c-accent);
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 0.875rem;
}
.arm-chip-info { flex: 1; min-width: 0; }
.arm-chip-name { display: block; font-weight: 700; font-size: 0.9rem; }
.arm-chip-email { display: block; font-size: 0.75rem; color: var(--c-muted); }
.arm-chip-roles { display: flex; flex-wrap: wrap; gap: 4px; }
.arm-chip-current {
  display: flex; align-items: center; gap: 4px;
  padding: 3px 9px; border-radius: 999px;
  background: rgba(255,140,66,0.1); color: var(--c-accent);
  font-size: 0.625rem; font-weight: 700; text-transform: uppercase;
  i { font-size: 0.7rem; }
}

/* Body */
// .arm-body { padding: var(--sp-2) 0; }/

.arm-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: var(--sp-2); color: var(--c-muted); padding: var(--sp-8) 0;
  i { font-size: 2.5rem; }
  p { font-size: 0.875rem; }
}

/* Role cards */
.arm-roles { display: flex; flex-direction: column; gap: var(--sp-2); }

.arm-role-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-3) var(--sp-4);
  border-radius: var(--r-xl);
  border: 1.5px solid var(--c-border);
  cursor: pointer;
  transition: all 0.18s ease;

  &:hover { border-color: rgba(255,140,66,0.4); background: rgba(255,140,66,0.03); }
  &.selected { border-color: var(--c-accent); background: rgba(255,140,66,0.07); }
  &.assigned {
    border-color: rgba(34,197,94,0.35); background: rgba(34,197,94,0.04); cursor: default;
    &:hover { border-color: rgba(34,197,94,0.5); background: rgba(34,197,94,0.06); }
  }
}

.arm-role-card--skeleton {
  cursor: default;
  pointer-events: none;
  &:hover { border-color: var(--c-border); background: transparent; }
}

.arm-skel-text-col {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.arm-assigned-badge {
  position: absolute; top: 8px; right: 44px;
  display: flex; align-items: center; gap: 3px;
  padding: 2px 8px; border-radius: 999px;
  background: rgba(34,197,94,0.12); color: #16a34a;
  font-size: 0.5625rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;
  i { font-size: 0.65rem; }
}

.arm-role-left { display: flex; align-items: flex-start; gap: var(--sp-3); flex: 1; min-width: 0; }

.arm-role-icon {
  width: 36px; height: 36px; border-radius: var(--r-lg);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  i { font-size: 1.125rem; }

  &.role-danger  { background: rgba(239,68,68,0.1);   i { color: #ef4444; } }
  &.role-gold    { background: rgba(234,179,8,0.12);   i { color: #ca8a04; } }
  &.role-purple  { background: rgba(147,51,234,0.1);   i { color: #9333ea; } }
  &.role-blue    { background: rgba(59,130,246,0.1);   i { color: #3b82f6; } }
  &.role-default { background: rgba(255,140,66,0.1);   i { color: var(--c-accent); } }
}

.arm-role-text { flex: 1; min-width: 0; }
.arm-role-name { display: block; font-weight: 700; font-size: 0.9375rem; }
.arm-role-desc { display: block; font-size: 0.75rem; color: var(--c-muted); margin-top: 1px; margin-bottom: 6px; }

.arm-perms { display: flex; flex-wrap: wrap; gap: 3px; margin-top: 6px; }
.arm-perm-tag {
  font-size: 0.5625rem; padding: 2px 6px; border-radius: 999px;
  background: rgba(255,140,66,0.1); color: var(--c-accent);
  font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;
}
.arm-perm-more {
  font-size: 0.5625rem; padding: 2px 6px; border-radius: 999px;
  background: var(--c-surface-2); color: var(--c-muted); font-weight: 600;
}

.arm-role-right { display: flex; align-items: center; flex-shrink: 0; }

.arm-role-check {
  width: 22px; height: 22px; border-radius: 50%;
  border: 1.5px solid var(--c-border);
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s ease;
  i { font-size: 0.75rem; color: transparent; }
  &.active { background: var(--c-accent); border-color: var(--c-accent); i { color: #fff; } }
}

.arm-remove-btn {
  width: 32px; height: 32px; border-radius: var(--r-lg);
  display: flex; align-items: center; justify-content: center;
  background: rgba(239,68,68,0.08); color: #ef4444;
  border: 1px solid rgba(239,68,68,0.2);
  cursor: pointer; transition: all 0.15s ease;
  i { font-size: 1rem; }
  &:hover { background: rgba(239,68,68,0.18); border-color: rgba(239,68,68,0.4); }
  &.loading { opacity: 0.6; cursor: not-allowed; }
}

.arm-save-btn {
  min-width: 120px;
  span { display: flex; align-items: center; gap: 6px; }
}
.arm-saving { opacity: 0.8; }
</style>