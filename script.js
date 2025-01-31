let currentUser = null; // For keeping track of logged-in user
let isDarkMode = false; // Track dark mode state

// Helper functions for login state
function isLoggedIn() {
    return localStorage.getItem('loggedIn') === 'true';
}

function getLoggedInUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

// Hash password (basic example, not production-ready)
function hashPassword(password) {
    return btoa(password); // Base64 encoding for demonstration purposes
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
                ${!isLoggedIn() ? `
                    <a href="#" onclick="showSignIn()">Sign In</a>
                    <a href="#" onclick="showSignUp()">Sign Up</a>
                ` : `
                    <button id="logoutButton" class="logout-button">🚪 Logout</button>
                `}
            </nav>
        </div>
    `;

    // Add logout functionality if user is logged in
    if (isLoggedIn()) {
        header.querySelector('#logoutButton').addEventListener('click', function () {
            logout();
        });
    }

    return header;
}

// Render Sign-In Page
function showSignIn() {
    console.log("Rendering Sign-In Page");
    const content = document.getElementById('content');
    content.innerHTML = ''; // Clear existing content
    content.innerHTML += `
        <div class="auth-container">
            <h1>Kimo Task Manager</h1>
            <form id="signInForm">
                <label for="email">Email:</label>
                <input type="email" id="email" required>
                <label for="password">Password:</label>
                <input type="password" id="password" required>
                <button type="submit">Sign In</button>
            </form>
            <p id="error-message" class="error-message"></p>
        </div>
    `;

    document.getElementById('signInForm').addEventListener('submit', function (event) {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(user => user.email === email && user.password === hashPassword(password));

        if (user) {
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('currentUser', JSON.stringify(user));
            showDashboard();
        } else {
            document.getElementById('error-message').textContent = 'Invalid credentials. Please try again.';
        }
    });
}

// Render Sign-Up Page
function showSignUp() {
    console.log("Rendering Sign-Up Page");
    const content = document.getElementById('content');
    content.innerHTML = ''; // Clear existing content
    content.innerHTML += `
        <div class="auth-container">
            <h1>Kimo Task Manager</h1>
            <form id="signUpForm">
                <label for="newEmail">Email:</label>
                <input type="email" id="newEmail" required>
                <label for="newPassword">Password:</label>
                <input type="password" id="newPassword" required>
                <button type="submit">Sign Up</button>
            </form>
            <p id="error-message" class="error-message"></p>
        </div>
    `;

    document.getElementById('signUpForm').addEventListener('submit', function (event) {
        event.preventDefault();
        const newEmail = document.getElementById('newEmail').value;
        const newPassword = document.getElementById('newPassword').value;
        const users = JSON.parse(localStorage.getItem('users')) || [];

        if (users.some(user => user.email === newEmail)) {
let currentUser = null; // For keeping track of logged-in user
let isDarkMode = false; // Track dark mode state

// Helper functions for login state
function isLoggedIn() {
    return localStorage.getItem('loggedIn') === 'true';
}

function getLoggedInUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

// Hash password (basic example, not production-ready)
function hashPassword(password) {
    return btoa(password); // Base64 encoding for demonstration purposes
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
                ${!isLoggedIn() ? `
                    <a href="#" onclick="showSignIn()">Sign In</a>
                    <a href="#" onclick="showSignUp()">Sign Up</a>
                ` : `
                    <button id="logoutButton" class="logout-button">🚪 Logout</button>
                `}
            </nav>
        </div>
    `;

    // Add logout functionality if user is logged in
    if (isLoggedIn()) {
        header.querySelector('#logoutButton').addEventListener('click', function () {
            logout();
        });
    }

    return header;
}

// Render Sign-In Page
function showSignIn() {
    console.log("Rendering Sign-In Page");
    const content = document.getElementById('content');
    content.innerHTML = ''; // Clear existing content
    content.innerHTML += `
        <div class="auth-container">
            <h1>Kimo Task Manager</h1>
            <form id="signInForm">
                <label for="email">Email:</label>
                <input type="email" id="email" required>
                <label for="password">Password:</label>
                <input type="password" id="password" required>
                <button type="submit">Sign In</button>
            </form>
            <p id="error-message" class="error-message"></p>
        </div>
    `;

    document.getElementById('signInForm').addEventListener('submit', function (event) {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(user => user.email === email && user.password === hashPassword(password));

        if (user) {
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('currentUser', JSON.stringify(user));
            showDashboard();
        } else {
            document.getElementById('error-message').textContent = 'Invalid credentials. Please try again.';
        }
    });
}

