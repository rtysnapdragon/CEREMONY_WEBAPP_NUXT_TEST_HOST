<template>
  <RWrapperPage class="trs-page">
    <!-- Toolbar -->
    <div class="trs-toolbar animate-fade-up">
      <!-- Search -->
      <div class="trs-search">
        <RInputSearch
          v-model="search"
          placeholder="Search keys or values…"
          @search="(v) => (search = v)"
        />
      </div>

      <!-- Feature filter (dropdown) -->
      <div ref="filterDropdownRef" class="trs-filter-dropdown">
        <button
          class="trs-chip trs-filter-trigger"
          :class="{ active: !!featureFilter }"
          @click="filterOpen = !filterOpen"
        >
          <i class="ri-filter-3-line" />
          {{ featureFilter || "All features" }}
          <i class="ri-arrow-down-s-line" :class="{ 'trs-rot': filterOpen }" />
        </button>
        <div v-if="filterOpen" class="trs-filter-panel">
          <button
            v-for="f in FEATURES"
            :key="f ?? 'all'"
            class="trs-chip"
            :class="{ active: featureFilter === f }"
            @click="selectFeatureFilter(f)"
          >
            {{ f || "all" }}
          </button>
        </div>
      </div>

      <!-- Language columns selector -->
      <div class="trs-lang-selector">
        <span class="trs-label">Columns:</span>
        <button
          v-for="lang in availableLangs"
          :key="lang.code"
          class="trs-chip"
          :class="{ active: visibleLangs.includes(lang.code) }"
          @click="toggleVisibleLang(lang.code)"
        >
          {{ lang.code }}
        </button>
      </div>

      <!-- Add key -->
      <button class="btn-ghost btn-sm" @click="showAddModal = true">
        <i class="ri-add-line" /> Add key
      </button>

      <!-- AI Translate all missing -->
      <button
        class="btn-primary btn-sm"
        :disabled="aiRunning || !missingCount"
        @click="aiTranslateMissing"
      >
        <i
          :class="
            aiRunning ? 'ri-loader-4-line animate-spin' : 'ri-sparkling-line'
          "
        />
        {{
          aiRunning
            ? `Translating ${aiDone}/${aiTotal}…`
            : `AI Fill Missing (${missingCount})`
        }}
      </button>
    </div>

    <!-- Drop Zone -->
    <div
      class="trs-dropzone animate-fade-up"
      :class="{
        'trs-dropzone--over': isDragOver,
        'trs-dropzone--importing': importing,
      }"
      @dragenter.prevent="isDragOver = true"
      @dragover.prevent="isDragOver = true"
      @dragleave.prevent="isDragOver = false"
      @drop.prevent="onFileDrop"
      @click="dropFileInput?.click()"
    >
      <input
        ref="dropFileInput"
        type="file"
        accept=".json,application/json"
        class="trs-drop-input"
        @change="onFileSelect"
      />
      <i
        :class="
          importing ? 'ri-loader-4-line animate-spin' : 'ri-file-upload-line'
        "
        class="trs-drop-icon"
      />
      <div class="trs-drop-text">
        <span v-if="importing">{{ importProgress }}</span>
        <span v-else>
          Drop a <strong>translations JSON file</strong> here, or
          <u>click to browse</u>
        </span>
      </div>
      <div class="trs-drop-hint">
        Format:
        <code>[{"translationKey":"…","languageCode":"en","value":"…"}]</code>
      </div>
    </div>

    <!-- Table -->
    <div
      ref="scrollRef"
      class="glass-card trs-table-wrap animate-fade-up delay-1"
    >
      <div v-if="translationStore.allLoading" class="trs-loading">
        <i class="ri-loader-4-line animate-spin" /> Loading translations…
      </div>
      <div v-else-if="!filtered.length" class="trs-empty">
        <i class="ri-translate-2" />
        <p>No translation keys found. Add one or run AI Translate.</p>
      </div>
      <template v-else>
        <table class="trs-table">
          <thead>
            <tr>
              <th style="width: 200px">Key</th>
              <th style="width: 90px">Feature</th>
              <th v-for="code in visibleLangs" :key="code" class="trs-lang-col">
                {{ availableLangs.find((l) => l.code === code)?.name ?? code }}
                <span class="trs-lang-code">{{ code }}</span>
              </th>
              <th style="width: 80px"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in paginated"
              :key="row.key"
              :class="{ 'trs-row-missing': hasMissing(row) }"
            >
              <!-- Key (never translated) -->
              <td class="trs-key-cell">
                <span class="trs-key">{{ row.key }}</span>
              </td>
              <td class="trs-feature-cell">
                <span v-if="row.feature" class="trs-feature-badge">{{
                  row.feature
                }}</span>
              </td>

              <!-- Value per language — inline editable -->
              <td
                v-for="lang in visibleLangs"
                :key="lang"
                class="trs-value-cell"
              >
                <div class="trs-value-wrap">
                  <textarea
                    v-if="
                      editingCell?.key === row.key && editingCell?.lang === lang
                    "
                    v-model="editingValue"
                    class="input trs-value-input"
                    rows="2"
                    autofocus
                    @blur="saveEdit(row, lang)"
                    @keydown.enter.ctrl="saveEdit(row, lang)"
                    @keydown.escape="editingCell = null"
                  />
                  <span
                    v-else
                    class="trs-value-text"
                    :class="{ missing: !row.langs[lang] }"
                    @click="startEdit(row, lang)"
                  >
                    {{ row.langs[lang] || "— click to add —" }}
                  </span>
                  <button
                    v-if="!row.langs[lang] && !aiRunning"
                    class="trs-ai-btn"
                    title="AI translate this cell"
                    @click="aiTranslateCell(row, lang)"
                  >
                    <i class="ri-sparkling-line" />
                  </button>
                </div>
              </td>

              <!-- Actions -->
              <td class="trs-actions-cell">
                <div class="trs-actions">
                  <button
                    class="btn-icon btn-xs-icon"
                    title="AI translate all missing langs"
                    @click="aiTranslateRow(row)"
                  >
                    <i class="ri-sparkling-2-line" />
                  </button>
                  <button
                    class="btn-icon btn-xs-icon danger"
                    title="Delete key"
                    @click="confirmDeleteKey(row.key)"
                  >
                    <i class="ri-delete-bin-line" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Infinite scroll sentinel -->
        <div v-if="hasMore" ref="sentinel" class="trs-scroll-sentinel">
          <i class="ri-loader-4-line animate-spin" />
          Loading more… ({{ paginated.length }} / {{ filtered.length }})
        </div>
        <div v-else class="trs-scroll-end">
          {{ paginated.length }} of {{ filtered.length }} keys
        </div>
      </template>
    </div>

    <!-- Add Key Drawer -->
    <RDrawer
      v-model:open="showAddModal"
      title="Add Translation Key"
      icon="ri-translate-2"
      width-desktop="520px"
      width-tablet="92vw"
      @close="closeAddModal"
    >
      <template #body>
        <!-- Step 1 -->
        <div v-if="addStep === 1" class="drawer-form">
          <div class="trs-step-badge">
            Step 1 of 2 — Define key &amp; source value
          </div>
          <div class="form-group">
            <label class="input-label"
              >Key <span class="required-star">*</span></label
            >
            <RInput
              v-model="addForm.key"
              placeholder="e.g. ceremony.welcome.title"
              leading-icon="ri-key-line"
            />
            <p class="trs-hint">
              Key is <strong>never translated</strong> — it's your identifier.
            </p>
          </div>
          <div class="form-group">
            <label class="input-label">Feature</label>
            <select v-model="addForm.feature" class="input">
              <option value="">— none —</option>
              <option v-for="f in featureOptions" :key="f" :value="f">
                {{ f }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label class="input-label"
              >Source language <span class="required-star">*</span></label
            >
            <select v-model="addForm.sourceLang" class="input">
              <option v-for="l in availableLangs" :key="l.code" :value="l.code">
                {{ l.name }} ({{ l.code }})
              </option>
            </select>
          </div>
          <div class="form-group">
            <label class="input-label"
              >Source value <span class="required-star">*</span></label
            >
            <RInput
              v-model="addForm.sourceValue"
              type="textarea"
              :rows="3"
              :placeholder="`Enter text in ${addForm.sourceLang}…`"
            />
          </div>
        </div>

        <!-- Step 2 -->
        <div v-else-if="addStep === 2" class="drawer-form">
          <div class="trs-step-badge">Step 2 of 2 — Review &amp; save</div>
          <div v-if="addTranslating" class="trs-ai-progress">
            <i class="ri-loader-4-line animate-spin" />
            <span>Translating into {{ availableLangs.length }} languages…</span>
          </div>
          <template v-else>
            <div class="trs-key-preview">
              <span class="trs-key">{{ addForm.key }}</span>
              <span v-if="addForm.feature" class="trs-feature-badge">{{
                addForm.feature
              }}</span>
            </div>
            <div class="trs-result-list">
              <div
                v-for="(val, code) in addForm.results"
                :key="code"
                class="trs-result-row"
              >
                <span class="trs-result-lang">{{ code }}</span>
                <RInput
                  v-model="addForm.results[code]"
                  type="textarea"
                  :rows="2"
                />
              </div>
            </div>
          </template>
        </div>
      </template>

      <template #footer>
        <div class="drawer-footer-btns">
          <template v-if="addStep === 1">
            <button class="btn-ghost" @click="closeAddModal">Cancel</button>
            <button
              class="btn-primary"
              :disabled="!addForm.key.trim() || !addForm.sourceValue.trim()"
              @click="runAddTranslate"
            >
              <i class="ri-sparkling-line" /> AI Translate All Languages
            </button>
          </template>
          <template v-else>
            <button class="btn-ghost" @click="addStep = 1">← Back</button>
            <button
              class="btn-primary"
              :disabled="addSaving"
              @click="saveAddResults"
            >
              <i
                :class="
                  addSaving ? 'ri-loader-4-line animate-spin' : 'ri-save-line'
                "
              />
              {{ addSaving ? "Saving…" : "Save All" }}
            </button>
          </template>
        </div>
      </template>
    </RDrawer>
  </RWrapperPage>
</template>

<script setup>
definePageMeta({
  layout: "navbar",
  middleware: ["auth"],
  title: "Translations",
});

const translationStore = useTranslationStore();
const langStore = useLanguageStore();
const aiStore = useAIStore();
const toast = useToastStore();
const confirmStore = useConfirmStore();

const PAGE_SIZE = 20;

// ── Filters ──────────────────────────────────────────────────────────────────
const search = ref("");
const featureFilter = ref(null);

// Feature filter dropdown open/close
const filterOpen = ref(false);
const filterDropdownRef = ref(null);

const selectFeatureFilter = (f) => {
  featureFilter.value = featureFilter.value === f ? null : f;
  filterOpen.value = false;
};

const onDocClick = (e) => {
  if (
    filterOpen.value &&
    filterDropdownRef.value &&
    !filterDropdownRef.value.contains(e.target)
  ) {
    filterOpen.value = false;
  }
};

// ── Language columns ─────────────────────────────────────────────────────────
const availableLangs = computed(() => langStore.activeItems);
const visibleLangs = ref([]);

// Keep visibleLangs in sync when langStore loads or changes
watch(
  availableLangs,
  (langs) => {
    if (!langs.length) return;
    // Add any newly active language that isn't already tracked
    langs.forEach((l) => {
      if (!visibleLangs.value.includes(l.code)) visibleLangs.value.push(l.code);
    });
    // Remove any code that's no longer active
    visibleLangs.value = visibleLangs.value.filter((c) =>
      langs.some((l) => l.code === c),
    );
    // Cap to first 4 on initial load
    if (visibleLangs.value.length > 4)
      visibleLangs.value = visibleLangs.value.slice(0, 4);
  },
  { immediate: true },
);

const toggleVisibleLang = (code) => {
  const idx = visibleLangs.value.indexOf(code);
  if (idx !== -1) {
    if (visibleLangs.value.length > 1) visibleLangs.value.splice(idx, 1);
  } else visibleLangs.value.push(code);
};

// The default language (fallback for source detection)
const defaultLangCode = computed(
  () =>
    langStore.activeItems.find((l) => l.isDefault)?.code ??
    langStore.activeItems[0]?.code ??
    "en",
);

// ── Data ─────────────────────────────────────────────────────────────────────
const grouped = computed(() => translationStore.grouped);

// Dynamic feature chips — derived from actual data, never hardcoded
const FEATURES = computed(() => [
  null,
  ...[...new Set(grouped.value.map((r) => r.feature).filter(Boolean))].sort(),
]);

// Feature options for the Add Key drawer select
const featureOptions = computed(() =>
  [...new Set(grouped.value.map((r) => r.feature).filter(Boolean))].sort(),
);

const filtered = computed(() => {
  let list = grouped.value;
  if (featureFilter.value)
    list = list.filter((r) => r.feature === featureFilter.value);
  if (search.value.trim()) {
    const q = search.value.toLowerCase();
    list = list.filter(
      (r) =>
        r.key.toLowerCase().includes(q) ||
        Object.values(r.langs).some((v) => v?.toLowerCase().includes(q)),
    );
  }
  return list;
});

// ── Infinite scroll ──────────────────────────────────────────────────────────
const visibleCount = ref(PAGE_SIZE);
const paginated = computed(() => filtered.value.slice(0, visibleCount.value));
const hasMore = computed(() => visibleCount.value < filtered.value.length);
const sentinel = ref(null);
const scrollRef = ref(null); // the scrollable table container
let scrollObserver = null;

const rearmObserver = () => {
  // observe() always delivers a fresh initial notification, so if the
  // sentinel is still on screen after rendering, loadMore runs again.
  if (sentinel.value && scrollObserver) {
    scrollObserver.unobserve(sentinel.value);
    scrollObserver.observe(sentinel.value);
  }
};

const loadMore = () => {
  if (!hasMore.value) return;
  visibleCount.value = Math.min(
    visibleCount.value + PAGE_SIZE,
    filtered.value.length,
  );
  nextTick(rearmObserver);
};

// Reset when filters change
watch([search, featureFilter], () => {
  visibleCount.value = PAGE_SIZE;
  nextTick(rearmObserver);
});

// Sentinel is created/destroyed by v-if, so follow it
watch(sentinel, (el, oldEl) => {
  if (!scrollObserver) return;
  if (oldEl) scrollObserver.unobserve(oldEl);
  if (el) scrollObserver.observe(el);
});

// A row has missing values across ALL active languages (not just visible columns)
const hasMissing = (row) =>
  availableLangs.value.some((l) => !row.langs[l.code]);

const missingCount = computed(() =>
  filtered.value.reduce(
    (n, row) =>
      n + availableLangs.value.filter((l) => !row.langs[l.code]).length,
    0,
  ),
);

// ── Inline edit ───────────────────────────────────────────────────────────────
const editingCell = ref(null);
const editingValue = ref("");

const startEdit = (row, lang) => {
  editingCell.value = { key: row.key, lang };
  editingValue.value = row.langs[lang] ?? "";
};

const saveEdit = async (row, lang) => {
  if (editingCell.value?.key !== row.key || editingCell.value?.lang !== lang)
    return;
  editingCell.value = null;
  const val = editingValue.value.trim();
  if (!val) return;
  await translationStore.upsert(row.key, lang, val, {
    feature: row.feature,
    referenceId: row.referenceId,
    field: row.field,
  });
};

// ── AI translate helpers ──────────────────────────────────────────────────────
const aiRunning = ref(false);
const aiDone = ref(0);
const aiTotal = ref(0);

// Pick the best source language for a row:
// prefer the default language, then any lang that has a value
const pickSourceLang = (row) => {
  if (row.langs[defaultLangCode.value]) return defaultLangCode.value;
  return availableLangs.value.find((l) => row.langs[l.code])?.code ?? null;
};

// Translate a single cell — target is one specific lang, source is best available
const aiTranslateCell = async (row, targetLang) => {
  const sourceLang = pickSourceLang(row);
  if (!sourceLang) {
    toast.add("No source value to translate from", "Error");
    return;
  }
  const langObj = availableLangs.value.find((l) => l.code === targetLang) ?? {
    code: targetLang,
    name: targetLang,
  };
  const result = await translationStore.aiTranslate(
    { [row.key]: row.langs[sourceLang] },
    [langObj],
    { feature: row.feature, referenceId: row.referenceId },
  );
  const langMap = result?.[row.key];
  if (langMap?.[targetLang]) {
    await translationStore.upsert(row.key, targetLang, langMap[targetLang], {
      feature: row.feature,
      referenceId: row.referenceId,
    });
    toast.add(`Translated to ${targetLang}`, "Done");
  } else toast.add("AI returned no translation", "Error");
};

// Translate all missing langs for a single row (across ALL active languages)
const aiTranslateRow = async (row) => {
  const sourceLang = pickSourceLang(row);
  if (!sourceLang) {
    toast.add("No source value to translate from", "Error");
    return;
  }
  const missing = availableLangs.value.filter(
    (l) => !row.langs[l.code] && l.code !== sourceLang,
  );
  if (!missing.length) {
    toast.add("All languages already filled", "Skip");
    return;
  }
  const result = await translationStore.aiTranslate(
    { [row.key]: row.langs[sourceLang] },
    missing,
    { feature: row.feature, referenceId: row.referenceId },
  );
  const langMap = result?.[row.key];
  if (langMap && Object.keys(langMap).length) {
    for (const [lang, val] of Object.entries(langMap)) {
      await translationStore.upsert(row.key, lang, val, {
        feature: row.feature,
        referenceId: row.referenceId,
      });
    }
    toast.add(
      `Row "${row.key}" translated in ${Object.keys(langMap).length} languages`,
      "Done",
    );
  } else toast.add("AI returned no translation", "Error");
};

// AI fill ALL missing cells across all filtered rows
const aiTranslateMissing = async () => {
  const rows = filtered.value.filter((r) => hasMissing(r));
  if (!rows.length) return;
  aiRunning.value = true;
  aiDone.value = 0;
  aiTotal.value = rows.length;

  try {
    for (const row of rows) {
      const sourceLang = pickSourceLang(row);
      if (!sourceLang) {
        aiDone.value++;
        continue;
      }
      const missing = availableLangs.value.filter(
        (l) => !row.langs[l.code] && l.code !== sourceLang,
      );
      if (!missing.length) {
        aiDone.value++;
        continue;
      }
      const result = await translationStore.aiTranslate(
        { [row.key]: row.langs[sourceLang] },
        missing,
        { feature: row.feature, referenceId: row.referenceId },
      );
      // Save the translations (previously they were fetched but never stored)
      const langMap = result?.[row.key];
      if (langMap) {
        for (const [lang, val] of Object.entries(langMap)) {
          if (!val?.trim()) continue;
          await translationStore.upsert(row.key, lang, val, {
            feature: row.feature,
            referenceId: row.referenceId,
          });
        }
      }
      aiDone.value++;
      await new Promise((r) => setTimeout(r, 300));
    }
    toast.add(`AI filled ${aiDone.value} rows`, "Done");
  } finally {
    aiRunning.value = false;
  }
};

// ── Add Key (2-step: enter key+source → AI translate all → review → save) ────
const showAddModal = ref(false);
const addStep = ref(1);
const addTranslating = ref(false);
const addSaving = ref(false);
const addForm = reactive({
  key: "",
  feature: "",
  sourceLang: "",
  sourceValue: "",
  results: {}, // { langCode: translatedValue }
});

const closeAddModal = () => {
  showAddModal.value = false;
  addStep.value = 1;
};

watch(showAddModal, (v) => {
  if (v) {
    addStep.value = 1;
    addForm.key = "";
    addForm.feature = "";
    addForm.sourceLang = defaultLangCode.value;
    addForm.sourceValue = "";
    addForm.results = {};
  }
});

// Step 1 → 2: AI translate source value into ALL active languages
const runAddTranslate = async () => {
  addStep.value = 2;
  addTranslating.value = true;

  // Pre-fill source lang immediately
  addForm.results = { [addForm.sourceLang]: addForm.sourceValue };

  const targetLangs = availableLangs.value.filter(
    (l) => l.code !== addForm.sourceLang,
  );

  try {
    const result = await translationStore.aiTranslate(
      { [addForm.key]: addForm.sourceValue },
      targetLangs,
      { feature: addForm.feature || null },
    );
    if (result?.[addForm.key]) {
      // Merge: keep source, add all translated values
      addForm.results = {
        [addForm.sourceLang]: addForm.sourceValue,
        ...result[addForm.key],
      };
    } else {
      toast.add(aiStore.error ?? "AI translate failed", "Error");
    }
  } finally {
    addTranslating.value = false;
  }
};

// Step 2: save all results to DB
const saveAddResults = async () => {
  addSaving.value = true;
  try {
    for (const [lang, val] of Object.entries(addForm.results)) {
      if (val?.trim()) {
        await translationStore.upsert(addForm.key.trim(), lang, val.trim(), {
          feature: addForm.feature || null,
        });
      }
    }
    toast.add(
      `"${addForm.key}" saved in ${Object.keys(addForm.results).length} languages`,
      "Saved",
    );
    closeAddModal();
  } finally {
    addSaving.value = false;
  }
};

// ── Delete ────────────────────────────────────────────────────────────────────
const confirmDeleteKey = (key) => {
  confirmStore.show({
    type: "delete",
    title: "Delete Key",
    message: `Delete key "${key}" and all its language values? This cannot be undone.`,
    onConfirm: async () => {
      const ok = await translationStore.deleteByKey(key);
      if (ok) toast.add("Key deleted", "Deleted");
      else toast.add("Failed to delete", "Error");
    },
  });
};

// ── Seed Import ──────────────────────────────────────────────────────────────
const importing = ref(false);
const importProgress = ref("");
const isDragOver = ref(false);
const dropFileInput = ref(null);

const runImport = async (entries) => {
  if (!Array.isArray(entries) || !entries.length) {
    toast.add(
      "File is empty or not a valid translations array.",
      "Invalid File",
    );
    return;
  }
  // Validate shape of first entry
  const sample = entries[0];
  if (!sample.translationKey || !sample.languageCode || !("value" in sample)) {
    toast.add(
      "Expected [{translationKey, languageCode, value}] format.",
      "Invalid Format",
    );
    return;
  }
  importing.value = true;
  importProgress.value = `Importing ${entries.length} entries…`;
  try {
    const { seeded, skipped } = await translationStore.importSeed(entries);
    if (seeded > 0) {
      toast.add(
        `Seeded ${seeded} new entries, skipped ${skipped} existing.`,
        "Import Complete",
      );
    } else {
      toast.add(
        `All ${skipped} entries already exist — nothing to import.`,
        "Already Up to Date",
      );
    }
  } catch (e) {
    toast.add("Import failed. Check console for details.", "Error");
  } finally {
    importing.value = false;
    importProgress.value = "";
  }
};

const runImportSeed = async () => {
  importing.value = true;
  importProgress.value = "Loading built-in seed…";
  try {
    const { default: seedData } = await import("~/../translations-seed.json");
    await runImport(seedData);
  } catch (e) {
    toast.add("Failed to load built-in seed file.", "Import Error");
    importing.value = false;
    importProgress.value = "";
  }
};

const readFileAsJson = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        resolve(JSON.parse(e.target.result));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    };
    reader.onerror = () => reject(new Error("File read error"));
    reader.readAsText(file);
  });

