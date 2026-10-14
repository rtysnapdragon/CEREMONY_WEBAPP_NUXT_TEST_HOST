<template>
  <RWrapperPage class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-2">Customize your application experience</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Navigation -->
        <div class="lg:col-span-1">
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <nav class="space-y-2">
              <UButton
                v-for="item in settingsItems"
                :key="item.id"
                :variant="activeSetting === item.id ? 'solid' : 'ghost'"
                :color="activeSetting === item.id ? 'primary' : 'gray'"
                class="w-full justify-start"
                @click="activeSetting = item.id"
              >
                <UIcon :name="item.icon" class="w-5 h-5 mr-3" />
                {{ item.label }}
              </UButton>
            </nav>
          </div>
        </div>

        <!-- <div class="space-y-6">
          <div v-for="group in groupedSettingsItems" :key="group.group" class="space-y-3">
            <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {{ group.group }}
            </h3>
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm divide-y divide-gray-200 dark:divide-gray-700">
              <UButton
                v-for="item in group.items"
                :key="item.id"
                variant="ghost"
                color="gray"
                class="w-full justify-start px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700"
                @click="activeSetting = item.id"
              >
                <UIcon :name="item.icon" class="w-5 h-5 mr-3 text-gray-400" />
                <div class="flex-1 text-left">
                  <div class="font-medium text-gray-900 dark:text-white">{{ item.label }}</div>
                  <div v-if="item.description" class="text-sm text-gray-500 dark:text-gray-400">
                    {{ item.description }}
                  </div>
                </div>
                <UIcon name="i-heroicons-chevron-right-20-solid" class="w-5 h-5 text-gray-400" />
              </UButton>
            </div>
          </div>
        </div>
         -->
        <!-- Content -->
        <div class="lg:col-span-2">
          <!-- Appearance -->
          <div v-if="activeSetting === 'appearance'" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">Appearance</h3>
            
            <div class="space-y-6">
              <UFormGroup label="Theme" name="theme">
                <USelect
                  v-model="settings.theme"
                  :options="themeOptions"
                  placeholder="Select theme"
                />
              </UFormGroup>

              <UFormGroup label="Language" name="language">
                <USelect
                  v-model="settings.language"
                  :options="languageOptions"
                  placeholder="Select language"
                />
              </UFormGroup>

              <UButton color="primary" @click="saveSettings">
                Save Preferences
              </UButton>
            </div>
          </div>

            <!-- Accessibility Settings -->
          <div v-if="activeSetting === 'accessibility'" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">Accessibility</h3>
            
            <div class="space-y-6">
              <UFormGroup label="High Contrast Mode" name="highContrast">
                <USwitch v-model="accessibility.highContrast" />
              </UFormGroup>

              <UFormGroup label="Text-to-Speech" name="textToSpeech">
                <USwitch v-model="accessibility.textToSpeech" />
              </UFormGroup>

              <UFormGroup label="Keyboard Navigation" name="keyboardNav">
                <USwitch v-model="accessibility.keyboardNavigation" />
              </UFormGroup>

              <UFormGroup label="Screen Reader Support" name="screenReader">
                <USwitch v-model="accessibility.screenReaderSupport" />
              </UFormGroup>

              <UButton color="primary" @click="saveAccessibilitySettings">
                Save Accessibility Settings
              </UButton>
            </div>
          </div>

          <!-- Advanced Settings -->
          <div v-if="activeSetting === 'advanced'" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">Advanced Settings</h3>
            
            <div class="space-y-6">
              <UFormGroup label="Developer Mode" name="developerMode">
                <USwitch v-model="advanced.developerMode" />
                <p class="text-sm text-gray-500">Enable additional debugging tools and features</p>
              </UFormGroup>

              <UFormGroup label="Cache Settings" name="cacheSize">
                <URange v-model="advanced.cacheSize" :min="50" :max="500" />
                <span class="text-sm text-gray-500">{{ advanced.cacheSize }}MB</span>
              </UFormGroup>

              <UFormGroup label="API Version" name="apiVersion">
                <USelect
                  v-model="advanced.apiVersion"
                  :options="apiVersionOptions"
                />
              </UFormGroup>

              <UFormGroup label="Experimental Features" name="experimental">
                <div class="space-y-3">
                  <div v-for="feature in experimentalFeatures" :key="feature.id" class="flex items-center justify-between">
                    <div>
                      <p class="font-medium">{{ feature.label }}</p>
                      <p class="text-sm text-gray-500">{{ feature.description }}</p>
                    </div>
                    <USwitch v-model="feature.enabled" />
                  </div>
                </div>
              </UFormGroup>

              <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
                <UButton color="red" variant="outline" @click="resetToDefaults">
                  Reset to Default Settings
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
<!-- 
  <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
    <div class="lg:col-span-1">
      <div class="space-y-6">
        <div v-for="group in groupedSettingsItems" :key="group.group" class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {{ group.group }}
          </h3>
          <div class="space-y-1">
            <UButton
              v-for="item in group.items"
              :key="item.id"
              :variant="activeSetting === item.id ? 'solid' : 'ghost'"
              :color="activeSetting === item.id ? 'primary' : 'gray'"
              class="w-full justify-start"
              @click="activeSetting = item.id; activeTab = item.tabs[0]?.id"
            >
              <UIcon :name="item.icon" class="w-5 h-5 mr-3" />
              {{ item.label }}
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <div class="lg:col-span-3">
      <div v-if="activeSetting" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <div class="border-b border-gray-200 dark:border-gray-700">
          <nav class="flex space-x-8 px-6">
            <button
              v-for="tab in currentSetting?.tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'py-4 px-1 border-b-2 font-medium text-sm',
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              ]"
            >
              {{ tab.label }}
            </button>
          </nav>
        </div>

        <div class="p-6">
          <div v-if="activeTab === 'basic-info'">
            <h3 class="text-lg font-semibold mb-4">Basic Information</h3>
          </div>

          <div v-if="activeTab === 'theme'">
            <h3 class="text-lg font-semibold mb-4">Theme Settings</h3>
          </div>
        </div>
      </div>
    </div> -->
  </RWrapperPage>
