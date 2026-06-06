import React from 'react';
import useAuth from '../hooks/useAuth';
import { LogOut, CheckSquare, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '0.8rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#ffffff',
      borderBottom: '4px solid var(--pencil-black)',
      boxShadow: '0 4px 0px rgba(45, 45, 45, 0.1)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          backgroundColor: 'var(--color-accent-blue)',
          border: '2px solid var(--pencil-black)',
          padding: '6px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <CheckSquare size={18} color="#fff" />
        </div>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.6rem',
          fontWeight: 700,
          color: 'var(--pencil-black)',
          letterSpacing: '-0.01em'
        }}>
          TaskFlow
        </span>
      </div>

      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'var(--erased-pencil)',
            padding: '0.3rem 0.75rem',
            borderRadius: 'var(--radius-wobbly-input)',
            border: '2px solid var(--pencil-black)',
            fontSize: '1rem',
            fontWeight: 'bold',
          }}>
            <User size={14} style={{ color: 'var(--color-accent-blue)' }} />
            <span style={{ color: 'var(--pencil-black)' }}>
              Hi, <span>{user.name}</span>
            </span>
          </div>

          <button
            onClick={logout}
            className="btn btn-secondary"
            style={{
              padding: '0.3rem 0.75rem',
              fontSize: '0.95rem',
              gap: '0.25rem',
              borderRadius: 'var(--radius-wobbly-btn)',
            }}
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