const onFileDrop = async (e) => {
  isDragOver.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (!file) return;
  if (!file.name.endsWith(".json") && file.type !== "application/json") {
    toast.add("Only .json files are supported.", "Wrong File Type");
    return;
  }
  try {
    const entries = await readFileAsJson(file);
    await runImport(entries);
  } catch (e) {
    toast.add(e.message || "Could not read file.", "File Error");
  }
};

const onFileSelect = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const entries = await readFileAsJson(file);
    await runImport(entries);
  } catch (err) {
    toast.add(err.message || "Could not read file.", "File Error");
  } finally {
    e.target.value = ""; // reset so same file can be re-selected
  }
};

// ── Init ─────────────────────────────────────────────────────────────────────
onMounted(async () => {
  document.addEventListener("click", onDocClick);

  scrollObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) loadMore();
    },
    { root: scrollRef.value, rootMargin: "300px" },
  );
  if (sentinel.value) scrollObserver.observe(sentinel.value);

  // Fetch languages first — visibleLangs watcher fires automatically once loaded
  if (!langStore.items.length) await langStore.fetchLanguages();
  await translationStore.fetchAll();
});

onUnmounted(() => {
  document.removeEventListener("click", onDocClick);
  scrollObserver?.disconnect();
  scrollObserver = null;
});
</script>

