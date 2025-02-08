let currentUser = null; // For keeping track of logged-in user
let isDarkMode = localStorage.getItem('isDarkMode') === 'true'; // Track dark mode state

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
        <p>Don't have an account? <a href="#" id="signUpLink">Sign Up</a></p>
    ` : `
        <h1>Kimo Task Manager</h1>
        <form id="authForm">
            <label for="newEmail">Email:</label>
            <input type="email" id="newEmail" required>
            <label for="newPassword">Password:</label>
            <input type="password" id="newPassword" required>
            <button type="submit">Sign Up</button>
        </form>
        <p>Already have an account? <a href="#" id="signInLink">Sign In</a></p>
    `;

    const authContainer = document.createElement('div');
    authContainer.className = 'auth-container';
    authContainer.innerHTML = `
        ${formHTML}
        <p id="error-message" class="error-message"></p>
    `;
    content.appendChild(authContainer);

    // Attach event listeners for sign-up and sign-in links
    const signUpLink = document.getElementById('signUpLink');
    const signInLink = document.getElementById('signInLink');
    if (signUpLink) {
        signUpLink.addEventListener('click', showSignUp);
    }
    if (signInLink) {
        signInLink.addEventListener('click', showSignIn);
    }

    // Attach form submit event listener
    document.getElementById('authForm').addEventListener('submit', authType === 'signIn' ? handleSignIn : handleSignUp);
}

// Render Sign-In Page
function showSignIn() {
    console.log("Redirecting to sign-in page"); // Debugging line
    renderAuthPage('signIn');
}

// Render Sign-Up Page
function showSignUp() {
    console.log("Redirecting to sign-up page"); // Debugging line
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

// NEW: Enhanced parseTaskInput function for NLP
function parseTaskInput(input) {
    // Extract due date (MM/DD/YYYY or natural language like "tomorrow")
    const dueDateMatch = input.match(/\d{1,2}\/\d{1,2}\/\d{4}/) || input.match(/tomorrow|today|next week|next month/i);
    const dueDate = dueDateMatch ? dueDateMatch[0] : null;

    // Extract time (HH:MM AM/PM)
    const timeMatch = input.match(/\d{1,2}:\d{2}\s?(AM|PM)?/i);
    const time = timeMatch ? timeMatch[0] : null;

    // Extract priority (high, medium, low)
    const priorityMatch = input.match(/high|medium|low/i);
    const priority = priorityMatch ? priorityMatch[0] : 'Medium';

    // Extract category (work, shopping, exercise, etc.)
    const categoryMatch = input.match(/work|shopping|exercise|personal|travel|school/i);
    const category = categoryMatch ? categoryMatch[0] : 'Other';

    // Extract subcategory (groceries, gym, etc.)
    const subCategoryMatch = input.match(/groceries|gym|electronics|clothing|food|appointments/i);
    const subCategory = subCategoryMatch ? subCategoryMatch[0] : '';

    // Extract description (remove keywords like "add task")
    const description = input
        .replace(/add task|create task|task/i, '')
        .replace(dueDateMatch ? dueDateMatch[0] : '', '')
        .replace(timeMatch ? timeMatch[0] : '', '')
        .replace(priorityMatch ? priorityMatch[0] : '', '')
        .replace(categoryMatch ? categoryMatch[0] : '', '')
        .replace(subCategoryMatch ? subCategoryMatch[0] : '', '')
        .trim();

    return {
        description,
        dueDate,
        time,
        priority,
        category,
        subCategory,
    };
}

// NEW: Edit task functionality
function editTask(index) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const task = tasks[index];

    if (task) {
        const newDescription = prompt('Edit your task description:', task.description);
        const newCategory = prompt('Edit the category:', task.category);
        const newSubCategory = prompt('Edit the subcategory:', task.subCategory);
        const newDueDate = prompt('Edit the due date (MM/DD/YYYY):', task.dueDate);
        const newPriority = prompt('Edit the priority (High/Medium/Low):', task.priority);

        if (newDescription) {
            task.description = newDescription;
            task.category = newCategory || task.category;
            task.subCategory = newSubCategory || task.subCategory;
            task.dueDate = newDueDate || task.dueDate;
            task.priority = newPriority || task.priority;

            localStorage.setItem('tasks', JSON.stringify(tasks));
            displayTasks();
            updateProgressBar();
            updateChatBox(`Task "${task.description}" updated.`);
            speak(`Task "${task.description}" updated.`);
        }
    }
}

// NEW: Export task functionality
function exportTask(index) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const task = tasks[index];

    if (task) {
        const taskText = `
            Description: ${task.description}
            Category: ${task.category}
            Subcategory: ${task.subCategory}
            Due Date: ${task.dueDate || 'No deadline'}
            Priority: ${task.priority}
            Status: ${task.done ? 'Done' : 'Pending'}
        `;

        const blob = new Blob([taskText], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `task_${index + 1}.txt`;
        link.click();
    }
}

// UPDATED: Display tasks with Edit and Export buttons
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
                <button class="edit" onclick="editTask(${index})">Edit</button>
                <button class="export" onclick="exportTask(${index})">Export</button>
                <button class="delete" onclick="deleteTask(${index})">Delete</button>
            `;
            taskList.appendChild(li);
        }
    });
}

// Rest of the code remains unchanged...

// Mark a task as done or undone
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
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    if (tasks[index]) {
        tasks.splice(index, 1); // Remove the task
        localStorage.setItem('tasks', JSON.stringify(tasks));
        displayTasks();
        updateProgressBar();
    }
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
            handleVoiceCommand(voiceInput);
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

// Handle voice commands for tasks
function handleVoiceCommand(input) {
    updateChatBox(`Processing: "${input}"`);
    speak(`Processing: "${input}"`);

    setTimeout(() => {
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
                deleteTask(taskId - 1);
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
        } else if (input.includes('show tasks')) {
            displayTasks();
            updateChatBox('Here are your tasks.');
            speak('Here are your tasks.');
        } else {
            updateChatBox('Sorry, I didn\'t understand that. Try "add task", "delete task", or "mark as done".');
            speak('Sorry, I didn\'t understand that. Try "add task", "delete task", or "mark as done".');
        }
    }, 1000); // Simulate 1-second processing delay
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
            handleUserInput(template); // Automatically process the template
        });
        templateList.appendChild(li);
    });

    const taskTemplatesDiv = document.getElementById('taskTemplates');
    taskTemplatesDiv.innerHTML = ''; // Clear previous templates
    taskTemplatesDiv.appendChild(templateList);
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function () {
    if (isLoggedIn()) {
        showDashboard();
    } else {
        showSignIn();
    }
});
