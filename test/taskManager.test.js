import test from "node:test";
import assert from "node:assert/strict";
import {
  createTask,
  filterTasks,
  getTaskStats,
  loadTasks,
  saveTasks,
  toggleTaskCompletion,
  validateTaskInput
} from "../taskManager.js";

function createStorageMock(seed = {}) {
  const store = { ...seed };
  return {
    getItem(key) {
      return key in store ? store[key] : null;
    },
    setItem(key, value) {
      store[key] = value;
    }
  };
}

test("validateTaskInput requires title and validates date format", () => {
  const result = validateTaskInput({ title: "   ", dueDate: "08/01/2026" });
  assert.equal(result.errors.length, 2);
  assert.match(result.errors[0], /required/);
  assert.match(result.errors[1], /YYYY-MM-DD/);
});

test("createTask returns a usable task", () => {
  const { task, errors } = createTask({ title: "Prepare sprint demo", priority: "high" });
  assert.equal(errors.length, 0);
  assert.equal(task.title, "Prepare sprint demo");
  assert.equal(task.priority, "high");
  assert.equal(task.completed, false);
});

test("toggleTaskCompletion updates task state", () => {
  const { task } = createTask({ title: "A" });
  const toggled = toggleTaskCompletion([task], task.id);
  assert.equal(toggled[0].completed, true);
});

test("filterTasks and stats return expected values", () => {
  const tasks = [
    { id: "1", title: "A", priority: "low", completed: false },
    { id: "2", title: "B", priority: "medium", completed: true }
  ];

  assert.equal(filterTasks(tasks, "active").length, 1);
  assert.equal(filterTasks(tasks, "completed").length, 1);
  assert.deepEqual(getTaskStats(tasks), { total: 2, done: 1, left: 1 });
});

test("saveTasks and loadTasks round-trip data safely", () => {
  const storage = createStorageMock();
  const tasks = [{ id: "1", title: "A", priority: "low", completed: false }];

  saveTasks(storage, tasks);
  assert.deepEqual(loadTasks(storage), tasks);

  const broken = createStorageMock({ "injectyou.tasks": "not-json" });
  assert.deepEqual(loadTasks(broken), []);

  const invalidPriority = createStorageMock({
    "injectyou.tasks": JSON.stringify([{ id: "1", title: "A", priority: "urgent", completed: false }])
  });
  assert.deepEqual(loadTasks(invalidPriority), []);
});
