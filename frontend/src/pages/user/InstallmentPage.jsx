import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, CreditCard, CheckCircle, FileText, Clock, Smartphone } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { http } from '../../api/client';

export default function InstallmentPage() {
  const { settings } = useSite();
  const [dynamicContent, setDynamicContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    http.get('/posts/installment')
      .catch(() => http.get('/posts/mua-tra-gop'))
      .then(res => {
        if (res && res.data) setDynamicContent(res.data);
        else setDynamicContent(null);
      })
      .catch(() => setDynamicContent(null))
      .finally(() => setLoading(false));
  }, []);

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
          <span>Mua trả góp 0%</span>
        </div>

        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Mua trả góp 0% lãi suất</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '15px' }}>
          Sở hữu sản phẩm chất lượng chỉ từ 500K/tháng – Duyệt nhanh, thủ tục đơn giản
        </p>

        {/* Highlight Banner */}
        <div className="installment-banner">
          <CreditCard size={40} />
          <div>
            <h2>TRẢ GÓP 0% LÃI SUẤT</h2>
            <p>Áp dụng cho tất cả sản phẩm công nghệ tại Tech Shop, thủ tục duyệt chỉ trong 15 phút</p>
          </div>
        </div>

        <div className="policy-page-grid">
          {/* Credit Card */}
          <div className="policy-section">
            <div className="policy-section-header">
              <CreditCard size={24} />
              <h2>Trả góp qua thẻ tín dụng</h2>
            </div>
            <div className="policy-section-body">
              <div className="policy-detail-item">
                <CheckCircle size={20} style={{ color: 'var(--success)', flexShrink: 0 }} />
                <div>
                  <h4>Điều kiện</h4>
                  <ul className="policy-list">
                    <li>Sở hữu thẻ tín dụng Visa/Mastercard/JCB</li>
                    <li>Hạn mức thẻ đủ thanh toán giá trị sản phẩm</li>
                    <li>Kỳ hạn: <strong>3, 6, 9, 12 tháng</strong></li>
                    <li>Lãi suất: <strong>0% cho kỳ 3-6 tháng</strong></li>
                  </ul>
                </div>
              </div>
              <div className="policy-detail-item">
                <FileText size={20} style={{ color: 'var(--info)', flexShrink: 0 }} />
                <div>
                  <h4>Ngân hàng hỗ trợ</h4>
                  <div className="installment-banks">
                    <span className="badge badge-info">Vietcombank</span>
                    <span className="badge badge-info">Techcombank</span>
                    <span className="badge badge-info">VPBank</span>
                    <span className="badge badge-info">Sacombank</span>
                    <span className="badge badge-info">ACB</span>
                    <span className="badge badge-info">VIB</span>
                    <span className="badge badge-info">TPBank</span>
                    <span className="badge badge-info">OCB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Finance Company */}
          <div className="policy-section">
            <div className="policy-section-header">
              <Smartphone size={24} />
              <h2>Trả góp qua công ty tài chính</h2>
            </div>
            <div className="policy-section-body">
              <div className="policy-detail-item">
                <CheckCircle size={20} style={{ color: 'var(--success)', flexShrink: 0 }} />
                <div>
                  <h4>Điều kiện</h4>
                  <ul className="policy-list">
                    <li>Công dân Việt Nam, từ <strong>18-60 tuổi</strong></li>
                    <li>CCCD/CMND còn hạn</li>
                    <li>Có hộ khẩu hoặc KT3 tại địa phương</li>
                    <li>Kỳ hạn: <strong>6, 9, 12 tháng</strong></li>
                    <li>Trả trước: từ <strong>0-30%</strong> giá trị sản phẩm</li>
                  </ul>
                </div>
              </div>
              <div className="policy-detail-item">
                <FileText size={20} style={{ color: 'var(--info)', flexShrink: 0 }} />
                <div>
                  <h4>Đối tác tài chính</h4>
                  <div className="installment-banks">
                    <span className="badge badge-success">Home Credit</span>
                    <span className="badge badge-success">FE Credit</span>
                    <span className="badge badge-success">HD Saison</span>
                    <span className="badge badge-success">MCredit</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Process */}
          <div className="policy-section" style={{ gridColumn: '1 / -1' }}>
            <div className="policy-section-header">
              <Clock size={24} />
              <h2>Quy trình mua trả góp</h2>
            </div>
            <div className="policy-section-body">
              <div className="warranty-steps">
                <div className="warranty-step">
                  <div className="warranty-step-number">1</div>
                  <h4>Chọn sản phẩm</h4>
                  <p>chọn sản phẩm yêu thích, thông báo muốn mua trả góp</p>
                </div>
                <div className="warranty-step">
                  <div className="warranty-step-number">2</div>
                  <h4>Chọn phương thức</h4>
                  <p>Thẻ tín dụng hoặc công ty tài chính, chọn kỳ hạn phù hợp</p>
                </div>
                <div className="warranty-step">
                  <div className="warranty-step-number">3</div>
                  <h4>Xét duyệt</h4>
                  <p>Duyệt hồ sơ chỉ trong <strong>15 phút</strong>, ký hợp đồng tại chỗ</p>
                </div>
                <div className="warranty-step">
                  <div className="warranty-step-number">4</div>
                  <h4>Nhận máy</h4>
                  <p>nhận sản phẩm ngay sau khi hoàn tất thủ tục, trả góp hàng tháng</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="about-cta" style={{ marginTop: '32px' }}>
          <h2>Muốn mua trả góp?</h2>
          <p>Liên hệ Tech Shop để được tư vấn phương thức trả góp phù hợp nhất</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/products" className="btn btn-primary btn-lg">Xem sản phẩm</Link>
            <a href={`tel:${settings.hotline.replace(/\./g, '')}`} className="btn btn-outline btn-lg">📞 Gọi tư vấn</a>
          </div>
        </div>
      </div>
    </main>
  );
}
