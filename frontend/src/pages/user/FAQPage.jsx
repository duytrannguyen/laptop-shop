import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronDown, HelpCircle, Calendar } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { http } from '../../api/client';

export default function FAQPage() {
  const [dynamicContent, setDynamicContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    http.get('/posts/faq')
      .then(res => setDynamicContent(res.data))
      .catch(() => setDynamicContent(null))
      .finally(() => setLoading(false));
  }, []);
  const [openItems, setOpenItems] = useState({});
  const { settings } = useSite();

  const toggle = (key) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const faqData = [
  {
    category: 'Mua hàng',
    items: [
      {
        q: 'Làm sao để đặt hàng tại Tech Shop?',
        a: `Bạn có thể đặt hàng trực tiếp trên website, gọi hotline ${settings.hotline}, hoặc đến trực tiếp cửa hàng tại Số 25, đường B25, KDC 91B, Cần Thơ. Khi đặt online, bạn chỉ cần chọn sản phẩm, thêm vào giỏ hàng và điền thông tin giao hàng.`,
      },
      {
        q: 'Tech Shop có giao hàng toàn quốc không?',
        a: 'Có! Tech Shop giao hàng toàn quốc qua các đơn vị vận chuyển uy tín. Miễn phí giao hàng cho đơn hàng thiết bị. Sản phẩm được đóng gói cẩn thận, chống sốc để đảm bảo an toàn khi vận chuyển.',
      },
      {
        q: 'Tôi có thể xem máy trực tiếp trước khi mua không?',
        a: 'Hoàn toàn có thể! Bạn được xem máy, kiểm tra trực tiếp tại cửa hàng trước khi quyết định mua. Đội ngũ kỹ thuật sẽ hỗ trợ bạn kiểm tra mọi chức năng của máy.',
      },
      {
        q: 'Tech Shop có nhận thanh toán chuyển khoản không?',
        a: 'Có, Tech Shop chấp nhận thanh toán tiền mặt, chuyển khoản ngân hàng, và các ví điện tử phổ biến.',
      },
    ],
  },
  {
    category: 'Bảo hành',
    items: [
      {
        q: 'Thiết bị công nghệ có được bảo hành không?',
        a: 'Tất cả sản phẩm tại Tech Shop đều được bảo hành từ 3-12 tháng tùy dòng máy. Bảo hành phần cứng bao gồm: mainboard, CPU, RAM, ổ cứng, màn hình, bàn phím, touchpad.',
      },
      {
        q: 'Quy trình bảo hành như thế nào?',
        a: `Khi cần bảo hành, bạn liên hệ hotline ${settings.hotline} hoặc mang máy đến cửa hàng. Kỹ thuật viên sẽ kiểm tra và xử lý trong 1-3 ngày làm việc. Nếu ở xa, Tech Shop hỗ trợ ship 2 chiều.`,
      },
      {
        q: 'Pin thiết bị có được bảo hành không?',
        a: 'Pin thiết bị được bảo hành 3 tháng với điều kiện sức khỏe pin trên 80% tại thời điểm mua. Hao mòn pin tự nhiên do sử dụng không nằm trong phạm vi bảo hành.',
      },
    ],
  },

  {
    category: 'Vận chuyển',
    items: [
      {
        q: 'Thời gian giao hàng là bao lâu?',
        a: 'Nội thành Cần Thơ: giao trong ngày hoặc ngày hôm sau. Các tỉnh lân cận (ĐBSCL): 1-2 ngày. Miền Bắc, miền Trung: 2-4 ngày. Giao hàng bởi GHTK, GHN, J&T.',
      },
      {
        q: 'Phí vận chuyển bao nhiêu?',
        a: 'Miễn phí vận chuyển toàn quốc cho tất cả đơn hàng thiết bị. Sản phẩm được đóng hộp carton, bọc xốp chống sốc kỹ lưỡng.',
      },
    ],
  },
  ];

  if (loading) return <main className="page-content"><div className="loading"><div className="spinner" /></div></main>;

  if (dynamicContent) {
    return (
      <main className="page-content">
        <article className="container post-detail">
          <div className="breadcrumb">
            <Link to="/">Trang chủ</Link>
            <ChevronRight size={14} className="separator" />
            <span>{dynamicContent.title}</span>
          </div>
          <h1 style={{ textAlign: 'center', marginBottom: '24px' }}>{dynamicContent.title}</h1>
          {dynamicContent.image && <img className="post-cover" src={dynamicContent.image} alt={dynamicContent.title} style={{ display: 'block', margin: '0 auto 32px', borderRadius: '12px' }} />}
          <div className="post-content ck-content" dangerouslySetInnerHTML={{ __html: dynamicContent.content }} />
        </article>
      </main>
    );
  }

  return (
    <main className="page-content">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Trang chủ</Link>
          <ChevronRight size={14} className="separator" />
          <span>Câu hỏi thường gặp</span>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <HelpCircle size={48} style={{ color: 'var(--primary)', marginBottom: '16px' }} />
          <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Câu hỏi thường gặp</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>
            Tìm câu trả lời cho những thắc mắc phổ biến về mua hàng, bảo hành tại Tech Shop
          </p>
        </div>

        {faqData.map((section, si) => (
          <div className="faq-section" key={si}>
            <h2 className="faq-section-title">{section.category}</h2>
            <div className="faq-list">
              {section.items.map((item, qi) => {
                const key = `${si}-${qi}`;
                const isOpen = openItems[key];
                return (
                  <div className={`faq-item ${isOpen ? 'open' : ''}`} key={key}>
                    <button className="faq-question" onClick={() => toggle(key)}>
                      <span>{item.q}</span>
                      <ChevronDown size={20} className={`faq-arrow ${isOpen ? 'rotated' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="faq-answer fade-in">
                        <p>{item.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* CTA */}
        <div className="about-cta" style={{ marginTop: '40px' }}>
          <h2>Không tìm thấy câu trả lời?</h2>
          <p>Liên hệ trực tiếp với Tech Shop để được hỗ trợ nhanh nhất</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={`tel:${settings.hotline.replace(/\./g, '')}`} className="btn btn-primary btn-lg">📞 Gọi {settings.hotline}</a>
            <Link to="/contact" className="btn btn-outline btn-lg">Gửi tin nhắn</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
