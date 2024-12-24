let currentUser = null; // For keeping track of logged-in user

// Helper functions for login state
function isLoggedIn() {
    return localStorage.getItem('loggedIn') === 'true';
}

function getLoggedInUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

// Render Sign-In page
function showSignIn() {
    console.log("Rendering Sign-In Page");
    const content = document.getElementById('content');
    content.innerHTML = `
        <h1>Sign In</h1>
        <form id="signInForm">
            <label for="email">Email:</label>
            <input type="email" id="email" required>
            <label for="password">Password:</label>
            <input type="password" id="password" required>
            <button type="submit">Sign In</button>
        </form>
        <p>Don't have an account? <a href="#" onclick="showSignUp()">Sign Up</a></p>
    `;

    document.getElementById('signInForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(user => user.email === email && user.password === password);
        
        if (user) {
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('currentUser', JSON.stringify(user));
            showDashboard();
        } else {
            alert('Invalid credentials');
        }
    });
}

// Render Sign-Up page
function showSignUp() {
    console.log("Rendering Sign-Up Page");
    const content = document.getElementById('content');
    content.innerHTML = `
        <h1>Sign Up</h1>
        <form id="signUpForm">
            <label for="newEmail">Email:</label>
            <input type="email" id="newEmail" required>
            <label for="newPassword">Password:</label>
            <input type="password" id="newPassword" required>
            <button type="submit">Sign Up</button>
        </form>
        <p>Already have an account? <a href="#" onclick="showSignIn()">Sign In</a></p>
    `;

    document.getElementById('signUpForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const newEmail = document.getElementById('newEmail').value;
        const newPassword = document.getElementById('newPassword').value;
        const users = JSON.parse(localStorage.getItem('users')) || [];

        if (users.some(user => user.email === newEmail)) {
            alert('Email already exists');
        } else {
            users.push({ email: newEmail, password: newPassword });
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('currentUser', JSON.stringify({ email: newEmail }));
            showDashboard();
        }
    });
}

// Render Dashboard with Todo Bot
function showDashboard() {
    console.log("Rendering Dashboard");
    if (!isLoggedIn()) {
        showSignIn();
        return;
    }

    currentUser = getLoggedInUser();
    const content = document.getElementById('content');
    content.innerHTML = `
        <h1>Todo Bot</h1>
        <div id="chatBox"></div>
        <form id="taskInputForm">
            <label for="taskInput">Ask me to add or delete a task:</label>
            <input type="text" id="taskInput" required>
            <button type="submit">Send</button>
        </form>
        <button id="startVoice">Start Voice Command</button>
        <h2>Your Tasks</h2>
        <ul id="taskList"></ul>
    `;

    // Handle the task input and interaction with bot
    document.getElementById('taskInputForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const taskInput = document.getElementById('taskInput').value.toLowerCase();
        handleUserInput(taskInput);
    });

    // Voice command button
    document.getElementById('startVoice').addEventListener('click', function() {
        startVoiceRecognition();
    });

    displayTasks();
}

// Handle the user input to add/delete tasks
function handleUserInput(input) {
    console.log(`Handling user input: ${input}`);
    if (input.includes('add task')) {
        const taskDescription = input.replace('add task', '').trim();
        if (taskDescription) {
            addTask(taskDescription);
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
        updateChatBox('Sorry, I didn\'t understand that.');
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
function addTask(description) {
    console.log(`Adding task: ${description}`);
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push({ description, done: false });
    localStorage.setItem('tasks', JSON.stringify(tasks));
    displayTasks();
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
            ${task.description} ${task.done ? '(Done)' : '(Pending)'}
            <button class="mark-done" onclick="markTaskAsDone(${index})">Mark as Done</button>
            <button class="delete" onclick="deleteTask(${index})">Delete</button>
        `;
        taskList.appendChild(li);
    });
}

// Mark a task as done
function markTaskAsDone(index) {
    console.log(`Marking task as done: ${index}`);
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    if (tasks[index]) {
        tasks[index].done = true;
        localStorage.setItem('tasks', JSON.stringify(tasks));
        displayTasks();
    }
}

// Delete a task
function deleteTask(index) {
    console.log(`Deleting task: ${index}`);
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.splice(index, 1);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    displayTasks();
}

// Initialize the app
console.log("Initializing app");
if (isLoggedIn()) {
    showDashboard();
} else {
    showSignIn();
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

    recognition.onstart = function() {
        console.log('Voice recognition started. Try speaking into the microphone.');
    };

    recognition.onresult = function(event) {
        if (event.results.length > 0) {
            const voiceInput = event.results[0][0].transcript.toLowerCase();
            console.log(`Voice Input: ${voiceInput}`);
            handleUserInput(voiceInput);
        }
    };

    recognition.onerror = function(event) {
        console.error('Speech recognition error', event);
    };

    recognition.onend = function() {
        console.log('Voice recognition ended.');
    };

    recognition.start();
}
