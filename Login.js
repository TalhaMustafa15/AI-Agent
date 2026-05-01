import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!formData.email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email))
      e.email = 'Enter a valid email address';
    if (!formData.password)
      e.password = 'Password is required';
    return e;
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      await login(formData);
      toast.success('Welcome back! 👋');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      toast.error(msg);
      if (msg.toLowerCase().includes('not found')) {
        setErrors({ email: 'User not found. Please sign up first.' });
      } else if (msg.toLowerCase().includes('invalid')) {
        setErrors({ password: 'Invalid credentials' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb orb-a" />
        <div className="auth-orb orb-b" />
      </div>

      <motion.div
        className="auth-card card"
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="auth-header">
          <div className="auth-logo">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M11 2L19.5 7V15L11 20L2.5 15V7L11 2Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <circle cx="11" cy="11" r="3" fill="currentColor"/>
            </svg>
          </div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your NeuralQ account</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <input
                type="email"
                name="email"
                className={`form-input with-icon ${errors.email ? 'error' : ''}`}
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                autoFocus
              />
            </div>
            {errors.email && <p className="form-error">⚠ {errors.email}</p>}
          </div>

          <div className="form-group">
            <div className="label-row">
              <label className="form-label">Password</label>
            </div>
            <div className="input-wrapper">
              <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                type={showPass ? 'text' : 'password'}
                name="password"
                className={`form-input with-icon ${errors.password ? 'error' : ''}`}
                placeholder="Your password"
                value={formData.password}
                onChange={handleChange}
              />
              <button type="button" className="toggle-pass" onClick={() => setShowPass(!showPass)}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && <p className="form-error">⚠ {errors.password}</p>}
          </div>

          <motion.button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {loading ? (
              <><div className="btn-spinner" /> Signing in...</>
            ) : (
              <>Sign In →</>
            )}
          </motion.button>
        </form>

        <p className="auth-switch">
          Don't have an account?{' '}
          <Link to="/signup" className="auth-link">Sign up free</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
