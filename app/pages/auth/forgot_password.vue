<template>
  <div class="login-wrapper">
    <div class="login-card">

      <!-- Header -->
      <div class="header">
        <h2>{{ tr('auth.forgot_password') }}</h2>
        <p>Enter your email address to reset your password</p>
      </div>

      <!-- Forgot Password Form -->
      <form @submit.prevent="handleForgotPassword" class="form">

        <!-- Email -->
        <UFormGroup label="Email" name="email">
          <UInput
            v-model="email"
            icon="lucide:mail"
            placeholder="Enter your registered email"
            size="lg"
            :disabled="isLoading"
          />
        </UFormGroup>
        <p v-if="errors.email" class="error">{{ errors.email }}</p>

        <!-- Submit Button -->
        <UButton
          type="submit"
          size="lg"
          block
          :loading="isLoading"
          :disabled="!email || isLoading"
        >
          <Icon name="lucide:mail-check" class="mr-2" />
          Send Reset Link
        </UButton>
      </form>

      <!-- Back to Login -->
      <div class="signup">
        <span>Remember your password?</span>
        <NuxtLink to="/auth/login" class="signup-link">Sign In</NuxtLink>
      </div>

      <!-- Dark Mode Toggle -->
      <button class="dark-toggle" @click="toggleDarkMode">
        <Icon :name="isDarkMode ? 'lucide:sun' : 'lucide:moon'" class="dark-icon" />
      </button>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { z } from 'zod'
import { useI18n } from 'vue-i18n'
import { useToast } from '#imports'
import { useHead } from '#imports'
definePageMeta({ layout: 'auth' })

useHead({ title: 'Forgot Password - TrackMaster' })

const router = useRouter()
const { t } = useI18n()
const toast = useToast()

// Fields
const email = ref('')
const isLoading = ref(false)

// Validation
const errors = reactive({ email: '' })
const forgotSchema = z.object({
  email: z.string().email(t('email_invalid')).min(1, t('email_required')),
})

const handleForgotPassword = async () => {
  isLoading.value = true
  errors.email = ''

  const validation = forgotSchema.safeParse({ email: email.value })
  if (!validation.success) {
    const fieldErrors = validation.error.flatten().fieldErrors
    errors.email = fieldErrors.email?.[0] || ''
    isLoading.value = false
    return
  }

  try {
    // Example: Replace with your backend API endpoint
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast.add({
      color: 'green',
      title: t('reset_link_sent'),
      description: `A password reset link has been sent to ${email.value}`,
      timeout: 5000,
    })

    router.push('/auth/login')
  } catch (err) {
    toast.add({
      color: 'red',
      title: t('error'),
      description: t('something_went_wrong'),
      timeout: 5000,
    })
  } finally {
    isLoading.value = false
  }
}

const isDarkMode = ref(false)
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  document.documentElement.classList.toggle('dark', isDarkMode.value)
}
</script>

<style scoped lang="scss">

</style>
