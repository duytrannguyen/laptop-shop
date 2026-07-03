import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Shield, RefreshCw, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { http } from '../../api/client';

export default function WarrantyPage() {
  const { settings } = useSite();
  const [dynamicContent, setDynamicContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    http.get('/posts/warranty')
      .catch(() => http.get('/posts/bao-hanh'))
      .catch(() => http.get('/posts/chinh-sach-bao-hanh'))
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
          <span>Chính sách bảo hành</span>
        </div>

        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Chính sách bảo hành & đổi trả</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '15px' }}>
          Tech Shop cam kết bảo hành minh bạch, rõ ràng cho mọi sản phẩm
        </p>

        <div className="policy-page-grid">
          {/* Warranty Policy */}
          <div className="policy-section">
            <div className="policy-section-header">
              <Shield size={24} />
              <h2>Chính sách bảo hành</h2>
            </div>
            <div className="policy-section-body">
              <div className="policy-detail-item">
                <Clock size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <div>
                  <h4>Thời gian bảo hành</h4>
                  <ul className="policy-list">
                    <li>Điện thoại, tai nghe: <strong>6-12 tháng</strong> phần cứng</li>
                    <li>Phụ kiện cao cấp: <strong>3-6 tháng</strong> phần cứng</li>
                    <li>Macbook: <strong>6-12 tháng</strong> phần cứng</li>
                    <li>Pin thiết bị: <strong>3 tháng</strong> (pin trên 80% sức khỏe)</li>
                    <li>Adapter/sạc: <strong>3 tháng</strong></li>
                  </ul>
                </div>
              </div>

              <div className="policy-detail-item">
                <CheckCircle size={20} style={{ color: 'var(--success)', flexShrink: 0 }} />
                <div>
                  <h4>Phạm vi bảo hành</h4>
                  <ul className="policy-list success">
                    <li>Lỗi phần cứng do nhà sản xuất</li>
                    <li>Mainboard, CPU, RAM, ổ cứng lỗi kỹ thuật</li>
                    <li>Màn hình lỗi điểm chết (theo chính sách cụ thể)</li>
                    <li>Lỗi bàn phím, touchpad, loa, webcam</li>
                    <li>Hỗ trợ cài đặt phần mềm miễn phí trọn đời</li>
                    <li>Vệ sinh máy định kỳ miễn phí</li>
                  </ul>
                </div>
              </div>

              <div className="policy-detail-item">
                <XCircle size={20} style={{ color: 'var(--danger)', flexShrink: 0 }} />
                <div>
                  <h4>Không bảo hành</h4>
                  <ul className="policy-list danger">
                    <li>Hư hỏng do va đập, rơi vỡ, nước vào</li>
                    <li>Tự ý tháo lắp, sửa chữa bên ngoài</li>
                    <li>Lỗi phần mềm, virus, hệ điều hành</li>
                    <li>Hao mòn tự nhiên: vỏ máy, bản lề, pin</li>
                    <li>Tem bảo hành bị rách, mất, hoặc tẩy xóa</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Return Policy */}
          <div className="policy-section">
            <div className="policy-section-header">
              <RefreshCw size={24} />
              <h2>Chính sách đổi trả</h2>
            </div>
            <div className="policy-section-body">
              <div className="policy-detail-item">
                <CheckCircle size={20} style={{ color: 'var(--success)', flexShrink: 0 }} />
                <div>
                  <h4>Đổi trả trong 7 ngày</h4>
                  <ul className="policy-list">
                    <li>Đổi/trả trong <strong>7 ngày đầu</strong> nếu phát hiện lỗi phần cứng</li>
                    <li>Hoàn tiền 100% nếu sản phẩm lỗi không sửa được</li>
                    <li>Đổi sang sản phẩm khác cùng giá hoặc bù thêm</li>
                    <li>Sản phẩm đổi trả phải còn nguyên tem, phụ kiện</li>
                  </ul>
                </div>
              </div>

              <div className="policy-detail-item">
                <AlertTriangle size={20} style={{ color: 'var(--warning)', flexShrink: 0 }} />
                <div>
                  <h4>Lưu ý khi đổi trả</h4>
                  <ul className="policy-list">
                    <li>Mang theo phiếu bảo hành và hóa đơn mua hàng</li>
                    <li>Sản phẩm phải còn nguyên trạng, không trầy xước thêm</li>
                    <li>Liên hệ hotline <strong>{settings.hotline}</strong> trước khi đổi trả</li>
                    <li>Phí ship đổi trả do Tech Shop chi trả (nếu lỗi từ sản phẩm)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Warranty Process */}
          <div className="policy-section" style={{ gridColumn: '1 / -1' }}>
            <div className="policy-section-header">
              <RefreshCw size={24} />
              <h2>Quy trình bảo hành</h2>
            </div>
            <div className="policy-section-body">
              <div className="warranty-steps">
                <div className="warranty-step">
                  <div className="warranty-step-number">1</div>
                  <h4>Liên hệ</h4>
                  <p>Gọi hotline <strong>{settings.hotline}</strong> hoặc mang máy trực tiếp đến cửa hàng</p>
                </div>
                <div className="warranty-step">
                  <div className="warranty-step-number">2</div>
                  <h4>Kiểm tra</h4>
                  <p>Kỹ thuật viên kiểm tra, xác nhận lỗi và tình trạng bảo hành</p>
                </div>
                <div className="warranty-step">
                  <div className="warranty-step-number">3</div>
                  <h4>Xử lý</h4>
                  <p>Sửa chữa hoặc thay thế linh kiện. Thời gian xử lý 1-3 ngày làm việc</p>
                </div>
                <div className="warranty-step">
                  <div className="warranty-step-number">4</div>
                  <h4>Hoàn trả</h4>
                  <p>Bàn giao máy đã sửa chữa, kiểm tra lại cùng khách hàng</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="about-cta" style={{ marginTop: '32px' }}>
          <h2>Cần hỗ trợ bảo hành?</h2>
          <p>Liên hệ Tech Shop qua hotline hoặc mang máy trực tiếp đến cửa hàng</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={`tel:${settings.hotline.replace(/\./g, '')}`} className="btn btn-primary btn-lg">📞 Gọi {settings.hotline}</a>
            <Link to="/contact" className="btn btn-outline btn-lg">Xem địa chỉ cửa hàng</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
