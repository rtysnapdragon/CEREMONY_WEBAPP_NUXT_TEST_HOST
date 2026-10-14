
<template>
  <RWrapperPage class="invitation-letter-page">
    <!-- ── Tab bar ───────────────────────────────────────────────────────── -->
    <RTab v-model="activeTab" :default-index="0" :items="[{label:tr('common.preview'),icon:'ri-eye-line',value:0},{label:tr('common.editor'),icon:'ri-edit-2-line',value:1}]" @onChange="tabChange" :isObject="true"/>

    <Transition name="tab-switch" mode="out-in">
      <EditorLetter
        v-if="activeTab === 1"
        key="editor"
        :data="letter"
        :template-prop="selectedTemplate"
        :upload-url="`/api/v1/media/upload`"
        :ready="ready"
        @save="handleSave"
        @go-to-preview="activeTab = 'preview'"
        @template-change="handleSelectTemplate"
      />
    </Transition>

    <Transition name="tab-switch" mode="out-in">
      <PreviewLetter
        v-if="activeTab === 0"
        key="preview"
        :data="letter"
        :template-prop="selectedTemplate"
        @go-to-editor="activeTab = 'editor'"
        @send-all="sendAll"
      />
    </Transition>

    <SendInvitationModal
      v-model="showSendModal"
      :data="letter"
      :invite-base-url="inviteBaseUrl"
      @sent="sendAll"
    />
    <TemplateSelection v-model="showTemplateModal" :data="letter" @select-template="handleSelectTemplate" />
  </RWrapperPage>
</template>

<script setup>
import { buildHtml, downloadLetterHtml } from "~/utils/printLetter";
import { buildSettingPayload, LETTER_TRANSLATIONS } from "~/utils/toSettingPayload";
const { openPreview } = usePrintPreview();
const breadcrumb = useBreadcrumb()
// ── Stores ────────────────────────────────────────────────────────────────
const { tr } = useTr();
const eventStore = useEventStore();
const toast = useToastStore();
const activeEvent = computed(() => eventStore.activeEvent);
const showSendModal = ref(false);
const showTemplateModal = ref(false);

// ── Letter data (shared state) ────────────────────────────────────────────
const { letter, loadFromEvent, loadCeremonies, loadGallery } = useLetterData();
const ready = ref(false);
const activeTab = ref(0)

async function initLetter() {
  ready.value = false;
  const ev = eventStore.activeEvent;
  if (ev?.inviteTemplateId) selectedTemplate.value = ev.inviteTemplateId;
  loadFromEvent(ev);
  await loadCeremonies().catch(() => {});
  await loadGallery().catch(() => {});
  ready.value = true;
}

// ── Tabs ──────────────────────────────────────────────────────────────────
// const activeTab = ref('preview');

const tabs = computed(() => [
  {
    key: "preview",
    label: tr('common.preview'),
    icon: "ri-eye-line",
  },
  {
    key: "editor",
    label: tr('common.editor'),
    icon: "ri-edit-2-line",
  },
]);

function tabChange(data){
  console.log("Data ====> ",data);

}
// ── Template ──────────────────────────────────────────────────────────────
const selectedTemplate = ref('classic');

function handleSelectTemplate(key) {
  selectedTemplate.value = key;
  letter.template = key;
}

// ── Letter ⇄ Wedding settings mapping ─────────────────────────────────────
// Single default-language fields: the same value is written to both lang codes
// so letter content renders regardless of the app locale.
// Key map + payload builder live in `~/utils/toSettingPayload`.

// Couple names also live on the wedding itself — don't overwrite the store field.
const STORE_SKIP = new Set(['groomName', 'brideName']);

// ── Save ──────────────────────────────────────────────────────────────────
async function handleSave(data, options = {}) {
  const ev = eventStore.activeEvent;
  if (!ev?.id) {
    toast.add({ title: tr('letter.save_failed') });
    return;
  }
  const { auto = false } = options || {};
  if (!auto) toast.add({ title: tr('letter.saving_description') });

  try {
    // 1. Build a DTO-shaped payload (filtered keys + normalized dates) so it
    //    matches EventSettingRequest instead of sending the raw letter object.
    const payload = buildSettingPayload(data, ev);
    console.log("Data payload before post api ===========> ", payload)

    const { error } = await useHttp(`/api/v1/events/${ev.id}/settings`, {
      method: 'PUT',
      data: payload,
      isGlobal: true,
    });
    if (error?.value) throw error.value;

    // 2. Reflect the new letter state in the local event store (single fields)
    const t = ev.translations ?? {};
    const letterUpdate = {};
    for (const [key, field] of Object.entries(LETTER_TRANSLATIONS)) {
      const val = String(data?.[field] ?? '');
      if (!val.trim()) continue;
      t[key] = { en: val, km: val };
      if (!STORE_SKIP.has(key)) letterUpdate[key] = val;
    }
    eventStore.updateEvent(ev.id, {
      inviteTemplateId: data.template,
      invitePrimaryColor: data.primaryColor,
      inviteBgColor: data.bgColor,
      inviteMapUrl: data.mapUrl || '',
      inviteContacts: data.contacts || '',
      translations: { ...t },
      ...letterUpdate,
    });

    if (!auto) toast.add(tr('letter.saved', 'Invitation letter saved'), tr('common.success', 'Success'));
  } catch (err) {
    toast.add(err?.message || tr('letter.save_failed', 'Failed to save letter'), tr('common.error', 'Error'));
  }
}

