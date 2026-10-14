<template>
  <RWrapperPage class="articles-page">
    <RPageHeader
      :title="tui('content.articles')"
      :subtitle="`${articleStore.publishedCount} ${tui('content.published')} · ${articleStore.draftCount} ${tui('content.draft')}`"
    >
      <template #actions>
        <RBtn type="add" icon="add" :label="tui('content.new_article')"  @click="openAdd" />
      </template>
    </RPageHeader>

    <!-- Stats -->
    <div class="article-stats animate-fade-up delay-1">
      <div v-for="s in stats" :key="s.label" class="stat-pill glass-widget">
        <i :class="s.icon" :style="{ color: s.color }" />
        <span class="sp-value">{{ s.value }}</span>
        <span class="sp-label">{{ s.label }}</span>
      </div>
    </div>

    <!-- DataTable -->
    <RContent claArticleTabless="article-table-card animate-fade-up delay-2">
      <ArticleTable
        :key="`${filterStatus}-${filterCategory}-${articleStore.items.length > 0 ? 'loaded' : 'empty'}`"
        :data="filteredArticles"
        :loading="articleStore.loading"
        :columns="tableColumns"
        @edit="openEdit"
        @delete="confirmDelete"
        @publish="publish"
        @archive="archive"
        @view="openViewer"
        @reload="articleStore.fetchArticles(0)"
      >
        <template #headerLeft>
          <div class="gf-chips">
            <button
              v-for="f in statusFilters"
              :key="f.value"
              class="filter-chip"
              :class="{ active: filterStatus === f.value }"
              @click="onFilter(f.value)"
            >
              <i :class="f.icon" /> {{ f.label }}
            </button>
          </div>
        </template>
        <template #headerRight>
          <!-- <RSelect v-model="filterCategory" :local-data="{data:categoryStore.items.map(item=>{ 
            return{ id: item.id, Name: item.name, NameEnglish: item.nameEnglish || '' }
          })}" pk="id" default-select  style="width: 160px"></RSelect> -->
          <select
            v-model="filterCategory"
            class="input input-sm"
            style="width: 160px"
          >
            <option value="">{{ tui('content.all_categories') }}</option>
            <option v-for="c in categoryStore.items" :key="c.id" :value="c.id">
              {{ c.name }}
            </option>
          </select>
        </template>
      </ArticleTable>
    </RContent>

    <!-- Add / Edit Drawer — :dirty blocks outside-click close when form is dirty -->
    <RDrawer
      v-model:open="showModal"
      :title="
        editingItem
          ? tui('content.edit_article')
          : tui('content.new_article')
      "
      :icon="editingItem ? 'ri-edit-line' : 'ri-article-line'"
      :dirty="formDirty"
      width-desktop="680px"
      width-tablet="92vw"
      @close="closeModal"
    >
        <RForm
          id="article-form"
          class="drawer-form"
          novalidate
          @onSubmit="save"
        >
          <RFormGroup :label="tui('common.title')" :help="errors.title" required>
            <RInput
              v-model="form.title"
              :placeholder="tui('content.article_title')"
              :error="!!errors.title"
              @on-input="clearError('title')"
            />
          </RFormGroup>
          <RFormGroup>
            <template #label>
              <label class="input-label" >{{ tui('common.slug') }}
                <span class="text-muted" style="font-size: 0.75rem"
                  >({{ tui('common.auto_generated')  }})</span
                ></label
              >
            </template>
            <RInput v-model="form.slug" placeholder="eg. my-article-title" leading-icon="ri-link-m" />
          </RFormGroup>
          <RFormGroup :label="tui('content.excerpt')" :help="errors.excerpt">
            <RTextarea
              v-model="form.excerpt"
              :rows="3"
              :placeholder=" tui('content.excerpt_placeholder') "
              :error="!!errors.excerpt"
              @on-input="clearError('excerpt')"
            />
          </RFormGroup>
          <RFormGroup :label="tui('content.content')">
            <RTextarea v-model="form.content" :rows="10" :placeholder=" tui('content.content_placeholder') " />
          </RFormGroup>
          <div class="form-row-2">
            <RFormGroup :label="tui('content.category')">
              <RSelect v-model="form.categoryId" pk="id" default-select :local-data="{data:categoryStore.items}" />
              <!-- <select v-model="form.categoryId" class="input">
                <option value="">{{ tui('common.none') }}</option>
                <option
                  v-for="c in categoryStore.items"
                  :key="c.id"
                  :value="c.id"
                >
                  {{ c.name }}
                </option>
              </select> -->
            </RFormGroup>
            <RFormGroup :label="tui('common.status')">
              <RSelect pk="id" default-select v-model="form.status" :localData="{ data: [ { id:'DRAFT', Name:tui('content.draft'), NameEnglish: tui('content.draft')},
              { id: 'PUBLISHED', Name:tui('content.published'), NameEnglish: tui('content.published')},
              { id: 'ARCHIVED', Name:tui('content.archived'), NameEnglish: tui('content.archived')}]}" />
            </RFormGroup>
          </div>

          <!-- Cover media -->
          <RFormGroup :label="tui('content.cover_image')">
            <div class="cover-picker">
              <div v-if="selectedCoverMedia" class="cover-preview">
                <RImage :src="selectedCoverMedia.thumbnailUrl || selectedCoverMedia.fileUrl " :alt="selectedCoverMedia.altText" />
                <button type="button" class="cover-remove"
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

          <!-- Article Images -->
          <RFormGroup :label="tui('content.article_images')">
            <div class="images-section">
              <div v-if="selectedImages.length" class="images-preview">
                <div
                  v-for="(img, idx) in selectedImages"
                  :key="img.id"
                  class="img-thumb-wrap"
                >
                  <RImage
                    :src="img.thumbnailUrl || img.fileUrl"
                    :alt="img.altText"
                    loading="lazy"
                  />
                  <button
                    type="button"
                    class="img-remove"
                    @click="removeImage(idx)"
                  >
                    <i class="ri-close-line" />
                  </button>
                </div>
                <button
                  type="button"
                  class="img-add-more"
                  @click="showImagesPicker = true"
                >
                  <i class="ri-add-line" />
                </button>
              </div>
              <button
                v-else
                type="button"
                class="cover-select-btn"
                @click="showImagesPicker = true"
              >
                <i class="ri-images-line" />
                {{ tui('content.add_images') }}
              </button>
            </div>
          </RFormGroup>

          <!-- Tags -->
          <RFormGroup :help="errors.tags">
            <template #label>
              <label class="input-label"
                >{{ tui('content.tags') }}
                <span class="text-muted" style="font-size: 0.75rem"
                  >({{ tui('common.comma_separated') }})</span
                ></label
              >
            </template>
              <RInputTags v-model="form.tags" @update:data="(data) => { console.log('Data tags ------> ',data )}" placeholder="Enter tags..." add-on-blur add-on-tab :max="10" />
            <!-- <RInput v-model="form.tags" placeholder="wedding, tips, planning" leading-icon="ri-price-tag-3-line" :error="!!errors.tags" @on-input="clearError('tags')" /> -->
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
                  <RFormGroup>
                    <template #label>
                      <label
                        class="input-label"
                        style="font-size: 0.8rem; color: var(--c-muted)"
                        >{{ tui('common.title') }}</label
                      >
                    </template>
                    <RInput v-model="form.translations.title[lang.code]" :placeholder="`Title in ${lang.name}`" />
                  </RFormGroup>
                  <RFormGroup>
                    <template #label>
                      <label
                        class="input-label"
                        style="font-size: 0.8rem; color: var(--c-muted)"
                        >{{ tui('content.excerpt') }}</label
                      >
                    </template>
                    <RTextarea v-model="form.translations.excerpt[lang.code]" :rows="2" :placeholder="`Excerpt in ${lang.name}`" />
                  </RFormGroup>
                  <RFormGroup>
                    <template #label>
                      <label
                        class="input-label"
                        style="font-size: 0.8rem; color: var(--c-muted)"
                        >{{ tui('content.content') }}</label
                      >
                    </template>
                    <RTextarea v-model="form.translations.content[lang.code]" :rows="4" :placeholder="`Content in ${lang.name}`" />
                  </RFormGroup>
                </div>
              </template>
            </RTab>
          </RFormGroup>
        </RForm>

        <!-- Cover image picker — nested drawer -->
        <RDrawer
          v-model:open="showMediaPicker"
          :title="tui('content.select_cover_image')"
          icon="ri-image-line"
          width-desktop="720px"
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
            <RBtn type="cancel" icon="cancel" :label="tui('common.cancel')" @click="showMediaPicker = false" />
            <RBtn type="primary" icon="check" :label="tui('common.confirm')" @click="showMediaPicker = false" :disabled="!form.coverMediaId" />
          </template>
        </RDrawer>

        <!-- Images multi-picker — nested drawer -->
        <RDrawer
          v-model:open="showImagesPicker"
          :title="tui('content.select_article_images')"
          icon="ri-images-line"
          width-desktop="720px"
          width-tablet="92vw"
          nested
        >
            <input
              ref="imagesFileInput"
              type="file"
              accept="image/*"
              multiple
              style="display: none"
              @change="onImagesUpload"
            />
            <div class="picker-upload-bar">
              <button
                class="btn-ghost btn-sm"
                :disabled="imagesUploading"
                @click="imagesFileInput.click()"
              >
                <i
                  v-if="imagesUploading"
                  class="ri-loader-4-line animate-spin"
                /><i v-else class="ri-upload-2-line" />
                {{
                  imagesUploading
                    ? `Uploading ${imagesUploadDone}/${imagesUploadTotal}…`
                    : tui('media.upload_from_device')
                }}
              </button>
              <span
                v-if="selectedImages.length"
                style="font-size: 0.8125rem; color: var(--c-muted)"
                >{{ selectedImages.length }}
                {{ tui('common.selected') }}</span
              >
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
                :class="{ selected: form.imageIds.includes(m.id) }"
                @click="toggleImage(m)"
              >
                <RImage
                  :src="m.thumbnailUrl || m.fileUrl"
                  :alt="m.altText || m.originalName"
                  loading="lazy"
                />
                <div v-if="form.imageIds.includes(m.id)" class="picker-check">
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
            <RBtn type="cancel" icon="cancel" :label="tui('common.cancel')" @click="showImagesPicker = false" />
            <RBtn type="save" icon="ri-check-line" :label="tui('common.done') + ' ' + selectedImages.length" @click="showImagesPicker = false"/>
          </template>
        </RDrawer>

      <template #footer>
        <RBtn type="cancel" icon="cancel" :label="tui('common.cancel')" @click="closeModal" />
        <RBtn type="save" :icon="saving ? 'ri-loader-4-line' : 'save'" :label="tui('common.save')" :disabled="saving" @click="closeModal" />
      </template>
    </RDrawer>

    <!-- Media Viewer -->
    <MediaViewer
      v-model="viewerOpen"
      :items="viewerItems"
      :index="viewerIndex"
    />
  </RWrapperPage>
