<template>
  <RWrapperPage class="cat-page">
    <RPageHeader
      :title="tui('content.article_categories')"
      :subtitle="tui('content.categories')"
    >
      <template #actions>
        <RBtn type="add" icon="add" :label="tui('content.add_category')" @click="openAdd"></RBtn>
      </template>
    </RPageHeader>

    <!-- DataTable -->
    <RContent class="cat-table-card animate-fade-up delay-2">
      <ArticleCategoryTable
        :key="categoryStore.items.length > 0 ? 'loaded' : 'empty'"
        :data="categoryStore.items"
        :loading="categoryStore.loading"
        :columns="tableColumns"
        @edit="openEdit"
        @delete="confirmDelete"
        @view-image="openViewer"
        @reload="categoryStore.fetchCategories(0)"
      />
    </RContent>

    <!-- Add / Edit Drawer — :dirty blocks outside-click close when form is dirty -->
    <RDrawer
      v-model:open="showModal"
      :title="
        editingItem
          ? tui('content.edit_category')
          : tui('content.add_category')
      "
      :icon="editingItem ? 'ri-edit-line' : 'ri-price-tag-3-line'"
      :dirty="formDirty"
      width-desktop="520px"
      width-tablet="420px"
      @close="closeModal"
    >
        <RForm
          id="cat-form"
          class="drawer-form"
          novalidate
          @on-submit="save"
        >
          <RFormGroup :label="`${tui('common.name')}`" required>
            <RInput
              v-model="form.name"
              :placeholder="tui('content.category_name')"
              :error="!!errors.name"
              @on-input="clearError('name')"
            />
            <span v-if="errors.name" class="field-error">{{
              errors.name
            }}</span>
          </RFormGroup>
          <RFormGroup>
            <template #label>
              <label class="input-label"
                >{{ tui('common.slug') }}
                <span class="text-muted" style="font-size: 0.75rem"
                  >({{
                    tui('common.auto_generated')
                  }})</span
                ></label
              >
            </template>
            <RInput
              v-model="form.slug"
              placeholder="my-category"
              leading-icon="ri-link"
            />
          </RFormGroup>
          <RFormGroup :label="tui('content.parent_category')">
            <select v-model="form.parentCategoryId" class="input">
              <option value="">
                {{ tui('content.none_top_level') }}
              </option>
              <option
                v-for="opt in parentOptions"
                :key="opt.id"
                :value="opt.id"
              >
                {{ opt.name }}
              </option>
            </select>
          </RFormGroup>
          <RFormGroup :label="tui('common.description')" :error="errors.description">
            <RInput
              v-model="form.description"
              type="textarea"
              :rows="3"
              :placeholder="
                tui('common.short_description')
              "
              :error="!!errors.description"
              @on-input="clearError('description')"
            />
          </RFormGroup>

          <!-- Cover Image -->
          <RFormGroup :label="tui('content.cover_image')">
            <div class="cover-picker">
              <div v-if="selectedCoverMedia" class="cover-preview">
                <RImage
                  :src="
                    selectedCoverMedia.thumbnailUrl ||
                    selectedCoverMedia.fileUrl
                  "
                  :alt="selectedCoverMedia.altText"
                />
                <button
                  type="button"
                  class="cover-remove"
                  @click="
                    selectedCoverMedia = null;
                    form.coverMediaId = '';
                  "
                >
                  <i class="ri-close-line" />
                </button>
              </div>
              <button
                v-else
                type="button"
                class="cover-select-btn"
                @click="showMediaPicker = true"
              >
                <i class="ri-image-add-line" />
                {{
                  tui('media.select_from_library')
                }}
              </button>
            </div>
          </RFormGroup>

          <!-- Translations -->
          <RFormGroup :label="tui('common.translations')">
            <RTab
              v-model="activeLangIndex"
              :items="langTabItems"
              not-clear-route
            >
              <template
                v-for="lang in langStore.activeItems"
                :key="lang.code"
                #[lang.code]
              >
                <div
                  class="lang-fields"
                  :dir="lang.direction === 'RTL' ? 'rtl' : 'ltr'"
                >
                  <div class="lang-panel-header">
                    <span
                      v-if="lang.flag"
                      :class="`fi fi-${lang.flag.toLowerCase()}`"
                      class="lang-flag-lg"
                    />
                    <span class="lang-panel-name"
                      >{{ lang.name
                      }}<span
                        v-if="lang.nativeName && lang.nativeName !== lang.name"
                        class="lang-native"
                      >
                        · {{ lang.nativeName }}</span
                      ></span
                    >
                  </div>
                  <RInput
                    v-model="form.translations.name[lang.code]"
                    :placeholder="`Name in ${lang.name}`"
                  />
                  <RTextarea v-model="form.translations.description[lang.code]"
                    :rows="3"
                    :placeholder="`Description in ${lang.name}`"
                  />
                </div>
              </template>
            </RTab>
          </RFormGroup>
        </RForm>

        <!-- Media picker — nested drawer -->
        <RDrawer
          v-model:open="showMediaPicker"
          :title="tui('content.select_cover_image')"
          icon="ri-image-line"
          width-desktop="680px"
          width-tablet="92vw"
          nested
        >
            <input
              ref="coverFileInput"
              type="file"
              accept="image/*"
              style="display: none"
              @change="onCoverUpload"
            />
            <div class="picker-upload-bar">
              <button
                class="btn-ghost btn-sm"
                :disabled="coverUploading"
                @click="coverFileInput.click()"
              >
                <i
                  v-if="coverUploading"
                  class="ri-loader-4-line animate-spin"
                /><i v-else class="ri-upload-2-line" />
                {{
                  coverUploading
                    ? `Uploading ${coverUploadPct}%…`
                    : tui('media.upload_from_device')
                }}
              </button>
            </div>
            <div
              v-if="mediaStore.loading"
              class="loading-state"
              style="padding: var(--sp-8)"
            >
              <i class="ri-loader-4-line animate-spin" />
            </div>
            <div v-else class="picker-grid">
              <div
                v-for="m in mediaStore.images"
                :key="m.id"
                class="picker-item"
                :class="{ selected: form.coverMediaId === m.id }"
                @click="selectCover(m)"
              >
                <RImage
                  :src="m.thumbnailUrl || m.fileUrl"
                  :alt="m.altText || m.originalName"
                  loading="lazy"
                />
                <div v-if="form.coverMediaId === m.id" class="picker-check">
                  <i class="ri-checkbox-circle-fill" />
                </div>
              </div>
              <div
                v-if="!mediaStore.images.length"
                class="empty-state"
                style="grid-column: 1/-1; padding: var(--sp-8)"
              >
                <div class="empty-icon"><i class="ri-image-line" /></div>
                <p>
                  {{
                    tui('media.no_images')
                  }}
                </p>
              </div>
            </div>
          <template #footer>
            <RBtn type="cancel" icon="cancel" :label="tui('common.cancel')"  @click="showMediaPicker = false" />
            <RBtn type="save" icon="ri-check-line" :label="tui('common.confirm')" :loading="saving" :disabled="!form.coverMediaId" @click="showMediaPicker = false" />
          </template>
        </RDrawer>

      <template #footer>
        <RBtn type="cancel" icon="cancel" :label="tui('common.cancel')" @click="closeModal" />
        <RBtn type="save" icon="save" :label="tui('common.save')" :loading="saving" :disabled="saving" @click="save" />
      </template>
    </RDrawer>

    <!-- Media Viewer -->
    <MediaViewer v-model="viewerOpen" :items="viewerItems" :index="0" />
  </RWrapperPage>
</template>

<script setup>
definePageMeta({
  layout: "navbar",
  middleware: ["auth", "permission"],
  permission: "VIEW_ARTICLE",
});

const {
  categoryStore,
  mediaStore,
  langStore,
  showModal,
  showMediaPicker,
  editingItem,
  saving,
  formDirty,
  errors,
  selectedCoverMedia,
  coverFileInput,
  coverUploading,
  coverUploadPct,
  activeLangIndex,
  viewerOpen,
  viewerItems,
  langTabItems,
  parentOptions,
  form,
  tBy,
  init,
  clearError,
  openAdd,
  openEdit,
  closeModal,
  selectCover,
  onCoverUpload,
  openViewer,
  save,
  confirmDelete,
} = useArticleCategoryPage();

const { tr: tui } = useTr();

const tableColumns = computed(() => [
  { key: "cover", label: "", width: "56px" },
  { key: "name", label: tui('common.name'), sortable: true },
  { key: "slug", label: tui('common.slug') },
  { key: "parent", label: tui('content.parent_category') },
  { key: "description", label: tui('common.description') },
  { key: "actions", label: "", width: "90px", align: "center" },
]);

onMounted(init);
</script>

<style lang="scss">
.cat-page {
  display: flex;
  flex-direction: column;
  gap: var(--sp-5);
}

.cat-table-card {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-xl);
  overflow: hidden;
}

.cat-name-cell {
  font-weight: 600;
}
.slug-chip {
  font-size: 0.75rem;
  background: rgba(255, 255, 255, 0.06);
  padding: 2px 8px;
  border-radius: var(--r-sm);
  color: var(--c-accent);
  font-family: monospace;
}
.row-actions {
  display: flex;
  gap: var(--sp-2);
}

.cat-thumb-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}
.cat-thumb {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: var(--r-md);
  display: block;
}
.cat-thumb-clickable {
  cursor: zoom-in;
  transition: opacity var(--t-fast);
  &:hover {
    opacity: 0.8;
  }
}
.cat-thumb-placeholder {
  width: 40px;
  height: 40px;
  border-radius: var(--r-md);
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-muted);
  font-size: 1rem;
}

.drawer-form {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
}
.drawer-footer-btns {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--sp-3);
  width: 100%;
}

.cover-preview {
  position: relative;
  display: inline-block;
  img {
    width: 200px;
    height: 112px;
    object-fit: cover;
    border-radius: var(--r-md);
    display: block;
  }
  .cover-remove {
    position: absolute;
    top: 4px;
    right: 4px;
    background: rgba(0, 0, 0, 0.6);
    border: none;
    border-radius: var(--r-full);
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #fff;
    font-size: 0.75rem;
  }
}
.cover-select-btn {
  font-family: var(--font-400) !important;
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-3) var(--sp-5);
  width:100%;
  border: 1px dashed var(--c-border);
  border-radius: var(--r-md);
  background: none;
  color: var(--c-muted);
  cursor: pointer;
  font-size: 0.875rem;
  font-family: inherit;
  transition: all var(--t-fast);
  &:hover {
    border-color: var(--c-accent);
    color: var(--c-accent);
  }
}

.picker-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: var(--sp-3);
}
.picker-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--r-md);
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color var(--t-fast);
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  &.selected {
    border-color: var(--c-accent);
  }
  &:hover {
    border-color: rgba(255, 140, 66, 0.4);
  }
}
.picker-check {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 140, 66, 0.3);
  i {
    font-size: 1.5rem;
    color: var(--c-accent);
  }
}
.picker-upload-bar {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-3) 0 var(--sp-4);
  border-bottom: 1px solid var(--c-border);
  margin-bottom: var(--sp-4);
}

.required-star {
  color: var(--c-danger);
  margin-left: 2px;
}
.field-error {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: var(--c-danger);
  margin-top: 4px;
  &::before {
    content: "⚠";
    font-size: 0.7rem;
  }
}

.lang-fields {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
  padding-top: var(--sp-2);
}
.lang-panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0 10px;
  border-bottom: 1px solid var(--c-border);
  margin-bottom: 4px;
}
.lang-flag-lg {
  width: 1.5rem;
  height: 1.125rem;
  display: inline-block;
  vertical-align: middle;
}
.lang-panel-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--c-text);
}
.lang-native {
  font-weight: 400;
  color: var(--c-muted);
}
.mt-2 {
  margin-top: 8px;
}
</style>
