const STORAGE_KEY = "tasksSchedule";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("taskForm");
  const tableBody = document.querySelector("#tasksTable tbody");

  // 1. Завантажити дані з localStorage
  let tasks = loadTasks();
  if (tasks.length === 0) {
    tasks = readTasksFromTable(tableBody);
    saveTasks(tasks);
  }

  // 2. Відрендерити таблицю
  renderTable(tasks, tableBody);

  // 3. Додавання нового завдання
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const task = {
      id: cryptoRandomId(),
      date: document.getElementById("date").value,
      title: document.getElementById("task").value,
      type: document.getElementById("type").value,
      status: document.getElementById("status").value
    };

    tasks.push(task);
    saveTasks(tasks);
    appendRow(task, tableBody);
    form.reset();
  });
});

// ===== Helpers =====

// Завантаження з localStorage
function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Збереження у localStorage
function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Зчитування існуючих рядків таблиці (початкові дані)
function readTasksFromTable(tbody) {
  const rows = Array.from(tbody.querySelectorAll("tr"));
  return rows.map(tr => {
    const dateInput = tr.querySelector("input[type='date']");
    const tds = tr.querySelectorAll("td");
    const select = tr.querySelector("select");
    return {
      id: cryptoRandomId(),
      date: dateInput ? dateInput.value : "",
      title: (tds[1]?.textContent || "").trim(),
      type: (tds[2]?.textContent || "").trim(),
      status: select?.value || "Заплановано"
    };
  });
}

// Рендеринг таблиці
function renderTable(tasks, tbody) {
  tbody.innerHTML = "";
  tasks.forEach(task => appendRow(task, tbody));
}

// Додавання рядка
function appendRow(task, tbody) {
  const tr = document.createElement("tr");
  tr.dataset.id = task.id;

  tr.innerHTML = `
    <td>
      <input type="date" value="${task.date}">
    </td>
    <td>${task.title}</td>
    <td>${task.type}</td>
    <td>
      <select>
        <option ${task.status === "Заплановано" ? "selected" : ""}>Заплановано</option>
        <option ${task.status === "В процесі" ? "selected" : ""}>В процесі</option>
        <option ${task.status === "Виконано" ? "selected" : ""}>Виконано</option>
      </select>
    </td>
    <td>
      <button class="delete-btn">Видалити</button>
    </td>
  `;

  tbody.appendChild(tr);
  wireRowInteractions(tr);
  applyRowColor(tr);
}

// Підключення обробників
function wireRowInteractions(tr) {
  const select = tr.querySelector("select");
  const dateInput = tr.querySelector("input[type='date']");
  const deleteBtn = tr.querySelector(".delete-btn");

  // Зміна статусу
  select.addEventListener("change", () => {
    const id = tr.dataset.id;
    const tasks = loadTasks();
    const idx = tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      tasks[idx].status = select.value;
      saveTasks(tasks);
    }
    applyRowColor(tr);
  });

  // Зміна дати
  dateInput.addEventListener("change", () => {
    const id = tr.dataset.id;
    const tasks = loadTasks();
    const idx = tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      tasks[idx].date = dateInput.value;
      saveTasks(tasks);
    }
  });

  // Видалення завдання
  deleteBtn.addEventListener("click", () => {
    const id = tr.dataset.id;
    let tasks = loadTasks();
    tasks = tasks.filter(t => t.id !== id);
    saveTasks(tasks);
    tr.remove();
  });
}

// Зміна кольору рядка залежно від статусу
function applyRowColor(tr) {
  const value = tr.querySelector("select")?.value || "Заплановано";
  tr.style.backgroundColor =
    value === "Виконано" ? "#dcedc1" :
    value === "В процесі" ? "#fff9c4" :
    "#eeeeee";
}

// Генератор ID
function cryptoRandomId() {
  return "t_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}