import sqlite3

DATABASE_NAME = "tasks.db"

def get_db():
    conn = sqlite3.connect(DATABASE_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # Table 1: Users (Admin & Employees)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'EMPLOYEE'
    );
    """)
    
    # Table 2: Tasks
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        deadline TEXT NOT NULL,
        priority TEXT DEFAULT 'Medium',
        status TEXT DEFAULT 'Pending',
        assigned_to INTEGER,
        FOREIGN KEY (assigned_to) REFERENCES users(id)
    );
    """)
    
    # Pre-populate default accounts if empty
    cursor.execute("SELECT * FROM users WHERE email = 'admin@launchlions.com'")
    if not cursor.fetchone():
        cursor.execute(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            ("Admin User", "admin@launchlions.com", "admin123", "ADMIN")
        )
        cursor.execute(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            ("Kritika Chaubey", "kritika@launchlions.com", "emp123", "EMPLOYEE")
        )
        cursor.execute(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            ("Rahul Sharma", "rahul@launchlions.com", "emp123", "EMPLOYEE")
        )
    
    conn.commit()
    conn.close()
