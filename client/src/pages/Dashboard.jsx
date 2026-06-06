import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api/axios';
import useAuth from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';
import { 
  Layers, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Search, 
  Plus, 
  FolderPlus,
  Trash2,
  X,
  ArrowUpDown
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  
  // Tasks state
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter State
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  
  // Sorting State
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalTasks: 0 });
  const itemsPerPage = 6;

  // Category Manager Modal
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#ff4d4d');

  // Task Form Modal
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Toast System
  const [toasts, setToasts] = useState([]);
  const [lastDeletedTask, setLastDeletedTask] = useState(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 450);
    return () => clearTimeout(timer);
  }, [search]);

  // Show toast notification
  const addToast = (message, type = 'success', action = null) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, action }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    try {
      // Local storage fallback for customized categories if no backend support is needed for categories,
      // or we can mock it / use a static list combined with local storage to allow creation.
      const stored = localStorage.getItem('taskflow_categories');
      if (stored) {
        setCategories(JSON.parse(stored));
      } else {
        const defaultCats = [
          { id: 'cat-1', name: 'Work', color: '#2d5da1' },
          { id: 'cat-2', name: 'Personal', color: '#22c55e' },
          { id: 'cat-3', name: 'Urgent', color: '#ff4d4d' },
          { id: 'cat-4', name: 'Shopping', color: '#eab308' }
        ];
        setCategories(defaultCats);
        localStorage.setItem('taskflow_categories', JSON.stringify(defaultCats));
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Fetch Tasks with filters & pagination from backend API
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        search: debouncedSearch,
        status: statusFilter,
        page: currentPage,
        limit: itemsPerPage,
      };
      
      const response = await api.get('/tasks', { params });
      
      // Local client-side filtering and sorting for advanced criteria not fully handled by basic backend parameters
      let retrievedTasks = response.data.tasks || [];
      
      // Perform further filtering locally for category and priority if needed
      if (categoryFilter !== 'all') {
        // Find category name or match by ID. We store category ID/Name in task
        retrievedTasks = retrievedTasks.filter(t => t.description && t.description.includes(`[Cat:${categoryFilter}]`) || t.title.includes(`[Cat:${categoryFilter}]`));
      }
      
      // Apply local sorting for multi-field flexibility
      retrievedTasks.sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];

        if (sortBy === 'dueDate') {
          if (!valA) return 1;
          if (!valB) return -1;
          return sortOrder === 'asc' 
            ? new Date(valA) - new Date(valB)
            : new Date(valB) - new Date(valA);
        }
        
        if (typeof valA === 'string') {
          return sortOrder === 'asc' 
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }
        return 0;
      });

      setTasks(retrievedTasks);
      setPagination(response.data.pagination || { page: 1, totalPages: 1, totalTasks: response.data.length });
    } catch (error) {
      showToast('Error fetching tasks from server.', 'error');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, categoryFilter, sortBy, sortOrder, currentPage]);

  useEffect(() => {
    fetchCategories();
    fetchTasks();
  }, [fetchTasks, fetchCategories]);

  // Overall Statistics calculated across all tasks
  const stats = useMemo(() => {
    // To get true stats, we would ideally fetch all without pagination limit
    // Here we compute based on current loaded task metadata or query all
    const total = pagination.totalTasks || tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    
    // Check for overdue tasks
    const todayStr = new Date().toISOString().split('T')[0];
    const overdue = tasks.filter(t => t.status === 'pending' && t.dueDate && t.dueDate < todayStr).length;

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pending, overdue, percent };
  }, [tasks, pagination]);

  // Task Handlers
  const handleToggleStatus = async (id) => {
    const originalTasks = [...tasks];
    // Optimistic UI update
    setTasks(prev => prev.map(t => t._id === id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t));
    
    try {
      const response = await api.patch(`/tasks/${id}/status`);
      showToast(`Task marked as ${response.data.status}`, 'success');
      fetchStats();
    } catch (err) {
      setTasks(originalTasks);
      showToast('Could not update task status.', 'error');
    }
  };

  const handleDelete = async (id) => {
    const deleted = tasks.find(t => t._id === id);
    try {
      await api.delete(`/tasks/${id}`);
      setLastDeletedTask(deleted);
      showToast('Task deleted successfully.', 'info', {
        label: 'Undo',
        callback: async () => {
          if (deleted) {
            try {
              await api.post('/tasks', {
                title: deleted.title,
                description: deleted.description,
                status: deleted.status,
                dueDate: deleted.dueDate
              });
              fetchTasks();
              showToast('Task restored!', 'success');
            } catch (rErr) {
              showToast('Failed to restore task.', 'error');
            }
          }
        }
      });
      fetchTasks();
      fetchStats();
    } catch (err) {
      showToast('Could not delete task.', 'error');
    }
  };

  const handleCreateOrUpdate = async (taskData) => {
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, taskData);
        showToast('Task updated successfully.', 'success');
      } else {
        await api.post('/tasks', taskData);
        showToast('Task created successfully.', 'success');
      }
      setIsTaskModalOpen(false);
      setEditingTask(null);
      fetchTasks();
      fetchStats();
    } catch (err) {
      showToast('Error saving task.', 'error');
    }
  };

  // Add Category Handler
  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const newCat = {
      id: 'cat-' + Date.now(),
      name: newCatName.trim(),
      color: newCatColor
    };
    const updated = [...categories, newCat];
    setCategories(updated);
    localStorage.setItem('taskflow_categories', JSON.stringify(updated));
    setNewCatName('');
    showToast('Category created!', 'success');
  };

  const handleDeleteCategory = (id) => {
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    localStorage.setItem('taskflow_categories', JSON.stringify(updated));
    showToast('Category removed.', 'info');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '2rem 1.5rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {/* Welcome Section */}
        <div style={{ marginBottom: '2rem', animation: 'fadeIn 0.3s ease-out' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            My Workspace
          </h2>
          <p style={{ color: 'var(--pencil-black)', opacity: 0.7 }}>
            Organize, track, and complete your tasks with ease.
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem'
        }}>
          {/* Total Tasks Card */}
          <div className="auth-card sticky-note" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', transform: 'rotate(-0.5deg)' }}>
            <div style={{ background: 'rgba(45, 45, 45, 0.08)', border: '2px solid var(--pencil-black)', padding: '10px', borderRadius: '10px' }}>
              <Layers size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', opacity: 0.7 }}>Total Tasks</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{stats.total}</div>
            </div>
          </div>

          {/* Pending Tasks Card */}
          <div className="auth-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', transform: 'rotate(0.5deg)', backgroundColor: '#fff' }}>
            <div style={{ background: 'rgba(45, 45, 45, 0.08)', border: '2px solid var(--pencil-black)', padding: '10px', borderRadius: '10px' }}>
              <Clock size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', opacity: 0.7 }}>Pending</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{stats.pending}</div>
            </div>
          </div>

          {/* Overdue Tasks Card */}
          <div className="auth-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', transform: 'rotate(-0.8deg)', backgroundColor: '#fee2e2', borderColor: 'var(--pencil-black)' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '2px solid var(--pencil-black)', padding: '10px', borderRadius: '10px', color: 'var(--color-accent-red)' }}>
              <Clock size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--color-accent-red)' }}>Overdue</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-accent-red)' }}>{stats.overdue}</div>
            </div>
          </div>

          {/* Completion Progress Card */}
          <div className="auth-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transform: 'rotate(0.5deg)', backgroundColor: '#fff' }}>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', opacity: 0.7 }}>Progress</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginTop: '0.25rem' }}>{stats.percent}%</div>
            </div>
            <div style={{ position: 'relative', width: '60px', height: '60px' }}>
              <svg style={{ transform: 'rotate(-90deg)', width: '60px', height: '60px' }}>
                <circle
                  cx="30"
                  cy="30"
                  r="24"
                  stroke="var(--erased-pencil)"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="30"
                  cy="30"
                  r="24"
                  stroke="var(--color-accent-blue)"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray="150.7"
                  strokeDashoffset={150.7 - (150.7 * stats.percent) / 100}
                  style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 'bold' }}>
                {stats.completed}/{stats.total}
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Control Bar */}
        <section className="auth-card" style={{ backgroundColor: '#fff', padding: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Search */}
              <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--pencil-black)', opacity: 0.6, display: 'flex', alignItems: 'center' }}>
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tasks..."
                  style={{ paddingLeft: '2.5rem', width: '100%' }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => setIsCatModalOpen(true)}
                  className="btn btn-secondary"
                  style={{ height: '42px', fontSize: '1rem' }}
                >
                  Categories
                </button>
                <button
                  onClick={openAddModal}
                  className="btn btn-primary"
                  style={{ height: '42px', fontSize: '1rem' }}
                >
                  <Plus size={16} /> Add Task
                </button>
              </div>
            </div>

            {/* Filter and Sorter Selections */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', borderTop: '2px dashed var(--pencil-black)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  style={{ height: '36px', padding: '0 0.5rem', fontSize: '0.9rem' }}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>

                {/* Category Filter */}
                <select
                  value={categoryFilter}
                  onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                  style={{ height: '36px', padding: '0 0.5rem', fontSize: '0.9rem' }}
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={tabFriendlyString(cat.name)}>{cat.name}</option>
                  ))}
                </select>

                {/* Sort Order Selector */}
                <select
                  value={sortBy}
                  onChange={handleSortByChange}
                  style={{ height: '36px', padding: '0 0.5rem', fontSize: '0.9rem' }}
                >
                  <option value="dueDate">Due Date</option>
                  <option value="title">Title</option>
                  <option value="createdAt">Date Created</option>
                </select>

                <button
                  onClick={toggleSortOrder}
                  className="btn btn-secondary"
                  style={{ height: '36px', width: '36px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title={order === 'asc' ? 'Sort Ascending' : 'Sort Descending'}
                >
                  <ArrowUpDown size={14} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Task List */}
        <section style={{ position: 'relative' }}>
          <TaskList
            tasks={tasks}
            loading={loading}
            pagination={pagination}
            onPageChange={setPage}
            onToggleStatus={handleToggleStatus}
            onEdit={openEditModal}
            onDelete={handleDeleteTask}
            onAddTaskClick={openAddModal}
          />
        </section>
      </main>

      {/* Task Form Modal */}
      <TaskForm
        isOpen={isTaskModalOpen}
        onClose={() => { setIsTaskModalOpen(false); setEditingTask(null); }}
        onSubmit={handleCreateOrUpdate}
        task={editingTask}
      />

      {/* Category Manager Modal */}
      {isCatModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(45, 45, 45, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
        }}>
          <div className="auth-card animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2rem', background: '#fff', position: 'relative' }}>
            <button
              onClick={() => setIsCatModalOpen(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', color: 'var(--pencil-black)' }}
            >
              <X size={18} />
            </button>

            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
              Manage Categories
            </h3>

            <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="New category name"
                required
                style={{ flex: 1, height: '38px', fontSize: '0.95rem' }}
              />
              <input
                type="color"
                value={newCatColor}
                onChange={(e) => setNewCatColor(e.target.value)}
                style={{ width: '38px', height: '38px', padding: 0, border: '3px solid var(--pencil-black)', cursor: 'pointer', borderRadius: '8px' }}
              />
              <button type="submit" className="btn btn-primary" style={{ height: '38px', padding: '0 1rem' }}>
                Add
              </button>
            </form>

            <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {categories.map(cat => (
                <div key={cat.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', border: '2px dashed var(--pencil-black)', borderRadius: '8px', background: 'var(--bg-paper)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: cat.color }}></span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>{cat.name}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    style={{ background: 'none', color: 'var(--color-accent-red)' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button onClick={() => setIsCatModalOpen(false)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Hub */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <span>{toast.message}</span>
            {toast.action && (
              <button
                onClick={() => {
                  toast.action.callback();
                  removeToast(toast.id);
                }}
                className="btn btn-secondary"
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', marginLeft: 'auto' }}
              >
                {toast.action.label}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  function tabFriendlyString(str) {
    return str.toLowerCase().replace(/\s+/g, '-');
  }
};

export default Dashboard;
