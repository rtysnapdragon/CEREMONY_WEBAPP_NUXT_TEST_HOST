<template>
  <RFormCreateModal
    v-model:show="open"
    :form="formData"
    :inputs="inputs"
    :tabs="tabs"
    :title="$t('create')"
    subtitle="Fill in the details to create a new account"
    icon="i-lucide-user-plus-2"
    :loading="loading"
    @onSubmitted="handleSubmit"
    @onCancel="$emit('cancel')"
  />

  <RBtn label="Open Modal" @click="open = true" />
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const open = ref(false)

const props = defineProps({
  loading:   Boolean
})

const emit = defineEmits([
  'update',
  'submit',
  'cancel'
])

const { t } = useI18n()
const formData = ref({
  active: true,
  role:   'viewer',
})
const formConfig = {
  width: 500,
  showSubmit: true,
  showReset: true,
  showCancel: true
}

// const inputs = [
//   { name: 'name', type: 'text', label: 'Name' },
//   { name: 'email', type: 'email', label: 'Email' }
// ]

const tabs = [] // optional

const inputs = [
    {
      name:        'name',
      type:        'text',
      label:       t('name'),
      placeholder: t('name'),
      icon:        'i-lucide-user',
      required:    true,
      minLength:   2
    },
    {
      name:         'email',
      type:        'email',
      label:       t('email'),    
      placeholder: 'john@example.com',
      icon:        'i-lucide-mail',
      required:    true,
    },
    {
      name:    'phone',
      type:    'tel',
      label:   t('phone'),
      placeholder: '+855 xx xxx xxx',
      icon:    'i-lucide-phone',
    },
    {
      name: 'role',
      type: 'select',
      label: t('role'),
      pk: 'Id',
      options: [
        {
          Id: 'admin',
          Name: 'Admin',
          NameEnglish: 'Admin'
        },
        {
          Id: 'manager',
          Name: 'Manager',
          NameEnglish: 'Manager'
        },
        {
          Id: 'viewer',
          Name: 'Viewer',
          NameEnglish: 'Viewer'
        }
      ]
    },
    {
      name:     'department',
      type:    'text',
      label:   t('department'),
      icon:    'i-lucide-building',
      placeholder: t('department'),
    },
    {
      name:   'active',
      type:  'toggle',
      label: t('active'),
      defaultValue: true,
    },
]


function handleSubmit(data) {
  emit('submit', data)
}

definePageMeta({
    layout: 'navbar'
})
</script>

