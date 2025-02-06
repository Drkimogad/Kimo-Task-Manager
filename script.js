let currentUser = null; // For keeping track of logged-in user
let isDarkMode = localStorage.getItem('isDarkMode') === 'true'; // Track dark mode state

document.addEventListener("DOMContentLoaded", function () {
    const taskInput = document.getElementById("taskInput");
    const addTaskBtn = document.getElementById("addTaskBtn");
    const taskList = document.getElementById("taskList");
    const taskTemplates = document.getElementById("taskTemplates");
    const categorySelect = document.getElementById("categorySelect");
    const darkModeToggle = document.getElementById("darkModeToggle");
    const progressBar = document.getElementById("progress");
    const logoutBtn = document.getElementById("logoutBtn");
    const reminderInput = document.getElementById("reminderInput");

    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    function saveTasks() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    function updateProgressBar() {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;
        const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        progressBar.style.width = `${progress}%`;
    }

    function renderTasks() {
        taskList.innerHTML = "";
        tasks.forEach((task, index) => {
            const taskItem = document.createElement("div");
            taskItem.classList.add("task-item");
            if (task.completed) {
                taskItem.classList.add("done");
            }

            taskItem.innerHTML = `
                <span class="task-description">${task.text} <span class="priority-${task.priority.toLowerCase()}">(${task.priority})</span></span>
                <small>${task.category}</small>
                <input type="date" value="${task.reminder}" class="task-reminder" data-index="${index}">
                <button class="completeTaskBtn" data-index="${index}">✔</button>
                <button class="deleteTaskBtn" data-index="${index}">❌</button>
            `;

            taskList.appendChild(taskItem);
        });

        updateProgressBar();
        saveTasks();
    }

    addTaskBtn.addEventListener("click", function () {
        const taskText = taskInput.value.trim();
        const category = categorySelect.value;
        const reminder = reminderInput.value;

        if (taskText !== "") {
            tasks.push({ text: taskText, completed: false, priority: "Medium", category, reminder });
            taskInput.value = "";
            reminderInput.value = "";
            renderTasks();
        }
    });

    taskList.addEventListener("click", function (e) {
        if (e.target.classList.contains("completeTaskBtn")) {
            const index = e.target.dataset.index;
            tasks[index].completed = !tasks[index].completed;
            renderTasks();
        }

        if (e.target.classList.contains("deleteTaskBtn")) {
            const index = e.target.dataset.index;
            tasks.splice(index, 1);
            renderTasks();
        }
    });

    taskTemplates.addEventListener("click", function (e) {
        if (e.target.tagName === "LI") {
            taskInput.value = e.target.innerText;
        }
    });

    darkModeToggle.addEventListener("click", function () {
        document.body.classList.toggle("dark-mode");
        localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
    });

    taskList.addEventListener("input", function (e) {
        if (e.target.classList.contains("task-reminder")) {
            const index = e.target.dataset.index;
            tasks[index].reminder = e.target.value;
            saveTasks();
        }
    });

    logoutBtn.addEventListener("click", function () {
        localStorage.removeItem("tasks");
        window.location.href = "login.html";
    });

    if (localStorage.getItem("darkMode") === "true") {
        document.body.classList.add("dark-mode");
    }

    renderTasks();
});

// The rest of the original script.js content...
function isLoggedIn() {
    return localStorage.getItem('loggedIn') === 'true';
}

function getLoggedInUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

