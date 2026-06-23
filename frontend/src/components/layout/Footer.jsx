import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { http } from '../../api/client';

export default function Footer() {
  const { settings } = useSite();
  const [footerItems, setFooterItems] = useState([]);

  useEffect(() => {
    http.get('/menu-items?type=FOOTER').then(r => {
      if (r.data && r.data.length > 0) setFooterItems(r.data);
    }).catch(() => {});
  }, []);

  const roots = footerItems.filter(i => !i.parentId);
  const children = (parentId) => footerItems.filter(i => i.parentId === parentId);

  /* Fallback columns when no footer items configured */
  const defaultColumns = [
    {
      title: 'Chính sách',
      links: [
        { label: 'Chính sách bảo hành', url: '/warranty' },
        { label: 'Chính sách đổi trả', url: '/warranty' },
        { label: 'Mua trả góp 0%', url: '/installment' },
        { label: 'Câu hỏi thường gặp', url: '/faq' },
        { label: 'Tra cứu đơn hàng', url: '/order-tracking' },
      ]
    },
    {
      title: 'Liên kết nhanh',
      links: [
        { label: 'Trang chủ', url: '/' },
        { label: 'Tất cả sản phẩm', url: '/products' },
        { label: 'Giới thiệu', url: '/about' },
        { label: 'Tin tức', url: '/news' },
        { label: 'Liên hệ', url: '/contact' },
        { label: 'Giỏ hàng', url: '/cart' },
      ]
    }
  ];

  const footerColumns = roots.length > 0
    ? roots.map(root => ({
        title: root.label,
        links: children(root.id).map(c => ({ label: c.label, url: c.url || '#' }))
      }))
    : defaultColumns;

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* About Column */}
          <div className="footer-col footer-about">
            <h4>{settings.storeName}</h4>
            <p>
              Chuyên Sản phẩm công nghệ chính hãng, nguyên zin. Kiểm định kỹ càng, giá minh bạch,
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

          {/* Dynamic Footer Columns */}
          {footerColumns.map((col, idx) => (
            <div className="footer-col" key={idx}>
              <h4>{col.title}</h4>
              <div className="footer-links">
                {col.links.map((link, i) => (
                  <Link key={i} to={link.url}>{link.label}</Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="footer-bottom">
          © {new Date().getFullYear()} {settings.storeName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

