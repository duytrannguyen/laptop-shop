import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/not-found.css';

export default function NotFoundPage() {
  return (
    <main className="page-content not-found-page">
      <div className="container">
        <div className="not-found-wrapper">
          <div className="not-found-glitch" data-text="404">404</div>
          <h1 className="not-found-title">Không Tìm Thấy Trang</h1>
          <p className="not-found-desc">
            Oops! Có vẻ như trang hoặc dữ liệu bạn đang tìm kiếm không tồn tại, đã bị xóa hoặc URL không chính xác.
          </p>
          <div className="not-found-actions">
            <Link to="/" className="btn btn-primary btn-lg not-found-btn">
              Quay Lại Trang Chủ
            </Link>
            <Link to="/products" className="btn btn-outline btn-lg not-found-btn">
              Xem Sản Phẩm
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