<style lang="scss">
.trs-page {
  display: flex;
  flex-direction: column;
  gap: var(--sp-5);
}
.trs-header-actions {
  display: flex;
  gap: var(--sp-3);
}

/* Toolbar */
.trs-toolbar {
  padding: var(--sp-4) var(--sp-5);
  display: flex;
  align-items: center;
  gap: var(--sp-4);
  flex-wrap: wrap;
}

/* Drop zone */
.trs-dropzone {
  border: 2px dashed var(--c-border);
  border-radius: var(--r-lg);
  padding: var(--sp-5) var(--sp-6);
  display: flex;
  align-items: center;
  gap: var(--sp-4);
  cursor: pointer;
  transition:
    border-color 0.15s,
    background 0.15s;
  background: transparent;
  &:hover {
    border-color: var(--c-accent);
    background: rgba(var(--c-accent-rgb, 99, 102, 241), 0.04);
  }
  &.trs-dropzone--over {
    border-color: var(--c-accent);
    background: rgba(var(--c-accent-rgb, 99, 102, 241), 0.08);
    .trs-drop-icon {
      color: var(--c-accent);
      transform: scale(1.15);
    }
  }
  &.trs-dropzone--importing {
    pointer-events: none;
    opacity: 0.7;
  }
}
.trs-drop-input {
  display: none;
}
.trs-drop-icon {
  font-size: 1.6rem;
  color: var(--c-muted);
  flex-shrink: 0;
  transition:
    color 0.15s,
    transform 0.15s;
}
.trs-drop-text {
  font-size: 0.875rem;
  color: var(--c-text);
  u {
    color: var(--c-accent);
    text-decoration: underline;
  }
}
.trs-drop-hint {
  margin-left: auto;
  font-size: 0.72rem;
  color: var(--c-muted);
  code {
    background: var(--c-surface);
    padding: 2px 6px;
    border-radius: 4px;
  }
}

