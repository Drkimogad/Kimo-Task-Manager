let currentUser = null; // For keeping track of logged-in user
let isDarkMode = false; // Track dark mode state

// Helper functions for login state
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
    // Clear the logged-in state and current user from localStorage
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('currentUser');

    // Redirect to the sign-in page
    showSignIn();
}

// Render Header
function renderHeader() {
    const header = document.createElement('header');
    header.innerHTML = `
        <div class="header-container">
            <h1>Kimo Task Manager</h1>
            <nav>
                ${isLoggedIn() ? `
                    <button id="logoutButton">Logout</button>
                ` : `
                    <span>A simple task management app with voice commands.</span>
                `}
            </nav>
        </div>
    `;

    // Add logout functionality if user is logged in
    if (isLoggedIn()) {
        header.querySelector('#logoutButton').addEventListener('click', logout);
    }

    return header;
}

// Render Auth Page (Helper function for sign-in and sign-up pages)
function renderAuthPage(authType) {
    const content = document.getElementById('content');
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

    content.innerHTML += `
        <div class="auth-container">
            ${formHTML}
            <p id="error-message" class="error-message"></p>
        </div>
    `;

    document.getElementById('authForm').addEventListener('submit', authType === 'signIn' ? handleSignIn : handleSignUp);
}

// Render Sign-In Page
function showSignIn() {
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
    console.log("Rendering Dashboard");
    if (!isLoggedIn()) {
        showSignIn();
        return;
    }

    currentUser = getLoggedInUser();
    const content = document.getElementById('content');
    content.innerHTML = ''; // Clear existing content
    content.appendChild(renderHeader()); // Add header
    content.innerHTML += `
        <div class="dashboard-container">
            <h2>Welcome to your dashboard, ${currentUser.email}!</h2>
            <button id="toggleDarkMode" class="dark-mode-button">🌙 Toggle Dark Mode</button>
            <div class="progress-bar">
                <div id="progress" class="progress"></div>
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
        </div>
    `;

    // Handle the task input and interaction with bot
    document.getElementById('taskInputForm').addEventListener('submit', function (event) {
        event.preventDefault();
        const taskInput = document.getElementById('taskInput').value.toLowerCase();
        handleUserInput(taskInput);
        document.getElementById('taskInput').value = ''; // Clear input field
    });

    // Show task templates
    document.getElementById('showTemplates').addEventListener('click', showTaskTemplates);

    // Voice command button
    document.getElementById('startVoice').addEventListener('click', function () {
        startVoiceRecognition();
    });

    // Dark mode toggle
    document.getElementById('toggleDarkMode').addEventListener('click', function () {
        isDarkMode = !isDarkMode;
        document.body.classList.toggle('dark-mode', isDarkMode);
    });

    displayTasks();
    updateProgressBar();
}

