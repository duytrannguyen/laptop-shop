import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { http } from '../../api/client';

export default function FAQPage() {
  const [dynamicContent, setDynamicContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    http.get('/posts/faq')
      .then(res => setDynamicContent(res.data))
      .catch(() => setDynamicContent(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <main className="page-content"><div className="loading"><div className="spinner" /></div></main>;

  if (dynamicContent) {
    return (
      <main className="page-content">
        <article className="container post-detail">
          <div className="breadcrumb">
            <Link to="/">Trang chủ</Link>
            <ChevronRight size={14} className="separator" />
            <span>{dynamicContent.title}</span>
          </div>
          <h1 style={{ textAlign: 'center', marginBottom: '24px' }}>{dynamicContent.title}</h1>
          {dynamicContent.image && <img className="post-cover" src={dynamicContent.image} alt={dynamicContent.title} style={{ display: 'block', margin: '0 auto 32px', borderRadius: '12px' }} />}
          <div className="post-content ck-content" dangerouslySetInnerHTML={{ __html: dynamicContent.content }} />
        </article>
      </main>
    );
  }

  return (
    <main className="page-content">
      <div className="container">
        <div className="empty-state fade-in">
          <h2>Đang cập nhật nội dung</h2>
          <p>Nội dung trang này đang được chuẩn bị. Vui lòng quay lại sau.</p>
          <Link to="/" className="btn btn-primary">Về trang chủ</Link>
        </div>
      </div>
    </main>
  );
}
