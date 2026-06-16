import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { useSite } from '../context/SiteContext';

export default function Footer() {
  const { settings } = useSite();
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* About Column */}
          <div className="footer-col footer-about">
            <h4>{settings.storeName}</h4>
            <p>
              Chuyên laptop cũ chính hãng, nguyên zin. Kiểm định kỹ càng, giá minh bạch,
              bảo hành rõ ràng. Hỗ trợ thu cũ đổi mới giá tốt.
            </p>
            <div className="footer-contact-item">
              <MapPin size={16} />
              <span>{settings.address}</span>
            </div>
            <div className="footer-contact-item">
              <Phone size={16} />
              <span>{settings.hotline}</span>
            </div>
            <div className="footer-contact-item">
              <Mail size={16} />
              <span>{settings.email}</span>
            </div>
            <div className="footer-contact-item">
              <Clock size={16} />
              <span>{settings.openingHours}</span>
            </div>
          </div>

          {/* Policies Column */}
          <div className="footer-col">
            <h4>Chính sách</h4>
            <div className="footer-links">
              <Link to="/warranty">Chính sách bảo hành</Link>
              <Link to="/warranty">Chính sách đổi trả</Link>
              <Link to="/installment">Mua trả góp 0%</Link>
              <Link to="/faq">Câu hỏi thường gặp</Link>
              <Link to="/order-tracking">Tra cứu đơn hàng</Link>
            </div>
          </div>

          {/* Categories Column */}
          <div className="footer-col">
            <h4>Danh mục</h4>
            <div className="footer-links">
              <Link to="/products?category=laptop-dell">Laptop Dell</Link>
              <Link to="/products?category=laptop-hp">Laptop HP</Link>
              <Link to="/products?category=laptop-asus">Laptop ASUS</Link>
              <Link to="/products?category=laptop-lenovo">Laptop Lenovo</Link>
              <Link to="/products?category=macbook">Macbook</Link>
              <Link to="/products?category=laptop-acer">Laptop Acer</Link>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="footer-col">
            <h4>Liên kết nhanh</h4>
            <div className="footer-links">
              <Link to="/">Trang chủ</Link>
              <Link to="/products">Tất cả sản phẩm</Link>
              <Link to="/about">Giới thiệu</Link>
              <Link to="/news">Tin tức</Link>
              <Link to="/contact">Liên hệ</Link>
              <Link to="/cart">Giỏ hàng</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          © {new Date().getFullYear()} {settings.storeName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
