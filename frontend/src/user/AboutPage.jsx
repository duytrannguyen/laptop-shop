import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Shield, Award, Users, Heart, CheckCircle, Laptop } from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="page-content">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Trang chủ</Link>
          <ChevronRight size={14} className="separator" />
          <span>Giới thiệu</span>
        </div>

        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Giới thiệu Laptop Shop</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '16px', lineHeight: '1.7' }}>
          Đơn vị chuyên laptop cũ uy tín hàng đầu tại Cần Thơ
        </p>

        {/* Hero Banner */}
        <div className="about-hero">
          <div className="about-hero-content">
            <h2>Laptop Shop – Laptop Cũ Cần Thơ</h2>
            <p>
              Laptop Shop được thành lập với sứ mệnh mang đến cho khách hàng tại Cần Thơ và khu vực Đồng bằng
              sông Cửu Long những chiếc laptop chất lượng với mức giá hợp lý nhất. Mỗi sản phẩm tại Laptop Shop
              đều được kiểm tra kỹ lưỡng bởi đội ngũ kỹ thuật viên giàu kinh nghiệm trước khi đến tay khách hàng.
            </p>
          </div>
        </div>

        {/* Values */}
        <section className="section" style={{ paddingTop: '24px' }}>
          <div className="section-heading">
            <h2>Giá trị cốt lõi</h2>
          </div>
          <div className="about-values-grid">
            <div className="about-value-card">
              <div className="about-value-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}>
                <Shield size={28} />
              </div>
              <h3>Chất lượng đảm bảo</h3>
              <p>
                Tất cả laptop đều được kiểm tra phần cứng, phần mềm kỹ lưỡng. Cam kết nguyên zin, 
                rõ nguồn gốc, không hàng dựng lại.
              </p>
            </div>
            <div className="about-value-card">
              <div className="about-value-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
                <Award size={28} />
              </div>
              <h3>Giá cả minh bạch</h3>
              <p>
                Giá niêm yết rõ ràng, không nói thách. So sánh giá dễ dàng với thị trường. 
                Hỗ trợ thu cũ đổi mới với giá tốt nhất.
              </p>
            </div>
            <div className="about-value-card">
              <div className="about-value-icon" style={{ background: '#d1fae5', color: '#059669' }}>
                <Users size={28} />
              </div>
              <h3>Phục vụ tận tâm</h3>
              <p>
                Đội ngũ tư vấn nhiệt tình, am hiểu sản phẩm. Hỗ trợ kỹ thuật sau mua hàng miễn phí.
                Bảo hành rõ ràng 3-12 tháng.
              </p>
            </div>
            <div className="about-value-card">
              <div className="about-value-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
                <Heart size={28} />
              </div>
              <h3>Uy tín lâu dài</h3>
              <p>
                Xây dựng niềm tin qua chất lượng sản phẩm và dịch vụ. Hàng trăm khách hàng hài lòng
                và quay lại mua sản phẩm tiếp theo.
              </p>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="card" style={{ padding: '40px' }}>
            <h2 style={{ marginBottom: '24px', textAlign: 'center' }}>Tại sao chọn Laptop Shop?</h2>
            <div className="about-reasons">
              {[
                'Kiểm tra máy kỹ lưỡng: Pin, màn hình, bàn phím, loa, webcam, wifi, bluetooth...',
                'Cài đặt Windows bản quyền, driver đầy đủ, sẵn sàng sử dụng ngay',
                'Bảo hành phần cứng 3-12 tháng tùy dòng máy',
                'Hỗ trợ trả góp 0% qua thẻ tín dụng và công ty tài chính',
                'Freeship toàn quốc, đóng gói cẩn thận chống sốc',
                'Hỗ trợ kỹ thuật, vệ sinh máy miễn phí trọn đời',
                'Thu cũ đổi mới giá cao nhất thị trường Cần Thơ',
                'Tư vấn nhiệt tình, chọn máy phù hợp nhu cầu và ngân sách',
              ].map((reason, i) => (
                <div className="about-reason-item" key={i}>
                  <CheckCircle size={20} style={{ color: 'var(--success)', flexShrink: 0 }} />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="stats-grid" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="stat-card">
              <div className="stat-number">50+</div>
              <div className="stat-label">Sản phẩm đa dạng</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">500+</div>
              <div className="stat-label">Khách hàng tin tưởng</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">3-12</div>
              <div className="stat-label">Tháng bảo hành</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">0%</div>
              <div className="stat-label">Lãi suất trả góp</div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="about-cta">
          <Laptop size={36} />
          <h2>Bạn đang tìm một chiếc laptop phù hợp?</h2>
          <p>Liên hệ Laptop Shop ngay để được tư vấn miễn phí!</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/products" className="btn btn-primary btn-lg">Xem sản phẩm</Link>
            <Link to="/contact" className="btn btn-outline btn-lg">Liên hệ tư vấn</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
