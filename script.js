let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function save() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  render();
}

function addTask() {
  let title = document.getElementById("title").value.trim();
  let assignee = document.getElementById("assignee").value.trim();
  let date = document.getElementById("dueDate").value;
  let priority = document.getElementById("priority").value;

  if (!title) return alert("Task title required");

  if (tasks.some((t) => t.title.toLowerCase() === title.toLowerCase()))
    return alert("Duplicate task detected");

  tasks.push({
    id: Date.now(),
    title,
    assignee,
    date,
    priority,
    status: "todo",
  });

  document.getElementById("title").value = "";
  document.getElementById("assignee").value = "";
  document.getElementById("dueDate").value = "";

  save();
}

function render() {
  document.getElementById("todo").innerHTML = "";
  document.getElementById("progress").innerHTML = "";
  document.getElementById("done").innerHTML = "";

  tasks.sort((a, b) => priorityRank(b.priority) - priorityRank(a.priority));

  tasks.forEach((task) => {
    let el = document.createElement("div");

    let overdue =
      task.date && new Date(task.date) < new Date() && task.status != "done";

    el.className =
      "task priority-" + task.priority + (overdue ? " overdue" : "");

    el.innerHTML = `
<b>${task.title}</b>
<small>Assigned: ${task.assignee || "Unassigned"}</small>
<small>Due: ${task.date || "No date"}</small>
<small>Priority: ${task.priority}</small>

<button onclick="moveTask(${task.id})">Move</button>
<button onclick="editTask(${task.id})">Edit</button>
<button onclick="deleteTask(${task.id})">Delete</button>
`;

    document.getElementById(task.status).appendChild(el);
  });

  updateAnalytics();
}

function priorityRank(p) {
  return { high: 3, medium: 2, low: 1 }[p];
}

function moveTask(id) {
  let t = tasks.find((x) => x.id === id);

  if (t.status === "todo") t.status = "progress";
  else if (t.status === "progress") t.status = "done";
  else t.status = "todo";

  save();
}

function editTask(id) {
  let t = tasks.find((x) => x.id === id);

  let newTitle = prompt("Edit task", t.title);

  if (!newTitle) return;

  if (
    tasks.some(
      (x) => x.title.toLowerCase() === newTitle.toLowerCase() && x.id !== id,
    )
  )
    return alert("Duplicate task title");

  t.title = newTitle;

  save();
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);

  save();
}

function clearAll() {
  if (confirm("Delete all tasks?")) {
    tasks = [];
    save();
  }
}

function updateAnalytics() {
  let total = tasks.length;
  let completed = tasks.filter((t) => t.status === "done").length;
  let pending = total - completed;

  document.getElementById("totalTasks").textContent = total;
  document.getElementById("completedTasks").textContent = completed;
  document.getElementById("pendingTasks").textContent = pending;

  let percent = total ? (completed / total) * 100 : 0;
  document.getElementById("progressBar").style.width = percent + "%";
}

document.getElementById("search").addEventListener("input", function () {
  let keyword = this.value.toLowerCase();

  document.querySelectorAll(".task").forEach((task) => {
    task.style.display = task.innerText.toLowerCase().includes(keyword)
      ? "block"
      : "none";
  });
});

render();
