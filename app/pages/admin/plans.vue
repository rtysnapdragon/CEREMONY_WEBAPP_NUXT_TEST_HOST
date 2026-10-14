<template>
  <RWrapperPage class="plans-page">
    <RPageHeader title="Subscription Plans" :subtitle="`${plans.length} plans configured`" />

    <RTable :data="plans" :header-visible="true" :showTemplate="true" :options="{ searchable: false, paging: false}">
      <template #headerRight>
        <RBtn type="add" color="success" icon="ri-add-line" label="New Plan" @click="openCreate"/>
      </template>
      <template #template = "{ data }">
        <div class="plans-grid animate-fade-up delay-1">
          <div v-for="plan in data" :key="plan.id" class="plan-card glass-card">
            <div class="plan-card-header">
              <div>
                <h3 class="plan-name">{{ plan.displayName }}</h3>
                <span class="plan-key">{{ plan.name }}</span>
              </div>
              <div class="plan-actions">
                <span class="badge" :class="plan.active ? 'badge-success' : 'badge-muted'">
                  {{ plan.active ? 'Active' : 'Inactive' }}
                </span>
                <RTblBtns :items="[{ type: 'edit', label:tr('edit') , icon:'ri-edit-line'}, { type: 'delete', label:tr('delete'), color:'danger', icon:'ri-delete-bin-line'}]" @action-click="(e,item)=>item.type==='edit'?openEdit(plan):confirmDelete(plan)"/>
              </div>
            </div>

            <p class="plan-desc">{{ plan.description }}</p>

            <div class="plan-limits">
              <div class="limit-item">
                <i class="ri-heart-line" />
                <span>{{ plan.maxEvents === -1 ? 'Unlimited' : plan.maxEvents }} weddings</span>
              </div>
              <div class="limit-item">
                <i class="ri-group-line" />
                <span>{{ plan.maxGuestsPerEvent === -1 ? 'Unlimited' : plan.maxGuestsPerEvent }} guests/wedding</span>
              </div>
              <div class="limit-item">
                <i class="ri-user-line" />
                <span>{{ plan.maxUsers === -1 ? 'Unlimited' : plan.maxUsers }} users</span>
              </div>
            </div>

            <div class="plan-features">
              <span v-for="(label, key) in FEATURE_LABELS" :key="key"
                class="feature-chip" :class="plan[key] ? 'feature-on' : 'feature-off'">
                <i :class="plan[key] ? 'ri-check-line' : 'ri-close-line'" />
                {{ label }}
              </span>
            </div>
          </div>
        </div>
      </template>
    </RTable>

    <!-- Create / Edit Modal -->
    <RModal v-model="showModal" :title="editingPlan ? tr('edit_plan') : tr('new_plan')">
      <RForm class="modal-form space-y-2" @onSubmit="savePlan">
        <div class="form-row-2">
          <RFormGroup label="Plan Key (e.g. PROFESSIONAL)" required>
            <RInput v-model="form.name"  :disabled="!!editingPlan" style="text-transform:uppercase" />
          </RFormGroup>
          <RFormGroup :label="tr('display_name')" required>
            <RInput v-model="form.displayName" />
          </RFormGroup>
        </div>
        <RFormGroup :label="tr('description')" required>
          <RInput v-model="form.description" />
        </RFormGroup>
        <div class="form-row-3">
          <RFormGroup :label="tr('max_wedding')" required>
            <RInput v-model.number="form.maxEvents" leadingIcon="ri-heart-line" type="number" min="-1"  />
          </RFormGroup>
          <RFormGroup :label="tr('max_guest')" required>
            <RInput v-model.number="form.maxGuestsPerEvent" leadingIcon="ri-group-line" type="number" min="-1"  />
          </RFormGroup>
          <RFormGroup :label="tr('plans.max_users')" required>
            <RInput v-model.number="form.maxUsers" leadingIcon="ri-user-line" type="number" min="-1"  />
          </RFormGroup>
        </div>
        <div class="features-grid">
          <RCheckbox v-for="(label, key) in FEATURE_LABELS" :key="key" v-model="form[key]" :label="label" />
          <RCheckbox v-model="form.active" label="Active" />
        </div>
      </RForm>
      <template #footer class="modal-footer">
        <RBtn type="cancel" color="cancel" icon="cancel" :label="$t('cancel')"  :disabled="saving" @click="closeModal"/>
        <RBtn type="save" color="success" :icon=" saving ? 'ri-loader-4-line' : 'ri-save-line'" :loading="saving" :label="saving ? $t('saving') : $t('save')"  :disabled="saving"/>
      </template>
    </RModal>
  </RWrapperPage>
</template>

<script setup>
definePageMeta({ layout: 'navbar', middleware: ['auth'] })

const { tr } = useTr()
const { FEATURE_LABELS, plans, loading, fetchError, showModal, editingPlan, saving, form,
  init, openCreate, openEdit, closeModal, savePlan, confirmDelete,
} = useAdminPlansPage()

onMounted(init)
</script>

<style lang="scss">
.plans-page { display: flex; flex-direction: column; gap: var(--sp-5); }

.state-center { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: var(--sp-10) 0; gap: var(--sp-3); }

.plans-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--sp-5);
  @media (max-width: 1100px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 640px) { grid-template-columns: 1fr; }
}

.plan-card { padding: var(--sp-5); display: flex; flex-direction: column; gap: var(--sp-4); }

.plan-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--sp-3);
}

.plan-name { font-weight: 700; font-size: 1.0625rem; margin: 0 0 4px; }
.plan-key { font-size: 0.75rem; color: var(--c-muted); font-family: monospace; }
.plan-desc { font-size: 0.8125rem; color: var(--c-muted); margin: 0; }

.plan-actions { display: flex; align-items: center; gap: var(--sp-2); flex-shrink: 0; }

.plan-limits {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.limit-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8125rem;
  color: var(--c-text-secondary);
  i { font-size: 0.875rem; color: var(--c-accent); }
}

.plan-features {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.feature-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: var(--r-full);
  font-size: 0.6875rem;
  font-weight: 600;

  &.feature-on {
    background: rgba(34, 197, 94, 0.12);
    color: var(--c-success);
    border: 1px solid rgba(34, 197, 94, 0.2);
  }
  &.feature-off {
    background: rgba(255, 255, 255, 0.04);
    color: var(--c-muted);
    border: 1px solid var(--c-border);
  }
}

.plan-modal { max-width: 680px; width: 100%; }

.form-row-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--sp-4);
  @media (max-width: 600px) { grid-template-columns: 1fr; }
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--sp-3);
  padding: var(--sp-4);
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--c-border);
  border-radius: var(--r-lg);
  @media (max-width: 600px) { grid-template-columns: repeat(2, 1fr); }
}

.feature-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.8125rem;
  color: var(--c-text-secondary);
  input[type=checkbox] { accent-color: var(--c-accent); width: 15px; height: 15px; cursor: pointer; }
}

.btn-danger-ghost {
  color: var(--c-danger);
  &:hover { background: rgba(239, 68, 68, 0.1); }
}
</style>
