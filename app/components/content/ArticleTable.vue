<template>
  <RTable :columns="columns" :data="data" :loading="loading" @reloadByFixedData="$emit('reload')">
    <template #headerLeft v-if="$slots.headerLeft">
      <slot name="headerLeft"></slot>
    </template>
    <template #headerRight v-if="$slots.headerRight">
      <slot name="headerRight"></slot>
    </template>
    <template #cover="{ rowData }">
      <div class="ac-thumb-cell">
        <RImage
          v-if="rowData.coverMedia"
          :src="rowData.coverMedia.thumbnailUrl || rowData.coverMedia.fileUrl"
          :alt="rowData.coverMedia.altText || rowData.title"
          class="ac-thumb"
          loading="lazy"
          round="s"
          border="s"
          style="cursor:zoom-in"
          @click.stop="$emit('view', buildMediaList(rowData), 0)"
        />
        <div v-else class="ac-thumb-placeholder"><i class="ri-article-line" /></div>
      </div>
    </template>

    <template #title="{ rowData }">
      <div class="ac-title-cell">
        <span class="ac-title-text">{{ t(rowData, 'title') }}</span>
        <span v-if="rowData.excerpt" class="ac-excerpt-text">{{ t(rowData, 'excerpt') }}</span>
        <div v-if="rowData.images?.length" class="ac-img-strip">
          <RImage
            v-for="(img, idx) in rowData.images.slice(0, 4)"
            :key="img.id"
            :src="img.thumbnailUrl || img.fileUrl"
            :alt="img.altText"
            class="ac-strip-img"
            loading="lazy"
            style="cursor:zoom-in"
            @click.stop="$emit('view', buildMediaList(rowData), idx + (rowData.coverMedia ? 1 : 0))"
          />
          <span v-if="rowData.images.length > 4" class="ac-strip-more">+{{ rowData.images.length - 4 }}</span>
        </div>
      </div>
    </template>

    <template #category="{ rowData }">
      <span v-if="rowData.category" class="badge badge-muted">{{ rowData.category.name }}</span>
      <span v-else class="text-muted">—</span>
    </template>

    <template #status="{ rowData }">
      <span class="badge" :class="statusBadge(rowData.status)">{{ rowData.status }}</span>
    </template>

    <template #author="{ rowData }">
      <span class="text-muted" style="font-size:0.8125rem">{{ rowData.authorName || '—' }}</span>
    </template>

    <template #date="{ rowData }">
      <span class="text-muted" style="font-size:0.8125rem">{{ fmtDate(rowData.publishedAt || rowData.createdAt) }}</span>
    </template>

    <template #actions="{ rowData }">
      <RTblBtns :items="[...rowData.status === 'DRAFT' ? [{ type: 'publish', icon:'ri-send-plane-line', label:'publish'}] : [],
      ...rowData.status === 'PUBLISHED' ? [{type: 'archive', icon: 'ri-archive-line', label:'archive', color:'error'}] : [], 
      {type: 'edit', icon: 'edit', label:'edit', color:'edit'},
      {type: 'delete', icon: 'delete', label:'delete', color:'delete'}]" 
      @action-click="(e,item) => { if(item.type=='edit') $emit('edit',rowData); else if(item.type=='delete') $emit('delete',rowData); else if(item.type=='publish') $emit('publish',rowData); else if(item.type=='archive') $emit('archive',rowData); }"/>
<!-- 
      <div class="flex gap-1" @click.stop>
        <button v-if="rowData.status === 'DRAFT'" class="btn-icon btn-xs-icon" @click="$emit('publish', rowData)"><i class="ri-send-plane-line" /></button>
        <button v-if="rowData.status === 'PUBLISHED'" class="btn-icon btn-xs-icon" @click="$emit('archive', rowData)"><i class="ri-archive-line" /></button>
        <button class="btn-icon btn-xs-icon" @click="$emit('edit', rowData)"><i class="ri-edit-line" /></button>
        <button class="btn-icon btn-xs-icon" style="color:var(--c-danger)" @click="$emit('delete', rowData)"><i class="ri-delete-bin-line" /></button>
      </div> -->
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

defineEmits(['edit', 'delete', 'publish', 'archive', 'view', 'reload'])

const { locale } = useSarikaLocale()
const t = (item, field) => item?.translations?.[field]?.[locale.value] || item?.[field] || ''
const statusBadge = (s) => ({ PUBLISHED: 'badge-success', DRAFT: 'badge-muted', ARCHIVED: 'badge-accent' }[s] ?? 'badge-muted')
const fmtDate = (d) => d ? new Date(d).toLocaleDateString() : '—'

const buildMediaList = (article) => {
  const list = []
  if (article.coverMedia) list.push(article.coverMedia)
  if (article.images?.length) list.push(...article.images)
  return list
}
</script>