// Secure hash password (using SHA-256 for demonstration purposes)
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
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
            <h1>Kimo Task Manager</h1>
            <nav>
                ${isLoggedIn() ? `<button id="logoutButton">Logout</button>` : `<span>A simple task management app with voice commands.</span>`}
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
        <h1>Kimo Task Manager</h1>
        <form id="authForm">
            <label for="email">Email:</label>
            <input type="email" id="email" required>
            <label for="password">Password:</label>
            <input type="password" id="password" required>
            <button type="submit">Sign In</button>
        </form>
        <p>Don't have an account? <a href="#" onclick="showSignUp()">Sign Up</a></p>
    ` : `
        <h1>Kimo Task Manager</h1>
        <form id="authForm">
            <label for="newEmail">Email:</label>
            <input type="email" id="newEmail" required>
            <label for="newPassword">Password:</label>
            <input type="password" id="newPassword" required>
            <button type="submit">Sign Up</button>
        </form>
        <p>Already have an account? <a href="#" onclick="showSignIn()">Sign In</a></p>
    `;

    const authContainer = document.createElement('div');
    authContainer.className = 'auth-container';
    authContainer.innerHTML = `
        ${formHTML}
        <p id="error-message" class="error-message"></p>
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
    const hashedPassword = await hashPassword(password);
    const user = users.find(user => user.email === email && user.password === hashedPassword);

    if (user) {
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify(user));
        showDashboard();
    } else {
        document.getElementById('error-message').textContent = 'Invalid credentials. Please try again.';
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

    // Create dashboard container element
    const dashboardContainer = document.createElement('div');
    dashboardContainer.className = 'dashboard-container';
    dashboardContainer.innerHTML = `
        <h2>Welcome to your dashboard, ${currentUser.email}!</h2>
        <button id="toggleDarkMode" class="dark-mode-button">🌙 Toggle Dark Mode</button>
        <div class="progress-bar">
            <div id="progress" class="progress"></div>
        </div>
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
        </div>
        <div class="chat-container">
            <div id="chatBox" class="chat-box"></div>
            <form id="taskInputForm">
                <label for="taskInput">Ask me to add, delete, or update a task:</label>
                <input type="text" id="taskInput" required>
                <button type="submit">Send</button>
                <button type="button" id="showTemplates">Show Task Templates</button>
                <div id="taskTemplates"></div>
            </form>
            <button id="startVoice" class="voice-button">🎤 Start Voice Command</button>
        </div>
        <div class="task-container">
            <h2>Your Tasks</h2>
            <ul id="taskList"></ul>
        </div>
    `;
    content.appendChild(dashboardContainer);

    // Attach event listeners for dashboard elements
    document.getElementById('applyFilter').addEventListener('click', function () {
        const filterCategory = document.getElementById('filterCategory').value;
        displayTasks(filterCategory);
    });

    document.getElementById('taskInputForm').addEventListener('submit', function (event) {
        event.preventDefault();
        const taskInput = document.getElementById('taskInput').value.toLowerCase();
        handleUserInput(taskInput);
        document.getElementById('taskInput').value = ''; // Clear input field
    });

    document.getElementById('showTemplates').addEventListener('click', showTaskTemplates);
    document.getElementById('startVoice').addEventListener('click', startVoiceRecognition);

    document.getElementById('toggleDarkMode').addEventListener('click', function () {
        isDarkMode = !isDarkMode;
        document.body.classList.toggle('dark-mode', isDarkMode);
        localStorage.setItem('isDarkMode', isDarkMode);
    });

    displayTasks();
    updateProgressBar();
}

// Parse task input for description, due date, priority, category, subcategory, and reminder time
function parseTaskInput(input) {
    const dueDateMatch = input.match(/\d{1,2}\/\d{1,2}\/\d{4}/); // Extract date (MM/DD/YYYY)
    const timeMatch = input.match(/\d{1,2}:\d{2}\s?(AM|PM)?/i); // Extract time (HH:MM AM/PM)
    const priorityMatch = input.match(/high|medium|low/i); // Extract priority
    const categoryMatch = input.match(/work|medical|healthcare|exercise|personal|shopping|travel|school|veterinary/i); // Extract category
    const subCategoryMatch = input.match(/groceries|electronics|clothing|food|appliances|drinks|beauty care|appointments|toiletries|upcoming holiday|school trips|gym|park|running|walking|diet|dog parks/i);

    return {
        description: input.replace(/add task|create task|task/i, '').trim(), // Remove command keywords
        dueDate: dueDateMatch ? dueDateMatch[0] : null,
        time: timeMatch ? timeMatch[0] : null,
        priority: priorityMatch ? priorityMatch[0] : 'Medium',
        category: categoryMatch ? categoryMatch[0] : 'Other',
        subCategory: subCategoryMatch ? subCategoryMatch[0] : '',
    };
}