</template>

<script setup>
// const activeSetting = ref('appearance')
const activeSetting = ref('account')
const activeTab = ref('basic-info')

const currentSetting = computed(() => {
  return settingsItems.find(item => item.id === activeSetting.value)
})

const settings = ref({
  theme: 'system',
  language: 'en'
})
// Appearance Settings
const appearance = ref({
  theme: 'system',
  colorScheme: 'blue',
  fontSize: 14,
  reduceAnimations: false
})

const themeOptions1 = ['light', 'dark', 'system']
const colorSchemes = [
  { id: 'blue', value: '#3b82f6' },
  { id: 'green', value: '#10b981' },
  { id: 'purple', value: '#8b5cf6' },
  { id: 'orange', value: '#f97316' }
]

// Privacy Settings
const privacy = ref({
  dataRetention: '365'
})

const privacySettings = [
  { id: 1, label: 'Data Collection', description: 'Allow anonymous usage data collection', enabled: true },
  { id: 2, label: 'Personalized Ads', description: 'Show personalized advertisements', enabled: false },
  { id: 3, label: 'Location Services', description: 'Allow access to your location', enabled: true },
  { id: 4, label: 'Cookies', description: 'Allow cookies for better experience', enabled: true }
]

const dataRetentionOptions = [
  { value: '30', label: '30 days' },
  { value: '90', label: '90 days' },
  { value: '365', label: '1 year' },
  { value: '730', label: '2 years' }
]

// Accessibility Settings
const accessibility = ref({
  highContrast: false,
  textToSpeech: false,
  keyboardNavigation: true,
  screenReaderSupport: true
})

// Advanced Settings
const advanced = ref({
  developerMode: false,
  cacheSize: 100,
  apiVersion: 'v1'
})

const experimentalFeatures = [
  { id: 1, label: 'Beta Features', description: 'Access to upcoming features', enabled: false },
  { id: 2, label: 'Performance Mode', description: 'Optimize for faster performance', enabled: true },
  { id: 3, label: 'New UI Components', description: 'Try out new interface elements', enabled: false }
]

const apiVersionOptions = ['v1', 'v2-beta', 'v2-stable']

const saveAppearanceSettings = () => {
  console.log('Saving appearance settings:', appearance.value)
}

const savePrivacySettings = () => {
  console.log('Saving privacy settings:', privacy.value)
}

const saveAccessibilitySettings = () => {
  console.log('Saving accessibility settings:', accessibility.value)
}

