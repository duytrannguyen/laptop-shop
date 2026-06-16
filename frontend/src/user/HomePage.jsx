import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Laptop, Shield, Truck, CreditCard, Headphones } from 'lucide-react';
import { http } from '../api/client';
import ProductCard from '../components/ProductCard';
import { useSite } from '../context/SiteContext';

const fmt = (n) => (n ? Number(n).toLocaleString('vi-VN') + ' đ' : 'LIÊN HỆ');

const fallbackSlides = [
  {
    badge: 'Laptop Shop',
    title: 'Laptop cũ Cần Thơ – Chất lượng, uy tín, giá minh bạch',
    desc: 'Đa dạng laptop Gaming, Macbook, laptop văn phòng chính hãng, nguyên zin. Kiểm định kỹ, bảo hành rõ ràng.',
    bg: 'linear-gradient(135deg, #9d0011 0%, #ed1c24 50%, #ff4444 100%)',
  },
  {
    badge: 'KHUYẾN MÃI',
    title: 'Trả góp 0% – Sở hữu laptop chỉ từ 500K/tháng',
    desc: 'Hỗ trợ trả góp qua thẻ tín dụng & công ty tài chính. Thủ tục nhanh gọn, duyệt trong 15 phút.',
    bg: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #60a5fa 100%)',
  },
  {
    badge: 'THU CŨ ĐỔI MỚI',
    title: 'Mang máy cũ – Nhận giá cao, đổi máy mới ngay',
    desc: 'Thu mua laptop cũ giá cao nhất Cần Thơ. Định giá minh bạch, trả tiền ngay hoặc khấu trừ khi mua máy mới.',
    bg: 'linear-gradient(135deg, #064e3b 0%, #059669 50%, #34d399 100%)',
  },
];

