import React from 'react';
import { Trash2, Edit2, Calendar, CheckSquare, Square } from 'lucide-react';

const TaskItem = ({ task, onToggleStatus, onEdit, onDelete }) => {
  const isCompleted = task.status === 'completed';
  const rotation = task.title.length % 2 === 0 ? 'rotate(1deg)' : 'rotate(-1deg)';

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      onDelete(task._id);
    }
  };

  return (
    <div 
      className="glass-card card-tape animate-fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.5rem 1.25rem 1.25rem 1.25rem',
        border: '3px solid var(--pencil-black)',
        borderRadius: 'var(--radius-wobbly-1)',
        boxShadow: '4px 4px 0px var(--pencil-black)',
        transform: rotation,
        backgroundColor: isCompleted ? 'var(--erased-pencil)' : '#ffffff',
        opacity: isCompleted ? 0.75 : 1,
        transition: 'all 0.25s ease',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <button
            onClick={() => onToggleStatus(task._id)}
            style={{
              background: 'none',
              padding: 0,
              color: isCompleted ? 'var(--color-accent-blue)' : 'var(--pencil-black)',
              display: 'flex',
              alignItems: 'center',
              marginTop: '2px',
            }}
          >
            {isCompleted ? <CheckSquare size={19} /> : <Square size={19} />}
          </button>
          
          <h4 style={{
            fontSize: '1.25rem',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            color: 'var(--pencil-black)',
            textDecoration: isCompleted ? 'line-through' : 'none',
            wordBreak: 'break-word',
          }}>
            {task.title}
          </h4>
        </div>

        {task.description && (
          <p style={{
            fontSize: '1.05rem',
            color: 'var(--pencil-black)',
            opacity: 0.85,
            marginLeft: '2rem',
            marginBottom: '1rem',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}>
            {task.description}
          </p>
        )}
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTop: '2px dashed var(--pencil-black)',
        paddingTop: '0.75rem',
        marginTop: '0.5rem',
        marginLeft: '2rem',
      }}>
        {/* Due Date Indicator */}
        {task.dueDate ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--pencil-black)', fontSize: '0.95rem', fontWeight: 'bold' }}>
            <Calendar size={13} style={{ color: 'var(--color-accent-blue)' }} />
            <span>{formatDate(task.dueDate)}</span>
          </div>
        ) : (
          <div></div>
        )}

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => onEdit(task)}
            style={{
              padding: '4px',
              borderRadius: '4px',
              color: 'hsl(var(--text-muted))',
              background: 'none',
              display: 'flex',
              alignItems: 'center',
            }}
            className="btn-secondary"
            title="Edit Task"
          >
            <Edit2 size={14} />
          </button>
          
          <button
            onClick={handleDelete}
            style={{
              padding: '4px',
              borderRadius: '4px',
              color: 'hsl(var(--danger))',
              background: 'none',
              display: 'flex',
              alignItems: 'center',
            }}
            className="btn-secondary"
            title="Delete Task"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
