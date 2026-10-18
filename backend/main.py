from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import mysql.connector
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv()

required_vars = ["DB_USER", "DB_PASSWORD", "DB_NAME"]

missing_vars = [
    var for var in required_vars
    if not os.getenv(var)
]

if missing_vars:
    raise RuntimeError(
        f"Missing environment variables: {', '.join(missing_vars)}"
    )


app = FastAPI()



app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5000",
        "http://localhost:5000",
        "http://127.0.0.1:5500",
        "http://localhost:5500",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)



db = mysql.connector.connect(
    host=os.getenv("DB_HOST", "localhost"),
    port=int(os.getenv("DB_PORT", "3306")),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    database=os.getenv("DB_NAME")
)

print("MySQL connection successful")


@app.get("/")
def home():
    return {"message": "Hello Aafrin"}

class RegisterRequest(BaseModel):
    name: str
    email: str
    image1: str
    image2: str
    image3: str   

class LoginRequest(BaseModel):
    email: str
    image1: str
    image2: str
    image3: str


class ResetPasswordRequest(BaseModel):
    email: str
    image1: str
    image2: str
    image3: str


'''@app.post("/login")
def login(data: LoginRequest):
    cursor = db.cursor()

    query = """
    SELECT image1, image2, image3
    FROM users
    WHERE email = %s
    """

    cursor.execute(query, (data.email,))

    user = cursor.fetchone()

    if user is None:
        return {"success": False, "message": "User not found"}

    if (
        data.image1 == user[0]
        and data.image2 == user[1]
        and data.image3 == user[2]
    ):
        return {"success": True, "message": "Login successful"}

    return {"success": False, "message": "Incorrect image sequence"}'''

'''@app.post("/register")
def register(data: RegisterRequest):
    cursor = db.cursor()
    query = """
INSERT INTO users (name, email, image1, image2, image3)
VALUES (%s, %s, %s, %s, %s)
"""
    values = (
    data.name,
    data.email,
    data.image1,
    data.image2,
    data.image3
   )
    cursor.execute(query, values)
    db.commit()
    return {"message": "User registered successfully"}'''


