import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingCart, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

const fmt = (n) => (n ? Number(n).toLocaleString('vi-VN') + ' đ' : 'LIÊN HỆ');

export default function CartPage() {
  const { cart, remove, updateQty, total, count } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <main className="page-content">
        <div className="container">
          <div className="empty-state">
            <ShoppingCart size={64} />
            <h2 style={{ marginTop: '16px' }}>Giỏ hàng trống</h2>
            <p style={{ marginBottom: '24px' }}>Bạn chưa có sản phẩm nào trong giỏ hàng</p>
            <Link to="/products" className="btn btn-primary">
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
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
          <span>Giỏ hàng</span>
        </div>

        <h1 style={{ marginBottom: '24px', fontSize: '24px' }}>
          Giỏ hàng ({count} sản phẩm)
        </h1>

        <div className="cart-table">
          {cart.map((item) => (
            <div className="cart-item" key={item.id}>
              <img className="cart-item-img" src={item.image} alt={item.name} />
              <div className="cart-item-name">
                <Link to={`/product/${item.slug}`}>{item.name}</Link>
              </div>
              <div className="cart-qty">
                <button onClick={() => updateQty(item.id, item.qty - 1)}>
                  <Minus size={14} />
                </button>
                <span>{item.qty}</span>
                <button onClick={() => updateQty(item.id, item.qty + 1)} disabled={item.qty >= (item.stock ?? Infinity)}>
                  <Plus size={14} />
                </button>
              </div>
              <div className="cart-item-price">
                {fmt((item.salePrice || item.price) * item.qty)}
              </div>
              <button className="cart-item-remove" onClick={() => remove(item.id)}>
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <div className="cart-summary-row">
            <span>Tạm tính ({count} sản phẩm)</span>
            <span className="cart-summary-total">{fmt(total)}</span>
          </div>
          <div className="cart-summary-row">
            <span>Phí vận chuyển</span>
            <span style={{ color: 'var(--success)', fontWeight: '700' }}>Miễn phí</span>
          </div>
          <div className="cart-summary-row">
            <strong style={{ fontSize: '18px' }}>Tổng cộng</strong>
            <strong className="cart-summary-total" style={{ fontSize: '24px' }}>{fmt(total)}</strong>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <Link to="/products" className="btn btn-outline" style={{ flex: 1 }}>
              Tiếp tục mua
            </Link>
            <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={() => navigate('/checkout')}>
              Đặt hàng
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
