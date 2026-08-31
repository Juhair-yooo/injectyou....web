const PRIORITIES = new Set(["low", "medium", "high"]);

const isIsoDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value);

export function validateTaskInput(input) {
  const title = String(input?.title ?? "").trim();
  const priority = PRIORITIES.has(input?.priority) ? input.priority : "medium";
  const dueDate = String(input?.dueDate ?? "").trim();
  const errors = [];

  if (!title) errors.push("Task title is required.");
  if (title.length > 80) errors.push("Task title must be 80 characters or fewer.");
  if (dueDate && !isIsoDate(dueDate)) errors.push("Due date must be in YYYY-MM-DD format.");

  return { title, priority, dueDate, errors };
}

export function createTask(input) {
  const { title, priority, dueDate, errors } = validateTaskInput(input);

  if (errors.length) {
    return { task: null, errors };
  }

  return {
    task: {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      priority,
      dueDate,
      completed: false,
      createdAt: new Date().toISOString()
    },
    errors: []
  };
}

export function addTask(tasks, task) {
  return [task, ...tasks];
}

export function toggleTaskCompletion(tasks, id) {
  return tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task));
}

export function clearCompletedTasks(tasks) {
  return tasks.filter((task) => !task.completed);
}

export function removeTask(tasks, id) {
  return tasks.filter((task) => task.id !== id);
}

export function filterTasks(tasks, status) {
  if (status === "active") return tasks.filter((task) => !task.completed);
  if (status === "completed") return tasks.filter((task) => task.completed);
  return tasks;
}

export function getTaskStats(tasks) {
  const total = tasks.length;
  const done = tasks.filter((task) => task.completed).length;
  return { total, done, left: total - done };
}

export function saveTasks(storage, tasks) {
  storage.setItem("injectyou.tasks", JSON.stringify(tasks));
}

export function loadTasks(storage) {
  try {
    const raw = storage.getItem("injectyou.tasks");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (task) =>
        task &&
        typeof task.id === "string" &&
        typeof task.title === "string" &&
        PRIORITIES.has(task.priority) &&
        typeof task.completed === "boolean"
    );
  } catch {
    return [];
  }
}
