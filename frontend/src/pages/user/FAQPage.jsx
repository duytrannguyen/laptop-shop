import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronDown, HelpCircle } from 'lucide-react';

const faqData = [
  {
    category: 'Mua hàng',
    items: [
      {
        q: 'Làm sao để đặt hàng tại Tech Shop?',
        a: 'Bạn có thể đặt hàng trực tiếp trên website, gọi hotline 0816.109.179, hoặc đến trực tiếp cửa hàng tại Số 25, đường B25, KDC 91B, Cần Thơ. Khi đặt online, bạn chỉ cần chọn sản phẩm, thêm vào giỏ hàng và điền thông tin giao hàng.',
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
        a: 'Có, Tech Shop chấp nhận thanh toán tiền mặt, chuyển khoản ngân hàng, và các ví điện tử phổ biến. Khi mua trả góp, thanh toán qua thẻ tín dụng hoặc công ty tài chính.',
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
        a: 'Khi cần bảo hành, bạn liên hệ hotline 0816.109.179 hoặc mang máy đến cửa hàng. Kỹ thuật viên sẽ kiểm tra và xử lý trong 1-3 ngày làm việc. Nếu ở xa, Tech Shop hỗ trợ ship 2 chiều.',
      },
      {
        q: 'Pin thiết bị có được bảo hành không?',
        a: 'Pin thiết bị được bảo hành 3 tháng với điều kiện sức khỏe pin trên 80% tại thời điểm mua. Hao mòn pin tự nhiên do sử dụng không nằm trong phạm vi bảo hành.',
      },
    ],
  },
  {
    category: 'Trả góp',
    items: [
      {
        q: 'Mua trả góp cần những giấy tờ gì?',
        a: 'Trả góp qua thẻ tín dụng: chỉ cần thẻ Visa/Mastercard/JCB. Trả góp qua công ty tài chính: cần CCCD/CMND, hộ khẩu hoặc KT3. Duyệt hồ sơ chỉ trong 15 phút.',
      },
      {
        q: 'Trả góp 0% nghĩa là gì?',
        a: 'Trả góp 0% nghĩa là bạn chỉ trả đúng giá sản phẩm, không phải trả thêm bất kỳ khoản lãi nào. Tổng số tiền trả góp = giá sản phẩm. Tech Shop sẽ hỗ trợ phần lãi suất.',
      },
      {
        q: 'Sinh viên có được mua trả góp không?',
        a: 'Sinh viên từ 18 tuổi trở lên có thể đăng ký trả góp qua công ty tài chính. Cần CCCD và thẻ sinh viên. Ngoài ra, sinh viên còn được giảm thêm 300K khi mua sản phẩm tại Tech Shop.',
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

export default function FAQPage() {
  const [openItems, setOpenItems] = useState({});

  const toggle = (key) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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
            Tìm câu trả lời cho những thắc mắc phổ biến về mua hàng, bảo hành, trả góp tại Tech Shop
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
            <a href="tel:0816109179" className="btn btn-primary btn-lg">📞 Gọi 0816.109.179</a>
            <Link to="/contact" className="btn btn-outline btn-lg">Gửi tin nhắn</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
