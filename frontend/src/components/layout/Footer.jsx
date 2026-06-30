import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, QrCode, Banknote, CreditCard, Timer } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { http } from '../../api/client';

/* Tạo URL embed Facebook Page từ URL page thông thường */
function buildFbEmbedUrl(pageUrl) {
  if (!pageUrl) return null;
  const encoded = encodeURIComponent(pageUrl);
  return `https://www.facebook.com/plugins/page.php?href=${encoded}&tabs=&width=280&height=140&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=false`;
}

/**
 * Chuyển đổi bất kỳ định dạng URL Google Maps nào sang embed URL
 *   - Đã là embed:  https://www.google.com/maps/embed?pb=...
 *   - Share link:  https://maps.app.goo.gl/...
 *   - Place URL:   https://www.google.com/maps/place/NAME/@lat,lng,...
 *   - q= URL:      https://maps.google.com/maps?q=...
 */
function buildMapEmbedUrl(url) {
  if (!url || !url.trim()) return null;
  const u = url.trim();

  // ✅ Đã là embed URL — dùng luôn
  if (u.includes('google.com/maps/embed')) return u;

  // ✅ Dạng /maps/place/... → đổi thành /maps/embed/place/...
  if (u.includes('google.com/maps/place')) {
    return u.replace('google.com/maps/place', 'google.com/maps/embed/place');
  }

  // ✅ Dạng maps.google.com/maps?q=... → embed dạng q=
  if (u.includes('maps.google.com/maps') || u.includes('google.com/maps?')) {
    try {
      const parsed = new URL(u);
      const q = parsed.searchParams.get('q');
      const ll = parsed.searchParams.get('ll');
      const query = q || ll || '';
      return `https://www.google.com/maps/embed/v1/place?key=&q=${encodeURIComponent(query)}`;
    } catch {
      return u;
    }
  }

  // ✅ Dạng /maps/@lat,lng — embed search
  if (u.includes('google.com/maps/@')) {
    return u.replace('google.com/maps/@', 'google.com/maps/embed?ll=').replace('/@', '/embed?center=');
  }

  // Trả về nguyên để thử (goo.gl short link, v.v.)
  return u;
}

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

  /* Fallback columns khi chưa cài menu footer */
  const defaultColumns = [
    {
      title: 'Giới thiệu chung',
      links: [
        { label: 'Chính sách bảo hành', url: '/warranty' },
        { label: 'Hướng dẫn trả góp',  url: '/installment' },
        { label: 'Câu hỏi thường gặp', url: '/faq' },
      ]
    },
    {
      title: 'Về Tech Shop',
      links: [
        { label: 'Tuyển dụng',       url: '/careers' },
        { label: 'Tin tức công nghệ', url: '/news' },
        { label: 'Liên hệ',          url: '/contact' },
        { label: 'Tra cứu đơn hàng', url: '/order-tracking' },
      ]
    }
  ];

  const footerColumns = roots.length > 0
    ? roots.map(root => ({
        title: root.label,
        links: children(root.id).map(c => ({ label: c.label, url: c.url || '#' }))
      }))
    : defaultColumns;

  /* Mạng xã hội — chỉ hiển thị nếu đã cài trong quản trị */
  const socials = [
    { key: 'fb',   href: settings.facebookUrl, label: 'Facebook', icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    )},
    { key: 'yt',   href: settings.youtubeUrl,  label: 'YouTube', icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z" />
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
      </svg>
    )},
    { key: 'zalo', href: settings.zaloUrl,     label: 'Zalo',    icon: <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '-0.5px' }}>Zalo</span> },
  ].filter(s => !!s.href); // Chỉ hiện nếu đã cài

  const paymentMethods = [
    { icon: <QrCode size={18} />,     label: 'QR Code' },
    { icon: <Banknote size={18} />,   label: 'Tiền mặt' },
    { icon: <Timer size={18} />,      label: 'Trả góp' },
    { icon: <CreditCard size={18} />, label: 'Internet Banking' },
  ];

  /* Embed URLs lấy từ settings — tự động chuyển đổi sang định dạng embed */
  const fbEmbedUrl  = buildFbEmbedUrl(settings.facebookUrl);
  const mapEmbedUrl = buildMapEmbedUrl(settings.mapUrl);

  const hasEmbeds = fbEmbedUrl || mapEmbedUrl;

  return (
    <footer className="site-footer">
      <div className="container">
        <div className={`footer-grid${hasEmbeds ? '' : ' footer-grid-no-embeds'}`}>

          {/* ── Cột 1: About ── */}
          <div className="footer-col footer-about">
            {settings.logoFooterUrl
              ? <img src={settings.logoFooterUrl} alt={settings.shortName} className="footer-logo" />
              : <h4>{settings.storeName}</h4>
            }
            <p>
              Chuyên Sản phẩm công nghệ chính hãng, nguyên zin. Kiểm định kỹ càng,
              giá minh bạch, bảo hành rõ ràng. Hỗ trợ thu cũ đổi mới giá tốt.
            </p>
            <div className="footer-contact-list">
              {settings.address && (
                <div className="footer-contact-item">
                  <MapPin size={14} />
                  <span>{settings.address}</span>
                </div>
              )}
              {settings.hotline && (
                <div className="footer-contact-item">
                  <Phone size={14} />
                  <a href={`tel:${settings.hotline}`}>{settings.hotline}</a>
                </div>
              )}
              {settings.email && (
                <div className="footer-contact-item">
                  <Mail size={14} />
                  <a href={`mailto:${settings.email}`}>{settings.email}</a>
                </div>
              )}
              {settings.openingHours && (
                <div className="footer-contact-item">
                  <Clock size={14} />
                  <span>{settings.openingHours}</span>
                </div>
              )}
            </div>
          </div>

          {/* ── Cột 2 & 3: Dynamic Menu Columns ── */}
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

          {/* ── Cột 4: Kết nối & Thanh toán ── */}
          <div className="footer-col footer-connect">
            {/* Social — chỉ render nếu có ít nhất 1 link */}
            {socials.length > 0 && (
              <>
                <h4>Kết nối với chúng tôi</h4>
                <div className="footer-socials">
                  {socials.map(s => (
                    <a
                      key={s.key}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`social-icon ${s.key}`}
                      aria-label={s.label}
                    >
                      {s.icon}
                    </a>
                  ))}
                </div>
              </>
            )}

            {/* Phương thức thanh toán */}
            <div className="footer-payment-section">
              <h4>Phương thức thanh toán</h4>
              <div className="footer-payments">
                {paymentMethods.map((m, i) => (
                  <div className="payment-method" key={i}>
                    <div className="payment-icon-wrap">{m.icon}</div>
                    <span>{m.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Cột 5: Fanpage & Bản đồ — chỉ render nếu có ít nhất 1 embed ── */}
          {hasEmbeds && (
            <div className="footer-col footer-embeds">
              <h4>Fanpage &amp; Bản đồ</h4>
              <div className="embed-container">
                {fbEmbedUrl && (
                  <iframe
                    src={fbEmbedUrl}
                    width="100%"
                    height="140"
                    style={{ border: 'none', overflow: 'hidden' }}
                    scrolling="no"
                    frameBorder="0"
                    allowFullScreen={true}
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                    title="Facebook Fanpage"
                  />
                )}
                {mapEmbedUrl && (
                  <iframe
                    src={mapEmbedUrl}
                    width="100%"
                    height="140"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Google Map"
                  />
                )}
              </div>
            </div>
          )}

        </div>

        {/* ── Footer Bottom ── */}
        <div className="footer-bottom">
          © {new Date().getFullYear()} <span>{settings.storeName || settings.shortName}</span>. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
