// stores/task.js
import { defineStore, acceptHMRUpdate } from "pinia";

const statusToFrontend = (s) => {
  if (s && typeof s === "object") {
    s = s.value ?? s.label;
  }

  const value = String(s ?? "PENDING").toUpperCase();

  const map = {
    PENDING: "pending",
    IN_PROGRESS: "in-progress",
    DONE: "completed",
    CANCELLED: "cancelled",
  };

  return map[value] ?? "pending";
};

const statusToSpring = (s) => {
  if (s && typeof s === "object") {
    s = s.value ?? s.label;
  }

  const value = String(s ?? "pending").toLowerCase();

  const map = {
    pending: "PENDING",
    "in-progress": "IN_PROGRESS",
    completed: "DONE",
    done: "DONE",
    cancelled: "CANCELLED",
  };

  return map[value] ?? "PENDING";
};

const priorityToFrontend = (p) => {
  if (p && typeof p === "object") {
    p = p.value ?? p.label;
  }

  return String(p ?? "MEDIUM").toLowerCase();
};

const priorityToSpring = (p) => {
  if (p && typeof p === "object") {
    p = p.value ?? p.label;
  }

  const value = String(p ?? "medium").toLowerCase();

  const map = {
    low: "LOW",
    medium: "MEDIUM",
    high: "HIGH",
    urgent: "URGENT",
  };

  return map[value] ?? "MEDIUM";
};

const toLocalDateTime = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}T00:00:00`;
  }

  const stringValue = String(value);

  if (stringValue.includes("T")) {
    return stringValue;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(stringValue)) {
    return `${stringValue}T00:00:00`;
  }

  return null;
};

const fromApi = (t) => ({
  id: t.id,
  weddingId: t.weddingId,
  title: t.title ?? "",
  description: t.description ?? "",
  assignee: t.assignedToName ?? "",
  assignedToId: t.assignedToId ?? "",
  dueDate: t.dueDate ? t.dueDate.slice(0, 10) : "",
  priority: priorityToFrontend(t.priority),
  status: statusToFrontend(t.status),
  notes: t.description ?? "",
  completedAt: t.completedAt,
  createdAt: t.createdAt,
  updatedAt: t.updatedAt,
});

const toApi = (form) => ({
  title: form.title,
  description: form.notes || form.description || null,
  assignedTo: form.assignedToId || null,
  dueDate: toLocalDateTime(form.dueDate),
  priority: priorityToSpring(form.priority),
  status: statusToSpring(form.status),
});
export const useTaskStore = defineStore("task", {
  state: () => ({
    tasks: [],
    loading: false,
    pagination: { page: 0, size: 50, totalElements: 0, totalPages: 0 },
    filterStatus: "all",
    filterPriority: "all",
  }),

  getters: {
    filteredTasks: (state) => {
      let list = state.tasks;
      if (state.filterStatus !== "all")
        list = list.filter((t) => t.status === state.filterStatus);
      if (state.filterPriority !== "all")
        list = list.filter((t) => t.priority === state.filterPriority);
      return list;
    },
    pendingCount: (state) =>
      state.tasks.filter(
        (t) => t.status === "pending" || t.status === "in-progress",
      ).length,
    completedCount: (state) =>
      state.tasks.filter((t) => t.status === "completed").length,
    completionRate(state) {
      return state.tasks.length
        ? Math.round((this.completedCount / state.tasks.length) * 100)
        : 0;
    },
    overdueTasks: (state) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return state.tasks.filter((t) => {
        if (t.status === "completed" || t.status === "cancelled") return false;
        if (!t.dueDate) return false;
        return new Date(t.dueDate) < today;
      });
    },
  },

  actions: {
    _weddingId() {
      return useEventStore().activeEvent?.id ?? "";
    },

    async fetchTasks(page = 0) {
      const id = this._weddingId();
      if (!id) return;
      this.loading = true;
      try {
        const { data, error } = await useHttp(
          `/api/v1/events/${id}/tasks?page=${page}&size=${this.pagination.size}&pagination=true`,
          { method: "GET", isGlobal: true },
        );
        if (error?.value)
          return {
            error: error.value?.data?.message || "Failed to load tasks",
          };
        const result = data.value?.data ?? data.value;
        this.tasks = (result?.content ?? []).map(fromApi);
        this.pagination = {
          page: result?.page ?? 0,
          size: result?.size ?? 50,
          totalElements: result?.totalElements ?? 0,
          totalPages: result?.totalPages ?? 1,
        };
      } finally {
        this.loading = false;
      }
    },

    async addTask(form) {
      const id = this._weddingId();
      if (!id) return { error: "No active event" };
      this.loading = true;
      try {
        const { data, error } = await useHttp(`/api/v1/events/${id}/tasks`, {
          method: "POST",
          body: toApi(form),
          isGlobal: true,
        });
        if (error?.value)
          return {
            error: error.value?.data?.message || "Failed to create task",
          };
        const created = fromApi(data.value?.data ?? data.value);
        this.tasks.push(created);
        this.pagination.totalElements++;
        return { data: created };
      } finally {
        this.loading = false;
      }
    },

    async updateTask(taskId, form) {
      const id = this._weddingId();
      if (!id) return { error: "No active event" };
      this.loading = true;
      try {
        const { data, error } = await useHttp(
          `/api/v1/events/${id}/tasks/${taskId}`,
          {
            method: "PUT",
            body: toApi(form),
            isGlobal: true,
          },
        );
        if (error?.value)
          return {
            error: error.value?.data?.message || "Failed to update task",
          };
        const updated = fromApi(data.value?.data ?? data.value);
        const idx = this.tasks.findIndex((t) => t.id === taskId);
        if (idx !== -1) this.tasks[idx] = updated;
        return { data: updated };
      } finally {
        this.loading = false;
      }
    },

    async completeTask(taskId) {
      const task = this.tasks.find((t) => t.id === taskId);
      if (!task) return { error: "Task not found" };
      return this.updateTask(taskId, { ...task, status: "completed" });
    },

    async deleteTask(taskId) {
      const id = this._weddingId();
      if (!id) return { error: "No active event" };
      this.loading = true;
      try {
        const { error } = await useHttp(
          `/api/v1/events/${id}/tasks/${taskId}`,
          {
            method: "DELETE",
            isGlobal: true,
          },
        );
        if (error?.value)
          return {
            error: error.value?.data?.message || "Failed to delete task",
          };
        const idx = this.tasks.findIndex((t) => t.id === taskId);
        if (idx !== -1) this.tasks.splice(idx, 1);
        this.pagination.totalElements--;
        return { data: true };
      } finally {
        this.loading = false;
      }
    },
  },
});

// make sure to pass the right store definition, `useAuth` in this case.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTaskStore, import.meta.hot));
}
