<template>
  <RDrawer
    :open="open"
    :title="editingTask ? tr('tasks.edit_task') : tr('tasks.add_task')"
    :icon="editingTask ? 'ri-edit-line' : 'ri-task-line'"
    width-desktop="480px"
    width-tablet="92vw"
    @update:open="$emit('update:open', $event)"
    @close="$emit('close')"
  >
    <RForm
      id="task-form"
      class="flex flex-col gap-[var(--sp-5)]"
      novalidate
      @submit.prevent="$emit('save')"
    >
      <!-- Title -->
      <RFormGroup :label="tr('tasks.title')" required>
        <RInput
          v-model="form.title"
          :placeholder="tr('tasks.title_placeholder')"
        />
      </RFormGroup>

      <!-- Priority / Status -->
      <div class="grid grid-cols-1 gap-[var(--sp-4)] sm:grid-cols-2">
        <RFormGroup :label="tr('tasks.priority')">
          <RSelect
            v-model="form.priority"
            pk="value"
            :local-data="{
              data: priorityOptions,
            }"
          />
        </RFormGroup>

        <RFormGroup :label="tr('tasks.status')">
          <RSelect
            v-model="form.status"
            pk="value"
            :local-data="{
              data: statusOptions,
            }"
          />
        </RFormGroup>
      </div>

      <!-- Due / Assigned -->
      <div class="grid grid-cols-1 gap-[var(--sp-4)] sm:grid-cols-2">
        <RFormGroup :label="tr('tasks.due_date')">
          <RDatePicker
            v-model="form.dueDate"
            :placeholder="tr('common.select_date')"
          />
        </RFormGroup>

        <RFormGroup :label="tr('tasks.assigned_to')">
          <RInput
            v-model="form.assignedToId"
            :placeholder="tr('tasks.user_id_placeholder')"
            leading-icon="ri-user-line"
          />
        </RFormGroup>
      </div>

      <!-- Notes -->
      <RFormGroup :label="tr('tasks.notes')">
        <RTextarea
          v-model="form.notes"
          :rows="4"
          :placeholder="tr('tasks.notes_placeholder')"
        />
      </RFormGroup>

      <!-- AI Translation -->
      <AIAutoTranslateCheckbox
        :model-value="autoTranslate"
        @update:model-value="$emit('update:auto-translate', $event)"
      />
    </RForm>

    <template #footer>
      <div class="flex w-full items-center justify-end gap-[var(--sp-3)]">
        <RBtn
          type="cancel"
          icon="cancel"
          :label="tr('common.cancel')"
          :disabled="saving"
          @click="$emit('close')"
        />

        <RBtn
          type="save"
          icon="save"
          :loading="saving"
          :label="tr('common.save')"
          :disabled="saving"
          @click="$emit('save')"
        />
      </div>
    </template>
  </RDrawer>
</template>

<script setup>
const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },

  editingTask: {
    type: Object,
    default: null,
  },

  form: {
    type: Object,
    required: true,
  },

  saving: {
    type: Boolean,
    default: false,
  },

  autoTranslate: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["update:open", "update:auto-translate", "save", "close"]);

const { tr } = useTaskPage();

const priorityOptions = computed(() => [
  {
    Name: tr("priority.urgent"),
    NameEnglish: "urgent",
    value: "urgent",
  },
  {
    Name: tr("priority.high"),
    NameEnglish: "high",
    value: "high",
  },
  {
    Name: tr("priority.medium"),
    NameEnglish: "medium",
    value: "medium",
  },
  {
    Name: tr("priority.low"),
    NameEnglish: "low",
    value: "low",
  },
]);

const statusOptions = computed(() => [
  {
    Name: tr("status.pending"),
    NameEnglish: tr("status.pending"),
    value: "pending",
  },
  {
    Name: tr("status.in_progress"),
    NameEnglish: tr("status.in_progress"),
    value: "in-progress",
  },
  {
    Name: tr("status.completed"),
    NameEnglish: tr("status.completed"),
    value: "completed",
  },
  {
    Name: tr("status.cancelled"),
    NameEnglish: tr("status.cancelled"),
    value: "cancelled",
  },
]);
</script>
