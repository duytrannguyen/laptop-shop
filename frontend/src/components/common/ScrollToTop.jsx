import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Component tự động cuộn về đầu trang khi chuyển route.
 *
 * Vấn đề: Mặc định React Router giữ nguyên vị trí scroll khi chuyển trang.
 * Ví dụ: Cuộn xuống trang Sản phẩm → click vào sản phẩm → vẫn ở giữa trang.
 *
 * Component này lắng nghe pathname thay đổi → cuộn về top ngay lập tức (instant).
 * Dùng 'instant' thay vì 'smooth' để tránh lag khi chuyển trang nhanh.
 *
 * Không render gì ra UI (return null).
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Cuộn về đầu trang mỗi khi URL thay đổi
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return null; // Component này chỉ có side effect, không render UI
}