// Handle the user input to add/delete/update tasks
function handleUserInput(input) {
    console.log(`Handling user input: ${input}`);
    if (input.includes('add task') || input.includes('create task')) {
        const taskDetails = parseTaskInput(input);
        if (taskDetails.description) {
            addTask(taskDetails.description, taskDetails.category, taskDetails.subCategory, taskDetails.dueDate, taskDetails.priority, taskDetails.time);
            updateChatBox(`Task "${taskDetails.description}" added.`);
            speak(`Task "${taskDetails.description}" added.`);
        } else {
            updateChatBox('Please specify a task.');
            speak('Please specify a task.');
        }
    } else if (input.includes('delete task')) {
        const taskId = parseInt(input.replace('delete task', '').trim());
        if (taskId && !isNaN(taskId)) {
            deleteTask(taskId - 1); // Assuming task IDs start from 1
            updateChatBox(`Task ${taskId} deleted.`);
            speak(`Task ${taskId} deleted.`);
        } else {
            updateChatBox('Please specify a valid task ID to delete.');
            speak('Please specify a valid task ID to delete.');
        }
    } else if (input.includes('mark as done')) {
        const taskId = parseInt(input.replace('mark task', '').replace('as done', '').trim());
        if (taskId && !isNaN(taskId)) {
            markTaskAsDone(taskId - 1);
            updateChatBox(`Task ${taskId} marked as done.`);
            speak(`Task ${taskId} marked as done.`);
        } else {
            updateChatBox('Please specify a valid task ID to mark as done.');
            speak('Please specify a valid task ID to mark as done.');
        }
    } else {
        updateChatBox('Sorry, I didn\'t understand that. Try "add task", "delete task", or "mark as done".');
        speak('Sorry, I didn\'t understand that. Try "add task", "delete task", or "mark as done".');
    }
}

// Update the chatbox with bot's response
function updateChatBox(message) {
    console.log(`Updating chatbox with message: ${message}`);
    const chatBox = document.getElementById('chatBox');
    const messageDiv = document.createElement('div');
    messageDiv.textContent = `Bot: ${message}`;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Add a new task to the list with reminder
function addTask(description, category = 'Other', subCategory = '', dueDate = null, priority = 'Medium', reminderTime = null) {
    if (!description) {
        updateChatBox('Error: Task description cannot be empty.');
        speak('Error: Task description cannot be empty.');
        return;
    }

    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const task = { id: tasks.length + 1, description, category, subCategory, dueDate, priority, done: false, reminderTime };
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    displayTasks();
    updateProgressBar();
    if (reminderTime) {
        setReminder(task);
    }
}

// Set a reminder for a task
function setReminder(task) {
    const now = new Date();
    const reminderDate = new Date(`${now.toDateString()} ${task.reminderTime}`);
    const timeout = reminderDate.getTime() - now.getTime();

    if (timeout > 0) {
        setTimeout(() => {
            new Notification('Task Reminder', {
                body: `Reminder for task: ${task.description}`,
                icon: 'icon-192x192.png'
            });
        }, timeout);
    }
}

// Display tasks in the task list
function displayTasks(filterCategory = 'All') {
    console.log("Displaying tasks");
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach((task, index) => {
        if (filterCategory === 'All' || task.category === filterCategory) {
            const li = document.createElement('li');
            li.classList.add('task-item');
            li.innerHTML = `
                <span class="task-description ${task.done ? 'done' : ''}">
                    ${task.description} (${task.category}/${task.subCategory}) - Due: ${task.dueDate || 'No deadline'} - Priority: ${task.priority}
                </span>
                <button class="mark-done" onclick="markTaskAsDone(${index})">${task.done ? 'Undo' : 'Mark as Done'}</button>
                <button class="delete" onclick="deleteTask(${index})">Delete</button>
            `;
            taskList.appendChild(li);
        }
    });
}

// Mark a task as done or undo
