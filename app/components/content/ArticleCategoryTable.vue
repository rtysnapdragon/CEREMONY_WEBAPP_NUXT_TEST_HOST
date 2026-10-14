<template>
  <RTable :columns="columns" :data="data" :loading="loading" @reloadByFixedData="$emit('reload')">
    <template #cover="{ rowData }">
      <div class="cat-thumb-cell">
        <RImage
          v-if="rowData.coverMedia"
          :src="rowData.coverMedia.thumbnailUrl"
          :alt="rowData.coverMedia.altText || rowData.name"
          class="cat-thumb cat-thumb-clickable"
          @click.stop="$emit('view-image', rowData.coverMedia)"
        />
        <div v-else class="cat-thumb-placeholder"><i class="ri-price-tag-3-line" /></div>
      </div>
    </template>

    <template #name="{ rowData }">
      <span class="cat-name-cell">{{ t(rowData, 'name') }}</span>
    </template>

    <template #slug="{ rowData }">
      <code class="slug-chip">{{ rowData.slug }}</code>
    </template>

    <template #parent="{ rowData }">
      <span v-if="rowData.parentCategoryName" class="badge badge-muted">{{ rowData.parentCategoryName }}</span>
      <span v-else class="text-muted">—</span>
    </template>

    <template #description="{ rowData }">
      <span class="text-muted" style="font-size:0.8125rem">{{ t(rowData, 'description') || '—' }}</span>
    </template>

    <template #actions="{ rowData }">
      <RTblBtns :items="[{type: 'edit', label: 'edit',icon:'ri-edit-line',color:'primary'}, { type: 'delete', label:'delete', icon:'ri-delete-bin-line',color:'danger'}]"
        @actionClick="(type, action) => { type === 'edit' ? $emit('edit', rowData) : $emit('delete', rowData) }"/>
    </template>
  </RTable>
</template>

<script setup>
defineProps({
  data:    { type: Array,   default: () => [] },
  loading: { type: Boolean, default: false },
  columns: { type: Array,   required: true },
  api:     { type: [Object, String], default: null },
})

defineEmits(['edit', 'delete', 'view-image', 'reload'])

const { locale } = useSarikaLocale()
const t = (item, field) => item?.translations?.[field]?.[locale.value] || item?.[field] || ''
</script>
