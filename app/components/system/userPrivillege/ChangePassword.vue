<template>
    <RModal v-model="showModal" :modal-title="tr('change_password')" :prevent-close="true"max-width="500px" min-height="150px"
        :action-buttons="[
            { label: 'Close', event: 'close', class: 'btn-cancel' },
            { label: 'Accept', event: 'accept', class: 'btn-accept' }
        ]" size="lg" :animation-duration="350" @close="handleClose" @accept="handleAccept" @open="handleOpen">
        <div class="change-password-modal">
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
            <form @submit.prevent="handleChangePassword" class="form">
                <label>
                    <span>{{tr('password')}}</span>
                    <input v-model="currentPassword" type="password" required />
                </label>
                <label>
                    <span>{{tr('new_password')}}</span>
                    <input v-model="newPassword" type="password" required />
                </label>
                <label>
                    <span>{{tr('confirm_new_password')}}</span>
                    <input v-model="confirmPassword" type="password" required />
                </label>

                <p v-if="error" class="error">{{ error }}</p>
                <button type="submit" class="btn-submit">{{tr('change_password')}}</button>
            </form>
        </div>
    </RModal>
</template>


<script setup>
const { tr } = useTr()
import { ref, computed, watch } from 'vue'

const props = defineProps({
    modelValue: Boolean,
    user: Object,
})
const user = computed(() => props.user || {})

const emit = defineEmits(['update:modelValue', 'close', 'accept', 'open'])

const showModal = ref(props.modelValue)
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const error = ref('')

// Keep modal visibility in sync with parent
watch(() => props.modelValue, (val) => {
    showModal.value = val
})

watch(showModal, (val) => {
    emit('update:modelValue', val)
})

const handleChangePassword = async () => {
    if (newPassword.value !== confirmPassword.value) {
        error.value = "Passwords do not match"
        return null
    }

    error.value = ''
    console.log("User id ----------:", user.value?.UserId)
    try {
        const { data, error } = await useHttp('/api/user/change_password', {
            method: 'POST',
            data: {
                Id: user.value?.UserId || 0,
                CurrentPassword: currentPassword.value,
                NewPassword: newPassword.value,
            },
        })
        if(error) throw new Error(error)
        alert('Password changed successfully!')
        showModal.value = false
    } catch (err) {
        error.value = err.data?.message || 'Something went wrong'
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

<style lang="css" scoped>
.change-password-modal {
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
</style>