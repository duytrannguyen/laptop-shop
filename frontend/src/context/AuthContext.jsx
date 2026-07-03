import React, { createContext, useContext, useState, useCallback } from 'react';
import { http } from '../api/client';

/**
 * AuthContext – Quản lý trạng thái đăng nhập của Admin.
 *
 * Lưu trữ:
 * - user: thông tin admin { name, role, email } (khởi tạo từ localStorage)
 * - token: JWT token dùng để xác thực API (khởi tạo từ localStorage)
 * - isAdmin: true nếu đã đăng nhập và có role ADMIN
 *
 * Cung cấp các hàm:
 * - login(email, password): gọi API đăng nhập, lưu token vào localStorage
 * - logout(): xóa token khỏi localStorage, reset state
 */
const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Khởi tạo user từ localStorage (giữ đăng nhập sau khi reload trang)
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('admin_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Khởi tạo token từ localStorage
  const [token, setToken] = useState(() => localStorage.getItem('admin_token') || null);

  /**
   * Đăng nhập: gửi email/password lên server, nhận token và lưu vào localStorage.
   * useCallback để tránh tạo lại hàm khi render (tối ưu performance).
   */
  const login = useCallback(async (email, password) => {
    const res = await http.post('/auth/login', { email, password });
    const { token: t, name, role } = res.data;
    localStorage.setItem('admin_token', t);
    localStorage.setItem('admin_user', JSON.stringify({ name, role, email }));
    setToken(t);
    setUser({ name, role, email });
    return res.data;
  }, []);

  /**
   * Đăng xuất: xóa token và thông tin user khỏi localStorage và state.
   */
  const logout = useCallback(() => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setToken(null);
    setUser(null);
  }, []);

  // isAdmin = true khi có token HỢP LỆ và role là ADMIN
  const isAdmin = !!token && user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Hook để sử dụng AuthContext trong các component con. */
export const useAuth = () => useContext(AuthContext);