export default function HomePage() {
  const { settings } = useSite();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [activeProducts, setActiveProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [heroSlides, setHeroSlides] = useState(fallbackSlides);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    http.get('/products/featured').then((r) => setFeaturedProducts(r.data)).catch(() => {});
    http.get('/products').then((r) => setActiveProducts(r.data.slice(0, 12))).catch(() => {});
    http.get('/categories').then((r) => setCategories(r.data)).catch(() => {});
    http.get('/banners').then((r) => {
      if (r.data.length > 0) setHeroSlides(r.data);
    }).catch(() => {});
  }, []);

  // Auto-slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  }, [heroSlides.length]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  }, [heroSlides.length]);

  return (
    <main>
      {/* Hero Section */}
      <div className="hero-section">
        <div className="container">
          <div className="hero-grid">
            {/* Main Slider */}
            <div className="hero-slider">
              <div
                className="hero-slides"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {heroSlides.map((slide, i) => (
                  <div
                    className="hero-slide"
                    key={slide.id || i}
                    style={{
                      background: slide.imageUrl
                        ? `${slide.background || 'linear-gradient(135deg, #111827cc, #11182777)'}, url(${slide.imageUrl}) center/cover`
                        : (slide.background || slide.bg),
                    }}
                  >
                    <div className="hero-slide-content">
                      <span className="hero-slide-badge">{slide.badge}</span>
                      <h2>{slide.title}</h2>
                      <p>{slide.description || slide.desc}</p>
                      <Link to={slide.linkUrl || '/products'} className="btn btn-primary btn-lg" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
                        Xem sản phẩm
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              <button className="hero-arrow hero-arrow-left" onClick={prevSlide}>
                <ChevronLeft size={20} />
              </button>
              <button className="hero-arrow hero-arrow-right" onClick={nextSlide}>
                <ChevronRight size={20} />
              </button>

              <div className="hero-dots">
                {heroSlides.map((_, i) => (
                  <button
                    key={i}
                    className={`hero-dot ${i === currentSlide ? 'active' : ''}`}
                    onClick={() => setCurrentSlide(i)}
                  />
                ))}
              </div>
            </div>

            {/* Sidebar Banners */}
            <div className="hero-sidebar">
              <Link to="/products" className="hero-sidebar-banner">
                <div>
                  <h3>Trả góp 0%</h3>
                  <p>Duyệt nhanh 15 phút, thủ tục đơn giản</p>
                </div>
                <CreditCard size={60} className="hero-sidebar-icon" />
              </Link>
              <Link to="/products" className="hero-sidebar-banner">
                <div>
                  <h3>Freeship toàn quốc</h3>
                  <p>Đóng gói cẩn thận, giao hàng nhanh chóng</p>
                </div>
                <Truck size={60} className="hero-sidebar-icon" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Banner Strip */}
      <div className="banner-strip">
        <div className="container">
          <div className="banner-strip-grid">
            <Link to="/products" className="banner-strip-item">
              🧹 Vệ sinh laptop miễn phí
            </Link>
            <Link to="/products" className="banner-strip-item">
              🎁 Combo quà tặng 1 triệu
            </Link>
            <Link to="/products" className="banner-strip-item">
              🚚 Freeship toàn quốc
            </Link>
            <Link to="/products" className="banner-strip-item">
              🎓 Ưu đãi sinh viên -300K
            </Link>
          </div>
        </div>
      </div>

      {/* Categories */}
      <section className="section">
        <div className="container">
          <div className="section-heading">
            <h2>Danh mục sản phẩm</h2>
          </div>
          <div className="categories-grid">
            {categories.map((cat) => (
              <Link to={`/products?category=${cat.slug}`} className="category-card" key={cat.id}>
                <div className="cat-icon">
                  <Laptop size={24} />
                </div>
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Slider */}
      {featuredProducts.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="section-heading">
              <h2>Sản phẩm nổi bật</h2>
            </div>
            <div className="featured-slider-wrap" style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '16px', scrollSnapType: 'x mandatory' }}>
              {featuredProducts.map((p) => (
                <div key={p.id} style={{ minWidth: '280px', maxWidth: '300px', flexShrink: 0, scrollSnapAlign: 'start' }}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Active Products Grid */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-heading">
            <h2>Sản phẩm mới</h2>
          </div>
          <div className="products-grid">
            {activeProducts.map((p) => (
              <ProductCard product={p} key={p.id} />
            ))}
          </div>
          {activeProducts.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <Link to="/products" className="btn btn-outline">
                Xem tất cả sản phẩm
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Policies */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="policies-grid">
            <div className="policy-item">
              <div className="policy-icon"><Shield size={24} /></div>
              <div className="policy-text">
                <h4>Bảo hành rõ ràng</h4>
                <p>Bảo hành 3-12 tháng tùy máy</p>
              </div>
            </div>
            <div className="policy-item">
              <div className="policy-icon"><Truck size={24} /></div>
              <div className="policy-text">
                <h4>Freeship toàn quốc</h4>
                <p>Giao hàng tận nơi, đóng gói cẩn thận</p>
              </div>
            </div>
            <div className="policy-item">
              <div className="policy-icon"><CreditCard size={24} /></div>
              <div className="policy-text">
                <h4>Trả góp 0%</h4>
                <p>Hỗ trợ trả góp qua thẻ & công ty TC</p>
              </div>
            </div>
            <div className="policy-item">
              <div className="policy-icon"><Headphones size={24} /></div>
              <div className="policy-text">
                <h4>Tư vấn 24/7</h4>
                <p>Hỗ trợ kỹ thuật sau mua hàng</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '16px' }}>{settings.shortName} - Chất lượng là uy tín</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto 24px', lineHeight: '1.7' }}>
              Sản phẩm rõ nguồn gốc, đã được kiểm định kỹ càng. Giá cả minh bạch, bảo hành rõ ràng
              và đội ngũ kỹ thuật tận tâm. Hỗ trợ thu cũ đổi mới với giá tốt nhất Cần Thơ.
            </p>
            <div className="stats-grid" style={{ maxWidth: '600px', margin: '0 auto' }}>
              <div className="stat-card">
                <div className="stat-number">50+</div>
                <div className="stat-label">Sản phẩm</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">08:30-20:00</div>
                <div className="stat-label">Giờ bán hàng</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">0%</div>
                <div className="stat-label">Hỗ trợ trả góp</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