.trs-search {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  flex: 1;
  min-width: 200px;
  i {
    color: var(--c-muted);
    flex-shrink: 0;
  }
  input {
    flex: 1;
  }
}

/* Feature filter dropdown */
.trs-filter-dropdown {
  position: relative;
}
.trs-filter-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  text-transform: none;
  letter-spacing: 0;
  i {
    font-size: 0.9rem;
  }
  .trs-rot {
    transform: rotate(180deg);
  }
}
.trs-filter-panel {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 20;
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
  max-width: 320px;
  padding: var(--sp-3);
  border-radius: var(--r-md);
  border: 1px solid var(--c-border);
  background: var(--c-surface);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}

.trs-lang-selector {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
  align-items: center;
}

.trs-label {
  font-size: 0.75rem;
  color: var(--c-muted);
  font-weight: 600;
  white-space: nowrap;
}

.trs-chip {
  padding: 3px 10px;
  border-radius: var(--r-full);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--c-border);
  background: transparent;
  color: var(--c-muted);
  transition: all var(--t-fast);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  &:hover {
    border-color: var(--c-accent);
    color: var(--c-text);
  }
  &.active {
    border-color: var(--c-accent);
    background: rgba(var(--c-accent-rgb, 139, 92, 246), 0.12);
    color: var(--c-accent);
  }
}

