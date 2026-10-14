<template>
  <RWrapperPage class="ceremony-page">
    <AppActionNavbar />

    <!-- Empty state -->
    <REmptyState
      v-if="!programs.length"
      icon="ri-calendar-event-line"
      :title="tr('ceremony.no_programs')"
      :description="tBy({en:'Please setup your event program first to access and config program',km:'សូមរៀបចំកម្មវិធីអាពាហ៍ពិពាហ៍របស់អ្នកជាមុនសិនដើម្បីចូលប្រើនិងកំណត់កម្មវិធី'})"
      :actions="[{
        type: 'create',
        icon: 'ri-add-circle-line',
        label: tr('ceremony.add_program'),
        onClick: openCreate,
      }]"
    />

    <!-- Program cards grid -->
    <RContent v-else>
      <div class="programs-grid">
        <RCard
          v-for="prog in programs"
          :key="prog.id"
          class="program-card"
        >
          <template #header>
            <div class="prog-card-head">
              <div class="prog-type-badge">
                <img v-if="prog.typeIcon" :src="prog.typeIcon" class="prog-icon-img" />
                <span>{{ tBy({ en: prog.typeName, km: prog.typeNameKm }) }}</span>
              </div>
              <div class="prog-actions">
                <RBtn size="xs" variant="ghost" icon="ri-edit-line" @click="openEdit(prog)" />
                <RBtn size="xs" variant="ghost" icon="ri-delete-bin-line" @click="confirmDelete(prog)" />
              </div>
            </div>
          </template>
          <div class="prog-card-body">
            <h3>{{ prog.groomName }} &amp; {{ prog.brideName }}</h3>
            <div class="prog-meta">
              <span><i class="ri-calendar-line" /> {{ formatDate(prog.eventDate) }}</span>
              <span><i class="ri-map-pin-line" /> {{ prog.venue || '—' }}</span>
            </div>
            <div class="prog-schedule-count">
              <i class="ri-list-check-2" />
              {{ prog.schedules?.length || 0 }} {{ tr('ceremony.ceremonies') }}
            </div>
          </div>
        </RCard>
      </div>
    </RContent>

    <!-- ══════════ STEP MODAL ══════════ -->
    <CeremonyCreateModal
      v-model:open="showModal"
      @saved="onSaved"
    />
  </RWrapperPage>
</template>

<script setup>
definePageMeta({ layout: false, middleware: ['auth'] })
const { tr } = useTr()
const confirm = useConfirmStore()

const showModal   = ref(false)
const ceremonyId  = ref(null)
const programs    = ref([]) // populated from store/API

const openCreate = () => { showModal.value = true }

const openEdit = (prog) => {
  ceremonyId.value = prog.id
  showModal.value = true
}

const confirmDelete = (prog) => {
  confirm.show({
    type: 'delete',
    icon: 'ri-delete-bin-5-line',
    title: tr('ceremony.delete_program'),
    message: tr('ceremony.are_you_sure_you_want_to_delete_this_program'),
    actions: [
      { label: tr('common.no'),  action: 'close',  color: 'error', variant: 'outline' },
      { label: tr('common.yes'), action: 'submit', color: 'danger' },
    ],
    async onSubmit(close, submit) {
      submit()
      await onDelete(prog.id)
      close()
    },
  })
}

// CeremonyCreateModal emits `saved` after its event and schedule requests
// complete. Creation is finished at that point, so return to the dashboard
// instead of leaving the user on the setup screen.
const onSaved = async () => {
  await navigateTo('/', { replace: true })
}
</script>

<style lang="scss" scoped>
.ceremony-page { padding: 28px 32px; min-height: 100vh; }

.programs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.program-card {
  .prog-card-head {
    display: flex; align-items: center; justify-content: space-between;
    .prog-type-badge {
      display: flex; align-items: center; gap: 8px;
      font-size: 0.8rem; font-weight: 600; color: var(--c-accent);
      .prog-icon-img { width: 24px; height: 24px; object-fit: contain; }
    }
    .prog-actions { display: flex; gap: 4px; }
  }
  .prog-card-body {
    h3 { font-size: 1rem; font-weight: 600; margin-bottom: 8px; }
    .prog-meta { display: flex; flex-direction: column; gap: 4px; font-size: 0.8rem; color: var(--c-muted); }
    .prog-schedule-count { margin-top: 10px; font-size: 0.78rem; color: var(--c-info); display: flex; align-items: center; gap: 4px; }
  }
}
</style>
