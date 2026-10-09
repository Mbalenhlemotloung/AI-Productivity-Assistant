# MatricEnhle

## 1. Project Overview

MatricEnhle is a student-support platform designed for South African Grade 12 learners. It helps students prepare for their matric examinations, access past papers, manage university applications, find NSFAS support information, and use AI-powered tools to improve their learning and communication.

The aim of the project is to bring important matric resources and student support services together in one platform.

## 2. Features

* **Student Dashboard:** Provides a central place to access the platform's main features and student services.
* **University Applications:** Helps students organise university applications, programmes, application statuses, and important dates.
* **NSFAS Support:** Provides guidance and links to official financial aid information.
* **Past Papers:** Allows students to access available examination papers for revision and preparation.
* **Ask MatricEnhle:** Helps students ask study-related questions and understand difficult topics.
* **Smart Summariser:** Summarises study notes and learning materials into shorter, easier-to-understand information.
* **EmailWingmate:** Helps students draft professional emails to university admissions offices and lecturers. Students can select a recipient and tone before generating an email.
* **AI Task Planner / Study Planner:** Helps students organise their study tasks and plan revision around subjects, priorities, and examination dates.
* **Profile and Settings:** Allows students to manage their profile and preferences where implemented.
* **Responsible AI Guidance:** Encourages students to verify AI-generated information and avoid sharing sensitive personal details.

## 3. Tools Used

* **Python** – Backend programming language.
* **Flask** – Python web framework used to build the application.
* **SQLite** – Database used to store application data.
* **HTML5** – Used to structure web pages.
* **CSS3** – Used to style the website and create responsive layouts.
* **JavaScript** – Used to add interactive features.
* **Jinja2** – Used to render dynamic HTML templates with Flask.
* **Git** – Used for version control.
* **GitHub** – Used to store and collaborate on the project.

## 4. Setup Instructions

### Prerequisites

Before running the project, ensure that Python is installed on your computer. Git is also required if you want to clone the repository.

### Step 1: Clone the Repository

Open a terminal and run the following commands. Replace the repository URL with the URL of your GitHub repository.

```bash
git clone <repository-url>
cd matricGateway-main
```

If you already have the project files on your computer, open the terminal in your existing project folder instead.

### Step 2: Create a Virtual Environment

On Windows PowerShell, run:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### Step 3: Install Dependencies

Install the required Python packages using the `requirements.txt` file:

```powershell
python -m pip install -r requirements.txt
```

### Step 4: Initialise the Database

If the project contains an `init_db.py` file, run:

```powershell
python init_db.py
```

This initialises the SQLite database according to the project's database setup code.

### Step 5: Run the Application

Start the Flask application by running:

```powershell
python app.py
```

Open the local address displayed in the terminal in your web browser. For a typical Flask development server, this may be:

```text
http://127.0.0.1:5000/
```

### Troubleshooting

* Ensure that you are running commands from the project folder.
* Check that `app.py` and `requirements.txt` are present before starting the application.
* If a dependency is missing, activate the virtual environment and install the requirements again.
* If the application does not start, check the error messages in the terminal.
* Some AI features may require additional configuration depending on their implementation.

## 5. Project Structure

The project may contain the following files and folders:

```text
matricGateway-main/
├── README.md
├── app.py
├── init_db.py
├── requirements.txt
├── matric_gateway.db
├── templates/
├── static/
│   ├── css/
│   ├── js/
│   └── images/
└── papers/
```

The actual structure may differ depending on the current version of the project.

## 6. Responsible Use

MatricEnhle is designed to support students throughout their matric year. AI-generated summaries, answers, and emails should be reviewed before use. Students should confirm university application requirements, admission deadlines, and NSFAS information using official sources.

**Note:** Feature availability depends on the current implementation and any required integrations.