</template>

<script setup>
definePageMeta({
  layout: "navbar",
  middleware: ["auth", "permission"],
  permission: "VIEW_ARTICLE",
});

const {
  articleStore,
  categoryStore,
  mediaStore,
  langStore,
  showModal,
  showMediaPicker,
  showImagesPicker,
  editingItem,
  saving,
  formDirty,
  errors,
  selectedCoverMedia,
  selectedImages,
  activeLangIndex,
  coverFileInput,
  coverUploading,
  coverUploadPct,
  imagesFileInput,
  imagesUploading,
  imagesUploadDone,
  imagesUploadTotal,
  viewerOpen,
  viewerItems,
  viewerIndex,
  langTabItems,
  stats,
  statusFilters,
  filterStatus,
  filterCategory,
  filteredArticles,
  form,
  tBy,
  tui,
  init,
  clearError,
  openAdd,
  openEdit,
  closeModal,
  selectCover,
  toggleImage,
  removeImage,
  onCoverUpload,
  onImagesUpload,
  openViewer,
  publish,
  archive,
  onFilter,
  save,
  confirmDelete,
} = useArticlePage();

const tableColumns = computed(() => [
  { key: "cover", label: "", width: "56px" },
  { key: "title", label: tui('common.title'), sortable: true },
  { key: "category", label: tui('content.category') },
  { key: "status", label: tui('common.status') },
  { key: "author", label: tui('common.author') },
  { key: "date", label: tui('common.date') },
  { key: "actions", label: "", width: "110px", align: "center" },
]);

