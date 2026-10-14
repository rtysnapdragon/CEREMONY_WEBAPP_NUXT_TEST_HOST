import { z } from 'zod'

// ── Zod schema ───────────────────────────────────────────────────────────────
const categorySchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required.')
    .max(200, 'Name must be 200 characters or fewer.'),
  slug: z
    .string()
    .max(255, 'Slug must be 255 characters or fewer.')
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .max(2000, 'Description must be 2000 characters or fewer.')
    .optional()
    .or(z.literal('')),
  parentCategoryId: z.string().optional().or(z.literal('')),
  coverMediaId: z.string().optional().or(z.literal('')),
  // translations: { fieldName: { langCode: value } }
  translations: z.record(z.record(z.string().optional())).optional(),
})

export function useArticleCategoryPage() {
  // ── Service layer ──────────────────────────────────────────────────────────
  const categoryStore = useArticleCategoryStore()
  const mediaStore    = useMediaStore()
  const { tBy }       = useSarikaLocale()

  // ── Lang tabs ──────────────────────────────────────────────────────────────
  const { langStore, langTabItems, activeLangIndex, emptyTranslations, populateTranslations, tr } = useLangTabs()

  const FIELDS = ['name', 'description']

  // ── Zod form (owns form state, errors, and isDirty) ───────────────────────
  const blankForm = () => ({
    name:             '',
    slug:             '',
    description:      '',
    parentCategoryId: '',
    coverMediaId:     '',
    translations:     {},   // populated with emptyTranslations() after languages load
  })

  const {
    form,
    errors,
    isDirty,
    validate,
    clearError,
    resetErrors,
    reset,
    setInitial,
  } = useZodForm(categorySchema, blankForm())

  // ── useModalCrud wired to Zod isDirty ─────────────────────────────────────
  // formDirty = computed that reads isDirty.value — blocks overlay-click close when true
  const crud = useModalCrud({ dirtyRef: isDirty })

  // ── Media / cover state ────────────────────────────────────────────────────
  const showMediaPicker    = ref(false)
  const selectedCoverMedia = ref(null)
  const coverFileInput     = ref(null)
  const coverUploading     = ref(false)
  const coverUploadPct     = ref(0)

  // ── Media viewer ───────────────────────────────────────────────────────────
  const viewerOpen  = ref(false)
  const viewerItems = ref([])
  const openViewer  = (media) => { viewerItems.value = [media]; viewerOpen.value = true }

  // ── Computed ───────────────────────────────────────────────────────────────
  const parentOptions = computed(() =>
    categoryStore.items.filter((c) => !crud.editingItem.value || c.id !== crud.editingItem.value.id),
  )

  const apiConfig = computed(() => ({
    url:    '/api/v1/articles/categories/list',
    method: 'POST',
    filter: {},
  }))

  // ── Init ───────────────────────────────────────────────────────────────────
  const init = async () => {
    if (!langStore.items.length) await langStore.fetchLanguages()
    // Now that languages are loaded, seed the translation baseline so isDirty
    // starts false on a fresh add form
    const baseTr = emptyTranslations(FIELDS)
    reset({ ...blankForm(), translations: baseTr })

    await categoryStore.fetchCategories(0)
    mediaStore.fetchMedia(0)
  }

  // ── Modal handlers ─────────────────────────────────────────────────────────
  const openAdd = () => {
    selectedCoverMedia.value = null
    activeLangIndex.value    = 0
    crud.openAdd(() => reset({ ...blankForm(), translations: emptyTranslations(FIELDS) }))
  }

  const openEdit = (cat) => {
    selectedCoverMedia.value = cat.coverMedia ?? null
    activeLangIndex.value    = 0
    crud.openEdit(cat, (c) => {
      // setInitial() sets BOTH form values AND _initial snapshot
      // → isDirty starts false until user changes something
      setInitial({
        name:             c.name ?? '',
        slug:             c.slug ?? '',
        description:      c.description ?? '',
        parentCategoryId: c.parentCategoryId ?? '',
        coverMediaId:     c.coverMedia?.id ?? '',
        translations:     populateTranslations(c.translations, FIELDS),
      })
    })
  }

  const closeModal = () => {
    crud.closeModal()
    selectedCoverMedia.value = null
    // Reset form so isDirty = false for next open
    reset({ ...blankForm(), translations: emptyTranslations(FIELDS) })
  }

  // ── Media ──────────────────────────────────────────────────────────────────
  const selectCover = (media) => {
    form.coverMediaId      = media.id
    selectedCoverMedia.value = media
  }

  const onCoverUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value    = ''
    coverUploading.value = true
    coverUploadPct.value = 0
    const uploaded = await mediaStore.uploadWithProgress(file, '', null, (pct) => {
      coverUploadPct.value = pct
    })
    coverUploading.value = false
    if (uploaded) {
      selectCover(uploaded)
      useToastStore().success('Image uploaded', 'Done')
    } else {
      useToastStore().error('Upload failed', 'Error')
    }
  }

  // ── CRUD ───────────────────────────────────────────────────────────────────
  const save = async () => {
    // Zod validate — populates errors reactive on failure
    if (!validate()) return

    const payload = {
      ...form,
      parentCategoryId: form.parentCategoryId || null,
      coverMediaId:     form.coverMediaId     || null,
    }

    await crud.save(
      () => categoryStore.addCategory(payload),
      () => categoryStore.updateCategory(crud.editingItem.value.id, payload),
    )
  }

  const confirmDelete = (cat) => {
    const confirmStore = useConfirmStore()
    confirmStore.show({
      type: 'delete',
      title: 'Delete Category',
      message: `Delete <strong>${cat.name}</strong>? This will permanently remove all associated data.`,
      onConfirm: async () => {
        const result = await categoryStore.deleteCategory(cat.id)
        if (result?.error) throw new Error(result.error)
      },
    })
  }

  // kept for backward compat — not used when confirmDelete triggers RConfirm
  const doDelete = () => crud.doDelete((cat) => categoryStore.deleteCategory(cat.id))

  // ── Return ─────────────────────────────────────────────────────────────────
  return {
    categoryStore,
    mediaStore,
    langStore,

    // crud state (showModal, editingItem, saving, deletingItem, deleting)
    ...crud,
    // formDirty from crud — pass to :dirty on RDrawer/RModal/RSlider
    // e.g. <RDrawer :dirty="formDirty" />

    // override close (also clears cover + resets form)
    closeModal,

    // form + Zod validation
    form,
    errors,
    isDirty,
    clearError,
    resetErrors,

    // lang tabs
    langTabItems,
    activeLangIndex,

    // media state
    showMediaPicker,
    selectedCoverMedia,
    coverFileInput,
    coverUploading,
    coverUploadPct,
    viewerOpen,
    viewerItems,

    // computed
    parentOptions,
    apiConfig,

    // helpers
    tBy,
    tr,

    // methods
    init,
    openAdd,
    openEdit,
    save,
    selectCover,
    onCoverUpload,
    openViewer,
    confirmDelete,
    doDelete,
  }
}
