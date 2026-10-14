<template>

    <div>

        <h1>RTblBtns</h1>
        <RTblBtns :items="btnActionsList(rowData)" @actionClick="(type, action) => handleGuestAction(type, rowData, action)"/>

    </div>


</template>


<script setup>

definePageMeta({layout:'navbar'})

const { t } = useI18n()

const btnActionsList = (g) => [
  {
    type: 'view',
    label: t('view_invitation'),
    icon: 'ri-external-link-line',
  },
  {
    type: 'edit',
    label: t('edit'),
    icon: 'ri-edit-line',
  },
  {
    type: 'copy',
    label: t('copy_link'),
    icon: 'ri-file-copy-line'
  },
  {
    type: 'telegram',
    label: t('send_via_telegram'),
    icon: 'ri-telegram-line'
  },
  {
    type: 'email',
    label: t('send_via_mail'),
    icon: 'ri-mail-send-line',
  },
  {
    type: 'whatsapp',
    label: t('send_via_whatsapp'),
    icon: 'ri-whatsapp-line',
  },
  {
    type: 'delete',
    label: t('delete'),
    icon: 'ri-delete-bin-line',
    color: 'error',
  }
]

async function handleGuestAction(type, guest) {
  if(type==='view') return console.log('view')
  if(type==='edit') return openEdit(guest)
  if(type==='copy') return console.log('copy')
  if(type==='telegram') return console.log('telegram')
  if(type==='email') return console.log('email')
  if(type==='whatsapp') return console.log('whatsapp')
  if(type==='delete') return confirmDelete(guest)
}

</script>