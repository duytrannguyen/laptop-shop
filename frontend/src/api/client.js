import axios from 'axios';

/**
 * Cấu hình Axios – client HTTP dùng chung cho toàn bộ ứng dụng.
 *
 * - API: URL gốc của backend (lấy từ biến môi trường VITE_API_URL, mặc định là /api)
 * - http: instance Axios đã được cấu hình sẵn baseURL
 *
 * Hai interceptor được gắn vào:
 * 1. Request interceptor: tự động đính kèm JWT token vào header Authorization
 * 2. Response interceptor: bắt lỗi 401 → xóa token → chuyển về trang đăng nhập
 */

// URL gốc của API backend
export const API = import.meta.env.VITE_API_URL || '/api';

// Instance Axios với baseURL đã cấu hình
export const http = axios.create({ baseURL: API });

// Interceptor 1: Tự động gắn token vào mọi request gửi đi
// Token được lưu trong localStorage sau khi admin đăng nhập thành công
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor 2: Xử lý lỗi 401 (Unauthorized) từ server
// Khi token hết hạn hoặc không hợp lệ → xóa thông tin đăng nhập → chuyển về trang login
http.interceptors.response.use(
  (res) => res, // Trả về response bình thường nếu không có lỗi
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      // Chỉ redirect khi đang ở trang admin (tránh redirect vòng lặp)
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.assign('/admin/login');
      }
    }
    return Promise.reject(err);
  }
);
