# Launch Lions - Employee Task Management System

A full-stack role-based Employee Task Management web application built with **React** (Frontend) and **FastAPI + SQLite** (Backend), deployed on **Vercel** and **Render**.

---

## 🚀 Live Links

- **Live Application (Frontend):** [https://employee-task-system-five.vercel.app](https://employee-task-system-five.vercel.app)
- **Live Backend API:** [https://employee-task-system-9kzh.onrender.com](https://employee-task-system-9kzh.onrender.com)
- **Interactive API Docs (Swagger):** [https://employee-task-system-9kzh.onrender.com/docs](https://employee-task-system-9kzh.onrender.com/docs)

---

## 🔑 Demo Login Credentials

| Role | Email Address | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@launchlions.com` | `admin123` | View metrics, create/assign tasks, delete tasks, view all employees |
| **Employee** | `kritika@launchlions.com` | `emp123` | View personal assigned tasks, update status (Pending / In Progress / Completed) |

---

## ✨ Features

- **Role-Based Access Control (RBAC):** Distinct dashboards for Admin and Employee accounts.
- **Admin Command Center:**
  - Real-time KPI cards: Total Tasks, Completed, In Progress, and Pending counts.
  - Task Assignment form with dynamic employee assignment, deadlines, and priorities.
  - Overview table displaying task assignment states and deletion controls.
- **Employee Portal:**
  - Personalized task view tailored to the authenticated employee ID.
  - Status management dropdown to toggle between Pending, In Progress, and Completed.
- **RESTful API Architecture:** Robust FastAPI backend integrated with SQLite and CORS middleware.

---

## 🛠️ Tech Stack

- **Frontend:** React.js, Axios, Modern CSS
- **Backend:** FastAPI, Python, Uvicorn
- **Database:** SQLite
- **Deployment:** Vercel (Frontend), Render (Backend Web Service)
