
<template>
  <RWrapperPage class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">

      <h2 class="text-2xl font-bold mb-6 text-center">
        Reset Password
      </h2>

      <div v-if="error" class="bg-red-100 text-red-600 p-3 rounded mb-4">
        {{ error }}
      </div>

      <div v-if="success" class="bg-green-100 text-green-600 p-3 rounded mb-4">
        {{ success }}
      </div>

      <input
        v-model="password"
        type="password"
        placeholder="New Password"
        class="w-full mb-4 px-4 py-2 border rounded-lg"
      />
      <p class="text-red-500 text-sm">{{ passwordError }}</p>
      <input
        v-model="confirmPassword"
        type="password"
        placeholder="Confirm Password"
        class="w-full mb-4 px-4 py-2 border rounded-lg"
      />
      <p class="text-red-500 text-sm">{{ confirmError }}</p>
      <button
        @click="resetPassword"
        :disabled="loading"
        class="w-full bg-blue-600 text-white py-2 rounded-lg"
      >
        {{ loading ? "Processing..." : "Reset Password" }}
      </button>

    </div>
  </RWrapperPage>
</template>

<script setup>
definePageMeta({ layout: 'auth',  })
const route = useRoute()
const router = useRouter()

const token = ref(route.query.token || "")

const password = ref("")
const confirmPassword = ref("")

const loading = ref(false)
const error = ref("")
const success = ref("")

// 🔹 computed validation
const passwordError = computed(() => {
  if (!password.value) return "Password is required"
  if (password.value.length < 6) return "Minimum 6 characters"
  return ""
})

const confirmError = computed(() => {
  if (!confirmPassword.value) return "Please confirm password"
  if (password.value !== confirmPassword.value) return "Passwords do not match"
  return ""
})

const isValid = computed(() => {
  return !passwordError.value && !confirmError.value && token.value
})

const resetPassword = async () => {
  error.value = ""
  success.value = ""

  // if (!token.value) {
  //   error.value = "Invalid or expired reset link"
  //   return
  // }

  if (!isValid.value) {
    error.value = "Please fix the errors"
    return
  }

  loading.value = true

  try {
    const res = await $fetch(`${getUrl()}/v1/api/reset_password`, {
      method: "POST",
      body: {
        Token: token.value,
        Password: password.value.trim(),
        ConfirmPassword: confirmPassword.value.trim()
      }
    })

    success.value = "Password reset successful!"

    setTimeout(() => {
      router.push('/auth/login')
    }, 1500)

  } catch (err) {
    error.value = err?.data?.Message || "Something went wrong"
  }

  loading.value = false
}
</script>
