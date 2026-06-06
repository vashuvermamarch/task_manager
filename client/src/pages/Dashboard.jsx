import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';
import { 
  Plus, 
  Search, 
  CheckCircle, 
  Clock, 
  Layers, 
  ArrowUpDown, 
  CheckSquare 
} from 'lucide-react';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalTasks: 0 });
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);

  // Stats
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });

  // Toasts
  const [toasts, setToasts] = useState([]);

  // Add a toast message
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on new search
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch stats separately to reflect true database totals without page limits
  const fetchStats = useCallback(async () => {
    try {
      // Fetch all tasks for the logged in user to calculate correct counts
      const res = await api.get('/tasks', { params: { limit: 1000 } });
      const allTasks = res.data.tasks || [];
      const completed = allTasks.filter(t => t.status === 'completed').length;
      setStats({
        total: allTasks.length,
        completed,
        pending: allTasks.length - completed
      });
    } catch (error) {
      console.error('Error fetching statistics', error);
    }
  }, []);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        search: debouncedSearch,
        status: statusFilter,
        sortBy,
        order,
        page,
        limit: 6, // 6 tasks per page
      };

      const response = await api.get('/tasks', { params });
      setTasks(response.data.tasks || []);
      setPagination(response.data.pagination || { page: 1, totalPages: 1, totalTasks: 0 });
    } catch (error) {
      showToast(error.response?.data?.message || 'Error fetching tasks', 'error');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, sortBy, order, page]);

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, [fetchTasks, fetchStats]);

  // Task Handlers
  const handleCreateOrUpdateTask = async (taskData) => {
    try {
      if (currentTask) {
        // Update
        const response = await api.put(`/tasks/${currentTask._id}`, taskData);
        setTasks((prev) =>
          prev.map((t) => (t._id === currentTask._id ? response.data : t))
        );
        showToast('Task updated successfully');
      } else {
        // Create
        const response = await api.post('/tasks', taskData);
        setTasks((prev) => [response.data, ...prev].slice(0, 6)); // Shift grid window
        showToast('Task created successfully');
      }
      fetchStats();
      fetchTasks(); // Reload window state
    } catch (error) {
      showToast(error.response?.data?.message || 'Action failed', 'error');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const response = await api.patch(`/tasks/${id}/status`);
      setTasks((prev) =>
        prev.map((t) => (t._id === id ? response.data : t))
      );
      showToast(response.data.status === 'completed' ? 'Task completed!' : 'Task set to pending');
      fetchStats();
    } catch (error) {
      showToast('Failed to toggle status', 'error');
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      showToast('Task deleted successfully');
      fetchStats();
      // Adjust page index if page is empty
      if (tasks.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchTasks();
      }
    } catch (error) {
      showToast('Failed to delete task', 'error');
    }
  };

  const openAddModal = () => {
    setCurrentTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setCurrentTask(task);
    setIsModalOpen(true);
  };

  const toggleSortOrder = () => {
    setOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    setPage(1);
  };

  const handleSortByChange = (e) => {
    setSortBy(e.target.value);
    setPage(1);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        
        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem'
        }}>
          <div className="auth-card sticky-note card-tack" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', transform: 'rotate(-1deg)' }}>
            <div style={{ backgroundColor: 'rgba(45, 45, 45, 0.08)', border: '2px dashed var(--pencil-black)', color: 'var(--pencil-black)', padding: '8px', borderRadius: '50%' }}>
              <Layers size={20} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--pencil-black)', fontWeight: 700 }}>Total Tasks</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{stats.total}</div>
            </div>
          </div>

          <div className="auth-card sticky-note card-tack" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', transform: 'rotate(1.5deg)' }}>
            <div style={{ backgroundColor: 'rgba(45, 45, 45, 0.08)', border: '2px dashed var(--pencil-black)', color: 'var(--pencil-black)', padding: '8px', borderRadius: '50%' }}>
              <Clock size={20} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--pencil-black)', fontWeight: 700 }}>Pending</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{stats.pending}</div>
            </div>
          </div>

          <div className="auth-card sticky-note card-tack" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', transform: 'rotate(-0.8deg)' }}>
            <div style={{ backgroundColor: 'rgba(45, 45, 45, 0.08)', border: '2px dashed var(--pencil-black)', color: 'var(--pencil-black)', padding: '8px', borderRadius: '50%' }}>
              <CheckCircle size={20} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--pencil-black)', fontWeight: 700 }}>Completed</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{stats.completed}</div>
            </div>
          </div>
        </div>

        {/* Action Controls (Search, Filters, Create) */}
        <div className="auth-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#ffffff' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
            
            {/* Search Box */}
            <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--pencil-black)', display: 'flex', alignItems: 'center', opacity: 0.6 }}>
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Search tasks by title or desc..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '2.5rem', width: '100%', borderRadius: 'var(--radius-wobbly-input)' }}
              />
            </div>

            {/* Quick Add Button */}
            <button
              onClick={openAddModal}
              className="btn btn-primary"
              style={{ height: '42px' }}
            >
              <Plus size={18} />
              <span>Create Task</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', borderTop: '2px dashed var(--pencil-black)', paddingTop: '1rem', alignItems: 'center' }}>
            
            {/* Status Filter Tabs */}
            <div style={{ display: 'inline-flex', backgroundColor: 'var(--erased-pencil)', padding: '4px', borderRadius: 'var(--radius-wobbly-input)', border: '2px solid var(--pencil-black)' }}>
              {['all', 'pending', 'completed'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setStatusFilter(tab); setPage(1); }}
                  style={{
                    padding: '0.4rem 1rem',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    textTransform: 'capitalize',
                    background: statusFilter === tab ? 'var(--color-accent-blue)' : 'none',
                    color: statusFilter === tab ? '#ffffff' : 'var(--pencil-black)',
                    border: 'none',
                    fontWeight: 'bold',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Sorter Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label htmlFor="sortBy" style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--pencil-black)', fontWeight: 700 }}>Sort By:</label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={handleSortByChange}
                style={{ height: '36px', padding: '0 0.5rem', fontSize: '1rem', borderRadius: 'var(--radius-wobbly-input)' }}
              >
                <option value="createdAt">Date Created</option>
                <option value="title">Title</option>
                <option value="dueDate">Due Date</option>
              </select>
              
              <button
                onClick={toggleSortOrder}
                className="btn btn-secondary"
                style={{ height: '36px', width: '36px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-wobbly-btn)' }}
                title={order === 'asc' ? 'Sort Ascending' : 'Sort Descending'}
              >
                <ArrowUpDown size={14} />
              </button>
            </div>

          </div>
        </div>

        {/* Task Grid Component */}
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

      </main>

      {/* Task Creation & Editing Modal Overlay */}
      <TaskForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdateTask}
        task={currentTask}
      />

      {/* Action Toast Notification Center */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <CheckSquare size={16} />
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
