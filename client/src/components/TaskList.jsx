import React from 'react';
import TaskItem from './TaskItem';
import Loader from './Loader';
import { PlusCircle, Search } from 'lucide-react';

const TaskList = ({
  tasks,
  loading,
  pagination,
  onPageChange,
  onToggleStatus,
  onEdit,
  onDelete,
  onAddTaskClick,
}) => {
  if (loading) {
    return <Loader size="large" />;
  }

  if (tasks.length === 0) {
    return (
      <div 
        className="auth-card sticky-note card-tack" 
        style={{
          padding: '3rem 2rem',
          textAlign: 'center',
          marginTop: '2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <div style={{
          backgroundColor: 'rgba(45, 45, 45, 0.08)',
          color: 'var(--pencil-black)',
          padding: '1rem',
          borderRadius: '50%',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '0.25rem',
          border: '2px dashed var(--pencil-black)'
        }}>
          <Search size={30} />
        </div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--pencil-black)' }}>No tasks found</h3>
        <p style={{ color: 'var(--pencil-black)', opacity: 0.85, maxWidth: '300px', fontSize: '1.1rem' }}>
          Get started by adding your first task or clearing the search/filters.
        </p>
        <button
          onClick={onAddTaskClick}
          className="btn btn-primary"
          style={{ marginTop: '0.5rem' }}
        >
          <PlusCircle size={16} />
          <span>Add Task</span>
        </button>
      </div>
    );
  }

  const { page, totalPages } = pagination;

  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '1.25rem',
        marginTop: '1.5rem',
      }}>
        {tasks.map((task) => (
          <TaskItem
            key={task._id}
            task={task}
            onToggleStatus={onToggleStatus}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.5rem',
          marginTop: '2.5rem',
        }}>
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="btn btn-secondary"
            style={{ padding: '0.5rem 1rem', opacity: page === 1 ? 0.5 : 1, cursor: page === 1 ? 'not-allowed' : 'pointer' }}
          >
            Previous
          </button>
          
          <span style={{ fontSize: '0.9rem', color: 'hsl(var(--text-muted))', margin: '0 0.5rem' }}>
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className="btn btn-secondary"
            style={{ padding: '0.5rem 1rem', opacity: page === totalPages ? 0.5 : 1, cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskList;
