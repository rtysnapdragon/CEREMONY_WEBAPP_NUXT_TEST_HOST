<template>
  <div class="relative" ref="dropdownRef">
    <!-- Button to toggle dropdown -->
    <button
      variant="ghost"
      color="gray"
      class="relative flex items-center p-1 min-h-4 min-w-4 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-300 rounded-full backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50"
      @click="toggleDropdown"
    >
      <UAvatar 
        :src="authStore.user?.avatar" 
        :alt="authStore.user?.name"
        size="sm"
        :ui="{ rounded: 'rounded-full',width: 'w-8 h-8' }"
        class="ring-2 ring-primary-500/20 dark:ring-primary-400/20 hover:ring-primary-500/40 dark:hover:ring-primary-400/40 transition-all duration-300"
      />
    </button>

    <!-- Dropdown Panel -->
    <transition name="fade">
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-[300px] z-50 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 backdrop-blur-md bg-white/95 dark:bg-gray-900/95 overflow-hidden"
      >
        <!-- Header: user info -->
        <div class="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 text-center">
          <div class="flex flex-col items-center space-y-2">
            <!-- Avatar w/ upload -->
            <div class="relative">
              <UAvatar 
                :src="authStore.user?.avatar" 
                :alt="authStore.user?.name"
                size="3xl"
                :ui="{ rounded: 'rounded-full' }"
                class="ring-2 ring-primary-500/20 dark:ring-primary-400/20 hover:ring-primary-500/40 dark:hover:ring-primary-400/40"
              />
              <div class="absolute -bottom-1 -right-1 bg-primary-500 dark:bg-primary-600 rounded-full p-1 shadow-lg ring-2 ring-white dark:ring-gray-900">
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleAvatarUpload"  
                />
                <i class="ri-camera-line !min-w-3 !min-h-3 text-white" @click="triggerUpload" />
              </div>
            </div>

            <div>
              <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {{ authStore.user?.name }}
              </p>
              <p class="text-xs text-gray-600 dark:text-gray-400 truncate">
                {{ authStore.user?.email }}
              </p>
              <p class="text-xs text-primary-600 dark:text-primary-400 mt-1">
                {{ authStore.user?.roles?.join(', ') || 'User' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Links -->
        <div class="p-2 space-y-1">
          <div
            v-for="(section, index) in items"
            :key="index"
            class="space-y-1"
          >
            <div
              v-for="item in section"
              :key="item.label"
              class="flex items-center gap-3 py-2 px-3 rounded-lg transition hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              :class="item.class"
              @click="handleClick(item)"
            >
              <div class="w-6 h-6 flex items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                <UIcon :name="item.icon" class="w-4 h-4" />
              </div>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-200">
                {{ item.label }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
const authStore = useAuthStore()
const fileInput = ref(null)
const isOpen = ref(false)
const dropdownRef = ref(null)

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const closeDropdown = () => {
  isOpen.value = false
}

const triggerUpload = () => {
  fileInput.value?.click()
}

const handleClick = (item) => {
  if (item?.click) item.click()
  closeDropdown()
}

const handleAvatarUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append('avatar', file)

  try {
    const response = await $fetch('/api/user/avatar', {
      method: 'POST',
      body: formData
    })

    if (response.success) {
      authStore.user.avatar = response.avatarUrl
      useToast().add({
        title: 'Avatar updated',
        description: 'Profile picture updated successfully.',
        icon: 'i-heroicons-check-circle-20-solid',
        color: 'green'
      })
    }
  } catch (err) {
    useToast().add({
      title: 'Upload failed',
      description: 'Please try again.',
      icon: 'i-heroicons-exclamation-triangle-20-solid',
      color: 'red'
    })
  } finally {
    event.target.value = ''
  }
}

// Outside click handler
const handleClickOutside = (event) => {
  if (!dropdownRef.value?.contains(event.target)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Menu items
const items = [
  [
    {
      label: 'Profile',
      icon: 'i-heroicons-user-circle-20-solid',
      click: () => navigateTo('/profile')
    },
    {
      label: 'User',
      icon: 'i-heroicons-user-16-solid',
      click: () => navigateTo('/users')
    },
    {
      label: 'Settings',
      icon: 'i-heroicons-cog-6-tooth-20-solid',
      click: () => navigateTo('/settings')
    },
    {
      label: 'Dashboard',
      icon: 'i-heroicons-chart-bar-20-solid',
      click: () => navigateTo('/dashboard')
    },
    {
      label: 'Analytics',
      icon: 'i-heroicons-chart-pie-20-solid',
      click: () => navigateTo('/analytics')
    }
  ],
  [
    {
      label: 'Help & Support',
      icon: 'i-heroicons-question-mark-circle-20-solid',
      click: () => navigateTo('/support')
    },
    {
      label: 'Documentation',
      icon: 'i-heroicons-book-open-20-solid',
      click: () => window.open('/docs', '_blank')
    }
  ],
  [
    {
      label: 'Logout',
      icon: 'i-heroicons-arrow-left-on-rectangle-20-solid',
      click: () => authStore.logout(),
      class: '!text-red-600 dark:!text-red-400 hover:!bg-red-50 dark:hover:!bg-red-950/50'
    }
  ]
]
</script>
<style lang= 'scss' scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