const resetToDefaults = () => {
  useConfirmStore().show({
    type: 'warning',
    title: 'Reset Settings',
    message: 'Are you sure you want to reset all settings to default?',
    onConfirm: async () => {
      console.log('Resetting to default settings')
    },
  })
}
const settingsItems1 = [
  { id: 'appearance', label: 'Appearance', icon: 'i-heroicons-paint-brush-20-solid' },
  { id: 'privacy', label: 'Privacy', icon: 'i-heroicons-shield-exclamation-20-solid' },
  { id: 'accessibility', label: 'Accessibility', icon: 'i-heroicons-adjustments-horizontal-20-solid' },
  { id: 'advanced', label: 'Advanced', icon: 'i-heroicons-cpu-chip-20-solid' }
]

const themeOptions = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' }
]

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' }
]
const settingsItems2 = [
  // Account & Profile
  { 
    id: 'account', 
    label: 'Account', 
    icon: 'i-heroicons-user-circle-20-solid',
    description: 'Manage your account information'
  },
  { 
    id: 'profile', 
    label: 'Profile', 
    icon: 'i-heroicons-identification-20-solid',
    description: 'Edit your personal details'
  },
  
  // Appearance & Interface
  { 
    id: 'appearance', 
    label: 'Appearance', 
    icon: 'i-heroicons-paint-brush-20-solid',
    description: 'Customize look and feel'
  },
  { 
    id: 'language', 
    label: 'Language & Region', 
    icon: 'i-heroicons-language-20-solid',
    description: 'Set language and regional preferences'
  },
  { 
    id: 'accessibility', 
    label: 'Accessibility', 
    icon: 'i-heroicons-adjustments-horizontal-20-solid',
    description: 'Adjust for accessibility needs'
  },
  
  // Privacy & Security
  { 
    id: 'privacy', 
    label: 'Privacy', 
    icon: 'i-heroicons-shield-exclamation-20-solid',
    description: 'Control your privacy settings'
  },
  { 
    id: 'security', 
    label: 'Security', 
    icon: 'i-heroicons-lock-closed-20-solid',
    description: 'Manage security preferences'
  },
  { 
    id: 'sessions', 
    label: 'Active Sessions', 
    icon: 'i-heroicons-computer-desktop-20-solid',
    description: 'View and manage active sessions'
  },
  
  // Notifications
  { 
    id: 'notifications', 
    label: 'Notifications', 
    icon: 'i-heroicons-bell-20-solid',
    description: 'Configure notification preferences'
  },
  { 
    id: 'email-preferences', 
    label: 'Email Preferences', 
    icon: 'i-heroicons-envelope-20-solid',
    description: 'Manage email subscriptions'
  },
  
  // Billing & Subscription
  { 
    id: 'billing', 
    label: 'Billing & Plans', 
    icon: 'i-heroicons-credit-card-20-solid',
    description: 'View and manage subscriptions'
  },
  { 
    id: 'payment-methods', 
    label: 'Payment Methods', 
    icon: 'i-heroicons-wallet-20-solid',
    description: 'Manage payment options'
  },
  { 
    id: 'invoices', 
    label: 'Invoices & Receipts', 
    icon: 'i-heroicons-document-text-20-solid',
    description: 'View billing history'
  },
  
  // Advanced
  { 
    id: 'advanced', 
    label: 'Advanced', 
    icon: 'i-heroicons-cpu-chip-20-solid',
    description: 'Advanced configuration options'
  },
  { 
    id: 'developer', 
    label: 'Developer', 
    icon: 'i-heroicons-code-bracket-20-solid',
    description: 'Developer tools and API settings'
  },
  { 
    id: 'integrations', 
    label: 'Integrations', 
    icon: 'i-heroicons-puzzle-piece-20-solid',
    description: 'Connect third-party services'
  },
  
  // Data & Storage
  { 
    id: 'storage', 
    label: 'Storage & Data', 
    icon: 'i-heroicons-cloud-20-solid',
    description: 'Manage storage usage'
  },
  { 
    id: 'data-export', 
    label: 'Data Export', 
    icon: 'i-heroicons-arrow-down-tray-20-solid',
    description: 'Export your data'
  },
  { 
    id: 'data-import', 
    label: 'Data Import', 
    icon: 'i-heroicons-arrow-up-tray-20-solid',
    description: 'Import data from other services'
  },
  
  // Help & Support
  { 
    id: 'help', 
    label: 'Help & Support', 
    icon: 'i-heroicons-question-mark-circle-20-solid',
    description: 'Get help and support'
  },
  { 
    id: 'feedback', 
    label: 'Send Feedback', 
    icon: 'i-heroicons-chat-bubble-left-ellipsis-20-solid',
    description: 'Share your feedback with us'
  },
  { 
    id: 'about', 
    label: 'About', 
    icon: 'i-heroicons-information-circle-20-solid',
    description: 'App version and information'
  }
];

