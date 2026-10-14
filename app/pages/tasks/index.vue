<template>
  <RWrapperPage class="flex min-h-0 flex-col gap-[var(--sp-5)]">
    <TaskProgressCard
      :completion-rate="taskStore.completionRate"
      :completed-count="completedCount"
      :in-progress-count="inProgressCount"
      :pending-count="pendingCount"
      :overdue-count="overdueCount"
    />

    <div
      class="flex min-h-0 flex-1 flex-col rounded-[var(--r-md)] bg-[var(--c-surface)] p-4"
    >
      <div class="shrink-0">
        <TaskFilters
          :status-filters="statusFilters"
          :priority-filters="priorityFilters"
          :filter-status="taskStore.filterStatus"
          :filter-priority="taskStore.filterPriority"
          @update:status="taskStore.filterStatus = $event"
          @update:priority="taskStore.filterPriority = $event"
        />
      </div>

      <div class="mt-4 min-h-0 flex-1">
        <TaskBoard
          class="h-full"
          :loading="taskStore.loading"
          :tasks="taskStore.filteredTasks"
          :columns="kanbanColumns"
          :is-dragging="isDragging"
          :dragged-task-id="draggedTaskId"
          :drag-over-status="dragOverStatus"
          :moving-task-id="movingTaskId"
          @drag-start="onDragStart"
          @drag-end="onDragEnd"
          @drag-enter="onDragEnter"
          @drag-over="onDragOver"
          @drag-leave="onDragLeave"
          @drop="onDrop"
          @add="openAdd"
          @edit="openEdit"
          @delete="actionDelete"
          @complete="onComplete"
          @move-previous="onMovePrevious"
          @move-next="onMoveNext"
        />
      </div>

      <TaskFormDrawer
        v-model:open="showModal"
        v-model:auto-translate="autoTranslate"
        :editing-task="editingTask"
        :form="form"
        :saving="saving"
        @save="save"
        @close="closeModal"
      />
    </div>
  </RWrapperPage>
</template>

<script setup>
definePageMeta({
  layout: "navbar",
  middleware: ["auth", "permission"],
  permission: "VIEW_TASK",
  title: "Tasks",
  showBack: false,
});

const toast = useToast();
const confirm = useConfirmStore();

const {
  taskStore,
  showModal,
  editingTask,
  saving,
  autoTranslate,
  form,
  statusFilters,
  priorityFilters,
  kanbanColumns,
  tr,
  init,
  openAdd,
  openEdit,
  closeModal,
  save,
  completeTask,
  priorityBadge,
  priorityLabel,
  fmtDate,
  isOverdue,
} = useTaskPage();

/* ---------------- DRAG STATE ---------------- */

const draggedTask = ref(null);
const draggedTaskId = ref(null);
const dragOverStatus = ref(null);
const isDragging = ref(false);
const movingTaskId = ref(null);

/* ---------------- COMPUTED ---------------- */

const inProgressCount = computed(
  () => taskStore.tasks.filter((task) => task.status === "in-progress").length,
);
const pendingCount = computed(
  () => taskStore.tasks.filter((task) => task.status === "pending").length,
);

/* ---------------- SHARED: move a task to a status ---------------- */

const moveTaskToStatus = async (task, newStatus) => {
  if (!task?.id || !newStatus || task.status === newStatus) return;
  if (movingTaskId.value) return;

  movingTaskId.value = task.id;

  try {
    await taskStore.updateTask(task.id, {
      title: task.title,
      description: task.description ?? null,
      status: newStatus,
      priority: task.priority,
      dueDate: task.dueDate ?? null,
      eventId: task.eventId ?? null,
    });

    await init();

    toast.add({
      title: tr("common.updated") || "Task updated",
      description:
        tr("common.savedSuccessfully") || "Task updated successfully.",
      color: "success",
    });
  } catch (error) {
    console.error("Failed to move task:", error);
    showError(error?.message || tr("common.error") || "Failed to move task");
  } finally {
    movingTaskId.value = null;
  }
};

/* ---------------- DRAG START/END ---------------- */

const onDragStart = (task, event) => {
  if (!task?.id) return;

  draggedTask.value = task;
  draggedTaskId.value = task.id;
  isDragging.value = true;

  if (event?.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.dropEffect = "move";
    event.dataTransfer.setData("text/plain", String(task.id));
    event.dataTransfer.setData(
      "application/json",
      JSON.stringify({ id: task.id }),
    );
  }
};

const onDragEnd = () => {
  draggedTask.value = null;
  draggedTaskId.value = null;
  dragOverStatus.value = null;
  isDragging.value = false;
};

/* ---------------- DRAG ENTER/OVER/LEAVE ---------------- */

const onDragEnter = ({ status, event }) => {
  if (!isDragging.value) return;
  event.preventDefault();
  dragOverStatus.value = status;
};

const onDragOver = ({ status, event }) => {
  if (!isDragging.value) return;
  event.preventDefault();
  event.stopPropagation();
  if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
  dragOverStatus.value = status;
};

const onDragLeave = ({ status, event }) => {
  if (dragOverStatus.value !== status) return;

  const currentTarget = event.currentTarget;
  const relatedTarget = event.relatedTarget;

  if (currentTarget && relatedTarget && currentTarget.contains(relatedTarget))
    return;

  dragOverStatus.value = null;
};

/* ---------------- DROP ---------------- */

const onDrop = async ({ status, event }) => {
  event.preventDefault();
  event.stopPropagation();

  const taskId = draggedTaskId.value;
  if (!taskId) {
    onDragEnd();
    return;
  }

  const task =
    taskStore.tasks.find((item) => String(item.id) === String(taskId)) ||
    draggedTask.value;

  if (!task || task.status === status || movingTaskId.value) {
    onDragEnd();
    return;
  }

  await moveTaskToStatus(task, status);
  onDragEnd();
};

/* ---------------- MOVE PREVIOUS / NEXT (buttons) ---------------- */

const onMovePrevious = ({ task, columnIndex }) => {
  const columns = unref(kanbanColumns) || [];
  const prevColumn = columns[columnIndex - 1];
  if (!prevColumn) return;
  moveTaskToStatus(task, prevColumn.status);
};

const onMoveNext = ({ task, columnIndex }) => {
  const columns = unref(kanbanColumns) || [];
  const nextColumn = columns[columnIndex + 1];
  if (!nextColumn) return;
  moveTaskToStatus(task, nextColumn.status);
};

/* ---------------- COMPLETE ---------------- */

const onComplete = (task) => {
  completeTask(task?.id ?? task);
};

/* ---------------- DELETE ---------------- */

const actionDelete = (item) => {
  confirm.show({
    type: "delete",
    title: tr("tasks.delete_task"),
    message:
      tr("common.delete") +
      ` <strong>${item?.title}</strong>? ` +
      tr("common.cannot_be_undone"),
    onConfirm: () => {
      taskStore
        .deleteTask(item?.id)
        .then(() => {
          toast.add({ title: tr("common.deleted") });
          init();
        })
        .catch((error) => {
          showError(error?.message || "Failed to delete task");
        });
    },
  });
};

onMounted(() => {
  init();
});
</script>

<style scoped>
button:disabled {
  cursor: not-allowed;
}

[draggable="true"] {
  user-select: none;
  -webkit-user-select: none;
}

[draggable="true"]:active {
  cursor: grabbing;
}
</style>
