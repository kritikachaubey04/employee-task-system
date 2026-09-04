from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
from database import get_db, init_db

app = FastAPI(title="Employee Task Management API")

init_db()

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

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str = "EMPLOYEE"

class TaskCreate(BaseModel):
    title: str
    description: str
    deadline: str
    priority: str = "Medium"
    assigned_to: int

class TaskStatusUpdate(BaseModel):
    status: str

@app.post("/api/login")
def login(creds: LoginRequest):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ? AND password = ?", (creds.email, creds.password))
    user = cursor.fetchone()
    conn.close()
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"]
    }

@app.get("/api/employees")
def get_employees():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, role FROM users WHERE role = 'EMPLOYEE'")
    rows = cursor.fetchall()
    conn.close()
    return [dict(ix) for ix in rows]

@app.post("/api/employees")
def add_employee(emp: UserCreate):
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            (emp.name, emp.email, emp.password, emp.role)
        )
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(status_code=400, detail="Email already exists")
    conn.close()
    return {"message": "Employee added successfully"}

@app.get("/api/admin/overview")
def get_admin_overview():
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'EMPLOYEE'")
    total_emp = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM tasks")
    total_tasks = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM tasks WHERE status = 'Completed'")
    completed = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM tasks WHERE status = 'Pending'")
    pending = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM tasks WHERE status = 'In Progress'")
    in_progress = cursor.fetchone()[0]
    
    cursor.execute("""
        SELECT t.id, t.title, t.description, t.deadline, t.priority, t.status, u.name as assigned_to_name
        FROM tasks t
        LEFT JOIN users u ON t.assigned_to = u.id
        ORDER BY t.id DESC
    """)
    all_tasks = [dict(ix) for ix in cursor.fetchall()]
    conn.close()
    
    return {
        "metrics": {
            "total_employees": total_emp,
            "total_tasks": total_tasks,
            "completed": completed,
            "pending": pending,
            "in_progress": in_progress
        },
        "tasks": all_tasks
    }

@app.post("/api/tasks")
def create_task(task: TaskCreate):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO tasks (title, description, deadline, priority, assigned_to) VALUES (?, ?, ?, ?, ?)",
        (task.title, task.description, task.deadline, task.priority, task.assigned_to)
    )
    conn.commit()
    conn.close()
    return {"message": "Task assigned successfully"}

@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
    conn.commit()
    conn.close()
    return {"message": "Task deleted"}

@app.get("/api/employee/tasks/{user_id}")
def get_employee_tasks(user_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tasks WHERE assigned_to = ? ORDER BY id DESC", (user_id,))
    rows = [dict(ix) for ix in cursor.fetchall()]
    conn.close()
    return rows

@app.patch("/api/tasks/{task_id}/status")
def update_task_status(task_id: int, status_update: TaskStatusUpdate):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE tasks SET status = ? WHERE id = ?", (status_update.status, task_id))
    conn.commit()
    conn.close()
    return {"message": "Status updated successfully"}
