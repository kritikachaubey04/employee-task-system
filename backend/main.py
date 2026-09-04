from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import database

app = FastAPI(title="Launch Lions Task API")

# Startup par table aur users ensure karein
@app.on_event("startup")
def startup_event():
    database.init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LoginRequest(BaseModel):
    email: str
    password: str

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    priority: Optional[str] = "Medium"
    assigned_to: int
    deadline: Optional[str] = ""

class TaskUpdateStatus(BaseModel):
    status: str

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str

@app.get("/")
def read_root():
    return {"status": "Launch Lions API running"}

@app.get("/api/seed")
def seed_trigger():
    database.init_db()
    return {"message": "Database initialized and seeded successfully"}

@app.post("/api/login")
def login(creds: LoginRequest):
    conn = database.get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, role FROM users WHERE email = ? AND password = ?", (creds.email.strip(), creds.password.strip()))
    user = cursor.fetchone()
    conn.close()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"id": user["id"], "name": user["name"], "email": user["email"], "role": user["role"]}

@app.get("/api/admin/overview")
def get_admin_overview():
    conn = database.get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'employee'")
    total_employees = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM tasks")
    total_tasks = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM tasks WHERE status = 'Completed'")
    completed_tasks = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM tasks WHERE status = 'In Progress'")
    in_progress = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM tasks WHERE status = 'Pending'")
    pending = cursor.fetchone()[0]

    cursor.execute('''
        SELECT tasks.*, users.name as assignee_name 
        FROM tasks 
        LEFT JOIN users ON tasks.assigned_to = users.id
        ORDER BY tasks.id DESC
    ''')
    tasks = [dict(row) for row in cursor.fetchall()]

    cursor.execute("SELECT id, name, email, role FROM users WHERE role = 'employee'")
    employees = [dict(row) for row in cursor.fetchall()]

    conn.close()
    return {
        "metrics": {
            "total_employees": total_employees,
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "in_progress": in_progress,
            "pending": pending
        },
        "tasks": tasks,
        "employees": employees
    }

@app.get("/api/tasks/employee/{emp_id}")
def get_employee_tasks(emp_id: int):
    conn = database.get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tasks WHERE assigned_to = ? ORDER BY id DESC", (emp_id,))
    tasks = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return tasks

@app.patch("/api/tasks/{task_id}/status")
def update_task_status(task_id: int, req: TaskUpdateStatus):
    conn = database.get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE tasks SET status = ? WHERE id = ?", (req.status, task_id))
    conn.commit()
    conn.close()
    return {"message": "Status updated successfully"}

@app.post("/api/tasks")
def create_task(task: TaskCreate):
    conn = database.get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO tasks (title, description, priority, status, assigned_to, deadline)
        VALUES (?, ?, ?, 'Pending', ?, ?)
    ''', (task.title, task.description, task.priority, task.assigned_to, task.deadline))
    conn.commit()
    task_id = cursor.lastrowid
    conn.close()
    return {"message": "Task created", "task_id": task_id}

@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: int):
    conn = database.get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
    conn.commit()
    conn.close()
    return {"message": "Task deleted"}
