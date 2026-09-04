# Employee Task & Project Management System

An internal enterprise web application built for **Launch Lions** to streamline project allocation, employee workload distribution, and real-time task progress monitoring.

## 🚀 Key Features

- **Role-Based Access Control (RBAC):** Distinct dashboards and access tiers for Administrator and Employees.
- **Admin Command Center:**
  - Real-time operational metrics (Total Employees, Total Tasks, Completed, In-Progress, Pending).
  - Employee onboarding and credential creation.
  - Task assignment engine with priority tagging (Low, Medium, High) and hard deadlines.
  - Task deletion and reassignment capabilities.
- **Employee Task Workspace:**
  - Personalized task feed filtered by employee ID.
  - Dynamic status life-cycle transition (`Pending` -> `In Progress` -> `Completed`).
- **RESTful Architecture:** Documented API contracts with automatic Swagger UI documentation.

---

## 🛠️ Technology Stack

- **Frontend:** React.js, JavaScript (ES6+), Axios, CSS3
- **Backend:** FastAPI (Python), Pydantic, Uvicorn
- **Database:** SQLite (Relational structure with foreign key integrity)
- **API Standard:** RESTful APIs, CORS Middleware enabled

---

## 🔐 Default Demo Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@launchlions.com` | `admin123` | Full Management & Delegation |
| **Employee** | `kritika@launchlions.com` | `emp123` | Task Execution & Status Updates |
| **Employee** | `rahul@launchlions.com` | `emp123` | Task Execution & Status Updates |
