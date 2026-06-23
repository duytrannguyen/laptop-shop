import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, CreditCard, ChevronRight, Phone, CheckCircle2, Gift, ChevronLeft } from 'lucide-react';
import { http } from '../../api/client';
import { useCart } from '../../context/CartContext';
import ProductCard from '../../components/specific/ProductCard';
import AutoImage from '../../components/common/AutoImage';

const fmt = (n) => (n ? Number(n).toLocaleString('vi-VN') + ' đ' : 'LIÊN HỆ');

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [isLongDesc, setIsLongDesc] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [error, setError] = useState('');
  const { add } = useCart();
  const descRef = React.useRef(null);

  useEffect(() => {
    setProduct(null);
    setError('');
    setShowFullDesc(false);
    setIsLongDesc(false);
    http.get(`/products/${slug}`).then((r) => {
      setProduct(r.data);
      setSelectedImage(0);
      if (r.data.category?.slug) {
        http.get(`/products?category=${r.data.category.slug}`).then((res) => {
          setRelated(res.data.filter((p) => p.slug !== slug).slice(0, 4));
        }).catch(() => {});
      }
    }).catch(() => setError('Sản phẩm không tồn tại hoặc đã ngừng bán.'));
  }, [slug]);

  useEffect(() => {
    // Check if description is long enough to warrant a "Read more" button
    if (descRef.current) {
      if (descRef.current.scrollHeight > 500) {
        setIsLongDesc(true);
      }
    }
  }, [product]);

  if (error) {
    return <main className="page-content"><div className="container empty-state"><h2>{error}</h2><Link className="btn btn-primary" to="/products">Xem sản phẩm khác</Link></div></main>;
  }

  if (!product) {
    return (
      <main className="page-content">
        <div className="container">
          <div className="loading">
            <div className="spinner" />
          </div>
        </div>
      </main>
    );
  }

  const p = product;
  const hasDiscount = p.salePrice && p.price && p.salePrice < p.price;
  const discountPercent = hasDiscount
    ? Math.round(((p.price - p.salePrice) / p.price) * 100)
    : 0;



  // Build image gallery: main image + any uploaded gallery images
  let galleryImages = [];
  if (p.gallery) {
    try {
      galleryImages = JSON.parse(p.gallery);
    } catch (e) {
      // ignore parse error
    }
  }
  const images = [p.image, ...galleryImages].filter(Boolean);

  return (
    <main className="page-content">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Trang chủ</Link>
          <ChevronRight size={14} className="separator" />
          {p.category && (
            <>
              <Link to={`/products?category=${p.category.slug}`}>{p.category.name}</Link>
              <ChevronRight size={14} className="separator" />
            </>
          )}
          <span>{p.name}</span>
        </div>

        {/* ====== PRODUCT TOP SECTION ====== */}
        <div className="pd-top fade-in">
          {/* LEFT: Image Gallery */}
          <div className="pd-gallery">
            <div className="pd-main-image">
              <AutoImage src={images[selectedImage] || p.image} alt={p.name} />
              {hasDiscount && (
                <span className="pd-discount-badge">-{discountPercent}%</span>
              )}
            </div>
            {images.length > 1 && (
              <div className="pd-thumbs">
                {images.map((img, i) => (
                  <button
                    key={i}
                    className={`pd-thumb ${selectedImage === i ? 'active' : ''}`}
                    onClick={() => setSelectedImage(i)}
                  >
                    <AutoImage src={img} alt={`Ảnh ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* CENTER: Product Info + Specs */}
          <div className="pd-info">
            <h1 className="pd-title">{p.name}</h1>

            <div className="pd-price-row">
              <span className="pd-price-current">{fmt(p.salePrice || p.price)}</span>
              {hasDiscount && (
                <>
                  <span className="pd-price-old">{fmt(p.price)}</span>
                  <span className="pd-discount-tag">-{discountPercent}%</span>
                </>
              )}
            </div>

            {/* Thông tin sản phẩm - Red header */}
            {p.description && (
              <div className="pd-specs-box">
                <div className="pd-specs-header">
                  <span>Thông tin sản phẩm</span>
                </div>
                <div
                  className="pd-specs-body"
                  dangerouslySetInnerHTML={{ __html: p.description.replace(/<p>([^:]+):/g, '<p><strong>$1:</strong>') }}
                />
              </div>
            )}

            {/* CTA Buttons */}
            <div className="pd-cta-group">
              <button className="btn btn-primary btn-lg pd-cta-btn" onClick={() => add(p)} disabled={(p.stock ?? 0) < 1}>
                <ShoppingCart size={20} />
                {(p.stock ?? 0) < 1 ? 'Hết hàng' : 'Thêm vào giỏ'}
              </button>
              <Link to={(p.stock ?? 0) < 1 ? '#' : '/cart'} className="btn btn-outline btn-lg pd-cta-btn" onClick={(event) => {
                if ((p.stock ?? 0) < 1) event.preventDefault();
                else add(p);
              }}>
                <CreditCard size={20} />
                Mua ngay
              </Link>
              <a href="tel:0816109179" className="btn pd-cta-contact">
                <Phone size={18} />
                Liên hệ tư vấn
              </a>
            </div>

            {/* Khuyến mãi - Green box */}
            {p.promotion && (
              <div className="pd-promo-box">
                <div className="pd-promo-header">
                  <Gift size={16} />
                  <span>QUÀ TẶNG KHUYẾN MÃI</span>
                </div>
                <div
                  className="pd-promo-body"
                  dangerouslySetInnerHTML={{ __html: p.promotion }}
                />
              </div>
            )}
          </div>
        </div>

        {/* ====== DESCRIPTION SECTION ====== */}
        {p.content && (
          <div className="pd-description-section fade-in">
            <div className="pd-desc-header">
              <h2>Mô tả sản phẩm</h2>
            </div>
            <div className={`pd-desc-body ${!isLongDesc ? 'short' : (showFullDesc ? 'expanded' : 'collapsed')}`}>
              <div
                className="pd-desc-content"
                ref={descRef}
                dangerouslySetInnerHTML={{ __html: p.content }}
              />
              {isLongDesc && !showFullDesc && <div className="pd-desc-gradient" />}
            </div>
            {isLongDesc && (
              <div className="pd-desc-actions">
                <button className="btn btn-outline" onClick={() => setShowFullDesc(!showFullDesc)}>
                  {showFullDesc ? 'Thu gọn' : 'Xem thêm'}
                </button>
              </div>
            )}
          </div>
        )}



        {/* ====== RELATED PRODUCTS ====== */}
        {related.length > 0 && (
          <div className="related-products">
            <div className="section-heading">
              <h2>Sản phẩm liên quan</h2>
            </div>
            <div className="products-grid">
              {related.map((rp) => (
                <ProductCard product={rp} key={rp.id} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
