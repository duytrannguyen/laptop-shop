import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

/**
 * Nút "Quay lên đầu trang" – xuất hiện khi người dùng cuộn xuống hơn 300px.
 *
 * Cách hoạt động:
 * - Lắng nghe sự kiện scroll trên window
 * - Nếu scrollY > 300px → hiển thị nút (class 'show')
 * - Khi click → cuộn mượt lên đầu trang
 *
 * Dùng { passive: true } khi đăng ký sự kiện scroll để không làm chậm cuộn trang.
 */
export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Hiện nút khi đã cuộn xuống hơn 300px
      setVisible(window.scrollY > 300);
    };
    // passive: true giúp browser tối ưu hiệu suất scroll
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      className={`back-to-top ${visible ? 'show' : ''}`}
      onClick={scrollToTop}
      aria-label="Quay lên đầu trang"
      id="back-to-top-btn"
    >
      <ChevronUp size={22} />
    </button>
  );
}