onMounted(init);
</script>

<style lang="scss">
.articles-page {
  display: flex;
  flex-direction: column;
  gap: var(--sp-5);
}

.article-table-card {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-xl);
  overflow: hidden;
}

.article-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--sp-4);
  @media (max-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
}
.stat-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-5);
  border-radius: var(--r-xl);
  text-align: center;
  i {
    font-size: 1.5rem;
  }
  .sp-value {
    font-size: 1.5rem;
    font-weight: 700;
    font-family: var(--font-700);
  }
  .sp-label {
    font-size: 0.75rem;
    color: var(--c-muted);
  }
}

.gf-chips {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  flex-wrap: wrap;
}

/* Table cell styles */
.ac-thumb-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}
.ac-thumb {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: var(--r-md);
  display: block;
  transition: opacity var(--t-fast);
  &:hover {
    opacity: 0.8;
  }
}
.ac-thumb-placeholder {
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
.ac-title-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.ac-title-text {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--c-text);
}
.ac-excerpt-text {
  font-size: 0.75rem;
  color: var(--c-muted);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.ac-img-strip {
  display: flex;
  gap: 4px;
  align-items: center;
  margin-top: 4px;
}
.ac-strip-img {
  width: 32px;
  height: 32px;
  object-fit: cover;
  border-radius: var(--r-sm);
  cursor: zoom-in;
  transition: opacity var(--t-fast);
  &:hover {
    opacity: 0.8;
  }
}
.ac-strip-more {
  width: 32px;
  height: 32px;
  border-radius: var(--r-sm);
  font-size: 0.625rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-muted);
}
.row-actions {
  display: flex;
  gap: var(--sp-2);
}

