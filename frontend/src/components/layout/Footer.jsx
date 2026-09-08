import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, QrCode, Banknote, CreditCard } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { http } from '../../api/client';

/* Tạo URL embed Facebook Page từ URL page thông thường */
function buildFbEmbedUrl(pageUrl) {
  if (!pageUrl) return null;
  const encoded = encodeURIComponent(pageUrl);
  return `https://www.facebook.com/plugins/page.php?href=${encoded}&tabs=&width=280&height=130&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=false`;
}

/**
 * Chuyển đổi bất kỳ định dạng URL Google Maps nào sang embed URL
 */
function buildMapEmbedUrl(url) {
  if (!url || !url.trim()) return null;
  const u = url.trim();
  if (u.includes('google.com/maps/embed')) return u;
  if (u.includes('google.com/maps/place')) {
    return u.replace('google.com/maps/place', 'google.com/maps/embed/place');
  }
  if (u.includes('maps.google.com/maps') || u.includes('google.com/maps?')) {
    try {
      const parsed = new URL(u);
      const q = parsed.searchParams.get('q');
      const ll = parsed.searchParams.get('ll');
      const query = q || ll || '';
      return `https://www.google.com/maps/embed/v1/place?key=&q=${encodeURIComponent(query)}`;
    } catch { return u; }
  }
  if (u.includes('google.com/maps/@')) {
    return u.replace('google.com/maps/@', 'google.com/maps/embed?ll=').replace('/@', '/embed?center=');
  }
  return u;
}

/* ── SVG Icons ── */
const IconFacebook = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const IconYoutube = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

const IconTiktok = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.38a8.16 8.16 0 0 0 4.78 1.52V7.45a4.85 4.85 0 0 1-1.01-.76z" />
  </svg>
);

