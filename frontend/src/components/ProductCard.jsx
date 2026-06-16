import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

const fmt = (n) => (n ? Number(n).toLocaleString('vi-VN') + ' đ' : 'LIÊN HỆ');

export default function ProductCard({ product }) {
  const { add } = useCart();
  const p = product;
  const hasDiscount = p.salePrice && p.price && p.salePrice < p.price;
  const discountPercent = hasDiscount
    ? Math.round(((p.price - p.salePrice) / p.price) * 100)
    : 0;

  return (
    <div className="product-card">
      <div className="product-card-image">
        {hasDiscount && (
          <span className="product-card-badge">-{discountPercent}%</span>
        )}
        <Link to={`/product/${p.slug}`}>
          <img src={p.image} alt={p.name} loading="lazy" />
        </Link>
      </div>

      <h3 className="product-card-name">
        <Link to={`/product/${p.slug}`}>{p.name}</Link>
      </h3>

      <div className="product-card-price">
        <span className="current">{fmt(p.salePrice || p.price)}</span>
        {hasDiscount && <span className="original">{fmt(p.price)}</span>}
      </div>

      <div className="product-card-specs">
        {(() => {
          // Lấy HTML từ description (Mô tả ngắn) hoặc specs
          const htmlContent = (p.description && typeof p.description === 'string' && p.description.trim() !== '')
            ? p.description
            : (p.specs && typeof p.specs === 'string' && p.specs !== '[]' ? p.specs : null);

          if (htmlContent) {
            let text = htmlContent.replace(/<\/p>|<\/li>|<br\s*\/?>/gi, '\n');
            text = text.replace(/<[^>]+>/g, '');
            const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

            if (lines.length > 0) {
              return (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {lines.slice(0, 5).map((l, i) => {
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
        <button className="btn btn-primary btn-sm" onClick={() => add(p)} disabled={(p.stock ?? 0) < 1}>
          <ShoppingCart size={15} />
          {(p.stock ?? 0) < 1 ? 'Hết hàng' : 'Thêm vào giỏ'}
        </button>
      </div>
    </div>
  );
}
