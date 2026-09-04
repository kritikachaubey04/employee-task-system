import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = "https://https://employee-task-system-9kzh.onrender.com/api";

export default function App() {
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('session_user')) || null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [overview, setOverview] = useState({ metrics: {}, tasks: [] });
  const [employees, setEmployees] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newPriority, setNewPriority] = useState('Medium');
  const [assignedTo, setAssignedTo] = useState('');

  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPass, setEmpPass] = useState('');

  const [myTasks, setMyTasks] = useState([]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await axios.post(`${API_BASE}/login`, { email, password });
      setCurrentUser(res.data);
      localStorage.setItem('session_user', JSON.stringify(res.data));
    } catch (err) {
      setErrorMsg("Invalid email or password");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('session_user');
    setCurrentUser(null);
  };

  const loadAdminData = async () => {
    try {
      const resOverview = await axios.get(`${API_BASE}/admin/overview`);
      setOverview(resOverview.data);
      const resEmp = await axios.get(`${API_BASE}/employees`);
      setEmployees(resEmp.data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadEmployeeData = async () => {
    if (currentUser) {
      try {
        const res = await axios.get(`${API_BASE}/employee/tasks/${currentUser.id}`);
        setMyTasks(res.data);
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'ADMIN') loadAdminData();
      else loadEmployeeData();
    }
  }, [currentUser]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    await axios.post(`${API_BASE}/tasks`, {
      title: newTitle,
      description: newDesc,
      deadline: newDeadline,
      priority: newPriority,
      assigned_to: parseInt(assignedTo)
    });
    setNewTitle(''); setNewDesc(''); setNewDeadline('');
    loadAdminData();
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/employees`, {
        name: empName,
        email: empEmail,
        password: empPass
      });
      setEmpName(''); setEmpEmail(''); setEmpPass('');
      loadAdminData();
      alert("Employee added successfully!");
    } catch (err) {
      alert("Email already exists!");
    }
  };

  const handleDeleteTask = async (id) => {
    await axios.delete(`${API_BASE}/tasks/${id}`);
    loadAdminData();
  };

  const handleStatusChange = async (taskId, newStatus) => {
    await axios.patch(`${API_BASE}/tasks/${taskId}/status`, { status: newStatus });
    loadEmployeeData();
  };

  if (!currentUser) {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.card}>
          <h2 style={{ textAlign: 'center', marginBottom: 20 }}>Launch Lions Task Portal</h2>
          {errorMsg && <p style={{ color: 'red', fontSize: 13, marginBottom: 10 }}>{errorMsg}</p>}
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 14 }}>
              <label style={styles.label}>Email Address</label>
              <input style={styles.input} type="email" placeholder="admin@launchlions.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={styles.label}>Password</label>
              <input style={styles.input} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button style={styles.btnPrimary} type="submit">Sign In</button>
          </form>
          <div style={{ marginTop: 20, fontSize: 12, color: '#666', borderTop: '1px solid #eee', paddingTop: 10 }}>
            <p><b>Admin:</b> admin@launchlions.com / admin123</p>
            <p><b>Employee:</b> kritika@launchlions.com / emp123</p>
          </div>
        </div>
      </div>
    );
  }

  if (currentUser.role === 'ADMIN') {
    const { metrics, tasks } = overview;
    return (
      <div style={styles.page}>
        <header style={styles.header}>
          <h2>Launch Lions Workspace (Admin Mode)</h2>
          <div>
            <span style={{ marginRight: 15, fontWeight: 'bold' }}>{currentUser.name}</span>
            <button style={styles.btnDanger} onClick={handleLogout}>Logout</button>
          </div>
        </header>

        <div style={styles.metricsRow}>
          <div style={styles.metricBox}><h4>Employees</h4><p>{metrics?.total_employees || 0}</p></div>
          <div style={styles.metricBox}><h4>Total Tasks</h4><p>{metrics?.total_tasks || 0}</p></div>
          <div style={{ ...styles.metricBox, borderColor: '#16a34a' }}><h4>Completed</h4><p style={{ color: '#16a34a' }}>{metrics?.completed || 0}</p></div>
          <div style={{ ...styles.metricBox, borderColor: '#ca8a04' }}><h4>In Progress</h4><p style={{ color: '#ca8a04' }}>{metrics?.in_progress || 0}</p></div>
          <div style={{ ...styles.metricBox, borderColor: '#dc2626' }}><h4>Pending</h4><p style={{ color: '#dc2626' }}>{metrics?.pending || 0}</p></div>
        </div>

        <div style={styles.twoColumn}>
          <div style={styles.card}>
            <h3>Assign New Task</h3>
            <form onSubmit={handleCreateTask} style={{ marginTop: 12 }}>
              <input style={styles.input} placeholder="Task Title" value={newTitle} onChange={e => setNewTitle(e.target.value)} required />
              <textarea style={{ ...styles.input, height: 60 }} placeholder="Task Description" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
              <div style={{ display: 'flex', gap: 10 }}>
                <input style={styles.input} type="date" value={newDeadline} onChange={e => setNewDeadline(e.target.value)} required />
                <select style={styles.input} value={newPriority} onChange={e => setNewPriority(e.target.value)}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <select style={styles.input} value={assignedTo} onChange={e => setAssignedTo(e.target.value)} required>
                <option value="">-- Assign To Employee --</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.email})</option>)}
              </select>
              <button style={styles.btnPrimary} type="submit">Assign Task</button>
            </form>
          </div>

          <div style={styles.card}>
            <h3>Register New Employee</h3>
            <form onSubmit={handleAddEmployee} style={{ marginTop: 12 }}>
              <input style={styles.input} placeholder="Full Name" value={empName} onChange={e => setEmpName(e.target.value)} required />
              <input style={styles.input} type="email" placeholder="Work Email" value={empEmail} onChange={e => setEmpEmail(e.target.value)} required />
              <input style={styles.input} type="password" placeholder="Set Password" value={empPass} onChange={e => setEmpPass(e.target.value)} required />
              <button style={{ ...styles.btnPrimary, backgroundColor: '#059669' }} type="submit">Add Employee</button>
            </form>
          </div>
        </div>

        <div style={{ ...styles.card, marginTop: 24 }}>
          <h3>Company Task Overview</h3>
          <table style={styles.table}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={styles.th}>Task</th>
                <th style={styles.th}>Assigned To</th>
                <th style={styles.th}>Deadline</th>
                <th style={styles.th}>Priority</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {tasks?.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: 15 }}>No tasks created yet.</td></tr>
              ) : (
                tasks?.map(t => (
                  <tr key={t.id}>
                    <td style={styles.td}><b>{t.title}</b><br/><small style={{ color: '#64748b' }}>{t.description}</small></td>
                    <td style={styles.td}>{t.assigned_to_name || 'Unassigned'}</td>
                    <td style={styles.td}>{t.deadline}</td>
                    <td style={styles.td}>{t.priority}</td>
                    <td style={styles.td}><span style={badgeStyle(t.status)}>{t.status}</span></td>
                    <td style={styles.td}>
                      <button onClick={() => handleDeleteTask(t.id)} style={{ border: 'none', background: '#fee2e2', color: '#b91c1c', padding: '4px 8px', borderRadius: 4, cursor: 'pointer' }}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h2>Hello, {currentUser.name} 👋</h2>
          <small style={{ color: '#64748b' }}>Role: Full Stack Intern</small>
        </div>
        <button style={styles.btnDanger} onClick={handleLogout}>Logout</button>
      </header>

      <div style={{ ...styles.card, marginTop: 20 }}>
        <h3>My Assigned Tasks</h3>
        <table style={styles.table}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={styles.th}>Task</th>
              <th style={styles.th}>Deadline</th>
              <th style={styles.th}>Priority</th>
              <th style={styles.th}>Current Status</th>
              <th style={styles.th}>Update Status</th>
            </tr>
          </thead>
          <tbody>
            {myTasks.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: 20 }}>No tasks currently assigned to you!</td></tr>
            ) : (
              myTasks.map(t => (
                <tr key={t.id}>
                  <td style={styles.td}><b>{t.title}</b><br/><small style={{ color: '#64748b' }}>{t.description}</small></td>
                  <td style={styles.td}>{t.deadline}</td>
                  <td style={styles.td}>{t.priority}</td>
                  <td style={styles.td}><span style={badgeStyle(t.status)}>{t.status}</span></td>
                  <td style={styles.td}>
                    <select
                      value={t.status}
                      onChange={e => handleStatusChange(t.id, e.target.value)}
                      style={{ padding: 6, borderRadius: 4, border: '1px solid #cbd5e1' }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const badgeStyle = (status) => ({
  padding: '4px 8px',
  borderRadius: 4,
  fontSize: 12,
  fontWeight: 'bold',
  background: status === 'Completed' ? '#dcfce7' : status === 'In Progress' ? '#fef3c7' : '#fee2e2',
  color: status === 'Completed' ? '#15803d' : status === 'In Progress' ? '#b45309' : '#b91c1c'
});

const styles = {
  centerContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f1f5f9', fontFamily: 'sans-serif' },
  page: { maxWidth: 1000, margin: '30px auto', padding: '0 20px', fontFamily: 'sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '16px 20px', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  card: { background: 'white', padding: 20, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', width: '100%', boxSizing: 'border-box' },
  metricsRow: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, margin: '20px 0' },
  metricBox: { background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, padding: 14, textAlign: 'center' },
  twoColumn: { display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 20 },
  input: { width: '100%', padding: '10px', marginBottom: 10, border: '1px solid #cbd5e1', borderRadius: 6, boxSizing: 'border-box' },
  label: { fontSize: 13, color: '#475569', display: 'block', marginBottom: 4 },
  btnPrimary: { width: '100%', padding: 10, background: '#2563eb', color: 'white', border: 'none', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer' },
  btnDanger: { padding: '8px 14px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: 14 },
  th: { borderBottom: '2px solid #e2e8f0', padding: 10, textAlign: 'left', fontSize: 14 },
  td: { borderBottom: '1px solid #f1f5f9', padding: 12, fontSize: 14 }
};