// ── Invite URL ────────────────────────────────────────────────────────────
const inviteBaseUrl = computed(() =>
  typeof window !== "undefined"
    ? `${window.location.origin}/invite/${activeEvent.value?.id ?? "demo"}`
    : "/invite/demo",
);

/** Copy invite link to clipboard */
async function handleCopyLink() {
  if (!import.meta.client) return;
  await navigator.clipboard.writeText(inviteBaseUrl.value).catch(() => {});
  toast.add(tr('common.link_copied'), tr('common.success'));
}

/** Print ONLY the letter — no page chrome */
const printLetter = () => {
  openPreview(buildHtml(letter));
};

/** Download standalone HTML */
function handleDownload() {
  downloadLetterHtml(
    letter,
    `invitation-${activeEvent.value?.id ?? "letter"}.html`,
  );
  toast.add(
    tr('letter.downloaded_description', 'Letter downloaded'),
    tr('common.downloaded'),
  );
}

const sendAll = () => {
  showSendModal.value = true;
};

usePageBreadcrumb({
    title:tBy({ en: 'Setup Letter Template', km: 'រៀបចំគំរូសេចក្តីអញ្ជើញ' }),
    description:activeEvent.value?.title,
    icon:"ri-heart-line",
    // ── Right side: action buttons ──────────────────────────────────────
    actions: [
      {
        label: tr('download'),
        icon: 'ri-download-2-line',
        type: 'download',
        color: 'create',
        // variant: 'solid',
        // size: 'xs',
        onClick: () => handleDownload()
      },
      {
        label: tr('letter.select_template'),
        icon: 'ri-layout-grid-line',
        type: 'send',
        color: 'create',
        // variant: 'solid',
        // size: 'xs',
        onClick: () => showTemplateModal.value = true
      },
      {
        label: tBy({ en: 'Copy Link', km: 'ចម្លងតំណ' }),
        icon: 'ri-links-line',
        type: 'copy',
        color: 'create',
        // variant: 'solid',
        // size: 'xs',
        onClick: () => handleCopyLink()       // custom handler wins over `to`
      },
      {
        label: tBy({ en: 'Print', km: 'បោះពុម្ព' }),
        icon: 'ri-printer-line',
        type: 'print',
        color: 'create',
        // variant: 'solid',
        // size: 'xs',
        onClick: () => printLetter()
      },
      {
        label: tr('send'),
        icon: 'ri-send-plane-fill',
        type: 'send',
        color: 'create',
        // variant: 'solid',
        // size: 'xs',
        onClick: () => sendAll()
      },
    ],
  })


// ── Init ──────────────────────────────────────────────────────────────────
onMounted(async () => {
  if (!eventStore.initialized) await eventStore.fetchEvents().catch(() => {});
  await initLetter();
});

watch(
  () => eventStore.activeEvent?.id,
  async (id) => {
    if (id) await initLetter();
  },
);

definePageMeta({
  layout: "navbar",
  middleware: ["auth", "permission"],
  permission: "WEDDING_SETTING",
});
</script>


<style lang="scss">
// ── Page shell ────────────────────────────────────────────────────────────
.invitation-letter-page {
  display: flex;
  flex-direction: column;
  gap: var(--sp-5);
  min-height: 100%;
}


// ── Print ─────────────────────────────────────────────────────────────────
@media print {
  .il-page-header,
  .il-tabs,
  .ile-form,
  .ile-live-preview,
  .preview-stats,
  .plv-device-bar,
  .device-chrome,
  .device-home-bar {
    display: none !important;
  }

  .preview-device-frame {
    border: none !important;
    box-shadow: none !important;
    border-radius: 0 !important;
  }

  .device-screen {
    max-height: none !important;
    overflow: visible !important;
  }
}
</style>
