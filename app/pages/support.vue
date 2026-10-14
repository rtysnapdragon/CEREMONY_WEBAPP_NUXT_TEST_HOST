<template>
  <RWrapperPage class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Help & Support</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-2">Get help with your account and find answers to common questions</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <!-- Contact Card -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-center">
          <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <UIcon name="i-heroicons-chat-bubble-left-right-20-solid" class="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Contact Support</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-4">Get in touch with our support team</p>
          <UButton color="primary" @click="isContactOpen = true">
            Contact Us
          </UButton>
        </div>

        <!-- Documentation Card -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-center">
          <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <UIcon name="i-heroicons-book-open-20-solid" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Documentation</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-4">Browse our comprehensive guides</p>
          <UButton color="blue" @click="navigateTo('/docs')">
            View Docs
          </UButton>
        </div>
      </div>

      <!-- FAQ Section -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
        
        <UAccordion :items="faqItems" variant="outline" />
      </div>
    </div>

    <!-- Contact Modal -->
    <UModal v-model="isContactOpen">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Contact Support</h3>
        </template>

        <UForm :state="contactForm" class="space-y-4">
          <UFormGroup label="Subject" name="subject">
            <UInput v-model="contactForm.subject" placeholder="What can we help you with?" />
          </UFormGroup>

          <UFormGroup label="Message" name="message">
            <UTextarea v-model="contactForm.message" placeholder="Describe your issue..." rows="5" />
          </UFormGroup>
        </UForm>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton variant="ghost" @click="isContactOpen = false">Cancel</UButton>
            <UButton color="primary" @click="submitContact">Send Message</UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </RWrapperPage>
</template>

<script setup>
const isContactOpen = ref(false)

const contactForm = ref({
  subject: '',
  message: ''
})

const faqItems = [
  {
    label: 'How do I reset my password?',
    content: 'You can reset your password by clicking on "Forgot Password" on the login page.'
  },
  {
    label: 'How can I update my payment information?',
    content: 'Navigate to Settings → Billing to update your payment methods.'
  }
]

definePageMeta({
  layout:'navbar'
})
</script>