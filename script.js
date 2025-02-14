let currentUser = null; // For keeping track of logged-in user
let isDarkMode = localStorage.getItem('isDarkMode') === 'true'; // Track dark mode state

// Load bcrypt.js for secure password hashing
const bcrypt = dcodeIO.bcrypt;
const saltRounds = 10;

// Helper functions for login state
function isLoggedIn() {
    return localStorage.getItem('loggedIn') === 'true';
}

function getLoggedInUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

// Secure hash password using bcrypt
async function hashPassword(password) {
    return await bcrypt.hash(password, saltRounds);
}

// Logout function
function logout() {
    console.log("Logout button clicked"); // Debugging line
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('currentUser');
    showSignIn(); // Redirect to the sign-in page
}

// Render Header
function renderHeader() {
    const header = document.createElement('header');
    header.innerHTML = `
        <div class="header-container">
            <h1>Tasklyify</h1>
            <nav>
                ${isLoggedIn() ? `<button id="logoutButton" aria-label="Logout">Logout</button>` : `<span>A simple task management app with voice commands.</span>`}
            </nav>
        </div>
    `;

    // Attach event listener to the logout button if it exists
    const logoutButton = header.querySelector('#logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }

    return header;
}

// Render Auth Page (Helper function for sign-in and sign-up pages)
function renderAuthPage(authType) {
    console.log(`Rendering ${authType} page`); // Debugging line
    const content = document.getElementById('content');
    if (!content) {
        console.error("Content element not found!"); // Debugging line
        return;
    }
    content.innerHTML = ''; // Clear existing content
    content.appendChild(renderHeader()); // Add header

    const formHTML = authType === 'signIn' ? `
        <h1>Tasklyify</h1>
        <form id="authForm">
            <label for="email">Email:</label>
            <input type="email" id="email" required aria-required="true">
            <label for="password">Password:</label>
            <input type="password" id="password" required aria-required="true">
            <button type="submit">Sign In</button>
        </form>
        <p>Don't have an account? <a href="#" onclick="showSignUp()">Sign Up</a></p>
    ` : `
        <h1>Tasklyify</h1>
        <form id="authForm">
            <label for="newEmail">Email:</label>
            <input type="email" id="newEmail" required aria-required="true">
            <label for="newPassword">Password:</label>
            <input type="password" id="newPassword" required aria-required="true">
            <button type="submit">Sign Up</button>
        </form>
        <p>Already have an account? <a href="#" onclick="showSignIn()">Sign In</a></p>
    `;

    const authContainer = document.createElement('div');
    authContainer.className = 'auth-container';
    authContainer.innerHTML = `
        ${formHTML}
        <p id="error-message" class="error-message" role="alert"></p>
    `;
    content.appendChild(authContainer);

    document.getElementById('authForm').addEventListener('submit', authType === 'signIn' ? handleSignIn : handleSignUp);
}

// Render Sign-In Page
function showSignIn() {
    console.log("Redirecting to sign-in page"); // Debugging line
    renderAuthPage('signIn');
}

// Render Sign-Up Page
function showSignUp() {
    renderAuthPage('signUp');
}

// Handle Sign-In
async function handleSignIn(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(user => user.email === email);

    if (user) {
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (isPasswordValid) {
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('currentUser', JSON.stringify(user));
            showDashboard();
        } else {
            document.getElementById('error-message').textContent = 'Invalid credentials. Please try again.';
        }
    } else {
        document.getElementById('error-message').textContent = 'User not found. Please sign up.';
    }
}

// Handle Sign-Up
async function handleSignUp(event) {
    event.preventDefault();
    const newEmail = document.getElementById('newEmail').value;
    const newPassword = document.getElementById('newPassword').value;
    const users = JSON.parse(localStorage.getItem('users')) || [];

    if (users.some(user => user.email === newEmail)) {
        document.getElementById('error-message').textContent = 'Email already exists. Please use a different email.';
    } else {
        const hashedPassword = await hashPassword(newPassword);
        users.push({ email: newEmail, password: hashedPassword });
        localStorage.setItem('users', JSON.stringify(users));
        alert('Sign up successful! Please sign in.');
        showSignIn();
    }
}

// NEW: Task Summary Section
function renderTaskSummary() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.done).length;
    const pendingTasks = totalTasks - completedTasks;
    const overdueTasks = tasks.filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        return dueDate < today && !task.done;
    }).length;

    return `
        <div class="task-summary">
            <div class="summary-card">
                <h3>Total Tasks</h3>
                <p>${totalTasks}</p>
            </div>
            <div class="summary-card">
                <h3>Completed Tasks</h3>
                <p>${completedTasks}</p>
            </div>
            <div class="summary-card">
                <h3>Pending Tasks</h3>
                <p>${pendingTasks}</p>
            </div>
            <div class="summary-card">
                <h3>Overdue Tasks</h3>
                <p>${overdueTasks}</p>
            </div>
        </div>
    `;
}

