Graphical Password Authentication System

A web-based authentication system that uses a exact sequence of selected images as a graphical password instead of a traditional text-based password.

The project combines a web interface with a Python FastAPI backend and MySQL database to demonstrate image-sequence-based authentication.

It mitigates brute-force attacks through temporary account lockout after three consecutive failed login attempts.

🔗 Features

🔗 Graphical Password Authentication

- Register users using their account details.
- Create a graphical password by selecting three secret images in a specific order.
- Authenticate users by selecting the same images in the registered order.
- Provide a visual interface for image selection.

🔗 Image Optimization and Performance

- Converted authentication images to WebP format.
- Compressed image files to reduce file sizes.
- Optimized image assets to support faster loading.
- Improved image-loading performance through image optimization.
- Organized images in a dedicated frontend images directory.

🔗 Account and Password Management

- Track failed login attempts.
- Temporarily lock accounts after repeated failed login attempts.
- Provide a password reset interface.
- Store user and authentication-related data in MySQL.

🔗 Backend and API Integration

- Built the backend using Python and FastAPI.
- Use REST API endpoints to connect the frontend and backend.
- Integrate the application with a MySQL database.
- Keep frontend pages and backend logic organized separately.

🔗 Technology Stack

HTML5| Page structure
CSS3| Styling and responsive interface
JavaScript| Image selection and API requests
Python| Backend programming
FastAPI| REST API development
MySQL| User data storage
WebP| Optimized image format
Git and GitHub| Version control and project hosting

🔗 Project Structure

graphical-password-auth/
├── backend/
│   └── main.py
├── frontend/
│   ├── images/
│   ├── index.html
│   ├── register.html
│   ├── setup-password.html
│   ├── login.html
│   ├── dashboard.html
│   ├── forgot-password.html
│   ├── script.js
│   ├── setup-password.js
│   ├── login.js
│   ├── forgot-password.js
│   └── style.css
├── schema.sql
├── README.md
└── .gitignore

🔗 Prerequisites

Before running the project, install:

- Python 3.11 or a compatible version
- MySQL Server
- Visual Studio Code
- A modern web browser


🔗 How to Run

 1- Clone the Repository

git clone YOUR_GITHUB_REPOSITORY_URL
cd graphical-password-auth


2- Set Up the Python Environment

Open a terminal in the project directory:

cd backend
python -m venv venv

Activate the environment on Windows PowerShell:

.\venv\Scripts\Activate.ps1


5- Configure Environment Variables

Create a ".env" file inside the "backend" directory and configure the database settings expected by "main.py".

Never upload database passwords or other secrets to GitHub.

🔗 5. Set Up the MySQL Database

1. Open MySQL Workbench.
2. Connect to your local MySQL server.
3. Execute the SQL statements in "schema.sql".
4. Ensure the database name and table structure match the backend configuration.

🔗 6. Start the FastAPI Backend

From the "backend" directory, run:

python -m uvicorn main:app --reload --port 8001

Open the API documentation:

http://127.0.0.1:8001/docs

🔗 7. Open the Frontend

Use the configured development server or local web server to open the frontend. Ensure the frontend API URL matches the backend address and port.


🔗 Security Considerations

- Keep database credentials in environment variables.
- Exclude ".env" and virtual environment files from Git.
- Implement appropriate password-storage and account-recovery safeguards before production deployment.
- Test authentication, account locking, and password-reset behavior carefully.

🔗 Future Improvements

- Add automated API and authentication tests.
- Strengthen password-reset verification.

🔗 License

License information for the source code and image assets will be documented after their reuse permissions have been verified.