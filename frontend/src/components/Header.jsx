import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Phone, Clock, MapPin, Menu, X, ChevronRight, Laptop } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { http } from '../api/client';
import { useSite } from '../context/SiteContext';

export default function Header() {
  const [categories, setCategories] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { count } = useCart();
  const { settings } = useSite();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    http.get('/categories').then((r) => setCategories(r.data)).catch(() => {});
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
                <span className="header-logo-sub">Laptop Cũ Cần Thơ</span>
              </div>
            </div>
          </Link>

          <form className="header-search" onSubmit={handleSearch}>
            <input
              type="text"
              className="header-search-input"
              placeholder="Tìm kiếm laptop, CPU, thương hiệu..."
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
          <div className="nav-category">
            <button className="nav-category-btn">
              <Menu size={18} />
              Danh mục sản phẩm
            </button>
            <div className="nav-category-dropdown">
              {categories.map((cat) => (
                <Link key={cat.id} to={`/products?category=${cat.slug}`}>
                  <Laptop size={16} />
                  {cat.name}
                  <ChevronRight size={14} style={{ marginLeft: 'auto' }} />
                </Link>
              ))}
            </div>
          </div>

          <div className="nav-links">
            <Link to="/" className={isActive('/') ? 'active' : ''}>TRANG CHỦ</Link>
            <Link to="/products" className={isActive('/products') ? 'active' : ''}>SẢN PHẨM</Link>
            <Link to="/about" className={isActive('/about') ? 'active' : ''}>GIỚI THIỆU</Link>
            <Link to="/news" className={isActive('/news') ? 'active' : ''}>TIN TỨC</Link>
            <Link to="/contact" className={isActive('/contact') ? 'active' : ''}>LIÊN HỆ</Link>
            <Link to="/order-tracking" className={isActive('/order-tracking') ? 'active' : ''}>TRA CỨU ĐƠN</Link>
          </div>
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
          <Link to="/">Trang chủ</Link>
          <Link to="/products">Tất cả sản phẩm</Link>
          <Link to="/about">Giới thiệu</Link>
          <Link to="/news">Tin tức</Link>
          <Link to="/contact">Liên hệ</Link>
          <Link to="/cart">Giỏ hàng ({count})</Link>
          <Link to="/order-tracking">Tra cứu đơn hàng</Link>
          <div className="cat-label">Danh mục</div>
          {categories.map((cat) => (
            <Link key={cat.id} to={`/products?category=${cat.slug}`}>
              {cat.name}
            </Link>
          ))}
          <div className="cat-label">Hỗ trợ</div>
          <Link to="/warranty">Chính sách bảo hành</Link>
          <Link to="/installment">Mua trả góp 0%</Link>
          <Link to="/faq">Câu hỏi thường gặp</Link>
        </div>
      </div>
    </>
  );
}
