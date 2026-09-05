import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "https://employee-task-system-9kzh.onrender.com/api";

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [overview, setOverview] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [deadline, setDeadline] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post(`${API_BASE}/login`, { email, password });
      setUser(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid email or password");
    }
  };

  const loadData = async () => {
    if (!user) return;
    try {
      if (user.role === "admin") {
        const res = await axios.get(`${API_BASE}/admin/overview`);
        setOverview(res.data);
      } else {
        const res = await axios.get(`${API_BASE}/tasks/employee/${user.id}`);
        setTasks(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/tasks`, {
        title,
        description: desc,
        priority: "Medium",
        assigned_to: parseInt(assignedTo),
        deadline
      });
      setTitle("");
      setDesc("");
      setDeadline("");
      loadData();
    } catch (err) {
      alert("Failed to create task");
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await axios.patch(`${API_BASE}/tasks/${taskId}/status`, { status: newStatus });
      loadData();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`${API_BASE}/tasks/${taskId}`);
      loadData();
    } catch (err) {
      alert("Failed to delete task");
    }
  };

  if (!user) {
    return (
      <div style={{ maxWidth: 420, margin: "60px auto", padding: 24, fontFamily: "sans-serif", border: "1px solid #e2e8f0", borderRadius: 8, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>Launch Lions Task Portal</h2>
        {error && <div style={{ color: "#e53e3e", marginBottom: 12, fontSize: 14 }}>{error}</div>}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 13, marginBottom: 4 }}>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: "100%", padding: "10px", boxSizing: "border-box", border: "1px solid #cbd5e1", borderRadius: 6 }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, marginBottom: 4 }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: "100%", padding: "10px", boxSizing: "border-box", border: "1px solid #cbd5e1", borderRadius: 6 }} />
          </div>
          <button type="submit" style={{ width: "100%", padding: "10px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: "bold" }}>Sign In</button>
        </form>
        <div style={{ marginTop: 20, fontSize: 12, color: "#64748b", borderTop: "1px solid #f1f5f9", paddingTop: 12 }}>
          <p><b>Admin:</b> admin@launchlions.com / admin123</p>
          <p><b>Employee:</b> kritika@launchlions.com / emp123</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 960, margin: "30px auto", padding: 20, fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: 12 }}>
        <h2>Employee Task Management</h2>
        <div>
          <span style={{ marginRight: 15 }}>Logged in as: <b>{user.name}</b> ({user.role})</span>
          <button onClick={() => setUser(null)} style={{ padding: "6px 12px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>Logout</button>
        </div>
      </div>

      {user.role === "admin" && overview && (
        <div style={{ marginTop: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
            <div style={{ padding: 16, background: "#f8fafc", borderRadius: 6, textAlign: "center", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 12, color: "#64748b" }}>Total Tasks</div>
              <div style={{ fontSize: 24, fontWeight: "bold" }}>{overview.metrics.total_tasks}</div>
            </div>
            <div style={{ padding: 16, background: "#f0fdf4", borderRadius: 6, textAlign: "center", border: "1px solid #bbf7d0" }}>
              <div style={{ fontSize: 12, color: "#166534" }}>Completed</div>
              <div style={{ fontSize: 24, fontWeight: "bold", color: "#166534" }}>{overview.metrics.completed_tasks}</div>
            </div>
            <div style={{ padding: 16, background: "#fefce8", borderRadius: 6, textAlign: "center", border: "1px solid #fef08a" }}>
              <div style={{ fontSize: 12, color: "#854d0e" }}>In Progress</div>
              <div style={{ fontSize: 24, fontWeight: "bold", color: "#854d0e" }}>{overview.metrics.in_progress}</div>
            </div>
            <div style={{ padding: 16, background: "#fef2f2", borderRadius: 6, textAlign: "center", border: "1px solid #fecaca" }}>
              <div style={{ fontSize: 12, color: "#991b1b" }}>Pending</div>
              <div style={{ fontSize: 24, fontWeight: "bold", color: "#991b1b" }}>{overview.metrics.pending}</div>
            </div>
          </div>

          <h3>Assign New Task</h3>
          <form onSubmit={handleCreateTask} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 10, marginBottom: 30 }}>
            <input placeholder="Task Title" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ padding: 8, borderRadius: 4, border: "1px solid #cbd5e1" }} />
            <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} required style={{ padding: 8, borderRadius: 4, border: "1px solid #cbd5e1" }}>
              <option value="">Select Employee</option>
              {overview.employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} required style={{ padding: 8, borderRadius: 4, border: "1px solid #cbd5e1" }} />
            <button type="submit" style={{ padding: "8px 16px", background: "#10b981", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: "bold" }}>Assign</button>
          </form>

          <h3>All Tasks</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#f1f5f9" }}>
                <th style={{ padding: 10, border: "1px solid #e2e8f0" }}>Title</th>
                <th style={{ padding: 10, border: "1px solid #e2e8f0" }}>Assigned To</th>
                <th style={{ padding: 10, border: "1px solid #e2e8f0" }}>Deadline</th>
                <th style={{ padding: 10, border: "1px solid #e2e8f0" }}>Status</th>
                <th style={{ padding: 10, border: "1px solid #e2e8f0" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {overview.tasks.map((t) => (
                <tr key={t.id}>
                  <td style={{ padding: 10, border: "1px solid #e2e8f0" }}>{t.title}</td>
                  <td style={{ padding: 10, border: "1px solid #e2e8f0" }}>{t.assignee_name || "Unassigned"}</td>
                  <td style={{ padding: 10, border: "1px solid #e2e8f0" }}>{t.deadline}</td>
                  <td style={{ padding: 10, border: "1px solid #e2e8f0" }}>
                    <span style={{ padding: "3px 8px", borderRadius: 12, fontSize: 12, background: t.status === "Completed" ? "#bbf7d0" : t.status === "In Progress" ? "#fef08a" : "#fecaca" }}>
                      {t.status}
                    </span>
                  </td>
                  <td style={{ padding: 10, border: "1px solid #e2e8f0" }}>
                    <button onClick={() => handleDeleteTask(t.id)} style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {user.role === "employee" && (
        <div style={{ marginTop: 24 }}>
          <h3>My Assigned Tasks</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#f1f5f9" }}>
                <th style={{ padding: 10, border: "1px solid #e2e8f0" }}>Title</th>
                <th style={{ padding: 10, border: "1px solid #e2e8f0" }}>Deadline</th>
                <th style={{ padding: 10, border: "1px solid #e2e8f0" }}>Status</th>
                <th style={{ padding: 10, border: "1px solid #e2e8f0" }}>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id}>
                  <td style={{ padding: 10, border: "1px solid #e2e8f0" }}>{t.title}</td>
                  <td style={{ padding: 10, border: "1px solid #e2e8f0" }}>{t.deadline}</td>
                  <td style={{ padding: 10, border: "1px solid #e2e8f0" }}>
                    <span style={{ padding: "3px 8px", borderRadius: 12, fontSize: 12, background: t.status === "Completed" ? "#bbf7d0" : t.status === "In Progress" ? "#fef08a" : "#fecaca" }}>
                      {t.status}
                    </span>
                  </td>
                  <td style={{ padding: 10, border: "1px solid #e2e8f0" }}>
                    <select value={t.status} onChange={(e) => handleStatusChange(t.id, e.target.value)} style={{ padding: "4px 8px", borderRadius: 4 }}>
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
