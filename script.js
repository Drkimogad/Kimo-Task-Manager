let currentUser = null; // Track logged-in user
let isDarkMode = localStorage.getItem('isDarkMode') === 'true';

// Check login status
function isLoggedIn() {
    return localStorage.getItem('loggedIn') === 'true';
}

// Retrieve logged-in user
function getLoggedInUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

// Securely hash password using SHA-256
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Logout function
function logout() {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('currentUser');
    showSignIn();
}

// Render header
function renderHeader() {
    const header = document.createElement('header');
    header.innerHTML = `
        <div class="header-container">
            <h1>Kimo Task Manager</h1>
            <nav>
                ${isLoggedIn() ? `<button id="logoutButton">Logout</button>` : `<span>Manage tasks efficiently</span>`}
            </nav>
        </div>
    `;
    if (isLoggedIn()) {
        header.querySelector('#logoutButton').addEventListener('click', logout);
    }
    return header;
}

// Render sign-in and sign-up pages dynamically
function renderAuthPage(authType) {
    const content = document.getElementById('content');
    content.innerHTML = '';
    content.appendChild(renderHeader());

    const formHTML = authType === 'signIn' ? `
        <h1>Sign In</h1>
        <form id="authForm">
            <input type="email" id="email" placeholder="Email" required>
            <input type="password" id="password" placeholder="Password" required>
            <button type="submit">Sign In</button>
        </form>
        <p>Don't have an account? <a href="#" onclick="showSignUp()">Sign Up</a></p>
    ` : `
        <h1>Sign Up</h1>
        <form id="authForm">
            <input type="email" id="newEmail" placeholder="Email" required>
            <input type="password" id="newPassword" placeholder="Password" required>
            <button type="submit">Sign Up</button>
        </form>
        <p>Already have an account? <a href="#" onclick="showSignIn()">Sign In</a></p>
    `;

    const authContainer = document.createElement('div');
    authContainer.className = 'auth-container';
    authContainer.innerHTML = formHTML;
    content.appendChild(authContainer);

    document.getElementById('authForm').addEventListener('submit', authType === 'signIn' ? handleSignIn : handleSignUp);
}

// Show sign-in page
function showSignIn() {
    renderAuthPage('signIn');
}

// Show sign-up page
function showSignUp() {
    renderAuthPage('signUp');
}

// Handle user sign-in
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
        alert('Invalid credentials');
    }
}

// Handle user sign-up
async function handleSignUp(event) {
    event.preventDefault();
    const email = document.getElementById('newEmail').value;
    const password = document.getElementById('newPassword').value;
    const users = JSON.parse(localStorage.getItem('users')) || [];

    if (users.some(user => user.email === email)) {
        alert('Email already exists');
    } else {
        const hashedPassword = await hashPassword(password);
        users.push({ email, password: hashedPassword });
        localStorage.setItem('users', JSON.stringify(users));
        alert('Sign up successful! Please sign in.');
        showSignIn();
    }
}

// Render dashboard
function showDashboard() {
    if (!isLoggedIn()) {
        showSignIn();
        return;
    }

    currentUser = getLoggedInUser();
    const content = document.getElementById('content');
    content.innerHTML = '';
    content.appendChild(renderHeader());

    const dashboard = document.createElement('div');
    dashboard.className = 'dashboard-container';
    dashboard.innerHTML = `
        <h2>Welcome, ${currentUser.email}</h2>
        <button id="startVoice">🎤 Voice Add Task</button>
        <ul id="taskList"></ul>
        <button id="exportTasks">📄 Export Tasks</button>
    `;
    content.appendChild(dashboard);

    document.getElementById('startVoice').addEventListener('click', startVoiceRecognition);
    document.getElementById('exportTasks').addEventListener('click', exportTasks);
    loadTasks();
}

// Voice recognition for adding tasks
function startVoiceRecognition() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.start();

    recognition.onresult = (event) => {
        const taskText = event.results[0][0].transcript;
        const doc = nlp(taskText);
        const tasks = doc.sentences().out('array'); // Extract sentences as tasks
        tasks.forEach(task => {
            addTask(task);
            notifyUser(task);
        });
    };
}

// Add task dynamically
function addTask(taskText) {
    const taskList = document.getElementById('taskList');
    const taskItem = document.createElement('li');
    taskItem.innerHTML = `
        ${taskText} 
        <button onclick="editTask(this)">✏️ Edit</button>
        <button onclick="exportTask(this)">📄 Export</button>
        <button onclick="deleteTask(this)">❌ Delete</button>
    `;
    taskList.appendChild(taskItem);
    saveTasks();
}

// Edit a task
function editTask(button) {
    const taskItem = button.parentElement;
    const newText = prompt('Edit your task:', taskItem.childNodes[0].textContent.trim());
    if (newText) {
        taskItem.childNodes[0].textContent = newText;
        saveTasks();
    }
}

// Delete a task
function deleteTask(button) {
    button.parentElement.remove();
    saveTasks();
}

// Save tasks to localStorage
function saveTasks() {
    const tasks = [];
    document.querySelectorAll('#taskList li').forEach(task => {
        tasks.push(task.childNodes[0].textContent.trim());
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Load tasks from localStorage
function loadTasks() {
    const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    savedTasks.forEach(taskText => addTask(taskText));
}

// Export tasks as a text file
function exportTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const blob = new Blob([tasks.join('\n')], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'tasks.txt';
    link.click();
}

// Export individual task as a text file
function exportTask(button) {
    const taskText = button.parentElement.childNodes[0].textContent.trim();
    const blob = new Blob([taskText], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'task.txt';
    link.click();
}

// Notify user for new task
function notifyUser(taskText) {
    if (Notification.permission === 'granted') {
        new Notification('New Task Added', {
            body: taskText,
            icon: 'icon.png'
        });
    }
}

// Request notification permission
if (Notification.permission !== 'granted') {
    Notification.requestPermission();
}

// Initialize
if (isLoggedIn()) {
    showDashboard();
} else {
    showSignIn();
}