@app.post("/register")
def register(data: RegisterRequest):
    cursor = db.cursor()

    try:
        # Check whether email already exists
        cursor.execute(
            "SELECT id FROM users WHERE email = %s",
            (data.email,)
        )

        if cursor.fetchone() is not None:
            return {
                "success": False,
                "message": "Email already registered"
            }

        # Save the new user
        cursor.execute(
            """
            INSERT INTO users
                (name, email, image1, image2, image3)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (
                data.name,
                data.email,
                data.image1,
                data.image2,
                data.image3
            )
        )

        db.commit()

        return {
            "success": True,
            "message": "User registered successfully"
        }

    except mysql.connector.Error:
        db.rollback()
        return {
            "success": False,
            "message": "Registration failed"
        }

    finally:
        cursor.close()




'''@app.post("/login")
def login(data: LoginRequest):
    cursor = db.cursor()

    try:
        query = """
        SELECT image1, image2, image3, failed_attempts, locked_until
        FROM users
        WHERE email = %s
        """

        cursor.execute(query, (data.email,))
        user = cursor.fetchone()

        if user is None:
            return {
                "success": False,
                "message": "User not found"
            }

        image1, image2, image3, failed_attempts, locked_until = user

        now = datetime.now()

        # Check whether the account is locked
        if locked_until is not None and now < locked_until:
            remaining = locked_until - now
            hours = int(remaining.total_seconds() // 3600)
            minutes = int((remaining.total_seconds() % 3600) // 60)

            return {
                "success": False,
                "locked": True,
                "message": (
                    f"Account locked. Try again in "
                    f"{hours} hours and {minutes} minutes."
                )
            }

        # If the lock period has expired, reset the attempts
        if locked_until is not None and now >= locked_until:
            cursor.execute(
                """
                UPDATE users
                SET failed_attempts = 0, locked_until = NULL
                WHERE email = %s
                """,
                (data.email,)
            )
            db.commit()
            failed_attempts = 0

        # Verify the graphical password sequence
        if (
            data.image1 == image1
            and data.image2 == image2
            and data.image3 == image3
        ):
            cursor.execute(
                """
                UPDATE users
                SET failed_attempts = 0, locked_until = NULL
                WHERE email = %s
                """,
                (data.email,)
            )
            db.commit()

            return {
                "success": True,
                "message": "Login successful"
            }

        # Incorrect sequence: increment failed attempts
        failed_attempts += 1

        if failed_attempts >= 3:
            locked_until = now + timedelta(hours=24)

            cursor.execute(
                """
                UPDATE users
                SET failed_attempts = %s, locked_until = %s
                WHERE email = %s
                """,
                (failed_attempts, locked_until, data.email)
            )
            db.commit()

            return {
                "success": False,
                "locked": True,
                "message": "Too many incorrect attempts. Account locked for 24 hours."
            }

        cursor.execute(
            """
            UPDATE users
            SET failed_attempts = %s
            WHERE email = %s
            """,
            (failed_attempts, data.email)
        )
        db.commit()

        remaining_attempts = 3 - failed_attempts

        return {
            "success": False,
            "locked": False,
            "remaining_attempts": remaining_attempts,
            "message": (
                f"Incorrect image sequence. "
                f"{remaining_attempts} attempts remaining."
            )
        }

    except mysql.connector.Error:
        db.rollback()
        return {
            "success": False,
            "message": "Database error during login."
        }

    finally:
        cursor.close()'''



@app.get("/account-status")
def account_status(email: str):
    cursor = db.cursor()

    try:
        cursor.execute(
            """
            SELECT failed_attempts, locked_until
            FROM users
            WHERE email = %s
            """,
            (email,)
        )

        user = cursor.fetchone()

        if user is None:
            return {"locked": False}

        failed_attempts, locked_until = user
        now = datetime.now()

        if locked_until and now < locked_until:
            return {
                "locked": True,
                "locked_until": locked_until.isoformat(),
                "remaining_seconds": int(
                    (locked_until - now).total_seconds()
                )
            }

        if locked_until and now >= locked_until:
            cursor.execute(
                """
                UPDATE users
                SET failed_attempts = 0, locked_until = NULL
                WHERE email = %s
                """,
                (email,)
            )
            db.commit()
            failed_attempts = 0

        return {
            "locked": False,
            "failed_attempts": failed_attempts or 0
        }

    finally:
        cursor.close()


@app.post("/login")
def login(data: LoginRequest):
    cursor = db.cursor()

    try:
        cursor.execute(
            """
            SELECT image1, image2, image3, failed_attempts, locked_until
            FROM users
            WHERE email = %s
            """,
            (data.email,)
        )

        user = cursor.fetchone()

        if user is None:
            return {
                "success": False,
                "message": "User not found"
            }

        image1, image2, image3, failed_attempts, locked_until = user
        now = datetime.now()

        # Check whether the account is locked
        if locked_until is not None and now < locked_until:
            remaining_seconds = int((locked_until - now).total_seconds())

            return {
                "success": False,
                "locked": True,
                "locked_until": locked_until.isoformat(),
                "remaining_seconds": remaining_seconds,
                "message": "Account locked. Please try again later."
            }

        # Reset expired lock
        if locked_until is not None and now >= locked_until:
            cursor.execute(
                """
                UPDATE users
                SET failed_attempts = 0, locked_until = NULL
                WHERE email = %s
                """,
                (data.email,)
            )
            db.commit()
            failed_attempts = 0

        # Verify graphical password
        if (
            data.image1 == image1
            and data.image2 == image2
            and data.image3 == image3
        ):
            cursor.execute(
                """
                UPDATE users
                SET failed_attempts = 0, locked_until = NULL
                WHERE email = %s
                """,
                (data.email,)
            )
            db.commit()

            return {
                "success": True,
                "locked": False,
                "message": "Login successful"
            }

        # Increment failed attempts
        failed_attempts = (failed_attempts or 0) + 1

        if failed_attempts >= 3:
            locked_until = now + timedelta(hours=24)

            cursor.execute(
                """
                UPDATE users
                SET failed_attempts = %s, locked_until = %s
                WHERE email = %s
                """,
                (failed_attempts, locked_until, data.email)
            )
            db.commit()

            return {
                "success": False,
                "locked": True,
                "locked_until": locked_until.isoformat(),
                "remaining_seconds": 86400,
                "message": "Too many failed attempts. Account locked for 24 hours."
            }

        cursor.execute(
            """
            UPDATE users
            SET failed_attempts = %s
            WHERE email = %s
            """,
            (failed_attempts, data.email)
        )
        db.commit()

        return {
            "success": False,
            "locked": False,
            "attempts_left": 3 - failed_attempts,
            "message": "Incorrect image sequence"
        }

    finally:
        cursor.close()




@app.post("/forgot-password")
def forgot_password(data: ResetPasswordRequest):
    cursor = db.cursor()

    try:
        # Check whether the registered email exists
        cursor.execute(
            "SELECT email FROM users WHERE email = %s",
            (data.email,)
        )

        user = cursor.fetchone()

        if user is None:
            return {
                "success": False,
                "message": "Email not registered"
            }

        # Update the graphical password sequence
        query = """
        UPDATE users
        SET image1 = %s, image2 = %s, image3 = %s
        WHERE email = %s
        """

        values = (
            data.image1,
            data.image2,
            data.image3,
            data.email
        )

        cursor.execute(query, values)
        db.commit()

        return {
            "success": True,
            "message": "Graphical password updated successfully"
        }

    except mysql.connector.Error:
        db.rollback()
        return {
            "success": False,
            "message": "Database error while updating password"
        }

    finally:
        cursor.close()