// NEW: Due Date Alerts
function isTaskOverdue(dueDate) {
    if (!dueDate) return false;
    const today = new Date();
    const taskDueDate = new Date(dueDate);
    return taskDueDate < today;
}

function isTaskDueSoon(dueDate) {
    if (!dueDate) return false;
    const today = new Date();
    const taskDueDate = new Date(dueDate);
    const timeDiff = taskDueDate - today;
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    return hoursDiff <= 24 && hoursDiff > 0;
}

// NEW: Task Sorting Options
function sortTasks(tasks, sortBy) {
    switch (sortBy) {
        case 'dueDateAsc':
            return tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        case 'dueDateDesc':
            return tasks.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
        case 'priority':
            const priorityOrder = { High: 1, Medium: 2, Low: 3 };
            return tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        case 'category':
            return tasks.sort((a, b) => a.category.localeCompare(b.category));
        default:
            return tasks;
    }
}

// NEW: Search Bar
function filterTasksBySearch(tasks, searchTerm) {
    return tasks.filter(task => task.description.toLowerCase().includes(searchTerm.toLowerCase()));
}

// NEW: Today's Tasks Section
function getTodaysTasks(tasks) {
    const today = new Date().toLocaleDateString();
    return tasks.filter(task => task.dueDate && new Date(task.dueDate).toLocaleDateString() === today);
}

// NEW: Notes Field for Tasks
function addTask(description, category = 'Other', subCategory = '', dueDate = null, priority = 'Medium', reminderTime = null, notes = '') {
    if (!description) {
        updateChatBox('Error: Task description cannot be empty.');
        speak('Error: Task description cannot be empty.');
        return;
    }

    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const task = { id: tasks.length + 1, description, category, subCategory, dueDate, priority, done: false, reminderTime, notes };
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    displayTasks();
    updateProgressBar();
    if (reminderTime) {
        setReminder(task);
    }
}

// NEW: Voice Command Guide
function showVoiceCommandGuide() {
    const commands = [
        "Add task: 'Add task Buy groceries by 10/15/2023'",
        "Delete task: 'Delete task 1'",
        "Mark as done: 'Mark task 1 as done'",
        "Show tasks: 'Show tasks'",
        "Filter tasks: 'Filter tasks by Work'",
    ];

    const guide = document.createElement('div');
    guide.className = 'voice-command-guide';
    guide.innerHTML = `
        <h3>Supported Voice Commands</h3>
        <ul>
            ${commands.map(cmd => `<li>${cmd}</li>`).join('')}
        </ul>
    `;

    document.getElementById('content').appendChild(guide);
}

