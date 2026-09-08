import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Phone, Clock, MapPin, Menu, X, ChevronRight, Smartphone } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { http } from '../../api/client';
import { useSite } from '../../context/SiteContext';

export default function Header() {
  const [categories, setCategories] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const { count } = useCart();
  const { settings } = useSite();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    http.get('/categories').then((r) => setCategories(r.data)).catch(() => { });
    http.get('/menu-items?type=MENU').then((r) => {
      if (r.data && r.data.length > 0) setMenuItems(r.data);
    }).catch(() => { });
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = menuItems.length > 0
    ? menuItems.filter(i => !i.parentId).map(i => ({ label: i.label, url: i.url || '#' }))
    : [
      { label: 'Trang chủ', url: '/' },
      { label: 'Tất cả sản phẩm', url: '/products' },
      { label: 'Khuyến mãi', url: '/promotions' },
      { label: 'Tin công nghệ', url: '/news' }
    ];

  const NavLinks = () => (
    <div className="nav-links">
      {navLinks.map((link, idx) => (
        <Link key={idx} to={link.url} className={isActive(link.url) ? 'active' : ''}>
          {link.label}
        </Link>
      ))}
    </div>
  );

  return (
    <>
      {/* Top Bar */}
      <div className="header-topbar">
        <div className="container">
          <div className="header-topbar-item">
            <Phone size={14} />
            <span>Hotline: <strong>{settings.hotline}</strong></span>
          </div>
          <div className="header-topbar-item">
            <Clock size={14} />
            <span>Thời gian: <strong>{settings.openingHours}</strong></span>
          </div>
          <div className="header-topbar-item">
            <MapPin size={14} />
            <span>{settings.address}</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="header-main">
        <div className="container">
          <Link className="header-logo" to="/">
            <div>
              <div className="header-logo-text">
                {settings.shortName}
                <span className="header-logo-sub">Tech Shop Cần Thơ</span>
              </div>
            </div>
          </Link>

          <form className="header-search" onSubmit={handleSearch}>
            <input
              type="text"
              className="header-search-input"
              placeholder="Tìm kiếm điện thoại, tai nghe, thương hiệu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="header-search-btn" aria-label="Tìm kiếm">
              <Search size={18} />
            </button>
          </form>

          <div className="header-info">
            <a href={`tel:${settings.hotline}`} className="header-info-item">
              <div className="header-info-icon">
                <Phone size={20} />
              </div>
              <div>
                <div className="header-info-label">Hotline tư vấn</div>
                <div className="header-info-value">{settings.hotline}</div>
              </div>
            </a>
            <div className="header-info-item">
              <div className="header-info-icon">
                <Clock size={20} />
              </div>
              <div>
                <div className="header-info-label">Thời gian bán hàng</div>
                <div className="header-info-value">{settings.openingHours}</div>
              </div>
            </div>
          </div>

          <Link to="/cart" className="header-cart">
            <ShoppingCart size={20} />
            <span className="header-cart-count">{count}</span>
          </Link>

          <button
            className="header-mobile-btn"
            onClick={() => setMobileOpen(true)}
            aria-label="Menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="header-nav">
        <div className="container">
          <div className={`nav-category ${isActive('/') ? 'always-open' : ''}`}>
            <button className="nav-category-btn" onClick={() => !isActive('/') && document.querySelector('.nav-category').classList.toggle('force-open')}>
              <Menu size={18} />
              Danh mục sản phẩm
            </button>
            <div className="nav-category-dropdown">
              {(() => {
                const renderCategoryMenu = (items) => {
                  if (!items || items.length === 0) return null;
                  return (
                    <>
                      {items.map((cat) => (
                        <div key={cat.id} className="nav-category-item">
                          <Link to={`/products?category=${cat.slug}`}>
                            <Smartphone size={16} />
                            {cat.name}
                            {cat.children && cat.children.length > 0 && (
                              <ChevronRight size={14} style={{ marginLeft: 'auto' }} />
                            )}
                          </Link>
                          {cat.children && cat.children.length > 0 && (
                            <div className="nav-category-sub">
                              {renderCategoryMenu(cat.children)}
                            </div>
                          )}
                        </div>
                      ))}
                    </>
                  );
                };
                return renderCategoryMenu(categories);
              })()}
            </div>
          </div>

          <NavLinks />
        </div>
      </nav>

      {/* Mobile Overlay */}
      <div
        className={`mobile-overlay ${mobileOpen ? 'show' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile Nav */}
      <div className={`mobile-nav ${mobileOpen ? 'show' : ''}`}>
        <div className="mobile-nav-header">
          <h3>{settings.shortName}</h3>
          <button className="mobile-nav-close" onClick={() => setMobileOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <div className="mobile-nav-links">
          {navLinks.map((link, idx) => (
            <Link key={idx} to={link.url}>{link.label}</Link>
          ))}
          <Link to="/cart">Giỏ hàng ({count})</Link>
          <div className="cat-label">Danh mục</div>
          {(() => {
            const renderMobileCats = (items, level = 0) => {
              if (!items || items.length === 0) return null;
              return items.map((cat) => (
                <React.Fragment key={cat.id}>
                  <Link
                    to={`/products?category=${cat.slug}`}
                    style={{ paddingLeft: `${level * 16 + 14}px`, fontSize: level > 0 ? '13.5px' : '14.5px', fontWeight: level > 0 ? '500' : '600' }}
                  >
                    {level > 0 ? '└ ' : ''}{cat.name}
                  </Link>
                  {cat.children && cat.children.length > 0 && renderMobileCats(cat.children, level + 1)}
                </React.Fragment>
              ));
            };
            return renderMobileCats(categories);
          })()}
          <div className="cat-label">Hỗ trợ</div>
          <Link to="/warranty">Chính sách bảo hành</Link>
          <Link to="/faq">Câu hỏi thường gặp</Link>
        </div>
      </div>
    </>
  );
}
