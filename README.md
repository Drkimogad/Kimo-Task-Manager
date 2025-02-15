Tasklyify
Tasklyify is a simple task management web application with adaptive features, voice commands, and a humanized chat interface. It enables you to sign up, log in, and manage your tasks via both traditional form inputs and a conversational chat-based interface. The app adapts its suggestions based on your interactions and is optimized for desktop, tablet, and mobile devices.

Features
User Authentication:
Secure sign-up and sign-in with hashed passwords using bcrypt.

Task Management:
Add, delete, mark tasks as done; each task can have a description, category, due date, and priority.

Adaptive Recommendations:
The app tracks your interaction history (using localStorage) to reorder task templates based on your most-used categories.

Humanized Chat Interface:
A chatbox that simulates a "bot typing" indicator and delays responses to create a natural conversation feel.

Voice Commands:
Add, delete, or update tasks using voice commands via the Web Speech API (supported in Google Chrome).

Overdue Task Detection:
Automatically highlights overdue tasks to help you keep track of urgent items.

Responsive Design:
Optimized layout for desktop, tablet, and mobile screens.

Export Functionality:
Export your tasks as a JSON file.

Installation
Requirements
A modern web browser (Google Chrome is recommended for voice recognition support).
A local web server is recommended to ensure all features work properly (e.g., Live Server extension for VS Code or Python’s built-in HTTP server).
Steps
Clone the Repository:

bash
Copy
Edit
git clone https://github.com/yourusername/tasklyify.git
cd tasklyify
Run the Application:

Using a Local Server:
For example, using Python:

bash
Copy
Edit
python3 -m http.server 8000
Then open your browser and navigate to:
http://localhost:8000

Directly Opening index.html:
You may open index.html directly in your browser, though some features (like voice recognition) may require a local server.

Navigation & Usage
Authentication
Sign Up:
Click the "Sign Up" link on the authentication page, then provide your email and password to create an account.

Sign In:
Enter your credentials on the sign-in page. Upon successful login, you’ll be redirected to the dashboard.

Dashboard
Task Summary:
View a summary of your tasks, including total, completed, pending, and overdue tasks.

Chat Interface for Tasks:

Text Input:
Type commands (e.g., "add task Buy milk category Shopping due tomorrow priority high") in the chatbox.
Voice Input:
Click "Start Voice Command" to add tasks using your voice.
Adaptive Templates:
Click "Show Task Templates" to view recommended templates based on your past interactions.
Task List:
View your tasks with options to delete or mark them as done. Overdue tasks are visually highlighted.

Export Tasks:
Click the "Export Tasks" button to download your tasks as a JSON file.

Dark Mode:
Toggle dark mode using the "Toggle Dark Mode" button.

Responsive Design
Desktop, Tablet, and Mobile:
The app includes responsive design features to ensure usability on various screen sizes.
Desktop: Optimized with a reduced layout for full visibility.
Tablet: Uses medium scaling for better readability.
Mobile: Designed for compact display and easy navigation.
Voice Commands
Tasklyify supports a set of voice commands, such as:

"add task [task description] category [category] due [date] priority [level]"
"delete task [task number]"
"mark as done [task number]"
If your browser does not support voice recognition (e.g., using Chrome is recommended), you will receive an alert.

Future Enhancements
Enhanced natural language processing for more robust voice and text command parsing.
Further refinement of adaptive recommendations.
Integration with a backend database for persistent data storage beyond localStorage.
Additional UI/UX improvements for a more engaging experience.
License
This project is licensed under the MIT License.
