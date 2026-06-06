import React from 'react';

const Loader = ({ fullPage = false, size = 'medium' }) => {
  const sizeClasses = {
    small: 'w-6 h-6 border-2',
    medium: 'w-10 h-10 border-3',
    large: 'w-16 h-16 border-4',
  };

  const loaderStyle = {
    width: size === 'small' ? '24px' : size === 'large' ? '64px' : '40px',
    height: size === 'small' ? '24px' : size === 'large' ? '64px' : '40px',
    border: `${size === 'small' ? '2px' : size === 'large' ? '4px' : '3px'} solid hsl(var(--border-color))`,
    borderTopColor: 'hsl(var(--primary))',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  const containerStyle = fullPage
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'hsl(var(--bg-primary) / 0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }
    : {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      };

  return (
    <div style={containerStyle}>
      <div style={loaderStyle}></div>
    </div>
  );
};

export default Loader;
