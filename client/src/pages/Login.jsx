import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { validateLogin } from '../utils/validators';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  
  const { login, token, loading, authError, setAuthError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Clear any previous auth errors
    setAuthError(null);
    
    // Redirect if already logged in
    if (token) {
      navigate('/');
    }
  }, [token, navigate, setAuthError]);

  useEffect(() => {
    if (authError) {
      setApiError(authError);
    }
  }, [authError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    const { isValid, errors: validationErrors } = validateLogin(email, password);
    
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }
    
    setErrors({});
    const result = await login(email, password);
    
    if (result.success) {
      navigate('/');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card card-tape">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Login to manage your tasks effectively</p>
        </div>

        {apiError && (
          <div style={{
            background: 'hsl(var(--danger) / 0.15)',
            border: '1px solid hsl(var(--danger) / 0.3)',
            color: 'hsl(var(--danger))',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            textAlign: 'center'
          }}>
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              placeholder="e.g. karan@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={errors.email ? 'border-danger' : ''}
              style={errors.email ? { borderColor: 'hsl(var(--danger))' } : {}}
            />
            {errors.email && <div className="error-text">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={errors.password ? { borderColor: 'hsl(var(--danger))' } : {}}
            />
            {errors.password && <div className="error-text">{errors.password}</div>}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create one here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
