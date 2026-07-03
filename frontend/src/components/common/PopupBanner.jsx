import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { useSite } from '../../context/SiteContext';

/**
 * Popup Banner quảng cáo – hiển thị sau khi người dùng vào trang một thời gian.
 *
 * Cấu hình trong Admin → Settings → Popup Banner:
 * - popupEnabled: bật/tắt tính năng
 * - popupImageUrl: ảnh popup
 * - popupLinkUrl: link khi click vào ảnh (tùy chọn)
 * - popupDelay: giây chờ trước khi hiện (mặc định 3 giây)
 * - popupDuration: giây tự động đóng (mặc định 10 giây, 0 = không tự đóng)
 *
 * Dùng sessionStorage để chỉ hiển thị 1 lần mỗi phiên làm việc.
 * Người dùng đóng trang, mở lại → popup xuất hiện lại.
 */
export default function PopupBanner() {
  const { settings } = useSite();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Không làm gì nếu popup chưa được bật hoặc chưa có ảnh
    if (!settings?.popupEnabled || !settings?.popupImageUrl) return;

    // Kiểm tra xem người dùng đã thấy popup trong phiên này chưa
    const hasSeen = sessionStorage.getItem('hasSeenPopup');
    if (hasSeen) return;

    const delay = (settings.popupDelay ?? 3) * 1000;
    const duration = (settings.popupDuration ?? 10) * 1000;

    let hideTimer;

    const showTimer = setTimeout(() => {
      setShow(true);
      // Đánh dấu đã xem trong session này (không hiện lại khi chuyển trang)
      sessionStorage.setItem('hasSeenPopup', 'true');

      // Tự đóng sau popupDuration giây (nếu > 0)
      if (duration > 0) {
        hideTimer = setTimeout(() => {
          setShow(false);
        }, duration);
      }
    }, delay);

    // Cleanup: hủy timer khi component unmount
    return () => {
      clearTimeout(showTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [settings]);

  if (!show) return null;

  // Nội dung popup (ảnh + nút đóng)
  const content = (
    <div style={{ position: 'relative' }}>
      {/* Nút X đóng popup */}
      <button
        onClick={(e) => {
          e.preventDefault();
          setShow(false);
        }}
        style={{
          position: 'absolute',
          top: '-15px',
          right: '-15px',
          background: '#fff',
          border: 'none',
          borderRadius: '50%',
          width: '30px',
          height: '30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          cursor: 'pointer',
          zIndex: 10,
          color: '#333'
        }}
      >
        <X size={18} />
      </button>
      <img
        src={settings.popupImageUrl}
        alt="Popup"
        style={{
          maxWidth: '100%',
          maxHeight: '80vh',
          borderRadius: '8px',
          display: 'block'
        }}
      />
    </div>
  );

  return (
    // Overlay tối bao phủ toàn trang
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      animation: 'fadeIn 0.3s ease'
    }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Nếu có link → bọc nội dung trong thẻ Link, ngược lại chỉ bọc bằng div */}
      {settings.popupLinkUrl ? (
        <Link to={settings.popupLinkUrl} onClick={() => setShow(false)}>
          {content}
        </Link>
      ) : (
        <div>{content}</div>
      )}
    </div>
  );
}
