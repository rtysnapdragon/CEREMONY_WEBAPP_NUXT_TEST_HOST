<template>
<RCheckbox label="options" :options="options" v-model="select" rounded="xl"  icon="i-lucide-heart"/>
<RCheckbox label="options" :options="options" v-model="select" rounded="xl" icon="ri-check-double-line" />
<RCheckbox label="options" :options="options" v-model="select" rounded="xl" />
<RCheckbox label="options" :options="options" v-model="select" rounded="xl" />
<RCheckbox label="options" :options="options" v-model="select" rounded="xl" />
<RCheckbox label="options" :options="options" v-model="select" rounded="lg" />
<RCheckbox label="options" :options="options" v-model="select" rounded="md" />
<RCheckbox label="options" :options="options" v-model="select" rounded="sm" />
<RCheckbox label="options" :options="options" v-model="select" rounded="xs" />
<RCheckbox label="options" :options="options" v-model="select" rounded="none" />


<RCheckboxes  :options="options" v-model="select" />






<RBtns :threeDotOnly="true" :data="[{ type: 'view', icon: 'ri-eye-line', label: $t('view') }, { type: 'edit', icon: 'ri-edit-line', label: $t('edit') }, { type: 'delete', icon: 'ri-delete-bin-line', label: $t('delete') }]" @click="({ type }) => {
            if (type === 'view') console.log('View ------------------>')
            else if (type === 'edit') console.log('Edit ------------------>')
            else if (type === 'delete') console.log('Delete ------------------>')
          }" />
</template>
<script setup>
import { ref } from 'vue'

const select = ref([])
const options = [
  { label: 'Option 1', value: 1 },
  { label: 'Option 2', value: 2 },
  { label: 'Option 3', value: 3 }
]
const options1 = [
  { label: 'Option 1', value: 1 },
  { label: 'Option 2', value: 2 },
  { label: 'Option 3', value: 3 }
]
</script>
