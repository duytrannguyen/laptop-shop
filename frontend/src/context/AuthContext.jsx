import React, { createContext, useContext, useState, useCallback } from 'react';
import { http } from '../api/client';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('admin_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('admin_token') || null);

  const login = useCallback(async (email, password) => {
    const res = await http.post('/auth/login', { email, password });
    const { token: t, name, role } = res.data;
    localStorage.setItem('admin_token', t);
    localStorage.setItem('admin_user', JSON.stringify({ name, role, email }));
    setToken(t);
    setUser({ name, role, email });
    return res.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setToken(null);
    setUser(null);
  }, []);

  const isAdmin = !!token && user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
