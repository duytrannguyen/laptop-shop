import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, FolderTree, Newspaper, ClipboardList, TrendingUp, Eye } from 'lucide-react';
import { http } from '../../api/client';

const fmt = (n) => (n ? Number(n).toLocaleString('vi-VN') + ' đ' : '0 đ');

const STATUS_LABELS = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  SHIPPING: 'Đang giao',
  DONE: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

export default function DashboardPage() {
  const [stats, setStats] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    http.get('/admin/stats').then((r) => setStats(r.data)).catch(() => {});
    http.get('/admin/orders').then((r) => setRecentOrders(r.data.slice(0, 5))).catch(() => {});
  }, []);

  const statCards = [
    { key: 'totalProducts', label: 'Sản phẩm', icon: Package, color: 'products' },
    { key: 'totalCategories', label: 'Danh mục', icon: FolderTree, color: 'categories' },
    { key: 'totalPosts', label: 'Bài viết', icon: Newspaper, color: 'posts' },
    { key: 'totalOrders', label: 'Đơn hàng', icon: ClipboardList, color: 'orders' },
  ];

  return (
    <>
      <div className="admin-header">
        <h1>Dashboard</h1>
        <div className="admin-header-actions">
          <Link to="/" className="btn btn-outline btn-sm" target="_blank">
            <Eye size={16} /> Xem website
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="admin-stats">
        {statCards.map((card) => (
          <div className="admin-stat-card" key={card.key}>
            <div className={`admin-stat-icon ${card.color}`}>
              <card.icon size={24} />
            </div>
            <div className="admin-stat-info">
              <div className="stat-number">{stats[card.key] ?? '—'}</div>
              <div className="stat-label">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <h3><ClipboardList size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />Đơn hàng mới nhất</h3>
          <Link to="/admin/orders" className="btn btn-sm btn-outline">
            Xem tất cả
          </Link>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Điện thoại</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.length > 0 ? recentOrders.map((order) => (
              <tr key={order.id}>
                <td><strong>#{order.id}</strong></td>
                <td>{order.customerName}</td>
                <td>{order.phone}</td>
                <td style={{ color: 'var(--primary)', fontWeight: '700' }}>{fmt(order.total)}</td>
                <td>
                  <span className={`order-status ${(order.status || 'PENDING').toLowerCase()}`}>
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  Chưa có đơn hàng nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
