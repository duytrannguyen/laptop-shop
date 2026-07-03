import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Smartphone, Shield, Truck, CreditCard, Headphones } from 'lucide-react';
import { http } from '../../api/client';
import ProductCard from '../../components/product/ProductCard';
import ProductSlider from '../../components/product/ProductSlider';
import PopupBanner from '../../components/common/PopupBanner';
import { useSite } from '../../context/SiteContext';

const fmt = (n) => (n ? Number(n).toLocaleString('vi-VN') + ' đ' : 'LIÊN HỆ');

const fallbackSlides = [
  {
    badge: 'Tech Shop',
    title: 'Thiết bị số Cần Thơ – Chất lượng, uy tín, giá minh bạch',
    desc: 'Đa dạng điện thoại, tai nghe, phụ kiện chính hãng, nguyên zin. Kiểm định kỹ, bảo hành rõ ràng.',
    bg: 'linear-gradient(135deg, #9d0011 0%, #ed1c24 50%, #ff4444 100%)',
  },
  {
    badge: 'THU CŨ ĐỔI MỚI',
    title: 'Mang máy cũ – Nhận giá cao, đổi máy mới ngay',
    desc: 'Thu mua thiết bị công nghệ giá cao nhất Cần Thơ. Định giá minh bạch, trả tiền ngay hoặc khấu trừ khi mua máy mới.',
    bg: 'linear-gradient(135deg, #064e3b 0%, #059669 50%, #34d399 100%)',
  },
];

const fallbackSidebar = [
  { id: 's2', title: 'Freeship toàn quốc', description: 'Đóng gói cẩn thận, giao hàng nhanh chóng', linkUrl: '/products', background: 'linear-gradient(145deg, #064e3b 0%, #059669 60%, #10b981 100%)' },
];

const fallbackStrip = [
  { id: 't1', title: '🧹 Vệ sinh thiết bị miễn phí', linkUrl: '/products', background: 'linear-gradient(135deg, #6d28d9, #8b5cf6)' },
  { id: 't2', title: '🎁 Combo quà tặng 1 triệu', linkUrl: '/products', background: 'linear-gradient(135deg, #be185d, #ec4899)' },
  { id: 't3', title: '🚚 Freeship toàn quốc', linkUrl: '/products', background: 'linear-gradient(135deg, #c2410c, #f97316)' },
  { id: 't4', title: '🎓 Ưu đãi sinh viên -300K', linkUrl: '/products', background: 'linear-gradient(135deg, #0369a1, #0ea5e9)' },
];

