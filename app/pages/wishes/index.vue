<template>
  <PlanGate feature="wishes" label="Guest wishes are not available on your current plan">
  <RWrapperPage class="wishes-page">
    <RPageHeader title="Wedding Wishes" :subtitle="`${wishStore.items.length} messages from your guests`">
      <template #actions>
        <button class="btn-ghost" @click="wishStore.fetchWishes(0)">
          <i class="ri-refresh-line" /> Refresh
        </button>
      </template>
    </RPageHeader>

    <!-- No wedding -->
    <div v-if="!eventStore.activeEvent" class="glass-card empty-state animate-fade-up">
      <div class="empty-icon"><i class="ri-heart-line" /></div>
      <h3>No wedding selected</h3>
      <p>Select a wedding from the sidebar to view wishes.</p>
    </div>

    <template v-else>
      <div v-if="wishStore.loading && wishStore.items.length === 0" class="loading-state glass-card animate-fade-up">
        <i class="ri-loader-4-line animate-spin" style="font-size:1.5rem;color:var(--c-muted)" />
        <span class="text-muted">Loading wishes...</span>
      </div>

      <div v-else-if="wishStore.items.length === 0" class="glass-card empty-state animate-fade-up">
        <div class="empty-icon"><i class="ri-heart-line" /></div>
        <h3>No wishes yet</h3>
        <p>Wishes submitted by guests will appear here</p>
      </div>

      <div v-else class="wishes-grid animate-fade-up delay-1">
        <div v-for="wish in wishStore.items" :key="wish.id" class="wish-card glass-card">
          <div class="wish-header">
            <div class="wish-avatar">
              {{ (wish.guestName?.[0] ?? '?').toUpperCase() }}
            </div>
            <div class="wish-meta">
              <span class="wish-name">{{ wish.guestName }}</span>
              <span class="wish-date">{{ formatWishDate(wish.createdAt) }}</span>
            </div>
            <button class="btn-icon btn-xs-icon wish-delete" title="Delete" @click="confirmDelete(wish)">
              <i class="ri-delete-bin-line" />
            </button>
          </div>
          <p class="wish-message">{{ wish.message }}</p>
          <div v-if="!wish.isPublic" class="wish-private">
            <i class="ri-eye-off-line" /> Private
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="wishStore.totalPages > 1" class="wish-pagination animate-fade-up delay-2">
        <button class="btn-ghost btn-sm" :disabled="wishStore.page === 0" @click="wishStore.fetchWishes(wishStore.page - 1)">
          <i class="ri-arrow-left-s-line" /> Prev
        </button>
        <span class="text-muted" style="font-size:0.8125rem">{{ wishStore.page + 1 }} / {{ wishStore.totalPages }}</span>
        <button class="btn-ghost btn-sm" :disabled="wishStore.page + 1 >= wishStore.totalPages" @click="wishStore.fetchWishes(wishStore.page + 1)">
          Next <i class="ri-arrow-right-s-line" />
        </button>
      </div>
    </template>

    <!-- Delete confirm -->
    <Teleport to="body">
      <div v-show="deletingItem" class="modal-overlay" @click.self="deletingItem = null">
        <div class="modal-panel glass-card" style="max-width:400px">
          <div class="modal-header">
            <h3>Delete Wish</h3>
            <button class="btn-icon" @click="deletingItem = null"><i class="ri-close-line" /></button>
          </div>
          <p style="margin-bottom:var(--sp-5);color:var(--c-muted)">
            Delete wish from <strong>{{ deletingItem?.guestName }}</strong>? This cannot be undone.
          </p>
          <div class="modal-footer">
            <button class="btn-ghost" @click="deletingItem = null">Cancel</button>
            <button class="btn-primary" style="background:var(--c-danger)" :disabled="deleting" @click="doDelete">
              <i v-if="deleting" class="ri-loader-4-line animate-spin" />
              <i v-else class="ri-delete-bin-line" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </RWrapperPage>
  </PlanGate>
</template>

<script setup>
definePageMeta({ layout: 'navbar', middleware: ['auth', 'permission'], permission: 'VIEW_WEDDING' })
const { wishStore, eventStore, deletingItem, deleting, init, formatWishDate, confirmDelete, doDelete } = useWishPage()
onMounted(init)
</script>

<style lang="scss">
.wishes-page { display: flex; flex-direction: column; gap: var(--sp-5); }

.wishes-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: var(--sp-4);
}

.wish-card { padding: var(--sp-5); display: flex; flex-direction: column; gap: var(--sp-3); }

.wish-header { display: flex; align-items: center; gap: var(--sp-3); }

.wish-avatar {
  width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, rgba(255,140,66,0.2), rgba(255,100,100,0.2));
  color: var(--c-accent); font-size: 0.875rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}

.wish-meta { flex: 1; min-width: 0; }
.wish-name { display: block; font-size: 0.875rem; font-weight: 600; }
.wish-date { font-size: 0.75rem; color: var(--c-muted); }

.wish-delete { opacity: 0; transition: opacity var(--t-fast); }
.wish-card:hover .wish-delete { opacity: 1; }

.wish-message {
  font-size: 0.875rem; color: var(--c-text); line-height: 1.6;
  flex: 1;
  display: -webkit-box; -webkit-line-clamp: 5; -webkit-box-orient: vertical; overflow: hidden;
}

.wish-private {
  display: flex; align-items: center; gap: 5px;
  font-size: 0.75rem; color: var(--c-muted);
  i { font-size: 0.875rem; }
}

.wish-pagination { display: flex; align-items: center; justify-content: center; gap: var(--sp-4); }

.btn-xs-icon { width: 30px !important; height: 30px !important; border-radius: var(--r-sm) !important; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); z-index: 300; display: flex; align-items: center; justify-content: center; padding: var(--sp-4); }
.modal-panel { width: min(520px, 100%); max-height: 90dvh; overflow-y: auto; border-radius: var(--r-2xl); padding: var(--sp-6); }
.modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--sp-6); h3 { font-family: var(--font-700); font-size: 1.125rem; font-weight: 700; } }
.modal-footer { display: flex; justify-content: flex-end; gap: var(--sp-3); padding-top: var(--sp-2); border-top: 1px solid var(--c-border); }
.modal-enter-active, .modal-leave-active { transition: all var(--t-base) var(--ease-out); }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal-panel, .modal-leave-to .modal-panel { transform: scale(0.94) translateY(12px); }

.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--sp-3); padding: var(--sp-12); text-align: center; h3 { font-family: var(--font-700); font-size: 1.125rem; font-weight: 700; } p { font-size: 0.875rem; color: var(--c-muted); max-width: 320px; } }
.empty-icon { font-size: 2.5rem; color: var(--c-muted); opacity: 0.4; }
.loading-state { display: flex; align-items: center; justify-content: center; gap: var(--sp-3); padding: var(--sp-8); }
</style>