// Grouped version for better organization
const groupedSettingsItems1 = [
  {
    group: 'Account',
    items: [
      { id: 'account', label: 'Account', icon: 'i-heroicons-user-circle-20-solid' },
      { id: 'profile', label: 'Profile', icon: 'i-heroicons-identification-20-solid' },
      { id: 'security', label: 'Security', icon: 'i-heroicons-lock-closed-20-solid' },
      { id: 'sessions', label: 'Active Sessions', icon: 'i-heroicons-computer-desktop-20-solid' }
    ]
  },
  {
    group: 'Preferences',
    items: [
      { id: 'appearance', label: 'Appearance', icon: 'i-heroicons-paint-brush-20-solid' },
      { id: 'language', label: 'Language & Region', icon: 'i-heroicons-language-20-solid' },
      { id: 'accessibility', label: 'Accessibility', icon: 'i-heroicons-adjustments-horizontal-20-solid' },
      { id: 'notifications', label: 'Notifications', icon: 'i-heroicons-bell-20-solid' }
    ]
  },
  {
    group: 'Billing',
    items: [
      { id: 'billing', label: 'Billing & Plans', icon: 'i-heroicons-credit-card-20-solid' },
      { id: 'payment-methods', label: 'Payment Methods', icon: 'i-heroicons-wallet-20-solid' },
      { id: 'invoices', label: 'Invoices & Receipts', icon: 'i-heroicons-document-text-20-solid' }
    ]
  },
  {
    group: 'Advanced',
    items: [
      { id: 'advanced', label: 'Advanced', icon: 'i-heroicons-cpu-chip-20-solid' },
      { id: 'developer', label: 'Developer', icon: 'i-heroicons-code-bracket-20-solid' },
      { id: 'integrations', label: 'Integrations', icon: 'i-heroicons-puzzle-piece-20-solid' },
      { id: 'storage', label: 'Storage & Data', icon: 'i-heroicons-cloud-20-solid' }
    ]
  },
  {
    group: 'Support',
    items: [
      { id: 'help', label: 'Help & Support', icon: 'i-heroicons-question-mark-circle-20-solid' },
      { id: 'feedback', label: 'Send Feedback', icon: 'i-heroicons-chat-bubble-left-ellipsis-20-solid' },
      { id: 'about', label: 'About', icon: 'i-heroicons-information-circle-20-solid' }
    ]
  }
];

