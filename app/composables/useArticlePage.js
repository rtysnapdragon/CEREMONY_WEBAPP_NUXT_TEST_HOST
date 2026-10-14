import { z } from 'zod'

// ── Zod schema ───────────────────────────────────────────────────────────────
const articleSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required.')
    .max(500, 'Title must be 500 characters or fewer.'),
  slug: z
    .string()
    .max(255, 'Slug must be 255 characters or fewer.')
    .optional()
    .or(z.literal('')),
  content: z.string().optional().or(z.literal('')),
  excerpt: z
    .string()
    .max(1000, 'Excerpt must be 1000 characters or fewer.')
    .optional()
    .or(z.literal('')),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  coverMediaId: z.string().optional().or(z.literal('')),
  categoryId: z.string().optional().or(z.literal('')),
  tags: z
    .string()
    .max(500, 'Tags must be 500 characters or fewer.')
    .optional()
    .or(z.literal('')),
  imageIds: z.array(z.string()).optional(),
  translations: z.record(z.record(z.string().optional())).optional(),
})

export function useArticlePage() {
  // ── Service layer ──────────────────────────────────────────────────────────
  const articleStore  = useArticleStore()
  const categoryStore = useArticleCategoryStore()
  const mediaStore    = useMediaStore()
  const { tr: tui }  = useTr()

  // ── Lang tabs ──────────────────────────────────────────────────────────────
  const { langStore, langTabItems, activeLangIndex, emptyTranslations, populateTranslations, tr } = useLangTabs()

  const FIELDS = ['title', 'excerpt', 'content']

  // ── Zod form ───────────────────────────────────────────────────────────────
  const blankForm = () => ({
    title:       '',
    slug:        '',
    content:     '',
    excerpt:     '',
    status:      'DRAFT',
    coverMediaId:'',
    categoryId:  '',
    tags:        '',
    imageIds:    [],
    translations: {},
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
  } = useZodForm(articleSchema, blankForm())

  // ── useModalCrud wired to Zod isDirty ─────────────────────────────────────
  const crud = useModalCrud({ dirtyRef: isDirty })

  // ── Media state ────────────────────────────────────────────────────────────
  const showMediaPicker    = ref(false)
  const showImagesPicker   = ref(false)
  const selectedCoverMedia = ref(null)
  const selectedImages     = ref([])
  const coverFileInput     = ref(null)
  const coverUploading     = ref(false)
  const coverUploadPct     = ref(0)
  const imagesFileInput    = ref(null)
  const imagesUploading    = ref(false)
  const imagesUploadDone   = ref(0)
  const imagesUploadTotal  = ref(0)

  // ── Media viewer ───────────────────────────────────────────────────────────
  const viewerOpen  = ref(false)
  const viewerItems = ref([])
  const viewerIndex = ref(0)

  const buildMediaList = (article) => {
    const list = []
    if (article.coverMedia) list.push(article.coverMedia)
    if (article.images?.length) list.push(...article.images)
    return list
  }

  const openViewer = (items, index = 0) => {
    viewerItems.value = items
    viewerIndex.value = index
    viewerOpen.value  = true
  }

  // ── Filter state ───────────────────────────────────────────────────────────
  const filterStatus   = ref('ALL')
  const filterCategory = ref('')

  // ── Computed ───────────────────────────────────────────────────────────────
  const stats = computed(() => [
    { label: tui('common.total'),             value: articleStore.items.length,   icon: 'ri-article-line',     color: 'var(--c-accent)'  },
    { label: tui('article.status.published'), value: articleStore.publishedCount, icon: 'ri-send-plane-line',  color: 'var(--c-success)' },
    { label: tui('article.stats.drafts'),     value: articleStore.draftCount,     icon: 'ri-draft-line',       color: 'var(--c-muted)'   },
    { label: tui('common.categories'),        value: categoryStore.items.length,  icon: 'ri-price-tag-3-line', color: 'var(--c-info)'    },
  ])

  const filteredArticles = computed(() => {
    let items = articleStore.items
    if (filterStatus.value !== 'ALL')  items = items.filter((a) => a.status === filterStatus.value)
    if (filterCategory.value)          items = items.filter((a) => a.categoryId === filterCategory.value)
    return items
  })

  const statusFilters = computed(() => [
    { value: 'ALL',       label: tui('common.all'),               icon: 'ri-list-check'      },
    { value: 'DRAFT',     label: tui('article.status.draft'),     icon: 'ri-draft-line'      },
    { value: 'PUBLISHED', label: tui('article.status.published'), icon: 'ri-send-plane-line' },
    { value: 'ARCHIVED',  label: tui('article.status.archived'),  icon: 'ri-archive-line'    },
  ])

  const statusBadge = (s) =>
    ({ PUBLISHED: 'badge-success', DRAFT: 'badge-muted', ARCHIVED: 'badge-accent' })[s] ?? 'badge-muted'

  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : '—')

  // ── Init ───────────────────────────────────────────────────────────────────
  const init = async () => {
    if (!langStore.items.length) await langStore.fetchLanguages()
    // Seed translation baseline now that languages are loaded
    reset({ ...blankForm(), translations: emptyTranslations(FIELDS) })
    await Promise.all([
      articleStore.fetchArticles(0),
      categoryStore.fetchCategories(),
      mediaStore.fetchMedia(0),
    ])
  }

  // ── Modal handlers ─────────────────────────────────────────────────────────
  const openAdd = () => {
    selectedCoverMedia.value = null
    selectedImages.value     = []
    activeLangIndex.value    = 0
    crud.openAdd(() => reset({ ...blankForm(), translations: emptyTranslations(FIELDS) }))
  }

  const openEdit = (article) => {
    selectedCoverMedia.value = article.coverMedia ?? null
    selectedImages.value     = article.images ? [...article.images] : []
    activeLangIndex.value    = 0
    crud.openEdit(article, (a) => {
      // setInitial sets form AND _initial → isDirty starts false
      setInitial({
        title:        a.title ?? '',
        slug:         a.slug ?? '',
        content:      a.content ?? '',
        excerpt:      a.excerpt ?? '',
        status:       a.status ?? 'PUBLISHED', // eefault select
        // status:       a.status ?? 'DRAFT',
        coverMediaId: a.coverMedia?.id ?? '',
        categoryId:   a.category?.id ?? '',
        tags:         a.tags ?? 'Post',
        imageIds:     a.images ? a.images.map((m) => m.id) : [],
        translations: populateTranslations(a.translations, FIELDS),
      })
    })
  }

  const closeModal = () => {
    crud.closeModal()
    selectedCoverMedia.value = null
    selectedImages.value     = []
    reset({ ...blankForm(), translations: emptyTranslations(FIELDS) })
  }

  // ── Media ──────────────────────────────────────────────────────────────────
  const selectCover = (media) => {
    form.coverMediaId        = media.id
    selectedCoverMedia.value = media
  }

  const toggleImage = (media) => {
    const idx = form.imageIds.indexOf(media.id)
    if (idx === -1) {
      form.imageIds.push(media.id)
      selectedImages.value.push(media)
    } else {
      form.imageIds.splice(idx, 1)
      selectedImages.value.splice(selectedImages.value.findIndex((m) => m.id === media.id), 1)
    }
  }

  const removeImage = (idx) => {
    form.imageIds.splice(idx, 1)
    selectedImages.value.splice(idx, 1)
  }

  const onCoverUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value       = ''
    coverUploading.value = true
    coverUploadPct.value = 0
    const uploaded = await mediaStore.uploadWithProgress(file, '', null, (pct) => { coverUploadPct.value = pct })
    coverUploading.value = false
    if (uploaded) { selectCover(uploaded); useToastStore().success('Image uploaded', 'Done') }
    else useToastStore().error('Upload failed', 'Error')
  }

  const onImagesUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    e.target.value           = ''
    imagesUploading.value    = true
    imagesUploadDone.value   = 0
    imagesUploadTotal.value  = files.length
    for (const file of files) {
      const uploaded = await mediaStore.uploadWithProgress(file, '', null, null)
      if (uploaded) toggleImage(uploaded)
      imagesUploadDone.value++
    }
    imagesUploading.value = false
    useToastStore().success(`${imagesUploadTotal.value} image(s) uploaded`, 'Done')
  }

  // ── CRUD ───────────────────────────────────────────────────────────────────
  const save = async () => {
    if (!validate()) return
    const payload = {
      ...form,
      coverMediaId: form.coverMediaId || null,
      categoryId:   form.categoryId   || null,
      imageIds:     form.imageIds.length ? form.imageIds : null,
    }
    await crud.save(
      () => articleStore.addArticle(payload),
      () => articleStore.updateArticle(crud.editingItem.value.id, payload),
    )
  }

  const publish = async (article) => {
    const result = await articleStore.publishArticle(article.id)
    if (result?.data) useToastStore().success('Article published', 'Published')
    else useToastStore().error(result?.error || 'Failed to publish', 'Error')
  }

  const archive = async (article) => {
    const result = await articleStore.archiveArticle(article.id)
    if (result?.data) useToastStore().success('Article archived', 'Archived')
    else useToastStore().error(result?.error || 'Failed to archive', 'Error')
  }

  const onFilter = (status) => { filterStatus.value = status }

  const confirmDelete = (article) => {
    const confirmStore = useConfirmStore()
    confirmStore.show({
      type:    'delete',
      title:   'Delete Article',
      message: `Delete <strong>${article.title}</strong>? This cannot be undone.`,
      onConfirm: async () => {
        const result = await articleStore.deleteArticle(article.id)
        if (result?.error) throw new Error(result.error)
      },
    })
  }

  // ── Return ─────────────────────────────────────────────────────────────────
  return {
    articleStore, categoryStore, mediaStore, langStore,

    // crud state (showModal, editingItem, saving, deletingItem, deleting, formDirty)
    ...crud,

    // override close
    closeModal,

    // form + Zod validation
    form, errors, isDirty, clearError, resetErrors,

    // lang tabs
    langTabItems, activeLangIndex,

    // media state
    showMediaPicker, showImagesPicker,
    selectedCoverMedia, selectedImages,
    coverFileInput, coverUploading, coverUploadPct,
    imagesFileInput, imagesUploading, imagesUploadDone, imagesUploadTotal,
    viewerOpen, viewerItems, viewerIndex,

    // filter
    filterStatus, filterCategory,

    // computed
    stats, statusFilters, filteredArticles,

    // helpers
    tr, tui, statusBadge, fmtDate,

    // methods
    init, openAdd, openEdit, save,
    selectCover, toggleImage, removeImage,
    onCoverUpload, onImagesUpload,
    buildMediaList, openViewer,
    publish, archive, onFilter,
    confirmDelete,
  }
}
