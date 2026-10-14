<template>
    <RModal v-model="showModal" :modal-title="tr('reset_password')" :prevent-close="true" max-width="500px"
        min-height="150px" :action-buttons="[
            { label: 'Close', event: 'close', class: 'btn-cancel' },
            { label: 'Accept', event: 'accept', class: 'btn-accept' }
        ]" size="lg" :animation-duration="350" @close="handleClose" @accept="handleAccept" @open="handleOpen">
        <div class="password-modal">
            <!-- Header -->
            <div class="header">
                <RTYAvatar :src="user.ImagePath || '/default-user.png'" :gender="user.Gender" size="50"
                    class="avatar" />
                <div class="info grid grid-cols-2 gap-2">
                    <div>
                        <h2>{{ tBy({ en: user?.NameEnglish, km: user?.Name }) || "--" }}</h2>
                        <p>{{ user?.UserType || '--' }}</p>
                    </div>
                    <div class="flex flex-col gap-1">
                        <p>{{ user?.UserCode || '--' }}</p>
                        <p>{{ user?.Email || '--' }}</p>
                    </div>
                </div>
            </div>
            <!-- Form -->
            <form @submit.prevent="handleResetPassword" class="form">
                <label class="relative block">
                    <span class="block mb-1">{{ tr('password') }}</span>
    
                    <input
                    :type="showPassword ? 'text' : 'password'"
                    v-model="password"
                    required
                    class="w-full pr-10 pl-3 py-2 border rounded focus:outline-none focus:ring"
                    />

                    <!-- Eye Icon -->
                    <i
                    :class="showPassword ? 'ri-eye-line' : 'ri-eye-off-line'"
                    class="absolute right-3 top-9 cursor-pointer text-gray-500 hover:text-gray-700"
                    @click="togglePassword"
                    ></i>
                </label>
                <p v-if="error" class="error">{{ error }}</p>
                <button type="submit" class="btn-submit">
                    {{ tr('change_password') }}
                </button>
            </form>
        </div>
    </RModal>
</template>

<script setup>
const { tr } = useTr()
import { ref, computed, watch } from 'vue'
const userStore = useUserStore()

const props = defineProps({
    modelValue: Boolean,
    user: Object,
})
const user = computed(() => props.user || {})

const emit = defineEmits(['update:modelValue', 'close', 'accept', 'open'])

const showModal = ref(props.modelValue)
const password = ref('')
const showPassword = ref(false)

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const error = ref('')

// Keep modal visibility in sync with parent
watch(() => props.modelValue, (val) => {
    showModal.value = val
})

watch(showModal, (val) => {
    emit('update:modelValue', val)
})

const handleResetPassword = async () => {
  error.value = ''
  console.log("Password ----------:", password.value)
  console.log("Username ----------:", user.value?.Username)

  try {
    const result = await userStore.resetPassword({
      Username: user.value?.Username || '',
      NewPassword: password.value
    })

    alert('Password reset successfully!')
    showModal.value = false
    console.log('Password reset successful:', result)
  } catch (err) {
    error.value = err.message || 'Reset failed'
    console.log('Password reset failed:', err.message)
  }
}


const handleClose = () => {
    emit('close')
    showModal.value = false
}

const handleOpen = () => {
    emit('open')
}

const handleAccept = () => {
    emit('accept')
    showModal.value = false
}
</script>
<style lang="scss" scoped>
.password-modal {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;

    .header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1.5rem;
        border-bottom: 1px solid #e5e7eb;
        padding-bottom: 1rem;

        .avatar {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            object-fit: cover;
        }

        .info {
            h2 {
                font-size: 1.125rem;
                font-weight: 600;
                margin: 0;
            }

            p {
                font-size: 0.875rem;
                color: #6b7280;
                margin: 0;
            }
        }
    }


    .form {
        display: flex;
        flex-direction: column;
        gap: 1rem;

        label {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;

            span {
                font-size: 0.875rem;
                color: #374151;
                font-weight: 500;
            }

            input {
                padding: 0.5rem 0.75rem;
                border: 1px solid #d1d5db;
                border-radius: 0.5rem;
                font-size: 0.875rem;

                &:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
                }
            }
        }

        .error {
            color: #ef4444;
            font-size: 0.875rem;
            margin-top: -0.5rem;
        }

        .btn-submit {
            align-self: flex-end;
            background-color: #3b82f6;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            font-weight: 600;
            transition: background 0.3s ease;

            &:hover {
                background-color: #2563eb;
            }
        }
    }
}
</style>

<!-- <style lang="css" scoped>
.change-password-modal {
    padding: 1.5rem;

    .header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1.5rem;
        border-bottom: 1px solid #e5e7eb;
        padding-bottom: 1rem;

        .avatar {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            object-fit: cover;
        }

        .info {
            h2 {
                font-size: 1.125rem;
                font-weight: 600;
                margin: 0;
            }

            p {
                font-size: 0.875rem;
                color: #6b7280;
                margin: 0;
            }
        }
    }

    .form {
        display: flex;
        flex-direction: column;
        gap: 1rem;

        label {
            display: flex;
            flex-direction: column;
            font-size: 0.875rem;

            span {
                margin-bottom: 0.25rem;
                color: #374151;
                font-weight: 500;
            }

            input {
                padding: 0.5rem 0.75rem;
                border: 1px solid #d1d5db;
                border-radius: 0.375rem;
                font-size: 1rem;

                &:focus {
                    outline: none;
                    border-color: #3b82f6;
                }
            }
        }

        .error {
            color: #ef4444;
            font-size: 0.875rem;
        }

        .btn-submit {
            align-self: flex-end;
            background: #2563eb;
            color: white;
            padding: 0.5rem 1.25rem;
            border-radius: 0.375rem;
            border: none;
            cursor: pointer;
            font-weight: 500;
            margin-top: 1rem;

            &:hover {
                background: #1d4ed8;
            }
        }
    }
}

/* //Optional button styles (based on your action-buttons props) */
.btn-cancel {
    background: #f3f4f6;
    color: #111827;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;

    &:hover {
        background: #e5e7eb;
    }
}

.btn-accept {
    background: #16a34a;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;

    &:hover {
        background: #15803d;
    }
}
</style> -->