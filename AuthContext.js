import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Configure axios defaults
axios.defaults.baseURL = API_BASE;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Set auth header
  const setAuthHeader = useCallback((tkn) => {
    if (tkn) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${tkn}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, []);

  // Load user from token
  useEffect(() => {
    const loadUser = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        setAuthHeader(savedToken);
        try {
          const res = await axios.get('/auth/me');
          setUser(res.data.user);
          setToken(savedToken);
        } catch {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [setAuthHeader]);

  const signup = async (formData) => {
    const res = await axios.post('/auth/signup', formData);
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('token', newToken);
    setAuthHeader(newToken);
    setToken(newToken);
    setUser(newUser);
    return res.data;
  };

  const login = async (formData) => {
    const res = await axios.post('/auth/login', formData);
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('token', newToken);
    setAuthHeader(newToken);
    setToken(newToken);
    setUser(newUser);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthHeader(null);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signup, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;
