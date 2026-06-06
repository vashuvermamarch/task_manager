import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { validateRegister } from '../utils/validators';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const { register, token, loading, authError, setAuthError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Clear previous auth errors
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

    const { isValid, errors: validationErrors } = validateRegister(
      name,
      email,
      password,
      confirmPassword
    );

    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    const result = await register(name, email, password);

    if (result.success) {
      navigate('/');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card card-tack">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Sign up to track and organize your work</p>
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
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              placeholder="e.g. Karan Verma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={errors.name ? { borderColor: 'hsl(var(--danger))' } : {}}
            />
            {errors.name && <div className="error-text">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              placeholder="e.g. karan@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={errors.email ? { borderColor: 'hsl(var(--danger))' } : {}}
            />
            {errors.email && <div className="error-text">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={errors.password ? { borderColor: 'hsl(var(--danger))' } : {}}
            />
            {errors.password && <div className="error-text">{errors.password}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={errors.confirmPassword ? { borderColor: 'hsl(var(--danger))' } : {}}
            />
            {errors.confirmPassword && (
              <div className="error-text">{errors.confirmPassword}</div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Get Started'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