const settingsItems = [
  // Account & Profile
  { 
    id: 'account', 
    label: 'Account', 
    icon: 'i-heroicons-user-circle-20-solid',
    description: 'Manage your account information',
    tabs: [
      { id: 'basic-info', label: 'Basic Information', icon: 'i-heroicons-user-20-solid' },
      { id: 'login-methods', label: 'Login Methods', icon: 'i-heroicons-key-20-solid' },
      { id: 'account-recovery', label: 'Account Recovery', icon: 'i-heroicons-arrow-path-20-solid' },
      { id: 'deactivate', label: 'Deactivate Account', icon: 'i-heroicons-trash-20-solid' }
    ]
  },
  { 
    id: 'profile', 
    label: 'Profile', 
    icon: 'i-heroicons-identification-20-solid',
    description: 'Edit your personal details',
    tabs: [
      { id: 'personal-info', label: 'Personal Info', icon: 'i-heroicons-identification-20-solid' },
      { id: 'avatar', label: 'Profile Picture', icon: 'i-heroicons-photo-20-solid' },
      { id: 'social-links', label: 'Social Links', icon: 'i-heroicons-link-20-solid' },
      { id: 'bio', label: 'Bio & Description', icon: 'i-heroicons-pencil-20-solid' }
    ]
  },
  
  // Appearance & Interface
  { 
    id: 'appearance', 
    label: 'Appearance', 
    icon: 'i-heroicons-paint-brush-20-solid',
    description: 'Customize look and feel',
    tabs: [
      { id: 'theme', label: 'Theme', icon: 'i-heroicons-moon-20-solid' },
      { id: 'colors', label: 'Colors', icon: 'i-heroicons-swatch-20-solid' },
      { id: 'layout', label: 'Layout', icon: 'i-heroicons-arrows-pointing-out-20-solid' },
      { id: 'fonts', label: 'Fonts & Typography', icon: 'i-heroicons-text-20-solid' }
    ]
  },
  { 
    id: 'language', 
    label: 'Language & Region', 
    icon: 'i-heroicons-language-20-solid',
    description: 'Set language and regional preferences',
    tabs: [
      { id: 'language', label: 'Language', icon: 'i-heroicons-language-20-solid' },
      { id: 'region', label: 'Region', icon: 'i-heroicons-globe-americas-20-solid' },
      { id: 'timezone', label: 'Timezone', icon: 'i-heroicons-clock-20-solid' },
      { id: 'currency', label: 'Currency', icon: 'i-heroicons-currency-dollar-20-solid' }
    ]
  },
  { 
    id: 'accessibility', 
    label: 'Accessibility', 
    icon: 'i-heroicons-adjustments-horizontal-20-solid',
    description: 'Adjust for accessibility needs',
    tabs: [
      { id: 'text-size', label: 'Text Size', icon: 'i-heroicons-arrows-pointing-out-20-solid' },
      { id: 'contrast', label: 'Contrast', icon: 'i-heroicons-eye-20-solid' },
      { id: 'keyboard', label: 'Keyboard', icon: 'i-heroicons-computer-desktop-20-solid' },
      { id: 'screen-reader', label: 'Screen Reader', icon: 'i-heroicons-megaphone-20-solid' }
    ]
  },
  
  // Privacy & Security
  { 
    id: 'privacy', 
    label: 'Privacy', 
    icon: 'i-heroicons-shield-exclamation-20-solid',
    description: 'Control your privacy settings',
    tabs: [
      { id: 'data-privacy', label: 'Data Privacy', icon: 'i-heroicons-shield-check-20-solid' },
      { id: 'visibility', label: 'Profile Visibility', icon: 'i-heroicons-eye-20-solid' },
      { id: 'data-sharing', label: 'Data Sharing', icon: 'i-heroicons-share-20-solid' },
      { id: 'cookies', label: 'Cookies', icon: 'i-heroicons-cookie-20-solid' }
    ]
  },
  { 
    id: 'security', 
    label: 'Security', 
    icon: 'i-heroicons-lock-closed-20-solid',
    description: 'Manage security preferences',
    tabs: [
      { id: 'password', label: 'Password', icon: 'i-heroicons-key-20-solid' },
      { id: '2fa', label: 'Two-Factor Auth', icon: 'i-heroicons-lock-closed-20-solid' },
      { id: 'sessions', label: 'Active Sessions', icon: 'i-heroicons-computer-desktop-20-solid' },
      { id: 'security-keys', label: 'Security Keys', icon: 'i-heroicons-key-20-solid' }
    ]
  },
  
  // Notifications
  { 
    id: 'notifications', 
    label: 'Notifications', 
    icon: 'i-heroicons-bell-20-solid',
    description: 'Configure notification preferences',
    tabs: [
      { id: 'email-notifications', label: 'Email', icon: 'i-heroicons-envelope-20-solid' },
      { id: 'push-notifications', label: 'Push', icon: 'i-heroicons-bell-20-solid' },
      { id: 'sms-notifications', label: 'SMS', icon: 'i-heroicons-chat-bubble-left-20-solid' },
      { id: 'desktop-notifications', label: 'Desktop', icon: 'i-heroicons-computer-desktop-20-solid' }
    ]
  },
  
  // Billing & Subscription
  { 
    id: 'billing', 
    label: 'Billing & Plans', 
    icon: 'i-heroicons-credit-card-20-solid',
    description: 'View and manage subscriptions',
    tabs: [
      { id: 'current-plan', label: 'Current Plan', icon: 'i-heroicons-chart-bar-20-solid' },
      { id: 'upgrade', label: 'Upgrade Plan', icon: 'i-heroicons-arrow-up-circle-20-solid' },
      { id: 'billing-history', label: 'Billing History', icon: 'i-heroicons-document-text-20-solid' },
      { id: 'subscription', label: 'Subscription', icon: 'i-heroicons-calendar-20-solid' }
    ]
  },
  { 
    id: 'payment-methods', 
    label: 'Payment Methods', 
    icon: 'i-heroicons-wallet-20-solid',
    description: 'Manage payment options',
    tabs: [
      { id: 'credit-cards', label: 'Credit Cards', icon: 'i-heroicons-credit-card-20-solid' },
      { id: 'paypal', label: 'PayPal', icon: 'i-heroicons-banknotes-20-solid' },
      { id: 'crypto', label: 'Cryptocurrency', icon: 'i-heroicons-currency-dollar-20-solid' },
      { id: 'bank-transfer', label: 'Bank Transfer', icon: 'i-heroicons-building-library-20-solid' }
    ]
  },
  
  // Advanced
  { 
    id: 'advanced', 
    label: 'Advanced', 
    icon: 'i-heroicons-cpu-chip-20-solid',
    description: 'Advanced configuration options',
    tabs: [
      { id: 'performance', label: 'Performance', icon: 'i-heroicons-bolt-20-solid' },
      { id: 'cache', label: 'Cache Settings', icon: 'i-heroicons-archive-box-20-solid' },
      { id: 'experimental', label: 'Experimental', icon: 'i-heroicons-beaker-20-solid' },
      { id: 'reset', label: 'Reset Settings', icon: 'i-heroicons-arrow-path-20-solid' }
    ]
  },
  { 
    id: 'developer', 
    label: 'Developer', 
    icon: 'i-heroicons-code-bracket-20-solid',
    description: 'Developer tools and API settings',
    tabs: [
      { id: 'api-keys', label: 'API Keys', icon: 'i-heroicons-key-20-solid' },
      { id: 'webhooks', label: 'Webhooks', icon: 'i-heroicons-link-20-solid' },
      { id: 'sdk', label: 'SDK Settings', icon: 'i-heroicons-code-bracket-20-solid' },
      { id: 'debug', label: 'Debug Mode', icon: 'i-heroicons-bug-ant-20-solid' }
    ]
  }
];