// Render Sign-Up Page
function showSignUp() {
    console.log("Rendering Sign-Up Page");
    const content = document.getElementById('content');
    content.innerHTML = ''; // Clear existing content
    content.innerHTML += `
        <div class="auth-container">
            <h1>Kimo Task Manager</h1>
            <form id="signUpForm">
                <label for="newEmail">Email:</label>
                <input type="email" id="newEmail" required>
                <label for="newPassword">Password:</label>
                <input type="password" id="newPassword" required>
                <button type="submit">Sign Up</button>
            </form>
            <p id="error-message" class="error-message"></p>
        </div>
    `;

    document.getElementById('signUpForm').addEventListener('submit', function (event) {
        event.preventDefault();
        const newEmail = document.getElementById('newEmail').value;
        const newPassword = document.getElementById('newPassword').value;
        const users = JSON.parse(localStorage.getItem('users')) || [];

        if (users.some(user => user.email === newEmail)) {
            document.getElementById('error-message').textContent = 'Email already exists. Please use a different email.';
        } else {
            users.push({ email: newEmail, password: hashPassword(newPassword) });
            localStorage.setItem('users', JSON.stringify(users));
            alert('Sign up successful! Please sign in.');
            showSignIn();
        }
    });
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

// Ensure the sign-up form shows on the opening of the app by default
console.log("Initializing app");
if (isLoggedIn()) {
    showDashboard();
} else {
    showSignUp();
}

// Handle the user input to add/delete/update tasks
function handleUserInput(input) {
    console.log(`Handling user input: ${input}`);
    if (input.includes('add task')) {
        const taskDescription = input.replace('add task', '').trim();
        if (taskDescription) {
            const category = input.includes('work') ? 'Work' : input.includes('personal') ? 'Personal' : 'Other';
            const dueDate = input.match(/\d{1,2}\/\d{1,2}\/\d{4}/)?.[0] || null; // Extract date from input
            const priority = input.includes('high') ? 'High' : input.includes('medium') ? 'Medium' : 'Low';
            addTask(taskDescription, category, dueDate, priority);
            updateChatBox(`Task "${taskDescription}" added.`);
        } else {
            updateChatBox('Please specify a task.');
        }
    } else if (input.includes('delete task')) {
        const taskId = parseInt(input.replace('delete task', '').trim());
        if (taskId && !isNaN(taskId)) {
            deleteTask(taskId - 1); // Assuming task IDs start from 1
            updateChatBox(`Task ${taskId} deleted.`);
        } else {
            updateChatBox('Please specify a valid task ID to delete.');
        }
    } else if (input.includes('mark as done')) {
        const taskId = parseInt(input.replace('mark task', '').replace('as done', '').trim());
        if (taskId && !isNaN(taskId)) {
            markTaskAsDone(taskId - 1);
            updateChatBox(`Task ${taskId} marked as done.`);
        } else {
            updateChatBox('Please specify a valid task ID to mark as done.');
        }
    } else {
        updateChatBox('Sorry, I didn\'t understand that. Try "add task", "delete task", or "mark as done".');
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
function addTask(description, category = 'Other', dueDate = null, priority = 'Medium') {
    console.log(`Adding task: ${description}`);
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push({ id: tasks.length + 1, description, category, dueDate, priority, done: false });
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
                ${task.description} (${task.category}) - Due: ${task.dueDate || 'No deadline'} - Priority: ${task.priority}
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

// Initialize the app
console.log("Initializing app");
if (isLoggedIn()) {
    showDashboard();
} else {
    showSignIn();
}


// Function to subscribe the user to push notifications
function subscribeUserToPushNotifications(registration) {
    // Check if the user is already subscribed
    registration.pushManager.getSubscription()
        .then(function(subscription) {
            if (subscription) {
                console.log('Already subscribed to push notifications:', subscription);
                // You can send the subscription details to your server here if needed
            } else {
                // If not subscribed, create a new subscription
                registration.pushManager.subscribe({
                    userVisibleOnly: true, // Ensures notifications are visible to the user
                    applicationServerKey: urlB64ToUint8Array('BFT2ZAIuHo5wtIgax8uovZ-mHaZqR8dJz5kaQRsS0JpzeKCqX6Y_27E_R2YFoD_1Z4J93j2BU5rc4hVHT76qbrU') // Replace with your VAPID public key
                })
                .then(function(newSubscription) {
                    console.log('Subscribed to push notifications:', newSubscription);
                    // You can send the subscription details to your server here if needed
                })
                .catch(function(error) {
                    console.error('Failed to subscribe to push notifications:', error);
                });
            }
        })
        .catch(function(error) {
            console.error('Error during subscription check:', error);
        });
}

// Helper function to convert the VAPID public key from Base64 to Uint8Array
function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/\_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

// Modify your script.js file to send the subscription data to your server

const publicVapidKey = 'BFT2ZAIuHo5wtIgax8uovZ-mHaZqR8dJz5kaQRsS0JpzeKCqX6Y_27E_R2YFoD_1Z4J93j2BU5rc4hVHT76qbrU';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(async registration => {
      console.log('Service Worker registered.');

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
      });

      console.log('Subscribed:', subscription);

      // Send subscription to the server
      await fetch('https://pet-studio.vercel.app/api/save-subscription', {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: { 'Content-Type': 'application/json' },
      });
    })
    .catch(console.error);
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
}