// Parse task input for description, due date, priority, category, and subcategory
function parseTaskInput(input) {
    const dueDateMatch = input.match(/\d{1,2}\/\d{1,2}\/\d{4}/); // Extract date
    const priorityMatch = input.match(/high|medium|low/i); // Extract priority
    const categoryMatch = input.match(/work|medical|healthcare|exercise|personal|shopping|travel|school|veterinary/i); // Extract category
    const subCategoryMatch = input.match(/groceries|electronics|clothing|food|appliances|drinks|beauty care|appointments|toiletries|upcoming holiday|school trips|gym|park|running|walking|diet|dog food|.../i);

    return {
        description: input.replace(/add task|create task|task/i, '').trim(), // Remove command keywords
        dueDate: dueDateMatch ? dueDateMatch[0] : null,
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
            addTask(taskDetails.description, taskDetails.category, taskDetails.subCategory, taskDetails.dueDate, taskDetails.priority);
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

// Add a new task to the list
function addTask(description, category = 'Other', subCategory = '', dueDate = null, priority = 'Medium') {
    console.log(`Adding task: ${description}`);
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push({ id: tasks.length + 1, description, category, subCategory, dueDate, priority, done: false });
    localStorage.setItem('tasks', JSON.stringify(tasks));
    displayTasks();
    updateProgressBar();
}

// Display tasks in the task list
function displayTasks() {
    console.log("Displaying tasks");
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach((task, index) => {
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
    });
}

// Mark a task as done or undo
function markTaskAsDone(index) {
    console.log(`Marking task as done: ${index}`);
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    if (tasks[index]) {
        tasks[index].done = !tasks[index].done; // Toggle done state
        localStorage.setItem('tasks', JSON.stringify(tasks));
        displayTasks();
        updateProgressBar();
    }
}

// Delete a task
function deleteTask(index) {
    console.log(`Deleting task: ${index}`);
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.splice(index, 1);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    displayTasks();
    updateProgressBar();
}

// Update progress bar
function updateProgressBar() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const completedTasks = tasks.filter(task => task.done).length;
    const progress = (completedTasks / tasks.length) * 100 || 0;
    document.getElementById('progress').style.width = `${progress}%`;
}

// Start Speech Recognition
function startVoiceRecognition() {
    if (!('webkitSpeechRecognition' in window)) {
        alert('Your browser does not support speech recognition.');
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = function () {
        console.log('Voice recognition started. Try speaking into the microphone.');
        speak("Hello, how may I help?");
    };

    recognition.onresult = function (event) {
        if (event.results.length > 0) {
            const voiceInput = event.results[0][0].transcript.toLowerCase();
            console.log(`Voice Input: ${voiceInput}`);
            handleUserInput(voiceInput);
        }
    };

    recognition.onerror = function (event) {
        console.error('Speech recognition error', event);
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

// Show task templates
function showTaskTemplates() {
    const templates = [
        "Add task: Buy groceries by 10/15/2023 (Category: Shopping, Subcategory: Groceries, Priority: High)",
        "Add task: Finish project by Friday (Category: Work, Subcategory: Appointments, Priority: Medium)",
        "Add task: Gym at 7 PM (Category: Exercise, Subcategory: Gym, Priority: Low)",
    ];

    const templateList = document.createElement('ul');
    templates.forEach(template => {
        const li = document.createElement('li');
        li.textContent = template;
        li.addEventListener('click', () => {
            document.getElementById('taskInput').value = template;
        });
        templateList.appendChild(li);
    });

    document.getElementById('taskTemplates').appendChild(templateList);
}

// Initialize the app
console.log("Initializing app");
if (isLoggedIn()) {
    showDashboard();
} else {
    showSignIn();
}

// Function to sync tasks when online
async function syncTasks() {
    const db = await openDB();
    const transaction = db.transaction('tasks', 'readonly');
    const store = transaction.objectStore('tasks');
    const tasks = store.getAll();

    tasks.onsuccess = async () => {
        for (const task of tasks.result) {
            await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(task),
            });
        }
    };
}

// Open or create an IndexedDB database
const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('TodoBotDB', 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('tasks')) {
                db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true });
            }
        };

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
};

// Add a task to IndexedDB
const addTaskToDB = async (task) => {
    const db = await openDB();
    const transaction = db.transaction('tasks', 'readwrite');
    const store = transaction.objectStore('tasks');
    store.add(task);
};

// Voice recognition function
function startVoiceRecognition() {
    if (!('webkitSpeechRecognition' in window)) {
        alert('Your browser does not support speech recognition.');
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = function () {
        console.log('Voice recognition started. Try speaking into the microphone.');
        // Kimo's greeting
        const speech = new SpeechSynthesisUtterance("What can I do for you today?");
        window.speechSynthesis.speak(speech);
    };

    recognition.onresult = function (event) {
        if (event.results.length > 0) {
            const voiceInput = event.results[0][0].transcript.toLowerCase();
            console.log(`Voice Input: ${voiceInput}`);
            handleUserInput(voiceInput);
            // Kimo's confirmation
            const speech = new SpeechSynthesisUtterance(`Task "${voiceInput}" received.`);
            window.speechSynthesis.speak(speech);
        }
    };

    recognition.onerror = function (event) {
        console.error('Speech recognition error', event);
    };

    recognition.onend = function () {
        console.log('Voice recognition ended.');
    };

    recognition.start();
}

//JavaScript Snippet to Check for Updates
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('https://drkimogad.github.io/Kimo-Task-Manager/service-worker.js')
            .then((registration) => {
                console.log('Service Worker registered with scope:', registration.scope);
                // Check for service worker updates
                registration.update();

                // Listen for when a new service worker is available and update it
                registration.addEventListener('updatefound', () => {
                    const installingWorker = registration.installing;
                    installingWorker.addEventListener('statechange', () => {
                        if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New version available, notify user and skip waiting
                            if (confirm('A new version of the app is available. Would you like to update?')) {
                                installingWorker.postMessage({ action: 'skipWaiting' });
                            }
                        }
                    });
                });
            })
            .catch((error) => {
                console.error('Error registering service worker:', error);
            });
    });
}
