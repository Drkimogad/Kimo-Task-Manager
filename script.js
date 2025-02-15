let currentUser = null; // For keeping track of logged-in user
let isDarkMode = localStorage.getItem('isDarkMode') === 'true'; // Track dark mode state

// Load bcrypt.js for secure password hashing
if (typeof dcodeIO !== 'undefined' && dcodeIO.bcrypt) {
    var bcrypt = dcodeIO.bcrypt;
} else {
    console.error('bcrypt library not loaded');
}
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
    try {
        return await bcrypt.hash(password, saltRounds);
    } catch (error) {
        console.error('Error hashing password:', error);
    }
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
        try {
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (isPasswordValid) {
                localStorage.setItem('loggedIn', 'true');
                localStorage.setItem('currentUser', JSON.stringify(user));
                showDashboard();
            } else {
                document.getElementById('error-message').textContent = 'Invalid credentials. Please try again.';
            }
        } catch (error) {
            console.error('Error comparing password:', error);
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
        try {
            const hashedPassword = await hashPassword(newPassword);
            users.push({ email: newEmail, password: hashedPassword });
            localStorage.setItem('users', JSON.stringify(users));
            alert('Sign up successful! Please sign in.');
            showSignIn();
        } catch (error) {
            console.error('Error hashing password:', error);
        }
    }
}

// Render Task Summary
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
        ${renderTaskSummary()}
        <button id="toggleDarkMode" class="dark-mode-button" aria-label="Toggle Dark Mode">🌙 Toggle Dark Mode</button>
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
        <div class="task-sorting">
            <label for="sortTasks">Sort by:</label>
            <select id="sortTasks">
                <option value="dueDateAsc">Due Date (Ascending)</option>
                <option value="dueDateDesc">Due Date (Descending)</option>
                <option value="priority">Priority</option>
                <option value="category">Category</option>
            </select>
            <button id="applySort">Apply Sort</button>
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
        </div>
        <div class="task-container">
            <h2>Your Tasks</h2>
            <ul id="taskList"></ul>
        </div>
        <button id="showVoiceCommands">Show Voice Commands</button>
        <button id="exportTasks">Export Tasks</button>
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

    // Initialize tasks and progress bar
    displayTasks();
    updateProgressBar();
}

// Voice Recognition Functionality
function startVoiceRecognition() {
    if (!('webkitSpeechRecognition' in window)) {
        alert('Your browser does not support speech recognition. Please use Google Chrome.');
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = function () {
        console.log('Voice recognition started. Speak now.');
        speak("Listening...");
    };

    recognition.onresult = function (event) {
        const voiceInput = event.results[0][0].transcript.toLowerCase();
        console.log('Voice Input:', voiceInput);
        handleUserInput(voiceInput);
    };

    recognition.onerror = function (event) {
        console.error('Speech recognition error:', event.error);
        speak("Sorry, I didn't catch that. Please try again.");
    };

    recognition.onend = function () {
        console.log('Voice recognition ended.');
    };

    recognition.start();
}

// Speak a message
function speak(message) {
    const speech = new SpeechSynthesisUtterance(message);
    window.speechSynthesis.speak(speech);
}

// Handle user input (voice or text)
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

// ---------- Added Missing Functions ----------

// Function to show task templates
function showTaskTemplates() {
    const templatesDiv = document.getElementById('taskTemplates');
    const templates = [
        { description: "Buy groceries", category: "Shopping" },
        { description: "Finish report", category: "Work" },
        { description: "Go for a run", category: "Exercise" },
        { description: "Call mom", category: "Personal" }
    ];

    templatesDiv.innerHTML = ''; // Clear previous templates
    templates.forEach(template => {
        const button = document.createElement('button');
        button.textContent = template.description;
        button.addEventListener('click', () => {
            // Pre-fill the task input with the template details
            document.getElementById('taskInput').value = `add task ${template.description} category ${template.category}`;
            templatesDiv.innerHTML = ''; // Clear templates after selection
        });
        templatesDiv.appendChild(button);
    });
}

// Function to parse task input from user
function parseTaskInput(input) {
    let details = {
        description: '',
        category: 'General',
        subCategory: '',
        dueDate: '',
        priority: 'Normal',
        time: ''
    };

    // Remove "add task" or "create task" from the input
    input = input.replace('add task', '').replace('create task', '').trim();

    // Extract category if specified (e.g., "category work")
    let categoryMatch = input.match(/category (\w+)/);
    if (categoryMatch) {
        details.category = categoryMatch[1];
        input = input.replace(/category \w+/, '').trim();
    }

    // Extract due date if specified (e.g., "due tomorrow" or "due 2025-02-16")
    let dueMatch = input.match(/due ([\w\-\/]+)/);
    if (dueMatch) {
        details.dueDate = dueMatch[1];
        input = input.replace(/due [\w\-\/]+/, '').trim();
    }

    // Extract priority if specified (e.g., "priority high")
    let priorityMatch = input.match(/priority (\w+)/);
    if (priorityMatch) {
        details.priority = priorityMatch[1];
        input = input.replace(/priority \w+/, '').trim();
    }

    // The remaining input is considered the description
    details.description = input.trim();
    return details;
}

// Function to add a new task
function addTask(description, category, subCategory, dueDate, priority, time) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const newTask = {
        description,
        category,
        subCategory,
        dueDate,
        priority,
        time,
        done: false
    };
    tasks.push(newTask);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    displayTasks();
    updateProgressBar();
}

