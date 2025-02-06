const LOCAL_STORAGE_KEY = 'todoList';
const LOCAL_STORAGE_THEME_KEY = 'theme';

let todos = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
let editingTodoId = null;

const todoForm = document.getElementById('todoForm');
const todoList = document.getElementById('todoList');
const titleInput = document.getElementById('titleInput');
const descriptionInput = document.getElementById('descriptionInput');
const deadlineInput = document.getElementById('deadlineInput');
const searchInput = document.getElementById('searchInput');
const cancelEditBtn = document.getElementById('cancelEdit');
const themeToggle = document.getElementById('themeToggle');
const clockElement = document.getElementById('clock');

function initTheme() {
    const savedTheme = localStorage.getItem(LOCAL_STORAGE_THEME_KEY);
    if (savedTheme === 'true') {
        document.body.classList.add('dark');
    }
}

function validateForm() {
    let isValid = true;
    const errors = {
        title: '',
        description: '',
        deadline: ''
    };

    if (titleInput.value.length < 5 || titleInput.value.length > 25) {
        errors.title = 'Judul harus antara 5-25 karakter';
        isValid = false;
    }

    if (descriptionInput.value.length < 20 || descriptionInput.value.length > 100) {
        errors.description = 'Deskripsi harus antara 20-100 karakter';
        isValid = false;
    }

    if (!deadlineInput.value) {
        errors.deadline = 'Deadline harus diisi';
        isValid = false;
    }

    document.getElementById('titleError').textContent = errors.title;
    document.getElementById('descriptionError').textContent = errors.description;
    document.getElementById('deadlineError').textContent = errors.deadline;

    return isValid;
}

function addTodo(event) {
    event.preventDefault();

    if (!validateForm()) return;

    const newTodo = {
        id: Date.now(),
        title: titleInput.value,
        description: descriptionInput.value,
        deadline: deadlineInput.value,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null
    };

    todos.push(newTodo);
    saveTodos();
    resetForm();
    renderTodos();
}

function updateTodo(event) {
    event.preventDefault();

    if (!validateForm()) return;

    const index = todos.findIndex(todo => todo.id === editingTodoId);
    if (index !== -1 && !todos[index].completed) {
        todos[index] = {
            ...todos[index],
            title: titleInput.value,
            description: descriptionInput.value,
            deadline: deadlineInput.value
        };
        saveTodos();
        resetForm();
        renderTodos();
    }
}

function deleteTodo(id) {
    if (confirm('Apakah Anda yakin ingin menghapus tugas ini?')) {
        todos = todos.filter(todo => todo.id !== id);
        saveTodos();
        renderTodos();
    }
}

function completeTodo(id) {
    const todo = todos.find(todo => todo.id === id);
    if (todo && !todo.completed) {
        todo.completed = true;
        todo.completedAt = new Date().toISOString();
        saveTodos();
        renderTodos();
    }
}

function formatDate(date) {
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).format(new Date(date));
}

function renderTodos() {
    const searchTerm = searchInput.value.toLowerCase();
    
    const filteredTodos = todos
        .filter(todo =>
            todo.title.toLowerCase().includes(searchTerm) ||
            todo.description.toLowerCase().includes(searchTerm)
        )
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    todoList.innerHTML = '';

    if (filteredTodos.length === 0) {
        todoList.innerHTML = `
            <div class="empty-state">
                Belum ada tugas. Tambahkan tugas baru!
            </div>
        `;
        return;
    }

    filteredTodos.forEach(todo => {
        const isNew = (new Date() - new Date(todo.createdAt)) < 1000 * 60 * 60; // 1 jam
        
        const todoElement = document.createElement('div');
        todoElement.className = `todo-item ${todo.completed ? 'completed' : ''} ${isNew ? 'new' : ''}`;
        
        todoElement.innerHTML = `
            <div class="todo-header">
                <div class="todo-content">
                    <h3 class="todo-title">${todo.title}</h3>
                    <p class="todo-description">${todo.description}</p>
                    <div class="todo-deadline">
                        🗓️ ${formatDate(todo.deadline)}
                    </div>
                    ${todo.completed ? `
                        <div class="todo-completed-at">
                            ✅ Selesai pada: ${formatDate(todo.completedAt)}
                        </div>
                    ` : ''}
                </div>
                <div class="todo-actions">
                    ${!todo.completed ? `
                        <button onclick="completeTodo(${todo.id})" class="todo-btn complete" title="Tandai selesai">
                            ✓
                        </button>
                        <button onclick="startEdit(${todo.id})" class="todo-btn edit" title="Edit tugas">
                            ✎
                        </button>
                    ` : ''}
                    <button onclick="deleteTodo(${todo.id})" class="todo-btn delete" title="Hapus tugas">
                        🗑️
                    </button>
                </div>
            </div>
        `;

        todoList.appendChild(todoElement);
    });
}

function startEdit(id) {
    const todo = todos.find(todo => todo.id === id);
    if (todo && !todo.completed) {
        editingTodoId = id;
        titleInput.value = todo.title;
        descriptionInput.value = todo.description;
        deadlineInput.value = todo.deadline;
        cancelEditBtn.style.display = 'inline-flex';
        todoForm.querySelector('button[type="submit"]').textContent = 'Update Tugas';
        titleInput.focus();
    }
}

function resetForm() {
    editingTodoId = null;
    todoForm.reset();
    cancelEditBtn.style.display = 'none';
    todoForm.querySelector('button[type="submit"]').innerHTML = '<span class="plus-icon">+</span> Tambah Tugas';
    
    document.getElementById('titleError').textContent = '';
    document.getElementById('descriptionError').textContent = '';
    document.getElementById('deadlineError').textContent = '';
}


function saveTodos() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todos));
}


function toggleTheme() {
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem(LOCAL_STORAGE_THEME_KEY, isDark);
}


function updateClock() {
    clockElement.textContent = formatDate(new Date());
}


document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    renderTodos();
    updateClock();
    setInterval(updateClock, 1000);
});

todoForm.addEventListener('submit', (e) => {
    if (editingTodoId) {
        updateTodo(e);
    } else {
        addTodo(e);
    }
});

cancelEditBtn.addEventListener('click', resetForm);
themeToggle.addEventListener('click', toggleTheme);
searchInput.addEventListener('input', renderTodos);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && editingTodoId) {
        resetForm();
    }
});