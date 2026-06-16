import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Search, Package, CheckCircle, Truck, Clock, MapPin, Phone } from 'lucide-react';
import { http } from '../api/client';

const fmt = (n) => (n ? Number(n).toLocaleString('vi-VN') + ' đ' : '0 đ');

const STATUS_MAP = {
  PENDING: { label: 'Chờ xác nhận', icon: Clock, color: '#92400e', bg: '#fef3c7' },
  CONFIRMED: { label: 'Đã xác nhận', icon: CheckCircle, color: '#1e40af', bg: '#dbeafe' },
  SHIPPING: { label: 'Đang giao hàng', icon: Truck, color: '#3730a3', bg: '#e0e7ff' },
  DONE: { label: 'Đã giao hàng', icon: CheckCircle, color: '#065f46', bg: '#d1fae5' },
  CANCELLED: { label: 'Đã hủy', icon: Package, color: '#991b1b', bg: '#fee2e2' },
};

const STEPS = ['PENDING', 'CONFIRMED', 'SHIPPING', 'DONE'];

export default function OrderTrackingPage() {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    setError('');
    setOrders(null);
    try {
      const res = await http.get(`/orders/track?phone=${encodeURIComponent(phone.trim())}`);
      setOrders(res.data);
      if (res.data.length === 0) {
        setError('Không tìm thấy đơn hàng nào với số điện thoại này');
      }
    } catch (err) {
      setError('Không thể tra cứu đơn hàng. Vui lòng thử lại hoặc liên hệ hotline.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status) => STEPS.indexOf(status);

  return (
    <main className="page-content">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Trang chủ</Link>
          <ChevronRight size={14} className="separator" />
          <span>Tra cứu đơn hàng</span>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Package size={48} style={{ color: 'var(--primary)', marginBottom: '16px' }} />
          <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Tra cứu đơn hàng</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '500px', margin: '0 auto' }}>
            Nhập số điện thoại đặt hàng để xem trạng thái đơn hàng của bạn
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="order-track-form">
          <div style={{ position: 'relative', flex: 1 }}>
            <Phone size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="form-input"
              style={{ paddingLeft: '46px', fontSize: '16px', height: '52px' }}
              placeholder="Nhập số điện thoại (VD: 0816109179)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              type="tel"
              id="order-track-input"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ height: '52px', minWidth: '160px' }}>
            {loading ? 'Đang tìm...' : (
              <>
                <Search size={18} /> Tra cứu
              </>
            )}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="order-track-error fade-in">
            <p>{error}</p>
            <p style={{ fontSize: '13px', marginTop: '8px' }}>
              Cần hỗ trợ? Gọi <a href="tel:0816109179" style={{ color: 'var(--primary)', fontWeight: '700' }}>0816.109.179</a>
            </p>
          </div>
        )}

        {/* Results */}
        {orders && orders.length > 0 && (
          <div className="order-track-results fade-in">
            <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>
              Tìm thấy {orders.length} đơn hàng
            </h2>
            {orders.map((order) => {
              const currentStep = getStepIndex(order.status);
              const isCancelled = order.status === 'CANCELLED';
              const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.PENDING;

              return (
                <div className="order-track-card" key={order.id}>
                  <div className="order-track-header">
                    <div>
                      <strong style={{ fontSize: '18px' }}>Đơn hàng #{order.id}</strong>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {order.customerName} · {order.phone}
                      </div>
                    </div>
                    <span
                      className="order-status"
                      style={{ background: statusInfo.bg, color: statusInfo.color }}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Timeline */}
                  {!isCancelled && (
                    <div className="order-timeline">
                      {STEPS.map((step, i) => {
                        const stepInfo = STATUS_MAP[step];
                        const StepIcon = stepInfo.icon;
                        const isCompleted = i <= currentStep;
                        const isCurrent = i === currentStep;
                        return (
                          <div
                            className={`order-timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                            key={step}
                          >
                            <div className="order-timeline-dot">
                              <StepIcon size={16} />
                            </div>
                            <span className="order-timeline-label">{stepInfo.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {isCancelled && (
                    <div style={{ padding: '16px', background: '#fee2e2', borderRadius: 'var(--radius-md)', textAlign: 'center', color: '#991b1b', fontWeight: '600' }}>
                      Đơn hàng đã bị hủy
                    </div>
                  )}

                  {/* Order Info */}
                  <div className="order-track-info">
                    <div>
                      <MapPin size={16} style={{ color: 'var(--text-muted)', verticalAlign: 'middle', marginRight: '6px' }} />
                      <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{order.address}</span>
                    </div>
                    {order.total && (
                      <div style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '18px' }}>
                        {fmt(order.total)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Help */}
        <div className="about-cta" style={{ marginTop: '40px' }}>
          <h2>Cần hỗ trợ thêm?</h2>
          <p>Liên hệ Laptop Shop nếu bạn cần kiểm tra chi tiết đơn hàng</p>
          <a href="tel:0816109179" className="btn btn-primary btn-lg">📞 Gọi 0816.109.179</a>
        </div>
      </div>
    </main>
  );
}