/* Table */
.trs-table-wrap {
  padding: 0;
  /* Only the rows scroll: the wrapper has a fixed max height and the
     sticky <th> stays pinned at the top of it. Adjust 340px to match the
     space taken by your navbar + toolbar + drop zone. */
  max-height: calc(100vh - 340px);
  min-height: 240px;
  overflow-y: auto;
  overflow-x: auto;
}

.trs-loading,
.trs-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: var(--sp-3);
  padding: var(--sp-10);
  color: var(--c-muted);
  i {
    font-size: 2rem;
    opacity: 0.3;
  }
}

.trs-table {
  width: 100%;
  border-collapse: collapse;
  th {
    text-align: left;
    font-size: 0.7rem;
    font-weight: 700;
    color: var(--c-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: var(--sp-3) var(--sp-4);
    border-bottom: 1px solid var(--c-border);
    position: sticky;
    top: 0;
    background: var(--c-surface);
    z-index: 1;
  }
  td {
    padding: var(--sp-2) var(--sp-4);
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    vertical-align: top;
  }
  tr:last-child td {
    border-bottom: none;
  }
  tr:hover td {
    background: rgba(255, 255, 255, 0.02);
  }
  tr.trs-row-missing td:first-child {
    border-left: 2px solid rgba(var(--c-warning-rgb, 245, 158, 11), 0.4);
  }
}

.trs-lang-col {
  min-width: 160px;
}
.trs-lang-code {
  display: block;
  font-size: 0.65rem;
  color: var(--c-muted);
  font-weight: 400;
  font-family: monospace;
}

.trs-key-cell {
  vertical-align: middle;
}

.trs-key {
  font-family: monospace;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--c-accent);
  word-break: break-all;
}

