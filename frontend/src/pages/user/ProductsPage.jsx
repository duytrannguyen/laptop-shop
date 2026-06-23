import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { http } from '../../api/client';
import ProductCard from '../../components/specific/ProductCard';

// Brands will be fetched dynamically from API
const priceRanges = [
  { label: 'Tất cả', min: 0, max: Infinity },
  { label: 'Dưới 10 triệu', min: 0, max: 10000000 },
  { label: '10 - 15 triệu', min: 10000000, max: 15000000 },
  { label: '15 - 20 triệu', min: 15000000, max: 20000000 },
  { label: '20 - 30 triệu', min: 20000000, max: 30000000 },
  { label: 'Trên 30 triệu', min: 30000000, max: Infinity },
];

const sortOptions = [
  { label: 'Mới nhất', value: 'newest' },
  { label: 'Giá thấp → cao', value: 'price-asc' },
  { label: 'Giá cao → thấp', value: 'price-desc' },
  { label: 'Tên A-Z', value: 'name-asc' },
];

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState([]);
  const [brandsList, setBrandsList] = useState([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedBrand, setSelectedBrand] = useState('Tất cả');
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const category = searchParams.get('category');
  const queryParam = searchParams.get('q');

  useEffect(() => {
    // Fetch brands
    http.get('/brands')
      .then((r) => setBrandsList(r.data.map(b => b.name)))
      .catch(() => {});

    // Fetch products
    const url = category ? `/products?category=${category}` : '/products';
    setLoading(true);
    setError('');
    http.get(url)
      .then((r) => setAllProducts(r.data))
      .catch(() => setError('Không thể tải danh sách sản phẩm.'))
      .finally(() => setLoading(false));
  }, [category]);

  useEffect(() => {
    setSearchQuery(queryParam || '');
  }, [queryParam]);

  // Filter and sort
  let filtered = allProducts.filter((p) => {
    // Search
    const q = searchQuery.toLowerCase();
    if (q && !p.name?.toLowerCase()?.includes(q) &&
        !p.brand?.name?.toLowerCase()?.includes(q) &&
        !p.cpu?.toLowerCase()?.includes(q)) {
      return false;
    }
    // Brand
    if (selectedBrand !== 'Tất cả' && p.brand?.name?.toLowerCase() !== selectedBrand?.toLowerCase()) {
      return false;
    }
    // Price range
    const priceRange = priceRanges[selectedPrice];
    const price = p.salePrice || p.price;
    if (price < priceRange.min || price > priceRange.max) {
      return false;
    }
    return true;
  });

  // Sort
  filtered = [...filtered].sort((a, b) => {
    const pa = a.salePrice || a.price;
    const pb = b.salePrice || b.price;
    switch (sortBy) {
      case 'price-asc': return pa - pb;
      case 'price-desc': return pb - pa;
      case 'name-asc': return (a.name || '').localeCompare(b.name || '');
      default: return (b.id || 0) - (a.id || 0);
    }
  });

  return (
    <main className="page-content">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Trang chủ</Link>
          <span className="separator">/</span>
          {category ? (
            <>
              <Link to="/products">Sản phẩm</Link>
              <span className="separator">/</span>
              <span>{category.replace(/-/g, ' ').toUpperCase()}</span>
            </>
          ) : (
            <span>Tất cả sản phẩm</span>
          )}
        </div>

        <h1 style={{ marginBottom: '24px', fontSize: '24px' }}>
          {category ? category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Tất cả sản phẩm'}
        </h1>

        {/* Search & Controls */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="form-input"
              style={{ paddingLeft: '42px' }}
              placeholder="Tìm điện thoại, tai nghe, thương hiệu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '180px' }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setShowFilters(!showFilters)}
            style={{ display: 'none' }}
          >
            <SlidersHorizontal size={16} /> Bộ lọc
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {/* Brand Filter */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>Thương hiệu:</span>
            {['Tất cả', ...brandsList].map((b) => (
              <button
                key={b}
                className={`cat-tag ${selectedBrand === b ? 'active' : ''}`}
                onClick={() => setSelectedBrand(b)}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>Mức giá:</span>
          {priceRanges.map((r, i) => (
            <button
              key={i}
              className={`cat-tag ${selectedPrice === i ? 'active' : ''}`}
              onClick={() => setSelectedPrice(i)}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Results */}
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '14px' }}>
          Hiển thị <strong>{filtered.length}</strong> sản phẩm
        </p>

        {loading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : error ? (
          <div className="empty-state"><h3>{error}</h3></div>
        ) : filtered.length > 0 ? (
          <div className="products-grid">
            {filtered.map((p) => (
              <ProductCard product={p} key={p.id} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Search size={48} />
            <h3>Không tìm thấy sản phẩm</h3>
            <p>Thử tìm với từ khóa khác hoặc thay đổi bộ lọc</p>
          </div>
        )}
      </div>
    </main>
  );
}
