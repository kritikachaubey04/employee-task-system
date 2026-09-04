import sqlite3

DB_NAME = "tasks.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            priority TEXT DEFAULT 'Medium',
            status TEXT DEFAULT 'Pending',
            assigned_to INTEGER,
            deadline TEXT,
            FOREIGN KEY (assigned_to) REFERENCES users (id)
        )
    ''')

    # Seed users agar exist na karte hon
    cursor.execute("SELECT COUNT(*) FROM users WHERE email = 'admin@launchlions.com'")
    if cursor.fetchone()[0] == 0:
        cursor.execute("INSERT INTO users (name, email, password, role) VALUES ('Admin User', 'admin@launchlions.com', 'admin123', 'admin')")
        cursor.execute("INSERT INTO users (name, email, password, role) VALUES ('Kritika Chaubey', 'kritika@launchlions.com', 'emp123', 'employee')")
        cursor.execute("INSERT INTO users (name, email, password, role) VALUES ('Rahul Sharma', 'rahul@launchlions.com', 'emp123', 'employee')")

    # Seed initial tasks agar na hon
    cursor.execute("SELECT COUNT(*) FROM tasks")
    if cursor.fetchone()[0] == 0:
        cursor.execute('''
            INSERT INTO tasks (title, description, priority, status, assigned_to, deadline)
            VALUES
            ('Setup REST API Endpoints', 'Develop and document FastAPI routes for authentication.', 'High', 'Completed', 2, '2026-06-25'),
            ('Build React Dashboard UI', 'Implement responsive frontend panels for employee task tracking.', 'Medium', 'In Progress', 2, '2026-07-10'),
            ('Database Schema Verification', 'Review foreign keys and constraints.', 'Low', 'Pending', 3, '2026-07-20')
        ''')

    conn.commit()
    conn.close()

def get_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn
