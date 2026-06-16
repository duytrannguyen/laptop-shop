import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ChevronRight, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { http } from '../api/client';

const fmt = (n) => (n ? Number(n).toLocaleString('vi-VN') + ' đ' : 'LIÊN HỆ');

export default function CheckoutPage() {
  const { cart, total, count, clear } = useCart();
  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    address: '',
    note: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setSubmitting(true);
    setError('');
    try {
      const response = await http.post('/orders', {
        ...form,
        items: cart.map((i) => ({ productId: i.id, quantity: i.qty })),
      });
      clear();
      setOrder(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  if (order) {
    return (
      <main className="page-content">
        <div className="container">
          <div className="empty-state fade-in">
            <CheckCircle size={72} style={{ color: 'var(--success)' }} />
            <h2 style={{ marginTop: '16px', color: 'var(--success)' }}>Đặt hàng thành công!</h2>
            <p style={{ marginBottom: '8px' }}>Cảm ơn bạn đã mua hàng tại Laptop Shop.</p>
            <p style={{ marginBottom: '8px' }}><strong>Mã đơn hàng: #{order.id}</strong></p>
            <p style={{ marginBottom: '24px', color: 'var(--text-secondary)' }}>
              Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất để xác nhận đơn hàng.
            </p>
            <Link to="/" className="btn btn-primary">
              Về trang chủ
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (cart.length === 0) return <Navigate to="/cart" replace />;

  return (
    <main className="page-content">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Trang chủ</Link>
          <ChevronRight size={14} className="separator" />
          <Link to="/cart">Giỏ hàng</Link>
          <ChevronRight size={14} className="separator" />
          <span>Thanh toán</span>
        </div>

        <h1 style={{ marginBottom: '24px', fontSize: '24px' }}>Thông tin đặt hàng</h1>

        <div className="checkout-layout">
          {/* Form */}
          <form className="checkout-form" onSubmit={handleSubmit}>
            {error && <div className="form-error">{error}</div>}
            <div className="form-group">
              <label className="form-label">Họ và tên *</label>
              <input
                className="form-input"
                name="customerName"
                required
                placeholder="Nhập họ và tên"
                value={form.customerName}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Số điện thoại *</label>
              <input
                className="form-input"
                name="phone"
                type="tel"
                pattern="(\+84|0)[0-9]{9,10}"
                required
                placeholder="Nhập số điện thoại"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Địa chỉ nhận hàng *</label>
              <input
                className="form-input"
                name="address"
                required
                placeholder="Nhập địa chỉ chi tiết"
                value={form.address}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Ghi chú</label>
              <textarea
                className="form-textarea"
                name="note"
                placeholder="Ghi chú thêm (nếu có)"
                value={form.note}
                onChange={handleChange}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              disabled={submitting}
            >
              {submitting ? 'Đang xử lý...' : 'Gửi đơn hàng'}
            </button>
          </form>

          {/* Order Summary */}
          <div className="checkout-summary">
            <h3 style={{ marginBottom: '16px' }}>Đơn hàng ({count} sản phẩm)</h3>
            {cart.map((item) => (
              <div key={item.id} style={{
                display: 'flex', gap: '12px', alignItems: 'center',
                padding: '10px 0', borderBottom: '1px solid var(--border-light)'
              }}>
                <img
                  src={item.image}
                  alt={item.name}
                  style={{
                    width: '50px', height: '50px',
                    objectFit: 'contain', borderRadius: '6px', background: '#f8f9fa'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', lineHeight: '1.3' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>x{item.qty}</div>
                </div>
                <div style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '14px', whiteSpace: 'nowrap' }}>
                  {fmt((item.salePrice || item.price) * item.qty)}
                </div>
              </div>
            ))}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              paddingTop: '16px', marginTop: '8px'
            }}>
              <strong style={{ fontSize: '16px' }}>Tổng cộng</strong>
              <strong style={{ fontSize: '20px', color: 'var(--primary)' }}>{fmt(total)}</strong>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
