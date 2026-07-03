import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { http } from '../../api/client';
import { useNavigate } from 'react-router-dom';

/**
 * Chuông thông báo real-time cho Admin (chỉ hiển thị khi đã đăng nhập).
 *
 * Cách hoạt động:
 * 1. Load danh sách thông báo và số chưa đọc từ API khi mount
 * 2. Kết nối SSE (Server-Sent Events) để nhận thông báo đơn hàng mới theo thời gian thực
 * 3. Khi có đơn mới → cập nhật danh sách và hiện toast thông báo
 * 4. Click chuông → mở dropdown danh sách thông báo
 * 5. Click vào thông báo → đánh dấu đã đọc + chuyển đến trang đơn hàng
 *
 * Badge số đỏ hiển thị số thông báo chưa đọc, biểu tượng chuông có animation rung khi có thông báo mới.
 */
export default function NotificationBell() {
  const { isAdmin, token } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isAdmin || !token) return;

    // Load danh sách thông báo và số chưa đọc song song
    const fetchNotifications = async () => {
      try {
        const [notifsRes, countRes] = await Promise.all([
          http.get('/admin/notifications'),
          http.get('/admin/notifications/unread-count')
        ]);
        setNotifications(notifsRes.data);
        setUnreadCount(countRes.data.count);
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };
    fetchNotifications();

    // Kết nối SSE để nhận thông báo đơn hàng mới theo thời gian thực
    // Token truyền qua query param vì EventSource không hỗ trợ custom header
    const eventSource = new EventSource(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/admin/notifications/stream?token=${token}`);

    // Lắng nghe sự kiện 'new-order' từ server
    eventSource.addEventListener('new-order', (event) => {
      const data = JSON.parse(event.data);
      setNotifications(prev => [data, ...prev]); // Thêm vào đầu danh sách
      setUnreadCount(prev => prev + 1);
      showToast(data.message, 'info'); // Hiện toast thông báo
    });

    // Đóng kết nối khi lỗi (server restart, mất mạng...)
    eventSource.onerror = () => {
      eventSource.close();
    };

    // Cleanup: đóng SSE khi component unmount
    return () => {
      eventSource.close();
    };
  }, [isAdmin, token, showToast]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /** Xử lý khi click vào 1 thông báo: đánh dấu đã đọc (nếu chưa) + chuyển đến trang liên quan. */
  const handleNotificationClick = async (notif) => {
    setIsOpen(false);

    if (!notif.read) {
      try {
        await http.put(`/admin/notifications/${notif.id}/read`);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Failed to mark as read', err);
      }
    }

    if (notif.type === 'NEW_ORDER') {
      navigate('/admin/orders'); // Chuyển đến danh sách đơn hàng
    }
  };

  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation();
    try {
      await http.put('/admin/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  /**
   * Format thời gian tương đối (vừa xong, X phút trước, X giờ trước, X ngày trước).
   * Dùng cho dòng thời gian hiển thị dưới mỗi thông báo.
   */
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
  };

  if (!isAdmin) return null;

  return (
    <div className="notification-bell-container" ref={dropdownRef} style={{ position: 'relative' }}>
      <style>
        {`
          @keyframes ring {
            0% { transform: rotate(0deg); }
            10% { transform: rotate(15deg); }
            20% { transform: rotate(-10deg); }
            30% { transform: rotate(5deg); }
            40% { transform: rotate(-5deg); }
            50% { transform: rotate(0deg); }
            100% { transform: rotate(0deg); }
          }
          .admin-topbar-btn {
            background: #f1f5f9 !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 50% !important;
            width: 40px !important;
            height: 40px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            transition: all 0.2s ease !important;
            color: #475569 !important;
          }
          .admin-topbar-btn:hover {
            background: #e2e8f0 !important;
            color: #0f172a !important;
          }
          .admin-topbar-btn.has-unread .bell-icon {
            animation: ring 2s infinite ease-in-out;
            color: #3b82f6 !important;
          }
        `}
      </style>
      <button 
        className={`admin-topbar-btn ${unreadCount > 0 ? 'has-unread' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
        style={{ cursor: 'pointer', position: 'relative' }}
      >
        <Bell size={20} className="bell-icon" />
        {unreadCount > 0 && (
          <span 
            className="notification-badge shadow-sm"
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-4px',
              backgroundColor: '#ef4444',
              color: 'white',
              fontSize: '11px',
              fontWeight: 'bold',
              minWidth: '20px',
              height: '20px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px'
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div 
          className="notification-dropdown shadow" 
          style={{
            position: 'absolute',
            top: '100%',
            right: '0',
            width: '320px',
            backgroundColor: 'white',
            borderRadius: '8px',
            marginTop: '8px',
            zIndex: 1000,
            maxHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid #e5e7eb'
          }}
        >
          <div className="notification-header" style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h6 style={{ margin: 0, fontWeight: 600 }}>Thông báo</h6>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                style={{ background: 'none', border: 'none', fontSize: '12px', color: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <CheckCheck size={14} />
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>
          <div className="notification-body" style={{ overflowY: 'auto', flex: 1 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                Không có thông báo nào.
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #f3f4f6',
                    cursor: 'pointer',
                    backgroundColor: notif.read ? 'white' : '#eff6ff',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = notif.read ? '#f9fafb' : '#dbeafe'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = notif.read ? 'white' : '#eff6ff'}
                >
                  <div style={{ fontSize: '14px', color: '#1f2937', fontWeight: notif.read ? 400 : 500, marginBottom: '4px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    {!notif.read && <span style={{ width: '8px', height: '8px', backgroundColor: '#3b82f6', borderRadius: '50%', flexShrink: 0, marginTop: '6px' }}></span>}
                    {notif.message}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', paddingLeft: notif.read ? '0' : '16px' }}>
                    {formatTime(notif.createdAt)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
