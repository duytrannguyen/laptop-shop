import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import MaintenancePage from '../../pages/user/MaintenancePage';
import { useSite } from '../../context/SiteContext';

/**
 * Layout chính cho toàn bộ trang dành cho khách hàng (user-facing).
 *
 * Cấu trúc:
 * - Header (thanh điều hướng + giỏ hàng)
 * - <Outlet /> (nội dung trang hiện tại từ React Router)
 * - Footer
 *
 * Chế độ bảo trì: Nếu admin bật maintenanceMode trong Settings,
 * toàn bộ nội dung sẽ bị thay bằng trang MaintenancePage.
 */
export default function UserLayout() {
  const { settings } = useSite();

  // Hiển thị trang bảo trì nếu admin bật chế độ này
  if (settings?.maintenanceMode) {
    return <MaintenancePage />;
  }

  return (
    <>
      <Header />
      <Outlet /> {/* Render trang con tương ứng với URL hiện tại */}
      <Footer />
    </>
  );
}