// NEW: Task Tags Feature
function addTaskTags(task, tags) {
    task.tags = tags;
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const index = tasks.findIndex(t => t.id === task.id);
    if (index !== -1) {
        tasks[index] = task;
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
}

// NEW: Export Tasks
function exportTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    if (tasks.length === 0) {
        alert('No tasks to export.');
        return;
    }

    const taskData = tasks.map(task => ({
        Description: task.description,
        Category: task.category,
        SubCategory: task.subCategory,
        DueDate: task.dueDate || 'No deadline',
        Priority: task.priority,
        Status: task.done ? 'Done' : 'Pending',
        Notes: task.notes || '',
        Tags: task.tags ? task.tags.join(', ') : ''
    }));

    const csvContent = "data:text/csv;charset=utf-8," 
        + "Description,Category,SubCategory,Due Date,Priority,Status,Notes,Tags\n"
        + taskData.map(task => Object.values(task).join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'tasks_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Render Dashboard
function showDashboard() {
    if (!isLoggedIn()) {
        showSignIn();
        return;
    }

    currentUser = getLoggedInUser();
    const content = document.getElementById('content');
    content.innerHTML = ''; // Clear existing content

    // Append header separately to preserve its event listeners
    const header = renderHeader();
    content.appendChild(header);

    // NEW: Add Task Summary Section
    content.innerHTML += renderTaskSummary();

    // Create dashboard container element
    const dashboardContainer = document.createElement('div');
    dashboardContainer.className = 'dashboard-container';
    dashboardContainer.innerHTML = `
        <h2>Welcome to your dashboard, ${currentUser.email}!</h2>
        <button id="toggleDarkMode" class="dark-mode-button" aria-label="Toggle Dark Mode">🌙 Toggle Dark Mode</button>
        <div class="progress-bar">
            <div id="progress" class="progress"></div>
        </div>
        <div class="chat-container">
            <div id="chatBox" class="chat-box"></div>
            <form id="taskInputForm">
                <label for="taskInput">Ask me to add, delete, or update a task:</label>
                <input type="text" id="taskInput" required aria-required="true">
                <button type="submit">Send</button>
                <button type="button" id="showTemplates">Show Task Templates</button>
                <div id="taskTemplates"></div>
            </form>
            <button id="startVoice" class="voice-button" aria-label="Start Voice Command">🎤 Start Voice Command</button>
            <button id="showVoiceCommands" class="voice-command-button" aria-label="Show Voice Commands">🗣️ Voice Commands</button>
        </div>
        <div class="task-container">
            <h2>Your Tasks</h2>
            <div class="task-filters">
                <label for="filterCategory">Filter by Category:</label>
                <select id="filterCategory">
                    <option value="All">All</option>
                    <option value="Work">Work</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Exercise">Exercise</option>
                    <option value="Personal">Personal</option>
                </select>
                <button id="applyFilter">Apply Filter</button>
                <label for="sortTasks">Sort by:</label>
                <select id="sortTasks">
                    <option value="default">Default</option>
                    <option value="dueDateAsc">Due Date (Ascending)</option>
                    <option value="dueDateDesc">Due Date (Descending)</option>
                    <option value="priority">Priority</option>
                    <option value="category">Category</option>
                </select>
                <button id="applySort">Apply Sort</button>
                <input type="text" id="searchTasks" placeholder="Search tasks...">
                <button id="applySearch">Search</button>
            </div>
            <ul id="taskList"></ul>
            <button id="exportTasks" class="export-button">Export Tasks</button>
        </div>
        <div class="todays-tasks">
            <h2>Today's Tasks</h2>
            <ul id="todaysTaskList"></ul>
        </div>
    `;
    content.appendChild(dashboardContainer);

    // Attach event listeners for dashboard elements
    document.getElementById('applyFilter').addEventListener('click', function () {
        const filterCategory = document.getElementById('filterCategory').value;
        displayTasks(filterCategory);
    });

    document.getElementById('applySort').addEventListener('click', function () {
        const sortBy = document.getElementById('sortTasks').value;
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const sortedTasks = sortTasks(tasks, sortBy);
        displayTasks(null, sortedTasks);
    });

    document.getElementById('applySearch').addEventListener('click', function () {
        const searchTerm = document.getElementById('searchTasks').value;
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const filteredTasks = filterTasksBySearch(tasks, searchTerm);
        displayTasks(null, filteredTasks);
    });

    document.getElementById('taskInputForm').addEventListener('submit', function (event) {
        event.preventDefault();
        const taskInput = document.getElementById('taskInput').value.toLowerCase();
        handleUserInput(taskInput);
        document.getElementById('taskInput').value = ''; // Clear input field
    });

    document.getElementById('showTemplates').addEventListener('click', showTaskTemplates);
    document.getElementById('startVoice').addEventListener('click', startVoiceRecognition);
    document.getElementById('showVoiceCommands').addEventListener('click', showVoiceCommandGuide);

    document.getElementById('toggleDarkMode').addEventListener('click', function () {
        isDarkMode = !isDarkMode;
        document.body.classList.toggle('dark-mode', isDarkMode);
        localStorage.setItem('isDarkMode', isDarkMode);
    });

    document.getElementById('exportTasks').addEventListener('click', exportTasks);

    displayTasks();
    updateProgressBar();
}

// NEW: Display Today's Tasks

// Initialize the app
console.log("Initializing app");
if (isLoggedIn()) {
    showDashboard();
} else {
    showSignIn();
}