// Function to delete a task by index
function deleteTask(taskIndex) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    if (taskIndex >= 0 && taskIndex < tasks.length) {
        tasks.splice(taskIndex, 1);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        displayTasks();
        updateProgressBar();
    }
}

// Function to mark a task as done by index
function markTaskAsDone(taskIndex) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    if (taskIndex >= 0 && taskIndex < tasks.length) {
        tasks[taskIndex].done = true;
        localStorage.setItem('tasks', JSON.stringify(tasks));
        displayTasks();
        updateProgressBar();
    }
}

// Function to display tasks, optionally filtering by category or using a provided tasks array
function displayTasks(filterCategory = 'All', tasksArray = null) {
    const taskList = document.getElementById('taskList');
    if (!taskList) return;
    taskList.innerHTML = '';
    let tasks = tasksArray || JSON.parse(localStorage.getItem('tasks')) || [];
    if (filterCategory && filterCategory !== 'All') {
        tasks = tasks.filter(task => task.category.toLowerCase() === filterCategory.toLowerCase());
    }
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. [${task.category}] ${task.description} - ${task.done ? 'Done' : 'Pending'}`;
        // Add delete button for each task
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => {
            deleteTask(index);
        });
        li.appendChild(deleteButton);
        // Add mark as done button if task is not done
        if (!task.done) {
            const doneButton = document.createElement('button');
            doneButton.textContent = 'Mark as Done';
            doneButton.addEventListener('click', () => {
                markTaskAsDone(index);
            });
            li.appendChild(doneButton);
        }
        taskList.appendChild(li);
    });
}

// Function to update the progress bar based on completed tasks
function updateProgressBar() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const total = tasks.length;
    const completed = tasks.filter(task => task.done).length;
    const progress = total === 0 ? 0 : (completed / total) * 100;
    const progressDiv = document.getElementById('progress');
    if (progressDiv) {
        progressDiv.style.width = progress + '%';
    }
}

// Function to sort tasks based on selected criteria
function sortTasks(tasks, sortBy) {
    let sortedTasks = [...tasks];
    switch (sortBy) {
        case 'dueDateAsc':
            sortedTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
            break;
        case 'dueDateDesc':
            sortedTasks.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
            break;
        case 'priority':
            // Assuming priority values: high, normal, low
            const priorityOrder = { 'high': 1, 'normal': 2, 'low': 3 };
            sortedTasks.sort((a, b) => (priorityOrder[a.priority.toLowerCase()] || 4) - (priorityOrder[b.priority.toLowerCase()] || 4));
            break;
        case 'category':
            sortedTasks.sort((a, b) => a.category.localeCompare(b.category));
            break;
        default:
            break;
    }
    return sortedTasks;
}

// Function to export tasks as a JSON file
function exportTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "tasks.json");
    document.body.appendChild(downloadAnchor); // Required for Firefox
    downloadAnchor.click();
    downloadAnchor.remove();
}

// Function to show available voice commands
function showVoiceCommandGuide() {
    const guide = `
Supported Voice Commands:
- "add task [task description] category [category] due [date] priority [level]"
- "delete task [task number]"
- "mark as done [task number]"
    `;
    alert(guide);
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function () {
    console.log("Initializing app");
    if (isLoggedIn()) {
        showDashboard();
    } else {
        showSignIn();
    }
});
