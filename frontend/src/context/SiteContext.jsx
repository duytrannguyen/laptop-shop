import React, { createContext, useContext, useEffect, useState } from 'react';
import { http } from '../api/client';

/**
 * SiteContext – Quản lý cài đặt toàn trang web (tên shop, logo, hotline, mạng xã hội...).
 *
 * Cài đặt được load từ API /settings khi ứng dụng khởi động.
 * Nếu API lỗi → sử dụng DEFAULT_SETTINGS làm fallback.
 *
 * Cung cấp:
 * - settings: object chứa toàn bộ cài đặt website
 * - refresh(): gọi lại API để cập nhật cài đặt (dùng sau khi admin lưu settings)
 */

// Giá trị mặc định – dùng khi chưa load xong hoặc API lỗi
const DEFAULT_SETTINGS = {
  storeName: 'Tech Shop - Tech Shop Cần Thơ',
  shortName: 'Tech Shop',
  slogan: 'Sản phẩm công nghệ chất lượng, giá minh bạch',
  hotline: '0816109179',
  email: 'contact@techshop.vn',
  supportEmail: '',
  address: 'Số 25, đường B25, KDC 91B, P. An Khánh, Q. Ninh Kiều, TP. Cần Thơ',
  openingHours: '08:30 - 20:00 hàng ngày',
  mapUrl: '',
  logoUrl: '',
  faviconUrl: '',
  logoFooterUrl: '',
  facebookUrl: '',
  facebookGroupUrl: '',
  zaloUrl: '',
  zaloGroupUrl: '',
  youtubeUrl: '',
  tiktokUrl: '',
  instagramUrl: '',
  googleTagScript: '',
  metaDescription: '',
  maintenanceMode: false,    // Chế độ bảo trì: ẩn toàn bộ site với khách
  popupEnabled: false,       // Bật/tắt popup quảng cáo
  popupImageUrl: '',
  popupLinkUrl: '',
  popupDelay: 3,             // Giây trước khi popup xuất hiện
  popupDuration: 10,         // Giây popup tự đóng (0 = không tự đóng)
  productsPerPage: 10,
};

const SiteContext = createContext({ settings: DEFAULT_SETTINGS, refresh: () => {} });

export function SiteProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  /**
   * Lấy cài đặt mới nhất từ server.
   * Merge với DEFAULT_SETTINGS để đảm bảo không thiếu key nào.
   */
  const refresh = async () => {
    try {
      const response = await http.get('/settings');
      setSettings({ ...DEFAULT_SETTINGS, ...response.data });
    } catch {
      // Nếu lỗi (server chưa sẵn sàng...) → giữ nguyên DEFAULT_SETTINGS
      setSettings(DEFAULT_SETTINGS);
    }
  };

  // Load cài đặt lần đầu khi ứng dụng khởi động
  useEffect(() => {
    refresh();
  }, []);

  return <SiteContext.Provider value={{ settings, refresh }}>{children}</SiteContext.Provider>;
}

/** Hook để sử dụng SiteContext trong các component con. */
export const useSite = () => useContext(SiteContext);
