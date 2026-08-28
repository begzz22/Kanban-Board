let tasks = [];
const addTaskBtn = document.getElementById("add-task-btn");
const modalOverlay = document.getElementById("modal-overlay");
const closeModalBtn = document.getElementById("close-modal-btn");
const cancelBtn = document.getElementById("cancel-btn");
const taskForm = document.getElementById("task-form");
const taskTitle = document.getElementById("task-title");
const taskPriority = document.getElementById("task-priority");
const taskDueDate = document.getElementById("task-due-date");
const taskDescription = document.getElementById("task-description");
const todoContainer = document.getElementById("tasks-todo");
const inProgressContainer = document.getElementById("tasks-in-progress");
const completedContainer = document.getElementById("tasks-completed");
const columnsContainer = document.getElementById("columns-container");
const charCount = document.getElementById("char-count");
const titleError = document.getElementById("title-error");
const dateError = document.getElementById("date-error");
let currentEditId = null;
const modalTitle = document.getElementById("modal-title");
const modalIcon = document.getElementById("modal-icon");
const submitBtnText = document.getElementById("submit-btn-text");
const submitBtnIcon = document.getElementById("submit-btn-icon");
const todoCount = document.getElementById("todo-count");
const inProgressCount = document.getElementById("in-progress-count");
const completedCount = document.getElementById("completed-count");
const STORAGE_KEY = "kanban_tasks";
function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
function loadTasks() {
    const storedTasks = localStorage.getItem(STORAGE_KEY);
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
    }
}
loadTasks();
function emptyStateHTML() {
    return `
    <div class="flex flex-col items-center justify-center py-12 text-slate-400">
      <i class="fa-regular fa-folder-open text-4xl mb-3 opacity-50"></i>
      <p class="text-sm">No tasks yet</p>
      <p class="text-xs mt-1">Click + to add one</p>
    </div>
  `;
}
function renderTasks() {
    todoContainer.innerHTML = "";
    inProgressContainer.innerHTML = "";
    completedContainer.innerHTML = "";
    tasks.forEach((task, index) => {
        let container = null;
        if (task.status === "todo") {
            container = todoContainer;
        }
        else if (task.status === "in-progress") {
            container = inProgressContainer;
        }
        else if (task.status === "completed") {
            container = completedContainer;
        }
        if (!container)
            return;
        // Priority
        let priorityClass = "";
        let priorityDotClass = "";
        if (task.priority === "low") {
            priorityClass = "bg-slate-100 text-slate-500";
            priorityDotClass = "bg-slate-400";
        }
        else if (task.priority === "medium") {
            priorityClass = "bg-amber-50 text-amber-600";
            priorityDotClass = "bg-amber-500";
        }
        else {
            priorityClass = "bg-red-50 text-red-600";
            priorityDotClass = "bg-red-500";
        }
        const priorityLabel = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
        // Due Date state (shared between the badge and the meta info row)
        let dueDateBadgeHTML = "";
        let dueDateMetaHTML = "";
        let dueDateColor = "text-slate-400";
        if (task.dueDate) {
            const dueDate = new Date(task.dueDate);
            const today = new Date();
            const tomorrow = new Date(today);
            today.setHours(0, 0, 0, 0);
            dueDate.setHours(0, 0, 0, 0);
            tomorrow.setDate(today.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            const isOverdue = dueDate < today && task.status !== "completed";
            const isDueSoon = !isOverdue && dueDate <= tomorrow && task.status !== "completed";
            if (isOverdue) {
                dueDateColor = "text-red-500";
            }
            else if (isDueSoon) {
                dueDateColor = "text-orange-500";
            }
            dueDateMetaHTML = `
        <div class="flex items-center gap-1.5 ${dueDateColor}">
          <i class="fa-regular fa-calendar"></i>
          <span>
            ${dueDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            })}
          </span>
        </div>
      `;
            if (isOverdue) {
                dueDateBadgeHTML = `
          <span class="bg-red-100 text-red-600 text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wide">
            Overdue
          </span>
        `;
            }
            else if (isDueSoon) {
                dueDateBadgeHTML = `
          <span class="bg-orange-100 text-orange-600 text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wide">
            Due Soon
          </span>
        `;
            }
        }
        // Status Buttons
        let statusButtons = "";
        if (task.status === "todo") {
            statusButtons = `
        <button
          class="status-btn text-[11px] px-3 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-1.5 hover:scale-105 active:scale-95 bg-amber-100 text-amber-700 hover:bg-amber-200"
          data-task-id="${task.id}"
          data-status="in-progress"
        >
          <i class="fa-solid fa-play pointer-events-none"></i>
          <span class="pointer-events-none">Start</span>
        </button>

        <button
          class="status-btn text-[11px] px-3 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-1.5 hover:scale-105 active:scale-95 bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
          data-task-id="${task.id}"
          data-status="completed"
        >
          <i class="fa-solid fa-check pointer-events-none"></i>
          <span class="pointer-events-none">Complete</span>
        </button>
      `;
        }
        else if (task.status === "in-progress") {
            statusButtons = `
                <button
          class="status-btn text-[11px] px-3 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-1.5 hover:scale-105 active:scale-95 bg-slate-100 text-slate-600 hover:bg-slate-200"
          data-task-id="${task.id}"
          data-status="todo"
        >
          <i class="fa-solid fa-rotate-left pointer-events-none"></i>
          <span class="pointer-events-none">To Do</span>
        </button>

        <button
          class="status-btn text-[11px] px-3 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-1.5 hover:scale-105 active:scale-95 bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
          data-task-id="${task.id}"
          data-status="completed"
        >
          <i class="fa-solid fa-check pointer-events-none"></i>
          <span class="pointer-events-none">Complete</span>
        </button>
      `;
        }
        else {
            statusButtons = `
        <button
          class="status-btn text-[11px] px-3 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-1.5 hover:scale-105 active:scale-95 bg-slate-100 text-slate-600 hover:bg-slate-200"
          data-task-id="${task.id}"
          data-status="todo"
        >
          <i class="fa-solid fa-rotate-left pointer-events-none"></i>
          <span class="pointer-events-none">To Do</span>
        </button>

        <button
          class="status-btn text-[11px] px-3 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-1.5 hover:scale-105 active:scale-95 bg-amber-100 text-amber-700 hover:bg-amber-200"
          data-task-id="${task.id}"
          data-status="in-progress"
        >
          <i class="fa-solid fa-play pointer-events-none"></i>
          <span class="pointer-events-none">Start</span>
        </button>
      `;
        }
        // Task Card
        const taskCard = document.createElement("div");
        taskCard.className =
            "group bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all duration-200";
        taskCard.setAttribute("data-task-id", task.id);
        taskCard.innerHTML = `
      <!-- Top Bar -->
      <div class="flex items-center justify-between mb-3">

        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-slate-300"></span>

          <span class="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
            #${String(index + 1).padStart(3, "0")}
          </span>
        </div>

        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">

          <button
            class="edit-btn text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            data-task-id="${task.id}"
            title="Edit task"
          >
            <i class="fa-solid fa-pen text-xs pointer-events-none"></i>
          </button>

          <button
            class="delete-btn text-slate-400 hover:text-red-500 hover:bg-red-50 w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            data-task-id="${task.id}"
            title="Delete task"
          >
            <i class="fa-solid fa-trash-can text-xs pointer-events-none"></i>
          </button>

        </div>
      </div>

      <!-- Title -->
      <h3 class="font-semibold text-slate-800 mb-2 leading-snug">
        ${task.title}
      </h3>

      <!-- Description -->
      ${task.description
            ? `
            <p class="text-slate-500 text-sm mb-4 leading-relaxed line-clamp-2">
              ${task.description}
            </p>
          `
            : ""}

      <!-- Tags Row -->
      <div class="flex flex-wrap items-center gap-2 mb-4">

        <!-- Priority Badge -->
        <span class="${priorityClass} text-[10px] font-semibold px-2 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-wide">
          <span class="w-1.5 h-1.5 rounded-full ${priorityDotClass}"></span>
          ${priorityLabel}
        </span>

        ${dueDateBadgeHTML}

      </div>

      <!-- Meta Info -->
      <div class="flex items-center gap-3 text-xs text-slate-400 pb-3 mb-3 border-b border-slate-100">

        ${dueDateMetaHTML}

        <div
          class="flex items-center gap-1.5"
          title="Created ${new Date().toLocaleString()}"
        >
          <i class="fa-regular fa-clock"></i>
          <span>Just now</span>
        </div>

      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap gap-2">
        ${statusButtons}
      </div>
    `;
        container.appendChild(taskCard);
    });
    // Update task counts
    const todoTasksCount = tasks.filter((t) => t.status === "todo").length;
    const inProgressTasksCount = tasks.filter((t) => t.status === "in-progress").length;
    const completedTasksCount = tasks.filter((t) => t.status === "completed").length;
    if (todoCount) {
        todoCount.textContent = `${todoTasksCount} task${todoTasksCount !== 1 ? "s" : ""}`;
    }
    if (inProgressCount) {
        inProgressCount.textContent = `${inProgressTasksCount} task${inProgressTasksCount !== 1 ? "s" : ""}`;
    }
    if (completedCount) {
        completedCount.textContent = `${completedTasksCount} task${completedTasksCount !== 1 ? "s" : ""}`;
    }
    // Empty state
    if (todoContainer && todoContainer.children.length === 0) {
        todoContainer.innerHTML = emptyStateHTML();
    }
    if (inProgressContainer && inProgressContainer.children.length === 0) {
        inProgressContainer.innerHTML = emptyStateHTML();
    }
    if (completedContainer && completedContainer.children.length === 0) {
        completedContainer.innerHTML = emptyStateHTML();
    }
}
renderTasks();
function openModal() {
    modalOverlay?.classList.remove("hidden");
    modalOverlay?.classList.add("flex");
}
function closeModal() {
    modalOverlay?.classList.add("hidden");
    modalOverlay?.classList.remove("flex");
    currentEditId = null;
    if (modalTitle)
        modalTitle.textContent = "Create New Task";
    if (modalIcon) {
        modalIcon.classList.remove("fa-pen");
        modalIcon.classList.add("fa-plus-circle");
    }
    if (submitBtnText)
        submitBtnText.textContent = "Add Task";
    if (submitBtnIcon) {
        submitBtnIcon.classList.remove("fa-floppy-disk");
        submitBtnIcon.classList.add("fa-plus");
    }
    taskForm?.reset();
    if (charCount)
        charCount.textContent = "0/500";
}
// Open modal
addTaskBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    openModal();
});
// Close modal
closeModalBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    closeModal();
});
cancelBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    closeModal();
});
// Close when clicking the dark overlay only
modalOverlay?.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
        closeModal();
    }
});
// buttons
columnsContainer?.addEventListener("click", (e) => {
    const target = e.target;
    // Status button
    const statusBtn = target.closest(".status-btn");
    if (statusBtn) {
        const taskId = statusBtn.dataset.taskId;
        const newStatus = statusBtn.dataset.status;
        if (!taskId || !newStatus)
            return;
        const task = tasks.find((t) => t.id === taskId);
        if (!task)
            return;
        task.status = newStatus;
        saveTasks();
        renderTasks();
        return;
    }
    // Delete button
    const deleteBtn = target.closest(".delete-btn");
    if (deleteBtn) {
        const taskId = deleteBtn.dataset.taskId;
        if (!taskId)
            return;
        tasks = tasks.filter((t) => t.id !== taskId);
        saveTasks();
        renderTasks();
        return;
    }
    // Edit button
    const editBtn = target.closest(".edit-btn");
    if (editBtn) {
        const taskId = editBtn.dataset.taskId;
        const task = tasks.find((t) => t.id === taskId);
        if (!task)
            return;
        currentEditId = task.id;
        if (taskTitle)
            taskTitle.value = task.title;
        if (taskPriority)
            taskPriority.value = task.priority;
        if (taskDueDate)
            taskDueDate.value = task.dueDate;
        if (taskDescription)
            taskDescription.value = task.description;
        if (charCount) {
            charCount.textContent = `${task.description.length}/500`;
        }
        if (modalTitle)
            modalTitle.textContent = "Edit Task";
        if (modalIcon) {
            modalIcon.classList.remove("fa-plus-circle");
            modalIcon.classList.add("fa-pen");
        }
        if (submitBtnText)
            submitBtnText.textContent = "Save Changes";
        if (submitBtnIcon) {
            submitBtnIcon.classList.remove("fa-plus");
            submitBtnIcon.classList.add("fa-floppy-disk");
        }
        openModal();
        return;
    }
});
// taskDescription
taskDescription?.addEventListener("input", () => {
    const length = taskDescription.value.length;
    if (charCount) {
        charCount.textContent = `${length}/500`;
    }
});
//tasform submit
taskForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = taskTitle?.value.trim() ?? "";
    const priority = taskPriority?.value;
    const dueDate = taskDueDate?.value ?? "";
    const description = taskDescription?.value.trim() ?? "";
    // Validation
    let isValid = true;
    if (!title) {
        titleError.textContent = "Task title is required";
        titleError.classList.remove("hidden");
        taskTitle?.classList.add("border-red-500");
        isValid = false;
    }
    else {
        titleError.textContent = "";
        titleError.classList.add("hidden");
        taskTitle?.classList.remove("border-red-500");
    }
    if (dueDate) {
        const selectedDate = new Date(dueDate);
        const today = new Date();
        selectedDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
            dateError.textContent = "Due date cannot be in the past";
            dateError.classList.remove("hidden");
            taskDueDate?.classList.add("border-red-500");
            isValid = false;
        }
        else {
            dateError.textContent = "";
            dateError.classList.add("hidden");
            taskDueDate?.classList.remove("border-red-500");
        }
    }
    else {
        dateError.textContent = "";
        dateError.classList.add("hidden");
        taskDueDate?.classList.remove("border-red-500");
    }
    if (!isValid)
        return;
    if (currentEditId) {
        const task = tasks.find((t) => t.id === currentEditId);
        if (task) {
            task.title = title;
            task.priority = priority;
            task.dueDate = dueDate;
            task.description = description;
        }
    }
    else {
        const newTask = {
            id: crypto.randomUUID(),
            title: title,
            priority: priority,
            dueDate: dueDate,
            description: description,
            status: "todo",
        };
        tasks.push(newTask);
    }
    saveTasks();
    renderTasks();
    closeModal();
});
export {};
//# sourceMappingURL=main.js.map