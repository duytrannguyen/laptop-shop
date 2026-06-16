import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, FolderTree, Newspaper,
  ClipboardList, Settings, LogOut, Menu, X, ExternalLink, Images, MessageSquare, ChevronDown, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { 
    icon: Package, 
    label: 'Sản phẩm',
    subItems: [
      { to: '/admin/categories', label: 'Danh mục' },
      { to: '/admin/products', label: 'Sản phẩm' },
      { to: '/admin/needs', label: 'Nhu cầu' },
      { to: '/admin/brands', label: 'Thương hiệu' },
      { to: '/admin/product-groups', label: 'Nhóm sản phẩm' },
    ]
  },
  { to: '/admin/posts', icon: Newspaper, label: 'Bài viết' },
  { to: '/admin/orders', icon: ClipboardList, label: 'Đơn hàng' },
  { to: '/admin/banners', icon: Images, label: 'Banner' },
  { to: '/admin/media', icon: FolderTree, label: 'Thư viện ảnh' },
  { to: '/admin/contacts', icon: MessageSquare, label: 'Liên hệ' },
  { to: '/admin/settings', icon: Settings, label: 'Cài đặt' },
];

export default function AdminLayout() {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [productMenuOpen, setProductMenuOpen] = useState(true);

  // Auth guard
  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login', { replace: true });
    }
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

  const isActive = (path, end) => {
    if (end) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  const isProductParentActive = navItems
    .find(i => i.subItems)
    ?.subItems.some(sub => isActive(sub.to, true));

  return (
    <div className="admin-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="mobile-overlay show"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'show' : ''}`}>
        <div className="admin-sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="admin-sidebar-logo">
              Laptop Shop
              <span>Bảng quản trị</span>
            </div>
            <button
              className="mobile-nav-close"
              onClick={() => setSidebarOpen(false)}
              style={{ display: 'none' }}
              id="admin-sidebar-close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          <div className="admin-sidebar-label">Menu chính</div>
          {navItems.map((item) => {
            if (item.subItems) {
              return (
                <div key={item.label}>
                  <div
                    className={`admin-sidebar-nav-parent ${isProductParentActive ? 'active-parent' : ''}`}
                    onClick={() => setProductMenuOpen(!productMenuOpen)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                      <item.icon size={18} style={{ opacity: 0.8 }} />
                      {item.label}
                    </div>
                    {productMenuOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                  </div>
                  {productMenuOpen && (
                    <div className="admin-sidebar-sub">
                      {item.subItems.map(sub => (
                        <Link
                          key={sub.to}
                          to={sub.to}
                          className={isActive(sub.to, true) ? 'active' : ''}
                          onClick={() => setSidebarOpen(false)}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <Link
                key={item.to}
                to={item.to}
                className={isActive(item.to, item.end) ? 'active' : ''}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          {user && (
            <div className="admin-sidebar-user-info">
              <span>👤</span>
              <span>{user.name || user.email}</span>
            </div>
          )}
          <Link to="/" target="_blank">
            <ExternalLink size={17} />
            Xem website
          </Link>
          <a onClick={handleLogout} style={{ cursor: 'pointer' }}>
            <LogOut size={17} />
            Đăng xuất
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-content">
        {/* Mobile header */}
        <div className="admin-mobile-header">
          <button
            className="admin-mobile-toggle"
            onClick={() => setSidebarOpen(true)}
            aria-label="Toggle menu"
            id="admin-menu-toggle"
          >
            <Menu size={20} />
          </button>
          <span className="admin-mobile-title">Laptop Shop Admin</span>
        </div>

        <Outlet />
      </div>
    </div>
  );
}
