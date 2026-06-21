const taskInput = document.getElementById("taskInput");
const category = document.getElementById("category");
const priority = document.getElementById("priority");
const dueDate = document.getElementById("dueDate");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const themeToggle = document.getElementById("themeToggle");
const sortTasks = document.getElementById("sortTasks");
const clearAllBtn = document.getElementById("clearAllBtn");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";

// Add Task
addBtn.addEventListener("click", addTask);

// Press Enter to Add Task
taskInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        addTask();
    }
});

function addTask() {

    if (taskInput.value.trim() === "") {
        alert("Please enter a task!");
        return;
    }

    const task = {
        id: Date.now(),
        text: taskInput.value.trim(),
        category: category.value,
        priority: priority.value,
        dueDate: dueDate.value,
        completed: false
    };

    tasks.push(task);

    saveTasks();
    renderTasks();

    taskInput.value = "";
    dueDate.value = "";
}

// Render Tasks
function renderTasks() {

    taskList.innerHTML = "";

    let filteredTasks = [...tasks];

    // Filter Tasks
    if (currentFilter === "completed") {
        filteredTasks = filteredTasks.filter(task => task.completed);
    } else if (currentFilter === "pending") {
        filteredTasks = filteredTasks.filter(task => !task.completed);
    }

    // Search Tasks
    const searchTerm = searchInput.value.toLowerCase();

    filteredTasks = filteredTasks.filter(task =>
        task.text.toLowerCase().includes(searchTerm)
    );

    // Sort Tasks
    if (sortTasks.value === "priority") {

        const priorityOrder = {
            High: 1,
            Medium: 2,
            Low: 3
        };

        filteredTasks.sort((a, b) =>
            priorityOrder[a.priority] - priorityOrder[b.priority]
        );

    } else {

        filteredTasks.sort((a, b) => {

            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;

            return new Date(a.dueDate) - new Date(b.dueDate);
        });
    }

    // Display Tasks
    filteredTasks.forEach(task => {

        const li = document.createElement("li");

        li.className = `task ${task.completed ? "completed" : ""}`;

        li.innerHTML = `
            <div class="task-info">
                <h4>${task.text}</h4>

                <div class="task-meta">
                    <span>📂 ${task.category}</span>

                    <span class="priority ${task.priority.toLowerCase()}">
                        ${task.priority}
                    </span>

                    <span>📅 ${task.dueDate || "No Date"}</span>
                </div>
            </div>

            <div class="actions">

                <button class="complete-btn">
                    ${task.completed ? "Undo" : "Done"}
                </button>

                <button class="edit-btn">
                    Edit
                </button>

                <button class="delete-btn">
                    Delete
                </button>

            </div>
        `;

        // Complete Task
        li.querySelector(".complete-btn")
            .addEventListener("click", () => {

                task.completed = !task.completed;

                saveTasks();
                renderTasks();
            });

        // Edit Task
        li.querySelector(".edit-btn")
            .addEventListener("click", () => {

                const updatedTask = prompt(
                    "Edit your task:",
                    task.text
                );

                if (updatedTask !== null &&
                    updatedTask.trim() !== "") {

                    task.text = updatedTask.trim();

                    saveTasks();
                    renderTasks();
                }
            });

        // Delete Task
        li.querySelector(".delete-btn")
            .addEventListener("click", () => {

                if (confirm("Delete this task?")) {

                    tasks = tasks.filter(t => t.id !== task.id);

                    saveTasks();
                    renderTasks();
                }
            });

        taskList.appendChild(li);
    });

    updateStats();
}

// Search
searchInput.addEventListener("input", renderTasks);

// Sort
sortTasks.addEventListener("change", renderTasks);

// Filter Buttons
document.querySelectorAll(".filter").forEach(button => {

    button.addEventListener("click", () => {

        document.querySelectorAll(".filter")
            .forEach(btn => btn.classList.remove("active"));

        button.classList.add("active");

        currentFilter = button.dataset.filter;

        renderTasks();
    });
});

// Clear All Tasks
clearAllBtn.addEventListener("click", () => {

    if (confirm("Are you sure you want to delete all tasks?")) {

        tasks = [];
        saveTasks();
        renderTasks();
    }
});

// Dark Mode
themeToggle.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    localStorage.setItem(
        "theme",
        document.body.classList.contains("dark")
            ? "dark"
            : "light"
    );
});

// Load Theme
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
}

// Update Statistics
function updateStats() {

    const total = tasks.length;

    const completed = tasks.filter(task =>
        task.completed
    ).length;

    const pending = total - completed;

    document.getElementById("totalCount").textContent = total;
    document.getElementById("completedCount").textContent = completed;
    document.getElementById("pendingCount").textContent = pending;

    const percentage =
        total === 0 ? 0 :
        Math.round((completed / total) * 100);

    document.getElementById("progress").style.width =
        percentage + "%";

    document.getElementById("progressText").textContent =
        `${percentage}% Completed`;
}

// Save Tasks
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Initial Load
renderTasks();