.trs-feature-cell {
  vertical-align: middle;
}

.trs-feature-badge {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: var(--r-full);
  background: rgba(var(--c-accent-rgb, 139, 92, 246), 0.08);
  border: 1px solid rgba(var(--c-accent-rgb, 139, 92, 246), 0.18);
  color: var(--c-accent);
}

.trs-value-cell {
  vertical-align: top;
}

.trs-value-wrap {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-2);
  &:hover .trs-ai-btn {
    opacity: 1;
  }
}

.trs-value-text {
  flex: 1;
  font-size: 0.875rem;
  line-height: 1.5;
  cursor: text;
  min-height: 28px;
  word-break: break-word;
  &.missing {
    color: var(--c-muted);
    font-style: italic;
    font-size: 0.8rem;
  }
}

.trs-value-input {
  flex: 1;
  font-size: 0.875rem;
  min-height: 60px;
  resize: vertical;
}

.trs-ai-btn {
  opacity: 0;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 1px solid rgba(var(--c-accent-rgb, 139, 92, 246), 0.3);
  background: rgba(var(--c-accent-rgb, 139, 92, 246), 0.08);
  border-radius: var(--r-sm);
  cursor: pointer;
  color: var(--c-accent);
  transition: opacity var(--t-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  i {
    font-size: 0.75rem;
  }
  &:hover {
    background: rgba(var(--c-accent-rgb, 139, 92, 246), 0.18);
  }
}

.trs-actions-cell {
  vertical-align: middle;
}
.trs-actions {
  display: flex;
  gap: 4px;
  align-items: center;
  .danger {
    color: var(--c-danger) !important;
  }
}

/* Add modal steps */
.trs-step-badge {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--c-accent);
  padding: var(--sp-2) var(--sp-3);
  background: rgba(var(--c-accent-rgb, 139, 92, 246), 0.08);
  border: 1px solid rgba(var(--c-accent-rgb, 139, 92, 246), 0.15);
  border-radius: var(--r-md);
  margin-bottom: var(--sp-2);
}

