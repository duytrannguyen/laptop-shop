import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import AutoImage from '../common/AutoImage';
import { hasActiveSale, getEffectivePrice } from '../../utils/priceUtils';

/**
 * Thẻ sản phẩm – hiển thị trong danh sách sản phẩm và slider.
 *
 * Hiển thị:
 * - Ảnh sản phẩm (qua AutoImage hỗ trợ frame/watermark)
 * - Badge giảm giá (nếu đang sale, ví dụ: -20%)
 * - Tên sản phẩm (link đến trang chi tiết)
 * - Giá hiện tại + giá gốc gạch ngang (nếu đang sale)
 * - Thông số kỹ thuật tóm tắt (lấy từ description hoặc specs, tối đa 5 dòng)
 * - Nút "Thêm vào giỏ" (disable nếu hết hàng)
 */

/** Format số tiền VND: 15000000 → "15.000.000 đ" */
const fmt = (n) => (n ? Number(n).toLocaleString('vi-VN') + ' đ' : 'LIÊN HỆ');

export default function ProductCard({ product }) {
  const { add } = useCart();
  const p = product;

  // Tính toán trạng thái sale và giá hiển thị
  const activeSale = hasActiveSale(p);
  const effectivePrice = getEffectivePrice(p);
  const hasDiscount = activeSale && effectivePrice < p.price;
  const discountPercent = hasDiscount
    ? Math.round(((p.price - effectivePrice) / p.price) * 100)
    : 0;

  return (
    <div className="product-card">
      <div className="product-card-image">
        {/* Badge phần trăm giảm giá */}
        {hasDiscount && (
          <span className="product-card-badge">-{discountPercent}%</span>
        )}
        <Link to={`/product/${p.slug}`}>
          {/* AutoImage hỗ trợ frame và watermark được cấu hình trong Settings */}
          <AutoImage src={p.image} alt={p.name} loading="lazy" />
        </Link>
      </div>

      <h3 className="product-card-name">
        <Link to={`/product/${p.slug}`}>{p.name}</Link>
      </h3>

      <div className="product-card-price">
        <span className="current">{fmt(effectivePrice)}</span>
        {/* Giá gốc gạch ngang – chỉ hiện khi đang sale */}
        {hasDiscount && <span className="original">{fmt(p.price)}</span>}
      </div>

      {/* Thông số tóm tắt: lấy từ description (HTML) hoặc specs, hiển thị tối đa 5 dòng */}
      <div className="product-card-specs">
        {(() => {
          const htmlContent = (p.description && typeof p.description === 'string' && p.description.trim() !== '')
            ? p.description
            : (p.specs && typeof p.specs === 'string' && p.specs !== '[]' ? p.specs : null);

          if (htmlContent) {
            // Bóc tách text thuần từ HTML: chuyển </p>, </li>, <br> thành xuống dòng
            let text = htmlContent.replace(/<\/p>|<\/li>|<br\s*\/?>/gi, '\n');
            text = text.replace(/<[^>]+>/g, ''); // Xóa tất cả tag HTML còn lại
            const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

            if (lines.length > 0) {
              return (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {lines.slice(0, 5).map((l, i) => {
                    // Nếu dòng có dấu ":" → chia thành key: value (in đậm key)
                    const colonIdx = l.indexOf(':');
                    if (colonIdx !== -1) {
                      const key = l.substring(0, colonIdx);
                      const val = l.substring(colonIdx + 1).trim();
                      return (
                        <li key={i}>
                          <strong dangerouslySetInnerHTML={{ __html: key + ':' }} />
                          {' '}
                          <span dangerouslySetInnerHTML={{ __html: val }} />
                        </li>
                      );
                    }
                    return <li key={i} dangerouslySetInnerHTML={{ __html: l }} />;
                  })}
                </ul>
              );
            }
          }

          return null;
        })()}
      </div>

      <div className="product-card-actions">
        {/* Nút thêm vào giỏ – disable và đổi text khi hết hàng */}
        <button className="btn btn-primary btn-sm" onClick={() => add(p)} disabled={(p.stock ?? 0) < 1}>
          <ShoppingCart size={15} />
          {(p.stock ?? 0) < 1 ? 'Hết hàng' : 'Thêm vào giỏ'}
        </button>
      </div>
    </div>
  );
}
