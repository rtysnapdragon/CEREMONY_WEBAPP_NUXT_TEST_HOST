<script setup lang="ts">
/**
 * RTableFilter.vue
 * Per-column filter panel, shown as a UPopover from the header toolbar.
 * Emits 'apply' with the updated ColumnFilter[] so parent (RTable) can react.
 */
import type { ColumnFilter } from '~/composables/useRTableFilter'

defineOptions({ name: 'RTableFilter' })

const props = defineProps<{
  columns:       Array<{ key: string; label?: string; filterable?: boolean; filterType?: 'text' | 'select' | 'range'; filterOptions?: any[] }>
  modelValue:    ColumnFilter[]   // current active filters
}>()

const emit = defineEmits<{
  'update:modelValue': [val: ColumnFilter[]]
  apply: [val: ColumnFilter[]]
}>()

const { t } = useI18n()

// Local copy — only emit on Apply
const local = ref<ColumnFilter[]>([])

// Sync from prop
watch(() => props.modelValue, v => { local.value = v.map(f => ({ ...f })) }, { immediate: true, deep: true })

const filterableCols = computed(() => props.columns.filter(c => c.filterable !== false))

const getFilter = (key: string): ColumnFilter =>
  local.value.find(f => f.key === key) ?? { key, value: '', operator: 'contains' }

const setFilter = (key: string, value: any, operator: ColumnFilter['operator'] = 'contains') => {
  const idx = local.value.findIndex(f => f.key === key)
  if (idx >= 0) local.value[idx] = { key, value, operator }
  else           local.value.push({ key, value, operator })
}

const clearFilter = (key: string) => {
  local.value = local.value.filter(f => f.key !== key)
}

const activeCount = computed(() =>
  props.modelValue.filter(f => f.value !== '' && f.value != null &&
    !(Array.isArray(f.value) && !f.value.length)).length
)

const apply = () => {
  // Strip empty filters before emitting
  const clean = local.value.filter(f =>
    f.value !== '' && f.value != null &&
    !(Array.isArray(f.value) && !f.value.length)
  )
  emit('update:modelValue', clean)
  emit('apply', clean)
}

const reset = () => {
  local.value = []
  emit('update:modelValue', [])
  emit('apply', [])
}
</script>

<template>
  <UPopover :ui="{ content: 'r-table-filter__popover' }">
    <UButton
      :icon="activeCount ? 'i-ri-filter-fill' : 'i-ri-filter-line'"
      color="neutral"
      variant="ghost"
      size="sm"
      :aria-label="t('filter')"
      :badge="activeCount || undefined"
    >
      <span class="r-table-filter__label">{{ t('filter') }}</span>
      <UBadge v-if="activeCount" :label="String(activeCount)" size="xs" color="primary" class="r-table-filter__badge" />
    </UButton>

    <template #content>
      <div class="r-table-filter__panel" role="dialog" :aria-label="t('column_filters')">
        <header class="r-table-filter__head">
          <span class="r-table-filter__title">{{ t('filter') }}</span>
          <UButton
            icon="i-ri-close-line"
            size="xs"
            variant="ghost"
            color="neutral"
            :aria-label="t('close')"
          />
        </header>

        <div class="r-table-filter__body">
          <div
            v-for="col in filterableCols"
            :key="col.key"
            class="r-table-filter__row"
          >
            <label class="r-table-filter__col-label">
              {{ col.label ?? col.key }}
            </label>

            <!-- Text / contains filter -->
            <template v-if="!col.filterType || col.filterType === 'text'">
              <RInput
                :model-value="getFilter(col.key).value"
                :placeholder="t('search_in', { col: col.label ?? col.key })"
                size="sm"
                class="r-table-filter__input"
                @update:model-value="v => setFilter(col.key, v, 'contains')"
              />
            </template>

            <!-- Select / multi filter -->
            <template v-else-if="col.filterType === 'select'">
              <RSelect
                :model-value="getFilter(col.key).value"
                :options="col.filterOptions ?? []"
                :placeholder="t('select')"
                size="sm"
                multiple
                class="r-table-filter__input"
                @update:model-value="v => setFilter(col.key, v, 'in')"
              />
            </template>

            <!-- Range filter (numeric from/to) -->
            <template v-else-if="col.filterType === 'range'">
              <div class="r-table-filter__range">
                <RInput
                  type="number"
                  :model-value="getFilter(col.key).value?.from ?? ''"
                  :placeholder="t('from')"
                  size="sm"
                  @update:model-value="v => setFilter(col.key, { ...getFilter(col.key).value, from: v === '' ? undefined : Number(v) }, 'range')"
                />
                <span class="r-table-filter__range-sep">–</span>
                <RInput
                  type="number"
                  :model-value="getFilter(col.key).value?.to ?? ''"
                  :placeholder="t('to')"
                  size="sm"
                  @update:model-value="v => setFilter(col.key, { ...getFilter(col.key).value, to: v === '' ? undefined : Number(v) }, 'range')"
                />
              </div>
            </template>

            <UButton
              v-if="getFilter(col.key).value !== '' && getFilter(col.key).value != null"
              icon="i-ri-close-circle-line"
              size="xs"
              variant="ghost"
              color="neutral"
              :aria-label="t('clear')"
              @click="clearFilter(col.key)"
            />
          </div>
        </div>

        <footer class="r-table-filter__foot">
          <UButton size="sm" color="neutral" variant="ghost" @click="reset">
            {{ t('reset') }}
          </UButton>
          <UButton size="sm" color="primary" @click="apply">
            {{ t('apply') }}
          </UButton>
        </footer>
      </div>
    </template>
  </UPopover>
</template>

<style lang="scss" scoped>
@mixin flex-gap($g: 0.5rem) { display: flex; align-items: center; gap: $g; }

.r-table-filter {
  &__label { font-size: 0.8125rem; }

  &__badge { margin-left: 0.25rem; }

  &__popover {
    width: 320px;
    max-width: 95vw;
  }

  &__panel {
    display: flex;
    flex-direction: column;
  }

  &__head {
    @include flex-gap;
    justify-content: space-between;
    padding: 0.625rem 0.75rem;
    border-bottom: 1px solid var(--ui-border);
  }

  &__title {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--ui-text);
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    padding: 0.75rem;
    max-height: 320px;
    overflow-y: auto;
  }

  &__row {
    @include flex-gap(0.375rem);
    align-items: flex-start;
    flex-direction: column;
  }

  &__col-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--ui-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  &__input { width: 100%; }

  &__range {
    @include flex-gap(0.375rem);
    width: 100%;

    &-sep {
      flex-shrink: 0;
      color: var(--ui-text-muted);
      font-size: 0.875rem;
    }
  }

  &__foot {
    @include flex-gap;
    justify-content: flex-end;
    padding: 0.625rem 0.75rem;
    border-top: 1px solid var(--ui-border);
    gap: 0.375rem;
  }
}
</style>