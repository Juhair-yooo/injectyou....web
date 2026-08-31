import {
  addTask,
  clearCompletedTasks,
  createTask,
  filterTasks,
  getTaskStats,
  loadTasks,
  removeTask,
  saveTasks,
  toggleTaskCompletion
} from "./taskManager.js";

const form = document.getElementById("task-form");
const list = document.getElementById("task-list");
const stats = document.getElementById("task-stats");
const filter = document.getElementById("status-filter");
const clearCompleted = document.getElementById("clear-completed");
const error = document.getElementById("form-error");
const emptyState = document.getElementById("empty-state");

let tasks = loadTasks(localStorage);

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
}

function taskTemplate(task) {
  const due = task.dueDate ? ` · Due ${escapeHtml(task.dueDate)}` : "";
  const safeTitle = escapeHtml(task.title);

  return `
    <li class="task ${task.completed ? "completed" : ""}" data-id="${task.id}">
      <input type="checkbox" aria-label="Mark task complete" ${task.completed ? "checked" : ""} />
      <div>
        <div class="title">${safeTitle}</div>
        <div class="meta priority-${task.priority}">${task.priority.toUpperCase()}${due}</div>
      </div>
      <button class="delete" type="button">Delete</button>
    </li>
  `;
}

function render() {
  const visible = filterTasks(tasks, filter.value);
  list.innerHTML = visible.map(taskTemplate).join("");

  const taskStats = getTaskStats(tasks);
  stats.textContent = `${taskStats.total} total · ${taskStats.done} done · ${taskStats.left} left`;

  emptyState.hidden = visible.length > 0;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const { task, errors } = createTask({
    title: formData.get("title"),
    priority: formData.get("priority"),
    dueDate: formData.get("dueDate")
  });

  if (errors.length) {
    error.textContent = errors[0];
    return;
  }

  error.textContent = "";
  tasks = addTask(tasks, task);
  saveTasks(localStorage, tasks);
  form.reset();
  form.priority.value = "medium";
  render();
});

filter.addEventListener("change", render);

clearCompleted.addEventListener("click", () => {
  tasks = clearCompletedTasks(tasks);
  saveTasks(localStorage, tasks);
  render();
});

list.addEventListener("click", (event) => {
  const target = event.target;
  const item = target.closest(".task");
  if (!item) return;

  const { id } = item.dataset;

  if (target.matches("input[type='checkbox']")) {
    tasks = toggleTaskCompletion(tasks, id);
  }

  if (target.matches(".delete")) {
    tasks = removeTask(tasks, id);
  }

  saveTasks(localStorage, tasks);
  render();
});

render();