/* Drawer form */
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

/* Multi-image section */
.images-preview {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
  align-items: flex-start;
}
.img-thumb-wrap {
  position: relative;
  width: 72px;
  height: 72px;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: var(--r-md);
    display: block;
  }
  .img-remove {
    position: absolute;
    top: -6px;
    right: -6px;
    background: var(--c-danger);
    border: none;
    border-radius: var(--r-full);
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #fff;
    font-size: 0.625rem;
    padding: 0;
  }
}
.img-add-more {
  width: 72px;
  height: 72px;
  border: 1px dashed var(--c-border);
  border-radius: var(--r-md);
  background: none;
  color: var(--c-muted);
  cursor: pointer;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--t-fast);
  &:hover {
    border-color: var(--c-accent);
    color: var(--c-accent);
  }
}

/* Cover picker */
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
    font-family: var(--font-400);
  }
}
.cover-select-btn {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-3) var(--sp-5);
  border: 1px dashed var(--c-border);
  border-radius: var(--r-md);
  background: none;
  color: var(--c-muted);
  cursor: pointer;
  font-size: 0.875rem;
  // font-family: inherit;
  font-family: var(--font-400);
  transition: all var(--t-fast);
  &:hover {
    border-color: var(--c-accent);
    color: var(--c-accent);
  }
}

/* Media picker */
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
  gap: var(--sp-3);
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