export default function HomePage() {
  const { settings } = useSite();
  const [allProducts, setAllProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [heroSlides, setHeroSlides] = useState(fallbackSlides);
  const [sidebarBanners, setSidebarBanners] = useState(fallbackSidebar);
  const [stripBanners, setStripBanners] = useState(fallbackStrip);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    http.get('/products/featured').then((r) => setFeaturedProducts(r.data)).catch(() => {});
    http.get('/products').then((r) => setAllProducts(r.data)).catch(() => {});
    http.get('/categories').then((r) => setCategories(r.data)).catch(() => {});
    http.get('/banners/all').then((r) => {
      if (r.data.slider?.length > 0) setHeroSlides(r.data.slider);
      if (r.data.sidebar?.length > 0) setSidebarBanners(r.data.sidebar);
      if (r.data.strip?.length > 0) setStripBanners(r.data.strip);
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
      <PopupBanner />
      {/* Hero Section */}
      <div className="hero-section">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-menu-spacer"></div>
            {/* Main Slider */}
            <div className="hero-slider">
              <div
                className="hero-slides"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {heroSlides.map((slide, i) => {
                  const slideStyle = {
                    background: slide.imageUrl
                      ? `url(${slide.imageUrl}) center/cover`
                      : (slide.bg || '#111827'),
                    textDecoration: 'none'
                  };

                  const innerContent = (
                    <div className="hero-slide-content">
                      {(slide.description || slide.desc) && (
                        <>
                          <p>{slide.description || slide.desc}</p>
                          <span className="btn btn-primary btn-lg" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
                            Xem sản phẩm
                          </span>
                        </>
                      )}
                    </div>
                  );

                  return slide.linkUrl ? (
                    <Link to={slide.linkUrl} key={slide.id || i} className="hero-slide" style={slideStyle}>
                      {innerContent}
                    </Link>
                  ) : (
                    <div key={slide.id || i} className="hero-slide" style={slideStyle}>
                      {innerContent}
                    </div>
                  );
                })}
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

            {/* Sidebar Banners - dynamic from API */}
            <div className="hero-sidebar">
              {sidebarBanners.map((banner) => (
                <Link
                  key={banner.id}
                  to={banner.linkUrl || '/products'}
                  className="hero-sidebar-banner"
                  style={{
                    background: banner.imageUrl
                      ? `url(${banner.imageUrl}) center/cover`
                      : (banner.background || 'linear-gradient(145deg, #1e3a5f, #3b82f6)')
                  }}
                >
                  <div>
                    <h3>{banner.title || ''}</h3>
                    {banner.description && <p>{banner.description}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Banner Strip - dynamic from API */}
      {stripBanners.length > 0 && (
        <div className="banner-strip">
          <div className="container">
            <div className="banner-strip-grid">
              {stripBanners.map((banner) => (
                <Link
                  key={banner.id}
                  to={banner.linkUrl || '/products'}
                  className="banner-strip-item"
                  style={banner.imageUrl ? {
                    background: `url(${banner.imageUrl}) center/cover no-repeat`,
                    color: 'transparent',
                    display: 'block'
                  } : { background: banner.background || undefined }}
                >
                  <div style={{ position: 'relative', zIndex: 1, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                    {banner.title}
                  </div>
                  {banner.imageUrl && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hot Sale / Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="section hot-sale-section">
          <div className="container">
            <div className="hot-sale-header">
              <h2>🔥 HOT SALE GIAO TRONG NHÁY MẮT</h2>
            </div>
            <ProductSlider 
              products={featuredProducts.slice(0, settings?.featuredDisplayCount || 10)}
              displayType={settings?.featuredDisplayType || 'GRID'}
              interval={settings?.featuredSliderInterval || 3000}
              speed={settings?.featuredSliderSpeed || 500}
            />
          </div>
        </section>
      )}

      {/* Dynamic Category Blocks */}
      {categories.map((cat) => {
        // Find all product IDs for this category tree
        const getCatIds = (c) => [c.id, ...(c.children || []).flatMap(getCatIds)];
        const catIds = getCatIds(cat);
        const catProducts = allProducts.filter(p => p.category && catIds.includes(p.category.id)).slice(0, cat.displayCount || 10);
        
        if (catProducts.length === 0) return null;

        return (
          <section className="section category-block-section" key={cat.id}>
            <div className="container">
              <div className="category-block-header">
                <h2>{cat.name}</h2>
                <div className="category-block-tags">
                  {cat.children?.slice(0, 5).map(child => (
                    <Link key={child.id} to={`/products?category=${child.slug}`} className="cat-tag">
                      {child.name}
                    </Link>
                  ))}
                  <Link to={`/products?category=${cat.slug}`} className="cat-tag view-all">
                    Xem tất cả
                  </Link>
                </div>
              </div>
              <ProductSlider 
                products={catProducts}
                displayType={cat.displayType}
                interval={cat.sliderInterval}
                speed={cat.sliderSpeed}
              />
            </div>
          </section>
        );
      })}

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
              <div className="policy-icon"><Headphones size={24} /></div>
              <div className="policy-text">
                <h4>Hỗ trợ nhiệt tình</h4>
                <p>Luôn sẵn sàng giải đáp thắc mắc</p>
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


    </main>
  );
}