.trs-hint {
  font-size: 0.75rem;
  color: var(--c-muted);
  margin-top: 4px;
  strong {
    color: var(--c-text);
  }
}

.trs-ai-progress {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-6);
  color: var(--c-muted);
  justify-content: center;
  i {
    font-size: 1.25rem;
    color: var(--c-accent);
  }
}

.trs-key-preview {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  margin-bottom: var(--sp-3);
  padding: var(--sp-2) var(--sp-3);
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--r-md);
  border: 1px solid var(--c-border);
}

.trs-result-list {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  max-height: 360px;
  overflow-y: auto;
  padding-right: 2px;
}

.trs-result-row {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-3);
}

.trs-result-lang {
  font-family: monospace;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--c-accent);
  background: rgba(var(--c-accent-rgb, 139, 92, 246), 0.1);
  border: 1px solid rgba(var(--c-accent-rgb, 139, 92, 246), 0.2);
  padding: 4px 10px;
  border-radius: var(--r-sm);
  min-width: 42px;
  text-align: center;
  flex-shrink: 0;
  margin-top: 4px;
}

.trs-result-input {
  flex: 1;
  font-size: 0.875rem;
  resize: vertical;
  min-height: 50px;
}

/* Infinite scroll */
.trs-scroll-sentinel,
.trs-scroll-end {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-2);
  padding: var(--sp-4);
  font-size: 0.8rem;
  color: var(--c-muted);
  border-top: 1px solid var(--c-border);
}
.trs-scroll-end {
  font-style: italic;
}
</style>
