## Graphical Password Authentication System

A web-based authentication system that uses an exact sequence of selected images as a graphical password instead of a traditional text-based password.

The project combines a web interface with a Python FastAPI backend and MySQL database to demonstrate image-sequence-based authentication.

It mitigates brute-force attacks through temporary account lockout after three consecutive failed login attempts.

## 🔗 Features

🔗 Graphical Password Authentication

- Register users using their account details.
- Create a graphical password by selecting three secret images in a specific order.
- Authenticate users by selecting the same images in the registered order.
- Provide a visual interface for image selection.

##🔗 Image Optimization and Performance
      
- Optimized all images before commiting.
- Maximum file size:200KB for photos,100KB for screenshots
- Converted authentication images to WebP format.
- Optimized image assets to support optimal website loading.

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

## Technology Stack

- **HTML5** — Page structure
- **CSS3** — Styling and responsive layout
- **JavaScript** — Image selection and API requests
- **Python** — Backend programming
- **FastAPI** — REST API development
- **MySQL** — User data storage
- **WebP** — Image optimization
- **Git and GitHub** — Version control and repository hosting
  
## 🔗 Project Structure

```text
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
```

## 🔗 Prerequisites

Before running the project, install:

- Python 3.11 or a compatible version
- MySQL Server
- Visual Studio Code
- A modern web browser


## 🔗 How to Run

1- Clone the Repository

git clone https://github.com/Aafrin-S5/graphical-password-auth.git
cd graphical-password-auth

2- Set Up the Python Environment

cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1

Install the required backend packages:

python -m pip install fastapi uvicorn mysql-connector-python python-dotenv

3- Configure Environment Variables

Create a .env file inside the backend/ directory. Add the database configuration variables expected by main.py.

Never commit .env files or expose database credentials publicly.

🔗 4. Set Up the MySQL Database

1. Open MySQL Workbench.
2. Connect to your local MySQL server.
3. Execute the SQL statements in "schema.sql".
4. Ensure the database name and table structure match the backend configuration.

🔗 5. Start the FastAPI Backend

From the "backend" directory, run:

python -m uvicorn main:app --reload --port 8001

Open the API documentation:

http://127.0.0.1:8001/docs

🔗 6. Open the Frontend

Open the frontend using a local web server or the development setup supported by the project. Ensure the frontend API URL matches the backend address and port.


## 🔗 Security Considerations

- Keep database credentials in environment variables.
- Exclude ".env" and virtual environment files from Git.
- Implement appropriate password-storage and account-recovery safeguards before production deployment.
- Test authentication, account locking, and password-reset behavior carefully.

## 🔗 Future Improvements

- Add automated API and authentication tests.
- Strengthen password-reset verification.

## 🔗 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

Note: Verify that the image assets are also permitted for redistribution; the source-code license does not automatically establish their licensing terms.
