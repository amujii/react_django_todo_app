import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE = 'http://127.0.0.1:8000/api';

function App() {
  const [todoList, setTodoList] = useState([]);
  const [activeItem, setActiveItem] = useState({ id: null, title: '', completed: false });
  const [editing, setEditing] = useState(false);
  const [filter, setFilter] = useState('all'); // all | active | completed
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Helper to extract CSRF token if running in Django template view
  const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === name + '=') {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/task-list/`);
      if (!res.ok) throw new Error('Failed to fetch tasks from API');
      const data = await res.json();
      setTodoList(data);
      setErrorMsg('');
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setErrorMsg('Could not connect to Django backend. Make sure server is running on http://127.0.0.1:8000');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleChange = (e) => {
    setActiveItem({
      ...activeItem,
      title: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeItem.title.trim()) return;

    const csrftoken = getCookie('csrftoken');
    let url = `${API_BASE}/task-create/`;
    let method = 'POST';

    if (editing && activeItem.id) {
      url = `${API_BASE}/task-update/${activeItem.id}/`;
    }

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken || '',
        },
        body: JSON.stringify(activeItem),
      });

      if (!res.ok) throw new Error('Failed to save task');
      
      setActiveItem({ id: null, title: '', completed: false });
      setEditing(false);
      fetchTasks();
    } catch (err) {
      console.error('Submit error:', err);
      setErrorMsg('Failed to save task. Check server status.');
    }
  };

  const startEdit = (task) => {
    setActiveItem(task);
    setEditing(true);
  };

  const cancelEdit = () => {
    setActiveItem({ id: null, title: '', completed: false });
    setEditing(false);
  };

  const deleteItem = async (task) => {
    const csrftoken = getCookie('csrftoken');
    try {
      const res = await fetch(`${API_BASE}/task-delete/${task.id}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken || '',
        },
      });

      if (!res.ok) throw new Error('Failed to delete task');
      fetchTasks();
    } catch (err) {
      console.error('Delete error:', err);
      setErrorMsg('Failed to delete task');
    }
  };

  const toggleStrike = async (task) => {
    const updatedTask = { ...task, completed: !task.completed };
    const csrftoken = getCookie('csrftoken');

    // Optimistic UI update
    setTodoList(todoList.map(t => t.id === task.id ? updatedTask : t));

    try {
      const res = await fetch(`${API_BASE}/task-update/${task.id}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken || '',
        },
        body: JSON.stringify({
          title: updatedTask.title,
          completed: updatedTask.completed,
        }),
      });

      if (!res.ok) throw new Error('Failed to update status');
      fetchTasks();
    } catch (err) {
      console.error('Toggle error:', err);
      fetchTasks(); // rollback on error
    }
  };

  const filteredList = todoList.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const totalTasks = todoList.length;
  const completedCount = todoList.filter(t => t.completed).length;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedCount / totalTasks) * 100);

  return (
    <div className="app-container">
      <div className="background-decor">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <main className="todo-card">
        {/* Header */}
        <header className="card-header">
          <div className="header-title">
            <span className="logo-icon">⚡</span>
            <div>
              <h1>TaskMaster Pro</h1>
              <p className="subtitle">Django REST Framework + React Todo App</p>
            </div>
          </div>
        </header>

        {/* Stats & Progress */}
        <section className="stats-section">
          <div className="stats-grid">
            <div className="stat-box">
              <span className="stat-value">{totalTasks}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-box">
              <span className="stat-value text-active">{totalTasks - completedCount}</span>
              <span className="stat-label">Pending</span>
            </div>
            <div className="stat-box">
              <span className="stat-value text-completed">{completedCount}</span>
              <span className="stat-label">Completed</span>
            </div>
          </div>

          <div className="progress-bar-container">
            <div className="progress-info">
              <span>Overall Progress</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="progress-track">
              <div 
                className="progress-fill" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </section>

        {/* Task Form */}
        <form onSubmit={handleSubmit} className="form-wrapper">
          <div className="input-group">
            <input
              type="text"
              name="title"
              className="task-input"
              placeholder={editing ? "Update task title..." : "What needs to be done today?"}
              value={activeItem.title}
              onChange={handleChange}
              autoComplete="off"
            />
            <button type="submit" className={`submit-btn ${editing ? 'edit-mode' : ''}`}>
              {editing ? 'Update Task' : 'Add Task'}
            </button>
            {editing && (
              <button type="button" onClick={cancelEdit} className="cancel-btn">
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Error notification if backend offline */}
        {errorMsg && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            <span>{errorMsg}</span>
            <button onClick={fetchTasks} className="retry-btn">Retry</button>
          </div>
        )}

        {/* Filter Controls */}
        <div className="filters-bar">
          <div className="filter-tabs">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({totalTasks})
            </button>
            <button
              className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              Active ({totalTasks - completedCount})
            </button>
            <button
              className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completed ({completedCount})
            </button>
          </div>
        </div>

        {/* Task List */}
        <div className="list-wrapper">
          {loading && todoList.length === 0 ? (
            <div className="empty-state">
              <div className="spinner"></div>
              <p>Loading tasks from server...</p>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📌</span>
              <p>{filter === 'all' ? 'No tasks yet. Create one above!' : `No ${filter} tasks.`}</p>
            </div>
          ) : (
            filteredList.map((task) => (
              <div 
                key={task.id} 
                className={`task-item ${task.completed ? 'completed' : ''}`}
              >
                <div 
                  className="task-content" 
                  onClick={() => toggleStrike(task)}
                >
                  <div className={`checkbox ${task.completed ? 'checked' : ''}`}>
                    {task.completed && <span>✓</span>}
                  </div>
                  <span className="task-title">{task.title}</span>
                </div>

                <div className="action-buttons">
                  <button 
                    onClick={() => startEdit(task)} 
                    className="btn-action edit"
                    title="Edit Task"
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    onClick={() => deleteItem(task)} 
                    className="btn-action delete"
                    title="Delete Task"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <footer className="card-footer">
          <span>API Endpoint: <code>/api/task-list/</code></span>
          <span>Click task to toggle status</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