// Grouped version with tabs
const groupedSettingsItems = [
  {
    group: 'Account',
    items: [
      { 
        id: 'account', 
        label: 'Account', 
        icon: 'i-heroicons-user-circle-20-solid',
        tabs: [
          { id: 'basic-info', label: 'Basic Information' },
          { id: 'login-methods', label: 'Login Methods' },
          { id: 'account-recovery', label: 'Account Recovery' }
        ]
      },
      { 
        id: 'profile', 
        label: 'Profile', 
        icon: 'i-heroicons-identification-20-solid',
        tabs: [
          { id: 'personal-info', label: 'Personal Info' },
          { id: 'avatar', label: 'Profile Picture' },
          { id: 'social-links', label: 'Social Links' }
        ]
      }
    ]
  },
  {
    group: 'Preferences',
    items: [
      { 
        id: 'appearance', 
        label: 'Appearance', 
        icon: 'i-heroicons-paint-brush-20-solid',
        tabs: [
          { id: 'theme', label: 'Theme' },
          { id: 'colors', label: 'Colors' },
          { id: 'layout', label: 'Layout' }
        ]
      },
      { 
        id: 'notifications', 
        label: 'Notifications', 
        icon: 'i-heroicons-bell-20-solid',
        tabs: [
          { id: 'email', label: 'Email' },
          { id: 'push', label: 'Push' },
          { id: 'desktop', label: 'Desktop' }
        ]
      }
    ]
  },
  {
    group: 'Security',
    items: [
      { 
        id: 'security', 
        label: 'Security', 
        icon: 'i-heroicons-lock-closed-20-solid',
        tabs: [
          { id: 'password', label: 'Password' },
          { id: '2fa', label: 'Two-Factor Auth' },
          { id: 'sessions', label: 'Active Sessions' }
        ]
      },
      { 
        id: 'privacy', 
        label: 'Privacy', 
        icon: 'i-heroicons-shield-exclamation-20-solid',
        tabs: [
          { id: 'data-privacy', label: 'Data Privacy' },
          { id: 'visibility', label: 'Profile Visibility' },
          { id: 'data-sharing', label: 'Data Sharing' }
        ]
      }
    ]
  }
];

definePageMeta({
  layout: 'navbar',
  middleware: ['auth'],
})
</script>