import React, { useState, useEffect } from 'react';
import { useToast } from '../components/ToastContext';
import { ClipboardList, Eye, X } from 'lucide-react';
import { http } from '../api/client';

const fmt = (n) => (n ? Number(n).toLocaleString('vi-VN') + ' đ' : '0 đ');

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Chờ xác nhận' },
  { value: 'CONFIRMED', label: 'Đã xác nhận' },
  { value: 'SHIPPING', label: 'Đang giao' },
  { value: 'DONE', label: 'Hoàn thành' },
  { value: 'CANCELLED', label: 'Đã hủy' },
];

export default function OrdersManage() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [detail, setDetail] = useState(null);
  const [filter, setFilter] = useState('ALL');

  const load = () => {
    http.get('/admin/orders').then((r) => setOrders(r.data)).catch(() => {});
  };

  useEffect(load, []);

  const updateStatus = async (id, status) => {
    try {
      await http.put(`/admin/orders/${id}/status`, { status });
      load();
    } catch (error) {
      showToast(error.response?.data?.message || 'Không thể cập nhật trạng thái');
    }
  };

  const filtered = filter === 'ALL' ? orders : orders.filter((o) => o.status === filter);

  return (
    <>
      <div className="admin-header">
        <h1><ClipboardList size={24} style={{ verticalAlign: 'middle', marginRight: '8px' }} />Quản lý đơn hàng</h1>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[{ value: 'ALL', label: 'Tất cả' }, ...STATUS_OPTIONS].map((opt) => (
          <button
            key={opt.value}
            className={`btn btn-sm ${filter === opt.value ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter(opt.value)}
          >
            {opt.label}
            {opt.value !== 'ALL' && (
              <span style={{ marginLeft: '6px', opacity: 0.7 }}>
                ({orders.filter((o) => o.status === opt.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <h3>Đơn hàng ({filtered.length})</h3>
        </div>
        <div className="admin-table-scroll"><table className="admin-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Điện thoại</th>
              <th>Địa chỉ</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? filtered.map((order) => (
              <tr key={order.id}>
                <td><strong>#{order.id}</strong></td>
                <td style={{ fontWeight: '600' }}>{order.customerName}</td>
                <td>{order.phone}</td>
                <td style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {order.address}
                </td>
                <td style={{ fontWeight: '700', color: 'var(--primary)', whiteSpace: 'nowrap' }}>{fmt(order.total)}</td>
                <td>
                  <select
                    className="status-select"
                    value={order.status || 'PENDING'}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <button className="admin-btn-edit" onClick={() => setDetail(order)} title="Xem chi tiết">
                    <Eye size={14} /> Chi tiết
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  Không có đơn hàng nào
                </td>
              </tr>
            )}
          </tbody>
        </table></div>
      </div>

      {/* Detail Modal */}
      {detail && (
        <div className="admin-modal-overlay" onClick={() => setDetail(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <div className="admin-modal-header">
              <h2>Đơn hàng #{detail.id}</h2>
              <button className="admin-modal-close" onClick={() => setDetail(null)}><X size={18} /></button>
            </div>
            <div className="admin-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Khách hàng</div>
                  <div style={{ fontWeight: '600' }}>{detail.customerName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Điện thoại</div>
                  <div style={{ fontWeight: '600' }}>{detail.phone}</div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Địa chỉ</div>
                  <div style={{ fontWeight: '500' }}>{detail.address}</div>
                </div>
                {detail.note && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Ghi chú</div>
                    <div style={{ fontWeight: '500', fontStyle: 'italic' }}>{detail.note}</div>
                  </div>
                )}
              </div>

              {detail.items && detail.items.length > 0 && (
                <>
                  <h4 style={{ marginBottom: '12px' }}>Sản phẩm đặt mua</h4>
                  <table className="admin-table" style={{ boxShadow: 'none', border: '1px solid var(--border-light)' }}>
                    <thead>
                      <tr>
                        <th>Sản phẩm</th>
                        <th>SL</th>
                        <th>Giá</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.items.map((item, i) => (
                        <tr key={i}>
                          <td>{item.productName || `SP #${item.productId}`}</td>
                          <td>{item.quantity}</td>
                          <td style={{ color: 'var(--primary)', fontWeight: '600' }}>{fmt(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
                <strong style={{ fontSize: '16px' }}>Tổng cộng</strong>
                <strong style={{ fontSize: '20px', color: 'var(--primary)' }}>{fmt(detail.total)}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