const IconInstagram = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const IconGroups = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export default function Footer() {
  const { settings } = useSite();
  const [footerItems, setFooterItems] = useState([]);

  useEffect(() => {
    http.get('/menu-items?type=FOOTER').then(r => {
      if (r.data && r.data.length > 0) setFooterItems(r.data);
    }).catch(() => {});
  }, []);

  const roots    = footerItems.filter(i => !i.parentId);
  const children = (parentId) => footerItems.filter(i => i.parentId === parentId);

  let footerColumns = roots.map(root => ({
      title: root.label,
      links: children(root.id).map(c => ({ label: c.label, url: c.url || '#' }))
    }));

  // Đảm bảo luôn có link Kiểm tra đơn hàng nếu chưa có
  const hasOrderTracking = footerColumns.some(col => 
    col.links.some(link => link.url === '/order-tracking' || link.url === '/tracking')
  );

  if (!hasOrderTracking && footerColumns.length > 0) {
    footerColumns[0].links.push({ label: 'Kiểm tra đơn hàng', url: '/order-tracking' });
  }

  /* ── Mạng xã hội — luôn hiển thị, mờ nếu chưa có link ── */
  const socials = [
    {
      key: 'fb-page', href: settings.facebookUrl,
      label: 'Facebook', sublabel: 'Page',
      icon: <IconFacebook />, color: '#1877f2',
      bg: 'linear-gradient(135deg,#1877f2,#0a5ed4)',
    },
    {
      key: 'fb-group', href: settings.facebookGroupUrl,
      label: 'Facebook', sublabel: 'Group',
      icon: <IconGroups />, color: '#1877f2',
      bg: 'linear-gradient(135deg,#2563eb,#1a4fb5)',
    },
    {
      key: 'zalo-oa', href: settings.zaloUrl,
      label: 'Zalo', sublabel: 'OA',
      icon: <span style={{ fontWeight: 800, fontSize: 11, letterSpacing: '-0.5px' }}>Z</span>,
      color: '#0068ff',
      bg: 'linear-gradient(135deg,#0068ff,#0050cc)',
    },
    {
      key: 'zalo-group', href: settings.zaloGroupUrl,
      label: 'Zalo', sublabel: 'Group',
      icon: <span style={{ fontWeight: 800, fontSize: 11, letterSpacing: '-0.5px' }}>ZG</span>,
      color: '#0068ff',
      bg: 'linear-gradient(135deg,#0054e0,#003eb5)',
    },
    {
      key: 'yt', href: settings.youtubeUrl,
      label: 'YouTube', sublabel: null,
      icon: <IconYoutube />, color: '#ff0000',
      bg: 'linear-gradient(135deg,#ff0000,#cc0000)',
    },
    {
      key: 'tiktok', href: settings.tiktokUrl,
      label: 'TikTok', sublabel: null,
      icon: <IconTiktok />, color: '#ffffff',
      bg: 'linear-gradient(135deg,#111,#333)',
    },
    {
      key: 'instagram', href: settings.instagramUrl,
      label: 'Instagram', sublabel: null,
      icon: <IconInstagram />, color: '#e1306c',
      bg: 'linear-gradient(135deg,#f58529,#dd2a7b,#8134af,#515bd4)',
    },
  ];

  /* Phương thức thanh toán */
  const paymentMethods = [
    { icon: <QrCode size={16} />,     label: 'QR Code' },
    { icon: <Banknote size={16} />,   label: 'Tiền mặt' },
    { icon: <CreditCard size={16} />, label: 'Internet Banking' },
  ];

  const fbEmbedUrl  = buildFbEmbedUrl(settings.facebookUrl);
  const mapEmbedUrl = buildMapEmbedUrl(settings.mapUrl);

  const displayColumns = footerColumns.length > 0 ? footerColumns : [
    {
      title: 'Chính sách chung',
      links: [
        { label: 'Chính sách bảo hành', url: '/warranty' },
        { label: 'Chính sách đổi trả', url: '/return-policy' },
        { label: 'Bảo mật thông tin', url: '/privacy' },
        { label: 'Hướng dẫn mua hàng', url: '/shopping-guide' },
        { label: 'Kiểm tra đơn hàng', url: '/order-tracking' }
      ]
    }
  ];

  const colsCount = displayColumns.length;
  // 4 base columns: Brand, Menu(s), Connect, Embeds
  let gridStyle = `2fr repeat(${colsCount}, 1fr) 1.2fr 1.5fr`;

  const EmbedPlaceholder = ({ title }) => (
    <div className="embed-placeholder" style={{ 
      width: '100%', height: '130px', 
      background: 'rgba(255,255,255,0.03)', 
      border: '1px dashed rgba(255,255,255,0.15)', 
      borderRadius: '8px', 
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'rgba(255,255,255,0.3)', fontSize: '12px',
      marginTop: '10px'
    }}>
      {title}
    </div>
  );

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid" style={{ '--desktop-grid': gridStyle }}>

          {/* ── Cột 1: Brand & Contact ── */}
          <div className="footer-col footer-about">
            {settings.logoFooterUrl
              ? <img src={settings.logoFooterUrl} alt={settings.shortName} className="footer-logo" />
              : (
                <div className="footer-brand-name">
                  {settings.storeName
                    ? <>{settings.storeName.split(' ').slice(0, -1).join(' ')} <span>{settings.storeName.split(' ').slice(-1)}</span></>
                    : <><span>Tech</span> Shop</>
                  }
                </div>
              )
            }
            <p className="footer-tagline">
              Chuyên sản phẩm công nghệ chính hãng, nguyên zin. Kiểm định kỹ càng,
              giá minh bạch, bảo hành rõ ràng. Hỗ trợ thu cũ đổi mới giá tốt.
            </p>
            <div className="footer-divider" />
            <div className="footer-contact-list">
              {settings.address && (
                <div className="footer-contact-item">
                  <span className="footer-contact-icon"><MapPin size={13} /></span>
                  <span>{settings.address}</span>
                </div>
              )}
              {settings.hotline && (
                <div className="footer-contact-item">
                  <span className="footer-contact-icon"><Phone size={13} /></span>
                  <a href={`tel:${settings.hotline}`}>{settings.hotline}</a>
                </div>
              )}
              {settings.email && (
                <div className="footer-contact-item">
                  <span className="footer-contact-icon"><Mail size={13} /></span>
                  <a href={`mailto:${settings.email}`}>{settings.email}</a>
                </div>
              )}
              {settings.openingHours && (
                <div className="footer-contact-item">
                  <span className="footer-contact-icon"><Clock size={13} /></span>
                  <span>{settings.openingHours}</span>
                </div>
              )}
            </div>
          </div>

          {/* ── Cột Menu (Chính sách) ── */}
          {displayColumns.map((col, idx) => (
            <div className="footer-col" key={idx}>
              <h4>{col.title}</h4>
              <div className="footer-links">
                {col.links.map((link, i) => (
                  <Link key={i} to={link.url}>{link.label}</Link>
                ))}
              </div>
            </div>
          ))}

          {/* ── Cột Mạng xã hội & Thanh toán ── */}
          <div className="footer-col footer-connect">
            <h4>Kết nối với chúng tôi</h4>
            <div className="footer-socials">
              {socials.map(s => {
                const active = !!s.href;
                const tag = active ? 'a' : 'span';
                const props = active
                  ? { href: s.href, target: '_blank', rel: 'noopener noreferrer' }
                  : {};
                return React.createElement(
                  tag,
                  {
                    key: s.key,
                    className: `social-chip icon-only${active ? '' : ' social-chip--inactive'}`,
                    style: { '--chip-bg': s.bg, '--chip-color': s.color },
                    'aria-label': `${s.label}${s.sublabel ? ' ' + s.sublabel : ''}`,
                    title: `${s.label}${s.sublabel ? ' ' + s.sublabel : ''}`,
                    ...props,
                  },
                  <span className="social-chip-icon" style={{ background: s.bg }}>
                    {s.icon}
                  </span>
                );
              })}
            </div>

            {/* Phương thức thanh toán */}
            <div className="footer-payment-section" style={{ marginTop: '24px' }}>
              <h4>Thanh toán</h4>
              <div className="footer-payments">
                {paymentMethods.map((m, i) => (
                  <div className="payment-badge" key={i}>
                    {m.icon}
                    {m.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Cột Fanpage & Bản đồ ── */}
          <div className="footer-col footer-embeds-col">
            <h4>Fanpage & Bản đồ</h4>
            {fbEmbedUrl ? (
              <iframe
                src={fbEmbedUrl}
                width="100%"
                height="130"
                style={{ border: 'none', overflow: 'hidden', marginBottom: '16px', borderRadius: '8px' }}
                scrolling="no"
                frameBorder="0"
                allowFullScreen={true}
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                title="Facebook Fanpage"
              />
            ) : (
              <EmbedPlaceholder title="Chưa cấu hình Fanpage" />
            )}

            {mapEmbedUrl ? (
              <iframe
                src={mapEmbedUrl}
                width="100%"
                height="130"
                style={{ border: 0, borderRadius: '8px' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Map"
              />
            ) : (
              <EmbedPlaceholder title="Chưa cấu hình Bản đồ" />
            )}
          </div>

        </div>

        {/* ── Footer Bottom ── */}
        <div className="footer-bottom">
          <div className="footer-bottom-copy">
            © {new Date().getFullYear()} {settings.storeName || 'Tech Shop'} — Hệ thống bán lẻ sản phẩm công nghệ.&nbsp;
            Phát triển bởi <strong>DuyIT</strong>
          </div>
          <div className="footer-bottom-badge">
            <span className="dot" />
            Hệ thống đang hoạt động
          </div>
        </div>
      </div>
    </footer>
  );
}
